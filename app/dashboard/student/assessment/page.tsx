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
    Home, 
    User, 
    FileText, 
    Briefcase, 
    ClipboardList, 
    Brain,
    Mic,
    CheckCircle,
    Clock,
    Target
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
// Add this helper function after imports in both files
const extractErrorMessage = (error: any): string => {
    try {
        const resData = error?.response?.data
        if (resData) {
            if (typeof resData === 'string') return resData
            if (resData.detail) {
                const d = resData.detail
                if (Array.isArray(d) && d.length > 0) {
                    return d[0]?.msg || d[0]?.message || JSON.stringify(d)
                }
                if (typeof d === 'string') return d
                if (typeof d === 'object') return d.message || JSON.stringify(d)
            }
            if (resData.message) return resData.message
            if (resData.error) return resData.error
            return JSON.stringify(resData)
        }
        if (error?.message) return error.message
    } catch {}
    return 'An error occurred'
}

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
    { name: 'Assessments', href: '/dashboard/student/assessment', icon: ClipboardList },
]

const roundInfo = [
    {
        number: 1,
        name: "Aptitude Test",
        description: "Quantitative, Reasoning, English",
        duration: "30 min",
        icon: Brain,
        color: "bg-blue-500"
    },
    {
        number: 2,
        name: "Soft Skills",
        description: "Communication, Leadership, Teamwork",
        duration: "20 min",
        icon: User,
        color: "bg-green-500"
    },
    {
        number: 3,
        name: "Technical MCQ",
        description: "Domain-specific questions",
        duration: "30 min",
        icon: ClipboardList,
        color: "bg-purple-500"
    },
    {
        number: 4,
        name: "Technical Interview",
        description: "Voice-based technical discussion",
        duration: "20 min",
        icon: Mic,
        color: "bg-orange-500"
    },
    {
        number: 5,
        name: "HR Interview",
        description: "Behavioral and cultural fit",
        duration: "15 min",
        icon: Target,
        color: "bg-pink-500"
    }
    
]

