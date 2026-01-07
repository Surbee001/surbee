"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  name?: string;
  age?: number;
  interests?: string[];
  surveyPreference?: 'research' | 'fast';
  // New onboarding fields
  acceptedTermsAt?: string;
  subscribedToEmails?: boolean;
  onboardingCompleted?: boolean;
}

// Paddle demo user for testing
const PADDLE_DEMO_USER = {
  id: 'paddle-demo-user',
  email: 'demo@paddle.com',
  user_metadata: {
    full_name: 'Paddle',
    name: 'Paddle',
  },
  app_metadata: {
    provider: 'demo',
  },
} as any;

// Recent account for account switching
export interface RecentAccount {
  userId: string;
  email: string;
  displayName: string;
  picture?: string;
  provider: 'google' | 'github' | 'email';
  lastUsed: number; // timestamp
}

const RECENT_ACCOUNTS_KEY = 'surbee_recent_accounts';
const MAX_RECENT_ACCOUNTS = 5;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  userProfile: UserProfile | null;
  hasCompletedOnboarding: boolean;
  recentAccounts: RecentAccount[];
  isPaddleDemo: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  signInWithOAuth: (provider: 'github' | 'google', loginHint?: string) => Promise<{ error: Error | null }>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  switchToAccount: (account: RecentAccount) => Promise<void>;
  removeRecentAccount: (userId: string) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to check paddle demo mode synchronously
const checkPaddleDemo = (): boolean => {
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  const paddleLink = urlParams.get('paddlelink');

  if (paddleLink === 'true') {
    sessionStorage.setItem('surbee_paddle_demo', 'true');
    // Remove the query param from URL for cleaner look
    const url = new URL(window.location.href);
    url.searchParams.delete('paddlelink');
    window.history.replaceState({}, '', url.toString());
    return true;
  }

  return sessionStorage.getItem('surbee_paddle_demo') === 'true';
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Check paddle demo synchronously during initial render
  const initialPaddleDemo = typeof window !== 'undefined' ? checkPaddleDemo() : false;

  const [user, setUser] = useState<User | null>(initialPaddleDemo ? PADDLE_DEMO_USER : null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!initialPaddleDemo); // Not loading if paddle demo
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    initialPaddleDemo ? {
      name: 'Paddle',
      onboardingCompleted: false, // Start at onboarding
      acceptedTermsAt: undefined,
    } : null
  );
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [recentAccounts, setRecentAccounts] = useState<RecentAccount[]>([]);
  const [isPaddleDemo, setIsPaddleDemo] = useState(initialPaddleDemo);

  // Load recent accounts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_ACCOUNTS_KEY);
      if (stored) {
        const accounts = JSON.parse(stored) as RecentAccount[];
        setRecentAccounts(accounts);
      }
    } catch (err) {
      console.error('Error loading recent accounts:', err);
    }
  }, []);

  // Save current user to recent accounts when they log in
  useEffect(() => {
    if (user?.id && user?.email) {
      const provider = user.app_metadata?.provider as 'google' | 'github' | 'email' || 'email';
      const displayName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      const picture = user.user_metadata?.picture || user.user_metadata?.avatar_url;

      const newAccount: RecentAccount = {
        userId: user.id,
        email: user.email,
        displayName,
        picture,
        provider,
        lastUsed: Date.now(),
      };

      setRecentAccounts(prev => {
        // Remove existing entry for this user
        const filtered = prev.filter(a => a.userId !== user.id);
        // Add to front
        const updated = [newAccount, ...filtered].slice(0, MAX_RECENT_ACCOUNTS);
        // Save to localStorage
        localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user?.id, user?.email]);

  // Initialize auth state from Supabase
  useEffect(() => {
    // Skip if in Paddle demo mode
    if (isPaddleDemo) return;

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

    // Listen for auth changes (only if not in demo mode)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (isPaddleDemo) return;
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [isPaddleDemo]);

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
                acceptedTermsAt: data.profile.accepted_terms_at,
                subscribedToEmails: data.profile.subscribed_to_emails,
                onboardingCompleted: data.profile.onboarding_completed,
              };
              setUserProfile(profile);
              setHasCompletedOnboarding(data.profile.onboarding_completed || !!data.profile.accepted_terms_at);
              // Sync to localStorage
              localStorage.setItem('surbee_user_profile', JSON.stringify(profile));
              if (data.profile.onboarding_completed || data.profile.accepted_terms_at) {
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
      // Clear paddle demo mode if active
      if (isPaddleDemo) {
        sessionStorage.removeItem('surbee_paddle_demo');
        setIsPaddleDemo(false);
        setUser(null);
        setUserProfile(null);
        return;
      }

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

  const signInWithOAuth = async (provider: 'github' | 'google', loginHint?: string) => {
    try {
      setError(null);
      const options: any = {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      };

      // Add login_hint for faster account selection (works with Google)
      if (loginHint && provider === 'google') {
        options.queryParams = {
          login_hint: loginHint,
        };
      }

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options,
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
      // Merge with existing profile
      const mergedProfile = { ...userProfile, ...profile };

      // Save to localStorage as backup
      localStorage.setItem('surbee_user_profile', JSON.stringify(mergedProfile));
      localStorage.setItem('surbee_onboarding_completed', 'true');

      // Update state
      setUserProfile(mergedProfile);
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
              onboarding_completed: profile.onboardingCompleted ?? true,
              accepted_terms_at: profile.acceptedTermsAt,
              subscribed_to_emails: profile.subscribedToEmails,
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

  // Switch to a different account
  const switchToAccount = async (account: RecentAccount) => {
    try {
      // Sign out current user first
      await supabase.auth.signOut();
      localStorage.removeItem('surbee_user_preferences');

      // Trigger re-authentication based on provider
      if (account.provider === 'google') {
        await signInWithOAuth('google', account.email);
      } else if (account.provider === 'github') {
        await signInWithOAuth('github');
      } else {
        // For email accounts, send a magic link
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email: account.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (otpError) {
          setError(otpError.message);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Remove an account from recent accounts list
  const removeRecentAccount = (userId: string) => {
    setRecentAccounts(prev => {
      const updated = prev.filter(a => a.userId !== userId);
      localStorage.setItem(RECENT_ACCOUNTS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    session,
    loading,
    error,
    userProfile,
    hasCompletedOnboarding,
    recentAccounts,
    isPaddleDemo,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    updateUserProfile,
    updatePassword,
    deleteAccount,
    switchToAccount,
    removeRecentAccount,
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