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
  const content = block.content as ParagraphContent
  const { text, listType } = content

  useEffect(() => {
    if (isFocused && ref.current && isEditing) {
      ref.current.focus()
    }
  }, [isFocused, isEditing])

  const handleInput = useCallback(() => {
    if (ref.current) {
      onContentChange({ text: ref.current.innerHTML ?? '' })
    }
  }, [onContentChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !listType) {
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
  }, [onInsertAfter, onSlashMenu, onDelete, listType])

  const bStyle = block.meta.style || {}
  const fs = bStyle.fontSize || '0.95rem'
  const fc = bStyle.color || 'var(--surbee-fg-secondary)'
  const fw = bStyle.fontWeight || undefined
  const ff = bStyle.fontFamily || undefined

  const baseStyle: React.CSSProperties = {
    color: fc,
    margin: 0,
    lineHeight: 1.6,
    fontSize: fs,
    fontWeight: fw,
    fontFamily: ff,
  }

  // List rendering for preview mode
  if (!isEditing) {
    if (listType && text) {
      const lines = text.replace(/<[^>]*>/g, '\n').split('\n').filter(l => l.trim())
      if (listType === 'bullet') {
        return (
          <ul style={{ ...baseStyle, paddingLeft: '1.5em', listStyleType: 'disc' }}>
            {lines.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        )
      }
      if (listType === 'numbered') {
        return (
          <ol style={{ ...baseStyle, paddingLeft: '1.5em', listStyleType: 'decimal' }}>
            {lines.map((line, i) => <li key={i}>{line}</li>)}
          </ol>
        )
      }
      if (listType === 'todo') {
        return (
          <div style={baseStyle}>
            {lines.map((line, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 0' }}>
                <input type="checkbox" disabled style={{ width: 16, height: 16, accentColor: 'var(--surbee-accent-primary, #2563eb)' }} />
                <span>{line}</span>
              </div>
            ))}
          </div>
        )
      }
    }
    return (
      <>
        <style>{`.surbee-block-text a { color: var(--surbee-accent-primary, #2563eb); text-decoration: underline; text-underline-offset: 2px; }`}</style>
        <p className="surbee-block-text" style={baseStyle} dangerouslySetInnerHTML={{ __html: text }} />
      </>
    )
  }

  // List indicator prefix in edit mode
  const listPrefix = listType === 'bullet' ? '• ' : listType === 'numbered' ? '1. ' : listType === 'todo' ? '☐ ' : ''
  const placeholder = listType
    ? `${listPrefix}List item (Shift+Enter for new line)`
    : 'Type something... Press / for commands'

  return (
    <div
      ref={ref}
      className="surbee-block-text"
      contentEditable
      suppressContentEditableWarning
      spellCheck
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      data-placeholder={placeholder}
      style={{
        ...baseStyle,
        outline: 'none',
        minHeight: '1.4em',
        caretColor: 'var(--surbee-accent-primary, #2563eb)',
        ...(listType === 'bullet' ? { paddingLeft: '1.5em', listStyleType: 'disc' } : {}),
        ...(listType === 'numbered' ? { paddingLeft: '1.5em' } : {}),
      }}
      className="focus:empty:before:content-[attr(data-placeholder)] empty:before:text-[var(--surbee-fg-muted)] empty:before:pointer-events-none"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  )
}
