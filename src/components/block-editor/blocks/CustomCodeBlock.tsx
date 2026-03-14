'use client'

import React, { useState } from 'react'
import type { BlockComponentProps } from './types'
import type { CustomCodeContent } from '@/lib/block-editor/types'

export const CustomCodeBlock: React.FC<BlockComponentProps<'custom-code'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as CustomCodeContent
  const [showEditor, setShowEditor] = useState(false)

  if (!isEditing) {
    return (
      <div onClick={onFocus}>
        <div dangerouslySetInnerHTML={{ __html: content.html }} />
        {content.css && <style>{content.css}</style>}
      </div>
    )
  }

  return (
    <div onClick={onFocus} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Preview */}
      <div
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid var(--surbee-border-primary)',
          minHeight: 48,
        }}
      >
        <div dangerouslySetInnerHTML={{ __html: content.html }} />
        {content.css && <style>{content.css}</style>}
      </div>

      {/* Toggle editor */}
      <button
        onClick={(e) => { e.stopPropagation(); setShowEditor(v => !v) }}
        style={{
          alignSelf: 'flex-start',
          padding: '4px 10px',
          borderRadius: '6px',
          border: '1px solid var(--surbee-border-primary)',
          backgroundColor: 'transparent',
          color: 'var(--surbee-fg-muted)',
          fontSize: '0.75rem',
          cursor: 'pointer',
          fontFamily: 'Opening Hours Sans, sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
        {showEditor ? 'Hide code' : 'Edit code'}
      </button>

      {/* Code editors */}
      {showEditor && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--surbee-fg-muted)', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>HTML</div>
            <textarea
              value={content.html}
              onChange={(e) => onContentChange({ html: e.target.value })}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: 100,
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--surbee-border-primary)',
                backgroundColor: '#1e1e2e',
                color: '#cdd6f4',
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
                tabSize: 2,
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--surbee-fg-muted)', marginBottom: '4px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>CSS</div>
            <textarea
              value={content.css || ''}
              onChange={(e) => onContentChange({ css: e.target.value })}
              spellCheck={false}
              placeholder="/* optional styles */"
              style={{
                width: '100%',
                minHeight: 60,
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--surbee-border-primary)',
                backgroundColor: '#1e1e2e',
                color: '#cdd6f4',
                fontFamily: 'JetBrains Mono, Fira Code, monospace',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                resize: 'vertical',
                outline: 'none',
                tabSize: 2,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
