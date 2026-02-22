/**
 * Cipher ML Types
 *
 * Type definitions for the ML-based fraud detection system.
 * Used for feature extraction, auto-labeling, and predictions.
 */

// ============================================
// FEATURE TYPES
// ============================================

/**
 * Complete feature set for ML training (75 dimensions)
 */
export interface CipherFeatures {
  // Behavioral (25)
  mouseDistanceTotal: number;
  mouseVelocityMean: number;
  mouseVelocityStd: number;
  mouseVelocityMax: number;
  mouseAccelerationMean: number;
  mouseCurvatureEntropy: number;
  mouseStraightLineRatio: number;
  mousePauseCount: number;
  keystrokeCount: number;
  keystrokeTimingMean: number;
  keystrokeTimingStd: number;
  keystrokeDwellMean: number;
  keystrokeFlightMean: number;
  backspaceRatio: number;
  pasteEventCount: number;
  pasteCharRatio: number;
  scrollCount: number;
  scrollVelocityMean: number;
  scrollDirectionChanges: number;
  focusLossCount: number;
  focusLossDurationTotal: number;
  hoverCount: number;
  hoverDurationMean: number;
  clickCount: number;
  hoverBeforeClickRatio: number;

  // Temporal (12)
  completionTimeSeconds: number;
  timePerQuestionMean: number;
  timePerQuestionStd: number;
  timePerQuestionMin: number;
  timePerQuestionMax: number;
  readingVsAnsweringRatio: number;
  firstInteractionDelayMs: number;
  idleTimeTotal: number;
  activeTimeRatio: number;
  responseAcceleration: number;
  timeOfDayHour: number;
  dayOfWeek: number;

  // Device (10)
  hasWebdriver: boolean;
  hasAutomationFlags: boolean;
  pluginCount: number;
  screenResolutionCommon: boolean;
  timezoneOffsetMinutes: number;
  timezoneMatchesIp: boolean;
  fingerprintSeenCount: number;
  deviceMemoryGb: number;
  hardwareConcurrency: number;
  touchSupport: boolean;

  // Network (8)
  isVpn: boolean;
  isDatacenter: boolean;
  isTor: boolean;
  isProxy: boolean;
  ipReputationScore: number;
  ipCountryCode: string;
  geoTimezoneMatch: boolean;
  ipSeenCount: number;

  // Content (15)
  questionCount: number;
  openEndedCount: number;
  openEndedLengthMean: number;
  openEndedLengthStd: number;
  openEndedWordCountMean: number;
  openEndedUniqueWordRatio: number;
  straightLineRatio: number;
  answerEntropy: number;
  firstOptionRatio: number;
  lastOptionRatio: number;
  middleOptionRatio: number;
  responseUniquenessScore: number;
  duplicateAnswerRatio: number;
  naRatio: number;
  skipRatio: number;

  // Honeypot (5)
  attentionCheckPassed: boolean;
  attentionCheckCount: number;
  consistencyCheckScore: number;
  trapFieldFilled: boolean;
  honeypotScore: number;
}

/**
 * Database row for cipher_features table
 */
export interface CipherFeaturesRow {
  id: string;
  response_id: string;
  survey_id: string;
  feature_vector: number[];
  feature_version: number;

  // Behavioral (snake_case for DB)
  mouse_distance_total: number | null;
  mouse_velocity_mean: number | null;
  mouse_velocity_std: number | null;
  mouse_velocity_max: number | null;
  mouse_acceleration_mean: number | null;
  mouse_curvature_entropy: number | null;
  mouse_straight_line_ratio: number | null;
  mouse_pause_count: number | null;
  keystroke_count: number | null;
  keystroke_timing_mean: number | null;
  keystroke_timing_std: number | null;
  keystroke_dwell_mean: number | null;
  keystroke_flight_mean: number | null;
  backspace_ratio: number | null;
  paste_event_count: number | null;
  paste_char_ratio: number | null;
  scroll_count: number | null;
  scroll_velocity_mean: number | null;
  scroll_direction_changes: number | null;
  focus_loss_count: number | null;
  focus_loss_duration_total: number | null;
  hover_count: number | null;
  hover_duration_mean: number | null;
  click_count: number | null;
  hover_before_click_ratio: number | null;

