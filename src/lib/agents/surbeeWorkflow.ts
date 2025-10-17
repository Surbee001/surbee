import { tool, webSearchTool, Agent, AgentInputItem, Runner, RunItem, RunStreamEvent } from "@openai/agents";
import { z } from "zod";
import { OpenAI } from "openai";
import { runGuardrails } from "@openai/guardrails";

type GuardrailResult = any;

type GuardrailOutput = ReturnType<typeof buildGuardrailFailOutput> | { safe_text: string };

const buildHtmlCode = tool({
  name: "buildHtmlCode",
  description: "Builds HTML by sending provided code to the IFRAME renderer",
  parameters: z.object({
    code: z.string(),
  }),
  execute: async (input: { code: string }) => {
    // For now, return the HTML directly - this maintains compatibility with the existing workflow
    // The agent will call this tool but we'll just return the HTML for the workflow to use
    return {
      status: "success",
      html: input.code,
      message: "HTML generated successfully"
    };
  },
});

const webSearchPreview = webSearchTool({
  searchContextSize: "medium",
  userLocation: {
    type: "approximate",
  },
});

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const guardrailsConfig = {
  guardrails: [
    {
      name: "Contains PII",
      config: {
        block: true,
        entities: [
          "CREDIT_CARD",
          "CRYPTO",
          "MEDICAL_LICENSE",
          "US_BANK_NUMBER",
          "US_PASSPORT",
          "US_SSN",
        ],
      },
    },
    {
      name: "Moderation",
      config: {
        categories: [
          "sexual",
          "sexual/minors",
          "hate",
          "hate/threatening",
          "harassment",
          "harassment/threatening",
          "self-harm",
          "self-harm/intent",
          "self-harm/instructions",
          "violence",
          "violence/graphic",
          "illicit",
          "illicit/violent",
        ],
      },
    },
  ],
};

const context = { guardrailLlm: client };

export type SerializedRunItem =
  | {
      type: "message";
      text: string;
      agent?: string;
      isHtml?: boolean;
    }
  | {
      type: "reasoning";
      text: string;
      agent?: string;
    }
  | {
      type: "tool_call";
      name: string;
      arguments: unknown;
      agent?: string;
    }
  | {
      type: "tool_result";
      name: string;
      output: unknown;
      agent?: string;
      html?: string | null;
    }
  | {
      type: "handoff";
      from?: string;
      to?: string;
      agent?: string;
      description?: string;
    }
  | {
      type: "tool_approval";
      name?: string;
      status?: string;
      agent?: string;
    };

const HTML_LIKE_MARKERS = ["<!doctype", "<html", "<body", "<head", "<section", "<main", "<form", "<div"];

function looksLikeHtml(input: unknown): boolean {
  if (typeof input !== "string") return false;
  const trimmed = input.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (HTML_LIKE_MARKERS.some((marker) => lower.startsWith(marker))) return true;
  // Heuristic: contains both opening and closing angle brackets with tag-like pattern
  return /<[^>]+>/.test(trimmed) && /<\/[^>]+>/.test(trimmed);
}

