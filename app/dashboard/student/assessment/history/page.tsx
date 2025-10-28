"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api'
import { 
    Home, User, FileText, Briefcase, ClipboardList,
    TrendingUp, Award, Calendar, Sparkles, Trophy,
    Brain, Target, Zap, ArrowRight, Download,
    BarChart3, Clock, CheckCircle, XCircle, Filter
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
]

export default function AssessmentHistoryPage() {
    const [loading, setLoading] = useState(true)
    const [history, setHistory] = useState<any>({ total: 0, assessments: [] })
    const [filter, setFilter] = useState<'all' | 'completed' | 'in_progress'>('all')
    const router = useRouter()

    useEffect(() => {
        loadHistory()
    }, [])

    const loadHistory = async () => {
        try {
            const data = await apiClient.getStudentAssessments(0, 50)
            setHistory(data)
        } catch (error) {
            console.error('Error loading assessment history:', error)
            toast.error('Failed to load assessment history')
        } finally {
            setLoading(false)
        }
    }

    const getBadgeVariant = (value: number) => {
        if (value >= 80) return 'default'
        if (value >= 60) return 'secondary'
        return 'destructive'
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-400'
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    const getPerformanceLabel = (score: number) => {
        if (score >= 80) return { label: 'Excellent', icon: Trophy, color: 'bg-green-500' }
        if (score >= 60) return { label: 'Good', icon: Target, color: 'bg-yellow-500' }
        return { label: 'Needs Work', icon: Brain, color: 'bg-red-500' }
    }

    // Calculate statistics (normalize status)
    const stats = {
        total: history.total,
        completed: history.assessments.filter((a: any) => (a.status || '').toLowerCase() === 'completed').length,
        inProgress: history.assessments.filter((a: any) => (a.status || '').toLowerCase() === 'in_progress').length,
        avgScore: history.assessments.length > 0 
            ? (history.assessments.reduce((sum: number, a: any) => sum + (a.overall_score || 0), 0) / history.assessments.length).toFixed(1)
            : 0,
        bestScore: history.assessments.length > 0
            ? Math.max(...history.assessments.map((a: any) => a.overall_score || 0)).toFixed(1)
            : 0
    }

    // Filter assessments
    const filteredAssessments = history.assessments.filter((a: any) => {
        if (filter === 'all') return true
        const status = String(a.status || '').toLowerCase()
        const filterLower = filter.toLowerCase()
        return status === filterLower || status.replace('_', '') === filterLower.replace('_', '')
    })

    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
            <div className="space-y-8">
                {/* Hero Header with Gradient */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 p-8 text-white">
                    <div className="absolute inset-0 bg-grid-white/10" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <h1 className="text-4xl font-bold">Assessment Journey</h1>
                                </div>
                                <p className="text-lg text-white/90 max-w-2xl">
                                    Track your progress, analyze performance, and unlock your potential with AI-powered insights
                                </p>
                            </div>
                            <Link href="/dashboard/student/assessment">
                                <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
                                    <Zap className="h-5 w-5 mr-2" />
                                    New Assessment
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Assessments</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                                </div>
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                                    <BarChart3 className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                                </div>
                                <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                                    <p className="text-3xl font-bold text-yellow-600">{stats.inProgress}</p>
                                </div>
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
                                    <p className="text-3xl font-bold text-purple-600">{stats.avgScore}%</p>
                                </div>
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                                    <TrendingUp className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Best Score</p>
                                    <p className="text-3xl font-bold text-orange-600">{stats.bestScore}%</p>
                                </div>
                                <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-xl">
                                    <Trophy className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">Filter:</span>
                            <Button
                                variant={filter === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('all')}
                            >
                                All ({history.total})
                            </Button>
                            <Button
                                variant={filter === 'completed' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('completed')}
                            >
                                Completed ({stats.completed})
                            </Button>
                            <Button
                                variant={filter === 'in_progress' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilter('in_progress')}
                            >
                                In Progress ({stats.inProgress})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Assessment Cards */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : filteredAssessments.length === 0 ? (
                    <Card className="border-2 border-dashed">
                        <CardContent className="p-12 text-center">
                            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <ClipboardList className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">
                                {filter === 'all' ? 'No Assessments Yet' : `No ${filter.replace('_', ' ')} assessments`}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                {filter === 'all' 
                                    ? 'Start your first AI-powered assessment to unlock personalized insights'
                                    : 'Try changing the filter or start a new assessment'}
                            </p>
                            <Link href="/dashboard/student/assessment">
                                <Button size="lg">
                                    <Sparkles className="h-5 w-5 mr-2" />
                                    Start Your Journey
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {filteredAssessments.map((assessment: any, index: number) => {
                            const performance = getPerformanceLabel(assessment.overall_score || 0)
                            const PerformanceIcon = performance.icon
                            
                            return (
                                <Card 
                                    key={assessment.assessment_id} 
                                    className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 dark:hover:border-purple-700 relative overflow-hidden"
                                >
                                    {/* Gradient overlay on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <CardHeader className="pb-4 relative z-10">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CardTitle className="text-xl">{assessment.job_role?.title}</CardTitle>
                                                    <Badge 
                                                        variant={String(assessment.status).toLowerCase() === 'completed' ? 'default' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        {String(assessment.status).toLowerCase() === 'completed' ? '✓ Completed' : '⏳ In Progress'}
                                                    </Badge>
                                                </div>
                                                <CardDescription className="flex items-center gap-2">
                                                    <Calendar className="h-3 w-3" />
                                                    {assessment.completed_at || assessment.started_at 
                                                        ? new Date(assessment.completed_at || assessment.started_at).toLocaleDateString('en-IN', { 
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : 'Date unavailable'}
                                                </CardDescription>
                                            </div>
                                            <div className={`p-3 rounded-xl ${performance.color} bg-opacity-10`}>
                                                <PerformanceIcon className="h-6 w-6 text-current" style={{ color: performance.color.replace('bg-', '').replace('-500', '') }} />
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4 relative z-10">
                                        {/* Score Cards */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <TrendingUp className="h-4 w-4 text-blue-600" />
                                                    <p className="text-xs font-medium text-blue-600">Overall</p>
                                                </div>
                                                <p className={`text-2xl font-bold ${getScoreColor(assessment.overall_score || 0)}`}>
                                                    {(assessment.overall_score || 0).toFixed(1)}%
                                                </p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Award className="h-4 w-4 text-green-600" />
                                                    <p className="text-xs font-medium text-green-600">Readiness</p>
                                                </div>
                                                <p className={`text-2xl font-bold ${getScoreColor(assessment.readiness_index || 0)}`}>
                                                    {(assessment.readiness_index || 0).toFixed(1)}%
                                                </p>
                                            </div>

                                            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="h-4 w-4 text-purple-600" />
                                                    <p className="text-xs font-medium text-purple-600">Rounds</p>
                                                </div>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {assessment.rounds?.filter((r: any) => r.percentage != null).length || 0}/5
                                                </p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm font-medium">Progress</span>
                                                <span className="text-sm text-gray-500">
                                                    {((assessment.rounds?.filter((r: any) => r.percentage != null).length || 0) / 5 * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <Progress 
                                                value={(assessment.rounds?.filter((r: any) => r.percentage != null).length || 0) / 5 * 100}
                                                className="h-2"
                                            />
                                        </div>

                                        {/* Round Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            {(assessment.rounds || []).map((round: any) => (
                                                <Badge 
                                                    key={round.round_number} 
                                                    variant={getBadgeVariant(round.percentage || 0)}
                                                    className="text-xs font-medium"
                                                >
                                                    R{round.round_number}: {(round.percentage || 0).toFixed(0)}%
                                                </Badge>
                                            ))}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                                className="flex-1 group/btn"
                                                onClick={() => router.push(`/dashboard/student/assessment/report?id=${assessment.assessment_id}`)}
                                            >
                                                View Report
                                                <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                onClick={() => router.push(`/dashboard/student/assessment?id=${assessment.assessment_id}`)}
                                            >
                                                {assessment.status === 'completed' ? 'Review' : 'Continue'}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}
