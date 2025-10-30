"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as Babel from '@babel/standalone'
import { validateGeneratedCode } from '@/lib/security/code-validator'
import { SurveyProvider, useSurveyState, useValidation, useAnalytics, useProgress, type SurveyConfig } from '@/features/survey'
import { BehavioralTracker } from '@/../lib/tracking/behavioral-tracker'
import { axiomLogger } from '@/../lib/logging/axiom-client'
import { AIGenerationOutput, Survey, SurveyComponent } from '@/lib/schemas/survey-schemas'
import { AlertTriangle, RefreshCw, HelpCircle } from 'lucide-react'

interface GeneratedComponent {
  id: string
  name: string
  code: string
  props?: any
  type?: string
  dependencies?: string[]
}

interface SurveyRendererProps {
  components?: GeneratedComponent[]
  surveyData?: AIGenerationOutput
  surveyId: string
  onComplete?: (responses: Record<string, any>) => void
  onError?: (error: string) => void
}

export const SurveyRenderer: React.FC<SurveyRendererProps> = ({ 
  components = [], 
  surveyData, 
  surveyId, 
  onComplete, 
  onError 
}) => {
  const [compilationErrors, setCompilationErrors] = useState<string[]>([])
  const [retryCount, setRetryCount] = useState(0)
  
  // Use surveyData if provided, otherwise fallback to legacy components
  const activeComponents = useMemo(() => {
    const list = surveyData?.components || components || []
    return Array.isArray(list) ? list : []
  }, [surveyData?.components, components])
  const activeSurvey = surveyData?.survey
  
  const compiled = useMemo(() => {
    const errors: string[] = []
    const result = compileComponents(activeComponents, (error) => {
      errors.push(error)
    })
    setCompilationErrors(errors)
    if (errors.length > 0 && onError) {
      onError(`Component compilation failed: ${errors.join(', ')}`)
    }
    return result
  }, [activeComponents, retryCount])

  const config: SurveyConfig = useMemo(() => {
    if (activeSurvey) {
      // Use full survey configuration
      // Bridge to internal SurveyProvider config shape by flattening page components
      const providerComponents = Array.isArray(activeSurvey.pages)
        ? activeSurvey.pages.flatMap((p) => Array.isArray(p.components) ? p.components : [])
        : []

      return {
        surveyId,
        // Provide components for state/progress providers
        components: providerComponents.map((c, i) => ({
          id: c.id,
          type: (c.type as any) || 'text-input',
          label: c.label,
          required: !!c.required,
          position: typeof c.position === 'number' ? c.position : (i + 1),
          pageId: c.pageId || 'page_1',
          style: c.style as any,
          analytics: c.analytics as any,
          accessibility: c.accessibility as any,
        })),
        // Keep additional rich survey data for downstream usage if needed
        // @ts-expect-error extra fields are tolerated at runtime
        pages: activeSurvey.pages || [],
        // @ts-expect-error extra fields are tolerated at runtime
        theme: activeSurvey.theme || {},
        // @ts-expect-error extra fields are tolerated at runtime
        settings: activeSurvey.settings || {},
        validation: surveyData?.validationRules || { perComponent: {}, global: {} },
        analytics: surveyData?.analyticsConfig || { events: [], accuracyChecks: [] },
      }
    } else {
      // Legacy fallback configuration
      return {
        surveyId,
        components: activeComponents.map((c, i) => ({
          id: c.id,
          type: (c.type as any) || 'text-input',
          label: c.name,
          required: false,
          position: i + 1,
          pageId: 'page_1',
          style: { 
            spacing: 8, 
            radius: 6, 
            shadow: 'sm', 
            palette: { primary: '#171717', secondary: '#8a8a8a', background: '#ffffff', text: '#171717' }, 
            font: 'sans' 
          },
          analytics: { trackViews: true, trackInteractions: true, trackTimings: true, customEvents: [] },
          accessibility: { ariaLabel: c.name },
        })),
        validation: { perComponent: {}, global: {} },
        analytics: { events: [], accuracyChecks: [] },
      }
    }
  }, [activeComponents, activeSurvey, surveyData, surveyId])

  const containerStyle = useMemo(() => {
    const theme = activeSurvey?.theme || {}
    return {
      backgroundColor: theme.backgroundColor || '#ffffff',
      color: theme.textColor || '#171717',
      fontFamily: theme.fontFamily || 'Inter, sans-serif',
      borderRadius: typeof theme.borderRadius === 'number' ? `${theme.borderRadius}px` : '8px',
      padding: typeof theme.spacing === 'number' ? `${Math.max(12, theme.spacing)}px` : '16px',
    } as React.CSSProperties
  }, [activeSurvey?.theme])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    setCompilationErrors([])
  }

  if (compilationErrors.length > 0) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-red-800 font-semibold">Survey Compilation Error</h3>
        </div>
        <div className="space-y-2 mb-4">
          {compilationErrors.map((error, i) => (
            <p key={i} className="text-red-700 text-sm">• {error}</p>
          ))}
        </div>
        <button
          onClick={handleRetry}
          className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Compilation
        </button>
      </div>
    )
  }

  return (
    <SurveyProvider config={config}>
      <AxiomBehaviorInit surveyId={surveyId} />
      <ValidationProvider surveyData={surveyData} />
      <div className="survey-container space-y-6 max-w-2xl mx-auto" style={containerStyle}>
        {compiled.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No survey components to display</p>
          </div>
        ) : (
          compiled.map(({ id, Component, props, error }) => (
            <div key={id} className="survey-component">
              {error ? (
                <ErrorFallback error={error} componentId={id} />
              ) : (
                <Component {...props} />
              )}
            </div>
          ))
        )}
      </div>
      <CompletionWatcher onComplete={onComplete} />
      {surveyData?.followUpSuggestions && (
        <FollowUpSuggestions suggestions={surveyData.followUpSuggestions} />
      )}
    </SurveyProvider>
  )
}

