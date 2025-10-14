"use client"

import { useEffect, useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api'
import { 
    Home, 
    User, 
    FileText, 
    Briefcase, 
    ClipboardList,
    Clock,
    CheckCircle,
    Mic,
    Square
} from 'lucide-react'
import toast from 'react-hot-toast'

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
    5: "HR Interview",
    6: "Final Evaluation"
}

export default function AssessmentRoundPage() {
    const [roundData, setRoundData] = useState<any>(null)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [responses, setResponses] = useState<Record<string, any>>({})
    const [visitedQuestions, setVisitedQuestions] = useState<Set<number>>(new Set([0]))
    const [markedQuestions, setMarkedQuestions] = useState<Set<number>>(new Set())
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [timeLeft, setTimeLeft] = useState<number | null>(null)  // ✅ Changed to null
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [transcript, setTranscript] = useState("")
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const assessmentId = searchParams.get('assessment_id')
    const roundNumber = parseInt(searchParams.get('round') || '1')
    
    // Use refs to avoid stale closures
    const responsesRef = useRef(responses)
    const roundDataRef = useRef(roundData)
    const submittingRef = useRef(submitting)
    const timerRef = useRef<NodeJS.Timeout | null>(null)  // ✅ Added timer ref
    const hasAutoSubmitted = useRef(false)  // ✅ Added auto-submit guard

    // Update refs when state changes
    useEffect(() => {
        responsesRef.current = responses
    }, [responses])

    useEffect(() => {
        roundDataRef.current = roundData
    }, [roundData])

    useEffect(() => {
        submittingRef.current = submitting
    }, [submitting])

    // Cleanup effect for media recorder
    useEffect(() => {
        return () => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop()
                mediaRecorder.stream.getTracks().forEach(track => track.stop())
            }
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl)
            }
            if (timerRef.current) {
                clearTimeout(timerRef.current)
            }
        }
    }, [mediaRecorder, audioUrl])

    // Load round data
    useEffect(() => {
        if (!assessmentId) {
            toast.error('Assessment ID is required')
            router.push('/dashboard/student/assessment')
            return
        }
        loadRoundData()
    }, [assessmentId, roundNumber])

    // Initialize timer ONCE when round data loads - ✅ FIXED
    useEffect(() => {
        if (roundData && roundData.time_limit && timeLeft === null) {
            const initialTime = roundData.time_limit * 60
            console.log(`⏰ Timer initialized: ${initialTime} seconds (${roundData.time_limit} minutes)`)
            setTimeLeft(initialTime)
        }
    }, [roundData, timeLeft])

    // Timer countdown - ✅ FIXED VERSION
    useEffect(() => {
        // Don't start timer until timeLeft is initialized
        if (timeLeft === null || submitting || hasAutoSubmitted.current) {
            return
        }

        // Clear any existing timer
        if (timerRef.current) {
            clearTimeout(timerRef.current)
        }

        if (timeLeft > 0) {
            // Count down
            timerRef.current = setTimeout(() => {
                setTimeLeft(prev => (prev !== null && prev > 0) ? prev - 1 : 0)
            }, 1000)
        } else if (timeLeft === 0 && !hasAutoSubmitted.current) {
            // Time's up - auto submit
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

    // Submit handler - ✅ FIXED with better guards
    const handleSubmitRound = async () => {
        if (submittingRef.current || submitting) {
            console.log('⚠️ Already submitting, skipping...')
            return
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
                response_audio: response.response_audio || null,
                time_taken: response.time_taken || 0
            }))

            console.log(`Submitting ${responseData.length} responses out of ${currentRoundData.questions.length} questions`)

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
            hasAutoSubmitted.current = false  // ✅ Reset on error
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

    const navigateToQuestion = (index: number) => {
        setCurrentQuestion(index)
        setVisitedQuestions(prev => new Set([...prev, index]))
    }

    const handleNext = () => {
        if (currentQuestion < roundData.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
            setVisitedQuestions(prev => new Set([...prev, currentQuestion + 1]))
        }
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
        handleNext()
    }

    const handleClearResponse = () => {
        const currentQ = roundData.questions[currentQuestion]
        setResponses(prev => {
            const newAnswers = { ...prev }
            delete newAnswers[currentQ.id]
            return newAnswers
        })
        setAudioUrl(null)
        setAudioChunks([])
        setTranscript("")
    }

    const startRecording = async () => {
        if (isRecording) {
            stopRecording()
            return
        }
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            const chunks: Blob[] = []

            recorder.ondataavailable = (event) => {
                chunks.push(event.data)
            }

            recorder.onstop = () => {
                const audioBlob = new Blob(chunks, { type: 'audio/wav' })
                const url = URL.createObjectURL(audioBlob)
                setAudioUrl(url)
                setAudioChunks(chunks)
            }

            recorder.start()
            setMediaRecorder(recorder)
            setIsRecording(true)
            toast.success('Recording started. Click again to stop.')
        } catch (error) {
            console.error('Error starting recording:', error)
            toast.error('Failed to start recording. Please check microphone permissions.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop()
            mediaRecorder.stream.getTracks().forEach(track => track.stop())
            setIsRecording(false)
            toast.success('Recording stopped')
        }
    }

    const submitVoiceResponse = async () => {
        const currentQ = roundData.questions[currentQuestion]
        
        if (!audioChunks.length) {
            toast.error('Please record your response first')
            return
        }

        try {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
            const formData = new FormData()
            formData.append('audio_file', audioBlob, 'response.wav')
            formData.append('question_id', currentQ.id)

            const data = await apiClient.submitVoiceResponse(assessmentId!, roundData.round_id, formData)
            
            setResponses(prev => ({
                ...prev,
                [currentQ.id]: {
                    ...prev[currentQ.id],
                    response_text: data.transcript,
                    response_audio: data.audio_path,
                    submitted: true
                }
            }))

            setTranscript(data.transcript)
            toast.success('Voice response submitted successfully!')
        } catch (error: any) {
            console.error('Error submitting voice response:', error)
            toast.error(extractErrorMessage(error))
        }
    }

    // ✅ FIXED - Handle null timeLeft
    const formatTime = (seconds: number | null) => {
        if (seconds === null) return '--:--'
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getQuestionStatus = (index: number) => {
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

    const getCounts = () => {
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

    const allQuestionsAnswered = () => {
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

    const currentQ = roundData.questions[currentQuestion]
    const counts = getCounts()
    const canSubmit = allQuestionsAnswered()
    const isVoiceRound = roundData.round_type === 'technical_interview' || roundData.round_type === 'hr_interview'

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
                                {/* ✅ Added warning for last minute */}
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
                {/* Left Sidebar - Sections */}
                <div className="w-48 bg-white border-r min-h-screen">
                    <div className="p-4">
                        <h3 className="font-semibold text-gray-800 mb-2">Sections</h3>
                        <div className="bg-green-600 text-white px-3 py-1 text-sm rounded">
                            {roundData.round_type?.replace('_', ' ').toUpperCase() || 'Assessment'}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
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
                                        {currentQ.options.map((option: any, index: number) => (
                                            <label 
                                                key={index}
                                                className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <input
                                                    type="radio"
                                                    name={`question-${currentQ.id}`}
                                                    value={typeof option === 'string' ? option : JSON.stringify(option)}
                                                    checked={responses[currentQ.id]?.response_text === (typeof option === 'string' ? option : JSON.stringify(option))}
                                                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                                                    className="w-4 h-4 text-blue-600"
                                                />
                                                <span className="flex-1 select-none" onCopy={(e) => e.preventDefault()}>
                                                    {String.fromCharCode(97 + index)}) {typeof option === 'string' ? option : JSON.stringify(option)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {/* Voice Response */}
                                {isVoiceRound && (
                                    <div className="space-y-4">
                                        <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                            {audioUrl ? (
                                                <div className="space-y-3">
                                                    <audio controls src={audioUrl} className="w-full" />
                                                    <div className="flex gap-2 justify-center">
                                                        <button 
                                                            onClick={() => {
                                                                setAudioUrl(null)
                                                                setAudioChunks([])
                                                            }}
                                                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded border"
                                                        >
                                                            Record Again
                                                        </button>
                                                        <button 
                                                            onClick={submitVoiceResponse}
                                                            disabled={submitting}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:bg-gray-400"
                                                        >
                                                            {submitting ? <Loader size="sm" /> : 'Submit Response'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="text-gray-500">
                                                        {isRecording ? 'Recording... Click to stop' : 'Click to record your response'}
                                                    </div>
                                                    <button
                                                        onClick={isRecording ? stopRecording : startRecording}
                                                        className={`rounded-full w-16 h-16 flex items-center justify-center ${
                                                            isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-green-600 hover:bg-green-700'
                                                        } text-white`}
                                                    >
                                                        {isRecording ? (
                                                            <Square className="h-6 w-6" />
                                                        ) : (
                                                            <Mic className="h-6 w-6" />
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {transcript && (
                                            <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                                <p className="text-sm text-green-700 dark:text-green-300">
                                                    <strong>Transcribed Response:</strong> {transcript}
                                                </p>
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
                                onClick={handleNext}
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
                                        {responses[roundData.questions[index].id]?.submitted && (
                                            <CheckCircle className="h-3 w-3 ml-1 inline" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* ✅ IMPROVED Submit button */}
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
