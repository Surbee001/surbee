/**
 * Survey generation orchestrator
 * Coordinates AI providers to generate survey components
 */

import { AIProvider, ProviderMessage } from "../providers/base";
import { SURVEY_GENERATOR_PROMPT, buildCustomPrompt } from "../prompts";
import {
  GenerateOptions,
  GenerateResult,
  SurveySpec,
  BuildArtifact,
} from "../types";

export class SurveyOrchestrator {
  constructor(private provider: AIProvider) {}

  /**
   * Generate a complete survey component
   */
  async generate(
    prompt: string,
    options: GenerateOptions = {}
  ): Promise<GenerateResult> {
    const startTime = Date.now();

    // Determine output format
    const format = options.format || "tsx_component";
    const reasoningEffort = options.reasoningEffort || "high";

    console.log(`[orchestrator] Generating ${format} survey with ${this.provider.name}...`);

    // Build custom system prompt based on options
    const systemPrompt = this.buildSystemPrompt(format, options);

    // Create messages
    const messages: ProviderMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];

    let code: string;
    let reasoning: string[] | undefined;

    if (format === "tsx_component" || format === "react_component") {
      // Generate React component code
      const result = await this.generateComponent(messages, format, reasoningEffort);
      code = result.code;
      reasoning = result.reasoning;
    } else {
      // Generate JSON config
      const result = await this.generateConfig(messages, reasoningEffort);
      code = result.code;
      reasoning = result.reasoning;
    }

    const generationTime = Date.now() - startTime;

    console.log(`[orchestrator] Generation completed in ${generationTime}ms`);

    return {
      code,
      format,
      reasoning,
      metadata: {
        model: this.provider.models[0],
        provider: this.provider.name,
        generationTime,
      },
    };
  }

  /**
   * Generate React component code
   */
  private async generateComponent(
    messages: ProviderMessage[],
    format: "tsx_component" | "react_component",
    reasoningEffort: string
  ): Promise<{ code: string; reasoning?: string[] }> {
    const isTypeScript = format === "tsx_component";

    // Add format instruction to prompt
    messages[0].content += `\n\nGENERATE A ${isTypeScript ? "TYPESCRIPT" : "JAVASCRIPT"} REACT COMPONENT.`;

    const response = await this.provider.generateText(messages, {
      reasoningEffort: reasoningEffort as "low" | "medium" | "high",
      temperature: 0.7,
      maxTokens: 4000,
    });

    // Extract code from response
    let code = response.content;

    // Try to extract code from markdown blocks
    const codeBlockMatch = code.match(/```(?:typescript|tsx|javascript|jsx)?\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      code = codeBlockMatch[1];
    }

    return {
      code: code.trim(),
      reasoning: response.reasoning,
    };
  }

  /**
   * Generate JSON config
   */
  private async generateConfig(
    messages: ProviderMessage[],
    reasoningEffort: string
  ): Promise<{ code: string; reasoning?: string[] }> {
    // Define JSON schema for survey spec
    const surveySpecSchema = {
      type: "object",
      required: ["title", "version", "pages"],
      properties: {
        title: { type: "string" },
        version: { type: "string" },
        pages: {
          type: "array",
          items: {
            type: "object",
            required: ["id", "blocks"],
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              blocks: { type: "array" },
            },
          },
        },
      },
    };

    const response = await this.provider.generateJSON<SurveySpec>(
      messages,
      surveySpecSchema,
      "SurveySpec",
      {
        reasoningEffort: reasoningEffort as "low" | "medium" | "high",
        temperature: 0.7,
      }
    );

    return {
      code: JSON.stringify(response.content, null, 2),
      reasoning: response.reasoning,
    };
  }

  /**
   * Build system prompt based on options
   */
  private buildSystemPrompt(format: string, options: GenerateOptions): string {
    if (format === "json_config") {
      return `You are a senior survey strategist. Generate a complete survey specification as JSON.
Include all questions, options, validation rules, and logical flow.
Output valid SurveySpec JSON matching the schema.`;
    }

    return buildCustomPrompt({
      format,
      framework: options.framework,
      componentLibrary: options.componentLibrary,
    });
  }

  /**
   * Validate generated code
   */
  async validate(code: string, format: string): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (format === "json_config") {
      // Validate JSON
      try {
        JSON.parse(code);
      } catch (error) {
        errors.push(`Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    } else {
      // Basic validation for React components
      if (!code.includes("export")) {
        errors.push("Component must have an export statement");
      }

      if (format === "tsx_component" && !code.includes("React")) {
        errors.push("TypeScript React component should import React");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
