'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, BookOpen, TrendingUp, Trophy, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { cn } from '@/lib/utils';

interface Step {
  number: number;
  icon: React.ReactNode;
  titleKey: keyof import('@/lib/i18n').TranslationKeys;
  descriptionKey: keyof import('@/lib/i18n').TranslationKeys;
  color: string;
  bgColor: string;
}

export function HowItWorks() {
  const { t } = useTranslation();

  const steps: Step[] = [
    {
      number: 1,
      icon: <UserPlus className="w-8 h-8" />,
      titleKey: 'howItWorks.step1.title',
      descriptionKey: 'howItWorks.step1.description',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500',
    },
    {
      number: 2,
      icon: <BookOpen className="w-8 h-8" />,
      titleKey: 'howItWorks.step2.title',
      descriptionKey: 'howItWorks.step2.description',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500',
    },
    {
      number: 3,
      icon: <TrendingUp className="w-8 h-8" />,
      titleKey: 'howItWorks.step3.title',
      descriptionKey: 'howItWorks.step3.description',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-500',
    },
    {
      number: 4,
      icon: <Trophy className="w-8 h-8" />,
      titleKey: 'howItWorks.step4.title',
      descriptionKey: 'howItWorks.step4.description',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-500',
    },
  ];

  return (
    <section id="how-it-works" className="section-container bg-gray-50 dark:bg-gray-900/50">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          {t('howItWorks.title')}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          {t('howItWorks.subtitle')}
        </motion.p>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Desktop View - Horizontal Flow */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-24 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-orange-500 opacity-20" />
            
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <StepCard
                  key={step.number}
                  step={step}
                  index={index}
                  t={t}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile/Tablet View - Vertical Flow */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <StepCard
                step={step}
                index={index}
                t={t}
                isMobile
              />
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex justify-center"
                >
                  <ArrowRight className="w-8 h-8 text-gray-300 dark:text-gray-700 transform rotate-90" />
                </motion.div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

interface StepCardProps {
  step: Step;
  index: number;
  t: (key: keyof import('@/lib/i18n').TranslationKeys) => string;
  isMobile?: boolean;
}

function StepCard({ step, index, t, isMobile = false }: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={cn(
        'relative',
        isMobile && 'max-w-md mx-auto'
      )}
    >
      <div className="card p-6 text-center group hover:shadow-xl transition-all duration-300">
        {/* Step Number Badge */}
        <motion.div
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.5 }}
          className={cn(
            'absolute -top-4 left-1/2 -translate-x-1/2',
            'w-12 h-12 rounded-full flex items-center justify-center',
            'text-white font-bold text-lg shadow-lg',
            step.bgColor
          )}
        >
          {step.number}
        </motion.div>

        {/* Icon */}
        <div className="mt-8 mb-6">
          <div className={cn(
            'w-16 h-16 mx-auto rounded-2xl flex items-center justify-center',
            'bg-gray-100 dark:bg-gray-800',
            step.color,
            'group-hover:scale-110 transition-transform'
          )}>
            {step.icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
          {t(step.titleKey)}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {t(step.descriptionKey)}
        </p>

        {/* Decorative Element */}
        <div className={cn(
          'absolute inset-0 rounded-lg opacity-0 group-hover:opacity-5 transition-opacity',
          'bg-gradient-to-br',
          step.bgColor
        )} />
      </div>
    </motion.div>
  );
}

