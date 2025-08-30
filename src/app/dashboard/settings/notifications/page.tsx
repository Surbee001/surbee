"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, User, Bell, Shield, CreditCard, HelpCircle, Mail, MessageCircle, BarChart3, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export default function NotificationsSettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: 'survey_responses',
      title: 'New Survey Responses',
      description: 'Get notified when someone completes your survey',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'survey_milestones',
      title: 'Survey Milestones',
      description: 'Notifications for response count milestones (50, 100, 500, etc.)',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'data_quality_alerts',
      title: 'Data Quality Alerts',
      description: 'Get alerted about suspicious response patterns or quality issues',
      email: true,
      push: true,
      sms: true
    },
    {
      id: 'survey_expiration',
      title: 'Survey Expiration Reminders',
      description: 'Reminders when your surveys are about to close',
      email: true,
      push: false,
      sms: false
    },
    {
      id: 'collaboration',
      title: 'Collaboration Updates',
      description: 'When team members share surveys or request feedback',
      email: true,
      push: true,
      sms: false
    },
    {
      id: 'product_updates',
      title: 'Product Updates',
      description: 'News about new features and platform improvements',
      email: true,
      push: false,
      sms: false
    }
  ]);

  const [globalSettings, setGlobalSettings] = useState({
    doNotDisturb: false,
    quietHours: { start: '22:00', end: '08:00' },
    frequency: 'immediate' // immediate, daily, weekly
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

  const handleNotificationToggle = (id: string, type: 'email' | 'push' | 'sms', value: boolean) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id 
        ? { ...notification, [type]: value }
        : notification
    ));
  };

  const handleGlobalSettingChange = (setting: string, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [setting]: value }));
  };

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean; onChange: (value: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        enabled ? 'bg-blue-500' : 'bg-gray-600'
      }`}
    >
      <div
        className={`w-5 h-5 rounded-full bg-white transition-transform ${
          enabled ? 'transform translate-x-5' : 'transform translate-x-0.5'
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 px-6 md:px-10 lg:px-16 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-full max-w-6xl mx-auto">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h1 className="text-[28px] font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
                Settings
              </h1>
              
              <div className="space-y-1">
                {[
                  { icon: User, label: 'Profile', active: false, href: '/dashboard/settings/profile' },
                  { icon: Settings, label: 'Appearance', active: false, href: '/dashboard/settings' },
                  { icon: Bell, label: 'Notifications', active: true, href: '/dashboard/settings/notifications' },
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

            {/* Notifications Content - Only this scrolls */}
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
              {/* Global Notification Settings */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Global Settings
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Configure your overall notification preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Do Not Disturb */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[14px] font-medium text-theme-primary">
                          Do Not Disturb
                        </h4>
                        <p className="text-[12px] text-theme-muted">
                          Pause all notifications temporarily
                        </p>
                      </div>
                      <ToggleSwitch 
                        enabled={globalSettings.doNotDisturb}
                        onChange={(value) => handleGlobalSettingChange('doNotDisturb', value)}
                      />
                    </div>

                    {/* Notification Frequency */}
                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Notification Frequency
                      </label>
                      <select
                        value={globalSettings.frequency}
                        onChange={(e) => handleGlobalSettingChange('frequency', e.target.value)}
                        className="w-full p-3 rounded-lg border text-[14px] theme-input"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="daily">Daily Digest</option>
                        <option value="weekly">Weekly Summary</option>
                      </select>
                    </div>

                    {/* Quiet Hours */}
                    <div>
                      <label className="text-[14px] font-medium mb-3 block text-theme-primary">
                        Quiet Hours
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-[12px] text-theme-muted mb-1 block">From</label>
                          <input
                            type="time"
                            value={globalSettings.quietHours.start}
                            onChange={(e) => handleGlobalSettingChange('quietHours', {
                              ...globalSettings.quietHours,
                              start: e.target.value
                            })}
                            className="w-full p-2 rounded-lg border text-[14px] theme-input"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[12px] text-theme-muted mb-1 block">To</label>
                          <input
                            type="time"
                            value={globalSettings.quietHours.end}
                            onChange={(e) => handleGlobalSettingChange('quietHours', {
                              ...globalSettings.quietHours,
                              end: e.target.value
                            })}
                            className="w-full p-2 rounded-lg border text-[14px] theme-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Types */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Notification Types
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Choose how you want to receive different types of notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Header Row */}
                    <div className="grid grid-cols-12 gap-4 pb-2 border-b border-theme-primary">
                      <div className="col-span-6">
                        <h4 className="text-[12px] font-medium text-theme-muted uppercase tracking-wide">
                          Notification Type
                        </h4>
                      </div>
                      <div className="col-span-2 text-center">
                        <Mail className="w-4 h-4 mx-auto text-theme-muted" />
                        <span className="text-[10px] text-theme-muted mt-1 block">Email</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <MessageCircle className="w-4 h-4 mx-auto text-theme-muted" />
                        <span className="text-[10px] text-theme-muted mt-1 block">Push</span>
                      </div>
                      <div className="col-span-2 text-center">
                        <MessageCircle className="w-4 h-4 mx-auto text-theme-muted" />
                        <span className="text-[10px] text-theme-muted mt-1 block">SMS</span>
                      </div>
                    </div>

                    {/* Notification Items */}
                    {notifications.map((notification) => (
                      <div key={notification.id} className="grid grid-cols-12 gap-4 items-center py-2">
                        <div className="col-span-6">
                          <h4 className="text-[14px] font-medium text-theme-primary">
                            {notification.title}
                          </h4>
                          <p className="text-[12px] text-theme-muted">
                            {notification.description}
                          </p>
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <ToggleSwitch
                            enabled={notification.email}
                            onChange={(value) => handleNotificationToggle(notification.id, 'email', value)}
                          />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <ToggleSwitch
                            enabled={notification.push}
                            onChange={(value) => handleNotificationToggle(notification.id, 'push', value)}
                          />
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <ToggleSwitch
                            enabled={notification.sms}
                            onChange={(value) => handleNotificationToggle(notification.id, 'sms', value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Preferences */}
              <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
                <CardHeader>
                  <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
                    Contact Information
                  </CardTitle>
                  <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
                    Update your contact details for notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue="john.doe@company.com"
                        className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="text-[14px] font-medium mb-2 block text-theme-primary">
                        Phone Number (for SMS)
                      </label>
                      <input
                        type="tel"
                        defaultValue="+1 (555) 123-4567"
                        className="w-full p-3 rounded-lg border text-[14px] theme-input"
                        placeholder="Enter phone number"
                      />
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
      </div>
    </div>
  );
}