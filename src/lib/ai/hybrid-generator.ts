import OpenAI from 'openai'
import { ComponentType } from '@/components/survey/base-components'
import { AIGenerationOutput, Survey } from '@/lib/schemas/survey-schemas'

export interface HybridGenerationInput {
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
  mode?: 'hybrid' | 'pure-ai' | 'template-only'
}

export interface ComponentConfig {
  id: string
  type: ComponentType
  label: string
  required: boolean
  placeholder?: string
  helpText?: string
  options?: string[]
  props?: Record<string, any>
  style?: {
    container?: React.CSSProperties
    label?: React.CSSProperties
    input?: React.CSSProperties
  }
  validation?: {
    rules: string[]
    errorMessages: Record<string, string>
  }
}

export interface SurveyTemplate {
  id: string
  name: string
  description: string
  category: string
  components: ComponentConfig[]
  theme: {
    primaryColor: string
    secondaryColor: string
    backgroundColor: string
    textColor: string
    fontFamily: string
    borderRadius: number
    spacing: number
    animations: boolean
  }
}

// Pre-built survey templates
const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: 'customer-feedback',
    name: 'Customer Feedback Survey',
    description: 'Collect customer satisfaction and feedback',
    category: 'business',
    components: [
      {
        id: 'q1',
        type: 'scale',
        label: 'How satisfied are you with our service?',
        required: true,
        props: { min: 1, max: 5, labels: ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }
      },
      {
        id: 'q2',
        type: 'nps',
        label: 'How likely are you to recommend us to a friend?',
        required: true
      },
      {
        id: 'q3',
        type: 'textarea',
        label: 'What could we improve?',
        required: false,
        placeholder: 'Share your thoughts...'
      },
      {
        id: 'q4',
        type: 'radio',
        label: 'How did you hear about us?',
        required: false,
        options: ['Google Search', 'Social Media', 'Friend Referral', 'Advertisement', 'Other']
      }
    ],
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#6366f1',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 8,
      spacing: 16,
      animations: true
    }
  },
  {
    id: 'market-research',
    name: 'Market Research Survey',
    description: 'Understand market trends and consumer behavior',
    category: 'research',
    components: [
      {
        id: 'q1',
        type: 'radio',
        label: 'What is your age group?',
        required: true,
        options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+']
      },
      {
        id: 'q2',
        type: 'select',
        label: 'What is your primary industry?',
        required: true,
        options: ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Other']
      },
      {
        id: 'q3',
        type: 'checkbox',
        label: 'Which social media platforms do you use?',
        required: false,
        options: ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'TikTok', 'YouTube', 'Snapchat']
      },
      {
        id: 'q4',
        type: 'scale',
        label: 'How important is sustainability in your purchasing decisions?',
        required: true,
        props: { min: 1, max: 10 }
      }
    ],
    theme: {
      primaryColor: '#059669',
      secondaryColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 12,
      spacing: 20,
      animations: true
    }
  },
  {
    id: 'employee-engagement',
    name: 'Employee Engagement Survey',
    description: 'Measure employee satisfaction and engagement',
    category: 'hr',
    components: [
      {
        id: 'q1',
        type: 'scale',
        label: 'How satisfied are you with your current role?',
        required: true,
        props: { min: 1, max: 5, labels: ['Very Unsatisfied', 'Unsatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }
      },
      {
        id: 'q2',
        type: 'yes-no',
        label: 'Do you feel your contributions are valued?',
        required: true
      },
      {
        id: 'q3',
        type: 'textarea',
        label: 'What motivates you most at work?',
        required: false,
        placeholder: 'Share what drives you...'
      },
      {
        id: 'q4',
        type: 'scale',
        label: 'How likely are you to recommend this company as a great place to work?',
        required: true,
        props: { min: 1, max: 10 }
      }
    ],
    theme: {
      primaryColor: '#7c3aed',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 10,
      spacing: 18,
      animations: true
    }
  }
]

export class HybridSurveyGenerator {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    })
  }

  async generateSurvey(input: HybridGenerationInput): Promise<AIGenerationOutput> {
    console.log('🎯 Starting hybrid survey generation...')
    console.log('Mode:', input.mode || 'hybrid')
    console.log('Prompt:', input.prompt)

    try {
      if (input.mode === 'template-only') {
        return this.generateFromTemplate(input)
      } else if (input.mode === 'pure-ai') {
        return this.generatePureAI(input)
      } else {
        // Hybrid mode: Try template first, enhance with AI
        return this.generateHybrid(input)
      }
    } catch (error) {
      console.error('❌ Hybrid generation failed:', error)
      return this.generateFallback(input)
    }
  }

  private async generateHybrid(input: HybridGenerationInput): Promise<AIGenerationOutput> {
    console.log('🔄 Using hybrid approach (template + AI customization)')

    // Step 1: Find the best matching template
    const template = this.selectBestTemplate(input.prompt, input.context)
    
    if (!template) {
      console.log('📝 No matching template found, using pure AI generation')
      return this.generatePureAI(input)
    }

    console.log('📋 Using template:', template.name)

    // Step 2: Customize template with AI
    const customizedSurvey = await this.customizeTemplateWithAI(template, input)
    
    return {
      survey: customizedSurvey,
      components: [], // Components are defined in survey structure for registry-based system
      designSystem: this.createDesignSystem(customizedSurvey.theme),
      validationRules: this.createValidationRules(customizedSurvey),
      analyticsConfig: this.createAnalyticsConfig(),
      followUpSuggestions: this.createFollowUpSuggestions(template, input),
      metadata: {
        generationMode: 'hybrid',
        templateUsed: template.id,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private async generatePureAI(input: HybridGenerationInput): Promise<AIGenerationOutput> {
    console.log('🤖 Using pure AI generation (v0-style)')

    const systemPrompt = `You are a world-class survey designer. Create a complete survey based on the user's request.

IMPORTANT: Use ONLY these component types: text-input, textarea, radio, checkbox, scale, nps, select, date-picker, yes-no

Return a JSON object with this exact structure:
{
  "survey": {
    "id": "survey_" + timestamp,
    "title": "Survey Title",
    "description": "Survey description",
    "pages": [{
      "id": "page_1",
      "name": "Page Name",
      "title": "Page Title",
      "position": 1,
      "components": [{
        "id": "q1",
        "type": "text-input|textarea|radio|checkbox|scale|nps|select|date-picker|yes-no",
        "label": "Question text",
        "required": true|false,
        "placeholder": "Optional placeholder",
        "helpText": "Optional help text",
        "options": ["option1", "option2"] // Only for radio, checkbox, select
        "props": {
          "min": 1, "max": 5, // For scale
          "labels": ["Poor", "Great"] // For scale
        },
        "position": 1,
        "pageId": "page_1"
      }]
    }],
    "theme": {
      "primaryColor": "#3b82f6",
      "secondaryColor": "#6366f1", 
      "backgroundColor": "#ffffff",
      "textColor": "#1f2937",
      "fontFamily": "Inter, sans-serif",
      "borderRadius": 8,
      "spacing": 16,
      "animations": true
    },
    "settings": {
      "showProgress": true,
      "allowBack": true
    },
    "analytics": {},
    "metadata": {
      "createdAt": "${new Date().toISOString()}",
      "updatedAt": "${new Date().toISOString()}",
      "creatorId": "${input.userId}",
      "version": "2.0",
      "originalPrompt": "${input.prompt}",
      "tags": []
    }
  }
}`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { 
          role: 'user', 
          content: `Create a survey for: ${input.prompt}

Context:
- Survey Type: ${input.context?.surveyType || 'general'}
- Target Audience: ${input.context?.targetAudience || 'general public'}
- Industry: ${input.context?.industry || 'general'}
- Complexity: ${input.context?.complexity || 'professional'}
- Style: ${input.context?.designStyle || 'modern'}
- Length: ${input.context?.length || 'medium'}

Create 3-8 relevant questions using the available component types. Make it engaging and professional.`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
      max_tokens: 3000
    })

    const aiResult = JSON.parse(response.choices[0]?.message?.content || '{}')

    return {
      survey: aiResult.survey,
      components: [], // Registry-based system
      designSystem: this.createDesignSystem(aiResult.survey?.theme),
      validationRules: this.createValidationRules(aiResult.survey),
      analyticsConfig: this.createAnalyticsConfig(),
      followUpSuggestions: this.createFollowUpSuggestions(null, input),
      metadata: {
        generationMode: 'pure-ai',
        templateUsed: null,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private generateFromTemplate(input: HybridGenerationInput): AIGenerationOutput {
    console.log('📋 Using template-only generation')

    const template = this.selectBestTemplate(input.prompt, input.context) || SURVEY_TEMPLATES[0]

    const survey: Survey = {
      id: `survey_${Date.now()}`,
      title: template.name,
      description: template.description,
      pages: [{
        id: 'page_1',
        name: 'Main Questions',
        title: 'Survey Questions',
        position: 1,
        components: template.components.map((comp, index) => ({
          ...comp,
          position: index + 1,
          pageId: 'page_1'
        }))
      }],
      theme: template.theme,
      settings: { showProgress: true, allowBack: true },
      analytics: {},
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: input.userId,
        version: '2.0',
        originalPrompt: input.prompt,
        tags: [template.category]
      }
    }

    return {
      survey,
      components: [], // Registry-based
      designSystem: this.createDesignSystem(template.theme),
      validationRules: this.createValidationRules(survey),
      analyticsConfig: this.createAnalyticsConfig(),
      followUpSuggestions: this.createFollowUpSuggestions(template, input),
      metadata: {
        generationMode: 'template-only',
        templateUsed: template.id,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private selectBestTemplate(prompt: string, context?: HybridGenerationInput['context']): SurveyTemplate | null {
    const promptLower = prompt.toLowerCase()
    
    // Survey type based matching
    if (context?.surveyType === 'feedback' || promptLower.includes('feedback') || promptLower.includes('satisfaction')) {
      return SURVEY_TEMPLATES.find(t => t.id === 'customer-feedback') || null
    }
    
    if (context?.surveyType === 'research' || promptLower.includes('market') || promptLower.includes('research')) {
      return SURVEY_TEMPLATES.find(t => t.id === 'market-research') || null
    }
    
    if (promptLower.includes('employee') || promptLower.includes('engagement') || promptLower.includes('workplace')) {
      return SURVEY_TEMPLATES.find(t => t.id === 'employee-engagement') || null
    }

    // Keyword-based matching
    for (const template of SURVEY_TEMPLATES) {
      const templateKeywords = template.description.toLowerCase().split(' ')
      const promptWords = promptLower.split(' ')
      
      const matchCount = templateKeywords.filter(keyword => 
        promptWords.some(word => word.includes(keyword) || keyword.includes(word))
      ).length
      
      if (matchCount >= 2) {
        return template
      }
    }

    return null
  }

  private async customizeTemplateWithAI(template: SurveyTemplate, input: HybridGenerationInput): Promise<Survey> {
    const customizationPrompt = `Customize this survey template based on the user's specific request.

ORIGINAL TEMPLATE: ${template.name}
${template.description}

USER REQUEST: ${input.prompt}

CONTEXT:
- Survey Type: ${input.context?.surveyType || 'general'}
- Target Audience: ${input.context?.targetAudience || 'general public'}
- Industry: ${input.context?.industry || 'general'}

CURRENT TEMPLATE COMPONENTS:
${template.components.map(c => `- ${c.type}: ${c.label}`).join('\n')}

Instructions:
1. Modify question labels to better match the user's request
2. Adjust options for radio/checkbox/select components if needed
3. Add or remove questions if necessary (3-8 total questions)
4. Keep component types from: text-input, textarea, radio, checkbox, scale, nps, select, date-picker, yes-no
5. Maintain the template's general structure but customize content

Return JSON with the customized survey structure following the same format as the template.`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a survey customization expert. Modify the template to match user requirements while maintaining good survey design principles.' },
          { role: 'user', content: customizationPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000
      })

      const customized = JSON.parse(response.choices[0]?.message?.content || '{}')
      
      return {
        id: `survey_${Date.now()}`,
        title: customized.title || template.name,
        description: customized.description || template.description,
        pages: [{
          id: 'page_1',
          name: 'Main Questions',
          title: 'Survey Questions',
          position: 1,
          components: (customized.components || template.components).map((comp: any, index: number) => ({
            ...comp,
            position: index + 1,
            pageId: 'page_1'
          }))
        }],
        theme: { ...template.theme, ...(customized.theme || {}) },
        settings: { showProgress: true, allowBack: true },
        analytics: {},
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: input.userId,
          version: '2.0',
          originalPrompt: input.prompt,
          tags: [template.category, 'customized']
        }
      }
    } catch (error) {
      console.error('❌ Template customization failed, using original template:', error)
      return {
        id: `survey_${Date.now()}`,
        title: template.name,
        description: template.description,
        pages: [{
          id: 'page_1',
          name: 'Main Questions',
          title: 'Survey Questions', 
          position: 1,
          components: template.components.map((comp, index) => ({
            ...comp,
            position: index + 1,
            pageId: 'page_1'
          }))
        }],
        theme: template.theme,
        settings: { showProgress: true, allowBack: true },
        analytics: {},
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: input.userId,
          version: '2.0',
          originalPrompt: input.prompt,
          tags: [template.category]
        }
      }
    }
  }

  private generateFallback(input: HybridGenerationInput): AIGenerationOutput {
    const fallbackSurvey: Survey = {
      id: `survey_${Date.now()}`,
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
            label: 'Please share your thoughts about this topic',
            required: true,
            placeholder: 'Your thoughts...',
            position: 1,
            pageId: 'page_1'
          },
          {
            id: 'q2',
            type: 'scale',
            label: 'How would you rate your overall experience?',
            required: true,
            props: { min: 1, max: 5, labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] },
            position: 2,
            pageId: 'page_1'
          }
        ]
      }],
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#6366f1',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Inter, sans-serif',
        borderRadius: 8,
        spacing: 16,
        animations: true
      },
      settings: { showProgress: true, allowBack: true },
      analytics: {},
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: input.userId,
        version: '2.0',
        originalPrompt: input.prompt,
        tags: ['fallback']
      }
    }

    return {
      survey: fallbackSurvey,
      components: [],
      designSystem: this.createDesignSystem(fallbackSurvey.theme),
      validationRules: this.createValidationRules(fallbackSurvey),
      analyticsConfig: this.createAnalyticsConfig(),
      followUpSuggestions: [],
      metadata: {
        generationMode: 'fallback',
        templateUsed: null,
        generatedAt: new Date().toISOString()
      }
    }
  }

  private createDesignSystem(theme: any) {
    return {
      colors: {
        primary: theme.primaryColor,
        secondary: theme.secondaryColor,
        background: theme.backgroundColor,
        text: theme.textColor,
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
    }
  }

  private createValidationRules(survey: Survey) {
    const perComponent: Record<string, any> = {}
    
    survey.pages?.forEach(page => {
      page.components?.forEach(component => {
        if (component.required) {
          perComponent[component.id] = {
            rules: ['required'],
            errorMessages: {
              required: 'This field is required'
            }
          }
        }
      })
    })

    return {
      global: {},
      perComponent
    }
  }

  private createAnalyticsConfig() {
    return {
      events: [
        { name: 'survey_started', trigger: 'page_load', data: { timestamp: 'auto' } },
        { name: 'question_answered', trigger: 'value_change', data: { timestamp: 'auto' } },
        { name: 'survey_completed', trigger: 'survey_submit', data: { timestamp: 'auto' } }
      ],
      accuracyChecks: []
    }
  }

  private createFollowUpSuggestions(template: SurveyTemplate | null, input: HybridGenerationInput) {
    const suggestions = []

    if (template) {
      suggestions.push({
        id: 'customize-questions',
        text: `Customize the questions to better match your specific use case`,
        action: 'modify_content',
        priority: 'medium' as const
      })
    }

    suggestions.push({
      id: 'add-branding',
      text: 'Customize colors and fonts to match your brand',
      action: 'modify_design',
      priority: 'low' as const
    })

    if (input.context?.surveyType === 'research') {
      suggestions.push({
        id: 'add-demographics',
        text: 'Add demographic questions for better analysis',
        action: 'add_question',
        priority: 'high' as const
      })
    }

    return suggestions
  }

  // Get available templates for UI display
  getAvailableTemplates(): SurveyTemplate[] {
    return SURVEY_TEMPLATES
  }

  // Get template by ID
  getTemplate(id: string): SurveyTemplate | null {
    return SURVEY_TEMPLATES.find(t => t.id === id) || null
  }
}

export const hybridGenerator = new HybridSurveyGenerator()