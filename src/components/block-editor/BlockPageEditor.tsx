'use client'

import React, { useCallback, useEffect, useState, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useBlockEditorStore } from '@/stores/blockEditorStore'
import { PageView } from './PageView'
import { PageNavigator } from './PageNavigator'
import { SlashMenu } from './SlashMenu'
import { PageCardMenu } from './PageCardMenu'
import { LAYOUT_TEMPLATES, SURVEY_TEMPLATES, getTemplateCategories, type SurveyTemplate } from '@/lib/block-editor/templates'
import { createDefaultPage } from '@/lib/block-editor/block-defaults'

interface BlockPageEditorProps {
  isDarkMode?: boolean
  isPreviewMode?: boolean
}

export const BlockPageEditor: React.FC<BlockPageEditorProps> = ({
  isDarkMode = true,
}) => {
  const {
    survey,
    activePageId,
    editorMode,
    addPage,
    reorderBlocks,
    setActivePage,
    undo,
    redo,
    initSurvey,
  } = useBlockEditorStore()

  const addBlock = useBlockEditorStore(s => s.addBlock)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id || !activePageId) return
      const page = survey?.pages.find(p => p.id === activePageId)
      if (!page) return
      const oldIndex = page.blocks.findIndex(b => b.id === active.id)
      const newIndex = page.blocks.findIndex(b => b.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return
      const newOrder = [...page.blocks.map(b => b.id)]
      const [removed] = newOrder.splice(oldIndex, 1)
      newOrder.splice(newIndex, 0, removed)
      reorderBlocks(activePageId, newOrder)
    },
    [activePageId, survey, reorderBlocks],
  )

  const scrollRef = useRef<HTMLDivElement>(null)

  const handleAddPage = useCallback(() => { addPage() }, [addPage])

  // When filmstrip page is clicked, scroll to that page card
  const handlePageSelect = useCallback((pageId: string) => {
    setActivePage(pageId)
    // Scroll to the page card
    setTimeout(() => {
      const el = scrollRef.current?.querySelector(`[data-page-id="${pageId}"]`)
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }, [setActivePage])

  // Apply a layout template to the current page
  const handleLayoutTemplate = useCallback((templateId: string) => {
    if (!survey || !activePageId) return
    const template = LAYOUT_TEMPLATES.find(t => t.id === templateId)
    if (!template) return
    const blocks = template.blocks()
    blocks.forEach(block => {
      addBlock(activePageId, block.type, undefined, block.content as any)
    })
  }, [survey, activePageId, addBlock])

  // Apply a full survey template
  const handleSurveyTemplate = useCallback((template: SurveyTemplate) => {
    if (!survey) return
    const templatePages = template.pages()
    const newSurvey = {
      ...survey,
      title: template.label,
      theme: { ...survey.theme, ...template.theme },
      pages: templatePages.map((tp, idx) => ({
        ...createDefaultPage(idx, tp.title),
        blocks: tp.blocks,
      })),
    }
    initSurvey(newSurvey)
    setShowTemplateModal(false)
  }, [survey, initSurvey])

  // Colors
  // Survey canvas is always white — the survey itself is light regardless of editor dark mode
  const cardBg = '#FFFFFF'
  const selectedGlow = isDarkMode
    ? '0 0 0 1px rgba(255,255,255,0.06), 0 0 16px rgba(255,255,255,0.03)'
    : '0 0 0 1px rgba(0,0,0,0.06), 0 0 16px rgba(0,0,0,0.03)'
  const unselectedBorder = isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)'
  const mutedText = isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
  const btnBorder = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'

  if (!survey) {
    return (
      <div style={{
        height: '100%', width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '0 32px', opacity: 0.15 }}>
          <div style={{ height: 24, background: mutedText, borderRadius: 6, width: '75%', marginBottom: 16 }} />
          <div style={{ height: 16, background: mutedText, borderRadius: 4, width: '100%', marginBottom: 8 }} />
          <div style={{ height: 16, background: mutedText, borderRadius: 4, width: '85%', marginBottom: 24 }} />
          <div style={{ height: 40, background: mutedText, borderRadius: 8, width: '100%', marginBottom: 10 }} />
          <div style={{ height: 40, background: mutedText, borderRadius: 8, width: '100%', marginBottom: 10 }} />
          <div style={{ height: 40, background: mutedText, borderRadius: 8, width: '100%' }} />
        </div>
      </div>
    )
  }

  const isEditing = editorMode === 'edit'
  const theme = survey.theme
  const pages = survey.pages

  // Check if the survey is truly empty (no blocks on any page)
  const isEmptySurvey = pages.every(p => p.blocks.length === 0)

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Main area: scrollable page stack */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            padding: '16px 20px',
          }}
          className="thin-scrollbar"
        >
          {/* Empty survey state — show Untitled + template cards */}
          {isEditing && isEmptySurvey && (
            <div
              style={{
                width: '100%',
                maxWidth: 1040,
                backgroundColor: cardBg,
                borderRadius: '10px',
                boxShadow: selectedGlow,
                padding: '56px 64px',
                minHeight: '480px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}
            >
              {/* Type / prompt + inline editable area */}
              <EmptyStateEditor
                pageId={activePageId || pages[0]?.id || ''}
                addBlock={addBlock}
                openSlashMenu={(pos) => {
                  const pid = activePageId || pages[0]?.id
                  if (pid) {
                    useBlockEditorStore.getState().openSlashMenu(pid, pos)
                  }
                }}
              />

              {/* Template section */}
              <div style={{ marginTop: '48px' }}>
                <p style={{
                  fontSize: '15px',
                  color: '#aaa',
                  margin: '0 0 16px 0',
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                }}>
                  Or start with a template
                </p>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}>
                  {/* Layout template thumbnails */}
                  {LAYOUT_TEMPLATES.map((tmpl) => (
                    <TemplateCardWithTooltip
                      key={tmpl.id}
                      label={tmpl.label}
                      description={tmpl.description}
                      onClick={() => handleLayoutTemplate(tmpl.id)}
                    >
                      <LayoutThumbnail type={tmpl.thumbnail} />
                    </TemplateCardWithTooltip>
                  ))}

                  {/* Templates button */}
                  <TemplateCardWithTooltip
                    label="Templates"
                    description="Browse full survey templates"
                    onClick={() => setShowTemplateModal(true)}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                      </svg>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#888' }}>Templates</span>
                    </div>
                  </TemplateCardWithTooltip>

                  {/* Generate with AI button */}
                  <TemplateCardWithTooltip
                    label="Generate"
                    description="Let AI build your survey"
                    onClick={() => {
                      const chatInput = document.querySelector('.chat-input-grey [contenteditable]') as HTMLElement
                      if (chatInput) chatInput.focus()
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
                        <path d="M18 15l.75 2.25L21 18l-2.25.75L18 21l-.75-2.25L15 18l2.25-.75L18 15z" />
                      </svg>
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#888' }}>Generate</span>
                    </div>
                  </TemplateCardWithTooltip>
                </div>
              </div>
            </div>
          )}

          {/* Regular page cards — only show when not in empty state */}
          {!(isEditing && isEmptySurvey) && pages.map((page) => {
            const isActive = page.id === activePageId
            const pageBg = page.style?.backgroundColor || cardBg
            return (
              <div
                key={page.id}
                data-page-id={page.id}
                onClick={() => setActivePage(page.id)}
                className="group/card"
                style={{
                  width: '100%',
                  maxWidth: 1040,
                  minHeight: '400px',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: pageBg,
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: isActive ? selectedGlow : 'none',
                  border: isActive ? 'none' : `1px solid ${unselectedBorder}`,
                  transition: 'box-shadow 0.2s ease',
                  cursor: isActive ? 'default' : 'pointer',
                  position: 'relative',
                }}
              >
                {/* Page card menu — top left, card hover only */}
                {isEditing && <PageCardMenu pageId={page.id} isDarkMode={isDarkMode} />}

                <div style={{ flex: 1 }} className="thin-scrollbar">
                  <PageView page={page} isEditing={isEditing && isActive} theme={theme} />
                </div>
              </div>
            )
          })}

          {/* + button */}
          {isEditing && !isEmptySurvey && (
            <button
              onClick={handleAddPage}
              style={{
                width: 32, height: 32, borderRadius: '8px',
                border: `1px solid ${btnBorder}`,
                backgroundColor: 'transparent',
                color: mutedText,
                cursor: 'pointer', fontSize: '1.1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', flexShrink: 0,
                marginBottom: '8px',
              }}
              title="Add page"
            >
              +
            </button>
          )}
        </div>

        {/* Filmstrip — right side, vertically centered */}
        {pages.length > 1 && !isEmptySurvey && (
          <PageNavigator
            pages={pages}
            activePageId={activePageId || pages[0]?.id}
            onPageSelect={handlePageSelect}
            onAddPage={handleAddPage}
            isEditing={isEditing}
            isDarkMode={isDarkMode}
          />
        )}
      </div>

      <SlashMenu />

      {/* Templates Modal */}
      {showTemplateModal && (
        <TemplateModal
          onSelect={handleSurveyTemplate}
          onClose={() => setShowTemplateModal(false)}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          isDarkMode={isDarkMode}
        />
      )}
    </DndContext>
  )
}

// ---------------------------------------------------------------------------
// Empty State Editor — lets users type text or press / for blocks
// ---------------------------------------------------------------------------

const EmptyStateEditor: React.FC<{
  pageId: string
  addBlock: (pageId: string, type: any, afterBlockId?: string | null, contentOverride?: any) => string
  openSlashMenu: (pos: { x: number; y: number }) => void
}> = ({ pageId, addBlock, openSlashMenu }) => {
  const inputRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === '/' && inputRef.current) {
      const text = inputRef.current.textContent || ''
      if (!text.trim()) {
        e.preventDefault()
        const rect = inputRef.current.getBoundingClientRect()
        openSlashMenu({ x: rect.left, y: rect.bottom + 4 })
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey && inputRef.current) {
      e.preventDefault()
      const text = inputRef.current.textContent || ''
      if (text.trim()) {
        addBlock(pageId, 'paragraph', undefined, { text: text.trim() })
        inputRef.current.textContent = ''
      }
    }
  }, [pageId, addBlock, openSlashMenu])

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{ cursor: 'text' }}
    >
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onKeyDown={handleKeyDown}
        data-placeholder="Start typing, or press / for blocks..."
        style={{
          outline: 'none',
          fontSize: '18px',
          color: '#1a1a1a',
          minHeight: '28px',
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          lineHeight: 1.6,
        }}
        className="empty-state-editor-input"
      />
      <style>{`
        .empty-state-editor-input:empty::before {
          content: attr(data-placeholder);
          color: #ccc;
          pointer-events: none;
        }
      `}</style>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Template Card with Tooltip
