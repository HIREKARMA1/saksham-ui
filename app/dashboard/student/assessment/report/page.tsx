"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/lib/api'
import { 
    Home, User, FileText, Briefcase, ClipboardList,
    ArrowLeft, Download, Share2, TrendingUp, Target,
    Brain, Mic, CheckCircle, AlertCircle, Lightbulb,
    Award, BarChart3, PieChart, LineChart, Eye, Users, MessageCircle
} from 'lucide-react'
import { 
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    LineChart as RechartsLineChart, Line,
    PieChart as RechartsPieChart, Pie, Cell,
    ResponsiveContainer
} from 'recharts'
import toast from 'react-hot-toast'

// ✅ ADD THESE DEFINITIONS
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
    { number: 3, name: "Group Discussion", icon: Users, color: "bg-teal-500" },
    { number: 4, name: "Technical MCQ", icon: ClipboardList, color: "bg-purple-500" },
    { number: 5, name: "Technical Interview", icon: Mic, color: "bg-orange-500" },
    { number: 6, name: "HR Interview", icon: Target, color: "bg-pink-500" }
]

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#3b82f6']

export default function AssessmentReportPage() {
    // ... rest of the code

    const [report, setReport] = useState<any>(null)
    const [qaData, setQaData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [selectedRound, setSelectedRound] = useState<number | null>(null)
    
    const router = useRouter()
    const searchParams = useSearchParams()
    const assessmentId = searchParams.get('id')

    useEffect(() => {
        if (assessmentId) {
            loadReport()
            loadQAData()
        } else {
            router.push('/dashboard/student/assessment')
        }
    }, [assessmentId])

    const loadReport = async () => {
        try {
            const data = await apiClient.getAssessmentReportWithQuestions(assessmentId!)
            setReport(data)
        } catch (error) {
            console.error('Error loading report:', error)
            toast.error('Failed to load assessment report')
        } finally {
            setLoading(false)
        }
    }

    const loadQAData = async () => {
        try {
            const data = await apiClient.getAssessmentQA(assessmentId!)
            console.log('QA Data received:', data)
            
            // Log GD round specifically
            const gdRound = data?.rounds?.find((r: any) => 
                String(r.round_type).toLowerCase() === 'group_discussion'
            )
            if (gdRound) {
                console.log('GD Round found:', {
                    round_number: gdRound.round_number,
                    has_conversation: !!gdRound.conversation,
                    conversation_length: gdRound.conversation?.length || 0,
                    conversation_sample: gdRound.conversation?.[0]
                })
            } else {
                console.log('No GD round found in QA data')
            }
            
            setQaData(data)
        } catch (error) {
            console.error('Error loading Q&A data:', error)
        }
    }

    // Calculate statistics
    const calculateStats = () => {
        if (!qaData?.rounds) return null
        
        let totalQuestions = 0
        let correctAnswers = 0
        let totalScore = 0
        let maxScore = 0
        
        qaData.rounds.forEach((round: any) => {
            round.questions.forEach((q: any) => {
                totalQuestions++
                if (q.is_correct) correctAnswers++
                totalScore += q.score || 0
                maxScore += q.max_score || 0
            })
        })
        
        return {
            totalQuestions,
            correctAnswers,
            wrongAnswers: totalQuestions - correctAnswers,
            accuracy: totalQuestions > 0 ? (correctAnswers / totalQuestions * 100) : 0,
            scorePercentage: maxScore > 0 ? (totalScore / maxScore * 100) : 0
        }
    }

    // Prepare radar chart data
    const prepareRadarData = () => {
        if (!report?.rounds) return []
        
        return report.rounds.map((round: any) => ({
            subject: roundInfo.find(r => r.number === round.round_number)?.name || `Round ${round.round_number}`,
            score: round.percentage || 0,
            fullMark: 100
        }))
    }

    // Prepare question distribution data
    const prepareQuestionDistribution = () => {
        const stats = calculateStats()
        if (!stats) return []
        
        return [
            { name: 'Correct', value: stats.correctAnswers, color: '#10b981' },
            { name: 'Incorrect', value: stats.wrongAnswers, color: '#ef4444' }
        ]
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600'
        if (score >= 60) return 'text-yellow-600'
        return 'text-red-600'
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

    const stats = calculateStats()

    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push('/dashboard/student/assessment')}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Performance Dashboard
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {report?.job_role?.title} • {new Date(report?.completed_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => toast.success('Share feature coming soon!')}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                        </Button>
                        <Button onClick={() => toast.success('PDF download coming soon!')}>
                            <Download className="h-4 w-4 mr-2" />
                            Export PDF
                        </Button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                Overall Score
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-4xl font-bold ${getScoreColor(report?.overall_score || 0)}`}>
                                {report?.overall_score?.toFixed(1)}%
                            </div>
                            <Progress value={report?.overall_score} className="h-2 mt-2" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-2">
                                <Award className="h-4 w-4" />
                                Readiness Index
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-4xl font-bold ${getScoreColor(report?.readiness_index || 0)}`}>
                                {report?.readiness_index?.toFixed(1)}%
                            </div>
                            <Progress value={report?.readiness_index} className="h-2 mt-2" />
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-purple-500">
                        <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                Accuracy
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-purple-600">
                                {stats?.accuracy.toFixed(1)}%
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                {stats?.correctAnswers}/{stats?.totalQuestions} correct
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                        <CardHeader className="pb-3">
                            <CardDescription className="flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Performance
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Badge 
                                variant={report?.overall_score >= 80 ? 'default' : report?.overall_score >= 60 ? 'secondary' : 'destructive'}
                                className="text-lg px-4 py-2"
                            >
                                {report?.overall_score >= 80 ? 'Excellent' : 
                                 report?.overall_score >= 60 ? 'Good' : 'Needs Improvement'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs for different views */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="detailed">
                            <Eye className="h-4 w-4 mr-2" />
                            Detailed Analysis
                        </TabsTrigger>
                        <TabsTrigger value="questions">
                            <ClipboardList className="h-4 w-4 mr-2" />
                            All Questions
                        </TabsTrigger>
                        <TabsTrigger value="insights">
                            <Lightbulb className="h-4 w-4 mr-2" />
                            AI Insights
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Radar Chart - Skills Assessment */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="h-5 w-5" />
                                        Skills Assessment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadarChart data={prepareRadarData()}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                                            <Radar name="Your Score" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Pie Chart - Question Distribution */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChart className="h-5 w-5" />
                                        Answer Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RechartsPieChart>
                                            <Pie
                                                data={prepareQuestionDistribution()}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={100}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {prepareQuestionDistribution().map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </RechartsPieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bar Chart - Round Scores */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Round-wise Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={prepareRadarData()}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="subject" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Bar dataKey="score" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Detailed Analysis Tab */}
                    <TabsContent value="detailed" className="space-y-6">
                        {/* Round Cards */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {report?.rounds?.map((round: any) => {
                                const roundConfig = roundInfo.find(r => r.number === round.round_number)
                                return (
                                    <Card key={round.round_number} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { setSelectedRound(round.round_number); setActiveTab('round'); }}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-3 rounded-xl ${roundConfig?.color} text-white`}>
                                                    {(() => { const Icon = roundConfig?.icon as any; return Icon ? <Icon className="h-5 w-5" /> : null })()}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">{roundConfig?.name}</CardTitle>
                                                    <CardDescription>Round {round.round_number}</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">Score</span>
                                                <span className={`text-2xl font-bold ${getScoreColor(round.percentage || 0)}`}>
                                                    {round.percentage?.toFixed(1)}%
                                                </span>
                                            </div>
                                            <Progress value={round.percentage} className="h-2" />
                                            {round.ai_feedback && (
                                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                                    {typeof round.ai_feedback === 'string' ? (
                                                        <p className="line-clamp-2">{round.ai_feedback}</p>
                                                    ) : round.ai_feedback.strengths && round.ai_feedback.strengths.length > 0 ? (
                                                        <p className="line-clamp-2">✓ {round.ai_feedback.strengths[0]}</p>
                                                    ) : (
                                                        <p className="line-clamp-2">Evaluation completed</p>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </TabsContent>

                    {/* Round Questions Tab (dynamic) */}
                    <TabsContent value="round" className="space-y-6">
                        {selectedRound !== null && qaData?.rounds?.filter((r: any) => r.round_number === selectedRound).map((round: any) => {
                            console.log('Rendering round:', {
                                round_number: round.round_number,
                                round_type: round.round_type,
                                all_keys: Object.keys(round),
                                has_conversation_key: 'conversation' in round,
                                conversation_value: round.conversation,
                                conversation_type: typeof round.conversation,
                                conversation_is_array: Array.isArray(round.conversation),
                                conversation_length: round.conversation?.length
                            });
                            
                            return (
                            <Card key={round.round_number} className="overflow-hidden border-0 shadow-md">
                                <CardHeader>
                                    <CardTitle>
                                        Round {round.round_number} - {round.round_type.replace('_', ' ').toUpperCase()}
                                    </CardTitle>
                                    <CardDescription>
                                        {round.round_type === 'group_discussion' ? (
                                            `Score: ${round.percentage?.toFixed(1)}%`
                                        ) : (
                                            `Score: ${round.percentage?.toFixed(1)}% (${round.score}/${round.questions?.reduce((sum: number, q: any) => sum + q.max_score, 0) || 0} points)`
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Special rendering when the selected round is Group Discussion */}
                                    {round.round_type === 'group_discussion' ? (
                                        <div className="space-y-6">
                                            {/* Score strip */}
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                                <div className={`text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600`}>
                                                    {Math.round(round.percentage || 0)}%
                                                </div>
                                                <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600" style={{ width: `${Math.min(100, Math.max(0, round.percentage || 0))}%` }} />
                                                </div>
                                            </div>

                                            {/* Criteria */}
                                            {round.ai_feedback?.criteria_scores && (
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                    {[
                                                        { name: 'Communication', value: round.ai_feedback.criteria_scores.communication, color: 'from-sky-500 to-blue-600', emoji: '💬' },
                                                        { name: 'Topic Understanding', value: round.ai_feedback.criteria_scores.topic_understanding, color: 'from-fuchsia-500 to-purple-600', emoji: '🧠' },
                                                        { name: 'Interaction', value: round.ai_feedback.criteria_scores.interaction, color: 'from-emerald-500 to-teal-600', emoji: '🤝' },
                                                    ].map((c) => (
                                                        <div key={c.name} className="rounded-2xl border bg-white/80 dark:bg-gray-900/60 backdrop-blur p-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2 font-semibold">
                                                                    <span>{c.emoji}</span>
                                                                    {c.name}
                                                                </div>
                                                                <div className="text-xl font-bold">{c.value}%</div>
                                                            </div>
                                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full bg-gradient-to-r ${c.color}`} style={{ width: `${Math.min(100, Math.max(0, c.value || 0))}%` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Strengths & Improvements */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {round.ai_feedback?.strengths?.length > 0 && (
                                                    <div className="rounded-2xl border bg-green-50 dark:bg-green-900/20 p-4">
                                                        <div className="font-semibold text-green-700 dark:text-green-300 mb-2 flex items-center gap-2"><CheckCircle className="h-5 w-5"/> Strengths</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {round.ai_feedback.strengths.map((s: string, i: number) => (
                                                                <span key={i} className="px-3 py-1 rounded-full bg-white dark:bg-green-900/40 border text-sm">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {round.ai_feedback?.improvements?.length > 0 && (
                                                    <div className="rounded-2xl border bg-orange-50 dark:bg-orange-900/20 p-4">
                                                        <div className="font-semibold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2"><Lightbulb className="h-5 w-5"/> Areas to Improve</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {round.ai_feedback.improvements.map((s: string, i: number) => (
                                                                <span key={i} className="px-3 py-1 rounded-full bg-white dark:bg-orange-900/40 border text-sm">{s}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Conversation */}
                                            {(() => {
                                                console.log('Round conversation check:', {
                                                    round_number: round.round_number,
                                                    has_conversation: !!round.conversation,
                                                    conversation_length: round.conversation?.length || 0,
                                                    conversation_type: typeof round.conversation,
                                                    full_round_keys: Object.keys(round)
                                                })
                                                return null
                                            })()}
                                            {round.conversation?.length > 0 ? (
                                                <div className="space-y-3">
                                                    <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><MessageCircle className="h-5 w-5"/> Conversation Transcript</div>
                                                    <div className="max-h-[420px] overflow-auto pr-1">
                                                        {round.conversation.map((turn: any, idx: number) => (
                                                            <div key={idx} className="mb-4">
                                                                {turn.user && (
                                                                    <div className="flex items-start gap-3">
                                                                        <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-bold">S</div>
                                                                        <div className="bg-white dark:bg-gray-800 border rounded-2xl px-3 py-2 shadow-sm max-w-[85%] text-sm">
                                                                            {turn.user}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="mt-2 space-y-2 pl-11">
                                                                    {(turn.agents || []).map((a: any, i: number) => (
                                                                        <div key={i} className="flex items-start gap-3">
                                                                            <div className="shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center text-[10px] font-bold">{String(a.name || 'AI').charAt(0)}</div>
                                                                            <div className="bg-slate-50 dark:bg-gray-900 border rounded-2xl px-3 py-2 shadow-sm max-w-[80%]">
                                                                                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">{a.name || 'AI'}</div>
                                                                                <div className="text-sm text-slate-800 dark:text-slate-200">{a.text}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-4 border border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                                    <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
                                                        <AlertCircle className="h-5 w-5" />
                                                        <div>
                                                            <div className="font-semibold">No Conversation Data</div>
                                                            <div className="text-sm">This assessment was completed before conversation tracking was implemented. Please run a new GD to see the full transcript.</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {round.questions.map((q: any, idx: number) => (
                                                <div key={q.id} className="p-4 border rounded-lg space-y-3">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <Badge variant="outline">Q{idx + 1}</Badge>
                                                                <Badge variant={q.is_correct ? 'default' : 'destructive'}>
                                                                    {q.is_correct ? 'Correct' : 'Incorrect'}
                                                                </Badge>
                                                                <span className="text-sm text-gray-500">
                                                                    {q.score}/{q.max_score} points
                                                                </span>
                                                            </div>
                                                            <p className="font-medium mb-2">{q.text}</p>
                                                            <div className="grid md:grid-cols-2 gap-3 text-sm">
                                                                <div>
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Your Answer:</span>
                                                                    <p className={q.is_correct ? 'text-green-600' : 'text-red-600'}>
                                                                        {q.student_response || (q.response_audio_url ? '🎤 Voice Response' : '—')}
                                                                    </p>
                                                                </div>
                                                                {q.correct_answer && (
                                                                    <div>
                                                                        <span className="font-medium text-gray-700 dark:text-gray-300">Correct Answer:</span>
                                                                        <p className="text-green-600">{q.correct_answer}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {q.ai_feedback && (
                                                                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                        <strong>💡 Feedback:</strong> {typeof q.ai_feedback === 'string' ? q.ai_feedback : JSON.stringify(q.ai_feedback)}
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )})}
                        <Button variant="outline" onClick={() => { setSelectedRound(null); setActiveTab('detailed'); }}>
                            Back to All Rounds
                        </Button>
                    </TabsContent>

                    {/* All Questions Tab */}
                    <TabsContent value="questions" className="space-y-6">
                        {qaData?.rounds?.map((round: any) => (
                            <Card key={round.round_number}>
                                <CardHeader>
                                    <CardTitle>
                                        Round {round.round_number} - {round.round_type.replace('_', ' ').toUpperCase()}
                                    </CardTitle>
                                    <CardDescription>
                                        {round.round_type === 'group_discussion' ? (
                                            `Score: ${round.percentage?.toFixed(1)}%`
                                        ) : (
                                            `Score: ${round.percentage?.toFixed(1)}% (${round.score}/${round.questions?.reduce((sum: number, q: any) => sum + q.max_score, 0) || 0} points)`
                                        )}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {/* Special handling for Group Discussion */}
                                    {round.round_type === 'group_discussion' ? (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-900/20 dark:to-blue-900/20 rounded-xl border-2 border-teal-200">
                                                <h4 className="text-lg font-bold mb-3 flex items-center gap-2">
                                                    <Users className="h-5 w-5" />
                                                    Group Discussion Performance
                                                </h4>
                                                {round.ai_feedback && typeof round.ai_feedback === 'object' && round.ai_feedback.criteria_scores ? (
                                                    <div className="space-y-4">
                                                        {/* Criteria Scores */}
                                                        {round.ai_feedback.criteria_scores && (
                                                            <div className="grid md:grid-cols-3 gap-4">
                                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Communication</div>
                                                                    <div className="text-2xl font-bold text-blue-600">
                                                                        {round.ai_feedback.criteria_scores.communication}%
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Topic Understanding</div>
                                                                    <div className="text-2xl font-bold text-purple-600">
                                                                        {round.ai_feedback.criteria_scores.topic_understanding}%
                                                                    </div>
                                                                </div>
                                                                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                                                    <div className="text-sm text-gray-600 dark:text-gray-400">Interaction</div>
                                                                    <div className="text-2xl font-bold text-green-600">
                                                                        {round.ai_feedback.criteria_scores.interaction}%
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Strengths */}
                                                        {round.ai_feedback.strengths && round.ai_feedback.strengths.length > 0 && (
                                                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                                                <div className="font-semibold text-green-700 dark:text-green-400 mb-2">✓ Strengths</div>
                                                                <ul className="space-y-1 text-sm">
                                                                    {round.ai_feedback.strengths.map((s: string, i: number) => (
                                                                        <li key={i} className="flex items-start gap-2">
                                                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                                                            <span>{s}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Improvements */}
                                                        {round.ai_feedback.improvements && round.ai_feedback.improvements.length > 0 && (
                                                            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                                                                <div className="font-semibold text-orange-700 dark:text-orange-400 mb-2">💡 Areas to Improve</div>
                                                                <ul className="space-y-1 text-sm">
                                                                    {round.ai_feedback.improvements.map((imp: string, i: number) => (
                                                                        <li key={i} className="flex items-start gap-2">
                                                                            <Lightbulb className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                                                                            <span>{imp}</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <p className="text-gray-600 dark:text-gray-400 mb-4">Discussion evaluation pending or not available.</p>
                                                        {round.questions.length > 0 && round.questions[0].student_response && (
                                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                                                                <div className="text-sm font-semibold mb-2">Discussion Transcript:</div>
                                                                <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                                                    {(() => {
                                                                        try {
                                                                            const data = JSON.parse(round.questions[0].student_response);
                                                                            if (data.responses && Array.isArray(data.responses)) {
                                                                                return data.responses.map((r: any, i: number) => (
                                                                                    <div key={i} className="mb-3 pb-3 border-b last:border-0">
                                                                                        <div className="font-medium text-blue-600">You:</div>
                                                                                        <div className="ml-3 mb-2">{r.userResponse}</div>
                                                                                        {r.aiQuestion && (
                                                                                            <>
                                                                                                <div className="font-medium text-purple-600">Participants:</div>
                                                                                                <div className="ml-3 text-gray-600 dark:text-gray-400">{r.aiQuestion}</div>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                ));
                                                                            }
                                                                            return <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>;
                                                                        } catch {
                                                                            return round.questions[0].student_response;
                                                                        }
                                                                    })()}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                    <div className="space-y-4">
                                        {round.questions.map((q: any, idx: number) => (
                                            <div key={q.id} className="p-4 border rounded-lg space-y-3">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Badge variant="outline">Q{idx + 1}</Badge>
                                                            <Badge variant={q.is_correct ? 'default' : 'destructive'}>
                                                                {q.is_correct ? 'Correct' : 'Incorrect'}
                                                            </Badge>
                                                            <span className="text-sm text-gray-500">
                                                                {q.score}/{q.max_score} points
                                                            </span>
                                                        </div>
                                                        <p className="font-medium mb-2">{q.text}</p>
                                                        
                                                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                                                            <div>
                                                                <span className="font-medium text-gray-700 dark:text-gray-300">Your Answer:</span>
                                                                <p className={q.is_correct ? 'text-green-600' : 'text-red-600'}>
                                                                    {q.student_response || (q.response_audio_url ? '🎤 Voice Response' : '—')}
                                                                </p>
                                                            </div>
                                                            {q.correct_answer && (
                                                                <div>
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Correct Answer:</span>
                                                                    <p className="text-green-600">{q.correct_answer}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {q.ai_feedback && (
                                                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                                    <strong>💡 Feedback:</strong> {typeof q.ai_feedback === 'string' ? q.ai_feedback : JSON.stringify(q.ai_feedback)}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* AI Insights Tab */}
                    <TabsContent value="insights" className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Strengths */}
                            {report?.detailed_analysis?.strengths?.length > 0 && (
                                <Card className="border-l-4 border-l-green-500">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-green-600">
                                            <Award className="h-5 w-5" />
                                            Your Strengths
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {report.detailed_analysis.strengths.map((strength: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Weaknesses */}
                            {report?.detailed_analysis?.weaknesses?.length > 0 && (
                                <Card className="border-l-4 border-l-orange-500">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-orange-600">
                                            <AlertCircle className="h-5 w-5" />
                                            Areas to Improve
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {report.detailed_analysis.weaknesses.map((weakness: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                    <span>{weakness}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Recommendations */}
                        {report?.detailed_analysis?.recommendations?.length > 0 && (
                            <Card className="border-l-4 border-l-blue-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Lightbulb className="h-5 w-5" />
                                        Personalized Recommendations
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {report.detailed_analysis.recommendations.map((rec: string, index: number) => (
                                            <div key={index} className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-lg">
                                                <p className="flex items-start gap-2">
                                                    <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                                    <span>{rec}</span>
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>

                {/* Next Steps */}
                <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
                    <CardHeader>
                        <CardTitle>What's Next?</CardTitle>
                        <CardDescription>Continue your preparation journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-3">
                            <Button onClick={() => router.push('/dashboard/student/assessment')}>
                                Take Another Assessment
                            </Button>
                            <Button variant="outline" onClick={() => router.push('/dashboard/student/jobs')}>
                                Browse Jobs
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
