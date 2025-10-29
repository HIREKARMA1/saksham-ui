"use client"

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader } from '@/components/ui/loader'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api'
import { Home, Users, GraduationCap, BarChart3, Plus, Search, Pencil, Trash2, Upload, X, UserX } from 'lucide-react'
import toast from 'react-hot-toast'
import { BulkUploadModal } from '@/components/BulkUploadModal'

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/college', icon: Home },
    { name: 'Students', href: '/dashboard/college/students', icon: GraduationCap },
    { name: 'Analytics', href: '/dashboard/college/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/dashboard/college/profile', icon: Users },
]

export default function CollegeStudents() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [showInactive, setShowInactive] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        degree: '',
        branch: '',
        graduation_year: '',
        institution: '',
    })
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: '',
        degree: '',
        branch: '',
        graduation_year: '',
        institution: '',
    })
    const [creating, setCreating] = useState(false)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        fetchStudents()
    }, [])

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const data = await apiClient.getCollegeStudents()
            setStudents(data.students || [])
        } catch (error) {
            console.error('Error fetching students:', error)
            toast.error('Failed to load students')
        } finally {
            setLoading(false)
        }
    }

    const handleCreateStudent = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreating(true)

        try {
            await apiClient.createCollegeStudent(formData)
            toast.success('Student created successfully!')
            setShowCreateModal(false)
            setFormData({
                name: '',
                email: '',
                phone: '',
                degree: '',
                branch: '',
                graduation_year: '',
                institution: '',
            })
            fetchStudents()
        } catch (error: any) {
            console.error('Error creating student:', error)
            const errorDetail = error.response?.data?.detail
            let errorMessage = 'Failed to create student'
            
            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail
            } else if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
            } else if (typeof errorDetail === 'object' && errorDetail !== null) {
                errorMessage = errorDetail.msg || JSON.stringify(errorDetail)
            }
            
            toast.error(errorMessage)
        } finally {
            setCreating(false)
        }
    }

    const handleEditStudent = (student: any) => {
        setSelectedStudent(student)
        setEditFormData({
            name: student.name || '',
            email: student.email || '',
            phone: student.phone || '',
            degree: student.degree || '',
            branch: student.branch || '',
            graduation_year: student.graduation_year || '',
            institution: student.institution || '',
        })
        setShowEditModal(true)
    }

    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedStudent) return

        setUpdating(true)

        try {
            await apiClient.updateCollegeStudent(selectedStudent.id, editFormData)
            toast.success('Student updated successfully!')
            setShowEditModal(false)
            setSelectedStudent(null)
            fetchStudents()
        } catch (error: any) {
            console.error('Error updating student:', error)
            const errorDetail = error.response?.data?.detail
            let errorMessage = 'Failed to update student'
            
            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail
            } else if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
            } else if (typeof errorDetail === 'object' && errorDetail !== null) {
                errorMessage = errorDetail.msg || JSON.stringify(errorDetail)
            }
            
            toast.error(errorMessage)
        } finally {
            setUpdating(false)
        }
    }

    const handleDeleteStudent = async (studentId: string) => {
        if (!confirm('Are you sure you want to mark this student as inactive? The student will not be permanently deleted.')) return

        try {
            await apiClient.deleteCollegeStudent(studentId)
            toast.success('Student marked as inactive successfully!')
            fetchStudents()
        } catch (error: any) {
            console.error('Error deactivating student:', error)
            const errorDetail = error.response?.data?.detail
            let errorMessage = 'Failed to deactivate student'
            
            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail
            } else if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
            } else if (typeof errorDetail === 'object' && errorDetail !== null) {
                errorMessage = errorDetail.msg || JSON.stringify(errorDetail)
            }
            
            toast.error(errorMessage)
        }
    }

    const handleActivateStudent = async (studentId: string) => {
        if (!confirm('Are you sure you want to activate this student? The student will be able to access their account.')) return

        try {
            await apiClient.activateCollegeStudent(studentId)
            toast.success('Student activated successfully!')
            fetchStudents()
        } catch (error: any) {
            console.error('Error activating student:', error)
            const errorDetail = error.response?.data?.detail
            let errorMessage = 'Failed to activate student'
            
            if (typeof errorDetail === 'string') {
                errorMessage = errorDetail
            } else if (Array.isArray(errorDetail)) {
                errorMessage = errorDetail.map((err: any) => err.msg || JSON.stringify(err)).join(', ')
            } else if (typeof errorDetail === 'object' && errorDetail !== null) {
                errorMessage = errorDetail.msg || JSON.stringify(errorDetail)
            }
            
            toast.error(errorMessage)
        }
    }

    const handleBulkUpload = async (file: File) => {
        try {
            const result = await apiClient.uploadCollegeStudentsCSV(file)
            toast.success(result.message || `${result.successful} students uploaded successfully!`)
            setShowBulkUploadModal(false)
            fetchStudents()
            return result
        } catch (error: any) {
            console.error('Error uploading CSV:', error)
            const errorMessage = error.response?.data?.detail || 'Failed to upload CSV file'
            toast.error(errorMessage)
            throw error
        }
    }

    const filteredStudents = students.filter(student => {
        // Filter by search term
        const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.phone?.includes(searchTerm)
        
        // Filter by status
        const matchesStatus = showInactive || student.status?.toUpperCase() === 'ACTIVE'
        
        return matchesSearch && matchesStatus
    })
    
    const activeCount = students.filter(s => s.status?.toUpperCase() === 'ACTIVE').length
    const inactiveCount = students.filter(s => s.status?.toUpperCase() === 'INACTIVE').length

    return (
        <DashboardLayout sidebarItems={sidebarItems}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Students Management</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your students</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={() => setShowBulkUploadModal(true)} variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            Bulk Upload
                        </Button>
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Student
                        </Button>
                    </div>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Search & Filter Students</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium text-green-600">{activeCount} Active</span>
                                <span>•</span>
                                <span className="font-medium text-gray-500">{inactiveCount} Inactive</span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="showInactive"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="showInactive" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                Show inactive students
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* Students List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Students ({filteredStudents.length})</CardTitle>
                        <CardDescription>All students in your college</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader />
                            </div>
                        ) : filteredStudents.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 dark:text-gray-400">No students found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b dark:border-gray-700">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Email</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Degree</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Branch</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Year</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="py-3 px-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.email}</td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.phone}</td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.degree || '-'}</td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.branch || '-'}</td>
                                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{student.graduation_year || '-'}</td>
                                                <td className="py-3 px-4">
                                                    <Badge 
                                                        variant={student.status?.toUpperCase() === 'ACTIVE' ? 'default' : 'secondary'}
                                                        className={
                                                            student.status?.toUpperCase() === 'INACTIVE' 
                                                                ? 'bg-gray-500 hover:bg-gray-600' 
                                                                : student.status?.toUpperCase() === 'SUSPENDED' 
                                                                ? 'bg-red-500 hover:bg-red-600'
                                                                : ''
                                                        }
                                                    >
                                                        {student.status?.toUpperCase() || 'ACTIVE'}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleEditStudent(student)}
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            title="Edit student details"
                                                        >
                                                            <Pencil className="w-4 h-4 mr-1" />
                                                            Edit
                                                        </Button>
                                                        {student.status?.toUpperCase() === 'ACTIVE' ? (
                                                        <Button
                                                                variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDeleteStudent(student.id)}
                                                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                                title="Mark student as inactive"
                                                            >
                                                                <UserX className="w-4 h-4 mr-1" />
                                                                Deactivate
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleActivateStudent(student.id)}
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                title="Activate student"
                                                            >
                                                                <Users className="w-4 h-4 mr-1" />
                                                                Activate
                                                        </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Create Student Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Student Account</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreateStudent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name *</label>
                                    <Input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email *</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone *</label>
                                    <Input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Degree</label>
                                        <Input
                                            type="text"
                                            value={formData.degree}
                                            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Branch</label>
                                        <Input
                                            type="text"
                                            value={formData.branch}
                                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Graduation Year</label>
                                        <Input
                                            type="number"
                                            value={formData.graduation_year}
                                            onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Institution</label>
                                        <Input
                                            type="text"
                                            value={formData.institution}
                                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateModal(false)}
                                        disabled={creating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={creating}>
                                        {creating ? 'Creating...' : 'Create Student'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Student</h2>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowEditModal(false)}
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            <form onSubmit={handleUpdateStudent} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Name *</label>
                                    <Input
                                        type="text"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Email *</label>
                                    <Input
                                        type="email"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Phone *</label>
                                    <Input
                                        type="tel"
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Degree</label>
                                        <Input
                                            type="text"
                                            value={editFormData.degree}
                                            onChange={(e) => setEditFormData({ ...editFormData, degree: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Branch</label>
                                        <Input
                                            type="text"
                                            value={editFormData.branch}
                                            onChange={(e) => setEditFormData({ ...editFormData, branch: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Graduation Year</label>
                                        <Input
                                            type="number"
                                            value={editFormData.graduation_year}
                                            onChange={(e) => setEditFormData({ ...editFormData, graduation_year: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Institution</label>
                                        <Input
                                            type="text"
                                            value={editFormData.institution}
                                            onChange={(e) => setEditFormData({ ...editFormData, institution: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowEditModal(false)}
                                        disabled={updating}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={updating}>
                                        {updating ? 'Updating...' : 'Update Student'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Upload Modal */}
            {showBulkUploadModal && (
                <BulkUploadModal
                    isOpen={showBulkUploadModal}
                    onClose={() => setShowBulkUploadModal(false)}
                    onSubmit={handleBulkUpload}
                />
            )}
        </DashboardLayout>
    )
}

