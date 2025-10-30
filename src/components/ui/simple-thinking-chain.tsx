"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { TextShimmer } from "@/components/ui/text-shimmer"

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

interface SimpleThinkingChainProps {
  phases: ThinkingPhase[]
  isActive: boolean
  currentPhase?: string
  className?: string
}

export function SimpleThinkingChain({
  phases,
  isActive,
  currentPhase,
  className
}: SimpleThinkingChainProps) {
  // Don't show anything if no active phase and no completed phases
  if (!isActive && phases.length === 0) {
    return null
  }

  // Helper function to get current or completed phase
  const getPhase = (type: string) => {
    return phases.find(p => p.type === type)
  }

  // Helper function to check if phase should be visible
  const shouldShowPhase = (type: string) => {
    return currentPhase === type || getPhase(type)
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Planning Phase - Always shows first when thinking starts */}
      <AnimatePresence>
        {(currentPhase === "thinking" || currentPhase === "planning" || getPhase("planning") || getPhase("thinking")) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {/* Phase Label */}
            <div>
              {(currentPhase === "thinking" || currentPhase === "planning") && !getPhase("planning")?.isComplete ? (
                <TextShimmer 
                  as="span" 
                  className="text-gray-300 text-sm font-medium"
                  duration={2}
                >
                  Planning
                </TextShimmer>
              ) : (
                <span className="text-gray-300 text-sm font-medium">Planning</span>
              )}
            </div>
            
            {/* Phase Content - Only show if completed and has real content */}
            {getPhase("planning")?.isComplete && getPhase("planning")?.content && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-300 leading-relaxed"
              >
                {getPhase("planning")?.content}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Building Phase - Only shows when building phase starts */}
      <AnimatePresence>
        {shouldShowPhase("building") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {/* Phase Label */}
            <div>
              {currentPhase === "building" && !getPhase("building")?.isComplete ? (
                <TextShimmer 
                  as="span" 
                  className="text-gray-300 text-sm font-medium"
                  duration={2}
                >
                  Building
                </TextShimmer>
              ) : (
                <span className="text-gray-300 text-sm font-medium">Building</span>
              )}
            </div>
            
            {/* Phase Content - Only show if completed and has real content */}
            {getPhase("building")?.isComplete && getPhase("building")?.content && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="text-sm text-gray-300 leading-relaxed"
              >
                {getPhase("building")?.content}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Finalizing Phase - Only shows when summary phase starts */}
      <AnimatePresence>
        {shouldShowPhase("summary") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {/* Phase Label */}
            <div>
              {currentPhase === "summary" && !getPhase("summary")?.isComplete ? (
                <TextShimmer 
                  as="span" 
                  className="text-gray-300 text-sm font-medium"
                  duration={2}
                >
                  Finalizing
                </TextShimmer>
              ) : (
                <span className="text-gray-300 text-sm font-medium">Finalizing</span>
              )}
            </div>
            
            {/* Phase Content - Only show if completed and has real content */}
            {getPhase("summary")?.isComplete && getPhase("summary")?.content && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <div className="text-sm text-gray-300 leading-relaxed">
                  {getPhase("summary")?.content}
                </div>
                
                {/* Show suggestions after finalizing */}
                {getPhase("summary")?.suggestions && getPhase("summary")?.suggestions!.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="text-xs text-gray-400 font-medium">Suggestions:</div>
                    <div className="flex flex-wrap gap-2">
                      {getPhase("summary")?.suggestions!.map((suggestion, index) => (
                        <button
                          key={index}
                          className="px-2.5 py-1 text-xs text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-full transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}