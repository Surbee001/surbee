'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { SpacerContent } from '@/lib/block-editor/types'

export const SpacerBlock: React.FC<BlockComponentProps<'spacer'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as SpacerContent

  return (
    <div
      onClick={onFocus}
      style={{
        height: content.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isEditing ? 'ns-resize' : 'default',
      }}
    >
      {isEditing && (
        <span style={{ fontSize: '0.7rem', color: 'var(--surbee-fg-muted)', opacity: 0.5 }}>
          {content.height}px
        </span>
      )}
    </div>
  )
}
