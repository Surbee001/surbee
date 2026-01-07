'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import Script from 'next/script'
import { useCookieConsent, type ConsentState, type ConsentCategory } from '@/hooks/useCookieConsent'

// ============================================================================
// CONFIGURATION - Add your tracking IDs here
// ============================================================================

const TRACKING_CONFIG = {
  // Google Analytics 4
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA_ID || '', // e.g., 'G-XXXXXXXXXX'

  // Google Tag Manager (alternative to direct GA)
  googleTagManagerId: process.env.NEXT_PUBLIC_GTM_ID || '', // e.g., 'GTM-XXXXXXX'

  // Facebook Pixel
  facebookPixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '', // e.g., 'XXXXXXXXXXXXXXX'

  // Hotjar
  hotjarId: process.env.NEXT_PUBLIC_HOTJAR_ID || '', // e.g., 'XXXXXXX'

  // Mixpanel
  mixpanelToken: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || '', // e.g., 'xxxxx'
}

// ============================================================================
// Context Types
// ============================================================================

interface CookieConsentContextType {
  consent: ConsentState
  hasConsent: (category: ConsentCategory) => boolean
  isLoaded: boolean
  trackEvent: (eventName: string, properties?: Record<string, unknown>) => void
  trackPageView: (pagePath?: string) => void
}

const CookieConsentContext = createContext<CookieConsentContextType | null>(null)

// ============================================================================
// Provider Component
// ============================================================================

interface CookieConsentProviderProps {
  children: ReactNode
}

export function CookieConsentProvider({ children }: CookieConsentProviderProps) {
  const { consent, hasConsent, isLoaded } = useCookieConsent()
  const [scriptsLoaded, setScriptsLoaded] = useState({
    ga: false,
    gtm: false,
    fbPixel: false,
    hotjar: false,
  })

  // Track page views when consent changes or on mount
  useEffect(() => {
    if (!isLoaded) return

    // Initial page view tracking
    if (hasConsent('Analytics')) {
      trackPageViewInternal()
    }
  }, [isLoaded, consent.Analytics])

  // Listen for route changes (Next.js App Router)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleRouteChange = () => {
      if (hasConsent('Analytics')) {
        trackPageViewInternal()
      }
    }

    // For App Router, we use a MutationObserver to detect URL changes
    let lastUrl = window.location.href
    const observer = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href
        handleRouteChange()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => observer.disconnect()
  }, [consent.Analytics])

  /**
   * Internal function to track page views across all enabled platforms
   */
  const trackPageViewInternal = useCallback((pagePath?: string) => {
    const path = pagePath || window.location.pathname

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag && TRACKING_CONFIG.googleAnalyticsId) {
      (window as any).gtag('config', TRACKING_CONFIG.googleAnalyticsId, {
        page_path: path,
      })
    }

    // Facebook Pixel
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView')
    }
  }, [])

  /**
   * Track a custom event across all enabled platforms
   */
  const trackEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    if (!hasConsent('Analytics')) {
      return
    }

    // Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, properties)
    }

    // Facebook Pixel (for marketing events)
    if (hasConsent('Marketing') && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('trackCustom', eventName, properties)
    }
  }, [hasConsent])

  /**
   * Manually track a page view
   */
  const trackPageView = useCallback((pagePath?: string) => {
    if (!hasConsent('Analytics')) {
      return
    }
    trackPageViewInternal(pagePath)
  }, [hasConsent, trackPageViewInternal])

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsent,
        isLoaded,
        trackEvent,
        trackPageView,
      }}
    >
      {children}

      {/* ================================================================== */}
      {/* TRACKING SCRIPTS - Only loaded when consent is given              */}
      {/* ================================================================== */}

      {/* Google Analytics 4 */}
      {isLoaded && hasConsent('Analytics') && TRACKING_CONFIG.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${TRACKING_CONFIG.googleAnalyticsId}`}
            strategy="afterInteractive"
            onLoad={() => setScriptsLoaded(prev => ({ ...prev, ga: true }))}
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${TRACKING_CONFIG.googleAnalyticsId}', {
                page_path: window.location.pathname,
                anonymize_ip: true
              });
            `}
          </Script>
        </>
      )}

      {/* Google Tag Manager (if you prefer GTM over direct GA) */}
      {isLoaded && hasConsent('Analytics') && TRACKING_CONFIG.googleTagManagerId && (
        <>
          <Script id="gtm-script" strategy="afterInteractive">
            {`
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${TRACKING_CONFIG.googleTagManagerId}');
            `}
          </Script>
        </>
      )}

      {/* Facebook Pixel */}
      {isLoaded && hasConsent('Marketing') && TRACKING_CONFIG.facebookPixelId && (
        <Script id="facebook-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${TRACKING_CONFIG.facebookPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* Hotjar */}
      {isLoaded && hasConsent('Analytics') && TRACKING_CONFIG.hotjarId && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${TRACKING_CONFIG.hotjarId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}
    </CookieConsentContext.Provider>
  )
}

// ============================================================================
// Hook
// ============================================================================

export function useCookieConsentContext() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsentContext must be used within a CookieConsentProvider')
  }
  return context
}
