'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Monitor, 
  Mic, 
  Briefcase, 
  FileText, 
  Database, 
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Card } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { cn } from '@/lib/utils';

interface Feature {
  id: string;
  icon: React.ReactNode;
  titleKey: keyof import('@/lib/i18n').TranslationKeys;
  descriptionKey: keyof import('@/lib/i18n').TranslationKeys;
  color: string;
  bgColor: string;
  image?: string;
}

export function FeatureCards() {
  const { t } = useTranslation();

  const features: Feature[] = [
    {
      id: 'copilot',
      icon: <Monitor className="w-6 h-6" />,
      titleKey: 'feature.assessment.title',
      descriptionKey: 'feature.assessment.description',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'mock-interview',
      icon: <Mic className="w-6 h-6" />,
      titleKey: 'feature.mockInterview.title',
      descriptionKey: 'feature.mockInterview.description',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      id: 'job-hunter',
      icon: <Briefcase className="w-6 h-6" />,
      titleKey: 'feature.jobHunter.title',
      descriptionKey: 'feature.jobHunter.description',
      color: 'text-pink-600 dark:text-pink-400',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
    },
    {
      id: 'resume-builder',
      icon: <FileText className="w-6 h-6" />,
      titleKey: 'feature.resumeBuilder.title',
      descriptionKey: 'feature.resumeBuilder.description',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
    {
      id: 'question-bank',
      icon: <Database className="w-6 h-6" />,
      titleKey: 'feature.questionBank.title',
      descriptionKey: 'feature.questionBank.description',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      id: 'analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      titleKey: 'feature.analytics.title',
      descriptionKey: 'feature.analytics.description',
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
  ];

  return (
    <section id="features" className="section-container bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
      <AnimatedBackground variant="alternate" />
      <div className="text-center mb-16 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 mb-4"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-semibold">{t('features.title')}</span>
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          {t('features.title')}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          {t('features.subtitle')}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.id}
            feature={feature}
            index={index}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  t: (key: keyof import('@/lib/i18n').TranslationKeys) => string;
}

function FeatureCard({ feature, index, t }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="card-hover h-full p-6 group relative overflow-hidden">
        {/* Background Gradient Effect */}
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
          feature.bgColor
        )} />

        <div className="relative z-10">
          {/* Icon */}
          <div className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110',
            feature.bgColor,
            feature.color
          )}>
            {feature.icon}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {t(feature.titleKey)}
          </h3>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
            {t(feature.descriptionKey)}
          </p>

          {/* Learn More Link */}
          <div className="flex items-center gap-2 text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-sm">{t('common.learnMore')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute -bottom-2 -right-2 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
          <div className={cn('w-full h-full rounded-full', feature.bgColor)} />
        </div>
      </Card>
    </motion.div>
  );
}

