import type { ComponentDescriptor, ValidationRules, AnalyticsConfig } from '@/lib/surbee/survey-types'

export type QuestionDescriptor = ComponentDescriptor

export interface ValidationError {
  questionId: string
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom'
  message: string
}

export interface MouseTrace { x: number; y: number; t: number; q?: string }
export interface KeystrokeEvent { key: string; downAt: number; upAt?: number; dwell?: number; q?: string }
export interface ScrollEventRec { y: number; t: number }
export interface FocusEventRec { type: 'focus' | 'blur' | 'visibilitychange'; t: number }
export interface DeviceFingerprint {
  userAgent: string
  platform?: string
  language?: string
  timezone?: string
  screen?: { w: number; h: number; dpr?: number; depth?: number }
  hardware?: { cores?: number; memory?: number }
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
}

export interface SurveyConfig {
  surveyId: string
  components: QuestionDescriptor[]
  validation: ValidationRules
  analytics: AnalyticsConfig
}

