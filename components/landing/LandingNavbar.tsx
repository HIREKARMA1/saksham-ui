'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Moon, Sun, Globe, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Language } from '@/lib/i18n';
import { AnimatedBackground } from '@/components/ui/animated-background';
import Image from 'next/image';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuProvider,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface LandingNavbarProps {
  className?: string;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export function LandingNavbar({ className, onToggleSidebar, isSidebarCollapsed }: LandingNavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useTranslation();

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const languageOptions: { value: Language; label: string; flag: string }[] = [
    { value: 'en', label: 'English', flag: '🇬🇧' },
    { value: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { value: 'or', label: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <DropdownMenuProvider>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 overflow-hidden',
          scrolled
            ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
            : 'bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border-b border-gray-200/30 dark:border-gray-800/30',
          className
        )}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <AnimatedBackground variant="subtle" showGrid={true} showLines={false} />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative" style={{ zIndex: 1 }}>
          <div className="flex items-center justify-between h-20">
            {/* Left section - Logo and Collapse button */}
            <div className="flex items-center gap-3">
              {/* Logo - Simple and clean */}
              <Link href="/" className="flex items-center group">
                <div className="relative w-[130px] h-16 transition-transform group-hover:scale-105">
                  {theme === 'dark' ? (
                    <Image
                      src="/images/HKlogowhite.png"
                      alt="Solviq AI Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  ) : (
                    <Image
                      src="/images/HKlogoblack.png"
                      alt="Solviq AI Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  )}
                </div>
              </Link>

              {/* Sidebar Toggle Button - Desktop only */}
              {onToggleSidebar && (
                <button
                  onClick={onToggleSidebar}
                  className={cn(
                    'hidden lg:flex p-2 rounded-lg transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    'text-gray-700 dark:text-gray-300'
                  )}
                  aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                  {isSidebarCollapsed ? (
                    <PanelLeft className="w-5 h-5" />
                  ) : (
                    <PanelLeftClose className="w-5 h-5" />
                  )}
                </button>
              )}
            </div>

            {/* Right Section - Simple Actions */}
            <div className="flex items-center gap-3">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      'text-gray-700 dark:text-gray-300'
                    )}
                    aria-label="Select language"
                  >
                    <Globe className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                  sideOffset={8}
                >
                  {languageOptions.map((lang) => (
                    <DropdownMenuItem
                      key={lang.value}
                      onClick={() => setLanguage(lang.value)}
                      className={cn(
                        'cursor-pointer',
                        language === lang.value && 'bg-primary-50 dark:bg-primary-900/20'
                      )}
                    >
                      <span className="mr-2">{lang.flag}</span>
                      <span className="flex-1">{lang.label}</span>
                      {language === lang.value && (
                        <span className="text-primary-500">✓</span>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'text-gray-700 dark:text-gray-300'
                )}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Profile Icon */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      'bg-primary-500 hover:bg-primary-600',
                      'text-white'
                    )}
                    aria-label="Profile menu"
                  >
                    <User className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48"
                  sideOffset={8}
                >
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login" className="cursor-pointer">
                      {t('common.login')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/register" className="cursor-pointer">
                      {t('common.signUp')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/student" className="cursor-pointer">
                      {t('common.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.nav>
    </DropdownMenuProvider>
  );
}

