'use client';

import React, { useState } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingSidebar } from './LandingSidebar';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface LandingLayoutProps {
  children: React.ReactNode;
  activeFeature?: string | null;
  onFeatureChange?: (featureId: string | null) => void;
}

export function LandingLayout({ children, activeFeature, onFeatureChange }: LandingLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <LandingNavbar 
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 flex-col">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <LandingSidebar 
            isCollapsed={isSidebarCollapsed}
            activeFeature={activeFeature}
            onFeatureChange={onFeatureChange}
          />
        </div>
        
        {/* Main Content */}
        <main 
          className={cn(
            "flex-1 transition-all duration-300",
            isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"
          )}
        >
          {children}
        </main>
        
        {/* Footer - Only show when not viewing a feature */}
        {!activeFeature && (
          <div 
            className={cn(
              "transition-all duration-300",
              isSidebarCollapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"
            )}
          >
            <Footer />
          </div>
        )}
      </div>
    </div>
  );
}

