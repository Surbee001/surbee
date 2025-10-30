"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ThinkingDisplay } from '@/components/thinking-display'
import { ToolCall } from '@/components/tool-call'
import { Send, Hammer, FileCode } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Message {
  role: 'user' | 'assistant'
  content: string
  agent?: string
  thinking?: {
    steps: Array<{ id: string; content: string; status: 'thinking' | 'complete' }>
    duration: number
  }
  toolCalls?: Array<{ name: string; args: any; result?: any }>
  sources?: Array<{ id: string; url: string; title?: string }>
}

interface ThinkingStep {
  id: string
  content: string
  status: 'thinking' | 'complete'
}

// Generate HTML for preview iframe
function generatePreviewHTML(sourceFiles: Record<string, string>, entryFile?: string): string {
  // Get the main component file (Survey.tsx)
  const surveyFile = sourceFiles['src/Survey.tsx'] || sourceFiles['Survey.tsx'] || ''

  if (!surveyFile) {
    return '<div style="padding: 20px; text-align: center;">No survey component found</div>'
  }

  // Extract JSX from the component file
  let jsxContent = ''
  const returnMatch = surveyFile.match(/return\s*\(([\s\S]*)\)/)
  if (returnMatch) {
    jsxContent = returnMatch[1]
  }

  // Convert React/JSX to HTML (basic conversion)
  // This is a simple approach - for production, you'd want a proper JSX transformer
  let htmlContent = jsxContent
    .replace(/className=/g, 'class=')
    .replace(/{`([^`]+)`}/g, '$1')
    .replace(/{(['"].*?['"])}/g, '$1')
    .replace(/\{.*?\}/g, '') // Remove other JSX expressions for simplicity

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Survey Preview</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: system-ui, -apple-system, sans-serif;
        }
      </style>
    </head>
    <body>
      <div id="root">
        ${htmlContent}
      </div>
      <script>
        // Add interactivity
        document.querySelectorAll('button').forEach(btn => {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Button clicked:', btn.textContent);
          });
        });

        document.querySelectorAll('input, textarea').forEach(input => {
          input.addEventListener('change', (e) => {
            console.log('Input changed:', e.target.value);
          });
        });
      </script>
    </body>
    </html>
  `
}

