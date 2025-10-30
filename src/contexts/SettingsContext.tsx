"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

// Settings types
export interface PreferencesSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr' | 'de' | 'ja';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  compactMode: boolean;
}

export interface PersonalizationSettings {
  aiStyle: 'professional' | 'casual' | 'creative';
  responseLength: 'brief' | 'detailed' | 'comprehensive';
  autoSuggestions: boolean;
  shortcuts: Record<string, string>;
  defaultTemplate: string;
  dashboardLayout: 'grid' | 'list' | 'card';
}

export interface NotificationSettings {
  email: {
    marketing: boolean;
    updates: boolean;
    security: boolean;
  };
  inApp: {
    desktop: boolean;
    sound: boolean;
    badge: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface APIKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string | null;
  isActive: boolean;
}

export interface APISettings {
  keys: APIKey[];
  webhookUrl: string;
  rateLimitNotifications: boolean;
  usageStatistics: {
    currentMonth: number;
    limit: number;
  };
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  joinedAt: string;
  lastActive: string;
}

export interface EnterpriseSettings {
  teamMembers: TeamMember[];
  ssoEnabled: boolean;
  ssoProvider: string;
  billingInfo: {
    plan: string;
    usersCount: number;
    nextBillingDate: string;
    amount: number;
  };
}

export interface AppSettings {
  preferences: PreferencesSettings;
  personalization: PersonalizationSettings;
  notifications: NotificationSettings;
  api: APISettings;
  enterprise: EnterpriseSettings;
}

// Default settings
const defaultSettings: AppSettings = {
  preferences: {
    theme: 'system',
    language: 'en',
    fontSize: 'medium',
    animations: true,
    compactMode: false,
  },
  personalization: {
    aiStyle: 'professional',
    responseLength: 'detailed',
    autoSuggestions: true,
    shortcuts: {
      'new-project': 'Ctrl+N',
      'open-settings': 'Ctrl+,',
      'search': 'Ctrl+K',
    },
    defaultTemplate: 'blank',
    dashboardLayout: 'grid',
  },
  notifications: {
    email: {
      marketing: false,
      updates: true,
      security: true,
    },
    inApp: {
      desktop: true,
      sound: true,
      badge: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  },
  api: {
    keys: [],
    webhookUrl: '',
    rateLimitNotifications: true,
    usageStatistics: {
      currentMonth: 0,
      limit: 10000,
    },
  },
  enterprise: {
    teamMembers: [],
    ssoEnabled: false,
    ssoProvider: '',
    billingInfo: {
      plan: 'Pro',
      usersCount: 1,
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 29,
    },
  },
};

// Action types
type SettingsAction =
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<PreferencesSettings> }
  | { type: 'UPDATE_PERSONALIZATION'; payload: Partial<PersonalizationSettings> }
  | { type: 'UPDATE_NOTIFICATIONS'; payload: Partial<NotificationSettings> }
  | { type: 'UPDATE_API'; payload: Partial<APISettings> }
  | { type: 'UPDATE_ENTERPRISE'; payload: Partial<EnterpriseSettings> }
  | { type: 'LOAD_SETTINGS'; payload: AppSettings }
  | { type: 'RESET_SETTINGS' }
  | { type: 'ADD_API_KEY'; payload: APIKey }
  | { type: 'REMOVE_API_KEY'; payload: string }
  | { type: 'ADD_TEAM_MEMBER'; payload: TeamMember }
  | { type: 'REMOVE_TEAM_MEMBER'; payload: string }
  | { type: 'UPDATE_TEAM_MEMBER'; payload: { id: string; updates: Partial<TeamMember> } };

// Reducer
function settingsReducer(state: AppSettings, action: SettingsAction): AppSettings {
  switch (action.type) {
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };
    case 'UPDATE_PERSONALIZATION':
      return {
        ...state,
        personalization: { ...state.personalization, ...action.payload },
      };
    case 'UPDATE_NOTIFICATIONS':
      return {
        ...state,
        notifications: { ...state.notifications, ...action.payload },
      };
    case 'UPDATE_API':
      return {
        ...state,
        api: { ...state.api, ...action.payload },
      };
    case 'UPDATE_ENTERPRISE':
      return {
        ...state,
        enterprise: { ...state.enterprise, ...action.payload },
      };
    case 'LOAD_SETTINGS':
      return action.payload;
    case 'RESET_SETTINGS':
      return defaultSettings;
    case 'ADD_API_KEY':
      return {
        ...state,
        api: {
          ...state.api,
          keys: [...state.api.keys, action.payload],
        },
      };
    case 'REMOVE_API_KEY':
      return {
        ...state,
        api: {
          ...state.api,
          keys: state.api.keys.filter(key => key.id !== action.payload),
        },
      };
    case 'ADD_TEAM_MEMBER':
      return {
        ...state,
        enterprise: {
          ...state.enterprise,
          teamMembers: [...state.enterprise.teamMembers, action.payload],
        },
      };
    case 'REMOVE_TEAM_MEMBER':
      return {
        ...state,
        enterprise: {
          ...state.enterprise,
          teamMembers: state.enterprise.teamMembers.filter(member => member.id !== action.payload),
        },
      };
    case 'UPDATE_TEAM_MEMBER':
      return {
        ...state,
        enterprise: {
          ...state.enterprise,
          teamMembers: state.enterprise.teamMembers.map(member =>
            member.id === action.payload.id
              ? { ...member, ...action.payload.updates }
              : member
          ),
        },
      };
    default:
      return state;
  }
}

