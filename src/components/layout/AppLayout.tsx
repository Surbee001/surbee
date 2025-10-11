"use client";

import React from "react";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AppLayout({
  children,
  hideSidebar = false,
  fullBleed = false,
}: Readonly<{
  children: React.ReactNode;
  hideSidebar?: boolean;
  fullBleed?: boolean;
}>) {
  return (
    <AuthGuard>
      <div 
        className="flex h-screen" 
        style={{
          fontFamily: 'var(--font-inter), sans-serif',
          backgroundColor: 'var(--surbee-bg-primary)',
          color: 'var(--surbee-fg-primary)'
        }}
      >
        {!hideSidebar && <DashboardSidebar />}
        <div 
          className={`dashboard-content flex-1 relative h-screen flex flex-col ${hideSidebar ? '' : 'pl-[200px]'} ${fullBleed ? '' : 'p-4'}`}
          style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}
        >
          {fullBleed ? (
            <div className="h-full overflow-auto" style={{ backgroundColor: 'var(--surbee-sidebar-bg)' }}>
              {children}
            </div>
          ) : (
            <div className="dashboard-main-container rounded-xl p-6 h-full overflow-y-auto relative" style={{
              backgroundColor: 'var(--surbee-bg-primary)',
              border: '1px solid var(--surbee-border-accent)',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {children}
              <style jsx>{`
                .dashboard-main-container::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}
