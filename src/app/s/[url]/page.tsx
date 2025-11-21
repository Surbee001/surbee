"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe, AlertTriangle, CheckCircle2, Users, Loader2 } from 'lucide-react'
import { SimpleSurveyRenderer } from '@/components/survey/SimpleSurveyRenderer'

interface PublishedSurvey {
  id: string
  title: string
  description?: string
  survey_schema: any
  published_at: string
}

export default function PublishedSurveyPage() {
  const params = useParams()
  const publishedUrl = params.url as string
  const [survey, setSurvey] = useState<PublishedSurvey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!publishedUrl) return

      try {
        setLoading(true)
        const response = await fetch(`/api/surveys/published/${publishedUrl}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError('Survey not found')
          } else {
            setError('Failed to load survey')
          }
          return
        }

        const data = await response.json()
        setSurvey(data)
      } catch (err) {
        console.error('Error loading survey:', err)
        setError('Failed to load survey')
      } finally {
        setLoading(false)
      }
    }

    fetchSurvey()
  }, [publishedUrl])

  const handleSurveyComplete = async (responses: Record<string, any>) => {
    console.log('Survey completed with responses:', responses)

    // TODO: Save responses to database
    // For now, just show the completion message
    setIsCompleted(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Unavailable</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The survey you\'re looking for is not available.'}
          </p>
        </motion.div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h1>
          <p className="text-gray-600 text-lg mb-6">
            Your responses have been recorded successfully.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">
              Your feedback is valuable and will help improve our services.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Survey Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Globe className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">{survey.title}</h1>
                {survey.description && (
                  <p className="text-sm text-gray-600">{survey.description}</p>
                )}
              </div>
            </div>
            <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              Published
            </div>
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div className="py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto px-6"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <SimpleSurveyRenderer
              surveyData={survey.survey_schema}
              surveyId={survey.id}
              onComplete={handleSurveyComplete}
              className="rounded-2xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
