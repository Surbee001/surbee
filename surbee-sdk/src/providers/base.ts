/**
 * Base provider interface for AI models
 * All provider implementations must implement this interface
 */

export type ProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GenerationOptions = {
  /**
   * Reasoning effort level
   */
  reasoningEffort?: "low" | "medium" | "high";

  /**
   * Response format
   */
  format?: "text" | "json";

  /**
   * JSON schema for structured output
   */
  jsonSchema?: any;

  /**
   * Schema name for validation
   */
  schemaName?: string;

  /**
   * Temperature for randomness (0-1)
   */
  temperature?: number;

  /**
   * Maximum tokens to generate
   */
  maxTokens?: number;

  /**
   * Enable streaming
   */
  streaming?: boolean;
};

export type GenerationResponse<T = string> = {
  /**
   * Generated content
   */
  content: T;

  /**
   * Reasoning steps (if available)
   */
  reasoning?: string[];

  /**
   * Usage statistics
   */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };

  /**
   * Model used
   */
  model: string;

  /**
   * Provider name
   */
  provider: string;
};

export interface AIProvider {
  /**
   * Provider name
   */
  readonly name: string;

  /**
   * Supported models
   */
  readonly models: string[];

  /**
   * Check if provider is available (API key configured, etc.)
   */
  isAvailable(): Promise<boolean>;

  /**
   * Generate text completion
   */
  generateText(
    messages: ProviderMessage[],
    options?: GenerationOptions
  ): Promise<GenerationResponse<string>>;

  /**
   * Generate JSON completion
   */
  generateJSON<T = any>(
    messages: ProviderMessage[],
    jsonSchema: any,
    schemaName: string,
    options?: GenerationOptions
  ): Promise<GenerationResponse<T>>;

  /**
   * Generate with streaming
   */
  generateStream?(
    messages: ProviderMessage[],
    options?: GenerationOptions
  ): Promise<ReadableStream<Uint8Array>>;

  /**
   * Estimate cost for a generation
   */
  estimateCost?(tokens: number): number;
}

/**
 * Provider configuration
 */
export type ProviderConfig = {
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
  defaultModel?: string;
  timeout?: number;
};

/**
 * Base provider class with common functionality
 */
export abstract class BaseProvider implements AIProvider {
  protected config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  abstract readonly name: string;
  abstract readonly models: string[];

  abstract isAvailable(): Promise<boolean>;
  abstract generateText(
    messages: ProviderMessage[],
    options?: GenerationOptions
  ): Promise<GenerationResponse<string>>;
  abstract generateJSON<T = any>(
    messages: ProviderMessage[],
    jsonSchema: any,
    schemaName: string,
    options?: GenerationOptions
  ): Promise<GenerationResponse<T>>;

  /**
   * Parse JSON output safely
   */
  protected parseJsonOutput<T>(payload: unknown): T {
    if (typeof payload !== "string" || payload.trim().length === 0) {
      throw new Error("Empty model response");
    }
    try {
      return JSON.parse(payload) as T;
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from various response formats
   */
  protected safeOutputText(res: any): string {
    // Try different possible response structures
    if (typeof res?.output_text === "string") {
      return res.output_text;
    }

    if (typeof res?.response?.output_text === "string") {
      return res.response.output_text;
    }

    if (typeof res?.text === "string") {
      return res.text;
    }

    if (typeof res?.content === "string") {
      return res.content;
    }

    // Handle choices array format (like chat completions)
    if (Array.isArray(res?.choices) && res.choices.length > 0) {
      const choice = res.choices[0];
      if (typeof choice?.message?.content === "string") {
        return choice.message.content;
      }
      if (typeof choice?.text === "string") {
        return choice.text;
      }
    }

    throw new Error("Model response missing expected content field");
  }
}