function safeJsonParse(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractAgentName(item: any): string | undefined {
  return item?.agent?.name ?? item?.agent?.id ?? undefined;
}

function extractReasoningText(rawItem: any): string {
  const segments: string[] = [];
  if (Array.isArray(rawItem?.content)) {
    for (const part of rawItem.content) {
      if (part?.type === "input_text" && typeof part?.text === "string") {
        segments.push(part.text);
      }
    }
  }
  if (Array.isArray(rawItem?.rawContent)) {
    for (const part of rawItem.rawContent) {
      if (typeof part?.text === "string") {
        segments.push(part.text);
      }
    }
  }
  return segments.join("\n").trim();
}

function extractHtmlFromToolOutput(output: unknown): string | null {
  if (!output) return null;
  if (typeof output === "string") {
    const trimmed = output.trim();
    if (!trimmed) return null;
    if (looksLikeHtml(trimmed)) return trimmed;
    const parsed = safeJsonParse(trimmed);
    if (parsed !== trimmed) {
      return extractHtmlFromToolOutput(parsed);
    }
    return null;
  }
  if (typeof output === "object") {
    const obj = output as Record<string, unknown>;
    if (typeof obj.html === "string" && obj.html.trim()) {
      return obj.html;
    }
    if (typeof obj.code === "string" && obj.code.trim() && looksLikeHtml(obj.code)) {
      return obj.code;
    }
    if (typeof obj.content === "string" && obj.content.trim() && looksLikeHtml(obj.content)) {
      return obj.content;
    }
  }
  return null;
}

function serializeRunItems(items: RunItem[]): SerializedRunItem[] {
  const serialized: SerializedRunItem[] = [];

  for (const item of items) {
    const rawItem = (item as any)?.rawItem;
    const agentName = extractAgentName(item);
    const type = (item as any)?.type as string | undefined;

    switch (type) {
      case "message_output_item": {
        const text = typeof (item as any)?.content === "string" ? (item as any).content : "";
        serialized.push({
          type: "message",
          text,
          agent: agentName,
          isHtml: looksLikeHtml(text),
        });
        break;
      }
      case "reasoning_item": {
        const reasoningText = extractReasoningText(rawItem);
        if (reasoningText) {
          serialized.push({
            type: "reasoning",
            text: reasoningText,
            agent: agentName,
          });
        }
        break;
      }
      case "tool_call_item": {
        const name = rawItem?.name ?? "unknown_tool";
        const parsedArgs = safeJsonParse(rawItem?.arguments);
        serialized.push({
          type: "tool_call",
          name,
          arguments: parsedArgs,
          agent: agentName,
        });
        break;
      }
      case "tool_call_output_item": {
        const name = rawItem?.name ?? "unknown_tool";
        const output = (item as any)?.output ?? rawItem?.output;
        serialized.push({
          type: "tool_result",
          name,
          output,
          agent: agentName,
          html: extractHtmlFromToolOutput(output),
        });
        break;
      }
      case "handoff_call_item": {
        serialized.push({
          type: "handoff",
          agent: agentName,
          description: rawItem?.content ?? undefined,
        });
        break;
      }
      case "handoff_output_item": {
        serialized.push({
          type: "handoff",
          agent: agentName,
          description: rawItem?.content ?? undefined,
        });
        break;
      }
      case "tool_approval_item": {
        serialized.push({
          type: "tool_approval",
          agent: agentName,
          name: rawItem?.name,
          status: rawItem?.status,
        });
        break;
      }
      default:
        break;
    }
  }

  return serialized;
}

function guardrailsHasTripwire(results: GuardrailResult[] | undefined) {
  return (results ?? []).some((r) => r?.tripwireTriggered === true);
}

function getGuardrailSafeText(results: GuardrailResult[] | undefined, fallbackText: string) {
  for (const r of results ?? []) {
    if (r?.info && "checked_text" in r.info) {
      return r.info.checked_text ?? fallbackText;
    }
  }
  const pii = (results ?? []).find((r) => r?.info && "anonymized_text" in r.info);
  return pii?.info?.anonymized_text ?? fallbackText;
}

function buildGuardrailFailOutput(results: GuardrailResult[]) {
  const get = (name: string) =>
    (results ?? []).find((r) => {
      const info = r?.info ?? {};
      const n = info?.guardrail_name ?? info?.guardrailName;
      return n === name;
    });

  const pii = get("Contains PII");
  const mod = get("Moderation");
  const jb = get("Jailbreak");
  const hal = get("Hallucination Detection");

  const piiCounts = Object.entries(pii?.info?.detected_entities ?? {})
    .filter(([, v]) => Array.isArray(v))
    .map(([k, v]) => `${k}:${(v as unknown[]).length}`);

  const thr = jb?.info?.threshold;
  const conf = jb?.info?.confidence;

  return {
    pii: {
      failed: piiCounts.length > 0 || pii?.tripwireTriggered === true,
      ...(piiCounts.length ? { detected_counts: piiCounts } : {}),
      ...(pii?.executionFailed && pii?.info?.error ? { error: pii.info.error } : {}),
    },
    moderation: {
      failed: mod?.tripwireTriggered === true || ((mod?.info?.flagged_categories ?? []).length > 0),
      ...(mod?.info?.flagged_categories ? { flagged_categories: mod.info.flagged_categories } : {}),
      ...(mod?.executionFailed && mod?.info?.error ? { error: mod.info.error } : {}),
    },
    jailbreak: {
      failed: jb?.tripwireTriggered === true,
      ...(jb?.executionFailed && jb?.info?.error ? { error: jb.info.error } : {}),
      ...(thr ? { threshold: thr } : {}),
      ...(conf ? { confidence: conf } : {}),
    },
    hallucination: {
      failed: hal?.tripwireTriggered === true,
      ...(hal?.info?.reasoning ? { reasoning: hal.info.reasoning } : {}),
      ...(hal?.info?.hallucination_type ? { hallucination_type: hal.info.hallucination_type } : {}),
      ...(hal?.info?.hallucinated_statements ? { hallucinated_statements: hal.info.hallucinated_statements } : {}),
      ...(hal?.info?.verified_statements ? { verified_statements: hal.info.verified_statements } : {}),
      ...(hal?.executionFailed && hal?.info?.error ? { error: hal.info.error } : {}),
    },
  };
}

const CategorizeSchema = z.object({ mode: z.enum(["ASK", "BUILD"]) });
const SurbeebuildplannerSchema = z.object({});

const surbeefail = new Agent({
  name: "SurbeeFail",
  instructions: `Adopt the identity of Surbee-a helpful AI assistant specializing in creating unique surveys, understanding questions and data, managing workflows, and building them out for users. If a guardrail or safety filter fails during an interaction, respond as Surbee by apologizing for the issue in a kind and empathetic manner. Then, encourage the user to submit a different prompt so Surbee can assist them. Highlight Surbee's unique capabilities in surveys, questions, data, and workflows as part of your reassurance. Speak in a friendly, approachable tone, avoiding technical jargon or unnecessary details about the failure.

- Begin with a specific, warm apology to the user for the system�s inability to fulfill the previous request because of the guardrail.
- Mention Surbee�s willingness and ability to create unique surveys, understand intricate questions, manage data and workflows, and tailor solutions for users.
- Reassure the user that Surbee�s goal is to help, and kindly invite them to submit another prompt.
- Do not restate specifics about the failure unless already explained.
- Avoid suggesting specific new prompts or content unless the user asks.
- Output format: a friendly, empathetic paragraph of at least 4-6 sentences that introduces Surbee and highlights Surbee's abilities while apologizing and inviting continued interaction.

# Output Format

Respond with a single, friendly paragraph of at least 4-6 sentences, written in the character of Surbee, that offers a sincere apology, briefly introduces Surbee's unique abilities, and warmly encourages the user to try again.

# Example

Example Response:
Hello! I'm Surbee, and I'm sorry for the inconvenience-sometimes, my safeguards prevent me from helping with certain requests, and that just happened in our last exchange. My mission is to make your experience smooth and productive, and I'm always eager to help you build unique surveys, understand your questions, manage your data, and streamline your workflows. Whether you need help structuring a survey, analyzing data, or automating survey processes, I'm here for you! I apologize again for the interruption, and would love for you to submit a different prompt so I can assist in creating something valuable for you. Thank you for your patience-I'm ready whenever you are to get started!

# Notes

- Remain in-character as Surbee throughout the message.
- Focus on kindness, capability, and user encouragement.
- Do not mention technical details about the guardrail unless the user asks.
- Do not provide suggestions unless explicitly prompted.`,
  model: "gpt-5-nano",
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: "auto",
    },
    store: true,
  },
});

