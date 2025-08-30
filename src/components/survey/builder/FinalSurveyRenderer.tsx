"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'

interface FinalSurveyRendererProps {
  code: string
  className?: string
}

// Parse the code to extract key information for a functional preview
const parseComponentInfo = (code: string) => {
  if (!code.trim()) return null

  // Extract title
  const titleMatch = code.match(/h1.*?['"`]([^'"`]+)['"`]/i) ||
                    code.match(/title.*?['"`]([^'"`]+)['"`]/i) ||
                    code.match(/Survey.*?['"`]([^'"`]+)['"`]/i)
  const title = titleMatch ? titleMatch[1] : 'Survey'
  
  // Extract description
  const descMatch = code.match(/description.*?['"`]([^'"`]+)['"`]/i) ||
                   code.match(/p.*?['"`]([^'"`]+)['"`]/i)
  const description = descMatch ? descMatch[1] : ''
  
  // Extract form fields with better parsing
  const textInputs = (code.match(/input.*?type=["']text["']/gi) || []).length
  const textareas = (code.match(/<textarea/gi) || []).length
  const radios = (code.match(/type=["']radio["']/gi) || []).length
  const checkboxes = (code.match(/type=["']checkbox["']/gi) || []).length
  const selects = (code.match(/<select/gi) || []).length
  const buttons = (code.match(/type=["']button["']|<button/gi) || []).length
  
  // Extract colors from the code
  const colorMatches = code.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g) || []
  const primaryColor = colorMatches.find(color => 
    code.indexOf(color) < code.indexOf('secondary') || 
    code.indexOf(color) < code.indexOf('accent')
  ) || '#3b82f6'
  
  // Check for animations
  const hasAnimations = code.includes('motion.') || code.includes('animate') || code.includes('transition')
  
  // Extract questions/labels
  const labelMatches = code.match(/label.*?['"`]([^'"`]+)['"`]/gi) || []
  const questions = labelMatches.map(match => {
    const labelMatch = match.match(/['"`]([^'"`]+)['"`]/)
    return labelMatch ? labelMatch[1] : 'Question'
  }).filter(q => q !== 'Question' && q.length > 2)

  return {
    title,
    description,
    questions,
    fieldCounts: {
      textInputs,
      textareas,
      radios,
      checkboxes,
      selects,
      buttons
    },
    style: {
      primaryColor,
      hasAnimations
    }
  }
}

export const FinalSurveyRenderer: React.FC<FinalSurveyRendererProps> = ({
  code,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [currentStep, setCurrentStep] = useState(0)

  // Parse component information
  const surveyInfo = useMemo(() => {
    if (!code.trim()) return null
    return parseComponentInfo(code)
  }, [code])

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
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
      document.body.removeChild(successDiv)
    }, 3000)
  }

  if (!code.trim()) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Ready to Create
          </h3>
          <p className="text-gray-400">
            Start a conversation to generate your survey
          </p>
        </div>
      </div>
    )
  }

  if (!surveyInfo) {
    return (
      <div className={`h-full flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Generating Survey...
          </h3>
          <p className="text-gray-400">
            Creating your custom component
          </p>
        </div>
      </div>
    )
  }

  const { title, description, questions, fieldCounts, style } = surveyInfo

  return (
    <div className={`h-full p-6 bg-gray-50 ${className}`}>
      <div className="h-full flex items-center justify-center">
        <motion.div 
          initial={style.hasAnimations ? { opacity: 0, y: 20 } : {}}
          animate={style.hasAnimations ? { opacity: 1, y: 0 } : {}}
          className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-8"
          style={{ 
            borderColor: style.primaryColor,
            borderWidth: '2px',
            borderStyle: 'solid'
          }}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.h1 
              className="text-3xl font-bold mb-4"
              style={{ color: style.primaryColor }}
              initial={style.hasAnimations ? { opacity: 0 } : {}}
              animate={style.hasAnimations ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              {title}
            </motion.h1>
            {description && (
              <motion.p 
                className="text-gray-600 text-lg"
                initial={style.hasAnimations ? { opacity: 0 } : {}}
                animate={style.hasAnimations ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 }}
              >
                {description}
              </motion.p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dynamic form fields based on parsed code */}
            {questions.map((question, index) => (
              <motion.div
                key={index}
                initial={style.hasAnimations ? { opacity: 0, x: -20 } : {}}
                animate={style.hasAnimations ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="space-y-2"
              >
                <label className="block text-sm font-medium text-gray-700">
                  {question}
                </label>
                
                {/* Render different input types based on the question content */}
                {question.toLowerCase().includes('email') ? (
                  <input
                    type="email"
                    value={formData[`q_${index}`] || ''}
                    onChange={(e) => handleInputChange(`q_${index}`, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': style.primaryColor } as any}
                    placeholder="Enter your email"
                  />
                ) : question.toLowerCase().includes('rate') || question.toLowerCase().includes('scale') ? (
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleInputChange(`q_${index}`, rating)}
                        className={`w-12 h-12 rounded-full border-2 font-semibold transition-all hover:scale-110 ${
                          formData[`q_${index}`] === rating
                            ? 'text-white shadow-lg'
                            : 'text-gray-600 border-gray-300 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: formData[`q_${index}`] === rating ? style.primaryColor : 'transparent',
                          borderColor: formData[`q_${index}`] === rating ? style.primaryColor : undefined
                        }}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                ) : question.toLowerCase().includes('comment') || question.toLowerCase().includes('describe') || question.toLowerCase().includes('tell') ? (
                  <textarea
                    value={formData[`q_${index}`] || ''}
                    onChange={(e) => handleInputChange(`q_${index}`, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all resize-none"
                    style={{ '--tw-ring-color': style.primaryColor } as any}
                    rows={4}
                    placeholder="Share your thoughts..."
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[`q_${index}`] || ''}
                    onChange={(e) => handleInputChange(`q_${index}`, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                    style={{ '--tw-ring-color': style.primaryColor } as any}
                    placeholder="Enter your answer"
                  />
                )}
              </motion.div>
            ))}

            {/* Generate some default fields if no questions were parsed */}
            {questions.length === 0 && (
              <>
                <motion.div
                  initial={style.hasAnimations ? { opacity: 0, x: -20 } : {}}
                  animate={style.hasAnimations ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    How would you rate your experience?
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => handleInputChange('rating', rating)}
                        className={`w-12 h-12 rounded-full border-2 font-semibold transition-all hover:scale-110 ${
                          formData.rating === rating
                            ? 'text-white shadow-lg'
                            : 'text-gray-600 border-gray-300 hover:border-gray-400'
                        }`}
                        style={{
                          backgroundColor: formData.rating === rating ? style.primaryColor : 'transparent',
                          borderColor: formData.rating === rating ? style.primaryColor : undefined
                        }}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={style.hasAnimations ? { opacity: 0, x: -20 } : {}}
                  animate={style.hasAnimations ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.5 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Any additional feedback?
                  </label>
                  <textarea
                    value={formData.feedback || ''}
                    onChange={(e) => handleInputChange('feedback', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all resize-none"
                    style={{ '--tw-ring-color': style.primaryColor } as any}
                    rows={4}
                    placeholder="Share your thoughts..."
                  />
                </motion.div>
              </>
            )}

            {/* Submit Button */}
            <motion.div
              initial={style.hasAnimations ? { opacity: 0, y: 20 } : {}}
              animate={style.hasAnimations ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="pt-4"
            >
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-lg text-white font-semibold text-lg transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: style.primaryColor }}
              >
                Submit Survey
              </button>
            </motion.div>
          </form>

          {/* Generated info footer */}
          <motion.div
            initial={style.hasAnimations ? { opacity: 0 } : {}}
            animate={style.hasAnimations ? { opacity: 1 } : {}}
            transition={{ delay: 0.8 }}
            className="mt-8 pt-6 border-t border-gray-200 text-center"
          >
            <p className="text-xs text-gray-500">
              This is your generated survey component in action
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default FinalSurveyRenderer