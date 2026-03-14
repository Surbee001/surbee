'use client'

import React, { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { motion, AnimatePresence } from 'framer-motion'
import type { ConditionalRule, BranchOperator, Block } from '@/lib/block-editor/types'
import { isQuestionBlock } from '@/lib/block-editor/types'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface ConditionalVisibilityEditorProps {
  block: Block
  pageId: string
}

const OPERATORS: { value: BranchOperator; label: string; needsValue: boolean }[] = [
  { value: 'equals', label: 'is', needsValue: true },
  { value: 'not_equals', label: 'is not', needsValue: true },
  { value: 'contains', label: 'contains', needsValue: true },
  { value: 'greater_than', label: 'is greater than', needsValue: true },
  { value: 'less_than', label: 'is less than', needsValue: true },
  { value: 'is_answered', label: 'is answered', needsValue: false },
  { value: 'is_not_answered', label: 'is not answered', needsValue: false },
]

/**
 * Inline conditional visibility editor that appears below a block.
 * Uses a natural-language "Show this when [question] [operator] [value]" pattern.
 */
export const ConditionalVisibilityEditor: React.FC<ConditionalVisibilityEditorProps> = ({
  block,
  pageId,
}) => {
  const survey = useBlockEditorStore(s => s.survey)
  const updateBlockMeta = useBlockEditorStore(s => s.updateBlockMeta)
  const [isOpen, setIsOpen] = useState(false)

  const rules = block.meta.conditionalVisibility || []
  const hasRules = rules.length > 0

  // Gather all question blocks across all pages that come before this block
  const allQuestions: { id: string; questionId: string; label: string; type: string; options?: { label: string; value: string }[] }[] = []
  if (survey) {
    for (const page of survey.pages) {
      for (const b of page.blocks) {
        if (b.id === block.id) break // stop at current block
        if (isQuestionBlock(b.type)) {
          const content = b.content as any
          allQuestions.push({
            id: b.id,
            questionId: b.meta.questionId || b.id,
            label: content.label || 'Untitled question',
            type: b.type,
            options: content.options,
          })
        }
      }
    }
  }

  const addRule = useCallback(() => {
    const firstQ = allQuestions[0]
    if (!firstQ) return
    const newRules: ConditionalRule[] = [
      ...rules,
      {
        sourceBlockId: firstQ.questionId,
        operator: 'is_answered',
        value: '',
      },
    ]
    updateBlockMeta(pageId, block.id, { conditionalVisibility: newRules })
  }, [allQuestions, rules, pageId, block.id, updateBlockMeta])

  const updateRule = useCallback((index: number, updates: Partial<ConditionalRule>) => {
    const newRules = rules.map((r, i) => i === index ? { ...r, ...updates } : r)
    updateBlockMeta(pageId, block.id, { conditionalVisibility: newRules })
  }, [rules, pageId, block.id, updateBlockMeta])

  const deleteRule = useCallback((index: number) => {
    const newRules = rules.filter((_, i) => i !== index)
    updateBlockMeta(pageId, block.id, { conditionalVisibility: newRules.length > 0 ? newRules : undefined })
  }, [rules, pageId, block.id, updateBlockMeta])

  const clearAll = useCallback(() => {
    updateBlockMeta(pageId, block.id, { conditionalVisibility: undefined })
    setIsOpen(false)
  }, [pageId, block.id, updateBlockMeta])

  // Find question options for a given sourceBlockId
  const getQuestionOptions = (sourceBlockId: string) => {
    const q = allQuestions.find(q => q.questionId === sourceBlockId)
    return q?.options || []
  }

  return (
    <div style={{ marginTop: '2px' }}>
      {/* Toggle button — small pill that shows current state */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          border: 'none',
          backgroundColor: hasRules ? 'rgba(37,99,235,0.08)' : 'transparent',
          color: hasRules ? '#2563eb' : '#bbb',
          fontSize: '11px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.15s',
          opacity: hasRules ? 1 : 0,
        }}
        className="group-hover:!opacity-100"
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
        onMouseLeave={(e) => { if (!hasRules && !isOpen) e.currentTarget.style.opacity = '0' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5" /><path d="M8 3H3v5" />
          <path d="M12 22v-6" /><path d="M12 8V2" />
          <path d="M20 16l-4-4 4-4" /><path d="M4 16l4-4-4-4" />
        </svg>
        {hasRules ? `${rules.length} condition${rules.length > 1 ? 's' : ''}` : 'Add condition'}
      </button>

      {/* Rules panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: '6px',
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: rules.length > 0 ? '10px' : '0',
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Show this block when
                </span>
                {hasRules && (
                  <button
                    onClick={clearAll}
                    style={{
                      padding: '2px 8px', borderRadius: '4px', border: 'none',
                      backgroundColor: 'transparent', color: '#ef4444',
                      fontSize: '11px', cursor: 'pointer',
                    }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {/* No questions available */}
              {allQuestions.length === 0 && (
                <div style={{
                  padding: '12px', borderRadius: '6px',
                  backgroundColor: '#fff', fontSize: '12px', color: '#94a3b8',
                  textAlign: 'center',
                }}>
                  Add question blocks before this one to create conditions.
                </div>
              )}

              {/* Rules */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {rules.map((rule, i) => {
                  const op = OPERATORS.find(o => o.value === rule.operator)
                  const questionOptions = getQuestionOptions(rule.sourceBlockId)

                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexWrap: 'wrap',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                      }}
                    >
                      {i > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: 600, color: '#2563eb', padding: '0 4px' }}>
                          AND
                        </span>
                      )}

                      {/* Question selector */}
                      <select
                        value={rule.sourceBlockId}
                        onChange={(e) => updateRule(i, { sourceBlockId: e.target.value })}
                        style={selectStyle}
                      >
                        {allQuestions.map(q => (
                          <option key={q.questionId} value={q.questionId}>
                            {q.label.length > 30 ? q.label.slice(0, 30) + '...' : q.label}
                          </option>
                        ))}
                      </select>

                      {/* Operator */}
                      <select
                        value={rule.operator}
                        onChange={(e) => updateRule(i, { operator: e.target.value as BranchOperator })}
                        style={selectStyle}
                      >
                        {OPERATORS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>

                      {/* Value — smart input based on question type */}
                      {op?.needsValue && (
                        questionOptions.length > 0 ? (
                          <select
                            value={String(rule.value ?? '')}
                            onChange={(e) => updateRule(i, { value: e.target.value })}
                            style={selectStyle}
                          >
                            <option value="">Select...</option>
                            {questionOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={String(rule.value ?? '')}
                            onChange={(e) => updateRule(i, { value: e.target.value })}
                            placeholder="value"
                            style={inputStyle}
                          />
                        )
                      )}

                      {/* Delete rule */}
                      <button
                        onClick={() => deleteRule(i)}
                        style={{
                          width: 20, height: 20, borderRadius: '4px', border: 'none',
                          backgroundColor: 'transparent', color: '#94a3b8',
                          cursor: 'pointer', fontSize: '14px', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                        title="Remove condition"
                      >
                        &times;
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Add rule */}
              {allQuestions.length > 0 && (
                <button
                  onClick={addRule}
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px dashed #d1d5db',
                    backgroundColor: 'transparent',
                    color: '#64748b',
                    fontSize: '12px',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563eb'; e.currentTarget.style.color = '#2563eb' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#64748b' }}
                >
                  + Add condition
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: '5px',
  border: '1px solid #e5e7eb',
  backgroundColor: '#fff',
  color: '#334155',
  fontSize: '12px',
  fontFamily: 'inherit',
  cursor: 'pointer',
  maxWidth: '160px',
}

const inputStyle: React.CSSProperties = {
  padding: '4px 8px',
  borderRadius: '5px',
  border: '1px solid #e5e7eb',
  backgroundColor: '#fff',
  color: '#334155',
  fontSize: '12px',
  fontFamily: 'inherit',
  width: '80px',
  outline: 'none',
}
