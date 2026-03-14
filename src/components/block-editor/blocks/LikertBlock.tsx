'use client'

import React from 'react'
import { nanoid } from 'nanoid'
import type { BlockComponentProps } from './types'
import type { LikertContent } from '@/lib/block-editor/types'

export const LikertBlock: React.FC<BlockComponentProps<'likert'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as LikertContent

  return (
    <div onClick={onFocus} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
        {isEditing ? (
          <input type="text" value={content.label} onChange={(e) => onContentChange({ label: e.target.value })} placeholder="Question label" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)', padding: 0, width: '100%', fontFamily: 'inherit' }} />
        ) : (
          <label style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--surbee-fg-primary)' }}>{content.label}</label>
        )}
        {content.required && <span style={{ color: '#ef4444', fontSize: '0.875rem' }}>*</span>}
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid var(--surbee-border-primary)' }} />
              {content.scale.map((s, i) => (
                <th key={i} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--surbee-border-primary)', color: 'var(--surbee-fg-secondary)', fontWeight: 500, fontSize: '0.75rem', maxWidth: 80 }}>
                  {s}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.statements.map((stmt) => (
              <tr key={stmt.id}>
                <td style={{ padding: '8px', color: 'var(--surbee-fg-primary)', borderBottom: '1px solid var(--surbee-border-secondary, rgba(0,0,0,0.05))' }}>
                  {isEditing ? (
                    <input type="text" value={stmt.text} onChange={(e) => {
                      const stmts = content.statements.map(s => s.id === stmt.id ? { ...s, text: e.target.value } : s)
                      onContentChange({ statements: stmts })
                    }} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--surbee-fg-primary)', fontSize: '0.85rem', width: '100%', fontFamily: 'inherit' }} />
                  ) : stmt.text}
                </td>
                {content.scale.map((_, i) => (
                  <td key={i} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--surbee-border-secondary, rgba(0,0,0,0.05))' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--surbee-border-primary)', margin: '0 auto' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <button onClick={() => onContentChange({ statements: [...content.statements, { id: nanoid(8), text: `Statement ${content.statements.length + 1}` }] })} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-accent-primary, #2563eb)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>+ Add statement</button>
      )}
    </div>
  )
}
