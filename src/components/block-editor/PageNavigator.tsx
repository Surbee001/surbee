'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import type { EditorPage } from '@/lib/block-editor/types'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface PageNavigatorProps {
  pages: EditorPage[]
  activePageId: string
  onPageSelect: (pageId: string) => void
  onAddPage: () => void
  isEditing: boolean
  isDarkMode?: boolean
}

type ViewMode = 'thumbnail' | 'list'

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  activePageId,
  onPageSelect,
  onAddPage,
  isEditing,
  isDarkMode = true,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('thumbnail')
  const [contextMenu, setContextMenu] = useState<{ pageId: string; x: number; y: number } | null>(null)
  const contextRef = useRef<HTMLDivElement>(null)
  const { deletePage, duplicatePageAt, addPage } = useBlockEditorStore()

  const activeBorder = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
  const inactiveBorder = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'
  const mutedText = isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
  const dashBorder = isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'
  const iconColor = isDarkMode ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.3)'
  const iconActive = isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)'
  const listText = isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'
  const listActiveText = isDarkMode ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.8)'
  const listActiveBg = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'

  // Context menu colors
  const dropBg = isDarkMode ? 'rgba(19,19,20,0.95)' : 'rgb(255,255,255)'
  const dropBorder = isDarkMode ? 'rgba(232,232,232,0.15)' : 'rgba(10,18,23,0.08)'
  const dropText = isDarkMode ? '#E8E8E8' : 'rgb(10,18,23)'
  const dropHover = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(10,18,23,0.04)'

  const handleContextMenu = useCallback((e: React.MouseEvent, pageId: string) => {
    e.preventDefault()
    // Bounds check — keep menu on screen
    const x = Math.min(e.clientX, window.innerWidth - 200)
    const y = Math.min(e.clientY, window.innerHeight - 200)
    setContextMenu({ pageId, x, y })
  }, [])

  useEffect(() => {
    if (!contextMenu) return
    const handler = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) setContextMenu(null)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [contextMenu])

  const ctxActions = [
    { label: 'Duplicate', action: (pid: string) => { duplicatePageAt(pid); setContextMenu(null) } },
    { label: 'Add page below', action: () => { addPage(); setContextMenu(null) } },
    { label: 'divider' },
    { label: 'Delete', action: (pid: string) => { deletePage(pid); setContextMenu(null) }, danger: true },
  ]

  return (
    <>
      <div style={{
        position: 'absolute',
        right: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        width: viewMode === 'thumbnail' ? 80 : 140,
        maxHeight: '85%',
        zIndex: 30,
      }}>
        {/* View toggle */}
        <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
          <button onClick={() => setViewMode('thumbnail')} style={{ width: 22, height: 22, borderRadius: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: viewMode === 'thumbnail' ? iconActive : iconColor }} title="Thumbnails">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="0.5" y="0.5" width="4.5" height="3" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><rect x="7" y="0.5" width="4.5" height="3" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><rect x="0.5" y="5.5" width="4.5" height="3" rx="0.5" stroke="currentColor" strokeWidth="0.8"/><rect x="7" y="5.5" width="4.5" height="3" rx="0.5" stroke="currentColor" strokeWidth="0.8"/></svg>
          </button>
          <button onClick={() => setViewMode('list')} style={{ width: 22, height: 22, borderRadius: '4px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: viewMode === 'list' ? iconActive : iconColor }} title="List">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="0" y1="2" x2="12" y2="2" stroke="currentColor" strokeWidth="1"/><line x1="0" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1"/><line x1="0" y1="10" x2="12" y2="10" stroke="currentColor" strokeWidth="1"/></svg>
          </button>
        </div>

        {/* Pages */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: viewMode === 'thumbnail' ? '6px' : '2px', width: '100%', flex: 1, minHeight: 0 }} className="thin-scrollbar">
          {viewMode === 'thumbnail' ? (
            pages.map((page, i) => (
              <button
                key={page.id}
                onClick={() => onPageSelect(page.id)}
                onContextMenu={(e) => handleContextMenu(e, page.id)}
                style={{
                  width: '100%', aspectRatio: '16 / 9', borderRadius: '6px',
                  border: page.id === activePageId ? `1.5px solid ${activeBorder}` : `1px solid ${inactiveBorder}`,
                  backgroundColor: '#FFFFFF', cursor: 'pointer', padding: '5px 6px',
                  display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2.5px',
                  position: 'relative', transition: 'border-color 0.15s', flexShrink: 0,
                }}
              >
                {page.blocks.slice(0, 3).map(b => (
                  <div key={b.id} style={{ width: b.type === 'heading' ? '50%' : '70%', height: b.type === 'heading' ? 2.5 : 1.5, borderRadius: 0.5, backgroundColor: 'rgba(0,0,0,0.15)', opacity: b.type === 'heading' ? 0.5 : 0.2 }} />
                ))}
                <span style={{ position: 'absolute', bottom: 2, right: 4, fontSize: '0.5rem', color: 'rgba(0,0,0,0.25)', fontWeight: 500 }}>{i + 1}</span>
              </button>
            ))
          ) : (
            pages.map((page, i) => (
              <button
                key={page.id}
                onClick={() => onPageSelect(page.id)}
                onContextMenu={(e) => handleContextMenu(e, page.id)}
                style={{
                  width: '100%', borderRadius: '6px', border: 'none',
                  backgroundColor: page.id === activePageId ? listActiveBg : 'transparent',
                  cursor: 'pointer', padding: '5px 8px', display: 'flex', alignItems: 'center', gap: '6px',
                  textAlign: 'left', flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '0.6rem', color: mutedText, fontWeight: 500, width: 14, flexShrink: 0, textAlign: 'right' }}>{i + 1}</span>
                <span style={{ fontSize: '0.7rem', color: page.id === activePageId ? listActiveText : listText, fontWeight: page.id === activePageId ? 500 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'Opening Hours Sans, sans-serif' }}>
                  {page.title || `Page ${i + 1}`}
                </span>
              </button>
            ))
          )}

          {/* + card/row */}
          {isEditing && (
            viewMode === 'thumbnail' ? (
              <button onClick={onAddPage} style={{ width: '100%', aspectRatio: '16 / 9', borderRadius: '6px', border: `1px dashed ${dashBorder}`, backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', color: mutedText, flexShrink: 0 }}>+</button>
            ) : (
              <button onClick={onAddPage} style={{ width: '100%', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: mutedText, flexShrink: 0, fontFamily: 'Opening Hours Sans, sans-serif' }}>
                <span style={{ width: 14, textAlign: 'right', fontSize: '0.8rem' }}>+</span>
                <span>New page</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div ref={contextRef} style={{
          position: 'fixed', left: contextMenu.x, top: contextMenu.y, zIndex: 9999,
          borderRadius: '24px', padding: '8px',
          border: `1px solid ${dropBorder}`, backgroundColor: dropBg,
          backdropFilter: 'blur(12px)', boxShadow: 'rgba(0,0,0,0.2) 0px 7px 16px',
          minWidth: 164,
        }}>
          {ctxActions.map((item, i) =>
            item.label === 'divider' ? (
              <div key={i} style={{ height: 1, backgroundColor: dropBorder, margin: '4px 8px' }} />
            ) : (
              <button key={item.label} onClick={() => item.action?.(contextMenu.pageId)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', borderRadius: '18px',
                  padding: '10px 14px', border: 'none', backgroundColor: 'transparent',
                  color: item.danger ? '#ef4444' : dropText, fontSize: '14px', cursor: 'pointer',
                  fontFamily: 'Opening Hours Sans, sans-serif', marginBottom: '1px',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = dropHover }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </>
  )
}
