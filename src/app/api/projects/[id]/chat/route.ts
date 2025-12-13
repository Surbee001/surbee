import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-utils';

// Create Supabase client with anon key + RLS instead of service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Tool implementations
async function getSurveyQuestions(projectId: string): Promise<string> {
  const { data: project, error } = await supabase
    .from('projects')
    .select('survey_schema, title')
    .eq('id', projectId)
    .single();

  if (error) return JSON.stringify({ error: error.message });

  const surveySchema = project?.survey_schema;
  if (!surveySchema) {
    return JSON.stringify({ error: 'No survey schema found for this project' });
  }

  const questions: any[] = [];

  if (surveySchema.questions) {
    surveySchema.questions.forEach((q: any, index: number) => {
      questions.push({
        id: q.id || `question_${index}`,
        index: index + 1,
        type: q.type,
        title: q.title || q.question || q.text,
        description: q.description,
        required: q.required,
        options: q.options || q.choices,
      });
    });
  } else if (surveySchema.pages) {
    surveySchema.pages.forEach((page: any) => {
      if (page.questions) {
        page.questions.forEach((q: any) => {
          questions.push({
            id: q.id || `question_${questions.length}`,
            index: questions.length + 1,
            type: q.type,
            title: q.title || q.question || q.text,
            description: q.description,
            required: q.required,
            options: q.options || q.choices,
            page: page.title || page.name,
          });
        });
      }
    });
  } else if (Array.isArray(surveySchema)) {
    surveySchema.forEach((q: any, index: number) => {
      questions.push({
        id: q.id || `question_${index}`,
        index: index + 1,
        type: q.type,
        title: q.title || q.question || q.text,
        description: q.description,
        required: q.required,
        options: q.options || q.choices,
      });
    });
  }

  return JSON.stringify({ total_questions: questions.length, questions });
}

async function getProjectDetails(projectId: string): Promise<string> {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) return JSON.stringify({ error: error.message });

  return JSON.stringify({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    created_at: project.created_at,
    updated_at: project.updated_at,
    published_at: project.published_at,
    published_url: project.published_url,
    preview_image_url: project.preview_image_url,
    has_survey_schema: !!project.survey_schema,
  });
}

async function getAllAnswersForQuestion(projectId: string, questionId: string, limit: number = 50): Promise<string> {
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('id, responses, created_at')
    .eq('survey_id', projectId)
    .limit(limit);

  if (error) return JSON.stringify({ error: error.message });

  // Security: Don't expose PII (respondent_name, respondent_email) in API responses
  const answers = responses?.map((r, index) => ({
    response_id: r.id,
    respondent: `Respondent ${index + 1}`,
    answer: r.responses?.[questionId],
    submitted_at: r.created_at,
  })).filter((a) => a.answer !== undefined && a.answer !== null) || [];

  return JSON.stringify({ question_id: questionId, total_answers: answers.length, answers });
}

async function getSurveyStats(projectId: string): Promise<string> {
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', projectId);

  if (error) return JSON.stringify({ error: error.message });

  const total = responses?.length || 0;
  const completed = responses?.filter((r) => r.completed_at)?.length || 0;
  const flagged = responses?.filter((r) => r.is_flagged)?.length || 0;

  const completionTimes = responses
    ?.filter((r) => r.timing_data?.completionTime)
    .map((r) => r.timing_data.completionTime) || [];

  const avgCompletionTime = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length / 1000)
    : 0;

  const qualityScores = responses?.map((r) => r.fraud_score).filter(Boolean) || [];
  const avgQualityScore = qualityScores.length > 0
    ? (qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length).toFixed(2)
    : 'N/A';

  return JSON.stringify({
    total_responses: total,
    completed_responses: completed,
    completion_rate: total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '0%',
    flagged_responses: flagged,
    average_completion_time_seconds: avgCompletionTime,
    average_quality_score: avgQualityScore,
  });
}