  // Temporal
  completion_time_seconds: number | null;
  time_per_question_mean: number | null;
  time_per_question_std: number | null;
  time_per_question_min: number | null;
  time_per_question_max: number | null;
  reading_vs_answering_ratio: number | null;
  first_interaction_delay_ms: number | null;
  idle_time_total: number | null;
  active_time_ratio: number | null;
  response_acceleration: number | null;
  time_of_day_hour: number | null;
  day_of_week: number | null;

  // Device
  has_webdriver: boolean | null;
  has_automation_flags: boolean | null;
  plugin_count: number | null;
  screen_resolution_common: boolean | null;
  timezone_offset_minutes: number | null;
  timezone_matches_ip: boolean | null;
  fingerprint_seen_count: number | null;
  device_memory_gb: number | null;
  hardware_concurrency: number | null;
  touch_support: boolean | null;

  // Network
  is_vpn: boolean | null;
  is_datacenter: boolean | null;
  is_tor: boolean | null;
  is_proxy: boolean | null;
  ip_reputation_score: number | null;
  ip_country_code: string | null;
  geo_timezone_match: boolean | null;
  ip_seen_count: number | null;

  // Content
  question_count: number | null;
  open_ended_count: number | null;
  open_ended_length_mean: number | null;
  open_ended_length_std: number | null;
  open_ended_word_count_mean: number | null;
  open_ended_unique_word_ratio: number | null;
  straight_line_ratio: number | null;
  answer_entropy: number | null;
  first_option_ratio: number | null;
  last_option_ratio: number | null;
  middle_option_ratio: number | null;
  response_uniqueness_score: number | null;
  duplicate_answer_ratio: number | null;
  na_ratio: number | null;
  skip_ratio: number | null;

  // Honeypot
  attention_check_passed: boolean | null;
  attention_check_count: number | null;
  consistency_check_score: number | null;
  trap_field_filled: boolean | null;
  honeypot_score: number | null;

  created_at: string;
}

// ============================================
// LABEL TYPES
// ============================================

export type LabelSource = 'honeypot' | 'auto_rule' | 'customer_feedback' | 'manual_review';

/**
 * Training label for a response
 */
