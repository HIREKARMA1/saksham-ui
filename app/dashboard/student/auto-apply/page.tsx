'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
    Briefcase, Home, User, FileText, Zap, Settings, CheckCircle, 
    XCircle, Clock, TrendingUp, AlertCircle, Loader2, Eye, Play,
    RefreshCw, Download
} from 'lucide-react'
import { apiClient } from '@/lib/api'
import { AnimatedBackground } from '@/components/ui/animated-background'

interface JobApplication {
    id: string
    job_title: string
    company_name: string
    job_location?: string
    job_url?: string
    status: string
    applied_at?: string
    platform: string
    skills_used?: string[]
    created_at: string
}

interface Session {
    id: string
    platform: string
    location: string
    experience_years: number
    max_applications: number
    total_applications: number
    last_run_at?: string
    skills_count: number
    created_at: string
}

interface Skills {
    id: string
    extracted_skills: string[]
    skill_categories: {
        technical: string[]
        soft: string[]
        domain: string[]
        tools: string[]
    }
    confidence_score?: number
}

export default function AutoJobApplyPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('configure')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    
    // State
    const [sessions, setSessions] = useState<Session[]>([])
    const [applications, setApplications] = useState<JobApplication[]>([])
    const [skills, setSkills] = useState<Skills | null>(null)
    const [stats, setStats] = useState<any>(null)
    
    // Form state
    const [formData, setFormData] = useState({
        platform: 'FOUNDIT',
        platform_email: '',
        platform_password: '',
        location: 'Delhi',
        experience_years: 0,
        max_applications: 5,
        use_resume_skills: true,
        custom_skills: ''
    })
    
    // Running job application
    const [runningSessionId, setRunningSessionId] = useState<string | null>(null)
    
    useEffect(() => {
        fetchData()
    }, [activeTab])
    
    const fetchData = async () => {
        try {
            if (activeTab === 'configure' || activeTab === 'sessions') {
                const sessionsData = await apiClient.client.get('/auto-apply/sessions')
                setSessions(sessionsData.data)
            }
            
            if (activeTab === 'applications') {
                const [appsData, statsData] = await Promise.all([
                    apiClient.client.get('/auto-apply/applications'),
                    apiClient.client.get('/auto-apply/applications/stats')
                ])
                setApplications(appsData.data)
                setStats(statsData.data)
            }
            
            if (activeTab === 'skills' || formData.use_resume_skills) {
                try {
                    const skillsData = await apiClient.client.get('/auto-apply/skills')
                    setSkills(skillsData.data)
                } catch (err: any) {
                    if (!err.message?.includes('No resume')) {
                        console.error('Skills fetch error:', err)
                    }
                }
            }
        } catch (err: any) {
            console.error('Fetch error:', err)
        }
    }
    
    const handleCreateSession = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')
        
        try {
            const payload = {
                ...formData,
                custom_skills: formData.custom_skills ? formData.custom_skills.split(',').map(s => s.trim()) : null
            }
            
            const newSession = await apiClient.client.post('/auto-apply/sessions', payload)
            setSuccess('Session created successfully!')
            setSessions([newSession.data, ...sessions])
            
            // Reset form
            setFormData({
                ...formData,
                platform_email: '',
                platform_password: '',
                custom_skills: ''
            })
            
            setTimeout(() => setActiveTab('sessions'), 1500)
        } catch (err: any) {
            setError(err.message || 'Failed to create session')
        } finally {
            setLoading(false)
        }
    }
    
    const handleRunSession = async (sessionId: string) => {
        setRunningSessionId(sessionId)
        setError('')
        setSuccess('')
        
        try {
            const result = await apiClient.client.post(`/auto-apply/sessions/${sessionId}/run`, {})
            setSuccess(`Successfully applied to ${result.data.total_applications} jobs!`)
            fetchData()
        } catch (err: any) {
            setError(err.message || 'Failed to run job applications')
        } finally {
            setRunningSessionId(null)
        }
    }
    
    const handleRefreshSkills = async () => {
        setLoading(true)
        try {
            const newSkills = await apiClient.client.post('/auto-apply/skills/refresh', {})
            setSkills(newSkills.data)
            setSuccess('Skills refreshed successfully!')
        } catch (err: any) {
            setError(err.message || 'Failed to refresh skills')
        } finally {
            setLoading(false)
        }
    }
    
    const getStatusBadge = (status: string) => {
        const variants: any = {
            APPLIED: 'default',
            PENDING: 'secondary',
            FAILED: 'destructive',
            SKIPPED: 'outline'
        }
        
        const icons: any = {
            APPLIED: <CheckCircle className="h-3 w-3" />,
            PENDING: <Clock className="h-3 w-3" />,
            FAILED: <XCircle className="h-3 w-3" />,
            SKIPPED: <AlertCircle className="h-3 w-3" />
        }
        
        return (
            <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
                {icons[status]}
                {status}
            </Badge>
        )
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Zap className="h-8 w-8 text-yellow-600" />
                            Automatic Job Application
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Apply to multiple jobs automatically using AI-extracted skills
                        </p>
                    </div>
                </div>

                {/* Alerts */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                
                {success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                )}

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="configure">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                        </TabsTrigger>
                        <TabsTrigger value="sessions">
                            <Briefcase className="h-4 w-4 mr-2" />
                            Sessions
                        </TabsTrigger>
                        <TabsTrigger value="applications">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Applications
                        </TabsTrigger>
                        <TabsTrigger value="skills">
                            <FileText className="h-4 w-4 mr-2" />
                            My Skills
                        </TabsTrigger>
                    </TabsList>

                    {/* Configure Tab */}
                    <TabsContent value="configure" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create New Application Session</CardTitle>
                                <CardDescription>
                                    Configure platform credentials and job preferences
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateSession} className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="platform">Platform</Label>
                                            <select
                                                id="platform"
                                                className="w-full mt-1 p-2 border rounded-md"
                                                value={formData.platform}
                                                onChange={(e) => setFormData({...formData, platform: e.target.value})}
                                            >
                                                <option value="FOUNDIT">Foundit (Monster India)</option>
                                                <option value="NAUKRI" disabled>Naukri (Coming Soon)</option>
                                                <option value="LINKEDIN" disabled>LinkedIn (Coming Soon)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <Label htmlFor="platform_email">Platform Email/Phone</Label>
                                            <Input
                                                id="platform_email"
                                                type="text"
                                                placeholder="your@email.com or phone"
                                                value={formData.platform_email}
                                                onChange={(e) => setFormData({...formData, platform_email: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="platform_password">Platform Password</Label>
                                            <Input
                                                id="platform_password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={formData.platform_password}
                                                onChange={(e) => setFormData({...formData, platform_password: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="location">Location</Label>
                                            <Input
                                                id="location"
                                                type="text"
                                                placeholder="Delhi, Mumbai, Bangalore..."
                                                value={formData.location}
                                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="experience">Experience (Years)</Label>
                                            <Input
                                                id="experience"
                                                type="number"
                                                min="0"
                                                max="30"
                                                value={formData.experience_years}
                                                onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value)})}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="max_apps">Max Applications</Label>
                                            <Input
                                                id="max_apps"
                                                type="number"
                                                min="1"
                                                max="50"
                                                value={formData.max_applications}
                                                onChange={(e) => setFormData({...formData, max_applications: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                id="use_resume"
                                                checked={formData.use_resume_skills}
                                                onChange={(e) => setFormData({...formData, use_resume_skills: e.target.checked})}
                                            />
                                            <Label htmlFor="use_resume" className="cursor-pointer">
                                                Use AI-extracted skills from my resume
                                            </Label>
                                        </div>
                                        
                                        {skills && formData.use_resume_skills && (
                                            <div className="ml-6 p-3 bg-blue-50 rounded-md">
                                                <p className="text-sm font-medium mb-2">
                                                    {skills.extracted_skills.length} skills will be used:
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                    {skills.extracted_skills.slice(0, 10).map((skill, idx) => (
                                                        <Badge key={idx} variant="outline">{skill}</Badge>
                                                    ))}
                                                    {skills.extracted_skills.length > 10 && (
                                                        <Badge variant="secondary">+{skills.extracted_skills.length - 10} more</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {!formData.use_resume_skills && (
                                        <div>
                                            <Label htmlFor="custom_skills">Custom Skills (comma-separated)</Label>
                                            <Input
                                                id="custom_skills"
                                                type="text"
                                                placeholder="Python, JavaScript, React, AWS, Docker..."
                                                value={formData.custom_skills}
                                                onChange={(e) => setFormData({...formData, custom_skills: e.target.value})}
                                            />
                                        </div>
                                    )}

                                    <Button type="submit" disabled={loading} className="w-full">
                                        {loading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                                        ) : (
                                            <><Zap className="mr-2 h-4 w-4" /> Create Session</>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Sessions Tab */}
                    <TabsContent value="sessions" className="space-y-4">
                        {sessions.length === 0 ? (
                            <Card>
                                <CardContent className="p-12 text-center">
                                    <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-600">No sessions created yet</p>
                                    <Button onClick={() => setActiveTab('configure')} className="mt-4">
                                        Create First Session
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            sessions.map((session) => (
                                <Card key={session.id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="flex items-center gap-2">
                                                    {session.platform}
                                                    <Badge>{session.location}</Badge>
                                                </CardTitle>
                                                <CardDescription>
                                                    Created {new Date(session.created_at).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                            <Button
                                                onClick={() => handleRunSession(session.id)}
                                                disabled={runningSessionId === session.id}
                                                size="sm"
                                            >
                                                {runningSessionId === session.id ? (
                                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Running...</>
                                                ) : (
                                                    <><Play className="mr-2 h-4 w-4" /> Run Now</>
                                                )}
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Experience</p>
                                                <p className="font-semibold">{session.experience_years} years</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Max Jobs</p>
                                                <p className="font-semibold">{session.max_applications}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Skills</p>
                                                <p className="font-semibold">{session.skills_count}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Applied</p>
                                                <p className="font-semibold text-green-600">{session.total_applications}</p>
                                            </div>
                                        </div>
                                        {session.last_run_at && (
                                            <p className="text-xs text-gray-500 mt-4">
                                                Last run: {new Date(session.last_run_at).toLocaleString()}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>

                    {/* Applications Tab */}
                    <TabsContent value="applications" className="space-y-6">
                        {stats && (
                            <div className="grid md:grid-cols-4 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Total</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold">{stats.total_applications}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Applied</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold text-green-600">{stats.applied}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Pending</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Success Rate</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-2xl font-bold text-blue-600">{stats.success_rate}%</p>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Application History</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {applications.length === 0 ? (
                                    <p className="text-center text-gray-600 py-8">No applications yet</p>
                                ) : (
                                    <div className="space-y-3">
                                        {applications.map((app) => (
                                            <div key={app.id} className="border rounded-lg p-4 hover:bg-gray-50">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-semibold">{app.job_title}</h3>
                                                        <p className="text-sm text-gray-600">{app.company_name}</p>
                                                        {app.job_location && (
                                                            <p className="text-xs text-gray-500">{app.job_location}</p>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(app.status)}
                                                </div>
                                                
                                                {app.skills_used && app.skills_used.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {app.skills_used.slice(0, 5).map((skill, idx) => (
                                                            <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                                                    <span>{app.platform}</span>
                                                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                                                </div>
                                                
                                                {app.job_url && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-2 w-full"
                                                        onClick={() => window.open(app.job_url, '_blank')}
                                                    >
                                                        <Eye className="h-3 w-3 mr-2" />
                                                        View Job
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Skills Tab */}
                    <TabsContent value="skills">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Extracted Skills from Resume</CardTitle>
                                        <CardDescription>AI-analyzed skills using Cohere</CardDescription>
                                    </div>
                                    <Button onClick={handleRefreshSkills} disabled={loading} variant="outline">
                                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!skills ? (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-600">No resume uploaded or skills not extracted yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {/* All Skills - No categorization to avoid making anyone feel bad */}
                                        <div>
                                            <h3 className="font-semibold mb-3 text-lg">Your Skills ({skills.extracted_skills.length})</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {skills.extracted_skills.map((skill, idx) => (
                                                    <Badge key={idx} className="bg-blue-600 text-white px-3 py-1">{skill}</Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {skills.confidence_score && (
                                            <div className="pt-4 border-t">
                                                <p className="text-sm text-gray-600">
                                                    Confidence Score: <span className="font-semibold">{(skills.confidence_score * 100).toFixed(0)}%</span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    )
}
