'use client'

import React, { useRef, useCallback, useState } from 'react'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface BlockGapProps {
  pageId: string
  /** The block ID above this gap (null if at the very top) */
  afterBlockId: string | null
  /** The block ID below this gap (null if at the very bottom — use EmptyBlockPlaceholder instead) */
  beforeBlockId: string | null
}

/**
 * An invisible editable gap between blocks.
 * Click to place cursor, type to create a new paragraph,
 * Enter commits the text as a block, Backspace when empty deletes the block above.
 */
export const BlockGap: React.FC<BlockGapProps> = ({ pageId, afterBlockId, beforeBlockId }) => {
  const inputRef = useRef<HTMLDivElement>(null)
  const addBlock = useBlockEditorStore(s => s.addBlock)
  const deleteBlock = useBlockEditorStore(s => s.deleteBlock)
  const openSlashMenu = useBlockEditorStore(s => s.openSlashMenu)
  const [active, setActive] = useState(false)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const text = inputRef.current?.textContent || ''

    if (e.key === '/' && !text.trim()) {
      e.preventDefault()
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect()
        openSlashMenu(pageId, { x: rect.left, y: rect.bottom + 4 }, afterBlockId)
      }
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (text.trim()) {
        addBlock(pageId, 'paragraph', afterBlockId, { text: text.trim() })
        if (inputRef.current) inputRef.current.textContent = ''
        setActive(false)
      }
      return
    }

    if (e.key === 'Backspace' && !text && afterBlockId) {
      e.preventDefault()
      deleteBlock(pageId, afterBlockId)
      setActive(false)
      return
    }
  }, [pageId, afterBlockId, addBlock, deleteBlock, openSlashMenu])

  const handleInput = useCallback(() => {
    const text = inputRef.current?.textContent || ''
    setActive(text.length > 0)
  }, [])

  const handleFocus = useCallback(() => {
    setActive(true)
  }, [])

  const handleBlur = useCallback(() => {
    const text = inputRef.current?.textContent || ''
    if (text.trim()) {
      addBlock(pageId, 'paragraph', afterBlockId, { text: text.trim() })
      if (inputRef.current) inputRef.current.textContent = ''
    }
    setActive(false)
  }, [pageId, afterBlockId, addBlock])

  return (
    <div
      style={{
        minHeight: active ? '28px' : '6px',
        cursor: 'text',
        position: 'relative',
        transition: 'min-height 0.1s ease',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={{
          outline: 'none',
          fontSize: 'inherit',
          color: 'var(--surbee-fg-primary)',
          minHeight: active ? '22px' : '0',
          padding: active ? '2px 4px' : '0 4px',
          fontFamily: 'inherit',
          lineHeight: 1.6,
          opacity: active ? 1 : 0,
          transition: 'opacity 0.1s, min-height 0.1s, padding 0.1s',
        }}
      />
    </div>
  )
}
