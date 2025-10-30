'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    X,
    Check,
    Clock,
    Target,
    Brain,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { AnimatedBackground } from '@/components/ui/animated-background';
import { cn } from '@/lib/utils';

interface Problem {
    id: string;
    icon: React.ReactNode;
    titleKey: keyof import('@/lib/i18n').TranslationKeys;
    descriptionKey: keyof import('@/lib/i18n').TranslationKeys;
    pointKeys: (keyof import('@/lib/i18n').TranslationKeys)[];
}

interface Solution {
    id: string;
    icon: React.ReactNode;
    titleKey: keyof import('@/lib/i18n').TranslationKeys;
    descriptionKey: keyof import('@/lib/i18n').TranslationKeys;
    benefitKeys: (keyof import('@/lib/i18n').TranslationKeys)[];
}

export function ProblemSolution() {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'problems' | 'solutions'>('problems');

    const problems: Problem[] = [
        {
            id: 'unprepared',
            icon: <AlertCircle className="w-6 h-6" />,
            titleKey: 'problem.unprepared.title',
            descriptionKey: 'problem.unprepared.description',
            pointKeys: [
                'problem.unprepared.point1',
                'problem.unprepared.point2',
                'problem.unprepared.point3',
                'problem.unprepared.point4'
            ]
        },
        {
            id: 'time',
            icon: <Clock className="w-6 h-6" />,
            titleKey: 'problem.time.title',
            descriptionKey: 'problem.time.description',
            pointKeys: [
                'problem.time.point1',
                'problem.time.point2',
                'problem.time.point3',
                'problem.time.point4'
            ]
        },
        {
            id: 'feedback',
            icon: <Target className="w-6 h-6" />,
            titleKey: 'problem.feedback.title',
            descriptionKey: 'problem.feedback.description',
            pointKeys: [
                'problem.feedback.point1',
                'problem.feedback.point2',
                'problem.feedback.point3',
                'problem.feedback.point4'
            ]
        },
        {
            id: 'outdated',
            icon: <TrendingUp className="w-6 h-6" />,
            titleKey: 'problem.outdated.title',
            descriptionKey: 'problem.outdated.description',
            pointKeys: [
                'problem.outdated.point1',
                'problem.outdated.point2',
                'problem.outdated.point3',
                'problem.outdated.point4'
            ]
        }
    ];

    const solutions: Solution[] = [
        {
            id: 'ai-practice',
            icon: <Brain className="w-6 h-6" />,
            titleKey: 'solution.aiPractice.title',
            descriptionKey: 'solution.aiPractice.description',
            benefitKeys: [
                'solution.aiPractice.benefit1',
                'solution.aiPractice.benefit2',
                'solution.aiPractice.benefit3',
                'solution.aiPractice.benefit4'
            ]
        },
        {
            id: 'instant-feedback',
            icon: <CheckCircle2 className="w-6 h-6" />,
            titleKey: 'solution.instantFeedback.title',
            descriptionKey: 'solution.instantFeedback.description',
            benefitKeys: [
                'solution.instantFeedback.benefit1',
                'solution.instantFeedback.benefit2',
                'solution.instantFeedback.benefit3',
                'solution.instantFeedback.benefit4'
            ]
        },
        {
            id: 'comprehensive',
            icon: <Target className="w-6 h-6" />,
            titleKey: 'solution.comprehensive.title',
            descriptionKey: 'solution.comprehensive.description',
            benefitKeys: [
                'solution.comprehensive.benefit1',
                'solution.comprehensive.benefit2',
                'solution.comprehensive.benefit3',
                'solution.comprehensive.benefit4'
            ]
        },
        {
            id: 'smart-prep',
            icon: <Sparkles className="w-6 h-6" />,
            titleKey: 'solution.smartPrep.title',
            descriptionKey: 'solution.smartPrep.description',
            benefitKeys: [
                'solution.smartPrep.benefit1',
                'solution.smartPrep.benefit2',
                'solution.smartPrep.benefit3',
                'solution.smartPrep.benefit4'
            ]
        }
    ];

    return (
        <section id="problem-solution" className="section-container relative overflow-hidden bg-white dark:bg-gray-950">
            <AnimatedBackground variant="subtle" />

            <div className="relative z-10">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-full mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                            {t('problemSolution.badge')}
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
                    >
                        {t('problemSolution.title')}
                        <span className="gradient-text"> Interview Success</span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
                    >
                        {t('problemSolution.subtitle')}
                    </motion.p>
                </div>

                {/* Tab Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex justify-center mb-12"
                >
                    <div className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('problems')}
                            className={cn(
                                'px-6 py-3 rounded-lg font-semibold transition-all duration-300',
                                activeTab === 'problems'
                                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <X className="w-5 h-5 inline-block mr-2" />
                            {t('problemSolution.tabProblems')}
                        </button>
                        <button
                            onClick={() => setActiveTab('solutions')}
                            className={cn(
                                'px-6 py-3 rounded-lg font-semibold transition-all duration-300',
                                activeTab === 'solutions'
                                    ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            )}
                        >
                            <Check className="w-5 h-5 inline-block mr-2" />
                            {t('problemSolution.tabSolutions')}
                        </button>
                    </div>
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto">
                    {activeTab === 'problems' ? (
                        <>
                            {problems.map((problem, index) => (
                                <ProblemCard key={problem.id} problem={problem} index={index} />
                            ))}
                        </>
                    ) : (
                        <>
                            {solutions.map((solution, index) => (
                                <SolutionCard key={solution.id} solution={solution} index={index} />
                            ))}
                        </>
                    )}
                </div>

            </div>
        </section>
    );
}

interface ProblemCardProps {
    problem: Problem;
    index: number;
}

function ProblemCard({ problem, index }: ProblemCardProps) {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
        >
            <div className="card p-6 h-full bg-red-50/50 dark:bg-red-900/10 border-l-4 border-red-500 hover:shadow-xl transition-all duration-300">
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                        {problem.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {t(problem.titleKey)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {t(problem.descriptionKey)}
                        </p>
                    </div>
                </div>

                {/* Pain Points */}
                <ul className="space-y-2">
                    {problem.pointKeys.map((pointKey, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <span>{t(pointKey)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

interface SolutionCardProps {
    solution: Solution;
    index: number;
}

function SolutionCard({ solution, index }: SolutionCardProps) {
    const { t } = useTranslation();

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group"
        >
            <div className="card p-6 h-full bg-green-50/50 dark:bg-green-900/10 border-l-4 border-green-500 hover:shadow-xl transition-all duration-300">
                {/* Icon & Title */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                        {solution.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {t(solution.titleKey)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {t(solution.descriptionKey)}
                        </p>
                    </div>
                </div>

                {/* Benefits */}
                <ul className="space-y-2">
                    {solution.benefitKeys.map((benefitKey, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>{t(benefitKey)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}

