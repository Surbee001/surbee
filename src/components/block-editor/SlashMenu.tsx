'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BlockType } from '@/lib/block-editor/types'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface SlashMenuItem {
  type: BlockType
  label: string
  icon: string
  category: 'layout' | 'question' | 'media'
  keywords: string[]
  shortcut?: string
}

const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  // Questions
  { type: 'text-input', label: 'Short Answer', icon: 'Aa', category: 'question', keywords: ['short', 'text', 'input', 'name', 'email'] },
  { type: 'textarea', label: 'Long Answer', icon: '\u2261', category: 'question', keywords: ['paragraph', 'long', 'comment', 'feedback'] },
  { type: 'radio', label: 'Multiple Choice', icon: '\u25CB', category: 'question', keywords: ['radio', 'single', 'choice', 'option'] },
  { type: 'checkbox', label: 'Checkboxes', icon: '\u2610', category: 'question', keywords: ['multi', 'check', 'select all'] },
  { type: 'select', label: 'Dropdown', icon: '\u25BE', category: 'question', keywords: ['dropdown', 'combo', 'select'] },
  { type: 'scale', label: 'Rating', icon: '\u2605', category: 'question', keywords: ['rating', 'stars', 'score', '1-5'] },
  { type: 'nps', label: 'NPS', icon: '\u2764', category: 'question', keywords: ['promoter', 'recommend', 'nps'] },
  { type: 'slider', label: 'Slider', icon: '\u2194', category: 'question', keywords: ['range', 'slider'] },
  { type: 'yes-no', label: 'Yes / No', icon: '\u2713', category: 'question', keywords: ['boolean', 'yes', 'no', 'toggle'] },
  { type: 'date-picker', label: 'Date', icon: '\uD83D\uDCC5', category: 'question', keywords: ['date', 'calendar'] },
  { type: 'matrix', label: 'Matrix', icon: '\u229E', category: 'question', keywords: ['grid', 'table'] },
  { type: 'ranking', label: 'Ranking', icon: '#', category: 'question', keywords: ['rank', 'order', 'sort'] },
  { type: 'file-upload', label: 'File Upload', icon: '\uD83D\uDCCE', category: 'question', keywords: ['upload', 'file'] },
  { type: 'likert', label: 'Likert', icon: '\u2630', category: 'question', keywords: ['agree', 'likert'] },
  { type: 'image-choice', label: 'Image Choice', icon: '\uD83D\uDDBC', category: 'question', keywords: ['image', 'photo', 'visual'] },
  // Layout
  { type: 'heading', label: 'Heading', icon: 'H', category: 'layout', keywords: ['title', 'header', 'h1', 'h2'] },
  { type: 'paragraph', label: 'Text', icon: 'T', category: 'layout', keywords: ['text', 'paragraph', 'body'] },
  { type: 'divider', label: 'Divider', icon: '\u2500', category: 'layout', keywords: ['line', 'separator', 'hr'] },
  { type: 'spacer', label: 'Spacer', icon: '\u2195', category: 'layout', keywords: ['gap', 'space'] },
  { type: 'button', label: 'Button', icon: '\u25A3', category: 'layout', keywords: ['button', 'submit', 'next', 'cta', 'action'] },
  { type: 'columns', label: 'Columns', icon: '\u2759', category: 'layout', keywords: ['columns', 'layout', 'side by side', 'grid', 'row', 'two column'] },
  { type: 'table', label: 'Table', icon: '\u229E', category: 'layout', keywords: ['table', 'grid', 'rows', 'columns', 'data', 'spreadsheet'] },
  // Media
  { type: 'image', label: 'Image', icon: '\uD83D\uDDBC', category: 'media', keywords: ['image', 'photo'] },
  { type: 'video', label: 'Video', icon: '\u25B6', category: 'media', keywords: ['video', 'youtube'] },
  { type: 'custom-code', label: 'Custom Code', icon: '</>', category: 'media', keywords: ['code', 'html', 'css', 'custom', 'embed', 'script'] },
]

const CATEGORY_ORDER = ['question', 'layout', 'media'] as const
const CATEGORY_LABELS: Record<string, string> = {
  layout: 'Layout',
  question: 'Questions',
  media: 'Media',
}

