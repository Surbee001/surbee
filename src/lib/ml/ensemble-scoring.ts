/**
 * Ensemble Scoring Engine
 *
 * Combines all fraud detection models into a unified, calibrated fraud score
 * with confidence intervals and comprehensive explainability
 */

import {
  calculateBayesianProbability,
  convertToBayesianEvidence,
  calculateConfidenceInterval,
  ensembleVoting,
  type BayesianResult,
} from './bayesian-engine'
import type { BehavioralMetrics } from '@/features/survey/types'
import {
  determineGranularRiskLevel,
  getModelThresholdRange,
  applySurveyThresholds,
  type SurveyThresholdConfig,
} from './threshold-config'

export interface EnsembleScoreResult {
  // Final verdict
  fraudScore: number // 0-1, calibrated Bayesian posterior
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  isLikelyFraud: boolean

  // Confidence metrics
  confidence: number // 0-1
  confidenceInterval: {
    lower: number
    upper: number
    width: number
  }

  // Model contributions
  modelScores: {
    behavioral: { score: number; weight: number; contribution: number }
    aiContent: { score: number; weight: number; contribution: number }
    plagiarism: { score: number; weight: number; contribution: number }
    contradictions: { score: number; weight: number; contribution: number }
    ipReputation: { score: number; weight: number; contribution: number }
    deviceFingerprint: { score: number; weight: number; contribution: number }
    fraudRing: { score: number; weight: number; contribution: number }
    baselineDeviation: { score: number; weight: number; contribution: number }
  }

  // Bayesian analysis
  bayesianAnalysis: BayesianResult

  // Evidence aggregation
  evidence: {
    critical: Evidence[]
    high: Evidence[]
    medium: Evidence[]
    low: Evidence[]
    benign: Evidence[]
  }

  // Explainability
  reasoning: {
    summary: string
    keyFactors: string[]
    mitigatingFactors: string[]
    recommendation: string
    alternativeExplanations: string[]
  }

  // Metadata
  timestamp: string
  modelVersion: string
}

export interface Evidence {
  source: string
  description: string
  severity: 'critical' | 'high' | 'medium' | 'low' | 'benign'
  confidence: number
  impact: number // How much this affected the score
}

export interface EnsembleInput {
  // Category scores from different detection systems
  behavioral?: number
  aiContent?: number
  plagiarism?: number
  contradictions?: number
  ipReputation?: number
  deviceFingerprint?: number
  fraudRing?: number
  baselineDeviation?: number

  // Raw metrics for deep analysis
  behavioralMetrics?: BehavioralMetrics
  responses?: Record<string, any>

  // Context
  surveyId?: string
  respondentId?: string
  priorFraudRate?: number // Historical fraud rate for this survey

  // Survey-specific threshold configuration
  surveyThresholdConfig?: SurveyThresholdConfig
}

/**
 * Main ensemble scoring function
 */
export function calculateEnsembleScore(input: EnsembleInput): EnsembleScoreResult {
  // 1. Normalize and weight model scores
  const modelScores = normalizeModelScores(input)

  // 2. Convert to Bayesian evidence
  const bayesianEvidence = convertToBayesianEvidence({
    behavioral: modelScores.behavioral.score,
    aiContent: modelScores.aiContent.score,
    plagiarism: modelScores.plagiarism.score,
    contradictions: modelScores.contradictions.score,
    ipReputation: modelScores.ipReputation.score,
    deviceFingerprint: modelScores.deviceFingerprint.score,
    fraudRing: modelScores.fraudRing.score,
    baselineDeviation: modelScores.baselineDeviation.score,
  })

  // 3. Calculate Bayesian probability
  const bayesianAnalysis = calculateBayesianProbability(
    bayesianEvidence,
    input.priorFraudRate || 0.15
  )

  // 4. Calculate confidence interval
  const evidenceCount = bayesianEvidence.filter(e => e.observed).length
  const confidenceInterval = calculateConfidenceInterval(
    bayesianAnalysis.posteriorProbability,
    evidenceCount * 10, // Approximate sample size
    0.95
  )

  // 5. Aggregate evidence
  const evidence = aggregateEvidence(modelScores, bayesianEvidence, bayesianAnalysis)

  // 6. Determine risk level
  const riskLevel = determineRiskLevel(
    bayesianAnalysis.posteriorProbability,
    bayesianAnalysis.confidence
  )

  // 7. Generate reasoning
  const reasoning = generateReasoning(
    modelScores,
    evidence,
    bayesianAnalysis,
    riskLevel
  )

  return {
    fraudScore: bayesianAnalysis.posteriorProbability,
    riskLevel,
    isLikelyFraud: bayesianAnalysis.posteriorProbability >= 0.6,
    confidence: bayesianAnalysis.confidence,
    confidenceInterval,
    modelScores,
    bayesianAnalysis,
    evidence,
    reasoning,
    timestamp: new Date().toISOString(),
    modelVersion: '2.0.0-bayesian',
  }
}

