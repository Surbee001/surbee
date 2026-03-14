'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface PageCardMenuProps {
  pageId: string
  isDarkMode: boolean
}

export const PageCardMenu: React.FC<PageCardMenuProps> = ({ pageId, isDarkMode }) => {
  const [open, setOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const { updatePage, deletePage, duplicatePageAt, addPage, reorderPages, survey } = useBlockEditorStore()
  const page = useBlockEditorStore(s => s.survey?.pages.find(p => p.id === pageId))
  const totalPages = useBlockEditorStore(s => s.survey?.pages.length ?? 1)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          btnRef.current && !btnRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggle = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setMenuPos({ x: rect.left, y: rect.bottom + 4 })
    }
    setOpen(v => !v)
  }

  const dropBg = isDarkMode ? 'rgba(19,19,20,0.95)' : 'rgb(255,255,255)'
  const dropBorder = isDarkMode ? 'rgba(232,232,232,0.15)' : 'rgba(10,18,23,0.08)'
  const dropText = isDarkMode ? '#E8E8E8' : 'rgb(10,18,23)'
  const dropMuted = isDarkMode ? 'rgba(232,232,232,0.5)' : 'rgba(10,18,23,0.5)'
  const dropHover = isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(10,18,23,0.04)'

  const currentBg = page?.style?.backgroundColor || ''

  return (
    <>
      <button
        ref={btnRef}
        onClick={(e) => { e.stopPropagation(); toggle() }}
        className="opacity-0 group-hover/card:opacity-100"
        style={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 20,
          width: 24, height: 24, borderRadius: '6px',
          border: 'none',
          backgroundColor: 'rgba(0,0,0,0.04)',
          backdropFilter: 'blur(4px)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '1.5px',
          transition: 'opacity 0.1s, background 0.1s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)' }}
      >
        <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#6b7280' }} />
        <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#6b7280' }} />
        <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#6b7280' }} />
      </button>

      {open && menuPos && (
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: menuPos.x,
            top: menuPos.y,
            zIndex: 9999,
            borderRadius: '20px',
            padding: '8px',
            border: `1px solid ${dropBorder}`,
            backgroundColor: dropBg,
            backdropFilter: 'blur(12px)',
            boxShadow: 'rgba(0,0,0,0.2) 0px 7px 16px',
            minWidth: 200,
            fontFamily: 'Opening Hours Sans, sans-serif',
          }}
        >
          {/* Background color */}
          <div style={{ padding: '8px 12px' }}>
            <div style={{ fontSize: '11px', color: dropMuted, marginBottom: '6px', fontWeight: 500 }}>Card background</div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['#FFFFFF', '#F8FAFC', '#FFF7ED', '#F0FDF4', '#EFF6FF', '#FAF5FF', '#FFF1F2', '#1A1A1A', '#0F172A'].map(c => (
                <button
                  key={c}
                  onClick={() => updatePage(pageId, { style: { ...page?.style, backgroundColor: c } })}
                  style={{
                    width: 24, height: 24, borderRadius: '6px',
                    backgroundColor: c,
                    border: currentBg === c ? '2px solid #2563eb' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                  }}
                />
              ))}
              <label style={{ width: 24, height: 24, borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: dropMuted, overflow: 'hidden', position: 'relative' }}>
                +
                <input type="color" value={currentBg || '#ffffff'} onChange={(e) => updatePage(pageId, { style: { ...page?.style, backgroundColor: e.target.value } })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              </label>
            </div>
          </div>

          <div style={{ height: 1, backgroundColor: dropBorder, margin: '4px 8px' }} />

          {/* Actions */}
          {survey && (() => {
            const idx = survey.pages.findIndex(p => p.id === pageId)
            const canMoveUp = idx > 0
            const canMoveDown = idx < survey.pages.length - 1
            return (
              <>
                {canMoveUp && <MItem onClick={() => {
                  const ids = survey.pages.map(p => p.id)
                  ;[ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]]
                  reorderPages(ids); setOpen(false)
                }} color={dropText} hover={dropHover}>Move up</MItem>}
                {canMoveDown && <MItem onClick={() => {
                  const ids = survey.pages.map(p => p.id)
                  ;[ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
                  reorderPages(ids); setOpen(false)
                }} color={dropText} hover={dropHover}>Move down</MItem>}
              </>
            )
          })()}
          <MItem onClick={() => { duplicatePageAt(pageId); setOpen(false) }} color={dropText} hover={dropHover}>Duplicate page</MItem>
          <MItem onClick={() => { addPage(); setOpen(false) }} color={dropText} hover={dropHover}>Add page below</MItem>
          {totalPages > 1 && (
            <>
              <div style={{ height: 1, backgroundColor: dropBorder, margin: '4px 8px' }} />
              <MItem onClick={() => { deletePage(pageId); setOpen(false) }} color="#ef4444" hover={dropHover}>Delete page</MItem>
            </>
          )}
        </div>
      )}
    </>
  )
}

function MItem({ children, onClick, color, hover }: { children: React.ReactNode; onClick: () => void; color: string; hover: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block', width: '100%', textAlign: 'left', borderRadius: '14px',
        padding: '8px 12px', border: 'none', backgroundColor: 'transparent',
        color, fontSize: '13px', cursor: 'pointer',
        fontFamily: 'Opening Hours Sans, sans-serif',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hover }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {children}
    </button>
  )
}
