/**
 * Cipher Auto-Labeling System
 *
 * Automatically labels survey responses as fraud/legitimate based on
 * high-confidence rules. These labels are used for ML training.
 */

import {
  CipherFeatures,
  SurveyResponseData,
  AutoLabelRule,
  AutoLabelResult,
  CipherLabelRow,
  LabelSource,
} from './types';

// ============================================
// AUTO-LABEL RULES
// ============================================

/**
 * Definite fraud rules (95%+ confidence)
 * These are clear indicators of automated/fraudulent responses
 */
const DEFINITE_FRAUD_RULES: AutoLabelRule[] = [
  {
    id: 'fingerprint_seen_50_plus',
    name: 'Duplicate Fingerprint (50+)',
    description: 'Same device fingerprint seen 50+ times',
    confidence: 0.95,
    isFraud: true,
    condition: (features) => features.fingerprintSeenCount >= 50,
  },
  {
    id: 'completion_under_10_seconds',
    name: 'Impossibly Fast Completion',
    description: 'Survey completed in under 10 seconds',
    confidence: 0.95,
    isFraud: true,
    condition: (features) =>
      features.completionTimeSeconds < 10 && features.questionCount >= 5,
  },
  {
    id: 'zero_mouse_zero_keyboard',
    name: 'No Human Interaction',
    description: 'Zero mouse movement and zero keyboard input',
    confidence: 0.95,
    isFraud: true,
    condition: (features) =>
      features.mouseDistanceTotal === 0 &&
      features.keystrokeCount === 0 &&
      features.questionCount >= 3,
  },
  {
    id: 'webdriver_detected',
    name: 'WebDriver Detected',
    description: 'Browser automation (Selenium) detected',
    confidence: 0.99,
    isFraud: true,
    condition: (features) => features.hasWebdriver,
  },
  {
    id: 'automation_flags',
    name: 'Automation Flags Detected',
    description: 'Browser automation indicators present',
    confidence: 0.95,
    isFraud: true,
    condition: (features) => features.hasAutomationFlags,
  },
  {
    id: 'honeypot_trap_filled',
    name: 'Honeypot Trap Triggered',
    description: 'Hidden trap field was filled (bots only)',
    confidence: 0.95,
    isFraud: true,
    condition: (features) => features.trapFieldFilled,
  },
  {
    id: 'all_first_options_100_percent',
    name: 'Perfect First Option Pattern',
    description: '100% first option selection (perfect straight-line)',
    confidence: 0.90,
    isFraud: true,
    condition: (features) =>
      features.firstOptionRatio === 1 && features.questionCount >= 5,
  },
];

/**
 * Likely fraud rules (80-94% confidence)
 * Strong indicators but not definitive
 */
const LIKELY_FRAUD_RULES: AutoLabelRule[] = [
  {
    id: 'datacenter_ip_no_mouse',
    name: 'Datacenter + No Mouse',
    description: 'Datacenter IP combined with minimal mouse activity',
    confidence: 0.85,
    isFraud: true,
    condition: (features) =>
      features.isDatacenter && features.mouseDistanceTotal < 100,
  },
  {
    id: 'vpn_bottom_1_percent_time',
    name: 'VPN + Bottom 1% Time',
    description: 'VPN user with extremely fast completion',
    confidence: 0.80,
    isFraud: true,
    condition: (features) =>
      features.isVpn &&
      features.completionTimeSeconds < 30 &&
      features.questionCount >= 5,
  },
  {
    id: 'tor_user',
    name: 'Tor Network',
    description: 'Response from Tor exit node',
    confidence: 0.85,
    isFraud: true,
    condition: (features) => features.isTor,
  },
  {
    id: 'all_first_options',
    name: 'All First Options Selected',
    description: '80%+ first option selection',
    confidence: 0.80,
    isFraud: true,
    condition: (features) =>
      features.firstOptionRatio >= 0.8 && features.questionCount >= 5,
  },
  {
    id: 'uniform_timing_no_variation',
    name: 'Robotic Timing Pattern',
    description: 'Near-zero timing variation across questions',
    confidence: 0.85,
    isFraud: true,
    condition: (features) =>
      features.timePerQuestionStd < 500 && // Less than 500ms variation
      features.questionCount >= 5 &&
      features.timePerQuestionMean < 5000, // Less than 5 seconds per question
  },
  {
    id: 'no_backspace_long_text',
    name: 'Perfect Typing',
    description: 'Long text responses with zero corrections',
    confidence: 0.80,
    isFraud: true,
    condition: (features) =>
      features.backspaceRatio === 0 &&
      features.keystrokeCount > 100 &&
      features.openEndedCount > 0,
  },
  {
    id: 'attention_check_failed',
    name: 'Attention Check Failed',
    description: 'Failed one or more attention check questions',
    confidence: 0.85,
    isFraud: true,
    condition: (features) =>
      !features.attentionCheckPassed && features.attentionCheckCount > 0,
  },
  {
    id: 'high_paste_ratio',
    name: 'Excessive Pasting',
    description: 'High number of paste events relative to typing',
    confidence: 0.80,
    isFraud: true,
    condition: (features) =>
      features.pasteEventCount > 5 &&
      features.pasteCharRatio > 0.5,
  },
  {
    id: 'ip_seen_20_plus',
    name: 'IP Seen Many Times',
    description: 'Same IP address seen 20+ times',
    confidence: 0.80,
    isFraud: true,
    condition: (features) => features.ipSeenCount >= 20,
  },
];