// Context
interface SettingsContextType {
  settings: AppSettings;
  updatePreferences: (updates: Partial<PreferencesSettings>) => void;
  updatePersonalization: (updates: Partial<PersonalizationSettings>) => void;
  updateNotifications: (updates: Partial<NotificationSettings>) => void;
  updateAPI: (updates: Partial<APISettings>) => void;
  updateEnterprise: (updates: Partial<EnterpriseSettings>) => void;
  resetSettings: () => void;
  addAPIKey: (key: APIKey) => void;
  removeAPIKey: (keyId: string) => void;
  addTeamMember: (member: TeamMember) => void;
  removeTeamMember: (memberId: string) => void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, dispatch] = useReducer(settingsReducer, defaultSettings);
  const isInitialized = React.useRef(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('surbee-settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        dispatch({ type: 'LOAD_SETTINGS', payload: { ...defaultSettings, ...parsedSettings } });
      }
      isInitialized.current = true;
    } catch (error) {
      console.error('Failed to load settings from localStorage:', error);
      isInitialized.current = true;
    }
  }, []);

  // Save settings to localStorage whenever they change (but not on initial load)
  const settingsRef = React.useRef(settings);
  const saveTimeoutRef = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    settingsRef.current = settings;

    // Only save if initialized and not the initial state
    if (!isInitialized.current) return;

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem('surbee-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
      }
    }, 1000); // Longer debounce to prevent rapid saves

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [settings]);

  // Apply theme changes to the document (with safety checks)
  const lastAppliedThemeRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!isInitialized.current) return;

    const currentTheme = settings.preferences.theme;

    // Skip if theme hasn't actually changed
    if (lastAppliedThemeRef.current === currentTheme) return;
    lastAppliedThemeRef.current = currentTheme;

    const applyTheme = (theme: string) => {
      try {
        const root = document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      } catch (error) {
        console.error('Failed to apply theme:', error);
      }
    };

    if (currentTheme === 'system') {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        applyTheme(mediaQuery.matches ? 'dark' : 'light');

        const handler = (e: MediaQueryListEvent) => applyTheme(e.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      } catch (error) {
        console.error('Failed to setup system theme:', error);
        applyTheme('dark'); // Fallback
      }
    } else {
      applyTheme(currentTheme);
    }
  }, [settings.preferences.theme]);

  // Apply font size changes (with safety checks)
  const lastAppliedFontSizeRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!isInitialized.current) return;

    const currentFontSize = settings.preferences.fontSize;

    // Skip if font size hasn't actually changed
    if (lastAppliedFontSizeRef.current === currentFontSize) return;
    lastAppliedFontSizeRef.current = currentFontSize;

    try {
      const root = document.documentElement;
      root.classList.remove('font-small', 'font-medium', 'font-large');
      root.classList.add(`font-${currentFontSize}`);
    } catch (error) {
      console.error('Failed to apply font size:', error);
    }
  }, [settings.preferences.fontSize]);

  const contextValue: SettingsContextType = {
    settings,
    updatePreferences: (updates) => dispatch({ type: 'UPDATE_PREFERENCES', payload: updates }),
    updatePersonalization: (updates) => dispatch({ type: 'UPDATE_PERSONALIZATION', payload: updates }),
    updateNotifications: (updates) => dispatch({ type: 'UPDATE_NOTIFICATIONS', payload: updates }),
    updateAPI: (updates) => dispatch({ type: 'UPDATE_API', payload: updates }),
    updateEnterprise: (updates) => dispatch({ type: 'UPDATE_ENTERPRISE', payload: updates }),
    resetSettings: () => dispatch({ type: 'RESET_SETTINGS' }),
    addAPIKey: (key) => dispatch({ type: 'ADD_API_KEY', payload: key }),
    removeAPIKey: (keyId) => dispatch({ type: 'REMOVE_API_KEY', payload: keyId }),
    addTeamMember: (member) => dispatch({ type: 'ADD_TEAM_MEMBER', payload: member }),
    removeTeamMember: (memberId) => dispatch({ type: 'REMOVE_TEAM_MEMBER', payload: memberId }),
    updateTeamMember: (id, updates) => dispatch({ type: 'UPDATE_TEAM_MEMBER', payload: { id, updates } }),
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}