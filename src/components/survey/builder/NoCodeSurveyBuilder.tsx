"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Download, Code, Eye, Save } from 'lucide-react'
import ChatInput from '@/components/ui/chat-input'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import DynamicPreviewRenderer from './DynamicPreviewRenderer'

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

interface NoCodeSurveyBuilderProps {
  onSave?: (survey: GeneratedSurvey) => void
  onExport?: (survey: GeneratedSurvey) => void
}

export const NoCodeSurveyBuilder: React.FC<NoCodeSurveyBuilderProps> = ({
  onSave,
  onExport
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI survey builder. Describe the survey you'd like to create and I'll generate a complete React component for you. For example, you could say:\n\n• \"Create a customer satisfaction survey with rating scales\"\n• \"Build an employee feedback form with text inputs and multiple choice\"\n• \"Make a product review survey with conditional logic\"",
      timestamp: new Date()
    }
  ])
  const [currentSurvey, setCurrentSurvey] = useState<GeneratedSurvey | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCode, setShowCode] = useState(true)
  const [streamingCode, setStreamingCode] = useState('')
  const [generationStatus, setGenerationStatus] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (userMessage: string, images?: string[]) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
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

      // Simulate streaming the code character by character
      if (result.survey?.code) {
        setGenerationStatus('💻 Streaming generated code...')
        const code = result.survey.code
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
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.explanation || 'Survey generated successfully!',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMsg])

      if (result.survey) {
        setCurrentSurvey({
          id: result.survey.id || Date.now().toString(),
          title: result.survey.title || 'Generated Survey',
          description: result.survey.description || 'AI-generated survey',
          code: result.survey.code || '// No code generated',
          pages: result.survey.pages || [],
          theme: result.survey.theme || {}
        })
      }
    } catch (error) {
      console.error('Error generating survey:', error)
      setGenerationStatus('❌ Error occurred')
      setStreamingCode('')
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error generating your survey. Please try again.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMsg])
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
    <div className="h-screen bg-gray-50 flex">
      {/* Left Panel - Chat Interface */}
      <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">AI Survey Builder</h2>
          <p className="text-sm text-gray-600 mt-1">
            Describe your survey and I'll generate the React code
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  <div className={`text-xs mt-1 opacity-70`}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <span className="text-sm">Generating survey...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-200">
          <ChatInput
            onSendMessage={handleSendMessage}
            isInputDisabled={isGenerating}
            placeholder="Describe the survey you want to create..."
            className="w-full"
          />
        </div>
      </div>

      {/* Right Panel - Preview & Code */}
      <div className="w-1/2 flex flex-col">
        {/* Header with Controls */}
        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCode(false)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                !showCode ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-1" />
              Preview
            </button>
            <button
              onClick={() => setShowCode(true)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                showCode ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
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
              <div className="h-full overflow-auto p-6 bg-gray-50">
                {/* Generation Status in Preview */}
                {isGenerating && (
                  <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full mr-3"></div>
                      <span className="text-blue-700 font-medium">{generationStatus}</span>
                    </div>
                  </div>
                )}
                
                <DynamicPreviewRenderer
                  code={currentSurvey?.code || ''}
                  className="max-w-4xl mx-auto"
                />
              </div>
            )
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Ready to Build?
                </h3>
                <p className="text-gray-600">
                  Start by describing your survey in the chat on the left
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NoCodeSurveyBuilder