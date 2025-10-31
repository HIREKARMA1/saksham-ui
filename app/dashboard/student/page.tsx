"use client"

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { Home, User, FileText, Briefcase, ClipboardList, Zap, Target, TrendingUp, Award, Users } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/ui/animated-background'

// Lazy-load Recharts on client only
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip as any), { ssr: false })
const Legend = dynamic(() => import('recharts').then(m => m.Legend as any), { ssr: false })
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false })

export default function StudentDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [analytics, setAnalytics] = useState<any>(null)
    const [latestReport, setLatestReport] = useState<{ id: string | null, date: string | null }>({ id: null, date: null })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const data = await apiClient.getStudentDashboard()
            const a = await apiClient.getStudentAnalytics()
            setAnalytics(a)

            // Fetch recent assessments and calculate real stats
            try {
                const assmts = await apiClient.getStudentAssessments(0, 100) // Get more to calculate accurate stats
                const allAssessments = assmts?.assessments || []
                const completed = allAssessments.filter((x: any) => String(x.status).toLowerCase() === 'completed')
                
                // Calculate real statistics from actual data
                const assessmentsCompleted = completed.length
                console.log('📊 Dashboard Stats Calculation:', {
                    totalAssessments: allAssessments.length,
                    completedAssessments: assessmentsCompleted
                })
                
                // Calculate average score from completed assessments
                let totalScore = 0
                let scoreCount = 0
                completed.forEach((assessment: any) => {
                    if (assessment.overall_score && assessment.overall_score > 0) {
                        totalScore += assessment.overall_score
                        scoreCount++
                    }
                })
                const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0
                console.log('📈 Average Score:', averageScore, 'from', scoreCount, 'assessments')
                
                // Calculate average readiness index
                let totalReadiness = 0
                let readinessCount = 0
                completed.forEach((assessment: any) => {
                    if (assessment.readiness_index && assessment.readiness_index > 0) {
                        totalReadiness += assessment.readiness_index
                        readinessCount++
                    }
                })
                const readinessIndex = readinessCount > 0 ? Math.round(totalReadiness / readinessCount) : 0
                
                // Get ATS score from student data (if resume uploaded)
                const atsScore = data.ats_score || 0
                
                // Count job recommendations (mock for now - would need actual endpoint)
                const jobRecommendations = data.job_recommendations || 0
                
                // Update stats with real values
                const calculatedStats = {
                    ...data,
                    assessments_completed: assessmentsCompleted,
                    average_score: averageScore,
                    ats_score: atsScore,
                    job_recommendations: jobRecommendations,
                    readiness_index: readinessIndex
                }
                
                console.log('✅ Final Dashboard Stats:', calculatedStats)
                setStats(calculatedStats)
                
                // Set latest completed report
                if (completed.length > 0) {
                    const latest = completed.sort((b: any, c: any) => new Date(c.completed_at || c.started_at).getTime() - new Date(b.completed_at || b.started_at).getTime())[0]
                    setLatestReport({ id: latest.assessment_id, date: latest.completed_at || latest.started_at })
                }
            } catch (err) {
                console.error('Error calculating stats:', err)
                // Fallback to backend data if calculation fails
                setStats(data)
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout requiredUserType="student">
            {/* Background with same style as home page */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 gradient-bg">
                    <AnimatedBackground variant="default" />
                </div>
            </div>
            
            {/* Content with margin-top */}
            <div className="relative z-10 mt-20 space-y-6">
                {/* Welcome Section - Enhanced */}
                <div className="bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-950 dark:to-purple-950 rounded-2xl p-6 md:p-8 shadow-sm">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Welcome Back! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Track your progress and continue your placement journey</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <>
                        {/* Stats Cards - Redesigned with Pastel Colors */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Assessments Completed - Light Blue */}
                            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-xl">
                                        <Target className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-1">Assessments Completed</p>
                                    <h3 className="text-4xl font-bold text-blue-900 dark:text-blue-100">{stats?.assessments_completed || 0}</h3>
                                </div>
                            </div>

                            {/* Average Score - Light Purple */}
                            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-xl">
                                        <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-purple-600 dark:text-purple-300 mb-1">Average Score</p>
                                    <h3 className="text-4xl font-bold text-purple-900 dark:text-purple-100">{stats?.average_score || 0}%</h3>
                                </div>
                            </div>

                            {/* ATS Score - Light Pink */}
                            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-pink-200 dark:bg-pink-800 rounded-xl">
                                        <Award className="h-6 w-6 text-pink-600 dark:text-pink-300" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-pink-600 dark:text-pink-300 mb-1">ATS Score</p>
                                    <h3 className="text-4xl font-bold text-pink-900 dark:text-pink-100">{stats?.ats_score || 0}%</h3>
                                </div>
                            </div>

                            {/* Job Matches - Light Yellow */}
                            <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 p-6 transition-all duration-300 hover:shadow-lg hover:scale-105">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-yellow-200 dark:bg-yellow-800 rounded-xl">
                                        <Users className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-yellow-600 dark:text-yellow-300 mb-1">Job Matches</p>
                                    <h3 className="text-4xl font-bold text-yellow-900 dark:text-yellow-100">{stats?.job_recommendations || 0}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions - Redesigned */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quick Actions</h2>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">Get started with your placement preparation</p>
                            </div>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <Link href="/dashboard/student/resume" className="group">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 hover:shadow-md transition-all duration-200 hover:scale-105">
                                        <div className="p-3 bg-blue-200 dark:bg-blue-800 rounded-lg">
                                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                                        </div>
                                        <span className="font-medium text-blue-900 dark:text-blue-100">
                                        {stats?.resume_uploaded ? 'Update Resume' : 'Upload Resume'}
                                        </span>
                                    </div>
                                </Link>

                                <Link href="/dashboard/student/jobs" className="group">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 hover:shadow-md transition-all duration-200 hover:scale-105">
                                        <div className="p-3 bg-green-200 dark:bg-green-800 rounded-lg">
                                            <Briefcase className="h-5 w-5 text-green-600 dark:text-green-300" />
                                        </div>
                                        <span className="font-medium text-green-900 dark:text-green-100">Browse Jobs</span>
                                    </div>
                                </Link>
                                
                                <Link href="/dashboard/student/assessment" className="group">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 hover:shadow-md transition-all duration-200 hover:scale-105">
                                        <div className="p-3 bg-purple-200 dark:bg-purple-800 rounded-lg">
                                            <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                                        </div>
                                        <span className="font-medium text-purple-900 dark:text-purple-100">Take Assessment</span>
                                    </div>
                                </Link>

                                <Link href="/dashboard/student/assessment/history" className="group">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900 hover:shadow-md transition-all duration-200 hover:scale-105">
                                        <div className="p-3 bg-pink-200 dark:bg-pink-800 rounded-lg">
                                            <ClipboardList className="h-5 w-5 text-pink-600 dark:text-pink-300" />
                                        </div>
                                        <span className="font-medium text-pink-900 dark:text-pink-100">Assessment History</span>
                                    </div>
                                </Link>

                                <Link href="/dashboard/student/profile" className="group">
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 hover:shadow-md transition-all duration-200 hover:scale-105">
                                        <div className="p-3 bg-orange-200 dark:bg-orange-800 rounded-lg">
                                            <User className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                                        </div>
                                        <span className="font-medium text-orange-900 dark:text-orange-100">Update Profile</span>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Detailed Analysis - Redesigned */}
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 rounded-2xl shadow-sm p-6">
                            <div className="mb-4">
                                <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">Detailed Analysis</h2>
                                <p className="text-indigo-700 dark:text-indigo-300 mt-1">
                                    View your latest assessment report with per-question breakdown and AI insights
                                </p>
                            </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        disabled={!latestReport.id}
                                        onClick={() => {
                                            if (latestReport.id) {
                                                window.location.href = `/dashboard/student/assessment/report?id=${latestReport.id}`
                                            }
                                        }}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                    >
                                        {latestReport.id ? 'View Latest Report' : 'No completed assessments yet'}
                                    </Button>
                                    {latestReport.date && (
                                    <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                                            Last completed: {new Date(latestReport.date).toLocaleString()}
                                        </span>
                                    )}
                                    <Link href="/dashboard/student/assessment/history" className="ml-auto">
                                    <Button variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-900">
                                        Browse All Reports
                                    </Button>
                                    </Link>
                                </div>
                        </div>

                        {/* Resume Status */}
                        {!stats?.resume_uploaded && (
                            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Resume Not Uploaded
                                    </CardTitle>
                                    <CardDescription>
                                        Upload your resume to get ATS score and personalized job recommendations
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Link href="/dashboard/student/resume">
                                        <Button>Upload Resume Now</Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}

                        {/* Analytics */}
                        {analytics && analytics.total_assessments > 0 ? (
                            <div className="grid lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Performance Trend</CardTitle>
                                        <CardDescription>Overall score and readiness over time</CardDescription>
                                    </CardHeader>
                                    <CardContent style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={(analytics.trend || []).map((t: any) => ({ ...t, date: new Date(t.date).toLocaleDateString() }))}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="date" />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip />
                                                <Legend />
                                                <Line type="monotone" dataKey="overall_score" name="Overall %" stroke="#6366f1" />
                                                <Line type="monotone" dataKey="readiness_index" name="Readiness %" stroke="#10b981" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Correct vs Incorrect</CardTitle>
                                        <CardDescription>Last assessment rounds</CardDescription>
                                    </CardHeader>
                                    <CardContent style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie dataKey="value" data={[
                                                    { name: 'Correct', value: analytics.correct_vs_incorrect?.correct || 0 },
                                                    { name: 'Incorrect', value: analytics.correct_vs_incorrect?.incorrect || 0 },
                                                ]} outerRadius={100} label>
                                                    <Cell fill="#10b981" />
                                                    <Cell fill="#ef4444" />
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card className="lg:col-span-3">
                                    <CardHeader>
                                        <CardTitle>Section-wise Performance</CardTitle>
                                        <CardDescription>Percent by round in last assessment</CardDescription>
                                    </CardHeader>
                                    <CardContent style={{ height: 300 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={Object.entries(analytics.section_wise || {}).map(([k, v]) => ({ section: k, percentage: v }))}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="section" />
                                                <YAxis domain={[0, 100]} />
                                                <Tooltip />
                                                <Bar dataKey="percentage" fill="#6366f1" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Analytics</CardTitle>
                                    <CardDescription>Detailed analytics will be available after completing assessments</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-12 text-gray-500">
                                        <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Complete your first assessment to see analytics</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}






