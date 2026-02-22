/**
 * Hybrid ML + LLM Assessment System
 *
 * Combines the speed and cost-effectiveness of ML with the contextual
 * understanding of LLMs for the most accurate fraud detection.
 *
 * Architecture:
 * 1. ML Layer (XGBoost) - Fast, free, handles 75 quantitative signals
 * 2. LLM Layer (Opus) - Semantic analysis of open-ended responses
 * 3. Fusion Layer - Combines both for final verdict with explanation
 *
 * Cost Optimization:
 * - ML runs on every response (~1ms, free)
 * - LLM only runs when needed:
 *   - Borderline ML scores (0.3-0.7)
 *   - Responses with open-ended answers
 *   - High-value surveys (enterprise tier)
 */

import { predictFraud, type CipherPredictionResult } from './inference';
import { detectContradictions } from './contradiction-detection';
import type { CipherFeatures } from './types';

export interface HybridAssessmentResult {
  // Final verdict
  finalScore: number; // 0-1
  verdict: 'legitimate' | 'suspicious' | 'likely_fraud' | 'fraud';
  confidence: number;

  // Component scores
  mlScore: number;
  llmScore: number | null; // null if LLM wasn't used
  ruleScore: number;

  // Signals and explanation
  topSignals: Signal[];
  explanation: string; // Human-readable explanation from LLM

  // Metadata
  mlUsed: boolean;
  llmUsed: boolean;
  llmReason: string | null; // Why LLM was (or wasn't) invoked
  processingTimeMs: number;
  estimatedCost: number; // In USD
}

export interface Signal {
  source: 'ml' | 'llm' | 'rules';
  name: string;
  contribution: number; // -1 to 1 (negative = legitimate signal)
  description: string;
}

export interface HybridAssessmentConfig {
  // When to invoke LLM
  llmThresholdLow: number; // Below this, skip LLM (clearly legitimate)
  llmThresholdHigh: number; // Above this, skip LLM (clearly fraud)
  alwaysUseLlmForOpenEnded: boolean;
  maxOpenEndedLength: number; // Skip LLM if open-ended too short

  // Weights for fusion
  mlWeight: number;
  llmWeight: number;
  ruleWeight: number;

  // Cost control
  maxLlmCostPerResponse: number; // In USD
  llmModel: 'claude-3-haiku-20240307' | 'claude-3-5-sonnet-20241022' | 'claude-sonnet-4-20250514';
}

const DEFAULT_CONFIG: HybridAssessmentConfig = {
  llmThresholdLow: 0.3,
  llmThresholdHigh: 0.7,
  alwaysUseLlmForOpenEnded: true,
  maxOpenEndedLength: 50,
  mlWeight: 0.5,
  llmWeight: 0.35,
  ruleWeight: 0.15,
  maxLlmCostPerResponse: 0.01, // 1 cent max
  llmModel: 'claude-3-haiku-20240307', // Cheapest for high volume
};

/**
 * Run hybrid assessment on a survey response
 */
