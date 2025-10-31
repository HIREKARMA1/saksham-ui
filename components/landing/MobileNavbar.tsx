'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { sidebarFeatures, SidebarItem } from './LandingSidebar';
import { cn } from '@/lib/utils';

interface MobileNavbarProps {
  activeFeature?: string | null;
  onFeatureChange?: (featureId: string | null) => void;
}

export function MobileNavbar({ activeFeature, onFeatureChange }: MobileNavbarProps) {
  const features = sidebarFeatures.map(item => ({
    ...item,
    onClick: () => onFeatureChange?.(item.id),
  }));

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="lg:hidden fixed top-20 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-md"
    >
      <div 
        className="overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
      >
        <div className="flex items-center justify-start gap-3 px-4 py-3">
          {features.map((item, index) => {
            const isActive = activeFeature === item.id;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={item.onClick}
                className={cn(
                  'flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg transition-all duration-200 flex-shrink-0',
                  'min-w-[90px] max-w-[100px]',
                  isActive
                    ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400'
                )}
              >
                <div className={cn(
                  'transition-transform flex items-center justify-center',
                  isActive && 'scale-110'
                )}>
                  {item.icon}
                </div>
                <span className={cn(
                  'text-xs font-medium text-center leading-tight',
                  isActive && 'font-semibold'
                )}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
