/**
 * Bayesian Inference Engine - Part of Cipher Fraud Detection
 *
 * Implements principled statistical inference using Bayes' theorem to combine
 * multiple fraud detection signals into a coherent probability estimate.
 *
 * P(Fraud | Evidence) = [P(Evidence | Fraud) × P(Fraud)] / P(Evidence)
 */

export interface EvidenceSignal {
  name: string
  likelihood: number // P(E|F): Probability of seeing this evidence given fraud (0-1)
  strength: number // Reliability of this signal (0-1)
  observed: boolean // Whether this evidence was actually observed
}

export interface BayesianResult {
  fraudProbability: number // Final P(Fraud | Evidence)
  confidence: number // Confidence in the assessment (0-1)
  confidenceInterval: {
    lower: number
    upper: number
  }
  evidenceCount: number
  priorProbability: number
}

/**
 * Default evidence likelihoods based on empirical data
 */
export const EVIDENCE_LIKELIHOODS: Record<string, { likelihood: number; strength: number }> = {
  // AI Content Detection
  ai_signature_detected: { likelihood: 0.95, strength: 0.95 },
  perfect_grammar_no_errors: { likelihood: 0.85, strength: 0.7 },
  overly_formal_tone: { likelihood: 0.7, strength: 0.6 },
  hedging_language: { likelihood: 0.65, strength: 0.5 },

  // Automation Detection
  webdriver_detected: { likelihood: 0.98, strength: 0.95 },
  headless_browser: { likelihood: 0.95, strength: 0.9 },
  robotic_mouse_movements: { likelihood: 0.9, strength: 0.85 },
  mouse_teleporting: { likelihood: 0.95, strength: 0.9 },
  uniform_keystroke_timing: { likelihood: 0.88, strength: 0.8 },
  no_typing_corrections: { likelihood: 0.75, strength: 0.7 },
  impossible_typing_speed: { likelihood: 0.92, strength: 0.85 },
  instant_form_filling: { likelihood: 0.9, strength: 0.85 },
  no_hover_behavior: { likelihood: 0.7, strength: 0.65 },

  // Plagiarism
  plagiarism_detected: { likelihood: 0.9, strength: 0.85 },
  template_responses: { likelihood: 0.85, strength: 0.8 },
  duplicate_answers: { likelihood: 0.8, strength: 0.75 },

  // Contradictions
  logical_contradictions: { likelihood: 0.7, strength: 0.65 },
  temporal_contradictions: { likelihood: 0.75, strength: 0.7 },
  demographic_contradictions: { likelihood: 0.8, strength: 0.75 },

  // Identity & Network
  vpn_usage: { likelihood: 0.65, strength: 0.6 },
  datacenter_ip: { likelihood: 0.75, strength: 0.7 },
  tor_detected: { likelihood: 0.95, strength: 0.9 },
  timezone_mismatch: { likelihood: 0.7, strength: 0.65 },

  // Behavioral
  extremely_fast_completion: { likelihood: 0.8, strength: 0.75 },
  quality_time_mismatch: { likelihood: 0.85, strength: 0.8 },
  excessive_paste_events: { likelihood: 0.75, strength: 0.7 },
  excessive_tab_switches: { likelihood: 0.7, strength: 0.65 },

  // Fraud Ring
  answer_sharing: { likelihood: 0.95, strength: 0.9 },
  coordinated_timing: { likelihood: 0.85, strength: 0.8 },
  device_sharing: { likelihood: 0.9, strength: 0.85 },
  ip_sharing: { likelihood: 0.75, strength: 0.7 },
}

/**
 * Calculate fraud probability using Bayesian inference
 */
export function calculateBayesianFraudProbability(
  evidenceSignals: EvidenceSignal[],
  priorFraudRate: number = 0.15 // Historical fraud rate (15%)
): BayesianResult {
  let currentProbability = priorFraudRate
  let evidenceCount = 0

  // Apply Bayes' theorem iteratively for each piece of evidence
  for (const evidence of evidenceSignals) {
    if (!evidence.observed) continue

    evidenceCount++

    // Bayes' theorem: P(F|E) = [P(E|F) × P(F)] / P(E)
    const pEGivenF = evidence.likelihood // P(Evidence | Fraud)
    const pF = currentProbability // Current P(Fraud)
    const pEGivenNotF = 1 - pEGivenF // Assume inverse for P(Evidence | Not Fraud)
    const pNotF = 1 - pF // P(Not Fraud)

    // Calculate P(Evidence) using law of total probability
    const pE = pEGivenF * pF + pEGivenNotF * pNotF

    if (pE === 0) continue // Avoid division by zero

    // Calculate posterior probability
    const pFGivenE = (pEGivenF * pF) / pE

    // Weight the update by evidence strength
    currentProbability = currentProbability * (1 - evidence.strength) + pFGivenE * evidence.strength

    // Clamp to [0, 1]
    currentProbability = Math.max(0, Math.min(1, currentProbability))
  }

  // Calculate confidence using Wilson score interval
  const confidenceInterval = calculateWilsonScoreInterval(currentProbability, evidenceCount * 10)

  // Calculate overall confidence
  const confidence = calculateConfidence(evidenceCount, evidenceSignals.length)

  return {
    fraudProbability: currentProbability,
    confidence,
    confidenceInterval,
    evidenceCount,
    priorProbability: priorFraudRate,
  }
}

