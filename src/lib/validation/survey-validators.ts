import { SurveyComponent } from '@/lib/schemas/survey-schemas'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface AccuracyCheck {
  type: 'attention_check' | 'consistency_check' | 'speed_check' | 'pattern_check'
  componentId: string
  threshold: number
  action: 'flag' | 'discard' | 'weight'
  description: string
}

export class SurveyValidator {
  private components: SurveyComponent[] = []
  private accuracyChecks: AccuracyCheck[] = []

  constructor(components: SurveyComponent[], accuracyChecks: AccuracyCheck[] = []) {
    this.components = components
    this.accuracyChecks = accuracyChecks
  }

  validateResponse(componentId: string, value: any): ValidationResult {
    const component = this.components.find(c => c.id === componentId)
    if (!component) {
      return { isValid: false, errors: ['Component not found'], warnings: [] }
    }

    const errors: string[] = []
    const warnings: string[] = []

    // Required field validation
    if (component.required && (value === undefined || value === null || value === '')) {
      errors.push('This field is required')
    }

    // Type-specific validation
    if (value !== undefined && value !== null && value !== '') {
      switch (component.type) {
        case 'text-input':
        case 'textarea':
          this.validateTextInput(component, value, errors, warnings)
          break
        case 'select':
        case 'radio':
          this.validateSingleChoice(component, value, errors, warnings)
          break
        case 'multiselect':
        case 'checkbox':
          this.validateMultipleChoice(component, value, errors, warnings)
          break
        case 'scale':
        case 'slider':
          this.validateNumericInput(component, value, errors, warnings)
          break
        case 'email':
          this.validateEmail(value, errors, warnings)
          break
        case 'url':
          this.validateUrl(value, errors, warnings)
          break
        case 'phone':
          this.validatePhone(value, errors, warnings)
          break
        case 'date-picker':
          this.validateDate(value, errors, warnings)
          break
        case 'nps':
          this.validateNPS(value, errors, warnings)
          break
      }
    }

    // Custom validation rules
    if (component.validation?.pattern && value) {
      try {
        const regex = new RegExp(component.validation.pattern)
        if (!regex.test(String(value))) {
          errors.push('Please enter a valid format')
        }
      } catch {
        warnings.push('Invalid validation pattern')
      }
    }

    // Custom validator function
    if (component.validation?.customValidator && value) {
      try {
        const fn = new Function('value', 'responses', component.validation.customValidator)
        const result = fn(value, this.getAllResponses())
        if (result !== true) {
          errors.push(typeof result === 'string' ? result : 'Validation failed')
        }
      } catch (error) {
        warnings.push('Custom validation function error')
      }
    }

    return { isValid: errors.length === 0, errors, warnings }
  }

  validateAllResponses(responses: Record<string, any>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {}
    
    this.components.forEach(component => {
      const value = responses[component.id]
      results[component.id] = this.validateResponse(component.id, value)
    })

    return results
  }

  runAccuracyChecks(responses: Record<string, any>, behavioralData: Record<string, any> = {}): AccuracyCheck[] {
    const failedChecks: AccuracyCheck[] = []

    this.accuracyChecks.forEach(check => {
      switch (check.type) {
        case 'attention_check':
          if (this.checkAttention(check, responses)) {
            failedChecks.push(check)
          }
          break
        case 'consistency_check':
          if (this.checkConsistency(check, responses)) {
            failedChecks.push(check)
          }
          break
        case 'speed_check':
          if (this.checkResponseSpeed(check, behavioralData)) {
            failedChecks.push(check)
          }
          break
        case 'pattern_check':
          if (this.checkResponsePattern(check, responses)) {
            failedChecks.push(check)
          }
          break
      }
    })

    return failedChecks
  }

  private validateTextInput(component: SurveyComponent, value: string, errors: string[], warnings: string[]) {
    const validation = component.validation
    if (!validation) return

    if (validation.minLength && value.length < validation.minLength) {
      errors.push(`Please enter at least ${validation.minLength} characters`)
    }

    if (validation.maxLength && value.length > validation.maxLength) {
      errors.push(`Please enter no more than ${validation.maxLength} characters`)
    }

    // Check for common quality issues
    if (value.length < 10 && component.type === 'textarea') {
      warnings.push('Response seems quite short for this question')
    }

    if (/^(.)\1{4,}/.test(value)) {
      warnings.push('Response contains repeated characters')
    }
  }

