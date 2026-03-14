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
      <div onClick={onFocus}>
        <div
          style={{
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            minHeight: '140px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            cursor: 'pointer',
          }}
        >
          {/* Video icon */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>

          {/* URL input */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: '80%', maxWidth: '320px' }}>
            <input
              type="text"
              placeholder="Paste a video URL..."
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                if (e.target.value) onContentChange({ src: e.target.value })
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                  onContentChange({ src: (e.target as HTMLInputElement).value })
                }
              }}
              style={{
                flex: 1,
                background: '#fff', border: '1px solid #ddd',
                borderRadius: '6px', padding: '8px 12px', fontSize: '13px',
                color: '#333', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>
        </div>
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
          {isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); onContentChange({ src: '' }) }}
              style={{
                position: 'absolute', top: 8, right: 8,
                width: 24, height: 24, borderRadius: '6px',
                backgroundColor: 'rgba(0,0,0,0.5)', border: 'none',
                color: '#fff', cursor: 'pointer', fontSize: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 2,
              }}
              title="Remove video"
            >
              &times;
            </button>
          )}
        </div>
      )}
    </div>
  )
}
