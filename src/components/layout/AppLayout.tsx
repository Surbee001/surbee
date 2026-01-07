"use client";

import React, { useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useTheme } from "@/contexts/ThemeContext";

export default function AppLayout({
  children,
  hideSidebar = false,
  fullBleed = false,
}: Readonly<{
  children: React.ReactNode;
  hideSidebar?: boolean;
  fullBleed?: boolean;
}>) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const { resolvedTheme } = useTheme();

  // Only show gradient on /home page (exact match)
  const showGradient = pathname === '/home';

  // Theme-based gradients
  const darkGradient = `linear-gradient(to bottom in oklab,
    rgba(255, 255, 255, 1) 0%,
    rgba(147, 197, 253, 0.65) 15%,
    rgba(59, 130, 246, 0.45) 30%,
    rgba(30, 58, 138, 0.5) 50%,
    rgba(15, 23, 42, 0.8) 70%,
    rgb(19, 19, 20) 100%)`;

  const lightGradient = `linear-gradient(to bottom in oklab,
    #FF5519 0%,
    #DBCCC5 15%,
    #FFC7E6 30%,
    #006EB1 50%,
    #262D2E 70%,
    #131314 100%)`;

  const darkOverlay = "linear-gradient(to top, rgb(19, 19, 20) 0%, rgb(19, 19, 20) 30%, transparent 70%)";
  const lightOverlay = "linear-gradient(to top, rgb(19, 19, 20) 0%, rgb(19, 19, 20) 30%, transparent 70%)";

  const handleToggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  return (
    <AuthGuard>
      <div
        className="flex h-screen w-full overflow-hidden"
        style={{
          fontFamily: 'var(--font-inter), sans-serif',
          backgroundColor: 'var(--surbee-bg-primary)',
          color: 'var(--surbee-fg-primary)',
          transition: 'background-color 0.2s ease, color 0.2s ease',
        }}
      >
        {!hideSidebar && (
          <div
            className="flex-none h-full relative z-20"
            style={{
              width: isSidebarCollapsed ? '60px' : '200px',
              transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
             <DashboardSidebar
               isCollapsed={isSidebarCollapsed}
               onToggleCollapse={handleToggleSidebar}
             />
          </div>
        )}
        <div
          className={`dashboard-content flex-1 relative h-full flex flex-col min-w-0 ${fullBleed ? '' : 'p-4'}`}
          style={{
            backgroundColor: 'var(--surbee-sidebar-bg)',
            transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease',
          }}
        >
          {fullBleed ? (
            <div className="h-full flex flex-col w-full" style={{ backgroundColor: 'var(--surbee-sidebar-bg)', transition: 'background-color 0.2s ease' }}>
              {children}
            </div>
          ) : (
            <div
              className={`dashboard-main-container rounded-xl p-6 h-full relative w-full ${showGradient ? 'gradient-area' : ''}`}
              style={{
                backgroundColor: showGradient ? '#131314' : 'var(--surbee-bg-primary)',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                overflowY: showGradient ? 'hidden' : 'auto',
                transition: 'background-color 0.2s ease',
                ...(showGradient ? {
                  // Override CSS variables for dark content when gradient is showing
                  '--surbee-bg-primary': '#131314',
                  '--surbee-bg-secondary': '#1E1E1F',
                  '--surbee-bg-tertiary': '#252526',
                  '--surbee-fg-primary': '#E8E8E8',
                  '--surbee-fg-secondary': '#d1d5db',
                  '--surbee-fg-muted': '#9ca3af',
                  '--surbee-card-bg': '#1E1E1F',
                  '--surbee-card-border': 'rgba(255, 255, 255, 0.08)',
                  '--surbee-border-primary': 'rgba(255, 255, 255, 0.08)',
                  '--surbee-border-accent': 'rgba(255, 255, 255, 0.08)',
                  '--surbee-accent-subtle': 'rgba(156, 163, 175, 0.1)',
                  // Dropdown overrides for dark style
                  '--surbee-dropdown-bg': 'rgba(19, 19, 20, 0.95)',
                  '--surbee-dropdown-border': 'rgba(232, 232, 232, 0.15)',
                  '--surbee-dropdown-item-hover': 'rgba(255, 255, 255, 0.05)',
                  '--surbee-dropdown-text': '#E8E8E8',
                  '--surbee-dropdown-text-muted': 'rgba(232, 232, 232, 0.6)',
                  '--surbee-dropdown-separator': 'rgba(232, 232, 232, 0.08)',
                } as React.CSSProperties : {})
              }}
            >
              {/* Background gradient - sky effect: only on /home page */}
              {showGradient && (
                <>
                  {/* Dark mode gradient */}
                  <div
                    className="absolute pointer-events-none rounded-xl"
                    style={{
                      background: darkGradient,
                      filter: 'blur(40px)',
                      top: '-40px',
                      left: '-40px',
                      right: '-40px',
                      bottom: '-40px',
                      zIndex: 0,
                      opacity: resolvedTheme === 'dark' ? 1 : 0,
                      transition: 'opacity 0.5s ease-in-out',
                    }}
                  />
                  {/* Light mode gradient */}
                  <div
                    className="absolute pointer-events-none rounded-xl"
                    style={{
                      background: lightGradient,
                      filter: 'blur(40px)',
                      top: '-40px',
                      left: '-40px',
                      right: '-40px',
                      bottom: '-40px',
                      zIndex: 0,
                      opacity: resolvedTheme === 'dark' ? 0 : 1,
                      transition: 'opacity 0.5s ease-in-out',
                    }}
                  />
                  {/* Dark overlay gradient - fades to background color */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{
                      background: darkOverlay,
                      zIndex: 1,
                      opacity: resolvedTheme === 'dark' ? 1 : 0,
                      transition: 'opacity 0.5s ease-in-out',
                    }}
                  />
                  {/* Light overlay gradient - fades to background color */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-xl"
                    style={{
                      background: lightOverlay,
                      zIndex: 1,
                      opacity: resolvedTheme === 'dark' ? 0 : 1,
                      transition: 'opacity 0.5s ease-in-out',
                    }}
                  />
                </>
              )}
              {/* Content layer */}
              <div className="relative z-10 h-full">
                {children}
              </div>
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
