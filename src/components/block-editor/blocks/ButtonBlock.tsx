'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { ButtonContent } from '@/lib/block-editor/types'

export const ButtonBlock: React.FC<BlockComponentProps<'button'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
  theme,
}) => {
  const content = block.content as ButtonContent
  const align = content.align || 'left'

  const btnStyle: React.CSSProperties = {
    padding: '12px 32px',
    borderRadius: theme.borderRadius || '8px',
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: isEditing ? 'default' : 'pointer',
    fontFamily: theme.fontFamily || 'inherit',
    transition: 'all 0.15s',
    border: content.variant === 'outline' ? `1.5px solid ${theme.primaryColor}` : 'none',
    backgroundColor: content.variant === 'primary' ? theme.primaryColor :
                     content.variant === 'secondary' ? theme.secondaryColor : 'transparent',
    color: content.variant === 'outline' ? theme.primaryColor : '#ffffff',
  }

  return (
    <div
      onClick={onFocus}
      style={{
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start' }}>
          <button style={btnStyle} disabled>
            <input
              type="text"
              value={content.label}
              onChange={(e) => onContentChange({ label: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                color: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
                fontFamily: 'inherit', textAlign: 'center', width: 'auto',
                minWidth: 60,
              }}
            />
          </button>
        </div>
      ) : (
        <button style={btnStyle}>{content.label}</button>
      )}
    </div>
  )
}
