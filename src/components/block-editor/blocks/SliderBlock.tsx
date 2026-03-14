'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { SliderContent } from '@/lib/block-editor/types'

export const SliderBlock: React.FC<BlockComponentProps<'slider'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as SliderContent
  const midValue = Math.round((content.min + content.max) / 2)

  return (
    <div onClick={onFocus} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        {isEditing ? (
          <input type="text" value={content.label} onChange={(e) => onContentChange({ label: e.target.value })} placeholder="Question label" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)', padding: 0, width: '100%', fontFamily: 'inherit' }} />
        ) : (
          <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)' }}>{content.label}</label>
        )}
        {content.required && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>*</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--surbee-fg-muted)', minWidth: 24 }}>{content.min}</span>
        <input
          type="range"
          min={content.min}
          max={content.max}
          step={content.step}
          defaultValue={midValue}
          disabled
          style={{ flex: 1, accentColor: 'var(--surbee-accent-primary, #2563eb)', opacity: 0.7 }}
        />
        <span style={{ fontSize: '0.8rem', color: 'var(--surbee-fg-muted)', minWidth: 24, textAlign: 'right' }}>{content.max}</span>
      </div>

      {content.showValue && (
        <div style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--surbee-fg-muted)' }}>{midValue}</div>
      )}
    </div>
  )
}
