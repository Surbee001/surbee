"use client"

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, ArrowLeft, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { surveyManager, StoredSurvey } from '@/lib/survey-manager'
import { PreviewRenderer } from '@/components/survey/PreviewRenderer'

export default function SurveyPreviewPage() {
  const params = useParams()
  const surveyId = params.id as string
  const [survey, setSurvey] = useState<StoredSurvey | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (surveyId) {
      try {
        const foundSurvey = surveyManager.getSurvey(surveyId)
        if (foundSurvey) {
          setSurvey(foundSurvey)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading survey preview...</p>
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Survey Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || 'The survey you\'re looking for doesn\'t exist or has been removed.'}
          </p>
          <Link 
            href="/visual-builder"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Builder
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Preview Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">Preview Mode</h1>
                <p className="text-sm text-gray-600">Testing: {survey.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {survey.status}
              </div>
              <Link 
                href="/visual-builder"
                className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Editor
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Survey Content */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl"
          >
            <PreviewRenderer 
              surveyData={survey.data}
              className="rounded-2xl"
            />
          </motion.div>

          {/* Preview Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6"
          >
            <h3 className="font-semibold text-blue-900 mb-2">Preview Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Survey ID:</span>
                <p className="text-blue-600 font-mono">{survey.id}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Created:</span>
                <p className="text-blue-600">{survey.createdAt.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Last Updated:</span>
                <p className="text-blue-600">{survey.updatedAt.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-blue-100 rounded-lg">
              <p className="text-blue-800 text-sm">
                📋 This is a preview - responses are not saved. Use this to test your survey before publishing.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}