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
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
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

  // Load user profile from database (with localStorage fallback)
  useEffect(() => {
    const loadUserProfile = async () => {
      // First check localStorage as fallback
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

      // If user is logged in, load from database
      if (user?.id) {
        try {
          const response = await fetch(`/api/user/profile?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.profile) {
              const profile: UserProfile = {
                name: data.profile.name || '',
                age: data.profile.age || 0,
                interests: data.profile.interests || [],
                surveyPreference: data.profile.survey_preference || 'fast',
              };
              setUserProfile(profile);
              setHasCompletedOnboarding(data.profile.onboarding_completed || false);
              // Sync to localStorage
              localStorage.setItem('surbee_user_profile', JSON.stringify(profile));
              if (data.profile.onboarding_completed) {
                localStorage.setItem('surbee_onboarding_completed', 'true');
              }
            }
          }
        } catch (error) {
          console.error('Error loading user profile from database:', error);
        }
      }
    };

    loadUserProfile();
  }, [user?.id]);

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
      // Clear local storage preferences
      localStorage.removeItem('surbee_user_preferences');
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteAccount = async (): Promise<{ error: Error | null }> => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') };
      }

      // First, delete all user data from our database
      // Delete user's projects/surveys
      const { error: projectsError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', user.id);

      if (projectsError) {
        console.error('Error deleting projects:', projectsError);
      }

      // Delete user's survey responses (if they have any as a respondent)
      const { error: responsesError } = await supabase
        .from('survey_responses')
        .delete()
        .eq('user_id', user.id);

      if (responsesError) {
        console.error('Error deleting responses:', responsesError);
      }

      // Clear local storage
      localStorage.removeItem('surbee_user_preferences');
      sessionStorage.clear();

      // Finally, sign out the user
      // Note: For full account deletion from Supabase Auth, you need a server-side function
      // with service role key. Here we sign out and the user data is already deleted.
      await supabase.auth.signOut();

      setUser(null);
      setSession(null);
      setError(null);

      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
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
      // Save to localStorage as backup
      localStorage.setItem('surbee_user_profile', JSON.stringify(profile));
      localStorage.setItem('surbee_onboarding_completed', 'true');

      // Update state
      setUserProfile(profile);
      setHasCompletedOnboarding(true);

      // If user is logged in, save to database
      if (user?.id) {
        await fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            profile: {
              name: profile.name,
              age: profile.age,
              interests: profile.interests,
              survey_preference: profile.surveyPreference,
              onboarding_completed: true,
            },
          }),
        });
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      setError(null);
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        setError(updateError.message);
        return { error: updateError };
      }
      return { error: null };
    } catch (err: any) {
      setError(err.message);
      return { error: err };
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
    updatePassword,
    deleteAccount,
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