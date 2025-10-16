"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { 
    Home, User, FileText, Briefcase, ClipboardList,
    Mic, Square, Send, Clock, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'

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
    3: "Technical MCQ",
    4: "Technical Interview",
    5: "HR Interview"
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

    const isVoiceRound = roundData?.round_type === 'technical_interview' || roundData?.round_type === 'hr_interview'
    const currentQ = roundData?.questions?.[currentQuestion]
    const counts = roundData ? getCounts() : { answered: 0, notAnswered: 0, marked: 0, notVisited: 0 }
    const canSubmit = roundData ? allQuestionsAnswered() : false
    
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
                toast.error('Live transcription not supported. Please use Chrome or Edge.')
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
                toast.success('🎤 Live transcription started - Speak now!')
            } catch (error) {
                console.error('Error starting speech recognition:', error)
                toast.error('Failed to start transcription')
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
        }
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

    function allQuestionsAnswered() {
        if (!roundData?.questions) return false
        return roundData.questions.every((question: any) => responses[question.id]?.response_text !== undefined)
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

    if (!roundData || !roundData.questions || roundData.questions.length === 0) {
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
            <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Header - WhatsApp Style */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 shadow-lg">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold">
                                    {roundNames[roundNumber as keyof typeof roundNames]}
                                </h1>
                                <p className="text-sm text-green-100">
                                    Question {currentQuestion + 1} of {roundData.questions.length}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                                <Clock className="h-4 w-4" />
                                <span className="font-mono text-sm">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Container - WhatsApp/ChatGPT Style */}
                <div className="flex-1 overflow-hidden flex flex-col max-w-6xl mx-auto w-full">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23f3f4f6\'/%3E%3Cpath d=\'M20 20c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm40 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z\' fill=\'%23e5e7eb\'/%3E%3C/svg%3E")',
                        backgroundSize: '100px 100px'
                    }}>
                        {/* Interviewer Question - Left Side */}
                        <div className="flex justify-start">
                            <div className="max-w-[70%] bg-white rounded-2xl rounded-tl-sm p-4 shadow-md">
                                <p className="text-sm text-gray-600 mb-2 font-medium">Interviewer</p>
                                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                    {currentQ.question_text}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>

                        {/* Student Response - Right Side */}
                        {(liveTranscript || interimTranscript || responses[currentQ.id]?.response_text) && (
                            <div className="flex justify-end">
                                <div className="max-w-[70%] bg-gradient-to-br from-green-500 to-green-600 rounded-2xl rounded-tr-sm p-4 shadow-md">
                                    <p className="text-sm text-green-100 mb-2 font-medium">Your Answer</p>
                                    <p className="text-white leading-relaxed whitespace-pre-wrap">
                                        {responses[currentQ.id]?.response_text || liveTranscript}
                                        {interimTranscript && (
                                            <span className="text-green-100 italic"> {interimTranscript}</span>
                                        )}
                                    </p>
                                    <div className="flex items-center justify-end gap-2 mt-2">
                                        <p className="text-xs text-green-100">
                                            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        {responses[currentQ.id]?.response_text && (
                                            <CheckCircle2 className="h-4 w-4 text-green-100" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recording Indicator */}
                        {isLiveTranscribing && !liveTranscript && !interimTranscript && (
                            <div className="flex justify-center">
                                <div className="bg-red-50 border border-red-200 rounded-full px-6 py-3 flex items-center gap-3">
                                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                                    <span className="text-red-700 text-sm font-medium">Listening... Speak clearly</span>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Area - WhatsApp Style */}
                    <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
                        <div className="max-w-4xl mx-auto">
                            {!isLiveTranscribing ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={startLiveTranscription}
                                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-full font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-3"
                                    >
                                        <Mic className="h-5 w-5" />
                                        <span>Start Speaking</span>
                                    </button>
                                    {responses[currentQ.id]?.response_text && (
                                        <button
                                            onClick={handleClearResponse}
                                            className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={stopLiveTranscription}
                                        className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-full font-medium transition-all shadow-md animate-pulse flex items-center justify-center gap-3"
                                    >
                                        <Square className="h-5 w-5" />
                                        <span>Stop & Save</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            setLiveTranscript("")
                                            setInterimTranscript("")
                                        }}
                                        className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full font-medium transition-all"
                                    >
                                        Clear
                                    </button>
                                </div>
                            )}
                            
                            {/* Navigation Buttons */}
                            <div className="flex items-center gap-3 mt-4">
                                {currentQuestion < roundData.questions.length - 1 && (
                                    <button
                                        onClick={handleNextQuestion}
                                        disabled={!responses[currentQ.id]?.response_text}
                                        className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>Next Question</span>
                                        <Send className="h-4 w-4" />
                                    </button>
                                )}
                                {currentQuestion === roundData.questions.length - 1 && allQuestionsAnswered() && (
                                    <button
                                        onClick={handleSubmitRound}
                                        disabled={submitting}
                                        className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-full font-medium transition-all shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader size="sm" />
                                                <span>Submitting...</span>
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-5 w-5" />
                                                <span>Submit Interview</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // ========== STANDARD MCQ INTERFACE (EXISTING CODE) ==========
    return (
        <div className="min-h-screen bg-gray-100 select-none">
            {/* Your existing MCQ interface code goes here - keep everything as is */}
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

                {/* Main Content - MCQ Interface */}
                <div className="flex-1 bg-white p-6">
                    <div className="max-w-4xl">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold mb-4">
                                Question No {currentQuestion + 1}
                            </h2>

                            <div className="bg-gray-50 p-4 border rounded mb-6">
                                <p className="font-medium text-gray-800 mb-4 select-none" onCopy={(e) => e.preventDefault()}>
                                    {currentQ.question_text}
                                </p>

                                {/* MCQ Options */}
                                {currentQ.question_type === 'mcq' && currentQ.options && Array.isArray(currentQ.options) && (
                                    <div className="space-y-2">
                                        {currentQ.options.map((option: any, index: number) => {
                                            const optionLetter = String.fromCharCode(65 + index)
                                            const optionText = typeof option === 'string' ? option : JSON.stringify(option)
                                            
                                            return (
                                                <label 
                                                    key={index}
                                                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`question-${currentQ.id}`}
                                                        value={optionLetter}
                                                        checked={responses[currentQ.id]?.response_text === optionLetter}
                                                        onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                                        className="w-4 h-4 text-blue-600"
                                                    />
                                                    <span className="flex-1 select-none" onCopy={(e) => e.preventDefault()}>
                                                        {optionLetter}) {optionText}
                                                    </span>
                                                </label>
                                            )
                                        })}
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

                {/* Right Sidebar - Question Palette */}
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
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-green-600 text-white rounded flex items-center justify-center text-xs font-medium">
                                    {counts.answered}
                                </div>
                                <span>Answered</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-red-600 text-white rounded flex items-center justify-center text-xs font-medium">
                                    {counts.notAnswered}
                                </div>
                                <span>Not Answered</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center text-xs font-medium">
                                    {counts.marked}
                                </div>
                                <span>Marked</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gray-300 text-gray-700 rounded flex items-center justify-center text-xs font-medium">
                                    {counts.notVisited}
                                </div>
                                <span>Not Visited</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-4">Question Palette:</p>

                        <div className="grid grid-cols-5 gap-2">
                            {roundData.questions.map((_: any, index: number) => {
                                const status = getQuestionStatus(index)
                                const isCurrent = index === currentQuestion

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
                                        className={`w-8 h-8 text-xs font-medium rounded ${bgColor}`}
                                    >
                                        {index + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <button
                            onClick={handleSubmitRound}
                            disabled={!canSubmit || submitting}
                            className={`w-full py-2 px-4 rounded text-sm font-medium transition-all ${
                                canSubmit && !submitting
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            title={!canSubmit ? 'Please answer all questions before submitting' : 'Submit the test'}
                        >
                            {submitting ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <Loader size="sm" />
                                    <span>Submitting...</span>
                                </div>
                            ) : canSubmit ? (
                                'Submit Section'
                            ) : (
                                `${counts.notVisited + counts.notAnswered + counts.marked} Questions Remaining`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
