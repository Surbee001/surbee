'use client'

import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useBlockEditorStore } from '@/stores/blockEditorStore'
import type { SurveyTheme } from '@/lib/block-editor/types'

interface ThemeEditorProps {
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Color presets — full themes users can pick from
// ---------------------------------------------------------------------------

const THEME_PRESETS: { name: string; theme: Partial<SurveyTheme> }[] = [
  {
    name: 'Default',
    theme: { primaryColor: '#2563eb', secondaryColor: '#7c3aed', accentColor: '#2563eb', backgroundColor: '#ffffff', textColor: '#0a0a0a', fontFamily: 'Inter, sans-serif', borderRadius: '0.5rem' },
  },
  {
    name: 'Midnight',
    theme: { primaryColor: '#818cf8', secondaryColor: '#c084fc', accentColor: '#818cf8', backgroundColor: '#0f172a', textColor: '#f1f5f9', fontFamily: 'DM Sans, sans-serif', borderRadius: '0.75rem' },
  },
  {
    name: 'Rose',
    theme: { primaryColor: '#f43f5e', secondaryColor: '#fb7185', accentColor: '#f43f5e', backgroundColor: '#fff1f2', textColor: '#1c1917', fontFamily: 'Plus Jakarta Sans, sans-serif', borderRadius: '1rem' },
  },
  {
    name: 'Forest',
    theme: { primaryColor: '#059669', secondaryColor: '#34d399', accentColor: '#059669', backgroundColor: '#ffffff', textColor: '#064e3b', fontFamily: 'Space Grotesk, sans-serif', borderRadius: '0.5rem' },
  },
  {
    name: 'Ocean',
    theme: { primaryColor: '#0ea5e9', secondaryColor: '#38bdf8', accentColor: '#0ea5e9', backgroundColor: '#f0f9ff', textColor: '#0c4a6e', fontFamily: 'Outfit, sans-serif', borderRadius: '0.75rem' },
  },
  {
    name: 'Sunset',
    theme: { primaryColor: '#f59e0b', secondaryColor: '#fbbf24', accentColor: '#f59e0b', backgroundColor: '#fffbeb', textColor: '#1c1917', fontFamily: 'Nunito, sans-serif', borderRadius: '0.5rem' },
  },
  {
    name: 'Minimal',
    theme: { primaryColor: '#171717', secondaryColor: '#525252', accentColor: '#171717', backgroundColor: '#ffffff', textColor: '#171717', fontFamily: 'Inter, sans-serif', borderRadius: '0.25rem' },
  },
  {
    name: 'Academic',
    theme: { primaryColor: '#1d4ed8', secondaryColor: '#3b82f6', accentColor: '#1d4ed8', backgroundColor: '#ffffff', textColor: '#111827', fontFamily: 'Source Serif 4, serif', borderRadius: '0.375rem' },
  },
  {
    name: 'Playful',
    theme: { primaryColor: '#8b5cf6', secondaryColor: '#a78bfa', accentColor: '#8b5cf6', backgroundColor: '#faf5ff', textColor: '#2e1065', fontFamily: 'Poppins, sans-serif', borderRadius: '1.5rem' },
  },
]

const FONT_OPTIONS = [
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'DM Sans', value: 'DM Sans, sans-serif' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans, sans-serif' },
  { label: 'Space Grotesk', value: 'Space Grotesk, sans-serif' },
  { label: 'Outfit', value: 'Outfit, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'Manrope', value: 'Manrope, sans-serif' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Source Serif 4', value: 'Source Serif 4, serif' },
  { label: 'Playfair Display', value: 'Playfair Display, serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Lora', value: 'Lora, serif' },
  { label: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
]

const RADIUS_OPTIONS = [
  { label: 'None', value: '0' },
  { label: 'Small', value: '0.25rem' },
  { label: 'Medium', value: '0.5rem' },
  { label: 'Large', value: '0.75rem' },
  { label: 'XL', value: '1rem' },
  { label: 'Full', value: '1.5rem' },
]

export const ThemeEditor: React.FC<ThemeEditorProps> = ({ onClose }) => {
  const theme = useBlockEditorStore(s => s.survey?.theme)
  const updateTheme = useBlockEditorStore(s => s.updateSurveyTheme)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const [activeTab, setActiveTab] = useState<'presets' | 'colors' | 'typography' | 'logo'>('presets')

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      updateTheme({ logoUrl: ev.target?.result as string })
    }
    reader.readAsDataURL(file)
  }, [updateTheme])

  if (!theme) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10000, padding: '24px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          backgroundColor: '#fff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: 560,
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 48px rgba(0,0,0,0.12)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 0',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
            Survey Theme
          </h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '8px', border: 'none',
            backgroundColor: '#f5f5f5', cursor: 'pointer', color: '#999',
            fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0', padding: '16px 24px 0',
          borderBottom: '1px solid #f0f0f0',
        }}>
          {(['presets', 'colors', 'typography', 'logo'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px', border: 'none', backgroundColor: 'transparent',
                cursor: 'pointer', fontSize: '13px', fontWeight: 500,
                color: activeTab === tab ? '#1a1a1a' : '#999',
                borderBottom: activeTab === tab ? '2px solid #1a1a1a' : '2px solid transparent',
                marginBottom: '-1px', transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 24px' }} className="thin-scrollbar">

          {/* Presets Tab */}
          {activeTab === 'presets' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {THEME_PRESETS.map((preset) => {
                const isActive = theme.primaryColor === preset.theme.primaryColor && theme.backgroundColor === preset.theme.backgroundColor
                return (
                  <button
                    key={preset.name}
                    onClick={() => updateTheme(preset.theme)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: isActive ? '2px solid #2563eb' : '1px solid #e5e5e5',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s',
                    }}
                  >
                    {/* Color preview circles */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: preset.theme.primaryColor, border: '1px solid rgba(0,0,0,0.08)' }} />
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: preset.theme.backgroundColor, border: '1px solid rgba(0,0,0,0.08)' }} />
                      <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: preset.theme.textColor, border: '1px solid rgba(0,0,0,0.08)' }} />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 500, color: '#1a1a1a' }}>
                      {preset.name}
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Colors Tab */}
          {activeTab === 'colors' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <ColorField label="Primary Color" value={theme.primaryColor} onChange={(v) => updateTheme({ primaryColor: v, accentColor: v })} />
              <ColorField label="Secondary Color" value={theme.secondaryColor} onChange={(v) => updateTheme({ secondaryColor: v })} />
              <ColorField label="Background" value={theme.backgroundColor} onChange={(v) => updateTheme({ backgroundColor: v })} />
              <ColorField label="Text Color" value={theme.textColor} onChange={(v) => updateTheme({ textColor: v })} />

              <div>
                <label style={labelStyle}>Border Radius</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {RADIUS_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => updateTheme({ borderRadius: opt.value })}
                      style={{
                        padding: '6px 12px', borderRadius: '6px', fontSize: '12px',
                        border: theme.borderRadius === opt.value ? '1.5px solid #2563eb' : '1px solid #e5e5e5',
                        backgroundColor: theme.borderRadius === opt.value ? 'rgba(37,99,235,0.06)' : '#fff',
                        color: theme.borderRadius === opt.value ? '#2563eb' : '#666',
                        cursor: 'pointer', fontWeight: theme.borderRadius === opt.value ? 600 : 400,
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Typography Tab */}
          {activeTab === 'typography' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={labelStyle}>Font Family</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '360px', overflowY: 'auto' }} className="thin-scrollbar">
                  {FONT_OPTIONS.map(font => (
                    <button
                      key={font.value}
                      onClick={() => updateTheme({ fontFamily: font.value })}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 12px', borderRadius: '8px', border: 'none',
                        backgroundColor: theme.fontFamily === font.value ? '#f0f0ff' : 'transparent',
                        cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => { if (theme.fontFamily !== font.value) e.currentTarget.style.backgroundColor = '#f9f9f9' }}
                      onMouseLeave={(e) => { if (theme.fontFamily !== font.value) e.currentTarget.style.backgroundColor = 'transparent' }}
                    >
                      <span style={{ fontFamily: font.value, fontSize: '15px', color: '#1a1a1a' }}>
                        {font.label}
                      </span>
                      <span style={{ fontFamily: font.value, fontSize: '12px', color: '#999' }}>
                        Aa Bb Cc 123
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Logo Tab */}
          {activeTab === 'logo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Logo preview */}
              <div style={{
                border: '2px dashed #e5e5e5',
                borderRadius: '10px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                cursor: 'pointer',
                minHeight: '120px',
                justifyContent: 'center',
              }}
                onClick={() => logoInputRef.current?.click()}
              >
                {theme.logoUrl ? (
                  <>
                    <img src={theme.logoUrl} alt="Logo" style={{ maxHeight: '80px', maxWidth: '200px', objectFit: 'contain' }} />
                    <button
                      onClick={(e) => { e.stopPropagation(); updateTheme({ logoUrl: undefined }) }}
                      style={{
                        padding: '4px 12px', borderRadius: '6px', border: '1px solid #e5e5e5',
                        backgroundColor: '#fff', cursor: 'pointer', fontSize: '12px', color: '#ef4444',
                      }}
                    >
                      Remove logo
                    </button>
                  </>
                ) : (
                  <>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span style={{ fontSize: '13px', color: '#999' }}>Click to upload logo</span>
                  </>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </div>

              {/* Logo position */}
              {theme.logoUrl && (
                <div>
                  <label style={labelStyle}>Logo Position</label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {(['top-left', 'top-center', 'top-right'] as const).map(pos => (
                      <button
                        key={pos}
                        onClick={() => updateTheme({ logoPosition: pos })}
                        style={{
                          flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px',
                          border: (theme.logoPosition || 'top-left') === pos ? '1.5px solid #2563eb' : '1px solid #e5e5e5',
                          backgroundColor: (theme.logoPosition || 'top-left') === pos ? 'rgba(37,99,235,0.06)' : '#fff',
                          color: (theme.logoPosition || 'top-left') === pos ? '#2563eb' : '#666',
                          cursor: 'pointer', textTransform: 'capitalize',
                        }}
                      >
                        {pos.replace('top-', '')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Color field component
// ---------------------------------------------------------------------------

const ColorField: React.FC<{
  label: string
  value: string
  onChange: (v: string) => void
}> = ({ label, value, onChange }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 36, height: 36, border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
        }}
        style={{
          flex: 1, padding: '8px 12px', borderRadius: '8px',
          border: '1px solid #e5e5e5', fontSize: '13px',
          fontFamily: 'monospace', color: '#1a1a1a', outline: 'none',
        }}
      />
      {/* Quick color swatches */}
      <div style={{ display: 'flex', gap: '3px' }}>
        {['#2563eb', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#0ea5e9', '#171717'].map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 18, height: 18, borderRadius: '4px',
              backgroundColor: c, border: value === c ? '2px solid #333' : '1px solid rgba(0,0,0,0.1)',
              cursor: 'pointer', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  </div>
)

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#999',
  marginBottom: '8px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
}
