import type { ComponentDescriptor, ValidationRules, AnalyticsConfig } from '@/lib/surbee/survey-types'

export type QuestionDescriptor = ComponentDescriptor

export interface ValidationError {
  questionId: string
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  message: string
}

export interface MouseTrace { x: number; y: number; t: number; q?: string; velocity?: number; target?: string }
export interface KeystrokeEvent { key: string; downAt: number; upAt?: number; dwell?: number; q?: string; flightTime?: number }
export interface ScrollEventRec { y: number; t: number; velocity?: number; pageHeight?: number; viewportHeight?: number }
export interface FocusEventRec { type: 'focus' | 'blur' | 'visibilitychange'; t: number }

export interface HoverEvent {
  element: string // element ID or class
  startTime: number
  endTime?: number
  questionId?: string
}

export interface CopyPasteEvent {
  type: 'copy' | 'paste'
  timestamp: number
  questionId?: string
  contentHash?: string // hash of clipboard content
  textLength?: number
}

export interface DevToolsDetectionEvent {
  detected: boolean
  timestamp: number
  method: 'devtools-open' | 'devtools-orientation-change' | 'debugger-statement'
}

export interface DeviceFingerprint {
  userAgent: string
  platform?: string
  language?: string
  timezone?: string
  screen?: { w: number; h: number; dpr?: number; depth?: number }
  hardware?: { cores?: number; memory?: number }
  // Enhanced automation detection
  webDriver?: boolean
  automation?: boolean
  plugins?: string[]
  canvasFingerprint?: string
  webglFingerprint?: string
  fonts?: string[]
  // Touch support detection
  touchSupport?: boolean
  maxTouchPoints?: number
}

export interface SuspiciousFlag { code: string; message: string; weight: number }

export interface BehavioralMetrics {
  mouseMovements: MouseTrace[]
  keystrokeDynamics: KeystrokeEvent[]
  scrollPattern: ScrollEventRec[]
  responseTime: number[]
  focusEvents: FocusEventRec[]
  deviceFingerprint: DeviceFingerprint
  suspiciousFlags: SuspiciousFlag[]
  suspicionScore?: number
  pointerVelocityAvg?: number
  pasteEvents?: number
  keypressCount?: number
  lastInputAt?: number
  // Enhanced tracking
  hoverEvents?: HoverEvent[]
  copyPasteEvents?: CopyPasteEvent[]
  devToolsDetected?: DevToolsDetectionEvent[]
  timeToFirstInteraction?: Record<string, number> // questionId -> time
  mouseAcceleration?: number[]
  scrollVelocities?: number[]
  backspaceCount?: number
  correctionCount?: number
}

export interface SurveyConfig {
  surveyId: string
  components: QuestionDescriptor[]
  validation: ValidationRules
  analytics: AnalyticsConfig
}

