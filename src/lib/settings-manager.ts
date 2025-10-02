import { APIKey, TeamMember } from '@/contexts/SettingsContext';

// API Key management utilities
export function generateAPIKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const prefix = 'sk_';
  const keyLength = 48;
  
  let result = prefix;
  for (let i = 0; i < keyLength; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createAPIKey(name: string): APIKey {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: name.trim() || 'Untitled Key',
    key: generateAPIKey(),
    createdAt: now,
    lastUsed: null,
    isActive: true,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Copy to clipboard utility
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      document.body.removeChild(textArea);
      return result;
    } catch (fallbackErr) {
      console.error('Failed to copy to clipboard:', fallbackErr);
      return false;
    }
  }
}

// Notification permissions
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support desktop notifications');
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return 'denied';
  }
}

export function showNotification(title: string, options?: NotificationOptions): Notification | null {
  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    return new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
    return null;
  }
}

// Language management
export const languages = {
  en: { name: 'English', nativeName: 'English' },
  es: { name: 'Spanish', nativeName: 'Español' },
  fr: { name: 'French', nativeName: 'Français' },
  de: { name: 'German', nativeName: 'Deutsch' },
  ja: { name: 'Japanese', nativeName: '日本語' },
} as const;

export type Language = keyof typeof languages;

export function getLanguageName(code: Language): string {
  return languages[code]?.name || code;
}

export function getLanguageNativeName(code: Language): string {
  return languages[code]?.nativeName || code;
}

// Theme utilities
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: 'light' | 'dark' | 'system'): void {
  const root = document.documentElement;
  
  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    root.classList.toggle('dark', systemTheme === 'dark');
  } else {
    root.classList.toggle('dark', theme === 'dark');
  }
}

// Keyboard shortcut utilities
export function formatShortcut(shortcut: string): string {
  return shortcut
    .replace(/Ctrl/g, navigator.platform.includes('Mac') ? '⌘' : 'Ctrl')
    .replace(/Alt/g, navigator.platform.includes('Mac') ? '⌥' : 'Alt')
    .replace(/Shift/g, navigator.platform.includes('Mac') ? '⇧' : 'Shift')
    .replace(/\+/g, navigator.platform.includes('Mac') ? '' : '+');
}

export function parseShortcut(shortcut: string): { key: string; modifiers: string[] } {
  const parts = shortcut.toLowerCase().split('+');
  const key = parts.pop() || '';
  const modifiers = parts.map(part => part.trim());
  return { key, modifiers };
}

export function isShortcutConflict(newShortcut: string, existingShortcuts: Record<string, string>): boolean {
  const shortcuts = Object.values(existingShortcuts);
  return shortcuts.some(existing => existing.toLowerCase() === newShortcut.toLowerCase());
}

// Team member utilities
export function createTeamMember(name: string, email: string, role: TeamMember['role']): TeamMember {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    role,
    joinedAt: now,
    lastActive: now,
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function getRoleDisplayName(role: TeamMember['role']): string {
  const roleNames = {
    admin: 'Admin',
    member: 'Member',
    viewer: 'Viewer',
  };
  return roleNames[role] || role;
}

export function getRoleDescription(role: TeamMember['role']): string {
  const descriptions = {
    admin: 'Full access to all features and settings',
    member: 'Can create and edit projects, limited settings access',
    viewer: 'Read-only access to projects and data',
  };
  return descriptions[role] || '';
}

// Time and date utilities
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
}

export function formatTime(timeString: string): string {
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (error) {
    return timeString;
  }
}

export function isQuietHoursActive(start: string, end: string): boolean {
  try {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Crosses midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  } catch (error) {
    return false;
  }
}

// Usage statistics utilities
export function formatUsagePercentage(used: number, limit: number): string {
  if (limit === 0) return '0%';
  return Math.round((used / limit) * 100) + '%';
}

export function getUsageColor(used: number, limit: number): string {
  const percentage = (used / limit) * 100;
  if (percentage >= 90) return 'text-red-500';
  if (percentage >= 75) return 'text-yellow-500';
  return 'text-green-500';
}

// Export utilities for settings backup/restore
export function exportSettings(settings: any): string {
  try {
    return JSON.stringify(settings, null, 2);
  } catch (error) {
    throw new Error('Failed to export settings');
  }
}

export function importSettings(settingsJson: string): any {
  try {
    return JSON.parse(settingsJson);
  } catch (error) {
    throw new Error('Invalid settings format');
  }
}

export function downloadSettingsFile(settings: any, filename = 'surbee-settings.json'): void {
  try {
    const settingsJson = exportSettings(settings);
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download settings file:', error);
    throw error;
  }
}