export default function ChatPage() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentThinking, setCurrentThinking] = useState<{
    steps: ThinkingStep[]
    isActive: boolean
    startTime: number
  }>({ steps: [], isActive: false, startTime: 0 })
  const [currentToolCall, setCurrentToolCall] = useState<{
    name: string
    isActive: boolean
  } | null>(null)
  const [currentResponse, setCurrentResponse] = useState('')
  const [sandboxContent, setSandboxContent] = useState<any>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Resizable panel state
  const [sandboxWidth, setSandboxWidth] = useState(500)
  const [isResizing, setIsResizing] = useState(false)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, currentResponse, currentThinking])

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return
      const newWidth = window.innerWidth - e.clientX
      if (newWidth >= 300 && newWidth <= 800) {
        setSandboxWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)
    setCurrentResponse('')
    setCurrentThinking({ steps: [], isActive: false, startTime: 0 })
    setCurrentToolCall(null)

    try {
      const response = await fetch('/api/agents/surbee-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_as_text: userMessage,
          stream: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) throw new Error('No reader available')

      let assistantMessage = ''
      let thinkingSteps: ThinkingStep[] = []
      let thinkingStartTime = 0
      let toolCalls: Array<{ name: string; args: any; result?: any }> = []
      let sources: Array<{ id: string; url: string; title?: string }> = []
      let currentAgent = ''
      let agentResponseBuffer = '' // Buffer for each agent's response
      let agentToolCalls: Array<{ name: string; args: any; result?: any }> = [] // Tool calls for current agent
      let agentSources: Array<{ id: string; url: string; title?: string }> = [] // Sources for current agent

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const data = line.slice(6)
          if (!data.trim()) continue

          try {
            const event = JSON.parse(data)

            // Handle different event types from fullStream
            switch (event.type) {
              case 'start':
                console.log('Stream started')
                break

              case 'step-start':
                console.log('Step started:', event.step, 'Agent:', event.agent)
                currentAgent = event.agent || ''
                agentResponseBuffer = '' // Reset buffer for new agent
                agentToolCalls = [] // Reset tool calls for new agent
                agentSources = [] // Reset sources for new agent
                // Start thinking display for agents with reasoning
                if (event.showReasoning) {
                  thinkingStartTime = Date.now()
                  thinkingSteps = [] // Reset thinking steps for new agent
                  setCurrentThinking({
                    steps: [],
                    isActive: true,
                    startTime: thinkingStartTime,
                  })
                }
                break

              case 'reasoning-start':
                // Mark reasoning as active
                if (!thinkingStartTime) {
                  thinkingStartTime = Date.now()
                }
                setCurrentThinking(prev => ({
                  ...prev,
                  isActive: true,
                  startTime: thinkingStartTime,
                }))
                break

              case 'reasoning-delta':
                // Add each reasoning line as a separate thinking step
                if (event.reasoningDelta) {
                  const stepId = `step-${Date.now()}-${Math.random()}`
                  const newStep: ThinkingStep = {
                    id: stepId,
                    content: event.reasoningDelta,
                    status: 'thinking',
                  }
                  thinkingSteps = [...thinkingSteps, newStep]
                  setCurrentThinking(prev => ({
                    ...prev,
                    steps: [...prev.steps, newStep],
                    isActive: true,
                  }))
                }
                break

              case 'reasoning-complete':
              case 'reasoning-end':
                // Mark all thinking steps as complete and close the dropdown
                setCurrentThinking(prev => ({
                  ...prev,
                  steps: prev.steps.map(s => ({ ...s, status: 'complete' as const })),
                  isActive: false,
                }))
                thinkingSteps = thinkingSteps.map(s => ({ ...s, status: 'complete' as const }))
                break

              case 'text-start':
              case 'text-delta':
                // Accumulate agent's response
                if (event.textDelta) {
                  agentResponseBuffer += event.textDelta
                  assistantMessage += event.textDelta
                  setCurrentResponse(agentResponseBuffer)
                }
                break

              case 'text-end':
                console.log('Text stream ended')
                break

              case 'tool-call':
                console.log('Tool called:', event.toolName)
                setCurrentToolCall({
                  name: event.toolName || 'unknown',
                  isActive: true,
                })
                const newToolCall = {
                  name: event.toolName || 'unknown',
                  args: event.args,
                }
                toolCalls.push(newToolCall)
                agentToolCalls.push(newToolCall) // Add to agent-specific array
                break

              case 'tool-result':
                console.log('Tool result:', event.toolName)
                setCurrentToolCall(prev => prev ? { ...prev, isActive: false } : null)
                const lastToolCall = toolCalls[toolCalls.length - 1]
                if (lastToolCall && lastToolCall.name === event.toolName) {
                  lastToolCall.result = event.result
                }
                const lastAgentToolCall = agentToolCalls[agentToolCalls.length - 1]
                if (lastAgentToolCall && lastAgentToolCall.name === event.toolName) {
                  lastAgentToolCall.result = event.result
                }
                break

              case 'tool-error':
                console.error('Tool error:', event.error)
                setCurrentToolCall(null)
                break

              case 'source':
                console.log('Source received:', event.url)
                const newSource = {
                  id: event.id,
                  url: event.url,
                  title: event.title,
                }
                sources.push(newSource)
                agentSources.push(newSource) // Add to agent-specific array
                break

              case 'step-finish':
                console.log('Step finished:', event.step, 'Agent:', event.agent)
                setCurrentToolCall(null)

                // Save this agent's message if it has content
                if (agentResponseBuffer.trim() || thinkingSteps.length > 0 || agentToolCalls.length > 0) {
                  const agentMessage: Message = {
                    role: 'assistant',
                    content: agentResponseBuffer.trim(),
                    agent: event.agent || currentAgent,
                  }

                  // Add thinking data if this agent had reasoning
                  if (thinkingSteps.length > 0) {
                    agentMessage.thinking = {
                      steps: [...thinkingSteps].map(s => ({ ...s, status: 'complete' as const })),
                      duration: Math.floor((Date.now() - thinkingStartTime) / 1000),
                    }
                  }

                  // Add tool calls if this agent used tools
                  if (agentToolCalls.length > 0) {
                    agentMessage.toolCalls = [...agentToolCalls]
                  }

                  // Add sources if this agent fetched sources
                  if (agentSources.length > 0) {
                    agentMessage.sources = [...agentSources]
                  }

                  // Add the agent's message to chat
                  setMessages(prev => [...prev, agentMessage])

                  // Reset for next agent
                  setCurrentResponse('')
                  setCurrentThinking({ steps: [], isActive: false, startTime: 0 })
                  agentResponseBuffer = ''
                }
                break

              case 'finish':
              case 'complete':
                console.log('Stream complete')
                setCurrentThinking(prev => ({
                  ...prev,
                  isActive: false,
                }))
                setCurrentToolCall(null)
                setCurrentResponse('')

                // Update sandbox if we got source files
                if (event.result?.source_files) {
                  setSandboxContent(event.result)
                }

                // Don't add a final message here since we already added per-agent messages in step-finish
                // This prevents duplicate thinking/content in the UI
                break

              case 'error':
                console.error('Stream error:', event.error)
                setMessages(prev => [
                  ...prev,
                  {
                    role: 'assistant',
                    content: `Error: ${event.error}`,
                  },
                ])
                break
            }
          } catch (e) {
            console.error('Failed to parse event:', e)
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen flex">
      {/* Chat Area - Left Side */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold">Surbee Chat</h1>
          <p className="text-sm text-muted-foreground">Create surveys with AI</p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div ref={scrollRef} className="space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className="space-y-2">
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="rounded-lg p-3 bg-primary text-primary-foreground">
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Show thinking display if this agent had reasoning - Timeline with checklist effect */}
                    {msg.thinking && msg.thinking.steps.length > 0 && (
                      <div className="pl-0">
                        <ThinkingDisplay
                          steps={msg.thinking.steps}
                          duration={msg.thinking.duration}
                          isThinking={false}
                          isLatest={idx === messages.length - 1}
                        />
                      </div>
                    )}

                    {/* Show tool calls if any */}
                    {msg.toolCalls && msg.toolCalls.length > 0 && (
                      <div className="space-y-2">
                        {msg.toolCalls.map((tool, i) => (
                          <ToolCall
                            key={i}
                            icon={<Hammer className="h-4 w-4" />}
                            label={`${tool.name}`}
                            isActive={false}
                          />
                        ))}
                      </div>
                    )}

                    {/* Show agent's response - Clear chat bubble, visually distinct from thinking */}
                    {msg.content && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%]">
                          <div className="rounded-lg p-3 bg-muted shadow-sm">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Show sources if available */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex justify-start">
                        <div className="max-w-[80%]">
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-muted-foreground font-medium mb-1">Sources:</p>
                            {msg.sources.map((source, i) => (
                              <a
                                key={source.id}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-primary hover:underline bg-background rounded border px-2 py-1"
                              >
                                {source.title || source.url}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Active tool call - shown during tool execution */}
            {currentToolCall && (
              <div className="flex items-start gap-2">
                <ToolCall
                  icon={<Hammer className="h-4 w-4" />}
                  label={currentToolCall.name}
                  isActive={currentToolCall.isActive}
                />
              </div>
            )}

            {/* Thinking Display - shown during reasoning */}
            {(currentThinking.isActive || currentThinking.steps.length > 0) && (
              <ThinkingDisplay
                steps={currentThinking.steps}
                isThinking={currentThinking.isActive}
                isLatest={true}
              />
            )}

            {/* Current response being streamed */}
            {currentResponse && (
              <div className="flex justify-start">
                <div className="max-w-[80%]">
                  <div className="rounded-lg p-3 bg-muted">
                    <p className="text-sm whitespace-pre-wrap">{currentResponse}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your survey..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="w-1 bg-border hover:bg-primary cursor-ew-resize transition-colors"
        onMouseDown={() => setIsResizing(true)}
      />

      {/* Sandbox Preview - Right Side */}
      <div
        className="flex flex-col bg-muted/30 border-l"
        style={{ width: `${sandboxWidth}px` }}
      >
        {/* Header */}
        <div className="border-b p-4 bg-background">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            <h2 className="font-semibold">Sandbox Preview</h2>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-0">
          {sandboxContent?.source_files ? (
            <div className="h-full flex flex-col">
              {/* Tabs for switching between preview and code */}
              <div className="border-b bg-background">
                <div className="flex gap-1 p-2">
                  <button
                    onClick={() => {
                      const preview = document.getElementById('sandbox-preview-tab')
                      const code = document.getElementById('sandbox-code-tab')
                      if (preview && code) {
                        preview.classList.add('bg-muted')
                        code.classList.remove('bg-muted')
                      }
                      const previewContent = document.getElementById('sandbox-preview-content')
                      const codeContent = document.getElementById('sandbox-code-content')
                      if (previewContent && codeContent) {
                        previewContent.classList.remove('hidden')
                        codeContent.classList.add('hidden')
                      }
                    }}
                    id="sandbox-preview-tab"
                    className="px-3 py-1.5 text-xs font-medium rounded bg-muted transition-colors hover:bg-muted"
                  >
                    Preview
                  </button>
                  <button
                    onClick={() => {
                      const preview = document.getElementById('sandbox-preview-tab')
                      const code = document.getElementById('sandbox-code-tab')
                      if (preview && code) {
                        preview.classList.remove('bg-muted')
                        code.classList.add('bg-muted')
                      }
                      const previewContent = document.getElementById('sandbox-preview-content')
                      const codeContent = document.getElementById('sandbox-code-content')
                      if (previewContent && codeContent) {
                        previewContent.classList.add('hidden')
                        codeContent.classList.remove('hidden')
                      }
                    }}
                    id="sandbox-code-tab"
                    className="px-3 py-1.5 text-xs font-medium rounded transition-colors hover:bg-muted"
                  >
                    Code
                  </button>
                </div>
              </div>

              {/* Preview Content */}
              <div id="sandbox-preview-content" className="flex-1 bg-white">
                <iframe
                  srcDoc={generatePreviewHTML(sandboxContent.source_files, sandboxContent.entry_file)}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="Survey Preview"
                />
              </div>

              {/* Code Content */}
              <div id="sandbox-code-content" className="hidden flex-1 overflow-auto p-4">
                <div className="space-y-4">
                  {Object.entries(sandboxContent.source_files).map(([path, content]) => (
                    <Card key={path} className="p-3">
                      <div className="text-xs font-mono font-semibold mb-2 text-primary">
                        {path}
                      </div>
                      <pre className="text-xs overflow-x-auto bg-muted/50 p-2 rounded max-h-[400px] overflow-y-auto">
                        {String(content)}
                      </pre>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              <div className="text-center">
                <FileCode className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No sandbox content yet</p>
                <p className="text-xs mt-1">Ask me to build a survey</p>
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
