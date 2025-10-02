"use client";

import { useContext, useCallback, useEffect, useState } from 'react';
import { useSettings as useSettingsContext } from '@/contexts/SettingsContext';
import { 
  copyToClipboard, 
  requestNotificationPermission, 
  showNotification,
  createAPIKey,
  createTeamMember,
  validateEmail,
  isQuietHoursActive,
  applyTheme
} from '@/lib/settings-manager';

// Custom hook for settings with additional utilities
export function useSettings() {
  const context = useSettingsContext();
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' }>>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const copyAPIKey = useCallback(async (key: string) => {
    const success = await copyToClipboard(key);
    if (success) {
      showToast('API key copied to clipboard');
    } else {
      showToast('Failed to copy API key', 'error');
    }
  }, [showToast]);

  const generateNewAPIKey = useCallback((name: string) => {
    try {
      const newKey = createAPIKey(name);
      context.addAPIKey(newKey);
      showToast('API key generated successfully');
      return newKey;
    } catch (error) {
      showToast('Failed to generate API key', 'error');
      throw error;
    }
  }, [context, showToast]);

  const revokeAPIKey = useCallback((keyId: string) => {
    try {
      context.removeAPIKey(keyId);
      showToast('API key revoked successfully');
    } catch (error) {
      showToast('Failed to revoke API key', 'error');
      throw error;
    }
  }, [context, showToast]);

  const requestNotifications = useCallback(async () => {
    try {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        context.updateNotifications({
          inApp: { ...context.settings.notifications.inApp, desktop: true }
        });
        showToast('Desktop notifications enabled');
        return true;
      } else {
        showToast('Desktop notifications permission denied', 'error');
        return false;
      }
    } catch (error) {
      showToast('Failed to request notification permission', 'error');
      return false;
    }
  }, [context, showToast]);

  const testNotification = useCallback(() => {
    if (context.settings.notifications.inApp.desktop) {
      const notification = showNotification('Test Notification', {
        body: 'This is a test notification from Surbee',
        tag: 'test',
      });
      
      if (notification) {
        showToast('Test notification sent');
      } else {
        showToast('Failed to send test notification', 'error');
      }
    } else {
      showToast('Desktop notifications are disabled', 'error');
    }
  }, [context.settings.notifications.inApp.desktop, showToast]);

  const inviteTeamMember = useCallback((name: string, email: string, role: 'admin' | 'member' | 'viewer') => {
    try {
      if (!validateEmail(email)) {
        throw new Error('Invalid email address');
      }

      // Check if member already exists
      const existingMember = context.settings.enterprise.teamMembers.find(
        member => member.email.toLowerCase() === email.toLowerCase()
      );

      if (existingMember) {
        throw new Error('Team member with this email already exists');
      }

      const newMember = createTeamMember(name, email, role);
      context.addTeamMember(newMember);
      showToast(`Team member ${name} invited successfully`);
      return newMember;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to invite team member';
      showToast(message, 'error');
      throw error;
    }
  }, [context, showToast]);

  const removeTeamMember = useCallback((memberId: string) => {
    try {
      const member = context.settings.enterprise.teamMembers.find(m => m.id === memberId);
      if (!member) {
        throw new Error('Team member not found');
      }

      context.removeTeamMember(memberId);
      showToast(`Team member ${member.name} removed successfully`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to remove team member';
      showToast(message, 'error');
      throw error;
    }
  }, [context, showToast]);

  const updateTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    try {
      context.updatePreferences({ theme });
      applyTheme(theme);
      showToast(`Theme changed to ${theme}`);
    } catch (error) {
      showToast('Failed to update theme', 'error');
      throw error;
    }
  }, [context, showToast]);

  const updateLanguage = useCallback((language: 'en' | 'es' | 'fr' | 'de' | 'ja') => {
    try {
      context.updatePreferences({ language });
      showToast('Language updated successfully');
      // Here you could trigger i18n locale change
    } catch (error) {
      showToast('Failed to update language', 'error');
      throw error;
    }
  }, [context, showToast]);

  const exportSettings = useCallback(() => {
    try {
      const settingsJson = JSON.stringify(context.settings, null, 2);
      const blob = new Blob([settingsJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'surbee-settings.json';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      showToast('Settings exported successfully');
    } catch (error) {
      showToast('Failed to export settings', 'error');
      throw error;
    }
  }, [context.settings, showToast]);

  const importSettings = useCallback((file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const settingsJson = e.target?.result as string;
          const importedSettings = JSON.parse(settingsJson);
          
          // Validate imported settings structure
          if (!importedSettings.preferences || !importedSettings.personalization) {
            throw new Error('Invalid settings file format');
          }
          
          // Merge with default settings to ensure all required fields exist
          const mergedSettings = {
            ...context.settings,
            ...importedSettings,
          };
          
          // Update settings
          context.updatePreferences(mergedSettings.preferences);
          context.updatePersonalization(mergedSettings.personalization);
          context.updateNotifications(mergedSettings.notifications);
          
          showToast('Settings imported successfully');
          resolve(mergedSettings);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to import settings';
          showToast(message, 'error');
          reject(error);
        }
      };
      
      reader.onerror = () => {
        showToast('Failed to read settings file', 'error');
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }, [context, showToast]);

  const resetAllSettings = useCallback(() => {
    try {
      context.resetSettings();
      showToast('All settings reset to defaults');
    } catch (error) {
      showToast('Failed to reset settings', 'error');
      throw error;
    }
  }, [context, showToast]);

  // Check if quiet hours are active
  const isInQuietHours = useCallback(() => {
    const { quietHours } = context.settings.notifications;
    return quietHours.enabled && isQuietHoursActive(quietHours.start, quietHours.end);
  }, [context.settings.notifications]);

  // Get current usage percentage for API
  const getAPIUsagePercentage = useCallback(() => {
    const { currentMonth, limit } = context.settings.api.usageStatistics;
    return limit > 0 ? Math.round((currentMonth / limit) * 100) : 0;
  }, [context.settings.api.usageStatistics]);

  // Check if API usage is approaching limit
  const isAPIUsageHigh = useCallback(() => {
    return getAPIUsagePercentage() >= 80;
  }, [getAPIUsagePercentage]);

  return {
    ...context,
    toasts,
    showToast,
    copyAPIKey,
    generateNewAPIKey,
    revokeAPIKey,
    requestNotifications,
    testNotification,
    inviteTeamMember,
    removeTeamMember,
    updateTheme,
    updateLanguage,
    exportSettings,
    importSettings,
    resetAllSettings,
    isInQuietHours,
    getAPIUsagePercentage,
    isAPIUsageHigh,
  };
}

// Hook for theme-aware styles
export function useThemeAwareStyles() {
  const { settings } = useSettingsContext();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      if (settings.preferences.theme === 'system') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(settings.preferences.theme === 'dark');
      }
    };

    updateTheme();

    if (settings.preferences.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [settings.preferences.theme]);

  return { isDark, theme: settings.preferences.theme };
}

export default useSettings;