// ---------------------------------------------------------------------------

const TemplateCardWithTooltip: React.FC<{
  label: string
  description: string
  onClick: () => void
  children: React.ReactNode
}> = ({ label, description, onClick, children }) => {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        style={{
          width: '140px',
          height: '100px',
          borderRadius: '10px',
          border: '1px solid #e5e5e5',
          backgroundColor: '#fafafa',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px',
          transition: 'all 0.15s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = '#ccc'
          e.currentTarget.style.backgroundColor = '#f5f5f5'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = '#e5e5e5'
          e.currentTarget.style.backgroundColor = '#fafafa'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        {children}
      </button>
      {showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          padding: '8px 12px',
          backgroundColor: '#1a1a1a',
          color: '#fff',
          borderRadius: '8px',
          fontSize: '12px',
          whiteSpace: 'nowrap',
          zIndex: 100,
          pointerEvents: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          textAlign: 'center',
          lineHeight: 1.4,
        }}>
          <div style={{ fontWeight: 600 }}>{label}</div>
          <div style={{ opacity: 0.7, fontSize: '11px' }}>{description}</div>
          <div style={{
            position: 'absolute',
            bottom: '-4px',
            left: '50%',
            transform: 'translateX(-50%) rotate(45deg)',
            width: '8px',
            height: '8px',
            backgroundColor: '#1a1a1a',
          }} />
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Layout Thumbnail SVGs — mini visual representations
// ---------------------------------------------------------------------------

const LayoutThumbnail: React.FC<{ type: string }> = ({ type }) => {
  const bar = '#d4d4d4'
  const light = '#e8e8e8'

  switch (type) {
    case 'text-only':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          <rect x="4" y="8" width="50" height="6" rx="2" fill={bar} />
          <rect x="4" y="20" width="72" height="4" rx="1.5" fill={light} />
          <rect x="4" y="28" width="60" height="4" rx="1.5" fill={light} />
          <rect x="4" y="42" width="30" height="10" rx="4" fill={bar} />
        </svg>
      )
    case 'image-left':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          <rect x="4" y="8" width="32" height="44" rx="3" fill={light} />
          <path d="M14 34l6-8 4 5 3-3 5 6H10z" fill={bar} opacity="0.5" />
          <rect x="16" y="22" width="8" height="8" rx="4" fill={bar} opacity="0.4" />
          <rect x="42" y="14" width="34" height="5" rx="2" fill={bar} />
          <rect x="42" y="25" width="34" height="3" rx="1.5" fill={light} />
          <rect x="42" y="32" width="28" height="3" rx="1.5" fill={light} />
        </svg>
      )
    case 'text-stack':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          <rect x="4" y="6" width="40" height="5" rx="2" fill={bar} />
          <rect x="4" y="16" width="72" height="3" rx="1.5" fill={light} />
          <rect x="4" y="23" width="60" height="3" rx="1.5" fill={light} />
          <rect x="4" y="32" width="72" height="1" rx="0.5" fill={light} />
          <rect x="4" y="40" width="72" height="14" rx="4" fill={light} />
          <rect x="10" y="44" width="30" height="3" rx="1" fill={bar} opacity="0.4" />
        </svg>
      )
    case 'image-right':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          <rect x="4" y="14" width="34" height="5" rx="2" fill={bar} />
          <rect x="4" y="25" width="34" height="3" rx="1.5" fill={light} />
          <rect x="4" y="32" width="28" height="3" rx="1.5" fill={light} />
          <rect x="44" y="8" width="32" height="44" rx="3" fill={light} />
          <path d="M54 34l6-8 4 5 3-3 5 6H50z" fill={bar} opacity="0.5" />
          <rect x="56" y="22" width="8" height="8" rx="4" fill={bar} opacity="0.4" />
        </svg>
      )
    case 'two-columns':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          <rect x="4" y="6" width="50" height="6" rx="2" fill={bar} />
          <rect x="4" y="18" width="34" height="36" rx="3" fill={light} />
          <rect x="8" y="22" width="22" height="3" rx="1" fill={bar} opacity="0.4" />
          <rect x="8" y="28" width="26" height="2" rx="1" fill={light} />
          <rect x="8" y="33" width="20" height="2" rx="1" fill={light} />
          <rect x="42" y="18" width="34" height="36" rx="3" fill={light} />
          <rect x="46" y="22" width="22" height="3" rx="1" fill={bar} opacity="0.4" />
          <rect x="46" y="28" width="26" height="2" rx="1" fill={light} />
          <rect x="46" y="33" width="20" height="2" rx="1" fill={light} />
        </svg>
      )
    case 'accent-left':
      return (
        <svg width="80" height="60" viewBox="0 0 80 60" fill="none">
          <rect x="4" y="8" width="24" height="44" rx="3" fill={light} />
          <path d="M10 34l5-7 3 4 3-3 5 6H8z" fill={bar} opacity="0.5" />
          <rect x="12" y="22" width="8" height="8" rx="4" fill={bar} opacity="0.4" />
          <rect x="34" y="12" width="42" height="5" rx="2" fill={bar} />
          <rect x="34" y="23" width="42" height="3" rx="1.5" fill={light} />
          <rect x="34" y="30" width="36" height="3" rx="1.5" fill={light} />
          <rect x="34" y="37" width="42" height="3" rx="1.5" fill={light} />
          <rect x="34" y="44" width="30" height="3" rx="1.5" fill={light} />
        </svg>
      )
    default:
      return null
  }
}

