'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function Partners() {
  const { t } = useTranslation();

  // Placeholder for partner logos - replace with actual logos
  const partners = [
    { id: '1', name: 'Google' },
    { id: '2', name: 'Microsoft' },
    { id: '3', name: 'Amazon' },
    { id: '4', name: 'Facebook' },
    { id: '5', name: 'Apple' },
    { id: '6', name: 'Netflix' },
    { id: '7', name: 'Adobe' },
    { id: '8', name: 'Salesforce' },
    { id: '9', name: 'IBM' },
    { id: '10', name: 'Oracle' },
    { id: '11', name: 'Cisco' },
    { id: '12', name: 'Intel' },
  ];

  return (
    <section id="partners" className="section-container bg-gray-50 dark:bg-gray-900/50">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
        >
          {t('partners.title')}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          {t('partners.subtitle')}
        </motion.p>
      </div>

      {/* Partners Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-8">
        {partners.map((partner, index) => (
          <motion.div
            key={partner.id}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className="flex items-center justify-center"
          >
            <div className="w-full h-24 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex items-center justify-center group">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {partner.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Partner
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Call to Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-16 text-center"
      >
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Join the companies who trust Saksham for their recruitment needs
        </p>
        <button className="btn-primary">
          Become a Partner
        </button>
      </motion.div>
    </section>
  );
}

