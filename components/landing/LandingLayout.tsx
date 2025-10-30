'use client';

import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingSidebar } from './LandingSidebar';
import { Footer } from './Footer';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <LandingNavbar />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <LandingSidebar />
        </div>
        
        {/* Main Content */}
        <main className="flex-1 lg:ml-[280px] transition-all duration-300">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

