"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import ComponentPreview from './builder/ComponentPreview'
import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'
import { ComponentType } from './base-components'

export interface PreviewComponentData {
  id: string
  type: ComponentType
  label: string
  required?: boolean
  placeholder?: string
  helpText?: string
  options?: string[]
  props?: Record<string, any>
  style?: {
    container?: React.CSSProperties
    label?: React.CSSProperties
    input?: React.CSSProperties
  }
}

interface PreviewRendererProps {
  surveyData?: AIGenerationOutput
  components?: PreviewComponentData[]
  className?: string
}

export const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  surveyData,
  components = [],
  className = ""
}) => {
  // Extract components from survey data if not provided directly
  const previewComponents = React.useMemo(() => {
    if (components.length > 0) return components
    
    if (!surveyData?.survey?.pages) return []
    
    return surveyData.survey.pages.flatMap(page => 
      (page.components || []).map((comp, index) => ({
        id: comp.id || `preview_${index}`,
        type: comp.type as ComponentType,
        label: comp.label || 'Untitled Question',
        required: comp.required || false,
        placeholder: comp.placeholder,
        helpText: comp.helpText,
        options: comp.options || comp.props?.options,
        props: comp.props,
        style: comp.style
      } as PreviewComponentData))
    )
  }, [surveyData, components])

  const activeSurvey = surveyData?.survey
  const containerStyle = React.useMemo(() => {
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
    <div 
      className={`survey-preview-container space-y-8 max-w-4xl mx-auto p-6 ${className}`} 
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
        {previewComponents.length === 0 ? (
          <EmptyPreviewState />
        ) : (
          <motion.div 
            key="survey-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, staggerChildren: 0.1 }}
            className="space-y-8"
          >
            {previewComponents.map((componentConfig, index) => (
              <motion.div 
                key={componentConfig.id}
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
                  <div className="relative">
                    <ComponentPreview
                      id={componentConfig.id}
                      type={componentConfig.type}
                      label={componentConfig.label}
                      required={componentConfig.required}
                      placeholder={componentConfig.placeholder}
                      helpText={componentConfig.helpText}
                      options={componentConfig.options}
                      style={componentConfig.style}
                      props={componentConfig.props}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Preview Progress Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: previewComponents.length * 0.15 + 0.3 }}
              className="text-center pt-8"
            >
              <PreviewProgressIndicator componentCount={previewComponents.length} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Note */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center"
      >
        <p className="text-blue-700 text-sm font-medium">
          📋 This is a preview - responses won't be saved
        </p>
      </motion.div>
    </div>
  )
}

// Empty state for preview
const EmptyPreviewState: React.FC = () => (
  <motion.div 
    key="empty-preview"
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
        <div className="text-8xl mb-6">👁️</div>
        <h3 className="text-3xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Preview Mode
        </h3>
        <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed">
          Add components to see how your survey will look to respondents.
          <span className="block mt-2 font-semibold text-blue-600">Switch to Edit Mode to make changes! ✨</span>
        </p>
      </div>
    </div>
  </motion.div>
)

// Preview progress indicator (static)
const PreviewProgressIndicator: React.FC<{ componentCount: number }> = ({ componentCount }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-100 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Survey Progress</h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-600 font-medium">Preview Mode</span>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-gray-300 to-gray-400 rounded-full w-0" />
      </div>
      
      <p className="text-sm text-gray-600 mt-3">
        {componentCount} questions in this survey
      </p>
    </div>
  )
}

export default PreviewRenderer