/**
 * Cipher SDK Types
 *
 * Core type definitions for the Cipher response validation system.
 * Implementation details are hidden - the SDK communicates with Surbee's
 * secure validation engine.
 */

// ============================================
// TIER SYSTEM
// ============================================

export type CipherTier = 1 | 2 | 3 | 4 | 5;

// ============================================
// CHECK DEFINITIONS (43 checks across 6 categories)
// ============================================

export type CheckId =
  // Tier 1 - Basic behavioral (6 checks)
  | 'rapid_completion'
  | 'uniform_timing'
  | 'low_interaction'
  | 'straight_line_answers'
  | 'impossibly_fast'
  | 'minimal_effort'
  // Tier 2 - Device/automation (9 checks)
  | 'excessive_paste'
  | 'pointer_spikes'
  | 'webdriver_detected'
  | 'automation_detected'
  | 'no_plugins'
  | 'suspicious_user_agent'
  | 'device_fingerprint_mismatch'
  | 'screen_anomaly'
  | 'suspicious_pauses'
  // Tier 3 - Enhanced behavioral (7 checks)
  | 'robotic_typing'
  | 'mouse_teleporting'
  | 'no_corrections'
  | 'excessive_tab_switching'
  | 'window_focus_loss'
  | 'ai_content_basic'
  | 'contradiction_basic'
  // Tier 4 - Advanced (8 checks)
  | 'hover_behavior'
  | 'scroll_patterns'
  | 'mouse_acceleration'
  | 'vpn_detection'
  | 'datacenter_ip'
  | 'plagiarism_basic'
  | 'quality_assessment'
  | 'semantic_analysis'
  // Tier 5 - Maximum (13 checks)
  | 'ai_content_full'
  | 'contradiction_full'
  | 'plagiarism_full'
  | 'fraud_ring_detection'
  | 'answer_sharing'
  | 'coordinated_timing'
  | 'device_sharing'
  | 'tor_detection'
  | 'proxy_detection'
  | 'timezone_validation'
  | 'baseline_deviation'
  | 'perplexity_analysis'
  | 'burstiness_analysis';

export interface CheckResult {
  /** The check that was run */
  checkId: CheckId;
  /** Whether the check passed */
  passed: boolean;
  /** Suspicion score (0-1, higher = more suspicious) */
  score: number;
  /** Human-readable details */
  details?: string;
}

// ============================================
// INPUT TYPES
// ============================================

export interface ResponseInput {
  /** The question text */
  question: string;
  /** The user's answer */
  answer: string;
  /** Question type for context */
  questionType?: 'text' | 'multiple_choice' | 'rating' | 'scale' | 'boolean';
  /** Time spent on this question in milliseconds */
  responseTimeMs?: number;
  /** Question index in the survey */
  questionIndex?: number;
}

export interface ValidationInput {
  /** Array of question/answer pairs */
  responses: ResponseInput[];
  /** Behavioral metrics from client-side tracking */
  behavioralMetrics?: BehavioralMetrics;
  /** Device/browser information */
  deviceInfo?: DeviceInfo;
  /** Survey context */
  context?: SurveyContext;
}

export interface SurveyContext {
  /** Survey ID for cross-respondent analysis */
  surveyId?: string;
  /** Expected completion time in seconds */
  expectedDurationSeconds?: number;
  /** Actual completion time in seconds */
  actualDurationSeconds?: number;
  /** Survey type for context-aware analysis */
  surveyType?: 'nps' | 'csat' | 'research' | 'feedback' | 'quiz';
  /** Total number of questions */
  totalQuestions?: number;
}

// ============================================
// BEHAVIORAL METRICS (from client tracker)
// ============================================

export interface BehavioralMetrics {
  sessionId: string;
  startedAt: number;
  duration: number;
  lastActiveAt: number;

  // Mouse metrics
  mouseMovements: MouseMovement[];
  mouseClicks: MouseClick[];
  mouseMovementCount: number;
  avgMouseVelocity: number;

  // Keyboard metrics
  keystrokeDynamics: KeystrokeEvent[];
  keypressCount: number;
  backspaceCount: number;
  avgKeystrokeDwell: number;
  keystrokeVariance: number;

  // Scroll metrics
  scrollEvents: ScrollEvent[];
  scrollEventCount: number;

  // Focus metrics
  focusEvents: FocusEvent[];
  tabSwitchCount: number;
  totalBlurDuration: number;

  // Interaction metrics
  pasteEvents: number;
  copyEvents: number;

