/**
 * Bayesian Probability Engine
 *
 * Uses Bayesian inference to combine multiple fraud signals into a unified probability
 * Accounts for prior probabilities, evidence strength, and model uncertainty
 */

export interface BayesianEvidence {
  signal: string
  likelihood: number // P(Evidence | Fraud) - how likely is this evidence if fraud
  strength: number // How reliable is this signal (0-1)
  observed: boolean // Was this evidence observed?
}

export interface BayesianResult {
  posteriorProbability: number // P(Fraud | All Evidence)
  priorProbability: number // P(Fraud) before evidence
  evidenceStrength: number // How much evidence influenced the result
  confidence: number // Confidence in this assessment
  bayesianReasoning: string // Step-by-step explanation
}

/**
 * Calculate fraud probability using Bayesian inference
 */
export function calculateBayesianProbability(
  evidence: BayesianEvidence[],
  priorFraudRate: number = 0.15 // Base rate from historical data
): BayesianResult {
  // Start with prior probability
  let posterior = priorFraudRate

  // Track evidence impact
  const evidenceImpacts: Array<{ signal: string; impact: number }> = []

  // Apply each piece of evidence using Bayes' theorem
  evidence.forEach(e => {
    if (!e.observed) return

    // P(Fraud | Evidence) = P(Evidence | Fraud) * P(Fraud) / P(Evidence)
    // P(Evidence) = P(Evidence | Fraud) * P(Fraud) + P(Evidence | ~Fraud) * P(~Fraud)

    const pEvidenceGivenFraud = e.likelihood
    const pEvidenceGivenLegit = 1 - e.likelihood // Complement

    const pEvidence =
      pEvidenceGivenFraud * posterior +
      pEvidenceGivenLegit * (1 - posterior)

    const newPosterior = (pEvidenceGivenFraud * posterior) / pEvidence

    // Weight by evidence strength
    const weightedPosterior = posterior + (newPosterior - posterior) * e.strength

    // Track impact
    const impact = Math.abs(weightedPosterior - posterior)
    evidenceImpacts.push({ signal: e.signal, impact })

    posterior = weightedPosterior
  })

  // Calculate evidence strength (how much we moved from prior)
  const evidenceStrength = Math.abs(posterior - priorFraudRate)

  // Calculate confidence based on evidence quality and quantity
  const avgStrength = evidence.filter(e => e.observed).reduce((sum, e) => sum + e.strength, 0) / Math.max(evidence.filter(e => e.observed).length, 1)
  const evidenceCount = evidence.filter(e => e.observed).length
  const confidence = Math.min(
    avgStrength * Math.min(evidenceCount / 10, 1), // More evidence = more confidence
    0.95 // Cap at 95% confidence
  )

  // Generate reasoning
  const reasoning = generateBayesianReasoning(
    priorFraudRate,
    posterior,
    evidenceImpacts,
    evidence
  )

  return {
    posteriorProbability: clamp(posterior, 0, 1),
    priorProbability: priorFraudRate,
    evidenceStrength,
    confidence,
    bayesianReasoning: reasoning,
  }
}

/**
 * Generate human-readable Bayesian reasoning
 */
function generateBayesianReasoning(
  prior: number,
  posterior: number,
  impacts: Array<{ signal: string; impact: number }>,
  evidence: BayesianEvidence[]
): string {
  const sortedImpacts = impacts.sort((a, b) => b.impact - a.impact)
  const topSignals = sortedImpacts.slice(0, 3)

  let reasoning = `Bayesian Analysis:\n\n`
  reasoning += `Starting belief (prior): ${(prior * 100).toFixed(1)}% fraud probability based on historical base rate.\n\n`

  if (topSignals.length > 0) {
    reasoning += `Key evidence that updated our belief:\n`
    topSignals.forEach((sig, i) => {
      const ev = evidence.find(e => e.signal === sig.signal)
      reasoning += `${i + 1}. ${sig.signal} (${ev?.likelihood ? (ev.likelihood * 100).toFixed(0) : '?'}% likely if fraud, strength: ${ev?.strength ? (ev.strength * 100).toFixed(0) : '?'}%)\n`
      reasoning += `   - Shifted probability by ${(sig.impact * 100).toFixed(1)}%\n`
    })
  }

  reasoning += `\nFinal probability after all evidence: ${(posterior * 100).toFixed(1)}%\n`

  if (posterior > prior) {
    reasoning += `Evidence INCREASED fraud probability by ${((posterior - prior) * 100).toFixed(1)} percentage points.`
  } else if (posterior < prior) {
    reasoning += `Evidence DECREASED fraud probability by ${((prior - posterior) * 100).toFixed(1)} percentage points.`
  } else {
    reasoning += `Evidence had minimal impact on fraud probability.`
  }

  return reasoning
}

/**
 * Convert fraud detection signals to Bayesian evidence
 */