async function queryResponses(projectId: string, options: any): Promise<string> {
  let query = supabase
    .from('survey_responses')
    .select('id, created_at, completed_at, fraud_score, is_flagged, device_data, timing_data')
    .eq('survey_id', projectId);

  if (options.completed_only) {
    query = query.not('completed_at', 'is', null);
  }
  if (options.flagged_only) {
    query = query.eq('is_flagged', true);
  }

  const orderField = options.order_by || 'created_at';
  const ascending = options.order_direction === 'asc';
  query = query.order(orderField, { ascending });

  const limit = options.limit || 10;
  query = query.limit(limit);

  const { data, error } = await query;

  if (error) return JSON.stringify({ error: error.message });

  // Security: Don't expose PII (respondent_name, respondent_email) in API responses
  const formatted = data?.map((r, index) => ({
    id: r.id,
    respondent: `Respondent ${index + 1}`,
    submitted_at: r.created_at,
    completed_at: r.completed_at,
    quality_score: r.fraud_score,
    is_flagged: r.is_flagged,
    device: r.device_data?.type || 'Unknown',
    completion_time_seconds: r.timing_data?.completionTime
      ? Math.round(r.timing_data.completionTime / 1000)
      : null,
  }));

  return JSON.stringify({ count: formatted?.length || 0, responses: formatted });
}

async function getResponseDetails(projectId: string, responseId: string): Promise<string> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('id', responseId)
    .eq('survey_id', projectId)
    .single();

  if (error) return JSON.stringify({ error: error.message });
  return JSON.stringify(data);
}

async function analyzeQuestion(projectId: string, questionId: string): Promise<string> {
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('responses')
    .eq('survey_id', projectId);

  if (error) return JSON.stringify({ error: error.message });

  const answers = responses
    ?.map((r) => r.responses?.[questionId])
    .filter((a) => a !== null && a !== undefined) || [];

  const distribution: Record<string, number> = {};
  answers.forEach((answer) => {
    const key = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
    distribution[key] = (distribution[key] || 0) + 1;
  });

  const sortedDistribution = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return JSON.stringify({
    question_id: questionId,
    total_responses: answers.length,
    top_answers: sortedDistribution.map(([answer, count]) => ({
      answer,
      count,
      percentage: `${((count / answers.length) * 100).toFixed(1)}%`,
    })),
  });
}

async function getParticipantList(projectId: string, options: any): Promise<string> {
  const limit = options.limit || 10;
  const offset = options.offset || 0;

  const { data, error } = await supabase
    .from('survey_responses')
    .select('id, created_at, completed_at')
    .eq('survey_id', projectId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) return JSON.stringify({ error: error.message });

  // Security: Don't expose PII (respondent_name, respondent_email) in API responses
  const participants = data?.map((r, index) => ({
    number: offset + index + 1,
    id: r.id,
    respondent: `Respondent ${offset + index + 1}`,
    submitted_at: r.created_at,
    completed: !!r.completed_at,
  }));

  return JSON.stringify({ participants });
}

async function getTimeSeriesData(projectId: string, options: any): Promise<string> {
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('created_at')
    .eq('survey_id', projectId)
    .order('created_at', { ascending: true });

  if (error) return JSON.stringify({ error: error.message });

  const groupBy = options.group_by || 'day';
  const counts: Record<string, number> = {};

  responses?.forEach((r) => {
    const date = new Date(r.created_at);
    let key: string;

    switch (groupBy) {
      case 'hour':
        key = `${date.toISOString().slice(0, 13)}:00`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().slice(0, 10);
        break;
      case 'month':
        key = date.toISOString().slice(0, 7);
        break;
      default:
        key = date.toISOString().slice(0, 10);
    }

    counts[key] = (counts[key] || 0) + 1;
  });

  const timeSeries = Object.entries(counts).map(([date, count]) => ({ date, count }));

  return JSON.stringify({ group_by: groupBy, data_points: timeSeries.length, time_series: timeSeries });
}

