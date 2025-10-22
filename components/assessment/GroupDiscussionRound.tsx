"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/api";
import { Mic, MicOff, MessageCircle, Clock, Users, Volume2, ChevronDown, ChevronUp, VolumeX } from 'lucide-react';
import toast from 'react-hot-toast';

// Type definitions for Web Speech API
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
        AudioContext: typeof AudioContext;
        webkitAudioContext: typeof AudioContext;
    }
}

const getErrorMessage = (error: any): string => {
    if (error.error === 'no-speech') {
        return 'No speech was detected. Please try again.';
    }
    if (error.error === 'audio-capture') {
        return 'No microphone was found. Please check your device settings.';
    }
    if (error.error === 'not-allowed') {
        return 'Microphone access was not allowed. Please enable it in your browser settings.';
    }
    return 'An error occurred. Please try again.';
};

interface Topic {
    title: string;
    content: string;
    followUpQuestions?: string[];
    instructions?: string;
}

interface AIResponse {
    text: string;
    audioUrl?: string;
}

interface AgentMessage {
    name: string;
    text: string;
}

interface Turn {
    user: string;
    agents: AgentMessage[];
    timestamp: number;
}

interface EvaluationFeedback {
    criteria_scores: {
        communication: number;
        topic_understanding: number;
        interaction: number;
    };
    strengths: string[];
    improvements: string[];
}

interface GDResponse {
    userResponse: string;
    aiQuestion: string;
    evaluation?: {
        score: number;
        feedback: EvaluationFeedback;
        areasOfImprovement: string[];
        strengths: string[];
    };
}

interface AssessmentResponse {
    response_text: string;
    score?: number;
    time_taken?: number;
}

interface GroupDiscussionRoundProps {
    roundId: string;
    onComplete: (responses: AssessmentResponse[]) => void;
}

