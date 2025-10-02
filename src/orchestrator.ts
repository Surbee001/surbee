import { gpt5FastJSON, gpt5ReasonJSON, gpt5FastText } from "./models";
import {
  SYSTEM_PLANNER,
  SYSTEM_DECIDER,
  SYSTEM_CRITIC,
  SYSTEM_BUILDER,
  SYSTEM_SUMMARIZER
} from "./prompts";
import {
  search_kb,
  validate_spec,
  generate_code,
  renderer_apply,
  save_runlog
} from "./tools";
import {
  SurveyBrief,
  SurveySpec,
  BuildArtifact,
  BuildResponse,
  SurveyBriefSchema,
  SurveySpecSchema,
  BuildArtifactSchema
} from "./schemas";

export async function buildSurvey(userMessage: string): Promise<BuildResponse> {
  console.log("[orchestrator] Starting DIRECT HTML buildSurvey with message:", userMessage);
  const runlog: any[] = [];

  // Step 1: Generate complete HTML survey directly with planning
  console.log("[orchestrator] Step 1: Generating complete HTML survey with AI planning...");
  const htmlResponse = await gpt5ReasonJSON<{html: string}>(
    "SurveyHTML",
    `You are an expert survey designer and front-end developer with 15+ years of experience creating beautiful, engaging surveys. Your task is to analyze the user's request, plan the optimal survey structure, and generate a complete HTML survey.

PLANNING PHASE - Think through these steps:
1. UNDERSTAND THE REQUEST: What type of survey is needed? Who is the target audience?
2. DETERMINE STRUCTURE: How many questions? What question types are most appropriate?
3. PLAN FLOW: What's the logical progression of questions?
4. DESIGN CHOICES: What visual style and branding will work best?
5. TECHNICAL IMPLEMENTATION: How to structure the HTML for best UX?

THEN GENERATE COMPLETE HTML WITH:

QUALITY STANDARDS:
- Modern, professional design with dark theme
- Smooth animations and micro-interactions
- Mobile-responsive design
- Accessible form controls with proper labels
- Engaging question wording and clear instructions
- Logical question flow (3-8 questions typically)
- Variety of question types based on data collection needs
- Professional color scheme and typography
- Real form functionality with proper validation

QUESTION TYPES TO USE:
- Text inputs for names, feedback, etc.
- Textareas for detailed responses
- Radio buttons for single-choice questions (4-6 options)
- Checkboxes for multi-select questions
- Range sliders for ratings/satisfaction (1-5 or 1-10)
- Select dropdowns for categories
- Email/phone inputs when appropriate

DESIGN REQUIREMENTS:
- Dark theme (#0f172a background, white text)
- Modern card-based layout with rounded corners
- Accent color: #2563eb (blue)
- Professional typography (Inter font)
- Proper spacing and visual hierarchy
- Hover effects and smooth transitions
- Submit button with loading state
- Progress indicator if multi-page

TECHNICAL REQUIREMENTS:
- Complete HTML document with <!DOCTYPE html>
- Embedded CSS in <style> tags
- Embedded JavaScript for interactivity
- Form validation and submission handling
- Responsive design for all screen sizes
- Proper semantic HTML structure

Generate a complete, professional survey that looks modern and engaging. Include actual form functionality with JavaScript.

Respond with JSON: {"html": "your complete HTML document here"}`,
    { userMessage },
    {
      type: "object",
      additionalProperties: false,
      required: ["html"],
      properties: {
        html: { type: "string" }
      }
    }
  );

  const htmlContent = htmlResponse.html;

  console.log("[orchestrator] HTML survey generated, length:", htmlContent.length);
  runlog.push({ htmlContent });

  // Create a simple spec for compatibility
  const simpleSpec: SurveySpec = {
    title: "AI Generated Survey",
    version: "1.0",
    pages: [{ id: "main", blocks: [] }]
  };

  // Create artifact with the HTML content
  const artifact: BuildArtifact = {
    format: "json_config",
    content: htmlContent,
    diagnostics: ["Generated complete HTML survey directly from AI"]
  };

  // Step 2: Apply the HTML directly
  console.log("[orchestrator] Step 2: Applying HTML directly...");
  const applied = await renderer_apply(artifact);
  console.log("[orchestrator] HTML applied:", applied);
  runlog.push({ applied });

  if (!applied.ok) {
    throw new Error("Renderer failed to apply HTML");
  }

  // Step 3: Generate summary
  console.log("[orchestrator] Step 3: Generating summary...");
  const [summaryBullets] = await Promise.all([
    gpt5FastText(
      SYSTEM_SUMMARIZER,
      { htmlContent, url: applied.url }
    ),
    save_runlog(runlog)
  ]);

  const summary = summaryBullets
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5);

  console.log("[orchestrator] DIRECT HTML pipeline completed!");

  return {
    url: applied.url,
    artifacts: { spec: simpleSpec, artifact },
    summary
  };
}

function makeRagQuery(brief: SurveyBrief): string {
  const segments = [
    brief.goal,
    brief.audience.join(", "),
    brief.tone,
    brief.constraints.join("; ")
  ];
  return segments.filter((segment) => segment && segment.length > 0).join(" | ");
}
