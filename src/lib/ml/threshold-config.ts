/**
 * SENTINEL Granular Threshold Configuration
 *
 * Defines precise parameter ranges for fraud detection across different score levels
 * Allows fine-tuning of detection sensitivity with decimal precision
 */

export interface ThresholdRange {
  min: number
  max: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  confidence: number // Minimum confidence required for this classification
  description: string
}

export interface ModelThresholds {
  behavioral: ThresholdRange[]
  aiContent: ThresholdRange[]
  plagiarism: ThresholdRange[]
  contradictions: ThresholdRange[]
  lowEffort: ThresholdRange[]
  deviceFingerprint: ThresholdRange[]
  fraudRing: ThresholdRange[]
}

/**
 * Granular threshold ranges for each detection model
 * More decimal precision for better accuracy
 */
export const DETECTION_THRESHOLDS: ModelThresholds = {
  behavioral: [
    {
      min: 0.00,
      max: 0.25,
      riskLevel: 'low',
      confidence: 0.60,
      description: 'Normal human-like behavior patterns',
    },
    {
      min: 0.25,
      max: 0.45,
      riskLevel: 'medium',
      confidence: 0.65,
      description: 'Some suspicious patterns detected',
    },
    {
      min: 0.45,
      max: 0.70,
      riskLevel: 'high',
      confidence: 0.75,
      description: 'Multiple behavioral anomalies detected',
    },
    {
      min: 0.70,
      max: 1.00,
      riskLevel: 'critical',
      confidence: 0.85,
      description: 'Clear bot/automation signatures',
    },
  ],

  aiContent: [
    {
      min: 0.00,
      max: 0.30,
      riskLevel: 'low',
      confidence: 0.70,
      description: 'Natural human writing style',
    },
    {
      min: 0.30,
      max: 0.55,
      riskLevel: 'medium',
      confidence: 0.75,
      description: 'Some AI-like patterns detected',
    },
    {
      min: 0.55,
      max: 0.75,
      riskLevel: 'high',
      confidence: 0.80,
      description: 'High probability of AI-generated content',
    },
    {
      min: 0.75,
      max: 1.00,
      riskLevel: 'critical',
      confidence: 0.90,
      description: 'Clear AI-generated content (ChatGPT/Claude)',
    },
  ],

  plagiarism: [
    {
      min: 0.00,
      max: 0.35,
      riskLevel: 'low',
      confidence: 0.65,
      description: 'Original content',
    },
    {
      min: 0.35,
      max: 0.60,
      riskLevel: 'medium',
      confidence: 0.70,
      description: 'Some similarities to known sources',
    },
    {
      min: 0.60,
      max: 0.80,
      riskLevel: 'high',
      confidence: 0.80,
      description: 'Substantial copying detected',
    },
    {
      min: 0.80,
      max: 1.00,
      riskLevel: 'critical',
      confidence: 0.85,
      description: 'Direct plagiarism from web/duplicate answers',
    },
  ],

  contradictions: [
    {
      min: 0.00,
      max: 0.20,
      riskLevel: 'low',
      confidence: 0.60,
      description: 'Consistent answers across questions',
    },
    {
      min: 0.20,
      max: 0.40,
      riskLevel: 'medium',
      confidence: 0.65,
      description: 'Minor inconsistencies detected',
    },
    {
      min: 0.40,
      max: 0.65,
      riskLevel: 'high',
      confidence: 0.75,
      description: 'Significant contradictions found',
    },
    {
      min: 0.65,
      max: 1.00,
      riskLevel: 'critical',
      confidence: 0.80,
      description: 'Multiple logical contradictions',
    },
  ],

  lowEffort: [
    {
      min: 0.00,
      max: 0.15, // LOWERED from 0.30 to catch more low-effort
      riskLevel: 'low',
      confidence: 0.70,
      description: 'Adequate response effort',
    },
    {
      min: 0.15,
      max: 0.35, // LOWERED to be more sensitive
      riskLevel: 'medium',
      confidence: 0.75,
      description: 'Minimal effort detected',
    },
    {
      min: 0.35,
      max: 0.60, // Adjusted range
      riskLevel: 'high',
      confidence: 0.80,
      description: 'Very low effort (straight-lining, single words)',
    },
    {
      min: 0.60,
      max: 1.00,
      riskLevel: 'critical',
      confidence: 0.85,
      description: 'Extreme low effort (gibberish, keyboard mashing)',
    },
  ],

  deviceFingerprint: [
    {
      min: 0.00,
      max: 0.30,
      riskLevel: 'low',
      confidence: 0.75,
      description: 'Legitimate device signature',
    },
    {
      min: 0.30,
      max: 0.55,
      riskLevel: 'medium',
      confidence: 0.80,
      description: 'Suspicious device characteristics',
    },
    {
      min: 0.55,
      max: 0.75,
      riskLevel: 'high',
      confidence: 0.85,
      description: 'Likely spoofed or automated device',
    },
    {
      min: 0.75,
      max: 1.00,
      riskLevel: 'critical',
      confidence: 0.95,
      description: 'WebDriver/automation detected',
    },
  ],

  fraudRing: [
    {
      min: 0.00,
      max: 0.40,
      riskLevel: 'low',
      confidence: 0.60,
      description: 'Independent submission',
    },
    {
      min: 0.40,
      max: 0.65,
      riskLevel: 'medium',
      confidence: 0.70,
      description: 'Some similarity to other submissions',
    },
    {
      min: 0.65,
      max: 0.85,
      riskLevel: 'high',
      confidence: 0.80,
      description: 'Part of possible coordinated group',
    },
    {
      min: 0.85,
      max: 1.00,
      riskLevel: 'critical',
      confidence: 0.90,
      description: 'Clear fraud ring participation',
    },
  ],
}