export async function runHybridAssessment(
  features: CipherFeatures,
  responses: Record<string, any>,
  ruleScore: number,
  config: Partial<HybridAssessmentConfig> = {},
): Promise<HybridAssessmentResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  const signals: Signal[] = [];
  let estimatedCost = 0;

  // Step 1: Run ML prediction (always, it's fast and free)
  let mlResult: CipherPredictionResult;
  try {
    mlResult = await predictFraud(features, 'latest');

    // Add ML signals
    for (const signal of mlResult.topSignals) {
      signals.push({
        source: 'ml',
        name: signal.feature,
        contribution: signal.contribution,
        description: signal.description || formatFeatureName(signal.feature),
      });
    }
  } catch (error) {
    console.warn('[Hybrid] ML prediction failed, using rule score only');
    mlResult = {
      fraudProbability: ruleScore,
      fraudVerdict: ruleScore >= 0.5 ? 'high_risk' : 'low_risk',
      confidence: 0.5,
      topSignals: [],
      modelVersion: 'fallback',
    };
  }

  // Add rule-based signals
  if (ruleScore > 0.3) {
    signals.push({
      source: 'rules',
      name: 'rule_based_score',
      contribution: ruleScore,
      description: 'Heuristic fraud detection rules',
    });
  }

  // Step 2: Decide whether to invoke LLM
  const openEndedResponses = getOpenEndedResponses(responses);
  const hasSubstantialOpenEnded = openEndedResponses.some(
    r => r.answer.length >= cfg.maxOpenEndedLength
  );

  let llmScore: number | null = null;
  let llmExplanation = '';
  let llmReason: string | null = null;
  let llmUsed = false;

  const shouldUseLlm =
    // Borderline ML score
    (mlResult.fraudProbability >= cfg.llmThresholdLow &&
      mlResult.fraudProbability <= cfg.llmThresholdHigh) ||
    // Has open-ended responses worth analyzing
    (cfg.alwaysUseLlmForOpenEnded && hasSubstantialOpenEnded);

  if (shouldUseLlm) {
    llmUsed = true;
    llmReason = hasSubstantialOpenEnded
      ? 'Analyzing open-ended responses for quality and authenticity'
      : `ML score ${(mlResult.fraudProbability * 100).toFixed(0)}% is borderline, using LLM for deeper analysis`;

    try {
      const llmResult = await runLlmAnalysis(
        responses,
        openEndedResponses,
        mlResult,
        features,
        cfg.llmModel,
      );

      llmScore = llmResult.score;
      llmExplanation = llmResult.explanation;
      estimatedCost = llmResult.estimatedCost;

      // Add LLM signals
      for (const signal of llmResult.signals) {
        signals.push({
          source: 'llm',
          ...signal,
        });
      }
    } catch (error) {
      console.warn('[Hybrid] LLM analysis failed:', error);
      llmReason = 'LLM analysis failed, using ML score only';
      llmUsed = false;
    }
  } else {
    llmReason = mlResult.fraudProbability < cfg.llmThresholdLow
      ? 'ML score indicates clearly legitimate response'
      : mlResult.fraudProbability > cfg.llmThresholdHigh
        ? 'ML score indicates clear fraud signals'
        : 'No substantial open-ended content to analyze';
  }

  // Step 3: Fuse scores for final verdict
  const { finalScore, confidence } = fuseScores(
    mlResult.fraudProbability,
    llmScore,
    ruleScore,
    cfg,
  );

  // Generate explanation
  const explanation = llmExplanation || generateExplanation(signals, finalScore);

  // Determine verdict
  const verdict = getVerdict(finalScore);

  const processingTimeMs = Date.now() - startTime;

  return {
    finalScore,
    verdict,
    confidence,
    mlScore: mlResult.fraudProbability,
    llmScore,
    ruleScore,
    topSignals: signals.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 10),
    explanation,
    mlUsed: true,
    llmUsed,
    llmReason,
    processingTimeMs,
    estimatedCost,
  };
}

/**
 * Extract open-ended responses from survey answers
 */
function getOpenEndedResponses(
  responses: Record<string, any>,
): Array<{ questionId: string; answer: string }> {
  const openEnded: Array<{ questionId: string; answer: string }> = [];

  for (const [questionId, answer] of Object.entries(responses)) {
    if (typeof answer === 'string' && answer.length > 20) {
      // Likely open-ended if string > 20 chars
      openEnded.push({ questionId, answer });
    }
  }

  return openEnded;
}

/**
 * Run LLM analysis on response content
 */
