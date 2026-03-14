'use client'

import React from 'react'
import { nanoid } from 'nanoid'
import type { BlockComponentProps } from './types'
import type { RankingContent } from '@/lib/block-editor/types'

export const RankingBlock: React.FC<BlockComponentProps<'ranking'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as RankingContent

  return (
    <div onClick={onFocus} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        {isEditing ? (
          <input type="text" value={content.label} onChange={(e) => onContentChange({ label: e.target.value })} placeholder="Question label" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)', padding: 0, width: '100%', fontFamily: 'inherit' }} />
        ) : (
          <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)' }}>{content.label}</label>
        )}
        {content.required && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>*</span>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {content.items.map((item, i) => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 12px', border: '1px solid var(--surbee-border-primary)',
            borderRadius: '6px', backgroundColor: 'transparent',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--surbee-fg-muted)', fontWeight: 500, width: 20 }}>{i + 1}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--surbee-fg-muted)', cursor: 'grab' }}>&#9776;</span>
            {isEditing ? (
              <input type="text" value={item.label} onChange={(e) => {
                const items = [...content.items]
                items[i] = { ...items[i], label: e.target.value }
                onContentChange({ items })
              }} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--surbee-fg-primary)', flex: 1, fontFamily: 'inherit' }} />
            ) : (
              <span style={{ fontSize: '0.9rem', color: 'var(--surbee-fg-primary)' }}>{item.label}</span>
            )}
            {isEditing && content.items.length > 2 && (
              <button onClick={() => onContentChange({ items: content.items.filter((_, idx) => idx !== i) })} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-fg-muted)', cursor: 'pointer', fontSize: '0.9rem' }}>&times;</button>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <button onClick={() => onContentChange({ items: [...content.items, { id: nanoid(8), label: `Item ${content.items.length + 1}`, value: `item_${content.items.length + 1}` }] })} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-accent-primary, #2563eb)', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 0', textAlign: 'left', fontFamily: 'inherit' }}>+ Add item</button>
      )}
    </div>
  )
}
