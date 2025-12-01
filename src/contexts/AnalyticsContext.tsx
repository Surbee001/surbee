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
  const { user, loading: authLoading } = useAuth();
  const [consent, setConsent] = useState<boolean | null>(null);
  const [lastAskedAt, setLastAskedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Fetch consent status when user logs in
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
          console.log('[Analytics] Fetched consent:', data);
          setConsent(data.consent);
          setLastAskedAt(data.lastAskedAt);
        } else {
          console.error('[Analytics] Failed to fetch consent, status:', response.status);
        }
      } catch (error) {
        console.error('[Analytics] Failed to fetch consent status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConsent();
  }, [user?.id, authLoading]);

  // Show modal once per day if user hasn't made a decision
  useEffect(() => {
    console.log('[Analytics] Modal check - isLoading:', isLoading, 'authLoading:', authLoading, 'userId:', user?.id, 'consent:', consent);

    if (isLoading || authLoading || !user?.id) {
      console.log('[Analytics] Skipping modal - still loading or no user');
      return;
    }

    // If user has already made a decision (consent is true or false), don't show modal
    if (consent !== null) {
      console.log('[Analytics] User already made a decision, consent:', consent);
      return;
    }

    // Check if we've asked within the last day
    if (lastAskedAt) {
      const lastAskedTime = new Date(lastAskedAt).getTime();
      const now = Date.now();
      if (now - lastAskedTime < ONE_DAY_MS) {
        console.log('[Analytics] Already asked within 24 hours, not showing modal');
        return; // Don't show again within 24 hours
      }
    }

    console.log('[Analytics] Will show modal in 2 seconds');
    // Small delay to let the page load first
    const timer = setTimeout(() => {
      console.log('[Analytics] Showing modal now');
      setShowModal(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [consent, lastAskedAt, isLoading, authLoading, user?.id]);

  const updateConsent = useCallback(async (newConsent: boolean) => {
    if (!user?.id) {
      console.error('[Analytics] Cannot update consent - no user ID');
      return;
    }

    console.log('[Analytics] Updating consent to:', newConsent, 'for user:', user.id);

    try {
      const response = await fetch('/api/analytics/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          consent: newConsent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Analytics] Consent updated successfully:', data);
        setConsent(newConsent);
        setShowModal(false);
      } else {
        console.error('[Analytics] Failed to update consent, status:', response.status);
      }
    } catch (error) {
      console.error('[Analytics] Failed to update consent:', error);
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
    } catch (error) {
      console.error('Failed to mark consent as asked:', error);
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
