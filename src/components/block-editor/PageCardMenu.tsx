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
  const currentLayout = page?.style?.layout || 'default'
  const currentAlign = page?.style?.contentAlign || 'top'
  const currentFullBleed = page?.style?.fullBleed || false

  const updateStyle = (style: Record<string, any>) => {
    updatePage(pageId, { style: { ...page?.style, ...style } })
  }

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
          transition: 'opacity 0.15s, background 0.15s',
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
            minWidth: 260,
            fontFamily: 'Opening Hours Sans, sans-serif',
            maxHeight: '80vh',
            overflowY: 'auto',
          }}
        >
          {/* Page layout thumbnails */}
          <div style={{ padding: '8px 12px' }}>
            <div style={{ fontSize: '11px', color: dropMuted, marginBottom: '8px', fontWeight: 500 }}>Page layout</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {([
                { id: 'default', label: 'Default' },
                { id: 'image-top', label: 'Image top' },
                { id: 'image-left', label: 'Image left' },
                { id: 'image-right', label: 'Image right' },
                { id: 'image-bg', label: 'Background' },
              ] as const).map(layout => (
                <button
                  key={layout.id}
                  onClick={() => updateStyle({ layout: layout.id })}
                  title={layout.label}
                  style={{
                    width: 42, height: 32, borderRadius: '6px',
                    border: currentLayout === layout.id ? '2px solid #2563eb' : `1px solid ${dropBorder}`,
                    backgroundColor: currentLayout === layout.id ? 'rgba(37,99,235,0.06)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '3px',
                    transition: 'all 0.15s',
                  }}
                >
                  <LayoutThumb type={layout.id} active={currentLayout === layout.id} muted={dropMuted} />
                </button>
              ))}
            </div>
          </div>

          <Divider color={dropBorder} />

          {/* Background image */}
          <div style={{ padding: '6px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dropMuted} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                <span style={{ fontSize: '13px', color: dropText }}>Background image</span>
              </div>
              <label style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>
                {page?.style?.backgroundImage ? 'Change' : '+ Add'}
                <input
                  type="text"
                  placeholder="Image URL"
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            {/* Simple URL input for background image */}
            <input
              type="text"
              value={page?.style?.backgroundImage || ''}
              onChange={(e) => updateStyle({ backgroundImage: e.target.value || undefined })}
              placeholder="Paste image URL..."
              style={{
                width: '100%', marginTop: '6px', padding: '6px 10px', borderRadius: '8px',
                border: `1px solid ${dropBorder}`, backgroundColor: 'transparent',
                color: dropText, fontSize: '11px', fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          <Divider color={dropBorder} />

          {/* Card color */}
          <div style={{ padding: '6px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dropMuted} strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20"/><path d="M12 2a10 10 0 0 0 0 20"/><path d="M2 12h20"/></svg>
              <span style={{ fontSize: '13px', color: dropText }}>Card color</span>
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['#FFFFFF', '#F8FAFC', '#FFF7ED', '#F0FDF4', '#EFF6FF', '#FAF5FF', '#FFF1F2', '#1A1A1A', '#0F172A'].map(c => (
                <button
                  key={c}
                  onClick={() => updateStyle({ backgroundColor: c })}
                  style={{
                    width: 24, height: 24, borderRadius: '6px',
                    backgroundColor: c,
                    border: currentBg === c ? '2px solid #2563eb' : '1px solid rgba(0,0,0,0.1)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                />
              ))}
              <label style={{ width: 24, height: 24, borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: dropMuted, overflow: 'hidden', position: 'relative' }}>
                +
                <input type="color" value={currentBg || '#ffffff'} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              </label>
            </div>
          </div>

          <Divider color={dropBorder} />

          {/* Full bleed toggle */}
          <div style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dropMuted} strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
              <span style={{ fontSize: '13px', color: dropText }}>Full-bleed card</span>
            </div>
            <button
              onClick={() => updateStyle({ fullBleed: !currentFullBleed })}
              style={{
                width: 32, height: 18, borderRadius: 9,
                backgroundColor: currentFullBleed ? '#2563eb' : 'rgba(0,0,0,0.12)',
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background-color 0.2s',
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: '50%', backgroundColor: '#fff',
                position: 'absolute', top: 2,
                left: currentFullBleed ? 16 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
              }} />
            </button>
          </div>

          {/* Content alignment */}
          <div style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={dropMuted} strokeWidth="1.5"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
              <span style={{ fontSize: '13px', color: dropText }}>Content alignment</span>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              {(['top', 'center', 'bottom'] as const).map(a => (
                <button
                  key={a}
                  onClick={() => updateStyle({ contentAlign: a })}
                  style={{
                    width: 26, height: 22, borderRadius: '4px',
                    border: currentAlign === a ? '1.5px solid #2563eb' : `1px solid ${dropBorder}`,
                    backgroundColor: currentAlign === a ? 'rgba(37,99,235,0.06)' : 'transparent',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  title={a}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    {a === 'top' && <><rect x="2" y="1" width="6" height="1.5" rx="0.5" fill={currentAlign === a ? '#2563eb' : dropMuted} /><rect x="2" y="4" width="6" height="1" rx="0.5" fill={currentAlign === a ? '#2563eb' : dropMuted} opacity="0.4" /></>}
                    {a === 'center' && <><rect x="2" y="3" width="6" height="1.5" rx="0.5" fill={currentAlign === a ? '#2563eb' : dropMuted} /><rect x="2" y="5.5" width="6" height="1" rx="0.5" fill={currentAlign === a ? '#2563eb' : dropMuted} opacity="0.4" /></>}
                    {a === 'bottom' && <><rect x="2" y="7.5" width="6" height="1.5" rx="0.5" fill={currentAlign === a ? '#2563eb' : dropMuted} /><rect x="2" y="5" width="6" height="1" rx="0.5" fill={currentAlign === a ? '#2563eb' : dropMuted} opacity="0.4" /></>}
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <Divider color={dropBorder} />

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

          <Divider color={dropBorder} />

          {/* Reset & Delete */}
          <MItem onClick={() => { updateStyle({ layout: undefined, backgroundImage: undefined, contentAlign: undefined, fullBleed: undefined }); setOpen(false) }} color={dropMuted} hover={dropHover}>Reset styling</MItem>
          {totalPages > 1 && (
            <MItem onClick={() => { deletePage(pageId); setOpen(false) }} color="#ef4444" hover={dropHover}>Delete page</MItem>
          )}
        </div>
      )}
    </>
  )
}

function Divider({ color }: { color: string }) {
  return <div style={{ height: 1, backgroundColor: color, margin: '4px 8px' }} />
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
        transition: 'background-color 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = hover }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
    >
      {children}
    </button>
  )
}

function LayoutThumb({ type, active, muted }: { type: string; active: boolean; muted: string }) {
  const c = active ? '#2563eb' : muted
  const bg = active ? 'rgba(37,99,235,0.15)' : 'rgba(0,0,0,0.06)'
  switch (type) {
    case 'default':
      return (
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect x="4" y="4" width="20" height="3" rx="1" fill={c} opacity="0.5" />
          <rect x="4" y="9" width="20" height="2" rx="0.5" fill={c} opacity="0.3" />
          <rect x="4" y="13" width="14" height="2" rx="0.5" fill={c} opacity="0.3" />
        </svg>
      )
    case 'image-top':
      return (
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect x="3" y="2" width="22" height="8" rx="1" fill={bg} />
          <rect x="5" y="12" width="18" height="2" rx="0.5" fill={c} opacity="0.4" />
          <rect x="5" y="16" width="12" height="2" rx="0.5" fill={c} opacity="0.3" />
        </svg>
      )
    case 'image-left':
      return (
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect x="2" y="2" width="10" height="16" rx="1" fill={bg} />
          <rect x="14" y="4" width="12" height="2" rx="0.5" fill={c} opacity="0.4" />
          <rect x="14" y="8" width="12" height="2" rx="0.5" fill={c} opacity="0.3" />
          <rect x="14" y="12" width="8" height="2" rx="0.5" fill={c} opacity="0.3" />
        </svg>
      )
    case 'image-right':
      return (
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect x="16" y="2" width="10" height="16" rx="1" fill={bg} />
          <rect x="2" y="4" width="12" height="2" rx="0.5" fill={c} opacity="0.4" />
          <rect x="2" y="8" width="12" height="2" rx="0.5" fill={c} opacity="0.3" />
          <rect x="2" y="12" width="8" height="2" rx="0.5" fill={c} opacity="0.3" />
        </svg>
      )
    case 'image-bg':
      return (
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none">
          <rect x="2" y="2" width="24" height="16" rx="1" fill={bg} />
          <rect x="6" y="7" width="16" height="2.5" rx="0.5" fill={c} opacity="0.6" />
          <rect x="8" y="11" width="12" height="2" rx="0.5" fill={c} opacity="0.4" />
        </svg>
      )
    default:
      return null
  }
}
