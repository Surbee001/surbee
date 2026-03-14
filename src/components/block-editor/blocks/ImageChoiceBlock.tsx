'use client'

import React from 'react'
import { nanoid } from 'nanoid'
import type { BlockComponentProps } from './types'
import type { ImageChoiceContent } from '@/lib/block-editor/types'

export const ImageChoiceBlock: React.FC<BlockComponentProps<'image-choice'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as ImageChoiceContent
  const cols = content.columns || 2

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

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '8px' }}>
        {content.options.map((option, i) => (
          <div
            key={option.id}
            style={{
              border: '1px solid var(--surbee-border-primary)',
              borderRadius: '8px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {option.imageUrl ? (
              <img src={option.imageUrl} alt={option.label} style={{ width: '100%', height: 100, objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: 100, backgroundColor: 'var(--surbee-bg-tertiary, #f3f4f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="Image URL"
                    onBlur={(e) => {
                      if (e.target.value) {
                        const opts = [...content.options]
                        opts[i] = { ...opts[i], imageUrl: e.target.value }
                        onContentChange({ options: opts })
                      }
                    }}
                    style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.7rem', color: 'var(--surbee-fg-muted)', textAlign: 'center', width: '90%', fontFamily: 'inherit' }}
                  />
                ) : (
                  <span style={{ fontSize: '1.5rem', opacity: 0.3 }}>&#128247;</span>
                )}
              </div>
            )}
            <div style={{ padding: '6px 8px', textAlign: 'center' }}>
              {isEditing ? (
                <input type="text" value={option.label} onChange={(e) => {
                  const opts = [...content.options]
                  opts[i] = { ...opts[i], label: e.target.value }
                  onContentChange({ options: opts })
                }} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.8rem', color: 'var(--surbee-fg-primary)', textAlign: 'center', width: '100%', fontFamily: 'inherit' }} />
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--surbee-fg-primary)' }}>{option.label}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <button onClick={() => onContentChange({ options: [...content.options, { id: nanoid(8), label: `Option ${content.options.length + 1}`, imageUrl: '' }] })} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-accent-primary, #2563eb)', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit' }}>+ Add option</button>
      )}
    </div>
  )
}