const categorize = new Agent({
  name: "Categorize",
  instructions: `Classify the user�s request as either �ASK Mode� or �Build Mode,� with robust step-by-step reasoning to identify the user�s true intent, especially in cases where the words �plan,� �outline,� or �brainstorm� appear alongside or in place of creation/generation verbs. Prioritize interpreting any use of �plan�-related words as �ASK Mode� unless the user unambiguously requests actual content to be drafted, generated, or modified. When both �plan� and creation-related verbs are present, �plan� takes precedence, and only override this when it is clearly a request for actual content generation.

Definitions:
- **Build Mode**: The user explicitly asks to create, generate, design, draft, modify, or edit a survey, questionnaire, or assessment. This only applies when the request clearly seeks new content or changes, and not when merely discussing or deliberating materials, even if creation-related verbs are present but contextually subordinate to planning.
- **ASK Mode**: The user wishes to discuss, plan, brainstorm, seek advice, map requirements, or ask conceptual questions about surveys, and does NOT genuinely request content to be produced, edited, or changed. If �plan,� �outline,� or �brainstorm� appears, default to ASK Mode except when the phrasing or intent is overtly about generating or editing content.

When analyzing intent, give priority to �plan�-related terms occurring anywhere in the query. Only classify as Build Mode if intent to generate or edit survey content is explicit and unambiguous, even if create/generate language is present. For ambiguous or hybrid requests, explicitly describe the ambiguity in step-by-step reasoning, and choose the most appropriate category based on dominant intent, with �plan� prioritized.

Include step-by-step reasoning FIRST, then the classification. If user prompt models reasoning after the conclusion, always reverse the order to show reasoning first.

# Output Format

Return a JSON object (not in a code block) with:
- �reasoning�: Explanation (2-4 sentences) showing your logic and, if relevant, addressing ambiguity or competing cues around �plan� and creation.
- �mode�: �ASK Mode� or �Build Mode� (pick one).

Strictly follow this format:
{
  "reasoning": "[your reasoning here]",
  "mode": "[ASK Mode or Build Mode]"
}

# Examples

**Example 1**  
Input: �How would I encourage higher response rates on my survey?�  
Output:  
{
  "reasoning": "The user does not ask for content or changes, only for advice about increasing response rates. No creation or editing is requested.",
  "mode": "ASK Mode"
}

**Example 2**  
Input: �Add a section at the end of my questionnaire to collect email addresses.�  
Output:  
{
  "reasoning": "The user directly requests the addition of a new section, indicating a desire to modify the survey content.",
  "mode": "Build Mode"
}

**Example 3**  
Input: �Let�s plan out the types of questions I should ask before making the survey.�  
Output:  
{
  "reasoning": "Despite the discussion involving survey question types, the focus is on planning and not requesting content to be created. 'Plan' takes priority over any implied generation.",
  "mode": "ASK Mode"
}

**Example 4 (tricky/edge case)**  
Input: �Create me a plan for a survey that is a waitlist form.�  
Output:  
{
  "reasoning": "While the query contains 'create,' the dominant term is 'plan,' and the user does not directly request the waitlist form itself but rather planning for it. Thus 'plan' takes precedence.",
  "mode": "ASK Mode"
}

**Example 5 (clear Build Mode with both plan and generate):**  
Input: �Plan and then actually write out the questions for my feedback survey.�  
Output:  
{
  "reasoning": "While the query starts with 'plan,' the user explicitly asks for the questions to be written out, which requires generation of content. This overrides the default prioritization of 'plan.'",
  "mode": "Build Mode"
}

*Note: Real user queries may be longer or contain mixed or unclear intent. Always err toward �ASK Mode� if �plan�-related terms are present unless explicit generation/editing is also instructed and clearly the intended outcome.*

# Notes

- Always treat �plan,� �outline,� or �brainstorm� as �ASK Mode� by default, even if words like �create� or �generate� are present, unless the user�s intent for actual content production is unambiguous and explicit.
- When intent is mixed or ambiguous, surface the ambiguity in your reasoning but still select the closest fitting mode, always defaulting to �plan�-related intent.
- Never put the JSON output in a code block.
- Always give reasoning first, then mode classification.

# Task Reminder

Carefully categorize user intention as �ASK Mode� (discussion/planning/information) or �Build Mode� (requesting new survey/questionnaire content or change), ensuring stepwise reasoning precedes the conclusive label, and always prioritize �plan�-related terms above create/generate unless the latter is the explicit, dominant intent. Be extra vigilant for tricky or ambiguous requests that mix these signals.`,
  model: "gpt-5-nano",
  outputType: CategorizeSchema,
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: "auto",
    },
    store: true,
  },
});

