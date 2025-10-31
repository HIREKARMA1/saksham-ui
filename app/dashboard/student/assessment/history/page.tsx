"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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

    // Calculate Assessment Overview style stats (aggregate across all assessments)
    const assessmentStats = {
        overallScore: history.assessments.length > 0
            ? Math.round(history.assessments.reduce((sum: number, a: any) => sum + (a.overall_score || 0), 0) / history.assessments.length)
            : 0,
        readinessIndex: history.assessments.length > 0
            ? Math.round(history.assessments.reduce((sum: number, a: any) => sum + (a.readiness_index || 0), 0) / history.assessments.length)
            : 0,
        completedRounds: history.assessments.reduce((total: number, a: any) => {
            return total + (a.rounds?.filter((r: any) => r.status === 'COMPLETED' || r.percentage != null).length || 0)
        }, 0),
        totalDuration: history.assessments.reduce((total: number, a: any) => {
            // Estimate duration: assume 30 min per completed round
            const completedRounds = a.rounds?.filter((r: any) => r.status === 'COMPLETED' || r.percentage != null).length || 0
            return total + (completedRounds * 30)
        }, 0)
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
                {/* Hero Header with Gradient (aligned with landing/job pages) */}
                <div className="relative overflow-hidden rounded-2xl p-8 text-gray-900 dark:text-white border bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
                    {/* decorative corners */}
                    <div className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rotate-45 bg-gradient-to-br from-primary-100/40 to-secondary-100/30 dark:from-primary-900/30 dark:to-secondary-900/20" />
                    <div className="pointer-events-none absolute -bottom-14 -left-14 w-64 h-64 rounded-full bg-gradient-to-tr from-secondary-100/30 to-accent-100/20 dark:from-secondary-900/20 dark:to-accent-900/10" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 rounded-lg bg-primary-500/10 text-primary-600 dark:text-primary-400">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <h1 className="text-4xl font-bold gradient-text">Assessment Journey</h1>
                                </div>
                                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">
                                    Track your progress, analyze performance, and unlock your potential with AI-powered insights
                                </p>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Assessment Stats - Matching Assessment Overview Style */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Overall Score */}
                    <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <Card className="relative overflow-hidden card-hover min-h-[120px]">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <BarChart3 className="w-6 h-6 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium">Overall Score</p>
                                            <p className="text-3xl font-bold">{assessmentStats.overallScore}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-blue-200/50 to-blue-100/20 dark:from-blue-900/30 dark:to-blue-800/10" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-50 to-blue-100/70 dark:from-blue-900/20 dark:to-blue-900/10" />
                        </Card>
                    </motion.div>

                    {/* Readiness Index */}
                    <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <Card className="relative overflow-hidden card-hover min-h-[120px]">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Award className="w-6 h-6 text-green-500" />
                                        <div>
                                            <p className="text-sm font-medium">Readiness Index</p>
                                            <p className="text-3xl font-bold">{assessmentStats.readinessIndex}%</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-green-200/50 to-green-100/20 dark:from-green-900/30 dark:to-green-800/10" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-green-50 to-green-100/70 dark:from-green-900/20 dark:to-green-900/10" />
                        </Card>
                    </motion.div>

                    {/* Completed Rounds */}
                    <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <Card className="relative overflow-hidden card-hover min-h-[120px]">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <CheckCircle className="w-6 h-6 text-purple-500" />
                                        <div>
                                            <p className="text-sm font-medium">Completed Rounds</p>
                                            <p className="text-3xl font-bold">{assessmentStats.completedRounds}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-purple-200/50 to-purple-100/20 dark:from-purple-900/30 dark:to-purple-800/10" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-purple-50 to-purple-100/70 dark:from-purple-900/20 dark:to-purple-900/10" />
                        </Card>
                    </motion.div>

                    {/* Total Duration */}
                    <motion.div whileHover={{ y: -3, scale: 1.02 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                        <Card className="relative overflow-hidden card-hover min-h-[120px]">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <Clock className="w-6 h-6 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-medium">Total Duration</p>
                                            <p className="text-3xl font-bold">{assessmentStats.totalDuration} min</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-orange-200/50 to-orange-100/20 dark:from-orange-900/30 dark:to-orange-800/10" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-orange-50 to-orange-100/70 dark:from-orange-900/20 dark:to-orange-900/10" />
                        </Card>
                    </motion.div>
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
                                    className="group card-hover hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary-300 dark:hover:border-primary-700 relative overflow-hidden"
                                >
                                    {/* Decorative backgrounds inspired by landing cards */}
                                    <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 rotate-45 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20" />
                                    <div className="pointer-events-none absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-gradient-to-tr from-secondary-100 to-accent-100 dark:from-secondary-900/20 dark:to-accent-900/10 opacity-70" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-secondary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
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
                                        {/* Score Cards - Matching Assessment Overview Style */}
                                        <div className="grid grid-cols-3 gap-3">
                                            {/* Overall Score */}
                                            <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/70 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800">
                                                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-blue-200/50 to-blue-100/20 dark:from-blue-900/30 dark:to-blue-800/10" />
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <BarChart3 className="h-4 w-4 text-blue-500" />
                                                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400">Overall</p>
                                                    </div>
                                                    <p className={`text-2xl font-bold ${getScoreColor(assessment.overall_score || 0)}`}>
                                                        {(assessment.overall_score || 0).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Readiness Index */}
                                            <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100/70 dark:from-green-900/20 dark:to-green-900/10 border border-green-200 dark:border-green-800">
                                                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-green-200/50 to-green-100/20 dark:from-green-900/30 dark:to-green-800/10" />
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Award className="h-4 w-4 text-green-500" />
                                                        <p className="text-xs font-medium text-green-600 dark:text-green-400">Readiness</p>
                                                    </div>
                                                    <p className={`text-2xl font-bold ${getScoreColor(assessment.readiness_index || 0)}`}>
                                                        {(assessment.readiness_index || 0).toFixed(1)}%
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Rounds */}
                                            <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/70 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800">
                                                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-purple-200/50 to-purple-100/20 dark:from-purple-900/30 dark:to-purple-800/10" />
                                                <div className="relative z-10">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CheckCircle className="h-4 w-4 text-purple-500" />
                                                        <p className="text-xs font-medium text-purple-600 dark:text-purple-400">Rounds</p>
                                                    </div>
                                                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                                        {assessment.rounds?.filter((r: any) => r.percentage != null).length || 0}/5
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Assessment Journey Section */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Assessment Journey</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                                    {((assessment.rounds?.filter((r: any) => r.percentage != null).length || 0) / 5 * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <Progress 
                                                value={(assessment.rounds?.filter((r: any) => r.percentage != null).length || 0) / 5 * 100}
                                                className="h-2"
                                            />
                                            
                                            {/* Round Progress Tags - Using theme colors based on performance */}
                                            <div className="flex flex-wrap gap-2 pt-1">
                                                {(assessment.rounds || []).map((round: any) => {
                                                    const roundPercentage = round.percentage || 0
                                                    let badgeColor = 'bg-gray-500'
                                                    if (roundPercentage >= 80) badgeColor = 'bg-green-500'
                                                    else if (roundPercentage >= 60) badgeColor = 'bg-blue-500'
                                                    else if (roundPercentage >= 40) badgeColor = 'bg-yellow-500'
                                                    else if (roundPercentage > 0) badgeColor = 'bg-orange-500'
                                                    
                                                    return (
                                                        <Badge 
                                                            key={round.round_number} 
                                                            className={`text-xs font-medium text-white ${badgeColor} border-0`}
                                                        >
                                                            R{round.round_number}: {roundPercentage.toFixed(0)}%
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Action Buttons - Matching Theme */}
                                        <div className="flex gap-2 pt-2">
                                            <Button 
                                                className="flex-1 group/btn bg-primary-600 hover:bg-primary-700 text-white"
                                                onClick={() => router.push(`/dashboard/student/assessment/report?id=${assessment.assessment_id}`)}
                                            >
                                                View Report
                                                <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                className="border-primary-300 text-primary-700 hover:bg-primary-50 dark:border-primary-700 dark:text-primary-400 dark:hover:bg-primary-900/20"
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
