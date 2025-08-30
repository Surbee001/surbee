"use client"

import React, { useState, useEffect } from 'react'

interface Question {
  id: string
  label: string
  type: string
  options?: string[]
  required?: boolean
}

interface Page {
  id: string
  title: string
  description?: string
  questions: Question[]
}

interface SurveyData {
  id: string
  title: string
  description?: string
  pages: Page[]
  theme?: {
    bgColor?: string
    fontColor?: string
    fontFamily?: string
    accentColor?: string
  }
}

interface LivePreviewRendererProps {
  surveyData: SurveyData
  className?: string
}

export const LivePreviewRenderer: React.FC<LivePreviewRendererProps> = ({
  surveyData,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(0)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Reset form when survey data changes
  useEffect(() => {
    setCurrentPage(0)
    setFormData({})
    setErrors({})
  }, [surveyData.id])

  if (!surveyData.pages || surveyData.pages.length === 0) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Survey Generated Yet
        </h3>
        <p className="text-gray-600">
          Start a conversation to generate your survey
        </p>
      </div>
    )
  }

  const handleInputChange = (questionId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors(prev => ({
        ...prev,
        [questionId]: ''
      }))
    }
  }

  const validateCurrentPage = () => {
    const currentPageData = surveyData.pages[currentPage]
    const newErrors: Record<string, string> = {}
    
    currentPageData.questions.forEach((question) => {
      if (question.required && !formData[question.id]) {
        newErrors[question.id] = 'This field is required'
      }
    })
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentPage()) {
      if (currentPage < surveyData.pages.length - 1) {
        setCurrentPage(prev => prev + 1)
      } else {
        handleSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    if (!validateCurrentPage()) return
    
    console.log('Survey submitted:', formData)
    alert('Survey preview completed! (This is just a preview)')
    
    // Reset form for continued testing
    setFormData({})
    setCurrentPage(0)
    setErrors({})
  }

  const renderQuestion = (question: Question) => {
    const value = formData[question.id] || ''
    const error = errors[question.id]

    switch (question.type) {
      case 'text':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your answer"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      case 'multiple-choice':
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {(question.options || []).map((option, index) => (
                <label key={index} className="flex items-center">
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={value === option}
                    onChange={(e) => handleInputChange(question.id, e.target.value)}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      case 'scale':
        const scaleOptions = question.options || ['1', '2', '3', '4', '5']
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {question.label}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex space-x-2">
              {scaleOptions.map((option, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleInputChange(question.id, index + 1)}
                  className={`px-3 py-2 rounded-lg border transition-colors ${
                    value === index + 1
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            {scaleOptions.length > 0 && (
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{scaleOptions[0]}</span>
                <span>{scaleOptions[scaleOptions.length - 1]}</span>
              </div>
            )}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )

      default:
        return (
          <div key={question.id} className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {question.label} <span className="text-xs text-gray-500">(Type: {question.type})</span>
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your answer"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )
    }
  }

  const currentPageData = surveyData.pages[currentPage]
  const progress = ((currentPage + 1) / surveyData.pages.length) * 100
  const theme = surveyData.theme || {}

  return (
    <div 
      className={`max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg ${className}`}
      style={{
        backgroundColor: theme.bgColor || '#ffffff',
        color: theme.fontColor || '#1f2937',
        fontFamily: theme.fontFamily || 'Inter, sans-serif'
      }}
    >
      {/* Preview Badge */}
      <div className="mb-4">
        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
          PREVIEW MODE
        </span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{surveyData.title}</h1>
        {surveyData.description && (
          <p className="text-gray-600">{surveyData.description}</p>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Page {currentPage + 1} of {surveyData.pages.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: `${progress}%`,
              backgroundColor: theme.accentColor || '#3b82f6'
            }}
          />
        </div>
      </div>

      {/* Current page content */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{currentPageData.title}</h2>
        {currentPageData.description && (
          <p className="text-gray-600 mb-6">{currentPageData.description}</p>
        )}
        {currentPageData.questions.map(renderQuestion)}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentPage === 0}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <button
          type="button"
          onClick={handleNext}
          className="px-6 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          style={{ backgroundColor: theme.accentColor || '#3b82f6' }}
        >
          {currentPage === surveyData.pages.length - 1 ? (
            'Complete Preview'
          ) : (
            'Next'
          )}
        </button>
      </div>
    </div>
  )
}

export default LivePreviewRenderer