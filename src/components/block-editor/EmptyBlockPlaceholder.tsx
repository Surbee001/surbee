'use client'

import React, { useRef, useCallback } from 'react'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface EmptyBlockPlaceholderProps {
  pageId: string
}

export const EmptyBlockPlaceholder: React.FC<EmptyBlockPlaceholderProps> = ({ pageId }) => {
  const ref = useRef<HTMLDivElement>(null)
  const openSlashMenu = useBlockEditorStore(s => s.openSlashMenu)

  const handleClick = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      openSlashMenu(pageId, { x: rect.left, y: rect.bottom + 4 })
    }
  }, [pageId, openSlashMenu])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '/' && ref.current) {
      e.preventDefault()
      const rect = ref.current.getBoundingClientRect()
      openSlashMenu(pageId, { x: rect.left, y: rect.bottom + 4 })
    }
  }, [pageId, openSlashMenu])

  const hasBlocks = useBlockEditorStore(s => {
    const page = s.survey?.pages.find(p => p.id === pageId)
    return (page?.blocks.length ?? 0) > 0
  })

  // If there are already blocks, show a minimal clickable area (no text)
  if (hasBlocks) {
    return (
      <div
        ref={ref}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{
          padding: '8px 16px',
          cursor: 'text',
          borderRadius: '6px',
          minHeight: '24px',
        }}
      />
    )
  }

  // Empty page — show the prompt
  return (
    <div
      ref={ref}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        padding: '12px 16px',
        color: 'var(--surbee-fg-muted)',
        fontSize: '0.875rem',
        cursor: 'text',
        borderRadius: '6px',
        opacity: 0.6,
      }}
    >
      Type <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', padding: '1px 4px', borderRadius: '3px', backgroundColor: 'var(--surbee-bg-tertiary, rgba(0,0,0,0.05))' }}>/</span> to add a block...
    </div>
  )
}
