// Advanced Survey Generator - Integrates all phases like v0/Lovable
// Multi-model AI pipeline + Templates + Advanced components

import { SurveyAIPipeline, SurveyAnalysis, SurveyArchitecture, GeneratedComponent, UIDesignSystem } from './multi-model-pipeline'
import { surveyTemplates, selectTemplate, customizeTemplate, SurveyTemplateKey } from './survey-templates'
import { AdvancedComponentGenerator } from './advanced-component-generator'
import { SurveyFrontendGenerator } from './survey-frontend-generator'
import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'

interface AdvancedGenerationInput {
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
  useTemplate?: boolean // Whether to use templates or pure AI generation
}

export class AdvancedSurveyGenerator {
  private pipeline: SurveyAIPipeline
  private componentGenerator: AdvancedComponentGenerator
  private frontendGenerator: SurveyFrontendGenerator

  constructor() {
    this.pipeline = new SurveyAIPipeline()
    this.componentGenerator = new AdvancedComponentGenerator()
    this.frontendGenerator = new SurveyFrontendGenerator()
  }

  // Main generation method - orchestrates all phases
  async generateAdvancedSurvey(input: AdvancedGenerationInput): Promise<AIGenerationOutput> {
    console.log('🚀 Starting Advanced Survey Generation Pipeline...')
    const startTime = Date.now()

    try {
      // Phase 1: AI Analysis (Multi-model pipeline)
      console.log('📊 Phase 1: Analyzing requirements...')
      const analysis = await this.pipeline.analyzeRequirements(input.prompt)
      
      // Phase 2: Architecture Planning (Template-based or AI-planned)
      console.log('🏗️ Phase 2: Planning architecture...')
      let architecture: SurveyArchitecture
      
      if (input.useTemplate !== false && this.shouldUseTemplate(analysis)) {
        // Use template-based approach (like v0's component library)
        architecture = this.generateFromTemplate(analysis)
        console.log('✅ Using template-based architecture')
      } else {
        // Use pure AI planning (like v0's custom generation)
        architecture = await this.pipeline.planSurveyArchitecture(analysis)
        console.log('✅ Using AI-planned architecture')
      }

      // Phase 3: UI Design System Generation (GPT-4o for design)
      console.log('🎨 Phase 3: Generating UI design system...')
      const designSystem = await this.pipeline.generateUIDesignSystem(analysis, architecture)

      // Phase 4: Component Generation (Advanced component system with design)
      console.log('🔧 Phase 4: Generating components...')
      const components = await this.generateAdvancedComponents(architecture, analysis, designSystem)

      // Phase 5: Validation & Optimization (Quality assurance)
      console.log('🔍 Phase 5: Validating and optimizing...')
      const validation = await this.pipeline.validateAndOptimize(components, architecture, analysis)

      // Phase 6: Assembly & Enhancement (Final polish)
      console.log('✨ Phase 6: Assembling final survey...')
      const finalSurvey = this.assembleFinalSurvey(architecture, components, analysis, validation, designSystem)

      const totalTime = Date.now() - startTime
      console.log(`🎉 Advanced survey generation complete in ${totalTime}ms`)
      console.log(`📝 Generated ${components.length} components across ${architecture.pages.length} pages`)
      console.log(`⭐ Quality score: ${validation.score}/100`)

      const result: AIGenerationOutput = {
        survey: finalSurvey.survey,
        components: finalSurvey.components,
        designSystem: finalSurvey.designSystem,
        validationRules: finalSurvey.validationRules,
        analyticsConfig: finalSurvey.analyticsConfig,
        followUpSuggestions: this.generateFollowUpSuggestions(analysis, validation),
        metadata: {
          generationTime: totalTime,
          qualityScore: validation.score,
          template: input.useTemplate ? this.getUsedTemplate(analysis) : null,
          pipeline: 'advanced-multi-model',
          analysis,
          validation
        }
      }

      return result

    } catch (error) {
      console.error('❌ Advanced generation failed:', error)
      
      // Fallback to basic generation
      console.log('🔄 Falling back to basic generation...')
      return this.generateFallbackSurvey(input)
    }
  }

  // Template-based generation (Phase 2 alternative)
  private generateFromTemplate(analysis: SurveyAnalysis): SurveyArchitecture {
    const templateKey = selectTemplate(analysis)
    if (!templateKey) {
      throw new Error('No suitable template found')
    }

    const template = customizeTemplate(templateKey, analysis)
    console.log(`📋 Using template: ${templateKey}`)
    
    return template.architecture
  }

