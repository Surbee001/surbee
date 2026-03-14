'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import type { BlockComponentProps } from './types'
import type { ParagraphContent } from '@/lib/block-editor/types'

export const ParagraphBlock: React.FC<BlockComponentProps<'paragraph'>> = ({
  block,
  isEditing,
  isFocused,
  onContentChange,
  onFocus,
  onBlur,
  onInsertAfter,
  onDelete,
  onSlashMenu,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { text } = block.content as ParagraphContent

  useEffect(() => {
    if (isFocused && ref.current && isEditing) {
      ref.current.focus()
    }
  }, [isFocused, isEditing])

  const handleInput = useCallback(() => {
    if (ref.current) {
      onContentChange({ text: ref.current.textContent ?? '' })
    }
  }, [onContentChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onInsertAfter('paragraph')
    }

    // Backspace on empty paragraph deletes it
    if (e.key === 'Backspace' && ref.current) {
      const currentText = ref.current.textContent ?? ''
      if (currentText === '') {
        e.preventDefault()
        onDelete()
      }
    }

    if (e.key === '/' && ref.current) {
      const currentText = ref.current.textContent ?? ''
      if (currentText === '' || currentText === '/') {
        e.preventDefault()
        if (onSlashMenu) {
          const rect = ref.current.getBoundingClientRect()
          onSlashMenu({ x: rect.left, y: rect.bottom + 4 })
        }
      }
    }
  }, [onInsertAfter, onSlashMenu, onDelete])

  const bStyle = block.meta.style || {}
  const fs = bStyle.fontSize || '0.95rem'
  const fc = bStyle.color || 'var(--surbee-fg-secondary)'
  const fw = bStyle.fontWeight || undefined
  const ff = bStyle.fontFamily || undefined

  if (!isEditing) {
    return (
      <p style={{ color: fc, margin: 0, lineHeight: 1.6, fontSize: fs, fontWeight: fw, fontFamily: ff }}>
        {text}
      </p>
    )
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      data-placeholder="Type something... Press / for commands"
      style={{
        color: fc,
        outline: 'none',
        minHeight: '1.4em',
        lineHeight: 1.6,
        fontSize: fs,
        fontWeight: fw,
        fontFamily: ff,
        margin: 0,
      }}
      className="focus:empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--surbee-fg-muted)] empty:before:pointer-events-none"
    >
      {text}
    </div>
  )
}
