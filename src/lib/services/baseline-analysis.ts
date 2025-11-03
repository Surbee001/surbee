/**
 * Historical Baseline Analysis Service
 *
 * Builds "normal" behavior profiles and detects deviations from population norms
 * Adaptive learning: baselines improve over time with more legitimate data
 */

import type { BehavioralMetrics } from '@/features/survey/types'

export interface BaselineProfile {
  surveyId: string
  totalResponses: number
  legitimateResponses: number

  // Timing baselines
  timing: {
    meanResponseTime: number
    stdResponseTime: number
    medianResponseTime: number
    p95ResponseTime: number
    p5ResponseTime: number
  }

  // Interaction baselines
  interaction: {
    meanMouseEvents: number
    stdMouseEvents: number
    meanKeystrokes: number
    stdKeystrokes: number
    meanPasteEvents: number
    meanTabSwitches: number
  }

  // Quality baselines
  quality: {
    meanTextLength: number
    stdTextLength: number
    typicalCompletionRate: number
  }

  // Device distribution
  devices: {
    mobilePercent: number
    desktopPercent: number
    tabletPercent: number
    commonUserAgents: string[]
  }

  // Last updated
  lastUpdated: string
  confidence: number // 0-1, based on sample size
}

export interface DeviationAnalysis {
  isAnomalous: boolean
  deviationScore: number // 0-1, higher = more deviant
  confidence: number
  deviations: Deviation[]
  comparisonMetrics: {
    responseTime: { value: number; baseline: number; zScore: number }
    mouseActivity: { value: number; baseline: number; zScore: number }
    keystrokes: { value: number; baseline: number; zScore: number }
    quality: { value: number; baseline: number; zScore: number }
  }
}

export interface Deviation {
  metric: string
  severity: 'low' | 'medium' | 'high'
  description: string
  zScore: number // number of standard deviations from mean
  percentile: number // where this value falls in the distribution
}

/**
 * Build or update baseline profile for a survey
 */
export async function buildBaseline(
  supabase: any,
  surveyId: string,
  options?: {
    minSampleSize?: number
    excludeFlagged?: boolean
  }
): Promise<BaselineProfile> {
  const minSampleSize = options?.minSampleSize || 30
  const excludeFlagged = options?.excludeFlagged !== false

  try {
    // Fetch responses for baseline calculation
    let query = supabase
      .from('survey_responses')
      .select('responses, timing_data, mouse_data, keystroke_data, device_data, fraud_score, is_flagged, created_at')
      .eq('survey_id', surveyId)
      .eq('completed_at', 'not.null')

    if (excludeFlagged) {
      query = query.or('is_flagged.is.null,is_flagged.eq.false')
      query = query.or('fraud_score.is.null,fraud_score.lt.0.5') // Only use low-risk responses
    }

    const { data: responses, error } = await query.limit(1000) // Limit for performance

    if (error || !responses || responses.length < minSampleSize) {
      return getDefaultBaseline(surveyId)
    }

    // Calculate timing statistics
    const responseTimes = responses
      .flatMap(r => r.timing_data || [])
      .filter((t): t is number => typeof t === 'number' && t > 0 && t < 600000) // < 10 min

    const timing = {
      meanResponseTime: mean(responseTimes),
      stdResponseTime: std(responseTimes),
      medianResponseTime: median(responseTimes),
      p95ResponseTime: percentile(responseTimes, 0.95),
      p5ResponseTime: percentile(responseTimes, 0.05),
    }

    // Calculate interaction statistics
    const mouseEventCounts = responses
      .map(r => (r.mouse_data ? (Array.isArray(r.mouse_data) ? r.mouse_data.length : 0) : 0))
      .filter(c => c > 0)

    const keystrokeCounts = responses
      .map(r => (r.keystroke_data ? (Array.isArray(r.keystroke_data) ? r.keystroke_data.length : 0) : 0))
      .filter(c => c > 0)

    const interaction = {
      meanMouseEvents: mean(mouseEventCounts),
      stdMouseEvents: std(mouseEventCounts),
      meanKeystrokes: mean(keystrokeCounts),
      stdKeystrokes: std(keystrokeCounts),
      meanPasteEvents: 0.5, // Placeholder
      meanTabSwitches: 1.2, // Placeholder
    }

    // Calculate quality statistics
    const textLengths = responses
      .flatMap(r => Object.values(r.responses || {}))
      .filter(v => typeof v === 'string')
      .map(v => (v as string).length)
      .filter(l => l > 0)

    const quality = {
      meanTextLength: mean(textLengths),
      stdTextLength: std(textLengths),
      typicalCompletionRate: 0.85, // Placeholder
    }

    // Calculate device distribution
    const userAgents = responses.map(r => r.device_data?.userAgent).filter(Boolean)
    const mobileCount = userAgents.filter(ua => /mobile|android|iphone/i.test(ua || '')).length
    const tabletCount = userAgents.filter(ua => /tablet|ipad/i.test(ua || '')).length

    const devices = {
      mobilePercent: (mobileCount / responses.length) * 100,
      desktopPercent: ((responses.length - mobileCount - tabletCount) / responses.length) * 100,
      tabletPercent: (tabletCount / responses.length) * 100,
      commonUserAgents: getTopUserAgents(userAgents, 5),
    }

    // Calculate confidence based on sample size
    const confidence = Math.min(responses.length / 100, 1) // Max confidence at 100+ samples

    return {
      surveyId,
      totalResponses: responses.length,
      legitimateResponses: responses.length,
      timing,
      interaction,
      quality,
      devices,
      lastUpdated: new Date().toISOString(),
      confidence,
    }
  } catch (error) {
    console.error('Baseline calculation error:', error)
    return getDefaultBaseline(surveyId)
  }
}

