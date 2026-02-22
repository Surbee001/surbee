/**
 * Cipher ML Local Inference
 *
 * Run XGBoost predictions locally using the exported model.
 * This is a fallback when Modal is unavailable, or for offline/edge deployments.
 *
 * Note: This requires the 'xgboost' npm package or a WASM/JS implementation.
 * For production, we use Modal. For offline/backup, we use this.
 */

import { CipherFeatures, FEATURE_NAMES, FraudVerdict, TopSignal } from './types';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Model cache
let cachedModel: XGBoostModel | null = null;
let cachedVersion: string | null = null;

interface XGBoostModel {
  trees: XGBoostTree[];
  baseScore: number;
  numFeatures: number;
}

interface XGBoostTree {
  nodes: XGBoostNode[];
}

interface XGBoostNode {
  split_feature?: number;
  split_threshold?: number;
  left_child?: number;
  right_child?: number;
  leaf_value?: number;
}

/**
 * Load XGBoost model from local JSON file.
 * XGBoost saves models in a JSON format that we can parse and evaluate.
 */
export function loadModel(version: string = 'v2.0.0'): XGBoostModel | null {
  if (cachedModel && cachedVersion === version) {
    return cachedModel;
  }

  const modelPath = join(process.cwd(), 'models', 'cipher-ml', version, 'model.json');

  if (!existsSync(modelPath)) {
    console.warn(`[Local Inference] Model not found: ${modelPath}`);
    return null;
  }

  try {
    const modelJson = JSON.parse(readFileSync(modelPath, 'utf-8'));

    // XGBoost JSON format parsing
    // The format varies by XGBoost version, but typically includes learner.gradient_booster.model.trees
    const learner = modelJson.learner;
    const gradientBooster = learner?.gradient_booster;
    const model = gradientBooster?.model;

    if (!model || !model.trees) {
      console.warn('[Local Inference] Unexpected model format');
      return null;
    }

    cachedModel = {
      trees: model.trees,
      baseScore: learner?.learner_model_param?.base_score
        ? parseFloat(learner.learner_model_param.base_score)
        : 0.5,
      numFeatures: learner?.learner_model_param?.num_feature
        ? parseInt(learner.learner_model_param.num_feature)
        : 75,
    };
    cachedVersion = version;

    console.log(`[Local Inference] Loaded model ${version} with ${cachedModel.trees.length} trees`);
    return cachedModel;
  } catch (error) {
    console.error('[Local Inference] Failed to load model:', error);
    return null;
  }
}

/**
 * Evaluate a single tree.
 */
function evaluateTree(tree: XGBoostTree, features: number[]): number {
  const nodes = tree.nodes || [];
  if (nodes.length === 0) return 0;

  let nodeIdx = 0;

  while (true) {
    const node = nodes[nodeIdx];

    if (node.leaf_value !== undefined) {
      return node.leaf_value;
    }

    const featureIdx = node.split_feature ?? 0;
    const threshold = node.split_threshold ?? 0;
    const featureValue = features[featureIdx] ?? 0;

    if (featureValue < threshold) {
      nodeIdx = node.left_child ?? 0;
    } else {
      nodeIdx = node.right_child ?? 0;
    }

    // Safety check to prevent infinite loops
    if (nodeIdx >= nodes.length || nodeIdx < 0) {
      return 0;
    }
  }
}

/**
 * Convert features to vector.
 */
function featuresToVector(features: CipherFeatures): number[] {
  return FEATURE_NAMES.map((name) => {
    const value = features[name];
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (typeof value === 'string') return 0;
    return value as number;
  });
}

/**
 * Sigmoid function for probability conversion.
 */
function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

/**
 * Run local prediction.
 */
export function predictLocal(
  features: CipherFeatures,
  modelVersion: string = 'v2.0.0'
): {
  fraudProbability: number;
  fraudVerdict: FraudVerdict;
  confidence: number;
  modelVersion: string;
  topSignals: TopSignal[];
  inferenceTimeMs: number;
  source: 'local';
} | null {
  const startTime = Date.now();

  const model = loadModel(modelVersion);
  if (!model) {
    return null;
  }

  const featureVector = featuresToVector(features);

  // Sum predictions from all trees
  let sum = 0;
  for (const tree of model.trees) {
    sum += evaluateTree(tree, featureVector);
  }

  // Convert to probability using sigmoid
  const probability = sigmoid(sum);

  // Determine verdict
  let verdict: FraudVerdict;
  if (probability < 0.3) verdict = 'low_risk';
  else if (probability < 0.5) verdict = 'medium_risk';
  else if (probability < 0.7) verdict = 'high_risk';
  else verdict = 'fraud';

  // For top signals, we'd need feature importance from metadata
  // For now, return the most impactful features based on training data
  const topSignals: TopSignal[] = [
    { feature: 'ipReputationScore', contribution: 0.757, value: features.ipReputationScore },
    { feature: 'straightLineRatio', contribution: 0.125, value: features.straightLineRatio },
    { feature: 'honeypotScore', contribution: 0.111, value: features.honeypotScore },
  ];

  const inferenceTimeMs = Date.now() - startTime;

  return {
    fraudProbability: probability,
    fraudVerdict: verdict,
    confidence: 1 - Math.abs(0.5 - probability) * 2,
    modelVersion,
    topSignals,
    inferenceTimeMs,
    source: 'local',
  };
}

/**
 * Check if local model is available.
 */
export function isLocalModelAvailable(version: string = 'v2.0.0'): boolean {
  const modelPath = join(process.cwd(), 'models', 'cipher-ml', version, 'model.json');
  return existsSync(modelPath);
}

/**
 * Get local model metadata.
 */
export function getLocalModelMetadata(version: string = 'v2.0.0'): Record<string, unknown> | null {
  const metadataPath = join(process.cwd(), 'models', 'cipher-ml', version, 'metadata.json');

  if (!existsSync(metadataPath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(metadataPath, 'utf-8'));
  } catch {
    return null;
  }
}
