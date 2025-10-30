"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ThinkingDisplay } from '@/components/thinking-display'
import { ToolCall } from '@/components/tool-call'
import { Send, Hammer, FileCode } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { ChatMessage } from '@/lib/agents/surbeeWorkflowV3'

// Generate HTML for preview iframe
function generatePreviewHTML(sourceFiles: Record<string, string>): string {
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
  let htmlContent = jsxContent
    .replace(/className=/g, 'class=')
    .replace(/{`([^`]+)`}/g, '$1')
    .replace(/{(['"].*?['"])}/g, '$1')
    .replace(/\{.*?\}/g, '')

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

interface ThinkingStep {
  id: string
  content: string
  status: 'thinking' | 'complete'
}

export default function Chat1Page() {
  const [input, setInput] = useState('')
  const [sandboxContent, setSandboxContent] = useState<Record<string, string> | null>(null)
  const [sandboxWidth, setSandboxWidth] = useState(500)
  const [isResizing, setIsResizing] = useState(false)
  const [reasoningByMessage, setReasoningByMessage] = useState<Record<string, ThinkingStep[]>>({})

  // Use the useChat hook with typed messages
  const { messages, sendMessage, status } = useChat<ChatMessage>({
    transport: new DefaultChatTransport({
      api: '/api/agents/surbee-v3',
    }),
  })

  // Extract sandbox content from tool results
  React.useEffect(() => {
    if (!messages || messages.length === 0) return

    // Look through all assistant messages for any tool that returns source_files
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (msg.role !== 'assistant') continue

      // Check ALL tool parts for source_files (not just init_sandbox)
      for (const part of msg.parts) {
        if (part.type.startsWith('tool-') && part.state === 'output-available') {
          const output = part.output as any
          if (output?.source_files && Object.keys(output.source_files).length > 0) {
            setSandboxContent(output.source_files)
            return // Use the most recent source_files found
          }
        }
      }
    }
  }, [messages])

  // Convert reasoning parts to ThinkingSteps and track durations
  const [reasoningStartTimes, setReasoningStartTimes] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    if (!messages || messages.length === 0) return

    const newReasoningByMessage: Record<string, ThinkingStep[]> = {}
    const newStartTimes: Record<string, number> = { ...reasoningStartTimes }

    messages.forEach((msg) => {
      if (msg.role !== 'assistant') return

      const reasoningParts = msg.parts.filter(p => p.type === 'reasoning')
      if (reasoningParts.length === 0) return

      // Track start time if this is the first reasoning part for this message
      if (!newStartTimes[msg.id]) {
        newStartTimes[msg.id] = Date.now()
      }

      const steps: ThinkingStep[] = reasoningParts.map((part, idx) => ({
        id: `${msg.id}-reasoning-${idx}`,
        content: part.text || '',
        status: 'complete' as const,
      }))

      newReasoningByMessage[msg.id] = steps
    })

    setReasoningByMessage(newReasoningByMessage)
    setReasoningStartTimes(newStartTimes)
  }, [messages])

  // Handle resize
  React.useEffect(() => {
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
    if (!input.trim() || status !== 'ready') return

    const userMessage = input.trim()
    setInput('')

    sendMessage({ text: userMessage })
  }

  const isLoading = status === 'submitted' || status === 'streaming'

  return (
    <div className="h-screen flex">
      {/* Chat Area - Left Side */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b p-4">
          <h1 className="text-xl font-semibold">Surbee V3 Chat (useChat + Real-time Streaming)</h1>
          <p className="text-sm text-muted-foreground">Single-agent with real-time reasoning and multi-step tools</p>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages?.map((msg, idx) => (
              <div key={msg.id} className="space-y-2">
                {msg.role === 'user' ? (
                  <div className="flex justify-end">
                    <div className="max-w-[80%]">
                      <div className="rounded-lg p-3 bg-primary text-primary-foreground">
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.parts.find(p => p.type === 'text')?.text || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Show thinking display if this message has reasoning */}
                    {reasoningByMessage[msg.id] && reasoningByMessage[msg.id].length > 0 && (
                      <div className="pl-0">
                        <ThinkingDisplay
                          steps={reasoningByMessage[msg.id]}
                          duration={reasoningStartTimes[msg.id]
                            ? Math.floor((Date.now() - reasoningStartTimes[msg.id]) / 1000)
                            : 0}
                          isThinking={false}
                          isLatest={idx === messages.length - 1}
                        />
                      </div>
                    )}

                    {/* Show tool calls */}
                    {msg.parts.filter(p => p.type.startsWith('tool-')).map((part, partIdx) => {
                      const toolName = part.type.replace('tool-', '')
                      const isActive = part.state === 'input-streaming' || part.state === 'input-available'

                      return (
                        <ToolCall
                          key={partIdx}
                          icon={<Hammer className="h-4 w-4" />}
                          label={toolName}
                          isActive={isActive}
                        />
                      )
                    })}

                    {/* Show text content */}
                    {msg.parts.filter(p => p.type === 'text').map((part, partIdx) => (
                      <div key={partIdx} className="flex justify-start">
                        <div className="max-w-[80%]">
                          <div className="rounded-lg p-3 bg-muted shadow-sm">
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{part.text}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your survey or ask questions..."
              disabled={status !== 'ready'}
              className="flex-1"
            />
            <Button type="submit" disabled={status !== 'ready' || !input.trim()}>
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
            <h2 className="font-semibold">E2B Sandbox</h2>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-0">
          {sandboxContent ? (
            <div className="h-full flex flex-col">
              {/* Preview */}
              <div className="flex-1 bg-white">
                <iframe
                  srcDoc={generatePreviewHTML(sandboxContent)}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts"
                  title="Survey Preview"
                />
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
