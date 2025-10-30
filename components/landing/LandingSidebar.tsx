'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard,
  Lightbulb,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  MessageSquare,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Brain,
  Target,
  Rocket
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface LandingSidebarProps {
  className?: string;
}

export function LandingSidebar({ className }: LandingSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();

  const mainFeatures: SidebarItem[] = [
    {
      id: 'hero',
      icon: <Rocket className="w-5 h-5" />,
      label: t('nav.home'),
      onClick: () => scrollToSection('hero'),
    },
    {
      id: 'features',
      icon: <Brain className="w-5 h-5" />,
      label: t('nav.features'),
      onClick: () => scrollToSection('features'),
    },
    {
      id: 'why-choose',
      icon: <Target className="w-5 h-5" />,
      label: 'Why Choose Us',
      onClick: () => scrollToSection('why-choose'),
    },
    {
      id: 'how-it-works',
      icon: <Lightbulb className="w-5 h-5" />,
      label: 'How It Works',
      onClick: () => scrollToSection('how-it-works'),
    },
  ];

  const additionalFeatures: SidebarItem[] = [
    {
      id: 'testimonials',
      icon: <MessageSquare className="w-5 h-5" />,
      label: 'Testimonials',
      onClick: () => scrollToSection('testimonials'),
    },
    {
      id: 'partners',
      icon: <Users className="w-5 h-5" />,
      label: 'Partners',
      onClick: () => scrollToSection('partners'),
    },
    {
      id: 'faq',
      icon: <HelpCircle className="w-5 h-5" />,
      label: 'FAQ',
      onClick: () => scrollToSection('faq'),
    },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ 
        x: 0,
        width: isCollapsed ? 80 : 280 
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-[64px] h-[calc(100vh-64px)] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 z-30 overflow-hidden',
        className
      )}
    >
      <div className="flex flex-col h-full">
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-8 bg-primary-500 text-white rounded-full p-1.5 shadow-lg hover:bg-primary-600 transition-colors z-10"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
          {/* Main Features Section */}
          <div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  Explore
                </motion.h3>
              )}
            </AnimatePresence>
            <nav className="space-y-1">
              {mainFeatures.map((item) => (
                <SidebarButton
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </nav>
          </div>

          {/* Additional Features Section */}
          <div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.h3
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  More
                </motion.h3>
              )}
            </AnimatePresence>
            <nav className="space-y-1">
              {additionalFeatures.map((item) => (
                <SidebarButton
                  key={item.id}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Section - Quick Actions */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3">
          <Link
            href="/auth/login"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'bg-primary-500 hover:bg-primary-600 text-white font-medium',
              isCollapsed && 'justify-center'
            )}
          >
            <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="truncate"
                >
                  {t('common.dashboard')}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </motion.aside>
  );
}

interface SidebarButtonProps {
  item: SidebarItem;
  isCollapsed: boolean;
}

function SidebarButton({ item, isCollapsed }: SidebarButtonProps) {
  const content = (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        'text-gray-700 dark:text-gray-300',
        'hover:bg-primary-50 dark:hover:bg-primary-900/20',
        'hover:text-primary-600 dark:hover:text-primary-400',
        'cursor-pointer group',
        isCollapsed && 'justify-center'
      )}
    >
      <div className="flex-shrink-0 transition-transform group-hover:scale-110">
        {item.icon}
      </div>
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            className="truncate font-medium"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={item.onClick}
      className="w-full"
    >
      {content}
    </button>
  );
}

