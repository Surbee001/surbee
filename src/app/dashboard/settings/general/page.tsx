"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { Upload, Settings, User, Bell, Shield, CreditCard, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function GeneralSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { preferences, updatePreferences, isLoading: prefsLoading } = useUserPreferences();

  // Local state synced with preferences
  const [name, setName] = useState('');
  const [surBeeCallName, setSurBeeCallName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [personalPreferences, setPersonalPreferences] = useState('');
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly' | 'formal' | 'creative'>('professional');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [workFunction, setWorkFunction] = useState('Select your work function');
  const [showFade, setShowFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync local state with preferences on load
  useEffect(() => {
    if (!prefsLoading) {
      setSurBeeCallName(preferences.displayName || '');
      setTone(preferences.tone || 'professional');
      setPersonalPreferences(preferences.personalPreferences || '');
      setWorkFunction(preferences.workFunction || 'Select your work function');
      setNotificationsEnabled(preferences.notificationsEnabled ?? true);
    }
  }, [prefsLoading, preferences]);

  // Sync with user auth data
  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.full_name || user.email?.split('@')[0] || '');
      setProfilePicture(user.user_metadata?.avatar_url || '');
    }
  }, [user]);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      // Save to preferences context (persists to localStorage)
      updatePreferences({
        displayName: surBeeCallName,
        tone: tone,
        personalPreferences: personalPreferences,
        workFunction: workFunction,
        notificationsEnabled: notificationsEnabled,
      });

      console.log('Saving settings:', { name, surBeeCallName, profilePicture, personalPreferences, tone, notificationsEnabled, workFunction });
      toast.success('Settings saved! Surbee will now use your preferences.');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 min-h-0 px-6 md:px-10 lg:px-16 pt-12 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-6xl mx-auto">
          {/* Settings Navigation - Fixed */}
          <div className="lg:col-span-1 flex flex-col">
            <div className="space-y-4 flex-shrink-0">
              <h1 className="projects-title">
                Settings
              </h1>

              <div className="space-y-1">
                {[
                  { icon: Settings, label: 'General', active: true, href: '/dashboard/settings/general' },
                  { icon: HelpCircle, label: 'Account', active: false, href: '/dashboard/settings/account' },
                  { icon: Shield, label: 'Privacy & Security', active: false, href: '/dashboard/settings/privacy' },
                  { icon: CreditCard, label: 'Billing', active: false, href: '/dashboard/settings/billing' },
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

          {/* General Content - Only this scrolls */}
          <div className="lg:col-span-3 relative flex flex-col min-h-0 overflow-hidden">
      {/* Fade overlay at top - only show when scrolling */}
      <div className={`absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--surbee-bg-primary)] to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
        showFade ? 'opacity-100' : 'opacity-0'
      }`} />

      {/* Scrollable content */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto pr-4 space-y-6 pb-16"
        style={{ scrollbarWidth: 'thin' }}
      >
        {/* Profile & Preferences Section - Combined */}
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent>
            <div className="space-y-6">
              {/* Full Name with Avatar - Top Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Full Name with Avatar */}
                <div>
                  <label className="text-[16px] font-medium mb-3 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                    Full name
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 cursor-pointer transition-opacity hover:opacity-80"
                      style={{ backgroundColor: 'var(--surbee-fg-primary)', color: 'var(--surbee-bg-primary)' }}
                    >
                      {profilePicture ? (
                        <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-lg font-semibold">
                          {name ? name.charAt(0).toUpperCase() : 'H'}
                        </span>
                      )}
                    </button>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1 p-3 rounded-lg border text-[15px] transition-all"
                      style={{
                        backgroundColor: 'var(--surbee-bg-secondary)',
                        borderColor: 'var(--surbee-card-border)',
                        color: 'var(--surbee-fg-primary)'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'var(--surbee-border-accent)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'var(--surbee-card-border)';
                      }}
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* What should Surbee call you */}
                <div>
                  <label className="text-[16px] font-medium mb-3 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                    What should Surbee call you?
                  </label>
                  <input
                    type="text"
                    value={surBeeCallName}
                    onChange={(e) => setSurBeeCallName(e.target.value)}
                    placeholder="Hadi"
                    className="w-full p-3 rounded-lg border text-[15px] transition-all"
                    style={{
                      backgroundColor: 'var(--surbee-bg-secondary)',
                      borderColor: 'var(--surbee-card-border)',
                      color: 'var(--surbee-fg-primary)'
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = 'var(--surbee-border-accent)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = 'var(--surbee-card-border)';
                    }}
                  />
                </div>
              </div>

              {/* Work Function - Optional */}
              <div>
                <div className="flex items-center gap-x-3">
                  <p className="text-[16px] font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                    What best describes your work?
                  </p>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium border rounded-xl transition-colors cursor-pointer"
                        style={{
                          color: 'var(--surbee-fg-primary)',
                          backgroundColor: 'transparent',
                          borderColor: 'var(--surbee-sidebar-border)',
                          fontFamily: 'var(--font-inter), sans-serif',
                          minWidth: '200px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span>{workFunction}</span>
                        <ChevronDown className="w-4 h-4" style={{ color: 'var(--surbee-fg-muted)' }} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      style={{
                        backgroundColor: 'var(--surbee-card-bg)',
                        borderColor: 'var(--surbee-sidebar-border)',
                        color: 'var(--surbee-fg-primary)',
                      }}
                    >
                      {['Student', 'Researcher', 'Marketer', 'Developer', 'Designer', 'Data Analyst', 'Other'].map((option) => (
                        <DropdownMenuItem
                          key={option}
                          onClick={() => setWorkFunction(option)}
                          style={{
                            color: 'var(--surbee-fg-primary)',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {option}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Tone Preference */}
              <div>
                <label className="text-[16px] font-medium mb-3 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                  What tone should Surbee use when talking to you?
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['professional', 'casual', 'friendly', 'formal', 'creative'].map((toneOption) => (
                    <button
                      key={toneOption}
                      onClick={() => setTone(toneOption)}
                      className="px-4 py-2 rounded-lg text-[14px] font-medium transition-all"
                      style={{
                        backgroundColor: tone === toneOption
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-bg-secondary)',
                        color: tone === toneOption
                          ? 'var(--surbee-bg-primary)'
                          : 'var(--surbee-fg-primary)',
                        borderColor: tone === toneOption
                          ? 'var(--surbee-fg-primary)'
                          : 'var(--surbee-card-border)',
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                      onMouseEnter={(e) => {
                        if (tone !== toneOption) {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                          e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (tone !== toneOption) {
                          e.currentTarget.style.backgroundColor = 'var(--surbee-bg-secondary)';
                          e.currentTarget.style.color = 'var(--surbee-fg-primary)';
                        }
                      }}
                    >
                      {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personal Preferences */}
              <div>
                <label className="text-[16px] font-medium mb-1 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                  What personal preferences should Surbee consider in responses?
                </label>
                <p className="text-[13px] mb-3" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Your preferences will apply to all conversations with Surbee.{' '}
                  <a 
                    href="#" 
                    className="underline"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info('Preferences help documentation coming soon');
                    }}
                  >
                    Learn about preferences
                  </a>
                </p>
                <textarea
                  value={personalPreferences}
                  onChange={(e) => setPersonalPreferences(e.target.value)}
                  placeholder="e.g. I prefer concise survey questions, focus on user research for SaaS products, and use data-driven insights"
                  rows={4}
                  className="w-full p-3 rounded-lg border text-[15px] resize-none transition-all"
                  style={{
                    backgroundColor: 'var(--surbee-bg-secondary)',
                    borderColor: 'var(--surbee-card-border)',
                    color: 'var(--surbee-fg-primary)'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'var(--surbee-border-accent)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--surbee-card-border)';
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
              Notifications
            </CardTitle>
            <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
              Manage how you receive updates from Surbee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h4 className="text-[14px] font-medium mb-1" style={{ color: 'var(--surbee-fg-primary)' }}>
                    Task Completion Notifications
                  </h4>
                  <p className="text-[12px]" style={{ color: 'var(--surbee-fg-muted)' }}>
                    Get notified when Surbee collects data, generates reports, or finishes long-running tasks
                  </p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    notificationsEnabled ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      notificationsEnabled ? 'transform translate-x-5' : 'transform translate-x-0.5'
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent>
            <ThemeSelector />
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-lg font-medium text-[14px] transition-all"
            style={{
              backgroundColor: 'var(--surbee-fg-primary)',
              color: 'var(--surbee-bg-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
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
