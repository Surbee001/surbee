"use client";

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Shield, 
  Clock, 
  TestTube,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { formatTime } from '@/lib/settings-manager';

const NotificationsSettings: React.FC = () => {
  const { 
    settings, 
    updateNotifications,
    requestNotifications,
    testNotification,
    isInQuietHours,
    showToast
  } = useSettings();

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [quietHoursStart, setQuietHoursStart] = useState(settings.notifications.quietHours.start);
  const [quietHoursEnd, setQuietHoursEnd] = useState(settings.notifications.quietHours.end);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const handleEmailNotificationChange = (key: keyof typeof settings.notifications.email, value: boolean) => {
    // Security alerts cannot be disabled
    if (key === 'security' && !value) {
      showToast('Security alerts cannot be disabled for your protection', 'error');
      return;
    }

    updateNotifications({
      email: {
        ...settings.notifications.email,
        [key]: value,
      },
    });
    
    const action = value ? 'enabled' : 'disabled';
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} emails ${action}`);
  };

  const handleInAppNotificationChange = (key: keyof typeof settings.notifications.inApp, value: boolean) => {
    if (key === 'desktop' && value && notificationPermission !== 'granted') {
      requestNotifications().then((granted) => {
        if (granted) {
          updateNotifications({
            inApp: {
              ...settings.notifications.inApp,
              [key]: value,
            },
          });
          setNotificationPermission('granted');
        }
      });
      return;
    }

    updateNotifications({
      inApp: {
        ...settings.notifications.inApp,
        [key]: value,
      },
    });

    const action = value ? 'enabled' : 'disabled';
    showToast(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${action}`);
  };

  const handleQuietHoursToggle = () => {
    const newValue = !settings.notifications.quietHours.enabled;
    updateNotifications({
      quietHours: {
        ...settings.notifications.quietHours,
        enabled: newValue,
      },
    });
    showToast(`Quiet hours ${newValue ? 'enabled' : 'disabled'}`);
  };

  const handleQuietHoursTimeChange = () => {
    updateNotifications({
      quietHours: {
        ...settings.notifications.quietHours,
        start: quietHoursStart,
        end: quietHoursEnd,
      },
    });
    showToast('Quiet hours schedule updated');
  };

  const handleTestNotification = () => {
    testNotification();
  };

  const getPermissionIcon = () => {
    switch (notificationPermission) {
      case 'granted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getPermissionText = () => {
    switch (notificationPermission) {
      case 'granted':
        return 'Granted';
      case 'denied':
        return 'Denied';
      default:
        return 'Not requested';
    }
  };

  return (
    <div className="settings-main">
      {/* Email Notifications */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Email Notifications</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Marketing Emails</div>
              <div className="settings-field-value">Product updates, tips, and promotional content</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={() => handleEmailNotificationChange('marketing', !settings.notifications.email.marketing)}
                style={{
                  backgroundColor: settings.notifications.email.marketing 
                    ? 'var(--surbee-accent-muted)' 
                    : 'var(--surbee-sidebar-bg)',
                  color: settings.notifications.email.marketing 
                    ? 'var(--surbee-fg-primary)' 
                    : 'var(--surbee-fg-secondary)',
                  borderColor: settings.notifications.email.marketing 
                    ? 'var(--surbee-border-primary)' 
                    : 'var(--surbee-border-secondary)',
                }}
              >
                <div className="settings-button-content">
                  <Mail className="w-4 h-4" />
                  <div className="settings-button-text">
                    {settings.notifications.email.marketing ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Product Updates</div>
              <div className="settings-field-value">New features, improvements, and announcements</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={() => handleEmailNotificationChange('updates', !settings.notifications.email.updates)}
                style={{
                  backgroundColor: settings.notifications.email.updates 
                    ? 'var(--surbee-accent-muted)' 
                    : 'var(--surbee-sidebar-bg)',
                  color: settings.notifications.email.updates 
                    ? 'var(--surbee-fg-primary)' 
                    : 'var(--surbee-fg-secondary)',
                  borderColor: settings.notifications.email.updates 
                    ? 'var(--surbee-border-primary)' 
                    : 'var(--surbee-border-secondary)',
                }}
              >
                <div className="settings-button-content">
                  <Mail className="w-4 h-4" />
                  <div className="settings-button-text">
                    {settings.notifications.email.updates ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">
                <div className="flex items-center gap-2">
                  Security Alerts
                  <Shield className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
              <div className="settings-field-value">Important security and account notifications (cannot be disabled)</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                disabled
                style={{
                  backgroundColor: 'var(--surbee-accent-muted)',
                  color: 'var(--surbee-fg-primary)',
                  borderColor: 'var(--surbee-border-primary)',
                  opacity: 0.8,
                  cursor: 'not-allowed',
                }}
              >
                <div className="settings-button-content">
                  <Shield className="w-4 h-4" />
                  <div className="settings-button-text">Always Enabled</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* In-App Notifications */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">In-App Notifications</div>
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">
                <div className="flex items-center gap-2">
                  Desktop Notifications
                  {getPermissionIcon()}
                </div>
              </div>
              <div className="settings-field-value">
                Browser permission: {getPermissionText()}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div className="flex gap-2">
                <button
                  className="settings-button"
                  onClick={() => handleInAppNotificationChange('desktop', !settings.notifications.inApp.desktop)}
                  style={{
                    backgroundColor: settings.notifications.inApp.desktop 
                      ? 'var(--surbee-accent-muted)' 
                      : 'var(--surbee-sidebar-bg)',
                    color: settings.notifications.inApp.desktop 
                      ? 'var(--surbee-fg-primary)' 
                      : 'var(--surbee-fg-secondary)',
                    borderColor: settings.notifications.inApp.desktop 
                      ? 'var(--surbee-border-primary)' 
                      : 'var(--surbee-border-secondary)',
                  }}
                >
                  <div className="settings-button-content">
                    <Smartphone className="w-4 h-4" />
                    <div className="settings-button-text">
                      {settings.notifications.inApp.desktop ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </button>
                {settings.notifications.inApp.desktop && (
                  <button
                    className="settings-button"
                    onClick={handleTestNotification}
                  >
                    <div className="settings-button-content">
                      <TestTube className="w-4 h-4" />
                      <div className="settings-button-text">Test</div>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Sound Effects</div>
              <div className="settings-field-value">Play sounds for notifications and interactions</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={() => handleInAppNotificationChange('sound', !settings.notifications.inApp.sound)}
                style={{
                  backgroundColor: settings.notifications.inApp.sound 
                    ? 'var(--surbee-accent-muted)' 
                    : 'var(--surbee-sidebar-bg)',
                  color: settings.notifications.inApp.sound 
                    ? 'var(--surbee-fg-primary)' 
                    : 'var(--surbee-fg-secondary)',
                  borderColor: settings.notifications.inApp.sound 
                    ? 'var(--surbee-border-primary)' 
                    : 'var(--surbee-border-secondary)',
                }}
              >
                <div className="settings-button-content">
                  {settings.notifications.inApp.sound ? (
                    <Volume2 className="w-4 h-4" />
                  ) : (
                    <VolumeX className="w-4 h-4" />
                  )}
                  <div className="settings-button-text">
                    {settings.notifications.inApp.sound ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Badge Counter</div>
              <div className="settings-field-value">Show unread count on browser tab</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={() => handleInAppNotificationChange('badge', !settings.notifications.inApp.badge)}
                style={{
                  backgroundColor: settings.notifications.inApp.badge 
                    ? 'var(--surbee-accent-muted)' 
                    : 'var(--surbee-sidebar-bg)',
                  color: settings.notifications.inApp.badge 
                    ? 'var(--surbee-fg-primary)' 
                    : 'var(--surbee-fg-secondary)',
                  borderColor: settings.notifications.inApp.badge 
                    ? 'var(--surbee-border-primary)' 
                    : 'var(--surbee-border-secondary)',
                }}
              >
                <div className="settings-button-content">
                  <Bell className="w-4 h-4" />
                  <div className="settings-button-text">
                    {settings.notifications.inApp.badge ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="settings-section">
        <div className="settings-section-header">
          <div className="settings-header-content">
            <div className="flex items-center gap-2">
              <div className="settings-title">Quiet Hours</div>
              {isInQuietHours() && (
                <span className="px-2 py-1 text-xs rounded-full" 
                      style={{ backgroundColor: 'var(--surbee-accent-muted)', color: 'var(--surbee-fg-primary)' }}>
                  Active
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="settings-content">
          <div className="settings-row">
            <div className="settings-field-info">
              <div className="settings-field-label">Enable Quiet Hours</div>
              <div className="settings-field-value">
                Reduce notifications during specified hours
                {settings.notifications.quietHours.enabled && (
                  <div className="mt-1 text-xs">
                    {formatTime(settings.notifications.quietHours.start)} - {formatTime(settings.notifications.quietHours.end)}
                  </div>
                )}
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <button
                className="settings-button"
                onClick={handleQuietHoursToggle}
                style={{
                  backgroundColor: settings.notifications.quietHours.enabled 
                    ? 'var(--surbee-accent-muted)' 
                    : 'var(--surbee-sidebar-bg)',
                  color: settings.notifications.quietHours.enabled 
                    ? 'var(--surbee-fg-primary)' 
                    : 'var(--surbee-fg-secondary)',
                  borderColor: settings.notifications.quietHours.enabled 
                    ? 'var(--surbee-border-primary)' 
                    : 'var(--surbee-border-secondary)',
                }}
              >
                <div className="settings-button-content">
                  <Clock className="w-4 h-4" />
                  <div className="settings-button-text">
                    {settings.notifications.quietHours.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {settings.notifications.quietHours.enabled && (
            <div className="settings-row">
              <div className="settings-field-info">
                <div className="settings-field-label">Quiet Hours Schedule</div>
                <div className="settings-field-value">Set when to reduce notifications</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">From</span>
                    <input
                      type="time"
                      value={quietHoursStart}
                      onChange={(e) => setQuietHoursStart(e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                      style={{
                        backgroundColor: 'var(--surbee-sidebar-bg)',
                        borderColor: 'var(--surbee-border-secondary)',
                        color: 'var(--surbee-fg-primary)',
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">to</span>
                    <input
                      type="time"
                      value={quietHoursEnd}
                      onChange={(e) => setQuietHoursEnd(e.target.value)}
                      className="px-2 py-1 border rounded text-sm"
                      style={{
                        backgroundColor: 'var(--surbee-sidebar-bg)',
                        borderColor: 'var(--surbee-border-secondary)',
                        color: 'var(--surbee-fg-primary)',
                      }}
                    />
                  </div>
                  {(quietHoursStart !== settings.notifications.quietHours.start || 
                    quietHoursEnd !== settings.notifications.quietHours.end) && (
                    <button
                      className="settings-button"
                      onClick={handleQuietHoursTimeChange}
                      style={{
                        backgroundColor: 'var(--surbee-accent-muted)',
                        borderColor: 'var(--surbee-border-primary)',
                        color: 'var(--surbee-fg-primary)',
                      }}
                    >
                      <div className="settings-button-content">
                        <div className="settings-button-text">Update</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;