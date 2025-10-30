/**
 * Function tools for programmatic survey building
 * Helper functions and builders for creating surveys without AI
 */

import {
  SurveySpec,
  SurveyPage,
  QuestionBlock,
  ContentBlock,
  BranchRule,
  ThemeSpec,
} from "./types/schemas";

/**
 * Survey builder class for programmatic survey creation
 */
export class SurveyBuilder {
  private spec: Partial<SurveySpec> = {
    version: "1.0",
    pages: [],
  };

  constructor(title?: string) {
    if (title) {
      this.spec.title = title;
    }
  }

  /**
   * Set survey title
   */
  title(title: string): this {
    this.spec.title = title;
    return this;
  }

  /**
   * Add a page to the survey
   */
  addPage(id: string, blocks: Array<QuestionBlock | ContentBlock>, title?: string): this {
    const page: SurveyPage = {
      id,
      blocks,
      ...(title && { title }),
    };

    if (!this.spec.pages) {
      this.spec.pages = [];
    }

    this.spec.pages.push(page);
    return this;
  }

  /**
   * Add a branch rule
   */
  addBranchRule(
    questionId: string,
    condition: { equals?: string; in?: string[] },
    gotoPageId: string
  ): this {
    const rule: BranchRule = {
      when: {
        questionId,
        equals: condition.equals || "",
        in: condition.in || [],
      },
      gotoPageId,
    };

    if (!this.spec.logic) {
      this.spec.logic = [];
    }

    this.spec.logic.push(rule);
    return this;
  }

  /**
   * Set theme
   */
  theme(theme: ThemeSpec): this {
    this.spec.theme = theme;
    return this;
  }

  /**
   * Build the survey spec
   */
  build(): SurveySpec {
    if (!this.spec.title) {
      throw new Error("Survey title is required");
    }

    if (!this.spec.pages || this.spec.pages.length === 0) {
      throw new Error("Survey must have at least one page");
    }

    return this.spec as SurveySpec;
  }
}

/**
 * Question builder helpers
 */
export const question = {
  /**
   * Create a text input question
   */
  text(id: string, label: string, options: { required?: boolean; helpText?: string } = {}): QuestionBlock {
    return {
      kind: "question",
      id,
      label,
      type: "text",
      options: [],
      required: options.required ?? false,
      helpText: options.helpText || "",
      analyticsTags: [],
    };
  },

  /**
   * Create a long text question
   */
  longText(id: string, label: string, options: { required?: boolean; helpText?: string } = {}): QuestionBlock {
    return {
      kind: "question",
      id,
      label,
      type: "long_text",
      options: [],
      required: options.required ?? false,
      helpText: options.helpText || "",
      analyticsTags: [],
    };
  },

  /**
   * Create a single select question
   */
  singleSelect(
    id: string,
    label: string,
    options: string[],
    config: { required?: boolean; helpText?: string } = {}
  ): QuestionBlock {
    return {
      kind: "question",
      id,
      label,
      type: "single_select",
      options,
      required: config.required ?? false,
      helpText: config.helpText || "",
      analyticsTags: [],
    };
  },

  /**
   * Create a multi select question
   */
  multiSelect(
    id: string,
    label: string,
    options: string[],
    config: { required?: boolean; helpText?: string } = {}
  ): QuestionBlock {
    return {
      kind: "question",
      id,
      label,
      type: "multi_select",
      options,
      required: config.required ?? false,
      helpText: config.helpText || "",
      analyticsTags: [],
    };
  },

  /**
   * Create a rating question
   */
  rating(
    id: string,
    label: string,
    config: { scale?: number; required?: boolean; helpText?: string } = {}
  ): QuestionBlock {
    const scale = config.scale || 5;
    const options = Array.from({ length: scale }, (_, i) => (i + 1).toString());

    return {
      kind: "question",
      id,
      label,
      type: "rating",
      options,
      required: config.required ?? false,
      helpText: config.helpText || "",
      analyticsTags: [],
    };
  },

  /**
   * Create an NPS question
   */
  nps(id: string, label: string, config: { required?: boolean; helpText?: string } = {}): QuestionBlock {
    return {
      kind: "question",
      id,
      label,
      type: "nps",
      options: Array.from({ length: 11 }, (_, i) => i.toString()),
      required: config.required ?? false,
      helpText: config.helpText || "",
      analyticsTags: [],
    };
  },

  /**
   * Create an email question
   */
  email(id: string, label: string, options: { required?: boolean; helpText?: string } = {}): QuestionBlock {
    return {
      kind: "question",
      id,
      label,
      type: "email",
      options: [],
      required: options.required ?? false,
      helpText: options.helpText || "",
      analyticsTags: [],
    };
  },

  /**
   * Create a phone question
   */
  phone(id: string, label: string, options: { required?: boolean; helpText?: string } = {}): QuestionBlock {
    return {
      kind: "question",
      id,
      label,
      type: "phone",
      options: [],
      required: options.required ?? false,
      helpText: options.helpText || "",
      analyticsTags: [],
    };
  },

  /**
   * Create a date question
   */
  date(id: string, label: string, options: { required?: boolean; helpText?: string } = {}): QuestionBlock {
    return {
      kind: "question",
      id,
      label,
      type: "date",
      options: [],
      required: options.required ?? false,
      helpText: options.helpText || "",
      analyticsTags: [],
    };
  },
};

/**
 * Content block helper
 */
export function content(id: string, html: string): ContentBlock {
  return {
    kind: "content",
    id,
    html,
  };
}

/**
 * Create a survey builder
 */
export function createSurvey(title?: string): SurveyBuilder {
  return new SurveyBuilder(title);
}

/**
 * Predefined themes
 */
export const themes = {
  modern: {
    layout: "cardless-typeform" as const,
    accent: "#2563eb",
    font: "Inter, system-ui, sans-serif",
    bg: "#ffffff",
  },
  dark: {
    layout: "full-bleed" as const,
    accent: "#3b82f6",
    font: "Inter, system-ui, sans-serif",
    bg: "#0f172a",
  },
  minimal: {
    layout: "cardless-typeform" as const,
    accent: "#000000",
    font: "Helvetica, Arial, sans-serif",
    bg: "#ffffff",
  },
  colorful: {
    layout: "full-bleed" as const,
    accent: "#8b5cf6",
    font: "Poppins, sans-serif",
    bg: "#fef3c7",
  },
};

/**
 * Validation helper
 */
export function validateSurvey(spec: SurveySpec): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!spec.title || spec.title.trim().length === 0) {
    errors.push("Survey title is required");
  }

  if (!spec.pages || spec.pages.length === 0) {
    errors.push("Survey must have at least one page");
  }

  spec.pages?.forEach((page, i) => {
    if (!page.id || page.id.trim().length === 0) {
      errors.push(`Page ${i + 1} must have an ID`);
    }

    if (!page.blocks || page.blocks.length === 0) {
      errors.push(`Page ${page.id} must have at least one block`);
    }

    page.blocks?.forEach((block, j) => {
      if (!block.id || block.id.trim().length === 0) {
        errors.push(`Block ${j + 1} in page ${page.id} must have an ID`);
      }

      if (block.kind === "question") {
        const q = block as QuestionBlock;
        if (!q.label || q.label.trim().length === 0) {
          errors.push(`Question ${q.id} must have a label`);
        }
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
