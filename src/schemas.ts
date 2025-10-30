export type SurveyBrief = {
  goal: string;
  audience: string[];
  constraints: string[];
  tone: "academic" | "casual" | "professional";
  success_criteria: string[];
};

export type RetrievedItem = {
  id: string;
  title: string;
  content: string;
  meta?: any;
  score: number;
};

export type RAGContext = {
  items: RetrievedItem[];
  queryUsed: string;
};

export type QuestionBlock = {
  kind: "question";
  id: string;
  label: string;
  type:
    | "text"
    | "long_text"
    | "single_select"
    | "multi_select"
    | "rating"
    | "nps"
    | "email"
    | "phone"
    | "date";
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

export type BuildArtifact = {
  format: "json_config" | "tsx_component" | "patch";
  content: string;
  diagnostics: string[];
};

export type BuildResponse = {
  url: string;
  artifacts: {
    spec: SurveySpec;
    artifact: BuildArtifact;
  };
  summary: string[];
};

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

export const SurveySpecSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "version", "pages"],
  properties: {
    title: { type: "string", minLength: 1 },
    version: { type: "string", minLength: 1 },
    pages: {
      type: "array",
      minItems: 1,
      items: { $ref: "#/$defs/page" }
    }
  },
  $defs: {
    page: {
      type: "object",
      additionalProperties: false,
      required: ["id", "blocks"],
      properties: {
        id: { type: "string", minLength: 1 },
        blocks: {
          type: "array",
          minItems: 1,
          items: { $ref: "#/$defs/block" }
        }
      }
    },
    block: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "id"],
      properties: {
        kind: {
          type: "string",
          enum: ["question", "content"]
        },
        id: { type: "string", minLength: 1 }
      }
    },
    questionBlock: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "id", "label", "type", "options", "required", "helpText", "analyticsTags"],
      properties: {
        kind: { type: "string", const: "question" },
        id: { type: "string", minLength: 1 },
        label: { type: "string", minLength: 1 },
        type: {
          type: "string",
          enum: [
            "text",
            "long_text",
            "single_select",
            "multi_select",
            "rating",
            "nps",
            "email",
            "phone",
            "date"
          ]
        },
        options: {
          type: "array",
          items: { type: "string", minLength: 1 }
        },
        required: { type: "boolean" },
        helpText: { type: "string" },
        analyticsTags: {
          type: "array",
          items: { type: "string", minLength: 1 }
        }
      }
    },
    contentBlock: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "id", "html"],
      properties: {
        kind: { type: "string", const: "content" },
        id: { type: "string", minLength: 1 },
        html: { type: "string" }
      }
    },
    branchRule: {
      type: "object",
      additionalProperties: false,
      required: ["when", "gotoPageId"],
      properties: {
        when: {
          type: "object",
          additionalProperties: false,
          required: ["questionId", "equals", "in"],
          properties: {
            questionId: { type: "string", minLength: 1 },
            equals: { type: "string" },
            in: {
              type: "array",
              items: { type: "string", minLength: 1 },
              minItems: 1
            }
          }
        },
        gotoPageId: { type: "string", minLength: 1 }
      }
    },
    theme: {
      type: "object",
      additionalProperties: false,
      required: ["layout", "accent", "font", "bg"],
      properties: {
        layout: {
          type: "string",
          enum: ["full-bleed", "cardless-typeform"]
        },
        accent: { type: "string" },
        font: { type: "string" },
        bg: { type: "string" }
      }
    }
  }
} as const;

export const BuildArtifactSchema = {
  type: "object",
  additionalProperties: false,
  required: ["format", "content", "diagnostics"],
  properties: {
    format: {
      type: "string",
      enum: ["json_config", "tsx_component", "patch"]
    },
    content: { type: "string" },
    diagnostics: {
      type: "array",
      items: { type: "string" }
    }
  }
} as const;
