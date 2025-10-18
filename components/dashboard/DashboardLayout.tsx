"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { Loader } from '@/components/ui/loader'
import { LucideIcon } from 'lucide-react'

interface SidebarItem {
    name: string
    href: string
    icon: LucideIcon
}

interface DashboardLayoutProps {
    children: React.ReactNode
    sidebarItems: SidebarItem[]
    requiredUserType?: 'student' | 'college' | 'admin'
}

export function DashboardLayout({ children, sidebarItems, requiredUserType }: DashboardLayoutProps) {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login')
        }

        if (!loading && user && requiredUserType && user.user_type !== requiredUserType) {
            router.push(`/dashboard/${user.user_type}`)
        }
    }, [user, loading, router, requiredUserType])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader size="lg" />
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar user={user} />
            <div className="flex">
                <Sidebar items={sidebarItems} />
                <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-73px)]">
                    {children}
                </main>
            </div>
        </div>
    )
}






