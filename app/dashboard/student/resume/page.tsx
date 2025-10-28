// app/dashboard/student/resume/page.tsx
"use client"

import { useState, useRef, useCallback, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Loader } from '@/components/ui/loader'
import { apiClient } from '@/lib/api'
import { 
    Upload, 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    X,
    BarChart,
    Home,
    User,
    Briefcase,
    ClipboardList,
    TrendingUp,
    Download,
    RefreshCw
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { AxiosError } from 'axios'

const sidebarItems = [
    { name: 'Dashboard', href: '/dashboard/student', icon: Home },
    { name: 'Profile', href: '/dashboard/student/profile', icon: User },
    { name: 'Resume', href: '/dashboard/student/resume', icon: FileText },
    { name: 'Job Recommendations', href: '/dashboard/student/jobs', icon: Briefcase },
]

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc']

interface ATSScore {
    ats_score: number
    overall_assessment: string
    strengths: string[]
    weaknesses: string[]
    recommendations: string[]
    keyword_analysis?: {
        found_keywords: string[]
        missing_keywords: string[]
    }
    sections_analysis?: Record<string, string>
    formatting_score?: number
    content_score?: number
    keyword_score?: number
}

interface ResumeStatus {
    has_resume: boolean
    resume_uploaded: boolean
    resume_filename?: string
    resume_path?: string
    uploaded_at?: string
    can_upload: boolean
    can_calculate_ats: boolean
}

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [dragActive, setDragActive] = useState(false)
    
    // ATS Score states
    const [atsScore, setAtsScore] = useState<ATSScore | null>(null)
    const [isCalculatingATS, setIsCalculatingATS] = useState(false)
    const [jobDescription, setJobDescription] = useState('')
    
    // ✅ NEW: Resume status
    const [resumeStatus, setResumeStatus] = useState<ResumeStatus | null>(null)
    const [loadingStatus, setLoadingStatus] = useState(true)
    const [showUploadSection, setShowUploadSection] = useState(false)
    
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ✅ NEW: Fetch resume status on mount
    useEffect(() => {
        fetchResumeStatus()
    }, [])

    // ✅ NEW: Fetch existing resume status
    const fetchResumeStatus = async () => {
        try {
            const status = await apiClient.getResumeStatus()
            setResumeStatus(status)
            
            // If no resume exists, show upload section
            if (!status.data.has_resume) {
                setShowUploadSection(true)
            }
        } catch (error) {
            console.error('Error fetching resume status:', error)
        } finally {
            setLoadingStatus(false)
        }
    }

    // Validate file
    const validateFile = (file: File): string | null => {
        if (file.size > MAX_FILE_SIZE) {
            return `File size exceeds 5MB limit. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
        }
        
        const extension = file.name.split('.').pop()?.toLowerCase()
        if (!extension || !ALLOWED_EXTENSIONS.includes(`.${extension}`)) {
            return 'Only PDF and DOCX files are allowed'
        }
        
        if (!ALLOWED_TYPES.includes(file.type) && file.type !== '') {
            return 'Invalid file type. Only PDF and DOCX files are supported'
        }
        
        return null
    }

    const handleFileSelect = (selectedFile: File) => {
        const validationError = validateFile(selectedFile)
        
        if (validationError) {
            setError(validationError)
            return
        }
        
        setFile(selectedFile)
        setError(null)
        setUploadSuccess(false)
        setUploadProgress(0)
        setAtsScore(null)
    }

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0])
        }
    }, [])

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) return
        
        setIsUploading(true)
        setError(null)
        setUploadProgress(0)
        
        try {
            await apiClient.uploadResume(file, (progress) => {
                setUploadProgress(progress)
            })
            
            setUploadSuccess(true)
            setUploadProgress(100)
            
            // ✅ Refresh resume status after upload
            await fetchResumeStatus()
            setShowUploadSection(false)
        } catch (err) {
            const axiosError = err as AxiosError<{ detail: string }>
            setError(
                axiosError.response?.data?.detail || 
                axiosError.message || 
                'Failed to upload resume'
            )
            setUploadProgress(0)
        } finally {
            setIsUploading(false)
        }
    }

    const handleCalculateATS = async () => {
        setIsCalculatingATS(true)
        setError(null)
        
        try {
            const result = await apiClient.getATSScore(jobDescription || undefined)
            setAtsScore(result)
        } catch (err) {
            const axiosError = err as AxiosError<{ detail: string }>
            setError(
                axiosError.response?.data?.detail || 
                axiosError.message || 
                'Failed to calculate ATS score'
            )
        } finally {
            setIsCalculatingATS(false)
        }
    }

    const handleReset = () => {
        setFile(null)
        setUploadProgress(0)
        setUploadSuccess(false)
        setError(null)
        setAtsScore(null)
        setJobDescription('')
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 dark:text-green-500'
        if (score >= 60) return 'text-yellow-600 dark:text-yellow-500'
        return 'text-red-600 dark:text-red-500'
    }

    if (loadingStatus) {
        return (
            <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
                <div className="flex justify-center py-12">
                    <Loader size="lg" />
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout sidebarItems={sidebarItems} requiredUserType="student">
            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Resume Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Upload your resume and get instant ATS score analysis
                    </p>
                </div>

                {/* ✅ NEW: Existing Resume Card */}
                {resumeStatus?.has_resume && !showUploadSection && (
                    <Card className="border-green-200 dark:border-green-800">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        Resume Uploaded
                                    </CardTitle>
                                    <CardDescription>
                                        Your resume is ready for ATS analysis
                                    </CardDescription>
                                </div>
                                <Badge variant="default" className="bg-green-600">
                                    Active
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <FileText className="h-10 w-10 text-green-600" />
                                    <div>
                                        <p className="font-medium">{resumeStatus.resume_filename}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Uploaded {resumeStatus.uploaded_at ? new Date(resumeStatus.uploaded_at).toLocaleDateString() : 'recently'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowUploadSection(true)}
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Replace Resume
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Upload Card - Show only if no resume or user wants to replace */}
                {(showUploadSection || !resumeStatus?.has_resume) && (
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>
                                        {resumeStatus?.has_resume ? 'Replace Resume' : 'Upload Resume'}
                                    </CardTitle>
                                    <CardDescription>
                                        Upload your resume in PDF or DOCX format (Max 5MB)
                                    </CardDescription>
                                </div>
                                {resumeStatus?.has_resume && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setShowUploadSection(false)
                                            handleReset()
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Drag & Drop Zone */}
                            <div
                                className={`
                                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                                    transition-colors duration-200
                                    ${dragActive 
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10' 
                                        : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                                    }
                                    ${file ? 'bg-green-50 dark:bg-green-900/10 border-green-500' : ''}
                                    ${isUploading ? 'pointer-events-none opacity-60' : ''}
                                `}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={handleFileInputChange}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                                
                                {!file ? (
                                    <div className="space-y-4">
                                        <Upload className="h-12 w-12 mx-auto text-gray-400" />
                                        <div>
                                            <p className="text-lg font-medium">
                                                Drag and drop your resume here
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                or click to browse files
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400">
                                            Supported formats: PDF, DOC, DOCX (Max 5MB)
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                                        <div>
                                            <p className="text-lg font-medium flex items-center justify-center gap-2">
                                                <FileText className="h-5 w-5" />
                                                {file.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Error Message */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Success Message */}
                            {uploadSuccess && (
                                <Alert className="border-green-500 bg-green-50 dark:bg-green-900/10">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription className="text-green-600 dark:text-green-500">
                                        Resume uploaded successfully! You can now calculate your ATS score.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Progress Bar */}
                            {isUploading && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">Uploading...</span>
                                        <span className="font-semibold">{uploadProgress}%</span>
                                    </div>
                                    <Progress value={uploadProgress} className="h-2" />
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={handleUpload}
                                    disabled={!file || isUploading || uploadSuccess}
                                    className="flex-1"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader className="mr-2 h-4 w-4 animate-spin" />
                                            Uploading {uploadProgress}%
                                        </>
                                    ) : uploadSuccess ? (
                                        <>
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Uploaded
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" />
                                            {resumeStatus?.has_resume ? 'Replace Resume' : 'Upload Resume'}
                                        </>
                                    )}
                                </Button>
                                
                                {(file || uploadSuccess) && (
                                    <Button
                                        onClick={handleReset}
                                        variant="outline"
                                        disabled={isUploading}
                                    >
                                        <X className="mr-2 h-4 w-4" />
                                        Clear
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* ATS Score Card - Show if resume exists */}
                {(resumeStatus?.has_resume || uploadSuccess) && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart className="h-5 w-5" />
                                ATS Score Analysis
                            </CardTitle>
                            <CardDescription>
                                Get detailed ATS score and recommendations for your resume
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Job Description (Optional) */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    Job Description (Optional)
                                    <span className="text-xs text-gray-500 font-normal">
                                        - Paste for better ATS matching
                                    </span>
                                </label>
                                <Textarea
                                    placeholder="Paste the job description here to get tailored ATS recommendations and keyword matching..."
                                    value={jobDescription}
                                    onChange={(e) => setJobDescription(e.target.value)}
                                    rows={4}
                                    disabled={isCalculatingATS}
                                    className="resize-none"
                                />
                            </div>

                            <Button
                                onClick={handleCalculateATS}
                                disabled={isCalculatingATS}
                                className="w-full"
                                size="lg"
                            >
                                {isCalculatingATS ? (
                                    <>
                                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                                        Analyzing Resume with AI...
                                    </>
                                ) : (
                                    <>
                                        <TrendingUp className="mr-2 h-4 w-4" />
                                        Calculate ATS Score
                                    </>
                                )}
                            </Button>

                            {/* ATS Results - Keep all the existing display code */}
                            {atsScore && (
                                <div className="space-y-6 pt-4 border-t">
                                    {/* All your existing ATS score display code stays here */}
                                    {/* Score Display */}
                                    <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide font-semibold">
                                            Your ATS Score
                                        </p>
                                        <p className={`text-6xl font-bold ${getScoreColor(atsScore.ats_score)}`}>
                                            {atsScore.ats_score}
                                            <span className="text-2xl text-gray-500">/100</span>
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                            Powered by Cohere Command-A
                                        </p>
                                    </div>

                                    {/* ... rest of your existing ATS display code ... */}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    )
}
