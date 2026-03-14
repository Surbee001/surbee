'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { ImageContent } from '@/lib/block-editor/types'

export const ImageBlock: React.FC<BlockComponentProps<'image'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as ImageContent

  if (!content.src && isEditing) {
    return (
      <div
        onClick={onFocus}
        style={{
          border: '2px dashed var(--surbee-border-primary)',
          borderRadius: '8px',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: '1.5rem', opacity: 0.4 }}>&#128247;</span>
        <span style={{ fontSize: '0.85rem', color: 'var(--surbee-fg-muted)' }}>Click to add an image</span>
        <input
          type="text"
          placeholder="Or paste an image URL..."
          onBlur={(e) => {
            if (e.target.value) onContentChange({ src: e.target.value })
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
              onContentChange({ src: (e.target as HTMLInputElement).value })
            }
          }}
          style={{
            background: 'transparent', border: '1px solid var(--surbee-border-primary)',
            borderRadius: '6px', padding: '6px 10px', fontSize: '0.8rem',
            color: 'var(--surbee-fg-primary)', width: '80%', textAlign: 'center', fontFamily: 'inherit',
          }}
        />
      </div>
    )
  }

  return (
    <div onClick={onFocus} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {content.src && (
        <img
          src={content.src}
          alt={content.alt}
          style={{ maxWidth: '100%', borderRadius: '8px', height: 'auto' }}
        />
      )}
      {(content.caption || isEditing) && isEditing ? (
        <input
          type="text"
          value={content.caption ?? ''}
          onChange={(e) => onContentChange({ caption: e.target.value || undefined })}
          placeholder="Add a caption..."
          style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--surbee-fg-muted)', textAlign: 'center', fontFamily: 'inherit', padding: '4px 0' }}
        />
      ) : content.caption ? (
        <p style={{ fontSize: '0.8rem', color: 'var(--surbee-fg-muted)', textAlign: 'center', margin: 0 }}>{content.caption}</p>
      ) : null}
    </div>
  )
}