export const SlashMenu: React.FC = () => {
  const { slashMenu, closeSlashMenu, addBlock, setSlashMenuFilter } = useBlockEditorStore()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const filterInputRef = useRef<HTMLInputElement>(null)
  const itemsRef = useRef<HTMLDivElement>(null)

  const filteredItems = useMemo(() => {
    const filter = slashMenu.filter.toLowerCase()
    if (!filter) return SLASH_MENU_ITEMS
    return SLASH_MENU_ITEMS.filter(item =>
      item.label.toLowerCase().includes(filter) ||
      item.keywords.some(k => k.includes(filter))
    )
  }, [slashMenu.filter])

  useEffect(() => { setSelectedIndex(0) }, [slashMenu.filter])

  useEffect(() => {
    if (slashMenu.isOpen) setTimeout(() => filterInputRef.current?.focus(), 50)
  }, [slashMenu.isOpen])

  useEffect(() => {
    if (!slashMenu.isOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) closeSlashMenu()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [slashMenu.isOpen, closeSlashMenu])

  // Scroll selected item into view
  useEffect(() => {
    if (!itemsRef.current) return
    const activeEl = itemsRef.current.querySelector('[data-active="true"]')
    activeEl?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleSelect = useCallback((item: SlashMenuItem) => {
    if (!slashMenu.pageId) return
    addBlock(slashMenu.pageId, item.type, slashMenu.afterBlockId)
    closeSlashMenu()
  }, [slashMenu.pageId, slashMenu.afterBlockId, addBlock, closeSlashMenu])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { e.preventDefault(); closeSlashMenu(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filteredItems.length - 1)); return }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); return }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredItems[selectedIndex]) handleSelect(filteredItems[selectedIndex])
      return
    }
  }, [closeSlashMenu, filteredItems, selectedIndex, handleSelect])

  if (!slashMenu.isOpen || !slashMenu.position) return null

  const grouped: { category: string; items: SlashMenuItem[] }[] = []
  for (const cat of CATEGORY_ORDER) {
    const items = filteredItems.filter(i => i.category === cat)
    if (items.length > 0) grouped.push({ category: cat, items })
  }

  // Flat list for keyboard index
  let globalIdx = 0

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.12 }}
        style={{
          position: 'fixed',
          left: Math.min(slashMenu.position.x, window.innerWidth - 340),
          top: Math.min(slashMenu.position.y, window.innerHeight - 440),
          width: 320,
          maxHeight: 420,
          borderRadius: '14px',
          backgroundColor: '#ffffff',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Search */}
        <div style={{ padding: '10px 14px 8px' }}>
          <input
            ref={filterInputRef}
            type="text"
            value={slashMenu.filter}
            onChange={(e) => setSlashMenuFilter(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search blocks..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              color: '#1a1a1a',
              fontFamily: 'var(--font-inter), system-ui, sans-serif',
            }}
          />
        </div>

        {/* Items */}
        <div ref={itemsRef} style={{ overflowY: 'auto', flex: 1, padding: '4px 6px 8px' }} className="thin-scrollbar">
          {filteredItems.length === 0 ? (
            <div style={{
              padding: '20px', textAlign: 'center', fontSize: '14px',
              color: '#999',
            }}>
              No results
            </div>
          ) : (
            grouped.map(({ category, items }) => {
              return (
                <div key={category}>
                  <div style={{
                    padding: '12px 10px 6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#999',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {CATEGORY_LABELS[category]}
                  </div>
                  {items.map((item) => {
                    const thisIndex = filteredItems.indexOf(item)
                    const isActive = thisIndex === selectedIndex
                    return (
                      <button
                        key={item.type}
                        data-active={isActive}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          width: '100%',
                          padding: '9px 10px',
                          border: 'none',
                          background: isActive ? '#EBF0FF' : 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'var(--font-inter), system-ui, sans-serif',
                          borderRadius: '8px',
                          transition: 'background 0.1s',
                        }}
                      >
                        <span style={{
                          width: 28,
                          height: 28,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          fontSize: '13px',
                          flexShrink: 0,
                          backgroundColor: isActive ? '#D6E0FF' : '#f0f0f0',
                          color: isActive ? '#3B6EF6' : '#666',
                          transition: 'all 0.1s',
                        }}>
                          {item.icon}
                        </span>
                        <span style={{
                          fontSize: '14px',
                          color: '#1a1a1a',
                          fontWeight: 400,
                          lineHeight: 1.3,
                          flex: 1,
                        }}>
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <span style={{
                            fontSize: '12px',
                            color: '#bbb',
                            fontFamily: 'var(--font-inter), system-ui, sans-serif',
                          }}>
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
