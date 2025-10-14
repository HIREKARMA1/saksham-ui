"use client"

import { useEffect, useState } from 'react'
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
    ArrowLeft,
    Download,
    Share2,
    TrendingUp,
    Target,
    Brain,
    Mic,
    CheckCircle,
    AlertCircle,
    Lightbulb,
    Award
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
    { name: 'Assessments', href: '/dashboard/student/assessment', icon: ClipboardList },
]

const roundInfo = [
    { number: 1, name: "Aptitude Test", icon: Brain, color: "bg-blue-500" },
    { number: 2, name: "Soft Skills", icon: User, color: "bg-green-500" },
    { number: 3, name: "Technical MCQ", icon: ClipboardList, color: "bg-purple-500" },
    { number: 4, name: "Technical Interview", icon: Mic, color: "bg-orange-500" },
    { number: 5, name: "HR Interview", icon: Target, color: "bg-pink-500" },
    { number: 6, name: "Final Evaluation", icon: CheckCircle, color: "bg-indigo-500" }
]

export default function AssessmentReportPage() {
    const [report, setReport] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const assessmentId = searchParams.get('id')

    useEffect(() => {
        if (assessmentId) {
            loadReport()
        } else {
            router.push('/dashboard/student/assessment')
        }
    }, [assessmentId])

    const loadReport = async () => {
        try {
            const data = await apiClient.getAssessmentReport(assessmentId!)
            setReport(data)
        } catch (error) {
            console.error('Error loading report:', error)
            toast.error('Failed to load assessment report')
            router.push('/dashboard/student/assessment')
        } finally {
            setLoading(false)
        }
    }

    const downloadReport = () => {
        // TODO: Implement PDF download
        toast.success('Report download will be available soon!')
    }

    const shareReport = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My Assessment Report',
                text: `I scored ${report?.overall_score?.toFixed(1)}% in my placement assessment!`,
                url: window.location.href
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Report link copied to clipboard!')
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
    }

    const getScoreBadgeVariant = (score: number) => {
        if (score >= 80) return 'default'
        if (score >= 60) return 'secondary'
        return 'destructive'
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

    if (!report) {
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Report Not Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        The assessment report could not be loaded.
                    </p>
                    <Button onClick={() => router.push('/dashboard/student/assessment')}>
                        Back to Assessments
                    </Button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push('/dashboard/student/assessment')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Assessments
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Assessment Report</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {report.job_role?.title} - Completed on {new Date(report.completed_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={shareReport}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button onClick={downloadReport}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                        </Button>
                    </div>
                </div>

                {/* Overall Performance */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Overall Score</CardDescription>
                            <CardTitle className={`text-4xl ${getScoreColor(report.overall_score)}`}>
                                {report.overall_score?.toFixed(1)}%
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Progress value={report.overall_score} className="h-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Readiness Index</CardDescription>
                            <CardTitle className={`text-4xl ${getScoreColor(report.readiness_index)}`}>
                                {report.readiness_index?.toFixed(1)}%
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Progress value={report.readiness_index} className="h-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Performance Level</CardDescription>
                            <CardTitle className="text-2xl">
                                <Badge 
                                    variant={getScoreBadgeVariant(report.overall_score)}
                                    className="text-lg px-4 py-2"
                                >
                                    {report.overall_score >= 80 ? 'Excellent' : 
                                     report.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Round-wise Performance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Round-wise Performance
                        </CardTitle>
                        <CardDescription>
                            Detailed breakdown of your performance in each round
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {report.rounds?.map((round: any, index: number) => {
                                const roundData = roundInfo.find(r => r.round_number === round.round_number)
                                return (
                                    <div key={round.round_number} className="p-4 border rounded-lg">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className={`p-2 rounded-lg ${roundData?.color} text-white`}>
                                                <roundData?.icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{roundData?.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Round {round.round_number}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm">Score</span>
                                                <Badge variant={getScoreBadgeVariant(round.percentage)}>
                                                    {round.percentage?.toFixed(1)}%
                                                </Badge>
                                            </div>
                                            <Progress value={round.percentage} className="h-2" />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* AI Analysis */}
                {report.ai_feedback && (
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-600">
                                    <Award className="h-5 w-5" />
                                    Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {report.ai_feedback.strengths?.map((strength: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Areas for Improvement */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-orange-600">
                                    <AlertCircle className="h-5 w-5" />
                                    Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {report.ai_feedback.weaknesses?.map((weakness: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{weakness}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Recommendations */}
                {report.ai_feedback?.recommendations && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="h-5 w-5" />
                                Recommendations
                            </CardTitle>
                            <CardDescription>
                                AI-generated suggestions to improve your performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {report.ai_feedback.recommendations.map((recommendation: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                        <Lightbulb className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{recommendation}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Career Advice */}
                {report.ai_feedback?.career_advice && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="h-5 w-5" />
                                Career Advice
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-lg">
                                <p className="text-sm leading-relaxed">
                                    {report.ai_feedback.career_advice}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Overall Assessment */}
                {report.ai_feedback?.overall_performance && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Assessment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-sm leading-relaxed">
                                    {report.ai_feedback.overall_performance}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Next Steps</CardTitle>
                        <CardDescription>
                            Continue your placement preparation journey
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={() => router.push('/dashboard/student/assessment')}>
                                Take Another Assessment
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/dashboard/student/jobs')}>
                                Browse Job Recommendations
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/dashboard/student/profile')}>
                                Update Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}
