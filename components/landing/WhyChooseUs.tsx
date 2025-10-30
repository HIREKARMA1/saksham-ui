'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Card } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { Counter } from '@/components/ui/counter';
import { cn } from '@/lib/utils';

interface Reason {
  icon: React.ReactNode;
  titleKey: keyof import('@/lib/i18n').TranslationKeys;
  descriptionKey: keyof import('@/lib/i18n').TranslationKeys;
  color: string;
  benefits: string[];
}

export function WhyChooseUs() {
  const { t } = useTranslation();

  const reasons: Reason[] = [
    {
      icon: <Brain className="w-8 h-8" />,
      titleKey: 'whyChoose.aiPowered.title',
      descriptionKey: 'whyChoose.aiPowered.description',
      color: 'from-primary-500 to-primary-600',
      benefits: [
        'Personalized learning paths',
        'Smart recommendations',
        'Adaptive difficulty levels',
      ],
    },
    {
      icon: <Zap className="w-8 h-8" />,
      titleKey: 'whyChoose.realTime.title',
      descriptionKey: 'whyChoose.realTime.description',
      color: 'from-secondary-500 to-secondary-600',
      benefits: [
        'Instant feedback',
        'Live assistance',
        'Real-time analytics',
      ],
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      titleKey: 'whyChoose.comprehensive.title',
      descriptionKey: 'whyChoose.comprehensive.description',
      color: 'from-accent-green-500 to-accent-green-600',
      benefits: [
        '10,000+ practice questions',
        'Industry-specific content',
        'Regular updates',
      ],
    },
    {
      icon: <Award className="w-8 h-8" />,
      titleKey: 'whyChoose.expert.title',
      descriptionKey: 'whyChoose.expert.description',
      color: 'from-accent-orange-500 to-accent-orange-600',
      benefits: [
        'Expert-curated content',
        'Success stories',
        'Mentor support',
      ],
    },
  ];

  return (
    <section id="why-choose" className="section-container relative overflow-hidden bg-white dark:bg-gray-950">
      <AnimatedBackground variant="subtle" />
      <div className="text-center mb-16 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          {t('whyChoose.title')}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          {t('whyChoose.subtitle')}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 relative z-10">
        {reasons.map((reason, index) => (
          <ReasonCard
            key={index}
            reason={reason}
            index={index}
            t={t}
          />
        ))}
      </div>

      {/* Stats Section */}
      {/* <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 pt-16 border-t border-gray-200 dark:border-gray-800"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 150, suffix: 'K+', label: 'Active Users', decimals: 0 },
            { value: 10, suffix: 'K+', label: 'Jobs Secured', decimals: 0 },
            { value: 95, suffix: '%', label: 'Success Rate', decimals: 0 },
            { value: 4.2, suffix: '/5', label: 'User Rating', decimals: 1 },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl lg:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                <Counter 
                  end={stat.value} 
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  duration={2.5}
                />
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div> */}
    </section>
  );
}

interface ReasonCardProps {
  reason: Reason;
  index: number;
  t: (key: keyof import('@/lib/i18n').TranslationKeys) => string;
}

function ReasonCard({ reason, index, t }: ReasonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className="card-hover h-full p-8 group">
        {/* Icon with Gradient Background */}
        <div className={cn(
          'w-16 h-16 rounded-2xl flex items-center justify-center mb-6',
          'bg-gradient-to-br',
          reason.color,
          'text-white shadow-lg group-hover:scale-110 transition-transform'
        )}>
          {reason.icon}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
          {t(reason.titleKey)}
        </h3>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          {t(reason.descriptionKey)}
        </p>

        {/* Benefits List */}
        <ul className="space-y-3">
          {reason.benefits.map((benefit, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <CheckCircle2 className="w-5 h-5 text-accent-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
            </motion.li>
          ))}
        </ul>
      </Card>
    </motion.div>
  );
}

