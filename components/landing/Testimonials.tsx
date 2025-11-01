'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { Card } from '@/components/ui/card';
import { AnimatedBackground } from '@/components/ui/animated-background';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  image?: string;
  rating: number;
  text: string;
}

export function Testimonials() {
  const { t } = useTranslation();

  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Rajesh Kumar',
      role: 'Software Engineer',
      company: 'Google',
      rating: 5,
      text: 'Solviq AI helped me prepare for my dream job at Google. The mock interviews were incredibly realistic, and the AI feedback was spot-on. I highly recommend it to anyone serious about landing a great job.',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      role: 'Data Scientist',
      company: 'Microsoft',
      rating: 5,
      text: 'The AI-powered resume builder and interview copilot are game-changers. I went from having no responses to getting multiple interview calls within weeks. The platform is truly worth every penny!',
    },
    {
      id: '3',
      name: 'Amit Patel',
      role: 'Product Manager',
      company: 'Amazon',
      rating: 5,
      text: 'As someone who struggled with technical interviews, Solviq gave me the confidence and preparation I needed. The question bank is comprehensive, and the real-time feedback helped me improve quickly.',
    },
    {
      id: '4',
      name: 'Sneha Reddy',
      role: 'Full Stack Developer',
      company: 'Flipkart',
      rating: 5,
      text: 'I used Solviq for 3 months and secured 4 job offers! The mock interviews felt so real that I was completely prepared for the actual ones. This platform is a must-have for job seekers.',
    },
    {
      id: '5',
      name: 'Arjun Mehta',
      role: 'Frontend Developer',
      company: 'Zomato',
      rating: 4,
      text: 'Great platform with excellent features. The AI job hunter saved me tons of time by automatically applying to relevant positions. The only thing I\'d improve is adding more company-specific question sets.',
    },
    {
      id: '6',
      name: 'Kavya Singh',
      role: 'Business Analyst',
      company: 'Deloitte',
      rating: 5,
      text: 'Solviq\'s analytics dashboard helped me track my progress and identify weak areas. The personalized learning path was incredibly effective. I landed my dream job within 2 months!',
    },
  ];

  return (
    <section id="testimonials" className="section-container relative overflow-hidden">
      <AnimatedBackground variant="alternate" />
      <div className="text-center mb-16 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          {t('testimonials.title')}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          {t('testimonials.subtitle')}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 relative z-10">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

function TestimonialCard({ testimonial, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="card-hover h-full p-6 flex flex-col">
        {/* Quote Icon */}
        <div className="mb-4">
          <Quote className="w-10 h-10 text-primary-300 dark:text-primary-700" />
        </div>

        {/* Testimonial Text */}
        <p className="text-gray-700 dark:text-gray-300 mb-6 flex-1 leading-relaxed">
          &ldquo;{testimonial.text}&rdquo;
        </p>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < testimonial.rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Author Info */}
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {testimonial.name.charAt(0)}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white truncate">
              {testimonial.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {testimonial.role} at {testimonial.company}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

