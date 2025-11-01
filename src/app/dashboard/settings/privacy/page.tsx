"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, CreditCard, HelpCircle, Lock, Eye, EyeOff, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SkeletonText, SkeletonCard, SkeletonForm } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: true,
    analyticsTracking: true,
    marketingEmails: false,
    thirdPartySharing: false,
    publicProfile: false,
    activityVisibility: 'private', // public, friends, private
    searchEngineIndexing: false
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handlePrivacyToggle = (setting: string, value: boolean) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
  };

  const ToggleSwitch = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: (value: boolean) => void; disabled?: boolean }) => (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : enabled 
            ? 'bg-blue-500' 
            : 'bg-gray-600'
      }`}
      disabled={disabled}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white transition-transform ${
          enabled ? 'transform translate-x-5' : 'transform translate-x-0.5'
        }`}
      />
    </button>
  );

  const handleDataDownload = () => {
    console.log('Starting data export...');
    // TODO: Implement data export functionality
  };

  const handleAccountDeletion = () => {
    console.log('Account deletion requested');
    setShowDeleteModal(false);
    // TODO: Implement account deletion
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>
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

            {/* Privacy Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              {/* Account Security Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="skeleton-circle" style={{ width: '20px', height: '20px' }}></div>
                    <SkeletonText width="140px" height="1.5rem" />
                  </div>
                  <SkeletonText width="300px" height="1rem" className="mb-6" />
                  
                  {/* Change Password Section */}
                  <div>
                    <SkeletonText width="120px" height="1rem" className="mb-3" />
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-form-input" style={{ height: '3rem' }}></div>
                      ))}
                      <div className="skeleton-base" style={{ width: '140px', height: '2.5rem', borderRadius: '0.5rem' }}></div>
                    </div>
                  </div>
                  
                  {/* 2FA Section */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <SkeletonText width="160px" height="1rem" className="mb-1" />
                      <SkeletonText width="220px" height="0.75rem" />
                    </div>
                    <div className="skeleton-base" style={{ width: '44px', height: '24px', borderRadius: '12px' }}></div>
                  </div>
                  
                  {/* Active Sessions */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <SkeletonText width="120px" height="1rem" />
                      <SkeletonText width="140px" height="0.75rem" />
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="skeleton-base" style={{ height: '3.5rem', borderRadius: '0.5rem' }}></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Controls Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="skeleton-circle" style={{ width: '20px', height: '20px' }}></div>
                    <SkeletonText width="140px" height="1.5rem" />
                  </div>
                  <SkeletonText width="280px" height="1rem" className="mb-6" />
                  
                  {/* Privacy toggles */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <SkeletonText width={`${120 + Math.random() * 80}px`} height="1rem" className="mb-1" />
                        <SkeletonText width={`${200 + Math.random() * 100}px`} height="0.75rem" />
                      </div>
                      <div className="skeleton-base" style={{ width: '44px', height: '24px', borderRadius: '12px' }}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile Visibility Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="140px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="250px" height="1rem" className="mb-6" />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <SkeletonText width="100px" height="1rem" className="mb-1" />
                      <SkeletonText width="180px" height="0.75rem" />
                    </div>
                    <div className="skeleton-base" style={{ width: '44px', height: '24px', borderRadius: '12px' }}></div>
                  </div>
                  
                  <div>
                    <SkeletonText width="130px" height="1rem" className="mb-2" />
                    <div className="skeleton-form-input" style={{ height: '3rem' }}></div>
                  </div>
                </div>
              </div>

              {/* Data Management Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="skeleton-circle" style={{ width: '20px', height: '20px' }}></div>
                    <SkeletonText width="140px" height="1.5rem" />
                  </div>
                  <SkeletonText width="240px" height="1rem" className="mb-6" />
                  
                  {/* Data export and delete sections */}
                  <div className="skeleton-base" style={{ height: '6rem', borderRadius: '0.5rem' }}></div>
                  <div className="skeleton-base" style={{ height: '6rem', borderRadius: '0.5rem' }}></div>
                </div>
              </div>

              {/* Save Buttons Skeleton */}
              <div className="flex justify-end gap-3 py-4">
                <div className="skeleton-base" style={{ width: '120px', height: '2.5rem', borderRadius: '0.5rem' }}></div>
                <div className="skeleton-base" style={{ width: '120px', height: '2.5rem', borderRadius: '0.5rem' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--surbee-bg-primary)' }}>

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
                  { icon: Shield, label: 'Privacy & Security', active: true, href: '/dashboard/settings/privacy' },
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

          {/* Privacy Content */}
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
              {/* Account Security */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    <Lock className="w-5 h-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Secure your account with additional protection measures.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Change Password */}
                    <div>
                      <h4 className="text-[14px] font-medium text-theme-primary mb-3">
                        Change Password
                      </h4>
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Current password"
                          className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        />
                        <input
                          type="password"
                          placeholder="New password"
                          className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        />
                        <input
                          type="password"
                          placeholder="Confirm new password"
                          className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        />
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[14px] font-medium hover:bg-blue-700 transition-colors">
                          Update Password
                        </button>
                      </div>
                    </div>

                    <div className="h-px bg-theme-primary" />

                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[14px] font-medium text-theme-primary">
                          Two-Factor Authentication
                        </h4>
                        <p className="text-[12px] text-theme-muted">
                          Add an extra layer of security to your account
                        </p>
                        {twoFactorEnabled && (
                          <div className="flex items-center gap-1 mt-1">
                            <Shield className="w-3 h-3 text-green-400" />
                            <span className="text-[11px] text-green-400">Protected</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {twoFactorEnabled && (
                          <button className="text-[12px] text-blue-400 hover:text-blue-300">
                            View Recovery Codes
                          </button>
                        )}
                        <ToggleSwitch 
                          enabled={twoFactorEnabled}
                          onChange={setTwoFactorEnabled}
                        />
                      </div>
                    </div>

                    {/* Login Sessions */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-[14px] font-medium text-theme-primary">
                          Active Sessions
                        </h4>
                        <button className="text-[12px] text-red-400 hover:text-red-300">
                          Sign Out All Devices
                        </button>
                      </div>
                      <div className="space-y-2">
                        {[
                          { device: 'Chrome on Windows', location: 'New York, US', current: true, lastSeen: 'Active now' },
                          { device: 'Safari on iPhone', location: 'New York, US', current: false, lastSeen: '2 hours ago' },
                          { device: 'Chrome on MacBook', location: 'New York, US', current: false, lastSeen: '1 day ago' }
                        ].map((session, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-theme-secondary rounded-lg">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[13px] font-medium text-theme-primary">{session.device}</span>
                                {session.current && (
                                  <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-theme-muted">{session.location} • {session.lastSeen}</p>
                            </div>
                            {!session.current && (
                              <button className="text-[12px] text-red-400 hover:text-red-300">
                                Sign Out
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Controls */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    <Eye className="w-5 h-5" />
                    Privacy Controls
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Control how your data is collected and used.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        key: 'dataCollection',
                        title: 'Usage Data Collection',
                        description: 'Allow collection of usage analytics to improve the platform',
                        enabled: privacySettings.dataCollection
                      },
                      {
                        key: 'analyticsTracking',
                        title: 'Performance Analytics',
                        description: 'Track survey performance and response quality metrics',
                        enabled: privacySettings.analyticsTracking
                      },
                      {
                        key: 'marketingEmails',
                        title: 'Marketing Communications',
                        description: 'Receive emails about new features and product updates',
                        enabled: privacySettings.marketingEmails
                      },
                      {
                        key: 'thirdPartySharing',
                        title: 'Third-party Data Sharing',
                        description: 'Allow sharing aggregated data with research partners',
                        enabled: privacySettings.thirdPartySharing
                      },
                      {
                        key: 'searchEngineIndexing',
                        title: 'Search Engine Indexing',
                        description: 'Allow search engines to index your public surveys',
                        enabled: privacySettings.searchEngineIndexing
                      }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between py-2">
                        <div>
                          <h4 className="text-[14px] font-medium text-theme-primary">
                            {setting.title}
                          </h4>
                          <p className="text-[12px] text-theme-muted">
                            {setting.description}
                          </p>
                        </div>
                        <ToggleSwitch
                          enabled={setting.enabled}
                          onChange={(value) => handlePrivacyToggle(setting.key, value)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Visibility */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Profile Visibility
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Control who can see your profile and activity.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[14px] font-medium text-theme-primary">
                          Public Profile
                        </h4>
                        <p className="text-[12px] text-theme-muted">
                          Make your profile visible to other users
                        </p>
                      </div>
                      <ToggleSwitch
                        enabled={privacySettings.publicProfile}
                        onChange={(value) => handlePrivacyToggle('publicProfile', value)}
                      />
                    </div>

                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Activity Visibility
                      </label>
                      <select
                        value={privacySettings.activityVisibility}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, activityVisibility: e.target.value }))}
                        className="w-full p-3 rounded-lg border text-[14px] theme-input"
                      >
                        <option value="public">Public - Anyone can see</option>
                        <option value="team">Team Only - Only team members can see</option>
                        <option value="private">Private - Only you can see</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Data Management */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                    <Download className="w-5 h-5" />
                    Data Management
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Download your data or delete your account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Download className="w-5 h-5 text-blue-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-[14px] font-medium text-blue-400 mb-1">
                            Download Your Data
                          </h4>
                          <p className="text-[12px] text-blue-300 mb-3">
                            Get a copy of all your surveys, responses, and account data.
                          </p>
                          <button 
                            onClick={handleDataDownload}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[13px] font-medium hover:bg-blue-700 transition-colors"
                          >
                            Request Data Export
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="text-[14px] font-medium text-red-400 mb-1">
                            Delete Account
                          </h4>
                          <p className="text-[12px] text-red-300 mb-3">
                            Permanently delete your account and all associated data. This cannot be undone.
                          </p>
                          <button 
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-[13px] font-medium hover:bg-red-700 transition-colors"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Changes */}
              <div className="flex justify-end gap-3 py-4">
                <button className="px-6 py-2 border border-theme-primary rounded-lg text-[14px] font-medium text-theme-secondary hover:bg-theme-secondary transition-colors">
                  Reset to Default
                </button>
                <button className="px-6 py-2 bg-theme-secondary text-theme-primary rounded-lg text-[14px] font-medium hover:bg-theme-tertiary transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-theme-primary p-6 rounded-xl max-w-md mx-4 border border-red-500/20">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="text-[18px] font-semibold text-red-400">
                  Delete Account
                </h3>
              </div>
              <p className="text-[14px] text-theme-muted mb-6">
                Are you sure you want to delete your account? This will permanently delete all your surveys, responses, and data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-theme-primary rounded-lg text-[14px] font-medium text-theme-secondary hover:bg-theme-secondary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAccountDeletion}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-[14px] font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}