  // Advanced component generation (Phase 4) - now includes design system
  private async generateAdvancedComponents(
    architecture: SurveyArchitecture, 
    analysis: SurveyAnalysis,
    designSystem: UIDesignSystem
  ): Promise<GeneratedComponent[]> {
    const components: GeneratedComponent[] = []
    const theme = architecture.design?.theme || 'modern-gradient'

    // Generate components for each question using the advanced generator
    for (const page of architecture.pages) {
      for (const question of page.questions) {
        console.log(`🔧 Generating advanced component: ${question.type} - ${question.label.substring(0, 40)}...`)
        
        try {
          const componentCode = this.componentGenerator.generateComponent(question, analysis, theme)
          
          components.push({
            id: question.id,
            name: this.generateComponentName(question),
            type: question.type,
            code: componentCode,
            dependencies: ['react', 'framer-motion'],
            metadata: {
              question,
              theme,
              complexity: analysis.complexity,
              designSystem,
              generatedAt: new Date().toISOString()
            }
          })
        } catch (error) {
          console.error(`❌ Failed to generate component ${question.id}:`, error)
          
          // Fallback to pipeline component generation with design system
          const fallbackComponent = await this.pipeline.generateComponents(
            { ...architecture, pages: [{ ...page, questions: [question] }] },
            analysis,
            designSystem
          )
          
          if (fallbackComponent.length > 0) {
            components.push(fallbackComponent[0])
          }
        }
      }
    }

    return components
  }

  // Final assembly (Phase 6)
  private assembleFinalSurvey(
    architecture: SurveyArchitecture,
    components: GeneratedComponent[],
    analysis: SurveyAnalysis,
    validation: any,
    designSystem: UIDesignSystem
  ) {
    const theme = this.generateTheme(architecture.design?.theme || 'modern-gradient', analysis)
    
    return {
      survey: {
        id: `survey_${Date.now()}`,
        title: this.generateSurveyTitle(analysis),
        description: this.generateSurveyDescription(analysis),
        pages: architecture.pages.map(page => ({
          ...page,
          components: page.questions.map(q => {
            const component = components.find(c => c.id === q.id)
            return {
              id: q.id,
              type: q.type,
              label: q.label,
              required: q.required,
              position: page.questions.indexOf(q) + 1,
              pageId: page.id,
              validation: q.validation,
              analytics: q.analytics,
              style: theme.componentStyle,
              accessibility: {
                ariaLabel: q.label,
                role: this.getAriaRole(q.type),
                describedBy: `${q.id}-help`
              }
            }
          })
        })),
        theme,
        settings: {
          showProgress: architecture.flow.progressType !== 'none',
          allowBack: architecture.flow.allowBack,
          progressType: architecture.flow.progressType,
          navigation: architecture.flow.navigation
        },
        analytics: {
          trackingLevel: architecture.analytics.trackingLevel,
          behavioralMetrics: architecture.analytics.behavioralMetrics,
          fraudDetection: architecture.analytics.fraudDetection
        },
        metadata: {
          createdAt: new Date(),
          updatedAt: new Date(),
          creatorId: 'ai-generator',
          version: '2.0',
          originalPrompt: analysis.objectives.join('; '),
          tags: [analysis.surveyType, analysis.complexity, analysis.industry],
          estimatedTime: this.estimateCompletionTime(components.length, analysis.complexity)
        }
      },
      components,
      designSystem: designSystem, // Use the AI-generated design system
      validationRules: this.generateValidationRules(architecture, components),
      analyticsConfig: this.generateAnalyticsConfig(architecture, analysis)
    }
  }

  // Helper methods
  private shouldUseTemplate(analysis: SurveyAnalysis): boolean {
    // Use templates for common survey types and simpler complexity
    const commonTypes = ['market-research', 'customer-satisfaction', 'employee-engagement', 'product-feedback']
    const simpleComplexity = ['simple', 'professional']
    
    return commonTypes.includes(analysis.surveyType) && simpleComplexity.includes(analysis.complexity)
  }

  private getUsedTemplate(analysis: SurveyAnalysis): string | null {
    return selectTemplate(analysis)
  }

  private generateComponentName(question: any): string {
    const typeMap: Record<string, string> = {
      'text-input': 'TextInput',
      'textarea': 'TextArea',
      'radio': 'RadioGroup',
      'checkbox': 'CheckboxGroup',
      'scale': 'ScaleRating',
      'nps': 'NPSRating',
      'matrix': 'MatrixQuestion',
      'ranking': 'RankingQuestion'
    }
    
    const baseType = typeMap[question.type] || 'CustomInput'
    return `Advanced${baseType}_${question.id}`
  }

