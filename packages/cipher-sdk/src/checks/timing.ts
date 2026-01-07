/**
 * Timing-based checks
 *
 * Analyzes response timing patterns to detect bots and low-effort responses.
 * All checks in this file are offline (no API required).
 */

import type { CheckResult, ResponseInput, BehavioralMetrics, SurveyContext } from '../types';

/**
 * Minimum reading time per character (ms)
 * Average reading speed is ~250 words/min = ~1250 chars/min = ~48ms per char
 * We use a generous 20ms to account for fast readers
 */
const MIN_MS_PER_CHAR = 20;

/**
 * Minimum response time for any question (ms)
 */
const MIN_RESPONSE_TIME_MS = 1000;

/**
 * Check: Impossibly Fast
 *
 * Detects responses that were submitted faster than humanly possible.
 * Based on reading speed + minimum typing time.
 */
export function checkImpossiblyFast(
  responses: ResponseInput[],
  context?: SurveyContext
): CheckResult {
  if (!context?.actualDurationSeconds || !context?.expectedDurationSeconds) {
    // Can't check without timing data
    return {
      checkId: 'impossibly_fast',
      passed: true,
      score: 0,
      details: 'No timing data available',
    };
  }

  const actualMs = context.actualDurationSeconds * 1000;
  const expectedMs = context.expectedDurationSeconds * 1000;

  // Calculate minimum possible time based on content
  let minPossibleMs = 0;
  for (const response of responses) {
    const questionChars = response.question.length;
    const readingTime = questionChars * MIN_MS_PER_CHAR;
    minPossibleMs += Math.max(readingTime, MIN_RESPONSE_TIME_MS);
  }

  // If completed faster than 30% of minimum possible time, it's suspicious
  const suspicionThreshold = minPossibleMs * 0.3;

  if (actualMs < suspicionThreshold) {
    return {
      checkId: 'impossibly_fast',
      passed: false,
      score: 1.0,
      details: `Completed in ${context.actualDurationSeconds}s, minimum expected ${Math.round(minPossibleMs / 1000)}s`,
      data: { actualMs, minPossibleMs, threshold: suspicionThreshold },
    };
  }

  // Calculate a score based on how fast they were
  // 100% of expected time = score 0, 30% = score 0.7
  const speedRatio = actualMs / expectedMs;
  const score = speedRatio < 1 ? Math.max(0, 1 - speedRatio) * 0.7 : 0;

  return {
    checkId: 'impossibly_fast',
    passed: true,
    score,
    details: speedRatio < 0.5 ? 'Faster than average' : undefined,
    data: { actualMs, expectedMs, speedRatio },
  };
}

/**
 * Check: Rapid Completion
 *
 * Simpler check for overall survey completion speed.
 * Flags if completed in less than 20% of expected time.
 */
export function checkRapidCompletion(
  responses: ResponseInput[],
  context?: SurveyContext
): CheckResult {
  if (!context?.actualDurationSeconds || !context?.expectedDurationSeconds) {
    return {
      checkId: 'rapid_completion',
      passed: true,
      score: 0,
      details: 'No timing data available',
    };
  }

  const ratio = context.actualDurationSeconds / context.expectedDurationSeconds;

  if (ratio < 0.2) {
    return {
      checkId: 'rapid_completion',
      passed: false,
      score: 1.0,
      details: `Completed in ${Math.round(ratio * 100)}% of expected time`,
      data: { ratio },
    };
  }

  if (ratio < 0.4) {
    return {
      checkId: 'rapid_completion',
      passed: true,
      score: 0.5,
      details: 'Faster than typical',
      data: { ratio },
    };
  }

  return {
    checkId: 'rapid_completion',
    passed: true,
    score: 0,
    data: { ratio },
  };
}

/**
 * Check: Uniform Timing
 *
 * Detects robotic behavior where response times are suspiciously consistent.
 * Humans have natural variation in response times.
 */
export function checkUniformTiming(
  responses: ResponseInput[],
  metrics?: BehavioralMetrics
): CheckResult {
  const times = metrics?.responseTime || responses.map(r => r.responseTimeMs).filter(Boolean) as number[];

  if (times.length < 3) {
    return {
      checkId: 'uniform_timing',
      passed: true,
      score: 0,
      details: 'Not enough timing data',
    };
  }

  // Calculate coefficient of variation (CV = stddev / mean)
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const variance = times.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / times.length;
  const stddev = Math.sqrt(variance);
  const cv = stddev / mean;

  // Humans typically have CV > 0.3 for response times
  // Bots often have CV < 0.1
  if (cv < 0.1) {
    return {
      checkId: 'uniform_timing',
      passed: false,
      score: 1.0,
      details: 'Response times are suspiciously uniform',
      data: { cv, mean, stddev },
    };
  }

  if (cv < 0.2) {
    return {
      checkId: 'uniform_timing',
      passed: true,
      score: 0.5,
      details: 'Lower than typical timing variation',
      data: { cv, mean, stddev },
    };
  }

  return {
    checkId: 'uniform_timing',
    passed: true,
    score: 0,
    data: { cv, mean, stddev },
  };
}

/**
 * Check: Suspicious Pauses
 *
 * Detects unusual gaps in activity that might indicate:
 * - Looking up answers
 * - Bot waiting for external input
 * - Copy-pasting from other sources
 */
export function checkSuspiciousPauses(
  metrics?: BehavioralMetrics
): CheckResult {
  if (!metrics?.focusEvents || metrics.focusEvents.length < 2) {
    return {
      checkId: 'suspicious_pauses',
      passed: true,
      score: 0,
      details: 'No focus event data',
    };
  }

  // Analyze blur durations
  const blurEvents = metrics.focusEvents.filter(e => e.type === 'blur' || e.type === 'hidden');
  const totalBlurTime = metrics.totalBlurDuration || 0;
  const surveyDuration = metrics.duration || 1;

  // If more than 30% of time was spent away from survey, suspicious
  const blurRatio = totalBlurTime / surveyDuration;

  if (blurRatio > 0.5) {
    return {
      checkId: 'suspicious_pauses',
      passed: false,
      score: 0.9,
      details: `${Math.round(blurRatio * 100)}% of time spent away from survey`,
      data: { blurRatio, totalBlurTime, blurEvents: blurEvents.length },
    };
  }

  if (blurRatio > 0.3) {
    return {
      checkId: 'suspicious_pauses',
      passed: true,
      score: 0.5,
      details: 'Significant time away from survey',
      data: { blurRatio, totalBlurTime },
    };
  }

  return {
    checkId: 'suspicious_pauses',
    passed: true,
    score: 0,
    data: { blurRatio },
  };
}

/**
 * Run all timing checks
 */
export function runTimingChecks(
  responses: ResponseInput[],
  metrics?: BehavioralMetrics,
  context?: SurveyContext
): CheckResult[] {
  return [
    checkImpossiblyFast(responses, context),
    checkRapidCompletion(responses, context),
    checkUniformTiming(responses, metrics),
    checkSuspiciousPauses(metrics),
  ];
}
