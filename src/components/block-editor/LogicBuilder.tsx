'use client'

import React, { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import { motion, AnimatePresence } from 'framer-motion'
import type { BranchRule, BranchOperator, BranchAction, EditorPage } from '@/lib/block-editor/types'
import { isQuestionBlock } from '@/lib/block-editor/types'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface LogicBuilderProps {
  page: EditorPage
  onClose: () => void
}

const OPERATORS: { value: BranchOperator; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'not_equals', label: 'does not equal' },
  { value: 'contains', label: 'contains' },
  { value: 'is_answered', label: 'is answered' },
  { value: 'is_not_answered', label: 'is not answered' },
  { value: 'greater_than', label: 'is greater than' },
  { value: 'less_than', label: 'is less than' },
]

const ACTIONS: { value: BranchAction; label: string }[] = [
  { value: 'go_to_page', label: 'Go to page' },
  { value: 'skip_page', label: 'Skip to page' },
  { value: 'end_survey', label: 'End survey' },
]

export const LogicBuilder: React.FC<LogicBuilderProps> = ({ page, onClose }) => {
  const { survey, setPageLogic } = useBlockEditorStore()
  const [branches, setBranches] = useState<BranchRule[]>(page.logic?.branches || [])

  const questionBlocks = page.blocks.filter(b => isQuestionBlock(b.type))
  const allPages = survey?.pages || []

  const addBranch = useCallback(() => {
    const firstQuestion = questionBlocks[0]
    if (!firstQuestion) return
    setBranches(prev => [...prev, {
      id: nanoid(8),
      sourceBlockId: firstQuestion.meta.questionId || firstQuestion.id,
      sourcePageId: page.id,
      operator: 'equals',
      value: '',
      action: 'go_to_page',
      targetId: allPages[0]?.id || '',
    }])
  }, [questionBlocks, page.id, allPages])

  const updateBranch = useCallback((id: string, updates: Partial<BranchRule>) => {
    setBranches(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
  }, [])

  const deleteBranch = useCallback((id: string) => {
    setBranches(prev => prev.filter(b => b.id !== id))
  }, [])

  const handleSave = useCallback(() => {
    setPageLogic(page.id, {
      defaultNextPageId: page.logic?.defaultNextPageId,
      branches,
    })
    onClose()
  }, [page.id, page.logic?.defaultNextPageId, branches, setPageLogic, onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '24px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        style={{
          backgroundColor: 'var(--surbee-bg-primary)',
          borderRadius: '12px',
          border: '1px solid var(--surbee-border-primary)',
          width: '100%',
          maxWidth: 600,
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '24px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--surbee-fg-primary)', margin: 0 }}>
              Page Logic
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--surbee-fg-muted)', margin: '4px 0 0' }}>
              {page.title} — Add branching rules based on answers
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--surbee-fg-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            &times;
          </button>
        </div>

        {/* No questions warning */}
        {questionBlocks.length === 0 && (
          <div style={{
            padding: '16px',
            borderRadius: '8px',
            backgroundColor: 'var(--surbee-bg-tertiary, rgba(0,0,0,0.04))',
            fontSize: '0.85rem',
            color: 'var(--surbee-fg-muted)',
            textAlign: 'center',
            marginBottom: '16px',
          }}>
            Add question blocks to this page before setting up logic rules.
          </div>
        )}

        {/* Branches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {branches.map((branch, i) => (
            <div
              key={branch.id}
              style={{
                padding: '14px',
                borderRadius: '8px',
                border: '1px solid var(--surbee-border-primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--surbee-fg-muted)', textTransform: 'uppercase' }}>
                  Rule {i + 1}
                </span>
                <button
                  onClick={() => deleteBranch(branch.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--surbee-fg-muted)', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  &times;
                </button>
              </div>

              {/* When [question] */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--surbee-fg-secondary)' }}>When</span>
                <select
                  value={branch.sourceBlockId}
                  onChange={(e) => updateBranch(branch.id, { sourceBlockId: e.target.value })}
                  style={selectStyle}
                >
                  {questionBlocks.map(b => (
                    <option key={b.id} value={b.meta.questionId || b.id}>
                      {(b.content as any).label || 'Untitled'}
                    </option>
                  ))}
                </select>
              </div>

              {/* [operator] [value] */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={branch.operator}
                  onChange={(e) => updateBranch(branch.id, { operator: e.target.value as BranchOperator })}
                  style={selectStyle}
                >
                  {OPERATORS.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>
                {!['is_answered', 'is_not_answered'].includes(branch.operator) && (
                  <input
                    type="text"
                    value={String(branch.value ?? '')}
                    onChange={(e) => updateBranch(branch.id, { value: e.target.value })}
                    placeholder="value"
                    style={inputStyle}
                  />
                )}
              </div>

              {/* Then [action] [target] */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--surbee-fg-secondary)' }}>Then</span>
                <select
                  value={branch.action}
                  onChange={(e) => updateBranch(branch.id, { action: e.target.value as BranchAction })}
                  style={selectStyle}
                >
                  {ACTIONS.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
                {branch.action !== 'end_survey' && (
                  <select
                    value={branch.targetId}
                    onChange={(e) => updateBranch(branch.id, { targetId: e.target.value })}
                    style={selectStyle}
                  >
                    {allPages.filter(p => p.id !== page.id).map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add rule button */}
        {questionBlocks.length > 0 && (
          <button
            onClick={addBranch}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px dashed var(--surbee-border-primary)',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: 'var(--surbee-fg-muted)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
              marginBottom: '20px',
              transition: 'all 0.15s',
            }}
          >
            + Add branching rule
          </button>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--surbee-border-primary)',
              backgroundColor: 'transparent',
              color: 'var(--surbee-fg-primary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'var(--surbee-accent-primary, #2563eb)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            Save Logic
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid var(--surbee-border-primary)',
  backgroundColor: 'var(--surbee-bg-primary)',
  color: 'var(--surbee-fg-primary)',
  fontSize: '0.85rem',
  fontFamily: 'inherit',
  cursor: 'pointer',
}

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: '6px',
  border: '1px solid var(--surbee-border-primary)',
  backgroundColor: 'transparent',
  color: 'var(--surbee-fg-primary)',
  fontSize: '0.85rem',
  fontFamily: 'inherit',
  width: 120,
}