export function convertToBayesianEvidence(scores: {
  behavioral?: number
  aiContent?: number
  plagiarism?: number
  contradictions?: number
  ipReputation?: number
  deviceFingerprint?: number
  fraudRing?: number
  baselineDeviation?: number
}): BayesianEvidence[] {
  const evidence: BayesianEvidence[] = []

  // Behavioral signals
  if (scores.behavioral !== undefined && scores.behavioral > 0) {
    evidence.push({
      signal: 'Suspicious behavioral patterns',
      likelihood: 0.85, // 85% of fraudsters show behavioral anomalies
      strength: scores.behavioral,
      observed: scores.behavioral > 0.3,
    })
  }

  // AI-generated content
  if (scores.aiContent !== undefined && scores.aiContent > 0) {
    evidence.push({
      signal: 'AI-generated text detected',
      likelihood: 0.90, // 90% of AI-generated responses are fraud
      strength: scores.aiContent,
      observed: scores.aiContent > 0.5,
    })
  }

  // Plagiarism
  if (scores.plagiarism !== undefined && scores.plagiarism > 0) {
    evidence.push({
      signal: 'Plagiarized content found',
      likelihood: 0.80, // 80% of plagiarism is fraudulent
      strength: scores.plagiarism,
      observed: scores.plagiarism > 0.4,
    })
  }

  // Contradictions
  if (scores.contradictions !== undefined && scores.contradictions > 0) {
    evidence.push({
      signal: 'Contradictory answers detected',
      likelihood: 0.70, // 70% of contradictory responses are low-effort/fraud
      strength: scores.contradictions,
      observed: scores.contradictions > 0.3,
    })
  }

  // IP reputation
  if (scores.ipReputation !== undefined && scores.ipReputation > 0) {
    evidence.push({
      signal: 'Suspicious IP address (VPN/proxy/datacenter)',
      likelihood: 0.65, // 65% of VPN/proxy submissions are fraud
      strength: scores.ipReputation,
      observed: scores.ipReputation > 0.4,
    })
  }

  // Device fingerprint
  if (scores.deviceFingerprint !== undefined && scores.deviceFingerprint > 0) {
    evidence.push({
      signal: 'Automation tools or spoofed device',
      likelihood: 0.95, // 95% of automation is fraud
      strength: scores.deviceFingerprint,
      observed: scores.deviceFingerprint > 0.5,
    })
  }

  // Fraud ring
  if (scores.fraudRing !== undefined && scores.fraudRing > 0) {
    evidence.push({
      signal: 'Part of coordinated fraud ring',
      likelihood: 0.90, // 90% of ring members are fraudulent
      strength: scores.fraudRing,
      observed: scores.fraudRing > 0.6,
    })
  }

  // Baseline deviation
  if (scores.baselineDeviation !== undefined && scores.baselineDeviation > 0) {
    evidence.push({
      signal: 'Anomalous behavior compared to population',
      likelihood: 0.60, // 60% of anomalies are fraud
      strength: scores.baselineDeviation,
      observed: scores.baselineDeviation > 0.5,
    })
  }

  return evidence
}

/**
 * Calculate confidence intervals for fraud probability
 */
export function calculateConfidenceInterval(
  probability: number,
  sampleSize: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number; width: number } {
  // Wilson score interval (better for probabilities near 0 or 1)
  const z = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645

  const n = Math.max(sampleSize, 10) // Minimum sample size
  const p = probability

  const denominator = 1 + (z * z) / n
  const center = (p + (z * z) / (2 * n)) / denominator
  const margin = (z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))) / denominator

  const lower = Math.max(0, center - margin)
  const upper = Math.min(1, center + margin)

  return {
    lower,
    upper,
    width: upper - lower,
  }
}

/**
 * Combine multiple model predictions using weighted voting
 */
export function ensembleVoting(
  predictions: Array<{ model: string; probability: number; confidence: number }>,
  method: 'average' | 'weighted' | 'max' = 'weighted'
): { probability: number; confidence: number } {
  if (predictions.length === 0) {
    return { probability: 0.5, confidence: 0 }
  }

  if (method === 'average') {
    const avgProbability = predictions.reduce((sum, p) => sum + p.probability, 0) / predictions.length
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
    return { probability: avgProbability, confidence: avgConfidence }
  }

  if (method === 'weighted') {
    const totalConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0)
    const weightedProbability = predictions.reduce(
      (sum, p) => sum + p.probability * (p.confidence / totalConfidence),
      0
    )
    const overallConfidence = totalConfidence / predictions.length
    return { probability: weightedProbability, confidence: overallConfidence }
  }

  if (method === 'max') {
    const maxPrediction = predictions.reduce((max, p) => p.probability > max.probability ? p : max)
    return { probability: maxPrediction.probability, confidence: maxPrediction.confidence }
  }

  return { probability: 0.5, confidence: 0 }
}

/**
 * Calibrate fraud scores to actual fraud rates (for better accuracy)
 */
export function calibrateProbability(
  rawScore: number,
  calibrationCurve: Array<{ predicted: number; actual: number }>
): number {
  if (calibrationCurve.length === 0) return rawScore

  // Find closest calibration points
  const sorted = [...calibrationCurve].sort((a, b) => a.predicted - b.predicted)

  if (rawScore <= sorted[0].predicted) return sorted[0].actual
  if (rawScore >= sorted[sorted.length - 1].predicted) return sorted[sorted.length - 1].actual

  // Linear interpolation between calibration points
  for (let i = 0; i < sorted.length - 1; i++) {
    if (rawScore >= sorted[i].predicted && rawScore <= sorted[i + 1].predicted) {
      const t = (rawScore - sorted[i].predicted) / (sorted[i + 1].predicted - sorted[i].predicted)
      return sorted[i].actual + t * (sorted[i + 1].actual - sorted[i].actual)
    }
  }

  return rawScore
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}