function CompletionWatcher({ onComplete }: { onComplete?: (responses: Record<string, any>) => void }) {
  const called = useRef(false)
  const { responses } = useSurveyState()
  const { progress } = useProgress()
  useEffect(() => {
    if (!onComplete) return
    if (!called.current && progress >= 100) {
      called.current = true
      onComplete(responses)
    }
  }, [progress, responses, onComplete])
  return null
}

function AxiomBehaviorInit({ surveyId }: { surveyId: string }) {
  const trackerRef = useRef<BehavioralTracker | null>(null)
  useEffect(() => {
    trackerRef.current = new BehavioralTracker(surveyId)
    trackerRef.current.startTracking()
    axiomLogger.logBusinessEvent({ eventType: 'survey_started', metadata: { surveyId, timestamp: Date.now() } })
    return () => trackerRef.current?.stopTracking()
  }, [surveyId])
  return null
}

function compileComponents(defs: GeneratedComponent[], onError?: (error: string) => void) {
  return defs.map((comp) => {
    try {
      // Enhanced security validation
      const validation = validateGeneratedCode(comp.code)
      if (!validation.isValid) {
        const error = `Security validation failed for ${comp.name}: ${validation.errors.join('; ')}`
        console.warn(error)
        onError?.(error)
        return { 
          id: comp.id, 
          name: comp.name, 
          Component: ErrorFallback as React.ComponentType<any>, 
          props: { error: validation.errors.join('; '), componentId: comp.id },
          error: validation.errors.join('; ')
        }
      }

      // Validate dependencies
      if (comp.dependencies) {
        const allowedDeps = ['react', 'lucide-react']
        const invalidDeps = comp.dependencies.filter(dep => !allowedDeps.includes(dep))
        if (invalidDeps.length > 0) {
          const error = `Invalid dependencies in ${comp.name}: ${invalidDeps.join(', ')}`
          onError?.(error)
          return { 
            id: comp.id, 
            name: comp.name, 
            Component: ErrorFallback as React.ComponentType<any>, 
            props: { error, componentId: comp.id },
            error
          }
        }
      }

      // Babel transformation with error handling
      let transformed: string
      try {
        const result = Babel.transform(comp.code, {
          presets: ['react', 'typescript'],
          plugins: ['transform-modules-commonjs'],
          filename: `${comp.name || 'Generated'}.tsx`,
        })
        transformed = result.code as string
      } catch (babelError: any) {
        const error = `Babel transformation failed for ${comp.name}: ${babelError?.message || 'Unknown error'}`
        onError?.(error)
        return { 
          id: comp.id, 
          name: comp.name, 
          Component: ErrorFallback as React.ComponentType<any>, 
          props: { error, componentId: comp.id },
          error
        }
      }

      // Safe component execution
      const module = { exports: {} as any }
      // Minimal require shim to satisfy transformed imports
      const requireShim = (name: string) => {
        if (name === 'react') return React
        if (name === '@/features/survey') {
          return { useSurveyState, useValidation, useAnalytics, useProgress }
        }
        if (name === 'lucide-react') {
          // Provide empty object; icons are not used in generated components by default
          return {}
        }
        // Fallback empty object to avoid ReferenceErrors
        return {}
      }
      try {
        const fn = new Function(
          'module',
          'exports',
          'require',
          'React',
          'useSurveyState',
          'useValidation',
          'useAnalytics',
          'useProgress',
          `${transformed}; return module.exports;`,
        )
        const exports = fn(module, module.exports, requireShim, React, useSurveyState, useValidation, useAnalytics, useProgress)
        const Exported = exports?.default || exports?.[comp.name]
        
        if (!Exported) {
          const error = `Component export not found in ${comp.name}`
          onError?.(error)
          return { 
            id: comp.id, 
            name: comp.name, 
            Component: ErrorFallback as React.ComponentType<any>, 
            props: { error, componentId: comp.id },
            error
          }
        }

        // Test render the component to catch runtime errors early
        try {
          React.createElement(Exported, comp.props || {})
        } catch (renderError: any) {
          const error = `Component render test failed for ${comp.name}: ${renderError?.message || 'Unknown render error'}`
          console.warn(error)
          // Don't fail hard on render test, just warn
        }

        return { 
          id: comp.id, 
          name: comp.name, 
          Component: Exported as React.ComponentType<any>, 
          props: comp.props || {},
          error: null
        }
      } catch (executionError: any) {
        const error = `Component execution failed for ${comp.name}: ${executionError?.message || 'Execution failed'}`
        onError?.(error)
        return { 
          id: comp.id, 
          name: comp.name, 
          Component: ErrorFallback as React.ComponentType<any>, 
          props: { error, componentId: comp.id },
          error
        }
      }
    } catch (error: any) {
      const errorMessage = `Unexpected error compiling ${comp.name}: ${error?.message || 'Unknown error'}`
      console.error(errorMessage)
      onError?.(errorMessage)
      return { 
        id: comp.id, 
        name: comp.name, 
        Component: ErrorFallback as React.ComponentType<any>, 
        props: { error: errorMessage, componentId: comp.id },
        error: errorMessage
      }
    }
  })
}

