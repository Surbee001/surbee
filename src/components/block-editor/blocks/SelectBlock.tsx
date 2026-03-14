'use client'

import React from 'react'
import { nanoid } from 'nanoid'
import type { BlockComponentProps } from './types'
import type { SelectContent, Option } from '@/lib/block-editor/types'

export const SelectBlock: React.FC<BlockComponentProps<'select'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as SelectContent

  const addOption = () => {
    const newOption: Option = { id: nanoid(8), label: `Option ${content.options.length + 1}`, value: `option_${content.options.length + 1}` }
    onContentChange({ options: [...content.options, newOption] })
  }

  const updateOption = (index: number, label: string) => {
    const updated = [...content.options]
    updated[index] = { ...updated[index], label, value: label.toLowerCase().replace(/\s+/g, '_') }
    onContentChange({ options: updated })
  }

  const removeOption = (index: number) => {
    if (content.options.length <= 1) return
    onContentChange({ options: content.options.filter((_, i) => i !== index) })
  }

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

      {/* Dropdown preview */}
      <select disabled style={{
        width: '100%', padding: '10px 12px', border: '1px solid var(--surbee-border-primary)',
        borderRadius: '8px', fontSize: '0.9rem', backgroundColor: 'var(--surbee-input-bg, transparent)',
        color: 'var(--surbee-fg-muted)', fontFamily: 'inherit', appearance: 'none', opacity: 0.7,
      }}>
        <option>{content.placeholder || 'Select an option...'}</option>
      </select>

      {/* Editable options list (shown in edit mode) */}
      {isEditing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--surbee-fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Options</span>
          {content.options.map((option, i) => (
            <div key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--surbee-fg-muted)', width: 16, textAlign: 'center' }}>{i + 1}.</span>
              <input type="text" value={option.label} onChange={(e) => updateOption(i, e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.85rem', color: 'var(--surbee-fg-primary)', padding: '2px 0', flex: 1, fontFamily: 'inherit' }} />
              {content.options.length > 1 && (
                <button onClick={() => removeOption(i)} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-fg-muted)', cursor: 'pointer', fontSize: '0.9rem', padding: '0 2px', lineHeight: 1 }}>&times;</button>
              )}
            </div>
          ))}
          <button onClick={addOption} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-accent-primary, #2563eb)', cursor: 'pointer', fontSize: '0.85rem', padding: '2px 0', textAlign: 'left', fontFamily: 'inherit' }}>+ Add option</button>
        </div>
      )}
    </div>
  )
}
