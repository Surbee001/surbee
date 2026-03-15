'use client'

import React, { useRef, useEffect, useCallback } from 'react'
import type { BlockComponentProps } from './types'
import type { HeadingContent } from '@/lib/block-editor/types'

export const HeadingBlock: React.FC<BlockComponentProps<'heading'>> = ({
  block,
  isEditing,
  isFocused,
  onContentChange,
  onFocus,
  onBlur,
  onInsertAfter,
  onDelete,
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const { text, level } = block.content as HeadingContent

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
    if (e.key === 'Enter') {
      e.preventDefault()
      onInsertAfter('paragraph')
    }
    if (e.key === 'Backspace' && ref.current) {
      const currentText = ref.current.textContent ?? ''
      if (currentText === '') {
        e.preventDefault()
        onDelete()
      }
    }
  }, [onInsertAfter, onDelete])

  const Tag = `h${level}` as const
  const defaultSize = level === 1 ? '2rem' : level === 2 ? '1.5rem' : '1.25rem'
  const bStyle = block.meta.style || {}
  const fontSize = bStyle.fontSize || defaultSize
  const fontWeight = bStyle.fontWeight || '700'
  const color = bStyle.color || 'var(--surbee-fg-primary)'
  const fontFamily = bStyle.fontFamily || undefined

  if (!isEditing) {
    return (
      <Tag style={{ fontSize, fontWeight, color, fontFamily, margin: 0, lineHeight: 1.3 }}>
        {text || 'Heading'}
      </Tag>
    )
  }

  return (
    <div
      ref={ref}
      role="heading"
      aria-level={level}
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={`Heading ${level}`}
      style={{
        fontSize,
        fontWeight,
        color,
        fontFamily,
        outline: 'none',
        minHeight: '1.2em',
        lineHeight: 1.3,
        margin: 0,
        caretColor: 'var(--surbee-accent-primary, #2563eb)',
      }}
      className="empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--surbee-fg-muted)] empty:before:pointer-events-none"
    >
      {text}
    </div>
  )
}
