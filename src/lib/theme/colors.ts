export const themeColors = {
  light: {
    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      elevated: '#ffffff',
    },
    // Foreground/text colors
    foreground: {
      primary: '#0a0a0a',
      secondary: '#374151',
      muted: '#6b7280',
      inverse: '#ffffff',
    },
    // Border colors
    border: {
      primary: 'rgba(0, 0, 0, 0.08)',
      secondary: 'rgba(0, 0, 0, 0.05)',
      focus: '#2563eb',
    },
    // Card colors
    card: {
      background: '#ffffff',
      border: 'rgba(0, 0, 0, 0.08)',
      hover: '#f9fafb',
    },
    // Accent colors
    accent: {
      primary: '#2563eb',
      hover: '#1d4ed8',
      subtle: '#eff6ff',
    },
    // Semantic colors
    semantic: {
      success: '#10b981',
      successSubtle: '#ecfdf5',
      warning: '#f59e0b',
      warningSubtle: '#fffbeb',
      error: '#ef4444',
      errorSubtle: '#fef2f2',
      info: '#3b82f6',
      infoSubtle: '#eff6ff',
    },
    // Input colors
    input: {
      background: '#ffffff',
      border: 'rgba(0, 0, 0, 0.12)',
      placeholder: '#9ca3af',
      focus: '#2563eb',
    },
    // Sidebar specific
    sidebar: {
      background: '#ffffff',
      hover: '#f9fafb',
      active: '#eff6ff',
      border: 'rgba(0, 0, 0, 0.08)',
    },
  },
  dark: {
    // Background colors
    background: {
      primary: '#0f0f0f',
      secondary: '#1a1a1a',
      tertiary: '#242424',
      elevated: '#1a1a1a',
    },
    // Foreground/text colors
    foreground: {
      primary: '#fafafa',
      secondary: '#d1d5db',
      muted: '#9ca3af',
      inverse: '#0a0a0a',
    },
    // Border colors
    border: {
      primary: 'rgba(255, 255, 255, 0.08)',
      secondary: 'rgba(255, 255, 255, 0.05)',
      focus: '#3b82f6',
    },
    // Card colors
    card: {
      background: '#1a1a1a',
      border: 'rgba(255, 255, 255, 0.08)',
      hover: '#242424',
    },
    // Accent colors
    accent: {
      primary: '#3b82f6',
      hover: '#2563eb',
      subtle: 'rgba(59, 130, 246, 0.1)',
    },
    // Semantic colors
    semantic: {
      success: '#10b981',
      successSubtle: 'rgba(16, 185, 129, 0.1)',
      warning: '#f59e0b',
      warningSubtle: 'rgba(245, 158, 11, 0.1)',
      error: '#ef4444',
      errorSubtle: 'rgba(239, 68, 68, 0.1)',
      info: '#3b82f6',
      infoSubtle: 'rgba(59, 130, 246, 0.1)',
    },
    // Input colors
    input: {
      background: '#242424',
      border: 'rgba(255, 255, 255, 0.12)',
      placeholder: '#6b7280',
      focus: '#3b82f6',
    },
    // Sidebar specific
    sidebar: {
      background: '#0f0f0f',
      hover: '#1a1a1a',
      active: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(255, 255, 255, 0.08)',
    },
  },
} as const;

export type Theme = 'light' | 'dark' | 'system';
export type ThemeColors = typeof themeColors;