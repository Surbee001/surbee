"use client";

import React from "react";
import ConsoleSidebar from "@/components/console/ConsoleSidebar";
import ConsoleTopNav from "@/components/console/ConsoleTopNav";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function ConsoleLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
        <ConsoleSidebar />
        <div
          className="dashboard-content flex-1 relative h-screen flex flex-col"
          style={{
            backgroundColor: 'var(--surbee-sidebar-bg)',
            marginLeft: '200px'
          }}
        >
          <ConsoleTopNav />
          <div className="flex-1 p-4 overflow-hidden">
            <div className="dashboard-main-container rounded-xl p-6 h-full overflow-y-auto relative" style={{
              backgroundColor: 'var(--surbee-bg-primary)',
              border: '1px solid var(--surbee-border-primary)',
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
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
