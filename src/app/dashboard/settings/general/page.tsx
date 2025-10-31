"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { Upload, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function GeneralSettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || '');
  const [profilePicture, setProfilePicture] = useState(user?.photoURL || '');
  const [personalPreferences, setPersonalPreferences] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showFade, setShowFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSave = () => {
    // Save settings logic here
    console.log('Saving settings:', { name, profilePicture, personalPreferences, notificationsEnabled });
  };

  return (
    <div className="relative h-full flex flex-col min-h-0">
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
        {/* Profile Section */}
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
              Profile
            </CardTitle>
            <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Profile Picture */}
              <div>
                <label className="text-[14px] font-medium mb-3 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                  Profile Picture
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: 'var(--surbee-sidebar-hover)' }}
                  >
                    {profilePicture ? (
                      <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon className="w-10 h-10" style={{ color: 'var(--surbee-fg-secondary)' }} />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors"
                    style={{
                      borderColor: 'var(--surbee-border-accent)',
                      backgroundColor: 'var(--surbee-sidebar-hover)',
                      color: 'var(--surbee-fg-primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-active)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--surbee-sidebar-hover)';
                    }}
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photo
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-[14px] font-medium mb-2 block" style={{ color: 'var(--surbee-fg-primary)' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-2.5 rounded-lg border text-[14px] theme-input"
                  style={{
                    backgroundColor: 'var(--surbee-bg-secondary)',
                    borderColor: 'var(--surbee-border-accent)',
                    color: 'var(--surbee-fg-primary)'
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What should Surbee call you */}
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
              What should Surbee call you?
            </CardTitle>
            <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
              Tell us your personal preferences so Claude can tailor responses to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={personalPreferences}
              onChange={(e) => setPersonalPreferences(e.target.value)}
              placeholder="Example: Call me Alex. I prefer concise responses with examples. I'm working on academic research projects..."
              rows={5}
              className="w-full p-3 rounded-lg border text-[14px] resize-none theme-input"
              style={{
                backgroundColor: 'var(--surbee-bg-secondary)',
                borderColor: 'var(--surbee-border-accent)',
                color: 'var(--surbee-fg-primary)'
              }}
            />
            <p className="text-[12px] mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
              These preferences will be considered in all AI responses to make them more personalized
            </p>
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
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
              Appearance
            </CardTitle>
            <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
              Customize how Surbee looks
            </CardDescription>
          </CardHeader>
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
  );
}
