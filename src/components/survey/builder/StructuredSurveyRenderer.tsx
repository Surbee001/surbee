"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AIGenerationOutput, Survey } from '@/lib/schemas/survey-schemas'
import { ComponentConfig } from '@/lib/ai/hybrid-generator'

interface StructuredSurveyRendererProps {
  surveyData: AIGenerationOutput | null
  currentPageId?: string
  onPageChange?: (pages: { id: string, name: string, path: string }[]) => void
  className?: string
}

export const StructuredSurveyRenderer: React.FC<StructuredSurveyRendererProps> = ({
  surveyData,
  currentPageId,
  onPageChange,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [currentStep, setCurrentStep] = useState(0)

  if (!surveyData?.survey) {
    return (
      <div className={`h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Ready to Create
          </h3>
          <p className="text-gray-600">
            Chat with AI to create your survey
          </p>
        </div>
      </div>
    )
  }

  const survey = surveyData.survey
  const pages = survey.pages || []
  const theme = survey.theme || {
    primaryColor: '#3b82f6',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    borderRadius: 8,
    animations: true
  }

  // Notify parent about pages
  React.useEffect(() => {
    if (pages.length > 0 && onPageChange) {
      const pageList = pages.map(page => ({
        id: page.id,
        name: page.name || page.title || `Page ${page.position}`,
        path: `/${page.name?.toLowerCase().replace(/\s+/g, '-') || `page-${page.position}`}`
      }))
      onPageChange(pageList)
    }
  }, [pages, onPageChange])

  // Find current page
  const currentPage = currentPageId 
    ? pages.find(p => p.id === currentPageId) || pages[0]
    : pages[currentStep] || pages[0]

  if (!currentPage) {
    return (
      <div className={`h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No pages found
          </h3>
          <p className="text-gray-600">
            The survey doesn't have any pages configured
          </p>
        </div>
      </div>
    )
  }

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < pages.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Survey submitted:', formData)
    
    // Show success message
    const successDiv = document.createElement('div')
    successDiv.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    successDiv.textContent = 'Survey submitted successfully!'
    document.body.appendChild(successDiv)
    setTimeout(() => {
      if (document.body.contains(successDiv)) {
        document.body.removeChild(successDiv)
      }
    }, 3000)
  }

  const renderComponent = (component: ComponentConfig) => {
    const commonClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
    const commonStyle = { '--tw-ring-color': theme.primaryColor } as any

    switch (component.type) {
      case 'text-input':
        return (
          <input
            type="text"
            value={formData[component.id] || ''}
            onChange={(e) => handleInputChange(component.id, e.target.value)}
            className={commonClasses}
            style={commonStyle}
            placeholder={component.placeholder || "Enter your answer"}
            required={component.required}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={formData[component.id] || ''}
            onChange={(e) => handleInputChange(component.id, e.target.value)}
            className={`${commonClasses} resize-none`}
            style={commonStyle}
            rows={4}
            placeholder={component.placeholder || "Share your thoughts..."}
            required={component.required}
          />
        )

      case 'radio':
        return (
          <div className="space-y-2">
            {component.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={component.id}
                  value={option}
                  checked={formData[component.id] === option}
                  onChange={(e) => handleInputChange(component.id, e.target.value)}
                  className="w-4 h-4 text-blue-600"
                  required={component.required}
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'checkbox':
        return (
          <div className="space-y-2">
            {component.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={(formData[component.id] || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = formData[component.id] || []
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v: string) => v !== option)
                    handleInputChange(component.id, newValues)
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        )

      case 'select':
        return (
          <select
            value={formData[component.id] || ''}
            onChange={(e) => handleInputChange(component.id, e.target.value)}
            className={commonClasses}
            style={commonStyle}
            required={component.required}
          >
            <option value="">Select an option</option>
            {component.options?.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        )

      case 'scale':
        const { min = 1, max = 5, labels = [] } = component.props || {}
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((value) => (
                <div key={value} className="flex flex-col items-center space-y-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange(component.id, value)}
                    className={`w-12 h-12 rounded-full border-2 font-semibold transition-all hover:scale-110 ${
                      formData[component.id] === value
                        ? 'text-white shadow-lg'
                        : 'text-gray-600 border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      backgroundColor: formData[component.id] === value ? theme.primaryColor : 'transparent',
                      borderColor: formData[component.id] === value ? theme.primaryColor : undefined
                    }}
                  >
                    {value}
                  </button>
                  {labels[value - min] && (
                    <span className="text-xs text-gray-600 text-center max-w-16 leading-tight">
                      {labels[value - min]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case 'nps':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {Array.from({ length: 11 }, (_, i) => i).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleInputChange(component.id, value)}
                  className={`w-10 h-10 rounded border-2 font-semibold transition-all hover:scale-110 ${
                    formData[component.id] === value
                      ? 'text-white shadow-lg'
                      : 'text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    backgroundColor: formData[component.id] === value ? theme.primaryColor : 'transparent',
                    borderColor: formData[component.id] === value ? theme.primaryColor : undefined
                  }}
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Not likely at all</span>
              <span>Extremely likely</span>
            </div>
          </div>
        )

      case 'yes-no':
        return (
          <div className="flex space-x-4">
            {['Yes', 'No'].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleInputChange(component.id, option)}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  formData[component.id] === option
                    ? 'text-white shadow-lg'
                    : 'text-gray-600 border border-gray-300 hover:border-gray-400'
                }`}
                style={{
                  backgroundColor: formData[component.id] === option ? theme.primaryColor : 'transparent',
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )

      case 'date-picker':
        return (
          <input
            type="date"
            value={formData[component.id] || ''}
            onChange={(e) => handleInputChange(component.id, e.target.value)}
            className={commonClasses}
            style={commonStyle}
            required={component.required}
          />
        )

      default:
        return (
          <div className="p-4 bg-gray-100 rounded border-2 border-dashed border-gray-300 text-center">
            <p className="text-gray-600">Unsupported component type: {component.type}</p>
          </div>
        )
    }
  }

  return (
    <div className={`h-full bg-gray-50 ${className}`}>
      <div className="h-full flex items-center justify-center p-6">
        <motion.div 
          initial={theme.animations ? { opacity: 0, y: 20 } : {}}
          animate={theme.animations ? { opacity: 1, y: 0 } : {}}
          className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-8"
          style={{ 
            borderColor: theme.primaryColor,
            borderWidth: '2px',
            borderStyle: 'solid',
            backgroundColor: theme.backgroundColor
          }}
        >
          {/* Progress indicator for multi-page surveys */}
          {pages.length > 1 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep + 1} of {pages.length}</span>
                <span>{Math.round(((currentStep + 1) / pages.length) * 100)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${((currentStep + 1) / pages.length) * 100}%`,
                    backgroundColor: theme.primaryColor 
                  }}
                />
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-8 text-center">
            <motion.h1 
              className="text-3xl font-bold mb-4"
              style={{ color: theme.primaryColor }}
              initial={theme.animations ? { opacity: 0 } : {}}
              animate={theme.animations ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              {currentPage.title || currentPage.name}
            </motion.h1>
            {survey.description && currentStep === 0 && (
              <motion.p 
                className="text-gray-600 text-lg"
                initial={theme.animations ? { opacity: 0 } : {}}
                animate={theme.animations ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 }}
              >
                {survey.description}
              </motion.p>
            )}
          </div>

          {/* Page Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentPage.components?.map((component, index) => (
              <motion.div
                key={component.id}
                initial={theme.animations ? { opacity: 0, x: -20 } : {}}
                animate={theme.animations ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium" style={{ color: theme.textColor }}>
                  {component.label}
                  {component.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {component.helpText && (
                  <p className="text-sm text-gray-500">{component.helpText}</p>
                )}
                {renderComponent(component)}
              </motion.div>
            ))}

            {/* Navigation */}
            <motion.div
              initial={theme.animations ? { opacity: 0, y: 20 } : {}}
              animate={theme.animations ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="flex justify-between pt-6"
            >
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Previous
                </button>
              ) : <div />}

              {currentStep < pages.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  Submit Survey
                </button>
              )}
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default StructuredSurveyRenderer