'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { BlockEditorSurvey, EditorPage, Block, SurveyTheme, ButtonContent, BlockStyle } from '@/lib/block-editor/types'
import { isQuestionBlock } from '@/lib/block-editor/types'
import { evaluatePageLogic, evaluateBlockVisibility } from '@/lib/block-editor/logic-engine'
import { BlockRegistry } from './blocks'
import { DEFAULT_THEME } from '@/lib/block-editor/block-defaults'

interface SurveyRendererProps {
  survey: BlockEditorSurvey
  onComplete?: (responses: Record<string, unknown>, metrics: BehavioralMetrics) => void
  isPreview?: boolean
  hideBranding?: boolean
}

interface BehavioralMetrics {
  mouseMovements: Array<{ x: number; y: number; t: number }>
  keystrokeDynamics: Array<{ key: string; down: number; up: number }>
  responseTime: number[]
  deviceFingerprint?: Record<string, unknown>
  questionTimings: Record<string, number>
}

export const SurveyRenderer: React.FC<SurveyRendererProps> = ({
  survey,
  onComplete,
  isPreview = false,
  hideBranding = false,
}) => {
  const theme = survey.theme || DEFAULT_THEME
  const pages = survey.pages
  const settings = survey.settings

  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, unknown>>({})
  const [isCompleted, setIsCompleted] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Behavioral tracking
  const startTime = useRef(Date.now())
  const pageStartTime = useRef(Date.now())
  const questionTimings = useRef<Record<string, number>>({})
  const mouseData = useRef<Array<{ x: number; y: number; t: number }>>([])
  const keystrokeData = useRef<Array<{ key: string; down: number; up: number }>>([])
  const pageTimings = useRef<number[]>([])

  const currentPage = pages[currentPageIndex]
  const totalPages = pages.length
  const progress = totalPages > 0 ? ((currentPageIndex + 1) / totalPages) * 100 : 0

  // Track mouse movements
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (mouseData.current.length < 500) {
        mouseData.current.push({ x: e.clientX, y: e.clientY, t: Date.now() })
      }
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  // Track keystrokes
  useEffect(() => {
    let lastDown = 0
    const handleDown = (e: KeyboardEvent) => {
      lastDown = Date.now()
    }
    const handleUp = (e: KeyboardEvent) => {
      if (keystrokeData.current.length < 200) {
        keystrokeData.current.push({ key: e.key.length === 1 ? '*' : e.key, down: lastDown, up: Date.now() })
      }
    }
    window.addEventListener('keydown', handleDown)
    window.addEventListener('keyup', handleUp)
    return () => {
      window.removeEventListener('keydown', handleDown)
      window.removeEventListener('keyup', handleUp)
    }
  }, [])

  // Notify parent of page changes
  useEffect(() => {
    window.parent?.postMessage({ type: 'PAGE_CHANGE', pageIndex: currentPageIndex }, '*')
  }, [currentPageIndex])

  const handleResponse = useCallback((blockId: string, questionId: string, value: unknown) => {
    setResponses(prev => ({ ...prev, [questionId]: value }))
    // Track question timing
    if (!questionTimings.current[questionId]) {
      questionTimings.current[questionId] = Date.now() - pageStartTime.current
    }
    // Notify parent
    window.parent?.postMessage({
      type: 'QUESTION_ANSWERED',
      questionId,
      questionIndex: currentPageIndex,
      timing: Date.now() - pageStartTime.current,
    }, '*')
  }, [currentPageIndex])

  const getNextPageId = useCallback(() => {
    if (!currentPage) return null
    const nextId = evaluatePageLogic(currentPage.logic, responses)
    if (nextId === '__end__') return '__end__'
    if (nextId) return nextId
    // Default: next sequential page
    if (currentPageIndex < pages.length - 1) return pages[currentPageIndex + 1].id
    return null
  }, [currentPage, currentPageIndex, pages, responses])

  const handleNext = useCallback(() => {
    // Validate required fields on current page
    if (currentPage) {
      const errors: Record<string, string> = {}
      for (const block of currentPage.blocks) {
        if (!isQuestionBlock(block.type)) continue
        const c = block.content as any
        if (!c.required) continue
        const qid = block.meta.questionId || block.id
        const val = responses[qid]
        if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
          errors[qid] = 'This field is required'
        }
      }
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors)
        return
      }
      setValidationErrors({})
    }

    // Record page timing
    pageTimings.current.push(Date.now() - pageStartTime.current)

    const nextId = getNextPageId()
    if (!nextId || nextId === '__end__') {
      // Survey complete
      const metrics: BehavioralMetrics = {
        mouseMovements: mouseData.current.slice(-100),
        keystrokeDynamics: keystrokeData.current.slice(-50),
        responseTime: pageTimings.current,
        questionTimings: questionTimings.current,
      }

      setIsCompleted(true)

      // Send completion message to parent (compatible with existing /s/[url] page)
      window.parent?.postMessage({
        type: 'SURVEY_COMPLETE',
        responses,
        behavioralMetrics: metrics,
      }, '*')

      onComplete?.(responses, metrics)
      return
    }

    const nextIndex = pages.findIndex(p => p.id === nextId)
    if (nextIndex >= 0) {
      setDirection(1)
      setCurrentPageIndex(nextIndex)
      pageStartTime.current = Date.now()
    }
  }, [getNextPageId, pages, responses, onComplete])

  const handleBack = useCallback(() => {
    if (!settings.allowBack || currentPageIndex <= 0) return
    setDirection(-1)
    setCurrentPageIndex(prev => prev - 1)
    pageStartTime.current = Date.now()
  }, [currentPageIndex, settings.allowBack])

  // Completed state
  if (isCompleted) {
    return (
      <div style={{
        minHeight: isPreview ? '100%' : '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: theme.backgroundColor,
        fontFamily: theme.fontFamily,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: theme.textColor, marginBottom: '12px' }}>
            Thank you!
          </h2>
          <p style={{ fontSize: '0.95rem', color: theme.textColor, opacity: 0.6 }}>
            Your response has been submitted successfully.
          </p>
        </div>
      </div>
    )
  }

  if (!currentPage) return null

  return (
    <div style={{
      minHeight: isPreview ? '100%' : '100vh',
      width: '100%',
      backgroundColor: theme.backgroundColor,
      fontFamily: theme.fontFamily,
      display: 'flex',
      flexDirection: 'column',
      color: theme.textColor,
      // Force light CSS vars for blocks that use var(--surbee-*)
      ['--surbee-fg-primary' as any]: theme.textColor || '#0a0a0a',
      ['--surbee-fg-secondary' as any]: theme.textColor ? `${theme.textColor}cc` : '#374151',
      ['--surbee-fg-muted' as any]: theme.textColor ? `${theme.textColor}80` : '#9ca3af',
      ['--surbee-bg-primary' as any]: theme.backgroundColor || '#ffffff',
      ['--surbee-border-primary' as any]: 'rgba(0,0,0,0.08)',
      ['--surbee-accent-primary' as any]: theme.primaryColor || '#2563eb',
    }}>
      {/* Logo */}
      {theme.logoUrl && (
        <div style={{
          padding: '16px 24px 0',
          display: 'flex',
          justifyContent: theme.logoPosition === 'top-center' ? 'center' : theme.logoPosition === 'top-right' ? 'flex-end' : 'flex-start',
          flexShrink: 0,
        }}>
          <img
            src={theme.logoUrl}
            alt="Survey logo"
            style={{ maxHeight: '48px', maxWidth: '160px', objectFit: 'contain' }}
          />
        </div>
      )}

      {/* Progress bar */}
      {settings.showProgress && (
        <div style={{ height: 3, backgroundColor: 'rgba(0,0,0,0.08)', flexShrink: 0 }}>
          <motion.div
            style={{ height: '100%', backgroundColor: theme.primaryColor }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Page content */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        overflow: 'auto',
      }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentPage.id}
            custom={direction}
            initial={currentPageIndex === 0 ? false : { opacity: 0, x: direction === 1 ? 60 : -60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction === 1 ? -60 : 60 }}
            transition={{ duration: 0.25 }}
            style={{
              width: '100%',
              maxWidth: 720,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Page title */}
            {currentPage.title && currentPage.title !== `Page ${currentPageIndex + 1}` && (
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: theme.textColor,
                marginBottom: '8px',
              }}>
                {currentPage.title}
              </h1>
            )}

            {/* Blocks — button blocks trigger navigation */}
            {currentPage.blocks.map((block) => {
              if (!evaluateBlockVisibility(block, responses)) return null

              // Button blocks are interactive in survey mode
              if (block.type === 'button') {
                const btnContent = block.content as ButtonContent
                return (
                  <SurveyButton
                    key={block.id}
                    content={btnContent}
                    theme={theme}
                    blockStyle={block.meta.style}
                    onNext={handleNext}
                    onBack={handleBack}
                  />
                )
              }

              return (
                <SurveyBlock
                  key={block.id}
                  block={block}
                  theme={theme}
                  responses={responses}
                  onResponse={handleResponse}
                  error={validationErrors[block.meta.questionId || block.id]}
                />
              )
            })}

            {/* Fallback: if no button block on this page, show auto Next/Submit */}
            {!currentPage.blocks.some(b => b.type === 'button') && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {settings.allowBack && currentPageIndex > 0 && (
                  <button
                    onClick={handleBack}
                    style={{
                      padding: '10px 24px', borderRadius: theme.borderRadius,
                      border: `1px solid ${theme.primaryColor}`, backgroundColor: 'transparent',
                      color: theme.primaryColor, fontSize: '0.9rem', fontWeight: 500,
                      cursor: 'pointer', fontFamily: theme.fontFamily,
                    }}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNext}
                  style={{
                    padding: '10px 32px', borderRadius: theme.borderRadius, border: 'none',
                    backgroundColor: theme.primaryColor, color: '#ffffff',
                    fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
                    fontFamily: theme.fontFamily, minWidth: 120,
                  }}
                >
                  {currentPageIndex < totalPages - 1 ? 'Next' : 'Submit'}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Powered by Surbee badge */}
      {!hideBranding && (
        <a
          href="https://surbee.dev"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'rgba(0,0,0,0.04)',
            border: '1px solid rgba(0,0,0,0.06)',
            color: 'rgba(0,0,0,0.4)',
            fontSize: '11px',
            fontFamily: 'Opening Hours Sans, system-ui, sans-serif',
            textDecoration: 'none',
            transition: 'all 0.15s',
            backdropFilter: 'blur(4px)',
            zIndex: 50,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.08)'
            e.currentTarget.style.color = 'rgba(0,0,0,0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.04)'
            e.currentTarget.style.color = 'rgba(0,0,0,0.4)'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Powered by Surbee
        </a>
      )}
    </div>
  )
}

