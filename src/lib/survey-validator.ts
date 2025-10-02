/**
 * Survey Validation System
 * Ensures generated HTML is actually a survey/form and meets quality standards
 */

interface ValidationResult {
  isValid: boolean;
  isSurvey: boolean;
  score: number; // 0-100
  issues: string[];
  suggestions: string[];
  accessibility: {
    hasLabels: boolean;
    hasFormStructure: boolean;
    hasNavigation: boolean;
    colorContrast: boolean;
  };
}

interface SurveyElements {
  forms: number;
  inputs: number;
  buttons: number;
  labels: number;
  fieldsets: number;
  legends: number;
  textareas: number;
  selects: number;
  radioGroups: number;
  checkboxGroups: number;
}

/**
 * Validates if HTML content is a proper survey/form
 */
export function validateSurveyHTML(html: string): ValidationResult {
  let doc: Document;
  try {
    // Always use browser's DOMParser, fallback to simple parsing if not available
    if (typeof DOMParser !== 'undefined') {
      // Browser environment
      const parser = new DOMParser();
      doc = parser.parseFromString(`<!DOCTYPE html><html><body>${html}</body></html>`, 'text/html');
    } else {
      // Server environment - use simple regex-based validation instead of JSDOM
      return validateSurveyHTMLSimple(html);
    }
  } catch (error) {
    return {
      isValid: false,
      isSurvey: false,
      score: 0,
      issues: ['Failed to parse HTML'],
      suggestions: ['Check HTML syntax and structure'],
      accessibility: {
        hasLabels: false,
        hasFormStructure: false,
        hasNavigation: false,
        colorContrast: false,
      }
    };
  }

  const elements = analyzeSurveyElements(doc);
  const accessibility = checkAccessibility(doc, elements);
  const structure = validateStructure(doc, elements);
  const content = validateContent(doc);

  const isSurvey = elements.forms > 0 || elements.inputs > 0 || 
    content.hasSurveyKeywords || structure.hasQuestionFlow;

  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 0;

  // Survey identification scoring
  if (elements.forms === 0 && elements.inputs === 0) {
    issues.push('No form elements found - this doesn\'t appear to be a survey');
    suggestions.push('Add form inputs like text fields, radio buttons, or checkboxes');
  } else {
    score += 30;
  }

  // Form structure scoring
  if (elements.forms > 0) {
    score += 20;
    if (elements.fieldsets > 0) score += 10;
    if (elements.legends > 0) score += 5;
  } else if (elements.inputs > 0) {
    issues.push('Form inputs found but no <form> element wrapper');
    suggestions.push('Wrap form elements in a <form> tag for proper structure');
  }

  // Input variety scoring
  const inputVariety = Math.min(4, [
    elements.inputs > 0 ? 1 : 0,
    elements.textareas > 0 ? 1 : 0,
    elements.selects > 0 ? 1 : 0,
    elements.radioGroups > 0 || elements.checkboxGroups > 0 ? 1 : 0
  ].reduce((a, b) => a + b, 0));
  score += inputVariety * 5;

  // Accessibility scoring
  const accessibilityScore = Object.values(accessibility).filter(Boolean).length * 8;
  score += accessibilityScore;

  if (!accessibility.hasLabels && elements.inputs > 0) {
    issues.push('Form inputs missing proper labels');
    suggestions.push('Add <label> elements for all form inputs');
  }

  if (!accessibility.hasNavigation && elements.inputs > 2) {
    issues.push('Multi-step survey missing navigation elements');
    suggestions.push('Add Previous/Next buttons or progress indicators');
  }

  // Content quality scoring
  if (content.hasInstructions) score += 10;
  if (content.hasProgressIndicators) score += 5;
  if (structure.hasQuestionFlow) score += 10;

  // Survey-specific keywords boost
  if (content.hasSurveyKeywords) score += 5;

  // Penalize non-survey content
  if (content.hasNonSurveyContent) {
    score -= 20;
    issues.push('Contains content not related to surveys/forms');
    suggestions.push('Focus content on survey questions and form elements only');
  }

  // Final validation
  const finalScore = Math.max(0, Math.min(100, score));
  const isValid = finalScore >= 50 && isSurvey && issues.length < 3;

  return {
    isValid,
    isSurvey,
    score: finalScore,
    issues,
    suggestions,
    accessibility
  };
}

function analyzeSurveyElements(doc: Document): SurveyElements {
  return {
    forms: doc.querySelectorAll('form').length,
    inputs: doc.querySelectorAll('input:not([type="hidden"])').length,
    buttons: doc.querySelectorAll('button, input[type="submit"], input[type="button"]').length,
    labels: doc.querySelectorAll('label').length,
    fieldsets: doc.querySelectorAll('fieldset').length,
    legends: doc.querySelectorAll('legend').length,
    textareas: doc.querySelectorAll('textarea').length,
    selects: doc.querySelectorAll('select').length,
    radioGroups: doc.querySelectorAll('input[type="radio"]').length,
    checkboxGroups: doc.querySelectorAll('input[type="checkbox"]').length,
  };
}

function checkAccessibility(doc: Document, elements: SurveyElements) {
  const inputs = doc.querySelectorAll('input:not([type="hidden"]), textarea, select');
  let labeledInputs = 0;

  inputs.forEach(input => {
    const id = input.getAttribute('id');
    const ariaLabel = input.getAttribute('aria-label');
    const ariaLabelledBy = input.getAttribute('aria-labelledby');
    const label = id ? doc.querySelector(`label[for="${id}"]`) : null;
    const parentLabel = input.closest('label');

    if (label || parentLabel || ariaLabel || ariaLabelledBy) {
      labeledInputs++;
    }
  });

  return {
    hasLabels: inputs.length > 0 ? (labeledInputs / inputs.length) >= 0.8 : true,
    hasFormStructure: elements.forms > 0 && (elements.fieldsets > 0 || elements.inputs <= 5),
    hasNavigation: doc.querySelectorAll('button, [role="button"]').length >= 1,
    colorContrast: true // Simplified - would need color analysis in full implementation
  };
}