  // Hover metrics (tier 3+)
  hoverEvents: HoverEvent[];

  // Question timing
  responseTime: number[];
  questionStartTimes: Record<string, number>;
}

export interface MouseMovement {
  x: number;
  y: number;
  t: number;
  velocity: number;
}

export interface MouseClick {
  x: number;
  y: number;
  t: number;
  hadHover: boolean;
}

export interface KeystrokeEvent {
  key: string;
  downAt: number;
  upAt: number;
  dwell: number;
  flightTime: number;
}

export interface ScrollEvent {
  y: number;
  t: number;
  velocity: number;
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

// ============================================
// DEVICE INFO
// ============================================

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  timezone: string;
  timezoneOffset: number;
  screenWidth: number;
  screenHeight: number;
  screenAvailWidth: number;
  screenAvailHeight: number;
  colorDepth: number;
  pixelRatio: number;
  touchSupport: boolean;
  maxTouchPoints: number;
  hardwareConcurrency: number;
  deviceMemory: number;
  cookiesEnabled: boolean;
  webDriver: boolean;
  automationDetected: boolean;
  canvasFingerprint: string | null;
  webglVendor: string | null;
  webglRenderer: string | null;
  pluginCount: number;
  collectedAt: number;
}

// ============================================
// VALIDATION RESULT
// ============================================

export interface ValidationResult {
  /** Overall quality score (0-1, higher = better quality) */
  score: number;
  /** Whether the response passed validation */
  passed: boolean;
  /** Recommendation for the response */
  recommendation: 'keep' | 'review' | 'discard';
  /** Confidence in the assessment (0-1) */
  confidence: number;
  /** Flags that were triggered */
  flags: string[];
  /** Human-readable summary analysis */
  summary: ValidationSummary;
  /** Detailed check results */
  checks: CheckResult[];
  /** Processing metadata */
  meta: ValidationMeta;
}

export interface ValidationSummary {
  /** Short verdict (e.g., "Likely legitimate", "Suspected bot") */
  verdict: string;
  /** List of issues found */
  issues: string[];
  /** List of positive signals */
  positives: string[];
  /** Actionable suggestion for the user */
  suggestion: string;
}

export interface ValidationMeta {
  /** Tier used for validation */
  tier: CipherTier;
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Number of checks run */
  checksRun: number;
  /** Number of checks passed */
  checksPassed: number;
  /** Request ID for support */
  requestId: string;
  /** Timestamp */
  timestamp: number;
}

// ============================================
// CONFIGURATION
// ============================================

export interface CipherConfig {
  /**
   * API key from Surbee dashboard (Settings > API Keys)
   * Format: cipher_sk_...
   */
  apiKey: string;
  /**
   * Validation tier (1-5)
   * - Tier 1-2: Basic checks (~free)
   * - Tier 3: Enhanced analysis
   * - Tier 4: Advanced validation
   * - Tier 5: Maximum accuracy
   */
  tier?: CipherTier;
  /** Custom thresholds */
  thresholds?: {
    /** Score below this = fail (default: 0.4) */
    fail?: number;
    /** Score below this = review (default: 0.7) */
    review?: number;
  };
  /** Enable debug logging */
  debug?: boolean;
  /** Custom API endpoint (for enterprise/self-hosted) */
  endpoint?: string;
}

// ============================================
// BATCH OPERATIONS
// ============================================

export interface BatchValidationInput {
  submissions: ValidationInput[];
  /** Enable cross-submission fraud detection (tier 5) */
  crossAnalysis?: boolean;
}

export interface BatchValidationResult {
  results: ValidationResult[];
  summary: {
    total: number;
    passed: number;
    review: number;
    failed: number;
    avgScore: number;
  };
  /** Cross-submission fraud indicators (tier 5 only) */
  fraudIndicators?: FraudIndicators;
}

export interface FraudIndicators {
  /** Response IDs with duplicate answers */
  duplicateAnswers: string[];
  /** Whether coordinated timing was detected */
  coordinatedTiming: boolean;
  /** Whether device sharing was detected */
  deviceSharing: boolean;
  /** Fraud ring score (0-1) */
  fraudRingScore: number;
}

// ============================================
// ERROR TYPES
// ============================================

export interface CipherError {
  code: CipherErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

export type CipherErrorCode =
  | 'INVALID_API_KEY'
  | 'RATE_LIMITED'
  | 'INSUFFICIENT_CREDITS'
  | 'INVALID_INPUT'
  | 'TIER_NOT_AVAILABLE'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR';