/**
 * Likely legitimate rules (80%+ confidence)
 * Strong indicators of genuine human responses
 */
const LIKELY_LEGITIMATE_RULES: AutoLabelRule[] = [
  {
    id: 'residential_natural_behavior',
    name: 'Natural Residential User',
    description: 'Residential IP with natural behavioral patterns',
    confidence: 0.85,
    isFraud: false,
    condition: (features) =>
      !features.isVpn &&
      !features.isDatacenter &&
      !features.isTor &&
      !features.isProxy &&
      features.mouseDistanceTotal > 1000 &&
      features.keystrokeCount > 20 &&
      features.backspaceRatio > 0.01 && // Some corrections
      features.timePerQuestionStd > 2000 && // Good variation
      features.completionTimeSeconds > 60, // At least 1 minute
  },
  {
    id: 'quality_open_ended_responses',
    name: 'Quality Open-Ended Responses',
    description: 'High-quality, diverse open-ended text responses',
    confidence: 0.90,
    isFraud: false,
    condition: (features) =>
      features.openEndedCount >= 2 &&
      features.openEndedLengthMean > 50 &&
      features.openEndedUniqueWordRatio > 0.5 &&
      !features.trapFieldFilled &&
      features.attentionCheckPassed,
  },
  {
    id: 'passed_all_honeypots',
    name: 'Passed All Honeypots',
    description: 'Passed all attention checks with reasonable time',
    confidence: 0.85,
    isFraud: false,
    condition: (features) =>
      features.attentionCheckPassed &&
      features.attentionCheckCount >= 1 &&
      !features.trapFieldFilled &&
      features.honeypotScore === 0 &&
      features.completionTimeSeconds > 60,
  },
  {
    id: 'diverse_answer_pattern',
    name: 'Diverse Answer Pattern',
    description: 'Good entropy in answers with natural distribution',
    confidence: 0.80,
    isFraud: false,
    condition: (features) =>
      features.straightLineRatio < 0.3 &&
      features.answerEntropy > 1.5 &&
      features.questionCount >= 5 &&
      features.firstOptionRatio < 0.4 &&
      features.lastOptionRatio < 0.4,
  },
  {
    id: 'natural_mouse_patterns',
    name: 'Natural Mouse Patterns',
    description: 'Mouse movement shows natural human characteristics',
    confidence: 0.85,
    isFraud: false,
    condition: (features) =>
      features.mouseDistanceTotal > 5000 &&
      features.mouseCurvatureEntropy > 1.0 &&
      features.mouseStraightLineRatio < 0.5 &&
      features.mousePauseCount > 5 &&
      features.mouseVelocityStd > 0.3,
  },
  {
    id: 'thoughtful_timing',
    name: 'Thoughtful Response Timing',
    description: 'Response timing indicates reading and consideration',
    confidence: 0.85,
    isFraud: false,
    condition: (features) =>
      features.timePerQuestionMean > 10000 && // At least 10s per question
      features.timePerQuestionStd > 5000 && // Good variation
      features.readingVsAnsweringRatio > 0.3 &&
      features.completionTimeSeconds > 120, // At least 2 minutes
  },
];

// ============================================
// AUTO-LABELING FUNCTIONS
// ============================================

