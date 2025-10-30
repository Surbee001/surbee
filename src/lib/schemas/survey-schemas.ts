import { z } from 'zod'

// Core survey component schema
export const SurveyComponentSchema = z.object({
  id: z.string(),
  type: z.enum([
    'text-input', 'textarea', 'select', 'multiselect', 'radio', 'checkbox',
    'scale', 'matrix', 'ranking', 'file-upload', 'date-picker', 'time-picker',
    'slider', 'yes-no', 'likert', 'nps', 'semantic-differential', 'image-choice',
    'video-response', 'signature', 'location', 'custom'
  ]),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().default(false),
  position: z.number(),
  pageId: z.string(),
  
  // Component-specific properties
  props: z.record(z.any()).optional(),
  
  // Validation rules
  validation: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z.array(z.string()).optional(),
    customValidator: z.string().optional(), // JS function string
  }).optional(),
  
  // Styling and theming
  style: z.object({
    spacing: z.number().default(8),
    radius: z.number().default(6),
    shadow: z.enum(['none', 'sm', 'md', 'lg']).default('sm'),
    palette: z.object({
      primary: z.string().default('#171717'),
      secondary: z.string().default('#8a8a8a'),
      background: z.string().default('#ffffff'),
      text: z.string().default('#171717'),
      error: z.string().default('#ef4444'),
      success: z.string().default('#10b981'),
    }),
    font: z.enum(['sans', 'serif', 'mono']).default('sans'),
    size: z.enum(['sm', 'md', 'lg']).default('md'),
  }).optional(),
  
  // Analytics and behavior tracking
  analytics: z.object({
    trackViews: z.boolean().default(true),
    trackInteractions: z.boolean().default(true),
    trackTimings: z.boolean().default(true),
    customEvents: z.array(z.string()).default([]),
  }).optional(),
  
  // Accessibility
  accessibility: z.object({
    ariaLabel: z.string().optional(),
    ariaDescription: z.string().optional(),
    tabIndex: z.number().optional(),
    role: z.string().optional(),
  }).optional(),
  
  // Generated component code
  code: z.string().optional(), // TSX component code
})

// Survey page schema
export const SurveyPageSchema = z.object({
  id: z.string(),
  name: z.string(),
  title: z.string(),
  description: z.string().optional(),
  position: z.number(),
  components: z.array(SurveyComponentSchema),
  
  // Page-level styling
  style: z.object({
    layout: z.enum(['single-column', 'two-column', 'grid']).default('single-column'),
    maxWidth: z.string().default('600px'),
    padding: z.string().default('2rem'),
    background: z.string().default('#ffffff'),
    backgroundImage: z.string().optional(),
  }).optional(),
  
  // Page logic and branching
  logic: z.object({
    conditions: z.array(z.object({
      id: z.string(),
      field: z.string(), // component ID
      operator: z.enum(['equals', 'not_equals', 'contains', 'greater_than', 'less_than', 'in', 'not_in']),
      value: z.any(),
      action: z.enum(['show', 'hide', 'skip_to', 'end_survey']),
      target: z.string().optional(), // page ID or component ID
    })).default([]),
    skipLogic: z.array(z.object({
      id: z.string(),
      condition: z.string(), // JS expression
      targetPageId: z.string(),
    })).default([]),
  }).optional(),
})

