'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Block, BlockStyle } from '@/lib/block-editor/types'
import { isQuestionBlock } from '@/lib/block-editor/types'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface BlockWrapperProps {
  block: Block
  isSelected: boolean
  isEditing: boolean
  onSelect: () => void
  onDelete: () => void
  onDuplicate: () => void
  onToggleRequired?: () => void
  onStyleChange?: (style: Partial<BlockStyle>) => void
  children: React.ReactNode
}

const FONTS_SANS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Raleway', 'Nunito', 'DM Sans', 'Space Grotesk', 'Outfit',
  'Plus Jakarta Sans', 'Sora', 'Manrope', 'Work Sans', 'Figtree',
  'Geist', 'Albert Sans', 'Red Hat Display', 'Urbanist',
]
const FONTS_SERIF = [
  'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text',
  'Source Serif 4', 'EB Garamond', 'Cormorant Garamond',
  'Libre Baskerville', 'Bitter', 'DM Serif Display',
]
const FONTS_MONO = ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono']
const ALL_FONTS = [
  { group: 'Sans Serif', fonts: FONTS_SANS },
  { group: 'Serif', fonts: FONTS_SERIF },
  { group: 'Monospace', fonts: FONTS_MONO },
]

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  isSelected,
  isEditing,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleRequired,
  onStyleChange,
  children,
}) => {
  const [showToolbar, setShowToolbar] = useState(false)
  const [toolbarPos, setToolbarPos] = useState({ x: 0, y: 0 })
  const [subMenu, setSubMenu] = useState<'color' | 'font' | 'padding' | null>(null)
  const [fontSearch, setFontSearch] = useState('')
  const toolbarRef = useRef<HTMLDivElement>(null)
  const handleBtnRef = useRef<HTMLButtonElement>(null)
  const updateBlockContent = useBlockEditorStore(s => s.updateBlockContent)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const wrapStyle: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
    zIndex: isDragging ? 50 : 'auto',
  }

  const isQuestion = isQuestionBlock(block.type)
  const content = block.content as any
  const isRequired = isQuestion && content?.required
  const bs = block.meta.style || {}

  useEffect(() => {
    if (!showToolbar) return
    const handler = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node) &&
          handleBtnRef.current && !handleBtnRef.current.contains(e.target as Node)) {
        setShowToolbar(false); setSubMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showToolbar])

  // Text selection opens toolbar
  useEffect(() => {
    if (!isEditing || !isSelected) return
    const handler = () => {
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return
      const range = sel.getRangeAt(0)
      const el = document.querySelector(`[data-block-id="${block.id}"]`)
      if (!el || !el.contains(range.commonAncestorContainer)) return
      const rect = range.getBoundingClientRect()
      setToolbarPos({ x: Math.max(8, rect.left + rect.width / 2 - 200), y: rect.top - 8 })
      setShowToolbar(true)
    }
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [isEditing, isSelected, block.id])

  const openToolbar = useCallback(() => {
    if (handleBtnRef.current) {
      const r = handleBtnRef.current.getBoundingClientRect()
      setToolbarPos({ x: r.left, y: r.top - 8 })
    }
    setShowToolbar(v => !v); setSubMenu(null)
  }, [])

  const fontSize = (() => {
    if (!bs.fontSize) return 16
    const n = parseFloat(bs.fontSize)
    return bs.fontSize.includes('rem') ? Math.round(n * 16) : Math.round(n)
  })()

  const setSize = (v: number) => { if (v > 0 && v < 300) onStyleChange?.({ fontSize: `${v}px` }) }

  // Dropdown menu styling
  const dropStyle: React.CSSProperties = {
    position: 'absolute', top: '100%', marginTop: 4,
    borderRadius: '16px', padding: '6px',
    border: '1px solid var(--surbee-dropdown-border, rgba(0,0,0,0.08))',
    backgroundColor: 'var(--surbee-dropdown-bg, #fff)',
    backdropFilter: 'blur(12px)',
    boxShadow: 'rgba(0,0,0,0.15) 0px 4px 12px', zIndex: 10,
  }

  return (
    <div ref={setNodeRef} style={wrapStyle} data-block-id={block.id} data-question-id={block.meta.questionId} data-question-type={isQuestion ? block.type : undefined} className="group">
      <div
        onClick={onSelect}
        style={{
          padding: bs.padding || '8px 4px',
          borderRadius: '4px', cursor: 'text', position: 'relative',
          ...(bs.backgroundColor ? { backgroundColor: bs.backgroundColor } : {}),
          ...(bs.fontSize ? { fontSize: bs.fontSize } : {}),
          ...(bs.color ? { color: bs.color } : {}),
          ...(bs.textAlign ? { textAlign: bs.textAlign as any } : {}),
          ...(bs.fontWeight ? { fontWeight: bs.fontWeight } : {}),
          ...(bs.fontFamily ? { fontFamily: bs.fontFamily } : {}),
        }}
      >
        {isEditing && (
          <div className="opacity-0 group-hover:opacity-100" style={{ position: 'absolute', left: -28, top: '50%', transform: 'translateY(-50%)', zIndex: 10, transition: 'opacity 0.1s' }}>
            <button ref={handleBtnRef} onClick={(e) => { e.stopPropagation(); openToolbar() }} {...attributes} {...listeners} style={{ width: 20, height: 20, borderRadius: '4px', border: 'none', backgroundColor: showToolbar ? 'rgba(0,0,0,0.06)' : 'transparent', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#9ca3af' }} />
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#9ca3af' }} />
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#9ca3af' }} />
            </button>
          </div>
        )}
        {children}
      </div>

      {/* Toolbar */}
      {showToolbar && (
        <div ref={toolbarRef} onClick={(e) => e.stopPropagation()} style={{
          position: 'fixed', left: toolbarPos.x, top: toolbarPos.y, transform: 'translateY(-100%)',
          display: 'flex', alignItems: 'center', gap: '2px', padding: '4px 8px',
          borderRadius: '10px', border: '1px solid var(--surbee-dropdown-border, rgba(0,0,0,0.08))',
          backgroundColor: 'var(--surbee-dropdown-bg, #fff)', backdropFilter: 'blur(12px)',
          boxShadow: 'rgba(0,0,0,0.12) 0px 4px 12px', zIndex: 9998,
          fontFamily: 'Opening Hours Sans, sans-serif',
        }}>
          {/* Font */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setSubMenu(subMenu === 'font' ? null : 'font')} style={tBtn(false)} title="Font">
              <span style={{ fontSize: '11px', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bs.fontFamily?.split(',')[0] || 'Font'}</span>
              <span style={{ fontSize: '7px', marginLeft: 2 }}>&#9662;</span>
            </button>
            {subMenu === 'font' && (
              <div style={{ ...dropStyle, left: 0, width: 200, maxHeight: 280 }}>
                <input type="text" value={fontSearch} onChange={(e) => setFontSearch(e.target.value)} placeholder="Search..." style={{ width: '100%', padding: '6px 10px', borderRadius: '10px', border: '1px solid var(--surbee-dropdown-border, rgba(0,0,0,0.08))', backgroundColor: 'transparent', color: 'var(--surbee-dropdown-text, #333)', fontSize: '12px', fontFamily: 'inherit', outline: 'none', marginBottom: '4px' }} />
                <div style={{ overflowY: 'auto', maxHeight: 220 }} className="thin-scrollbar">
                  <FItem label="Default" active={!bs.fontFamily} onClick={() => { onStyleChange?.({ fontFamily: undefined }); setSubMenu(null) }} />
                  {ALL_FONTS.map(g => {
                    const filtered = g.fonts.filter(f => f.toLowerCase().includes(fontSearch.toLowerCase()))
                    if (!filtered.length) return null
                    return (
                      <div key={g.group}>
                        <div style={{ padding: '6px 10px 2px', fontSize: '9px', fontWeight: 600, color: 'var(--surbee-dropdown-text-muted, rgba(0,0,0,0.4))', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{g.group}</div>
                        {filtered.map(f => (
                          <FItem key={f} label={f} fontFamily={`${f}, sans-serif`} active={bs.fontFamily?.startsWith(f) || false} onClick={() => { onStyleChange?.({ fontFamily: `${f}, sans-serif` }); setSubMenu(null); setFontSearch('') }} />
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <Sep />

          {/* Size — dropdown + -/+ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1px', position: 'relative' }}>
            <button onClick={() => setSize(fontSize - 1)} style={{ ...tBtn(false), width: 20, fontSize: '14px', fontWeight: 300 }} title="Decrease">-</button>
            <select
              value={fontSize}
              onChange={(e) => setSize(parseInt(e.target.value))}
              style={{
                width: 38, padding: '2px 2px 2px 6px', borderRadius: '4px',
                border: '1px solid rgba(0,0,0,0.06)', backgroundColor: 'transparent',
                color: 'var(--surbee-dropdown-text, #333)', fontSize: '11px',
                fontFamily: 'inherit', textAlign: 'center', outline: 'none',
                cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
              }}
              title="Font size"
            >
              {[10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
              {![10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96].includes(fontSize) && (
                <option value={fontSize}>{fontSize}</option>
              )}
            </select>
            <button onClick={() => setSize(fontSize + 1)} style={{ ...tBtn(false), width: 20, fontSize: '14px', fontWeight: 300 }} title="Increase">+</button>
          </div>

          <Sep />

          {/* B I U */}
          <button onClick={() => onStyleChange?.({ fontWeight: bs.fontWeight === '700' ? undefined : '700' })} style={tBtn(bs.fontWeight === '700')} title="Bold"><span style={{ fontWeight: 700 }}>B</span></button>
          <button onClick={() => document.execCommand('italic')} style={tBtn(false)} title="Italic"><span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>I</span></button>
          <button onClick={() => document.execCommand('underline')} style={tBtn(false)} title="Underline"><span style={{ textDecoration: 'underline' }}>U</span></button>

          <Sep />

          {/* Align */}
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} onClick={() => onStyleChange?.({ textAlign: a })} style={tBtn((!bs.textAlign && a === 'left') || bs.textAlign === a)} title={a}><AIcon t={a} /></button>
          ))}

          <Sep />

          {/* Color */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setSubMenu(subMenu === 'color' ? null : 'color')} style={{ ...tBtn(false), padding: '3px' }} title="Color">
              <div style={{ width: 18, height: 18, borderRadius: '4px', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ flex: 1, backgroundColor: bs.color || '#0a0a0a' }} />
              </div>
            </button>
            {subMenu === 'color' && (
              <div style={{ ...dropStyle, left: '50%', transform: 'translateX(-50%)', width: 210, padding: '10px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '10px' }}>
                  {['#0a0a0a', '#374151', '#6b7280', '#9ca3af', '#d1d5db', '#f3f4f6', '#ffffff',
                    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
                    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#fb923c',
                  ].map(c => (
                    <button key={c} onClick={() => { onStyleChange?.({ color: c }); setSubMenu(null) }} style={{ width: 22, height: 22, borderRadius: '5px', border: bs.color === c ? '2px solid #2563eb' : c === '#ffffff' ? '1px solid rgba(0,0,0,0.12)' : '1px solid transparent', backgroundColor: c, cursor: 'pointer' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '6px', borderTop: '1px solid var(--surbee-dropdown-border, rgba(0,0,0,0.06))' }}>
                  <input type="color" value={bs.color || '#000000'} onChange={(e) => onStyleChange?.({ color: e.target.value })} style={{ width: 28, height: 28, border: 'none', borderRadius: '6px', cursor: 'pointer', padding: 0 }} />
                  <input type="text" value={bs.color || ''} onChange={(e) => { if (/^#?[0-9a-fA-F]{0,6}$/.test(e.target.value.replace('#', ''))) onStyleChange?.({ color: e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}` }) }} placeholder="#000000" style={{ flex: 1, padding: '5px 8px', borderRadius: '8px', border: '1px solid var(--surbee-dropdown-border, rgba(0,0,0,0.08))', fontSize: '11px', fontFamily: 'monospace', backgroundColor: 'transparent', color: 'var(--surbee-dropdown-text, #333)', outline: 'none' }} />
                </div>
              </div>
            )}
          </div>

          <Sep />

          {/* Padding */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setSubMenu(subMenu === 'padding' ? null : 'padding')} style={tBtn(false)} title="Padding">
              <span style={{ fontSize: '10px' }}>Pad</span>
              <span style={{ fontSize: '7px', marginLeft: 2 }}>&#9662;</span>
            </button>
            {subMenu === 'padding' && (
              <div style={{ ...dropStyle, right: 0, width: 180 }}>
                <div style={{ padding: '4px 8px 6px', fontSize: '10px', color: 'var(--surbee-dropdown-text-muted, rgba(0,0,0,0.4))', fontWeight: 500 }}>ALL SIDES</div>
                {[
                  { label: 'None', value: '' },
                  { label: '4px — Tight', value: '4px' },
                  { label: '8px — Small', value: '8px' },
                  { label: '16px — Medium', value: '16px' },
                  { label: '24px — Large', value: '24px' },
                  { label: '40px — XL', value: '40px' },
                ].map(p => (
                  <button key={p.label} onClick={() => { onStyleChange?.({ padding: p.value || undefined }); setSubMenu(null) }}
                    style={{ display: 'block', width: '100%', textAlign: 'left', borderRadius: '10px', padding: '7px 10px', border: 'none', backgroundColor: bs.padding === p.value ? 'var(--surbee-dropdown-item-hover, rgba(0,0,0,0.04))' : 'transparent', color: 'var(--surbee-dropdown-text, #333)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surbee-dropdown-item-hover, rgba(0,0,0,0.04))' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = bs.padding === p.value ? 'var(--surbee-dropdown-item-hover, rgba(0,0,0,0.04))' : 'transparent' }}
                  >{p.label}</button>
                ))}
                <div style={{ height: 1, backgroundColor: 'var(--surbee-dropdown-border, rgba(0,0,0,0.06))', margin: '4px 6px' }} />
                <div style={{ padding: '4px 8px 6px', fontSize: '10px', color: 'var(--surbee-dropdown-text-muted, rgba(0,0,0,0.4))', fontWeight: 500 }}>CUSTOM (T R B L)</div>
                <div style={{ display: 'flex', gap: '4px', padding: '2px 8px 6px' }}>
                  {['Top', 'Right', 'Bottom', 'Left'].map((side, i) => (
                    <div key={side} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                      <input type="number" placeholder="0" defaultValue={bs.padding?.split(' ')[i === 0 ? 0 : i === 1 ? 1 : i === 2 ? 2 : 3]?.replace('px', '') || ''} onChange={(e) => {
                        const vals = (bs.padding || '8px 4px 8px 4px').split(' ').map(v => parseInt(v) || 0)
                        while (vals.length < 4) vals.push(vals[vals.length - 1] || 0)
                        vals[i] = parseInt(e.target.value) || 0
                        onStyleChange?.({ padding: vals.map(v => `${v}px`).join(' ') })
                      }} style={{ width: '100%', padding: '3px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', fontSize: '10px', textAlign: 'center', backgroundColor: 'transparent', color: 'var(--surbee-dropdown-text, #333)', outline: 'none' }} />
                      <span style={{ fontSize: '8px', color: 'var(--surbee-dropdown-text-muted, rgba(0,0,0,0.4))' }}>{side[0]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Sep />

          {/* Req toggle */}
          {isQuestion && (
            <button onClick={() => onToggleRequired?.()} title={isRequired ? 'Optional' : 'Required'} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '2px 5px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '10px', color: 'var(--surbee-dropdown-text, #666)' }}>
              <div style={{ width: 22, height: 12, borderRadius: 6, backgroundColor: isRequired ? '#ef4444' : 'rgba(0,0,0,0.12)', position: 'relative', transition: 'all 0.15s' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff', position: 'absolute', top: 2, left: isRequired ? 12 : 2, transition: 'left 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.15)' }} />
              </div>
            </button>
          )}

          <button onClick={onDuplicate} style={tBtn(false)} title="Duplicate"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></button>
          <button onClick={onDelete} style={{ ...tBtn(false), color: '#ef4444' }} title="Delete"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/></svg></button>
        </div>
      )}
    </div>
  )
}

// --- Helpers ---
const tBtn = (active: boolean): React.CSSProperties => ({
  height: 26, borderRadius: '5px', border: 'none', padding: '0 6px',
  backgroundColor: active ? 'rgba(0,0,0,0.06)' : 'transparent',
  color: 'var(--surbee-dropdown-text, #333)',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: '12px', transition: 'background 0.1s', flexShrink: 0,
})
function Sep() { return <div style={{ width: 1, height: 16, backgroundColor: 'rgba(0,0,0,0.06)', margin: '0 3px', flexShrink: 0 }} /> }
function FItem({ label, fontFamily, active, onClick }: { label: string; fontFamily?: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', borderRadius: '8px', border: 'none', backgroundColor: active ? 'var(--surbee-dropdown-item-hover, rgba(0,0,0,0.04))' : 'transparent', color: 'var(--surbee-dropdown-text, #333)', fontSize: '13px', cursor: 'pointer', fontFamily: fontFamily || 'inherit', fontWeight: active ? 600 : 400 }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surbee-dropdown-item-hover, rgba(0,0,0,0.04))' }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = active ? 'var(--surbee-dropdown-item-hover, rgba(0,0,0,0.04))' : 'transparent' }}
    >{label}</button>
  )
}
function AIcon({ t }: { t: 'left' | 'center' | 'right' }) {
  const w = [t === 'center' ? 7 : 10, t === 'left' ? 7 : t === 'right' ? 7 : 10, t === 'center' ? 7 : 10]
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none">{[2, 5.5, 9].map((y, i) => <rect key={i} x={t === 'right' ? 12 - w[i] : t === 'center' ? (12 - w[i]) / 2 : 0} y={y} width={w[i]} height={1.2} rx={0.5} fill="currentColor" />)}</svg>
}