  private generateSurveyTitle(analysis: SurveyAnalysis): string {
    const titles = {
      'market-research': 'Market Research Survey',
      'academic-study': 'Research Study Questionnaire',
      'employee-engagement': 'Employee Engagement Survey',
      'product-feedback': 'Product Feedback Survey',
      'customer-satisfaction': 'Customer Satisfaction Survey',
      'user-research': 'User Experience Research'
    }
    
    return titles[analysis.surveyType] || 'Survey'
  }

  private generateSurveyDescription(analysis: SurveyAnalysis): string {
    const descriptions = {
      'market-research': 'Help us understand market trends and consumer preferences.',
      'academic-study': 'Your participation in this research study is valuable for advancing knowledge.',
      'employee-engagement': 'Share your thoughts to help us improve our workplace.',
      'product-feedback': 'Your feedback helps us build better products.',
      'customer-satisfaction': 'Tell us about your experience with our service.',
      'user-research': 'Help us understand how you use our product.'
    }
    
    return descriptions[analysis.surveyType] || 'Please share your thoughts by completing this survey.'
  }

  private generateTheme(themeName: string, analysis: SurveyAnalysis) {
    const baseThemes = {
      'modern-gradient': {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        accentColor: '#06b6d4'
      },
      'professional-blue': {
        primaryColor: '#1e40af',
        secondaryColor: '#3b82f6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        accentColor: '#60a5fa'
      },
      'academic-neutral': {
        primaryColor: '#374151',
        secondaryColor: '#6b7280',
        backgroundColor: '#ffffff',
        textColor: '#111827',
        accentColor: '#9ca3af'
      }
    }

    const theme = baseThemes[themeName as keyof typeof baseThemes] || baseThemes['modern-gradient']
    
    return {
      ...theme,
      fontFamily: 'Inter, system-ui, sans-serif',
      borderRadius: 12,
      spacing: 16,
      animations: true,
      componentStyle: {
        padding: '1.5rem',
        borderRadius: '0.75rem',
        shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }
    }
  }

