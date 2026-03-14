'use client'

import React from 'react'
import { nanoid } from 'nanoid'
import type { BlockComponentProps } from './types'
import type { CheckboxContent, Option } from '@/lib/block-editor/types'

export const CheckboxBlock: React.FC<BlockComponentProps<'checkbox'>> = ({
  block,
  isEditing,
  onContentChange,
  onFocus,
}) => {
  const content = block.content as CheckboxContent

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
      {(content.description || isEditing) && isEditing ? (
        <input type="text" value={content.description ?? ''} onChange={(e) => onContentChange({ description: e.target.value || undefined })} placeholder="Add a description (optional)" style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.825rem', color: 'var(--surbee-fg-muted)', padding: 0, width: '100%', fontFamily: 'inherit' }} />
      ) : content.description ? <p style={{ fontSize: '0.825rem', color: 'var(--surbee-fg-muted)', margin: 0 }}>{content.description}</p> : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {content.options.map((option, i) => (
          <div key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: 18, height: 18, borderRadius: '4px', border: '2px solid var(--surbee-border-primary)', flexShrink: 0 }} />
            {isEditing ? (
              <input type="text" value={option.label} onChange={(e) => updateOption(i, e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.9rem', color: 'var(--surbee-fg-primary)', padding: '4px 0', flex: 1, fontFamily: 'inherit' }} />
            ) : (
              <span style={{ fontSize: '0.9rem', color: 'var(--surbee-fg-primary)' }}>{option.label}</span>
            )}
            {isEditing && content.options.length > 1 && (
              <button onClick={() => removeOption(i)} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-fg-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0 4px', lineHeight: 1 }}>&times;</button>
            )}
          </div>
        ))}
      </div>
      {isEditing && (
        <button onClick={addOption} style={{ background: 'transparent', border: 'none', color: 'var(--surbee-accent-primary, #2563eb)', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 0', textAlign: 'left', fontFamily: 'inherit' }}>+ Add option</button>
      )}
    </div>
  )
}
