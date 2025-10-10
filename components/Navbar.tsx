"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function Navbar() {
    return (
        <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xl">S</span>
                    </div>
                    <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">Saksham AI</h1>
                </Link>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <Link href="/auth/login">
                        <Button variant="ghost">Login</Button>
                    </Link>
                    <Link href="/auth/register">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            </div>
        </header>
    )
}

