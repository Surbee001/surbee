"use client"

import React, { useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { SurveyProvider, useSurveyState, useProgress, type SurveyConfig } from '@/features/survey'
import { ComponentRegistry, ComponentType, ComponentStyle } from './base-components'
import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'

// Enhanced component interface for our registry-based system
export interface SurveyComponentConfig {
  id: string
  type: ComponentType
  label: string
  required?: boolean
  placeholder?: string
  helpText?: string
  options?: string[]
  props?: Record<string, any>
  style?: ComponentStyle
  position?: number
  pageId?: string
}

interface SimpleSurveyRendererProps {
  surveyData?: AIGenerationOutput
  surveyId: string
  onComplete?: (responses: Record<string, any>) => void
  onError?: (error: string) => void
  className?: string
}

export const SimpleSurveyRenderer: React.FC<SimpleSurveyRendererProps> = ({
  surveyData,
  surveyId,
  onComplete,
  onError,
  className = ""
}) => {
  console.log('=== SIMPLE RENDERER DEBUG ===')
  console.log('surveyData:', surveyData ? 'Present' : 'Missing')
  console.log('Survey title:', surveyData?.survey?.title)
  console.log('Survey pages:', surveyData?.survey?.pages?.length)

  // Extract components from survey data
  const surveyComponents = useMemo(() => {
    if (!surveyData?.survey?.pages) return []
    
    return surveyData.survey.pages.flatMap(page => 
      (page.components || []).map(comp => ({
        id: comp.id,
        type: comp.type as ComponentType,
        label: comp.label,
        required: comp.required,
        placeholder: comp.placeholder,
        helpText: comp.helpText,
        options: comp.options || comp.props?.options,
        props: comp.props,
        style: comp.style,
        position: comp.position || 0,
        pageId: comp.pageId || page.id
      } as SurveyComponentConfig))
    ).filter(comp => ComponentRegistry[comp.type]) // Only include supported types
  }, [surveyData])

  // Create survey config for provider
  const config: SurveyConfig = useMemo(() => ({
    surveyId,
    components: surveyComponents.map((comp, index) => ({
      id: comp.id,
      type: comp.type as any,
      label: comp.label,
      required: !!comp.required,
      position: comp.position || index + 1,
      pageId: comp.pageId || 'page_1',
      style: comp.style as any,
      analytics: { trackViews: true, trackInteractions: true, trackTimings: true, customEvents: [] },
      accessibility: { ariaLabel: comp.label }
    })),
    validation: surveyData?.validationRules || { perComponent: {}, global: {} },
    analytics: surveyData?.analyticsConfig || { events: [], accuracyChecks: [] }
  }), [surveyId, surveyComponents, surveyData])

  const activeSurvey = surveyData?.survey
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

  return (
    <SurveyProvider config={config}>
      <CompletionWatcher onComplete={onComplete} />
      
      <div 
        className={`survey-container space-y-8 max-w-4xl mx-auto p-6 ${className}`} 
        style={containerStyle}
      >
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

        {/* Survey Components */}
        <AnimatePresence mode="wait">
          {surveyComponents.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div 
              key="survey"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, staggerChildren: 0.1 }}
              className="space-y-8"
            >
              {surveyComponents.map((componentConfig, index) => (
                <SurveyComponentWrapper
                  key={componentConfig.id}
                  config={componentConfig}
                  index={index}
                />
              ))}
              
              {/* Progress Indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: surveyComponents.length * 0.15 + 0.3 }}
                className="text-center pt-8"
              >
                <ProgressIndicator />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Follow-up Suggestions */}
        {surveyData?.followUpSuggestions && surveyComponents.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mt-12"
          >
            <FollowUpSuggestions suggestions={surveyData.followUpSuggestions} />
          </motion.div>
        )}
      </div>
    </SurveyProvider>
  )
}

// Individual component wrapper with error handling
const SurveyComponentWrapper: React.FC<{
  config: SurveyComponentConfig
  index: number
}> = ({ config, index }) => {
  const Component = ComponentRegistry[config.type]

  if (!Component) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ 
          delay: index * 0.15,
          duration: 0.6,
          ease: "easeOut",
          type: "spring",
          stiffness: 100
        }}
      >
        <ErrorFallback 
          error={`Unsupported component type: ${config.type}`} 
          componentId={config.id} 
        />
      </motion.div>
    )
  }

  return (
    <motion.div 
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
      <div className="relative">
        {/* Subtle hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 -m-2"></div>
        <div className="relative transform hover:scale-[1.02] transition-all duration-300 ease-out">
          <Component
            id={config.id}
            label={config.label}
            required={config.required}
            placeholder={config.placeholder}
            helpText={config.helpText}
            options={config.options}
            style={config.style}
            {...config.props}
          />
        </div>
      </div>
    </motion.div>
  )
}

// Empty state component
const EmptyState: React.FC = () => (
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
)

// Progress indicator component
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

// Completion watcher
const CompletionWatcher: React.FC<{ onComplete?: (responses: Record<string, any>) => void }> = ({ onComplete }) => {
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

// Error fallback component
const ErrorFallback: React.FC<{ error: string; componentId?: string }> = ({ error, componentId }) => (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <div className="flex items-center gap-2 mb-2">
      <AlertTriangle className="w-4 h-4 text-red-600" />
      <h3 className="text-red-800 font-semibold">Component Error</h3>
      {componentId && <span className="text-red-600 text-xs">({componentId})</span>}
    </div>
    <p className="text-red-600 text-sm">{error}</p>
    <div className="mt-3 text-xs text-red-500">
      This component failed to render. Please check the configuration or try regenerating.
    </div>
  </div>
)

// Simple follow-up suggestions (placeholder)
const FollowUpSuggestions: React.FC<{ suggestions: any[] }> = ({ suggestions }) => {
  if (!suggestions?.length) return null
  
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-lg">
      <h3 className="text-blue-800 font-semibold mb-4 text-lg">
        💡 Suggestions to Improve Your Survey
      </h3>
      <div className="grid gap-3">
        {suggestions.slice(0, 3).map((suggestion, index) => (
          <div key={index} className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm">
            <p className="text-gray-700 font-medium">{suggestion.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SimpleSurveyRenderer