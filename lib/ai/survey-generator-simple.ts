import { chooseModel } from './model-router'
import { AIGenerationOutput, AIGenerationOutputSchema } from '@/lib/schemas/survey-schemas'
import { generateComponentFromTemplate, AVAILABLE_COMPONENT_TYPES } from './component-templates'

interface GenerationContext {
  prompt: string
  context: Record<string, any>
  userId: string
}

// Detect survey type from prompt
function detectSurveyType(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('satisfaction') || lowerPrompt.includes('feedback')) return 'satisfaction'
  if (lowerPrompt.includes('research') || lowerPrompt.includes('study')) return 'research'
  if (lowerPrompt.includes('market') || lowerPrompt.includes('customer')) return 'market-research'
  if (lowerPrompt.includes('employee') || lowerPrompt.includes('workplace')) return 'employee'
  if (lowerPrompt.includes('product') || lowerPrompt.includes('feature')) return 'product'
  if (lowerPrompt.includes('event') || lowerPrompt.includes('conference')) return 'event'
  if (lowerPrompt.includes('education') || lowerPrompt.includes('learning')) return 'education'
  if (lowerPrompt.includes('health') || lowerPrompt.includes('medical')) return 'health'
  
  return 'general'
}

// Generate survey components based on type and prompt
function generateSurveyComponentsForType(prompt: string, surveyType: string) {
  const templates = {
    'satisfaction': {
      title: 'User Satisfaction Survey',
      description: 'Help us improve by sharing your experience',
      questions: [
        { id: 'overall_satisfaction', type: 'scale', label: 'How satisfied are you with our service overall?', required: true, props: { min: 1, max: 5, labels: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'] }},
        { id: 'improvement_areas', type: 'textarea', label: 'What specific aspects could we improve?', required: false, props: { placeholder: 'Please share your suggestions...', rows: 4 }},
        { id: 'recommendation', type: 'scale', label: 'How likely are you to recommend us to others?', required: true, props: { min: 0, max: 10, minLabel: 'Not likely', maxLabel: 'Very likely' }},
        { id: 'contact_permission', type: 'radio', label: 'May we contact you for follow-up?', required: false, props: { options: ['Yes, please contact me', 'No, thank you'] }}
      ]
    },
    'research': {
      title: 'Research Survey',
      description: 'Contributing to important research - your responses matter',
      questions: [
        { id: 'demographics_age', type: 'select', label: 'What is your age range?', required: true, props: { options: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] }},
        { id: 'primary_question', type: 'radio', label: 'What is your primary interest in this research area?', required: true, props: { options: ['Academic interest', 'Professional development', 'Personal curiosity', 'Industry application'] }},
        { id: 'open_response', type: 'textarea', label: 'Please elaborate on your perspective:', required: false, props: { rows: 5, placeholder: 'Share your thoughts in detail...' }},
        { id: 'participation_consent', type: 'checkbox', label: 'Research participation consent:', required: true, props: { options: ['I consent to participate in this research', 'I understand my responses are confidential'] }}
      ]
    },
    'market-research': {
      title: 'Market Research Survey',
      description: 'Help us understand market preferences and trends',
      questions: [
        { id: 'product_usage', type: 'radio', label: 'How often do you use similar products?', required: true, props: { options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never'] }},
        { id: 'price_sensitivity', type: 'slider', label: 'What would you consider a fair price?', required: true, props: { min: 0, max: 1000, step: 10, minLabel: '$0', maxLabel: '$1000+' }},
        { id: 'feature_rating', type: 'scale', label: 'Rate the importance of these features:', required: true, props: { min: 1, max: 5, labels: ['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Extremely Important'] }},
        { id: 'additional_feedback', type: 'textarea', label: 'Any additional thoughts or suggestions?', required: false, props: { placeholder: 'Share your insights...', rows: 3 }}
      ]
    },
    'general': {
      title: 'Survey',
      description: 'Please take a moment to share your thoughts',
      questions: [
        { id: 'main_question', type: 'textarea', label: 'Please share your thoughts on this topic:', required: true, props: { placeholder: 'Your response...', rows: 4 }},
        { id: 'rating', type: 'scale', label: 'How would you rate your experience?', required: true, props: { min: 1, max: 5, labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'] }},
        { id: 'contact_info', type: 'email', label: 'Email (optional for follow-up):', required: false, props: { placeholder: 'your.email@example.com' }}
      ]
    }
  }
  
  const template = templates[surveyType as keyof typeof templates] || templates.general
  
  // Generate component codes using templates
  const componentCodes = template.questions.map(q => ({
    id: q.id,
    name: `${q.type.charAt(0).toUpperCase()}${q.type.slice(1).replace('-', '')}Component`,
    type: q.type,
    code: generateComponentFromTemplate(q.type, q.id, q.label, q.props, q.required)
  }))
  
  return {
    title: template.title,
    description: template.description,
    pages: [{
      id: 'page_1',
      name: 'Main Page',
      title: template.title,
      position: 1,
      components: template.questions.map(q => ({
        id: q.id,
        type: q.type,
        label: q.label,
        required: q.required,
        position: template.questions.indexOf(q) + 1,
        pageId: 'page_1',
        props: q.props
      }))
    }],
    componentCodes
  }
}

export async function generateSurveyComponents({ prompt, context, userId }: GenerationContext): Promise<AIGenerationOutput> {
  console.log('🚀 Starting comprehensive survey generation for:', prompt)
  
  try {
    // Analyze prompt and generate appropriate survey type
    const surveyType = detectSurveyType(prompt)
    const components = generateSurveyComponentsForType(prompt, surveyType)

    // Build the complete AIGenerationOutput structure
    const result: AIGenerationOutput = {
      survey: {
        id: `survey_${Date.now()}`,
        title: components.title,
        description: components.description,
        pages: components.pages,
        settings: { showProgress: true, allowBack: true },
        theme: { primaryColor: '#171717' },
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
      components: components.componentCodes,
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
          fontSizes: {
            sm: '0.875rem',
            md: '1rem',
            lg: '1.125rem',
            xl: '1.25rem'
          },
          fontWeights: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700
          },
          lineHeights: {
            tight: '1.25',
            normal: '1.5',
            relaxed: '1.75'
          }
        },
        spacing: {
          xs: '0.5rem',
          sm: '0.75rem',
          md: '1rem',
          lg: '1.5rem',
          xl: '2rem'
        },
        borderRadius: {
          sm: '0.375rem',
          md: '0.5rem',
          lg: '0.75rem',
          xl: '1rem'
        },
        shadows: {
          sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
          md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
          lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
          xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
        }
      },
      validationRules: {
        global: {},
        perComponent: Object.fromEntries(
          components.pages[0].components
            .filter(c => c.required)
            .map(c => [c.id, {
              rules: ['required'],
              errorMessages: { required: 'This field is required' }
            }])
        )
      },
      analyticsConfig: {
        events: [],
        accuracyChecks: []
      },
      followUpSuggestions: [
        {
          id: 'suggestion_1',
          text: 'Add demographic questions for better insights',
          action: 'add_question',
          priority: 'medium' as const
        },
        {
          id: 'suggestion_2', 
          text: 'Customize the design to match your brand',
          action: 'modify_design',
          priority: 'low' as const
        },
        {
          id: 'suggestion_3',
          text: 'Add conditional logic for personalized flow',
          action: 'add_logic',
          priority: 'high' as const
        }
      ]
    }

    console.log('✅ Generated comprehensive survey:', JSON.stringify(result, null, 2))

    // Validate the result
    const validated = AIGenerationOutputSchema.parse(result)
    console.log('✅ Validation successful')
    
    return validated

  } catch (error) {
    console.error('❌ Survey generation failed:', error)
    
    // Return a robust fallback
    return createFallbackSurvey(prompt, userId)
  }
}

function createFallbackSurvey(prompt: string, userId: string): AIGenerationOutput {
  const surveyId = `survey_${Date.now()}`
  const questionId = 'q1'
  
  return {
    survey: {
      id: surveyId,
      title: 'Generated Survey',
      description: 'AI-generated survey based on your request',
      pages: [{
        id: 'page_1',
        name: 'Main Page', 
        title: 'Survey Questions',
        position: 1,
        components: [{
          id: questionId,
          type: 'text-input',
          label: 'Please share your thoughts',
          required: true,
          position: 1,
          pageId: 'page_1',
        }]
      }],
      settings: { showProgress: true, allowBack: true },
      theme: { primaryColor: '#171717' },
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
    components: [{
      id: questionId,
      name: 'TextInput',
      type: 'text-input',
      code: generateComponentFromTemplate('text-input', questionId, 'Please share your thoughts', { placeholder: 'Your response...' }, true)
    }],
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
        fontSizes: {
          sm: '0.875rem',
          md: '1rem',
          lg: '1.125rem',
          xl: '1.25rem'
        },
        fontWeights: {
          normal: 400,
          medium: 500,
          semibold: 600,
          bold: 700
        },
        lineHeights: {
          tight: '1.25',
          normal: '1.5',
          relaxed: '1.75'
        }
      },
      spacing: {
        xs: '0.5rem',
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem'
      },
      borderRadius: {
        sm: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem'
      },
      shadows: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
      }
    },
    validationRules: {
      global: {},
      perComponent: {
        [questionId]: {
          rules: ['required'],
          errorMessages: { required: 'This field is required' }
        }
      }
    },
    analyticsConfig: {
      events: [],
      accuracyChecks: []
    },
    followUpSuggestions: [{
      id: 'suggestion_1',
      text: 'Add more question types for deeper insights',
      action: 'add_question',
      priority: 'medium' as const
    }]
  }
}