/**
 * Normalize and weight model scores
 */
function normalizeModelScores(input: EnsembleInput): EnsembleScoreResult['modelScores'] {
  // Dynamic weighting based on availability and confidence
  const weights = {
    behavioral: 0.20,
    aiContent: 0.20,
    plagiarism: 0.15,
    contradictions: 0.10,
    ipReputation: 0.10,
    deviceFingerprint: 0.15,
    fraudRing: 0.05,
    baselineDeviation: 0.05,
  }

  // Adjust weights if some models are unavailable
  const availableModels = Object.keys(weights).filter(
    k => input[k as keyof EnsembleInput] !== undefined && input[k as keyof EnsembleInput] !== null
  )

  const totalAvailableWeight = availableModels.reduce((sum, k) => sum + weights[k as keyof typeof weights], 0)

  // Normalize weights to sum to 1
  const normalizedWeights = { ...weights }
  Object.keys(normalizedWeights).forEach(k => {
    if (availableModels.includes(k)) {
      normalizedWeights[k as keyof typeof weights] /= totalAvailableWeight
    } else {
      normalizedWeights[k as keyof typeof weights] = 0
    }
  })

  // Calculate contributions
  return {
    behavioral: {
      score: input.behavioral || 0,
      weight: normalizedWeights.behavioral,
      contribution: (input.behavioral || 0) * normalizedWeights.behavioral,
    },
    aiContent: {
      score: input.aiContent || 0,
      weight: normalizedWeights.aiContent,
      contribution: (input.aiContent || 0) * normalizedWeights.aiContent,
    },
    plagiarism: {
      score: input.plagiarism || 0,
      weight: normalizedWeights.plagiarism,
      contribution: (input.plagiarism || 0) * normalizedWeights.plagiarism,
    },
    contradictions: {
      score: input.contradictions || 0,
      weight: normalizedWeights.contradictions,
      contribution: (input.contradictions || 0) * normalizedWeights.contradictions,
    },
    ipReputation: {
      score: input.ipReputation || 0,
      weight: normalizedWeights.ipReputation,
      contribution: (input.ipReputation || 0) * normalizedWeights.ipReputation,
    },
    deviceFingerprint: {
      score: input.deviceFingerprint || 0,
      weight: normalizedWeights.deviceFingerprint,
      contribution: (input.deviceFingerprint || 0) * normalizedWeights.deviceFingerprint,
    },
    fraudRing: {
      score: input.fraudRing || 0,
      weight: normalizedWeights.fraudRing,
      contribution: (input.fraudRing || 0) * normalizedWeights.fraudRing,
    },
    baselineDeviation: {
      score: input.baselineDeviation || 0,
      weight: normalizedWeights.baselineDeviation,
      contribution: (input.baselineDeviation || 0) * normalizedWeights.baselineDeviation,
    },
  }
}

/**
 * Aggregate evidence from all sources using granular thresholds
 */
