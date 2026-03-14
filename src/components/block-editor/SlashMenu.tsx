'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BlockType } from '@/lib/block-editor/types'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface SlashMenuItem {
  type: BlockType
  label: string
  description: string
  icon: string
  category: 'layout' | 'question' | 'media'
  keywords: string[]
}

const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  { type: 'heading', label: 'Heading', description: 'Section title', icon: 'H', category: 'layout', keywords: ['title', 'header', 'h1', 'h2'] },
  { type: 'paragraph', label: 'Text', description: 'Plain text', icon: 'T', category: 'layout', keywords: ['text', 'paragraph', 'body'] },
  { type: 'divider', label: 'Divider', description: 'Separator line', icon: '\u2500', category: 'layout', keywords: ['line', 'separator', 'hr'] },
  { type: 'spacer', label: 'Spacer', description: 'Vertical space', icon: '\u2195', category: 'layout', keywords: ['gap', 'space'] },
  { type: 'button', label: 'Button', description: 'Submit / action', icon: '\u25A3', category: 'layout', keywords: ['button', 'submit', 'next', 'cta', 'action'] },
  { type: 'text-input', label: 'Short Answer', description: 'Single line text', icon: 'Aa', category: 'question', keywords: ['short', 'text', 'input', 'name', 'email'] },
  { type: 'textarea', label: 'Long Answer', description: 'Multi-line text', icon: '\u2261', category: 'question', keywords: ['paragraph', 'long', 'comment', 'feedback'] },
  { type: 'radio', label: 'Multiple Choice', description: 'Pick one', icon: '\u25CB', category: 'question', keywords: ['radio', 'single', 'choice', 'option'] },
  { type: 'checkbox', label: 'Checkboxes', description: 'Pick many', icon: '\u2610', category: 'question', keywords: ['multi', 'check', 'select all'] },
  { type: 'select', label: 'Dropdown', description: 'Select from list', icon: '\u25BE', category: 'question', keywords: ['dropdown', 'combo', 'select'] },
  { type: 'scale', label: 'Rating', description: 'Numeric scale', icon: '\u2605', category: 'question', keywords: ['rating', 'stars', 'score', '1-5'] },
  { type: 'nps', label: 'NPS', description: '0-10 score', icon: '\u2764', category: 'question', keywords: ['promoter', 'recommend', 'nps'] },
  { type: 'slider', label: 'Slider', description: 'Range value', icon: '\u2194', category: 'question', keywords: ['range', 'slider'] },
  { type: 'yes-no', label: 'Yes / No', description: 'Binary', icon: '\u2713', category: 'question', keywords: ['boolean', 'yes', 'no', 'toggle'] },
  { type: 'date-picker', label: 'Date', description: 'Pick a date', icon: '\uD83D\uDCC5', category: 'question', keywords: ['date', 'calendar'] },
  { type: 'matrix', label: 'Matrix', description: 'Grid table', icon: '\u229E', category: 'question', keywords: ['grid', 'table'] },
  { type: 'ranking', label: 'Ranking', description: 'Order items', icon: '#', category: 'question', keywords: ['rank', 'order', 'sort'] },
  { type: 'file-upload', label: 'File Upload', description: 'Upload file', icon: '\uD83D\uDCCE', category: 'question', keywords: ['upload', 'file'] },
  { type: 'likert', label: 'Likert', description: 'Agreement scale', icon: '\u2630', category: 'question', keywords: ['agree', 'likert'] },
  { type: 'image-choice', label: 'Image Choice', description: 'Pick from images', icon: '\uD83D\uDDBC', category: 'question', keywords: ['image', 'photo', 'visual'] },
  { type: 'image', label: 'Image', description: 'Add image', icon: '\uD83D\uDDBC', category: 'media', keywords: ['image', 'photo'] },
  { type: 'video', label: 'Video', description: 'Embed video', icon: '\u25B6', category: 'media', keywords: ['video', 'youtube'] },
  { type: 'custom-code', label: 'Custom Code', description: 'HTML & CSS', icon: '</>', category: 'media', keywords: ['code', 'html', 'css', 'custom', 'embed', 'script'] },
]