export interface CipherLabel {
  id: string;
  responseId: string;
  isFraud: boolean;
  confidence: number;
  labelSource: LabelSource;
  labelReason: string | null;
  labeledBy: string | null;
  usedInTraining: boolean;
  trainingRunId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database row for cipher_labels table
 */
export interface CipherLabelRow {
  id: string;
  response_id: string;
  is_fraud: boolean;
  confidence: number;
  label_source: LabelSource;
  label_reason: string | null;
  labeled_by: string | null;
  used_in_training: boolean;
  training_run_id: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// PREDICTION TYPES
// ============================================

export type FraudVerdict = 'low_risk' | 'medium_risk' | 'high_risk' | 'fraud';

export interface TopSignal {
  feature: string;
  contribution: number;
  value?: number;
}

/**
 * ML model prediction
 */
export interface CipherPrediction {
  id: string;
  responseId: string;
  fraudProbability: number;
  fraudVerdict: FraudVerdict;
  confidence: number;
  topSignals: TopSignal[];
  modelVersion: string;
  modelId: string | null;
  featureVersion: number | null;
  inferenceTimeMs: number | null;
  createdAt: Date;
}

/**
 * Database row for cipher_ml_predictions table
 */
export interface CipherPredictionRow {
  id: string;
  response_id: string;
  fraud_probability: number;
  fraud_verdict: FraudVerdict;
  confidence: number;
  top_signals: TopSignal[];
  model_version: string;
  model_id: string | null;
  feature_version: number | null;
  inference_time_ms: number | null;
  created_at: string;
}

// ============================================
// MODEL TYPES
// ============================================

export type ModelStatus = 'training' | 'validating' | 'active' | 'retired';

/**
 * Registered ML model
 */
export interface CipherModel {
  id: string;
  version: string;
  precisionScore: number | null;
  recallScore: number | null;
  f1Score: number | null;
  aucRoc: number | null;
  trainingSamples: number | null;
  fraudSamples: number | null;
  legitimateSamples: number | null;
  featureVersion: number | null;
  modelArtifactUrl: string | null;
  status: ModelStatus;
  isActive: boolean;
  createdAt: Date;
  promotedAt: Date | null;
  retiredAt: Date | null;
}

/**
 * Database row for cipher_models table
 */
export interface CipherModelRow {
  id: string;
  version: string;
  precision_score: number | null;
  recall_score: number | null;
  f1_score: number | null;
  auc_roc: number | null;
  training_samples: number | null;
  fraud_samples: number | null;
  legitimate_samples: number | null;
  feature_version: number | null;
  model_artifact_url: string | null;
  status: ModelStatus;
  is_active: boolean;
  created_at: string;
  promoted_at: string | null;
  retired_at: string | null;
}

// ============================================
// AUTO-LABELING TYPES
// ============================================

export interface AutoLabelRule {
  id: string;
  name: string;
  description: string;
  confidence: number;
  isFraud: boolean;
  condition: (features: CipherFeatures, response?: SurveyResponseData) => boolean;
}

export interface AutoLabelResult {
  shouldLabel: boolean;
  isFraud: boolean;
  confidence: number;
  reason: string;
  ruleId: string;
}

// ============================================
// SURVEY RESPONSE DATA (for feature extraction)
// ============================================

export interface SurveyResponseData {
  id: string;
  surveyId: string;
  responses: Record<string, unknown>;
  completedAt: string;
  mouseData: MouseMovement[] | null;
  keystrokeData: KeystrokeEvent[] | null;
  timingData: number[] | null;
  deviceData: DeviceData | null;
  fraudScore: number | null;
  isFlagged: boolean;
  flagReasons: string[] | null;
  sessionId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface MouseMovement {
  x: number;
  y: number;
  t: number;
  velocity?: number;
}

export interface KeystrokeEvent {
  key: string;
  downAt: number;
  upAt?: number;
  dwell?: number;
  flightTime?: number;
}

export interface ScrollEvent {
  y: number;
  t: number;
  velocity?: number;
}

export interface FocusEvent {
  type: 'focus' | 'blur' | 'hidden' | 'visible';
  t: number;
}

export interface HoverEvent {
  element: string;
  duration: number;
  t: number;
}

export interface DeviceData {
  userAgent?: string;
  platform?: string;
  language?: string;
  languages?: string[];
  timezone?: string;
  timezoneOffset?: number;
  screenWidth?: number;
  screenHeight?: number;
  screenAvailWidth?: number;
  screenAvailHeight?: number;
  colorDepth?: number;
  pixelRatio?: number;
  touchSupport?: boolean;
  maxTouchPoints?: number;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  cookiesEnabled?: boolean;
  webDriver?: boolean;
  automationDetected?: boolean;
  canvasFingerprint?: string;
  webglVendor?: string;
  webglRenderer?: string;
  pluginCount?: number;
  collectedAt?: number;
}

// ============================================
// FEATURE VECTOR CONSTANTS
// ============================================

/**
 * Total number of features in the feature vector
 */
export const FEATURE_COUNT = 75;

/**
 * Current feature extraction version
 * Increment when feature extraction logic changes
 */
export const FEATURE_VERSION = 1;

/**
 * Feature names in order (for vector indexing)
 */
export const FEATURE_NAMES: (keyof CipherFeatures)[] = [
  // Behavioral (25)
  'mouseDistanceTotal',
  'mouseVelocityMean',
  'mouseVelocityStd',
  'mouseVelocityMax',
  'mouseAccelerationMean',
  'mouseCurvatureEntropy',
  'mouseStraightLineRatio',
  'mousePauseCount',
  'keystrokeCount',
  'keystrokeTimingMean',
  'keystrokeTimingStd',
  'keystrokeDwellMean',
  'keystrokeFlightMean',
  'backspaceRatio',
  'pasteEventCount',
  'pasteCharRatio',
  'scrollCount',
  'scrollVelocityMean',
  'scrollDirectionChanges',
  'focusLossCount',
  'focusLossDurationTotal',
  'hoverCount',
  'hoverDurationMean',
  'clickCount',
  'hoverBeforeClickRatio',

  // Temporal (12)
  'completionTimeSeconds',
  'timePerQuestionMean',
  'timePerQuestionStd',
  'timePerQuestionMin',
  'timePerQuestionMax',
  'readingVsAnsweringRatio',
  'firstInteractionDelayMs',
  'idleTimeTotal',
  'activeTimeRatio',
  'responseAcceleration',
  'timeOfDayHour',
  'dayOfWeek',

  // Device (10)
  'hasWebdriver',
  'hasAutomationFlags',
  'pluginCount',
  'screenResolutionCommon',
  'timezoneOffsetMinutes',
  'timezoneMatchesIp',
  'fingerprintSeenCount',
  'deviceMemoryGb',
  'hardwareConcurrency',
  'touchSupport',

  // Network (8)
  'isVpn',
  'isDatacenter',
  'isTor',
  'isProxy',
  'ipReputationScore',
  'ipCountryCode',
  'geoTimezoneMatch',
  'ipSeenCount',

  // Content (15)
  'questionCount',
  'openEndedCount',
  'openEndedLengthMean',
  'openEndedLengthStd',
  'openEndedWordCountMean',
  'openEndedUniqueWordRatio',
  'straightLineRatio',
  'answerEntropy',
  'firstOptionRatio',
  'lastOptionRatio',
  'middleOptionRatio',
  'responseUniquenessScore',
  'duplicateAnswerRatio',
  'naRatio',
  'skipRatio',

  // Honeypot (5)
  'attentionCheckPassed',
  'attentionCheckCount',
  'consistencyCheckScore',
  'trapFieldFilled',
  'honeypotScore',
];

/**
 * Default feature values (for missing data)
 */
export const DEFAULT_FEATURES: CipherFeatures = {
  // Behavioral
  mouseDistanceTotal: 0,
  mouseVelocityMean: 0,
  mouseVelocityStd: 0,
  mouseVelocityMax: 0,
  mouseAccelerationMean: 0,
  mouseCurvatureEntropy: 0,
  mouseStraightLineRatio: 0,
  mousePauseCount: 0,
  keystrokeCount: 0,
  keystrokeTimingMean: 0,
  keystrokeTimingStd: 0,
  keystrokeDwellMean: 0,
  keystrokeFlightMean: 0,
  backspaceRatio: 0,
  pasteEventCount: 0,
  pasteCharRatio: 0,
  scrollCount: 0,
  scrollVelocityMean: 0,
  scrollDirectionChanges: 0,
  focusLossCount: 0,
  focusLossDurationTotal: 0,
  hoverCount: 0,
  hoverDurationMean: 0,
  clickCount: 0,
  hoverBeforeClickRatio: 0,

  // Temporal
  completionTimeSeconds: 0,
  timePerQuestionMean: 0,
  timePerQuestionStd: 0,
  timePerQuestionMin: 0,
  timePerQuestionMax: 0,
  readingVsAnsweringRatio: 0,
  firstInteractionDelayMs: 0,
  idleTimeTotal: 0,
  activeTimeRatio: 0,
  responseAcceleration: 0,
  timeOfDayHour: 12,
  dayOfWeek: 0,

  // Device
  hasWebdriver: false,
  hasAutomationFlags: false,
  pluginCount: 0,
  screenResolutionCommon: true,
  timezoneOffsetMinutes: 0,
  timezoneMatchesIp: true,
  fingerprintSeenCount: 1,
  deviceMemoryGb: 4,
  hardwareConcurrency: 4,
  touchSupport: false,

  // Network
  isVpn: false,
  isDatacenter: false,
  isTor: false,
  isProxy: false,
  ipReputationScore: 0.5,
  ipCountryCode: 'US',
  geoTimezoneMatch: true,
  ipSeenCount: 1,

  // Content
  questionCount: 0,
  openEndedCount: 0,
  openEndedLengthMean: 0,
  openEndedLengthStd: 0,
  openEndedWordCountMean: 0,
  openEndedUniqueWordRatio: 0,
  straightLineRatio: 0,
  answerEntropy: 0,
  firstOptionRatio: 0,
  lastOptionRatio: 0,
  middleOptionRatio: 0,
  responseUniquenessScore: 0.5,
  duplicateAnswerRatio: 0,
  naRatio: 0,
  skipRatio: 0,

  // Honeypot
  attentionCheckPassed: true,
  attentionCheckCount: 0,
  consistencyCheckScore: 1,
  trapFieldFilled: false,
  honeypotScore: 0,
};
