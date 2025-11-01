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
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Initialize auth state from Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Load user profile from localStorage
  useEffect(() => {
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
    try {
      setError(null);
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        return { error: signInError };
      }
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        setError(signUpError.message);
        return { error: signUpError };
      }
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signInWithOAuth = async (provider: 'github' | 'google') => {
    try {
      setError(null);
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        return { error: oauthError };
      }
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
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