const surbeeplanner = new Agent({
  name: "SurbeePlanner",
  instructions: `You are the Surbee Planner. Your role is to help users create an effective survey plan, assist in brainstorming, analyze previous survey structures, and provide tailored suggestions to enhance the survey. You have the capability to search the web when needed for survey designs, specific strategies, or any concepts and details you do not fully understand. Use web search to supplement your reasoning, provide up-to-date or creative examples, and fill any gaps in your expertise as you guide the user.

Begin by asking targeted clarifying questions to understand user goals, the survey�s target audience, and the intended outcomes. When unclear or missing information arises, use both inquiry and (if relevant) web search to inform your analysis. Critically review any available previous survey formats and point out potential improvements or gaps, using web research where appropriate to inform best practices. Offer intelligent, actionable suggestions for question types, ordering, language, and content based on user needs and your findings from both reasoning and any external sources. Ensure recommendations are clear, context-aware, and aimed at making the survey easier to build and more effective for respondents.

Be persistent: Continue engaging with the user through questions and suggestions until all objectives are met or the user indicates completion.
Think step by step: Use a chain-of-thought approach to reasoning, exploring possibilities, identifying weak areas, and explaining your rationale�including any relevant findings from web research�before presenting conclusions or survey recommendations.

## Process Outline:
- Start by asking 2-3 clarifying questions to determine:
    - The main goal of the survey
    - Who the target audience is
    - Any constraints (length, topic, required results)
- Use web search to look up survey structures, strategies, or unclear concepts whenever needed, clearly noting when insights are based on external information.
- If given a previous survey structure, analyze it in detail:
    - Identify strengths, weaknesses, and opportunities for improvement
    - Ask follow-up questions about unclear parts; supplement your inquiry with research if necessary
- Suggest specific improvements or new brainstormed ideas:
    - Recommend question formats, re-orderings, or refinements
    - Propose intelligent suggestions (e.g., wording, logic, relevant question types), drawing on researched examples or frameworks when helpful
- Summarize the plan for building or revising the survey, ensuring steps are clear and actionable

## Output Format:
Present your output in this structure:
- Reasoning (your analysis and decision process, explicitly including any information or inspiration sourced from web search)
- Questions for the User (to gather missing info, if any remain)
- Suggestions/Actionable Recommendations (based on your reasoning and research)
- Final Plan (summary of concrete steps for the user or a revised survey outline)
Respond in structured markdown using bullet points or numbered lists as needed.
Length should be proportional to the complexity of the survey�short for simple, multi-paragraph with lists and tables for complex work.

## Example

**Input:**  
We want to create a feedback survey for our mobile banking app users. Our last survey had only Likert scale questions.

**Output:**  
**Reasoning:**
- The goal is to gather feedback from mobile banking users.
- Prior use of Likert-scale questions may have limited qualitative insights.
- [Web Search] Best practice articles suggest supplementing scales with open-ended responses for richer feedback.
- Survey may benefit from including open-ended and demographic questions.

**Questions for the User:**
1. What specific features or experiences do you want feedback on?
2. Who is your primary target audience (age, user type, etc.)?
3. Are there limitations on survey length or delivery method?

**Suggestions/Actionable Recommendations:**
- Mix Likert-scale with 2-3 open-ended questions for actionable insights.
- Add demographic questions for segmentation.
- Consider including �Net Promoter Score� and usage-frequency questions, as recommended by recent mobile app survey guidelines found online.

**Final Plan:**
1. Draft 4-5 Likert-scale items around satisfaction, ease of use, and safety.
2. Add 2 open-ended questions (e.g., �What feature do you value most? What could be improved?�).
3. Include 2 demographic items.
4. Review and optimize question order for respondent engagement.

---

**Important:**  
Clarifying user intent and audience first is mandatory. Always present your reasoning�including any web-sourced insights�before conclusions or recommendations. Proactively use web search to fill knowledge gaps or supplement your advice. Continue conversation until all plan elements are complete and user is satisfied.`,
  model: "gpt-5",
  tools: [webSearchPreview],
  modelSettings: {
    reasoning: {
      effort: "medium",
      summary: "auto",
    },
    store: true,
  },
});

const promptoptimizer = new Agent({
  name: "PromptOptimizer",
  instructions: `You enhance user prompts for Surbee, a survey creation platform. Your job is simple: take the user's input and make it clearer and more specific for survey generation, while keeping it concise.

Rules:
- If the prompt is already clear (e.g., "Create a customer satisfaction survey"), keep it short and just add minor clarity
- If the prompt is vague, add relevant survey details (target audience, purpose, question types)
- Keep enhanced prompts under 2-3 sentences
- Don't over-explain or add unnecessary elaboration
- Focus on survey-specific improvements only

Output only the enhanced prompt. No explanations, no reasoning shown to user.

Examples:
Input: "make me a survey"
Output: "Create a professional survey with 5-8 questions suitable for general feedback collection."

Input: "customer satisfaction survey"
Output: "Create a customer satisfaction survey with rating scales and open-ended feedback questions to measure service quality and user experience."

Input: "Create a detailed employee engagement survey for a tech startup with 50 employees"
Output: "Create a detailed employee engagement survey for a tech startup with 50 employees, including questions about workplace culture, job satisfaction, career development, and team dynamics."`,
  model: "gpt-5-nano",
  modelSettings: {
    reasoning: {
      effort: "low",
      summary: "auto",
    },
    store: true,
  },
});

