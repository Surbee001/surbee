/**
 * Cipher ML Module
 *
 * Export all cipher-related functionality for ML-based fraud detection.
 */

// Types
export * from './types';

// Tier configuration
export * from './tier-config';

// Feature extraction
export { extractFeatures, featuresToVector, featuresToDbRow } from './feature-extraction';

// Auto-labeling
export {
  autoLabel,
  labelResultToDbRow,
  getAllAutoLabelRules,
  getFraudRules,
  getLegitimateRules,
  aggregateLabels,
  calculateLabelingStats,
  checkTrainingReadiness,
} from './auto-labeling';

// ML Pipeline
export { runMLPipeline, runMLPipelineAsync } from './ml-pipeline';

// ML Inference
export {
  predictFraud,
  predictFraudBatch,
  listModels,
  healthCheck,
  getActiveModelVersion,
  runMLPrediction,
  combineAssessments,
  CIPHER_ML_URL,
} from './inference';

// Local Inference (fallback)
export {
  predictLocal,
  isLocalModelAvailable,
  getLocalModelMetadata,
  loadModel,
} from './local-inference';

// Synthetic Data Generation
export {
  generateSyntheticData,
  exportForTraining,
  getDatasetStats,
  featuresToNormalizedVector,
} from './synthetic-data';

// Tracker script generation
export { generateCipherTrackerScript } from './cipher-tracker';

// Contradiction Detection
export {
  detectContradictions,
  buildQuestionMetadata,
  updateFeaturesWithContradictions,
  type ContradictionResult,
  type Contradiction,
  type QuestionMetadata,
} from './contradiction-detection';

// Fraud Ring Detection
export {
  detectFraudRing,
  batchDetectFraudRings,
  getFraudRingSummary,
  type FraudRingResult,
  type FraudRingSignal,
  type FraudRingSignalType,
  type LinkedResponse,
  type FraudRingConfig,
} from './fraud-ring-detection';

// Hybrid ML + LLM Assessment
export {
  runHybridAssessment,
  runQuickAssessment,
  runBatchAssessment,
  type HybridAssessmentResult,
  type HybridAssessmentConfig,
  type Signal,
} from './hybrid-assessment';
