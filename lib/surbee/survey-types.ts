import type { AtomStyle } from './types'

// Request coming from the builder/backend to generate a survey
export interface SurveyGenerationRequest {
  userPrompt: string
  userId: string
  contextData?: {
    industry?: string
    targetAudience?: string
    surveyType?: 'marketing' | 'research' | 'feedback' | 'academic'
    brandColors?: string[]
  }
}

// A minimal, UI-agnostic component descriptor the builder can render
export interface ComponentDescriptor {
  id: string
  type:
    | 'text-input'
    | 'rating'
    | 'multiple-choice'
    | 'slider'
    | 'textarea'
    | 'yes-no'
  label: string
  placeholder?: string
  options?: string[]
  required?: boolean
  analytics?: Record<string, string | number | boolean>
  style?: AtomStyle
  aria?: Record<string, string>
  dataAttributes?: Record<string, string | number | boolean>
  validation?: {
    minLength?: number
    maxLength?: number
    min?: number
    max?: number
    pattern?: string
  }
}

export interface DesignTheme {
  colorPalette: string[]
  typography: {
    fontFamily: 'sans' | 'serif' | 'mono'
    baseSize: number
    scale: number
  }
  spacingScale: number[]
}

export interface ValidationRules {
  global?: {
    requireAll?: boolean
  }
  perComponent?: Record<string, ComponentDescriptor['validation']>
}

export interface AnalyticsConfig {
  providerKeys?: {
    mixpanel?: string
    posthog?: string
  }
  events?: Array<{
    name: string
    when: 'mount' | 'blur' | 'submit' | 'change'
    properties?: Record<string, string | number | boolean>
  }>
}

export interface SurveyMetadata {
  intent: string
  targetAudience?: string
  surveyType?: 'marketing' | 'research' | 'feedback' | 'academic'
  tone?: 'formal' | 'casual' | 'neutral'
  complexity?: 'simple' | 'moderate' | 'advanced'
  rationale?: string
}

export interface GeneratedSurvey {
  id: string
  components: ComponentDescriptor[]
  theme: DesignTheme
  validation: ValidationRules
  analytics: AnalyticsConfig
  metadata: SurveyMetadata
}

