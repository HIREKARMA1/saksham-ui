'use client';

import React from 'react';
import {
  LandingLayout,
  HeroSection,
  FeatureCards,
  WhyChooseUs,
  HowItWorks,
  Testimonials,
  Partners,
  FAQ,
} from '@/components/landing';

export default function Home() {
  return (
    <LandingLayout>
      {/* Hero Section with animated background */}
      <HeroSection />

      {/* Feature Cards Section */}
      <FeatureCards />

      {/* Why Choose Us Section */}
      <WhyChooseUs />

      {/* How It Works Section */}
      <HowItWorks />

      {/* Testimonials Section */}
      <Testimonials />

      {/* Partners Section */}
      <Partners />

      {/* FAQ Section */}
      <FAQ />
    </LandingLayout>
  );
}
