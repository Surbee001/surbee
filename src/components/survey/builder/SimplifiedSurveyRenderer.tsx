"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'

interface SurveyPage {
  id: string
  name: string
  title: string
  description?: string
  type: 'welcome' | 'contact' | 'questions' | 'thank-you' | 'custom'
  questions?: Array<{
    id: string
    label: string
    type: string
    required?: boolean
    options?: string[]
  }>
}

interface SimplifiedSurveyRendererProps {
  code: string
  currentPageId?: string
  onPageChange?: (pages: SurveyPage[]) => void
  className?: string
}

// Enhanced parser to extract multi-page survey structure
const parseMultiPageSurvey = (code: string): SurveyPage[] => {
  if (!code.trim()) return []

  const pages: SurveyPage[] = []

  // Extract title for overall survey
  const titleMatch = code.match(/h1.*?['"`]([^'"`]+)['"`]/i) ||
                    code.match(/title.*?['"`]([^'"`]+)['"`]/i)
  const surveyTitle = titleMatch ? titleMatch[1] : 'Survey'

  // Check if the survey appears to be multi-page
  const hasMultiplePages = code.includes('currentPage') || 
                          code.includes('setCurrentPage') ||
                          code.includes('handleNext') ||
                          code.includes('Previous') ||
                          code.includes('step')

  if (hasMultiplePages) {
    // Extract page structure from code
    const pageArrayMatch = code.match(/pages\s*=\s*(\[[\s\S]*?\])/i)
    if (pageArrayMatch) {
      try {
        // Try to extract page information
        const pagesText = pageArrayMatch[1]
        // Look for page titles/names in the structure
        const pageTitleMatches = pagesText.match(/(title|name).*?['"`]([^'"`]+)['"`]/gi) || []
        
        pageTitleMatches.forEach((match, index) => {
          const titleMatch = match.match(/['"`]([^'"`]+)['"`]/)
          if (titleMatch) {
            const pageTitle = titleMatch[1]
            pages.push({
              id: `page_${index + 1}`,
              name: pageTitle,
              title: pageTitle,
              type: determinePageType(pageTitle, index),
              questions: extractQuestionsForPage(code, index)
            })
          }
        })
      } catch (e) {
        console.log('Could not parse page structure, creating default pages')
      }
    }

    // If no pages were extracted, create intelligent default pages
    if (pages.length === 0) {
      const questions = extractAllQuestions(code)
      const questionPages = Math.ceil(questions.length / 3) // Max 3 questions per page
      
      pages.push({
        id: 'welcome',
        name: 'Welcome',
        title: `Welcome to ${surveyTitle}`,
        description: 'Thank you for participating in our survey',
        type: 'welcome'
      })

      // Create question pages
      for (let i = 0; i < questionPages; i++) {
        const startIdx = i * 3
        const pageQuestions = questions.slice(startIdx, startIdx + 3)
        pages.push({
          id: `questions_${i + 1}`,
          name: `Questions ${i + 1}`,
          title: `Survey Questions ${questionPages > 1 ? `(${i + 1}/${questionPages})` : ''}`,
          type: 'questions',
          questions: pageQuestions
        })
      }

      pages.push({
        id: 'thank_you',
        name: 'Thank You',
        title: 'Thank You!',
        description: 'Your responses have been submitted successfully',
        type: 'thank-you'
      })
    }
  } else {
    // Single page survey
    const questions = extractAllQuestions(code)
    if (questions.length > 0) {
      pages.push({
        id: 'single_page',
        name: surveyTitle,
        title: surveyTitle,
        type: 'questions',
        questions
      })
    }
  }

  return pages
}

const determinePageType = (title: string, index: number): SurveyPage['type'] => {
  const titleLower = title.toLowerCase()
  if (titleLower.includes('welcome') || titleLower.includes('intro') || index === 0) {
    return 'welcome'
  }
  if (titleLower.includes('contact') || titleLower.includes('info') || titleLower.includes('details')) {
    return 'contact'
  }
  if (titleLower.includes('thank') || titleLower.includes('complete') || titleLower.includes('finish')) {
    return 'thank-you'
  }
  return 'questions'
}

const extractAllQuestions = (code: string) => {
  const labelMatches = code.match(/label.*?['"`]([^'"`]+)['"`]/gi) || []
  return labelMatches.map((match, index) => {
    const labelMatch = match.match(/['"`]([^'"`]+)['"`]/)
    const label = labelMatch ? labelMatch[1] : `Question ${index + 1}`
    
    // Determine question type based on content
    const type = label.toLowerCase().includes('email') ? 'email' :
                label.toLowerCase().includes('rate') || label.toLowerCase().includes('scale') ? 'rating' :
                label.toLowerCase().includes('comment') || label.toLowerCase().includes('describe') ? 'textarea' :
                'text'
    
    return {
      id: `q_${index}`,
      label,
      type,
      required: code.includes('required')
    }
  }).filter(q => q.label !== `Question ${labelMatches.indexOf(q.label) + 1}` && q.label.length > 2)
}

const extractQuestionsForPage = (code: string, pageIndex: number) => {
  // This would extract questions specific to a page if the code structure allows
  return extractAllQuestions(code)
}

export const SimplifiedSurveyRenderer: React.FC<SimplifiedSurveyRendererProps> = ({
  code,
  currentPageId,
  onPageChange,
  className = ''
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [currentStep, setCurrentStep] = useState(0)

  // Parse the survey structure
  const surveyPages = useMemo(() => {
    const pages = parseMultiPageSurvey(code)
    return pages
  }, [code])

  // Notify parent about page changes
  useEffect(() => {
    if (surveyPages.length > 0 && onPageChange) {
      onPageChange(surveyPages)
    }
  }, [surveyPages, onPageChange])

  // Find current page
  const currentPage = currentPageId 
    ? surveyPages.find(p => p.id === currentPageId) || surveyPages[0]
    : surveyPages[currentStep] || surveyPages[0]

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const handleNext = () => {
    if (currentStep < surveyPages.length - 1) {
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

  if (!code.trim()) {
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

  if (!currentPage) {
    return (
      <div className={`h-full flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Generating Survey...
          </h3>
        </div>
      </div>
    )
  }

  // Extract colors from code for styling
  const colorMatches = code.match(/#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}/g) || []
  const primaryColor = colorMatches[0] || '#3b82f6'
  const hasAnimations = code.includes('motion.') || code.includes('animate')

  return (
    <div className={`h-full bg-gray-50 ${className}`}>
      <div className="h-full flex items-center justify-center p-6">
        <motion.div 
          initial={hasAnimations ? { opacity: 0, y: 20 } : {}}
          animate={hasAnimations ? { opacity: 1, y: 0 } : {}}
          className="w-full max-w-2xl bg-white rounded-xl shadow-xl p-8"
          style={{ 
            borderColor: primaryColor,
            borderWidth: '2px',
            borderStyle: 'solid'
          }}
        >
          {/* Progress indicator for multi-page surveys */}
          {surveyPages.length > 1 && (
            <div className="mb-6">
              <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep + 1} of {surveyPages.length}</span>
                <span>{Math.round(((currentStep + 1) / surveyPages.length) * 100)}% complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${((currentStep + 1) / surveyPages.length) * 100}%`,
                    backgroundColor: primaryColor 
                  }}
                />
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-8 text-center">
            <motion.h1 
              className="text-3xl font-bold mb-4"
              style={{ color: primaryColor }}
              initial={hasAnimations ? { opacity: 0 } : {}}
              animate={hasAnimations ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
            >
              {currentPage.title}
            </motion.h1>
            {currentPage.description && (
              <motion.p 
                className="text-gray-600 text-lg"
                initial={hasAnimations ? { opacity: 0 } : {}}
                animate={hasAnimations ? { opacity: 1 } : {}}
                transition={{ delay: 0.3 }}
              >
                {currentPage.description}
              </motion.p>
            )}
          </div>

          {/* Page Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {currentPage.type === 'welcome' && (
              <motion.div
                initial={hasAnimations ? { opacity: 0, y: 20 } : {}}
                animate={hasAnimations ? { opacity: 1, y: 0 } : {}}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">👋</div>
                <p className="text-gray-600 text-lg">
                  We're excited to hear from you! This survey should take about 5 minutes to complete.
                </p>
              </motion.div>
            )}

            {currentPage.type === 'thank-you' && (
              <motion.div
                initial={hasAnimations ? { opacity: 0, y: 20 } : {}}
                animate={hasAnimations ? { opacity: 1, y: 0 } : {}}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-gray-600 text-lg">
                  Thank you for taking the time to complete our survey. Your feedback is valuable to us!
                </p>
              </motion.div>
            )}

            {(currentPage.type === 'questions' || currentPage.type === 'contact') && currentPage.questions && (
              currentPage.questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={hasAnimations ? { opacity: 0, x: -20 } : {}}
                  animate={hasAnimations ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    {question.label}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  
                  {question.type === 'email' ? (
                    <input
                      type="email"
                      value={formData[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder="Enter your email"
                      required={question.required}
                    />
                  ) : question.type === 'rating' ? (
                    <div className="flex space-x-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => handleInputChange(question.id, rating)}
                          className={`w-12 h-12 rounded-full border-2 font-semibold transition-all hover:scale-110 ${
                            formData[question.id] === rating
                              ? 'text-white shadow-lg'
                              : 'text-gray-600 border-gray-300 hover:border-gray-400'
                          }`}
                          style={{
                            backgroundColor: formData[question.id] === rating ? primaryColor : 'transparent',
                            borderColor: formData[question.id] === rating ? primaryColor : undefined
                          }}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  ) : question.type === 'textarea' ? (
                    <textarea
                      value={formData[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all resize-none"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      rows={4}
                      placeholder="Share your thoughts..."
                      required={question.required}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all"
                      style={{ '--tw-ring-color': primaryColor } as any}
                      placeholder="Enter your answer"
                      required={question.required}
                    />
                  )}
                </motion.div>
              ))
            )}

            {/* Navigation */}
            <motion.div
              initial={hasAnimations ? { opacity: 0, y: 20 } : {}}
              animate={hasAnimations ? { opacity: 1, y: 0 } : {}}
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

              {currentStep < surveyPages.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 rounded-lg text-white font-semibold transition-all hover:shadow-lg"
                  style={{ backgroundColor: primaryColor }}
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

export default SimplifiedSurveyRenderer