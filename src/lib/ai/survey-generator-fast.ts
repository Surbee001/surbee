import OpenAI from 'openai'
import { AIGenerationOutput, AIGenerationOutputSchema } from '@/lib/schemas/survey-schemas'

export interface FastGenerationInput {
  prompt: string
  context?: {
    surveyType?: 'marketing' | 'research' | 'feedback' | 'academic'
    targetAudience?: string
    industry?: string
    complexity?: 'simple' | 'professional' | 'research' | 'academic'
    designStyle?: 'minimal' | 'modern' | 'corporate' | 'creative'
    length?: 'short' | 'medium' | 'long'
  }
  userId: string
}

export async function generateSurveyComponentsFast({ prompt, context, userId }: FastGenerationInput): Promise<AIGenerationOutput> {
  const apiKey = process.env.OPENAI_API_KEY
  console.log('=== ENHANCED GENERATOR CALLED ===')
  console.log('Prompt:', prompt)
  console.log('Context:', context)
  console.log('User ID:', userId)
  console.log('API Key present:', !!apiKey)
  
  if (!apiKey) {
    console.log('No OpenAI API key, using enhanced fallback')
    return createEnhancedFallbackSurvey(prompt, context, userId)
  }
  
  // Determine complexity and model based on survey type
  const complexity = determineComplexity(prompt, context)
  const modelConfig = getModelForComplexity(complexity)
  
  try {
    const openai = new OpenAI({ apiKey })
    
    // Enhanced AI call with adaptive complexity
    const system = getSystemPromptForComplexity(complexity, context)

    const userContent = `Create a professional survey for: ${prompt}
${context?.surveyType ? `Survey type: ${context.surveyType}` : ''}
${context?.targetAudience ? `Target audience: ${context.targetAudience}` : ''}
${context?.industry ? `Industry: ${context.industry}` : ''}

Make it practical and immediately usable. Focus on getting good feedback rather than perfect methodology.`

    const completion = await openai.chat.completions.create({
      model: modelConfig.model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent }
      ],
      response_format: { type: 'json_object' },
      temperature: modelConfig.temperature,
      max_tokens: modelConfig.maxTokens,
    })

    const text = completion.choices[0]?.message?.content || '{}'
    console.log('=== RAW AI RESPONSE ===', text)
    let result: AIGenerationOutput | null = null

    try {
      const parsed = JSON.parse(text)
      console.log('=== PARSED AI RESPONSE ===', JSON.stringify(parsed, null, 2))
      
      // Basic shape checks and normalization (avoid zod runtime in route)
      if (!parsed || typeof parsed !== 'object' || !parsed.survey) {
        console.error('Invalid AI output structure:', { parsed, hasSurvey: !!parsed?.survey })
        throw new Error('Missing survey in AI output')
      }
      // Ensure theme defaults exist so UI renders branded and editable
      parsed.survey.theme = {
        primaryColor: parsed.survey.theme?.primaryColor || '#171717',
        secondaryColor: parsed.survey.theme?.secondaryColor || '#8a8a8a',
        backgroundColor: parsed.survey.theme?.backgroundColor || '#ffffff',
        textColor: parsed.survey.theme?.textColor || '#171717',
        fontFamily: parsed.survey.theme?.fontFamily || 'Inter, sans-serif',
        borderRadius: parsed.survey.theme?.borderRadius ?? 8,
        spacing: parsed.survey.theme?.spacing ?? 16,
        animations: parsed.survey.theme?.animations ?? true,
      }
      // Coerce metadata dates to Date if strings
      if (parsed.survey?.metadata) {
        const m = parsed.survey.metadata
        if (typeof m.createdAt === 'string') parsed.survey.metadata.createdAt = new Date(m.createdAt)
        if (typeof m.updatedAt === 'string') parsed.survey.metadata.updatedAt = new Date(m.updatedAt)
      }
      result = parsed as AIGenerationOutput
      return result as AIGenerationOutput
    } catch (parseError) {
      console.error('Fast generation JSON parse error:', parseError)
      return createEnhancedFallbackSurvey(prompt, context, userId)
    }

  } catch (error) {
    console.error('Fast survey generation failed:', error)
    return createEnhancedFallbackSurvey(prompt, context, userId)
  }
}

