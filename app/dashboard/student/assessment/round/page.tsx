"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { 
    Home, User, FileText, Briefcase, ClipboardList,
    Mic, Square, Send, Clock, CheckCircle2, Volume2, Edit3
} from 'lucide-react'
import toast from 'react-hot-toast'
import { GroupDiscussionRound } from '@/components/assessment/GroupDiscussionRound'

interface GDResponse {
    response_text: string;
    time_taken?: number;
    score?: number;
}

// Speech Recognition Types
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: any) => void;
    onend: () => void;
}

const extractErrorMessage = (error: any): string => {
    if (error.response?.data?.detail) {
        const detail = error.response.data.detail
        if (Array.isArray(detail) && detail.length > 0) {
            return detail[0].msg || detail[0].message || 'Validation error'
        }
        if (typeof detail === 'string') {
            return detail
        }
    }
    return error.message || 'An error occurred'
}

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
    { name: 'Assessments', href: '/dashboard/student/assessment', icon: ClipboardList },
]

const roundNames = {
    1: "Aptitude Test",
    2: "Soft Skills Assessment", 
    3: "Group Discussion",
    4: "Technical MCQ",
    5: "Technical Interview",
    6: "HR Interview"
}

// Map frontend round numbers to backend round types
const roundTypeMap = {
    1: 'aptitude',
    2: 'soft_skills',
    3: 'group_discussion',
    4: 'technical_mcq',
    5: 'technical_interview',
    6: 'hr_interview'
}

