"use client"
import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { useSurveyStore } from '../state/useSurveyStore'
import type { BehavioralMetrics, KeystrokeEvent, MouseTrace, ScrollEventRec, SuspiciousFlag, HoverEvent, CopyPasteEvent, DevToolsDetectionEvent } from '../types'
import { generateEnhancedFingerprint, detectDevTools, hashClipboardContent } from './fingerprint-utils'

interface BehaviorCtxValue {
  getSnapshot: () => BehavioralMetrics
  reset: () => void
}

const BehaviorCtx = createContext<BehaviorCtxValue | null>(null)

export interface BehaviorProviderProps extends PropsWithChildren {
  fraudEndpoint?: string // optional custom endpoint
  analyzeEveryMs?: number // default 10s
}

export function BehaviorProvider({ children, fraudEndpoint = '/api/surbee/fraud/assess', analyzeEveryMs = 10000 }: BehaviorProviderProps) {
  const currentQuestion = useSurveyStore((s) => s.components[s.currentQuestionIndex])
  const [metrics, setMetrics] = useState<BehavioralMetrics>(() => ({
    mouseMovements: [],
    keystrokeDynamics: [],
    scrollPattern: [],
    responseTime: [],
    focusEvents: [],
    deviceFingerprint: generateEnhancedFingerprint(),
    suspiciousFlags: [],
    pointerVelocityAvg: 0,
    pasteEvents: 0,
    keypressCount: 0,
    lastInputAt: Date.now(),
    // Enhanced tracking
    hoverEvents: [],
    copyPasteEvents: [],
    devToolsDetected: [],
    timeToFirstInteraction: {},
    mouseAcceleration: [],
    scrollVelocities: [],
    backspaceCount: 0,
    correctionCount: 0,
  }))

  const lastMouse = useRef<{ x: number; y: number; t: number; velocity: number } | null>(null)
  const lastKeyPress = useRef<number | null>(null)
  const hoverStart = useRef<{ element: string; startTime: number } | null>(null)
  const questionStartTime = useRef<Record<string, number>>({})
  const lastScroll = useRef<{ y: number; t: number } | null>(null)

  useEffect(() => {
    const q = currentQuestion?.id

    // Track time to first interaction per question
    if (q && !questionStartTime.current[q]) {
      questionStartTime.current[q] = Date.now()
    }

    const onMove = (e: MouseEvent) => {
      const t = Date.now()
      const target = (e.target as HTMLElement)?.id || (e.target as HTMLElement)?.className || ''

      // Calculate velocity
      let velocity = 0
      if (lastMouse.current) {
        const dt = Math.max(1, t - lastMouse.current.t)
        const dx = e.clientX - lastMouse.current.x
        const dy = e.clientY - lastMouse.current.y
        velocity = Math.sqrt(dx * dx + dy * dy) / dt

        // Calculate acceleration
        const acceleration = Math.abs(velocity - lastMouse.current.velocity)

        setMetrics((m) => ({
          ...m,
          pointerVelocityAvg: mavg(m.pointerVelocityAvg || 0, velocity, 0.05),
          mouseAcceleration: pushBounded(m.mouseAcceleration || [], acceleration, 1000),
        }))
      }

      const point: MouseTrace = { x: e.clientX, y: e.clientY, t, q, velocity, target }

      setMetrics((m) => ({
        ...m,
        mouseMovements: pushBounded(m.mouseMovements, point, 2000),
        lastInputAt: t,
        timeToFirstInteraction: q && !m.timeToFirstInteraction?.[q]
          ? { ...m.timeToFirstInteraction, [q]: t - (questionStartTime.current[q] || t) }
          : m.timeToFirstInteraction,
      }))

      lastMouse.current = { x: e.clientX, y: e.clientY, t, velocity }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const t = Date.now()

      // Track backspace and corrections
      const isBackspace = e.key === 'Backspace' || e.key === 'Delete'
      const isCorrection = isBackspace || e.key === 'ArrowLeft' || e.key === 'ArrowRight'

      // Calculate flight time (time between keystrokes)
      const flightTime = lastKeyPress.current ? t - lastKeyPress.current : undefined
      lastKeyPress.current = t

      const k: KeystrokeEvent = { key: e.key, downAt: t, q, flightTime }

      setMetrics((m) => ({
        ...m,
        keystrokeDynamics: pushBounded(m.keystrokeDynamics, k, 2000),
        keypressCount: (m.keypressCount || 0) + 1,
        backspaceCount: isBackspace ? (m.backspaceCount || 0) + 1 : m.backspaceCount,
        correctionCount: isCorrection ? (m.correctionCount || 0) + 1 : m.correctionCount,
        lastInputAt: t,
        timeToFirstInteraction: q && !m.timeToFirstInteraction?.[q]
          ? { ...m.timeToFirstInteraction, [q]: t - (questionStartTime.current[q] || t) }
          : m.timeToFirstInteraction,
      }))
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const t = Date.now()
      setMetrics((m) => ({
        ...m,
        keystrokeDynamics: m.keystrokeDynamics.map((evt) =>
          evt.key === e.key && !evt.upAt ? { ...evt, upAt: t, dwell: t - evt.downAt } : evt
        ),
        lastInputAt: t,
      }))
    }

    const onCopy = async (e: ClipboardEvent) => {
      const t = Date.now()
      const text = e.clipboardData?.getData('text') || ''
      const contentHash = hashClipboardContent(text)

      const copyEvent: CopyPasteEvent = {
        type: 'copy',
        timestamp: t,
        questionId: q,
        contentHash,
        textLength: text.length,
      }

      setMetrics((m) => ({
        ...m,
        copyPasteEvents: [...(m.copyPasteEvents || []), copyEvent],
        lastInputAt: t,
      }))
    }

    const onPaste = async (e: ClipboardEvent) => {
      const t = Date.now()
      const text = e.clipboardData?.getData('text') || ''
      const contentHash = hashClipboardContent(text)

      const pasteEvent: CopyPasteEvent = {
        type: 'paste',
        timestamp: t,
        questionId: q,
        contentHash,
        textLength: text.length,
      }

      setMetrics((m) => ({
        ...m,
        pasteEvents: (m.pasteEvents || 0) + 1,
        copyPasteEvents: [...(m.copyPasteEvents || []), pasteEvent],
        lastInputAt: t,
        timeToFirstInteraction: q && !m.timeToFirstInteraction?.[q]
          ? { ...m.timeToFirstInteraction, [q]: t - (questionStartTime.current[q] || t) }
          : m.timeToFirstInteraction,
      }))
    }
    const onScroll = () => {
      const t = Date.now()
      const y = window.scrollY
      const pageHeight = document.documentElement.scrollHeight
      const viewportHeight = window.innerHeight

      // Calculate scroll velocity
      let velocity = 0
      if (lastScroll.current) {
        const dt = Math.max(1, t - lastScroll.current.t)
        const dy = y - lastScroll.current.y
        velocity = Math.abs(dy) / dt
      }

      const scrollEvent: ScrollEventRec = {
        y,
        t,
        velocity,
        pageHeight,
        viewportHeight,
      }

      setMetrics((m) => ({
        ...m,
        scrollPattern: pushBounded(m.scrollPattern, scrollEvent, 1000),
        scrollVelocities: pushBounded(m.scrollVelocities || [], velocity, 1000),
        lastInputAt: t,
      }))

      lastScroll.current = { y, t }
    }

    const onMouseOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)
      const element = target.id || target.className || target.tagName
      hoverStart.current = { element, startTime: Date.now() }
    }

    const onMouseOut = (e: MouseEvent) => {
      if (hoverStart.current) {
        const target = (e.target as HTMLElement)
        const element = target.id || target.className || target.tagName

        if (hoverStart.current.element === element) {
          const hoverEvent: HoverEvent = {
            element,
            startTime: hoverStart.current.startTime,
            endTime: Date.now(),
            questionId: q,
          }

          setMetrics((m) => ({
            ...m,
            hoverEvents: pushBounded(m.hoverEvents || [], hoverEvent, 500),
          }))

          hoverStart.current = null
        }
      }
    }

    const onFocus = () => setMetrics((m) => ({ ...m, focusEvents: [...m.focusEvents, { type: 'focus', t: Date.now() }] }))
    const onBlur = () => setMetrics((m) => ({ ...m, focusEvents: [...m.focusEvents, { type: 'blur', t: Date.now() }] }))
    const onVisibility = () => setMetrics((m) => ({ ...m, focusEvents: [...m.focusEvents, { type: 'visibilitychange', t: Date.now() }] }))

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onMouseOver)
    document.addEventListener('mouseout', onMouseOut)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('copy', onCopy as any)
    document.addEventListener('paste', onPaste as any)
    document.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onMouseOver)
      document.removeEventListener('mouseout', onMouseOut)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('copy', onCopy as any)
      document.removeEventListener('paste', onPaste as any)
      document.removeEventListener('scroll', onScroll as any)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [currentQuestion?.id])

  // Periodic DevTools detection
  useEffect(() => {
    const checkDevTools = () => {
      const detected = detectDevTools()
      if (detected) {
        const devToolsEvent: DevToolsDetectionEvent = {
          detected: true,
          timestamp: Date.now(),
          method: 'devtools-open',
        }
        setMetrics((m) => ({
          ...m,
          devToolsDetected: [...(m.devToolsDetected || []), devToolsEvent],
        }))
      }
    }

    // Check every 2 seconds
    const intervalId = setInterval(checkDevTools, 2000)
    return () => clearInterval(intervalId)
  }, [])

  // periodic analysis (client → API)
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const res = await fetch(fraudEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ip: undefined,
            userAgent: metrics.deviceFingerprint.userAgent,
            responseTimeMs: metrics.responseTime.reduce((a, b) => a + b, 0),
            pointerVelocityAvg: metrics.pointerVelocityAvg,
            pasteEvents: metrics.pasteEvents,
            duplicateResponsesWindowMin: 10,
          }),
        })
        if (!res.ok) return
        const data = await res.json()
        const prob = typeof data.riskScore === 'number' ? data.riskScore / 100 : 0
        const suspiciousFlags: SuspiciousFlag[] = data.reasons?.map((r: string) => ({ code: r, message: r, weight: 0.1 })) || []
        setMetrics((m) => ({ ...m, suspiciousFlags, suspicionScore: prob }))
      } catch {}
    }, analyzeEveryMs)
    return () => clearInterval(id)
  }, [metrics.deviceFingerprint.userAgent, metrics.pointerVelocityAvg, metrics.pasteEvents, metrics.responseTime, analyzeEveryMs, fraudEndpoint])

  const value = useMemo<BehaviorCtxValue>(() => ({
    getSnapshot: () => metrics,
    reset: () => setMetrics((m) => ({
      ...m,
      mouseMovements: [],
      keystrokeDynamics: [],
      scrollPattern: [],
      suspiciousFlags: [],
      responseTime: [],
      hoverEvents: [],
      copyPasteEvents: [],
      mouseAcceleration: [],
      scrollVelocities: [],
      backspaceCount: 0,
      correctionCount: 0,
    })),
  }), [metrics])

  return <BehaviorCtx.Provider value={value}>{children}</BehaviorCtx.Provider>
}

export function useBehavior() {
  const ctx = useContext(BehaviorCtx)
  if (!ctx) throw new Error('useBehavior must be used within BehaviorProvider')
  return ctx
}

function mavg(current: number, value: number, alpha = 0.1) {
  return current * (1 - alpha) + value * alpha
}

function pushBounded<T>(arr: T[], item: T, max = 1000): T[] {
  const out = arr.length >= max ? arr.slice(arr.length - max + 1) : arr.slice()
  out.push(item)
  return out
}

