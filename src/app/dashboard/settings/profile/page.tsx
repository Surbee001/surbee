"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, CreditCard, HelpCircle, Upload, Camera } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SkeletonText, SkeletonCard, SkeletonForm, SkeletonAvatar } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe', 
    email: 'john.doe@company.com',
    company: 'Acme Inc.',
    jobTitle: 'Product Manager',
    bio: 'Product manager passionate about user research and data-driven insights.',
    timezone: 'America/New_York',
    language: 'English'
  });
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    // TODO: Implement save functionality
  };

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

            {/* Profile Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Photo Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="140px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="250px" height="1rem" className="mb-6" />
                  <div className="flex items-center gap-6">
                    <SkeletonAvatar size={80} />
                    <div className="space-y-2">
                      <div className="skeleton-base" style={{ width: '140px', height: '2.5rem', borderRadius: '0.5rem' }}></div>
                      <SkeletonText width="160px" height="0.75rem" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Information Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="180px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="220px" height="1rem" className="mb-6" />
                  <div className="space-y-4">
                    {/* First/Last name row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <SkeletonText width="80px" height="1rem" className="mb-2" />
                        <div className="skeleton-form-input" style={{ height: '3rem' }}></div>
                      </div>
                      <div>
                        <SkeletonText width="80px" height="1rem" className="mb-2" />
                        <div className="skeleton-form-input" style={{ height: '3rem' }}></div>
                      </div>
                    </div>
                    {/* Email */}
                    <div>
                      <SkeletonText width="100px" height="1rem" className="mb-2" />
                      <div className="skeleton-form-input" style={{ height: '3rem' }}></div>
                    </div>
                    {/* Company/Job title row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <SkeletonText width="70px" height="1rem" className="mb-2" />
                        <div className="skeleton-form-input" style={{ height: '3rem' }}></div>
                      </div>
                      <div>
                        <SkeletonText width="70px" height="1rem" className="mb-2" />
                        <div className="skeleton-form-input" style={{ height: '3rem' }}></div>
                      </div>
                    </div>
                    {/* Bio */}
                    <div>
                      <SkeletonText width="30px" height="1rem" className="mb-2" />
                      <div className="skeleton-form-input" style={{ height: '5rem' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Card Skeleton */}
              <div className="skeleton-card" style={{ padding: '24px' }}>
                <div className="space-y-4">
                  <SkeletonText width="120px" height="1.5rem" className="mb-2" />
                  <SkeletonText width="280px" height="1rem" className="mb-6" />
                  <div className="space-y-4">
                    <div>
                      <SkeletonText width="70px" height="1rem" className="mb-2" />
                      <div className="skeleton-form-input" style={{ height: '3rem' }}></div>
                    </div>
                    <div>
                      <SkeletonText width="80px" height="1rem" className="mb-2" />
                      <div className="skeleton-form-input" style={{ height: '3rem' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Changes Buttons Skeleton */}
              <div className="flex justify-end gap-3 py-4">
                <div className="skeleton-base" style={{ width: '80px', height: '2.5rem', borderRadius: '0.5rem' }}></div>
                <div className="skeleton-base" style={{ width: '120px', height: '2.5rem', borderRadius: '0.5rem' }}></div>
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
                  { icon: User, label: 'Profile', active: true, href: '/dashboard/settings/profile' },
                  { icon: Settings, label: 'Appearance', active: false, href: '/dashboard/settings' },
                  { icon: Bell, label: 'Notifications', active: false, href: '/dashboard/settings/notifications' },
                  { icon: Shield, label: 'Privacy & Security', active: false, href: '/dashboard/settings/privacy' },
                  { icon: CreditCard, label: 'Billing & Plans', active: false, href: '/dashboard/settings/billing' },
                  { icon: HelpCircle, label: 'Help', active: false, href: '/dashboard/settings/account' },
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

          {/* Profile Content - Only this scrolls */}
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
              {/* Profile Photo */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Profile Photo
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    This will be displayed on your public profile.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-theme-secondary flex items-center justify-center">
                      <User className="w-8 h-8 text-theme-muted" />
                    </div>
                    <div className="space-y-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-theme-secondary text-theme-primary rounded-lg hover:bg-theme-tertiary transition-colors">
                        <Upload className="w-4 h-4" />
                        Upload new photo
                      </button>
                      <p className="text-[12px] text-theme-muted">
                        JPG, GIF or PNG. 1MB max.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Personal Information */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Personal Information
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Update your personal details here.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full p-3 rounded-lg border text-[14px] theme-input"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                          Company
                        </label>
                        <input
                          type="text"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        />
                      </div>
                      <div>
                        <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                          Job Title
                        </label>
                        <input
                          type="text"
                          value={formData.jobTitle}
                          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                          className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Bio
                      </label>
                      <textarea
                        value={formData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        rows={3}
                        className="w-full p-3 rounded-lg border text-[14px] theme-input resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Preferences
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Configure your regional and language preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Timezone
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => handleInputChange('timezone', e.target.value)}
                        className="w-full p-3 rounded-lg border text-[14px] theme-input"
                      >
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="Europe/London">London (GMT)</option>
                        <option value="Europe/Paris">Paris (CET)</option>
                        <option value="Asia/Tokyo">Tokyo (JST)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Language
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => handleInputChange('language', e.target.value)}
                        className="w-full p-3 rounded-lg border text-[14px] theme-input"
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Español</option>
                        <option value="French">Français</option>
                        <option value="German">Deutsch</option>
                        <option value="Japanese">日本語</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Changes */}
              <div className="flex justify-end gap-3 py-4">
                <button className="px-6 py-2 border border-theme-primary rounded-lg text-[14px] font-medium text-theme-secondary hover:bg-theme-secondary transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-theme-secondary text-theme-primary rounded-lg text-[14px] font-medium hover:bg-theme-tertiary transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}