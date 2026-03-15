'use client'

import React, { useCallback, useState } from 'react'
import { nanoid } from 'nanoid'
import type { BlockComponentProps } from './types'
import type { TableContent, TableCell } from '@/lib/block-editor/types'

export const TableBlock: React.FC<BlockComponentProps<'table'>> = ({
  block,
  isEditing,
  onContentChange,
}) => {
  const content = block.content as TableContent
  const { rows, headerRow } = content
  const [hoverCol, setHoverCol] = useState<number | null>(null)
  const [hoverRow, setHoverRow] = useState<number | null>(null)
  const colCount = rows[0]?.length || 0

  const updateCell = useCallback((rowIdx: number, colIdx: number, text: string) => {
    const newRows = rows.map((row, ri) =>
      ri === rowIdx ? row.map((cell, ci) => ci === colIdx ? { ...cell, text } : cell) : row
    )
    onContentChange({ rows: newRows })
  }, [rows, onContentChange])

  const insertColumn = useCallback((atIdx: number) => {
    const newRows = rows.map((row, ri) => {
      const newCell: TableCell = { id: nanoid(8), text: ri === 0 && headerRow ? '' : '' }
      return [...row.slice(0, atIdx), newCell, ...row.slice(atIdx)]
    })
    onContentChange({ rows: newRows })
  }, [rows, headerRow, onContentChange])

  const insertRow = useCallback((atIdx: number) => {
    const newRow: TableCell[] = Array.from({ length: colCount }, () => ({ id: nanoid(8), text: '' }))
    const newRows = [...rows.slice(0, atIdx), newRow, ...rows.slice(atIdx)]
    onContentChange({ rows: newRows })
  }, [rows, colCount, onContentChange])

  const deleteRow = useCallback((rowIdx: number) => {
    if (rows.length <= 1) return
    onContentChange({ rows: rows.filter((_, i) => i !== rowIdx) })
  }, [rows, onContentChange])

  const deleteColumn = useCallback((colIdx: number) => {
    if (colCount <= 1) return
    onContentChange({ rows: rows.map(row => row.filter((_, i) => i !== colIdx)) })
  }, [rows, colCount, onContentChange])

  const borderColor = 'var(--surbee-border-primary, rgba(0,0,0,0.08))'

  const cellStyle: React.CSSProperties = {
    border: `1px solid ${borderColor}`,
    padding: '8px 12px',
    fontSize: '0.875rem',
    color: 'var(--surbee-fg-primary)',
    fontFamily: 'inherit',
    verticalAlign: 'top',
    minWidth: '80px',
    position: 'relative',
  }
  const headerCellStyle: React.CSSProperties = {
    ...cellStyle,
    fontWeight: 600,
    backgroundColor: 'var(--surbee-bg-secondary, #f9fafb)',
    fontSize: '0.825rem',
  }

  // Preview mode
  if (!isEditing) {
    return (
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => {
                  const isHeader = headerRow && ri === 0
                  const Tag = isHeader ? 'th' : 'td'
                  return <Tag key={cell.id} style={isHeader ? headerCellStyle : cellStyle}>{cell.text}</Tag>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // Edit mode with Excel-style insert lines
  return (
    <div style={{ overflowX: 'auto', position: 'relative' }}>
      {/* Column insert indicators — rendered above the table */}
      <div style={{ position: 'relative', height: 0 }}>
        {Array.from({ length: colCount + 1 }).map((_, ci) => (
          <div
            key={`col-insert-${ci}`}
            onMouseEnter={() => setHoverCol(ci)}
            onMouseLeave={() => setHoverCol(null)}
            onClick={() => insertColumn(ci)}
            style={{
              position: 'absolute',
              top: 0,
              left: `${(ci / colCount) * 100}%`,
              transform: 'translateX(-50%)',
              width: 16,
              height: '100%',
              minHeight: rows.length * 40,
              cursor: 'pointer',
              zIndex: 5,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {hoverCol === ci && (
              <div style={{
                width: 2, height: '100%',
                backgroundColor: '#2563eb',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
                  width: 16, height: 16, borderRadius: '50%',
                  backgroundColor: '#2563eb', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', fontWeight: 600, lineHeight: 1,
                }}>+</div>
              </div>
            )}
          </div>
        ))}
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'inherit' }}>
        <tbody>
          {rows.map((row, ri) => (
            <React.Fragment key={ri}>
              {/* Row insert indicator */}
              <tr
                onMouseEnter={() => setHoverRow(ri)}
                onMouseLeave={() => setHoverRow(null)}
                style={{ height: 0 }}
              >
                <td colSpan={colCount + 1} style={{ border: 'none', padding: 0, position: 'relative', height: ri === 0 ? 0 : 4 }}>
                  {hoverRow === ri && (
                    <div
                      onClick={() => insertRow(ri)}
                      style={{
                        position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)',
                        height: 2, backgroundColor: '#2563eb', cursor: 'pointer', zIndex: 5,
                      }}
                    >
                      <div style={{
                        position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                        width: 16, height: 16, borderRadius: '50%',
                        backgroundColor: '#2563eb', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: 600, lineHeight: 1,
                      }}>+</div>
                    </div>
                  )}
                </td>
              </tr>
              <tr className="group/row">
                {row.map((cell, ci) => {
                  const isHeader = headerRow && ri === 0
                  return (
                    <td key={cell.id} style={isHeader ? headerCellStyle : cellStyle}>
                      <input
                        type="text"
                        value={cell.text}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        placeholder={isHeader ? `Header ${ci + 1}` : ''}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          width: '100%',
                          fontSize: 'inherit',
                          fontWeight: isHeader ? 600 : 'inherit',
                          color: 'inherit',
                          fontFamily: 'inherit',
                          padding: 0,
                        }}
                      />
                    </td>
                  )
                })}
                {/* Delete row button */}
                <td style={{ border: 'none', padding: '0 2px', width: '20px', verticalAlign: 'middle' }}>
                  {rows.length > 1 && (
                    <button
                      onClick={() => deleteRow(ri)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--surbee-fg-muted)', fontSize: '12px',
                        opacity: 0, padding: '2px', transition: 'opacity 0.15s',
                        borderRadius: '4px',
                      }}
                      className="group-hover/row:!opacity-40 hover:!opacity-100"
                      title="Delete row"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            </React.Fragment>
          ))}
          {/* Bottom row insert */}
          <tr
            onMouseEnter={() => setHoverRow(rows.length)}
            onMouseLeave={() => setHoverRow(null)}
            style={{ height: 4 }}
          >
            <td colSpan={colCount + 1} style={{ border: 'none', padding: 0, position: 'relative' }}>
              {hoverRow === rows.length && (
                <div
                  onClick={() => insertRow(rows.length)}
                  style={{
                    position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)',
                    height: 2, backgroundColor: '#2563eb', cursor: 'pointer', zIndex: 5,
                  }}
                >
                  <div style={{
                    position: 'absolute', left: -8, top: '50%', transform: 'translateY(-50%)',
                    width: 16, height: 16, borderRadius: '50%',
                    backgroundColor: '#2563eb', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 600, lineHeight: 1,
                  }}>+</div>
                </div>
              )}
            </td>
          </tr>
          {/* Delete column buttons */}
          <tr>
            {rows[0]?.map((_, ci) => (
              <td key={ci} style={{ border: 'none', padding: '2px 0', textAlign: 'center' }}>
                {colCount > 1 && (
                  <button
                    onClick={() => deleteColumn(ci)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: 'var(--surbee-fg-muted)', fontSize: '11px', opacity: 0.3,
                      padding: '2px 6px', borderRadius: '4px', transition: 'opacity 0.15s',
                    }}
                    className="hover:!opacity-100"
                    title="Delete column"
                  >
                    ×
                  </button>
                )}
              </td>
            ))}
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
