/**
 * OpenAI provider implementation
 * Supports GPT-5 with reasoning and GPT-4o models
 */

import OpenAI from "openai";
import {
  BaseProvider,
  ProviderMessage,
  GenerationOptions,
  GenerationResponse,
  ProviderConfig,
} from "./base";

export class OpenAIProvider extends BaseProvider {
  readonly name = "openai";
  readonly models = ["gpt-5", "gpt-4o", "gpt-4o-mini"];

  private client: OpenAI;
  private defaultModel: string;

  constructor(config: ProviderConfig) {
    super(config);

    if (!config.apiKey) {
      throw new Error("OpenAI API key is required");
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      organization: config.organization,
      timeout: config.timeout || 60000,
    });

    this.defaultModel = config.defaultModel || "gpt-5";
  }

  async isAvailable(): Promise<boolean> {
    try {
      // Test with a minimal request
      await this.client.models.list();
      return true;
    } catch (error) {
      console.error("OpenAI provider not available:", error);
      return false;
    }
  }

  async generateText(
    messages: ProviderMessage[],
    options?: GenerationOptions
  ): Promise<GenerationResponse<string>> {
    const model = this.defaultModel;

    try {
      // Use new responses API for GPT-5 if available
      if (model === "gpt-5" && options?.reasoningEffort) {
        const response = await this.client.responses.create({
          model: "gpt-5",
          reasoning: {
            effort: options.reasoningEffort === "high" ? "high" : "low"
          },
          input: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          text: {
            verbosity: options.reasoningEffort === "high" ? "high" : "low"
          },
        } as any);

        const content = this.safeOutputText(response);

        return {
          content,
          model,
          provider: this.name,
          usage: {
            promptTokens: 0,
            completionTokens: 0,
            totalTokens: 0,
          },
        };
      }

      // Standard chat completions for other models
      const response = await this.client.chat.completions.create({
        model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      });

      const content = response.choices[0]?.message?.content || "";

      return {
        content,
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
        `OpenAI generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async generateJSON<T = any>(
    messages: ProviderMessage[],
    jsonSchema: any,
    schemaName: string,
    options?: GenerationOptions
  ): Promise<GenerationResponse<T>> {
    const model = this.defaultModel;

    try {
      // Use new responses API for GPT-5 with JSON schema
      if (model === "gpt-5") {
        const response = await this.client.responses.create({
          model: "gpt-5",
          reasoning: {
            effort: options?.reasoningEffort === "high" ? "high" : "low"
          },
          input: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          text: {
            format: {
              type: "json_schema",
              name: schemaName,
              schema: jsonSchema,
              strict: true,
            },
            verbosity: options?.reasoningEffort === "high" ? "high" : "low",
          },
        } as any);

        const outputText = this.safeOutputText(response);
        const content = this.parseJsonOutput<T>(outputText);

        return {
          content,
          model,
          provider: this.name,
        };
      }

      // Standard chat completions with JSON mode
      const response = await this.client.chat.completions.create({
        model,
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        response_format: { type: "json_object" },
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens,
      });

      const outputText = response.choices[0]?.message?.content || "{}";
      const content = this.parseJsonOutput<T>(outputText);

      return {
        content,
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
        `OpenAI JSON generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  estimateCost(tokens: number): number {
    // Rough cost estimates (adjust based on actual pricing)
    const costPerMillionTokens = {
      "gpt-5": 10.0,
      "gpt-4o": 5.0,
      "gpt-4o-mini": 0.15,
    };

    const cost = costPerMillionTokens[this.defaultModel as keyof typeof costPerMillionTokens] || 5.0;
    return (tokens / 1_000_000) * cost;
  }
}
