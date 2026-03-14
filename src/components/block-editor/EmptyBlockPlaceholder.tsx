'use client'

import React, { useRef, useCallback, useState } from 'react'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface EmptyBlockPlaceholderProps {
  pageId: string
}

export const EmptyBlockPlaceholder: React.FC<EmptyBlockPlaceholderProps> = ({ pageId }) => {
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLDivElement>(null)
  const openSlashMenu = useBlockEditorStore(s => s.openSlashMenu)
  const addBlock = useBlockEditorStore(s => s.addBlock)
  const [isTyping, setIsTyping] = useState(false)

  const handleOpenSlashMenu = useCallback(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect()
      openSlashMenu(pageId, { x: rect.left, y: rect.bottom + 4 })
    }
  }, [pageId, openSlashMenu])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '/' && inputRef.current) {
      const text = inputRef.current.textContent || ''
      // Only open slash menu if at start or content is empty
      if (!text.trim()) {
        e.preventDefault()
        handleOpenSlashMenu()
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && inputRef.current) {
      e.preventDefault()
      const text = inputRef.current.textContent || ''
      if (text.trim()) {
        // Add as a paragraph block
        addBlock(pageId, 'paragraph', undefined, { text: text.trim() })
        inputRef.current.textContent = ''
        setIsTyping(false)
      }
    }
  }, [pageId, addBlock, handleOpenSlashMenu])

  const handleInput = useCallback(() => {
    const text = inputRef.current?.textContent || ''
    setIsTyping(text.length > 0)
  }, [])

  const handleClick = useCallback(() => {
    // Focus the editable area instead of opening slash menu
    inputRef.current?.focus()
  }, [])

  const hasBlocks = useBlockEditorStore(s => {
    const page = s.survey?.pages.find(p => p.id === pageId)
    return (page?.blocks.length ?? 0) > 0
  })

  // If there are already blocks, show a minimal clickable area
  if (hasBlocks) {
    return (
      <div
        ref={ref}
        tabIndex={0}
        onClick={handleClick}
        style={{
          padding: '8px 16px',
          cursor: 'text',
          borderRadius: '6px',
          minHeight: '24px',
        }}
      >
        <div
          ref={inputRef}
          contentEditable
          suppressContentEditableWarning
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          data-placeholder="Type text or / for blocks..."
          style={{
            outline: 'none',
            fontSize: '0.875rem',
            color: 'var(--surbee-fg-primary)',
            minHeight: '20px',
            fontFamily: 'inherit',
          }}
          className="empty-placeholder-input"
        />
      </div>
    )
  }

  // Empty page — show the prompt with inline editing
  return (
    <div
      ref={ref}
      tabIndex={0}
      onClick={handleClick}
      style={{
        padding: '12px 16px',
        cursor: 'text',
        borderRadius: '6px',
      }}
    >
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        data-placeholder="Type to add text, or press / for more blocks..."
        style={{
          outline: 'none',
          fontSize: '0.875rem',
          color: isTyping ? 'var(--surbee-fg-primary)' : 'var(--surbee-fg-muted)',
          minHeight: '20px',
          opacity: isTyping ? 1 : 0.6,
          fontFamily: 'inherit',
        }}
        className="empty-placeholder-input"
      />
      <style>{`
        .empty-placeholder-input:empty::before {
          content: attr(data-placeholder);
          color: var(--surbee-fg-muted);
          opacity: 0.6;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}
