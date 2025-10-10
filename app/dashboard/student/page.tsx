"use client"

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { Home, User, FileText, Briefcase, ClipboardList } from 'lucide-react'
import Link from 'next/link'

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
    { name: 'Assessments', href: '/dashboard/student/assessments', icon: ClipboardList },
]

export default function StudentDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const data = await apiClient.getStudentDashboard()
            setStats(data)
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
                                <Link href="/dashboard/student/assessments">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ClipboardList className="mr-2 h-4 w-4" />
                                        Take Assessment
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

                        {/* AI Analytics Placeholder */}
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
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}