// ---------------------------------------------------------------------------
// Template Modal
// ---------------------------------------------------------------------------

const TemplateModal: React.FC<{
  onSelect: (template: SurveyTemplate) => void
  onClose: () => void
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  isDarkMode: boolean
}> = ({ onSelect, onClose, selectedCategory, onCategoryChange, isDarkMode }) => {
  const categories = getTemplateCategories()

  const filtered = selectedCategory === 'all'
    ? SURVEY_TEMPLATES
    : SURVEY_TEMPLATES.filter(t => t.category === selectedCategory)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: '680px',
          maxHeight: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px 16px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1a1a1a',
            margin: 0,
            fontFamily: 'var(--font-inter), system-ui, sans-serif',
          }}>
            Choose a template
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: '8px',
              border: 'none', backgroundColor: '#f5f5f5',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#999', fontSize: '18px',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#eee' }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5' }}
          >
            &times;
          </button>
        </div>

        {/* Category pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          padding: '0 24px 16px',
          flexWrap: 'wrap',
        }}>
          <button
            onClick={() => onCategoryChange('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              border: 'none',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: selectedCategory === 'all' ? '#1a1a1a' : '#f5f5f5',
              color: selectedCategory === 'all' ? '#fff' : '#666',
              transition: 'all 0.15s',
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                backgroundColor: selectedCategory === cat.id ? '#1a1a1a' : '#f5f5f5',
                color: selectedCategory === cat.id ? '#fff' : '#666',
                transition: 'all 0.15s',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 24px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          alignContent: 'start',
        }} className="thin-scrollbar">
          {filtered.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e5e5e5',
                backgroundColor: '#fafafa',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = template.theme.primaryColor || '#ccc'
                e.currentTarget.style.backgroundColor = '#f5f5f5'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e5e5'
                e.currentTarget.style.backgroundColor = '#fafafa'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Color accent bar */}
              <div style={{
                width: '32px',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: template.theme.primaryColor || '#2563eb',
              }} />
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1a1a1a',
                  marginBottom: '2px',
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                }}>
                  {template.label}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  lineHeight: 1.4,
                  fontFamily: 'var(--font-inter), system-ui, sans-serif',
                }}>
                  {template.description}
                </div>
              </div>
              {/* Category badge */}
              <div style={{
                display: 'inline-flex',
                alignSelf: 'flex-start',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: `${template.theme.primaryColor}15`,
                color: template.theme.primaryColor || '#2563eb',
                fontSize: '11px',
                fontWeight: 500,
              }}>
                {template.category}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
