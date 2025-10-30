"use client"
import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react'
import { useSurveyStore } from '../state/useSurveyStore'
import type { BehavioralMetrics, DeviceFingerprint, KeystrokeEvent, MouseTrace, ScrollEventRec, SuspiciousFlag } from '../types'

interface BehaviorCtxValue {
  getSnapshot: () => BehavioralMetrics
  reset: () => void
}

const BehaviorCtx = createContext<BehaviorCtxValue | null>(null)

export interface BehaviorProviderProps extends PropsWithChildren {
  fraudEndpoint?: string // optional custom endpoint
  analyzeEveryMs?: number // default 10s
  suspicionThreshold?: number // default 0.5
}

export function BehaviorProvider({ children, fraudEndpoint = '/api/surbee/fraud/assess', analyzeEveryMs = 10000, suspicionThreshold = 0.5 }: BehaviorProviderProps) {
  const currentQuestion = useSurveyStore((s) => s.components[s.currentQuestionIndex])
  const [metrics, setMetrics] = useState<BehavioralMetrics>(() => ({
    mouseMovements: [],
    keystrokeDynamics: [],
    scrollPattern: [],
    responseTime: [],
    focusEvents: [],
    deviceFingerprint: makeFingerprint(),
    suspiciousFlags: [],
    pointerVelocityAvg: 0,
    pasteEvents: 0,
    keypressCount: 0,
    lastInputAt: Date.now(),
  }))

  const lastMouse = useRef<{ x: number; y: number; t: number } | null>(null)

  useEffect(() => {
    const q = currentQuestion?.id
    const onMove = (e: MouseEvent) => {
      const t = Date.now()
      const point = { x: e.clientX, y: e.clientY, t, q }
      setMetrics((m) => ({ ...m, mouseMovements: pushBounded(m.mouseMovements, point, 2000), lastInputAt: t }))
      if (lastMouse.current) {
        const dt = Math.max(1, t - lastMouse.current.t)
        const dx = e.clientX - lastMouse.current.x
        const dy = e.clientY - lastMouse.current.y
        const v = Math.sqrt(dx * dx + dy * dy) / dt
        const avg = mavg(metrics.pointerVelocityAvg || 0, v, 0.05)
        setMetrics((m) => ({ ...m, pointerVelocityAvg: avg }))
      }
      lastMouse.current = { x: e.clientX, y: e.clientY, t }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      const t = Date.now()
      const k: KeystrokeEvent = { key: e.key, downAt: t, q }
      setMetrics((m) => ({ ...m, keystrokeDynamics: pushBounded(m.keystrokeDynamics, k, 2000), keypressCount: (m.keypressCount || 0) + 1, lastInputAt: t }))
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const t = Date.now()
      setMetrics((m) => ({
        ...m,
        keystrokeDynamics: m.keystrokeDynamics.map((evt) => evt.key === e.key && !evt.upAt ? { ...evt, upAt: t, dwell: t - evt.downAt } : evt),
        lastInputAt: t,
      }))
    }
    const onPaste = () => setMetrics((m) => ({ ...m, pasteEvents: (m.pasteEvents || 0) + 1, lastInputAt: Date.now() }))
    const onScroll = () => setMetrics((m) => ({ ...m, scrollPattern: pushBounded(m.scrollPattern, { y: window.scrollY, t: Date.now() } as ScrollEventRec, 1000) }))
    const onFocus = () => setMetrics((m) => ({ ...m, focusEvents: [...m.focusEvents, { type: 'focus', t: Date.now() }]}))
    const onBlur = () => setMetrics((m) => ({ ...m, focusEvents: [...m.focusEvents, { type: 'blur', t: Date.now() }]}))
    const onVisibility = () => setMetrics((m) => ({ ...m, focusEvents: [...m.focusEvents, { type: 'visibilitychange', t: Date.now() }]}))

    document.addEventListener('mousemove', onMove)
    document.addEventListener('keydown', onKeyDown)
    document.addEventListener('keyup', onKeyUp)
    document.addEventListener('paste', onPaste)
    document.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('focus', onFocus)
    window.addEventListener('blur', onBlur)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('keydown', onKeyDown)
      document.removeEventListener('keyup', onKeyUp)
      document.removeEventListener('paste', onPaste)
      document.removeEventListener('scroll', onScroll as any)
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('blur', onBlur)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [currentQuestion?.id])

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
    reset: () => setMetrics((m) => ({ ...m, mouseMovements: [], keystrokeDynamics: [], scrollPattern: [], suspiciousFlags: [], responseTime: [] })),
  }), [metrics])

  return <BehaviorCtx.Provider value={value}>{children}</BehaviorCtx.Provider>
}

export function useBehavior() {
  const ctx = useContext(BehaviorCtx)
  if (!ctx) throw new Error('useBehavior must be used within BehaviorProvider')
  return ctx
}

function makeFingerprint(): DeviceFingerprint {
  if (typeof window === 'undefined') return { userAgent: 'ssr' }
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: { w: window.screen.width, h: window.screen.height, dpr: window.devicePixelRatio, depth: (window.screen as any).colorDepth },
    hardware: { cores: (navigator as any).hardwareConcurrency, memory: (navigator as any).deviceMemory },
  }
}

function mavg(current: number, value: number, alpha = 0.1) {
  return current * (1 - alpha) + value * alpha
}

function pushBounded<T>(arr: T[], item: T, max = 1000): T[] {
  const out = arr.length >= max ? arr.slice(arr.length - max + 1) : arr.slice()
  out.push(item)
  return out
}

