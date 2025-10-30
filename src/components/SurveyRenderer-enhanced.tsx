"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import * as Babel from '@babel/standalone'
import { validateGeneratedCode } from '@/lib/security/code-validator'
import { SurveyProvider, useSurveyState, useValidation, useAnalytics, useProgress, type SurveyConfig } from '@/features/survey'
import { BehavioralTracker } from '@/../lib/tracking/behavioral-tracker'
import { axiomLogger } from '@/../lib/logging/axiom-client'
import { AIGenerationOutput, Survey, SurveyComponent } from '@/lib/schemas/survey-schemas'
import { AlertTriangle, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import * as FramerMotion from 'framer-motion'

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
  
  // Debug logging
  React.useEffect(() => {
    console.log('=== ENHANCED RENDERER DEBUG ===');
    console.log('surveyData:', surveyData ? 'Present' : 'Missing');
    console.log('components length:', components.length);
    console.log('surveyId:', surveyId);
    console.log('Survey title:', surveyData?.survey?.title);
    console.log('Survey components:', surveyData?.components?.length);
  }, [surveyData, components, surveyId])
  
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
      
      {/* Beautiful Survey Container with Animation */}
      <div className="survey-container space-y-8 max-w-4xl mx-auto p-6" style={containerStyle}>
        {/* Survey Header */}
        {activeSurvey && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-6">
              <div className="text-2xl">📋</div>
            </div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {activeSurvey.title}
            </h1>
            {activeSurvey.description && (
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {activeSurvey.description}
              </p>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {compiled.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-center py-20"
            >
              <div className="relative">
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl blur-3xl opacity-60"></div>
                
                <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl p-12 border border-gray-100 shadow-xl">
                  <div className="text-8xl mb-6 animate-bounce">🎯</div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Survey Builder Ready!
                  </h3>
                  <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
                    Start building your survey by chatting with the AI in the sidebar. 
                    <span className="block mt-2 font-semibold text-blue-600">Your survey will appear here in real-time! ✨</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="survey"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, staggerChildren: 0.1 }}
              className="space-y-8"
            >
              {compiled.map(({ id, Component, props, error }, index) => (
                <motion.div 
                  key={id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.15,
                    duration: 0.6,
                    ease: "easeOut",
                    type: "spring",
                    stiffness: 100
                  }}
                  className="survey-component group"
                >
                  {error ? (
                    <ErrorFallback error={error} componentId={id} />
                  ) : (
                    <div className="relative">
                      {/* Subtle hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -m-2"></div>
                      <div className="relative transform hover:scale-[1.02] transition-all duration-300 ease-out">
                        <Component {...props} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Completion indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: compiled.length * 0.15 + 0.3 }}
                className="text-center pt-8"
              >
                <ProgressIndicator />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <CompletionWatcher onComplete={onComplete} />
      
      {/* Follow-up Suggestions */}
      {surveyData?.followUpSuggestions && compiled.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-12"
        >
          <FollowUpSuggestions suggestions={surveyData.followUpSuggestions} />
        </motion.div>
      )}
    </SurveyProvider>
  )
}

// Enhanced Progress Indicator Component
const ProgressIndicator: React.FC = () => {
  const { progress } = useProgress()
  const { responses } = useSurveyState()
  
  const completedQuestions = Object.keys(responses).length
  
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Progress</h3>
        <div className="flex items-center gap-2">
          {progress >= 100 ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex items-center gap-1 text-green-600"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Complete!</span>
            </motion.div>
          ) : (
            <span className="text-gray-600 font-medium">{Math.round(progress)}%</span>
          )}
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      
      <p className="text-sm text-gray-600 mt-3">
        {completedQuestions} questions answered
      </p>
    </div>
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
  console.log('=== COMPONENT COMPILATION DEBUG ===');
  console.log('Components to compile:', defs.length);
  console.log('Component IDs:', defs.map(d => d.id));
  console.log('Component types:', defs.map(d => d.type));
  
  const results = defs.map((comp) => {
    console.log(`🔧 Compiling component: ${comp.name} (${comp.id})`);
    console.log(`Component type: ${comp.type}`);
    console.log(`Dependencies: ${comp.dependencies?.join(', ') || 'none'}`);
    console.log(`Code length: ${comp.code?.length || 0} characters`);
    
    try {
      // Enhanced security validation
      const validation = validateGeneratedCode(comp.code)
      if (!validation.isValid) {
        const error = `Security validation failed for ${comp.name}: ${validation.errors.join('; ')}`
        console.error('❌ Security validation failed:', error)
        onError?.(error)
        return { 
          id: comp.id, 
          name: comp.name, 
          Component: ErrorFallback as React.ComponentType<any>, 
          props: { error: validation.errors.join('; '), componentId: comp.id },
          error: validation.errors.join('; ')
        }
      }
      console.log('✅ Security validation passed for', comp.name);

      // Validate dependencies
      if (comp.dependencies) {
        const allowedDeps = ['react', 'lucide-react', 'framer-motion']
        const invalidDeps = comp.dependencies.filter(dep => !allowedDeps.includes(dep))
        if (invalidDeps.length > 0) {
          const error = `Invalid dependencies in ${comp.name}: ${invalidDeps.join(', ')}`
          console.error('❌ Invalid dependencies:', error)
          onError?.(error)
          return { 
            id: comp.id, 
            name: comp.name, 
            Component: ErrorFallback as React.ComponentType<any>, 
            props: { error, componentId: comp.id },
            error
          }
        }
        console.log('✅ Dependencies validated for', comp.name, ':', comp.dependencies);
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
        if (name === 'framer-motion') {
          // Return the imported framer-motion
          return FramerMotion
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

        console.log('✅ Component compiled successfully:', comp.name);
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
  
  console.log('=== COMPILATION RESULTS ===');
  console.log('Total components processed:', results.length);
  console.log('Successfully compiled:', results.filter(r => !r.error).length);
  console.log('Failed compilation:', results.filter(r => r.error).length);
  console.log('Component names:', results.map(r => r.name));
  
  return results;
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

// Enhanced Follow-up suggestions component
const FollowUpSuggestions: React.FC<{ suggestions: AIGenerationOutput['followUpSuggestions'] }> = ({ suggestions }) => {
  const [dismissed, setDismissed] = useState<string[]>([])

  if (!suggestions || suggestions.length === 0) return null

  const activeSuggestions = suggestions.filter(s => !dismissed.includes(s.id))

  if (activeSuggestions.length === 0) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-4xl px-6"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
        <h3 className="text-blue-800 font-semibold mb-4 flex items-center gap-2 text-lg">
          <HelpCircle className="w-5 h-5" />
          Suggestions to Improve Your Survey
        </h3>
        <div className="grid gap-3">
          {activeSuggestions.map((suggestion, index) => (
            <motion.div 
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex-1">
                <p className="text-gray-700 font-medium">{suggestion.text}</p>
                <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${
                  suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                  suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {suggestion.priority} priority
                </span>
              </div>
              <div className="flex gap-3 ml-4">
                <button 
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow"
                  onClick={() => {
                    // TODO: Implement suggestion acceptance
                    console.log('Accept suggestion:', suggestion)
                  }}
                >
                  Apply
                </button>
                <button 
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  onClick={() => setDismissed(prev => [...prev, suggestion.id])}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}