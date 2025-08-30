import OpenAI from 'openai'
import { SurveyComponentData } from '@/components/survey/builder/VisualSurveyBuilder'

export interface StyleCustomizationRequest {
  prompt: string // e.g., "make the buttons rounder", "add shadow", "use dark theme"
  targetComponent?: string // specific component ID, or all if undefined
  currentComponents: SurveyComponentData[]
}

export interface StyleCustomizationResult {
  success: boolean
  updatedComponents: SurveyComponentData[]
  changes: Array<{
    componentId: string
    property: string
    oldValue: any
    newValue: any
    description: string
  }>
  summary: string
  error?: string
}

export class AIStyleCustomizer {
  private openai: OpenAI | null = null

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (apiKey && apiKey.trim()) {
      this.openai = new OpenAI({ apiKey })
    } else {
      console.warn('⚠️ OpenAI API key not configured - falling back to pattern matching')
    }
  }

  async customizeStyles(request: StyleCustomizationRequest): Promise<StyleCustomizationResult> {
    console.log('🎨 AI Style Customization:', request.prompt)

    try {
      if (!this.openai) {
        return this.generateFallbackCustomization(request)
      }

      const systemPrompt = `You are an expert UI/UX designer and CSS specialist. You understand natural language style requests and convert them into precise CSS property changes.

CAPABILITIES:
- Parse natural language style requests
- Generate CSS properties for component styling
- Understand design terminology (modern, minimal, glassmorphism, etc.)
- Apply consistent design principles
- Handle component-specific styling

STYLE PROPERTIES YOU CAN MODIFY:
Container: backgroundColor, borderRadius, boxShadow, padding, margin, border, transform
Label: fontSize, fontWeight, color, marginBottom, textAlign
Input: borderRadius, borderWidth, borderColor, backgroundColor, padding, boxShadow, fontSize

COMMON STYLE COMMANDS:
- "make rounder/more rounded" → increase borderRadius
- "add shadow/drop shadow" → add boxShadow
- "make darker/lighter" → adjust backgroundColor/color
- "increase padding/spacing" → adjust padding
- "make bigger/smaller" → adjust fontSize/padding
- "glassmorphism effect" → backdrop-blur, transparency, borders
- "minimal style" → remove shadows, thin borders, clean
- "modern style" → rounded corners, subtle shadows, good spacing

OUTPUT FORMAT:
Return JSON with this exact structure:
{
  "success": true,
  "updatedComponents": [array of components with modified style properties],
  "changes": [
    {
      "componentId": "q1",
      "property": "container.borderRadius", 
      "oldValue": "8px",
      "newValue": "16px",
      "description": "Increased border radius for rounder appearance"
    }
  ],
  "summary": "Made all components more rounded with increased border radius"
}`

      const userPrompt = `Style customization request: "${request.prompt}"

Current components:
${JSON.stringify(request.currentComponents.map(c => ({
  id: c.id,
  type: c.type,
  label: c.label,
  currentStyle: c.style || {}
})), null, 2)}

${request.targetComponent ? `Target component: ${request.targetComponent}` : 'Apply to all relevant components'}

Parse this request and generate the updated component styles. Consider the context and apply appropriate CSS changes.`

      const response = await this.openai!.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 2000
      })

      const result = JSON.parse(response.choices[0]?.message?.content || '{}')
      
      // Validate and sanitize the result
      if (!result.success || !Array.isArray(result.updatedComponents)) {
        throw new Error('Invalid AI response format')
      }

      console.log('✅ AI style customization completed:', result.summary)
      return result as StyleCustomizationResult

    } catch (error) {
      console.error('❌ AI style customization failed:', error)
      return {
        success: false,
        updatedComponents: request.currentComponents,
        changes: [],
        summary: 'Style customization failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Parse simple style commands without AI (faster for common requests)
  parseSimpleStyleCommands(request: StyleCustomizationRequest): StyleCustomizationResult | null {
    const prompt = request.prompt.toLowerCase()
    const changes: any[] = []
    const updatedComponents = [...request.currentComponents]

    // Simple pattern matching for common commands
    if (prompt.includes('rounder') || prompt.includes('more rounded')) {
      updatedComponents.forEach(component => {
        const currentRadius = component.style?.input?.borderRadius || '8px'
        const currentValue = parseInt(currentRadius)
        const newValue = Math.min(currentValue + 8, 24)
        
        component.style = {
          ...component.style,
          input: {
            ...component.style?.input,
            borderRadius: `${newValue}px`
          }
        }

        changes.push({
          componentId: component.id,
          property: 'input.borderRadius',
          oldValue: currentRadius,
          newValue: `${newValue}px`,
          description: 'Increased border radius for rounder appearance'
        })
      })

      return {
        success: true,
        updatedComponents,
        changes,
        summary: 'Made components more rounded'
      }
    }

    if (prompt.includes('add shadow') || prompt.includes('drop shadow')) {
      updatedComponents.forEach(component => {
        component.style = {
          ...component.style,
          container: {
            ...component.style?.container,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }
        }

        changes.push({
          componentId: component.id,
          property: 'container.boxShadow',
          oldValue: component.style?.container?.boxShadow || 'none',
          newValue: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          description: 'Added drop shadow'
        })
      })

      return {
        success: true,
        updatedComponents,
        changes,
        summary: 'Added drop shadows to components'
      }
    }

    if (prompt.includes('bigger') || prompt.includes('larger')) {
      updatedComponents.forEach(component => {
        const currentSize = component.style?.label?.fontSize || '1.1rem'
        const currentValue = parseFloat(currentSize)
        const newValue = Math.min(currentValue + 0.1, 1.5)
        
        component.style = {
          ...component.style,
          label: {
            ...component.style?.label,
            fontSize: `${newValue}rem`
          }
        }

        changes.push({
          componentId: component.id,
          property: 'label.fontSize',
          oldValue: currentSize,
          newValue: `${newValue}rem`,
          description: 'Increased font size'
        })
      })

      return {
        success: true,
        updatedComponents,
        changes,
        summary: 'Increased component text size'
      }
    }

    return null // No simple pattern matched, use AI
  }

  private generateFallbackCustomization(request: StyleCustomizationRequest): StyleCustomizationResult {
    console.log('🔄 Using fallback style customization')
    
    // Try simple pattern matching first
    const simpleResult = this.parseSimpleStyleCommands(request)
    if (simpleResult) {
      return simpleResult
    }

    // Generic fallback
    return {
      success: false,
      updatedComponents: request.currentComponents,
      changes: [],
      summary: 'Style customization not available (API key required)',
      error: 'OpenAI API key not configured'
    }
  }

  // Generate style suggestions based on component types and current state
  generateStyleSuggestions(components: SurveyComponentData[]): string[] {
    const suggestions = [
      'Make components more rounded',
      'Add subtle shadows',
      'Use a darker theme',
      'Make text larger',
      'Add glassmorphism effect',
      'Use minimal design',
      'Increase spacing',
      'Make buttons more prominent'
    ]

    // Add context-specific suggestions
    const hasScaleComponents = components.some(c => c.type === 'scale' || c.type === 'nps')
    if (hasScaleComponents) {
      suggestions.push('Make rating scales more colorful')
    }

    const hasTextComponents = components.some(c => c.type === 'text-input' || c.type === 'textarea')
    if (hasTextComponents) {
      suggestions.push('Style input fields with better focus states')
    }

    return suggestions
  }
}

export const aiStyleCustomizer = new AIStyleCustomizer()