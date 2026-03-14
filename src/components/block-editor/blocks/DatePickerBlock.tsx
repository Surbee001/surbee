'use client'

import React, { useState } from 'react'
import type { BlockComponentProps } from './types'
import type { DatePickerContent } from '@/lib/block-editor/types'

export const DatePickerBlock: React.FC<BlockComponentProps<'date-picker'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as DatePickerContent

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

      {/* Date input styled like other inputs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 12px',
        border: '1px solid var(--surbee-border-primary)',
        borderRadius: '8px',
        backgroundColor: 'var(--surbee-input-bg, transparent)',
        opacity: isEditing ? 0.7 : 1,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--surbee-fg-muted)" strokeWidth="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span style={{ fontSize: '0.9rem', color: 'var(--surbee-fg-muted)', fontFamily: 'inherit' }}>
          {content.includeTime ? 'Pick a date and time...' : 'Pick a date...'}
        </span>
      </div>
    </div>
  )
}
