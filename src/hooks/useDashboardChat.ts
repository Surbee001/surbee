'use client';

import { useCallback } from 'react';

export interface DashboardChatContext {
  messages: any[];
  selectedSurveyId: string | null;
  model: string;
  timestamp: number;
}

const STORAGE_KEY = 'surbee_dashboard_chat_context';
const EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes

export function useDashboardChat() {
  const saveChatContext = useCallback((context: Omit<DashboardChatContext, 'timestamp'>) => {
    try {
      const contextWithTimestamp: DashboardChatContext = {
        ...context,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(contextWithTimestamp));
    } catch (e) {
      console.error('Failed to save dashboard chat context:', e);
    }
  }, []);

  const loadChatContext = useCallback((): DashboardChatContext | null => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (!stored) return null;

      const context: DashboardChatContext = JSON.parse(stored);

      // Check if context has expired
      if (Date.now() - context.timestamp > EXPIRATION_MS) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return context;
    } catch (e) {
      console.error('Failed to load dashboard chat context:', e);
      return null;
    }
  }, []);

  const clearChatContext = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear dashboard chat context:', e);
    }
  }, []);

  return {
    saveChatContext,
    loadChatContext,
    clearChatContext,
  };
}