// Complete survey schema
export const SurveySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  pages: z.array(SurveyPageSchema),
  
  // Global survey settings
  settings: z.object({
    allowBack: z.boolean().default(true),
    showProgress: z.boolean().default(true),
    randomizeQuestions: z.boolean().default(false),
    timeLimit: z.number().optional(), // seconds
    responseLimit: z.number().optional(),
    requireAuth: z.boolean().default(false),
    collectBehavioralData: z.boolean().default(true),
  }).optional(),
  
  // Global theme
  theme: z.object({
    primaryColor: z.string().default('#171717'),
    secondaryColor: z.string().default('#8a8a8a'),
    backgroundColor: z.string().default('#ffffff'),
    textColor: z.string().default('#171717'),
    fontFamily: z.string().default('Inter, sans-serif'),
    borderRadius: z.number().default(8),
    spacing: z.number().default(16),
    animations: z.boolean().default(true),
  }).optional(),
  
  // Analytics configuration
  analytics: z.object({
    trackPageViews: z.boolean().default(true),
    trackInteractions: z.boolean().default(true),
    trackTimings: z.boolean().default(true),
    heatmaps: z.boolean().default(false),
    accuracyChecks: z.array(z.object({
      type: z.enum(['attention_check', 'consistency_check', 'speed_check']),
      threshold: z.number(),
      action: z.enum(['flag', 'discard', 'weight']),
    })).default([]),
  }).optional(),
  
  // Metadata
  metadata: z.object({
    createdAt: z.date(),
    updatedAt: z.date(),
    creatorId: z.string(),
    version: z.string().default('1.0'),
    generatedBy: z.string().optional(), // AI model used
    originalPrompt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    industry: z.string().optional(),
    targetAudience: z.string().optional(),
    estimatedDuration: z.number().optional(), // minutes
  }),
})

// AI generation output schema
export const AIGenerationOutputSchema = z.object({
  survey: SurveySchema,
  
  // Generated components with code
  components: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    code: z.string(), // Complete TSX component code
    props: z.record(z.any()).optional(),
    dependencies: z.array(z.string()).default([]), // Allowed: react, lucide-react
  })),
  
  // Design system
  designSystem: z.object({
    colors: z.record(z.string()),
    typography: z.object({
      fontSizes: z.record(z.string()),
      fontWeights: z.record(z.number()),
      lineHeights: z.record(z.string()),
    }),
    spacing: z.record(z.string()),
    borderRadius: z.record(z.string()),
    shadows: z.record(z.string()),
  }),
  
  // Validation rules
  validationRules: z.object({
    global: z.record(z.any()),
    perComponent: z.record(z.object({
      rules: z.array(z.string()),
      errorMessages: z.record(z.string()),
    })),
  }),
  
  // Analytics configuration
  analyticsConfig: z.object({
    events: z.array(z.object({
      name: z.string(),
      trigger: z.string(),
      data: z.record(z.any()),
    })),
    accuracyChecks: z.array(z.object({
      type: z.string(),
      componentId: z.string(),
      threshold: z.number(),
      action: z.string(),
    })),
  }),
  
  // Follow-up suggestions
  followUpSuggestions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    action: z.enum(['add_question', 'modify_design', 'add_logic', 'improve_accessibility']),
    priority: z.enum(['low', 'medium', 'high']),
  })).optional(),
})

// Thinking process schema for SSE
export const ThinkingStepSchema = z.object({
  step: z.string(),
  reasoning: z.string(),
  action: z.enum(['analyze', 'design', 'generate', 'validate', 'optimize']).optional(),
  confidence: z.number().min(0).max(1).optional(),
})

export const EditActionSchema = z.object({
  type: z.enum(['style', 'content', 'structure', 'logic']),
  target: z.string(), // CSS selector or component ID
  changes: z.record(z.any()),
  description: z.string(),
})

export const ThinkingProcessSchema = z.object({
  thinking: z.array(ThinkingStepSchema),
  edits: z.array(EditActionSchema),
  guidance: z.string().optional(),
})

// Export types
export type SurveyComponent = z.infer<typeof SurveyComponentSchema>
export type SurveyPage = z.infer<typeof SurveyPageSchema>
export type Survey = z.infer<typeof SurveySchema>
export type AIGenerationOutput = z.infer<typeof AIGenerationOutputSchema>
export type ThinkingStep = z.infer<typeof ThinkingStepSchema>
export type EditAction = z.infer<typeof EditActionSchema>
export type ThinkingProcess = z.infer<typeof ThinkingProcessSchema>
