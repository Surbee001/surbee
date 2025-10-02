/**
 * Browser-safe survey utilities
 * This file contains only browser-compatible code and should be used in client components
 */

export interface SurveyValidationResult {
  isValid: boolean
  isSurvey: boolean  
  score: number
  issues: string[]
  suggestions: string[]
}

/**
 * Browser-safe survey validation using DOMParser
 */
export function validateSurveyHTML(html: string): SurveyValidationResult {
  if (typeof window === 'undefined') {
    // Server-side: use simple regex validation
    return validateSurveyHTMLSimple(html)
  }

  try {
    // Browser-side: use DOMParser
    const parser = new DOMParser()
    const doc = parser.parseFromString(`<!DOCTYPE html><html><body>${html}</body></html>`, 'text/html')
    
    return validateSurveyHTMLWithDOM(doc)
  } catch (error) {
    console.warn('DOM parsing failed, falling back to simple validation:', error)
    return validateSurveyHTMLSimple(html)
  }
}

/**
 * Validate survey using DOM methods (browser only)
 */
function validateSurveyHTMLWithDOM(doc: Document): SurveyValidationResult {
  const forms = doc.querySelectorAll('form')
  const inputs = doc.querySelectorAll('input:not([type="hidden"])')
  const labels = doc.querySelectorAll('label')
  const fieldsets = doc.querySelectorAll('fieldset')
  const textareas = doc.querySelectorAll('textarea')
  const selects = doc.querySelectorAll('select')
  const buttons = doc.querySelectorAll('button, input[type="submit"], input[type="button"]')
  
  let score = 30 // Base score
  const issues: string[] = []
  const suggestions: string[] = []
  
  // Form structure scoring
  if (forms.length > 0) {
    score += 20
    if (fieldsets.length > 0) score += 10
  } else if (inputs.length > 0) {
    issues.push('Form inputs found but no <form> element wrapper')
    suggestions.push('Wrap form elements in a <form> tag')
  }
  
  // Input variety scoring
  const inputTypes = Array.from(inputs).map(input => (input as HTMLInputElement).type)
  const uniqueTypes = [...new Set(inputTypes)]
  score += Math.min(uniqueTypes.length * 3, 15)
  
  // Accessibility scoring
  let labeledInputs = 0
  inputs.forEach(input => {
    const id = input.getAttribute('id')
    const ariaLabel = input.getAttribute('aria-label')
    const ariaLabelledBy = input.getAttribute('aria-labelledby')
    const label = id ? doc.querySelector(`label[for="${id}"]`) : null
    const parentLabel = input.closest('label')
    
    if (label || parentLabel || ariaLabel || ariaLabelledBy) {
      labeledInputs++
    }
  })
  
  if (inputs.length > 0) {
    const labelRatio = labeledInputs / inputs.length
    if (labelRatio >= 0.8) score += 10
    else {
      issues.push('Some form inputs missing proper labels')
      suggestions.push('Add <label> elements for all form inputs')
    }
  }
  
  // Content analysis
  const text = doc.body?.textContent?.toLowerCase() || ''
  const surveyKeywords = ['survey', 'questionnaire', 'form', 'poll', 'quiz', 'feedback', 'question']
  const hasKeywords = surveyKeywords.some(keyword => text.includes(keyword))
  if (hasKeywords) score += 5
  
  const isSurvey = forms.length > 0 || inputs.length > 0 || hasKeywords
  
  if (!isSurvey) {
    issues.push('No survey elements detected')
    suggestions.push('Add form elements like inputs, selects, or textareas')
  }
  
  return {
    isValid: score >= 50 && isSurvey,
    isSurvey,
    score: Math.min(100, score),
    issues,
    suggestions
  }
}

/**
 * Simple regex-based validation (works in any environment)
 */
function validateSurveyHTMLSimple(html: string): SurveyValidationResult {
  const lowerHtml = html.toLowerCase()
  
  // Basic survey element detection
  const hasForm = /<form/i.test(html)
  const hasInputs = /<input(?![^>]*type=['"]hidden['"])/i.test(html)
  const hasLabels = /<label/i.test(html)
  const hasFieldsets = /<fieldset/i.test(html)
  const hasButtons = /<button|<input[^>]*type=['"](?:submit|button)/i.test(html)
  
  // Survey keyword detection
  const surveyKeywords = ['survey', 'questionnaire', 'form', 'poll', 'quiz', 'feedback', 'question', 'answer']
  const hasKeywords = surveyKeywords.some(keyword => lowerHtml.includes(keyword))
  
  // Calculate score
  let score = 30
  if (hasForm) score += 20
  if (hasInputs) score += 15
  if (hasLabels) score += 10
  if (hasFieldsets) score += 10
  if (hasKeywords) score += 10
  if (hasButtons) score += 5
  
  const isSurvey = hasForm || hasInputs || hasKeywords
  const issues: string[] = []
  const suggestions: string[] = []
  
  if (!isSurvey) {
    issues.push('No survey elements detected')
    suggestions.push('Include form elements like inputs, selects, or textareas')
  }
  
  if (!hasLabels && hasInputs) {
    issues.push('Form inputs missing labels')  
    suggestions.push('Add <label> elements for accessibility')
  }
  
  return {
    isValid: score >= 50 && isSurvey,
    isSurvey, 
    score: Math.min(100, score),
    issues,
    suggestions
  }
}

/**
 * Get user-friendly validation message
 */
export function getValidationMessage(html: string): { valid: boolean; message: string; suggestions?: string[] } {
  const validation = validateSurveyHTML(html)
  
  if (!validation.isSurvey) {
    return {
      valid: false,
      message: "The generated content doesn't appear to be a survey or form. Please request a survey, questionnaire, quiz, or form instead.",
      suggestions: validation.suggestions
    }
  }
  
  if (!validation.isValid) {
    return {
      valid: false,
      message: `Survey needs improvement (score: ${validation.score}/100). Issues: ${validation.issues.join(', ')}`,
      suggestions: validation.suggestions
    }
  }
  
  return {
    valid: true,
    message: `Great survey! Quality score: ${validation.score}/100`
  }
}

/**
 * Quick check if content appears survey-related
 */
export function isSurveyRelated(html: string): boolean {
  const validation = validateSurveyHTML(html)
  return validation.isSurvey && validation.score >= 30
}