/**
 * Ensemble fraud score thresholds (combining all models)
 * More granular ranges for precise classification
 */
export const ENSEMBLE_THRESHOLDS = {
  // Very low risk: 0.00 - 0.20
  veryLow: {
    min: 0.00,
    max: 0.20,
    riskLevel: 'low' as const,
    action: 'accept',
    description: 'Highly likely legitimate response',
    confidenceRequired: 0.50,
  },

  // Low risk: 0.20 - 0.35
  low: {
    min: 0.20,
    max: 0.35,
    riskLevel: 'low' as const,
    action: 'accept',
    description: 'Likely legitimate with minimal concerns',
    confidenceRequired: 0.60,
  },

  // Medium-low risk: 0.35 - 0.50
  mediumLow: {
    min: 0.35,
    max: 0.50,
    riskLevel: 'medium' as const,
    action: 'review',
    description: 'Some suspicious patterns, review recommended',
    confidenceRequired: 0.65,
  },

  // Medium risk: 0.50 - 0.65
  medium: {
    min: 0.50,
    max: 0.65,
    riskLevel: 'medium' as const,
    action: 'review',
    description: 'Multiple fraud indicators, manual review required',
    confidenceRequired: 0.70,
  },

  // Medium-high risk: 0.65 - 0.75
  mediumHigh: {
    min: 0.65,
    max: 0.75,
    riskLevel: 'high' as const,
    action: 'flag',
    description: 'High fraud probability, flag for immediate review',
    confidenceRequired: 0.75,
  },

  // High risk: 0.75 - 0.85
  high: {
    min: 0.75,
    max: 0.85,
    riskLevel: 'high' as const,
    action: 'flag',
    description: 'Very high fraud probability, likely reject',
    confidenceRequired: 0.80,
  },

  // Critical risk: 0.85 - 0.95
  critical: {
    min: 0.85,
    max: 0.95,
    riskLevel: 'critical' as const,
    action: 'reject',
    description: 'Clear fraud detected, recommend automatic rejection',
    confidenceRequired: 0.85,
  },

  // Extreme risk: 0.95 - 1.00
  extreme: {
    min: 0.95,
    max: 1.00,
    riskLevel: 'critical' as const,
    action: 'reject',
    description: 'Obvious fraud (bot/AI), automatic rejection',
    confidenceRequired: 0.90,
  },
}