// Create tools with projectId closure
function createTools(projectId: string) {
  return {
    get_survey_stats: tool({
      description: 'Get overall statistics for the survey including total responses, completion rate, average time, etc.',
      inputSchema: z.object({
        include_incomplete: z.boolean().default(false).describe('Whether to include incomplete responses in stats (default: false)'),
      }),
      execute: async () => getSurveyStats(projectId),
    }),
    get_survey_questions: tool({
      description: 'Get the full list of survey questions with their types, options, and IDs.',
      inputSchema: z.object({
        include_hidden: z.boolean().default(false).describe('Whether to include hidden questions (default: false)'),
      }),
      execute: async () => getSurveyQuestions(projectId),
    }),
    get_project_details: tool({
      description: 'Get full project details including title, description, status, creation date.',
      inputSchema: z.object({
        include_metadata: z.boolean().default(false).describe('Whether to include additional metadata (default: false)'),
      }),
      execute: async () => getProjectDetails(projectId),
    }),
    query_responses: tool({
      description: 'Query and filter survey responses. Can filter by completion status, flagged status, etc.',
      inputSchema: z.object({
        limit: z.number().optional().describe('Maximum number of responses to return (default 10)'),
        completed_only: z.boolean().optional().describe('Only return completed responses'),
        flagged_only: z.boolean().optional().describe('Only return flagged/suspicious responses'),
        order_by: z.enum(['created_at', 'completed_at', 'fraud_score']).optional().describe('Field to order by'),
        order_direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
      }),
      execute: async (args) => queryResponses(projectId, args),
    }),
    get_response_details: tool({
      description: 'Get detailed information about a specific response by ID.',
      inputSchema: z.object({
        response_id: z.string().describe('The ID of the response to fetch'),
      }),
      execute: async ({ response_id }) => getResponseDetails(projectId, response_id),
    }),
    analyze_question: tool({
      description: 'Analyze responses to a specific question - get distribution, common answers, percentages.',
      inputSchema: z.object({
        question_id: z.string().describe('The question ID to analyze'),
      }),
      execute: async ({ question_id }) => analyzeQuestion(projectId, question_id),
    }),
    get_all_answers_for_question: tool({
      description: 'Get every single answer submitted for a specific question, with respondent info.',
      inputSchema: z.object({
        question_id: z.string().describe('The question ID to get all answers for'),
        limit: z.number().optional().describe('Maximum number of answers to return (default 50)'),
      }),
      execute: async ({ question_id, limit }) => getAllAnswersForQuestion(projectId, question_id, limit),
    }),
    get_participant_list: tool({
      description: 'Get a list of survey participants with their basic info.',
      inputSchema: z.object({
        limit: z.number().optional().describe('Maximum number of participants to return'),
        offset: z.number().optional().describe('Number of participants to skip'),
      }),
      execute: async (args) => getParticipantList(projectId, args),
    }),
    get_time_series_data: tool({
      description: 'Get response counts over time for charting/graphing.',
      inputSchema: z.object({
        group_by: z.enum(['hour', 'day', 'week', 'month']).optional().describe('How to group the time series data'),
      }),
      execute: async (args) => getTimeSeriesData(projectId, args),
    }),
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Security: Get authenticated user from session instead of trusting client
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const { id: projectId } = await params;
    const body = await request.json();
    const { messages } = body;

    // Verify user owns the project using authenticated user ID
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return Response.json({ error: 'Project not found or unauthorized' }, { status: 403 });
    }

    // Get initial stats for context
    const { data: responses } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', projectId);

    const totalResponses = responses?.length || 0;
    const completedResponses = responses?.filter((r) => r.completed_at)?.length || 0;

    // Build system prompt
    const systemPrompt = `You are Surbee, a precision data analyst for "${project.title}".

Stats: ${totalResponses} responses, ${completedResponses} completed (${totalResponses > 0 ? ((completedResponses / totalResponses) * 100).toFixed(0) : 0}%)

Rules:
- Be extremely concise. Answer only what was asked.
- Never list your capabilities or features unless explicitly asked "what can you do?"
- If someone says "hi" or greets you, respond briefly (e.g., "Hello. What would you like to know about your survey data?")
- Use tools to get real data before answering data questions.
- Numbers and facts only. No fluff, no filler, no unnecessary context.
- If you detect an issue or anomaly in the data, mention it briefly.
- Use tables for comparisons. Use bullet points sparingly.
- Don't explain what you're doing. Just do it and present results.

Tools: get_survey_stats, get_survey_questions, get_project_details, query_responses, get_response_details, analyze_question, get_all_answers_for_question, get_participant_list, get_time_series_data`;

    // Create tools with projectId
    const tools = createTools(projectId);

    // Use streamText from AI SDK
    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      messages,
      tools,
      maxSteps: 5,
    });

    // Return the UI message stream response for useChat
    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Error in project chat API:', error);
    return Response.json(
      { error: error.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
}