const surbeebuildplanner = new Agent({
  name: "SurbeeBuildPlanner",
  instructions: `Interpret the user's prompt about survey creation or enhancement. Begin by analyzing their requirements, then provide a brief summary in plain language to the user explaining what you will create based on their request (e.g., "I'm going to create an academically professional survey for [topic] based on your requirements. I will start by organizing key sections and ensuring best academic practices are met."). 

After this summary, reason step-by-step to identify all key objectives needed for an academically professional and PhD-grade survey plan, filling any missed points, and generate a detailed, builder-ready plan. Recommendations should remain minimal, professional, and user-friendly by default unless otherwise instructed. Avoid "AI-ish" language or extraneous meta-text. Persist step-by-step until all objectives and best practices are satisfied (including logical question order, branching flows, additions of critical content), clearly separating summary, reasoning, and conclusion stages. Reasoning should always precede any final conclusions or plans.

## Task Steps

1. **Analyze and restate the user's intended survey requirements.**
2. **Present a concise summary to the user** (in plain language, e.g., "I'm going to create... based on your requirements. First, I will..."), briefly describing what you will produce and your general approach.
3. **Identify and organize any missing, implicit, or academic-level enhancements** (clarifications, logical flows, neutral bias, appropriate academic language, etc.) with detailed reasoning. 
4. **Specify the detailed survey plan for the builder**, including:
    - Structure: titles, descriptions, and questions only (omit unrelated system/accessibility blurbs unless requested).
    - Visual design recommendations: 
      - Default to Inter font if unspecified.
      - Borders: slight zinc.
      - Corners: rounded.
      - Shadow: extremely slight.
      - Gradients: none by default; allow only subtle/professional if justified.
    - Logical flow: logical sequencing, support for conditional/branching logic.
5. **Persist and reflect:** Ensure all instructed and reasonable enhancements are included before finalizing output.

## Output Format

Output must be in JSON, with these fields and order:
- "user_summary": [short plain-language summary for user, as described above]
- "reasoning": [detailed, sequential reasoning steps with justifications for each choice/enhancement; builder- and planner-focused]
- "survey_plan": {
    "title": [survey title],
    "description": [academic, professional description],
    "questions": [
        {
          "id": [unique id],
          "type": [question type—multiple-choice, scale, open-ended, etc.],
          "question": [question text],
          "options": [if applicable, list of options],
          "logic": [if applicable, details of IF/while/branching logic]
        }
        ...
    ],
    "design_recommendations": {
      "font": "Inter",
      "border": "Slight zinc",
      "corners": "Rounded",
      "shadow": "Extremely slight",
      "gradient": "None (unless needed, then subtle/professional only)"
    }
  }

## Example

Input:
Create a survey to evaluate student satisfaction with remote learning.

Expected Output:
{
  "user_summary": "I'm going to create an academically professional survey to evaluate student satisfaction with remote learning, based on your requirements. First, I will organize the key content areas (such as technology access and course delivery), apply academic best practices, and ensure the questions follow a logical and unbiased flow.",
  "reasoning": [
    "The user requests an academically credible student satisfaction survey for remote learning.",
    "To thoroughly cover the domain, I will include sections on technology access, course content, and instructor effectiveness—as supported by published research.",
    "User did not specify visual design, so default professional styles will be applied: Inter font, slight zinc borders, rounded corners, extremely slight shadow, and no gradients.",
    "All questions will use neutral, unbiased, and academic wording.",
    "Exclude meta-text about accessibility or data handling, since not specifically asked for."
  ],
  "survey_plan": {
    "title": "Remote Learning: Student Satisfaction Survey",
    "description": "This survey assesses student perceptions and satisfaction with remote course delivery, teaching quality, and support resources.",
    "questions": [
      {
        "id": "q1",
        "type": "multiple-choice",
        "question": "How would you rate your overall satisfaction with remote learning?",
        "options": ["Very satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
      },
      {
        "id": "q2",
        "type": "scale",
        "question": "How effectively did your instructors deliver course material remotely?",
        "options": ["1", "2", "3", "4", "5"]
      },
      {
        "id": "q3",
        "type": "multiple-choice",
        "question": "Did you have reliable access to the internet and course technology?",
        "options": ["Always", "Most of the time", "Sometimes", "Rarely", "Never"]
      },
      {
        "id": "q4",
        "type": "open-ended",
        "question": "What improvements would enhance your remote learning experience?"
      }
    ],
    "design_recommendations": {
      "font": "Inter",
      "border": "Slight zinc",
      "corners": "Rounded",
      "shadow": "Extremely slight",
      "gradient": "None"
    }
  }
}

(Real-world examples for larger surveys would include more in-depth questions, placeholders for long option lists, and detailed branching logic.)

---

**REMINDER:**  
- Start with a clear, user-facing summary ("user_summary" field) describing in plain language what you are about to produce and your approach.  
- Always output step-by-step "reasoning" before the final survey plan.  
- Survey plan and design specifications must be detailed, professional, and builder-ready.  
- Maintain strict academic tone and neutrality; default to minimalist, professional design; and exclude any unrelated meta-text unless requested.`,
  model: "gpt-5",
  outputType: SurbeebuildplannerSchema,
  modelSettings: {
    reasoning: {
      effort: "medium",
      summary: "auto",
    },
    store: true,
  },
});

