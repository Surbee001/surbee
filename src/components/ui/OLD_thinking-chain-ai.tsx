"use client" // OLD component retained for legacy references

import { useState, useEffect, useRef, useMemo, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { TextShimmerWave } from "@/components/ui/text-shimmer-wave"

export interface ThinkingPhase {
  id: string
  type: "thinking" | "planning" | "building" | "summary"
  content: string
  duration?: number
  htmlContent?: string
  filename?: string
  timestamp: Date
  isComplete?: boolean
  suggestions?: string[]
}

interface ThinkingChainAIProps {
  phases: ThinkingPhase[]
  isActive: boolean
  currentPhase?: string
  thinkingStartTime?: number
  htmlStream?: string
  className?: string
}

export function ThinkingChainAI({
  phases,
  isActive,
  currentPhase,
  thinkingStartTime,
  htmlStream,
  className
}: ThinkingChainAIProps) {
  const [thinkingDuration, setThinkingDuration] = useState(0)
  const [showThinkingTime, setShowThinkingTime] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true)

  // Update thinking duration timer
  useEffect(() => {
    if (currentPhase === "thinking" && thinkingStartTime) {
      const interval = setInterval(() => {
        setThinkingDuration((Date.now() - thinkingStartTime) / 1000)
      }, 100)

      return () => clearInterval(interval)
    } else if (currentPhase !== "thinking" && thinkingStartTime) {
      // Thinking phase is complete, show final duration and auto-collapse
      const finalDuration = (Date.now() - thinkingStartTime) / 1000
      setThinkingDuration(finalDuration)
      setShowThinkingTime(true)
      // Auto-collapse thinking dropdown after 1 second
      setTimeout(() => {
        setIsThinkingExpanded(false)
      }, 1000)
    }
  }, [currentPhase, thinkingStartTime])

  // Auto-collapse when all phases are complete and no active phase
  useEffect(() => {
    if (!isActive && phases.length > 0 && phases.every(p => p.isComplete)) {
      const timer = setTimeout(() => {
        setIsCollapsed(true)
      }, 3000) // Auto-collapse after 3 seconds
      
      return () => clearTimeout(timer)
    } else {
      setIsCollapsed(false)
    }
  }, [isActive, phases])

  if (!isActive && phases.length === 0) {
    return null
  }

  // Show collapsed state if auto-collapsed
  if (isCollapsed) {
    return (
      <div className={cn("max-w-4xl", className)}>
        <button
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 transition-colors group"
        >
          <span>Completed thinking process</span>
          <span className="text-xs">({phases.length} phases)</span>
          <ChevronDown className="w-3 h-3 opacity-50 group-hover:opacity-100" />
        </button>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4 max-w-4xl", className)}>
      {/* Thinking Phase */}
      <AnimatePresence>
        {(currentPhase === "thinking" || phases.find(p => p.type === "thinking")) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="py-2"
          >
            <button
              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              className="flex items-center gap-2 text-sm hover:text-gray-300 transition-colors group w-full text-left"
            >
              {currentPhase === "thinking" && !showThinkingTime ? (
                <TextShimmerWave 
                  as="span" 
                  className="text-gray-300"
                  duration={2}
                >
                  Thinking
                </TextShimmerWave>
              ) : showThinkingTime ? (
                <span className="text-gray-300">
                  Thought for {thinkingDuration.toFixed(1)}s
                </span>
              ) : (
                <span className="text-gray-300">Thinking complete</span>
              )}
              
              {phases.find(p => p.type === "thinking")?.content && (
                <motion.div
                  animate={{ rotate: isThinkingExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="opacity-50 group-hover:opacity-100"
                >
                  <ChevronDown className="w-4 h-4" />
                </motion.div>
              )}
            </button>

            {/* Thinking Content Dropdown */}
            <AnimatePresence>
              {isThinkingExpanded && phases.find(p => p.type === "thinking")?.content && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 pl-4 border-l-2 border-gray-500/30">
                    <div className="text-sm text-gray-400 space-y-2">
                      {phases.find(p => p.type === "thinking")?.content?.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="leading-relaxed">
                          {paragraph.trim()}
                        </p>
                      )) || <p>Processing your request...</p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Planning Phase */}
      <AnimatePresence>
        {phases.find(p => p.type === "planning") && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="py-2"
          >
            <div className="text-gray-300 space-y-3">
              {phases.find(p => p.type === "planning")?.content?.split('\n\n').map((section, index) => (
                <div key={index}>
                  {section.includes('•') || section.includes('-') ? (
                    <div className="space-y-1">
                      {section.split('\n').map((line, lineIndex) => (
                        <p key={lineIndex} className="leading-relaxed">
                          {line.trim()}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="leading-relaxed">{section.trim()}</p>
                  )}
                </div>
              )) || <p>Preparing your request...</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Building Phase with Code Card */}
      <AnimatePresence>
        {(currentPhase === "building" || phases.find(p => p.type === "building")) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] rounded-lg border border-zinc-800 relative overflow-hidden"
          >
            {/* File Header */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                {currentPhase === "building" ? (
                  <TextShimmerWave 
                    as="span" 
                    className="text-sm font-medium text-gray-300"
                    duration={2}
                  >
                    Building
                  </TextShimmerWave>
                ) : (
                  <span className="text-sm font-medium text-gray-300">Built</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {currentPhase === "building" && (
                  <div className="w-4 h-4 relative">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Code Content */}
            <CodeContainer 
              htmlContent={htmlStream || phases.find(p => p.type === "building")?.htmlContent || ""}
              isStreaming={currentPhase === "building"}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary Phase */}
      <AnimatePresence>
        {phases.find(p => p.type === "summary") && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="py-2 space-y-4"
          >
            <p className="text-gray-300 leading-relaxed">
              {phases.find(p => p.type === "summary")?.content}
            </p>

            {/* Show AI suggestions if available */}
            {phases.find(p => p.type === "summary")?.suggestions && phases.find(p => p.type === "summary")?.suggestions!.length > 0 && (
              <div className="border-t border-[#555] pt-4">
                <p className="text-blue-400 mb-2">What's next?</p>
                <ul className="text-gray-300 space-y-1 text-sm">
                  {phases.find(p => p.type === "summary")?.suggestions?.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// Generate filename based on HTML content
function getGeneratedFilename(html?: string): string {
  if (!html) return "/components/GeneratedComponent.tsx"
  
  // Extract title from HTML
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  if (titleMatch && titleMatch[1]) {
    const title = titleMatch[1].trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '')
      .toLowerCase()
    if (title) {
      return `/${title}.html`
    }
  }
  
  // Check for common patterns
  if (html.includes('survey') || html.includes('questionnaire')) {
    return "/survey.html"
  }
  if (html.includes('dashboard')) {
    return "/dashboard.html"
  }
  if (html.includes('landing') || html.includes('hero')) {
    return "/landing.html"
  }
  if (html.includes('form')) {
    return "/form.html"
  }
  
  return "/index.html"
}

// Code container with auto-scroll functionality and optimized syntax highlighting
function CodeContainer({ htmlContent, isStreaming }: { htmlContent: string; isStreaming: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [debouncedContent, setDebouncedContent] = useState(htmlContent)
  const debounceTimer = useRef<NodeJS.Timeout>()
  
  // Debounce syntax highlighting during streaming for better performance
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    if (isStreaming) {
      // During streaming, debounce syntax highlighting to every 500ms
      debounceTimer.current = setTimeout(() => {
        setDebouncedContent(htmlContent)
      }, 500)
    } else {
      // When not streaming, update immediately
      setDebouncedContent(htmlContent)
    }
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [htmlContent, isStreaming])
  
  // No syntax highlighting to maximize performance
  
  // Auto-scroll to bottom when content changes and is streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current && htmlContent) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [htmlContent, isStreaming])
  
  return (
    <div className="relative h-48 overflow-hidden">
      {/* Top fade */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-[#1a1a1a] to-transparent z-10" />

      {/* Code Content */}
      <div 
        ref={scrollRef}
        className="p-4 font-mono text-sm overflow-y-auto h-full scroll-smooth"
      >
        <pre className="text-gray-300 whitespace-pre-wrap">
          <code className="text-gray-300">
            {isStreaming ? htmlContent : debouncedContent}
          </code>
        </pre>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[#1a1a1a] to-transparent z-10" />
    </div>
  )
}
