'use client'

import React, { useRef } from 'react'
import type { BlockComponentProps } from './types'
import type { ImageContent } from '@/lib/block-editor/types'

export const ImageBlock: React.FC<BlockComponentProps<'image'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as ImageContent
  const fileInputRef = useRef<HTMLInputElement>(null)
  const urlInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      onContentChange({ src: ev.target?.result as string, alt: file.name })
    }
    reader.readAsDataURL(file)
  }

  if (!content.src && isEditing) {
    return (
      <div onClick={onFocus}>
        <div
          style={{
            backgroundColor: '#f0f0f0',
            borderRadius: '8px',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          {/* Image icon */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '0', border: 'none', backgroundColor: 'transparent',
                cursor: 'pointer', color: '#bbb', fontSize: '13px',
              }}
              title="Upload image"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                const url = prompt('Enter image URL:')
                if (url) onContentChange({ src: url })
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '0', border: 'none', backgroundColor: 'transparent',
                cursor: 'pointer', color: '#bbb', fontSize: '13px',
              }}
              title="Paste URL"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div onClick={onFocus} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {content.src && (
        <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden' }}>
          <img
            src={content.src}
            alt={content.alt}
            style={{ maxWidth: '100%', borderRadius: '8px', height: 'auto', display: 'block' }}
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
              }}
              title="Remove image"
            >
              &times;
            </button>
          )}
        </div>
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
