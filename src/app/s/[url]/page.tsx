"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { WebContainerPreview } from '@/components/sandbox/WebContainerPreview'
import type { CipherTier } from '@/lib/cipher/tier-config'
import {
  subscribeToSettingsUpdates,
  type CipherSettings as BridgeCipherSettings,
  type SurveyToParentMessage,
  isSurveyMessage,
} from '@/lib/survey-bridge'

interface SandboxBundle {
  files: Record<string, string>
  entry: string
  dependencies?: string[]
  devDependencies?: string[]
}

interface SurveySettings {
  passwordProtected: boolean
  showThankYouPage: boolean
  thankYouMessage: string
  redirectUrl: string | null
}

interface SurveyClosure {
  closed: true
  closureReason: 'expired' | 'limit_reached'
  closureDate?: string
  maxResponses?: number
  title: string
}

interface PublishedSurvey {
  id: string
  title: string
  description?: string
  sandbox_bundle?: SandboxBundle
  survey_schema?: any
  published_at: string
  settings?: SurveySettings
}

interface CipherSettings {
  enabled: boolean
  tier: CipherTier
  sessionResume: boolean
  resumeWindowHours: number
  flagThreshold: number
  blockThreshold: number
}

interface BehavioralMetrics {
  mouseMovements: any[]
  keystrokeDynamics: any[]
  responseTime: number[]
  deviceFingerprint?: any
}

interface RealTimeMetrics {
  lastUpdate: number
  questionIndex: number
  metricsSnapshot: any | null
  questionAnswers: Array<{ questionId: string; timing: number }>
}