function aggregateEvidence(
  modelScores: EnsembleScoreResult['modelScores'],
  bayesianEvidence: any[],
  bayesianAnalysis: BayesianResult
): EnsembleScoreResult['evidence'] {
  const evidence: EnsembleScoreResult['evidence'] = {
    critical: [],
    high: [],
    medium: [],
    low: [],
    benign: [],
  }

  // Behavioral evidence - using granular thresholds
  const behavioralRange = getModelThresholdRange('behavioral', modelScores.behavioral.score)
  if (behavioralRange.riskLevel === 'critical') {
    evidence.critical.push({
      source: 'Behavioral Analysis',
      description: behavioralRange.description,
      severity: 'critical',
      confidence: behavioralRange.confidence,
      impact: modelScores.behavioral.contribution,
    })
  } else if (behavioralRange.riskLevel === 'high') {
    evidence.high.push({
      source: 'Behavioral Analysis',
      description: behavioralRange.description,
      severity: 'high',
      confidence: behavioralRange.confidence,
      impact: modelScores.behavioral.contribution,
    })
  } else if (behavioralRange.riskLevel === 'medium') {
    evidence.medium.push({
      source: 'Behavioral Analysis',
      description: behavioralRange.description,
      severity: 'medium',
      confidence: behavioralRange.confidence,
      impact: modelScores.behavioral.contribution,
    })
  }

  // AI content evidence - using granular thresholds
  const aiContentRange = getModelThresholdRange('aiContent', modelScores.aiContent.score)
  if (aiContentRange.riskLevel === 'critical') {
    evidence.critical.push({
      source: 'AI Text Detection',
      description: aiContentRange.description,
      severity: 'critical',
      confidence: aiContentRange.confidence,
      impact: modelScores.aiContent.contribution,
    })
  } else if (aiContentRange.riskLevel === 'high') {
    evidence.high.push({
      source: 'AI Text Detection',
      description: aiContentRange.description,
      severity: 'high',
      confidence: aiContentRange.confidence,
      impact: modelScores.aiContent.contribution,
    })
  } else if (aiContentRange.riskLevel === 'medium') {
    evidence.medium.push({
      source: 'AI Text Detection',
      description: aiContentRange.description,
      severity: 'medium',
      confidence: aiContentRange.confidence,
      impact: modelScores.aiContent.contribution,
    })
  }

  // Plagiarism evidence - using granular thresholds
  const plagiarismRange = getModelThresholdRange('plagiarism', modelScores.plagiarism.score)
  if (plagiarismRange.riskLevel === 'critical') {
    evidence.critical.push({
      source: 'Plagiarism Detection',
      description: plagiarismRange.description,
      severity: 'critical',
      confidence: plagiarismRange.confidence,
      impact: modelScores.plagiarism.contribution,
    })
  } else if (plagiarismRange.riskLevel === 'high') {
    evidence.high.push({
      source: 'Plagiarism Detection',
      description: plagiarismRange.description,
      severity: 'high',
      confidence: plagiarismRange.confidence,
      impact: modelScores.plagiarism.contribution,
    })
  } else if (plagiarismRange.riskLevel === 'medium') {
    evidence.medium.push({
      source: 'Plagiarism Detection',
      description: plagiarismRange.description,
      severity: 'medium',
      confidence: plagiarismRange.confidence,
      impact: modelScores.plagiarism.contribution,
    })
  }

  // Contradiction evidence - using granular thresholds
  const contradictionsRange = getModelThresholdRange('contradictions', modelScores.contradictions.score)
  if (contradictionsRange.riskLevel === 'critical') {
    evidence.critical.push({
      source: 'Semantic Analysis',
      description: contradictionsRange.description,
      severity: 'critical',
      confidence: contradictionsRange.confidence,
      impact: modelScores.contradictions.contribution,
    })
  } else if (contradictionsRange.riskLevel === 'high') {
    evidence.high.push({
      source: 'Semantic Analysis',
      description: contradictionsRange.description,
      severity: 'high',
      confidence: contradictionsRange.confidence,
      impact: modelScores.contradictions.contribution,
    })
  } else if (contradictionsRange.riskLevel === 'medium') {
    evidence.medium.push({
      source: 'Semantic Analysis',
      description: contradictionsRange.description,
      severity: 'medium',
      confidence: contradictionsRange.confidence,
      impact: modelScores.contradictions.contribution,
    })
  }

  // IP reputation evidence
  if (modelScores.ipReputation.score > 0.6) {
    evidence.medium.push({
      source: 'IP Reputation',
      description: 'Suspicious IP address (VPN, proxy, or datacenter)',
      severity: 'medium',
      confidence: 0.6,
      impact: modelScores.ipReputation.contribution,
    })
  }

  // Device fingerprint evidence - using granular thresholds
  const deviceFingerprintRange = getModelThresholdRange('deviceFingerprint', modelScores.deviceFingerprint.score)
  if (deviceFingerprintRange.riskLevel === 'critical') {
    evidence.critical.push({
      source: 'Device Analysis',
      description: deviceFingerprintRange.description,
      severity: 'critical',
      confidence: deviceFingerprintRange.confidence,
      impact: modelScores.deviceFingerprint.contribution,
    })
  } else if (deviceFingerprintRange.riskLevel === 'high') {
    evidence.high.push({
      source: 'Device Analysis',
      description: deviceFingerprintRange.description,
      severity: 'high',
      confidence: deviceFingerprintRange.confidence,
      impact: modelScores.deviceFingerprint.contribution,
    })
  } else if (deviceFingerprintRange.riskLevel === 'medium') {
    evidence.medium.push({
      source: 'Device Analysis',
      description: deviceFingerprintRange.description,
      severity: 'medium',
      confidence: deviceFingerprintRange.confidence,
      impact: modelScores.deviceFingerprint.contribution,
    })
  }

  // Fraud ring evidence - using granular thresholds
  const fraudRingRange = getModelThresholdRange('fraudRing', modelScores.fraudRing.score)
  if (fraudRingRange.riskLevel === 'critical') {
    evidence.critical.push({
      source: 'Fraud Ring Detection',
      description: fraudRingRange.description,
      severity: 'critical',
      confidence: fraudRingRange.confidence,
      impact: modelScores.fraudRing.contribution,
    })
  } else if (fraudRingRange.riskLevel === 'high') {
    evidence.high.push({
      source: 'Fraud Ring Detection',
      description: fraudRingRange.description,
      severity: 'high',
      confidence: fraudRingRange.confidence,
      impact: modelScores.fraudRing.contribution,
    })
  } else if (fraudRingRange.riskLevel === 'medium') {
    evidence.medium.push({
      source: 'Fraud Ring Detection',
      description: fraudRingRange.description,
      severity: 'medium',
      confidence: fraudRingRange.confidence,
      impact: modelScores.fraudRing.contribution,
    })
  }

  // Baseline deviation evidence
  if (modelScores.baselineDeviation.score > 0.6) {
    evidence.medium.push({
      source: 'Baseline Analysis',
      description: 'Behavior significantly different from population norms',
      severity: 'medium',
      confidence: 0.6,
      impact: modelScores.baselineDeviation.contribution,
    })
  }

  // Add benign signals (reduce false positives)
  if (modelScores.behavioral.score < 0.3) {
    evidence.benign.push({
      source: 'Behavioral Analysis',
      description: 'Normal human-like behavior observed',
      severity: 'benign',
      confidence: 0.7,
      impact: -0.1,
    })
  }

  return evidence
}

