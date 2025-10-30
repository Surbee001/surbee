"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Globe, Lock, AlertTriangle, CheckCircle2, Users } from 'lucide-react'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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

  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Password Required</h1>
            <p className="text-gray-600">
              This survey is password protected. Please enter the password to continue.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter password"
                required
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Access Survey
            </button>
          </form>
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
              🎉 Your feedback is valuable and will help improve our services.
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
                <h1 className="font-semibold text-gray-900">Live Survey</h1>
                <p className="text-sm text-gray-600">{survey.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{survey.responseCount} responses</span>
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Published
              </div>
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
              surveyData={survey.data}
              surveyId={surveyId}
              onComplete={handleSurveyComplete}
              className="rounded-2xl"
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}