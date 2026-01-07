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

import type {
  CipherConfig,
  CipherTier,
  ValidationInput,
  ValidationResult,
  BatchValidationInput,
  BatchValidationResult,
  CipherError,
  CipherErrorCode,
} from './types';

/**
 * Default configuration
 */
const DEFAULT_CONFIG = {
  tier: 3 as CipherTier,
  thresholds: {
    fail: 0.4,
    review: 0.7,
  },
  debug: false,
  endpoint: 'https://api.surbee.com/v1/cipher',
};

/**
 * Tier information (public-facing, no implementation details)
 */
const TIER_INFO: Record<CipherTier, { name: string; description: string; checksCount: number }> = {
  1: {
    name: 'Basic',
    description: 'Essential fraud detection with behavioral heuristics',
    checksCount: 6,
  },
  2: {
    name: 'Standard',
    description: 'Adds device fingerprinting and automation detection',
    checksCount: 15,
  },
  3: {
    name: 'Enhanced',
    description: 'Adds AI-powered content quality analysis',
    checksCount: 22,
  },
  4: {
    name: 'Advanced',
    description: 'Full behavioral analysis with network validation',
    checksCount: 30,
  },
  5: {
    name: 'Maximum',
    description: 'All 43 checks with cross-respondent fraud detection',
    checksCount: 43,
  },
};

/**
 * Cipher SDK
 */
export class Cipher {
  private config: Required<Omit<CipherConfig, 'endpoint'>> & { endpoint: string };

  constructor(config: CipherConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required. Get one from Settings > API Keys in your Surbee dashboard.');
    }

    if (!config.apiKey.startsWith('cipher_sk_') && !config.apiKey.startsWith('cipher_pk_')) {
      throw new Error('Invalid API key format. Keys should start with cipher_sk_ or cipher_pk_');
    }

    this.config = {
      apiKey: config.apiKey,
      tier: config.tier ?? DEFAULT_CONFIG.tier,
      thresholds: {
        fail: config.thresholds?.fail ?? DEFAULT_CONFIG.thresholds.fail,
        review: config.thresholds?.review ?? DEFAULT_CONFIG.thresholds.review,
      },
      debug: config.debug ?? DEFAULT_CONFIG.debug,
      endpoint: config.endpoint ?? DEFAULT_CONFIG.endpoint,
    };
  }

  /**
   * Validate a single response
   */
  async validate(input: ValidationInput): Promise<ValidationResult> {
    const response = await this.request('/validate', {
      tier: this.config.tier,
      thresholds: this.config.thresholds,
      input,
    });

    return response as ValidationResult;
  }

  /**
   * Validate multiple responses in batch
   */
  async validateBatch(input: BatchValidationInput): Promise<BatchValidationResult> {
    const response = await this.request('/validate/batch', {
      tier: this.config.tier,
      thresholds: this.config.thresholds,
      submissions: input.submissions,
      crossAnalysis: input.crossAnalysis ?? (this.config.tier === 5),
    });

    return response as BatchValidationResult;
  }

  /**
   * Get tier information
   */
  getTierInfo(tier?: CipherTier) {
    const t = tier ?? this.config.tier;
    return TIER_INFO[t];
  }

  /**
   * Get all available tiers
   */
  getAllTiers() {
    return Object.entries(TIER_INFO).map(([tier, info]) => ({
      tier: Number(tier) as CipherTier,
      ...info,
    }));
  }

  /**
   * Check API key validity and credits
   */
  async checkStatus(): Promise<{
    valid: boolean;
    credits: number;
    tier: CipherTier;
    rateLimit: { remaining: number; resetAt: number };
  }> {
    const response = await this.request('/status', {});
    return response as any;
  }

  /**
   * Make API request to Surbee
   */
  private async request(path: string, body: Record<string, unknown>): Promise<unknown> {
    const url = `${this.config.endpoint}${path}`;

    if (this.config.debug) {
      console.log(`[Cipher] POST ${url}`);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Cipher-SDK': '0.1.0',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Record<string, unknown>;
        throw this.createError(response.status, errorData);
      }

      return response.json();
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        throw error;
      }
      throw this.createError(0, { message: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  /**
   * Create a typed error
   */
  private createError(status: number, data: Record<string, unknown>): CipherError {
    let code: CipherErrorCode;
    let message: string;

    switch (status) {
      case 401:
        code = 'INVALID_API_KEY';
        message = 'Invalid API key. Check your key in Settings > API Keys.';
        break;
      case 402:
        code = 'INSUFFICIENT_CREDITS';
        message = 'Insufficient credits. Add more credits in your Surbee dashboard.';
        break;
      case 429:
        code = 'RATE_LIMITED';
        message = 'Rate limited. Please slow down your requests.';
        break;
      case 400:
        code = 'INVALID_INPUT';
        message = (data.message as string) || 'Invalid input data.';
        break;
      case 403:
        code = 'TIER_NOT_AVAILABLE';
        message = 'This tier is not available on your plan. Upgrade to access higher tiers.';
        break;
      default:
        code = status === 0 ? 'NETWORK_ERROR' : 'SERVER_ERROR';
        message = (data.message as string) || 'An error occurred.';
    }

    return { code, message, details: data };
  }
}