async function runLlmAnalysis(
  responses: Record<string, any>,
  openEndedResponses: Array<{ questionId: string; answer: string }>,
  mlResult: CipherPredictionResult,
  features: CipherFeatures,
  model: string,
): Promise<{
  score: number;
  explanation: string;
  signals: Array<{ name: string; contribution: number; description: string }>;
  estimatedCost: number;
}> {
  // Prepare context for LLM
  const openEndedText = openEndedResponses
    .map(r => `Q${r.questionId}: "${r.answer}"`)
    .join('\n');

  const mlContext = `ML fraud probability: ${(mlResult.fraudProbability * 100).toFixed(0)}%
Top ML signals: ${mlResult.topSignals.slice(0, 3).map(s => s.feature).join(', ')}
Completion time: ${features.completionTimeSeconds}s
Mouse activity: ${features.mouseDistanceTotal > 0 ? 'Present' : 'None'}
Keystroke count: ${features.keystrokeCount}`;

  const prompt = `You are a survey fraud detection analyst. Analyze these open-ended survey responses for signs of fraud.

Context from ML analysis:
${mlContext}

Open-ended responses to analyze:
${openEndedText || 'No open-ended responses'}

Analyze for:
1. Response quality (thoughtful vs low-effort/gibberish)
2. AI-generated text patterns (overly formal, generic, repetitive structures)
3. Copy-paste indicators (perfect grammar in fast responses)
4. Contradiction with behavioral signals (e.g., no keyboard activity but long typed response)
5. Relevance to likely survey questions

Respond in JSON format:
{
  "fraudScore": 0.0-1.0,
  "confidence": 0.0-1.0,
  "signals": [
    {"name": "signal_name", "contribution": -1.0 to 1.0, "description": "explanation"}
  ],
  "explanation": "One paragraph explaining the assessment"
}`;

  // Call Anthropic API
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`LLM API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '{}';

  // Parse LLM response
  let parsed;
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch?.[0] || '{}');
  } catch {
    parsed = { fraudScore: 0.5, confidence: 0.5, signals: [], explanation: content };
  }

  // Estimate cost (Haiku: $0.25/1M input, $1.25/1M output)
  const inputTokens = prompt.length / 4; // Rough estimate
  const outputTokens = content.length / 4;
  const estimatedCost = model.includes('haiku')
    ? (inputTokens * 0.25 + outputTokens * 1.25) / 1_000_000
    : (inputTokens * 3 + outputTokens * 15) / 1_000_000; // Sonnet pricing

  return {
    score: parsed.fraudScore || 0.5,
    explanation: parsed.explanation || 'Unable to analyze',
    signals: parsed.signals || [],
    estimatedCost,
  };
}

/**
 * Fuse ML, LLM, and rule scores into final score
 */
function fuseScores(
  mlScore: number,
  llmScore: number | null,
  ruleScore: number,
  config: HybridAssessmentConfig,
): { finalScore: number; confidence: number } {
  if (llmScore === null) {
    // No LLM score - redistribute weight
    const totalWeight = config.mlWeight + config.ruleWeight;
    const normalizedMlWeight = config.mlWeight / totalWeight;
    const normalizedRuleWeight = config.ruleWeight / totalWeight;

    const finalScore = mlScore * normalizedMlWeight + ruleScore * normalizedRuleWeight;

    // Confidence is lower without LLM
    const confidence = Math.min(0.85, (Math.abs(mlScore - 0.5) * 2) * 0.7 + 0.3);

    return { finalScore, confidence };
  }

  // Full fusion with all three scores
  const finalScore =
    mlScore * config.mlWeight +
    llmScore * config.llmWeight +
    ruleScore * config.ruleWeight;

  // Confidence based on agreement
  const scores = [mlScore, llmScore, ruleScore];
  const variance = calculateVariance(scores);
  const confidence = Math.max(0.5, 1 - variance * 2);

  return { finalScore, confidence };
}

/**
 * Calculate variance of scores
 */
function calculateVariance(scores: number[]): number {
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Get verdict from final score
 */
function getVerdict(score: number): 'legitimate' | 'suspicious' | 'likely_fraud' | 'fraud' {
  if (score < 0.3) return 'legitimate';
  if (score < 0.5) return 'suspicious';
  if (score < 0.7) return 'likely_fraud';
  return 'fraud';
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(signals: Signal[], finalScore: number): string {
  const topSignals = signals
    .filter(s => Math.abs(s.contribution) > 0.1)
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
    .slice(0, 3);

  if (topSignals.length === 0) {
    return finalScore < 0.3
      ? 'No significant fraud indicators detected.'
      : 'Multiple minor fraud indicators present.';
  }

  const signalDescriptions = topSignals.map(s => {
    const direction = s.contribution > 0 ? 'indicates fraud' : 'indicates legitimacy';
    return `${s.description} (${direction})`;
  });

  const verdict = getVerdict(finalScore);
  const verdictText = {
    legitimate: 'Response appears legitimate.',
    suspicious: 'Response has some suspicious characteristics.',
    likely_fraud: 'Response shows strong fraud indicators.',
    fraud: 'Response is highly likely fraudulent.',
  }[verdict];

  return `${verdictText} Key factors: ${signalDescriptions.join('; ')}.`;
}

/**
 * Format feature name for display
 */
function formatFeatureName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, c => c.toUpperCase());
}

/**
 * Quick assessment (ML only, no LLM)
 * Use for high-volume, low-stakes surveys
 */
export async function runQuickAssessment(
  features: CipherFeatures,
  ruleScore: number,
): Promise<{
  score: number;
  verdict: string;
  topSignals: Signal[];
}> {
  const mlResult = await predictFraud(features, 'latest');

  const signals: Signal[] = mlResult.topSignals.map(s => ({
    source: 'ml' as const,
    name: s.feature,
    contribution: s.contribution,
    description: formatFeatureName(s.feature),
  }));

  // Simple weighted average
  const score = mlResult.fraudProbability * 0.7 + ruleScore * 0.3;

  return {
    score,
    verdict: getVerdict(score),
    topSignals: signals.slice(0, 5),
  };
}

/**
 * Batch assessment for multiple responses
 * Optimizes LLM calls by batching
 */
export async function runBatchAssessment(
  assessments: Array<{
    id: string;
    features: CipherFeatures;
    responses: Record<string, any>;
    ruleScore: number;
  }>,
  config: Partial<HybridAssessmentConfig> = {},
): Promise<Map<string, HybridAssessmentResult>> {
  const results = new Map<string, HybridAssessmentResult>();

  // Process in parallel batches of 5
  const batchSize = 5;
  for (let i = 0; i < assessments.length; i += batchSize) {
    const batch = assessments.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(a => runHybridAssessment(a.features, a.responses, a.ruleScore, config))
    );

    for (let j = 0; j < batch.length; j++) {
      results.set(batch[j].id, batchResults[j]);
    }
  }

  return results;
}
