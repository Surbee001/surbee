'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { FileUploadContent } from '@/lib/block-editor/types'

export const FileUploadBlock: React.FC<BlockComponentProps<'file-upload'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as FileUploadContent

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

      <div style={{
        border: '2px dashed var(--surbee-border-primary)',
        borderRadius: '8px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span style={{ fontSize: '1.25rem', opacity: 0.4 }}>&#128206;</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--surbee-fg-muted)' }}>
          Drag & drop or click to upload
        </span>
        {content.maxFileSizeMB && (
          <span style={{ fontSize: '0.75rem', color: 'var(--surbee-fg-muted)', opacity: 0.7 }}>
            Max {content.maxFileSizeMB}MB
          </span>
        )}
      </div>
    </div>
  )
}
