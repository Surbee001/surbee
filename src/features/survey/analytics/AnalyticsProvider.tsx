"use client"
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import type { AnalyticsConfig } from '@/lib/surbee/survey-types'

interface AnalyticsCtxValue {
  trackInteraction: (name: string, props?: Record<string, any>) => void
  trackTiming: (questionId: string, ms: number) => void
  trackCompletion: (props?: Record<string, any>) => void
}

const AnalyticsCtx = createContext<AnalyticsCtxValue | null>(null)

export interface AnalyticsProviderProps extends PropsWithChildren {
  trackingConfig: AnalyticsConfig
}

export function AnalyticsProvider({ children, trackingConfig }: AnalyticsProviderProps) {
  const value = useMemo<AnalyticsCtxValue>(() => {
    const emit = (event: string, props?: Record<string, any>) => {
      if (typeof window !== 'undefined') {
        // posthog if available
        const ph = (window as any).posthog
        if (ph?.capture) return ph.capture(event, props)
      }
      // fallback
      if (process.env.NODE_ENV !== 'production') console.debug('[analytics]', event, props)
    }
    return {
      trackInteraction: (name, props) => emit(name, props),
      trackTiming: (questionId, ms) => emit('question_timing', { questionId, ms }),
      trackCompletion: (props) => emit('survey_completed', props),
    }
  }, [trackingConfig])
  return <AnalyticsCtx.Provider value={value}>{children}</AnalyticsCtx.Provider>
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsCtx)
  if (!ctx) throw new Error('useAnalytics must be used within AnalyticsProvider')
  return ctx
}

