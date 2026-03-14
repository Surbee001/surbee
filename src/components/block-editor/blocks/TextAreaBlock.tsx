'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { TextAreaContent } from '@/lib/block-editor/types'

export const TextAreaBlock: React.FC<BlockComponentProps<'textarea'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as TextAreaContent

  return (
    <div onClick={onFocus} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        {isEditing ? (
          <input
            type="text"
            value={content.label}
            onChange={(e) => onContentChange({ label: e.target.value })}
            placeholder="Question label"
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)',
              padding: 0, width: '100%', fontFamily: 'inherit',
            }}
          />
        ) : (
          <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)' }}>
            {content.label}
          </label>
        )}
        {content.required && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>*</span>}
      </div>
      {(content.description || isEditing) && isEditing ? (
        <input type="text" value={content.description ?? ''} onChange={(e) => onContentChange({ description: e.target.value || undefined })} placeholder="Add a description (optional)" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.825rem', color: 'var(--surbee-fg-muted)', padding: 0, width: '100%', fontFamily: 'inherit' }} />
      ) : content.description ? <p style={{ fontSize: '0.825rem', color: 'var(--surbee-fg-muted)', margin: 0 }}>{content.description}</p> : null}
      <textarea
        placeholder={content.placeholder || 'Type your answer...'}
        disabled
        rows={content.rows || 4}
        style={{
          width: '100%', padding: '10px 12px', border: '1px solid var(--surbee-border-primary)',
          borderRadius: '8px', fontSize: '0.9rem', backgroundColor: 'var(--surbee-input-bg, transparent)',
          color: 'var(--surbee-fg-muted)', fontFamily: 'inherit', resize: 'none', opacity: 0.7,
        }}
      />
    </div>
  )
}