export function GroupDiscussionRound({ 
    roundId, 
    onComplete 
}: GroupDiscussionRoundProps) {
    const router = useRouter();
    
    // State for managing the discussion flow
    const [loading, setLoading] = useState(false);
    const [topic, setTopic] = useState<Topic | null>(null);
    const [currentAIResponse, setCurrentAIResponse] = useState<AIResponse | null>(null);
    const [gdResponses, setGDResponses] = useState<GDResponse[]>([]);
    const [gdTurns, setGDTurns] = useState<Turn[]>([]);
    const [currentStep, setCurrentStep] = useState<'intro' | 'topic' | 'discussion' | 'evaluation'>('topic');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [speakingTime, setSpeakingTime] = useState(0);
    const [speakingTimerId, setSpeakingTimerId] = useState<NodeJS.Timeout | null>(null);
    const [isTopicAnnounced, setIsTopicAnnounced] = useState(false);
    const [discussionComplete, setDiscussionComplete] = useState(false);
    const [finalEvaluation, setFinalEvaluation] = useState<any | null>(null);
    const [micTested, setMicTested] = useState(false);
    const [audioLevel, setAudioLevel] = useState(0);
    const [confidenceScore, setConfidenceScore] = useState(100);
    const [speechRate, setSpeechRate] = useState(0);
    
    // Enhanced features
    const [participationBalance, setParticipationBalance] = useState({ user: 0, ai: 0 });
    const [wordCount, setWordCount] = useState(0);
    const [statsCollapsed, setStatsCollapsed] = useState(false);
    
    // Voice synthesis states
    const [currentSpeakingAgent, setCurrentSpeakingAgent] = useState<string | null>(null);
    const [voicesLoaded, setVoicesLoaded] = useState(false);
    const [typingAgent, setTypingAgent] = useState<string | null>(null);
    const availableVoices = useRef<SpeechSynthesisVoice[]>([]);
    
    // Track fetch attempts
    const [fetchAttempt, setFetchAttempt] = useState(0);
    const maxRetries = 10;
    const inFlightRef = useRef(false);

    // Refs
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const transcriptRef = useRef('');

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [gdTurns, typingAgent]);

    // Initialize voices
    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const loadVoices = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length > 0) {
                    availableVoices.current = voices;
                    setVoicesLoaded(true);
                    console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
                }
            };

            loadVoices();
            
            if (window.speechSynthesis.onvoiceschanged !== undefined) {
                window.speechSynthesis.onvoiceschanged = loadVoices;
            }
        }
    }, []);

    // Fetch topic when entering topic step
    useEffect(() => {
        if (currentStep === 'topic' && !topic) {
            setFetchAttempt(0);
            fetchTopic();
        }
        
        return () => {
            setFetchAttempt(0);
        };
    }, [currentStep, topic]);

    const fetchTopic = async () => {
        if (loading || inFlightRef.current || fetchAttempt > maxRetries) {
            return;
        }
        inFlightRef.current = true;
        setLoading(true);
        try {
            const timestamp = new Date().getTime();
            const response = await Promise.race([
                apiClient.client.post(`/assessments/rounds/${roundId}/gd/topic?t=${timestamp}&refresh=false`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 15000))
            ]) as any;
            const topicData = response.data;

            if (topicData && topicData.status === 'error') {
                throw new Error(topicData.message || 'Failed to generate topic');
            }

            if (!topicData || (!topicData.title && !topicData.topic)) {
                throw new Error('Invalid topic data received');
            }

            if (topicData.title) {
                window.localStorage.setItem('lastGdTopicId', topicData.title);
            }

            const processedTopicData = {
                title: topicData.title || topicData.topic || "AI in the Workplace",
                content: topicData.background || topicData.description || topicData.content ||
                    "Discuss the ethical implications and practical considerations of AI in modern workplaces.",
                followUpQuestions: topicData.key_points || topicData.expected_perspectives || [],
                instructions: topicData.instructions || "Share your thoughts on this topic. You can speak briefly or in detail - it's up to you!"
            };
            
            setTopic(processedTopicData);
            toast.success('Discussion topic loaded!');
            setFetchAttempt(0);

            if (topicData.audio_url) {
                fetch(topicData.audio_url).catch(console.error);
            }
        } catch (error) {
            console.error('Error fetching topic:', error);
            
            if (fetchAttempt < 1) {
                setFetchAttempt(prev => prev + 1);
                toast.error('Retrying...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                inFlightRef.current = false;
                setLoading(false);
                fetchTopic();
                return;
            }
            
            toast.error('Using default topic.');
            setTopic({
                title: "The Future of Work in a Digital Age",
                content: "Discuss how technological advancements are reshaping work environments.",
                followUpQuestions: [
                    "What skills will be most valuable?",
                    "How should education systems adapt?",
                ],
                instructions: "Share your thoughts on this topic. You can speak briefly or in detail - it's up to you!"
            });
        } finally {
            setLoading(false);
            inFlightRef.current = false;
        }
    };

    const MAX_RESPONSES = 5;
    const personas: AgentMessage[] = [
        { name: 'Aarav (Pro)', text: '' },
        { name: 'Meera (Skeptic)', text: '' },
        { name: 'Rahul (Balanced)', text: '' }
    ];

    const [evalAttempt, setEvalAttempt] = useState(0);
    const maxEvalRetries = 2;
    const [evaluationInitiated, setEvaluationInitiated] = useState(false);

    const getFinalEvaluation = async () => {
        if (loading || currentStep === 'evaluation') {
            return;
        }

        if (evalAttempt >= maxEvalRetries) {
            setEvaluationInitiated(false);
            setFinalEvaluation({
                score: 70,
                feedback: {
                    criteria_scores: {
                        communication: 70,
                        topic_understanding: 70,
                        interaction: 70
                    },
                    strengths: ['Participated in discussion'],
                    improvements: ['Provide more detailed examples']
                },
                areasOfImprovement: ['Provide more detailed examples'],
                strengths: ['Participated in discussion']
            });
            setCurrentStep('evaluation');
            return;
        }

        try {
            setLoading(true);
            const response = await Promise.race([
                apiClient.client.post(`/assessments/rounds/${roundId}/evaluate-discussion`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))
            ]) as { data: any };
            
            const evalData = response.data;
            if (!evalData) {
                throw new Error('No evaluation data');
            }
            
            setEvaluationInitiated(false);

            const evaluation = {
                score: parseInt(evalData.score) || 75,
                feedback: {
                    criteria_scores: {
                        communication: parseInt(evalData.feedback?.criteria_scores?.communication) || 75,
                        topic_understanding: parseInt(evalData.feedback?.criteria_scores?.topic_understanding) || 75,
                        interaction: parseInt(evalData.feedback?.criteria_scores?.interaction) || 75
                    },
                    strengths: evalData.feedback?.strengths || [],
                    improvements: evalData.feedback?.improvements || []
                },
                areasOfImprovement: evalData.feedback?.improvements || [],
                strengths: evalData.feedback?.strengths || []
            };
            
            setFinalEvaluation(evaluation);
            setCurrentStep('evaluation');
            
            onComplete([{
                response_text: JSON.stringify({
                    responses: gdResponses,
                    evaluation: evaluation
                }),
                score: evaluation.score,
                time_taken: 0
            }]);

            toast.success('Evaluation complete!');
        } catch (error) {
            console.error('Error getting evaluation:', error);
            setEvalAttempt(prev => prev + 1);
            
            if (evalAttempt < maxEvalRetries) {
                toast.error('Retrying evaluation...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                setLoading(false);
                getFinalEvaluation();
                return;
            }
            
            const fallbackEvaluation = {
                score: 70,
                feedback: {
                    criteria_scores: {
                        communication: 70,
                        topic_understanding: 70,
                        interaction: 70
                    },
                    strengths: ['Participated in discussion'],
                    improvements: ['Provide more examples']
                },
                areasOfImprovement: ['Provide more examples'],
                strengths: ['Participated in discussion']
            };
            
            setFinalEvaluation(fallbackEvaluation);
            setCurrentStep('evaluation');
        } finally {
            setLoading(false);
        }
    };

    // Speech recognition setup
    const speechRecognition = useRef<any>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const audioAnalyser = useRef<AnalyserNode | null>(null);

    // Voice selection function
    const getVoiceForAgent = (agentName: string): SpeechSynthesisVoice | null => {
        const voices = availableVoices.current;
        if (voices.length === 0) return null;

        if (agentName.includes('Aarav')) {
            return voices.find(v => 
                v.lang.includes('en-IN') && v.name.toLowerCase().includes('male')
            ) || voices.find(v => 
                v.lang.includes('en-GB') && v.name.toLowerCase().includes('male')
            ) || voices.find(v => 
                !v.name.toLowerCase().includes('female')
            ) || voices[0];
        } 
        else if (agentName.includes('Meera')) {
            return voices.find(v => 
                v.lang.includes('en-IN') && v.name.toLowerCase().includes('female')
            ) || voices.find(v => 
                v.lang.includes('en-US') && v.name.toLowerCase().includes('female')
            ) || voices.find(v => 
                v.name.toLowerCase().includes('female')
            ) || voices[1] || voices[0];
        } 
        else if (agentName.includes('Rahul')) {
            return voices.find(v => 
                v.lang.includes('en-AU') && v.name.toLowerCase().includes('male')
            ) || voices.find(v => 
                v.lang.includes('en-US') && v.name.toLowerCase().includes('male')
            ) || voices[2] || voices[0];
        }

        return voices[0];
    };

    // Function to speak agent text
    const speakAgentText = async (agentName: string, text: string): Promise<void> => {
        return new Promise((resolve) => {
            if (!window.speechSynthesis || !voicesLoaded) {
                resolve();
                return;
            }

            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            const voice = getVoiceForAgent(agentName);
            
            if (voice) {
                utterance.voice = voice;
            }

            if (agentName.includes('Aarav')) {
                utterance.rate = 0.95;
                utterance.pitch = 0.9;
                utterance.volume = 1.0;
            } else if (agentName.includes('Meera')) {
                utterance.rate = 1.05;
                utterance.pitch = 1.2;
                utterance.volume = 1.0;
            } else if (agentName.includes('Rahul')) {
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                utterance.volume = 1.0;
            }

            utterance.onstart = () => {
                setCurrentSpeakingAgent(agentName);
                setIsAISpeaking(true);
            };

            utterance.onend = () => {
                setCurrentSpeakingAgent(null);
                setIsAISpeaking(false);
                resolve();
            };

            utterance.onerror = (error) => {
                console.error('Speech error:', error);
                setCurrentSpeakingAgent(null);
                setIsAISpeaking(false);
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    // Initialize Web Speech API
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                speechRecognition.current = new SpeechRecognition();
                speechRecognition.current.continuous = true;
                speechRecognition.current.interimResults = true;
                speechRecognition.current.lang = 'en-US';

                speechRecognition.current.onresult = (event: any) => {
                    let interimText = '';
                    let finalText = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        const confidence = event.results[i][0].confidence;
                        
                        if (event.results[i].isFinal) {
                            finalText += transcript + ' ';
                            setConfidenceScore(Math.round(confidence * 100));
                        } else {
                            interimText += transcript;
                        }
                    }

                    setInterimTranscript(interimText);
                    if (finalText) {
                        setTranscript(prev => {
                            const newText = prev + finalText;
                            transcriptRef.current = newText;
                            setWordCount(newText.trim().split(/\s+/).length);
                            return newText;
                        });
                    }
                };

                speechRecognition.current.onerror = (error: any) => {
                    console.error('Speech recognition error:', error);
                    
                    if (transcriptRef.current.trim()) {
                        toast.success('Processing captured speech...');
                        handleUserResponse(transcriptRef.current);
                    } else {
                        toast.error(getErrorMessage(error));
                        setIsListening(false);
                        toast('Please try speaking again or check your microphone.', { icon: '🎤' });
                    }
                };

                speechRecognition.current.onend = () => {
                    if (isListening) {
                        try {
                            speechRecognition.current.start();
                        } catch (err) {
                            console.error('Error restarting:', err);
                            setIsListening(false);
                            toast.error('Speech recognition stopped. Click Start Speaking again.');
                        }
                    }
                };
            }

            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        return () => {
            if (speechRecognition.current) {
                speechRecognition.current.stop();
            }
            
            if (speakingTimerId) {
                clearInterval(speakingTimerId);
            }
            
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Audio level monitoring for microphone test
    const startMicTest = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioCtx = audioContext.current!;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);
            audioAnalyser.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const checkLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(Math.round(average));
            };

            const interval = setInterval(checkLevel, 100);
            
            setTimeout(() => {
                clearInterval(interval);
                stream.getTracks().forEach(track => track.stop());
                setMicTested(true);
                toast.success('Microphone test complete!');
            }, 3000);
        } catch (error) {
            console.error('Mic test error:', error);
            toast.error('Could not access microphone');
        }
    };

    if (!roundId) {
        return (
            <Card className="p-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Error</h2>
                    <p className="text-gray-600">Invalid round configuration</p>
                </div>
            </Card>
        );
    }

    const startListening = () => {
        if (!speechRecognition.current) {
            toast.error('Speech recognition not supported. Use Chrome or Edge.');
            return;
        }

        setIsListening(true);
        setTranscript('');
        transcriptRef.current = '';
        setInterimTranscript('');
        setSpeakingTime(0);
        setWordCount(0);
        
        const timerId = setInterval(() => {
            setSpeakingTime(prevTime => {
                const newTime = prevTime + 1;
                if (wordCount > 0) {
                    setSpeechRate(Math.round((wordCount / newTime) * 60));
                }
                return newTime;
            });
        }, 1000);
        
        setSpeakingTimerId(timerId);
        
        try {
            speechRecognition.current.start();
            toast.success('🎤 Listening... Speak clearly!');
        } catch (err) {
            console.error('Error starting speech recognition:', err);
            toast.error('Failed to start. Please try again.');
            setIsListening(false);
            clearInterval(timerId);
        }
    };

    const stopListening = () => {
        if (speechRecognition.current) {
            speechRecognition.current.stop();
            setIsListening(false);
            
            if (speakingTimerId) {
                clearInterval(speakingTimerId);
                setSpeakingTimerId(null);
            }
            
            setTimeout(() => {
                const finalTranscript = transcriptRef.current.trim();
                
                if (finalTranscript && finalTranscript.length > 0) {
                    toast.success('Processing your response...');
                    handleUserResponse(finalTranscript);
                    setTranscript('');
                    transcriptRef.current = '';
                    setInterimTranscript('');
                } else {
                    toast.error('No speech detected. Please try speaking again.');
                }
            }, 500);
        }
    };

    const [responseAttempt, setResponseAttempt] = useState(0);
    const maxResponseRetries = 2;

    const handleUserResponse = async (text: string) => {
        const trimmedText = text.trim();
        
        if (!trimmedText || trimmedText.length === 0) {
            toast.error('No text to process.');
            return;
        }
        
        if (discussionComplete) {
            toast.success('Discussion complete! Click Submit to get evaluation.');
            return;
        }

        if (responseAttempt >= maxResponseRetries) {
            setResponseAttempt(0);
            toast.error('Using fallback response.');
            return;
        }

        try {
            setLoading(true);
            toast.loading('Processing your response...', { id: 'processing' });
            
            let responseData: any;
            try {
                const response = await Promise.race([
                    apiClient.client.post(`/assessments/rounds/${roundId}/gd/response`, { 
                        text: trimmedText,
                        personas: personas.map(p => p.name),
                        context: {
                            topic,
                            previousTurns: gdTurns
                        }
                    }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Timeout')), 15000)
                    )
                ]) as any;
                
                responseData = response.data;
                toast.success('Response received!', { id: 'processing' });
            } catch (apiError) {
                console.error('API failed:', apiError);
                toast.dismiss('processing');
                
                setResponseAttempt(prev => prev + 1);
                
                if (responseAttempt < maxResponseRetries) {
                    toast.error('Retrying...', { duration: 2000 });
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    setLoading(false);
                    handleUserResponse(trimmedText);
                    return;
                }
                
                const userSnippet = trimmedText.slice(0, 140);
                responseData = {
                    agents: [
                        { name: personas[0].name, text: `I agree. Building on "${userSnippet}" — the upside is clear.` },
                        { name: personas[1].name, text: `I challenge that. "${userSnippet}" overlooks risks.` },
                        { name: personas[2].name, text: `Both sides valid. Balance is key.` }
                    ]
                };
                
                toast.error('Using fallback response.');
            }

            const agents: AgentMessage[] = Array.isArray(responseData?.agents) && responseData.agents.length
                ? responseData.agents.slice(0, 3).map((a: any, idx: number) => ({
                    name: String(a.name || personas[idx]?.name || `Participant ${idx+1}`),
                    text: String(a.text || a.message || a.content || '')
                }))
                : [
                    { name: personas[0].name, text: "Could you expand with an example?" },
                    { name: personas[1].name, text: "I see downsides. How would you mitigate?" },
                    { name: personas[2].name, text: "A middle path might work." }
                ];

            // Add user message first (without agents yet)
            const turnTimestamp = Date.now();
            setGDTurns(prev => [...prev, { 
                user: trimmedText, 
                agents: [],
                timestamp: turnTimestamp
            }]);

            setGDResponses(prev => [...prev, { 
                userResponse: trimmedText, 
                aiQuestion: agents.map(a => a.text).join('\n') 
            }]);

            const userWords = trimmedText.split(/\s+/).length;
            const aiWords = agents.reduce((sum, a) => sum + a.text.split(/\s+/).length, 0);
            setParticipationBalance(prev => ({
                user: prev.user + userWords,
                ai: prev.ai + aiWords
            }));

            // Add agents one by one with typing indicator and speech
            if (voicesLoaded) {
                for (let i = 0; i < agents.length; i++) {
                    const agent = agents[i];
                    
                    // Show typing indicator
                    setTypingAgent(agent.name);
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    // Add this agent to the turn
                    setGDTurns(prev => {
                        const updatedTurns = [...prev];
                        const lastTurnIndex = updatedTurns.length - 1;
                        if (lastTurnIndex >= 0) {
                            updatedTurns[lastTurnIndex] = {
                                ...updatedTurns[lastTurnIndex],
                                agents: [...updatedTurns[lastTurnIndex].agents, agent]
                            };
                        }
                        return updatedTurns;
                    });

                    // Remove typing indicator
                    setTypingAgent(null);
                    
                    // Small delay to show the message appeared
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    // Then speak
                    if (agent.text && agent.text.trim()) {
                        await speakAgentText(agent.name, agent.text);
                    }
                    
                    // Pause before next agent
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            } else {
                // If voices not loaded, add all at once
                setGDTurns(prev => {
                    const updatedTurns = [...prev];
                    const lastTurnIndex = updatedTurns.length - 1;
                    if (lastTurnIndex >= 0) {
                        updatedTurns[lastTurnIndex] = {
                            ...updatedTurns[lastTurnIndex],
                            agents: agents
                        };
                    }
                    return updatedTurns;
                });
            }

            if ((gdTurns.length + 1) >= MAX_RESPONSES) {
                setDiscussionComplete(true);
                toast.success('Discussion complete! Click Submit for evaluation.');
            } else {
                toast.success(`Round ${gdTurns.length + 1} complete! Continue or submit.`, { duration: 3000 });
            }

            setTranscript('');
            transcriptRef.current = '';
            setInterimTranscript('');
        } catch (error) {
            console.error('Error processing response:', error);
            toast.error('Failed to process. Try again.');
        } finally {
            setLoading(false);
            toast.dismiss('processing');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getTimerColor = () => {
        if (speakingTime < 60) return 'text-green-600';
        if (speakingTime < 120) return 'text-yellow-600';
        return 'text-red-600';
    };

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (currentStep !== 'discussion' || !isTopicAnnounced) return;
            
            if (e.code === 'Space' && !discussionComplete) {
                e.preventDefault();
                if (isListening) {
                    stopListening();
                } else {
                    startListening();
                }
            }
            
            if (e.code === 'Escape' && isListening) {
                e.preventDefault();
                stopListening();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [currentStep, isTopicAnnounced, isListening, discussionComplete]);

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-8">
            {/* Progress Stepper */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    {['Topic', 'Discussion', 'Evaluation'].map((step, idx) => (
                        <div key={step} className="flex items-center flex-1">
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all
                                ${idx === 0 && currentStep === 'topic' ? 'bg-blue-600 text-white scale-110' :
                                  idx === 1 && currentStep === 'discussion' ? 'bg-blue-600 text-white scale-110' :
                                  idx === 2 && currentStep === 'evaluation' ? 'bg-blue-600 text-white scale-110' :
                                  'bg-gray-200 text-gray-600'}`}>
                                {idx + 1}
                            </div>
                            <span className={`ml-2 font-medium transition-all ${
                                (idx === 0 && currentStep === 'topic') ||
                                (idx === 1 && currentStep === 'discussion') ||
                                (idx === 2 && currentStep === 'evaluation')
                                ? 'text-blue-600' : 'text-gray-500'
                            }`}>{step}</span>
                            {idx < 2 && (
                                <div className={`flex-1 h-1 mx-4 rounded transition-all ${
                                    idx === 0 && (currentStep === 'discussion' || currentStep === 'evaluation')
                                    ? 'bg-blue-600'
                                    : idx === 1 && currentStep === 'evaluation'
                                    ? 'bg-blue-600'
                                    : 'bg-gray-200'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {currentStep === 'topic' && (
                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
                    <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Discussion Topic</h2>
                    {topic ? (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
                                <h3 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-400">{topic.title}</h3>
                                <div className="border-l-4 border-blue-500 pl-6 mb-6">
                                    <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">{topic.content}</p>
                                </div>
                            </div>
                            
                            {!micTested && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl border-2 border-yellow-400">
                                    <h4 className="font-bold mb-3 text-yellow-800 dark:text-yellow-400 flex items-center">
                                        <Mic className="w-5 h-5 mr-2" />
                                        Test Your Microphone
                                    </h4>
                                    <p className="text-sm mb-4 text-gray-700 dark:text-gray-300">
                                        Before starting, let's make sure your microphone works properly.
                                    </p>
                                    <Button
                                        onClick={startMicTest}
                                        className="bg-yellow-600 hover:bg-yellow-700"
                                    >
                                        Test Microphone (3 seconds)
                                    </Button>
                                    {audioLevel > 0 && (
                                        <div className="mt-4">
                                            <div className="flex items-center space-x-2">
                                                <Volume2 className="w-5 h-5 text-green-600" />
                                                <div className="flex-1 bg-gray-200 rounded-full h-3">
                                                    <div 
                                                        className="bg-green-600 h-3 rounded-full transition-all duration-100" 
                                                        style={{ width: `${Math.min(audioLevel, 100)}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium">{audioLevel}%</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border-2 border-indigo-400">
                                <h4 className="font-bold mb-3 text-indigo-800 dark:text-indigo-400">📋 Instructions</h4>
                                <p className="text-gray-800 dark:text-gray-200">{topic.instructions}</p>
                            </div>
                            
                            {topic.followUpQuestions && topic.followUpQuestions.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                                    <h4 className="font-bold mb-4 text-blue-800 dark:text-blue-400 flex items-center">
                                        <MessageCircle className="w-5 h-5 mr-2" />
                                        Key Points to Consider
                                    </h4>
                                    <ul className="space-y-3">
                                        {topic.followUpQuestions.map((point, idx) => (
                                            <li key={idx} className="flex items-start">
                                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                                                    {idx + 1}
                                                </span>
                                                <span className="text-gray-700 dark:text-gray-300">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border-2 border-blue-300">
                                <h4 className="font-bold mb-4 text-blue-900 dark:text-blue-300">🎯 Discussion Flow</h4>
                                <ol className="space-y-3">
                                    {[
                                        'Listen to the topic introduction',
                                        'Click "Start Speaking" and share your thoughts',
                                        'Click "Stop Speaking" when finished',
                                        'AI participants will respond one by one with voice',
                                        'Continue the discussion (up to 5 rounds total)',
                                        'Click "Submit Discussion" when ready for evaluation',
                                        'View detailed feedback on your performance'
                                    ].map((step, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold mr-3 shadow-md">
                                                {idx + 1}
                                            </span>
                                            <span className="text-gray-800 dark:text-gray-200 pt-1">{step}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            
                            <Button
                                onClick={() => {
                                    setCurrentStep('discussion');
                                    setIsTopicAnnounced(false);
                                    
                                    const announcement = [
                                        `Today's discussion topic is: ${topic.title}.`,
                                        topic.content,
                                        "Key points to consider:",
                                        ...(topic.followUpQuestions || []).map(q => `${q}`),
                                        "You can now share your thoughts.",
                                        "Remember to click Stop Speaking when you finish."
                                    ].join(' ');
                                    
                                    const utterance = new SpeechSynthesisUtterance(announcement);
                                    utterance.lang = 'en-US';
                                    utterance.rate = 0.9;
                                    
                                    utterance.onend = () => {
                                        setIsTopicAnnounced(true);
                                        toast.success('You can now start speaking!');
                                    };
                                    
                                    toast.success('Listen to the introduction...');
                                    window.speechSynthesis.speak(utterance);
                                }}
                                size="lg"
                                disabled={!micTested}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 text-lg shadow-lg transform hover:scale-[1.02] transition-all"
                            >
                                🎙️ Begin Topic Introduction
                            </Button>
                            
                            {!micTested && (
                                <p className="text-center text-sm text-yellow-600 dark:text-yellow-400">
                                    Please test your microphone before starting
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-12">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p className="text-gray-600 dark:text-gray-400">Loading discussion topic...</p>
                        </div>
                    )}
                </Card>
            )}

            {currentStep === 'discussion' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <Card className="p-6 lg:sticky lg:top-6 h-fit bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 shadow-lg">
                            <h3 className="text-lg font-bold mb-3 text-blue-900 dark:text-blue-300">{topic?.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{topic?.content}</p>
                            
                            {/* Round Progress */}
                            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Discussion Rounds</span>
                                    <span className="text-sm font-bold text-blue-600">{gdTurns.length}/{MAX_RESPONSES}</span>
                                </div>
                                <Progress value={(gdTurns.length / MAX_RESPONSES) * 100} className="h-2" />
                            </div>
                            
                            {/* Participants */}
                            <div className="mb-4">
                                <h4 className="text-sm font-semibold mb-2 flex items-center text-gray-700 dark:text-gray-300">
                                    <Users className="w-4 h-4 mr-2" />
                                    Participants
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2 p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            Y
                                        </div>
                                        <span className="text-sm font-medium">You</span>
                                    </div>
                                    {personas.map((p, idx) => (
                                        <div key={idx} className="flex items-center space-x-2 p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {p.name.charAt(0)}
                                            </div>
                                            <span className="text-sm">{p.name.split(' ')[0]}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            
                            
                            {gdTurns.length > 0 && !discussionComplete && !isAISpeaking && !typingAgent && (
                                <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border-2 border-orange-300">
                                    <h4 className="text-sm font-semibold mb-2 text-orange-800 dark:text-orange-400">
                                        Early Submit
                                    </h4>
                                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-3">
                                        Completed {gdTurns.length}/{MAX_RESPONSES} rounds. 
                                        Ready to finish?
                                    </p>
                                    <Button
                                        onClick={() => {
                                            setDiscussionComplete(true);
                                            toast.success('Ready for evaluation!');
                                        }}
                                        disabled={loading}
                                        size="sm"
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                                    >
                                        Submit Discussion
                                    </Button>
                                </div>
                            )}
                        </Card>
                        
                        {/* Main Discussion Area */}
                        <div className="lg:col-span-3 space-y-4">
                            {!isTopicAnnounced ? (
                                <Card className="p-8 flex flex-col items-center space-y-4">
                                    <div className="animate-pulse text-blue-600 dark:text-blue-400 flex items-center space-x-2">
                                        <Volume2 className="w-6 h-6 animate-bounce" />
                                        <span className="text-lg font-medium">Listening to topic introduction...</span>
                                    </div>
                                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                </Card>
                            ) : (
                                <>
                                    {/* Discussion History */}
                                    <Card className="p-6 bg-white dark:bg-gray-800">
                                        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Discussion History</h3>
                                        <div 
                                            ref={chatContainerRef}
                                            className="space-y-6 min-h-[300px] max-h-[500px] overflow-y-auto pr-2 scroll-smooth"
                                        >
                                            {gdTurns.length === 0 && !typingAgent && (
                                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                    <p>No messages yet. Start speaking to begin the discussion!</p>
                                                </div>
                                            )}
                                            
                                            {gdTurns.map((turn, tIdx) => (
                                                <div key={tIdx} className="space-y-4 animate-in slide-in-from-bottom duration-300">
                                                    {/* User Message */}
                                                    <div className="flex items-start space-x-3">
                                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                                                            <span className="text-white font-bold text-sm">Y</span>
                                                        </div>
                                                        <div className="flex-1 max-w-3xl">
                                                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl rounded-tl-none shadow-md">
                                                                <div className="text-xs font-semibold mb-2 opacity-90">You</div>
                                                                <p className="leading-relaxed">{turn.user}</p>
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                                                                {new Date(turn.timestamp).toLocaleTimeString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* AI Messages with speaking indicator */}
                                                    {turn.agents.map((a, aIdx) => (
                                                        <div key={aIdx} className="flex items-start space-x-3 ml-6">
                                                            <div className={`flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md ${
                                                                currentSpeakingAgent === a.name ? 'animate-pulse ring-4 ring-purple-400' : ''
                                                            }`}>
                                                                <span className="text-white font-bold text-xs">{a.name.charAt(0)}</span>
                                                            </div>
                                                            <div className="flex-1 max-w-2xl">
                                                                <div className={`bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm transition-all ${
                                                                    currentSpeakingAgent === a.name ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : ''
                                                                }`}>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <div className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                                                                            {a.name}
                                                                        </div>
                                                                        {currentSpeakingAgent === a.name && (
                                                                            <div className="flex space-x-1">
                                                                                {[...Array(3)].map((_, i) => (
                                                                                    <div
                                                                                        key={i}
                                                                                        className="w-1 h-3 bg-purple-600 rounded-full animate-pulse"
                                                                                        style={{ animationDelay: `${i * 0.1}s` }}
                                                                                    />
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{a.text}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                            
                                            {/* Typing Indicator */}
                                            {typingAgent && (
                                                <div className="flex items-start space-x-3 ml-6 animate-in slide-in-from-bottom duration-300">
                                                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md animate-pulse">
                                                        <span className="text-white font-bold text-xs">{typingAgent.charAt(0)}</span>
                                                    </div>
                                                    <div className="flex-1 max-w-2xl">
                                                        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-2xl rounded-tl-none shadow-sm">
                                                            <div className="text-xs font-semibold mb-2 text-purple-700 dark:text-purple-400">
                                                                {typingAgent}
                                                            </div>
                                                            <div className="flex space-x-1">
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card>

                                    {/* AI Speaking Indicator with Skip */}
                                    {isAISpeaking && currentSpeakingAgent && !typingAgent && (
                                        <Card className="p-4 flex items-center justify-between text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-300 dark:border-purple-700">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md animate-pulse">
                                                    <span className="text-white font-bold text-sm">{currentSpeakingAgent.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex space-x-1">
                                                            {[...Array(3)].map((_, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                                                                    style={{ animationDelay: `${i * 0.15}s` }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="font-bold">{currentSpeakingAgent}</span>
                                                    </div>
                                                    <span className="text-sm">is speaking...</span>
                                                </div>
                                            </div>
                                            
                                            <Button
                                                onClick={() => {
                                                    window.speechSynthesis.cancel();
                                                    setIsAISpeaking(false);
                                                    setCurrentSpeakingAgent(null);
                                                    toast.success('Skipped AI speech');
                                                }}
                                                variant="outline"
                                                size="sm"
                                                className="border-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900"
                                            >
                                                <VolumeX className="w-4 h-4 mr-2" />
                                                Skip
                                            </Button>
                                        </Card>
                                    )}

                                    {/* Live Transcript */}
                                    {(transcript || interimTranscript) && (
                                        <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700">
                                            <div className="flex items-center space-x-2 mb-2">
                                                {isListening && (
                                                    <div className="flex space-x-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-1 bg-blue-600 rounded-full animate-pulse"
                                                                style={{
                                                                    height: `${Math.random() * 16 + 8}px`,
                                                                    animationDelay: `${i * 0.1}s`
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                                <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">Live Transcript</span>
                                            </div>
                                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                                {transcript}
                                                <span className="text-gray-400 dark:text-gray-500 italic">{interimTranscript}</span>
                                            </p>
                                        </Card>
                                    )}
                                    
                                    {/* Voice Controls - Bottom Sticky */}
                                    {!discussionComplete && (
                                        <div className="sticky bottom-0 z-20 pb-4">
                                            <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-300 dark:border-blue-700 shadow-2xl">
                                                <button
                                                    onClick={() => setStatsCollapsed(!statsCollapsed)}
                                                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
                                                >
                                                    {statsCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                                                </button>
                                                
                                                {!statsCollapsed && (
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                                        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-sm">
                                                            <Clock className={`w-5 h-5 mx-auto mb-1 ${getTimerColor()}`} />
                                                            <div className={`text-xl font-bold ${getTimerColor()}`}>
                                                                {formatTime(speakingTime)}
                                                            </div>
                                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                {speakingTime < 60 ? "Keep going" : 
                                                                 speakingTime < 120 ? "Good!" : 
                                                                 "Wrap up"}
                                                            </div>
                                                        </div>
                                                        
                                                        {wordCount > 0 && (
                                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-sm">
                                                                <MessageCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                                                                <div className="text-xl font-bold text-green-600">{wordCount}</div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400">words</div>
                                                            </div>
                                                        )}
                                                        
                                                        {speechRate > 0 && isListening && (
                                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-sm">
                                                                <Volume2 className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                                                <div className="text-xl font-bold text-purple-600">{speechRate}</div>
                                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                                    {speechRate < 100 ? "Faster" :
                                                                     speechRate > 160 ? "Slower" :
                                                                     "Good!"} wpm
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {isListening && (
                                                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg text-center shadow-sm">
                                                                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Clarity</div>
                                                                <div className={`text-xl font-bold ${
                                                                    confidenceScore >= 80 ? 'text-green-600' :
                                                                    confidenceScore >= 60 ? 'text-yellow-600' :
                                                                    'text-red-600'
                                                                }`}>{confidenceScore}%</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                <div className="flex space-x-3">
                                                    <Button
                                                        onClick={isListening ? stopListening : startListening}
                                                        disabled={loading || isAISpeaking || typingAgent !== null}
                                                        size="lg"
                                                        className={`w-full font-bold py-4 shadow-lg transform hover:scale-[1.02] transition-all ${
                                                            isListening 
                                                            ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                                                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                                                        }`}
                                                    >
                                                        {isListening ? (
                                                            <span className="flex items-center justify-center space-x-2">
                                                                <MicOff className="w-5 h-5 animate-pulse" />
                                                                <span>Stop Speaking</span>
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center justify-center space-x-2">
                                                                <Mic className="w-5 h-5" />
                                                                <span>Start Speaking</span>
                                                            </span>
                                                        )}
                                                    </Button>
                                                </div>
                                                
                                                <div className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
                                                    💡 Press <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Space</kbd> to start/stop • <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to cancel
                                                </div>
                                            </Card>
                                        </div>
                                    )}
                                    
                                    {/* Submit Button */}
                                    {discussionComplete && (
                                        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-400 dark:border-green-600 shadow-xl">
                                            <div className="text-center">
                                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-800 mb-4">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-3">Discussion Complete! 🎉</h3>
                                                <p className="text-green-700 dark:text-green-300 mb-6">
                                                    You've completed {gdTurns.length} rounds. Click below to receive your evaluation.
                                                </p>
                                                <Button
                                                    onClick={() => {
                                                        setEvaluationInitiated(true);
                                                        setEvalAttempt(0);
                                                        getFinalEvaluation();
                                                    }}
                                                    disabled={loading || evaluationInitiated}
                                                    size="lg"
                                                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-8 text-lg shadow-lg transform hover:scale-[1.05] transition-all"
                                                >
                                                    {loading ? (
                                                        <span className="flex items-center space-x-2">
                                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                            <span>Submitting...</span>
                                                        </span>
                                                    ) : (
                                                        '🎯 Submit & Get Evaluation'
                                                    )}
                                                </Button>
                                            </div>
                                        </Card>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 'evaluation' && finalEvaluation && (
                <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-6 mb-8 rounded-2xl border-2 border-green-400 flex items-center shadow-lg">
                        <div className="bg-green-500 p-4 rounded-full mr-4 shadow-md">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-green-800 dark:text-green-400">Discussion Complete!</h3>
                            <p className="text-green-700 dark:text-green-300">Thank you for participating. Here's your detailed evaluation.</p>
                        </div>
                    </div>
                
                    <h2 className="text-4xl font-bold mb-8 text-gray-900 dark:text-white">Group Discussion Results</h2>
                    
                    {/* Overall Score */}
                    <div className="mb-10 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">Overall Performance</h3>
                            <div className="text-center">
                                <span className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                                    {Math.round(finalEvaluation.score)}%
                                </span>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {finalEvaluation.score >= 80 ? 'Excellent!' :
                                     finalEvaluation.score >= 70 ? 'Good Job!' :
                                     finalEvaluation.score >= 60 ? 'Fair' :
                                     'Needs Improvement'}
                                </p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 shadow-inner">
                            <div 
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-4 rounded-full shadow-md transition-all duration-1000 ease-out" 
                                style={{ width: `${Math.min(Math.max(finalEvaluation.score, 0), 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Criteria Scores */}
                    <div className="mb-10">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Performance Breakdown</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: 'Communication', score: finalEvaluation.feedback.criteria_scores.communication, icon: '💬' },
                                { name: 'Topic Understanding', score: finalEvaluation.feedback.criteria_scores.topic_understanding, icon: '🧠' },
                                { name: 'Interaction', score: finalEvaluation.feedback.criteria_scores.interaction, icon: '🤝' }
                            ].map((criteria) => (
                                <div key={criteria.name} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-2 border-blue-200 dark:border-blue-800 transform hover:scale-105 transition-all">
                                    <div className="text-4xl mb-3">{criteria.icon}</div>
                                    <h4 className="font-bold text-gray-900 dark:text-white mb-3">{criteria.name}</h4>
                                    <div className="flex items-end justify-between mb-2">
                                        <span className="text-3xl font-bold text-blue-600">{Math.round(criteria.score)}%</span>
                                    </div>
                                    <Progress value={Math.round(criteria.score)} className="h-3" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Strengths */}
                    <div className="mb-10">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                            <span className="text-3xl mr-3">✅</span>
                            Key Strengths
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {finalEvaluation.strengths.map((strength: string, index: number) => (
                                <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-5 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-md hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold shadow-md">✓</span>
                                        <span className="text-gray-800 dark:text-gray-200 pt-1">{strength}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="mb-10">
                        <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center">
                            <span className="text-3xl mr-3">💡</span>
                            Areas for Improvement
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {finalEvaluation.areasOfImprovement.map((area: string, index: number) => (
                                <div key={index} className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 p-5 rounded-xl border-2 border-orange-300 dark:border-orange-700 shadow-md hover:shadow-lg transition-all">
                                    <div className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold shadow-md">!</span>
                                        <span className="text-gray-800 dark:text-gray-200 pt-1">{area}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button 
                        onClick={() => router.push('/dashboard/student/assessment')}
                        size="lg"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 text-lg shadow-xl transform hover:scale-[1.02] transition-all"
                    >
                        🏁 Complete & Return to Dashboard
                    </Button>
                </Card>
            )}
        </div>
    );
}
