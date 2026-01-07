/**
 * Content-based checks
 *
 * Analyzes response content for quality and patterns.
 * All checks in this file are offline (no API required).
 */

import type { CheckResult, ResponseInput, BehavioralMetrics } from '../types';

/**
 * Common gibberish patterns
 */
const GIBBERISH_PATTERNS = [
  /^[a-z]{1,3}$/i, // Single letters or very short
  /(.)\1{4,}/, // Repeated characters (aaaaa)
  /^[^aeiou]{5,}$/i, // No vowels in 5+ chars
  /^(asdf|qwerty|zxcv|wasd)/i, // Keyboard mashing
  /^[0-9]+$/, // Only numbers
  /^(.+?)\1{2,}$/, // Repeated patterns (abcabcabc)
];

/**
 * Low effort indicators
 */
const LOW_EFFORT_RESPONSES = [
  'n/a',
  'na',
  'none',
  'nothing',
  'idk',
  'i dont know',
  "i don't know",
  'no comment',
  'no',
  'yes',
  'ok',
  'okay',
  'good',
  'fine',
  'whatever',
  'asdf',
  'test',
  '.',
  '-',
  '...',
];

/**
 * Check: Minimal Effort
 *
 * Detects very short or low-quality text responses.
 */
export function checkMinimalEffort(responses: ResponseInput[]): CheckResult {
  const textResponses = responses.filter(
    r => r.questionType === 'text' || (!r.questionType && r.answer.length > 0)
  );

  if (textResponses.length === 0) {
    return {
      checkId: 'minimal_effort',
      passed: true,
      score: 0,
      details: 'No text responses to analyze',
    };
  }

  let lowEffortCount = 0;
  let totalLength = 0;

  for (const response of textResponses) {
    const answer = response.answer.toLowerCase().trim();
    totalLength += answer.length;

    // Check for known low-effort responses
    if (LOW_EFFORT_RESPONSES.includes(answer)) {
      lowEffortCount++;
      continue;
    }

    // Check for very short responses (< 10 chars for open text)
    if (answer.length < 10) {
      lowEffortCount++;
      continue;
    }

    // Check for gibberish patterns
    for (const pattern of GIBBERISH_PATTERNS) {
      if (pattern.test(answer)) {
        lowEffortCount++;
        break;
      }
    }
  }

  const lowEffortRatio = lowEffortCount / textResponses.length;
  const avgLength = totalLength / textResponses.length;

  if (lowEffortRatio > 0.7) {
    return {
      checkId: 'minimal_effort',
      passed: false,
      score: 1.0,
      details: 'Most responses are low effort or gibberish',
      data: { lowEffortRatio, avgLength, lowEffortCount },
    };
  }

  if (lowEffortRatio > 0.4) {
    return {
      checkId: 'minimal_effort',
      passed: true,
      score: 0.6,
      details: 'Many responses appear low effort',
      data: { lowEffortRatio, avgLength },
    };
  }

  if (avgLength < 20) {
    return {
      checkId: 'minimal_effort',
      passed: true,
      score: 0.4,
      details: 'Responses are quite short on average',
      data: { avgLength },
    };
  }

  return {
    checkId: 'minimal_effort',
    passed: true,
    score: 0,
    data: { lowEffortRatio, avgLength },
  };
}

/**
 * Check: Straight-Lining
 *
 * Detects selecting the same option repeatedly in multiple choice questions.
 */
export function checkStraightLining(responses: ResponseInput[]): CheckResult {
  const scaleResponses = responses.filter(
    r => r.questionType === 'rating' ||
         r.questionType === 'scale' ||
         r.questionType === 'multiple_choice'
  );

  if (scaleResponses.length < 4) {
    return {
      checkId: 'straight_line_answers',
      passed: true,
      score: 0,
      details: 'Not enough scale/choice questions',
    };
  }

  // Count consecutive identical answers
  let maxConsecutive = 1;
  let currentConsecutive = 1;

  for (let i = 1; i < scaleResponses.length; i++) {
    if (scaleResponses[i].answer === scaleResponses[i - 1].answer) {
      currentConsecutive++;
      maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
    } else {
      currentConsecutive = 1;
    }
  }

  // Also check for all same answer
  const answers = scaleResponses.map(r => r.answer);
  const uniqueAnswers = new Set(answers);
  const uniqueRatio = uniqueAnswers.size / scaleResponses.length;

  if (uniqueRatio < 0.15) {
    return {
      checkId: 'straight_line_answers',
      passed: false,
      score: 1.0,
      details: 'Nearly all answers are identical',
      data: { uniqueRatio, uniqueAnswers: uniqueAnswers.size, total: scaleResponses.length },
    };
  }

  if (maxConsecutive >= 5 || uniqueRatio < 0.25) {
    return {
      checkId: 'straight_line_answers',
      passed: false,
      score: 0.8,
      details: 'Strong straight-lining pattern detected',
      data: { maxConsecutive, uniqueRatio },
    };
  }

  if (maxConsecutive >= 4) {
    return {
      checkId: 'straight_line_answers',
      passed: true,
      score: 0.4,
      details: 'Some consecutive identical answers',
      data: { maxConsecutive },
    };
  }

  return {
    checkId: 'straight_line_answers',
    passed: true,
    score: 0,
    data: { maxConsecutive, uniqueRatio },
  };
}

