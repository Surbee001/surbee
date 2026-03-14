'use client'

import React, { useCallback, useState, useRef } from 'react'
import type { BlockComponentProps } from './types'
import type { ColumnsContent, ColumnCell, BlockType, BlockContentMap } from '@/lib/block-editor/types'
import { createDefaultBlock } from '@/lib/block-editor/block-defaults'
import { BlockRegistry } from './index'

const LAYOUT_RATIOS: Record<string, string[]> = {
  '1:1': ['1fr', '1fr'],
  '1:2': ['1fr', '2fr'],
  '2:1': ['2fr', '1fr'],
  '1:1:1': ['1fr', '1fr', '1fr'],
  '1:2:1': ['1fr', '2fr', '1fr'],
}

const LAYOUT_OPTIONS: { value: string; label: string; icon: React.ReactNode }[] = [
  {
    value: '1:1', label: '50 / 50',
    icon: <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect x="0.5" y="0.5" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1" /><rect x="10.5" y="0.5" width="9" height="13" rx="1" stroke="currentColor" strokeWidth="1" /></svg>,
  },
  {
    value: '1:2', label: '33 / 66',
    icon: <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect x="0.5" y="0.5" width="6" height="13" rx="1" stroke="currentColor" strokeWidth="1" /><rect x="7.5" y="0.5" width="12" height="13" rx="1" stroke="currentColor" strokeWidth="1" /></svg>,
  },
  {
    value: '2:1', label: '66 / 33',
    icon: <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect x="0.5" y="0.5" width="12" height="13" rx="1" stroke="currentColor" strokeWidth="1" /><rect x="13.5" y="0.5" width="6" height="13" rx="1" stroke="currentColor" strokeWidth="1" /></svg>,
  },
  {
    value: '1:1:1', label: '33 / 33 / 33',
    icon: <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect x="0.5" y="0.5" width="5.5" height="13" rx="1" stroke="currentColor" strokeWidth="1" /><rect x="7.25" y="0.5" width="5.5" height="13" rx="1" stroke="currentColor" strokeWidth="1" /><rect x="14" y="0.5" width="5.5" height="13" rx="1" stroke="currentColor" strokeWidth="1" /></svg>,
  },
]

