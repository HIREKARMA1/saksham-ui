"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiClient } from "@/lib/api";
import { Mic, MicOff, MessageCircle, Send, Play, Square } from 'lucide-react';
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
    const [currentStep, setCurrentStep] = useState<'intro' | 'topic' | 'discussion' | 'evaluation'>('topic');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [speakingTime, setSpeakingTime] = useState(0);
    const [speakingTimerId, setSpeakingTimerId] = useState<NodeJS.Timeout | null>(null);
    const [showManualInput, setShowManualInput] = useState(false);
    const [manualInputText, setManualInputText] = useState('');
    const [isTopicAnnounced, setIsTopicAnnounced] = useState(false);
    const [discussionComplete, setDiscussionComplete] = useState(false);
    const [finalEvaluation, setFinalEvaluation] = useState<{
        score: number;
        feedback: {
            criteria_scores: {
                communication: number;
                topic_understanding: number;
                interaction: number;
            };
            strengths: string[];
            improvements: string[];
        };
        areasOfImprovement: string[];
        strengths: string[];
    } | null>(null);

    // Fetch topic when entering topic step - fetch once
    useEffect(() => {
        if (currentStep === 'topic' && !topic) {
            // Only fetch if we don't have a topic yet
            setFetchAttempt(0);
            fetchTopic();
        }
        
        // Cleanup function to reset state when component unmounts or step changes
        return () => {
            setFetchAttempt(0);
        };
    }, [currentStep, topic]);

    // Track fetch attempts to prevent multiple retries
    const [fetchAttempt, setFetchAttempt] = useState(0);
    const maxRetries = 10; // Maximum number of retry attempts

    const inFlightRef = useRef(false);

    const fetchTopic = async () => {
        // Prevent multiple fetches while loading, already in-flight, or if max retries exceeded
        if (loading || inFlightRef.current || fetchAttempt > maxRetries) {
            return;
        }
        inFlightRef.current = true;
        setLoading(true);
        try {
            const timestamp = new Date().getTime();
            // Set refresh to false to get existing topic or generate once
            const response = await Promise.race([
                apiClient.client.post(`/assessments/rounds/${roundId}/gd/topic?t=${timestamp}&refresh=false`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), 15000))
            ]) as any;
            const topicData = response.data;
            console.log('Received topic data:', topicData);

            // Handle error status
            if (topicData && topicData.status === 'error') {
                console.error('Error from server:', topicData.message);
                throw new Error(topicData.message || 'Failed to generate topic');
            }

            // Verify we got valid topic data
            if (!topicData || (!topicData.title && !topicData.topic)) {
                console.error('Invalid topic data received:', topicData);
                throw new Error('Invalid topic data received');
            }

            // Store current topic ID if available
            if (topicData.title) {
                window.localStorage.setItem('lastGdTopicId', topicData.title);
            }

            // Process the data into our topic format
            const processedTopicData = {
                title: topicData.title || topicData.topic || "AI in the Workplace",
                content: topicData.background || topicData.description || topicData.content ||
                    "Discuss the ethical implications and practical considerations of AI in modern workplaces. How should companies balance efficiency with human factors?",
                followUpQuestions: topicData.key_points || topicData.expected_perspectives || topicData.follow_up_questions || [
                    "Candidates with technical backgrounds may focus on the algorithmic fairness and data privacy aspects.",
                    "Ethics-focused candidates might emphasize the moral responsibilities of companies using AI.",
                    "Business-oriented candidates could discuss the balance between efficiency and ethical considerations.",
                    "Legal perspectives might explore the need for regulations and accountability in AI-driven hiring."
                ],
                instructions: topicData.instructions || "Please speak for 1-2 minutes on this topic, sharing your perspective and supporting your points with examples or reasoning."
            };
            console.log('Processed topic data:', processedTopicData);
            setTopic(processedTopicData);
            toast.success('Discussion topic loaded successfully!');
            setFetchAttempt(0);

            // Pre-fetch audio if available
            if (topicData.audio_url) {
                fetch(topicData.audio_url).catch(console.error);
            }
        } catch (error) {
            console.error('Error fetching topic:', error);
            
            // Only retry if this is the first attempt
            if (fetchAttempt < 1) {
                setFetchAttempt(prev => prev + 1);
                toast.error('Failed to fetch topic. Retrying...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                inFlightRef.current = false;
                setLoading(false);
                fetchTopic();
                return;
            }
            
            // Use fallback topic after retries
            toast.error('Failed to fetch discussion topic. Using default topic instead.');
            setTopic({
                title: "The Future of Work in a Digital Age",
                content: "Discuss how technological advancements are reshaping work environments and job requirements. Consider factors like remote work, automation, and the evolving skill demands.",
                followUpQuestions: [
                    "What skills will be most valuable in the next decade?",
                    "How should education systems adapt to prepare students?",
                    "What are the implications for work-life balance?",
                    "How might these changes affect different industries differently?"
                ]
            });
        } finally {
            setLoading(false);
            inFlightRef.current = false;
        }
    };

    const MAX_RESPONSES = 2; // Maximum number of responses for the discussion - user speaks, AI responds, user speaks again, then submit button appears

    const [evalAttempt, setEvalAttempt] = useState(0);
    const maxEvalRetries = 2; // Maximum number of evaluation retry attempts

    const getFinalEvaluation = async () => {
        // Prevent multiple evaluation attempts or if already completed
        if (loading || currentStep === 'evaluation' || !evaluationInitiated) {
            return;
        }

        // If max retries reached, use fallback and prevent further attempts
        if (evalAttempt >= maxEvalRetries) {
            console.log('Max retries reached, using fallback evaluation');
            setEvaluationInitiated(false); // Reset for potential future evaluations
            setFinalEvaluation({
                score: 70,
                feedback: {
                    criteria_scores: {
                        communication: 70,
                        topic_understanding: 70,
                        interaction: 70
                    },
                    strengths: ['Participated in the discussion', 'Provided responses to questions'],
                    improvements: ['Consider providing more detailed examples', 'Try to engage more deeply with follow-up questions']
                },
                areasOfImprovement: ['Consider providing more detailed examples', 'Try to engage more deeply with follow-up questions'],
                strengths: ['Participated in the discussion', 'Provided responses to questions']
            });
            setCurrentStep('evaluation');
            return;
        }

        try {
            setLoading(true);
            const response = await Promise.race([
                apiClient.client.post(`/assessments/rounds/${roundId}/evaluate-discussion`),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Evaluation request timeout')), 10000))
            ]) as { data: any };
            
            const evalData = response.data;
            if (!evalData) {
                throw new Error('No evaluation data received');
            }
            
            // Reset evaluation state since we got a successful response
            setEvaluationInitiated(false);

            // Keep scores as integers (0-100 range) from backend
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
            
            // Submit the assessment response
            onComplete([{
                response_text: JSON.stringify({
                    responses: gdResponses,
                    evaluation: evaluation
                }),
                score: evaluation.score,
                time_taken: 0
            }]);

            toast.success('Discussion evaluation complete! View your results below.');
        } catch (error) {
            console.error('Error getting evaluation:', error);
            setEvalAttempt(prev => prev + 1);
            
            if (evalAttempt < maxEvalRetries) {
                toast.error('Failed to get evaluation. Retrying in 2 seconds...');
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 2000));
                setLoading(false);
                getFinalEvaluation();
                return;
            }
            
            // If we've reached max retries, use fallback
            const fallbackEvaluation = {
                score: 70,
                feedback: {
                    criteria_scores: {
                        communication: 70,
                        topic_understanding: 70,
                        interaction: 70
                    },
                    strengths: ['Participated in the discussion', 'Provided relevant responses'],
                    improvements: ['Could provide more detailed examples', 'Could engage more deeply with the topic']
                },
                areasOfImprovement: ['Could provide more detailed examples', 'Could engage more deeply with the topic'],
                strengths: ['Participated in the discussion', 'Provided relevant responses']
            };
            
            setFinalEvaluation(fallbackEvaluation);
            setCurrentStep('evaluation');
        } finally {
            setLoading(false);
        }
    };

    // Track if evaluation has been initiated
    const [evaluationInitiated, setEvaluationInitiated] = useState(false);

    // Speech recognition setup
    const speechRecognition = useRef<any>(null);
    const audioContext = useRef<AudioContext | null>(null);
    const audioQueue = useRef<string[]>([]);
    const isProcessingAudio = useRef(false);

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
                        if (event.results[i].isFinal) {
                            finalText += transcript + ' ';
                        } else {
                            interimText += transcript;
                        }
                    }

                    setInterimTranscript(interimText);
                    if (finalText) {
                        setTranscript(prev => prev + finalText);
                    }
                };

                speechRecognition.current.onerror = (error: any) => {
                    console.error('Speech recognition error:', error);
                    toast.error(getErrorMessage(error));
                    setIsListening(false);
                    
                    // If error occurs after some speech was captured, try to process what we have
                    if (transcript.trim()) {
                        toast.success('Processing the speech we captured so far...');
                        handleUserResponse(transcript);
                    } else {
                        toast.error('No speech was detected. Please try again by clicking Start Speaking.');
                        // Show manual input as fallback
                        setShowManualInput(true);
                    }
                };

                speechRecognition.current.onend = () => {
                    console.log('Speech recognition ended, isListening:', isListening);
                    if (isListening) {
                        try {
                            speechRecognition.current.start();
                        } catch (err) {
                            console.error('Error restarting speech recognition:', err);
                            setIsListening(false);
                            toast.error('Speech recognition stopped unexpectedly. Please click Start Speaking again.');
                        }
                    }
                };
            }

            // Initialize Audio Context
            audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        return () => {
            if (speechRecognition.current) {
                speechRecognition.current.stop();
            }
            
            // Clean up any timers
            if (speakingTimerId) {
                clearInterval(speakingTimerId);
            }
            
            // Stop any speech synthesis that might be in progress
            if (window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    // Clean up the component's output
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

    // Speech handling methods
    const startListening = () => {
        if (!speechRecognition.current) {
            toast.error('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
            return;
        }

        setIsListening(true);
        setTranscript('');
        setInterimTranscript('');
        setSpeakingTime(0);
        
        // Start the timer for tracking speaking duration
        const timerId = setInterval(() => {
            setSpeakingTime(prevTime => prevTime + 1);
        }, 1000);
        
        setSpeakingTimerId(timerId);
        speechRecognition.current.start();
        toast.success('🎤 Listening... Please speak for 1-2 minutes.');
    };

    const stopListening = () => {
        if (speechRecognition.current) {
            console.log('Stopping speech recognition');
            speechRecognition.current.stop();
            setIsListening(false);
            
            // Clear the speaking timer
            if (speakingTimerId) {
                clearInterval(speakingTimerId);
                setSpeakingTimerId(null);
            }
            
            // Process the complete response
            if (transcript.trim()) {
                console.log('Processing transcript:', transcript);
                handleUserResponse(transcript);
            } else {
                // If no transcript was detected, provide feedback and show manual input
                console.warn('No speech detected after stopping');
                toast.error('No speech was detected. You can type your response instead.');
                setInterimTranscript('');
                setShowManualInput(true);
            }
        }
    };

    const [responseAttempt, setResponseAttempt] = useState(0);
    const maxResponseRetries = 2;

    const handleUserResponse = async (text: string) => {
        // Prevent processing responses if discussion is already complete
        if (discussionComplete) {
            toast.success('Discussion is complete. Please click "Submit Discussion" to get your evaluation.');
            return;
        }

        if (responseAttempt >= maxResponseRetries) {
            setResponseAttempt(0); // Reset for next response
            toast.error('Unable to process response after multiple attempts. Using fallback response.');
            return;
        }

        try {
            // Check if the response is very short (less than 10 words)
            const wordCount = text.trim().split(/\s+/).length;
            if (wordCount < 10) {
                // If this is not the last response, encourage more detailed input
                if (gdResponses.length === 0) {
                    toast.error('Please provide a more detailed response (1-2 minutes worth). Try to speak in full sentences and explain your thoughts.', { duration: 5000 });
                    return;
                }
            }
            
            setLoading(true);
            console.log('Sending user response:', text);
            
            // Show a loading indicator
            toast.success('Processing your response...', { duration: 3000 });
            
            let responseData;
            try {
                const response = await Promise.race([
                    apiClient.client.post(`/assessments/rounds/${roundId}/gd/response`, { text }),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Request timeout')), 15000)
                    )
                ]) as any;
                
                responseData = response.data;
                console.log('Received AI response data:', responseData);
            } catch (apiError) {
                console.error('API call failed:', apiError);
                setResponseAttempt(prev => prev + 1);
                
                if (responseAttempt < maxResponseRetries) {
                    toast.error('Connection issue. Retrying in 2 seconds...', { duration: 2000 });
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    setLoading(false);
                    handleUserResponse(text); // Retry the request
                    return;
                }
                
                // If we've reached max retries, use fallback responses
                if (gdResponses.length === 0) {
                    responseData = {
                        follow_up_question: "Thank you for sharing your thoughts. Could you elaborate on how you think this topic affects different stakeholders or industries?",
                        response: "I'd like to hear more about your perspective on this issue. Could you share some specific examples or scenarios?",
                        evaluation: "Your response shows engagement with the topic."
                    };
                } else {
                    responseData = {
                        follow_up_question: "Thank you for participating in this discussion. You've raised some interesting points to consider.",
                        response: "I appreciate your contributions to this discussion topic.",
                        evaluation: "You've completed the discussion exercise."
                    };
                }
                
                toast.error('Unable to connect to AI after multiple attempts. Using fallback response.', { duration: 3000 });
            }

            // Create a consistent AI response object with fallbacks at each step
            const aiResponse: AIResponse = {
                text: responseData?.follow_up_question || responseData?.response || "That's an interesting perspective. Could you elaborate more on that point?",
                audioUrl: responseData?.audio_url
            };
            setCurrentAIResponse(aiResponse);
            
            // Display the AI's text response
            toast.success('AI is responding...', { duration: 2000 });
            
            console.log('Processing AI response:', aiResponse);

            // Play AI response audio if available
            if (aiResponse.audioUrl) {
                try {
                    await playAudioResponse(aiResponse.audioUrl);
                } catch (audioError) {
                    console.error('Error playing audio response:', audioError);
                    // Continue without audio
                }
            } else {
                // Using browser's speech synthesis as fallback
                const utterance = new SpeechSynthesisUtterance(aiResponse.text);
                utterance.lang = 'en-US';
                window.speechSynthesis.speak(utterance);
            }

            // Add to conversation history
            const updatedResponses = [...gdResponses, {
                userResponse: text,
                aiQuestion: aiResponse.text
            }];
            setGDResponses(updatedResponses);

            // If this was the second response, mark discussion as complete
            if (updatedResponses.length >= MAX_RESPONSES) {
                setDiscussionComplete(true);
                toast.success('Discussion complete! Click "Submit Discussion" to get your evaluation.');
            }

            // Clear the transcript for next response
            setTranscript('');
        } catch (error) {
            console.error('Error processing response:', error);
            toast.error('Failed to process your response. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const playAudioResponse = async (audioUrl: string) => {
        try {
            setIsAISpeaking(true);
            const response = await fetch(audioUrl);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await audioContext.current!.decodeAudioData(arrayBuffer);
            
            const source = audioContext.current!.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContext.current!.destination);
            
            return new Promise<void>((resolve) => {
                source.onended = () => {
                    setIsAISpeaking(false);
                    resolve();
                };
                source.start(0);
            });
        } catch (error) {
            console.error('Error playing audio:', error);
            setIsAISpeaking(false);
            toast.error('Failed to play AI response');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            
            {currentStep === 'intro' && (
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Group Discussion Round</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Welcome to the AI-moderated group discussion. You'll engage in a voice conversation with an AI moderator who will evaluate your communication skills, critical thinking, and ability to articulate your thoughts.
                    </p>
                    <Button 
                        onClick={() => setCurrentStep('topic')}
                        size="lg"
                        className="w-full"
                    >
                        Begin Discussion
                    </Button>
                </Card>
            )}

            {currentStep === 'topic' && (
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Today's Discussion Topic</h2>
                    {topic ? (
                        <>
                            <h3 className="text-xl font-semibold mb-4 text-blue-700">{topic.title}</h3>
                            <div className="border-l-4 border-blue-500 pl-4 mb-6">
                                <p className="text-gray-700 dark:text-gray-300 italic">{topic.content}</p>
                            </div>
                            
                            {/* Instructions for the user */}
                            <div className="mb-6 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                                <h4 className="font-medium mb-2 text-yellow-800">Instructions:</h4>
                                <p className="text-gray-800">{topic.instructions || "Please speak for 1-2 minutes on this topic, sharing your perspective and supporting your points with examples or reasoning."}</p>
                            </div>
                            
                            {topic.followUpQuestions && topic.followUpQuestions.length > 0 && (
                                <div className="mb-8 bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-3 text-blue-800">Key Points to Consider:</h4>
                                    <ul className="list-disc list-inside space-y-2">
                                        {topic.followUpQuestions.map((point, idx) => (
                                            <li key={idx} className="text-gray-700">{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <div className="mt-2 mb-6 text-sm text-gray-500">
                                <p>When you click "Start Speaking", you will begin a voice conversation with the AI. Speak clearly into your microphone for 1-2 minutes.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded-md border border-blue-200 text-sm text-blue-800">
                                    <p><strong>Discussion Flow:</strong></p>
                                    <ol className="list-decimal list-inside mt-1 space-y-1">
                                        <li>Click "Start Speaking" and talk for 1-2 minutes about the topic</li>
                                        <li>Click "Stop Speaking" when you finish your response</li>
                                        <li>The AI will respond to your points</li>
                                        <li>You'll have one more chance to respond</li>
                                        <li>Click "Submit Discussion" to get your evaluation and score</li>
                                        <li>View your results showing Round 1, Round 2, and overall performance</li>
                                    </ol>
                                </div>
                                
                                <Button
                                    onClick={() => {
                                        setCurrentStep('discussion');
                                        setIsTopicAnnounced(false); // Reset topic announcement state
                                        
                                        // Build comprehensive introduction
                                        const announcement = [
                                            `Today's discussion topic is: ${topic.title}.`,
                                            topic.content,
                                            "Key points to consider:",
                                            ...(topic.followUpQuestions || []).map(q => `- ${q}`),
                                            "Please speak for 1 to 2 minutes on this topic.",
                                            "After your first response, the AI will ask a follow-up question.",
                                            "Then you'll have one more chance to respond.",
                                            "After your second response, click the Submit Discussion button to get your evaluation.",
                                            "Remember to click Stop Speaking when you finish each response."
                                        ].join(' ');
                                        
                                        const utterance = new SpeechSynthesisUtterance(announcement);
                                        utterance.lang = 'en-US';
                                        utterance.rate = 0.9; // Slightly slower for clarity
                                        
                                        // When announcement finishes
                                        utterance.onend = () => {
                                            setIsTopicAnnounced(true);
                                            toast.success('You can now start speaking about the topic');
                                        };
                                        
                                        // Start the announcement
                                        toast.success('Please listen to the topic introduction...');
                                        window.speechSynthesis.speak(utterance);
                                    }}
                                    size="lg"
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    Begin Topic Introduction
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center py-8">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <p>Loading discussion topic...</p>
                        </div>
                    )}
                </Card>
            )}

            {currentStep === 'discussion' && (
                <>
                    <Card className="p-6">
                        <div className="space-y-6">
                            {/* Current Topic Display */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-2">{topic?.title}</h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-4">{topic?.content}</p>
                                
                                {!isTopicAnnounced ? (
                                    <div className="flex flex-col items-center space-y-4">
                                        <div className="animate-pulse text-blue-600">
                                            Listening to topic introduction...
                                        </div>
                                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <Button
                                        onClick={startListening}
                                        disabled={isListening || isAISpeaking}
                                        size="lg"
                                        className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                        Begin Your Response
                                    </Button>
                                )}
                                
                                {topic?.followUpQuestions && topic.followUpQuestions.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="text-md font-medium mb-2">Key Points to Consider:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                                            {topic.followUpQuestions.map((point, idx) => (
                                                <li key={idx}>{point}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Conversation History */}
                            <div className="space-y-4">
                                {gdResponses.map((response, index) => (
                                    <div key={index} className="space-y-3">
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Mic className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div className="flex-1 p-4 bg-blue-50 rounded-lg">
                                                <p>{response.userResponse}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                <MessageCircle className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <div className="flex-1 p-4 bg-purple-50 rounded-lg">
                                                <p>{response.aiQuestion}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Submit Button - appears when discussion is complete */}
                            {discussionComplete && (
                                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-center">
                                        <h3 className="text-lg font-semibold text-green-800 mb-2">Discussion Complete!</h3>
                                        <p className="text-green-700 mb-4">You've completed the group discussion. Click below to submit and receive your evaluation.</p>
                                        <Button
                                            onClick={() => {
                                                setEvaluationInitiated(true);
                                                setEvalAttempt(0);
                                                getFinalEvaluation();
                                            }}
                                            disabled={loading || evaluationInitiated}
                                            size="lg"
                                            className="bg-green-600 hover:bg-green-700"
                                        >
                                            {loading ? 'Submitting...' : 'Submit Discussion & Get Score'}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Live Speech UI */}
                            <div className="relative">
                                <div className="flex flex-col items-center justify-center space-y-4">
                                    {isListening && (
                                        <div className="mb-2 text-center">
                                            <div className="text-lg font-bold">
                                                Speaking Time: {Math.floor(speakingTime / 60)}:{(speakingTime % 60).toString().padStart(2, '0')}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {speakingTime < 60 ? "Continue speaking..." : 
                                                 speakingTime < 120 ? "Good timing! Continue or conclude your thoughts." : 
                                                 "You've reached the 2-minute mark. Consider concluding."}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex space-x-3">
                                        <Button
                                            onClick={isListening ? stopListening : startListening}
                                            disabled={loading || isAISpeaking || discussionComplete}
                                            size="lg"
                                            variant={isListening ? "destructive" : "default"}
                                            className="w-48"
                                        >
                                            {isListening ? (
                                                <span className="flex items-center space-x-2">
                                                    <MicOff className="w-5 h-5" />
                                                    <span>Stop Speaking</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center space-x-2">
                                                    <Mic className="w-5 h-5" />
                                                    <span>Start Speaking</span>
                                                </span>
                                            )}
                                        </Button>
                                        
                                        {!isListening && !showManualInput && !discussionComplete && (
                                            <Button
                                                onClick={() => setShowManualInput(true)}
                                                variant="outline"
                                                size="lg"
                                            >
                                                <span className="flex items-center space-x-2">
                                                    <MessageCircle className="w-5 h-5" />
                                                    <span>Type Response</span>
                                                </span>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* Live Transcript */}
                                {(transcript || interimTranscript) && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700">
                                            {transcript}
                                            <span className="text-gray-400 italic">{interimTranscript}</span>
                                        </p>
                                    </div>
                                )}
                                
                                {/* Manual Input Fallback */}
                                {showManualInput && !discussionComplete && (
                                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                        <h4 className="text-md font-medium mb-2 text-yellow-800">Speech recognition issue detected</h4>
                                        <p className="mb-3 text-sm">You can type your response below instead:</p>
                                        <textarea 
                                            className="w-full p-3 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            rows={4}
                                            placeholder="Type your response here (1-2 minutes worth of speaking)"
                                            value={manualInputText}
                                            onChange={(e) => setManualInputText(e.target.value)}
                                        />
                                        <div className="mt-3 flex justify-end">
                                            <Button 
                                                onClick={() => {
                                                    if (manualInputText.trim()) {
                                                        handleUserResponse(manualInputText);
                                                        setManualInputText('');
                                                        setShowManualInput(false);
                                                    } else {
                                                        toast.error('Please enter your response before submitting.');
                                                    }
                                                }}
                                                disabled={loading || discussionComplete}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                Submit Response
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* AI Speaking Indicator */}
                                {isAISpeaking && (
                                    <div className="mt-4 flex items-center justify-center space-x-2 text-purple-600">
                                        <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
                                        <span>AI is speaking...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </>
            )}

            {currentStep === 'evaluation' && finalEvaluation && (
                <Card className="p-6">
                    {(() => {
                        console.log('Rendering evaluation step with data:', finalEvaluation);
                        return null;
                    })()}
                    <div className="bg-green-50 p-4 mb-6 rounded-lg border border-green-200 flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="font-medium text-green-800">Discussion Complete</h3>
                            <p className="text-sm text-green-700">Thank you for participating in this group discussion.</p>
                        </div>
                    </div>
                
                    <h2 className="text-2xl font-bold mb-6">Group Discussion Round Results</h2>
                    
                    {/* Overall Score */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Overall Score</h3>
                            <span className="text-2xl font-bold text-blue-600">
                                {Math.round(finalEvaluation.score)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className="bg-blue-600 h-3 rounded-full" 
                                style={{ width: `${Math.min(Math.max(finalEvaluation.score, 0), 100)}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Criteria Scores */}
                    <div className="mb-8">
                        <h3 className="font-semibold mb-3">Criteria Scores</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span>Communication</span>
                                    <span>{Math.round(finalEvaluation.feedback.criteria_scores.communication)}%</span>
                                </div>
                                <Progress value={Math.round(finalEvaluation.feedback.criteria_scores.communication)} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span>Topic Understanding</span>
                                    <span>{Math.round(finalEvaluation.feedback.criteria_scores.topic_understanding)}%</span>
                                </div>
                                <Progress value={Math.round(finalEvaluation.feedback.criteria_scores.topic_understanding)} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span>Interaction</span>
                                    <span>{Math.round(finalEvaluation.feedback.criteria_scores.interaction)}%</span>
                                </div>
                                <Progress value={Math.round(finalEvaluation.feedback.criteria_scores.interaction)} className="h-2" />
                            </div>
                        </div>
                    </div>

                    {/* Strengths */}
                    <div className="mb-8">
                        <h3 className="font-semibold mb-3">Key Strengths</h3>
                        <ul className="space-y-2">
                            {finalEvaluation.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start gap-2 text-green-600">
                                    <span className="mt-1">✓</span>
                                    <span>{strength}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Areas for Improvement */}
                    <div className="mb-8">
                        <h3 className="font-semibold mb-3">Areas for Improvement</h3>
                        <ul className="space-y-2">
                            {finalEvaluation.areasOfImprovement.map((area, index) => (
                                <li key={index} className="flex items-start gap-2 text-orange-600">
                                    <span className="mt-1">•</span>
                                    <span>{area}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Button 
                        onClick={() => router.push('/dashboard/student/assessment')}
                        className="w-full"
                    >
                        Complete Discussion
                    </Button>
                </Card>
            )}
        </div>
    );
}
