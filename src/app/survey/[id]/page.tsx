"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Lock, Users } from 'lucide-react'
import { surveyManager, StoredSurvey } from '@/lib/survey-manager'
import { SimpleSurveyRenderer } from '@/components/survey/SimpleSurveyRenderer'

export default function PublishedSurveyPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.id as string
  const [survey, setSurvey] = useState<StoredSurvey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [passwordRequired, setPasswordRequired] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (surveyId) {
      try {
        const foundSurvey = surveyManager.getSurvey(surveyId)
        if (foundSurvey) {
          // Check if survey is published
          if (foundSurvey.status !== 'published') {
            setError('Survey is not published yet')
            setLoading(false)
            return
          }

          // Check if survey is expired
          if (foundSurvey.settings.expiresAt && new Date() > foundSurvey.settings.expiresAt) {
            setError('This survey has expired')
            setLoading(false)
            return
          }

          // Check if response limit is reached
          if (foundSurvey.settings.limitResponses &&
              foundSurvey.responseCount >= (foundSurvey.settings.limitResponses || 0)) {
            setError('This survey has reached its response limit')
            setLoading(false)
            return
          }

          setSurvey(foundSurvey)
          setPasswordRequired(foundSurvey.settings.requirePassword || false)
        } else {
          setError('Survey not found')
        }
      } catch (err) {
        setError('Failed to load survey')
        console.error('Error loading survey:', err)
      } finally {
        setLoading(false)
      }
    }
  }, [surveyId])

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (survey?.settings.password === password) {
      setPasswordRequired(false)
      setPasswordError('')
    } else {
      setPasswordError('Incorrect password')
    }
  }

  const handleSurveyComplete = (responses: Record<string, any>) => {
    console.log('Survey completed with responses:', responses)

    // Record the response
    if (surveyId) {
      surveyManager.recordResponse(surveyId)
    }

    setIsCompleted(true)
  }

  // Clean loading state - just white screen
  if (loading) {
    return <div className="min-h-screen bg-white" />
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Survey Unavailable</h1>
          <p className="text-gray-500 text-sm">
            {error || 'The survey you\'re looking for is not available.'}
          </p>
        </div>
      </div>
    )
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto border border-gray-100 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-gray-600" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Password Required</h1>
            <p className="text-gray-500 text-sm">
              This survey is password protected.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200 text-sm"
                placeholder="Enter password"
                required
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Access Survey
            </button>
          </form>
        </div>
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-500 text-sm">
            Your responses have been recorded successfully.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Survey Content - Full screen, no header clutter */}
      <SimpleSurveyRenderer
        surveyData={survey.data}
        surveyId={surveyId}
        onComplete={handleSurveyComplete}
      />
    </div>
  )
}
