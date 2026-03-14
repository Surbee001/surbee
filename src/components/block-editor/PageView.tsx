'use client'

import React, { useCallback, useState, useEffect } from 'react'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import type { EditorPage, SurveyTheme } from '@/lib/block-editor/types'
import { BlockRenderer } from './BlockRenderer'
import { EmptyBlockPlaceholder } from './EmptyBlockPlaceholder'
import { BlockGap } from './BlockGap'
import { LogicBuilder } from './LogicBuilder'
import { useBlockEditorStore } from '@/stores/blockEditorStore'

interface PageViewProps {
  page: EditorPage
  isEditing: boolean
  theme: SurveyTheme
}

/**
 * Renders one page of the survey — what the user sees is what respondents see.
 * Clean, minimal, Typeform-like. No page labels, no selection rings.
 */
export const PageView: React.FC<PageViewProps> = ({
  page,
  isEditing,
  theme,
}) => {
  const [showLogic, setShowLogic] = useState(false)
  const totalPages = useBlockEditorStore(s => s.survey?.pages.length ?? 1)
  const blockIds = page.blocks.map(b => b.id)

  // Load Google Fonts
  useEffect(() => {
    // Load Google Fonts via API v2
    const families = [
      'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
      'Raleway', 'Nunito', 'DM Sans', 'Space Grotesk', 'Outfit',
      'Plus Jakarta Sans', 'Sora', 'Manrope', 'Work Sans', 'Figtree',
      'Albert Sans', 'Red Hat Display', 'Urbanist',
      'Playfair Display', 'Merriweather', 'Lora', 'Crimson Text',
      'Source Serif 4', 'EB Garamond', 'Cormorant Garamond',
      'Libre Baskerville', 'Bitter', 'DM Serif Display',
      'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono',
    ]
    const id = 'block-editor-google-fonts'
    if (!document.getElementById(id)) {
      const link = document.createElement('link')
      link.id = id
      link.rel = 'stylesheet'
      const params = families.map(f => `family=${f.replace(/ /g, '+')}:wght@400;500;600;700`).join('&')
      link.href = `https://fonts.googleapis.com/css2?${params}&display=swap`
      document.head.appendChild(link)
    }
  }, [])

  return (
    <>
    {showLogic && <LogicBuilder page={page} onClose={() => setShowLogic(false)} />}
    <div
      style={{
        padding: '48px 56px',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '0px',
        fontFamily: theme.fontFamily || 'inherit',
        backgroundColor: theme.backgroundColor || '#ffffff',
        // Force light theme inside the survey canvas
        color: theme.textColor || '#0a0a0a',
        // CSS vars for blocks to use light styling
        ['--surbee-fg-primary' as any]: theme.textColor || '#0a0a0a',
        ['--surbee-fg-secondary' as any]: theme.textColor ? `${theme.textColor}cc` : '#374151',
        ['--surbee-fg-muted' as any]: theme.textColor ? `${theme.textColor}80` : '#9ca3af',
        ['--surbee-bg-primary' as any]: theme.backgroundColor || '#ffffff',
        ['--surbee-bg-secondary' as any]: '#f9fafb',
        ['--surbee-bg-tertiary' as any]: '#f3f4f6',
        ['--surbee-border-primary' as any]: 'rgba(0,0,0,0.08)',
        ['--surbee-input-bg' as any]: '#ffffff',
        ['--surbee-accent-primary' as any]: theme.primaryColor || '#2563eb',
      }}
    >
      {/* Blocks with editable gaps between them */}
      <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {page.blocks.map((block, idx) => (
            <React.Fragment key={block.id}>
              {/* Editable gap before this block */}
              {isEditing && idx === 0 && (
                <BlockGap
                  pageId={page.id}
                  afterBlockId={null}
                  beforeBlockId={block.id}
                />
              )}
              <BlockRenderer
                block={block}
                pageId={page.id}
                isEditing={isEditing}
                theme={theme}
              />
              {/* Editable gap after this block */}
              {isEditing && (
                <BlockGap
                  pageId={page.id}
                  afterBlockId={block.id}
                  beforeBlockId={page.blocks[idx + 1]?.id || null}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </SortableContext>

      {/* Empty block placeholder at the end */}
      {isEditing && (
        <EmptyBlockPlaceholder pageId={page.id} />
      )}
    </div>
    </>
  )
}
