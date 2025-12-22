import { z } from 'zod';

// Evaluation modes
export const EvaluationModeSchema = z.enum([
  'human_like',
  'edge_case',
  'stress_test',
  'custom',
  'all'
]);
export type EvaluationMode = z.infer<typeof EvaluationModeSchema>;

// Suggestion categories
export const SuggestionCategorySchema = z.enum([
  'ux',
  'clarity',
  'logic',
  'accessibility',
  'bias',
  'technical',
  'validation'
]);
export type SuggestionCategory = z.infer<typeof SuggestionCategorySchema>;

// Severity levels
export const SeveritySchema = z.enum(['critical', 'high', 'medium', 'low']);
export type Severity = z.infer<typeof SeveritySchema>;

// Evaluation status
export const EvaluationStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed'
]);
export type EvaluationStatus = z.infer<typeof EvaluationStatusSchema>;

// Suggestion status
export const SuggestionStatusSchema = z.enum([
  'pending',
  'applied',
  'dismissed',
  'failed'
]);
export type SuggestionStatus = z.infer<typeof SuggestionStatusSchema>;

// Issue found during evaluation
export const EvaluationIssueSchema = z.object({
  id: z.string(),
  questionId: z.string().optional(),
  type: SuggestionCategorySchema,
  severity: SeveritySchema,
  description: z.string(),
  context: z.string().optional(),
});
export type EvaluationIssue = z.infer<typeof EvaluationIssueSchema>;

// Agent's answer to a question
export const AgentAnswerSchema = z.object({
  questionId: z.string(),
  questionText: z.string(),
  questionType: z.string(),
  answer: z.any(),
  reasoning: z.string(),
  timeSpent: z.number(), // simulated seconds
  issues: z.array(EvaluationIssueSchema).default([]),
  observations: z.array(z.string()).default([]),
});
export type AgentAnswer = z.infer<typeof AgentAnswerSchema>;

// Suggested code change
export const SuggestedChangeSchema = z.object({
  filePath: z.string(),
  changeType: z.enum(['edit', 'add', 'delete']),
  searchPattern: z.string().optional(),
  replaceWith: z.string().optional(),
  lineStart: z.number().optional(),
  lineEnd: z.number().optional(),
  newContent: z.string().optional(),
  description: z.string(),
});
export type SuggestedChange = z.infer<typeof SuggestedChangeSchema>;

// Evaluation suggestion
export const EvaluationSuggestionSchema = z.object({
  id: z.string(),
  evaluationRunId: z.string(),
  projectId: z.string(),
  category: SuggestionCategorySchema,
  severity: SeveritySchema,
  title: z.string(),
  description: z.string(),
  reasoning: z.string().optional(),
  questionId: z.string().optional(),
  suggestedChanges: z.array(SuggestedChangeSchema).optional(),
  status: SuggestionStatusSchema,
  appliedAt: z.string().optional(),
  appliedBy: z.string().optional(),
  createdAt: z.string(),
});
export type EvaluationSuggestion = z.infer<typeof EvaluationSuggestionSchema>;

// Evaluation run
export const EvaluationRunSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  userId: z.string(),
  mode: EvaluationModeSchema,
  modelUsed: z.string(),
  customCriteria: z.string().optional(),
  includeResponseData: z.boolean().default(false),
  status: EvaluationStatusSchema,
  overallScore: z.number().min(0).max(100).optional(),
  agentResponses: z.array(AgentAnswerSchema).default([]),
  issuesFound: z.array(EvaluationIssueSchema).default([]),
  reasoning: z.string().optional(),
  errorMessage: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  createdAt: z.string(),
});
export type EvaluationRun = z.infer<typeof EvaluationRunSchema>;

// Request schemas
export const StartEvaluationRequestSchema = z.object({
  userId: z.string(),
  mode: EvaluationModeSchema,
  model: z.string(),
  customCriteria: z.string().optional(),
  includeResponseData: z.boolean().default(false),
});
export type StartEvaluationRequest = z.infer<typeof StartEvaluationRequestSchema>;

