"use client"

import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { generateCipherTrackerScript, type BehavioralMetrics } from '@/lib/cipher/cipher-tracker'
import type { CipherTier } from '@/lib/cipher/tier-config'

interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
  devDependencies?: string[];
}

interface PublishedSurvey {
  id: string
  title: string
  description?: string
  sandbox_bundle?: SandboxBundle
  survey_schema?: any
  published_at: string
}

interface CipherSettings {
  enabled: boolean
  tier: CipherTier
  sessionResume: boolean
  resumeWindowHours: number
  flagThreshold: number
  blockThreshold: number
}

export default function PublishedSurveyPage() {
  const params = useParams()
  const publishedUrl = params.url as string
  const { user } = useAuth()
  const [survey, setSurvey] = useState<PublishedSurvey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Cipher integration state
  const [cipherSettings, setCipherSettings] = useState<CipherSettings | null>(null)
  const [behavioralMetrics, setBehavioralMetrics] = useState<BehavioralMetrics | null>(null)
  const sessionIdRef = useRef<string>(crypto.randomUUID())
  const periodicAnalysisRef = useRef<any[]>([])

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
        setSurvey(surveyData)

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

  // Generate iframe HTML with Cipher tracker injected
  const iframeHtml = useMemo(() => {
    if (!survey?.sandbox_bundle?.files || !cipherSettings) return null

    // Generate base HTML
    const baseHtml = generateSurveyHtml(survey.sandbox_bundle)

    // If cipher is disabled, return base HTML
    if (!cipherSettings.enabled) return baseHtml

    // Generate and inject cipher tracker script
    const trackerScript = generateCipherTrackerScript({
      projectId: survey.id,
      tier: cipherSettings.tier,
      sessionId: sessionIdRef.current,
      resumeEnabled: cipherSettings.sessionResume,
      resumeWindowHours: cipherSettings.resumeWindowHours,
    })

    // Inject tracker script before </body>
    return baseHtml.replace('</body>', `${trackerScript}</body>`)
  }, [survey, cipherSettings])

  // Run periodic analysis for tier 4-5
  const runPeriodicAnalysis = useCallback(async (metrics: BehavioralMetrics) => {
    if (!cipherSettings || cipherSettings.tier < 4 || !survey) return

    const interval = cipherSettings.tier === 5 ? 3 : 5
    const questionsAnswered = metrics.responseTime.length

    // Only analyze at intervals
    if (questionsAnswered === 0 || questionsAnswered % interval !== 0) return

    try {
      const response = await fetch('/api/surbee/fraud/tiered-assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: Math.min(cipherSettings.tier, 3) as CipherTier, // Use lighter analysis for periodic
          responses: {}, // Empty for periodic checks
          behavioralMetrics: metrics,
          projectId: survey.id,
          sessionId: sessionIdRef.current,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        periodicAnalysisRef.current.push(result)
      }
    } catch (err) {
      console.error('Periodic analysis error:', err)
    }
  }, [cipherSettings, survey])

  // Listen for messages from the iframe (for form submissions and Cipher metrics)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const messageType = event.data?.type

      // Handle periodic Cipher metrics
      if (messageType === 'CIPHER_METRICS') {
        const metrics = event.data.metrics as BehavioralMetrics
        setBehavioralMetrics(metrics)

        // Run periodic analysis for higher tiers
        runPeriodicAnalysis(metrics)
        return
      }

      // Handle session restoration notification
      if (messageType === 'CIPHER_SESSION_RESTORED') {
        console.log('Cipher session restored at question:', event.data.questionIndex)
        return
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
  }, [survey?.id, user?.id, cipherSettings, runPeriodicAnalysis])

  // Show nothing during load
  if (loading) {
    return null
  }

  // Render survey in iframe - exactly as designed, full screen
  if (iframeHtml) {
    return (
      <iframe
        ref={iframeRef}
        srcDoc={iframeHtml}
        style={{ width: '100vw', height: '100vh', border: 'none', display: 'block' }}
        title={survey?.title || 'Survey'}
        sandbox="allow-scripts allow-forms allow-same-origin"
      />
    )
  }

  // Only show error if actually failed
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

  return null
}

// Generate standalone HTML for the survey
function generateSurveyHtml(bundle: SandboxBundle): string {
  const files = bundle.files

  // Find the main App component
  let appCode = files['/App.tsx'] || files['App.tsx'] || files['/App.jsx'] || files['App.jsx'] || ''

  // Find any CSS
  let cssCode = files['/styles.css'] || files['styles.css'] || files['/index.css'] || files['index.css'] || ''

  // Get all component files
  const componentFiles: Record<string, string> = {}
  for (const [path, content] of Object.entries(files)) {
    if ((path.endsWith('.tsx') || path.endsWith('.jsx')) && !path.includes('index')) {
      const name = path.replace(/^\//, '').replace(/\.(tsx|jsx)$/, '')
      componentFiles[name] = content
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Survey</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    html, body, #root { margin: 0; padding: 0; min-height: 100vh; width: 100%; }
    ${cssCode}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel" data-type="module">
    const { useState, useEffect, useRef, useCallback } = React;

    // Lucide icons as simple SVG components
    const ChevronRight = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
    );
    const ChevronLeft = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
    );
    const Check = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5"/></svg>
    );
    const Star = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    );
    const Send = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
    );
    const ArrowRight = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
    );
    const ArrowLeft = (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
    );

    // Simple motion wrapper (no-op for animations)
    const motion = {
      div: ({ children, ...props }) => <div {...props}>{children}</div>,
      button: ({ children, ...props }) => <button {...props}>{children}</button>,
      span: ({ children, ...props }) => <span {...props}>{children}</span>,
      p: ({ children, ...props }) => <p {...props}>{children}</p>,
    };
    const AnimatePresence = ({ children }) => children;

    // Helper to send responses to parent
    const sendResponse = (responses) => {
      window.parent.postMessage({ type: 'SURVEY_COMPLETE', responses }, '*');
    };

    // Listen for navigation commands from parent (for route dropdown)
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'deepsite:navigateTo' && typeof e.data.path === 'string') {
        window.dispatchEvent(new CustomEvent('deepsite:navigateTo', { detail: e.data.path }));
      }
    });

    ${appCode
      .replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '')
      .replace(/export\s+default\s+/g, 'const App = ')
      .replace(/export\s+/g, 'const ')
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`
}
