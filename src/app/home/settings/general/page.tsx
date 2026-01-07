"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { Settings, Shield, CreditCard, HelpCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserPreferences } from '@/contexts/UserPreferencesContext';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type SettingsTab = 'general' | 'account' | 'privacy' | 'billing';

const settingsTabs: { id: SettingsTab; label: string; href: string }[] = [
  { id: 'general', label: 'General', href: '/home/settings/general' },
  { id: 'account', label: 'Account', href: '/home/settings/account' },
  { id: 'privacy', label: 'Privacy', href: '/home/settings/privacy' },
  { id: 'billing', label: 'Billing', href: '/home/settings/billing' },
];

export default function GeneralSettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
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
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    setSaving(true);
    try {
      updatePreferences({
        displayName: surBeeCallName,
        tone: tone,
        personalPreferences: personalPreferences,
        workFunction: workFunction,
        notificationsEnabled: notificationsEnabled,
      });
      setHasChanges(false);
      toast.success('Settings saved!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
    setter(value);
    setHasChanges(true);
  };

  return (
    <div className="settings-root">
      {/* Header */}
      <header className="settings-header">
        <h1 className="settings-title">Settings</h1>
      </header>

      {/* Tab Navigation */}
      <nav className="settings-tabs">
        {settingsTabs.map((tab) => (
          <button
            key={tab.id}
            className={`settings-tab ${pathname === tab.href ? 'active' : ''}`}
            onClick={() => router.push(tab.href)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="settings-content" ref={scrollRef}>
        <div className="settings-section">
          {/* Profile Section */}
          <div className="form-field">
            <label className="field-label">Full name</label>
            <p className="field-description">Your display name across Surbee</p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="avatar-btn"
              >
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold">
                    {name ? name.charAt(0).toUpperCase() : 'U'}
                  </span>
                )}
              </button>
              <input
                type="text"
                value={name}
                onChange={(e) => handleFieldChange(setName, e.target.value)}
                placeholder="Enter your name"
                className="field-input flex-1"
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

          <div className="form-field">
            <label className="field-label">What should Surbee call you?</label>
            <p className="field-description">This name will be used in conversations</p>
            <input
              type="text"
              value={surBeeCallName}
              onChange={(e) => handleFieldChange(setSurBeeCallName, e.target.value)}
              placeholder="e.g. Hadi"
              className="field-input"
              style={{ maxWidth: '320px' }}
            />
          </div>

          <div className="divider" />

          {/* Work Function */}
          <div className="form-field">
            <label className="field-label">What best describes your work?</label>
            <p className="field-description">Helps Surbee tailor suggestions to your role</p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="field-select-btn">
                  <span>{workFunction}</span>
                  <ChevronDown className="w-4 h-4 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="dropdown-content">
                {['Student', 'Researcher', 'Marketer', 'Developer', 'Designer', 'Data Analyst', 'Other'].map((option) => (
                  <DropdownMenuItem
                    key={option}
                    onClick={() => handleFieldChange(setWorkFunction, option)}
                    className="dropdown-item"
                  >
                    {option}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tone Preference */}
          <div className="form-field">
            <label className="field-label">Conversation tone</label>
            <p className="field-description">How should Surbee communicate with you?</p>
            <div className="tone-options">
              {(['professional', 'casual', 'friendly', 'formal', 'creative'] as const).map((toneOption) => (
                <button
                  key={toneOption}
                  onClick={() => handleFieldChange(setTone, toneOption)}
                  className={`tone-btn ${tone === toneOption ? 'active' : ''}`}
                >
                  {toneOption.charAt(0).toUpperCase() + toneOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Personal Preferences */}
          <div className="form-field">
            <label className="field-label">Personal preferences</label>
            <p className="field-description">Custom instructions for Surbee to consider in all responses</p>
            <textarea
              value={personalPreferences}
              onChange={(e) => handleFieldChange(setPersonalPreferences, e.target.value)}
              placeholder="e.g. I prefer concise survey questions, focus on user research for SaaS products, and use data-driven insights"
              rows={4}
              className="field-textarea"
            />
          </div>

          <div className="divider" />

          {/* Notifications */}
          <div className="form-field">
            <label className="toggle-field">
              <div className="toggle-info">
                <span className="field-label">Task completion notifications</span>
                <span className="field-description">Get notified when Surbee finishes long-running tasks</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${notificationsEnabled ? 'active' : ''}`}
                onClick={() => handleFieldChange(setNotificationsEnabled, !notificationsEnabled)}
              >
                <div className="toggle-thumb" />
              </button>
            </label>
          </div>

          <div className="divider" />

          {/* Appearance */}
          <div className="form-field">
            <label className="field-label">Appearance</label>
            <p className="field-description">Choose your preferred theme</p>
            <div className="mt-3">
              <ThemeSelector />
            </div>
          </div>

          {/* Save Button */}
          <div className="save-section">
            <button
              className={`save-btn ${hasChanges ? '' : 'disabled'}`}
              onClick={handleSave}
              disabled={!hasChanges || saving}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-root {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 32px 120px;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .hidden {
          display: none;
        }

        /* Header */
        .settings-header {
          margin-bottom: 32px;
        }

        .settings-title {
          font-family: 'Kalice-Trial-Regular', sans-serif;
          font-size: 28px;
          font-weight: 400;
          line-height: 1.4;
          margin-bottom: 0;
        }

        /* Tabs */
        .settings-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .settings-tab {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.1);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .settings-tab:hover {
          border-color: rgba(232, 232, 232, 0.2);
        }

        .settings-tab.active {
          background: rgba(232, 232, 232, 0.05);
          border-color: transparent;
        }

        /* Content */
        .settings-content {
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .settings-section {
          max-width: 100%;
        }

        .divider {
          margin: 32px 0;
          width: 100%;
          height: 1px;
          background-color: rgba(232, 232, 232, 0.08);
        }

        /* Form Fields */
        .form-field {
          display: flex;
          flex-direction: column;
          margin-top: 24px;
        }

        .form-field:first-child {
          margin-top: 0;
        }

        .field-label {
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .field-description {
          font-size: 14px;
          color: var(--surbee-fg-secondary, rgba(232, 232, 232, 0.6));
          margin: 4px 0 12px;
        }

        .field-input {
          display: flex;
          align-items: center;
          padding: 0 16px;
          height: 44px;
          border-radius: 12px;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.15);
          transition: all 0.2s ease;
        }

        .field-input:focus {
          outline: none;
          border-color: rgba(232, 232, 232, 0.3);
        }

        .field-input::placeholder {
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
        }

        .field-textarea {
          display: flex;
          padding: 12px 16px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.15);
          resize: vertical;
          min-height: 100px;
          transition: all 0.2s ease;
          font-family: inherit;
        }

        .field-textarea:focus {
          outline: none;
          border-color: rgba(232, 232, 232, 0.3);
        }

        .field-textarea::placeholder {
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
        }

        .field-select-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 16px;
          height: 44px;
          max-width: 280px;
          border-radius: 12px;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.15);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .field-select-btn:hover {
          border-color: rgba(232, 232, 232, 0.25);
        }

        /* Avatar */
        .avatar-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          flex-shrink: 0;
          overflow: hidden;
          background: var(--surbee-fg-primary, #E8E8E8);
          color: var(--surbee-bg-primary, rgb(19, 19, 20));
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: opacity 0.2s ease;
          border: none;
        }

        .avatar-btn:hover {
          opacity: 0.8;
        }

        /* Tone Options */
        .tone-options {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .tone-btn {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          border-radius: 9999px;
          border: 1px solid rgba(232, 232, 232, 0.15);
          background: transparent;
          color: var(--surbee-fg-primary, #E8E8E8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .tone-btn:hover {
          border-color: rgba(232, 232, 232, 0.3);
        }

        .tone-btn.active {
          background: var(--surbee-fg-primary, #E8E8E8);
          color: var(--surbee-bg-primary, rgb(19, 19, 20));
          border-color: transparent;
        }

        /* Toggle */
        .toggle-field {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          cursor: pointer;
        }

        .toggle-info {
          display: flex;
          flex-direction: column;
        }

        .toggle-btn {
          position: relative;
          width: 44px;
          height: 24px;
          border-radius: 12px;
          background: rgba(232, 232, 232, 0.12);
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .toggle-btn.active {
          background: var(--surbee-fg-primary, #E8E8E8);
        }

        .toggle-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--surbee-bg-primary, rgb(19, 19, 20));
          transition: transform 0.2s ease;
        }

        .toggle-btn.active .toggle-thumb {
          transform: translateX(20px);
        }

        /* Save Section */
        .save-section {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid rgba(232, 232, 232, 0.08);
        }

        .save-btn {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-bg-primary, rgb(19, 19, 20));
          background: var(--surbee-fg-primary, #E8E8E8);
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .save-btn:hover:not(.disabled) {
          opacity: 0.9;
        }

        .save-btn.disabled {
          opacity: 0.4;
          cursor: not-allowed;
          background: rgba(232, 232, 232, 0.08);
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
        }

        /* Dropdown styling */
        :global(.dropdown-content) {
          background: var(--surbee-bg-primary, rgb(19, 19, 20)) !important;
          border: 1px solid rgba(232, 232, 232, 0.1) !important;
          border-radius: 12px !important;
        }

        :global(.dropdown-item) {
          color: var(--surbee-fg-primary, #E8E8E8) !important;
          cursor: pointer !important;
          border-radius: 8px !important;
        }

        :global(.dropdown-item:hover) {
          background: rgba(232, 232, 232, 0.05) !important;
        }
      `}</style>
    </div>
  );
}
