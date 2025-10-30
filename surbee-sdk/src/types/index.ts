/**
 * Type exports for Surbee SDK
 */

export * from './schemas';

export type SurbeeConfig = {
  /**
   * Surbee Platform API key (get from console.surbee.com)
   */
  apiKey: string;

  /**
   * Optional custom base URL for Surbee API
   */
  baseUrl?: string;

  /**
   * Optional API keys for direct provider access (BYOK mode)
   */
  providerKeys?: {
    openai?: string;
    anthropic?: string;
    xai?: string;
  };

  /**
   * Enable caching for repeated generations
   */
  enableCaching?: boolean;

  /**
   * Default provider preference
   */
  defaultProvider?: "auto" | "gpt-5" | "gpt-4o" | "grok" | "claude";

  /**
   * Timeout for API requests (ms)
   */
  timeout?: number;
};

export type AccuracyDetectionEvent =
  | "mouseMovement"
  | "keyboardInput"
  | "timeTracking"
  | "focusLoss"
  | "scrollBehavior"
  | "clickPattern";

export type AccuracyScore = {
  /**
   * Overall quality score (0-100)
   */
  score: number;

  /**
   * Confidence in the score
   */
  confidence: number;

  /**
   * Flags indicating potential issues
   */
  flags: {
    type: "rushed" | "bot-like" | "inconsistent" | "suspicious-pattern";
    severity: "low" | "medium" | "high";
    description: string;
  }[];

  /**
   * Detailed metrics
   */
  metrics?: {
    avgTimePerQuestion: number;
    mouseMovementVariance: number;
    consistencyScore: number;
  };
};

export type AccuracyDetectorOptions = {
  /**
   * Survey ID to track
   */
  surveyId: string;

  /**
   * Events to monitor
   */
  events: AccuracyDetectionEvent[];

  /**
   * Sensitivity level
   */
  sensitivity?: "low" | "medium" | "high";
};
