"use client"

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { Home, Users, Building2, GraduationCap, BarChart3 } from 'lucide-react'

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
    { name: 'Colleges', href: '/dashboard/admin/colleges', icon: Building2 },
    { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/dashboard/admin/profile', icon: Users },
]

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const data = await apiClient.getAdminDashboard()
            setStats(data)
        } catch (error) {
            console.error('Error fetching dashboard:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="admin">
            <div className="space-y-6">
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage colleges, students, and platform analytics</p>
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
                                    <CardDescription>Total Colleges</CardDescription>
                                    <CardTitle className="text-3xl">{stats?.total_colleges || 0}</CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Total Students</CardDescription>
                                    <CardTitle className="text-3xl">{stats?.total_students || 0}</CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Active Users</CardDescription>
                                    <CardTitle className="text-3xl">{stats?.active_users || 0}</CardTitle>
                                </CardHeader>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardDescription>Total Assessments</CardDescription>
                                    <CardTitle className="text-3xl">{stats?.total_assessments || 0}</CardTitle>
                                </CardHeader>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Platform Overview</CardTitle>
                                <CardDescription>Key metrics and statistics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Colleges</span>
                                        <span className="font-medium">{stats?.active_colleges || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Active Students</span>
                                        <span className="font-medium">{stats?.active_students || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Assessments This Month</span>
                                        <span className="font-medium">{stats?.assessments_this_month || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Average Completion Rate</span>
                                        <span className="font-medium">{stats?.average_completion_rate || 0}%</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Analytics Placeholder */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Advanced Analytics</CardTitle>
                                <CardDescription>Detailed analytics will be developed by AI team</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-12 text-gray-500">
                                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>Advanced analytics coming soon</p>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </DashboardLayout>
    )
}


