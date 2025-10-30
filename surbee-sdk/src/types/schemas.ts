/**
 * Core type definitions for Surbee SDK
 * Defines survey structure, questions, and generation artifacts
 */

export type SurveyBrief = {
  goal: string;
  audience: string[];
  constraints: string[];
  tone: "academic" | "casual" | "professional";
  success_criteria: string[];
};

export type QuestionType =
  | "text"
  | "long_text"
  | "single_select"
  | "multi_select"
  | "rating"
  | "nps"
  | "email"
  | "phone"
  | "date";

export type QuestionBlock = {
  kind: "question";
  id: string;
  label: string;
  type: QuestionType;
  options: string[];
  required: boolean;
  helpText: string;
  analyticsTags: string[];
};

export type ContentBlock = {
  kind: "content";
  id: string;
  html: string;
};

export type BranchRule = {
  when: {
    questionId: string;
    equals: string;
    in: string[];
  };
  gotoPageId: string;
};

export type ThemeSpec = {
  layout: "full-bleed" | "cardless-typeform";
  accent: string;
  font: string;
  bg: string;
};

export type SurveyPage = {
  id: string;
  title?: string;
  blocks: Array<QuestionBlock | ContentBlock>;
};

export type SurveySpec = {
  title: string;
  version: string;
  pages: SurveyPage[];
  logic?: BranchRule[];
  theme?: ThemeSpec;
  validationMatrix?: Record<string, string[]>;
};

export type BuildFormat = "json_config" | "tsx_component" | "react_component";

export type BuildArtifact = {
  format: BuildFormat;
  content: string;
  diagnostics: string[];
};

export type GenerateOptions = {
  /**
   * Output format for the survey
   * - tsx_component: TypeScript React component
   * - react_component: JavaScript React component
   * - json_config: JSON configuration
   */
  format?: BuildFormat;

  /**
   * AI provider to use (auto-selects if not specified)
   */
  provider?: "auto" | "gpt-5" | "gpt-4o" | "grok" | "claude";

  /**
   * Enable streaming for real-time generation updates
   */
  streaming?: boolean;

  /**
   * Reasoning effort level (high provides better quality)
   */
  reasoningEffort?: "low" | "medium" | "high";

  /**
   * Target framework for React components
   */
  framework?: "react" | "next" | "remix";

  /**
   * Language for generated code
   */
  language?: "typescript" | "javascript";

  /**
   * Include component library integrations
   */
  componentLibrary?: "shadcn" | "mui" | "chakra" | "none";
};

export type GenerateResult = {
  /**
   * Generated code (TypeScript React component or JSON config)
   */
  code: string;

  /**
   * Output format
   */
  format: BuildFormat;

  /**
   * AI reasoning steps (if available)
   */
  reasoning?: string[];

  /**
   * Generation metadata
   */
  metadata: {
    model: string;
    provider: string;
    tokensUsed?: number;
    generationTime: number;
    cost?: number;
  };

  /**
   * Survey specification (structured data)
   */
  spec?: SurveySpec;

  /**
   * Stream for real-time updates (if streaming enabled)
   */
  stream?: ReadableStream<Uint8Array>;
};

// JSON Schemas for validation
export const SurveyBriefSchema = {
  type: "object",
  additionalProperties: false,
  required: ["goal", "audience", "constraints", "tone", "success_criteria"],
  properties: {
    goal: { type: "string", minLength: 1 },
    audience: {
      type: "array",
      items: { type: "string", minLength: 1 },
      minItems: 1
    },
    constraints: {
      type: "array",
      items: { type: "string", minLength: 1 },
      minItems: 0
    },
    tone: {
      type: "string",
      enum: ["academic", "casual", "professional"]
    },
    success_criteria: {
      type: "array",
      items: { type: "string", minLength: 1 },
      minItems: 1
    }
  }
} as const;
