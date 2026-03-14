'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { ScaleContent } from '@/lib/block-editor/types'

export const ScaleBlock: React.FC<BlockComponentProps<'scale'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as ScaleContent
  const count = content.max - content.min + 1

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

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {Array.from({ length: count }, (_, i) => (
          <div key={i} style={{
            width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '8px', border: '1px solid var(--surbee-border-primary)',
            fontSize: '0.9rem', color: 'var(--surbee-fg-primary)', cursor: 'pointer',
          }}>
            {content.min + i}
          </div>
        ))}
      </div>

      {(content.minLabel || content.maxLabel || isEditing) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--surbee-fg-muted)' }}>
          {isEditing ? (
            <>
              <input type="text" value={content.minLabel ?? ''} onChange={(e) => onContentChange({ minLabel: e.target.value || undefined })} placeholder="Min label" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.75rem', color: 'var(--surbee-fg-muted)', padding: 0, width: 120, fontFamily: 'inherit' }} />
              <input type="text" value={content.maxLabel ?? ''} onChange={(e) => onContentChange({ maxLabel: e.target.value || undefined })} placeholder="Max label" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.75rem', color: 'var(--surbee-fg-muted)', padding: 0, width: 120, fontFamily: 'inherit', textAlign: 'right' }} />
            </>
          ) : (
            <>
              <span>{content.minLabel}</span>
              <span>{content.maxLabel}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
