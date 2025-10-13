"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface SidebarItem {
    name: string
    href: string
    icon: LucideIcon
}

interface SidebarProps {
    items: SidebarItem[]
}

export function Sidebar({ items }: SidebarProps) {
    const pathname = usePathname()

    return (
        <aside className="w-64 border-r bg-white dark:bg-gray-800 h-[calc(100vh-73px)] overflow-y-auto">
            <nav className="p-4 space-y-2">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                                isActive
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 font-medium'
                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{item.name}</span>
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}


