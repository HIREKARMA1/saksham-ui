"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { Home, User, FileText, Briefcase, Zap, BarChart3 } from 'lucide-react'

// Recharts (SSR-safe)
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false })
const RadarChart = dynamic(() => import('recharts').then(m => m.RadarChart), { ssr: false })
const PolarGrid = dynamic(() => import('recharts').then(m => m.PolarGrid), { ssr: false })
const PolarAngleAxis = dynamic(() => import('recharts').then(m => m.PolarAngleAxis), { ssr: false })
const PolarRadiusAxis = dynamic(() => import('recharts').then(m => m.PolarRadiusAxis), { ssr: false })
const Radar = dynamic(() => import('recharts').then(m => m.Radar), { ssr: false })
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false })
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false })
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false })
const PieChart = dynamic(() => import('recharts').then(m => m.PieChart), { ssr: false })
const Pie = dynamic(() => import('recharts').then(m => m.Pie), { ssr: false })
const Cell = dynamic(() => import('recharts').then(m => m.Cell), { ssr: false })

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
    { name: 'Auto Job Apply', href: '/dashboard/student/auto-apply', icon: Zap },
    { name: 'Analytics', href: '/dashboard/student/analytics', icon: BarChart3 },
]

export default function StudentAnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const analytics = await apiClient.getStudentAnalytics()
                setData(analytics)
            } catch (e) {
                console.error('Failed to load analytics', e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    // Safe fallbacks for first render
    const skills = (data?.skills_assessment?.categories || []).map((s: any) => ({
        category: s.name,
        score: s.score ?? 0,
    }))

    const interviewTrend = (data?.interview_performance?.trend || []).map((d: any) => ({
        date: d.date,
        score: d.score ?? 0,
    }))

    const interviewStageSplit = (data?.interview_performance?.by_stage || []).map((x: any) => ({
        name: x.stage,
        value: x.count ?? 0,
    }))

    const funnel = (data?.applications_funnel || {
        submitted: 0, responses: 0, interviews: 0, offers: 0,
    })
    const funnelData = [
        { name: 'Submitted', value: funnel.submitted },
        { name: 'Responses', value: funnel.responses },
        { name: 'Interview Calls', value: funnel.interviews },
        { name: 'Offers', value: funnel.offers },
    ]

    const resumeCompletion = data?.resume?.completion || 0
    const portfolioStrength = data?.portfolio?.strength || 0

    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
            {loading ? (
                <div className="w-full flex items-center justify-center py-24">
                    <Loader />
                </div>
            ) : (
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Student Analytics & Job Readiness</h1>
                        <p className="text-sm text-muted-foreground">Track skills, interviews, applications, and portfolio readiness.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="col-span-1 lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Skills Assessment</CardTitle>
                                <CardDescription>Strengths and weaknesses across categories</CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skills}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="category" />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                        <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="col-span-1 lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Interview Performance</CardTitle>
                                <CardDescription>Improvement across mock and real interviews</CardDescription>
                            </CardHeader>
                            <CardContent className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={interviewTrend}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Interview Stages</CardTitle>
                                <CardDescription>Screening, Technical, HR split</CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={interviewStageSplit} dataKey="value" nameKey="name" outerRadius={90} label>
                                            {interviewStageSplit.map((_, idx: number) => (
                                                <Cell key={idx} fill={["#6366f1", "#f59e0b", "#ef4444", "#10b981"][idx % 4]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Application Success Funnel</CardTitle>
                                <CardDescription>From submissions to offers</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {funnelData.map((step, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-medium">{step.name}</span>
                                                <span className="text-muted-foreground">{step.value}</span>
                                            </div>
                                            <div className="h-2 w-full bg-muted rounded">
                                                <div
                                                    className="h-2 bg-primary rounded"
                                                    style={{ width: `${funnel.submitted ? Math.max(3, Math.round((step.value / Math.max(1, funnel.submitted)) * 100)) : 0}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Resume Completion</CardTitle>
                                <CardDescription>Profile and resume strength</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Completion</span>
                                        <span className="text-muted-foreground">{resumeCompletion}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded">
                                        <div className="h-2 bg-primary rounded" style={{ width: `${resumeCompletion}%` }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Portfolio Strength Index</CardTitle>
                                <CardDescription>Projects, keywords, and engagement</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium">Strength</span>
                                        <span className="text-muted-foreground">{portfolioStrength}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded">
                                        <div className="h-2 bg-emerald-500 rounded" style={{ width: `${portfolioStrength}%` }} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </DashboardLayout>
    )
}


