"use client";

import React, { useState } from 'react';
import { 
  ChevronLeft, 
  Globe, 
  HelpCircle, 
  User, 
  Settings, 
  Sparkles, 
  Bell, 
  Code, 
  Building2,
  ExternalLink,
  MessageCircle,
  Palette,
  Shield,
  Zap
} from 'lucide-react';
import '../../styles/settings-page.css';
import { useSettings } from '@/hooks/useSettings';
import PreferencesSettings from './PreferencesSettings';
import PersonalizationSettings from './PersonalizationSettings';
import NotificationsSettings from './NotificationsSettings';
import APISettings from './APISettings';
import EnterpriseSettings from './EnterpriseSettings';

// Type definitions
interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  section: 'account' | 'workspace';
  hasArrow?: boolean;
}

interface UserData {
  fullName: string;
  username: string;
  email: string;
  avatarUrl?: string;
}

const SettingsPage2: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('account');
  const { toasts } = useSettings();
  
  // Mock user data - replace with actual data fetching
  const userData: UserData = {
    fullName: 'CGI Hadi',
    username: 'cgihadi34154',
    email: 'cgihadi@gmail.com',
    avatarUrl: undefined // Using initials as fallback
  };

  const sidebarItems: SidebarItem[] = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" />, section: 'account' },
    { id: 'preferences', label: 'Preferences', icon: <Settings className="w-4 h-4" />, section: 'account' },
    { id: 'personalization', label: 'Personalization', icon: <Palette className="w-4 h-4" />, section: 'account' },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" />, section: 'account' },
    { id: 'api', label: 'API', icon: <Code className="w-4 h-4" />, section: 'workspace' },
    { id: 'enterprise', label: 'Enterprise', icon: <Building2 className="w-4 h-4" />, section: 'workspace', hasArrow: true },
  ];

  const handleButtonClick = (action: string) => {
    console.log(`Action: ${action}`);
    // Implement actual functionality here
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="h-screen overflow-hidden" style={{ backgroundColor: 'var(--surbee-bg-primary)', color: 'var(--surbee-fg-primary)' }}>
      {/* Top Bar Controls */}
      <div className="fixed top-4 right-4 flex gap-2 z-10">
        <button 
          className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors"
          style={{ 
            backgroundColor: 'var(--surbee-sidebar-bg)', 
            borderColor: 'var(--surbee-border-secondary)',
            color: 'var(--surbee-fg-secondary)'
          }}
        >
          <Globe className="w-3.5 h-3.5" />
        </button>
        <button 
          className="w-7 h-7 rounded-full flex items-center justify-center border transition-colors"
          style={{ 
            backgroundColor: 'var(--surbee-sidebar-bg)', 
            borderColor: 'var(--surbee-border-secondary)',
            color: 'var(--surbee-fg-secondary)'
          }}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Container */}
      <div 
        className="m-2 rounded-lg border h-[calc(100vh-16px)]"
        style={{ 
          backgroundColor: 'var(--surbee-sidebar-bg)', 
          borderColor: 'var(--surbee-border-primary)' 
        }}
      >
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-56 border-r flex flex-col" style={{ borderColor: 'var(--surbee-border-secondary)' }}>
            {/* Back Button */}
            <div className="px-4 py-4">
              <button 
                onClick={() => window.history.back()}
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: 'var(--surbee-fg-secondary)' }}
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            </div>

            {/* Sidebar Navigation */}
            <div className="px-2 flex-1">
              {/* Account Section */}
              <div className="mb-6">
                <h3 className="px-3 mb-3 text-xs uppercase tracking-wider" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Account
                </h3>
                <div className="space-y-0.5">
                  {sidebarItems
                    .filter(item => item.section === 'account')
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 hover:scale-102 hover:bg-opacity-80"
                        style={{
                          backgroundColor: activeSection === item.id ? 'var(--surbee-accent-muted)' : 'transparent',
                          color: activeSection === item.id ? 'var(--surbee-fg-primary)' : 'var(--surbee-fg-secondary)'
                        }}
                        onMouseEnter={(e) => {
                          if (activeSection !== item.id) {
                            e.currentTarget.style.backgroundColor = 'var(--surbee-border-secondary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeSection !== item.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        {item.icon}
                        <span>{item.label}</span>
                      </button>
                    ))}
                </div>
              </div>

              {/* Workspace Section */}
              <div>
                <h3 className="px-3 mb-3 text-xs uppercase tracking-wider" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Workspace
                </h3>
                <div className="space-y-0.5">
                  {sidebarItems
                    .filter(item => item.section === 'workspace')
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 hover:scale-102 hover:bg-opacity-80"
                        style={{
                          backgroundColor: activeSection === item.id ? 'var(--surbee-accent-muted)' : 'transparent',
                          color: activeSection === item.id ? 'var(--surbee-fg-primary)' : 'var(--surbee-fg-secondary)'
                        }}
                        onMouseEnter={(e) => {
                          if (activeSection !== item.id) {
                            e.currentTarget.style.backgroundColor = 'var(--surbee-border-secondary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (activeSection !== item.id) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }
                        }}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.hasArrow && (
                          <ExternalLink className="w-3 h-3" style={{ color: 'var(--surbee-fg-muted)' }} />
                        )}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Centered */}
          <div className="flex-1 flex justify-center overflow-y-auto">
            <div className="settings-container" style={{ maxWidth: '640px', width: '100%', padding: '64px 24px' }}>
              <div className="settings-main" style={{ gap: '24px' }}>
                {/* Dynamic Content Based on Active Section */}
                {activeSection === 'account' && (
                  <>
                    {/* Account Section */}
                    <div className="settings-section">
                      <div className="settings-section-header">
                        <div className="settings-header-content">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="settings-title">Account</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="settings-content">
                        {/* Profile Section with Avatar */}
                        <div className="settings-avatar-row">
                          <div className="settings-avatar">
                            <div className="settings-avatar-circle">
                              {userData.avatarUrl ? (
                                <img 
                                  className="settings-avatar-image"
                                  alt="User avatar"
                                  src={userData.avatarUrl}
                                />
                              ) : (
                                <span>{getUserInitials(userData.fullName)}</span>
                              )}
                            </div>
                          </div>
                          <div className="settings-user-info">
                            <div className="settings-user-name">{userData.fullName}</div>
                            <div className="settings-user-handle">{userData.username}</div>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <button
                              className="settings-button"
                              type="button"
                              onClick={() => handleButtonClick('change-avatar')}
                            >
                              <div className="settings-button-content">
                                <div className="settings-button-text">Change avatar</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Full Name */}
                        <div className="settings-row">
                          <div className="settings-field-info">
                            <div className="settings-field-label">Full Name</div>
                            <div className="settings-field-value">{userData.fullName}</div>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <button
                              className="settings-button"
                              type="button"
                              onClick={() => handleButtonClick('change-full-name')}
                            >
                              <div className="settings-button-content">
                                <div className="settings-button-text">Change full name</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Username */}
                        <div className="settings-row">
                          <div className="settings-field-info">
                            <div className="settings-field-label">Username</div>
                            <div className="settings-field-value">{userData.username}</div>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <button
                              className="settings-button"
                              type="button"
                              onClick={() => handleButtonClick('change-username')}
                            >
                              <div className="settings-button-content">
                                <div className="settings-button-text">Change username</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="settings-row">
                          <div className="settings-field-info">
                            <div className="settings-field-label">Email</div>
                            <div className="settings-field-value">{userData.email}</div>
                          </div>
                          <div style={{ marginLeft: 'auto' }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Subscription Section */}
                    <div className="settings-section">
                      <div className="settings-section-header">
                        <div className="settings-header-content">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="settings-title">Subscription</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="settings-content">
                        <div className="settings-subscription-group">
                          <div className="settings-row">
                            <div className="settings-field-info">
                              <div className="settings-field-label">Thanks for subscribing to Surbee Pro!</div>
                              <div className="settings-field-value">
                                Explore your new Pro features.
                                <a className="settings-link" href="#" target="_blank">
                                  Learn more
                                </a>
                              </div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                              <div className="settings-button-group">
                                <div>
                                  <button
                                    className="settings-button"
                                    type="button"
                                    onClick={() => handleButtonClick('manage-subscription')}
                                  >
                                    <div className="settings-button-content">
                                      <div className="settings-button-text">Manage subscription</div>
                                      <ExternalLink className="settings-icon" height="14" width="14" />
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="settings-row">
                            <div className="settings-field-info">
                              <div className="settings-field-label">Pro Discord</div>
                              <div className="settings-field-value">Join the Surbee Discord</div>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                              <button
                                className="settings-button"
                                onClick={() => handleButtonClick('join-discord')}
                              >
                                <div className="settings-button-content">
                                  <div className="settings-button-icon">
                                    <MessageCircle className="settings-icon" height="16" width="16" />
                                  </div>
                                  <div className="settings-button-text">Join</div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* System Section */}
                    <div className="settings-section">
                      <div className="settings-section-header">
                        <div className="settings-header-content">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="settings-title">System</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="settings-content">
                        <div className="settings-row">
                          <div className="settings-field-info">
                            <div className="settings-field-label">Support</div>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <button
                              className="settings-button"
                              type="button"
                              onClick={() => handleButtonClick('contact-support')}
                            >
                              <div className="settings-button-content">
                                <div className="settings-button-text">Contact</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="settings-row">
                          <div className="settings-field-info">
                            <div className="settings-field-label">You are signed in as {userData.username}</div>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <button
                              className="settings-button"
                              type="button"
                              onClick={() => handleButtonClick('sign-out')}
                            >
                              <div className="settings-button-content">
                                <div className="settings-button-text">Sign out</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="settings-row">
                          <div className="settings-field-info">
                            <div className="settings-field-label">Sign out of all sessions</div>
                            <div className="settings-field-value">Devices or browsers where you are signed in</div>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <button
                              className="settings-button"
                              type="button"
                              onClick={() => handleButtonClick('sign-out-all')}
                            >
                              <div className="settings-button-content">
                                <div className="settings-button-text">Sign out of all sessions</div>
                              </div>
                            </button>
                          </div>
                        </div>

                        <div className="settings-row">
                          <div className="settings-field-info">
                            <div className="settings-field-label">Delete account</div>
                            <div className="settings-field-value">Permanently delete your account and data</div>
                          </div>
                          <div style={{ marginLeft: 'auto' }}>
                            <button
                              className="settings-button"
                              type="button"
                              onClick={() => handleButtonClick('delete-account-info')}
                            >
                              <div className="settings-button-content">
                                <div className="settings-button-text">Learn more</div>
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeSection === 'preferences' && <PreferencesSettings />}
                {activeSection === 'personalization' && <PersonalizationSettings />}
                {activeSection === 'notifications' && <NotificationsSettings />}
                {activeSection === 'api' && <APISettings />}
                {activeSection === 'enterprise' && <EnterpriseSettings />}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
              toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsPage2;