export default function PublishedSurveyPage() {
  const params = useParams()
  const publishedUrl = params.url as string
  const { user } = useAuth()
  const [survey, setSurvey] = useState<PublishedSurvey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const [closure, setClosure] = useState<SurveyClosure | null>(null)

  // Password protection state
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [passwordVerified, setPasswordVerified] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [verifyingPassword, setVerifyingPassword] = useState(false)

  // Cipher integration state
  const [cipherSettings, setCipherSettings] = useState<CipherSettings | null>(null)
  const sessionIdRef = useRef<string>(crypto.randomUUID())

  // Iframe reference for sending messages
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  // Real-time metrics accumulator
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    lastUpdate: 0,
    questionIndex: 0,
    metricsSnapshot: null,
    questionAnswers: [],
  })

  // Handle iframe ready callback
  const handleIframeReady = useCallback((iframe: HTMLIFrameElement | null) => {
    iframeRef.current = iframe
    // If we have cipher settings, send initialization to the iframe
    // This handles the case where CIPHER_LOADED was sent before we got the iframe ref
    if (iframe && survey?.id && cipherSettings) {
      // Small delay to ensure the cipher script is ready
      setTimeout(() => {
        iframe.contentWindow?.postMessage({
          type: 'CIPHER_INIT',
          config: {
            enabled: cipherSettings.enabled,
            projectId: survey.id,
            tier: cipherSettings.tier,
            sessionId: sessionIdRef.current,
            resumeEnabled: cipherSettings.sessionResume,
            resumeWindowHours: cipherSettings.resumeWindowHours,
            metricsInterval: 10000,
            saveInterval: 5000,
          },
        }, '*')
      }, 100)
    }
  }, [survey?.id, cipherSettings])

  // Forward settings updates to iframe
  const forwardSettingsToIframe = useCallback((settings: BridgeCipherSettings) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'SETTINGS_UPDATE',
        settings,
        timestamp: Date.now(),
      }, '*')
    }
  }, [])

  // Fetch survey and cipher settings
  useEffect(() => {
    const fetchSurvey = async () => {
      if (!publishedUrl) return

      try {
        setLoading(true)

        // Fetch survey and cipher settings in parallel
        const [surveyRes, cipherRes] = await Promise.all([
          fetch(`/api/surveys/published/${publishedUrl}`),
          fetch(`/api/surveys/published/${publishedUrl}/cipher-settings`).catch(() => null),
        ])

        if (!surveyRes.ok) {
          const errorData = await surveyRes.json().catch(() => ({}))
          console.error('=== SHARED SURVEY: API error ===', surveyRes.status, errorData)

          const apiError = errorData.error || errorData.message
          if (apiError) {
            setError(apiError)
          } else if (surveyRes.status === 404) {
            setError('This survey is not available. It may not be published yet or the link may be incorrect.')
          } else {
            setError('Failed to load survey')
          }
          return
        }

        const surveyData = await surveyRes.json()

        // Check if survey is closed
        if (surveyData.closed) {
          setClosure(surveyData as SurveyClosure)
          setLoading(false)
          return
        }

        setSurvey(surveyData)

        // Check if password protection is enabled
        if (surveyData.settings?.passwordProtected) {
          setPasswordRequired(true)
        }

        // Load cipher settings (use defaults if not available)
        if (cipherRes && cipherRes.ok) {
          const cipherData = await cipherRes.json()
          setCipherSettings(cipherData)
        } else {
          // Default cipher settings
          setCipherSettings({
            enabled: true,
            tier: 3,
            sessionResume: true,
            resumeWindowHours: 48,
            flagThreshold: 0.6,
            blockThreshold: 0.85,
          })
        }
      } catch (err) {
        console.error('Error loading survey:', err)
        setError('Failed to load survey')
      } finally {
        setLoading(false)
      }
    }

    fetchSurvey()
  }, [publishedUrl])

  // Subscribe to BroadcastChannel for settings updates (Phase 5)
  useEffect(() => {
    if (!survey?.id) return

    // Subscribe to settings updates from the dashboard
    const unsubscribe = subscribeToSettingsUpdates(survey.id, (newSettings) => {
      // Update local cipher settings state
      setCipherSettings(prev => prev ? {
        ...prev,
        enabled: newSettings.enabled,
        tier: newSettings.tier,
        sessionResume: newSettings.sessionResume ?? prev.sessionResume,
        resumeWindowHours: newSettings.resumeWindowHours ?? prev.resumeWindowHours,
        flagThreshold: newSettings.flagThreshold ?? prev.flagThreshold,
        blockThreshold: newSettings.blockThreshold ?? prev.blockThreshold,
      } : null)

      // Forward settings to iframe
      forwardSettingsToIframe(newSettings)
    })

    return unsubscribe
  }, [survey?.id, forwardSettingsToIframe])

  // Send Cipher initialization to iframe
  const initializeCipherInIframe = useCallback(() => {
    if (!iframeRef.current?.contentWindow || !survey?.id) return

    const config = {
      enabled: cipherSettings?.enabled ?? true,
      projectId: survey.id,
      tier: cipherSettings?.tier ?? 3,
      sessionId: sessionIdRef.current,
      resumeEnabled: cipherSettings?.sessionResume ?? true,
      resumeWindowHours: cipherSettings?.resumeWindowHours ?? 48,
      metricsInterval: 10000,
      saveInterval: 5000,
    }

    iframeRef.current.contentWindow.postMessage({
      type: 'CIPHER_INIT',
      config,
    }, '*')
  }, [survey?.id, cipherSettings])

  // Listen for messages from the sandbox iframe (for form submissions and real-time metrics)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const messageType = event.data?.type

      // Handle Cipher script loaded - send initialization config
      if (messageType === 'CIPHER_LOADED') {
        initializeCipherInIframe()
      }

      // Handle Cipher ready confirmation
      if (messageType === 'CIPHER_READY') {
        console.log('[Survey] Cipher tracker initialized:', event.data.sessionId)
      }

      // Handle real-time metrics updates from iframe
      if (messageType === 'METRICS_UPDATE' || messageType === 'CIPHER_METRICS') {
        const metrics = event.data.metrics
        if (metrics) {
          setRealTimeMetrics(prev => ({
            ...prev,
            lastUpdate: Date.now(),
            metricsSnapshot: metrics,
          }))
        }
      }

      // Handle question answered events
      if (messageType === 'QUESTION_ANSWERED') {
        const { questionId, questionIndex, timing } = event.data
        setRealTimeMetrics(prev => ({
          ...prev,
          questionIndex: questionIndex ?? prev.questionIndex,
          questionAnswers: [
            ...prev.questionAnswers,
            { questionId, timing },
          ],
        }))
      }

      // Handle page change events
      if (messageType === 'PAGE_CHANGE') {
        const { pageIndex } = event.data
        setRealTimeMetrics(prev => ({
          ...prev,
          questionIndex: pageIndex,
        }))
      }

      // Handle survey completion from iframe
      if (messageType === 'SURVEY_COMPLETE' || messageType === 'survey-response') {
        const responses = event.data.responses || event.data.data
        const metrics = event.data.behavioralMetrics as BehavioralMetrics | undefined

        if (survey?.id && responses) {
          try {
            // Submit response with behavioral metrics
            await fetch(`/api/projects/${survey.id}/responses`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                responses,
                completed_at: new Date().toISOString(),
                user_id: user?.id || null,
                is_preview: false,
                session_id: sessionIdRef.current,
                // Include behavioral metrics for fraud detection
                mouse_data: metrics?.mouseMovements?.slice(-100),
                keystroke_data: metrics?.keystrokeDynamics?.slice(-50),
                timing_data: metrics?.responseTime,
                device_data: metrics?.deviceFingerprint,
              }),
            })

            // Run fraud assessment if cipher is enabled
            if (cipherSettings?.enabled && metrics) {
              try {
                const assessmentRes = await fetch('/api/surbee/fraud/tiered-assess', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    tier: cipherSettings.tier,
                    responses,
                    behavioralMetrics: metrics,
                    projectId: survey.id,
                    sessionId: sessionIdRef.current,
                  }),
                })

                if (assessmentRes.ok) {
                  const assessment = await assessmentRes.json()

                  // Update response with fraud score and contradictions
                  if (assessment.overallRiskScore > 0 || assessment.findings?.contradictions?.hasContradictions) {
                    await fetch(`/api/projects/${survey.id}/responses/update-fraud`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        session_id: sessionIdRef.current,
                        fraud_score: assessment.overallRiskScore,
                        is_flagged: assessment.overallRiskScore >= cipherSettings.flagThreshold,
                        flag_reasons: assessment.flags,
                        // Include contradiction data if available
                        contradictions: assessment.findings?.contradictions,
                        consistency_score: assessment.findings?.contradictions?.consistencyScore,
                      }),
                    }).catch(() => {
                      // Silent fail - fraud update is non-critical
                    })
                  }
                }
              } catch (err) {
                console.error('Fraud assessment error:', err)
              }
            }
          } catch (err) {
            console.error('Error saving response:', err)
          }
        }

        setIsCompleted(true)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [survey?.id, user?.id, cipherSettings, initializeCipherInIframe])

  // Handle redirect after completion
  useEffect(() => {
    if (isCompleted && survey?.settings?.redirectUrl) {
      // Wait a moment to show thank you, then redirect
      const timer = setTimeout(() => {
        window.location.href = survey.settings!.redirectUrl!
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCompleted, survey?.settings?.redirectUrl])

  // Password verification handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setPasswordError('Please enter a password')
      return
    }

    setVerifyingPassword(true)
    setPasswordError('')

    try {
      const res = await fetch(`/api/surveys/published/${publishedUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (data.valid) {
        setPasswordVerified(true)
        setPasswordRequired(false)
      } else {
        setPasswordError(data.error || 'Incorrect password')
      }
    } catch (err) {
      setPasswordError('Failed to verify password')
    } finally {
      setVerifyingPassword(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'rgb(19, 19, 20)' }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
            Loading survey...
          </p>
        </div>
      </div>
    )
  }

  // Show survey closed page (expired or limit reached)
  if (closure) {
    const isExpired = closure.closureReason === 'expired'

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'rgb(19, 19, 20)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div className="text-center max-w-md mx-auto">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(232, 232, 232, 0.06)' }}
          >
            {isExpired ? (
              <svg className="w-8 h-8" style={{ color: 'rgba(232, 232, 232, 0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" style={{ color: 'rgba(232, 232, 232, 0.5)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          {/* Title */}
          <h2
            className="text-2xl font-medium mb-3"
            style={{ color: '#E8E8E8' }}
          >
            {isExpired ? 'Survey Closed' : 'Survey Complete'}
          </h2>

          {/* Description */}
          <p
            className="mb-2 leading-relaxed"
            style={{ color: 'rgba(232, 232, 232, 0.6)' }}
          >
            {isExpired
              ? 'This survey has ended and is no longer accepting responses.'
              : 'This survey has reached its response limit and is no longer accepting new submissions.'}
          </p>

          {/* Survey title */}
          {closure.title && (
            <p
              className="text-sm mb-6"
              style={{ color: 'rgba(232, 232, 232, 0.4)' }}
            >
              {closure.title}
            </p>
          )}

          {/* Additional info */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
            style={{
              background: 'rgba(232, 232, 232, 0.04)',
              color: 'rgba(232, 232, 232, 0.5)'
            }}
          >
            {isExpired ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Closed on {new Date(closure.closureDate!).toLocaleDateString()}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{closure.maxResponses} responses collected</span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show error if failed to load
  if (error || !survey) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'rgb(19, 19, 20)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div className="text-center max-w-md mx-auto">
          <h2
            className="text-2xl font-medium mb-4"
            style={{ color: '#E8E8E8' }}
          >
            Survey not found
          </h2>
          <p
            className="mb-8 leading-relaxed text-sm"
            style={{ color: 'rgba(232, 232, 232, 0.6)' }}
          >
            {error || 'This survey is not available. It may not be published yet or the link may be incorrect.'}
          </p>
          <a
            href="https://surbee.dev"
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: '#E8E8E8',
              color: 'rgb(19, 19, 20)'
            }}
          >
            Go to Surbee
          </a>
        </div>
      </div>
    )
  }

  // No sandbox bundle
  if (!survey.sandbox_bundle) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'rgb(19, 19, 20)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div className="text-center max-w-md mx-auto">
          <h2
            className="text-2xl font-medium mb-4"
            style={{ color: '#E8E8E8' }}
          >
            Survey not ready
          </h2>
          <p
            className="mb-8 leading-relaxed text-sm"
            style={{ color: 'rgba(232, 232, 232, 0.6)' }}
          >
            This survey doesn't have any content yet. Please check back later.
          </p>
          <a
            href="https://surbee.dev"
            className="inline-block px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{
              background: '#E8E8E8',
              color: 'rgb(19, 19, 20)'
            }}
          >
            Go to Surbee
          </a>
        </div>
      </div>
    )
  }

  // Show password screen if required
  if (passwordRequired && !passwordVerified) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'rgb(19, 19, 20)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(232, 232, 232, 0.08)' }}
            >
              <svg className="w-6 h-6" style={{ color: 'rgba(232, 232, 232, 0.6)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2
              className="text-xl font-medium mb-2"
              style={{ color: '#E8E8E8' }}
            >
              Password Required
            </h2>
            <p
              className="text-sm"
              style={{ color: 'rgba(232, 232, 232, 0.5)' }}
            >
              This survey is protected. Enter the password to continue.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none focus:ring-2"
                style={{
                  background: 'rgba(232, 232, 232, 0.06)',
                  border: '1px solid rgba(232, 232, 232, 0.1)',
                  color: '#E8E8E8',
                }}
                autoFocus
              />
              {passwordError && (
                <p className="text-red-400 text-sm mt-2">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={verifyingPassword}
              className="w-full py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{
                background: '#E8E8E8',
                color: 'rgb(19, 19, 20)'
              }}
            >
              {verifyingPassword ? 'Verifying...' : 'Access Survey'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Show thank you / completion screen
  if (isCompleted) {
    const showThankYou = survey.settings?.showThankYouPage ?? true
    const thankYouMessage = survey.settings?.thankYouMessage || 'Thank you for completing this survey!'
    const redirectUrl = survey.settings?.redirectUrl

    if (!showThankYou && redirectUrl) {
      // Immediate redirect, show loading
      return (
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'rgb(19, 19, 20)' }}
        >
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
              Redirecting...
            </p>
          </div>
        </div>
      )
    }

    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{
          background: 'rgb(19, 19, 20)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
      >
        <div className="text-center max-w-md mx-auto">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'rgba(34, 197, 94, 0.1)' }}
          >
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2
            className="text-2xl font-medium mb-4"
            style={{ color: '#E8E8E8' }}
          >
            Response Submitted
          </h2>
          <p
            className="mb-6 leading-relaxed"
            style={{ color: 'rgba(232, 232, 232, 0.6)' }}
          >
            {thankYouMessage}
          </p>
          {redirectUrl && (
            <p
              className="text-sm"
              style={{ color: 'rgba(232, 232, 232, 0.4)' }}
            >
              Redirecting you shortly...
            </p>
          )}
        </div>
      </div>
    )
  }

  // Render survey using WebContainer
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <WebContainerPreview
        bundle={survey.sandbox_bundle}
        className="w-full h-full"
        projectId={survey.id}
      />
    </div>
  )
}