const CATEGORY_ORDER = ['question', 'layout', 'media'] as const
const CATEGORY_LABELS: Record<string, string> = {
  layout: 'LAYOUT',
  question: 'QUESTIONS',
  media: 'MEDIA',
}

export const SlashMenu: React.FC = () => {
  const { slashMenu, closeSlashMenu, addBlock, setSlashMenuFilter } = useBlockEditorStore()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const filterInputRef = useRef<HTMLInputElement>(null)

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
          left: Math.min(slashMenu.position.x, window.innerWidth - 240),
          top: Math.min(slashMenu.position.y, window.innerHeight - 380),
          width: 220,
          maxHeight: 360,
          borderRadius: '24px',
          border: '1px solid var(--surbee-dropdown-border, rgba(232, 232, 232, 0.15))',
          backgroundColor: 'var(--surbee-dropdown-bg, rgba(19, 19, 20, 0.95))',
          backdropFilter: 'blur(12px)',
          boxShadow: 'rgba(0, 0, 0, 0.2) 0px 7px 16px',
          overflow: 'hidden',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          padding: '8px',
        }}
      >
        {/* Search */}
        <div style={{
          padding: '4px 6px 8px',
          borderBottom: '1px solid var(--surbee-dropdown-border, rgba(232, 232, 232, 0.1))',
          marginBottom: '4px',
        }}>
          <input
            ref={filterInputRef}
            type="text"
            value={slashMenu.filter}
            onChange={(e) => setSlashMenuFilter(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search..."
            style={{
              width: '100%', padding: '6px 8px', border: 'none', outline: 'none',
              fontSize: '13px', backgroundColor: 'transparent',
              color: 'var(--surbee-dropdown-text, #E8E8E8)',
              fontFamily: 'var(--font-inter), sans-serif',
            }}
          />
        </div>

        {/* Items */}
        <div style={{ overflowY: 'auto', flex: 1 }} className="thin-scrollbar">
          {filteredItems.length === 0 ? (
            <div style={{
              padding: '16px', textAlign: 'center', fontSize: '13px',
              color: 'var(--surbee-dropdown-text-muted, rgba(232, 232, 232, 0.6))',
            }}>
              No results
            </div>
          ) : (
            grouped.map(({ category, items }) => (
              <div key={category}>
                <div style={{
                  padding: '8px 14px 4px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--surbee-dropdown-text-muted, rgba(232, 232, 232, 0.5))',
                  letterSpacing: '0.08em',
                }}>
                  {CATEGORY_LABELS[category]}
                </div>
                {items.map((item) => {
                  const globalIndex = filteredItems.indexOf(item)
                  const isActive = globalIndex === selectedIndex
                  return (
                    <button
                      key={item.type}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '10px 14px',
                        border: 'none',
                        background: isActive
                          ? 'var(--surbee-dropdown-item-hover, rgba(255, 255, 255, 0.05))'
                          : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: 'var(--font-inter), sans-serif',
                        borderRadius: '18px',
                        marginBottom: '1px',
                        transition: 'background 0.1s',
                      }}
                    >
                      <span style={{
                        width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '8px',
                        border: '1px solid var(--surbee-dropdown-border, rgba(232, 232, 232, 0.12))',
                        fontSize: '11px', flexShrink: 0,
                        backgroundColor: 'var(--surbee-dropdown-item-hover, rgba(255,255,255,0.04))',
                        color: 'var(--surbee-dropdown-text-muted, rgba(232, 232, 232, 0.6))',
                      }}>
                        {item.icon}
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: '13px',
                          color: 'var(--surbee-dropdown-text, #E8E8E8)',
                          fontWeight: 400,
                          lineHeight: 1.3,
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'var(--surbee-dropdown-text-muted, rgba(232, 232, 232, 0.5))',
                          lineHeight: 1.2,
                        }}>
                          {item.description}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