export default function AssessmentRoundPage() {
    const [roundData, setRoundData] = useState<any>(null)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [responses, setResponses] = useState<Record<string, any>>({})
    const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]))
    const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    
    // Live Transcription States
    const [isLiveTranscribing, setIsLiveTranscribing] = useState(false)
    const [liveTranscript, setLiveTranscript] = useState("")
    const [interimTranscript, setInterimTranscript] = useState("")
    const speechRecognitionRef = useRef<SpeechRecognition | null>(null)
    const chatEndRef = useRef<HTMLDivElement>(null)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const assessmentId = searchParams.get('assessment_id')
    const roundNumber = parseInt(searchParams.get('round') || '1')

    // Normalize options coming from different backend shapes
    const normalizeMcqOptions = (q: any): string[] => {
        if (!q) return []
        // 1) Array of strings/objects
        if (Array.isArray(q.options)) {
            return q.options.map((o: any) => typeof o === 'string' ? o : (o?.text ?? o?.label ?? JSON.stringify(o)))
        }
        // 2) 'choices' array
        if (Array.isArray(q.choices)) {
            return q.choices.map((o: any) => typeof o === 'string' ? o : (o?.text ?? o?.label ?? JSON.stringify(o)))
        }
        // 3) JSON string in options/options_json
        const jsonCandidate = q.options_json || q.options
        if (typeof jsonCandidate === 'string') {
            try {
                const parsed = JSON.parse(jsonCandidate)
                if (Array.isArray(parsed)) {
                    return parsed.map((o: any) => typeof o === 'string' ? o : (o?.text ?? o?.label ?? JSON.stringify(o)))
                }
                if (parsed && typeof parsed === 'object') {
                    const vals = Object.values(parsed as Record<string, any>)
                    return vals.map((o: any) => typeof o === 'string' ? o : (o?.text ?? o?.label ?? JSON.stringify(o)))
                }
            } catch {}
        }
        // 4) option_a/option_b/option_c/option_d fields
        const keySet = ['option_a','option_b','option_c','option_d']
        const fromFields = keySet.map(k => q[k]).filter(Boolean)
        if (fromFields.length > 0) return fromFields
        // 5) options as object {A: '...', B: '...'}
        if (q.options && typeof q.options === 'object') {
            return Object.values(q.options)
        }
        return []
    }
    const roundType = roundTypeMap[roundNumber as keyof typeof roundTypeMap]
    const isVoiceRound = roundType === 'technical_interview' || roundType === 'hr_interview'
    const isGroupDiscussionRound = roundType === 'group_discussion'
    const currentQ = roundData?.questions?.[currentQuestion]
    const counts = roundData ? getCounts() : { answered: 0, notAnswered: 0, marked: 0, notVisited: 0 }
    const canSubmit = roundData && !submitting
    
    const responsesRef = useRef(responses)
    const roundDataRef = useRef(roundData)
    const submittingRef = useRef(submitting)
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const hasAutoSubmitted = useRef(false)

    // Update refs
    useEffect(() => { responsesRef.current = responses }, [responses])
    useEffect(() => { roundDataRef.current = roundData }, [roundData])
    useEffect(() => { submittingRef.current = submitting }, [submitting])

    // Auto-scroll chat to bottom
    useEffect(() => {
        if (isVoiceRound) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [liveTranscript, interimTranscript, currentQuestion])

    // Initialize Web Speech API
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            
            if (SpeechRecognition) {
                const recognition = new SpeechRecognition()
                recognition.continuous = true
                recognition.interimResults = true
                recognition.lang = 'en-US'
                
                recognition.onresult = (event: any) => {
                    let interim = ""
                    let final = ""
                    
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript
                        
                        if (event.results[i].isFinal) {
                            final += transcript + " "
                        } else {
                            interim += transcript
                        }
                    }
                    
                    setInterimTranscript(interim)
                    
                    if (final) {
                        setLiveTranscript(prev => prev + final)
                    }
                }
                
                recognition.onerror = (event: any) => {
                    console.error('Speech recognition error:', event.error)
                    if (event.error === 'no-speech') {
                        toast.error('No speech detected. Please speak clearly.')
                    } else if (event.error === 'audio-capture') {
                        toast.error('No microphone found. Check your device.')
                    } else if (event.error === 'not-allowed') {
                        toast.error('Microphone permission denied. Please allow access.')
                    }
                }
                
                recognition.onend = () => {
                    if (isLiveTranscribing) {
                        try {
                            recognition.start()
                        } catch (e) {
                            console.log('Recognition restart skipped')
                        }
                    }
                }
                
                speechRecognitionRef.current = recognition
            } else {
                console.warn('Web Speech API not supported in this browser')
            }
        }
        
        return () => {
            if (speechRecognitionRef.current) {
                try {
                    speechRecognitionRef.current.stop()
                } catch (e) {
                    // Already stopped
                }
            }
        }
    }, [isLiveTranscribing])

    // Cleanup effect
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [])

    // Load round data
    useEffect(() => {
        if (!assessmentId) {
            toast.error('Assessment ID is required')
            router.push('/dashboard/student/assessment')
            return
        }
        loadRoundData()
    }, [assessmentId, roundNumber])

    // Initialize timer
    useEffect(() => {
        if (roundData && roundData.time_limit && timeLeft === null) {
            const initialTime = roundData.time_limit * 60
            console.log(`⏰ Timer initialized: ${initialTime} seconds`)
            setTimeLeft(initialTime)
        }
    }, [roundData, timeLeft])

    // Timer countdown
    useEffect(() => {
        if (timeLeft === null || submitting || hasAutoSubmitted.current) {
            return
        }

        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }

        if (timeLeft > 0) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0)
            }, 1000)
        } else if (timeLeft === 0 && !hasAutoSubmitted.current) {
            console.log('⏰ Time expired - auto submitting')
            hasAutoSubmitted.current = true
            handleSubmitRound()
        }

        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [timeLeft, submitting])

    const loadRoundData = async () => {
        let isMounted = true
        
        try {
            const data = await apiClient.getAssessmentRound(assessmentId!, roundNumber)
            if (isMounted) {
                console.log('📥 Round data loaded:', data)
                console.log('Round type:', data.round_type)
                setRoundData(data)
            }
        } catch (error) {
            if (isMounted) {
                console.error('Error loading round data:', error)
                toast.error(extractErrorMessage(error))
                router.push('/dashboard/student/assessment')
            }
        } finally {
            if (isMounted) {
                setLoading(false)
            }
        }
        
        return () => { isMounted = false }
    }

    const handleSubmitRound = async () => {
        if (submittingRef.current || submitting) {
            console.log('⚠️ Already submitting, skipping...')
            return
        }
        
        if (isLiveTranscribing) {
            stopLiveTranscription()
        }
        
        console.log('📤 Submitting round...')
        setSubmitting(true)
        
        try {
            const currentResponses = responsesRef.current
            const currentRoundData = roundDataRef.current
            
            if (!currentRoundData) {
                throw new Error('Round data not available')
            }

            const responseData = Object.entries(currentResponses).map(([questionId, response]) => ({
                question_id: questionId,
                response_text: response.response_text || '',
                response_audio: null,
                time_taken: response.time_taken || 0
            }))

            console.log(`Submitting ${responseData.length} responses`)

            await apiClient.submitRoundResponses(
                assessmentId!, 
                currentRoundData.round_id, 
                responseData
            )
            
            toast.success('Round submitted successfully!')
            router.push(`/dashboard/student/assessment?id=${assessmentId}`)
        } catch (error: any) {
            console.error('Error submitting round:', error)
            toast.error(extractErrorMessage(error))
            setSubmitting(false)
            hasAutoSubmitted.current = false
        }
    }

    const handleAnswerChange = (questionId: string, answer: any) => {
        setResponses(prev => ({
            ...prev,
            [questionId]: {
                ...prev[questionId],
                response_text: answer,
                time_taken: prev[questionId]?.time_taken || 0
            }
        }))
    }

    const handleSubmitWithConfirmation = () => {
        const unansweredCount = counts.notVisited + counts.notAnswered + counts.marked
        
        if (unansweredCount > 0) {
            const message = `⚠️ You have ${unansweredCount} unanswered question${unansweredCount > 1 ? 's' : ''}.\n\nUnanswered questions will be scored as 0.\n\nDo you want to submit anyway?`
            
            if (window.confirm(message)) {
                handleSubmitRound()
            }
        } else {
            // All questions answered, submit directly
            handleSubmitRound()
        }
    }
    

    const startLiveTranscription = () => {
        if (!speechRecognitionRef.current) {
            toast.error('Speech recognition not available. Use Chrome or Edge browser.')
            return
        }
        
        if (!isLiveTranscribing) {
            try {
                setLiveTranscript("")
                setInterimTranscript("")
                speechRecognitionRef.current.start()
                setIsLiveTranscribing(true)
                toast.success('🎤 Recording started - Speak now!')
            } catch (error) {
                console.error('Error starting speech recognition:', error)
                toast.error('Failed to start recording')
            }
        }
    }

    const stopLiveTranscription = () => {
        if (speechRecognitionRef.current && isLiveTranscribing) {
            try {
                speechRecognitionRef.current.stop()
            } catch (e) {
                console.log('Already stopped')
            }
            setIsLiveTranscribing(false)
            
            const fullTranscript = (liveTranscript + " " + interimTranscript).trim()
            
            if (fullTranscript) {
                const currentQ = roundData.questions[currentQuestion]
                handleAnswerChange(currentQ.id, fullTranscript)
                toast.success('✅ Response saved!')
            }
            
            // Clear transcripts after saving
            setLiveTranscript("")
            setInterimTranscript("")
        }
    }

    const playDictationAudio = (text: string) => {
        console.log('🔊 TTS called with text:', text)  // DEBUG
        console.log('Text length:', text?.length)  // DEBUG
        console.log('Text type:', typeof text)  // DEBUG
        
        if (!text || text.trim() === '') {
            console.error('❌ Empty or undefined text')
            toast.error('No text to play!')
            return
        }
        
        if (!('speechSynthesis' in window)) {
            console.error('❌ Speech synthesis not supported')
            toast.error('Text-to-speech not supported. Try Chrome or Edge.')
            return
        }
        
        console.log('✅ Speech synthesis available')
        
        // Cancel any ongoing speech first
        window.speechSynthesis.cancel()
        
        // Small delay to ensure cancellation completes
        setTimeout(() => {
            console.log('🎙️ Creating utterance...')
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = 'en-US'
            utterance.rate = 0.85  // Slower for dictation
            utterance.pitch = 1.0
            utterance.volume = 1.0
            
            // Event listeners for debugging
            utterance.onstart = () => {
                console.log('✅ Speech STARTED')
                toast.success('🔊 Audio playing...')
            }
            
            utterance.onend = () => {
                console.log('✅ Speech ENDED')
            }
            
            utterance.onerror = (event) => {
                console.error('❌ TTS Error:', event.error, event)
                toast.error(`Audio error: ${event.error}`)
            }
            
            console.log('📢 Calling speak()...')
            window.speechSynthesis.speak(utterance)
            console.log('📢 speak() called successfully')
        }, 100)
    }
    

    const handleNextQuestion = () => {
        if (currentQuestion < roundData.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
            setVisitedQuestions(prev => new Set([...Array.from(prev), currentQuestion + 1]))
            setLiveTranscript("")
            setInterimTranscript("")
        }
    }

    const navigateToQuestion = (index: number) => {
        if (isLiveTranscribing) {
            stopLiveTranscription()
        }
        
        setCurrentQuestion(index)
        setVisitedQuestions(prev => new Set([...Array.from(prev), index]))
        setLiveTranscript("")
        setInterimTranscript("")
    }

    const handleMarkForReview = () => {
        setMarkedQuestions(prev => {
            const newMarked = new Set(prev)
            if (newMarked.has(currentQuestion)) {
                newMarked.delete(currentQuestion)
            } else {
                newMarked.add(currentQuestion)
            }
            return newMarked
        })
        handleNextQuestion()
    }

    const handleClearResponse = () => {
        const currentQ = roundData.questions[currentQuestion]
        setResponses(prev => {
            const newAnswers = { ...prev }
            delete newAnswers[currentQ.id]
            return newAnswers
        })
        setLiveTranscript("")
        setInterimTranscript("")
    }

    const formatTime = (seconds: number | null) => {
        if (seconds === null) return '--:--'
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    function getQuestionStatus(index: number) {
        if (!roundData?.questions[index]) return 'notVisited'
        
        const questionId = roundData.questions[index].id
        const isAnswered = responses[questionId]?.response_text !== undefined
        const isMarked = markedQuestions.has(index)
        const isVisited = visitedQuestions.has(index)

        if (isAnswered && !isMarked) {
            return 'answered'
        } else if (isMarked) {
            return 'marked'
        } else if (isVisited) {
            return 'notAnswered'
        } else {
            return 'notVisited'
        }
    }

    function getCounts() {
        let answered = 0
        let notAnswered = 0
        let marked = 0
        let notVisited = 0

        if (roundData?.questions) {
            roundData.questions.forEach((_: any, index: number) => {
                const status = getQuestionStatus(index)
                if (status === 'answered') answered++
                else if (status === 'marked') marked++
                else if (status === 'notAnswered') notAnswered++
                else notVisited++
            })
        }

        return { answered, notAnswered, marked, notVisited }
    }

    if (loading) {
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <div className="flex justify-center items-center min-h-screen">
                    <div className="text-center">
                        <Loader size="lg" />
                        <p className="mt-4 text-gray-600">Loading assessment...</p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    if (isGroupDiscussionRound) {
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <GroupDiscussionRound
                    roundId={roundData?.round_id || roundData?.id}
                    onComplete={async (responses) => {
                        try {
                            setSubmitting(true);
                            await apiClient.submitRoundResponses(
                                assessmentId!,
                                roundData.round_id || roundData.id,
                                responses.map(response => ({
                                    response_text: response.response_text,
                                    time_taken: response.time_taken || 0,
                                    score: response.score || 0
                                }))
                            );
                            toast.success('Discussion round completed successfully!');
                            router.push(`/dashboard/student/assessment?id=${assessmentId}`);
                        } catch (error) {
                            console.error('Error submitting discussion responses:', error);
                            toast.error('Failed to submit discussion responses');
                            setSubmitting(false);
                        }
                    }}
                />
            </DashboardLayout>
        );
    }

    if (!roundData || (!isGroupDiscussionRound && (!roundData.questions || roundData.questions.length === 0))) {
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">No Questions Available</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This round doesn't have any questions yet.
                    </p>
                    <Button onClick={() => router.push(`/dashboard/student/assessment?id=${assessmentId}`)}>
                        Back to Assessment
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    // ========== CHAT INTERFACE FOR INTERVIEW ROUNDS ==========
    if (isVoiceRound) {
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <div className="h-[calc(100vh-64px)] flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
                        <div className="flex justify-between items-center max-w-7xl mx-auto">
                            <div>
                                <h1 className="text-2xl font-bold">
                                    {roundNumber === 4 ? '💻 Technical Interview' : '👔 HR Interview'}
                                </h1>
                                <p className="text-sm text-blue-100 mt-1">
                                    Question {currentQuestion + 1} of {roundData?.questions?.length || 0}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-semibold">
                                    ⏱️ {formatTime(timeLeft)}
                                </div>
                                {timeLeft !== null && timeLeft <= 60 && timeLeft > 0 && (
                                    <span className="text-yellow-300 font-bold animate-pulse text-sm">
                                        Last minute!
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        <div className="max-w-4xl mx-auto space-y-6">
                            {/* Current Question */}
                            {currentQ && (
                                <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-blue-500">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                            AI
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500 mb-2">Interviewer</p>
                                            <p className="text-gray-800 text-lg leading-relaxed">
                                                {currentQ.question_text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Student's Response */}
                            {responses[currentQ?.id]?.response_text && (
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-md p-6 border-l-4 border-green-500">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                                            You
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-500 mb-2">Your Answer</p>
                                            <p className="text-gray-800 leading-relaxed">
                                                {responses[currentQ.id].response_text}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Live Transcription */}
                            {isLiveTranscribing && (liveTranscript || interimTranscript) && (
                                <div className="bg-blue-50 rounded-2xl shadow-md p-6 border-2 border-blue-300 border-dashed">
                                    <div className="flex items-start gap-4">
                                        <Mic className="h-6 w-6 text-blue-600 animate-pulse" />
                                        <div className="flex-1">
                                            <p className="text-sm text-blue-600 font-semibold mb-2">Speaking... (Live)</p>
                                            <p className="text-gray-800">
                                                {liveTranscript}
                                                {interimTranscript && (
                                                    <span className="text-gray-500 italic"> {interimTranscript}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={chatEndRef} />
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="bg-white border-t shadow-lg p-4">
                        <div className="max-w-4xl mx-auto space-y-4">
                            {/* Recording Controls */}
                            <div className="flex gap-3">
                                {!isLiveTranscribing ? (
                                    <button
                                        onClick={startLiveTranscription}
                                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all flex items-center justify-center gap-3"
                                    >
                                        <Mic className="h-6 w-6" />
                                        <span>Start Speaking</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={stopLiveTranscription}
                                        className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all animate-pulse flex items-center justify-center gap-3"
                                    >
                                        <Square className="h-6 w-6" />
                                        <span>Stop & Save Answer</span>
                                    </button>
                                )}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        if (currentQuestion < roundData.questions.length - 1) {
                                            navigateToQuestion(currentQuestion + 1)
                                        }
                                    }}
                                    disabled={currentQuestion >= roundData.questions.length - 1}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 text-gray-800 px-6 py-3 rounded-xl font-medium transition-all"
                                >
                                    Next Question →
                                </button>

                                <button
                                    onClick={handleSubmitWithConfirmation}
                                    disabled={submitting}
                                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg"
                                >
                                    {submitting ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader size="sm" />
                                            <span>Submitting...</span>
                                        </div>
                                    ) : (
                                        <span>✓ Submit Interview</span>
                                    )}
                                </button>
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>Progress: {currentQuestion + 1} / {roundData?.questions?.length || 0}</span>
                                {counts.notVisited + counts.notAnswered + counts.marked > 0 && (
                                    <span className="text-orange-600">
                                        ⚠️ {counts.notVisited + counts.notAnswered + counts.marked} unanswered
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        )
    }


    // ========== UPDATED MCQ INTERFACE WITH NEW QUESTION TYPES ==========
    return (
        <div className="min-h-screen bg-gray-100 select-none">
            {/* Header */}
            <div className="bg-green-600 text-white p-4">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <h1 className="text-xl font-semibold">
                        Round {roundNumber}: {roundNames[roundNumber as keyof typeof roundNames]}
                    </h1>
                    <div className="flex items-center space-x-6">
                        <div className="text-right">
                            <div className="text-sm">
                                Time Left: {formatTime(timeLeft)}
                                {timeLeft !== null && timeLeft <= 60 && timeLeft > 0 && (
                                    <span className="ml-2 text-yellow-300 font-bold animate-pulse">
                                        ⚠️ Last minute!
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto flex">
                {/* Left Sidebar */}
                <div className="w-48 bg-white border-r min-h-screen">
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Sections</h3>
                        <div className="bg-green-600 text-white px-3 py-1 text-sm rounded">
                            {roundData.round_type?.replace('_', ' ').toUpperCase() || 'Assessment'}
                        </div>
                    </div>
                </div>

                {/* Main Content - Question Display with All Types */}
                <div className="flex-1 bg-white p-6">
                    <div className="max-w-4xl">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-4">
                                Question No {currentQuestion + 1}
                            </h2>

                            <div className="bg-gray-50 p-4 border rounded mb-6">
                                {/* Hide question text for DICTATION - it's the answer! */}
                                {currentQ.question_type !== 'dictation' ? (
                                    <p className="font-medium text-gray-800 mb-4 select-none" onCopy={(e) => e.preventDefault()}>
                                        {currentQ.question_text}
                                    </p>
                                ) : (
                                    <p className="font-medium text-gray-800 mb-4 select-none">
                                        🎧 Listening Exercise - Type What You Hear
                                    </p>
                                )}

                                {/* ========== MCQ QUESTIONS ========== */}
                                {String(currentQ.question_type || '').toLowerCase() === 'mcq' && (
                                    (() => {
                                        const mcqOptions = normalizeMcqOptions(currentQ)
                                        if (!mcqOptions || mcqOptions.length === 0) {
                                            return <div className="text-sm text-gray-500">No options available for this question.</div>
                                        }
                                        return (
                                            <div className="space-y-2">
                                                {mcqOptions.map((option: any, index: number) => {
                                                    const optionLetter = String.fromCharCode(65 + index)
                                                    const optionText = typeof option === 'string' 
                                                        ? option 
                                                        : (option?.text ?? option?.label ?? JSON.stringify(option))
                                                    return (
                                                        <label 
                                                            key={index}
                                                            className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${currentQ.id}`}
                                                                value={optionLetter}
                                                                checked={responses[currentQ.id]?.response_text === optionLetter}
                                                                onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                                                className="w-4 h-4 text-blue-600"
                                                            />
                                                            <span className="flex-1 select-none text-gray-800" onCopy={(e) => e.preventDefault()}>
                                                                {optionLetter}) {optionText}
                                                            </span>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        )
                                    })()
                                )}

                                {/* ========== TEXT QUESTION - Short Writing ========== */}
                                {currentQ.question_type === 'text' && (
                                    <div className="space-y-3">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <p className="text-sm text-blue-800 flex items-center gap-2">
                                                <Edit3 className="h-4 w-4" />
                                                Write your answer below (2-3 sentences):
                                            </p>
                                        </div>
                                        <textarea
                                            className="w-full h-32 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Type your answer here..."
                                            value={responses[currentQ.id]?.response_text || ''}
                                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500">
                                            Word count: {(responses[currentQ.id]?.response_text || '').split(/\s+/).filter(Boolean).length} words
                                        </p>
                                    </div>
                                )}

                                {/* ========== DICTATION QUESTION - Listen and Type ========== */}
                                {currentQ.question_type === 'dictation' && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <p className="text-sm text-blue-800 mb-3 flex items-center gap-2">
                                                🎧 Click the button below to hear a sentence. Listen carefully and type exactly what you hear.
                                            </p>
                                            <p className="text-xs text-blue-700 mb-3">
                                                You can play the audio multiple times. Type every word correctly, including punctuation.
                                            </p>
                                            
                                            
                                            
                                            <button
                                                onClick={() => {
                                                    // Use question_text (the sentence) for TTS
                                                    const textToSpeak = currentQ.question_text || currentQ.correct_answer
                                                    console.log('Playing dictation:', textToSpeak)
                                                    playDictationAudio(textToSpeak)
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                                            >
                                                <Volume2 className="h-5 w-5" />
                                                <span>Play Audio</span>
                                            </button>
                                        </div>
                                        
                                        <textarea
                                            className="w-full h-24 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                                            placeholder="Type the sentence you heard here..."
                                            value={responses[currentQ.id]?.response_text || ''}
                                            onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                        />
                                        
                                        {responses[currentQ.id]?.response_text && (
                                            <p className="text-xs text-gray-500">
                                                Characters typed: {responses[currentQ.id].response_text.length}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* ========== VOICE_READING QUESTION - Read Aloud ========== */}
                                {currentQ.question_type === 'voice_reading' && (
                                    <div className="space-y-4">
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <p className="text-sm text-purple-800 mb-3">
                                                📖 Read the text above aloud clearly. Click "Start Recording" when ready.
                                            </p>
                                        </div>
                                        
                                        {!isLiveTranscribing ? (
                                            <button
                                                onClick={startLiveTranscription}
                                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-4 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-3"
                                            >
                                                <Mic className="h-5 w-5" />
                                                <span>Start Recording</span>
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                <button
                                                    onClick={stopLiveTranscription}
                                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-lg font-medium transition-all shadow-md animate-pulse flex items-center justify-center gap-3"
                                                >
                                                    <Square className="h-5 w-5" />
                                                    <span>Stop Recording</span>
                                                </button>
                                                
                                                {/* Live Transcription Display */}
                                                <div className="bg-gray-50 border rounded-lg p-4 min-h-[60px]">
                                                    <p className="text-sm text-gray-600 mb-2">Recording... (Live transcription):</p>
                                                    <p className="text-gray-800">
                                                        {liveTranscript}
                                                        {interimTranscript && (
                                                            <span className="text-gray-500 italic"> {interimTranscript}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {responses[currentQ.id]?.response_text && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <p className="text-sm text-green-800 mb-2 flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Your recorded response:
                                                </p>
                                                <p className="text-gray-800">{responses[currentQ.id].response_text}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ========== VOICE_SPEAKING QUESTION - Spontaneous Speech ========== */}
                                {currentQ.question_type === 'voice_speaking' && (
                                    <div className="space-y-4">
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                            <p className="text-sm text-orange-800 mb-2">
                                                🎤 Speak for 45-60 seconds on the topic above. Click "Start Speaking" when ready.
                                            </p>
                                            <p className="text-xs text-orange-700">
                                                Tip: Organize your thoughts, speak clearly, and use relevant examples.
                                            </p>
                                        </div>
                                        
                                        {!isLiveTranscribing ? (
                                            <button
                                                onClick={startLiveTranscription}
                                                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-lg font-medium transition-all shadow-md flex items-center justify-center gap-3"
                                            >
                                                <Mic className="h-5 w-5" />
                                                <span>Start Speaking</span>
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                <button
                                                    onClick={stopLiveTranscription}
                                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-lg font-medium transition-all shadow-md animate-pulse flex items-center justify-center gap-3"
                                                >
                                                    <Square className="h-5 w-5" />
                                                    <span>Stop & Save</span>
                                                </button>
                                                
                                                {/* Live Transcription Display */}
                                                <div className="bg-gray-50 border rounded-lg p-4 min-h-[100px]">
                                                    <p className="text-sm text-gray-600 mb-2">Speaking... (Live transcription):</p>
                                                    <p className="text-gray-800">
                                                        {liveTranscript}
                                                        {interimTranscript && (
                                                            <span className="text-gray-500 italic"> {interimTranscript}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {responses[currentQ.id]?.response_text && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <p className="text-sm text-green-800 mb-2 flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                    Your recorded response:
                                                </p>
                                                <p className="text-gray-800">{responses[currentQ.id].response_text}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handleMarkForReview}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded border"
                            >
                                Mark for Review & Next
                            </button>

                            <button
                                onClick={handleClearResponse}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded border"
                            >
                                Clear Response
                            </button>

                            <button
                                onClick={() => {
                                    if (currentQuestion < roundData.questions.length - 1) {
                                        navigateToQuestion(currentQuestion + 1)
                                    }
                                }}
                                disabled={currentQuestion >= roundData.questions.length - 1}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded"
                            >
                                Save & Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Question Palette (Keep existing code with optional icon additions) */}
                <div className="w-80 bg-white border-l p-4">
                    <div className="mb-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-medium">👤</span>
                            </div>
                            <span className="text-sm text-gray-600">Test Profile</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 mb-3">Legend</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-7 h-7 bg-green-600 text-white rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {counts.answered}
                                </div>
                                <span className="text-gray-700 font-medium">Answered</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-7 h-7 bg-red-600 text-white rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {counts.notAnswered}
                                </div>
                                <span className="text-gray-700 font-medium">Not Answered</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-7 h-7 bg-purple-600 text-white rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {counts.marked}
                                </div>
                                <span className="text-gray-700 font-medium">Marked</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-7 h-7 bg-gray-400 text-white rounded flex items-center justify-center text-xs font-medium flex-shrink-0">
                                    {counts.notVisited}
                                </div>
                                <span className="text-gray-700 font-medium">Not Visited</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-4">Question Palette:</p>

                        <div className="grid grid-cols-5 gap-2">
                            {roundData.questions.map((_: any, index: number) => {
                                const status = getQuestionStatus(index)
                                const isCurrent = index === currentQuestion
                                const questionType = roundData.questions[index].question_type

                                let bgColor = ''
                                if (isCurrent) {
                                    bgColor = 'bg-blue-600 text-white border-2 border-blue-800'
                                } else if (status === 'answered') {
                                    bgColor = 'bg-green-600 text-white'
                                } else if (status === 'marked') {
                                    bgColor = 'bg-purple-600 text-white'
                                } else if (status === 'notAnswered') {
                                    bgColor = 'bg-red-600 text-white'
                                } else {
                                    bgColor = 'bg-gray-300 text-gray-700'
                                }

                                return (
                                    <button
                                        key={index}
                                        onClick={() => navigateToQuestion(index)}
                                        className={`w-8 h-8 text-xs font-medium rounded relative ${bgColor}`}
                                        title={`Q${index + 1} - ${questionType}`}
                                    >
                                        {index + 1}
                                        {/* Optional: Add type indicator icons */}
                                        {questionType === 'text' && (
                                            <span className="absolute -top-1 -right-1 text-[8px]">✍️</span>
                                        )}
                                        {questionType === 'dictation' && (
                                            <span className="absolute -top-1 -right-1 text-[8px]">🎧</span>
                                        )}
                                        {questionType === 'voice_reading' && (
                                            <span className="absolute -top-1 -right-1 text-[8px]">📖</span>
                                        )}
                                        {questionType === 'voice_speaking' && (
                                            <span className="absolute -top-1 -right-1 text-[8px]">🎤</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={handleSubmitWithConfirmation}  // ✅ Use new handler
                            disabled={submitting}
                            className={`w-full py-2 px-4 rounded text-sm font-medium transition-all ${
                                !submitting
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title="Submit the test"
                        >
                            {submitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <Loader size="sm" />
                                    <span>Submitting...</span>
                                </div>
                            ) : (
                                'Submit Section'
                            )}
                        </button>
                        
                        {/* Show warning if there are unanswered questions */}
                        {counts.notVisited + counts.notAnswered + counts.marked > 0 && (
                            <p className="text-xs text-orange-600 text-center">
                                ⚠️ {counts.notVisited + counts.notAnswered + counts.marked} question(s) unanswered
                            </p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
