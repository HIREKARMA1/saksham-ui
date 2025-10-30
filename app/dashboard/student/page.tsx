"use client"

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { Home, User, FileText, Briefcase, ClipboardList, Zap, BarChart3 } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'

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

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
    { name: 'Auto Job Apply', href: '/dashboard/student/auto-apply', icon: Zap },
    { name: 'Analytics', href: '/dashboard/student/analytics' , icon: BarChart3 },
]

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
            setStats(data)
            const a = await apiClient.getStudentAnalytics()
            setAnalytics(a)

            // Fetch recent assessments and pick latest completed for Detailed Analysis
            try {
                const assmts = await apiClient.getStudentAssessments(0, 10)
                const completed = (assmts?.assessments || []).filter((x: any) => String(x.status).toLowerCase() === 'completed')
                if (completed.length > 0) {
                    const latest = completed.sort((b: any, c: any) => new Date(c.completed_at || c.started_at).getTime() - new Date(b.completed_at || b.started_at).getTime())[0]
                    setLatestReport({ id: latest.assessment_id, date: latest.completed_at || latest.started_at })
                }
            } catch (_) {}
        } catch (error) {
            console.error('Error fetching dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
            <div className="space-y-6">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold">Welcome Back!</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track your progress and continue your placement journey</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid md:grid-cols-4 gap-6">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Assessments Completed</CardDescription>
                                    <CardTitle className="text-3xl">{stats?.assessments_completed || 0}</CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Average Score</CardDescription>
                                    <CardTitle className="text-3xl">{stats?.average_score || 0}%</CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>ATS Score</CardDescription>
                                    <CardTitle className="text-3xl">{stats?.ats_score || 0}%</CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Job Matches</CardDescription>
                                    <CardTitle className="text-3xl">{stats?.job_recommendations || 0}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Actions</CardTitle>
                                <CardDescription>Get started with your placement preparation</CardDescription>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                <Link href="/dashboard/student/resume">
                                    <Button variant="outline" className="w-full justify-start">
                                        <FileText className="mr-2 h-4 w-4" />
                                        {stats?.resume_uploaded ? 'Update Resume' : 'Upload Resume'}
                                    </Button>
                                </Link>
                                <Link href="/dashboard/student/jobs">
                                    <Button variant="outline" className="w-full justify-start">
                                        <Briefcase className="mr-2 h-4 w-4" />
                                        Browse Jobs
                                    </Button>
                                </Link>
                                
                                <Link href="/dashboard/student/assessment">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Take Assessment
                                    </Button>
                                </Link>
                                <Link href="/dashboard/student/assessment/history">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Assessment History
                                    </Button>
                                </Link>
                                <Link href="/dashboard/student/profile">
                                    <Button variant="outline" className="w-full justify-start">
                                        <User className="mr-2 h-4 w-4" />
                                        Update Profile
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Detailed Analysis entry point */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Detailed Analysis</CardTitle>
                                <CardDescription>
                                    View your latest assessment report with per-question breakdown and AI insights
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-3">
                                    <Button
                                        disabled={!latestReport.id}
                                        onClick={() => {
                                            if (latestReport.id) {
                                                window.location.href = `/dashboard/student/assessment/report?id=${latestReport.id}`
                                            }
                                        }}
                                    >
                                        {latestReport.id ? 'View Latest Report' : 'No completed assessments yet'}
                                    </Button>
                                    {latestReport.date && (
                                        <span className="text-sm text-gray-500">
                                            Last completed: {new Date(latestReport.date).toLocaleString()}
                                        </span>
                                    )}
                                    <Link href="/dashboard/student/assessment/history" className="ml-auto">
                                        <Button variant="outline">Browse All Reports</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

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