/**
 * Check: Excessive Tab Switching
 *
 * Detects frequent tab/window changes which might indicate:
 * - Looking up answers
 * - Using AI to generate responses
 * - Distracted/inattentive respondent
 */
export function checkExcessiveTabSwitching(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics) {
    return {
      checkId: 'excessive_tab_switching',
      passed: true,
      score: 0,
      details: 'No behavioral data',
    };
  }

  const { tabSwitchCount, duration } = metrics;
  const durationMinutes = (duration || 1) / 60000;

  // Calculate switches per minute
  const switchesPerMinute = tabSwitchCount / durationMinutes;

  if (switchesPerMinute > 5) {
    return {
      checkId: 'excessive_tab_switching',
      passed: false,
      score: 0.8,
      details: 'Excessive tab switching detected',
      data: { switchesPerMinute, tabSwitchCount },
    };
  }

  if (switchesPerMinute > 2) {
    return {
      checkId: 'excessive_tab_switching',
      passed: true,
      score: 0.4,
      details: 'Above average tab switching',
      data: { switchesPerMinute },
    };
  }

  return {
    checkId: 'excessive_tab_switching',
    passed: true,
    score: 0,
    data: { switchesPerMinute },
  };
}

/**
 * Check: Window Focus Loss
 *
 * Detects extended periods where the survey was not in focus.
 */
export function checkWindowFocusLoss(metrics?: BehavioralMetrics): CheckResult {
  if (!metrics) {
    return {
      checkId: 'window_focus_loss',
      passed: true,
      score: 0,
      details: 'No behavioral data',
    };
  }

  const { totalBlurDuration, duration } = metrics;
  const blurRatio = totalBlurDuration / (duration || 1);

  if (blurRatio > 0.6) {
    return {
      checkId: 'window_focus_loss',
      passed: false,
      score: 0.8,
      details: 'Majority of time spent away from survey',
      data: { blurRatio, totalBlurDuration },
    };
  }

  if (blurRatio > 0.3) {
    return {
      checkId: 'window_focus_loss',
      passed: true,
      score: 0.4,
      details: 'Significant time away from survey',
      data: { blurRatio },
    };
  }

  return {
    checkId: 'window_focus_loss',
    passed: true,
    score: 0,
    data: { blurRatio },
  };
}

/**
 * Check for duplicate/copy-paste patterns across responses
 */
export function checkDuplicateResponses(responses: ResponseInput[]): CheckResult {
  const textResponses = responses
    .filter(r => r.answer.length > 20)
    .map(r => r.answer.toLowerCase().trim());

  if (textResponses.length < 2) {
    return {
      checkId: 'minimal_effort', // Use existing check ID
      passed: true,
      score: 0,
    };
  }

  // Check for identical or near-identical responses
  let duplicateCount = 0;
  for (let i = 0; i < textResponses.length; i++) {
    for (let j = i + 1; j < textResponses.length; j++) {
      if (textResponses[i] === textResponses[j]) {
        duplicateCount++;
      }
    }
  }

  if (duplicateCount > 0) {
    const possiblePairs = (textResponses.length * (textResponses.length - 1)) / 2;
    const duplicateRatio = duplicateCount / possiblePairs;

    if (duplicateRatio > 0.3) {
      return {
        checkId: 'minimal_effort',
        passed: false,
        score: 0.7,
        details: 'Multiple identical responses detected',
        data: { duplicateCount, duplicateRatio },
      };
    }
  }

  return {
    checkId: 'minimal_effort',
    passed: true,
    score: 0,
  };
}

/**
 * Run all content checks
 */
export function runContentChecks(
  responses: ResponseInput[],
  metrics?: BehavioralMetrics
): CheckResult[] {
  return [
    checkMinimalEffort(responses),
    checkStraightLining(responses),
    checkExcessiveTabSwitching(metrics),
    checkWindowFocusLoss(metrics),
  ];
}