// Helper functions for adaptive complexity
function determineComplexity(prompt: string, context?: FastGenerationInput['context']): 'simple' | 'professional' | 'research' | 'academic' {
  if (context?.complexity) return context.complexity
  if (context?.surveyType === 'academic') return 'academic'
  if (context?.surveyType === 'research') return 'research'
  if (context?.surveyType === 'marketing') return 'simple'
  
  const prompt_lower = prompt.toLowerCase()
  if (/\b(phd|research|study|hypothesis|methodology|academic|thesis)\b/.test(prompt_lower)) return 'academic'
  if (/\b(analysis|data|survey|questionnaire|statistical|validation)\b/.test(prompt_lower)) return 'research'
  if (/\b(quick|simple|fast|basic|feedback|opinion)\b/.test(prompt_lower)) return 'simple'
  return 'professional'
}

function getModelForComplexity(complexity: string) {
  switch (complexity) {
    case 'academic': return { model: 'gpt-4o', temperature: 0.1, maxTokens: 4000 }
    case 'research': return { model: 'gpt-4o-mini', temperature: 0.2, maxTokens: 3500 }
    case 'professional': return { model: 'gpt-4o-mini', temperature: 0.3, maxTokens: 3000 }
    default: return { model: 'gpt-4o-mini', temperature: 0.4, maxTokens: 2500 }
  }
}

function getSystemPromptForComplexity(complexity: string, context?: FastGenerationInput['context']): string {
  const baseComponentTemplate = `
COMPONENT TEMPLATE:
import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function [ComponentName]() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['[questionId]'] || '';
  
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <label className="block text-lg font-medium text-gray-900">
        [Question Text] {required && <span className="text-red-500">*</span>}
      </label>
      <div data-analytics-component="[component-type]" data-question-id="[questionId]">
        {/* Your custom component JSX here */}
      </div>
    </div>
  );
}

SUPPORTED COMPONENT TYPES:
- text-input: Single line text inputs
- textarea: Multi-line text areas
- radio: Single choice from options
- checkbox: Multiple choice selections  
- select: Dropdown menus
- scale: Rating scales (1-5, 1-10, etc.)
- yes-no: Binary choice questions
- nps: Net Promoter Score (0-10 scale)
- slider: Range sliders with min/max
- date-picker: Date selection
- file-upload: File upload components

STYLING REQUIREMENTS:
- Use only Tailwind CSS classes
- Create unique, beautiful designs for each component
- Include hover states, focus states, and transitions
- Ensure mobile responsiveness
- Use consistent color scheme from theme`
  
  const jsonFormat = `
CRITICAL: Output must be valid JSON in this exact format:

{
  "survey": { survey_object_here },
  "components": [ component_array_here ],
  "designSystem": { design_tokens_here },
  "validationRules": { validation_config_here },
  "analyticsConfig": { analytics_setup_here },
  "followUpSuggestions": [ suggestions_array_here ]
}

NO OTHER TEXT - ONLY THE JSON!`
  
  switch (complexity) {
    case 'academic':
      return `You are a PhD-level survey methodology expert. Create academically rigorous surveys and output them as JSON with:

**RESEARCH METHODOLOGY:**
- Validated measurement scales (Likert, semantic differential, Thurstone)
- Bias reduction techniques (randomized response, balanced scales)
- Statistical power considerations (effect size recommendations)
- Reliability measures (Cronbach's alpha, test-retest)
- Construct validity (convergent, discriminant, content validity)
- Response bias mitigation (acquiescence, social desirability)

**ADVANCED FEATURES:**
- Attention check questions (instructional manipulation checks)
- Reverse-coded items for bias detection
- Multiple validated instruments where applicable
- Demographic stratification variables
- Open-ended qualitative follow-ups
- Time-based analytics for response quality

**QUESTION DESIGN PRINCIPLES:**
- Clear, unambiguous wording (Flesch-Kincaid appropriate level)
- Avoiding leading or loaded questions
- Balanced response options
- Appropriate use of "don't know" options
- Cultural sensitivity considerations

${baseComponentTemplate}

**ACADEMIC OUTPUT REQUIREMENTS:**
- 8-15 questions with methodological justification
- Include validated scales where possible
- Add 2-3 attention checks
- Comprehensive demographic section
- Statistical analysis recommendations in metadata

${jsonFormat}`

    case 'research':
      return `You are a research survey expert. Create research-grade surveys and output them as JSON with:

**RESEARCH QUALITY:**
- Validated question formats and scales
- Basic bias reduction (balanced options, clear wording)
- Data quality measures (attention items, consistency checks)
- Professional, neutral presentation
- Appropriate statistical analysis considerations

**FEATURES:**
- Mix of quantitative and qualitative questions
- Logical flow and grouping
- Response validation and quality checks
- Professional appearance
- Mobile-optimized design

${baseComponentTemplate}

**RESEARCH OUTPUT REQUIREMENTS:**
- 6-12 well-structured questions
- Include basic attention check
- Relevant demographic questions
- Data export considerations

${jsonFormat}`

    case 'professional':
      return `You are a business survey expert. Create professional surveys and output them as JSON with:

**BUSINESS FOCUS:**
- Clear, actionable insights
- Professional branding capability
- Efficient completion (minimize drop-off)
- Corporate-appropriate design
- ROI-focused question design

**FEATURES:**
- Strategic business questions
- Customer/employee satisfaction metrics
- NPS and satisfaction scales
- Professional visual design
- Integration-ready structure

${baseComponentTemplate}

**PROFESSIONAL OUTPUT REQUIREMENTS:**
- 5-10 focused business questions
- Include satisfaction/NPS measures
- Professional design aesthetic
- Quick completion (under 5 minutes)

${jsonFormat}`

    case 'simple':
    default:
      return `You are a user-friendly survey designer. Create simple, effective surveys and output them as JSON with:

**SIMPLICITY FOCUS:**
- Quick to complete (3-7 questions max)
- Clear, conversational language
- Minimal cognitive load
- High completion rates
- Mobile-first design

**FEATURES:**
- Straightforward question types
- Intuitive interface
- Friendly, approachable tone
- Clear progress indication
- Immediate feedback

${baseComponentTemplate}

**SIMPLE OUTPUT REQUIREMENTS:**
- 3-7 essential questions only
- Use simple question types (text, radio, scale)
- Friendly, conversational tone
- Fast loading and completion

${jsonFormat}`
  }
}

