"use client"

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { Progress } from '@/components/ui/progress'
import { apiClient } from '@/lib/api'
import { Home, User, FileText, Briefcase, Zap, BarChart3, Target, ShieldCheck } from 'lucide-react'

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
const BarChart = dynamic(() => import('recharts').then(m => m.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then(m => m.Bar), { ssr: false })

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
    const [timeline, setTimeline] = useState<any[]>([])
    const [filters, setFilters] = useState<{ start_date?: string; end_date?: string; categories: Record<string, boolean> }>({
        start_date: undefined,
        end_date: undefined,
        categories: { assessment: true, interview: true, application: true, resume: true, portfolio: true }
    })

    useEffect(() => {
        const load = async () => {
            try {
                const params = buildParams()
                const analytics = await apiClient.getStudentAnalyticsWithFilters(params)
                const tl = await apiClient.getStudentTimeline(params)
                setData(analytics)
                setTimeline(tl?.timeline || [])
            } catch (e) {
                console.error('Failed to load analytics', e)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const buildParams = () => {
        const categories = Object.entries(filters.categories)
            .filter(([_, v]) => v)
            .map(([k]) => k)
            .join(',')
        return {
            start_date: filters.start_date,
            end_date: filters.end_date,
            categories: categories || undefined,
        }
    }

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

    // Aggregated metrics from backend (with safe fallbacks)
    const overallScore = data?.overall_performance?.average_score || 0
    const readinessIndex = data?.job_readiness?.index || 0
    const topicDistribution = (data?.topic_distribution || []).map((t: any) => ({ name: t.topic, average: t.average }))
    const weeklyActivity = data?.weekly_activity || []

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

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-3 md:items-end">
                        <div className="flex gap-2">
                            <input type="date" className="border rounded px-2 py-1 text-sm bg-background" value={filters.start_date || ''}
                                onChange={e => setFilters(prev => ({ ...prev, start_date: e.target.value || undefined }))} />
                            <input type="date" className="border rounded px-2 py-1 text-sm bg-background" value={filters.end_date || ''}
                                onChange={e => setFilters(prev => ({ ...prev, end_date: e.target.value || undefined }))} />
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                            {Object.keys(filters.categories).map((key) => (
                                <label key={key} className="inline-flex items-center gap-1">
                                    <input type="checkbox" checked={filters.categories[key as keyof typeof filters.categories]}
                                        onChange={e => setFilters(prev => ({ ...prev, categories: { ...prev.categories, [key]: e.target.checked } }))} />
                                    <span className="capitalize">{key}</span>
                                </label>
                            ))}
                        </div>
                        <button className="border rounded px-3 py-1 text-sm" onClick={async () => {
                            setLoading(true)
                            try {
                                const params = buildParams()
                                const analytics = await apiClient.getStudentAnalyticsWithFilters(params)
                                const tl = await apiClient.getStudentTimeline(params)
                                setData(analytics)
                                setTimeline(tl?.timeline || [])
                            } finally {
                                setLoading(false)
                            }
                        }}>Apply</button>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <Target className="h-4 w-4" /> Overall Score
                                </CardTitle>
                                <CardDescription>Average across completed assessments</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-2">{Math.round(overallScore)}%</div>
                                <Progress value={overallScore} className="h-2" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" /> Job Readiness
                                </CardTitle>
                                <CardDescription>Weighted composite (mock, resume, skills, interview, portfolio)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-2">{Math.round(readinessIndex)}%</div>
                                <Progress value={readinessIndex} className="h-2" />
                            </CardContent>
                        </Card>
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
                                        <PolarAngleAxis dataKey="category" scale="auto" reversed={false} />
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

                    {/* Topic Distribution & Weekly Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Topic Distribution</CardTitle>
                                <CardDescription>Average performance by section</CardDescription>
                            </CardHeader>
                            <CardContent className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topicDistribution}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" hide={false} />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Bar dataKey="average" fill="#6366f1" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <CardTitle>Weekly Activity</CardTitle>
                                <CardDescription>Engagement over the last 4 weeks</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-14 gap-1">
                                    {weeklyActivity.map((d: any, idx: number) => {
                                        const c = d.count || 0
                                        const bg = c === 0 ? 'bg-gray-200' : c < 2 ? 'bg-emerald-200' : c < 4 ? 'bg-emerald-400' : 'bg-emerald-600'
                                        return (
                                            <div key={idx} className={`w-4 h-4 ${bg} rounded`} title={`${d.date}: ${c} activities`} />
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Activity Timeline</CardTitle>
                            <CardDescription>Chronological view of your activities</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {timeline.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm border-b pb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="capitalize font-medium">{t.type}</span>
                                            <span className="text-muted-foreground">{t.subtype}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {t.score != null && <span>{Math.round(t.score)}</span>}
                                            <span className="text-muted-foreground">{new Date(t.date).toLocaleString()}</span>
                                        </div>
                                    </div>
                                ))}
                                {timeline.length === 0 && <div className="text-sm text-muted-foreground">No activities found for the selected filters.</div>}
                            </div>
                        </CardContent>
                    </Card>

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
                                            {interviewStageSplit.map((entry: { name: string; value: number }, idx: number) => (
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


