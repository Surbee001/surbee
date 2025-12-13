"use client"

import React, { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'

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
  const [iframeHtml, setIframeHtml] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!publishedUrl) return

      try {
        setLoading(true)
        const response = await fetch(`/api/surveys/published/${publishedUrl}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('=== SHARED SURVEY: API error ===', response.status, errorData)

          // Use specific error message from API if available
          const apiError = errorData.error || errorData.message
          if (apiError) {
            setError(apiError)
          } else if (response.status === 404) {
            setError('This survey is not available. It may not be published yet or the link may be incorrect.')
          } else {
            setError('Failed to load survey')
          }
          return
        }

        const data = await response.json()
        setSurvey(data)

        // Generate iframe HTML if sandbox bundle exists
        if (data.sandbox_bundle?.files) {
          const html = generateSurveyHtml(data.sandbox_bundle)
          setIframeHtml(html)
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

  // Listen for messages from the iframe (for form submissions)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Handle survey completion from iframe
      if (event.data?.type === 'SURVEY_COMPLETE' || event.data?.type === 'survey-response') {
        const responses = event.data.responses || event.data.data

        if (survey?.id && responses) {
          try {
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
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p>{error || 'Survey not found'}</p>
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
