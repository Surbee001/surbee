'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface UserCredits {
  creditsRemaining: number;
  monthlyCredits: number;
  apiCreditsRemaining: number;
  apiCreditsMonthly: number;
  creditsResetAt: string;
  plan: 'free_user' | 'surbee_pro' | 'surbee_max' | 'surbee_enterprise';
}

export interface UsageStats {
  totalUsed: number;
  byAction: Record<string, number>;
  history: Array<{ action: string; credits: number; date: string }>;
}

export interface UseCreditsReturn {
  credits: UserCredits | null;
  usage: UsageStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  hasEnoughCredits: (required: number) => boolean;
  percentUsed: number;
  isLow: boolean;
}

// Calculate end of current month for default reset date
function getEndOfMonth(): string {
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return endOfMonth.toISOString();
}

const DEFAULT_CREDITS: UserCredits = {
  creditsRemaining: 100,
  monthlyCredits: 100,
  apiCreditsRemaining: 0,
  apiCreditsMonthly: 0,
  creditsResetAt: getEndOfMonth(),
  plan: 'free_user',
};

export function useCredits(): UseCreditsReturn {
  const { user } = useAuth();
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCredits = useCallback(async () => {
    if (!user?.id) {
      setCredits(DEFAULT_CREDITS);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [creditsRes, usageRes] = await Promise.all([
        fetch(`/api/credits?userId=${user.id}`),
        fetch(`/api/credits/usage?userId=${user.id}`),
      ]);

      if (creditsRes.ok) {
        const creditsData = await creditsRes.json();
        setCredits(creditsData);
      } else {
        setCredits(DEFAULT_CREDITS);
      }

      if (usageRes.ok) {
        const usageData = await usageRes.json();
        setUsage(usageData);
      }
    } catch (err) {
      console.error('Error fetching credits:', err);
      setError('Failed to load credit information');
      setCredits(DEFAULT_CREDITS);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  // Listen for credit updates from API responses
  useEffect(() => {
    const handleCreditUpdate = (event: CustomEvent<{ remaining: number }>) => {
      if (credits) {
        setCredits({
          ...credits,
          creditsRemaining: event.detail.remaining,
        });
      }
    };

    window.addEventListener('creditUpdate', handleCreditUpdate as EventListener);
    return () => {
      window.removeEventListener('creditUpdate', handleCreditUpdate as EventListener);
    };
  }, [credits]);

  const hasEnoughCredits = useCallback(
    (required: number): boolean => {
      if (!credits) return false;
      if (credits.plan === 'surbee_enterprise') return true;
      return credits.creditsRemaining >= required;
    },
    [credits]
  );

  const percentUsed = credits
    ? credits.monthlyCredits > 0
      ? Math.round(
          ((credits.monthlyCredits - credits.creditsRemaining) /
            credits.monthlyCredits) *
            100
        )
      : 0
    : 0;

  const isLow = credits
    ? credits.creditsRemaining < credits.monthlyCredits * 0.2
    : false;

  return {
    credits,
    usage,
    loading,
    error,
    refresh: fetchCredits,
    hasEnoughCredits,
    percentUsed,
    isLow,
  };
}

/**
 * Hook to check if a specific feature is available
 */
export function useFeatureAccess(feature: string): {
  hasAccess: boolean;
  loading: boolean;
  reason?: string;
} {
  const { credits, loading } = useCredits();

  if (loading || !credits) {
    return { hasAccess: false, loading: true };
  }

  // Feature availability by plan
  const featuresByPlan: Record<string, string[]> = {
    free_user: ['cipherBasic'],
    surbee_pro: ['cipherBasic', 'premiumModels', 'agentMode', 'evaluation', 'brandingRemoval', 'allExports'],
    surbee_max: ['cipherBasic', 'cipherFull', 'premiumModels', 'agentMode', 'evaluation', 'brandingRemoval', 'allExports', 'customDomain'],
    surbee_enterprise: ['cipherBasic', 'cipherFull', 'premiumModels', 'agentMode', 'evaluation', 'brandingRemoval', 'allExports', 'customDomain', 'apiAccess'],
  };

  const planFeatures = featuresByPlan[credits.plan] || [];
  const hasAccess = planFeatures.includes(feature);

  return {
    hasAccess,
    loading: false,
    reason: hasAccess ? undefined : `Upgrade to access this feature`,
  };
}

/**
 * Credit costs for display in UI
 */
export const CREDIT_COSTS_DISPLAY = {
  // Dashboard Chat
  'Dashboard Chat (Claude Haiku)': 3,
  'Dashboard Chat (GPT-5)': 10,
  'Dashboard Chat (Lema)': 5,

  // Survey Generation
  'Survey Generation (Simple)': 20,
  'Survey Generation (Medium)': 35,
  'Survey Generation (Complex)': 50,

  // Agent Mode
  'Agent Mode (Quick)': 25,
  'Agent Mode (Standard)': 60,
  'Agent Mode (Complex)': 120,

  // Cipher
  'Cipher Analysis (Basic)': 10,
  'Cipher Analysis (Full)': 20,
  'Cipher Monitoring': 30,

  // Evaluation
  'Evaluation (Single)': 20,
  'Evaluation (Multi)': 35,

  // Chart
  'Chart Generation': 10,
};
