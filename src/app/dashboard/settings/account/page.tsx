"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, CreditCard, HelpCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SkeletonText, SkeletonCard, SkeletonForm } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [showFade, setShowFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        setShowFade(scrollRef.current.scrollTop > 0);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Only show loading on first visit, not on navigation
  useEffect(() => {
    if (!authLoading) {
      const hasLoaded = sessionStorage.getItem('dashboard_loaded');
      if (hasLoaded) {
        setIsLoading(false);
      } else {
        const timer = setTimeout(() => {
          setIsLoading(false);
          sessionStorage.setItem('dashboard_loaded', 'true');
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [authLoading]);


  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 px-6 md:px-10 lg:px-16 pt-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-6xl mx-auto">
            {/* Settings Navigation Skeleton */}
            <div className="lg:col-span-1">
              <div className="space-y-4">
                <SkeletonText width="120px" height="2rem" className="mb-6" />
                <div className="space-y-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2">
                      <div className="skeleton-circle" style={{ width: '16px', height: '16px' }}></div>
                      <SkeletonText width={`${60 + Math.random() * 40}px`} height="14px" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Help Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              {/* Contact Support Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="140px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="300px" height="1rem" className="mb-6" />
                  
                  <SkeletonForm fields={4} />
                  
                  <div className="skeleton-base" style={{ width: '140px', height: '2.5rem', borderRadius: '0.5rem' }}></div>
                </div>
              </div>

              {/* Quick Help Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="100px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="220px" height="1rem" className="mb-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="skeleton-base" style={{ height: '4rem', borderRadius: '0.5rem' }}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Documentation Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="130px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="280px" height="1rem" className="mb-6" />
                  
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="skeleton-circle" style={{ width: '20px', height: '20px' }}></div>
                          <div className="flex-1">
                            <SkeletonText width={`${120 + Math.random() * 80}px`} height="1rem" className="mb-1" />
                            <SkeletonText width={`${200 + Math.random() * 100}px`} height="0.75rem" />
                          </div>
                        </div>
                        <div className="skeleton-circle" style={{ width: '16px', height: '16px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact Information Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="160px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="250px" height="1rem" className="mb-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="skeleton-base" style={{ height: '6rem', borderRadius: '0.5rem' }}></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 px-6 md:px-10 lg:px-16 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-6xl mx-auto">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h1 className="projects-title">
                Settings
              </h1>

              <div className="space-y-1">
                {[
                  { icon: Settings, label: 'General', active: false, href: '/dashboard/settings/general' },
                  { icon: HelpCircle, label: 'Account', active: true, href: '/dashboard/settings/account' },
                  { icon: Shield, label: 'Privacy & Security', active: false, href: '/dashboard/settings/privacy' },
                  { icon: CreditCard, label: 'Billing & Plans', active: false, href: '/dashboard/settings/billing' },
                  { icon: Settings, label: 'Connectors', active: false, href: '/dashboard/settings/connectors' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.href)}
                      className={`
                        relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer mb-0.5
                        ${item.active ? 'text-theme-primary' : 'text-theme-secondary hover:text-theme-primary'}
                      `}
                      style={{
                        backgroundColor: item.active 
                          ? 'var(--surbee-sidebar-active)' 
                          : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!item.active) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[14px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

            {/* Account Content - Only this scrolls */}
            <div className="lg:col-span-3 relative h-full flex flex-col min-h-0">
              {/* Fade overlay at top - only show when scrolling */}
              <div className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--surbee-bg-primary)] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                showFade ? 'opacity-100' : 'opacity-0'
              }`} />
              
              {/* Scrollable content - only the cards */}
              <div 
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto pr-4 space-y-6 pb-16" 
                style={{ scrollbarWidth: 'thin' }}
              >
              {/* Account */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Log out option */}
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[16px]" style={{ color: 'var(--surbee-fg-primary)' }}>
                        Log out of all devices
                      </span>
                      <button
                        onClick={() => {
                          // Logout logic here
                          console.log('Logging out...');
                        }}
                        className="px-4 py-2 rounded-lg border text-[14px] font-medium transition-colors"
                        style={{
                          borderColor: 'var(--surbee-border-accent)',
                          backgroundColor: 'transparent',
                          color: 'var(--surbee-fg-primary)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        Log out
                      </button>
                    </div>

                    <div className="h-px" style={{ backgroundColor: 'var(--surbee-border-primary)' }} />

                    {/* Delete account */}
                    <div className="flex items-center justify-between py-3">
                      <span className="text-[16px]" style={{ color: 'var(--surbee-fg-primary)' }}>
                        Delete account
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                            console.log('Deleting account...');
                          }
                        }}
                        className="text-[14px] underline"
                        style={{ color: 'var(--surbee-fg-primary)' }}
                      >
                        Contact support
                      </button>
                    </div>

                    <div className="h-px" style={{ backgroundColor: 'var(--surbee-border-primary)' }} />

                    {/* Organization ID */}
                    <div>
                      <label className="text-[16px] mb-3 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                        Organization ID
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={user?.uid ? user.uid.substring(0, 36) : 'loading...'}
                          readOnly
                          className="flex-1 p-2.5 rounded-lg border text-[14px] font-mono"
                          style={{
                            backgroundColor: 'var(--surbee-bg-secondary)',
                            borderColor: 'var(--surbee-border-accent)',
                            color: 'var(--surbee-fg-primary)'
                          }}
                        />
                        <button
                          onClick={() => {
                            const orgId = user?.uid ? user.uid.substring(0, 36) : '';
                            navigator.clipboard.writeText(orgId);
                          }}
                          className="transition-opacity hover:opacity-70"
                          style={{ color: 'var(--surbee-fg-primary)' }}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <rect x="10" y="6" width="10" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}