  private generateDesignSystem(theme: any, analysis: SurveyAnalysis) {
    return {
      colors: theme,
      typography: {
        fontSizes: { sm: '14px', md: '16px', lg: '18px', xl: '24px' },
        fontWeights: { normal: 400, medium: 500, semibold: 600, bold: 700 },
        lineHeights: { tight: '1.25', normal: '1.5', relaxed: '1.75' }
      },
      spacing: { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '48px' },
      borderRadius: { sm: '4px', md: '8px', lg: '12px', xl: '16px' },
      shadows: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.15)'
      },
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px'
      }
    }
  }

  private generateValidationRules(architecture: SurveyArchitecture, components: GeneratedComponent[]) {
    const perComponent: Record<string, any> = {}
    
    architecture.pages.forEach(page => {
      page.questions.forEach(question => {
        if (question.validation && question.validation.rules.length > 0) {
          perComponent[question.id] = {
            rules: question.validation.rules,
            errorMessages: question.validation.messages || {}
          }
        }
      })
    })

    return {
      global: {
        minCompletionTime: 30, // seconds
        maxCompletionTime: 3600, // 1 hour
        requireUniqueSession: true
      },
      perComponent
    }
  }

  private generateAnalyticsConfig(architecture: SurveyArchitecture, analysis: SurveyAnalysis) {
    const events = [
      { name: 'survey_started', trigger: 'page_load', data: { timestamp: 'auto', surveyType: analysis.surveyType } },
      { name: 'question_viewed', trigger: 'component_mount', data: { timestamp: 'auto', questionType: 'auto' } },
      { name: 'question_answered', trigger: 'value_change', data: { timestamp: 'auto', responseTime: 'auto' } },
      { name: 'page_completed', trigger: 'page_change', data: { timestamp: 'auto', pageId: 'auto' } },
      { name: 'survey_completed', trigger: 'survey_submit', data: { timestamp: 'auto', totalTime: 'auto' } }
    ]

    const accuracyChecks = []
    
    if (architecture.analytics.fraudDetection) {
      accuracyChecks.push(
        { type: 'response_time', threshold: 1000, action: 'flag' },
        { type: 'straight_line_responses', threshold: 0.8, action: 'warn' },
        { type: 'duplicate_responses', threshold: 1, action: 'block' }
      )
    }

    return { events, accuracyChecks }
  }

  private estimateCompletionTime(componentCount: number, complexity: string): string {
    const baseTime = componentCount * 30 // 30 seconds per question
    const multiplier = {
      'simple': 0.8,
      'professional': 1.0,
      'research': 1.3,
      'academic': 1.5
    }[complexity] || 1.0

    const totalSeconds = Math.round(baseTime * multiplier)
    const minutes = Math.floor(totalSeconds / 60)
    
    return `${minutes}-${minutes + 2} minutes`
  }

  private getAriaRole(questionType: string): string {
    const roleMap: Record<string, string> = {
      'radio': 'radiogroup',
      'checkbox': 'group',
      'scale': 'slider',
      'matrix': 'table',
      'ranking': 'listbox'
    }
    
    return roleMap[questionType] || 'group'
  }

  private generateFollowUpSuggestions(analysis: SurveyAnalysis, validation: any) {
    const suggestions = []

    // Quality-based suggestions
    if (validation.score < 80) {
      suggestions.push({
        id: 'improve_questions',
        text: 'Refine question wording for clarity and reduce potential bias',
        action: 'improve_content',
        priority: 'high' as const
      })
    }

    // Accessibility suggestions
    if (validation.accessibility.score < 90) {
      suggestions.push({
        id: 'enhance_accessibility',
        text: 'Add more accessibility features like keyboard navigation and screen reader support',
        action: 'improve_accessibility',
        priority: 'medium' as const
      })
    }

    // Analytics suggestions
    if (analysis.surveyType === 'academic-study' && !validation.isValid) {
      suggestions.push({
        id: 'add_controls',
        text: 'Add attention check questions and validation controls for research quality',
        action: 'add_validation',
        priority: 'high' as const
      })
    }

    // Design suggestions
    suggestions.push({
      id: 'customize_branding',
      text: 'Customize colors and fonts to match your brand identity',
      action: 'modify_design',
      priority: 'low' as const
    })

    return suggestions
  }

  // Generate complete HTML frontend (like GPT-5 example)
  async generateCompleteSurveyFrontend(
    input: AdvancedGenerationInput,
    saveToFile: boolean = true,
    filename?: string
  ): Promise<{ surveyData: AIGenerationOutput; html: string; filePath?: string }> {
    console.log('🎨 Starting complete survey frontend generation...')
    
    // First generate the survey data
    const surveyData = await this.generateAdvancedSurvey(input)
    
    // Then generate the complete HTML frontend
    const frontendConfig = {
      analysis: surveyData.metadata!.analysis as SurveyAnalysis,
      designSystem: surveyData.designSystem!,
      architecture: {
        pages: surveyData.survey!.pages!,
        flow: surveyData.survey!.settings || { navigation: 'linear', progressType: 'percentage', allowBack: true },
        validation: { realTime: true, completionChecks: ['required'] },
        analytics: surveyData.survey!.analytics || { trackingLevel: 'basic', fraudDetection: false, behavioralMetrics: true },
        design: { theme: 'modern', layout: 'clean', animations: true }
      } as SurveyArchitecture,
      surveyData
    }
    
    if (saveToFile) {
      const result = await this.frontendGenerator.generateAndSaveSurveyFrontend(
        frontendConfig,
        filename || `survey-${Date.now()}.html`
      )
      
      console.log(`🌐 Complete frontend generated: ${result.filePath}`)
      console.log(`📁 Preview URL: ${this.frontendGenerator.generatePreviewUrl(result.filePath)}`)
      
      return {
        surveyData,
        html: result.html,
        filePath: result.filePath
      }
    } else {
      const html = await this.frontendGenerator.generateCompleteSurveyFrontend(frontendConfig)
      return {
        surveyData,
        html
      }
    }
  }

  // Fallback generation
  private async generateFallbackSurvey(input: AdvancedGenerationInput): Promise<AIGenerationOutput> {
    console.log('🔄 Using fallback generation...')
    
    // Use the original fast generator as fallback
    const { generateSurveyComponentsFast } = await import('./survey-generator-fast')
    
    return generateSurveyComponentsFast({
      prompt: input.prompt,
      context: input.context,
      userId: input.userId
    })
  }
}

// Export the main generation function
export async function generateAdvancedSurvey(input: AdvancedGenerationInput): Promise<AIGenerationOutput> {
  const generator = new AdvancedSurveyGenerator()
  return generator.generateAdvancedSurvey(input)
}

// Export complete frontend generation (like the GPT-5 example)
export async function generateCompleteSurveyFrontend(
  input: AdvancedGenerationInput,
  saveToFile: boolean = true,
  filename?: string
): Promise<{ surveyData: AIGenerationOutput; html: string; filePath?: string }> {
  const generator = new AdvancedSurveyGenerator()
  return generator.generateCompleteSurveyFrontend(input, saveToFile, filename)
}