/**
 * Calculate Wilson score confidence interval
 *
 * Provides a robust confidence interval for probability estimates
 * with small sample sizes.
 */
function calculateWilsonScoreInterval(
  probability: number,
  sampleSize: number,
  confidenceLevel: number = 0.95
): { lower: number; upper: number } {
  if (sampleSize === 0) {
    return { lower: 0, upper: 1 }
  }

  // Z-score for 95% confidence level
  const z = confidenceLevel === 0.95 ? 1.96 : confidenceLevel === 0.99 ? 2.576 : 1.645

  const n = sampleSize
  const p = probability

  const denominator = 1 + (z * z) / n
  const centerAdjustment = p + (z * z) / (2 * n)
  const marginOfError = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n))

  const lower = Math.max(0, (centerAdjustment - marginOfError) / denominator)
  const upper = Math.min(1, (centerAdjustment + marginOfError) / denominator)

  return { lower, upper }
}

/**
 * Calculate overall confidence based on evidence availability
 */
function calculateConfidence(evidenceCount: number, totalPossibleEvidence: number): number {
  if (totalPossibleEvidence === 0) return 0.5

  // Base confidence from evidence ratio
  const evidenceRatio = evidenceCount / totalPossibleEvidence

  // Confidence increases with more evidence, but with diminishing returns
  // Use logarithmic scale: conf = 0.5 + 0.5 * log10(1 + 9 * ratio)
  const confidence = 0.5 + 0.5 * Math.log10(1 + 9 * evidenceRatio)

  return Math.max(0, Math.min(1, confidence))
}

/**
 * Build evidence signals from fraud detection results
 */
