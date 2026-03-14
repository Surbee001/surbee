'use client'

import React from 'react'
import { nanoid } from 'nanoid'
import type { BlockComponentProps } from './types'
import type { MatrixContent } from '@/lib/block-editor/types'

export const MatrixBlock: React.FC<BlockComponentProps<'matrix'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as MatrixContent

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
              {content.columns.map((col) => (
                <th key={col.id} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--surbee-border-primary)', color: 'var(--surbee-fg-secondary)', fontWeight: 500, fontSize: '0.8rem' }}>
                  {isEditing ? (
                    <input type="text" value={col.label} onChange={(e) => {
                      const cols = content.columns.map(c => c.id === col.id ? { ...c, label: e.target.value } : c)
                      onContentChange({ columns: cols })
                    }} style={{ background: 'transparent', border: 'none', outline: 'none', textAlign: 'center', color: 'var(--surbee-fg-secondary)', fontSize: '0.8rem', width: '100%', fontFamily: 'inherit' }} />
                  ) : col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row) => (
              <tr key={row.id}>
                <td style={{ padding: '8px', color: 'var(--surbee-fg-primary)', borderBottom: '1px solid var(--surbee-border-secondary, rgba(0,0,0,0.05))' }}>
                  {isEditing ? (
                    <input type="text" value={row.label} onChange={(e) => {
                      const rows = content.rows.map(r => r.id === row.id ? { ...r, label: e.target.value } : r)
                      onContentChange({ rows })
                    }} style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--surbee-fg-primary)', fontSize: '0.85rem', width: '100%', fontFamily: 'inherit' }} />
                  ) : row.label}
                </td>
                {content.columns.map((col) => (
                  <td key={col.id} style={{ padding: '8px', textAlign: 'center', borderBottom: '1px solid var(--surbee-border-secondary, rgba(0,0,0,0.05))' }}>
                    <div style={{ width: 16, height: 16, borderRadius: content.allowMultiple ? '3px' : '50%', border: '2px solid var(--surbee-border-primary)', margin: '0 auto' }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isEditing && (
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => onContentChange({ rows: [...content.rows, { id: nanoid(8), label: `Row ${content.rows.length + 1}` }] })} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-accent-primary, #2563eb)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>+ Add row</button>
          <button onClick={() => onContentChange({ columns: [...content.columns, { id: nanoid(8), label: `Col ${content.columns.length + 1}` }] })} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-accent-primary, #2563eb)', cursor: 'pointer', fontSize: '0.8rem', fontFamily: 'inherit' }}>+ Add column</button>
        </div>
      )}
    </div>
  )
}
