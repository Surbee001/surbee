"use client"

import React, { useState } from 'react'
import { X, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react'
import { SurveyComponentData } from './VisualSurveyBuilder'
import { motion, AnimatePresence } from 'framer-motion'
import { aiStyleCustomizer, StyleCustomizationRequest } from '@/lib/ai/style-customizer'

interface PropertyEditorProps {
  component: SurveyComponentData
  onUpdate: (updates: Partial<SurveyComponentData>) => void
  onClose: () => void
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({
  component,
  onUpdate,
  onClose
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    options: true,
    style: false,
    aiStyle: false,
    validation: false
  })

  // AI Style customization state
  const [aiStyleInput, setAiStyleInput] = useState('')
  const [aiStyleLoading, setAiStyleLoading] = useState(false)
  const [aiStyleResult, setAiStyleResult] = useState<{ success: boolean; message: string } | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Update style property
  const updateStyle = (category: 'container' | 'label' | 'input', property: string, value: any) => {
    const currentStyle = component.style || {}
    const categoryStyle = currentStyle[category] || {}
    
    onUpdate({
      style: {
        ...currentStyle,
        [category]: {
          ...categoryStyle,
          [property]: value
        }
      }
    })
  }

  // Add option for radio/checkbox/select
  const addOption = () => {
    const currentOptions = component.options || []
    onUpdate({
      options: [...currentOptions, `Option ${currentOptions.length + 1}`]
    })
  }

  // Update option
  const updateOption = (index: number, value: string) => {
    const currentOptions = component.options || []
    const newOptions = [...currentOptions]
    newOptions[index] = value
    onUpdate({ options: newOptions })
  }

  // Remove option
  const removeOption = (index: number) => {
    const currentOptions = component.options || []
    onUpdate({
      options: currentOptions.filter((_, i) => i !== index)
    })
  }

  const hasOptions = ['radio', 'checkbox', 'select'].includes(component.type)

  // Handle AI style customization
  const handleAiStyleCustomization = async () => {
    if (!aiStyleInput.trim()) return

    setAiStyleLoading(true)
    setAiStyleResult(null)

    try {
      const request: StyleCustomizationRequest = {
        prompt: aiStyleInput,
        targetComponent: component.id,
        currentComponents: [component]
      }

      const result = await aiStyleCustomizer.customizeStyles(request)

      if (result.success && result.updatedComponents.length > 0) {
        const updatedComponent = result.updatedComponents[0]
        onUpdate({ style: updatedComponent.style })
        setAiStyleResult({ success: true, message: result.summary })
        setAiStyleInput('')
      } else {
        setAiStyleResult({ 
          success: false, 
          message: result.error || 'Failed to apply style changes' 
        })
      }
    } catch (error) {
      setAiStyleResult({ 
        success: false, 
        message: 'An error occurred while processing your request' 
      })
    } finally {
      setAiStyleLoading(false)
    }
  }

  // Clear AI result after 5 seconds
  React.useEffect(() => {
    if (aiStyleResult) {
      const timer = setTimeout(() => setAiStyleResult(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [aiStyleResult])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Component Properties</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto">
        {/* General Section */}
        <Section
          title="General"
          expanded={expandedSections.general}
          onToggle={() => toggleSection('general')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                type="text"
                value={component.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Placeholder
              </label>
              <input
                type="text"
                value={component.placeholder || ''}
                onChange={(e) => onUpdate({ placeholder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter placeholder text..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Help Text
              </label>
              <input
                type="text"
                value={component.helpText || ''}
                onChange={(e) => onUpdate({ helpText: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional help for users..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="required"
                checked={component.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="required" className="ml-2 text-sm font-medium text-gray-700">
                Required field
              </label>
            </div>
          </div>
        </Section>

        {/* Options Section (for radio, checkbox, select) */}
        {hasOptions && (
          <Section
            title="Options"
            expanded={expandedSections.options}
            onToggle={() => toggleSection('options')}
          >
            <div className="space-y-2">
              {component.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => removeOption(index)}
                    className="p-2 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
              <button
                onClick={addOption}
                className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Add Option</span>
              </button>
            </div>
          </Section>
        )}

        {/* Style Section */}
        <Section
          title="Style"
          expanded={expandedSections.style}
          onToggle={() => toggleSection('style')}
        >
          <div className="space-y-4">
            {/* Border Radius */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Border Radius
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={parseInt(component.style?.input?.borderRadius || '8')}
                  onChange={(e) => updateStyle('input', 'borderRadius', `${e.target.value}px`)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {component.style?.input?.borderRadius || '8px'}
                </span>
              </div>
            </div>

            {/* Padding */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Padding
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="4"
                  max="24"
                  value={parseInt(component.style?.input?.padding?.split('rem')[0] || '0.75') * 16}
                  onChange={(e) => updateStyle('input', 'padding', `${parseInt(e.target.value) / 16}rem`)}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {component.style?.input?.padding || '0.75rem'}
                </span>
              </div>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <select
                value={component.style?.label?.fontSize || '1.1rem'}
                onChange={(e) => updateStyle('label', 'fontSize', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="0.875rem">Small</option>
                <option value="1rem">Medium</option>
                <option value="1.1rem">Large</option>
                <option value="1.25rem">Extra Large</option>
              </select>
            </div>

            {/* Border Style */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Border Width
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="4"
                  value={parseInt(component.style?.input?.borderWidth || '1')}
                  onChange={(e) => {
                    updateStyle('input', 'borderWidth', `${e.target.value}px`)
                    updateStyle('input', 'borderStyle', e.target.value === '0' ? 'none' : 'solid')
                  }}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600 w-12">
                  {component.style?.input?.borderWidth || '1px'}
                </span>
              </div>
            </div>

            {/* Shadow */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shadow
              </label>
              <select
                value={component.style?.container?.boxShadow || 'none'}
                onChange={(e) => updateStyle('container', 'boxShadow', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="none">None</option>
                <option value="0 1px 2px 0 rgba(0, 0, 0, 0.05)">Small</option>
                <option value="0 4px 6px -1px rgba(0, 0, 0, 0.1)">Medium</option>
                <option value="0 10px 15px -3px rgba(0, 0, 0, 0.1)">Large</option>
                <option value="0 20px 25px -5px rgba(0, 0, 0, 0.1)">Extra Large</option>
              </select>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={component.style?.container?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('container', 'backgroundColor', e.target.value)}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={component.style?.container?.backgroundColor || '#ffffff'}
                  onChange={(e) => updateStyle('container', 'backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* AI Style Customization Section */}
        <Section
          title="AI Style Assistant"
          expanded={expandedSections.aiStyle}
          onToggle={() => toggleSection('aiStyle')}
        >
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">
                  Natural Language Styling
                </span>
              </div>
              <p className="text-xs text-purple-700 mb-3">
                Describe how you want to style this component in plain English
              </p>
              
              {/* Style Suggestions */}
              <div className="flex flex-wrap gap-1 mb-3">
                {[
                  'Make rounder',
                  'Add shadow',
                  'Make bigger',
                  'Use dark theme',
                  'More padding'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setAiStyleInput(suggestion)}
                    className="px-2 py-1 text-xs bg-white border border-purple-200 rounded-full hover:bg-purple-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="relative">
                <input
                  type="text"
                  value={aiStyleInput}
                  onChange={(e) => setAiStyleInput(e.target.value)}
                  placeholder="e.g., 'make the buttons more rounded'"
                  className="w-full px-3 py-2 pr-10 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAiStyleCustomization()}
                  disabled={aiStyleLoading}
                />
                <button
                  onClick={handleAiStyleCustomization}
                  disabled={aiStyleLoading || !aiStyleInput.trim()}
                  className="absolute right-2 top-2 p-1 text-purple-600 hover:text-purple-700 disabled:opacity-50"
                >
                  {aiStyleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Result */}
              <AnimatePresence>
                {aiStyleResult && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-3 p-2 rounded text-xs flex items-center gap-2 ${
                      aiStyleResult.success
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {aiStyleResult.success ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <AlertCircle className="w-3 h-3" />
                    )}
                    {aiStyleResult.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Section>

        {/* Validation Section */}
        <Section
          title="Validation"
          expanded={expandedSections.validation}
          onToggle={() => toggleSection('validation')}
        >
          <div className="space-y-4">
            {component.type === 'text-input' || component.type === 'textarea' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Length
                  </label>
                  <input
                    type="number"
                    value={component.props?.minLength || ''}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, minLength: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="No minimum"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Length
                  </label>
                  <input
                    type="number"
                    value={component.props?.maxLength || ''}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, maxLength: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="No maximum"
                  />
                </div>
              </>
            ) : component.type === 'scale' ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Value
                  </label>
                  <input
                    type="number"
                    value={component.props?.min || 1}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, min: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Value
                  </label>
                  <input
                    type="number"
                    value={component.props?.max || 5}
                    onChange={(e) => onUpdate({
                      props: { ...component.props, max: parseInt(e.target.value) }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No validation options for this component type</p>
            )}
          </div>
        </Section>
      </div>
    </div>
  )
}

// Collapsible Section Component
const Section: React.FC<{
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}> = ({ title, expanded, onToggle, children }) => {
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PropertyEditor