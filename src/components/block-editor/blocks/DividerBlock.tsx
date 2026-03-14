'use client'

import React from 'react'
import type { BlockComponentProps } from './types'
import type { DividerContent } from '@/lib/block-editor/types'

export const DividerBlock: React.FC<BlockComponentProps<'divider'>> = ({
  block,
  onFocus,
}) => {
  const { style: dividerStyle } = block.content as DividerContent

  return (
    <div onClick={onFocus} style={{ padding: '8px 0', cursor: 'pointer' }}>
      <hr
        style={{
          border: 'none',
          borderTop: `1px ${dividerStyle || 'solid'} var(--surbee-border-primary)`,
          margin: 0,
        }}
      />
    </div>
  )
}