/**
 * Compare current response against baseline
 */
export function compareToBaseline(
  metrics: BehavioralMetrics,
  responses: Record<string, any>,
  baseline: BaselineProfile
): DeviationAnalysis {
  const deviations: Deviation[] = []
  const comparisonMetrics = {
    responseTime: { value: 0, baseline: 0, zScore: 0 },
    mouseActivity: { value: 0, baseline: 0, zScore: 0 },
    keystrokes: { value: 0, baseline: 0, zScore: 0 },
    quality: { value: 0, baseline: 0, zScore: 0 },
  }

  // 1. Compare response time
  if (metrics.responseTime && metrics.responseTime.length > 0) {
    const avgTime = metrics.responseTime.reduce((a, b) => a + b, 0) / metrics.responseTime.length
    const zScore = (avgTime - baseline.timing.meanResponseTime) / Math.max(baseline.timing.stdResponseTime, 1)

    comparisonMetrics.responseTime = {
      value: avgTime,
      baseline: baseline.timing.meanResponseTime,
      zScore,
    }

    if (Math.abs(zScore) > 3) {
      deviations.push({
        metric: 'response_time',
        severity: 'high',
        description: `Response time ${avgTime < baseline.timing.meanResponseTime ? 'much faster' : 'much slower'} than typical (${Math.abs(zScore).toFixed(1)} std devs)`,
        zScore,
        percentile: cdf(zScore),
      })
    } else if (Math.abs(zScore) > 2) {
      deviations.push({
        metric: 'response_time',
        severity: 'medium',
        description: `Response time ${avgTime < baseline.timing.meanResponseTime ? 'faster' : 'slower'} than typical`,
        zScore,
        percentile: cdf(zScore),
      })
    }
  }

  // 2. Compare mouse activity
  const mouseCount = metrics.mouseMovements?.length || 0
  const mouseZScore = (mouseCount - baseline.interaction.meanMouseEvents) / Math.max(baseline.interaction.stdMouseEvents, 1)

  comparisonMetrics.mouseActivity = {
    value: mouseCount,
    baseline: baseline.interaction.meanMouseEvents,
    zScore: mouseZScore,
  }

  if (mouseZScore < -2) {
    deviations.push({
      metric: 'mouse_activity',
      severity: mouseZScore < -3 ? 'high' : 'medium',
      description: `Unusually low mouse activity (${Math.abs(mouseZScore).toFixed(1)} std devs below average)`,
      zScore: mouseZScore,
      percentile: cdf(mouseZScore),
    })
  }

  // 3. Compare keystroke activity
  const keystrokeCount = metrics.keypressCount || 0
  const keystrokeZScore = (keystrokeCount - baseline.interaction.meanKeystrokes) / Math.max(baseline.interaction.stdKeystrokes, 1)

  comparisonMetrics.keystrokes = {
    value: keystrokeCount,
    baseline: baseline.interaction.meanKeystrokes,
    zScore: keystrokeZScore,
  }

  if (keystrokeZScore < -2) {
    deviations.push({
      metric: 'keystrokes',
      severity: keystrokeZScore < -3 ? 'high' : 'medium',
      description: `Unusually low typing activity`,
      zScore: keystrokeZScore,
      percentile: cdf(keystrokeZScore),
    })
  }

  // 4. Compare text quality
  const textResponses = Object.values(responses).filter(v => typeof v === 'string')
  const avgTextLength = textResponses.length > 0
    ? textResponses.reduce((sum, v) => sum + (v as string).length, 0) / textResponses.length
    : 0

  const qualityZScore = (avgTextLength - baseline.quality.meanTextLength) / Math.max(baseline.quality.stdTextLength, 1)

  comparisonMetrics.quality = {
    value: avgTextLength,
    baseline: baseline.quality.meanTextLength,
    zScore: qualityZScore,
  }

  if (Math.abs(qualityZScore) > 2) {
    deviations.push({
      metric: 'text_quality',
      severity: 'low',
      description: `Text length ${qualityZScore > 0 ? 'longer' : 'shorter'} than typical`,
      zScore: qualityZScore,
      percentile: cdf(qualityZScore),
    })
  }

  // Calculate overall deviation score
  const deviationScore = Math.min(
    deviations.reduce((sum, d) => {
      const weight = d.severity === 'high' ? 0.4 : d.severity === 'medium' ? 0.25 : 0.1
      return sum + weight
    }, 0),
    1
  )

  return {
    isAnomalous: deviationScore > 0.5 || deviations.some(d => d.severity === 'high'),
    deviationScore,
    confidence: baseline.confidence,
    deviations,
    comparisonMetrics,
  }
}

