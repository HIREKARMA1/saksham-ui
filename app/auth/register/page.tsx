"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/Navbar'
import { useAuth } from '@/hooks/useAuth'
import { Loader } from '@/components/ui/loader'

const sliderImages = [
    {
        title: "Start Your Journey",
        subtitle: "Achieve Your Dreams",
        description: "Join thousands of students preparing for their dream placements",
        image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80" // Students learning
    },
    {
        title: "Practice Smart",
        subtitle: "Succeed Faster",
        description: "AI-powered assessments tailored to your career goals",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80" // Team success
    },
    {
        title: "Track Progress",
        subtitle: "Stay Motivated",
        description: "Real-time analytics and personalized feedback to guide your growth",
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80" // Professional growth
    }
]

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
    })
    const [loading, setLoading] = useState(false)
    const [currentSlide, setCurrentSlide] = useState(0)
    const [agreedToTerms, setAgreedToTerms] = useState(false)
    const { register } = useAuth()
    const router = useRouter()

    // Auto-advance slider
    useState(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % sliderImages.length)
        }, 5000)
        return () => clearInterval(interval)
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match')
            return
        }

        if (!agreedToTerms) {
            alert('Please agree to the Terms & Conditions')
            return
        }

        setLoading(true)

        try {
            const fullName = formData.lastName
                ? `${formData.name} ${formData.lastName}`
                : formData.name

            await register({
                name: fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
            })
        } catch (error) {
            console.error('Registration error:', error)
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

                {/* Right Section - Register Form */}
                <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                    <div className="w-full max-w-md">
                        {/* Form Header */}
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Create an account
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">
                                    Log in
                                </Link>
                            </p>
                        </div>

                        {/* Register Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        First name
                                    </label>
                                    <Input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Fletcher"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="h-11"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Last name
                                    </label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        type="text"
                                        placeholder="Last name"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="h-11"
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Confirm Password
                                </label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm your password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="h-11"
                                />
                            </div>

                            {/* Terms & Conditions */}
                            <div className="flex items-start gap-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-primary-600 hover:underline">
                                        Terms & Conditions
                                    </Link>
                                </label>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                className="w-full h-12 text-base font-medium bg-primary-600 hover:bg-primary-700"
                                disabled={loading || !agreedToTerms}
                            >
                                {loading ? <Loader size="sm" /> : 'Create account'}
                            </Button>

                            {/* Note */}
                            <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                                Note: You'll get 1 free mock test. Subscribe for unlimited access.
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
