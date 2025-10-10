"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function Home() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-primary-600">Saksham AI</h1>
                    <div className="flex gap-4">
                        <Link href="/auth/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-5xl font-bold mb-6 gradient-text">
                    AI-Powered Placement Simulator
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    Practice real-world job assessments, get AI-based feedback, and boost your placement readiness with Saksham.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link href="/auth/register">
                        <Button size="lg" className="text-lg">
                            Start Free Trial
                        </Button>
                    </Link>
                    <Link href="/auth/login">
                        <Button size="lg" variant="outline" className="text-lg">
                            Login
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Why Choose Saksham?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI-Powered Assessments</CardTitle>
                            <CardDescription>
                                Take mock tests that simulate real company assessments
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-300">
                                Get evaluated by AI on aptitude, technical skills, and soft skills to measure your true job readiness.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Personalized Job Recommendations</CardTitle>
                            <CardDescription>
                                Find roles that match your skills and aspirations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-300">
                                Upload your resume and get ATS scores along with tailored job recommendations based on your profile.
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Analytics</CardTitle>
                            <CardDescription>
                                Track your progress and identify improvement areas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-300">
                                View detailed analytics, readiness scores, and AI-generated feedback to continuously improve.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* User Types Section */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Who Is It For?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <Card className="border-primary-200">
                        <CardHeader>
                            <CardTitle>Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                <li>✓ Practice mock assessments</li>
                                <li>✓ Get AI feedback</li>
                                <li>✓ Track your progress</li>
                                <li>✓ Free trial available</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-secondary-200">
                        <CardHeader>
                            <CardTitle>Colleges</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                <li>✓ Manage student accounts</li>
                                <li>✓ Track student performance</li>
                                <li>✓ View analytics dashboard</li>
                                <li>✓ Unlimited access</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-accent-green-200">
                        <CardHeader>
                            <CardTitle>Admins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                                <li>✓ Manage colleges & students</li>
                                <li>✓ Platform-wide analytics</li>
                                <li>✓ Bulk operations</li>
                                <li>✓ Full control</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA Section */}
            <section className="container mx-auto px-4 py-16 text-center">
                <Card className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white border-none">
                    <CardHeader>
                        <CardTitle className="text-3xl text-white">Ready to Get Started?</CardTitle>
                        <CardDescription className="text-white/90 text-lg">
                            Join thousands of students preparing for their dream jobs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/auth/register">
                            <Button size="lg" variant="secondary" className="text-lg">
                                Start Your Free Trial
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </section>

            {/* Footer */}
            <footer className="border-t bg-gray-50 dark:bg-gray-900 py-8">
                <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
                    <p>&copy; 2025 Saksham AI. All rights reserved.</p>
                    <p className="mt-2">Powered by HireKarma</p>
                </div>
            </footer>
        </div>
    )
}
