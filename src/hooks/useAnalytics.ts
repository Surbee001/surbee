"use client";

import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

// Generate a unique session ID for this browser session
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

interface TrackEventOptions {
  eventName: string;
  eventCategory: 'navigation' | 'feature' | 'survey' | 'interaction' | 'error' | 'performance';
  eventData?: Record<string, unknown>;
}

interface AnalyticsEvent extends TrackEventOptions {
  sessionId: string;
  pagePath: string;
}

// Buffer for batching events
let eventBuffer: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

const flushEvents = async (userId?: string) => {
  if (eventBuffer.length === 0) return;

  const eventsToSend = [...eventBuffer];
  eventBuffer = [];

  try {
    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        events: eventsToSend,
      }),
    });
  } catch (error) {
    console.error('Failed to send analytics events:', error);
    // Re-add events to buffer on failure (up to a limit)
    if (eventBuffer.length < 50) {
      eventBuffer = [...eventsToSend, ...eventBuffer];
    }
  }
};

export function useAnalytics() {
  const { user } = useAuth();
  const userIdRef = useRef(user?.id);

  // Keep userId ref updated
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  // Flush events when component unmounts or page unloads
  useEffect(() => {
    const handleUnload = () => {
      if (eventBuffer.length > 0) {
        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({
          userId: userIdRef.current,
          events: eventBuffer,
        });
        navigator.sendBeacon?.('/api/analytics/events', data);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      flushEvents(userIdRef.current);
    };
  }, []);

  const trackEvent = useCallback(({
    eventName,
    eventCategory,
    eventData = {},
  }: TrackEventOptions) => {
    // Don't track if window is not available (SSR)
    if (typeof window === 'undefined') return;

    const event: AnalyticsEvent = {
      eventName,
      eventCategory,
      eventData,
      sessionId: getSessionId(),
      pagePath: window.location.pathname,
    };

    eventBuffer.push(event);

    // Debounce flush to batch multiple events
    if (flushTimeout) {
      clearTimeout(flushTimeout);
    }
    flushTimeout = setTimeout(() => {
      flushEvents(userIdRef.current);
      flushTimeout = null;
    }, 1000); // Flush after 1 second of inactivity
  }, []);

  // Convenience methods for common event types
  const trackPageView = useCallback((pageName?: string) => {
    trackEvent({
      eventName: 'page_view',
      eventCategory: 'navigation',
      eventData: { pageName },
    });
  }, [trackEvent]);

  const trackFeatureUsage = useCallback((featureName: string, details?: Record<string, unknown>) => {
    trackEvent({
      eventName: featureName,
      eventCategory: 'feature',
      eventData: details,
    });
  }, [trackEvent]);

  const trackSurveyEvent = useCallback((action: string, surveyId?: string, details?: Record<string, unknown>) => {
    trackEvent({
      eventName: `survey_${action}`,
      eventCategory: 'survey',
      eventData: { surveyId, ...details },
    });
  }, [trackEvent]);

  const trackInteraction = useCallback((interactionType: string, target?: string, details?: Record<string, unknown>) => {
    trackEvent({
      eventName: interactionType,
      eventCategory: 'interaction',
      eventData: { target, ...details },
    });
  }, [trackEvent]);

  const trackError = useCallback((errorType: string, errorMessage: string, details?: Record<string, unknown>) => {
    trackEvent({
      eventName: errorType,
      eventCategory: 'error',
      eventData: { errorMessage, ...details },
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackFeatureUsage,
    trackSurveyEvent,
    trackInteraction,
    trackError,
  };
}

// Export types for consumers
export type { TrackEventOptions };
