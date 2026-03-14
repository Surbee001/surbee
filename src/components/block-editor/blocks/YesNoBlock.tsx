'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { YesNoContent } from '@/lib/block-editor/types'

export const YesNoBlock: React.FC<BlockComponentProps<'yes-no'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as YesNoContent

  return (
    <div onClick={onFocus} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        {isEditing ? (
          <input type="text" value={content.label} onChange={(e) => onContentChange({ label: e.target.value })} placeholder="Question label" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)', padding: 0, width: '100%', fontFamily: 'inherit' }} />
        ) : (
          <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)' }}>{content.label}</label>
        )}
        {content.required && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>*</span>}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        {[content.yesLabel || 'Yes', content.noLabel || 'No'].map((label, i) => (
          <button
            key={i}
            disabled
            style={{
              flex: 1, padding: '10px 16px', border: '1px solid var(--surbee-border-primary)',
              borderRadius: '8px', fontSize: '0.9rem', color: 'var(--surbee-fg-primary)',
              backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit',
              opacity: 0.8, transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
