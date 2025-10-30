"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, CheckCircle, X, Plus, Wand2, Palette, GitBranch, Eye } from 'lucide-react'
import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'

interface FollowUpSuggestionsProps {
  suggestions: NonNullable<AIGenerationOutput['followUpSuggestions']>
  onAcceptSuggestion?: (suggestionId: string) => void
  onDismissSuggestion?: (suggestionId: string) => void
  className?: string
}

export const FollowUpSuggestions: React.FC<FollowUpSuggestionsProps> = ({
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  className = '',
}) => {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [accepted, setAccepted] = useState<string[]>([])

  const activeSuggestions = suggestions.filter(s => 
    !dismissed.includes(s.id) && !accepted.includes(s.id)
  )

  const handleAccept = (suggestionId: string) => {
    setAccepted(prev => [...prev, suggestionId])
    onAcceptSuggestion?.(suggestionId)
  }

  const handleDismiss = (suggestionId: string) => {
    setDismissed(prev => [...prev, suggestionId])
    onDismissSuggestion?.(suggestionId)
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'add_question': return <Plus className="w-4 h-4" />
      case 'modify_design': return <Palette className="w-4 h-4" />
      case 'add_logic': return <GitBranch className="w-4 h-4" />
      case 'improve_accessibility': return <Eye className="w-4 h-4" />
      default: return <Wand2 className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  if (activeSuggestions.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <HelpCircle className="w-5 h-5 text-blue-600" />
        <h3 className="text-blue-800 font-semibold">AI Suggestions to Enhance Your Survey</h3>
        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
          {activeSuggestions.length} suggestion{activeSuggestions.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {activeSuggestions.map((suggestion, index) => (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActionIcon(suggestion.action)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {suggestion.text}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full border ${getPriorityColor(suggestion.priority)}`}>
                    {suggestion.priority} priority
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {suggestion.action.replace('_', ' ')}
                  </span>
                </div>
              </div>
              
              <div className="flex-shrink-0 flex gap-2">
                <button
                  onClick={() => handleAccept(suggestion.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Apply
                </button>
                <button
                  onClick={() => handleDismiss(suggestion.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                >
                  <X className="w-3 h-3" />
                  Dismiss
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Summary of accepted/dismissed suggestions */}
      {(accepted.length > 0 || dismissed.length > 0) && (
        <div className="mt-4 pt-3 border-t border-blue-200">
          <div className="flex items-center gap-4 text-xs text-blue-600">
            {accepted.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                {accepted.length} applied
              </span>
            )}
            {dismissed.length > 0 && (
              <span className="flex items-center gap-1">
                <X className="w-3 h-3" />
                {dismissed.length} dismissed
              </span>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
