/**
 * Enhanced Error Handling System for Survey Builder
 * Provides actionable error messages and recovery suggestions
 */

import { toast } from "sonner"

export interface ErrorDetails {
  code: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'validation' | 'network' | 'generation' | 'rendering' | 'user_input'
  actionable: boolean
  suggestions: string[]
  canRetry: boolean
  autoRecovery?: () => Promise<boolean>
}

export interface ErrorContext {
  phase: 'thinking' | 'planning' | 'building' | 'validation' | 'rendering'
  userPrompt?: string
  currentHtml?: string
  timestamp: Date
  retryCount?: number
}

/**
 * Enhanced error handler that provides contextual, actionable feedback
 */
export class SurveyErrorHandler {
  private errorHistory: { error: ErrorDetails; context: ErrorContext }[] = []
  private onErrorCallback?: (error: ErrorDetails, context: ErrorContext) => void
  private maxHistoryLength = 50

  constructor(onError?: (error: ErrorDetails, context: ErrorContext) => void) {
    this.onErrorCallback = onError
  }

  /**
   * Process an error and return enhanced error details
   */
  handleError(error: string | Error, context: ErrorContext, showToast: boolean = true): ErrorDetails {
    const errorStr = typeof error === 'string' ? error : error.message
    const errorDetails = this.categorizeError(errorStr, context)
    
    // Store in history
    this.errorHistory.unshift({ error: errorDetails, context })
    if (this.errorHistory.length > this.maxHistoryLength) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistoryLength)
    }
    
    // Show toast notification
    if (showToast) {
      this.showToast(errorDetails)
    }
    
    // Call callback
    this.onErrorCallback?.(errorDetails, context)
    
    return errorDetails
  }

  /**
   * Show error as a Sonner toast
   */
  private showToast(errorDetails: ErrorDetails) {
    const toastMessage = errorDetails.message
    const toastDescription = errorDetails.suggestions.length > 0 
      ? `Try: ${errorDetails.suggestions[0]}`
      : undefined

    switch (errorDetails.severity) {
      case 'low':
        toast(toastMessage, { description: toastDescription })
        break
      case 'medium':
        toast.warning(toastMessage, { description: toastDescription })
        break
      case 'high':
      case 'critical':
        toast.error(toastMessage, { description: toastDescription })
        break
      default:
        toast(toastMessage, { description: toastDescription })
        break
    }
  }

  /**
   * Categorize error and provide actionable suggestions
   */
  private categorizeError(error: string, context: ErrorContext): ErrorDetails {
    const lowerError = error.toLowerCase()

    // Survey validation errors
    if (lowerError.includes('survey validation failed') || lowerError.includes('not a survey')) {
      return {
        code: 'SURVEY_VALIDATION_FAILED',
        message: 'The generated content doesn\'t meet survey standards',
        severity: 'high',
        category: 'validation',
        actionable: true,
        canRetry: true,
        suggestions: [
          'Try rephrasing your request to be more specific about survey elements needed',
          'Ask for specific question types (multiple choice, text input, rating scale)',
          'Request form structure with proper labels and validation',
          'Try: "Create a customer feedback survey with rating questions"'
        ]
      }
    }

    // Network/API errors
    if (lowerError.includes('failed to fetch') || lowerError.includes('network error') || lowerError.includes('timeout')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Connection issue occurred',
        severity: 'medium',
        category: 'network',
        actionable: true,
        canRetry: true,
        suggestions: [
          'Check your internet connection',
          'Try again in a moment - this is usually temporary',
          'If problem persists, try refreshing the page'
        ],
        autoRecovery: async () => {
          // Wait 2 seconds then retry
          await new Promise(resolve => setTimeout(resolve, 2000))
          return true
        }
      }
    }

    // Rate limiting errors
    if (lowerError.includes('rate limit') || lowerError.includes('too many requests')) {
      return {
        code: 'RATE_LIMITED',
        message: 'Too many requests - please wait a moment',
        severity: 'medium',
        category: 'network',
        actionable: true,
        canRetry: true,
        suggestions: [
          'Wait 30 seconds before trying again',
          'Consider upgrading your plan for higher limits',
          'Try breaking complex requests into smaller parts'
        ]
      }
    }

    // HTML parsing errors
    if (lowerError.includes('parse') || lowerError.includes('invalid html') || lowerError.includes('syntax error')) {
      return {
        code: 'HTML_PARSE_ERROR',
        message: 'Generated HTML has formatting issues',
        severity: 'medium',
        category: 'generation',
        actionable: true,
        canRetry: true,
        suggestions: [
          'Try asking for a simpler survey structure first',
          'Request specific HTML elements: "Create a form with text inputs and submit button"',
          'Ask to fix the HTML structure and validation'
        ]
      }
    }

    // AI generation errors
    if (lowerError.includes('model') || lowerError.includes('generation failed') || lowerError.includes('no content returned')) {
      return {
        code: 'GENERATION_FAILED',
        message: 'AI couldn\'t generate the requested content',
        severity: 'high',
        category: 'generation',
        actionable: true,
        canRetry: true,
        suggestions: [
          'Try rephrasing your request more clearly',
          'Break complex requests into smaller steps',
          'Be specific about what type of survey you want',
          'Example: "Create a 5-question customer satisfaction survey"'
        ]
      }
    }

    // User input errors
    if (lowerError.includes('invalid input') || lowerError.includes('missing required') || context.userPrompt?.trim() === '') {
      return {
        code: 'INVALID_USER_INPUT',
        message: 'Please provide clear instructions for your survey',
        severity: 'low',
        category: 'user_input',
        actionable: true,
        canRetry: false,
        suggestions: [
          'Describe what kind of survey you want to create',
          'Mention specific question types if needed',
          'Include any requirements like number of questions or topic',
          'Example: "Create a product feedback form with rating questions"'
        ]
      }
    }

    // Rendering errors
    if (lowerError.includes('render') || lowerError.includes('display')) {
      return {
        code: 'RENDERING_ERROR',
        message: 'Issue displaying the survey',
        severity: 'medium',
        category: 'rendering',
        actionable: true,
        canRetry: true,
        suggestions: [
          'Try refreshing the preview',
          'Check if your browser supports modern HTML features',
          'Try a different device view (mobile/tablet/desktop)'
        ]
      }
    }

    // Generic/unknown errors
    return {
      code: 'UNKNOWN_ERROR',
      message: error.length > 100 ? error.substring(0, 100) + '...' : error,
      severity: 'medium',
      category: 'generation',
      actionable: true,
      canRetry: true,
      suggestions: [
        'Please try your request again',
        'If the problem continues, try rephrasing your request',
        'Consider starting with a simpler survey and adding complexity gradually'
      ]
    }
  }

  /**
   * Get suggestions based on error history patterns
   */
  getContextualSuggestions(currentError: string): string[] {
    const suggestions: string[] = []
    
    // Check for repeated errors
    const recentErrors = this.errorHistory.slice(0, 5)
    const repeatedErrors = recentErrors.filter(({ error }) => 
      error.code === this.categorizeError(currentError, { phase: 'thinking', timestamp: new Date() }).code
    )
    
    if (repeatedErrors.length >= 2) {
      suggestions.push('You\'ve encountered this error multiple times. Try a different approach.')
      suggestions.push('Consider breaking your request into smaller, simpler parts.')
    }
    
    // Check for validation failures
    const validationFailures = recentErrors.filter(({ error }) => 
      error.category === 'validation'
    )
    
    if (validationFailures.length >= 2) {
      suggestions.push('Focus on survey-specific requests: questionnaires, forms, polls, or quizzes.')
      suggestions.push('Try: "Create a [type] survey about [topic] with [number] questions"')
    }
    
    return suggestions
  }

  /**
   * Attempt automatic recovery for certain error types
   */
  async attemptRecovery(errorDetails: ErrorDetails): Promise<boolean> {
    if (errorDetails.autoRecovery) {
      try {
        return await errorDetails.autoRecovery()
      } catch (error) {
        console.warn('Auto-recovery failed:', error)
        return false
      }
    }
    return false
  }

  /**
   * Get error statistics for debugging
   */
  getErrorStats() {
    const stats = {
      total: this.errorHistory.length,
      byCategory: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      recent: this.errorHistory.slice(0, 10)
    }
    
    this.errorHistory.forEach(({ error }) => {
      stats.byCategory[error.category] = (stats.byCategory[error.category] || 0) + 1
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
    })
    
    return stats
  }

  /**
   * Clear error history
   */
  clearHistory() {
    this.errorHistory = []
  }
}

/**
 * Format error for user display
 */
export function formatErrorForUser(error: ErrorDetails, context: ErrorContext): string {
  const prefix = getErrorEmoji(error.severity)
  let message = `${prefix} **${error.message}**`
  
  if (error.suggestions.length > 0) {
    message += '\n\n**Try this:**\n' + error.suggestions.slice(0, 3).map(s => `• ${s}`).join('\n')
  }
  
  if (error.canRetry) {
    message += '\n\n*You can retry this action.*'
  }
  
  return message
}

/**
 * Get appropriate emoji for error severity
 */
function getErrorEmoji(severity: ErrorDetails['severity']): string {
  switch (severity) {
    case 'low': return '💡'
    case 'medium': return '⚠️'
    case 'high': return '❌'
    case 'critical': return '🚨'
    default: return '❌'
  }
}

/**
 * Default error handler instance
 */
export const surveyErrorHandler = new SurveyErrorHandler()