/**
 * Determine risk level with granular precision
 */
export function determineGranularRiskLevel(
  fraudScore: number,
  confidence: number
): {
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  action: 'accept' | 'review' | 'flag' | 'reject'
  description: string
  thresholdRange: typeof ENSEMBLE_THRESHOLDS[keyof typeof ENSEMBLE_THRESHOLDS]
} {
  // Find the matching threshold range
  for (const [key, threshold] of Object.entries(ENSEMBLE_THRESHOLDS)) {
    if (fraudScore >= threshold.min && fraudScore < threshold.max) {
      // Check if confidence meets requirement
      if (confidence >= threshold.confidenceRequired) {
        return {
          riskLevel: threshold.riskLevel,
          action: threshold.action,
          description: threshold.description,
          thresholdRange: threshold,
        }
      } else {
        // Lower confidence = be more conservative (increase risk level by one step)
        const adjustedRisk =
          threshold.riskLevel === 'low'
            ? 'medium'
            : threshold.riskLevel === 'medium'
            ? 'high'
            : 'critical'

        return {
          riskLevel: adjustedRisk as 'low' | 'medium' | 'high' | 'critical',
          action: threshold.action === 'accept' ? 'review' : threshold.action,
          description: `${threshold.description} (low confidence adjustment)`,
          thresholdRange: threshold,
        }
      }
    }
  }

  // Fallback for score = 1.00
  const extreme = ENSEMBLE_THRESHOLDS.extreme
  return {
    riskLevel: extreme.riskLevel,
    action: extreme.action,
    description: extreme.description,
    thresholdRange: extreme,
  }
}

/**
 * Get threshold range for a specific model score
 */
export function getModelThresholdRange(
  modelType: keyof ModelThresholds,
  score: number
): ThresholdRange {
  const thresholds = DETECTION_THRESHOLDS[modelType]

  for (const threshold of thresholds) {
    if (score >= threshold.min && score < threshold.max) {
      return threshold
    }
  }

  // Return highest threshold if score = 1.00
  return thresholds[thresholds.length - 1]
}

/**
 * Survey-specific threshold overrides
 * Allows customizing sensitivity per survey
 */
export interface SurveyThresholdConfig {
  surveyId: string

  // Overall sensitivity: 'strict' | 'balanced' | 'lenient'
  sensitivity: 'strict' | 'balanced' | 'lenient'

  // Multipliers for each detection type (0.5 = more lenient, 1.5 = more strict)
  multipliers?: {
    behavioral?: number
    aiContent?: number
    plagiarism?: number
    contradictions?: number
    lowEffort?: number
    deviceFingerprint?: number
    fraudRing?: number
  }

  // Auto-reject threshold (default: 0.85)
  autoRejectThreshold?: number

  // Auto-accept threshold (default: 0.20)
  autoAcceptThreshold?: number

  // Require manual review between these thresholds
  manualReviewRequired?: boolean
}

/**
 * Apply survey-specific threshold config
 */
export function applySurveyThresholds(
  baseScore: number,
  modelType: keyof ModelThresholds,
  surveyConfig?: SurveyThresholdConfig
): number {
  if (!surveyConfig) return baseScore

  // Apply sensitivity presets
  let multiplier = 1.0
  if (surveyConfig.sensitivity === 'strict') {
    multiplier = 1.25 // More sensitive (lower threshold needed)
  } else if (surveyConfig.sensitivity === 'lenient') {
    multiplier = 0.75 // Less sensitive (higher threshold needed)
  }

  // Apply model-specific multiplier
  if (surveyConfig.multipliers?.[modelType]) {
    multiplier *= surveyConfig.multipliers[modelType]!
  }

  // Adjust score based on multiplier
  // Higher multiplier = more sensitive = effective lower threshold
  const adjustedScore = baseScore * multiplier

  // Clamp to 0-1 range
  return Math.max(0, Math.min(1, adjustedScore))
}
