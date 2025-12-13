"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface UserPreferences {
  displayName: string;        // What Surbee should call the user
  tone: 'professional' | 'casual' | 'friendly' | 'formal' | 'creative';
  personalPreferences: string; // Custom instructions for AI
  workFunction: string;        // User's role/occupation
  notificationsEnabled: boolean;
  exportFormat: string;
  autoSave: boolean;
  analyticsTracking: boolean;
}

const defaultPreferences: UserPreferences = {
  displayName: '',
  tone: 'professional',
  personalPreferences: '',
  workFunction: '',
  notificationsEnabled: true,
  exportFormat: 'csv',
  autoSave: true,
  analyticsTracking: true,
};

interface UserPreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  isLoading: boolean;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const STORAGE_KEY = 'surbee_user_preferences';

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving user preferences:', error);
      }
      return updated;
    });
  };

  return (
    <UserPreferencesContext.Provider value={{ preferences, updatePreferences, isLoading }}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
}

// Helper function to generate AI system prompt additions based on preferences
export function getPreferencesForAI(preferences: UserPreferences): string {
  const parts: string[] = [];

  if (preferences.displayName) {
    parts.push(`The user's name is "${preferences.displayName}". Address them by name when appropriate, especially in greetings.`);
  }

  const toneInstructions: Record<string, string> = {
    professional: 'Maintain a professional, business-like tone. Be clear, direct, and focused on results.',
    casual: 'Use a casual, relaxed tone. Feel free to use contractions and be conversational.',
    friendly: 'Be warm and friendly. Use an encouraging, supportive tone while remaining helpful.',
    formal: 'Use formal language. Be respectful, precise, and maintain a traditional professional demeanor.',
    creative: 'Be creative and engaging. Use vivid language, analogies, and make the conversation interesting.',
  };

  parts.push(toneInstructions[preferences.tone] || toneInstructions.professional);

  if (preferences.workFunction && preferences.workFunction !== 'Select your work function') {
    parts.push(`The user works as a ${preferences.workFunction}. Tailor your responses to their professional context when relevant.`);
  }

  if (preferences.personalPreferences) {
    parts.push(`User's custom preferences: ${preferences.personalPreferences}`);
  }

  return parts.join('\n');
}
