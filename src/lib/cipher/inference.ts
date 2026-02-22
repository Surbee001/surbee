/**
 * Cipher ML Inference Client
 *
 * TypeScript client for calling the Cipher ML model.
 * Supports both Modal (cloud) and local inference.
 *
 * Priority:
 * 1. Modal inference (fast, scalable)
 * 2. Local inference (fallback, offline capable)
 */

import { CipherFeatures, FEATURE_NAMES, FraudVerdict, TopSignal } from './types';

// ============================================
// CONFIGURATION
// ============================================

const CIPHER_ML_URL =
  process.env.CIPHER_ML_URL || 'https://cgihadi--cipher-ml-inference-server.modal.run';

// Set to 'true' to force local inference (no Modal)
const USE_LOCAL_INFERENCE = process.env.CIPHER_ML_LOCAL === 'true';

// Cache model info to avoid repeated calls
let cachedModelVersion: string | null = null;
let cacheExpiry: number = 0;

// ============================================
// TYPES
// ============================================

export interface CipherPredictionResult {
  fraudProbability: number;
  fraudVerdict: FraudVerdict;
  confidence: number;
  modelVersion: string;
  topSignals: TopSignal[];
  inferenceTimeMs: number;
}

export interface CipherBatchPredictionResult {
  predictions: Array<{
    fraudProbability: number;
    fraudVerdict: FraudVerdict;
  }>;
  modelVersion: string;
  count: number;
  inferenceTimeMs: number;
}

export interface ModelInfo {
  version: string;
  createdAt: string;
  metrics: {
    precision: number;
    recall: number;
    f1: number;
    auc_roc: number;
  };
  trainingSamples: number;
  fraudSamples: number;
  legitimateSamples: number;
  featureImportance: Array<{
    name: string;
    importance: number;
  }>;
}

// ============================================
// FEATURE CONVERSION
// ============================================

/**
 * Convert CipherFeatures to a feature vector matching the model's expected order.
 */
export function featuresToVector(features: CipherFeatures): number[] {
  return FEATURE_NAMES.map((name) => {
    const value = features[name];
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'string') return 0; // Skip string features
    return value as number;
  });
}

// ============================================
// INFERENCE FUNCTIONS
// ============================================

/**
 * Get fraud prediction for a single response.
 * Tries Modal first, falls back to local inference if unavailable.
 *
 * @param features - Extracted cipher features
 * @param modelVersion - Optional model version (default: "latest" or "v2.0.0" for local)
 * @returns Prediction result with probability and top signals
 */
