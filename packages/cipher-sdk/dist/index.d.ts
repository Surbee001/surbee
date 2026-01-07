/**
 * Cipher SDK Types
 *
 * Core type definitions for the Cipher response validation system.
 * Implementation details are hidden - the SDK communicates with Surbee's
 * secure validation engine.
 */
type CipherTier = 1 | 2 | 3 | 4 | 5;
type CheckId = 'rapid_completion' | 'uniform_timing' | 'low_interaction' | 'straight_line_answers' | 'impossibly_fast' | 'minimal_effort' | 'excessive_paste' | 'pointer_spikes' | 'webdriver_detected' | 'automation_detected' | 'no_plugins' | 'suspicious_user_agent' | 'device_fingerprint_mismatch' | 'screen_anomaly' | 'suspicious_pauses' | 'robotic_typing' | 'mouse_teleporting' | 'no_corrections' | 'excessive_tab_switching' | 'window_focus_loss' | 'ai_content_basic' | 'contradiction_basic' | 'hover_behavior' | 'scroll_patterns' | 'mouse_acceleration' | 'vpn_detection' | 'datacenter_ip' | 'plagiarism_basic' | 'quality_assessment' | 'semantic_analysis' | 'ai_content_full' | 'contradiction_full' | 'plagiarism_full' | 'fraud_ring_detection' | 'answer_sharing' | 'coordinated_timing' | 'device_sharing' | 'tor_detection' | 'proxy_detection' | 'timezone_validation' | 'baseline_deviation' | 'perplexity_analysis' | 'burstiness_analysis';
interface CheckResult {
    /** The check that was run */
    checkId: CheckId;
    /** Whether the check passed */
    passed: boolean;
    /** Suspicion score (0-1, higher = more suspicious) */
    score: number;
    /** Human-readable details */
    details?: string;
}
interface ResponseInput {
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
interface ValidationInput {
    /** Array of question/answer pairs */
    responses: ResponseInput[];
    /** Behavioral metrics from client-side tracking */
    behavioralMetrics?: BehavioralMetrics;
    /** Device/browser information */
    deviceInfo?: DeviceInfo;
    /** Survey context */
    context?: SurveyContext;
}
interface SurveyContext {
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
interface BehavioralMetrics {
    sessionId: string;
    startedAt: number;
    duration: number;
    lastActiveAt: number;
    mouseMovements: MouseMovement[];
    mouseClicks: MouseClick[];
    mouseMovementCount: number;
    avgMouseVelocity: number;
    keystrokeDynamics: KeystrokeEvent[];
    keypressCount: number;
    backspaceCount: number;
    avgKeystrokeDwell: number;
    keystrokeVariance: number;
    scrollEvents: ScrollEvent[];
    scrollEventCount: number;
    focusEvents: FocusEvent[];
    tabSwitchCount: number;
    totalBlurDuration: number;
    pasteEvents: number;
    copyEvents: number;
    hoverEvents: HoverEvent[];
    responseTime: number[];
    questionStartTimes: Record<string, number>;
}
interface MouseMovement {
    x: number;
    y: number;
    t: number;
    velocity: number;
}
interface MouseClick {
    x: number;
    y: number;
    t: number;
    hadHover: boolean;
}
interface KeystrokeEvent {
    key: string;
    downAt: number;
    upAt: number;
    dwell: number;
    flightTime: number;
}
interface ScrollEvent {
    y: number;
    t: number;
    velocity: number;
}
interface FocusEvent {
    type: 'focus' | 'blur' | 'hidden' | 'visible';
    t: number;
}
interface HoverEvent {
    element: string;
    duration: number;
    t: number;
}
interface DeviceInfo {
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
interface ValidationResult {
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
interface ValidationSummary {
    /** Short verdict (e.g., "Likely legitimate", "Suspected bot") */
    verdict: string;
    /** List of issues found */
    issues: string[];
    /** List of positive signals */
    positives: string[];
    /** Actionable suggestion for the user */
    suggestion: string;
}
interface ValidationMeta {
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
interface CipherConfig {
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
interface BatchValidationInput {
    submissions: ValidationInput[];
    /** Enable cross-submission fraud detection (tier 5) */
    crossAnalysis?: boolean;
}
interface BatchValidationResult {
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
interface FraudIndicators {
    /** Response IDs with duplicate answers */
    duplicateAnswers: string[];
    /** Whether coordinated timing was detected */
    coordinatedTiming: boolean;
    /** Whether device sharing was detected */
    deviceSharing: boolean;
    /** Fraud ring score (0-1) */
    fraudRingScore: number;
}
interface CipherError {
    code: CipherErrorCode;
    message: string;
    details?: Record<string, unknown>;
}
type CipherErrorCode = 'INVALID_API_KEY' | 'RATE_LIMITED' | 'INSUFFICIENT_CREDITS' | 'INVALID_INPUT' | 'TIER_NOT_AVAILABLE' | 'SERVER_ERROR' | 'NETWORK_ERROR';

/**
 * Cipher - AI-powered survey response validation
 *
 * Main class for validating survey responses through Surbee's
 * secure validation engine.
 *
 * ```typescript
 * import { Cipher } from '@surbee/cipher';
 *
 * const cipher = new Cipher({ apiKey: 'cipher_sk_...' });
 * const result = await cipher.validate(input);
 * ```
 */

/**
 * Cipher SDK
 */
declare class Cipher {
    private config;
    constructor(config: CipherConfig);
    /**
     * Validate a single response
     */
    validate(input: ValidationInput): Promise<ValidationResult>;
    /**
     * Validate multiple responses in batch
     */
    validateBatch(input: BatchValidationInput): Promise<BatchValidationResult>;
    /**
     * Get tier information
     */
    getTierInfo(tier?: CipherTier): {
        name: string;
        description: string;
        checksCount: number;
    };
    /**
     * Get all available tiers
     */
    getAllTiers(): {
        name: string;
        description: string;
        checksCount: number;
        tier: CipherTier;
    }[];
    /**
     * Check API key validity and credits
     */
    checkStatus(): Promise<{
        valid: boolean;
        credits: number;
        tier: CipherTier;
        rateLimit: {
            remaining: number;
            resetAt: number;
        };
    }>;
    /**
     * Make API request to Surbee
     */
    private request;
    /**
     * Create a typed error
     */
    private createError;
}

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

declare const VERSION = "0.1.0";

export { type BatchValidationInput, type BatchValidationResult, type BehavioralMetrics, type CheckId, type CheckResult, Cipher, type CipherConfig, type CipherError, type CipherErrorCode, type CipherTier, type DeviceInfo, type FocusEvent, type FraudIndicators, type HoverEvent, type KeystrokeEvent, type MouseClick, type MouseMovement, type ResponseInput, type ScrollEvent, type SurveyContext, VERSION, type ValidationInput, type ValidationMeta, type ValidationResult, type ValidationSummary };
