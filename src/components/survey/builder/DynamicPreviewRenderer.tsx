"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'

interface DynamicPreviewRendererProps {
  code: string
  className?: string
}

// Since we can't use eval/Function for security reasons, 
// we'll create a simple preview that shows a parsed version
const createSimplePreview = (code: string) => {
  // Extract basic information from the code
  const titleMatch = code.match(/h1.*?['"`]([^'"`]+)['"`]/i) ||
                    code.match(/title.*?['"`]([^'"`]+)['"`]/i)
  const title = titleMatch ? titleMatch[1] : 'Generated Survey'
  
  // Extract form fields
  const inputMatches = code.match(/input.*?type=.*?['"`]([^'"`]+)['"`]/gi) || []
  const textareaMatches = code.match(/textarea/gi) || []
  const buttonMatches = code.match(/button.*?['"`]([^'"`]+)['"`]/gi) || []
  
  const fields = [
    ...inputMatches.map((match, i) => ({ type: 'input', id: `input_${i}` })),
    ...textareaMatches.map((match, i) => ({ type: 'textarea', id: `textarea_${i}` })),
  ]

  return { title, fields, buttons: buttonMatches.length }
}

export const DynamicPreviewRenderer: React.FC<DynamicPreviewRendererProps> = ({
  code,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})

  // Parse the code to create a simple preview
  const surveyInfo = useMemo(() => {
    if (!code.trim()) return null
    return createSimplePreview(code)
  }, [code])

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Survey submitted (preview):', formData)
    alert('Survey preview completed! Data: ' + JSON.stringify(formData, null, 2))
  }

  if (!code.trim()) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-6xl mb-4">🎨</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Ready to Create
        </h3>
        <p className="text-gray-600">
          Start a conversation to generate your custom survey
        </p>
      </div>
    )
  }

  if (!surveyInfo) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="text-6xl mb-4">🔄</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Generating Preview...
        </h3>
        <p className="text-gray-600">
          Creating your custom survey component
        </p>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Preview Badge */}
      <div className="mb-4">
        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
          PREVIEW MODE - Generated Component
        </span>
      </div>
      
      {/* Simple Preview of Generated Survey */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{surveyInfo.title}</h1>
          <p className="text-gray-600">Preview of your generated survey component</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {surveyInfo.fields.map((field, index) => (
            <div key={field.id}>
              {field.type === 'input' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sample Question {index + 1}
                  </label>
                  <input
                    type="text"
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your answer"
                  />
                </div>
              )}
              
              {field.type === 'textarea' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comments {index + 1}
                  </label>
                  <textarea
                    value={formData[field.id] || ''}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your comments"
                    rows={3}
                  />
                </div>
              )}
            </div>
          ))}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Survey (Preview)
            </button>
          </div>
        </form>

        {/* Note about the generated code */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> This is a simplified preview. The actual generated component includes:
            <br />• Full styling and animations as requested
            <br />• Custom layouts and interactions
            <br />• Advanced form validation
            <br />• Framer Motion animations (if requested)
            <br />• All custom styling and design elements
          </p>
        </div>
      </div>
    </div>
  )
}

export default DynamicPreviewRenderer