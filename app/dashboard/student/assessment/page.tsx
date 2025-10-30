"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { 
    Home, User, FileText, Briefcase, 
    Brain, Mic, CheckCircle, Clock, Target, MessageCircle, AlertCircle, TrendingUp,
    Play, ArrowRight, BarChart3, Award, Calendar
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
    { name: 'Analytics', href: '/dashboard/student/analytics', icon: BarChart3 },
]

// Round display information
const roundDisplay: Record<string, { name: string; description: string; duration: string; icon: any; color: string }> = {
    aptitude: {
        name: "Aptitude Test",
        description: "Quantitative, Reasoning, English",
        duration: "30 min",
        icon: Brain,
        color: "bg-blue-500",
    },
    soft_skills: {
        name: "Soft Skills",
        description: "Communication, Leadership, Teamwork",
        duration: "20 min",
        icon: User,
        color: "bg-green-500",
    },
    group_discussion: {
        name: "Group Discussion",
        description: "Interactive discussion with AI moderator",
        duration: "25 min",
        icon: MessageCircle,
        color: "bg-violet-500",
    },
    technical_mcq: {
        name: "Technical MCQ",
        description: "Domain-specific questions",
        duration: "30 min",
        icon: Target,
        color: "bg-purple-500",
    },
    coding: {
        name: "Coding Challenge",
        description: "Solve programming tasks with tests",
        duration: "60 min",
        icon: Target,
        color: "bg-emerald-600",
    },
    technical_interview: {
        name: "Technical Interview",
        description: "Voice-based technical discussion",
        duration: "20 min",
        icon: Mic,
        color: "bg-orange-500",
    },
    hr_interview: {
        name: "HR Interview",
        description: "Behavioral and cultural fit",
        duration: "15 min",
        icon: Target,
        color: "bg-pink-500",
    },
}

export default function AssessmentPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const assessmentId = searchParams?.get('id')
<<<<<<< HEAD

    const [assessment, setAssessment] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
