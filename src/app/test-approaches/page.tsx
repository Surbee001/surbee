"use client"

import React, { useState } from 'react'
import { api } from '@/lib/trpc/react'
import { SimpleSurveyRenderer } from '@/components/survey/SimpleSurveyRenderer'
import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'
import { motion } from 'framer-motion'
import { Zap, Brain, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react'

export default function TestApproachesPage() {
  const [prompt, setPrompt] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [selectedApproach, setSelectedApproach] = useState<'hybrid' | 'pureAI' | 'template' | null>(null)
  
  const testApproaches = api.survey.testApproaches.useMutation()

  const handleTest = async () => {
    if (!prompt.trim()) return
    
    setLoading(true)
    try {
      const result = await testApproaches.mutateAsync({ prompt })
      setResults(result)
      console.log('Test results:', result)
    } catch (error) {
      console.error('Test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const approaches = results?.approaches ? [
    {
      id: 'hybrid',
      name: 'Hybrid (Template + AI)',
      description: 'Starts with a template and customizes with AI',
      icon: Brain,
      color: 'blue',
      data: results.approaches?.hybrid,
      stats: {
        components: results.approaches?.hybrid?.survey?.pages?.[0]?.components?.length || 0,
        templateUsed: results.approaches?.hybrid?.metadata?.templateUsed || 'None',
        generationTime: 'Fast'
      }
    },
    {
      id: 'pureAI',
      name: 'Pure AI (v0-style)',
      description: 'AI generates everything from scratch',
      icon: Zap,
      color: 'purple',
      data: results.approaches?.pureAI,
      stats: {
        components: results.approaches?.pureAI?.survey?.pages?.[0]?.components?.length || 0,
        templateUsed: 'None (AI Generated)',
        generationTime: 'Slow'
      }
    },
    {
      id: 'template',
      name: 'Template Only',
      description: 'Uses existing template without AI modifications',
      icon: FileText,
      color: 'green',
      data: results.approaches?.template,
      stats: {
        components: results.approaches?.template?.survey?.pages?.[0]?.components?.length || 0,
        templateUsed: results.approaches?.template?.metadata?.templateUsed || 'Auto-selected',
        generationTime: 'Instant'
      }
    }
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Survey Generation Approach Testing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare hybrid template+AI generation vs pure AI generation vs template-only approaches
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Survey Prompt
              </label>
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Create a customer feedback survey for a restaurant"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleTest}
                disabled={loading || !prompt.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Testing...
                  </div>
                ) : (
                  'Test All Approaches'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-8">
            {/* Approach Comparison Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {approaches.map((approach) => {
                const isSelected = selectedApproach === approach.id
                return (
                  <motion.div
                    key={approach.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'ring-4 ring-blue-500 shadow-2xl' 
                        : 'hover:shadow-xl'
                    }`}
                    onClick={() => setSelectedApproach(approach.id as any)}
                  >
                    <div className="bg-white rounded-xl p-6 h-full">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`p-3 rounded-lg ${
                          approach.color === 'blue' ? 'bg-blue-100' :
                          approach.color === 'purple' ? 'bg-purple-100' :
                          'bg-green-100'
                        }`}>
                          <approach.icon className={`w-6 h-6 ${
                            approach.color === 'blue' ? 'text-blue-600' :
                            approach.color === 'purple' ? 'text-purple-600' :
                            'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{approach.name}</h3>
                          <p className="text-sm text-gray-600">{approach.description}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Components:</span>
                          <span className="font-semibold">{approach.stats.components}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Template:</span>
                          <span className="font-semibold text-xs">{approach.stats.templateUsed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Speed:</span>
                          <span className={`font-semibold text-xs ${
                            approach.stats.generationTime === 'Instant' ? 'text-green-600' :
                            approach.stats.generationTime === 'Fast' ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {approach.stats.generationTime}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm font-semibold text-gray-700 mb-2">Survey Title:</div>
                        <div className="text-sm text-gray-600">{approach.data.survey?.title}</div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Survey Preview */}
            {selectedApproach && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <h2 className="text-2xl font-bold">
                    {approaches.find(a => a.id === selectedApproach)?.name} Preview
                  </h2>
                  <p className="opacity-90">
                    {approaches.find(a => a.id === selectedApproach)?.description}
                  </p>
                </div>
                
                <div className="p-6">
                  <SimpleSurveyRenderer
                    surveyData={approaches.find(a => a.id === selectedApproach)?.data.aiOutput}
                    surveyId={`test-${selectedApproach}`}
                    onComplete={(responses) => {
                      console.log('Test survey completed:', responses)
                    }}
                    onError={(error) => {
                      console.error('Test survey error:', error)
                    }}
                  />
                </div>
              </motion.div>
            )}

            {/* Available Templates */}
            {results.availableTemplates && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Available Templates</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {results.availableTemplates.map((template: any) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      <div className="text-xs text-gray-500">
                        Category: {template.category} • {template.components.length} components
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        {!results && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">How to Test</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Enter a Prompt</h4>
                  <p className="text-sm text-gray-600">
                    Describe the survey you want to create. Be specific about the purpose and audience.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-purple-600 font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Test All Approaches</h4>
                  <p className="text-sm text-gray-600">
                    Click the button to generate surveys using all three approaches simultaneously.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-green-600 font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Compare Results</h4>
                  <p className="text-sm text-gray-600">
                    Click on each approach card to preview the generated survey and compare quality.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}