// ---- Survey button (handles next/submit/url) ----

interface SurveyButtonProps {
  content: ButtonContent
  theme: SurveyTheme
  blockStyle?: BlockStyle
  onNext: () => void
  onBack: () => void
}

const RADIUS_MAP: Record<string, string> = { none: '0px', sm: '6px', md: '10px', lg: '16px', full: '9999px' }
const SIZE_MAP: Record<string, { padding: string; fontSize: string }> = {
  sm: { padding: '8px 20px', fontSize: '0.825rem' },
  md: { padding: '12px 32px', fontSize: '0.95rem' },
  lg: { padding: '16px 40px', fontSize: '1.05rem' },
}

const SurveyButton: React.FC<SurveyButtonProps> = ({ content, theme, blockStyle, onNext }) => {
  const handleClick = () => {
    if (content.action === 'url' && content.url) {
      window.open(content.url, '_blank')
    } else {
      onNext()
    }
  }

  const sizeStyle = SIZE_MAP[content.size || 'md'] || SIZE_MAP.md
  const borderRadius = RADIUS_MAP[content.radius || 'md'] || (theme.borderRadius || '10px')
  const bs = blockStyle || {}

  const getVariantStyle = (): React.CSSProperties => {
    switch (content.variant) {
      case 'primary': return { backgroundColor: theme.primaryColor, color: '#ffffff', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
      case 'secondary': return { backgroundColor: theme.secondaryColor, color: '#ffffff', border: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
      case 'outline': return { backgroundColor: 'transparent', color: theme.primaryColor, border: `1.5px solid ${theme.primaryColor}` }
      case 'ghost': return { backgroundColor: 'transparent', color: theme.primaryColor, border: 'none' }
      default: return { backgroundColor: theme.primaryColor, color: '#ffffff', border: 'none' }
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: content.align === 'center' ? 'center' : content.align === 'right' ? 'flex-end' : 'flex-start',
    }}>
      <button
        onClick={handleClick}
        style={{
          ...sizeStyle,
          borderRadius,
          fontWeight: bs.fontWeight || '500',
          cursor: 'pointer',
          fontFamily: bs.fontFamily || theme.fontFamily || 'inherit',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          letterSpacing: '0.01em',
          ...getVariantStyle(),
          ...(bs.fontSize ? { fontSize: bs.fontSize } : {}),
          ...(bs.color ? { color: bs.color } : {}),
        }}
      >
        {content.label}
      </button>
    </div>
  )
}

// ---- Individual block renderer for survey mode (respondent-facing) ----

interface SurveyBlockProps {
  block: Block
  theme: SurveyTheme
  responses: Record<string, unknown>
  onResponse: (blockId: string, questionId: string, value: unknown) => void
  error?: string
}

const SurveyBlock: React.FC<SurveyBlockProps> = ({ block, theme, responses, onResponse, error }) => {
  const questionId = block.meta.questionId || block.id
  const isQuestion = isQuestionBlock(block.type)

  // Apply block-level styles from meta.style
  const bs = block.meta.style || {}
  const blockStyles: React.CSSProperties = {
    ...(bs.padding ? { padding: bs.padding } : {}),
    ...(bs.fontSize ? { fontSize: bs.fontSize } : {}),
    ...(bs.fontFamily ? { fontFamily: bs.fontFamily } : {}),
    ...(bs.fontWeight ? { fontWeight: bs.fontWeight } : {}),
    ...(bs.color ? { color: bs.color } : {}),
    ...(bs.textAlign ? { textAlign: bs.textAlign as any } : {}),
    ...(bs.backgroundColor ? { backgroundColor: bs.backgroundColor } : {}),
  }

  // For layout blocks, render read-only
  if (!isQuestion) {
    const Component = BlockRegistry[block.type]
    if (!Component) return null
    return (
      <div data-block-id={block.id} style={blockStyles}>
        <Component
          block={block as any}
          isSelected={false}
          isFocused={false}
          isEditing={false}
          onContentChange={() => {}}
          onMetaChange={() => {}}
          onDelete={() => {}}
          onInsertAfter={() => {}}
          onFocus={() => {}}
          onBlur={() => {}}
          theme={theme}
        />
      </div>
    )
  }

  // For question blocks, render interactive respondent version
  const content = block.content as any
  const value = responses[questionId]

  return (
    <div
      data-block-id={block.id}
      data-question-id={questionId}
      data-question-type={block.type}
      data-required={content.required ? 'true' : 'false'}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        ...blockStyles,
      }}
    >
      {/* Label */}
      <div>
        <label style={{ fontSize: '1rem', fontWeight: 600, color: theme.textColor }}>
          {content.label}
          {content.required && <span style={{ color: '#ef4444', marginLeft: 4 }}>*</span>}
        </label>
        {content.description && (
          <p style={{ fontSize: '0.85rem', color: theme.textColor, opacity: 0.6, marginTop: 4 }}>
            {content.description}
          </p>
        )}
      </div>

      {/* Input */}
      <QuestionInput
        block={block}
        theme={theme}
        value={value}
        onChange={(val) => onResponse(block.id, questionId, val)}
      />

      {/* Validation error */}
      {error && (
        <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0 }}>{error}</p>
      )}
    </div>
  )
}