=======
>>>>>>> a8ae9dd1c0c81d163d0f38c52266b2d296b0fcf6

    useEffect(() => {
        if (!assessmentId) {
            // If no assessment ID, redirect to Job Recommendations
            router.replace('/dashboard/student/jobs')
                return
            }
            
        fetchAssessment()
    }, [assessmentId])

    // Refresh data when page becomes visible (e.g., when navigating back from round)
    useEffect(() => {
        const handleFocus = () => {
            if (assessmentId) {
                fetchAssessment()
            }
        }
        
        window.addEventListener('focus', handleFocus)
        
        return () => {
            window.removeEventListener('focus', handleFocus)
        }
    }, [assessmentId])

    const fetchAssessment = async () => {
        try {
            setLoading(true)
            const data = await apiClient.getAssessmentStatus(assessmentId!)
            console.log('📊 Assessment data received:', data)
            console.log('📊 Rounds data:', data.rounds)
            setAssessment(data)
        } catch (err: any) {
            console.error('Error fetching assessment:', err)
            setError(err.message || 'Failed to load assessment')
            toast.error('Failed to load assessment')
        } finally {
            setLoading(false)
        }
    }

    const handleStartRound = (roundNumber: number) => {
        router.push(`/dashboard/student/assessment/round?assessment_id=${assessmentId}&round=${roundNumber}`)
    }

    const getRoundStatus = (round: any): 'completed' | 'in_progress' | 'not_started' => {
        console.log('🔍 Checking round status:', round.round_type, 'status:', round.status)
        const status = String(round.status).toLowerCase()
        if (status === 'completed') return 'completed'
        if (status === 'in_progress') return 'in_progress'
        return 'not_started'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800 border-green-200'
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
            default: return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4" />
            case 'in_progress': return <Clock className="w-4 h-4" />
            default: return <Play className="w-4 h-4" />
        }
    }

    if (loading) {
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <div className="flex justify-center py-12">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        )
    }

    if (error || !assessment) {
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <div className="text-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-4">Assessment Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {error || 'The requested assessment could not be found.'}
                    </p>
                    <Button onClick={() => router.push('/dashboard/student/jobs')}>
                        Back to Job Recommendations
                    </Button>
                </div>
            </DashboardLayout>
        )
    }
        
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold">Assessment Overview</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {assessment.job_role?.title || 'Assessment'} - {assessment.job_role?.category || 'General'}
                        </p>
                                        </div>
                    <div className="text-right">
                        <Badge variant="outline" className="mb-2">
                            {assessment.status?.toUpperCase() || 'ACTIVE'}
                                            </Badge>
                        <p className="text-sm text-gray-500">
                            Started: {new Date(assessment.started_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* Assessment Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                            <div>
                                    <p className="text-sm font-medium">Overall Score</p>
                                    <p className="text-2xl font-bold">{assessment.overall_score || 0}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Award className="w-5 h-5 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium">Readiness Index</p>
                                    <p className="text-2xl font-bold">{assessment.readiness_index || 0}%</p>
                                </div>
                    </div>
                            </CardContent>
                        </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-5 h-5 text-purple-500" />
                <div>
                                    <p className="text-sm font-medium">Completed Rounds</p>
                                    <p className="text-2xl font-bold">
                                        {assessment.rounds?.filter((r: any) => r.status === 'COMPLETED').length || 0}
                    </p>
                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-5 h-5 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium">Total Duration</p>
                                    <p className="text-2xl font-bold">
                                        {assessment.rounds?.reduce((total: number, round: any) => {
                                            const duration = roundDisplay[round.round_type]?.duration || '0 min'
                                            return total + parseInt(duration)
                                        }, 0) || 0} min
                                    </p>
                                        </div>
                                </div>
                            </CardContent>
                        </Card>
                </div>

                {/* Rounds */}
                <Card>
                        <CardHeader>
                        <CardTitle>Assessment Rounds</CardTitle>
                            <CardDescription>
                            Complete each round to progress through your assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                            {assessment.rounds?.map((round: any, index: number) => {
                                const roundInfo = roundDisplay[round.round_type] || {
                                    name: `Round ${round.round_number}`,
                                    description: 'Assessment round',
                                    duration: '30 min',
                                    icon: Target,
                                    color: 'bg-gray-500'
                                }
                                const status: 'completed' | 'in_progress' | 'not_started' = getRoundStatus(round)
                                const IconComponent = roundInfo.icon

                                // Check if previous round is completed (for step-by-step progression)
                                const previousRound = index > 0 ? assessment.rounds[index - 1] : null
                                const previousRoundStatus: 'completed' | 'in_progress' | 'not_started' = previousRound ? getRoundStatus(previousRound) : 'completed'
                                const previousRoundCompleted = previousRoundStatus === 'completed'
                                const isRoundEnabled = status === 'completed' || previousRoundCompleted || index === 0

                                // Type guard to check if status is 'completed'
                                const isCompleted = status === 'completed'
                                const isDisabled = !isRoundEnabled && !isCompleted
                                
                                return (
                                    <div key={round.id} className={`flex items-center justify-between p-4 border rounded-lg`} style={{ opacity: isDisabled ? 0.5 : 1 }}>
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-full ${roundInfo.color} text-white`}>
                                                <IconComponent className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{roundInfo.name}</h3>
                                                <p className="text-sm text-gray-600">{roundInfo.description}</p>
                                                <p className="text-xs text-gray-500">{roundInfo.duration}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <Badge className={getStatusColor(status)}>
                                                {getStatusIcon(status)}
                                                <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
                                            </Badge>
                                            {status === 'completed' && round.score && (
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">{round.score} points</p>
                                                    <p className="text-xs text-gray-500">{round.percentage}%</p>
                                </div>
                                            )}
                                            {status !== 'completed' && (
                                <Button 
                                                    onClick={() => handleStartRound(round.round_number)}
                                                    disabled={!isRoundEnabled}
                                                >
                                                    {status === 'in_progress' ? 'Continue' : 'Start'}
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                            </div>
                        </CardContent>
                    </Card>

                {/* Actions */}
                <div className="flex justify-between">
                    <Button variant="outline" onClick={() => router.push('/dashboard/student/jobs')}>
                        Back to Job Recommendations
                    </Button>
                    {assessment.status === 'completed' && (
                        <Button onClick={() => router.push(`/dashboard/student/assessment/report?id=${assessmentId}`)}>
                            View Report
                        </Button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    )
}