const ErrorFallback: React.FC<{ error: string; componentId?: string }> = ({ error, componentId }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="w-4 h-4 text-red-600" />
      <h3 className="text-red-800 font-semibold">Component Error</h3>
      {componentId && <span className="text-red-600 text-xs">({componentId})</span>}
    </div>
    <p className="text-red-600 text-sm">{error}</p>
    <div className="mt-3 text-xs text-red-500">
      This component failed to render. Please check the generated code or try regenerating the survey.
    </div>
  </div>
)

// Validation provider for real-time validation
const ValidationProvider: React.FC<{ surveyData?: AIGenerationOutput }> = ({ surveyData }) => {
  const { responses } = useSurveyState()
  const { setValidationErrors } = useValidation()

  useEffect(() => {
    if (!surveyData?.validationRules) return

    const errors: Record<string, string[]> = {}
    
    // Apply per-component validation rules
    Object.entries(surveyData.validationRules.perComponent).forEach(([componentId, rules]) => {
      const value = responses[componentId]
      const componentErrors: string[] = []

      rules.rules.forEach(rule => {
        if (rule === 'required' && (!value || value.toString().trim() === '')) {
          componentErrors.push(rules.errorMessages.required || 'This field is required')
        } else if (rule.startsWith('minLength:')) {
          const minLength = parseInt(rule.split(':')[1])
          if (value && value.toString().length < minLength) {
            componentErrors.push(rules.errorMessages.minLength || `Minimum ${minLength} characters required`)
          }
        } else if (rule.startsWith('maxLength:')) {
          const maxLength = parseInt(rule.split(':')[1])
          if (value && value.toString().length > maxLength) {
            componentErrors.push(rules.errorMessages.maxLength || `Maximum ${maxLength} characters allowed`)
          }
        }
      })

      if (componentErrors.length > 0) {
        errors[componentId] = componentErrors
      }
    })

    setValidationErrors(errors)
  }, [responses, surveyData, setValidationErrors])

  return null
}

// Follow-up suggestions component
const FollowUpSuggestions: React.FC<{ suggestions: AIGenerationOutput['followUpSuggestions'] }> = ({ suggestions }) => {
  const [dismissed, setDismissed] = useState<string[]>([])

  if (!suggestions || suggestions.length === 0) return null

  const activeSuggestions = suggestions.filter(s => !dismissed.includes(s.id))

  if (activeSuggestions.length === 0) return null

  return (
    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-blue-800 font-semibold mb-3 flex items-center gap-2">
        <HelpCircle className="w-4 h-4" />
        Suggestions to Improve Your Survey
      </h3>
      <div className="space-y-2">
        {activeSuggestions.map(suggestion => (
          <div key={suggestion.id} className="flex items-center justify-between p-2 bg-white rounded border">
            <div className="flex-1">
              <p className="text-sm text-gray-700">{suggestion.text}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {suggestion.priority} priority
              </span>
            </div>
            <div className="flex gap-2">
              <button 
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // TODO: Implement suggestion acceptance
                  console.log('Accept suggestion:', suggestion)
                }}
              >
                Apply
              </button>
              <button 
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                onClick={() => setDismissed(prev => [...prev, suggestion.id])}
              >
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

