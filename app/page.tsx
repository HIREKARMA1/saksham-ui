'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
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

// Dynamically import feature pages (these will handle their own auth)
const ResumePage = dynamic(() => import('@/app/dashboard/student/resume/page'), { ssr: false });
const AssessmentPage = dynamic(() => import('@/app/dashboard/student/assessment/page'), { ssr: false });
const JobsPage = dynamic(() => import('@/app/dashboard/student/jobs/page'), { ssr: false });
const AutoApplyPage = dynamic(() => import('@/app/dashboard/student/auto-apply/page'), { ssr: false });

export default function Home() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

  const handleFeatureChange = (featureId: string | null) => {
    setActiveFeature(featureId);
    
    // Scroll to top when switching features
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderFeature = () => {
    switch (activeFeature) {
      case 'resume':
        return <ResumePage />;
      case 'assessment':
        return <AssessmentPage />;
      case 'jobs':
        return <JobsPage />;
      case 'auto-apply':
        return <AutoApplyPage />;
      default:
        return null;
    }
  };

  return (
    <LandingLayout
      activeFeature={activeFeature}
      onFeatureChange={handleFeatureChange}
    >
      {activeFeature ? (
        // Render selected feature page
        <div className="min-h-screen">
          {renderFeature()}
        </div>
      ) : (
        // Render landing page sections
        <>
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
        </>
      )}
    </LandingLayout>
  );
}
