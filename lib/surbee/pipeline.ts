import { z } from 'zod'
import { AIService } from './ai-service'
import { generateStyle } from './dna-engine'
import type { DNAMix } from './types'
import type {
  SurveyGenerationRequest,
  GeneratedSurvey,
  ComponentDescriptor,
  AnalyticsConfig,
  DesignTheme,
  ValidationRules,
  SurveyMetadata,
} from './survey-types'

export const SurveyGenerationSchema = z.object({
  userPrompt: z.string().min(4),
  userId: z.string(),
  contextData: z
    .object({
      industry: z.string().optional(),
      targetAudience: z.string().optional(),
      surveyType: z
        .enum(['marketing', 'research', 'feedback', 'academic'])
        .optional(),
      brandColors: z.array(z.string()).optional(),
    })
    .optional(),
})

export async function runSurveyGenerationPipeline(
  input: SurveyGenerationRequest & { projectId?: string; conversationId?: string },
): Promise<GeneratedSurvey> {
  const { userPrompt, userId, contextData } = SurveyGenerationSchema.parse(input)

  // 1) Intent Analysis + DNA mix via AI service
  const ai = await AIService.generateSurvey({
    description: userPrompt,
    userId,
    projectId: input.projectId || `project-${Date.now()}`,
    conversationId: input.conversationId,
  })

  // 2) Design theme derived from DNA mix
  const theme: DesignTheme = {
    colorPalette: deriveColorPalette(ai.dnaMix, contextData?.brandColors),
    typography: {
      fontFamily: deriveFont(ai.dnaMix),
      baseSize: 16,
      scale: 1.2,
    },
    spacingScale: [0, 4, 8, 12, 16, 20, 24],
  }

  // 3) Components: convert AI atoms (ui-agnostic)
  const components: ComponentDescriptor[] = ai.surveyAtoms.map((atom) => ({
    id: atom.id,
    type: normalizeType(atom.type),
    label: atom.content,
    placeholder: atom.placeholder,
    options: atom.options,
    required: atom.required,
    style: atom.style,
    analytics: { track: true, position: atom.position },
    aria: { 'aria-label': atom.content },
    dataAttributes: {
      'data-analytics-component': atom.type,
      'data-position': atom.position,
    },
    validation: inferValidation(atom.type, atom.required),
  }))

  // 4) Validation Rules
  const validation: ValidationRules = {
    global: { requireAll: false },
    perComponent: Object.fromEntries(
      components.map((c) => [c.id, c.validation || {}]),
    ),
  }

  // 5) Analytics config (Mixpanel/PostHog keys resolved at runtime via env)
  const analytics: AnalyticsConfig = {
    providerKeys: {
      mixpanel: process.env.NEXT_PUBLIC_MIXPANEL_KEY || undefined,
      posthog: process.env.NEXT_PUBLIC_POSTHOG_KEY || undefined,
    },
    events: [
      {
        name: 'survey_rendered',
        when: 'mount',
        properties: { version: 'v1', ai: true },
      },
      {
        name: 'survey_completed',
        when: 'submit',
        properties: { ai: true },
      },
    ],
  }

  // 6) Metadata
  const metadata: SurveyMetadata = {
    intent: input.userPrompt,
    targetAudience: contextData?.targetAudience,
    surveyType: contextData?.surveyType,
    tone: deriveTone(ai.dnaMix),
    complexity: deriveComplexity(ai.dnaMix),
    rationale: ai.rationale,
  }

  return {
    id: ai.projectId,
    components,
    theme,
    validation,
    analytics,
    metadata,
  }
}

function deriveColorPalette(dna: DNAMix, brand?: string[]): string[] {
  const style = generateStyle(dna)
  const base = [
    style.palette.primary,
    style.palette.secondary,
    style.palette.background,
    style.palette.text,
  ]
  return brand && brand.length ? Array.from(new Set([...brand, ...base])) : base
}

function deriveFont(dna: DNAMix): 'sans' | 'serif' | 'mono' {
  const style = generateStyle(dna)
  return style.font
}

function deriveTone(dna: DNAMix): 'formal' | 'casual' | 'neutral' {
  // Simple heuristic
  if (dna.Academic + dna.Corporate >= 120) return 'formal'
  if (dna.Playful + dna.TypeformPro >= 120) return 'casual'
  return 'neutral'
}

function deriveComplexity(dna: DNAMix): 'simple' | 'moderate' | 'advanced' {
  const total = dna.TypeformPro + dna.Playful
  if (total >= 130) return 'advanced'
  if (total >= 80) return 'moderate'
  return 'simple'
}

function normalizeType(
  t: string,
): ComponentDescriptor['type'] {
  switch (t) {
    case 'text-input':
    case 'rating':
    case 'multiple-choice':
    case 'slider':
    case 'textarea':
    case 'yes-no':
      return t
    default:
      return 'text-input'
  }
}

function inferValidation(
  t: ComponentDescriptor['type'],
  required?: boolean,
): ComponentDescriptor['validation'] {
  const base = required ? { minLength: 1 } : {}
  if (t === 'rating' || t === 'slider') return { ...base, min: 1, max: 5 }
  if (t === 'text-input' || t === 'textarea') return { ...base, maxLength: 500 }
  return base
}

