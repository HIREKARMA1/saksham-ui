"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { Loader } from '@/components/ui/loader'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [userType, setUserType] = useState<'student' | 'college' | 'admin'>('student')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await login(email, password, userType)
        } catch (error) {
            console.error('Login error:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white dark:from-gray-900 dark:to-gray-800 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold gradient-text">Saksham AI</CardTitle>
                    <CardDescription>Login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* User Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Login as</label>
                            <div className="grid grid-cols-3 gap-2">
                                <Button
                                    type="button"
                                    variant={userType === 'student' ? 'default' : 'outline'}
                                    onClick={() => setUserType('student')}
                                    className="w-full"
                                >
                                    Student
                                </Button>
                                <Button
                                    type="button"
                                    variant={userType === 'college' ? 'default' : 'outline'}
                                    onClick={() => setUserType('college')}
                                    className="w-full"
                                >
                                    College
                                </Button>
                                <Button
                                    type="button"
                                    variant={userType === 'admin' ? 'default' : 'outline'}
                                    onClick={() => setUserType('admin')}
                                    className="w-full"
                                >
                                    Admin
                                </Button>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader size="sm" /> : 'Login'}
                        </Button>

                        {/* Register Link */}
                        {userType === 'student' && (
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                Don't have an account?{' '}
                                <Link href="/auth/register" className="text-primary-600 hover:underline">
                                    Register here
                                </Link>
                            </p>
                        )}

                        {userType !== 'student' && (
                            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                {userType === 'college' ? 'College accounts are created by administrators' : 'Admin access only'}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

