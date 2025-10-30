"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/hooks/useAuth'
import { Loader } from '@/components/ui/loader'

const sliderImages = [
    {
        title: "Master Your Skills",
        subtitle: "Ace Every Interview",
        description: "Practice real-world assessments and boost your placement readiness",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80" // Team collaboration
    },
    {
        title: "AI-Powered Learning",
        subtitle: "Smarter Preparation",
        description: "Get personalized feedback and track your progress with advanced AI",
        image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&q=80" // Professional workspace
    },
    {
        title: "Your Success Journey",
        subtitle: "Starts Here",
        description: "Join thousands of students achieving their career goals",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80" // Students learning
    }
]

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [userType, setUserType] = useState<'student' | 'college' | 'admin'>('student')
    const [loading, setLoading] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    const { login } = useAuth()
    const router = useRouter()

    // Auto-advance slider
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

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
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <Navbar />

            {/* Main Content */}
            <div className="flex flex-1">
                {/* Left Section - Image Slider */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    {/* Background Images */}
                    {sliderImages.map((slide, index) => (
                        <div
                            key={index}
                            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                                }`}
                        >
                            {/* Image */}
                            <div
                                className="absolute inset-0 bg-cover bg-center"
                                style={{ backgroundImage: `url(${slide.image})` }}
                            />

                            {/* Gradient Overlay - darker for better text readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
                        </div>
                    ))}

                    {/* Content Container - Text at Bottom */}
                    <div className="relative z-10 flex flex-col justify-end w-full p-12 pb-16">
                        {/* Text Content */}
                        <div className="max-w-lg text-white transition-all duration-500 ease-in-out">
                            <h2 className="text-4xl font-bold mb-2">
                                {sliderImages[currentSlide].title}
                            </h2>
                            <h2 className="text-4xl font-bold mb-4">
                                {sliderImages[currentSlide].subtitle}
                            </h2>
                            <p className="text-lg text-white/90 mb-8">
                                {sliderImages[currentSlide].description}
                            </p>

                            {/* Slider Indicators */}
                            <div className="flex gap-2">
                                {sliderImages.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentSlide(index)}
                                        className={`h-1 rounded-full transition-all ${index === currentSlide ? 'w-8 bg-white' : 'w-4 bg-white/40'
                                            }`}
                                        aria-label={`Go to slide ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section - Login Form */}
                <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
                    <div className="w-full max-w-md">
                        {/* Form Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Welcome back
                            </h1>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* User Type Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Login as
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setUserType('student')}
                                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${userType === 'student'
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-primary-400'
                                            }`}
                                    >
                                        Student
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUserType('college')}
                                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${userType === 'college'
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-primary-400'
                                            }`}
                                    >
                                        College
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setUserType('admin')}
                                        className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${userType === 'admin'
                                            ? 'bg-primary-600 text-white shadow-lg'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-primary-400'
                                            }`}
                                    >
                                        Admin
                                    </button>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12"
                                />
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-medium bg-primary-600 hover:bg-primary-700"
                                disabled={loading}
                            >
                                {loading ? <Loader size="sm" /> : 'Login'}
                            </Button>

                            {/* Additional Info */}
                            {userType === 'student' && (
                                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    Don't have an account?{' '}
                                    <Link href="/auth/register" className="text-primary-600 hover:underline font-medium">
                                        Register here
                                    </Link>
                                </p>
                            )}

                            {userType === 'college' && (
                                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    College accounts are created by administrators
                                </p>
                            )}

                            {userType === 'admin' && (
                                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                    Admin access only
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
