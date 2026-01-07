'use client'

import { useState, useEffect, useCallback } from 'react'

export type ConsentState = {
  Necessary: boolean
  Preferences: boolean
  Analytics: boolean
  Marketing: boolean
}

export type ConsentCategory = keyof ConsentState

const defaultConsent: ConsentState = {
  Necessary: true,
  Preferences: false,
  Analytics: false,
  Marketing: false,
}

const STORAGE_KEY = 'cookieConsent'

/**
 * Hook to read and react to cookie consent state from the Framer cookie banner
 *
 * Usage:
 * ```tsx
 * const { consent, hasConsent, isLoaded } = useCookieConsent()
 *
 * if (hasConsent('Analytics')) {
 *   // Load Google Analytics
 * }
 *
 * if (hasConsent('Marketing')) {
 *   // Load Facebook Pixel
 * }
 * ```
 */
export function useCookieConsent() {
  const [consent, setConsent] = useState<ConsentState>(defaultConsent)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load consent from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setConsent({
          Necessary: true, // Always true
          Preferences: parsed.Preferences ?? false,
          Analytics: parsed.Analytics ?? false,
          Marketing: parsed.Marketing ?? false,
        })
      }
    } catch (e) {
      console.error('[CookieConsent] Failed to parse stored consent:', e)
    }
    setIsLoaded(true)
  }, [])

  // Listen for consent updates from the Framer cookie banner
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleConsentUpdate = (event: CustomEvent<ConsentState>) => {
      console.log('[CookieConsent] Consent updated:', event.detail)
      setConsent({
        Necessary: true,
        Preferences: event.detail.Preferences ?? false,
        Analytics: event.detail.Analytics ?? false,
        Marketing: event.detail.Marketing ?? false,
      })
    }

    window.addEventListener('cookieConsentUpdate', handleConsentUpdate as EventListener)
    return () => {
      window.removeEventListener('cookieConsentUpdate', handleConsentUpdate as EventListener)
    }
  }, [])

  const hasConsent = useCallback((category: ConsentCategory): boolean => {
    return consent[category] === true
  }, [consent])

  const hasAnyConsent = useCallback((): boolean => {
    return consent.Preferences || consent.Analytics || consent.Marketing
  }, [consent])

  return {
    consent,
    hasConsent,
    hasAnyConsent,
    isLoaded,
  }
}

/**
 * Get consent state synchronously (for non-React contexts)
 */
export function getConsentState(): ConsentState {
  if (typeof window === 'undefined') return defaultConsent

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        Necessary: true,
        Preferences: parsed.Preferences ?? false,
        Analytics: parsed.Analytics ?? false,
        Marketing: parsed.Marketing ?? false,
      }
    }
  } catch {
    // Ignore errors
  }
  return defaultConsent
}

/**
 * Check if a specific consent category is enabled (for non-React contexts)
 */
export function checkConsent(category: ConsentCategory): boolean {
  return getConsentState()[category] === true
}
