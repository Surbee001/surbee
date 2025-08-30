"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Download, Code, Eye, Save } from 'lucide-react'
import ChatInput from '@/components/ui/chat-input'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import FinalSurveyRenderer from './FinalSurveyRenderer'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface GeneratedSurvey {
  id: string
  title: string
  description: string
  code: string
  pages?: any[]
  theme?: any
}

interface ProjectSurveyBuilderProps {
  onSave?: (survey: GeneratedSurvey) => void
  onExport?: (survey: GeneratedSurvey) => void
  className?: string
}

export const ProjectSurveyBuilder: React.FC<ProjectSurveyBuilderProps> = ({
  onSave,
  onExport,
  className = ''
}) => {
  const [currentSurvey, setCurrentSurvey] = useState<GeneratedSurvey | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCode, setShowCode] = useState(false) // Default to preview mode
  const [streamingCode, setStreamingCode] = useState('')
  const [generationStatus, setGenerationStatus] = useState('')

  // Normalize/sanitize AI output to avoid markdown wrappers and duplication
  const sanitizeGeneratedCode = (raw: string): string => {
    if (!raw) return ''
    let text = raw.trim()
    // Prefer first fenced code block if present
    const fenceMatch = text.match(/```(?:tsx|jsx|typescript|javascript)?\s*([\s\S]*?)\s*```/i)
    if (fenceMatch && fenceMatch[1]) {
      text = fenceMatch[1].trim()
    } else {
      // Strip stray fences if present without proper capture
      text = text.replace(/```[a-zA-Z]*\s*|```/g, '').trim()
    }
    // Remove leading explanations commonly returned by models
    text = text.replace(/^.*?(?=import\s|"use client"|\'use client\')/s, '')
    // If the content is duplicated back-to-back, keep the first half
    if (text.length > 1000) {
      const half = Math.floor(text.length / 2)
      const first = text.slice(0, half)
      const second = text.slice(text.length - half)
      if (first === second) text = first
    }
    return text.trim()
  }

  const handleSendMessage = async (userMessage: string, images?: string[]) => {
    setIsGenerating(true)
    setStreamingCode('')
    setGenerationStatus('🤖 Analyzing your request...')

    try {
      // Simulate real-time code generation with status updates
      const statuses = [
        '🤖 Analyzing your request...',
        '🎨 Designing the component structure...',
        '⚡ Generating React code...',
        '🎯 Adding styling and interactions...',
        '✨ Finalizing the component...'
      ]

      let statusIndex = 0
      const statusInterval = setInterval(() => {
        if (statusIndex < statuses.length - 1) {
          setGenerationStatus(statuses[++statusIndex])
        }
      }, 1000)

      // Call the AI survey generation API
      const response = await fetch('/api/survey-builder/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          images,
          currentSurvey: currentSurvey?.code || undefined
        }),
      })

      clearInterval(statusInterval)

      if (!response.ok) {
        throw new Error('Failed to generate survey')
      }

      const result = await response.json()

      // Sanitize code for renderer and preview
      const normalizedCode = sanitizeGeneratedCode(result.survey?.code || '')

      // Simulate streaming the code character by character
      if (normalizedCode) {
        setGenerationStatus('💻 Streaming generated code...')
        const code = normalizedCode
        let currentIndex = 0
        
        const streamInterval = setInterval(() => {
          if (currentIndex < code.length) {
            setStreamingCode(code.substring(0, currentIndex + 50)) // Stream in chunks
            currentIndex += 50
          } else {
            clearInterval(streamInterval)
            setGenerationStatus('✅ Generation complete!')
            setTimeout(() => setGenerationStatus(''), 2000)
          }
        }, 100)
      }

      if (result.survey) {
        setCurrentSurvey({
          id: result.survey.id || Date.now().toString(),
          title: result.survey.title || 'Generated Survey',
          description: result.survey.description || 'AI-generated survey',
          code: normalizedCode || '// No code generated',
          pages: result.survey.pages || [],
          theme: result.survey.theme || {}
        })
      }
    } catch (error) {
      console.error('Error generating survey:', error)
      setGenerationStatus('❌ Error occurred')
      setStreamingCode('')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = () => {
    if (currentSurvey && onSave) {
      onSave(currentSurvey)
    }
  }

  const handleExport = () => {
    if (currentSurvey && onExport) {
      onExport(currentSurvey)
    } else if (currentSurvey) {
      // Default export as download
      const blob = new Blob([currentSurvey.code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${currentSurvey.title.replace(/\s+/g, '-')}.tsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className={`h-full bg-[#1a1a1a] flex flex-col ${className}`}>
      {/* Header with Controls */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowCode(false)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              !showCode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-1" />
            Survey
          </button>
          <button
            onClick={() => setShowCode(true)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              showCode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Code className="w-4 h-4 inline mr-1" />
            Code
          </button>
        </div>
        
        {currentSurvey && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {currentSurvey || streamingCode || isGenerating ? (
          showCode ? (
            <div className="h-full overflow-auto">
              {/* Generation Status */}
              {generationStatus && (
                <div className="bg-blue-50 border-b border-blue-200 p-3">
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
                    <span className="text-blue-700 font-medium">{generationStatus}</span>
                  </div>
                </div>
              )}
              
              <SyntaxHighlighter
                language="tsx"
                style={oneDark}
                className="h-full text-sm"
                showLineNumbers
              >
                {streamingCode || currentSurvey?.code || '// Generating your custom React component...'}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="h-full overflow-auto">
              {/* Generation Status in Preview */}
              {isGenerating && (
                <div className="m-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                    <span className="text-blue-700 font-medium">{generationStatus}</span>
                  </div>
                </div>
              )}
              
              <FinalSurveyRenderer
                code={currentSurvey?.code || ''}
                className="h-full"
              />
            </div>
          )
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Ready to Build?
              </h3>
              <p className="text-gray-400">
                Chat with AI to create your custom survey
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-zinc-800">
        <ChatInput
          onSendMessage={handleSendMessage}
          isInputDisabled={isGenerating}
          placeholder="Describe the survey you want to create..."
          className="w-full"
        />
      </div>
    </div>
  )
}

export default ProjectSurveyBuilder