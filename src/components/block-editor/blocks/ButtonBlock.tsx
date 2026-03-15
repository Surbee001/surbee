'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { ButtonContent } from '@/lib/block-editor/types'

const RADIUS_MAP: Record<string, string> = {
  none: '0px',
  sm: '6px',
  md: '10px',
  lg: '16px',
  full: '9999px',
}

const SIZE_MAP: Record<string, { padding: string; fontSize: string }> = {
  sm: { padding: '8px 20px', fontSize: '0.825rem' },
  md: { padding: '12px 32px', fontSize: '0.95rem' },
  lg: { padding: '16px 40px', fontSize: '1.05rem' },
}

export const ButtonBlock: React.FC<BlockComponentProps<'button'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
  theme,
}) => {
  const content = block.content as ButtonContent
  const align = content.align || 'left'
  const radius = content.radius || 'md'
  const size = content.size || 'md'

  const sizeStyle = SIZE_MAP[size] || SIZE_MAP.md
  const borderRadius = RADIUS_MAP[radius] || RADIUS_MAP.md

  const getVariantStyle = (): React.CSSProperties => {
    switch (content.variant) {
      case 'primary':
        return {
          backgroundColor: theme.primaryColor,
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }
      case 'secondary':
        return {
          backgroundColor: theme.secondaryColor,
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }
      case 'outline':
        return {
          backgroundColor: 'transparent',
          color: theme.primaryColor,
          border: `1.5px solid ${theme.primaryColor}`,
        }
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: theme.primaryColor,
          border: 'none',
        }
      default:
        return {
          backgroundColor: theme.primaryColor,
          color: '#ffffff',
          border: 'none',
        }
    }
  }

  // Read meta.style overrides from toolbar
  const bs = block.meta.style || {}

  const btnStyle: React.CSSProperties = {
    ...sizeStyle,
    borderRadius,
    fontWeight: bs.fontWeight || '500',
    cursor: isEditing ? 'default' : 'pointer',
    fontFamily: bs.fontFamily || theme.fontFamily || 'inherit',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    letterSpacing: '0.01em',
    ...getVariantStyle(),
    // Toolbar overrides — applied last so they win
    ...(bs.fontSize ? { fontSize: bs.fontSize } : {}),
    ...(bs.color ? { color: bs.color } : {}),
  }

  return (
    <div
      onClick={onFocus}
      style={{
        display: 'flex',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      <button style={btnStyle} disabled={isEditing}>
        {isEditing ? (
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
        ) : content.label}
      </button>
    </div>
  )
}

export { RADIUS_MAP }
