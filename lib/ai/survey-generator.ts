import { z } from 'zod'
import { chooseModel, chatJson } from './model-router'
import { upsertDesignPatternEmbedding } from './embeddings'
import { AIGenerationOutputSchema, SurveySchema, type AIGenerationOutput } from '@/lib/schemas/survey-schemas'

interface GenerationContext {
  prompt: string
  context?: {
    surveyType?: string
    targetAudience?: string
    industry?: string
  }
  userId: string
}

export async function generateSurveyComponents({ prompt, context, userId }: GenerationContext): Promise<AIGenerationOutput> {
  // Step 1: Intent analysis with PhD-level survey design
  const intentModel = chooseModel('reason')
  const intent = await chatJson({
    model: intentModel.model,
    messages: [
      { 
        role: 'system', 
        content: `You are a PhD-level survey methodologist and research designer. Analyze the user's request and extract:
        - title: Professional survey title
        - goals: Research objectives and hypotheses
        - audience: Target demographic with psychographic details
        - questionPlan: Array of question specifications with cognitive load considerations
        - methodology: Survey methodology (cross-sectional, longitudinal, experimental)
        - biasMinimization: Strategies to reduce response bias
        - validityChecks: Internal consistency and attention check requirements
        - tone: Professional, academic, conversational, etc.
        - complexity: Beginner, intermediate, advanced, expert-level
        Return as JSON with these exact fields.`
      },
      { role: 'user', content: `Design a survey for: ${prompt}${context ? `\nAdditional context: ${JSON.stringify(context)}` : ''}` },
    ],
    temperature: 0.3,
  })

  // Step 2: DYNAMIC Design System Generation - Fully Creative
  const designModel = chooseModel('design')
  const designSystem = await chatJson({
    model: designModel.model,
    messages: [
      { 
        role: 'system', 
        content: `You are a world-class UI/UX designer. Create a UNIQUE, CREATIVE design system for this survey.
        
        IMPORTANT: Be completely creative! Generate dynamic, unique designs each time:
        - Use ANY colors (vibrant, muted, gradients, themes)
        - Experiment with ANY typography (modern, classic, playful, serious)
        - Create ANY layout styles (minimal, rich, asymmetric, grid-based)
        - Apply ANY visual effects (glassmorphism, neumorphism, flat, 3D)
        - Use creative shadows, animations, transitions
        
        Output a complete design system JSON:
        {
          "colors": {
            "primary": "#hex",
            "secondary": "#hex",
            "accent": "#hex",
            "background": "#hex or gradient",
            "surface": "#hex",
            "text": "#hex",
            "textSecondary": "#hex",
            "error": "#hex",
            "warning": "#hex",
            "success": "#hex",
            "info": "#hex"
          },
          "gradients": [
            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          ],
          "typography": {
            "fontFamily": "Inter, system-ui, -apple-system",
            "headingFont": "Poppins, Inter, sans-serif",
            "fontSizes": { "xs": "12px", "sm": "14px", "md": "16px", "lg": "20px", "xl": "24px", "2xl": "32px", "3xl": "40px" },
            "fontWeights": { "light": 300, "normal": 400, "medium": 500, "semibold": 600, "bold": 700 },
            "lineHeights": { "tight": 1.2, "normal": 1.5, "relaxed": 1.75, "loose": 2 }
          },
          "spacing": { "xs": "4px", "sm": "8px", "md": "16px", "lg": "24px", "xl": "32px", "2xl": "48px", "3xl": "64px" },
          "borderRadius": { "none": "0", "sm": "6px", "md": "12px", "lg": "20px", "xl": "28px", "full": "9999px" },
          "shadows": {
            "none": "none",
            "sm": "0 2px 8px rgba(0,0,0,0.08)",
            "md": "0 4px 16px rgba(0,0,0,0.12)",
            "lg": "0 8px 32px rgba(0,0,0,0.16)",
            "xl": "0 16px 48px rgba(0,0,0,0.20)",
            "glow": "0 0 24px rgba(primary,0.4)"
          },
          "effects": {
            "blur": "backdrop-filter: blur(10px)",
            "glassmorphism": "background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2)",
            "neumorphism": "box-shadow: 20px 20px 60px #bebebe, -20px -20px 60px #ffffff"
          },
          "animations": {
            "fadeIn": "fadeIn 0.3s ease-out",
            "slideUp": "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            "pulse": "pulse 2s infinite"
          },
          "theme": "${['modern', 'minimalist', 'playful', 'professional', 'elegant', 'bold', 'soft', 'tech', 'organic'][Math.floor(Math.random() * 9)]}"
        }
        
        Be creative and make each design unique! Don't use the same colors/styles repeatedly.`
      },
      { role: 'user', content: `Create a unique design for: ${JSON.stringify(intent)}
Make it visually distinctive and memorable!` },
    ],
    temperature: 0.8, // Higher temperature for more creativity
  })

  // Step 3: Generate survey structure with pages and components
  const structureModel = chooseModel('code')
  const surveyStructure = await chatJson({
    model: structureModel.model,
    messages: [
      {
        role: 'system',
        content: `Generate a complete survey structure as JSON. Create:
        1. Multiple pages with logical flow
        2. PhD-level questions with proper survey methodology
        3. Appropriate question types for each research goal
        4. Validation rules for data quality
        5. Skip logic and branching where appropriate
        6. Attention checks and consistency measures
        
        Output must match this structure:
        {
          "id": "survey_id",
          "title": "Survey Title",
          "description": "Brief description",
          "pages": [
            {
              "id": "page_1",
              "name": "Page Name",
              "title": "Page Title",
              "position": 1,
              "components": [
                {
                  "id": "q1",
                  "type": "radio|text-input|scale|matrix|etc",
                  "label": "Question text",
                  "required": true|false,
                  "position": 1,
                  "pageId": "page_1",
                  "validation": { "minLength": 10, "maxLength": 500 },
                  "props": { "options": ["Option 1", "Option 2"] }
                }
              ]
            }
          ],
          "settings": { "showProgress": true, "allowBack": true },
          "theme": { "primaryColor": "#171717" },
          "analytics": { "trackPageViews": true },
          "metadata": { "createdAt": "${new Date().toISOString()}", "creatorId": "${userId}", "originalPrompt": "${prompt}" }
        }`
      },
      { role: 'user', content: `Intent: ${JSON.stringify(intent)}\nDesign: ${JSON.stringify(designSystem)}` },
    ],
    temperature: 0.5,
  })

  // Step 4: Generate React component code for each component
  const codeModel = chooseModel('code')
  let componentCode: any
  try {
    componentCode = await chatJson({
      model: codeModel.model,
      messages: [
        {
          role: 'system',
          content: `Generate CREATIVE, UNIQUE React TSX components with DYNAMIC DESIGNS. 
        
        CRITICAL: Make each component visually unique and creative!
        - Use the design system colors/spacing/effects creatively
        - Apply gradients, shadows, animations as appropriate
        - Create beautiful, modern UI components
        - Each component should look professionally designed
        - Use Tailwind CSS classes creatively (bg-gradient-to-r, animate-pulse, etc.)
        
        Technical Rules:
        1. Each component must be a default export
        2. Use only allowed imports: React, lucide-react icons
        3. Use Tailwind CSS for ALL styling (including custom gradients/effects)
        4. Include proper accessibility attributes
        5. Use the provided survey hooks: useSurveyState, useValidation, useAnalytics
        6. Include data attributes for analytics tracking
        7. Handle validation and error states beautifully
        8. Apply the design system creatively in the component code
        
        Output format:
        {
          "components": [
            {
              "id": "component_id",
              "name": "ComponentName", 
              "type": "question_type",
              "code": "import React from 'react';\nimport { useSurveyState } from '@/features/survey';\n\nexport default function ComponentName() {\n  // component implementation\n  return <div>...</div>;\n}",
              "dependencies": ["react", "lucide-react"]
            }
          ]
        }
        
        Make the components visually stunning with:
        - Creative use of colors and gradients
        - Smooth animations and transitions
        - Modern UI patterns (cards, floating labels, etc.)
        - Beautiful hover states and interactions
        - Professional typography and spacing`
      },
      { role: 'user', content: `Generate beautiful, unique components for: ${JSON.stringify(surveyStructure)}\nDesign System: ${JSON.stringify(designSystem)}\nMake each component visually distinctive!` },
    ],
    temperature: 0.7, // Higher temperature for more creative component designs
  })
  console.log('Component code generated:', JSON.stringify(componentCode, null, 2))
} catch (error) {
  console.error('Component code generation failed:', error)
  componentCode = { components: [] }
}

  // Step 5: Generate validation rules
  const validationModel = chooseModel('json')
  let validationRules: any
  try {
    validationRules = await chatJson({
    model: validationModel.model,
    messages: [
      {
        role: 'system',
        content: `Generate comprehensive validation rules for the survey components. Include:
        - Field-level validation (required, length, format, range)
        - Cross-field validation (consistency checks)
        - Attention checks (trap questions, instruction following)
        - Data quality measures (response time, pattern detection)
        
        Output as JSON with global and per-component rules.`
      },
      { role: 'user', content: `Survey: ${JSON.stringify(surveyStructure)}` },
    ],
    temperature: 0.2,
  })
  console.log('Validation rules generated:', JSON.stringify(validationRules, null, 2))
} catch (error) {
  console.error('Validation rules generation failed:', error)
  validationRules = { global: {}, perComponent: {} }
}

  // Step 6: Generate analytics configuration
  const analyticsModel = chooseModel('json')
  let analyticsConfig: any
  try {
    analyticsConfig = await chatJson({
    model: analyticsModel.model,
    messages: [
      {
        role: 'system',
        content: `Generate analytics configuration for behavioral tracking:
        - Page view events
        - Interaction events (focus, blur, input)
        - Timing events (time on page, response time)
        - Accuracy check events
        - Drop-off tracking
        
        Output as JSON with event definitions and tracking configuration.`
      },
      { role: 'user', content: `Survey: ${JSON.stringify(surveyStructure)}` },
    ],
    temperature: 0.2,
  })
  console.log('Analytics config generated:', JSON.stringify(analyticsConfig, null, 2))
} catch (error) {
  console.error('Analytics config generation failed:', error)
  analyticsConfig = { events: [], accuracyChecks: [], providerKeys: {} }
}

  // Step 7: Generate follow-up suggestions
  const followUpModel = chooseModel('reason')
  let followUpSuggestions: any
  try {
    followUpSuggestions = await chatJson({
    model: followUpModel.model,
    messages: [
      {
        role: 'system',
        content: `Generate 3-5 intelligent follow-up suggestions to improve the survey:
        - Additional questions for deeper insights
        - Design improvements for better UX
        - Logic enhancements for personalization
        - Accessibility improvements
        
        Output as JSON array with id, text, action, and priority fields.`
      },
      { role: 'user', content: `Survey: ${JSON.stringify(surveyStructure)}` },
    ],
    temperature: 0.6,
  })
  console.log('Follow-up suggestions generated:', JSON.stringify(followUpSuggestions, null, 2))
} catch (error) {
  console.error('Follow-up suggestions generation failed:', error)
  followUpSuggestions = { suggestions: [] }
}

  // Step 8: Store pattern embedding for future improvements
  try {
    await upsertDesignPatternEmbedding(
      `pattern-${Date.now()}-${userId}`, 
      `${prompt} ${JSON.stringify(context)} ${JSON.stringify(intent)}`
    )
  } catch (error) {
    console.warn('Failed to store design pattern embedding:', error)
  }

  // Combine all results into final output
  const result: AIGenerationOutput = {
    survey: {
      id: surveyStructure.id || `survey_${Date.now()}`,
      title: surveyStructure.title || 'Generated Survey',
      description: surveyStructure.description || '',
      pages: surveyStructure.pages || [{
        id: 'page_1',
        name: 'Main Page',
        title: 'Survey Questions',
        position: 1,
        components: [{
          id: 'q1',
          type: 'text-input',
          label: 'Please share your feedback',
          required: true,
          position: 1,
          pageId: 'page_1',
        }]
      }],
      settings: surveyStructure.settings || { showProgress: true, allowBack: true },
      theme: surveyStructure.theme || { primaryColor: '#171717' },
      analytics: surveyStructure.analytics || {},
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: userId,
        version: '1.0',
        originalPrompt: prompt,
        generatedBy: codeModel.model,
        tags: surveyStructure.metadata?.tags || [],
      }
    },
    components: Array.isArray(componentCode.components) ? componentCode.components : [],
    designSystem: {
      primaryColor: designSystem.primaryColor || '#171717',
      secondaryColor: designSystem.secondaryColor || '#8a8a8a',
      background: designSystem.background || '#ffffff',
      text: designSystem.text || '#171717',
      typography: designSystem.typography || {},
      spacing: designSystem.spacing || {},
      borderRadius: designSystem.borderRadius || {},
      shadows: designSystem.shadows || {},
    },
    validationRules: {
      global: validationRules.global || {},
      perComponent: validationRules.perComponent || {},
    },
    analyticsConfig: {
      events: analyticsConfig.events || [],
      accuracyChecks: analyticsConfig.accuracyChecks || [],
      providerKeys: analyticsConfig.providerKeys || {},
    },
    followUpSuggestions: Array.isArray(followUpSuggestions.suggestions) ? followUpSuggestions.suggestions : [],
  }

  // Validate the output against our schema
  try {
    AIGenerationOutputSchema.parse(result)
  } catch (validationError) {
    console.error('Generated output failed schema validation:', validationError)
    // Return a minimal valid structure if validation fails
    return createFallbackSurvey(prompt, userId)
  }

  return result
}

