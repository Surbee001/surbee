/**
 * @surbee/cipher - AI-powered survey response validation SDK
 *
 * Detect fraudulent survey responses with Surbee's secure validation engine.
 * All processing happens server-side - no algorithms or models are exposed.
 *
 * @example
 * ```typescript
 * import { Cipher } from '@surbee/cipher';
 *
 * // Initialize with your API key from Settings > API Keys
 * const cipher = new Cipher({
 *   apiKey: 'cipher_sk_...',
 *   tier: 4, // 1-5, higher = more checks
 * });
 *
 * // Validate a response
 * const result = await cipher.validate({
 *   responses: [
 *     { question: 'What do you think?', answer: 'Great product!' }
 *   ],
 *   behavioralMetrics: tracker.getMetrics(),
 *   deviceInfo: tracker.getDeviceInfo(),
 * });
 *
 * console.log(result.score);          // 0.92
 * console.log(result.recommendation); // 'keep' | 'review' | 'discard'
 * ```
 *
 * @packageDocumentation
 */

// Main class
export { Cipher } from './cipher';

// Types (only what developers need)
export type {
  // Config
  CipherConfig,
  CipherTier,

  // Input types
  ValidationInput,
  ResponseInput,
  BehavioralMetrics,
  DeviceInfo,
  SurveyContext,

  // Output types
  ValidationResult,
  ValidationSummary,
  ValidationMeta,
  CheckResult,
  CheckId,

  // Batch types
  BatchValidationInput,
  BatchValidationResult,
  FraudIndicators,

  // Error types
  CipherError,
  CipherErrorCode,

  // Metric types (for building custom trackers)
  MouseMovement,
  MouseClick,
  KeystrokeEvent,
  ScrollEvent,
  FocusEvent,
  HoverEvent,
} from './types';

// Version
export const VERSION = '0.1.0';
