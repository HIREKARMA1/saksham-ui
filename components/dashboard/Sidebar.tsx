"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'
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
  const pathname = usePathname() ?? ''

  return (
    <aside className="w-60 bg-white border-r min-h-screen hidden md:block">
      <div className="p-6">
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon as React.ComponentType<any>
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${
                  isActive ? 'bg-gray-100 text-primary-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`p-2 rounded-md ${isActive ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
