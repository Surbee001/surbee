"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Eye, Share2, Settings, Copy, ExternalLink, 
  Calendar, Users, Lock, Globe, CheckCircle2 
} from 'lucide-react'
import { surveyManager, SurveyMetadata } from '@/lib/survey-manager'
import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  surveyData: AIGenerationOutput
  surveyId?: string
  projectId?: string
}

export const PublishModal: React.FC<PublishModalProps> = ({
  isOpen,
  onClose,
  surveyData,
  surveyId,
  projectId
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'publish'>('preview')
  const [publishSettings, setPublishSettings] = useState({
    allowAnonymous: true,
    requirePassword: false,
    password: '',
    limitResponses: false,
    maxResponses: 100,
    expiresAt: ''
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)

  const handleGeneratePreview = async () => {
    setLoading(true)
    try {
      // Save as draft first if no surveyId
      let currentSurveyId = surveyId
      if (!currentSurveyId) {
        const draft = surveyManager.saveDraft(surveyData, 'anonymous', projectId)
        currentSurveyId = draft.id
      } else if (projectId) {
        // Associate existing survey with project
        surveyManager.setProjectId(currentSurveyId, projectId)
      }

      const result = surveyManager.generatePreview(currentSurveyId)
      if (result.success && result.previewUrl) {
        setPreviewUrl(result.previewUrl)
        // Also save to localStorage for the view/form pages
        if (projectId) {
          localStorage.setItem(`surbee_survey_${projectId}`, JSON.stringify(surveyData))
        }
        localStorage.setItem('surbee_latest_survey', JSON.stringify(surveyData))
        localStorage.setItem('surbee_preview_survey', JSON.stringify(surveyData))
        setSuccess('Preview URL generated successfully!')
      } else {
        throw new Error(result.error || 'Failed to generate preview')
      }
    } catch (error) {
      console.error('Failed to generate preview:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePublish = async () => {
    setLoading(true)
    try {
      // Save as draft first if no surveyId
      let currentSurveyId = surveyId
      if (!currentSurveyId) {
        const draft = surveyManager.saveDraft(surveyData, 'anonymous', projectId)
        currentSurveyId = draft.id
      } else if (projectId) {
        // Associate existing survey with project
        surveyManager.setProjectId(currentSurveyId, projectId)
      }

      const settings: Partial<SurveyMetadata['settings']> = {
        allowAnonymous: publishSettings.allowAnonymous,
        requirePassword: publishSettings.requirePassword,
        password: publishSettings.requirePassword ? publishSettings.password : undefined,
        limitResponses: publishSettings.limitResponses ? publishSettings.maxResponses : undefined,
        expiresAt: publishSettings.expiresAt ? new Date(publishSettings.expiresAt) : undefined
      }

      const result = surveyManager.publishSurvey(currentSurveyId, settings)
      if (result.success && result.publishedUrl) {
        setPublishedUrl(result.publishedUrl)
        // Also save to localStorage for the view/form pages
        if (projectId) {
          localStorage.setItem(`surbee_survey_${projectId}`, JSON.stringify(surveyData))
        }
        localStorage.setItem('surbee_latest_survey', JSON.stringify(surveyData))
        localStorage.setItem('surbee_preview_survey', JSON.stringify(surveyData))
        setSuccess('Survey published successfully!')
      } else {
        throw new Error(result.error || 'Failed to publish survey')
      }
    } catch (error) {
      console.error('Failed to publish survey:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setSuccess('URL copied to clipboard!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Share Your Survey</h2>
              <p className="text-gray-600 text-sm mt-1">
                {surveyData.survey?.title || 'Untitled Survey'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Success Message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-green-700 text-sm">{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 px-6 text-sm font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Preview & Test
            </button>
            <button
              onClick={() => setActiveTab('publish')}
              className={`flex-1 py-3 px-6 text-sm font-medium transition-colors ${
                activeTab === 'publish'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Share2 className="w-4 h-4 inline mr-2" />
              Publish Live
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {activeTab === 'preview' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Generate Preview URL
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Create a shareable preview link to test your survey before publishing.
                    Perfect for collecting feedback from team members.
                  </p>
                  
                  {previewUrl ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-blue-800 font-medium text-sm mb-1">Preview URL Ready</p>
                          <code className="text-blue-600 text-xs break-all">{previewUrl}</code>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => copyToClipboard(previewUrl)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => window.open(previewUrl, '_blank')}
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGeneratePreview}
                      disabled={loading}
                      className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                    >
                      {loading ? 'Generating...' : 'Generate Preview URL'}
                    </button>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Preview Features</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Test all components</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Share with team</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">No data collection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Private access only</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Publish Survey
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Make your survey live and start collecting real responses from participants.
                  </p>
                </div>

                {/* Publishing Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Allow Anonymous Responses</label>
                      <p className="text-gray-600 text-xs">Let people respond without signing in</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publishSettings.allowAnonymous}
                      onChange={(e) => setPublishSettings(prev => ({ ...prev, allowAnonymous: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Require Password</label>
                      <p className="text-gray-600 text-xs">Protect with a password</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publishSettings.requirePassword}
                      onChange={(e) => setPublishSettings(prev => ({ ...prev, requirePassword: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {publishSettings.requirePassword && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        value={publishSettings.password}
                        onChange={(e) => setPublishSettings(prev => ({ ...prev, password: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter password"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-900">Limit Responses</label>
                      <p className="text-gray-600 text-xs">Set maximum number of responses</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={publishSettings.limitResponses}
                      onChange={(e) => setPublishSettings(prev => ({ ...prev, limitResponses: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>

                  {publishSettings.limitResponses && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Max Responses</label>
                      <input
                        type="number"
                        value={publishSettings.maxResponses}
                        onChange={(e) => setPublishSettings(prev => ({ ...prev, maxResponses: parseInt(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiration Date (Optional)
                    </label>
                    <input
                      type="datetime-local"
                      value={publishSettings.expiresAt}
                      onChange={(e) => setPublishSettings(prev => ({ ...prev, expiresAt: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {publishedUrl ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4 text-green-600" />
                          <p className="text-green-800 font-medium text-sm">Survey Published!</p>
                        </div>
                        <code className="text-green-600 text-xs break-all">{publishedUrl}</code>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => copyToClipboard(publishedUrl)}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => window.open(publishedUrl, '_blank')}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handlePublish}
                    disabled={loading || (publishSettings.requirePassword && !publishSettings.password)}
                    className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium transition-colors"
                  >
                    {loading ? 'Publishing...' : 'Publish Survey'}
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PublishModal