export async function predictFraud(
  features: CipherFeatures,
  modelVersion: string = 'latest'
): Promise<CipherPredictionResult> {
  // Try local inference if forced or Modal is unavailable
  if (USE_LOCAL_INFERENCE) {
    return predictFraudLocal(features, modelVersion === 'latest' ? 'v2.0.0' : modelVersion);
  }

  try {
    // Try Modal inference first
    const featureVector = featuresToVector(features);

    const response = await fetch(`${CIPHER_ML_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        features: featureVector,
        model_version: modelVersion,
      }),
    });

    if (!response.ok) {
      throw new Error(`Modal inference failed: ${response.statusText}`);
    }

    const result = await response.json();

    return {
      fraudProbability: result.fraud_probability,
      fraudVerdict: result.fraud_verdict as FraudVerdict,
      confidence: result.confidence,
      modelVersion: result.model_version,
      topSignals: result.top_signals.map((signal: Record<string, unknown>) => ({
        feature: signal.feature as string,
        contribution: signal.importance as number,
        value: signal.value as number | undefined,
      })),
      inferenceTimeMs: result.inference_time_ms,
    };
  } catch (error) {
    // Fallback to local inference
    console.warn('[Cipher ML] Modal unavailable, using local inference:', error);
    return predictFraudLocal(features, modelVersion === 'latest' ? 'v2.0.0' : modelVersion);
  }
}

/**
 * Run prediction using local model (no network required).
 */
async function predictFraudLocal(
  features: CipherFeatures,
  modelVersion: string
): Promise<CipherPredictionResult> {
  // Dynamic import to avoid loading in browser
  const { predictLocal, isLocalModelAvailable } = await import('./local-inference');

  if (!isLocalModelAvailable(modelVersion)) {
    throw new Error(`Local model ${modelVersion} not found. Run: python3 -m modal run scripts/export-model.py`);
  }

  const result = predictLocal(features, modelVersion);

  if (!result) {
    throw new Error('Local inference failed');
  }

  return {
    fraudProbability: result.fraudProbability,
    fraudVerdict: result.fraudVerdict,
    confidence: result.confidence,
    modelVersion: result.modelVersion,
    topSignals: result.topSignals,
    inferenceTimeMs: result.inferenceTimeMs,
  };
}

/**
 * Get fraud predictions for multiple responses.
 *
 * @param featuresBatch - Array of extracted cipher features
 * @param modelVersion - Optional model version (default: "latest")
 * @returns Batch prediction results
 */
export async function predictFraudBatch(
  featuresBatch: CipherFeatures[],
  modelVersion: string = 'latest'
): Promise<CipherBatchPredictionResult> {
  const featureVectors = featuresBatch.map(featuresToVector);

  const response = await fetch(`${CIPHER_ML_URL}/predict/batch`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      features_batch: featureVectors,
      model_version: modelVersion,
    }),
  });

  if (!response.ok) {
    throw new Error(`Cipher ML batch prediction failed: ${response.statusText}`);
  }

  const result = await response.json();

  return {
    predictions: result.predictions.map((pred: Record<string, unknown>) => ({
      fraudProbability: pred.fraud_probability as number,
      fraudVerdict: pred.fraud_verdict as FraudVerdict,
    })),
    modelVersion: result.model_version,
    count: result.count,
    inferenceTimeMs: result.inference_time_ms,
  };
}

/**
 * List available models.
 */
export async function listModels(): Promise<
  Array<{
    version: string;
    createdAt: string;
    metrics: { precision: number; recall: number; f1: number; auc_roc: number };
  }>
> {
  const response = await fetch(`${CIPHER_ML_URL}/models`);

  if (!response.ok) {
    throw new Error(`Failed to list models: ${response.statusText}`);
  }

  const result = await response.json();
  return result.models.map((model: Record<string, unknown>) => ({
    version: model.version,
    createdAt: model.created_at,
    metrics: model.metrics,
  }));
}

/**
 * Check if the ML service is healthy.
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${CIPHER_ML_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get the current active model version.
 */
export async function getActiveModelVersion(): Promise<string | null> {
  // Return cached version if still valid
  if (cachedModelVersion && Date.now() < cacheExpiry) {
    return cachedModelVersion;
  }

  try {
    const models = await listModels();
    if (models.length > 0) {
      cachedModelVersion = models[0].version;
      cacheExpiry = Date.now() + 5 * 60 * 1000; // Cache for 5 minutes
      return cachedModelVersion;
    }
    return null;
  } catch {
    return null;
  }
}

// ============================================
// INTEGRATION HELPERS
// ============================================

/**
 * Run ML prediction and store result in database.
 * This is called after feature extraction in the ML pipeline.
 */
export async function runMLPrediction(
  supabase: { from: (table: string) => { insert: (data: unknown) => { select: () => unknown } } },
  responseId: string,
  features: CipherFeatures
): Promise<CipherPredictionResult | null> {
  try {
    // Check if ML service is available
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      console.warn('[Cipher ML] ML service unavailable, skipping prediction');
      return null;
    }

    // Get prediction
    const prediction = await predictFraud(features);

    // Store in database
    await supabase.from('cipher_ml_predictions').insert({
      response_id: responseId,
      fraud_probability: prediction.fraudProbability,
      fraud_verdict: prediction.fraudVerdict,
      confidence: prediction.confidence,
      top_signals: prediction.topSignals,
      model_version: prediction.modelVersion,
      feature_version: 1,
      inference_time_ms: prediction.inferenceTimeMs,
    });

    return prediction;
  } catch (error) {
    console.error('[Cipher ML] Prediction failed:', error);
    return null;
  }
}

/**
 * Get combined fraud assessment: rule-based + ML
 * Returns the higher risk of the two approaches.
 */
export function combineAssessments(
  ruleBasedScore: number,
  mlPrediction: CipherPredictionResult | null
): {
  finalScore: number;
  finalVerdict: FraudVerdict;
  source: 'rules' | 'ml' | 'combined';
  mlProbability: number | null;
  ruleScore: number;
} {
  if (!mlPrediction) {
    // ML not available, use rule-based only
    const verdict = getVerdictFromScore(ruleBasedScore);
    return {
      finalScore: ruleBasedScore,
      finalVerdict: verdict,
      source: 'rules',
      mlProbability: null,
      ruleScore: ruleBasedScore,
    };
  }

  // Combine both signals
  // Use weighted average with ML having slightly more weight (60/40)
  const combinedScore = ruleBasedScore * 0.4 + mlPrediction.fraudProbability * 0.6;

  // Take the more conservative (higher risk) assessment
  const finalScore = Math.max(combinedScore, ruleBasedScore, mlPrediction.fraudProbability);
  const finalVerdict = getVerdictFromScore(finalScore);

  return {
    finalScore,
    finalVerdict,
    source: 'combined',
    mlProbability: mlPrediction.fraudProbability,
    ruleScore: ruleBasedScore,
  };
}

/**
 * Convert fraud score to verdict.
 */
function getVerdictFromScore(score: number): FraudVerdict {
  if (score < 0.3) return 'low_risk';
  if (score < 0.5) return 'medium_risk';
  if (score < 0.7) return 'high_risk';
  return 'fraud';
}

// ============================================
// EXPORTS
// ============================================

export { CIPHER_ML_URL };
