'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Youtube,
  Heart
} from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';

export function Footer() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const currentYear = new Date().getFullYear();

  const productLinks = [
    { label: 'Mock Interview', href: '/features/mock-interview' },
    { label: 'AI Copilot', href: '/features/copilot' },
    { label: 'Resume Builder', href: '/features/resume' },
    { label: 'Job Hunter', href: '/features/jobs' },
    { label: 'Question Bank', href: '/features/questions' },
    { label: 'Analytics', href: '/features/analytics' },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Blog', href: '/blog' },
    { label: 'Press', href: '/press' },
    { label: 'Partners', href: '/partners' },
  ];

  const supportLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'FAQ', href: '/#faq' },
    { label: 'Community', href: '/community' },
    { label: 'Tutorials', href: '/tutorials' },
  ];

  const legalLinks = [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Policy', href: '/cookies' },
    { label: 'Refund Policy', href: '/refund' },
  ];

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, href: '#', label: 'Facebook' },
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
    { icon: <Instagram className="w-5 h-5" />, href: '#', label: 'Instagram' },
    { icon: <Youtube className="w-5 h-5" />, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 dark:bg-black text-gray-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="relative w-[150px] h-16">
                <Image
                  src="/images/HKlogowhite.png"
                  alt="Solviq AI Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t('footer.tagline')}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-400" />
                <a 
                  href="mailto:support@solviq.ai" 
                  className="hover:text-primary-400 transition-colors"
                >
                  support@solviq.ai
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-400" />
                <a 
                  href="tel:+911234567890" 
                  className="hover:text-primary-400 transition-colors"
                >
                  +91 123 456 7890
                </a>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>
                  Bangalore, Karnataka, India
                </span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('footer.product')}
            </h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('footer.company')}
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('footer.support')}
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">
              {t('footer.legal')}
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href}
                    className="hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright & Powered By */}
          <div className="text-sm text-gray-400 text-center md:text-left">
            <p className="flex items-center gap-1 flex-wrap justify-center md:justify-start mb-2">
              {t('footer.copyright')} Made with 
              <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-1" /> 
              in India
            </p>
            <p className="text-gray-500">
              Powered by{' '}
              <a 
                href="https://www.hirekarma.in/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary-400 hover:text-primary-300 transition-colors font-medium"
              >
                HireKarma Pvt Ltd
              </a>
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-primary-500 flex items-center justify-center transition-colors"
                aria-label={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