// ---- Question input components for respondent mode ----

interface QuestionInputProps {
  block: Block
  theme: SurveyTheme
  value: unknown
  onChange: (value: unknown) => void
}

const QuestionInput: React.FC<QuestionInputProps> = ({ block, theme, value, onChange }) => {
  const content = block.content as any
  const br = theme.borderRadius

  switch (block.type) {
    case 'text-input':
      return (
        <input
          type="text"
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={content.placeholder || 'Type your answer...'}
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: br, fontSize: '0.95rem', backgroundColor: 'transparent',
            color: theme.textColor, fontFamily: theme.fontFamily, outline: 'none',
          }}
        />
      )

    case 'textarea':
      return (
        <textarea
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={content.placeholder || 'Type your answer...'}
          rows={content.rows || 4}
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: br, fontSize: '0.95rem', backgroundColor: 'transparent',
            color: theme.textColor, fontFamily: theme.fontFamily, outline: 'none', resize: 'vertical',
          }}
        />
      )

    case 'radio':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {content.options?.map((opt: any) => (
            <label
              key={opt.id}
              onClick={() => onChange(opt.value)}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                borderRadius: br, border: value === opt.value ? `2px solid ${theme.primaryColor}` : '1px solid rgba(0,0,0,0.12)',
                backgroundColor: value === opt.value ? `${theme.primaryColor}10` : 'transparent',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%',
                border: value === opt.value ? `5px solid ${theme.primaryColor}` : '2px solid rgba(0,0,0,0.2)',
                flexShrink: 0, transition: 'all 0.15s',
              }} />
              <span style={{ fontSize: '0.9rem', color: theme.textColor }}>{opt.label}</span>
            </label>
          ))}
        </div>
      )

    case 'checkbox': {
      const selected = (value as string[]) || []
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {content.options?.map((opt: any) => {
            const isChecked = selected.includes(opt.value)
            return (
              <label
                key={opt.id}
                onClick={() => {
                  onChange(isChecked ? selected.filter((v: string) => v !== opt.value) : [...selected, opt.value])
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
                  borderRadius: br, border: isChecked ? `2px solid ${theme.primaryColor}` : '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: isChecked ? `${theme.primaryColor}10` : 'transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: '4px',
                  border: isChecked ? 'none' : '2px solid rgba(0,0,0,0.2)',
                  backgroundColor: isChecked ? theme.primaryColor : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.15s', color: '#fff', fontSize: '0.7rem',
                }}>
                  {isChecked && '✓'}
                </div>
                <span style={{ fontSize: '0.9rem', color: theme.textColor }}>{opt.label}</span>
              </label>
            )
          })}
        </div>
      )
    }

    case 'select':
      return (
        <select
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: br, fontSize: '0.95rem', backgroundColor: 'transparent',
            color: theme.textColor, fontFamily: theme.fontFamily,
          }}
        >
          <option value="">{content.placeholder || 'Select an option...'}</option>
          {content.options?.map((opt: any) => (
            <option key={opt.id} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      )

    case 'scale': {
      const count = (content.max || 5) - (content.min || 1) + 1
      return (
        <div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {Array.from({ length: count }, (_, i) => {
              const v = (content.min || 1) + i
              const isSelected = value === v
              return (
                <button
                  key={v}
                  onClick={() => onChange(v)}
                  style={{
                    width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: br, border: isSelected ? `2px solid ${theme.primaryColor}` : '1px solid rgba(0,0,0,0.12)',
                    backgroundColor: isSelected ? theme.primaryColor : 'transparent',
                    color: isSelected ? '#fff' : theme.textColor,
                    fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {v}
                </button>
              )
            })}
          </div>
          {(content.minLabel || content.maxLabel) && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: theme.textColor, opacity: 0.5 }}>
              <span>{content.minLabel}</span>
              <span>{content.maxLabel}</span>
            </div>
          )}
        </div>
      )
    }

    case 'nps': {
      return (
        <div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {Array.from({ length: 11 }, (_, i) => {
              const isSelected = value === i
              return (
                <button
                  key={i}
                  onClick={() => onChange(i)}
                  style={{
                    width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '6px', border: isSelected ? `2px solid ${theme.primaryColor}` : '1px solid rgba(0,0,0,0.12)',
                    backgroundColor: isSelected ? theme.primaryColor : 'transparent',
                    color: isSelected ? '#fff' : theme.textColor,
                    fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.15s',
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {i}
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '0.75rem', color: theme.textColor, opacity: 0.5 }}>
            <span>Not at all likely</span>
            <span>Extremely likely</span>
          </div>
        </div>
      )
    }

    case 'slider':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.5, minWidth: 24 }}>{content.min ?? 0}</span>
          <input
            type="range"
            min={content.min ?? 0}
            max={content.max ?? 100}
            step={content.step ?? 1}
            value={(value as number) ?? Math.round(((content.min ?? 0) + (content.max ?? 100)) / 2)}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ flex: 1, accentColor: theme.primaryColor }}
          />
          <span style={{ fontSize: '0.8rem', color: theme.textColor, opacity: 0.5, minWidth: 24, textAlign: 'right' }}>{content.max ?? 100}</span>
          {content.showValue && (
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: theme.primaryColor, minWidth: 32 }}>
              {(value as number) ?? Math.round(((content.min ?? 0) + (content.max ?? 100)) / 2)}
            </span>
          )}
        </div>
      )

    case 'yes-no':
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          {[content.yesLabel || 'Yes', content.noLabel || 'No'].map((label, i) => {
            const v = i === 0 ? 'yes' : 'no'
            const isSelected = value === v
            return (
              <button
                key={v}
                onClick={() => onChange(v)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: br,
                  border: isSelected ? `2px solid ${theme.primaryColor}` : '1px solid rgba(0,0,0,0.12)',
                  backgroundColor: isSelected ? theme.primaryColor : 'transparent',
                  color: isSelected ? '#fff' : theme.textColor,
                  fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: theme.fontFamily,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      )

    case 'date-picker':
      return (
        <input
          type={content.includeTime ? 'datetime-local' : 'date'}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: br, fontSize: '0.95rem', backgroundColor: 'transparent',
            color: theme.textColor, fontFamily: theme.fontFamily,
          }}
        />
      )

    default:
      // Fallback for other types - use the read-only block renderer
      const Component = BlockRegistry[block.type]
      if (Component) {
        return (
          <Component
            block={block as any}
            isSelected={false}
            isFocused={false}
            isEditing={false}
            onContentChange={() => {}}
            onMetaChange={() => {}}
            onDelete={() => {}}
            onInsertAfter={() => {}}
            onFocus={() => {}}
            onBlur={() => {}}
            theme={theme}
          />
        )
      }
      return null
  }
}
