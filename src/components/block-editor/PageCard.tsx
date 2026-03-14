'use client'

import React, { useCallback, useState } from 'react'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import type { EditorPage, SurveyTheme } from '@/lib/block-editor/types'
import { BlockRenderer } from './BlockRenderer'
import { LogicBuilder } from './LogicBuilder'
import { EmptyBlockPlaceholder } from './EmptyBlockPlaceholder'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface PageCardProps {
  page: EditorPage
  isActive: boolean
  isEditing: boolean
  theme: SurveyTheme
  pageNumber: number
  totalPages: number
}

export const PageCard: React.FC<PageCardProps> = ({
  page,
  isActive,
  isEditing,
  theme,
  pageNumber,
  totalPages,
}) => {
  const { setActivePage, updatePage, deletePage } = useBlockEditorStore()
  const [showLogicBuilder, setShowLogicBuilder] = useState(false)

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updatePage(page.id, { title: e.target.value })
    },
    [page.id, updatePage],
  )

  const handleClick = useCallback(() => {
    setActivePage(page.id)
  }, [page.id, setActivePage])

  const blockIds = page.blocks.map(b => b.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      style={{
        borderRadius: '12px',
        border: isActive
          ? '2px solid var(--surbee-accent-primary, #2563eb)'
          : '1px solid var(--surbee-border-primary)',
        backgroundColor: 'var(--surbee-bg-primary)',
        padding: '24px',
        minHeight: 120,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        cursor: 'default',
        transition: 'border-color 0.15s',
        position: 'relative',
      }}
    >
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 600,
            color: 'var(--surbee-fg-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            Page {pageNumber} of {totalPages}
          </span>
        </div>

        {isEditing && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {/* Logic builder button */}
            {totalPages > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setShowLogicBuilder(true) }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.7rem',
                  color: page.logic?.branches?.length ? 'var(--surbee-accent-primary, #2563eb)' : 'var(--surbee-fg-muted)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  opacity: page.logic?.branches?.length ? 1 : 0.5,
                  transition: 'opacity 0.15s',
                  fontWeight: page.logic?.branches?.length ? 600 : 400,
                }}
                className="hover:!opacity-100 hover:bg-[var(--surbee-bg-tertiary)]"
                title="Page logic"
              >
                &#9881; Logic{page.logic?.branches?.length ? ` (${page.logic.branches.length})` : ''}
              </button>
            )}
            {/* Delete page button */}
            {totalPages > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); deletePage(page.id) }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  color: 'var(--surbee-fg-muted)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  opacity: 0.5,
                  transition: 'opacity 0.15s',
                }}
                className="hover:!opacity-100 hover:bg-[var(--surbee-bg-tertiary)]"
                title="Delete page"
              >
                &#10005;
              </button>
            )}
          </div>
        )}
      </div>

      {/* Page title */}
      {isEditing ? (
        <input
          type="text"
          value={page.title}
          onChange={handleTitleChange}
          placeholder="Page title"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: 'var(--surbee-fg-primary)',
            padding: 0,
            width: '100%',
            fontFamily: 'inherit',
            marginBottom: '12px',
          }}
        />
      ) : (
        page.title && (
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--surbee-fg-primary)', margin: '0 0 12px 0' }}>
            {page.title}
          </h2>
        )
      )}

      {/* Blocks */}
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {page.blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              pageId={page.id}
              isEditing={isEditing}
              theme={theme}
            />
          ))}
        </div>
      </SortableContext>

      {/* Empty block placeholder */}
      {isEditing && (
        <EmptyBlockPlaceholder pageId={page.id} />
      )}

      {/* Logic builder modal */}
      {showLogicBuilder && (
        <LogicBuilder page={page} onClose={() => setShowLogicBuilder(false)} />
      )}
    </motion.div>
  )
}