/**
 * Determine risk level based on fraud score and confidence
 * Now uses granular threshold system with 8 precise ranges
 */
function determineRiskLevel(
  fraudScore: number,
  confidence: number
): 'low' | 'medium' | 'high' | 'critical' {
  // Use the granular threshold system from threshold-config.ts
  const riskAssessment = determineGranularRiskLevel(fraudScore, confidence)
  return riskAssessment.riskLevel
}

/**
 * Generate comprehensive human-readable reasoning with detailed explanations
 */
function generateReasoning(
  modelScores: EnsembleScoreResult['modelScores'],
  evidence: EnsembleScoreResult['evidence'],
  bayesianAnalysis: BayesianResult,
  riskLevel: string
): EnsembleScoreResult['reasoning'] {
  // Enhanced Summary with more context
  const activeModels = Object.values(modelScores).filter(m => m.score > 0).length
  const totalIndicators = evidence.critical.length + evidence.high.length + evidence.medium.length
  const criticalCount = evidence.critical.length
  const highCount = evidence.high.length

  let summary = `FRAUD DETECTION ASSESSMENT - ${riskLevel.toUpperCase()} RISK\n\n`
  summary += `Final Fraud Probability: ${(bayesianAnalysis.posteriorProbability * 100).toFixed(1)}% (Confidence: ${(bayesianAnalysis.confidence * 100).toFixed(0)}%)\n\n`
  summary += `Our 7-layer Bayesian ensemble model analyzed this response across ${activeModels} detection systems and identified ${totalIndicators} fraud indicators:\n`
  summary += `- ${criticalCount} CRITICAL indicators (high-confidence fraud signals)\n`
  summary += `- ${highCount} HIGH-severity indicators (strong fraud signals)\n`
  summary += `- ${evidence.medium.length} MEDIUM-severity indicators (moderate concerns)\n\n`

  // Add model score breakdown
  summary += `Detection System Scores:\n`
  if (modelScores.behavioral.score > 0) {
    summary += `- Behavioral Analysis: ${(modelScores.behavioral.score * 100).toFixed(1)}% (${getScoreInterpretation(modelScores.behavioral.score)})\n`
  }
  if (modelScores.aiContent.score > 0) {
    summary += `- AI Content Detection: ${(modelScores.aiContent.score * 100).toFixed(1)}% (${getScoreInterpretation(modelScores.aiContent.score)})\n`
  }
  if (modelScores.plagiarism.score > 0) {
    summary += `- Plagiarism Detection: ${(modelScores.plagiarism.score * 100).toFixed(1)}% (${getScoreInterpretation(modelScores.plagiarism.score)})\n`
  }
  if (modelScores.contradictions.score > 0) {
    summary += `- Contradiction Analysis: ${(modelScores.contradictions.score * 100).toFixed(1)}% (${getScoreInterpretation(modelScores.contradictions.score)})\n`
  }
  if (modelScores.deviceFingerprint.score > 0) {
    summary += `- Device Fingerprint: ${(modelScores.deviceFingerprint.score * 100).toFixed(1)}% (${getScoreInterpretation(modelScores.deviceFingerprint.score)})\n`
  }
  if (modelScores.fraudRing.score > 0) {
    summary += `- Fraud Ring Detection: ${(modelScores.fraudRing.score * 100).toFixed(1)}% (${getScoreInterpretation(modelScores.fraudRing.score)})\n`
  }

  // Key factors (what makes it suspicious)
  const keyFactors: string[] = []

  evidence.critical.forEach(e => {
    keyFactors.push(`CRITICAL: ${e.description}`)
  })

  evidence.high.forEach(e => {
    keyFactors.push(`HIGH: ${e.description}`)
  })

  evidence.medium.slice(0, 2).forEach(e => {
    keyFactors.push(`MEDIUM: ${e.description}`)
  })

  // Mitigating factors (what makes it seem legitimate)
  const mitigatingFactors: string[] = []

  evidence.benign.forEach(e => {
    mitigatingFactors.push(e.description)
  })

  if (bayesianAnalysis.posteriorProbability < bayesianAnalysis.priorProbability) {
    mitigatingFactors.push('Evidence actually decreased fraud probability from baseline')
  }

  // Recommendation
  let recommendation = ''
  if (riskLevel === 'critical') {
    recommendation = 'REJECT: This response shows strong fraud indicators and should be automatically rejected.'
  } else if (riskLevel === 'high') {
    recommendation = 'FLAG FOR REVIEW: This response is likely fraudulent and requires manual review before acceptance.'
  } else if (riskLevel === 'medium') {
    recommendation = 'MANUAL REVIEW RECOMMENDED: Some suspicious patterns detected. Review recommended before final decision.'
  } else {
    recommendation = 'ACCEPT: This response appears legitimate with minimal fraud indicators.'
  }

  // Alternative explanations
  const alternativeExplanations: string[] = []

  if (modelScores.behavioral.score > 0.5 && modelScores.aiContent.score < 0.3) {
    alternativeExplanations.push('Fast completion could indicate familiarity with topic rather than cheating')
  }

  if (modelScores.ipReputation.score > 0.5) {
    alternativeExplanations.push('VPN usage may be for privacy rather than fraud')
  }

  if (modelScores.contradictions.score > 0.4) {
    alternativeExplanations.push('Contradictions could indicate carelessness or misunderstanding rather than fraud')
  }

  return {
    summary,
    keyFactors,
    mitigatingFactors,
    recommendation,
    alternativeExplanations,
  }
}

/**
 * Helper function to interpret score values in human-readable terms
 */
function getScoreInterpretation(score: number): string {
  if (score >= 0.9) return 'Very High - Strong fraud signals'
  if (score >= 0.7) return 'High - Multiple fraud indicators'
  if (score >= 0.5) return 'Moderate - Some suspicious patterns'
  if (score >= 0.3) return 'Low-Moderate - Minor concerns'
  if (score >= 0.1) return 'Low - Minimal issues'
  return 'Very Low - Normal behavior'
}