/**
 * Run auto-labeling rules on extracted features
 * Returns a label result if a rule matches with high enough confidence
 */
export function autoLabel(
  features: CipherFeatures,
  response?: SurveyResponseData
): AutoLabelResult | null {
  // First check definite fraud rules (highest confidence)
  for (const rule of DEFINITE_FRAUD_RULES) {
    if (rule.condition(features, response)) {
      return {
        shouldLabel: true,
        isFraud: rule.isFraud,
        confidence: rule.confidence,
        reason: rule.description,
        ruleId: rule.id,
      };
    }
  }

  // Then check likely fraud rules
  for (const rule of LIKELY_FRAUD_RULES) {
    if (rule.condition(features, response)) {
      return {
        shouldLabel: true,
        isFraud: rule.isFraud,
        confidence: rule.confidence,
        reason: rule.description,
        ruleId: rule.id,
      };
    }
  }

  // Finally check legitimate rules
  for (const rule of LIKELY_LEGITIMATE_RULES) {
    if (rule.condition(features, response)) {
      return {
        shouldLabel: true,
        isFraud: rule.isFraud,
        confidence: rule.confidence,
        reason: rule.description,
        ruleId: rule.id,
      };
    }
  }

  // No rule matched with high enough confidence
  return null;
}

/**
 * Convert auto-label result to database row format
 */
export function labelResultToDbRow(
  responseId: string,
  result: AutoLabelResult
): Omit<CipherLabelRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    response_id: responseId,
    is_fraud: result.isFraud,
    confidence: result.confidence,
    label_source: 'auto_rule' as LabelSource,
    label_reason: `${result.ruleId}: ${result.reason}`,
    labeled_by: null,
    used_in_training: false,
    training_run_id: null,
  };
}

/**
 * Get all auto-label rules (for debugging/admin UI)
 */
export function getAllAutoLabelRules(): AutoLabelRule[] {
  return [
    ...DEFINITE_FRAUD_RULES,
    ...LIKELY_FRAUD_RULES,
    ...LIKELY_LEGITIMATE_RULES,
  ];
}

/**
 * Get fraud rules only
 */
export function getFraudRules(): AutoLabelRule[] {
  return [...DEFINITE_FRAUD_RULES, ...LIKELY_FRAUD_RULES];
}

/**
 * Get legitimate rules only
 */
export function getLegitimateRules(): AutoLabelRule[] {
  return LIKELY_LEGITIMATE_RULES;
}

// ============================================
// LABEL AGGREGATION
// ============================================

/**
 * Aggregate multiple signals into a single label decision
 * Used when combining rule-based and customer feedback
 */
export interface LabelSignal {
  isFraud: boolean;
  confidence: number;
  source: LabelSource;
}

export function aggregateLabels(signals: LabelSignal[]): {
  isFraud: boolean;
  confidence: number;
  reason: string;
} | null {
  if (signals.length === 0) {
    return null;
  }

  // Weight by source reliability
  const sourceWeights: Record<LabelSource, number> = {
    honeypot: 1.0,
    auto_rule: 0.9,
    customer_feedback: 0.8,
    manual_review: 1.0,
  };

  let fraudScore = 0;
  let legitimateScore = 0;
  let totalWeight = 0;

  for (const signal of signals) {
    const weight = sourceWeights[signal.source] * signal.confidence;
    totalWeight += weight;

    if (signal.isFraud) {
      fraudScore += weight;
    } else {
      legitimateScore += weight;
    }
  }

  if (totalWeight === 0) {
    return null;
  }

  const normalizedFraudScore = fraudScore / totalWeight;
  const isFraud = normalizedFraudScore > 0.5;
  const confidence = isFraud ? normalizedFraudScore : 1 - normalizedFraudScore;

  const sources = Array.from(new Set(signals.map((s) => s.source)));
  const reason = `Aggregated from ${signals.length} signals (${sources.join(', ')})`;

  return { isFraud, confidence, reason };
}

// ============================================
// LABELING STATISTICS
// ============================================

export interface LabelingStats {
  totalResponses: number;
  labeledResponses: number;
  fraudLabels: number;
  legitimateLabels: number;
  labelsBySource: Record<LabelSource, number>;
  averageConfidence: number;
  unlabeledResponses: number;
  labelingRate: number;
}

