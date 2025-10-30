"use client"

import { User } from '@/types/auth'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LogOut, User as UserIcon, Settings, Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface NavbarProps {
    user: User | null
    onToggleSidebar?: () => void
}

export function Navbar({ user, onToggleSidebar }: NavbarProps) {
    const { logout } = useAuth()

    return (
        <nav className="border-b bg-white dark:bg-gray-800 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Hamburger Menu Button - Only visible on small screens */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={onToggleSidebar}
                        aria-label="Toggle sidebar"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                    
                    <h1 className="text-2xl font-bold text-primary-600">Saksham AI</h1>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer border-0 bg-transparent">
                            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                            </div>
                            <span className="hidden md:inline">{user?.name || 'User'}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>
                                <div>
                                    <p className="font-medium">{user?.name}</p>
                                    <p className="text-xs text-gray-500">{user?.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <UserIcon className="mr-2 h-4 w-4" />
                                Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={logout} className="text-red-600">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}






