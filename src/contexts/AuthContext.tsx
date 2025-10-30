"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  name: string;
  age: number;
  interests: string[];
  surveyPreference: 'research' | 'fast';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  userProfile: UserProfile | null;
  hasCompletedOnboarding: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'github' | 'google') => Promise<{ error: Error | null }>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Mock user for demo mode - bypass all Supabase auth
  const [user, setUser] = useState<User | null>({
    id: 'demo-user-id',
    email: 'demo@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
  } as User);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false); // No loading for demo
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Load user profile from localStorage for demo mode
    try {
      const savedProfile = localStorage.getItem('surbee_user_profile');
      const onboardingCompleted = localStorage.getItem('surbee_onboarding_completed');
      
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }
      
      if (onboardingCompleted === 'true') {
        setHasCompletedOnboarding(true);
      }
    } catch (error) {
      console.error('Error loading user profile from localStorage:', error);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock sign in for demo mode
    setError(null);
    return { error: null };
  };

  const signUp = async (email: string, password: string) => {
    // Mock sign up for demo mode
    setError(null);
    return { error: null };
  };

  const signOut = async () => {
    // Mock sign out for demo mode
    setError(null);
  };

  const signInWithOAuth = async (provider: 'github' | 'google') => {
    // Mock OAuth for demo mode
    setError(null);
    return { error: null };
  };

  const updateUserProfile = async (profile: UserProfile) => {
    try {
      // Save to localStorage for demo mode
      localStorage.setItem('surbee_user_profile', JSON.stringify(profile));
      localStorage.setItem('surbee_onboarding_completed', 'true');
      
      // Update state
      setUserProfile(profile);
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    loading,
    error,
    userProfile,
    hasCompletedOnboarding,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    updateUserProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}