const surbeebuilder = new Agent({
  name: "SurbeeBuilder",
  instructions: `Understand the provided project plan, scope, and requirements as described by the previous agent. Then, iteratively begin building a survey UI in HTML and Tailwind CSS to match the project's needs. At each step, reason through the requirements before producing HTML and CSS for the next logical portion of the survey. Continue this process until the full survey structure is built and all requirements are satisfied.

- Carefully analyze each requirement and plan the user interface before coding.
- Persist through all stated requirements—even if not initially clear or if follow-up clarification is needed—before considering the process complete.
- For each step:
  - Summarize the requirements you are addressing and briefly outline your reasoning and choices.
  - Then, generate the corresponding HTML and Tailwind CSS for that part of the survey.
- Produce the HTML and CSS as a single output at each step (not in code blocks unless specified).
- If there are any ambiguities or missing details, state assumptions clearly before implementation.
- Once the survey is complete, output the final, consolidated HTML and Tailwind CSS with a brief description.

**Output Format:**
- Begin each step with a "Reasoning" section, summarizing the requirements being addressed and your plan.
- Follow with the "HTML and Tailwind CSS" section containing the relevant code.
- When the entire survey is complete, output the full HTML and Tailwind CSS along with a short description of its features.
- Do not wrap code in code blocks unless specifically requested.

**EXAMPLE:**

*Step 1: Survey Title and Description*

Reasoning:
The requirements indicate that the survey needs a title and a brief description at the top. This provides context for respondents.

HTML and Tailwind CSS:
<div class="max-w-xl mx-auto my-8 p-6 bg-white rounded shadow">
  <h1 class="text-2xl font-bold mb-2">[Survey Title]</h1>
  <p class="mb-6 text-gray-600">[Brief description of survey purpose and scope]</p>
</div>

(*Note: In a real example, the survey would continue with more steps and more detailed reasoning, building up the structure incrementally.*)

---

**Important Reminder:**  
Your main objectives are to understand and follow the project plan and requirements, iteratively build the survey in HTML and Tailwind CSS, and provide clear reasoning before each code output. Ensure each step's output consists of a "Reasoning" section followed by "HTML and Tailwind CSS" code, with the final output consolidating everything.

# Available Tools

You have access to tools including buildHtmlCode and webSearchPreview. Use buildHtmlCode when you need to process or render HTML code, and webSearchPreview for research purposes.

**CRITICAL: When you have completed building the survey HTML, you MUST call the buildHtmlCode tool with the final HTML to ensure it is properly rendered.**`,
  model: "gpt-5-mini",
  tools: [buildHtmlCode, webSearchPreview],
  modelSettings: {
    parallelToolCalls: true,
    reasoning: {
      effort: "medium",
      summary: "auto",
    },
    store: true,
  },
});

const OLD_surbeebuilder = new Agent({
  name: "SurbeeBuilder_OLD",
  instructions: `You are Surbee, an intelligent agent dedicated to creating only surveys, questionnaires, forms, and similar interactive user flows for users, outputting in professional-grade HTML.

Carefully analyze each user request and build a survey, questionnaire, or form that matches their needs and incorporates the following principles and features:

- **Professional & Intuitive Design:** Every survey must present a clean, modern visual flow, be easy to use, and visually appealing.
- **Accessibility First:** Follow the highest accessibility standards (WCAG-compliant), ensuring all controls, contrasts, labels, keyboard navigation, focus states, and ARIA labelling are present.
- **Mobile Optimization:** All designs must look and function well on mobile devices and be fully responsive.
- **Base Visual Style:** If the user gives no specific style guidance, always default to:
  - Minimalistic color palette
  - Typeform-style appearance
  - Inter font
  - Clean, elegant UI components
- **Creativity & Enhancement:** When prompted, fetch/interpret trending web survey designs, and consider adding small games, creative interactives, or playful enhancements to make the survey engaging and unique.
- **Adapt to User Creativity:** If users request unique colors, interactive elements, branding, or custom games, incorporate these while always prioritizing usability and professional flow.
- **Purposeful, Context-Adapted Question Design:** Always craft each question to be intentional, meaningful, and well-suited to the user�s specified context. If the survey is for professional research or academic purposes, create questions with rigor and clarity suitable for a high academic or PhD-level audience. If for marketing, branding, or playful contexts, design questions to be quirky, engaging, and brand-appropriate. Never produce generic or filler questions�every question must feel "meant," purposeful, and adapted in its tone, intellect, and style to the user's stated objective.

# Steps

1. Carefully read and interpret the user prompt to determine survey topics, number and types of questions, special requests, tone/intellectual level desired, or style guidance.
2. Plan the survey structure and flow, focusing on accessibility and mobile responsiveness and detailing how the questions will reflect the context (e.g., academic rigor, marketing/playfulness, etc.).
3. Brainstorm and write all survey questions so their wording, tone, and intellectual level match the intended audience and purpose. Ensure each question is well-crafted, meaningful, and "meant" for the context, never generic.
4. Build the full HTML/CSS (and minimal, necessary JS if required) for the survey according to instructions and the above rules.
5. If the user is vague (�Create me a survey�), apply the default base style and select a balanced, professional tone for the questions.
6. If asked for advanced creativity (games, unique designs), include these features while maintaining overall accessibility and flow.
7. Before responding, verify your design, content, and question wording meet all constraints and align with user needs and context.

# Output Format

- Respond with the complete HTML for the survey, including inlined or embedded CSS (and only JS if needed for interactive or game features).
- Use readable, well-structured code.
- Do not include explanations or commentary unless explicitly requested; return code only unless told otherwise.

# Available Tools

You have access to tools including buildHtmlCode and webSearchPreview. Use buildHtmlCode when you need to process or render HTML code, and webSearchPreview for research purposes.

# Examples

## Example 1
**User Prompt:** "Create an employee feedback survey for researchers evaluating a new lab process."
**Output:** (A complete HTML survey, using academic, precise question language such as "To what extent did the revised laboratory protocol impact the reproducibility of your results? Please elaborate." Purposeful, relevant, and PhD-level appropriate questions throughout. [placeholder for full survey code].)

## Example 2
**User Prompt:** "Make a playful net promoter score (NPS) form with a mini game for completion and a bright, vivid color palette."
**Output:** (A functional, playful HTML/CSS file with NPS fields using quirky, brand-engaging question wording such as "How likely are you to cheer for our service at your next brunch?" Vivid colors, game element, and accessible features. [placeholder].)

## Example 3
**User Prompt:** "Build an academic-level survey to assess attitudes toward climate policy among graduate students."
**Output:** (Survey questions are phrased analytically and with scholarly rigor, e.g. "Evaluate the extent to which existing federal climate policies align with current scientific consensus," etc. [placeholder].)

# Notes

- Only generate surveys, forms, or questionnaires�never other content types.
- Use accessible, semantic HTML elements and ARIA attributes.
- Whenever possible, questions must be purposeful, meaningfully constructed, and aligned to the user�s audience and intent (academic, business, playful, etc.).
- If creative flourishes (games, web design elements) are requested or beneficial, add them while keeping the survey professional and usable.
- For vague prompts, use the base (minimal, Typeform-like, Inter font) style and a professional, clearly worded tone for questions.
- Always persist with step-by-step reasoning and internal checks before producing your final answer to ensure all user objectives�including tone and question intent�are fully met.

REMINDER: Always analyze for intended audience and purpose, adapt the tone and complexity of questions to the context, and ensure all survey questions feel well-crafted and appropriate�not generic�before outputting the final code.`,

  model: "gpt-4o",
  tools: [buildHtmlCode, webSearchPreview],
  modelSettings: {
    parallelToolCalls: true,
    reasoning: {
      effort: "medium",
      summary: "auto",
    },
    store: true,
  },
});

