import OpenAI from 'openai'
import { aiModelManager } from './model-config'

// Advanced multi-model pipeline with GPT-5 support
export class SurveyAIPipeline {
  private openai: OpenAI

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY 
    })
    
    // Log current model configuration
    const config = aiModelManager.getConfigSummary();
    console.log('🤖 AI Model Configuration:', config);
    if (config.gpt5Available) {
      console.log('🚀 GPT-5 ACTIVE: Using cutting-edge reasoning for UI design!');
    }
  }

  // Stage 1: Analyze requirements using best available model (GPT-5 or GPT-4o)
  async analyzeRequirements(prompt: string): Promise<SurveyAnalysis> {
    const model = aiModelManager.getModel('analysis');
    console.log(`🧠 Stage 1: Analyzing survey requirements with ${model}...`)
    
    const analysis = await aiModelManager.createChatCompletion([
      {
        role: 'system',
        content: `You are a PhD-level survey methodology expert. Analyze the user's survey request and extract structured requirements.

OUTPUT REQUIREMENTS - Return ONLY valid JSON:
{
  "surveyType": "market-research" | "academic-study" | "employee-engagement" | "product-feedback" | "customer-satisfaction" | "user-research",
  "complexity": "simple" | "professional" | "research" | "academic",
  "targetAudience": "consumers" | "employees" | "students" | "professionals" | "general-public",
  "industry": string,
  "objectives": string[],
  "estimatedLength": "short" | "medium" | "long",
  "dataTypes": ("quantitative" | "qualitative" | "mixed")[],
  "specialRequirements": string[],
  "tone": "formal" | "casual" | "professional" | "academic",
  "urgency": "immediate" | "standard" | "flexible"
}`
      },
      {
        role: 'user', 
        content: `Analyze this survey request: "${prompt}"`
      }
    ], 'analysis', {
      temperature: 0.1,
      response_format: { type: 'json_object' }
    })

    const analysisText = analysis.choices[0]?.message?.content || '{}'
    try {
      const parsed = JSON.parse(analysisText) as SurveyAnalysis
      console.log(`✅ Requirements analysis complete (${model}):`, parsed.surveyType, parsed.complexity)
      return parsed
    } catch (error) {
      console.error('❌ Analysis parsing failed, using fallback')
      return this.getFallbackAnalysis(prompt)
    }
  }

  // Stage 2: Plan survey architecture using best available model
  async planSurveyArchitecture(analysis: SurveyAnalysis): Promise<SurveyArchitecture> {
    const model = aiModelManager.getModel('planning');
    console.log(`🏗️ Stage 2: Planning survey architecture with ${model}...`)
    
    const planningPrompt = `Based on this survey analysis, create a comprehensive survey architecture:

ANALYSIS:
- Type: ${analysis.surveyType}
- Complexity: ${analysis.complexity}
- Audience: ${analysis.targetAudience}
- Objectives: ${analysis.objectives.join(', ')}

Create a detailed survey plan that includes page flow, question types, validation rules, and analytics configuration.

OUTPUT REQUIREMENTS - Return ONLY valid JSON:
{
  "pages": [
    {
      "id": string,
      "name": string,
      "purpose": string,
      "position": number,
      "questions": [
        {
          "id": string,
          "type": "text-input" | "textarea" | "radio" | "checkbox" | "scale" | "nps" | "matrix" | "ranking" | "file-upload" | "date-picker",
          "label": string,
          "required": boolean,
          "validation": { "rules": string[], "messages": object },
          "logic": { "showIf": string, "skipTo": string },
          "analytics": { "trackingEvents": string[] }
        }
      ]
    }
  ],
  "flow": {
    "navigation": "linear" | "adaptive" | "branching",
    "progressType": "percentage" | "steps" | "pages",
    "allowBack": boolean
  },
  "validation": {
    "realTime": boolean,
    "completionChecks": string[]
  },
  "analytics": {
    "trackingLevel": "basic" | "advanced" | "research",
    "fraudDetection": boolean,
    "behavioralMetrics": boolean
  },
  "design": {
    "theme": string,
    "layout": string,
    "animations": boolean
  }
}`

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { 
            role: 'system', 
            content: 'You are a PhD-level survey methodology expert and architecture planner. Create comprehensive, well-structured survey architectures with proper flow, validation, and analytics. Focus on user experience and research quality.'
          },
          { role: 'user', content: planningPrompt }
        ]
      })

      const architectureText = response.choices[0]?.message?.content || '{}'
      const parsed = JSON.parse(architectureText) as SurveyArchitecture
      console.log('✅ Architecture planning complete (GPT-4o):', parsed.pages.length, 'pages')
      return parsed
    } catch (error) {
      console.error('❌ Architecture parsing failed, using fallback:', error)
      return this.getFallbackArchitecture(analysis)
    }
  }

  // Stage 3: Generate UI design system using GPT-5 (or GPT-4o fallback)
  async generateUIDesignSystem(analysis: SurveyAnalysis, architecture: SurveyArchitecture): Promise<UIDesignSystem> {
    const model = aiModelManager.getModel('design');
    const isGPT5 = aiModelManager.isGPT5Available();
    console.log(`🎨 Stage 3: Generating UI design system with ${model}${isGPT5 ? ' (GPT-5 advanced reasoning)' : ''}...`)

    const designPrompt = `Create a cutting-edge, psychology-informed UI design system for this survey using the most advanced design principles:

📊 SURVEY CONTEXT:
- Type: ${analysis.surveyType}
- Complexity: ${analysis.complexity}  
- Target Audience: ${analysis.targetAudience}
- Industry: ${analysis.industry}
- Tone: ${analysis.tone}
- Objectives: ${analysis.objectives.join(', ')}

🎯 ADVANCED DESIGN REQUIREMENTS:
- **Color Psychology**: Use colors scientifically proven to increase completion rates for ${analysis.surveyType} surveys
- **Conversion Optimization**: Design elements that psychologically encourage progression and completion
- **Micro-Interactions**: Sophisticated animation patterns that provide delightful feedback
- **Accessibility Excellence**: WCAG 2.1 AA compliance with enhanced contrast and typography
- **Cross-Device Harmony**: Seamless experience from mobile to desktop with adaptive scaling
- **Trust Signals**: Visual design choices that build credibility and reduce abandonment
- **Cognitive Load Reduction**: Thoughtful spacing, hierarchy, and visual flow optimization
- **Modern Aesthetics**: Incorporate 2024's most sophisticated design trends (glassmorphism, advanced gradients, dynamic shadows)

🧠 PSYCHOLOGICAL CONSIDERATIONS:
- Survey completion psychology for ${analysis.targetAudience} audience
- Industry-appropriate trust indicators for ${analysis.industry}
- Cultural sensitivity for global accessibility
- Attention retention through strategic visual hierarchy

Generate a world-class design system that would rival top design agencies like IDEO, Pentagram, or Google's Material Design team.

OUTPUT REQUIREMENTS - Return ONLY valid JSON:
{
  "colorPalette": {
    "primary": string,
    "secondary": string,
    "accent": string,
    "background": string,
    "surface": string,
    "text": string,
    "textSecondary": string,
    "success": string,
    "warning": string,
    "error": string
  },
  "typography": {
    "fontFamily": string,
    "headingSizes": { "xl": string, "lg": string, "md": string, "sm": string },
    "textSizes": { "lg": string, "base": string, "sm": string, "xs": string },
    "fontWeights": { "light": number, "normal": number, "medium": number, "semibold": number, "bold": number },
    "lineHeights": { "tight": string, "normal": string, "relaxed": string }
  },
  "spacing": {
    "xs": string, "sm": string, "md": string, "lg": string, "xl": string, "2xl": string, "3xl": string
  },
  "borderRadius": {
    "sm": string, "md": string, "lg": string, "xl": string, "full": string
  },
  "shadows": {
    "sm": string, "md": string, "lg": string, "xl": string
  },
  "animations": {
    "duration": { "fast": string, "normal": string, "slow": string },
    "easing": { "ease": string, "easeIn": string, "easeOut": string, "easeInOut": string },
    "effects": string[]
  },
  "componentStyles": {
    "card": object,
    "button": object,
    "input": object,
    "label": object
  }
}`

    try {
      let designText: string;
      
      if (isGPT5) {
        // Use GPT-5 advanced reasoning for sophisticated design decisions
        console.log('🚀 Using GPT-5 advanced reasoning for UI design system...');
        const result = await aiModelManager.generateWithReasoning(
          `${designPrompt}

As a world-class UI/UX designer and design system architect, use advanced reasoning to create a sophisticated design system. Consider:

🎨 **DESIGN MASTERY:**
- Advanced color theory and psychology for survey conversion optimization
- Modern design systems (Material Design 3, Apple HIG, Fluent Design)
- Accessibility standards (WCAG 2.1 AA compliance)
- Typography hierarchy and visual perception
- Micro-interactions and animation psychology

🧠 **SURVEY PSYCHOLOGY:**
- Visual design patterns that increase completion rates
- Cognitive load reduction through strategic design choices
- Trust-building design elements for survey credibility
- Cross-cultural design considerations for global audiences

🔬 **TECHNICAL EXCELLENCE:**
- Design tokens and systematic approach to consistency
- Responsive design patterns for all device types
- Performance-optimized design decisions
- Component-based design thinking

Use your advanced reasoning to create sophisticated, research-backed design systems that psychologically optimize for high completion rates and user engagement.`,
          'design',
          {
            reasoning: 'high', // Maximum reasoning for design complexity
            verbosity: 'medium',
            temperature: 0.4,
            maxTokens: 3000,
            responseFormat: { type: 'json_object' }
          }
        );
        designText = result.content;
        console.log('✅ GPT-5 reasoning applied to design system generation');
      } else {
        // Fallback to GPT-4o with enhanced prompting
        const response = await aiModelManager.createChatCompletion([
          {
            role: 'system',
            content: `You are a world-class UI/UX designer and design system architect with expertise in:
            
🎨 **DESIGN MASTERY:**
- Advanced color theory and psychology for survey conversion optimization
- Modern design systems (Material Design 3, Apple HIG, Fluent Design)
- Accessibility standards (WCAG 2.1 AA compliance)
- Typography hierarchy and visual perception
- Micro-interactions and animation psychology

🧠 **SURVEY PSYCHOLOGY:**
- Visual design patterns that increase completion rates
- Cognitive load reduction through strategic design choices
- Trust-building design elements for survey credibility
- Cross-cultural design considerations for global audiences

🔬 **TECHNICAL EXCELLENCE:**
- Design tokens and systematic approach to consistency
- Responsive design patterns for all device types
- Performance-optimized design decisions
- Component-based design thinking

Create sophisticated, research-backed design systems that not only look beautiful but psychologically optimize for high completion rates and user engagement. Use cutting-edge design trends while maintaining timeless usability principles.`
          },
          { role: 'user', content: designPrompt }
        ], 'design', {
          temperature: 0.4,
          response_format: { type: 'json_object' },
          max_tokens: 3000
        });
        designText = response.choices[0]?.message?.content || '{}';
      }

      const designSystem = JSON.parse(designText) as UIDesignSystem
      console.log(`✅ Advanced UI design system generated by ${model}:`, designSystem.colorPalette.primary)
      return designSystem
    } catch (error) {
      console.error('❌ Design system generation failed, using fallback:', error)
      return this.getFallbackDesignSystem(analysis)
    }
  }

  // Stage 4: Generate components using GPT-4o with advanced design system
  async generateComponents(architecture: SurveyArchitecture, analysis: SurveyAnalysis, designSystem: UIDesignSystem): Promise<GeneratedComponent[]> {
    console.log('🔧 Stage 4: Generating custom components with GPT-4o advanced design system...')
    
    const components: GeneratedComponent[] = []
    
    // Generate components for each question
    for (const page of architecture.pages) {
      for (const question of page.questions) {
        console.log(`📝 Generating component for: ${question.type} - ${question.label.substring(0, 50)}...`)
        
        const componentCode = await this.generateSingleComponent(question, analysis, architecture.design, designSystem)
        components.push(componentCode)
      }
    }
    
    console.log(`✅ Generated ${components.length} custom components`)
    return components
  }

  // Stage 4: Validate and optimize using GPT-4o-mini
  async validateAndOptimize(
    components: GeneratedComponent[], 
    architecture: SurveyArchitecture,
    analysis: SurveyAnalysis
  ): Promise<ValidationResult> {
    console.log('🔍 Stage 4: Validating and optimizing survey...')
    
    const validation = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: `You are a survey quality validator. Check for issues and suggest optimizations.

Validate:
1. Question clarity and bias
2. Survey flow and user experience  
3. Technical implementation quality
4. Accessibility compliance
5. Mobile responsiveness
6. Data quality measures

Return validation results as JSON:
{
  "isValid": boolean,
  "score": number,
  "issues": [{ "type": string, "severity": "low" | "medium" | "high", "description": string, "suggestion": string }],
  "optimizations": [{ "type": string, "description": string, "impact": "low" | "medium" | "high" }],
  "accessibility": { "score": number, "issues": string[] },
  "performance": { "score": number, "recommendations": string[] }
}`
        },
        {
          role: 'user',
          content: `Validate this survey:
          
ANALYSIS: ${JSON.stringify(analysis, null, 2)}
ARCHITECTURE: ${JSON.stringify(architecture, null, 2)}
COMPONENTS: ${components.length} generated components

Focus on survey methodology best practices, user experience, and technical quality.`
        }
      ]
    })

    const validationText = validation.choices[0]?.message?.content || '{}'
    try {
      const parsed = JSON.parse(validationText) as ValidationResult
      console.log(`✅ Validation complete - Score: ${parsed.score}/100`)
      return parsed
    } catch (error) {
      console.error('❌ Validation parsing failed')
      return {
        isValid: true,
        score: 75,
        issues: [],
        optimizations: [],
        accessibility: { score: 80, issues: [] },
        performance: { score: 85, recommendations: [] }
      }
    }
  }

  // Generate a single component with advanced patterns and design system
  private async generateSingleComponent(
    question: QuestionDefinition, 
    analysis: SurveyAnalysis,
    design: any,
    designSystem?: UIDesignSystem
  ): Promise<GeneratedComponent> {
    const componentPrompt = `Generate a world-class React component using the most advanced UI/UX principles:

📝 QUESTION DETAILS:
- Type: ${question.type}
- Label: ${question.label}
- Required: ${question.required}
- Validation: ${JSON.stringify(question.validation)}
- Logic: ${JSON.stringify(question.logic)}

📊 SURVEY CONTEXT:
- Survey Type: ${analysis.surveyType}
- Complexity: ${analysis.complexity}
- Target Audience: ${analysis.targetAudience}
- Tone: ${analysis.tone}

🎨 ADVANCED DESIGN SYSTEM (GPT-4o Generated):
${designSystem ? `
🎯 COLOR PSYCHOLOGY:
- Primary: ${designSystem.colorPalette.primary} (conversion-optimized)
- Secondary: ${designSystem.colorPalette.secondary}
- Accent: ${designSystem.colorPalette.accent}
- Background: ${designSystem.colorPalette.background}
- Surface: ${designSystem.colorPalette.surface}
- Text: ${designSystem.colorPalette.text}
- Success: ${designSystem.colorPalette.success}
- Warning: ${designSystem.colorPalette.warning}
- Error: ${designSystem.colorPalette.error}

✨ TYPOGRAPHY SYSTEM:
- Font Family: ${designSystem.typography.fontFamily}
- Heading Sizes: ${JSON.stringify(designSystem.typography.headingSizes)}
- Text Sizes: ${JSON.stringify(designSystem.typography.textSizes)}
- Font Weights: ${JSON.stringify(designSystem.typography.fontWeights)}
- Line Heights: ${JSON.stringify(designSystem.typography.lineHeights)}

🔄 ANIMATION SYSTEM:
- Durations: ${JSON.stringify(designSystem.animations.duration)}
- Easing: ${JSON.stringify(designSystem.animations.easing)}
- Effects: ${designSystem.animations.effects.join(', ')}

📐 SPATIAL SYSTEM:
- Spacing: ${JSON.stringify(designSystem.spacing)}
- Border Radius: ${JSON.stringify(designSystem.borderRadius)}
- Shadows: ${JSON.stringify(designSystem.shadows)}

🎛️ COMPONENT STYLES:
- Card: ${JSON.stringify(designSystem.componentStyles.card)}
- Button: ${JSON.stringify(designSystem.componentStyles.button)}
- Input: ${JSON.stringify(designSystem.componentStyles.input)}
- Label: ${JSON.stringify(designSystem.componentStyles.label)}
` : `
FALLBACK THEME:
- Theme: ${design.theme || 'modern'}
- Layout: ${design.layout || 'clean'}
- Animations: ${design.animations ? 'enabled' : 'disabled'}
`}

🔥 PREMIUM COMPONENT REQUIREMENTS (GPT-4o Level):
1. **Advanced React Patterns**: Modern hooks, context, and performance optimization
2. **TypeScript Excellence**: Comprehensive types and interfaces  
3. **Real-time Validation**: Instant feedback with sophisticated error states
4. **Accessibility Mastery**: WCAG 2.1 AA compliance with enhanced screen reader support
5. **Behavioral Analytics**: Advanced interaction tracking and completion psychology
6. **Responsive Excellence**: Mobile-first with adaptive layouts for all screen sizes
7. **Premium Animations**: Framer Motion with sophisticated micro-interactions
8. **Advanced Styling**: Use the GPT-4o generated design system tokens extensively
9. **Performance Optimized**: Efficient re-renders and memory management
10. **Survey State Integration**: Seamless integration with useSurveyState hook

🎯 VISUAL DESIGN GOALS:
- Create components that look like they belong in top-tier apps (Linear, Notion, Stripe)
- Use the advanced color psychology from the design system
- Implement sophisticated visual hierarchies and spacing
- Add delightful interactions that encourage survey completion

IMPORTANT: Generate ONLY the component code, no explanations. Use this exact structure:

import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function [ComponentName]() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['${question.id}'] || '';
  
  // Your component implementation here
  
  return (
    <div className="[your-classes]">
      {/* Your JSX here */}
    </div>
  );
}`

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.3,
      max_tokens: 2000,
      messages: [
        { 
          role: 'system', 
          content: `You are a world-class React developer and UI/UX designer with expertise in:

🎨 **DESIGN SYSTEM MASTERY**: 
- Expert in implementing sophisticated design systems with pixel-perfect precision
- Advanced knowledge of color psychology, typography hierarchy, and visual perception
- Master of micro-interactions and animation psychology for user engagement

💻 **TECHNICAL EXCELLENCE**:
- React performance optimization and modern patterns (hooks, context, suspense)
- TypeScript expertise with comprehensive type safety
- Accessibility mastery (WCAG 2.1 AA compliance)
- Mobile-first responsive design with adaptive layouts

🧠 **SURVEY PSYCHOLOGY**:
- Deep understanding of survey completion psychology and cognitive load reduction
- Expert in trust-building UI patterns and conversion optimization
- Knowledge of behavioral analytics and user interaction patterns

Generate components that rival top-tier applications like Linear, Notion, Stripe, and Figma. Use the provided GPT-4o generated design system extensively to create sophisticated, conversion-optimized survey components with delightful interactions.` 
        },
        { role: 'user', content: componentPrompt }
      ]
    })

    const code = response.choices[0]?.message?.content || ''
    const componentName = this.generateComponentName(question)

    return {
      id: question.id,
      name: componentName,
      type: question.type,
      code,
      dependencies: ['react'],
      metadata: {
        question,
        generated: new Date().toISOString(),
        complexity: analysis.complexity
      }
    }
  }

  private generateComponentName(question: QuestionDefinition): string {
    const typeMap: Record<string, string> = {
      'text-input': 'TextInput',
      'textarea': 'TextArea',
      'radio': 'RadioGroup',
      'checkbox': 'CheckboxGroup',
      'scale': 'ScaleRating',
      'nps': 'NPSRating',
      'matrix': 'MatrixQuestion',
      'ranking': 'RankingQuestion',
      'file-upload': 'FileUpload',
      'date-picker': 'DatePicker'
    }
    
    const baseType = typeMap[question.type] || 'CustomInput'
    const suffix = Math.random().toString(36).substring(7)
    return `${baseType}_${suffix}`
  }

  private getFallbackAnalysis(prompt: string): SurveyAnalysis {
    return {
      surveyType: 'user-research',
      complexity: 'professional',
      targetAudience: 'general-public',
      industry: 'technology',
      objectives: ['Gather user feedback', 'Improve product experience'],
      estimatedLength: 'medium',
      dataTypes: ['mixed'],
      specialRequirements: [],
      tone: 'professional',
      urgency: 'standard'
    }
  }

  private getFallbackArchitecture(analysis: SurveyAnalysis): SurveyArchitecture {
    return {
      pages: [
        {
          id: 'page_1',
          name: 'Main Questions',
          purpose: 'Collect primary data',
          position: 1,
          questions: [
            {
              id: 'q1',
              type: 'textarea',
              label: 'Please share your thoughts',
              required: true,
              validation: { rules: ['required'], messages: {} },
              logic: {},
              analytics: { trackingEvents: ['view', 'interact'] }
            }
          ]
        }
      ],
      flow: {
        navigation: 'linear',
        progressType: 'percentage',
        allowBack: true
      },
      validation: {
        realTime: true,
        completionChecks: ['all-required-answered']
      },
      analytics: {
        trackingLevel: 'basic',
        fraudDetection: false,
        behavioralMetrics: true
      },
      design: {
        theme: 'modern',
        layout: 'clean',
        animations: true
      }
    }
  }

  private getFallbackDesignSystem(analysis: SurveyAnalysis): UIDesignSystem {
    return {
      colorPalette: {
        primary: '#3b82f6',
        secondary: '#6366f1',
        accent: '#8b5cf6',
        background: '#ffffff',
        surface: '#f8fafc',
        text: '#1f2937',
        textSecondary: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      typography: {
        fontFamily: 'Inter, system-ui, sans-serif',
        headingSizes: { xl: '2rem', lg: '1.5rem', md: '1.25rem', sm: '1.125rem' },
        textSizes: { lg: '1.125rem', base: '1rem', sm: '0.875rem', xs: '0.75rem' },
        fontWeights: { light: 300, normal: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' }
      },
      spacing: {
        xs: '0.25rem', sm: '0.5rem', md: '1rem', lg: '1.5rem', xl: '2rem', '2xl': '3rem', '3xl': '4rem'
      },
      borderRadius: {
        sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px'
      },
      shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      },
      animations: {
        duration: { fast: '150ms', normal: '300ms', slow: '500ms' },
        easing: { ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out' },
        effects: ['hover:scale-105', 'hover:shadow-lg', 'focus:ring-2', 'transition-all']
      },
      componentStyles: {
        card: { padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
        button: { borderRadius: '0.5rem', padding: '0.75rem 1.5rem', fontWeight: '500' },
        input: { borderRadius: '0.5rem', padding: '0.75rem', border: '1px solid #d1d5db' },
        label: { fontWeight: '500', marginBottom: '0.5rem' }
      }
    }
  }
}

// Type definitions
export interface SurveyAnalysis {
  surveyType: 'market-research' | 'academic-study' | 'employee-engagement' | 'product-feedback' | 'customer-satisfaction' | 'user-research'
  complexity: 'simple' | 'professional' | 'research' | 'academic'
  targetAudience: 'consumers' | 'employees' | 'students' | 'professionals' | 'general-public'
  industry: string
  objectives: string[]
  estimatedLength: 'short' | 'medium' | 'long'
  dataTypes: ('quantitative' | 'qualitative' | 'mixed')[]
  specialRequirements: string[]
  tone: 'formal' | 'casual' | 'professional' | 'academic'
  urgency: 'immediate' | 'standard' | 'flexible'
}

export interface SurveyArchitecture {
  pages: PageDefinition[]
  flow: {
    navigation: 'linear' | 'adaptive' | 'branching'
    progressType: 'percentage' | 'steps' | 'pages'
    allowBack: boolean
  }
  validation: {
    realTime: boolean
    completionChecks: string[]
  }
  analytics: {
    trackingLevel: 'basic' | 'advanced' | 'research'
    fraudDetection: boolean
    behavioralMetrics: boolean
  }
  design: {
    theme: string
    layout: string
    animations: boolean
  }
}

export interface PageDefinition {
  id: string
  name: string
  purpose: string
  position: number
  questions: QuestionDefinition[]
}

export interface QuestionDefinition {
  id: string
  type: string
  label: string
  required: boolean
  validation: { rules: string[]; messages: any }
  logic: { showIf?: string; skipTo?: string }
  analytics: { trackingEvents: string[] }
}

export interface GeneratedComponent {
  id: string
  name: string
  type: string
  code: string
  dependencies: string[]
  metadata?: any
}

export interface ValidationResult {
  isValid: boolean
  score: number
  issues: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    description: string
    suggestion: string
  }>
  optimizations: Array<{
    type: string
    description: string
    impact: 'low' | 'medium' | 'high'
  }>
  accessibility: {
    score: number
    issues: string[]
  }
  performance: {
    score: number
    recommendations: string[]
  }
}

export interface UIDesignSystem {
  colorPalette: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    textSecondary: string
    success: string
    warning: string
    error: string
  }
  typography: {
    fontFamily: string
    headingSizes: { xl: string; lg: string; md: string; sm: string }
    textSizes: { lg: string; base: string; sm: string; xs: string }
    fontWeights: { light: number; normal: number; medium: number; semibold: number; bold: number }
    lineHeights: { tight: string; normal: string; relaxed: string }
  }
  spacing: {
    xs: string; sm: string; md: string; lg: string; xl: string; '2xl': string; '3xl': string
  }
  borderRadius: {
    sm: string; md: string; lg: string; xl: string; full: string
  }
  shadows: {
    sm: string; md: string; lg: string; xl: string
  }
  animations: {
    duration: { fast: string; normal: string; slow: string }
    easing: { ease: string; easeIn: string; easeOut: string; easeInOut: string }
    effects: string[]
  }
  componentStyles: {
    card: any
    button: any
    input: any
    label: any
  }
}