export default function AssessmentPage() {
    const [jobRoles, setJobRoles] = useState<any[]>([])
    const [selectedJobRole, setSelectedJobRole] = useState<any>(null)
    const [assessment, setAssessment] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [starting, setStarting] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const assessmentId = searchParams.get('id')

    useEffect(() => {
        if (assessmentId) {
            loadAssessment(assessmentId)
        } else {
            loadJobRoles()
        }
    }, [assessmentId])

    // Refresh assessment data every 30 seconds to get updated scores
    useEffect(() => {
        if (assessmentId && assessment) {
            const interval = setInterval(() => {
                loadAssessment(assessmentId)
            }, 30000) // 30 seconds
            
            return () => clearInterval(interval)
        }
    }, [assessmentId, assessment])

    const loadJobRoles = async () => {
        try {
            // First check if resume exists
            const resumeStatus = await apiClient.getResumeStatus()
            if (!resumeStatus || !resumeStatus.has_resume) {
                toast.error('Please upload your resume first to get job recommendations for assessments')
                return
            }
            
            const data = await apiClient.getJobRoles()
            console.log('📋 Job roles data:', data)
            console.log('📋 Job roles type:', typeof data)
            console.log('📋 Job roles keys:', Object.keys(data || {}))
            setJobRoles(data.job_roles || [])
        } catch (error) {
            console.error('Error loading job roles:', error)
            toast.error('Failed to load job roles')
        } finally {
            setLoading(false)
        }
    }

    const loadAssessment = async (id: string) => {
        try {
            const data = await apiClient.getAssessmentStatus(id)
            // Normalize status strings to lowercase to handle enum vs string differences
            const normalizeStatus = (val: any) => {
                if (val == null) return val
                // enum objects may have a 'value' prop, otherwise toString()
                const s = typeof val === 'string' ? val : (val.value ?? String(val))
                return String(s).toLowerCase()
            }

            const normalized = {
                ...data,
                status: normalizeStatus(data.status),
                rounds: Array.isArray(data.rounds)
                    ? data.rounds.map((r: any) => ({
                        ...r,
                        status: normalizeStatus(r.status),
                    }))
                    : [],
            }
            setAssessment(normalized)
        } catch (error) {
            console.error('Error loading assessment:', error)
            toast.error('Failed to load assessment')
        } finally {
            setLoading(false)
        }
    }

    const startAssessment = async (jobRoleId: string) => {
        setStarting(true)
        try {
            console.log('🚀 Starting assessment for job role:', jobRoleId)
            const data = await apiClient.startAssessment(jobRoleId)
            console.log('✅ Assessment started successfully:', data)
            setAssessment(data)
            toast.success('Assessment started successfully!')
            router.push(`/dashboard/student/assessment?id=${data.assessment_id}`)
        } catch (error: any) {
            console.error('❌ Error starting assessment:', error)
            const errorMsg = extractErrorMessage(error)
            const status = error?.response?.status
            const url = error?.config?.url || ''
            
            // If user already has an active assessment, try to find and resume it
            if (
                (typeof errorMsg === 'string' && (
                    errorMsg.toLowerCase().includes('already has an active') ||
                    errorMsg.toLowerCase().includes('active assessment')
                )) ||
                (status === 400 && String(url).includes('/assessments/start'))
            ) {
                console.log('🔄 User has active assessment, fetching and redirecting...')
                toast.dismiss() // Clear any existing toasts
                toast.loading('Loading your active assessment...')
                
                try {
                    // Fetch the student's assessments to find the active one
                    const assessmentsData = await apiClient.getStudentAssessments(0, 10)
                    console.log('📋 Assessments data:', assessmentsData)
                    
                    const activeAssessment = assessmentsData.assessments?.find(
                        (a: any) => {
                            const status = String(a.status || '').toLowerCase()
                            return status === 'not_started' || status === 'in_progress'
                        }
                    )
                    
                    console.log('🎯 Found active assessment:', activeAssessment)
                    
                    if (activeAssessment) {
                        toast.dismiss()
                        toast.success('Resuming your active assessment...')
                        setTimeout(() => {
                            router.push(`/dashboard/student/assessment?id=${activeAssessment.assessment_id}`)
                        }, 500)
                        return
                    } else {
                        toast.dismiss()
                        toast.error('No active assessment found. Please contact support.')
                    }
                } catch (loadError) {
                    console.error('Failed to load existing assessment:', loadError)
                    toast.dismiss()
                    toast.error('Failed to load your active assessment. Please refresh the page.')
                }
            } else {
                toast.error(errorMsg)
            }
        } finally {
            setStarting(false)
        }
    }

    const continueAssessment = (roundNumber: number) => {
        router.push(`/dashboard/student/assessment/round?assessment_id=${assessment.assessment_id}&round=${roundNumber}`)
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

    // If assessment is loaded, show assessment status
    if (assessment) {
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <div className="space-y-6">
                    {/* Assessment Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Assessment in Progress</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {assessment.job_role?.title || 'Technical Assessment'}
                            </p>
                        </div>
                        <Badge variant={assessment.status === 'completed' ? 'default' : 'secondary'}>
                            {assessment.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </div>

                    {/* Assessment Stats */}
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Overall Score</CardDescription>
                                <CardTitle className="text-3xl">
                                    {assessment.overall_score?.toFixed(1) || 0}%
                                </CardTitle>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Readiness Index</CardDescription>
                                <CardTitle className="text-3xl">
                                    {assessment.readiness_index?.toFixed(1) || 0}%
                                </CardTitle>
                            </CardHeader>
                        </Card>

                        <Card>
                            <CardHeader className="pb-3">
                                <CardDescription>Completed Rounds</CardDescription>
                                <CardTitle className="text-3xl">
                                    {assessment.rounds?.filter((r: any) => r.status === 'completed').length || 0}/5
                                </CardTitle>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Assessment Rounds */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roundInfo.map((round) => {
                            const roundData = assessment.rounds?.find((r: any) => r.round_number === round.number)
                            const isCompleted = roundData?.status === 'completed'
                            const isCurrent = roundData?.status === 'in_progress'
                            const isNotStarted = !roundData || roundData?.status === 'not_started'

                            const canStart = (round.number === 1 && isNotStarted) ||
                                            (isNotStarted && assessment.rounds?.find((r: any) => r.round_number === round.number - 1)?.status === 'completed') ||
                                            isCurrent

                            return (
                                <Card 
                                    key={round.number}
                                    className={`transition-all hover:shadow-lg ${
                                        isCompleted ? 'border-green-200 bg-green-50 dark:bg-green-900/10' :
                                        canStart ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10' :
                                        'border-gray-200'
                                    }`}
                                >
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${round.color} text-white`}>
                                                <round.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">Round {round.number}</CardTitle>
                                                <CardDescription>{round.name}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                            {round.description}
                                        </p>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                                <Clock className="h-4 w-4" />
                                                {round.duration}
                                            </div>
                                            {isCompleted && (
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm font-medium">
                                                        {roundData?.percentage?.toFixed(1)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Start/Continue Button */}
                                        {canStart && !isCompleted && (
                                            <Button 
                                                className="w-full" 
                                                size="sm"
                                                onClick={() => continueAssessment(round.number)}
                                            >
                                                {isCurrent ? 'Continue' : 'Start Round'}
                                            </Button>
                                        )}

                                        {/* Locked State */}
                                        {!canStart && !isCompleted && (
                                            <div className="text-xs text-gray-500 text-center py-2 bg-gray-100 dark:bg-gray-800 rounded">
                                                Complete previous round first
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    

                    {/* Actions */}
                    {assessment.status === 'completed' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Assessment Complete!</CardTitle>
                                <CardDescription>
                                    View your detailed report and analysis
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    onClick={() => router.push(`/dashboard/student/assessment/report?id=${assessment.assessment_id}`)}
                                    className="w-full"
                                >
                                    View Detailed Report
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DashboardLayout>
        )
    }

    // Job role selection
    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Start Assessment</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Choose a job role to begin your placement assessment
                    </p>
                </div>

                {/* Job Roles Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobRoles && Array.isArray(jobRoles) ? jobRoles.map((role) => (
                        <Card 
                            key={role.id}
                            className="cursor-pointer transition-all hover:shadow-lg hover:border-primary-300"
                            onClick={() => setSelectedJobRole(role)}
                        >
                            <CardHeader>
                                <CardTitle className="text-lg">{role.title || 'Untitled Role'}</CardTitle>
                                <CardDescription>{role.category || 'No Category'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                    {role.description || 'No description available'}
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{role.experience_level}</Badge>
                                        {role.salary_range && (
                                            <Badge variant="secondary">{role.salary_range}</Badge>
                                        )}
                                    </div>
                                    {role.required_skills && Array.isArray(role.required_skills) && role.required_skills.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {role.required_skills.slice(0, 3).map((skill: any, index: number) => (
                                                <Badge key={index} variant="outline" className="text-xs">
                                                    {typeof skill === 'string' ? skill : JSON.stringify(skill)}
                                                </Badge>
                                            ))}
                                            {role.required_skills.length > 3 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{role.required_skills.length - 3} more
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )) : (
                        <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">No job roles available</p>
                        </div>
                    )}
                </div>

                {/* Start Assessment Button */}
                {selectedJobRole && (
                    <Card className="border-primary-200 bg-primary-50 dark:bg-primary-900/10">
                        <CardHeader>
                            <CardTitle>Ready to Start?</CardTitle>
                            <CardDescription>
                                You've selected <strong>{selectedJobRole.title}</strong> for your assessment
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    <p>• 5 rounds of assessment</p>
                                    <p>• Estimated duration: 2 hours</p>
                                    <p>• AI-powered evaluation</p>
                                    <p>• Detailed feedback and recommendations</p>
                                </div>
                                <Button 
                                    onClick={() => startAssessment(selectedJobRole.id)}
                                    disabled={starting}
                                    className="w-full"
                                    size="lg"
                                >
                                    {starting ? <Loader size="sm" /> : 'Start Assessment'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
