/**
 * Main Surbee SDK Client
 * Primary interface for survey generation and accuracy detection
 */

import { ProviderRegistry, ProviderType } from "./providers/registry";
import { SurveyOrchestrator } from "./generators/orchestrator";
import { AccuracyDetector } from "./accuracy/detector";
import {
  SurbeeConfig,
  GenerateOptions,
  GenerateResult,
  AccuracyDetectorOptions,
  AccuracyScore,
} from "./types";

export class SurbeeClient {
  private registry: ProviderRegistry;
  private config: SurbeeConfig;

  /**
   * Survey generation API
   */
  public readonly surveys: {
    generate: (prompt: string, options?: GenerateOptions) => Promise<GenerateResult>;
  };

  /**
   * Accuracy detection API
   */
  public readonly accuracy: {
    create: (options: AccuracyDetectorOptions) => AccuracyDetector;
    analyze: (surveyId: string, responseData: any) => Promise<AccuracyScore>;
  };

  constructor(config: SurbeeConfig) {
    this.config = config;

    // Initialize provider registry
    this.registry = ProviderRegistry.fromConfig({
      openai: config.providerKeys?.openai
        ? { apiKey: config.providerKeys.openai }
        : undefined,
      xai: config.providerKeys?.xai
        ? { apiKey: config.providerKeys.xai }
        : undefined,
      anthropic: config.providerKeys?.anthropic
        ? { apiKey: config.providerKeys.anthropic }
        : undefined,
      defaultProvider: config.defaultProvider as ProviderType | undefined,
    });

    // Bind survey methods
    this.surveys = {
      generate: this.generateSurvey.bind(this),
    };

    // Bind accuracy methods
    this.accuracy = {
      create: this.createAccuracyDetector.bind(this),
      analyze: this.analyzeAccuracy.bind(this),
    };
  }

  /**
   * Generate a survey component
   */
  private async generateSurvey(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<GenerateResult> {
    // Validate config
    if (!this.config.apiKey && !this.config.providerKeys) {
      throw new Error(
        "Surbee API key or provider keys required. Get one at console.surbee.com"
      );
    }

    // If using Surbee Platform API, delegate to backend
    if (this.config.apiKey && !options.provider) {
      return this.generateViaPlatform(prompt, options);
    }

    // Otherwise use direct provider access (BYOK mode)
    return this.generateDirect(prompt, options);
  }

  /**
   * Generate survey via Surbee Platform API
   */
  private async generateViaPlatform(
    prompt: string,
    options: GenerateOptions
  ): Promise<GenerateResult> {
    const baseUrl = this.config.baseUrl || "https://api.surbee.com";
    const url = `${baseUrl}/v1/surveys/generate`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        prompt,
        options,
      }),
      signal: this.config.timeout
        ? AbortSignal.timeout(this.config.timeout)
        : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Surbee Platform API error: ${error}`);
    }

    return response.json() as Promise<GenerateResult>;
  }

  /**
   * Generate survey directly using providers (BYOK mode)
   */
  private async generateDirect(
    prompt: string,
    options: GenerateOptions
  ): Promise<GenerateResult> {
    // Get provider
    const provider = await this.registry.getWithFallback(options.provider);

    // Create orchestrator
    const orchestrator = new SurveyOrchestrator(provider);

    // Generate survey
    return orchestrator.generate(prompt, options);
  }

  /**
   * Create an accuracy detector
   */
  private createAccuracyDetector(options: AccuracyDetectorOptions): AccuracyDetector {
    return new AccuracyDetector(options, this.config.apiKey);
  }

  /**
   * Analyze survey response accuracy
   */
  private async analyzeAccuracy(
    surveyId: string,
    responseData: any
  ): Promise<AccuracyScore> {
    // If using platform API, delegate to backend
    if (this.config.apiKey) {
      const baseUrl = this.config.baseUrl || "https://api.surbee.com";
      const url = `${baseUrl}/v1/accuracy/analyze`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          surveyId,
          responseData,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Accuracy analysis error: ${error}`);
      }

      return response.json() as Promise<AccuracyScore>;
    }

    // Fallback to local placeholder
    const detector = this.createAccuracyDetector({
      surveyId,
      events: ["timeTracking", "mouseMovement"],
    });

    return detector.analyze(responseData);
  }

  /**
   * Check if client is properly configured
   */
  async isConfigured(): Promise<boolean> {
    if (this.config.apiKey) {
      // Test platform API
      try {
        const baseUrl = this.config.baseUrl || "https://api.surbee.com";
        const response = await fetch(`${baseUrl}/v1/health`, {
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
          },
        });
        return response.ok;
      } catch {
        return false;
      }
    }

    // Check if any providers are available
    const available = await this.registry.getAvailable();
    return available.length > 0;
  }

  /**
   * Get available providers
   */
  async getProviders(): Promise<string[]> {
    const available = await this.registry.getAvailable();
    return available.map((p) => p.name);
  }
}

/**
 * Create a Surbee client instance
 */
export function createClient(config: SurbeeConfig): SurbeeClient {
  return new SurbeeClient(config);
}