function createFallbackSurvey(prompt: string, userId: string): AIGenerationOutput {
  return {
    survey: {
      id: `survey_${Date.now()}`,
      title: 'Generated Survey',
      description: 'AI-generated survey based on your prompt',
      pages: [{
        id: 'page_1',
        name: 'Main Page',
        title: 'Survey Questions',
        position: 1,
        components: [{
          id: 'q1',
          type: 'text-input',
          label: 'Please share your thoughts',
          required: true,
          position: 1,
          pageId: 'page_1',
        }]
      }],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        creatorId: userId,
        version: '1.0',
        originalPrompt: prompt,
        tags: [],
      }
    },
    components: [{
      id: 'q1',
      name: 'TextInput',
      type: 'text-input',
      code: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function TextInput() {
  const { updateResponse } = useSurveyState();
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900">
        Please share your thoughts
      </label>
      <textarea
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows={4}
        onChange={(e) => updateResponse('q1', e.target.value)}
        data-analytics-component="text-input"
      />
    </div>
  );
}`,
      dependencies: ['react']
    }],
    designSystem: {
      colors: {
        primary: '#171717',
        secondary: '#8a8a8a',
        background: '#ffffff',
        text: '#171717',
      },
      typography: {
        fontSizes: { sm: '14px', md: '16px', lg: '18px' },
        fontWeights: { normal: 400, medium: 500, semibold: 600 },
        lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' },
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px' },
      shadows: { sm: '0 1px 2px rgba(0,0,0,0.05)', md: '0 4px 6px rgba(0,0,0,0.1)' },
    },
    validationRules: {
      global: {},
      perComponent: {
        q1: {
          rules: ['required', 'minLength:10'],
          errorMessages: { required: 'This field is required', minLength: 'Please provide at least 10 characters' }
        }
      }
    },
    analyticsConfig: {
      events: [{
        name: 'question_viewed',
        trigger: 'component_mount',
        data: { componentId: 'q1', timestamp: 'auto' }
      }],
      accuracyChecks: []
    },
    followUpSuggestions: []
  }
}