export const ColumnsBlock: React.FC<BlockComponentProps<'columns'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
  onDelete,
  theme,
}) => {
  const content = block.content as ColumnsContent
  const columns = LAYOUT_RATIOS[content.layout] || ['1fr', '1fr']
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleCellBlockType = useCallback((cellId: string, blockType: BlockType) => {
    const defaultBlock = createDefaultBlock(blockType, 0)
    const newCells = content.cells.map(c =>
      c.id === cellId ? { ...c, blockType, content: defaultBlock.content as any } : c
    )
    onContentChange({ cells: newCells })
  }, [content.cells, onContentChange])

  const handleCellContentChange = useCallback((cellId: string, newContent: Partial<BlockContentMap[BlockType]>) => {
    const newCells = content.cells.map(c =>
      c.id === cellId ? { ...c, content: { ...(c.content || {}), ...newContent } as any } : c
    )
    onContentChange({ cells: newCells })
  }, [content.cells, onContentChange])

  const handleCellClear = useCallback((cellId: string) => {
    const newCells = content.cells.map(c =>
      c.id === cellId ? { ...c, blockType: null, content: null } : c
    )
    onContentChange({ cells: newCells })
  }, [content.cells, onContentChange])

  const handleLayoutChange = useCallback((layout: string) => {
    const colCount = (LAYOUT_RATIOS[layout] || []).length
    let newCells = [...content.cells]
    while (newCells.length < colCount) {
      newCells.push({ id: `col_${Date.now()}_${newCells.length}`, blockType: null, content: null })
    }
    newCells = newCells.slice(0, colCount)
    onContentChange({ layout: layout as ColumnsContent['layout'], cells: newCells })
    setShowLayoutPicker(false)
  }, [content.cells, onContentChange])

  return (
    <div onClick={onFocus} style={{ position: 'relative' }}>
      {/* Columns container with outer border */}
      <div style={{
        border: isEditing ? '1px solid var(--surbee-border-primary, #e5e5e5)' : 'none',
        borderRadius: '8px',
        position: 'relative',
      }}>
        {/* Top toolbar — ... menu for the whole columns block */}
        {isEditing && (
          <div style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            zIndex: 5,
            display: 'flex',
            gap: '4px',
          }}>
            {/* Layout picker */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowLayoutPicker(!showLayoutPicker) }}
                style={{
                  width: 24, height: 24, borderRadius: '4px',
                  border: '1px solid var(--surbee-border-primary, #e5e5e5)',
                  backgroundColor: '#fff',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', color: '#999',
                }}
                title="Change layout"
              >
                &#8943;
              </button>
              {showLayoutPicker && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  padding: '8px',
                  backgroundColor: '#fff',
                  borderRadius: '10px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  border: '1px solid #e5e5e5',
                  zIndex: 20,
                  display: 'flex',
                  gap: '4px',
                }}>
                  {LAYOUT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={(e) => { e.stopPropagation(); handleLayoutChange(opt.value) }}
                      title={opt.label}
                      style={{
                        width: 36, height: 28,
                        borderRadius: '6px',
                        border: content.layout === opt.value
                          ? '1.5px solid var(--surbee-accent-primary, #2563eb)'
                          : '1px solid #e5e5e5',
                        backgroundColor: content.layout === opt.value ? 'rgba(37,99,235,0.06)' : '#fff',
                        color: content.layout === opt.value ? 'var(--surbee-accent-primary, #2563eb)' : '#999',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.1s',
                      }}
                    >
                      {opt.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Column grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: columns.join(' '),
          minHeight: isEditing ? '120px' : undefined,
        }}>
          {content.cells.map((cell, idx) => (
            <ColumnCellView
              key={cell.id}
              cell={cell}
              isEditing={isEditing}
              isLast={idx === content.cells.length - 1}
              theme={theme}
              onSetBlockType={(type) => handleCellBlockType(cell.id, type)}
              onContentChange={(c) => handleCellContentChange(cell.id, c)}
              onClear={() => handleCellClear(cell.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Renders a single column cell with its own border and controls */
const ColumnCellView: React.FC<{
  cell: ColumnCell
  isEditing: boolean
  isLast: boolean
  theme: any
  onSetBlockType: (type: BlockType) => void
  onContentChange: (content: Partial<BlockContentMap[BlockType]>) => void
  onClear: () => void
}> = ({ cell, isEditing, isLast, theme, onSetBlockType, onContentChange, onClear }) => {
  const [showMenu, setShowMenu] = useState(false)

  const cellStyle: React.CSSProperties = {
    borderRight: isEditing && !isLast ? '1px solid var(--surbee-border-primary, #e5e5e5)' : 'none',
    padding: '16px',
    position: 'relative',
    minHeight: '100px',
  }

  // Empty cell — show "Start typing..." placeholder
  if (!cell.blockType || !cell.content) {
    if (!isEditing) return <div style={cellStyle} />
    return (
      <div style={{ ...cellStyle, display: 'flex', flexDirection: 'column' }}>
        {/* Cell dot menu */}
        <div style={{
          position: 'absolute', top: '6px', left: '6px', zIndex: 5,
          opacity: 0, transition: 'opacity 0.15s',
        }} className="group-hover/cell:opacity-100 cell-menu-trigger">
          <CellDotMenu
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onSetBlockType={(type) => { onSetBlockType(type); setShowMenu(false) }}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setShowMenu(true)}
          onMouseEnter={(e) => {
            const trigger = e.currentTarget.parentElement?.querySelector('.cell-menu-trigger') as HTMLElement
            if (trigger) trigger.style.opacity = '1'
          }}
          onMouseLeave={(e) => {
            const trigger = e.currentTarget.parentElement?.querySelector('.cell-menu-trigger') as HTMLElement
            if (trigger && !showMenu) trigger.style.opacity = '0'
          }}
        >
          <span style={{
            fontSize: '14px',
            color: 'var(--surbee-fg-muted, #999)',
            opacity: 0.5,
          }}>
            Start typing...
          </span>
        </div>
      </div>
    )
  }

  // Render the block inside the cell
  const Component = BlockRegistry[cell.blockType]
  if (!Component) return <div style={cellStyle}><span style={{ color: '#999', fontSize: '12px' }}>Unknown</span></div>

  const fakeBlock = {
    id: cell.id,
    type: cell.blockType,
    content: cell.content,
    meta: { position: 0 },
  } as any

  return (
    <div
      style={cellStyle}
      className="group/cell"
      onMouseEnter={(e) => {
        const trigger = e.currentTarget.querySelector('.cell-menu-trigger') as HTMLElement
        if (trigger) trigger.style.opacity = '1'
      }}
      onMouseLeave={(e) => {
        const trigger = e.currentTarget.querySelector('.cell-menu-trigger') as HTMLElement
        if (trigger && !showMenu) trigger.style.opacity = '0'
      }}
    >
      {/* Cell dot menu */}
      {isEditing && (
        <div style={{
          position: 'absolute', top: '6px', left: '6px', zIndex: 5,
          opacity: 0, transition: 'opacity 0.15s',
        }} className="cell-menu-trigger">
          <CellDotMenu
            showMenu={showMenu}
            setShowMenu={setShowMenu}
            onClear={onClear}
            onSetBlockType={(type) => { onSetBlockType(type); setShowMenu(false) }}
            hasContent
          />
        </div>
      )}
      <Component
        block={fakeBlock}
        isSelected={false}
        isFocused={false}
        isEditing={isEditing}
        onContentChange={onContentChange as any}
        onMetaChange={() => {}}
        onDelete={onClear}
        onInsertAfter={() => {}}
        onFocus={() => {}}
        onBlur={() => {}}
        theme={theme}
      />
    </div>
  )
}

/** 3-dot menu for a column cell */
const CellDotMenu: React.FC<{
  showMenu: boolean
  setShowMenu: (v: boolean) => void
  onSetBlockType: (type: BlockType) => void
  onClear?: () => void
  hasContent?: boolean
}> = ({ showMenu, setShowMenu, onSetBlockType, onClear, hasContent }) => {
  const CELL_BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
    { type: 'heading', label: 'Heading', icon: 'H' },
    { type: 'paragraph', label: 'Text', icon: 'T' },
    { type: 'image', label: 'Image', icon: '\uD83D\uDDBC' },
    { type: 'text-input', label: 'Input', icon: 'Aa' },
    { type: 'radio', label: 'Choice', icon: '\u25CB' },
    { type: 'button', label: 'Button', icon: '\u25A3' },
    { type: 'video', label: 'Video', icon: '\u25B6' },
    { type: 'scale', label: 'Rating', icon: '\u2605' },
  ]

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu) }}
        style={{
          width: 20, height: 20, borderRadius: '4px',
          border: 'none',
          backgroundColor: showMenu ? 'rgba(0,0,0,0.06)' : 'transparent',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1.5px',
          color: '#9ca3af',
        }}
        title="Block options"
      >
        <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'currentColor' }} />
        <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'currentColor' }} />
        <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: 'currentColor' }} />
      </button>
      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            padding: '6px',
            backgroundColor: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            border: '1px solid #e5e5e5',
            zIndex: 20,
            minWidth: '140px',
          }}
        >
          {hasContent && onClear && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onClear(); setShowMenu(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  width: '100%', padding: '6px 10px', border: 'none',
                  borderRadius: '6px', backgroundColor: 'transparent',
                  cursor: 'pointer', fontSize: '12px', color: '#ef4444',
                  textAlign: 'left', transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2' }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                Clear cell
              </button>
              <div style={{ height: 1, backgroundColor: '#f0f0f0', margin: '4px 6px' }} />
            </>
          )}
          <div style={{
            padding: '4px 10px 2px', fontSize: '10px', fontWeight: 600,
            color: '#999', letterSpacing: '0.04em', textTransform: 'uppercase',
          }}>
            {hasContent ? 'Replace with' : 'Add block'}
          </div>
          {CELL_BLOCK_TYPES.map(bt => (
            <button
              key={bt.type}
              onClick={(e) => { e.stopPropagation(); onSetBlockType(bt.type) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                width: '100%', padding: '6px 10px', border: 'none',
                borderRadius: '6px', backgroundColor: 'transparent',
                cursor: 'pointer', fontSize: '12px',
                color: 'var(--surbee-fg-primary, #1a1a1a)',
                textAlign: 'left', transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f5f5f5' }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
            >
              <span style={{ width: 20, textAlign: 'center', fontSize: '11px', color: '#888' }}>{bt.icon}</span>
              {bt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