  private validateSingleChoice(component: SurveyComponent, value: string, errors: string[], warnings: string[]) {
    const options = component.validation?.options || component.props?.options || []
    if (options.length > 0 && !options.includes(value)) {
      errors.push('Please select a valid option')
    }
  }

  private validateMultipleChoice(component: SurveyComponent, value: string[], errors: string[], warnings: string[]) {
    if (!Array.isArray(value)) {
      errors.push('Invalid selection format')
      return
    }

    const options = component.validation?.options || component.props?.options || []
    const invalidSelections = value.filter(v => !options.includes(v))
    if (invalidSelections.length > 0) {
      errors.push('Some selections are invalid')
    }

    // Check for minimum/maximum selections
    const minSelections = component.props?.minSelections || 0
    const maxSelections = component.props?.maxSelections || options.length

    if (value.length < minSelections) {
      errors.push(`Please select at least ${minSelections} option(s)`)
    }

    if (value.length > maxSelections) {
      errors.push(`Please select no more than ${maxSelections} option(s)`)
    }
  }

  private validateNumericInput(component: SurveyComponent, value: number, errors: string[], warnings: string[]) {
    const validation = component.validation
    if (!validation) return

    if (validation.min !== undefined && value < validation.min) {
      errors.push(`Value must be at least ${validation.min}`)
    }

    if (validation.max !== undefined && value > validation.max) {
      errors.push(`Value must be no more than ${validation.max}`)
    }
  }

  private validateEmail(value: string, errors: string[], warnings: string[]) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      errors.push('Please enter a valid email address')
    }
  }

  private validateUrl(value: string, errors: string[], warnings: string[]) {
    try {
      new URL(value)
    } catch {
      errors.push('Please enter a valid URL')
    }
  }

  private validatePhone(value: string, errors: string[], warnings: string[]) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
      errors.push('Please enter a valid phone number')
    }
  }

  private validateDate(value: string, errors: string[], warnings: string[]) {
    const date = new Date(value)
    if (isNaN(date.getTime())) {
      errors.push('Please enter a valid date')
    }
  }

  private validateNPS(value: number, errors: string[], warnings: string[]) {
    if (value < 0 || value > 10 || !Number.isInteger(value)) {
      errors.push('NPS score must be an integer between 0 and 10')
    }
  }

  private checkAttention(check: AccuracyCheck, responses: Record<string, any>): boolean {
    const response = responses[check.componentId]
    // Example: attention check might require a specific answer
    const expectedAnswer = check.threshold // Could be the expected response
    return response !== expectedAnswer
  }

  private checkConsistency(check: AccuracyCheck, responses: Record<string, any>): boolean {
    // Example: check if related questions have consistent answers
    // This would need to be configured per survey
    return false // Placeholder
  }

  private checkResponseSpeed(check: AccuracyCheck, behavioralData: Record<string, any>): boolean {
    const responseTime = behavioralData[`${check.componentId}_response_time`]
    if (typeof responseTime === 'number') {
      return responseTime < check.threshold // Too fast = suspicious
    }
    return false
  }

  private checkResponsePattern(check: AccuracyCheck, responses: Record<string, any>): boolean {
    // Check for patterns like straight-lining (all same answers)
    const values = Object.values(responses)
    const uniqueValues = new Set(values)
    return uniqueValues.size < values.length * 0.3 // Less than 30% unique responses
  }

  private getAllResponses(): Record<string, any> {
    return logicEngine.exportState().responses
  }
}

// Hook for component-level validation
export function useComponentValidation(componentId: string, validator: SurveyValidator) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({ 
    isValid: true, 
    errors: [], 
    warnings: [] 
  })

  const validate = useCallback((value: any) => {
    const result = validator.validateResponse(componentId, value)
    setValidationResult(result)
    return result
  }, [componentId, validator])

  return { validationResult, validate }
}
