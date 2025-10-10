"use client"

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { Home, User, FileText, Briefcase, ClipboardList } from 'lucide-react'
import toast from 'react-hot-toast'

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
    { name: 'Assessments', href: '/dashboard/student/assessments', icon: ClipboardList },
]

export default function StudentProfile() {
    const [profile, setProfile] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const data = await apiClient.getStudentProfile()
            setProfile(data)
        } catch (error) {
            console.error('Error fetching profile:', error)
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await apiClient.updateStudentProfile(profile)
            toast.success('Profile updated successfully')
        } catch (error) {
            console.error('Error updating profile:', error)
            toast.error('Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Profile</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage your personal information</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader size="lg" />
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your profile details</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input
                                            value={profile?.name || ''}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email</label>
                                        <Input
                                            value={profile?.email || ''}
                                            disabled
                                            className="bg-gray-100 dark:bg-gray-800"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone</label>
                                        <Input
                                            value={profile?.phone || ''}
                                            onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Degree</label>
                                        <Input
                                            value={profile?.degree || ''}
                                            onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                                            placeholder="e.g., B.Tech"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Branch</label>
                                        <Input
                                            value={profile?.branch || ''}
                                            onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                                            placeholder="e.g., Computer Science"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Graduation Year</label>
                                        <Input
                                            type="number"
                                            value={profile?.graduation_year || ''}
                                            onChange={(e) => setProfile({ ...profile, graduation_year: parseInt(e.target.value) })}
                                            placeholder="e.g., 2025"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" disabled={saving}>
                                    {saving ? <Loader size="sm" /> : 'Save Changes'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}