function createEnhancedFallbackSurvey(prompt: string, context?: FastGenerationInput['context'], userId: string = 'anonymous'): AIGenerationOutput {
  return createFastFallbackSurvey(prompt, userId) // For now, use existing fallback
}

function createFastFallbackSurvey(prompt: string, userId: string): AIGenerationOutput {
  const surveyId = `survey_${Date.now()}`
  
  return {
    survey: {
      id: surveyId,
      title: 'Quick Survey',
      description: 'A simple survey based on your request',
      pages: [{
        id: 'page_1',
        name: 'Main Questions',
        title: 'Survey Questions',
        position: 1,
        components: [
          {
            id: 'q1',
            type: 'textarea',
            label: 'What are your thoughts on this topic?',
            required: true,
            position: 1,
            pageId: 'page_1',
            validation: {
              minLength: 10,
              maxLength: 1000
            }
          },
          {
            id: 'q2',
            type: 'scale',
            label: 'How would you rate your overall experience?',
            required: true,
            position: 2,
            pageId: 'page_1',
            props: {
              min: 1,
              max: 5,
              labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
            }
          },
          {
            id: 'q3',
            type: 'yes-no',
            label: 'Would you recommend this to others?',
            required: false,
            position: 3,
            pageId: 'page_1'
          }
        ]
      }],
      settings: { showProgress: true, allowBack: true },
      theme: {
        primaryColor: '#171717',
        secondaryColor: '#8a8a8a',
        backgroundColor: '#ffffff',
        textColor: '#171717',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 8,
        spacing: 16,
        animations: true,
      },
      analytics: {},
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: userId,
        version: '1.0',
        originalPrompt: prompt,
        tags: []
      }
    },
    components: [
      {
        id: 'q1',
        name: 'TextAreaInput',
        type: 'textarea',
        code: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function TextAreaInput() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['q1'] || '';
  
  return (
    <div className="space-y-3">
      <label className="block text-lg font-medium text-[#171717]">
        What are your thoughts on this topic? *
      </label>
      <textarea
        value={value}
        placeholder="Please share your detailed thoughts..."
        rows={4}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
        onChange={(e) => submitAnswer('q1', e.target.value)}
        data-analytics-component="textarea"
        data-question-id="q1"
      />
      <div className="text-sm text-gray-500">
        {value.length}/1000 characters
      </div>
    </div>
  );
}`,
        dependencies: ['react']
      },
      {
        id: 'q2',
        name: 'ScaleRating',
        type: 'scale',
        code: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function ScaleRating() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['q2'] || '';
  const labels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
  
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-[#171717]">
        How would you rate your overall experience? *
      </label>
      <div className="flex justify-between items-center">
        {[1, 2, 3, 4, 5].map((rating) => (
          <div key={rating} className="flex flex-col items-center space-y-2">
            <button
              type="button"
              onClick={() => submitAnswer('q2', rating)}
              className={\`w-12 h-12 rounded-full border-2 transition-all duration-200 \${
                value === rating
                  ? 'bg-[#171717] border-[#171717] text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-[#171717] hover:bg-gray-50'
              }\`}
              data-analytics-component="scale"
              data-question-id="q2"
              data-rating={rating}
            >
              {rating}
            </button>
            <span className="text-xs text-gray-600 text-center max-w-16">
              {labels[rating - 1]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`,
        dependencies: ['react']
      },
      {
        id: 'q3',
        name: 'YesNoQuestion',
        type: 'yes-no',
        code: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function YesNoQuestion() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['q3'];
  
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-[#171717]">
        Would you recommend this to others?
      </label>
      <div className="flex space-x-6">
        {[
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => submitAnswer('q3', option.value)}
            className={\`px-6 py-3 rounded-lg border-2 transition-all duration-200 font-medium \${
              value === option.value
                ? 'bg-[#171717] border-[#171717] text-white'
                : 'bg-white border-gray-300 text-gray-700 hover:border-[#171717] hover:bg-gray-50'
            }\`}
            data-analytics-component="yes-no"
            data-question-id="q3"
            data-value={option.value}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}`,
        dependencies: ['react']
      }
    ],
    designSystem: {
      colors: {
        primary: '#171717',
        secondary: '#8a8a8a',
        background: '#ffffff',
        text: '#171717',
        error: '#ef4444',
        success: '#10b981'
      },
      typography: {
        fontSizes: { sm: '14px', md: '16px', lg: '18px' },
        fontWeights: { normal: 400, medium: 500, semibold: 600 },
        lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' }
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px' },
      shadows: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)' }
    },
    validationRules: {
      global: {},
      perComponent: {
        q1: {
          rules: ['required', 'minLength:10', 'maxLength:1000'],
          errorMessages: {
            required: 'Please share your thoughts',
            minLength: 'Please provide at least 10 characters',
            maxLength: 'Please keep it under 1000 characters'
          }
        },
        q2: {
          rules: ['required'],
          errorMessages: {
            required: 'Please select a rating'
          }
        }
      }
    },
    analyticsConfig: {
      events: [
        {
          name: 'question_viewed',
          trigger: 'component_mount',
          data: { timestamp: 'auto' }
        },
        {
          name: 'question_answered',
          trigger: 'value_change',
          data: { timestamp: 'auto' }
        }
      ],
      accuracyChecks: []
    },
    followUpSuggestions: [
      {
        id: 'add_demographics',
        text: 'Add demographic questions (age, location, etc.)',
        action: 'add_question',
        priority: 'medium'
      },
      {
        id: 'improve_design',
        text: 'Customize colors and branding',
        action: 'modify_design',
        priority: 'low'
      },
      {
        id: 'add_logic',
        text: 'Add skip logic based on responses',
        action: 'add_logic',
        priority: 'low'
      }
    ]
  }
}