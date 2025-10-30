'use client';

import React, { useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserPlus, BookOpen, TrendingUp, Trophy, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { AnimatedBackground } from '@/components/ui/animated-background';
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
    <section id="how-it-works" className="section-container bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
      <AnimatedBackground variant="default" />

      <div className="relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
              Simple 4-Step Process
            </span>
          </motion.div>

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

        <div className="max-w-6xl mx-auto">
          {/* Desktop View - Horizontal Flow */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Animated Connecting Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="absolute top-24 left-0 right-0 h-1 origin-left"
              >
                <div className="w-full h-full bg-gradient-to-r from-blue-500 via-purple-500 via-green-500 to-orange-500 opacity-30 relative">
                  {/* Animated Pulse */}
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: 2 }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent"
                  />
                </div>
              </motion.div>
              
              {/* Flow Arrows */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 1.5 + i * 0.2 }}
                  className="absolute top-[92px] text-primary-400 dark:text-primary-500"
                  style={{ left: `${25 + i * 25}%` }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              ))}
              
              <div className="grid grid-cols-4 gap-6">
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
          <div className="lg:hidden space-y-6">
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
                    <div className="relative">
                      <ArrowRight className="w-8 h-8 text-primary-400 dark:text-primary-500 transform rotate-90" />
                      <motion.div
                        animate={{ y: [0, 8, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0"
                      >
                        <ArrowRight className="w-8 h-8 text-primary-300/50 dark:text-primary-600/50 transform rotate-90" />
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
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
  const [isHovered, setIsHovered] = useState(false);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      className={cn(
        'relative',
        isMobile && 'max-w-md mx-auto'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="card p-8 text-center group hover:shadow-2xl transition-all duration-500 relative overflow-hidden border-2 border-transparent hover:border-primary-200 dark:hover:border-primary-800 h-full flex flex-col"
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        {/* Animated Background Gradient */}
        <motion.div
          className={cn(
            'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
            'bg-gradient-to-br from-transparent via-primary-50/50 to-secondary-50/50',
            'dark:from-transparent dark:via-primary-900/20 dark:to-secondary-900/20'
          )}
          initial={false}
          animate={isHovered ? { scale: 1 } : { scale: 0.8 }}
        />

        {/* Sparkle Effects */}
        {isHovered && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100],
                }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary-400 rounded-full"
              />
            ))}
          </>
        )}

        {/* Step Number Badge with Animated Ring */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <motion.div
            animate={isHovered ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            className={cn(
              'relative w-12 h-12 rounded-full flex items-center justify-center',
              'text-white font-bold text-lg shadow-lg',
              step.bgColor
            )}
            style={{ borderRadius: '50%' }}
          >
            {step.number}
            
            {/* Animated Ring */}
            <motion.div
              className={cn(
                'absolute inset-0 border-2 border-current',
                step.bgColor.replace('bg-', 'text-')
              )}
              style={{ borderRadius: '50%' }}
              animate={isHovered ? {
                scale: [1, 1.3, 1.3],
                opacity: [0.8, 0, 0],
              } : { scale: 1, opacity: 0 }}
              transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
            />
          </motion.div>
        </div>

        {/* Icon with Animation */}
        <div className="mt-10 mb-6 relative">
          <motion.div 
            className={cn(
              'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center relative',
              'bg-gradient-to-br from-gray-100 to-gray-50',
              'dark:from-gray-800 dark:to-gray-900',
              step.color
            )}
            animate={isHovered ? { rotate: [0, -10, 10, -10, 0] } : { rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={isHovered ? { scale: 1.2 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {step.icon}
            </motion.div>

            {/* Icon Glow Effect */}
            <motion.div
              className={cn(
                'absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500',
                step.bgColor
              )}
            />
          </motion.div>

          {/* Floating Particles around Icon */}
          {isHovered && (
            <>
              <motion.div
                animate={{
                  y: [-20, -30, -20],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className={cn('absolute top-0 left-1/2 w-2 h-2 rounded-full', step.bgColor)}
              />
              <motion.div
                animate={{
                  y: [-20, -30, -20],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className={cn('absolute top-2 right-4 w-1.5 h-1.5 rounded-full', step.bgColor)}
              />
              <motion.div
                animate={{
                  y: [-20, -30, -20],
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                className={cn('absolute top-2 left-4 w-1.5 h-1.5 rounded-full', step.bgColor)}
              />
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white relative z-10 min-h-[3.5rem] flex items-center justify-center">
          {t(step.titleKey)}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed relative z-10 flex-grow">
          {t(step.descriptionKey)}
        </p>

        {/* Bottom Accent Line */}
        <motion.div
          className={cn(
            'absolute bottom-0 left-0 h-1 rounded-full',
            step.bgColor
          )}
          initial={{ width: '0%' }}
          animate={isHovered ? { width: '100%' } : { width: '0%' }}
          transition={{ duration: 0.4 }}
        />

        {/* Corner Decoration */}
        <motion.div
          className={cn(
            'absolute top-0 right-0 w-20 h-20 opacity-5',
            step.bgColor
          )}
          style={{
            clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
          }}
          animate={isHovered ? { scale: 1.5, opacity: 0.1 } : { scale: 1, opacity: 0.05 }}
          transition={{ duration: 0.4 }}
        />
      </motion.div>
    </motion.div>
  );
}

