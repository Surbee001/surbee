'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserCredits {
  creditsRemaining: number;
  monthlyCredits: number;
  apiCreditsRemaining: number;
  apiCreditsMonthly: number;
  creditsResetAt: string;
  plan: 'free_user' | 'surbee_pro' | 'surbee_max' | 'surbee_enterprise';
}

export interface Subscription {
  plan: string;
  status: string;
}

export interface RecentChat {
  id: string;
  title: string;
  type: 'dashboard' | 'project';
  timestamp: string;
  projectId?: string;
  chatId?: string;
  isStarred?: boolean;
}

export interface CachedProject {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  preview_image_url?: string;
  previewImage?: string;
  published_url?: string;
  active_chat_session_id?: string;
  responseCount?: number;
}

interface UserState {
  // Hydration tracking
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Credits & Subscription
  credits: UserCredits | null;
  creditsLastFetched: number | null;
  subscription: Subscription | null;
  subscriptionLastFetched: number | null;

  // Recent chats cache
  recentChats: RecentChat[];
  recentChatsLastFetched: number | null;

  // Projects cache
  projects: CachedProject[];
  projectsLastFetched: number | null;

  // Actions
  setCredits: (credits: UserCredits) => void;
  setSubscription: (subscription: Subscription) => void;
  setRecentChats: (chats: RecentChat[]) => void;
  setProjects: (projects: CachedProject[]) => void;
  updateProject: (projectId: string, updates: Partial<CachedProject>) => void;
  addProject: (project: CachedProject) => void;
  removeProject: (projectId: string) => void;
  clearCache: () => void;

  // Helper to check if cache is stale (older than 5 minutes)
  isCreditsCacheStale: () => boolean;
  isSubscriptionCacheStale: () => boolean;
  isChatsCacheStale: () => boolean;
  isProjectsCacheStale: () => boolean;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Hydration state
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // Initial state
      credits: null,
      creditsLastFetched: null,
      subscription: null,
      subscriptionLastFetched: null,
      recentChats: [],
      recentChatsLastFetched: null,
      projects: [],
      projectsLastFetched: null,

      // Actions
      setCredits: (credits) => set({
        credits,
        creditsLastFetched: Date.now()
      }),

      setSubscription: (subscription) => set({
        subscription,
        subscriptionLastFetched: Date.now()
      }),

      setRecentChats: (chats) => set({
        recentChats: chats,
        recentChatsLastFetched: Date.now()
      }),

      setProjects: (projects) => set({
        projects,
        projectsLastFetched: Date.now()
      }),

      updateProject: (projectId, updates) => set((state) => ({
        projects: state.projects.map(p =>
          p.id === projectId ? { ...p, ...updates } : p
        )
      })),

      addProject: (project) => set((state) => ({
        projects: [project, ...state.projects],
        projectsLastFetched: Date.now()
      })),

      removeProject: (projectId) => set((state) => ({
        projects: state.projects.filter(p => p.id !== projectId)
      })),

      clearCache: () => set({
        credits: null,
        creditsLastFetched: null,
        subscription: null,
        subscriptionLastFetched: null,
        recentChats: [],
        recentChatsLastFetched: null,
        projects: [],
        projectsLastFetched: null,
      }),

      // Cache staleness checks
      isCreditsCacheStale: () => {
        const { creditsLastFetched } = get();
        if (!creditsLastFetched) return true;
        return Date.now() - creditsLastFetched > CACHE_TTL;
      },

      isSubscriptionCacheStale: () => {
        const { subscriptionLastFetched } = get();
        if (!subscriptionLastFetched) return true;
        return Date.now() - subscriptionLastFetched > CACHE_TTL;
      },

      isChatsCacheStale: () => {
        const { recentChatsLastFetched } = get();
        if (!recentChatsLastFetched) return true;
        return Date.now() - recentChatsLastFetched > CACHE_TTL;
      },

      isProjectsCacheStale: () => {
        const { projectsLastFetched } = get();
        if (!projectsLastFetched) return true;
        return Date.now() - projectsLastFetched > CACHE_TTL;
      },
    }),
    {
      name: 'surbee-user-store',
      storage: createJSONStorage(() => localStorage),
      // Only persist these fields
      partialize: (state) => ({
        credits: state.credits,
        creditsLastFetched: state.creditsLastFetched,
        subscription: state.subscription,
        subscriptionLastFetched: state.subscriptionLastFetched,
        recentChats: state.recentChats,
        recentChatsLastFetched: state.recentChatsLastFetched,
        projects: state.projects,
        projectsLastFetched: state.projectsLastFetched,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Hook to wait for hydration
export const useHasHydrated = () => {
  return useUserStore((state) => state._hasHydrated);
};

// Helper hook to get plan display name
export function getPlanDisplayName(plan: UserCredits['plan'] | string): string {
  const names: Record<string, string> = {
    free_user: 'Free',
    free: 'Free',
    surbee_pro: 'Pro',
    pro: 'Pro',
    surbee_max: 'Max',
    max: 'Max',
    surbee_enterprise: 'Enterprise',
    enterprise: 'Enterprise',
  };
  return names[plan] || 'Free';
}

// Helper to check if user is on a paid plan
export function isPaidPlan(plan: UserCredits['plan'] | string): boolean {
  return !['free_user', 'free'].includes(plan);
}

// Helper to check if user can upgrade (not on Max or Enterprise)
export function canUpgradePlan(plan: UserCredits['plan'] | string): boolean {
  return !['max', 'surbee_max', 'enterprise', 'surbee_enterprise'].includes(plan);
}
