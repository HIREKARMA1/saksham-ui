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
}

interface AIResponse {
    text: string;
    audioUrl?: string;
}

interface GDResponse {
    userResponse: string;
    aiQuestion: string;
    evaluation?: {
        score: number;
        feedback: string;
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
    const [finalEvaluation, setFinalEvaluation] = useState<{
        score: number;
        feedback: string;
        areasOfImprovement: string[];
        strengths: string[];
    } | null>(null);

    // Fetch topic when entering topic step - always fetch new topic
    useEffect(() => {
        if (currentStep === 'topic') {
            // Reset topic state to null to ensure we get a fresh topic
            setTopic(null);
            fetchTopic();
        }
    }, [currentStep]);

    // Check for discussion completion
    useEffect(() => {
        if (gdResponses.length >= 5) {
            getFinalEvaluation();
        }
    }, [gdResponses]);

    const fetchTopic = async () => {
        try {
            setLoading(true);
            console.log('Fetching topic for round:', roundId);
            
            // baseURL already includes /api/v1
            // Add timestamp to ensure we get a fresh topic each time
            const timestamp = new Date().getTime();
            // Force refresh=true to ensure we always get a new topic
            let response = await apiClient.client.post(`/assessments/rounds/${roundId}/gd/topic?t=${timestamp}&refresh=true`);
            let topicData = response.data;
            console.log('Received topic data:', topicData);
            
            // Store topic ID for comparison to detect if we're getting the same topic
            const lastTopicId = window.localStorage.getItem('lastGdTopicId');
            const currentTopicId = `${topicData.title || 'unknown'}-${timestamp}`;
            
            // Check if we got the same topic as last time
            if (lastTopicId && topicData.title && lastTopicId.startsWith(topicData.title)) {
                console.warn('Received the same topic again, will retry');
                // Retry once with an additional delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                const retryTimestamp = new Date().getTime();
                const retryResponse = await apiClient.client.post(
                    `/assessments/rounds/${roundId}/gd/topic?t=${retryTimestamp}&refresh=true&retry=true`
                );
                console.log('Retry response:', retryResponse.data);
                topicData = retryResponse.data;
            }
            
            // Store current topic ID
            if (topicData.title) {
                window.localStorage.setItem('lastGdTopicId', currentTopicId);
            }
            
            // Use the final topic data from API response
            const apiData = topicData;
            
            // Process the data into our topic format
            const processedTopicData = {
                title: apiData.title || apiData.topic || "AI in the Workplace",
                content: apiData.background || apiData.description || apiData.content || 
                    "Discuss the ethical implications and practical considerations of AI in modern workplaces. How should companies balance efficiency with human factors?",
                followUpQuestions: apiData.key_points || apiData.expected_perspectives || apiData.follow_up_questions || [
                    "Candidates with technical backgrounds may focus on the algorithmic fairness and data privacy aspects.",
                    "Ethics-focused candidates might emphasize the moral responsibilities of companies using AI.",
                    "Business-oriented candidates could discuss the balance between efficiency and ethical considerations.",
                    "Legal perspectives might explore the need for regulations and accountability in AI-driven hiring."
                ]
            };
            console.log('Processed topic data:', processedTopicData);
            
            // Ensure we always have a valid topic object
            setTopic(processedTopicData);
            
            // Announce the topic information
            toast.success('Discussion topic loaded successfully!');
            
            // Pre-fetch audio if available
            if (apiData.audio_url) {
                fetch(apiData.audio_url).catch(console.error); // Preload audio
            }
        } catch (error) {
            console.error('Error fetching topic:', error);
            toast.error('Failed to fetch discussion topic. Using default topic instead.');
            
            // Set default topic if fetch fails
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
        }
    };

    const MAX_RESPONSES = 5; // Maximum number of responses for the discussion

    const getFinalEvaluation = async () => {
        try {
            setLoading(true);
            const { data: evalData } = await apiClient.client.post(`/assessments/rounds/${roundId}/evaluate-discussion`, {
                responses: gdResponses.map(r => ({
                    user_response: r.userResponse,
                    ai_question: r.aiQuestion
                }))
            });

            const evaluation = {
                score: evalData.score,
                feedback: evalData.feedback,
                areasOfImprovement: evalData.areas_of_improvement,
                strengths: evalData.strengths
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
                time_taken: 0 // You might want to track actual time
            }]);
        } catch (error) {
            console.error('Error getting evaluation:', error);
            toast.error('Failed to get final evaluation. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Check if we should transition to evaluation
    useEffect(() => {
        if (gdResponses.length >= MAX_RESPONSES) {
            getFinalEvaluation();
        }
    }, [gdResponses]);

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
                };

                speechRecognition.current.onend = () => {
                    if (isListening) {
                        speechRecognition.current.start();
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
        speechRecognition.current.start();
        toast.success('🎤 Listening... Speak clearly.');
    };

    const stopListening = () => {
        if (speechRecognition.current) {
            speechRecognition.current.stop();
            setIsListening(false);
            
            // Process the complete response
            if (transcript.trim()) {
                handleUserResponse(transcript);
            }
        }
    };

    const handleUserResponse = async (text: string) => {
        try {
            setLoading(true);
            console.log('Sending user response:', text);
            
            const { data: responseData } = await apiClient.client.post(`/assessments/rounds/${roundId}/gd/response`, {
                text: text
            });
            console.log('Received AI response data:', responseData);

            // Create a consistent AI response object
            const aiResponse: AIResponse = {
                text: responseData.follow_up_question || responseData.response || "That's an interesting perspective. Could you elaborate more on that point?",
                audioUrl: responseData.audio_url
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
            setGDResponses(prev => [...prev, {
                userResponse: text,
                aiQuestion: aiResponse.text
            }]);

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
                                <p>When you click "Start Speaking", you will begin a voice conversation with the AI. Speak clearly into your microphone.</p>
                            </div>
                            
                            <Button
                                onClick={() => {
                                    setCurrentStep('discussion');
                                    // Auto-announce the topic using speech synthesis
                                    const utterance = new SpeechSynthesisUtterance(`Today's discussion topic is: ${topic.title}. ${topic.content}`);
                                    utterance.lang = 'en-US';
                                    window.speechSynthesis.speak(utterance);
                                    
                                    // Start listening after a brief delay to allow the topic announcement
                                    setTimeout(() => {
                                        startListening();
                                    }, 1000);
                                }}
                                size="lg"
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                Start Speaking
                            </Button>
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

                            {/* Live Speech UI */}
                            <div className="relative">
                                <div className="flex items-center justify-center space-x-4">
                                    <Button
                                        onClick={isListening ? stopListening : startListening}
                                        disabled={loading || isAISpeaking}
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

                    {/* Discussion Progress */}
                    <Card className="p-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Discussion Progress</span>
                                <span>{gdResponses.length} of {MAX_RESPONSES} responses</span>
                            </div>
                            <Progress value={(gdResponses.length / MAX_RESPONSES) * 100} className="h-2" />
                        </div>
                    </Card>
                </>
            )}

            {currentStep === 'evaluation' && finalEvaluation && (
                <Card className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Discussion Evaluation</h2>
                    
                    {/* Overall Score */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Overall Score</h3>
                            <span className="text-2xl font-bold text-blue-600">
                                {Math.round(finalEvaluation.score * 100)}%
                            </span>
                        </div>
                        <Progress value={finalEvaluation.score * 100} className="h-3" />
                    </div>

                    {/* Feedback */}
                    <div className="mb-8">
                        <h3 className="font-semibold mb-3">Feedback</h3>
                        <p className="text-gray-600 dark:text-gray-300">{finalEvaluation.feedback}</p>
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