/**
 * Statistical helper functions
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function std(values: number[]): number {
  if (values.length === 0) return 0
  const avg = mean(values)
  const squareDiffs = values.map(val => Math.pow(val - avg, 2))
  return Math.sqrt(mean(squareDiffs))
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil(sorted.length * p) - 1
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))]
}

/**
 * Cumulative distribution function (normal approximation)
 */
function cdf(z: number): number {
  // Approximate CDF using error function
  const t = 1 / (1 + 0.2316419 * Math.abs(z))
  const d = 0.3989423 * Math.exp(-z * z / 2)
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))))
  return z > 0 ? 1 - p : p
}

/**
 * Get top N most common user agents
 */
function getTopUserAgents(userAgents: (string | undefined)[], n: number): string[] {
  const counts = new Map<string, number>()

  userAgents.forEach(ua => {
    if (ua) {
      counts.set(ua, (counts.get(ua) || 0) + 1)
    }
  })

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([ua]) => ua)
}

/**
 * Get default baseline when insufficient data
 */
function getDefaultBaseline(surveyId: string): BaselineProfile {
  return {
    surveyId,
    totalResponses: 0,
    legitimateResponses: 0,
    timing: {
      meanResponseTime: 15000, // 15 seconds
      stdResponseTime: 10000,
      medianResponseTime: 12000,
      p95ResponseTime: 35000,
      p5ResponseTime: 5000,
    },
    interaction: {
      meanMouseEvents: 50,
      stdMouseEvents: 30,
      meanKeystrokes: 100,
      stdKeystrokes: 50,
      meanPasteEvents: 0.5,
      meanTabSwitches: 1.2,
    },
    quality: {
      meanTextLength: 50,
      stdTextLength: 30,
      typicalCompletionRate: 0.85,
    },
    devices: {
      mobilePercent: 30,
      desktopPercent: 65,
      tabletPercent: 5,
      commonUserAgents: [],
    },
    lastUpdated: new Date().toISOString(),
    confidence: 0, // No confidence without data
  }
}

/**
 * Update baseline with new legitimate response
 */
export function updateBaselineIncremental(
  baseline: BaselineProfile,
  newMetrics: BehavioralMetrics,
  newResponses: Record<string, any>
): BaselineProfile {
  // Incremental update using running averages
  const n = baseline.legitimateResponses
  const alpha = 1 / (n + 1) // Weight for new data

  // Update timing
  const avgTime = newMetrics.responseTime.reduce((a, b) => a + b, 0) / newMetrics.responseTime.length
  baseline.timing.meanResponseTime = baseline.timing.meanResponseTime * (1 - alpha) + avgTime * alpha

  // Update interaction
  const mouseCount = newMetrics.mouseMovements?.length || 0
  baseline.interaction.meanMouseEvents = baseline.interaction.meanMouseEvents * (1 - alpha) + mouseCount * alpha

  const keystrokeCount = newMetrics.keypressCount || 0
  baseline.interaction.meanKeystrokes = baseline.interaction.meanKeystrokes * (1 - alpha) + keystrokeCount * alpha

  // Increment counter
  baseline.legitimateResponses++
  baseline.lastUpdated = new Date().toISOString()
  baseline.confidence = Math.min(baseline.legitimateResponses / 100, 1)

  return baseline
}
