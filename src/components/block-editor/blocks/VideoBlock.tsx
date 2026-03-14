'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { VideoContent } from '@/lib/block-editor/types'

export const VideoBlock: React.FC<BlockComponentProps<'video'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as VideoContent

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
        }}
      >
        <span style={{ fontSize: '1.5rem', opacity: 0.4 }}>&#127909;</span>
        <input
          type="text"
          placeholder="Paste a video URL..."
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
        <div style={{ position: 'relative', paddingBottom: '56.25%', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#000' }}>
          <iframe
            src={content.src}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allowFullScreen
          />
        </div>
      )}
    </div>
  )
}
