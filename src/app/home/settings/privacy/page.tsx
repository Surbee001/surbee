"use client";

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalyticsConsent } from '@/contexts/AnalyticsContext';
import { useSettings } from '@/contexts/SettingsContext';
import { toast } from 'sonner';
import { Shield } from 'lucide-react';

type SettingsTab = 'general' | 'account' | 'privacy' | 'billing';

const settingsTabs: { id: SettingsTab; label: string; href: string }[] = [
  { id: 'general', label: 'General', href: '/home/settings/general' },
  { id: 'account', label: 'Account', href: '/home/settings/account' },
  { id: 'privacy', label: 'Privacy', href: '/home/settings/privacy' },
  { id: 'billing', label: 'Billing', href: '/home/settings/billing' },
];

export default function PrivacySettingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { updatePassword } = useAuth();
  const { settings, updatePrivacy } = useSettings();
  const { consent: analyticsConsent, updateConsent: updateAnalyticsConsent, isLoading: analyticsLoading } = useAnalyticsConsent();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const handlePrivacyToggle = (setting: string, value: boolean) => {
    updatePrivacy({ [setting]: value });
    setHasChanges(true);
  };

  const handlePasswordChange = async () => {
    if (!passwordData.new || !passwordData.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 12) {
      toast.error('Password must be at least 12 characters long');
      return;
    }
    if (!/[a-z]/.test(passwordData.new) || !/[A-Z]/.test(passwordData.new) || !/[0-9]/.test(passwordData.new) || !/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.new)) {
      toast.error('Password must contain uppercase, lowercase, number, and special character');
      return;
    }
    try {
      const { error } = await updatePassword(passwordData.new);
      if (error) throw error;
      toast.success('Password updated successfully!');
      setPasswordData({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    }
  };

  const handleSaveChanges = async () => {
    if (!hasChanges) return;
    setSaving(true);
    toast.success('Privacy settings saved!');
    setHasChanges(false);
    setSaving(false);
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
      <div className="settings-content">
        <div className="settings-section">
          {/* Change Password Section */}
          <div className="section-header">
            <h2 className="section-title">Security</h2>
          </div>

          <div className="form-field">
            <label className="field-label">Change password</label>
            <p className="field-description">Update your account password</p>
            <div className="password-fields">
              <input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
                placeholder="Current password"
                className="field-input"
              />
              <input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
                placeholder="New password"
                className="field-input"
              />
              <input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
                placeholder="Confirm new password"
                className="field-input"
              />
              <button className="update-password-btn" onClick={handlePasswordChange}>
                Update password
              </button>
            </div>
          </div>

          <div className="form-field">
            <label className="toggle-field">
              <div className="toggle-info">
                <span className="field-label">Two-factor authentication</span>
                <span className="field-description">Add an extra layer of security to your account</span>
                {twoFactorEnabled && (
                  <span className="protected-badge">
                    <Shield className="w-3 h-3" />
                    Protected
                  </span>
                )}
              </div>
              <button
                type="button"
                className={`toggle-btn ${twoFactorEnabled ? 'active' : ''}`}
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              >
                <div className="toggle-thumb" />
              </button>
            </label>
          </div>

          <div className="divider" />

          {/* Privacy Controls */}
          <div className="section-header">
            <h2 className="section-title">Privacy</h2>
          </div>

          <div className="form-field">
            <label className="toggle-field">
              <div className="toggle-info">
                <span className="field-label">Share anonymous analytics</span>
                <span className="field-description">Help us improve Surbee with anonymous usage data</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${analyticsConsent ? 'active' : ''}`}
                onClick={() => !analyticsLoading && updateAnalyticsConsent(!analyticsConsent)}
                disabled={analyticsLoading}
              >
                <div className="toggle-thumb" />
              </button>
            </label>
          </div>

          <div className="form-field">
            <label className="toggle-field">
              <div className="toggle-info">
                <span className="field-label">Marketing communications</span>
                <span className="field-description">Receive emails about new features and updates</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${settings.privacy?.marketingEmails ? 'active' : ''}`}
                onClick={() => handlePrivacyToggle('marketingEmails', !settings.privacy?.marketingEmails)}
              >
                <div className="toggle-thumb" />
              </button>
            </label>
          </div>

          <div className="form-field">
            <label className="toggle-field">
              <div className="toggle-info">
                <span className="field-label">Third-party data sharing</span>
                <span className="field-description">Allow sharing aggregated data with research partners</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${settings.privacy?.thirdPartySharing ? 'active' : ''}`}
                onClick={() => handlePrivacyToggle('thirdPartySharing', !settings.privacy?.thirdPartySharing)}
              >
                <div className="toggle-thumb" />
              </button>
            </label>
          </div>

          <div className="form-field">
            <label className="toggle-field">
              <div className="toggle-info">
                <span className="field-label">Search engine indexing</span>
                <span className="field-description">Allow search engines to index your public surveys</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${settings.privacy?.searchEngineIndexing ? 'active' : ''}`}
                onClick={() => handlePrivacyToggle('searchEngineIndexing', !settings.privacy?.searchEngineIndexing)}
              >
                <div className="toggle-thumb" />
              </button>
            </label>
          </div>

          <div className="divider" />

          {/* Profile Visibility */}
          <div className="section-header">
            <h2 className="section-title">Visibility</h2>
          </div>

          <div className="form-field">
            <label className="toggle-field">
              <div className="toggle-info">
                <span className="field-label">Public profile</span>
                <span className="field-description">Make your profile visible to other users</span>
              </div>
              <button
                type="button"
                className={`toggle-btn ${settings.privacy?.publicProfile ? 'active' : ''}`}
                onClick={() => handlePrivacyToggle('publicProfile', !settings.privacy?.publicProfile)}
              >
                <div className="toggle-thumb" />
              </button>
            </label>
          </div>

          {/* Save Button */}
          <div className="save-section">
            <button
              className={`save-btn ${hasChanges ? '' : 'disabled'}`}
              onClick={handleSaveChanges}
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

        .section-header {
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin: 0;
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
          width: 100%;
          max-width: 400px;
        }

        .field-input:focus {
          outline: none;
          border-color: rgba(232, 232, 232, 0.3);
        }

        .field-input::placeholder {
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
        }

        .password-fields {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .update-password-btn {
          padding: 10px 20px;
          font-size: 14px;
          font-weight: 600;
          color: var(--surbee-bg-primary, rgb(19, 19, 20));
          background: var(--surbee-fg-primary, #E8E8E8);
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 0.2s ease;
          align-self: flex-start;
          margin-top: 4px;
        }

        .update-password-btn:hover {
          opacity: 0.9;
        }

        /* Toggle Field */
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

        .protected-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: #22c55e;
          margin-top: 4px;
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

        .toggle-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        /* Select */
        .select-wrapper {
          position: relative;
          max-width: 320px;
        }

        .field-select {
          width: 100%;
          padding: 0 40px 0 16px;
          height: 44px;
          border-radius: 12px;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          background: transparent;
          border: 1px solid rgba(232, 232, 232, 0.15);
          cursor: pointer;
          appearance: none;
          transition: all 0.2s ease;
        }

        .field-select:focus {
          outline: none;
          border-color: rgba(232, 232, 232, 0.3);
        }

        .field-select option {
          background: var(--surbee-bg-primary, rgb(19, 19, 20));
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .select-icon {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          width: 16px;
          height: 16px;
          color: var(--surbee-fg-muted, rgba(232, 232, 232, 0.4));
          pointer-events: none;
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
      `}</style>
    </div>
  );
}