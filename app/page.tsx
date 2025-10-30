'use client';

import React from 'react';
import {
  LandingLayout,
  HeroSection,
  FeatureCards,
  WhyChooseUs,
  HowItWorks,
  ProblemSolution,
  // Testimonials,
  // Partners,
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

      {/* Problem Solution Section */}
      <ProblemSolution />

      {/* Testimonials Section */}
      {/* <Testimonials /> */}

      {/* Partners Section */}
      {/* <Partners /> */}

      {/* FAQ Section */}
      <FAQ />
    </LandingLayout>
  );
}
