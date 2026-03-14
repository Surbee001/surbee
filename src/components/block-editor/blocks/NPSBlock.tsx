'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { NPSContent } from '@/lib/block-editor/types'

export const NPSBlock: React.FC<BlockComponentProps<'nps'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as NPSContent

  return (
    <div onClick={onFocus} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        {isEditing ? (
          <input
            type="text"
            value={content.label}
            onChange={(e) => onContentChange({ label: e.target.value })}
            placeholder="Question label"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--surbee-fg-primary)',
              padding: 0,
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)' }}>
            {content.label}
          </label>
        )}
        {content.required && (
          <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>*</span>
        )}
      </div>

      {/* NPS Scale 0-10 */}
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              border: '1px solid var(--surbee-border-primary)',
              fontSize: '0.85rem',
              color: 'var(--surbee-fg-primary)',
              cursor: 'pointer',
              transition: 'all 0.15s',
              backgroundColor: 'transparent',
            }}
          >
            {i}
          </div>
        ))}
      </div>

      {/* Labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--surbee-fg-muted)' }}>
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </div>
    </div>
  )
}
