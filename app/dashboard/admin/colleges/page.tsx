"use client"

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api'
import { Home, Users, Building2, GraduationCap, BarChart3, Plus, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home },
    { name: 'Colleges', href: '/dashboard/admin/colleges', icon: Building2 },
    { name: 'Students', href: '/dashboard/admin/students', icon: GraduationCap },
    { name: 'Analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/dashboard/admin/profile', icon: Users },
]

export default function AdminColleges() {
    const [colleges, setColleges] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)

    useEffect(() => {
        fetchColleges()
    }, [])

    const fetchColleges = async () => {
        try {
            const data = await apiClient.getColleges()
            setColleges(data.colleges || [])
        } catch (error) {
            console.error('Error fetching colleges:', error)
            toast.error('Failed to load colleges')
        } finally {
            setLoading(false)
        }
    }

    const filteredColleges = colleges.filter(college =>
        college.college_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        college.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="admin">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Colleges</h1>
                        <p className="text-gray-600 dark:text-gray-400">Manage college accounts</p>
                    </div>
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create College
                    </Button>
                </div>

                {/* Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search colleges..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Colleges List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>All Colleges ({filteredColleges.length})</CardTitle>
                            <CardDescription>View and manage college accounts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredColleges.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No colleges found</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredColleges.map((college) => (
                                        <div
                                            key={college.id}
                                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                        >
                                            <div className="flex-1">
                                                <h3 className="font-medium">{college.college_name || college.name}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{college.email}</p>
                                                {college.phone && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{college.phone}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={college.status === 'active' ? 'success' : 'secondary'}>
                                                    {college.status}
                                                </Badge>
                                                <Button variant="outline" size="sm">
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Create Modal Placeholder */}
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Create College Account</CardTitle>
                                <CardDescription>Add a new college to the platform</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Create college form will be implemented here
                                </p>
                                <Button onClick={() => setShowCreateModal(false)} className="mt-4">
                                    Close
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    )
}


