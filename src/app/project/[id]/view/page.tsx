"use client";

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Settings2, 
  Eye, 
  BarChart3,
  Users,
  Share2,
  Bell,
  Palette,
  Globe,
  Lock,
  Shuffle,
  RefreshCw,
  Download,
  X,
  ChevronDown
} from 'lucide-react'
import { DeepSiteRenderer } from '../deepsite-integration/renderer/DeepSiteRenderer'
import type { AIGenerationOutput } from '@/lib/schemas/survey-schemas'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type ViewMode = 'preview' | 'responses'

export default function SurveyViewPage() {
  const { id } = useParams() as { id?: string }
  const router = useRouter()
  const projectId = id || 'preview'

  const [currentDevice, setCurrentDevice] = useState<'desktop' | 'tablet' | 'phone'>('desktop')
  const [surveyData, setSurveyData] = useState<AIGenerationOutput | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [responses] = useState([
    { id: '1', question: 'Your testimonial will be featured on AU\'s official Instagram page...', responses: 2, avgTime: '12:28' },
    { id: '2', question: 'Please share your testimonial in the space below...', responses: 2, avgTime: '8:45' },
    { id: '3', question: 'If possible, please upload your portrait/picture here...', responses: 1, avgTime: '5:12' }
  ])

  // Load survey from localStorage (same keys used by editor)
  useEffect(() => {
    try {
      const keys = [
        `surbee_survey_${projectId}`,
        `surbee_latest_survey`,
        'surbee_preview_survey'
      ]
      
      for (const key of keys) {
        const raw = localStorage.getItem(key)
        if (raw) {
          const parsed = JSON.parse(raw)
          setSurveyData(parsed)
          setLoading(false)
          return
        }
      }
      
      // If no survey found in localStorage, show error
      toast.error('Survey not found. Please create a survey first.')
      setLoading(false)
    } catch (error) {
      console.error('Error loading survey:', error)
      toast.error('Failed to load survey')
      setLoading(false)
    }
  }, [projectId])

  const handleGoBack = () => {
    router.push(`/project/${projectId}`)
  }

  const getDeviceStyles = () => {
    switch (currentDevice) {
      case 'phone':
        return 'w-[375px] max-w-full h-full'
      case 'tablet':
        return 'w-[768px] max-w-full h-full'
      default:
        return 'w-full h-full'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading survey...</p>
        </div>
      </div>
    )
  }

  if (!surveyData) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            No Survey Found
          </h1>
          <p className="text-gray-400 mb-6">
            This survey doesn't exist or hasn't been created yet.
          </p>
          <Button onClick={handleGoBack} variant="default">
            Back to Editor
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Main Content Area */}
      <div 
        className={`flex-1 flex transition-all duration-300 ease-in-out ${
          settingsOpen ? 'mr-96' : 'mr-0'
        }`}
      >
        {viewMode === 'preview' ? (
          <div className="flex-1 flex flex-col">
            {/* Top Control Bar */}
            <div className="flex items-center justify-between p-4 bg-[#1a1a1a] border-b border-zinc-800">
              {/* Left: Back and Mode switcher */}
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGoBack}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white"
                >
                  ← Back to Editor
                </Button>
                
                <div className="flex items-center bg-[#2a2a2a] rounded-lg">
                  <Button
                    variant={viewMode === 'preview' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('preview')}
                    className="px-4 py-2 rounded-l-lg bg-zinc-700/50 text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  <Button
                    variant={viewMode === 'responses' ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('responses')}
                    className="px-4 py-2 rounded-r-lg text-gray-400 hover:text-white hover:bg-zinc-700/30"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Responses
                  </Button>
                </div>
              </div>

              {/* Center: Device Controls - copied from project/id page */}
              <div className="flex items-center justify-center">
                <div className="relative flex h-8 min-w-[340px] max-w-[560px] items-center justify-between gap-2 rounded-md border border-zinc-800 bg-[#1a1a1a] px-2 text-sm">
                  {/* Device View Buttons */}
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setCurrentDevice('desktop')}
                      className={`p-1 rounded transition-colors ${
                        currentDevice === 'desktop' 
                          ? 'bg-zinc-700/50 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setCurrentDevice('tablet')}
                      className={`p-1 rounded transition-colors ${
                        currentDevice === 'tablet' 
                          ? 'bg-zinc-700/50 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
                      }`}
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setCurrentDevice('phone')}
                      className={`p-1 rounded transition-colors ${
                        currentDevice === 'phone' 
                          ? 'bg-zinc-700/50 text-white' 
                          : 'text-gray-400 hover:text-white hover:bg-zinc-700/30'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Center: Survey Title */}
                  <div className="flex-1 flex items-center justify-center px-4">
                    <span className="text-gray-300 truncate">
                      {surveyData.survey?.title || 'Untitled Survey'}
                    </span>
                  </div>

                  {/* Right: Preview indicator */}
                  <div className="text-gray-500 text-xs">
                    Live Preview
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  variant="ghost"
                  size="sm"
                  className={`text-gray-400 hover:text-white ${
                    settingsOpen ? 'bg-zinc-700/50 text-white' : ''
                  }`}
                >
                  <Settings2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Survey Preview - matches project/id renderer exactly */}
            <div className="flex-1 flex relative">
              <div className="flex-1 flex flex-col relative bg-[#1a1a1a] rounded-[0.625rem] border border-zinc-800 mt-0 mr-3 mb-3 ml-3 overflow-hidden">
                <div className="flex-1 overflow-hidden flex items-center justify-center">
                  <div className={`relative ${getDeviceStyles()} transition-all duration-300 ease-in-out`}>
                    {surveyData?.html ? (
                      <DeepSiteRenderer
                        html={surveyData.html}
                        deviceType={currentDevice}
                        title={surveyData.survey?.title || 'Survey Preview'}
                        className="h-full w-full"
                        onError={(error) => {
                          console.error('Survey render error:', error)
                          toast.error('Failed to render survey')
                        }}
                      />
                    ) : (
                      <div className="p-12 text-center bg-[#1a1a1a] rounded-lg">
                        <div className="text-6xl mb-4">📋</div>
                        <h2 className="text-xl font-semibold text-white mb-2">
                          No Survey Content
                        </h2>
                        <p className="text-gray-400 mb-4">
                          Create your first survey to see the preview here.
                        </p>
                        <Button onClick={handleGoBack}>
                          Go to Editor
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Responses View */
          <div className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              {/* Back button for responses view */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleGoBack}
                    variant="ghost" 
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    ← Back to Editor
                  </Button>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Responses Overview</h2>
                    <p className="text-gray-400">View and analyze survey responses</p>
                  </div>
                </div>
                <Button
                  onClick={() => setViewMode('preview')}
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-gray-300 hover:text-white"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Back to Preview
                </Button>
              </div>

              {/* Response Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-white">2</p>
                      <p className="text-sm text-gray-400">Total Responses</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-green-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-white">12:28</p>
                      <p className="text-sm text-gray-400">Avg. Completion Time</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Eye className="w-6 h-6 text-purple-400" />
                    </div>
                    <div className="ml-4">
                      <p className="text-2xl font-bold text-white">100%</p>
                      <p className="text-sm text-gray-400">Completion Rate</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Questions Response Breakdown */}
              <div className="space-y-6">
                {responses.map((question, index) => (
                  <div key={question.id} className="bg-[#1a1a1a] border border-zinc-800 rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="font-medium text-white mb-1">
                          {index + 1}. {question.question}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{question.responses} responses</span>
                          <span>Avg. time: {question.avgTime}</span>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-zinc-700 text-gray-300 hover:text-white"
                      >
                        View Details
                      </Button>
                    </div>
                    
                    {/* Sample response visualization */}
                    <div className="mt-4 p-4 bg-[#2a2a2a] rounded-lg">
                      <div className="text-sm text-gray-400 mb-2">Sample responses:</div>
                      <div className="space-y-2">
                        <div className="text-sm text-gray-300">"The exchange journey is ending, but my love for the new friends I've made..."</div>
                        <div className="text-sm text-gray-300">"My exchange experience at Ajman University was truly amazing! I enjoyed..."</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Sidebar - matches renderer window style */}
      {settingsOpen && (
        <div className="w-96 bg-[#1a1a1a] border-l border-zinc-800 flex flex-col h-screen">
          {/* Settings Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold text-white">Survey Settings</h2>
            <Button
              onClick={() => setSettingsOpen(false)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Settings Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Access & Sharing */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Access & Sharing</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-white">Who can respond</div>
                      <div className="text-xs text-gray-400">Anyone with the link</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Share2 className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-white">Share settings</div>
                      <div className="text-xs text-gray-400">Manage sharing options</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-white">Public visibility</div>
                      <div className="text-xs text-gray-400">Search engine indexing</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Response Options */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Response Options</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <div className="flex items-center">
                    <RefreshCw className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-white">Multiple responses</div>
                      <div className="text-xs text-gray-400">Allow repeat submissions</div>
                    </div>
                  </div>
                  <div className="w-8 h-4 bg-blue-500 rounded-full relative">
                    <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Shuffle className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-white">Question order</div>
                      <div className="text-xs text-gray-400">Randomize questions</div>
                    </div>
                  </div>
                  <div className="w-8 h-4 bg-gray-600 rounded-full relative">
                    <div className="absolute left-0 top-0 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </button>

                <button className="w-full flex items-center justify-between p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Bell className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-white">Email notifications</div>
                      <div className="text-xs text-gray-400">Get notified of responses</div>
                    </div>
                  </div>
                  <div className="w-8 h-4 bg-blue-500 rounded-full relative">
                    <div className="absolute right-0 top-0 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </button>
              </div>
            </div>

            {/* Appearance */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Appearance</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Palette className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-white">Theme & colors</div>
                      <div className="text-xs text-gray-400">Customize appearance</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h3 className="text-sm font-medium text-white mb-3">Data Management</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Download className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-white">Export responses</div>
                      <div className="text-xs text-gray-400">Download as CSV/Excel</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                
                <button className="w-full flex items-center justify-between p-3 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors">
                  <div className="flex items-center">
                    <Lock className="w-4 h-4 text-gray-400 mr-3" />
                    <div className="text-left">
                      <div className="text-sm text-white">Privacy settings</div>
                      <div className="text-xs text-gray-400">Data retention & GDPR</div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}