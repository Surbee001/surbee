"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AnalyticsConsentModal } from '@/components/analytics/AnalyticsConsentModal';

interface AnalyticsContextType {
  consent: boolean | null;
  isLoading: boolean;
  updateConsent: (consent: boolean) => Promise<void>;
  showConsentModal: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  consent: null,
  isLoading: true,
  updateConsent: async () => {},
  showConsentModal: () => {},
});

export function useAnalyticsConsent() {
  return useContext(AnalyticsContext);
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, hasCompletedOnboarding } = useAuth();
  const [consent, setConsent] = useState<boolean | null>(null);
  const [lastAskedAt, setLastAskedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch consent status from Supabase when user logs in
  useEffect(() => {
    const fetchConsent = async () => {
      // Don't do anything while auth is still loading
      if (authLoading) {
        return;
      }

      // If no user, we're done loading (no consent to fetch)
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/analytics/consent?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setConsent(data.consent);
          setLastAskedAt(data.lastAskedAt);
        } else {
          console.error('Analytics consent fetch failed:', response.status);
        }
      } catch (err) {
        console.error('Error fetching analytics consent:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsent();
  }, [user?.id, authLoading]);

  // Show modal once per day if user hasn't made a decision
  // Only show after user has completed onboarding
  useEffect(() => {
    if (isLoading || authLoading || !user?.id) {
      return;
    }

    // Don't show modal until onboarding is complete
    if (!hasCompletedOnboarding) {
      return;
    }

    // If user has already made a decision (consent is true or false), don't show modal
    if (consent !== null) {
      return;
    }

    // Check if we've asked within the last day
    if (lastAskedAt) {
      const lastAskedTime = new Date(lastAskedAt).getTime();
      const now = Date.now();
      if (now - lastAskedTime < ONE_DAY_MS) {
        return; // Don't show again within 24 hours
      }
    }

    // Small delay to let the page load first
    const timer = setTimeout(() => {
      setShowModal(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [consent, lastAskedAt, isLoading, authLoading, user?.id, hasCompletedOnboarding]);

  const updateConsent = useCallback(async (newConsent: boolean) => {
    if (!user?.id) {
      return;
    }

    // Close modal immediately and set consent optimistically
    setConsent(newConsent);
    setShowModal(false);

    // Persist to Supabase
    try {
      const response = await fetch('/api/analytics/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          consent: newConsent,
        }),
      });
      if (!response.ok) {
        console.error('Error saving analytics consent:', response.status);
      }
    } catch (err) {
      console.error('Error saving analytics consent:', err);
    }
  }, [user?.id]);

  const handleClose = useCallback(async () => {
    // When user closes without making a decision, mark that we asked
    if (!user?.id) {
      setShowModal(false);
      return;
    }

    try {
      await fetch('/api/analytics/consent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      setLastAskedAt(new Date().toISOString());
    } catch {
      // Mark consent request failed, will try again later
    }

    setShowModal(false);
  }, [user?.id]);

  const handleAccept = useCallback(() => {
    updateConsent(true);
  }, [updateConsent]);

  const handleDecline = useCallback(() => {
    updateConsent(false);
  }, [updateConsent]);

  const showConsentModal = useCallback(() => {
    setShowModal(true);
  }, []);

  return (
    <AnalyticsContext.Provider
      value={{
        consent,
        isLoading,
        updateConsent,
        showConsentModal,
      }}
    >
      {children}
      <AnalyticsConsentModal
        isOpen={showModal}
        onClose={handleClose}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </AnalyticsContext.Provider>
  );
}