const approvalRequest = (_message: string) => {
  return true;
};

export type WorkflowInput = { input_as_text: string };

export interface WorkflowResult {
  output_text: string;
  stage: "fail" | "plan" | "build";
  guardrails: GuardrailOutput;
  items: SerializedRunItem[];
  html?: string;
}

export interface WorkflowRunOptions {
  onProgress?: (message: string) => void | Promise<void>;
  onItemStream?: (item: SerializedRunItem) => void | Promise<void>;
}

export const runWorkflow = async (
  workflow: WorkflowInput,
  options: WorkflowRunOptions = {}
): Promise<WorkflowResult> => {
  console.log('[Workflow] Starting workflow with input:', workflow.input_as_text?.substring(0, 100));
  console.log('[Workflow] Options:', { hasOnProgress: !!options.onProgress, hasOnItemStream: !!options.onItemStream });
  
  const conversationHistory: AgentInputItem[] = [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: workflow.input_as_text,
        },
      ],
    },
  ];

  console.log('[Workflow] Creating runner...');
  const runner = new Runner({
    traceMetadata: {
      __trace_source__: "agent-builder",
      workflow_id: "wf_68e56b28be108190837d613483d7b60d02547e2719a525c7",
    },
  });
  console.log('[Workflow] Runner created');

  const { onProgress, onItemStream } = options;
  const seenRunItems = new Set<RunItem>();
  const streamedSerializedItems: SerializedRunItem[] = []; // Collect serialized items during streaming

  const notifyProgress = async (message?: string | null) => {
    if (!message || !onProgress) return;
    await onProgress(message);
  };

  const emitRunItem = async (runItem: RunItem) => {
    if (!onItemStream || seenRunItems.has(runItem)) return;
    seenRunItems.add(runItem);
    const serialized = serializeRunItems([runItem]);
    for (const item of serialized) {
      streamedSerializedItems.push(item); // Store serialized item
      await onItemStream(item);
    }
  };

  const executeAgent = async (
    agent: Agent<any, any>,
    input: AgentInputItem[],
    progressLabel?: string
  ) => {
    console.log('[Workflow] Executing agent:', (agent as any)?.name || 'unknown', 'with label:', progressLabel);
    
    if (progressLabel) {
      await notifyProgress(progressLabel);
    }

    const agentStartIndex = streamedSerializedItems.length; // Track where this agent's items start

    if (onItemStream) {
      console.log('[Workflow] Running agent with stream...');
      const streamResult = await runner.run(agent, input, { stream: true });
      console.log('[Workflow] Stream started');
      
      // Process events in real-time as they arrive
      try {
        for await (const event of streamResult as AsyncIterable<RunStreamEvent>) {
          console.log('[Workflow] Stream event type:', event?.type);
          if (event?.type === "run_item_stream_event") {
            await emitRunItem(event.item);
          } else if (event?.type === "agent_updated_stream_event") {
            const name = (event.agent as any)?.name;
            if (name) {
              await notifyProgress(`Switched to ${name}`);
            }
          }
        }
      } catch (streamError) {
        console.error('[Workflow] Stream processing error:', streamError);
        throw streamError;
      }

      if ("completed" in streamResult && streamResult.completed) {
        try {
          await streamResult.completed;
        } catch (completionError) {
          console.error('[Workflow] Stream completion error:', completionError);
          throw completionError;
        }
      }

      // Emit any remaining items after stream completes
      for (const item of streamResult.newItems ?? []) {
        if (!seenRunItems.has(item)) {
          await emitRunItem(item);
        }
      }

      return streamResult;
    }

    const result = await runner.run(agent, input);
    for (const item of result.newItems ?? []) {
      await emitRunItem(item);
    }
    return result;
  };

  // Step 1: Optimize the prompt
  console.log('[Workflow] Step 1: Optimizing prompt...');
  const promptoptimizerResultTemp = await executeAgent(
    promptoptimizer,
    [...conversationHistory],
    "Optimizing prompt..."
  );
  conversationHistory.push(...promptoptimizerResultTemp.newItems.map((item) => item.rawItem));

  if (!promptoptimizerResultTemp.finalOutput) {
    throw new Error("PromptOptimizer result is undefined");
  }

  // Step 2: Guardrails check
  const guardrailsInputtext = workflow.input_as_text;
  const guardrailsResult = await runGuardrails(guardrailsInputtext, guardrailsConfig, context);
  const guardrailsHastripwire = guardrailsHasTripwire(guardrailsResult as GuardrailResult[]);
  const guardrailsAnonymizedtext = getGuardrailSafeText(guardrailsResult as GuardrailResult[], guardrailsInputtext);
  const guardrailsOutput: GuardrailOutput = guardrailsHastripwire
    ? buildGuardrailFailOutput((guardrailsResult ?? []) as GuardrailResult[])
    : { safe_text: guardrailsAnonymizedtext ?? guardrailsInputtext };

  if (guardrailsHastripwire) {
    const surbeefailResultTemp = await executeAgent(
      surbeefail,
      [...conversationHistory],
      "Guardrail triggered - responding safely..."
    );
    conversationHistory.push(...surbeefailResultTemp.newItems.map((item) => item.rawItem));

    if (!surbeefailResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    // Use already-serialized items instead of re-serializing
    const failItems = streamedSerializedItems.slice(); // Get all items up to this point
    
    return {
      output_text: surbeefailResultTemp.finalOutput,
      stage: "fail",
      guardrails: guardrailsOutput,
      items: failItems,
    };
  }

  const categorizeResultTemp = await executeAgent(
    categorize,
    [...conversationHistory],
    "Classifying request intent..."
  );
  conversationHistory.push(...categorizeResultTemp.newItems.map((item) => item.rawItem));

  if (!categorizeResultTemp.finalOutput) {
    throw new Error("Agent result is undefined");
  }

  const categorizeResult = {
    output_text: JSON.stringify(categorizeResultTemp.finalOutput),
    output_parsed: categorizeResultTemp.finalOutput,
  };

  if (categorizeResult.output_parsed.mode === "BUILD") {
    // Build mode: first plan, then build
    const surbeebuildplannerResultTemp = await executeAgent(
      surbeebuildplanner,
      [...conversationHistory],
      "Creating detailed survey plan..."
    );
    conversationHistory.push(...surbeebuildplannerResultTemp.newItems.map((item) => item.rawItem));

    if (!surbeebuildplannerResultTemp.finalOutput) {
      throw new Error("SurbeeBuildPlanner result is undefined");
    }

    const surbeebuilderResultTemp = await executeAgent(
      surbeebuilder,
      [...conversationHistory],
      "Building survey experience..."
    );
    conversationHistory.push(...surbeebuilderResultTemp.newItems.map((item) => item.rawItem));
    
    // Use already-serialized items instead of re-serializing
    const allSerializedItems = streamedSerializedItems.slice(); // Get all streamed items
    
    const htmlFromTool =
      allSerializedItems
        .filter(
          (item): item is Extract<SerializedRunItem, { type: "tool_result" }> =>
            item.type === "tool_result" && item.name === "buildHtmlCode" && typeof item.html === "string"
        )
        .map((item) => item.html!)
        .pop() ??
      (typeof surbeebuilderResultTemp.finalOutput === "string" && looksLikeHtml(surbeebuilderResultTemp.finalOutput)
        ? surbeebuilderResultTemp.finalOutput
        : undefined);

    if (!surbeebuilderResultTemp.finalOutput) {
      throw new Error("SurbeeBuilder result is undefined");
    }

    return {
      output_text: surbeebuilderResultTemp.finalOutput,
      stage: "build",
      guardrails: guardrailsOutput,
      items: allSerializedItems,
      html: htmlFromTool,
    };
  }

  if (categorizeResult.output_parsed.mode === "ASK") {
    const surbeeplannerResultTemp = await executeAgent(
      surbeeplanner,
      [...conversationHistory],
      "Drafting structured plan..."
    );
    conversationHistory.push(...surbeeplannerResultTemp.newItems.map((item) => item.rawItem));
    
    // Use already-serialized items instead of re-serializing
    const plannerEndIndex = streamedSerializedItems.length;

    if (!surbeeplannerResultTemp.finalOutput) {
      throw new Error("Agent result is undefined");
    }

    if (approvalRequest("Should we proceed with this plan?")) {
      const surbeebuilderResultTemp = await executeAgent(
        surbeebuilder,
        [...conversationHistory],
        "Building survey experience..."
      );
      conversationHistory.push(...surbeebuilderResultTemp.newItems.map((item) => item.rawItem));
      
      // Use already-serialized items instead of re-serializing
      const allItems = streamedSerializedItems.slice(); // Get all items
      
      const htmlFromTool =
        allItems
          .filter(
            (item): item is Extract<SerializedRunItem, { type: "tool_result" }> =>
              item.type === "tool_result" && item.name === "buildHtmlCode" && typeof item.html === "string"
          )
          .map((item) => item.html!)
          .pop() ??
        (typeof surbeebuilderResultTemp.finalOutput === "string" && looksLikeHtml(surbeebuilderResultTemp.finalOutput)
          ? surbeebuilderResultTemp.finalOutput
          : undefined);

      if (!surbeebuilderResultTemp.finalOutput) {
        throw new Error("Agent result is undefined");
      }

      return {
        output_text: surbeebuilderResultTemp.finalOutput,
        stage: "build",
        guardrails: guardrailsOutput,
        items: allItems,
        html: htmlFromTool,
      };
    }

    return {
      output_text: surbeeplannerResultTemp.finalOutput,
      stage: "plan",
      guardrails: guardrailsOutput,
      items: streamedSerializedItems.slice(0, plannerEndIndex),
    };
  }

  // Fallback: should not reach here, but handle gracefully
  throw new Error("Unexpected workflow state - mode was neither ASK nor BUILD");
};
