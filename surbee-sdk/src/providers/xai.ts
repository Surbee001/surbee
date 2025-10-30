/**
 * xAI provider implementation
 * Supports Grok models with reasoning capabilities
 */

import OpenAI from "openai";
import {
  BaseProvider,
  ProviderMessage,
  GenerationOptions,
  GenerationResponse,
  ProviderConfig,
} from "./base";

export class XAIProvider extends BaseProvider {
  readonly name = "xai";
  readonly models = ["grok-4-fast-reasoning", "grok-beta", "grok-2"];

  private client: OpenAI;
  private defaultModel: string;

  constructor(config: ProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error("xAI API key is required");
    }

    // xAI uses OpenAI-compatible API
    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl || "https://api.x.ai/v1",
      timeout: config.timeout || 60000,
    });

    this.defaultModel = config.defaultModel || "grok-4-fast-reasoning";
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test with a minimal request
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error("xAI provider not available:", error);
      return false;
    }
  }

  async generateText(
    messages: ProviderMessage[],
    options?: GenerationOptions
  ): Promise<GenerationResponse<string>> {
    const model = this.defaultModel;

    try {
      const response = await this.client.chat.completions.create({
        model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
        stream: false,
      });

      const content = response.choices[0]?.message?.content || "";

      // Grok may include reasoning in the response
      let reasoning: string[] | undefined;
      if (model.includes("reasoning")) {
        // Try to extract reasoning if present
        const reasoningMatch = content.match(/<thinking>([\s\S]*?)<\/thinking>/);
        if (reasoningMatch) {
          reasoning = [reasoningMatch[1].trim()];
        }
      }

      return {
        content: reasoning ? content.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim() : content,
        reasoning,
        model: response.model,
        provider: this.name,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      throw new Error(
        `xAI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateJSON<T = any>(
    messages: ProviderMessage[],
    _jsonSchema: any,
    _schemaName: string,
    options?: GenerationOptions
  ): Promise<GenerationResponse<T>> {
    const model = this.defaultModel;

    try {
      // Add explicit JSON instruction to system message
      const enhancedMessages = [...messages];
      enhancedMessages[0] = {
        ...enhancedMessages[0],
        content: `${enhancedMessages[0].content}\n\nRespond with valid JSON only, matching the provided schema exactly.`,
      };

      const response = await this.client.chat.completions.create({
        model,
        messages: enhancedMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        response_format: { type: "json_object" },
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      });

      const outputText = response.choices[0]?.message?.content || "{}";

      // Extract reasoning if present
      let reasoning: string[] | undefined;
      if (model.includes("reasoning")) {
        const reasoningMatch = outputText.match(/<thinking>([\s\S]*?)<\/thinking>/);
        if (reasoningMatch) {
          reasoning = [reasoningMatch[1].trim()];
        }
      }

      const cleanText = reasoning
        ? outputText.replace(/<thinking>[\s\S]*?<\/thinking>/, "").trim()
        : outputText;

      const content = this.parseJsonOutput<T>(cleanText);

      return {
        content,
        reasoning,
        model: response.model,
        provider: this.name,
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      throw new Error(
        `xAI JSON generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  estimateCost(tokens: number): number {
    // Rough cost estimates for Grok models
    const costPerMillionTokens = {
      "grok-4-fast-reasoning": 5.0,
      "grok-beta": 3.0,
      "grok-2": 2.0,
    };

    const cost = costPerMillionTokens[this.defaultModel as keyof typeof costPerMillionTokens] || 3.0;
    return (tokens / 1_000_000) * cost;
  }
}
