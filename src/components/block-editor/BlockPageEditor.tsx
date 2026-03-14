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
  } = useBlockEditorStore()

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
        color: mutedText, fontSize: '0.9rem',
      }}>
        Start a conversation to build your survey
      </div>
    )
  }

  const isEditing = editorMode === 'edit'
  const theme = survey.theme
  const pages = survey.pages

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
          {pages.map((page) => {
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
                  aspectRatio: '16 / 9',
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

                <div style={{ flex: 1, overflow: 'auto' }} className="thin-scrollbar">
                  <PageView page={page} isEditing={isEditing && isActive} theme={theme} />
                </div>
              </div>
            )
          })}

          {/* + button */}
          {isEditing && (
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
        {pages.length > 1 && (
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
    </DndContext>
  )
}
