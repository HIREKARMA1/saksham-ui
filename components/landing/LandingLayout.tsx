'use client';

import React, { useState } from 'react';
import { LandingNavbar } from './LandingNavbar';
import { LandingSidebar } from './LandingSidebar';
import { Footer } from './Footer';
import { cn } from '@/lib/utils';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <LandingNavbar 
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
      />
      
      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block">
          <LandingSidebar isCollapsed={isSidebarCollapsed} />
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
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

