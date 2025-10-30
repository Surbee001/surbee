/**
 * Provider registry and management
 * Handles provider selection, fallbacks, and auto-selection
 */

import { AIProvider, ProviderConfig } from "./base";
import { OpenAIProvider } from "./openai";
import { XAIProvider } from "./xai";

export type ProviderType = "openai" | "xai" | "anthropic" | "auto";

export class ProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  private defaultProvider: ProviderType = "auto";

  constructor() {}

  /**
   * Register a provider
   */
  register(name: string, provider: AIProvider): void {
    this.providers.set(name, provider);
  }

  /**
   * Get a provider by name
   */
  get(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  /**
   * Set default provider
   */
  setDefault(provider: ProviderType): void {
    this.defaultProvider = provider;
  }

  /**
   * Get default provider
   */
  getDefault(): ProviderType {
    return this.defaultProvider;
  }

  /**
   * Get all available providers
   */
  async getAvailable(): Promise<AIProvider[]> {
    const available: AIProvider[] = [];

    for (const provider of this.providers.values()) {
      if (await provider.isAvailable()) {
        available.push(provider);
      }
    }

    return available;
  }

  /**
   * Auto-select best provider based on task
   */
  async autoSelect(task?: "reasoning" | "fast" | "cheap"): Promise<AIProvider> {
    const available = await this.getAvailable();

    if (available.length === 0) {
      throw new Error("No AI providers available. Please configure API keys.");
    }

    // Priority order based on task
    if (task === "reasoning") {
      // Prefer GPT-5 > Grok > Others
      const gpt5 = available.find(
        (p) => p.name === "openai" && p.models.includes("gpt-5")
      );
      if (gpt5) return gpt5;

      const grok = available.find((p) => p.name === "xai");
      if (grok) return grok;
    } else if (task === "fast") {
      // Prefer Grok > GPT-4o > GPT-5
      const grok = available.find((p) => p.name === "xai");
      if (grok) return grok;

      const gpt4o = available.find(
        (p) => p.name === "openai" && p.models.includes("gpt-4o")
      );
      if (gpt4o) return gpt4o;
    } else if (task === "cheap") {
      // Prefer smaller models
      const gpt4mini = available.find(
        (p) => p.name === "openai" && p.models.includes("gpt-4o-mini")
      );
      if (gpt4mini) return gpt4mini;
    }

    // Default: prefer GPT-5 if available
    const gpt5 = available.find(
      (p) => p.name === "openai" && p.models.includes("gpt-5")
    );
    if (gpt5) return gpt5;

    // Otherwise return first available
    return available[0];
  }

  /**
   * Create and register providers from config
   */
  static fromConfig(config: {
    openai?: ProviderConfig;
    xai?: ProviderConfig;
    anthropic?: ProviderConfig;
    defaultProvider?: ProviderType;
  }): ProviderRegistry {
    const registry = new ProviderRegistry();

    if (config.openai?.apiKey) {
      registry.register("openai", new OpenAIProvider(config.openai));
    }

    if (config.xai?.apiKey) {
      registry.register("xai", new XAIProvider(config.xai));
    }

    // Add more providers here as implemented
    // if (config.anthropic?.apiKey) {
    //   registry.register("anthropic", new AnthropicProvider(config.anthropic));
    // }

    if (config.defaultProvider) {
      registry.setDefault(config.defaultProvider);
    }

    return registry;
  }

  /**
   * Get provider with fallback chain
   */
  async getWithFallback(
    preferredProvider?: string
  ): Promise<AIProvider> {
    // Try preferred provider first
    if (preferredProvider && preferredProvider !== "auto") {
      const provider = this.get(preferredProvider);
      if (provider && (await provider.isAvailable())) {
        return provider;
      }
    }

    // Try default provider
    if (this.defaultProvider !== "auto") {
      const provider = this.get(this.defaultProvider);
      if (provider && (await provider.isAvailable())) {
        return provider;
      }
    }

    // Auto-select from available
    return this.autoSelect();
  }
}
