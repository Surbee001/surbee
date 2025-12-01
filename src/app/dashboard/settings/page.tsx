"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading) {
      router.replace('/dashboard/settings/general');
    }
  }, [authLoading, router]);

  // Show nothing while redirecting
  return null;

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

            {/* Settings Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              {/* Appearance Settings Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="120px" height="1.5rem" className="mb-4" />
                  <div className="space-y-3">
                    <SkeletonText width="100%" height="3rem" />
                    <div className="grid grid-cols-3 gap-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-base" style={{ height: '4rem', borderRadius: '0.5rem' }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Survey Preferences Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="160px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="300px" height="1rem" className="mb-6" />
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex-1">
                          <SkeletonText width="140px" height="1rem" className="mb-1" />
                          <SkeletonText width="240px" height="0.75rem" />
                        </div>
                        <div className="skeleton-base" style={{ width: '44px', height: '24px', borderRadius: '12px' }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Export Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="120px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="280px" height="1rem" className="mb-6" />
                  <div className="space-y-4">
                    <div>
                      <SkeletonText width="180px" height="1rem" className="mb-2" />
                      <div className="skeleton-form-input" style={{ height: '2.5rem' }}></div>
                    </div>
                    <div>
                      <SkeletonText width="200px" height="1rem" className="mb-2" />
                      <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="skeleton-circle" style={{ width: '16px', height: '16px' }}></div>
                            <SkeletonText width={`${80 + Math.random() * 60}px`} height="0.75rem" />
                          </div>
                        ))}
                      </div>
                    </div>
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
                  { icon: HelpCircle, label: 'Account', active: false, href: '/dashboard/settings/account' },
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

          {/* Appearance Content - Only this scrolls */}
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
            {/* Appearance Settings */}
            <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
              <CardHeader>
                <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>

            {/* Additional Settings Placeholders */}
            <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
              <CardHeader>
                <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                  Survey Preferences
                </CardTitle>
                <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                  Configure default settings for your surveys.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[14px] font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                        Auto-save surveys
                      </h4>
                      <p className="text-[12px]" style={{ color: 'var(--surbee-fg-muted)' }}>
                        Automatically save survey progress every 30 seconds
                      </p>
                    </div>
                    <button 
                      onClick={() => setAutoSave(!autoSave)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        autoSave ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <div 
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          autoSave ? 'transform translate-x-5' : 'transform translate-x-0.5'
                        }`}
                      ></div>
                    </button>
                  </div>
                  
                  <div className="h-px w-full" style={{ backgroundColor: 'var(--surbee-border-primary)' }}></div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[14px] font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                        Analytics tracking
                      </h4>
                      <p className="text-[12px]" style={{ color: 'var(--surbee-fg-muted)' }}>
                        Enable advanced response quality analysis
                      </p>
                    </div>
                    <button 
                      onClick={() => setAnalyticsTracking(!analyticsTracking)}
                      className={`w-11 h-6 rounded-full transition-colors relative ${
                        analyticsTracking ? 'bg-blue-500' : 'bg-gray-600'
                      }`}
                    >
                      <div 
                        className={`w-5 h-5 rounded-full bg-white transition-transform ${
                          analyticsTracking ? 'transform translate-x-5' : 'transform translate-x-0.5'
                        }`}
                      ></div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
              <CardHeader>
                <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                  Data Export
                </CardTitle>
                <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                  Configure how you want to export your survey data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-[14px] font-medium mb-2 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Default export format
                    </label>
                    <select 
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="w-full p-2 rounded-lg border text-[14px] theme-input"
                    >
                      <option value="csv">CSV</option>
                      <option value="excel">Excel (XLSX)</option>
                      <option value="json">JSON</option>
                      <option value="pdf">PDF Report</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-[14px] font-medium mb-2 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                      Include response metadata
                    </label>
                    <div className="space-y-2">
                      {[
                        { key: 'timestamps', label: 'Timestamps' },
                        { key: 'ipAddresses', label: 'IP addresses' },
                        { key: 'userAgents', label: 'User agents' },
                        { key: 'responseTimes', label: 'Response times' }
                      ].map((item) => (
                        <label key={item.key} className="flex items-center gap-2">
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={metadataSettings[item.key as keyof typeof metadataSettings]}
                            onChange={(e) => setMetadataSettings(prev => ({
                              ...prev,
                              [item.key]: e.target.checked
                            }))}
                          />
                          <span className="text-[12px] text-theme-secondary">
                            {item.label}
                          </span>
                        </label>
                      ))}
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