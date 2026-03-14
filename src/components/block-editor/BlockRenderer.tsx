'use client'

import React, { useCallback } from 'react'
import type { Block, BlockType, BlockContentMap, BlockMeta, BlockStyle, SurveyTheme } from '@/lib/block-editor/types'
import { BlockRegistry } from './blocks'
import { BlockWrapper } from './BlockWrapper'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface BlockRendererProps {
  block: Block
  pageId: string
  isEditing: boolean
  theme: SurveyTheme
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  pageId,
  isEditing,
  theme,
}) => {
  const Component = BlockRegistry[block.type]
  const {
    selectedBlockId,
    focusedBlockId,
    selectBlock,
    focusBlock,
    updateBlockContent,
    updateBlockMeta,
    deleteBlock,
    duplicateBlock,
    addBlock,
    openSlashMenu,
  } = useBlockEditorStore()

  const isSelected = selectedBlockId === block.id
  const isFocused = focusedBlockId === block.id

  const handleContentChange = useCallback(
    (content: Partial<BlockContentMap[BlockType]>) => {
      updateBlockContent(pageId, block.id, content)
    },
    [pageId, block.id, updateBlockContent],
  )

  const handleMetaChange = useCallback(
    (meta: Partial<BlockMeta>) => {
      updateBlockMeta(pageId, block.id, meta)
    },
    [pageId, block.id, updateBlockMeta],
  )

  const handleDelete = useCallback(() => {
    deleteBlock(pageId, block.id)
  }, [pageId, block.id, deleteBlock])

  const handleDuplicate = useCallback(() => {
    duplicateBlock(pageId, block.id)
  }, [pageId, block.id, duplicateBlock])

  const handleInsertAfter = useCallback(
    (type: BlockType) => {
      addBlock(pageId, type, block.id)
    },
    [pageId, block.id, addBlock],
  )

  const handleFocus = useCallback(() => {
    focusBlock(block.id)
    selectBlock(block.id)
  }, [block.id, focusBlock, selectBlock])

  const handleBlur = useCallback(() => {
    focusBlock(null)
  }, [focusBlock])

  const handleSelect = useCallback(() => {
    selectBlock(block.id)
  }, [block.id, selectBlock])

  const handleSlashMenu = useCallback(
    (position: { x: number; y: number }) => {
      openSlashMenu(pageId, position, block.id)
    },
    [pageId, block.id, openSlashMenu],
  )

  const handleToggleRequired = useCallback(() => {
    const content = block.content as any
    if ('required' in content) {
      updateBlockContent(pageId, block.id, { required: !content.required } as any)
    }
  }, [pageId, block.id, block.content, updateBlockContent])

  // IMPORTANT: all hooks must be above this line — no conditional returns before hooks
  const handleStyleChange = useCallback(
    (style: Partial<BlockStyle>) => {
      updateBlockMeta(pageId, block.id, { style: { ...block.meta.style, ...style } })
    },
    [pageId, block.id, block.meta.style, updateBlockMeta],
  )

  if (!Component) {
    return (
      <div style={{ padding: '8px', color: 'var(--surbee-fg-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
        Unknown block type: {block.type}
      </div>
    )
  }

  if (!isEditing) {
    return (
      <Component
        block={block as any}
        isSelected={false}
        isFocused={false}
        isEditing={false}
        onContentChange={handleContentChange as any}
        onMetaChange={handleMetaChange}
        onDelete={handleDelete}
        onInsertAfter={handleInsertAfter}
        onFocus={handleFocus}
        onBlur={handleBlur}
        theme={theme}
      />
    )
  }

  return (
    <BlockWrapper
      block={block}
      pageId={pageId}
      isSelected={isSelected}
      isEditing={isEditing}
      onSelect={handleSelect}
      onDelete={handleDelete}
      onDuplicate={handleDuplicate}
      onToggleRequired={handleToggleRequired}
      onStyleChange={handleStyleChange}
    >
      <Component
        block={block as any}
        isSelected={isSelected}
        isFocused={isFocused}
        isEditing={isEditing}
        onContentChange={handleContentChange as any}
        onMetaChange={handleMetaChange}
        onDelete={handleDelete}
        onInsertAfter={handleInsertAfter}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onSlashMenu={handleSlashMenu}
        theme={theme}
      />
    </BlockWrapper>
  )
}