export const ApplySuggestionRequestSchema = z.object({
  userId: z.string(),
  suggestionId: z.string(),
});
export type ApplySuggestionRequest = z.infer<typeof ApplySuggestionRequestSchema>;

// SSE Event types
export const EvaluationEventSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('status'),
    status: EvaluationStatusSchema,
    message: z.string().optional(),
  }),
  z.object({
    type: z.literal('progress'),
    current: z.number(),
    total: z.number(),
    questionId: z.string().optional(),
  }),
  z.object({
    type: z.literal('answer'),
    answer: AgentAnswerSchema,
  }),
  z.object({
    type: z.literal('issue'),
    issue: EvaluationIssueSchema,
  }),
  z.object({
    type: z.literal('suggestion'),
    suggestion: EvaluationSuggestionSchema,
  }),
  z.object({
    type: z.literal('thinking'),
    content: z.string(),
  }),
  z.object({
    type: z.literal('complete'),
    result: EvaluationRunSchema,
  }),
  z.object({
    type: z.literal('error'),
    message: z.string(),
  }),
]);
export type EvaluationEvent = z.infer<typeof EvaluationEventSchema>;

// Parsed survey question for evaluation
export const ParsedQuestionSchema = z.object({
  id: z.string(),
  type: z.string(),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
  }).optional(),
  pageId: z.string().optional(),
  position: z.number().optional(),
});
export type ParsedQuestion = z.infer<typeof ParsedQuestionSchema>;

// Model options for evaluation
export const EVALUATION_MODELS = [
  { id: 'claude-haiku-4-5-20251001', name: 'Haiku 4.5', provider: 'anthropic', description: 'Fast and accurate' },
  { id: 'gpt-5', name: 'GPT 5', provider: 'openai', description: 'Best for thorough evaluation' },
  { id: 'lema-0.1', name: 'Lema 0.1', provider: 'lema', description: 'Lightweight evaluation' },
] as const;

// Tone options for AI analysis
export const EVALUATION_TONES = [
  { id: 'constructive', name: 'Constructive', description: 'Balanced, helpful feedback' },
  { id: 'critical', name: 'Critical', description: 'Thorough, detailed critique' },
  { id: 'encouraging', name: 'Encouraging', description: 'Positive, supportive tone' },
] as const;

export type EvaluationTone = typeof EVALUATION_TONES[number]['id'];

export type EvaluationModelId = typeof EVALUATION_MODELS[number]['id'];

// Mode descriptions for UI
export const MODE_DESCRIPTIONS: Record<EvaluationMode, { title: string; description: string; icon: string }> = {
  human_like: {
    title: 'Human-like',
    description: 'Simulates realistic user behavior with thoughtful, varied responses',
    icon: 'User',
  },
  edge_case: {
    title: 'Edge Cases',
    description: 'Tests boundary conditions, validation, unusual inputs',
    icon: 'AlertTriangle',
  },
  stress_test: {
    title: 'Stress Test',
    description: 'Rapid completion, tests required fields, random selections',
    icon: 'Zap',
  },
  custom: {
    title: 'Custom',
    description: 'Follows your specific criteria and instructions',
    icon: 'Settings',
  },
  all: {
    title: 'Comprehensive',
    description: 'Runs all modes for thorough evaluation',
    icon: 'Layers',
  },
};

// Severity colors for UI
export const SEVERITY_COLORS: Record<Severity, { bg: string; text: string; border: string }> = {
  critical: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
  high: { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  medium: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
  low: { bg: 'rgba(136, 136, 136, 0.15)', text: '#888888', border: 'rgba(136, 136, 136, 0.3)' },
};

// Category icons for UI
export const CATEGORY_ICONS: Record<SuggestionCategory, string> = {
  ux: 'MousePointer',
  clarity: 'Type',
  logic: 'GitBranch',
  accessibility: 'Eye',
  bias: 'Scale',
  technical: 'Code',
  validation: 'CheckCircle',
};
