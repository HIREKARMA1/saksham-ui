"use client"

import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Navbar() {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <header className="border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative h-10 w-32 transition-transform group-hover:scale-105">
                            {mounted ? (
                                <Image
                                    src={theme === 'dark' ? '/images/HKlogowhite.png' : '/images/HKlogoblack.png'}
                                    alt="HireKarma Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            ) : (
                                <Image
                                    src="/images/HKlogoblack.png"
                                    alt="HireKarma Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            )}
                        </div>
                    </Link>

                    {/* Right Section */}
                    <div className="flex items-center gap-3">
                        <Link href="/auth/login">
                            <Button
                                variant="ghost"
                                className="font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Login
                            </Button>
                        </Link>
                        <Link href="/auth/register">
                            <Button
                                className="font-medium bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                            >
                                Get Started
                            </Button>
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    )
}