function validateStructure(doc: Document, elements: SurveyElements) {
  const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
  const questionPatterns = /\b(question|step|section|\d+\.|\d+\))/gi;
  const bodyText = doc.body?.textContent || '';
  const hasQuestionFlow = questionPatterns.test(bodyText) || headings >= 2;

  return {
    hasQuestionFlow,
    hasMultipleSteps: elements.buttons >= 2 || /\b(next|previous|back|continue|submit)\b/gi.test(bodyText),
    hasLogicalOrder: true // Simplified check
  };
}

function validateContent(doc: Document) {
  const text = (doc.body?.textContent || '').toLowerCase();
  
  const surveyKeywords = [
    'survey', 'questionnaire', 'form', 'feedback', 'poll', 'quiz', 'assessment',
    'question', 'answer', 'response', 'rating', 'evaluation', 'opinion',
    'please select', 'choose', 'rate', 'scale', 'strongly agree', 'disagree'
  ];

  const nonSurveyKeywords = [
    'dashboard', 'analytics', 'chart', 'graph', 'portfolio', 'blog', 'news',
    'product', 'shopping', 'cart', 'game', 'play', 'score', 'leaderboard',
    'social media', 'timeline', 'posts', 'messages', 'chat'
  ];

  const instructionKeywords = [
    'please', 'select', 'choose', 'enter', 'provide', 'tell us', 'how would you',
    'what is', 'which', 'when', 'where', 'why', 'instructions', 'help', 'required'
  ];

  const progressKeywords = [
    'progress', 'step', 'page', 'of', 'complete', 'finish', 'done', '%', 'percent'
  ];

  return {
    hasSurveyKeywords: surveyKeywords.some(keyword => text.includes(keyword)),
    hasNonSurveyContent: nonSurveyKeywords.some(keyword => text.includes(keyword)),
    hasInstructions: instructionKeywords.some(keyword => text.includes(keyword)),
    hasProgressIndicators: progressKeywords.some(keyword => text.includes(keyword))
  };
}

/**
 * Quick check if content appears to be survey-related
 */
export function isSurveyRelated(html: string): boolean {
  const validation = validateSurveyHTML(html);
  return validation.isSurvey && validation.score >= 30;
}

/**
 * Get improvement suggestions for survey HTML
 */
export function getSurveyImprovementSuggestions(html: string): string[] {
  const validation = validateSurveyHTML(html);
  return validation.suggestions;
}

/**
 * Simple regex-based validation for server environments (avoiding JSDOM)
 */
function validateSurveyHTMLSimple(html: string): ValidationResult {
  const lowerHtml = html.toLowerCase();
  
  // Basic survey element detection using regex
  const hasForm = /<form/i.test(html);
  const hasInputs = /<input/i.test(html);
  const hasLabels = /<label/i.test(html);
  const hasFieldsets = /<fieldset/i.test(html);
  const hasTextareas = /<textarea/i.test(html);
  const hasSelects = /<select/i.test(html);
  const hasButtons = /<button|<input[^>]*type=['"](?:submit|button)/i.test(html);
  
  // Survey keyword detection
  const surveyKeywords = ['survey', 'questionnaire', 'form', 'poll', 'quiz', 'feedback', 'question', 'answer'];
  const hasKeywords = surveyKeywords.some(keyword => lowerHtml.includes(keyword));
  
  // Calculate basic score
  let score = 30; // Base score
  if (hasForm) score += 20;
  if (hasInputs) score += 15;
  if (hasLabels) score += 10;
  if (hasFieldsets) score += 10;
  if (hasKeywords) score += 10;
  if (hasButtons) score += 5;
  
  const isSurvey = hasForm || hasInputs || hasKeywords;
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (!isSurvey) {
    issues.push('No survey elements detected');
    suggestions.push('Include form elements like inputs, selects, or textareas');
  }
  
  if (!hasLabels && hasInputs) {
    issues.push('Form inputs missing labels');
    suggestions.push('Add <label> elements for accessibility');
  }
  
  return {
    isValid: score >= 50 && isSurvey,
    isSurvey,
    score: Math.min(100, score),
    issues,
    suggestions,
    accessibility: {
      hasLabels: hasLabels,
      hasFormStructure: hasForm && hasFieldsets,
      hasNavigation: hasButtons,
      colorContrast: true // Can't validate without DOM
    }
  };
}

/**
 * Validate survey and return user-friendly message
 */
export function validateAndGetMessage(html: string): { valid: boolean; message: string; suggestions?: string[] } {
  const validation = validateSurveyHTML(html);
  
  if (!validation.isSurvey) {
    return {
      valid: false,
      message: "The generated content doesn't appear to be a survey or form. Please request a survey, questionnaire, quiz, or form instead.",
      suggestions: validation.suggestions
    };
  }
  
  if (!validation.isValid) {
    return {
      valid: false,
      message: `Survey needs improvement (score: ${validation.score}/100). Issues found: ${validation.issues.join(', ')}`,
      suggestions: validation.suggestions
    };
  }
  
  return {
    valid: true,
    message: `Great survey! Quality score: ${validation.score}/100`
  };
}