export function buildEvidenceSignals(detectionResults: {
  aiGenerated?: { detected: boolean; probability: number; indicators: string[] }
  plagiarism?: { detected: boolean; sources: number }
  contradictions?: { found: boolean; count: number }
  automation?: { detected: boolean; confidence: number; reasons: string[] }
  ipRisk?: { isVPN: boolean; isDataCenter: boolean; isTor?: boolean }
  deviceRisk?: { isAutomation: boolean; issues: string[] }
  behavioral?: {
    roboticMouseMovements: boolean
    mouseTeleporting: boolean
    uniformKeystrokeTiming: boolean
    noTypingCorrections: boolean
    impossibleTypingSpeed: boolean
    instantFormFilling: boolean
    noHoverBehavior: boolean
  }
  quality?: { timeMismatch: boolean; excessivePaste: boolean; excessiveTabSwitch: boolean }
  fraudRing?: { answerSharing: boolean; coordinatedTiming: boolean; deviceSharing: boolean; ipSharing: boolean }
}): EvidenceSignal[] {
  const signals: EvidenceSignal[] = []

  // AI Content Detection
  if (detectionResults.aiGenerated) {
    const hasAISignature = detectionResults.aiGenerated.indicators.some((ind) =>
      ind.toLowerCase().includes('as an ai')
    )
    signals.push({
      name: 'ai_signature_detected',
      ...EVIDENCE_LIKELIHOODS.ai_signature_detected,
      observed: hasAISignature,
    })

    const hasPerfectGrammar = detectionResults.aiGenerated.indicators.some((ind) =>
      ind.toLowerCase().includes('perfect grammar')
    )
    signals.push({
      name: 'perfect_grammar_no_errors',
      ...EVIDENCE_LIKELIHOODS.perfect_grammar_no_errors,
      observed: hasPerfectGrammar,
    })

    const hasFormalTone = detectionResults.aiGenerated.indicators.some((ind) =>
      ind.toLowerCase().includes('formal tone')
    )
    signals.push({
      name: 'overly_formal_tone',
      ...EVIDENCE_LIKELIHOODS.overly_formal_tone,
      observed: hasFormalTone,
    })
  }

  // Automation Detection
  if (detectionResults.automation) {
    const hasWebDriver = detectionResults.automation.reasons.some((r) => r.toLowerCase().includes('webdriver'))
    signals.push({
      name: 'webdriver_detected',
      ...EVIDENCE_LIKELIHOODS.webdriver_detected,
      observed: hasWebDriver,
    })

    const hasHeadless = detectionResults.automation.reasons.some((r) => r.toLowerCase().includes('headless'))
    signals.push({
      name: 'headless_browser',
      ...EVIDENCE_LIKELIHOODS.headless_browser,
      observed: hasHeadless,
    })
  }

  // Behavioral Analysis
  if (detectionResults.behavioral) {
    signals.push({
      name: 'robotic_mouse_movements',
      ...EVIDENCE_LIKELIHOODS.robotic_mouse_movements,
      observed: detectionResults.behavioral.roboticMouseMovements,
    })
    signals.push({
      name: 'mouse_teleporting',
      ...EVIDENCE_LIKELIHOODS.mouse_teleporting,
      observed: detectionResults.behavioral.mouseTeleporting,
    })
    signals.push({
      name: 'uniform_keystroke_timing',
      ...EVIDENCE_LIKELIHOODS.uniform_keystroke_timing,
      observed: detectionResults.behavioral.uniformKeystrokeTiming,
    })
    signals.push({
      name: 'no_typing_corrections',
      ...EVIDENCE_LIKELIHOODS.no_typing_corrections,
      observed: detectionResults.behavioral.noTypingCorrections,
    })
    signals.push({
      name: 'impossible_typing_speed',
      ...EVIDENCE_LIKELIHOODS.impossible_typing_speed,
      observed: detectionResults.behavioral.impossibleTypingSpeed,
    })
    signals.push({
      name: 'instant_form_filling',
      ...EVIDENCE_LIKELIHOODS.instant_form_filling,
      observed: detectionResults.behavioral.instantFormFilling,
    })
    signals.push({
      name: 'no_hover_behavior',
      ...EVIDENCE_LIKELIHOODS.no_hover_behavior,
      observed: detectionResults.behavioral.noHoverBehavior,
    })
  }

  // Plagiarism
  if (detectionResults.plagiarism) {
    signals.push({
      name: 'plagiarism_detected',
      ...EVIDENCE_LIKELIHOODS.plagiarism_detected,
      observed: detectionResults.plagiarism.detected,
    })
  }

  // Contradictions
  if (detectionResults.contradictions) {
    signals.push({
      name: 'logical_contradictions',
      ...EVIDENCE_LIKELIHOODS.logical_contradictions,
      observed: detectionResults.contradictions.found,
    })
  }

  // IP Risk
  if (detectionResults.ipRisk) {
    signals.push({
      name: 'vpn_usage',
      ...EVIDENCE_LIKELIHOODS.vpn_usage,
      observed: detectionResults.ipRisk.isVPN,
    })
    signals.push({
      name: 'datacenter_ip',
      ...EVIDENCE_LIKELIHOODS.datacenter_ip,
      observed: detectionResults.ipRisk.isDataCenter,
    })
    if (detectionResults.ipRisk.isTor !== undefined) {
      signals.push({
        name: 'tor_detected',
        ...EVIDENCE_LIKELIHOODS.tor_detected,
        observed: detectionResults.ipRisk.isTor,
      })
    }
  }

  // Quality/Timing
  if (detectionResults.quality) {
    signals.push({
      name: 'quality_time_mismatch',
      ...EVIDENCE_LIKELIHOODS.quality_time_mismatch,
      observed: detectionResults.quality.timeMismatch,
    })
    signals.push({
      name: 'excessive_paste_events',
      ...EVIDENCE_LIKELIHOODS.excessive_paste_events,
      observed: detectionResults.quality.excessivePaste,
    })
    signals.push({
      name: 'excessive_tab_switches',
      ...EVIDENCE_LIKELIHOODS.excessive_tab_switches,
      observed: detectionResults.quality.excessiveTabSwitch,
    })
  }

  // Fraud Ring
  if (detectionResults.fraudRing) {
    signals.push({
      name: 'answer_sharing',
      ...EVIDENCE_LIKELIHOODS.answer_sharing,
      observed: detectionResults.fraudRing.answerSharing,
    })
    signals.push({
      name: 'coordinated_timing',
      ...EVIDENCE_LIKELIHOODS.coordinated_timing,
      observed: detectionResults.fraudRing.coordinatedTiming,
    })
    signals.push({
      name: 'device_sharing',
      ...EVIDENCE_LIKELIHOODS.device_sharing,
      observed: detectionResults.fraudRing.deviceSharing,
    })
    signals.push({
      name: 'ip_sharing',
      ...EVIDENCE_LIKELIHOODS.ip_sharing,
      observed: detectionResults.fraudRing.ipSharing,
    })
  }

  return signals
}

/**
 * Determine risk level from Bayesian probability and confidence
 */
export function determineRiskLevel(
  fraudProbability: number,
  confidence: number
): 'low' | 'medium' | 'high' | 'critical' {
  // Critical: High probability + high confidence
  if (fraudProbability >= 0.85 && confidence >= 0.7) return 'critical'

  // High: High probability OR (medium-high probability + high confidence)
  if (fraudProbability >= 0.6 || (fraudProbability >= 0.5 && confidence >= 0.8)) return 'high'

  // Medium: Medium probability OR uncertain high probability
  if (fraudProbability >= 0.4 || (fraudProbability >= 0.6 && confidence < 0.7)) return 'medium'

  // Low: Everything else
  return 'low'
}