export function calculateLabelingStats(
  labels: CipherLabelRow[]
): LabelingStats {
  const fraudLabels = labels.filter((l) => l.is_fraud).length;
  const legitimateLabels = labels.filter((l) => !l.is_fraud).length;

  const labelsBySource: Record<LabelSource, number> = {
    honeypot: 0,
    auto_rule: 0,
    customer_feedback: 0,
    manual_review: 0,
  };

  let totalConfidence = 0;

  for (const label of labels) {
    labelsBySource[label.label_source]++;
    totalConfidence += label.confidence;
  }

  return {
    totalResponses: labels.length,
    labeledResponses: labels.length,
    fraudLabels,
    legitimateLabels,
    labelsBySource,
    averageConfidence: labels.length > 0 ? totalConfidence / labels.length : 0,
    unlabeledResponses: 0, // Would need total responses to calculate
    labelingRate: labels.length > 0 ? 1 : 0, // Would need total responses
  };
}

// ============================================
// TRAINING DATA READINESS
// ============================================

export interface TrainingReadiness {
  isReady: boolean;
  totalLabels: number;
  fraudLabels: number;
  legitimateLabels: number;
  minLabelsRequired: number;
  minFraudLabelsRequired: number;
  minLegitimateLabelsRequired: number;
  percentageReady: number;
  message: string;
}

const MIN_TOTAL_LABELS = 5000;
const MIN_FRAUD_LABELS = 500;
const MIN_LEGITIMATE_LABELS = 500;
const MIN_BALANCE_RATIO = 0.1; // At least 10% of each class

export function checkTrainingReadiness(
  labels: CipherLabelRow[]
): TrainingReadiness {
  const fraudLabels = labels.filter((l) => l.is_fraud).length;
  const legitimateLabels = labels.filter((l) => !l.is_fraud).length;
  const totalLabels = labels.length;

  // Check if we have enough total labels
  const totalReady = totalLabels >= MIN_TOTAL_LABELS;

  // Check if we have enough of each class
  const fraudReady = fraudLabels >= MIN_FRAUD_LABELS;
  const legitimateReady = legitimateLabels >= MIN_LEGITIMATE_LABELS;

  // Check class balance
  const fraudRatio = totalLabels > 0 ? fraudLabels / totalLabels : 0;
  const legitimateRatio = totalLabels > 0 ? legitimateLabels / totalLabels : 0;
  const balanced =
    fraudRatio >= MIN_BALANCE_RATIO && legitimateRatio >= MIN_BALANCE_RATIO;

  const isReady = totalReady && fraudReady && legitimateReady && balanced;

  // Calculate percentage ready (weighted average of requirements)
  const totalProgress = Math.min(1, totalLabels / MIN_TOTAL_LABELS);
  const fraudProgress = Math.min(1, fraudLabels / MIN_FRAUD_LABELS);
  const legitimateProgress = Math.min(1, legitimateLabels / MIN_LEGITIMATE_LABELS);
  const percentageReady = (totalProgress + fraudProgress + legitimateProgress) / 3;

  // Generate message
  let message: string;
  if (isReady) {
    message = 'Training data is ready! You can now train an ML model.';
  } else if (totalLabels < MIN_TOTAL_LABELS) {
    const needed = MIN_TOTAL_LABELS - totalLabels;
    message = `Need ${needed.toLocaleString()} more labeled responses (${totalLabels.toLocaleString()} / ${MIN_TOTAL_LABELS.toLocaleString()})`;
  } else if (fraudLabels < MIN_FRAUD_LABELS) {
    message = `Need more fraud examples (${fraudLabels} / ${MIN_FRAUD_LABELS} minimum)`;
  } else if (legitimateLabels < MIN_LEGITIMATE_LABELS) {
    message = `Need more legitimate examples (${legitimateLabels} / ${MIN_LEGITIMATE_LABELS} minimum)`;
  } else if (!balanced) {
    message = `Class imbalance detected. Fraud: ${(fraudRatio * 100).toFixed(1)}%, Legitimate: ${(legitimateRatio * 100).toFixed(1)}%`;
  } else {
    message = 'Unknown issue with training data';
  }

  return {
    isReady,
    totalLabels,
    fraudLabels,
    legitimateLabels,
    minLabelsRequired: MIN_TOTAL_LABELS,
    minFraudLabelsRequired: MIN_FRAUD_LABELS,
    minLegitimateLabelsRequired: MIN_LEGITIMATE_LABELS,
    percentageReady: Math.round(percentageReady * 100),
    message,
  };
}
