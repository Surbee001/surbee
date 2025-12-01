"use client"

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { SandpackProvider, SandpackPreview } from '@codesandbox/sandpack-react'

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

export default function PublishedSurveyPage() {
  const params = useParams()
  const publishedUrl = params.url as string
  const [survey, setSurvey] = useState<PublishedSurvey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!publishedUrl) return

      try {
        setLoading(true)
        const response = await fetch(`/api/surveys/published/${publishedUrl}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Survey not found')
          } else {
            setError('Failed to load survey')
          }
          return
        }

        const data = await response.json()
        setSurvey(data)
      } catch (err) {
        console.error('Error loading survey:', err)
        setError('Failed to load survey')
      } finally {
        setLoading(false)
      }
    }

    fetchSurvey()
  }, [publishedUrl])

  // Listen for messages from the sandbox (for form submissions)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Handle survey completion from sandbox
      if (event.data?.type === 'SURVEY_COMPLETE' || event.data?.type === 'survey-response') {
        const responses = event.data.responses || event.data.data

        if (survey?.id && responses) {
          try {
            // Save responses to the database
            await fetch(`/api/projects/${survey.id}/responses`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                responses,
                completed_at: new Date().toISOString(),
              }),
            })
          } catch (err) {
            console.error('Error saving response:', err)
          }
        }

        setIsCompleted(true)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [survey?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 text-white/60 mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Survey Unavailable</h1>
          <p className="text-white/50 text-sm">
            {error || 'The survey you\'re looking for is not available.'}
          </p>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-xl font-semibold text-white mb-2">Thank You!</h1>
          <p className="text-white/50 text-sm">
            Your responses have been recorded successfully.
          </p>
        </div>
      </div>
    )
  }

  // Render sandbox bundle if available
  if (survey.sandbox_bundle?.files) {
    // Convert sandbox bundle files to Sandpack format
    const sandpackFiles: Record<string, string> = {}

    for (const [filename, content] of Object.entries(survey.sandbox_bundle.files)) {
      // Sandpack expects paths starting with /
      const normalizedPath = filename.startsWith('/') ? filename : `/${filename}`
      sandpackFiles[normalizedPath] = content
    }

    // Determine entry point
    const entryFile = survey.sandbox_bundle.entry?.startsWith('/')
      ? survey.sandbox_bundle.entry
      : `/${survey.sandbox_bundle.entry || 'App.tsx'}`

    return (
      <div className="h-screen w-screen overflow-hidden bg-[#0a0a0a]">
        <SandpackProvider
          template="react-ts"
          files={sandpackFiles}
          options={{
            activeFile: entryFile,
            visibleFiles: [entryFile],
            externalResources: [
              'https://cdn.tailwindcss.com',
            ],
          }}
          customSetup={{
            dependencies: {
              'react': '^18.2.0',
              'react-dom': '^18.2.0',
              'lucide-react': '^0.400.0',
              'framer-motion': '^11.0.0',
              ...(survey.sandbox_bundle.dependencies?.reduce((acc, dep) => {
                const [name, version] = dep.includes('@') && !dep.startsWith('@')
                  ? dep.split('@')
                  : [dep, 'latest']
                return { ...acc, [name]: version }
              }, {}) || {}),
            },
          }}
          theme="dark"
        >
          <div className="h-full w-full">
            <SandpackPreview
              showNavigator={false}
              showOpenInCodeSandbox={false}
              showRefreshButton={false}
              style={{ height: '100%', width: '100%' }}
            />
          </div>
        </SandpackProvider>
      </div>
    )
  }

  // Fallback: show error if no sandbox bundle
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
        </div>
        <h1 className="text-xl font-semibold text-white mb-2">Survey Not Ready</h1>
        <p className="text-white/50 text-sm">
          This survey hasn't been built yet. Please check back later.
        </p>
      </div>
    </div>
  )
}
