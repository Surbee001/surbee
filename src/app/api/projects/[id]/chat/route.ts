import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { streamText, tool } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

// Define tools for function calling using Vercel AI SDK format
const tools = {
  query_responses: tool({
    description: 'Query survey responses with filters like completion time, quality score, date range, etc.',
    parameters: z.object({
      filters: z.object({
        max_completion_time: z.number().optional().describe('Maximum completion time in seconds'),
        min_completion_time: z.number().optional().describe('Minimum completion time in seconds'),
        min_quality_score: z.number().optional().describe('Minimum quality/fraud score (0-1)'),
        date_from: z.string().optional().describe('Start date (ISO format)'),
        date_to: z.string().optional().describe('End date (ISO format)'),
        is_flagged: z.boolean().optional().describe('Filter by flagged status'),
      }),
      limit: z.number().default(10).describe('Maximum number of responses to return'),
      order_by: z.enum(['created_at', 'completed_at', 'fraud_score']).default('created_at').describe('Field to order by'),
    }),
    execute: async ({ filters, limit, order_by }, { projectId }: any) => {
      return await queryResponses({ filters, limit, order_by }, projectId, supabaseAdmin);
    },
  }),
  get_response_details: tool({
    description: 'Get detailed information about a specific response by ID',
    parameters: z.object({
      response_id: z.string().describe('The ID of the response to fetch'),
    }),
    execute: async ({ response_id }, { projectId }: any) => {
      return await getResponseDetails(response_id, projectId, supabaseAdmin);
    },
  }),
  analyze_question: tool({
    description: 'Analyze responses to a specific question, including distribution, sentiment, common themes',
    parameters: z.object({
      question_id: z.string().describe('The question ID to analyze'),
    }),
    execute: async ({ question_id }, { projectId }: any) => {
      return await analyzeQuestion(question_id, projectId, supabaseAdmin);
    },
  }),
  get_summary_statistics: tool({
    description: 'Get overall summary statistics for the project including response rate, completion rate, average time, quality metrics',
    parameters: z.object({}),
    execute: async (_params, { projectId }: any) => {
      return await getSummaryStatistics(projectId, supabaseAdmin);
    },
  }),
};

// Old Anthropic format - keeping for reference but converting above
const oldTools = [
  {
    name: 'query_responses',
    description:
      'Query survey responses with filters like completion time, quality score, date range, etc. Returns matching responses.',
    input_schema: {
      type: 'object',
      properties: {
        filters: {
          type: 'object',
          description: 'Filters to apply to responses',
          properties: {
            max_completion_time: {
              type: 'number',
              description: 'Maximum completion time in seconds',
            },
            min_completion_time: {
              type: 'number',
              description: 'Minimum completion time in seconds',
            },
            min_quality_score: {
              type: 'number',
              description: 'Minimum quality/fraud score (0-1)',
            },
            date_from: {
              type: 'string',
              description: 'Start date (ISO format)',
            },
            date_to: {
              type: 'string',
              description: 'End date (ISO format)',
            },
            is_flagged: {
              type: 'boolean',
              description: 'Filter by flagged status',
            },
          },
        },
        limit: {
          type: 'number',
          description: 'Maximum number of responses to return',
          default: 10,
        },
        order_by: {
          type: 'string',
          description: 'Field to order by',
          enum: ['created_at', 'completed_at', 'fraud_score'],
        },
      },
      required: ['filters'],
    },
  },
  {
    name: 'get_response_details',
    description: 'Get detailed information about a specific response by ID',
    input_schema: {
      type: 'object',
      properties: {
        response_id: {
          type: 'string',
          description: 'The ID of the response to fetch',
        },
      },
      required: ['response_id'],
    },
  },
  {
    name: 'analyze_question',
    description:
      'Analyze responses to a specific question, including distribution, sentiment, common themes',
    input_schema: {
      type: 'object',
      properties: {
        question_id: {
          type: 'string',
          description: 'The question ID to analyze',
        },
      },
      required: ['question_id'],
    },
  },
  {
    name: 'get_summary_statistics',
    description:
      'Get overall summary statistics for the project including response rate, completion rate, average time, quality metrics',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { messages, pageContext, userId } = body;

    if (!userId) {
      return new Response('User ID required', { status: 401 });
    }

    // Verify user owns the project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', userId)
      .single();

    if (projectError || !project) {
      return new Response('Project not found or unauthorized', { status: 403 });
    }

    // Fetch project data for context
    const { data: responses } = await supabaseAdmin
      .from('survey_responses')
      .select('*')
      .eq('survey_id', projectId)
      .order('created_at', { ascending: false });

    // Build system context
    const systemPrompt = buildSystemPrompt(project, responses || [], pageContext);

    // Use Vercel AI SDK streamText with tools
    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      messages: messages || [],
      tools: tools,
      maxToolRoundtrips: 5,
      maxTokens: 2048,
      experimental_toolCallStreaming: true,
      onFinish: ({ text, toolCalls, toolResults }) => {
        console.log('Chat finished:', { textLength: text?.length, toolCallsCount: toolCalls?.length });
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in chat:', error);
    return new Response('Failed to process chat', { status: 500 });
  }
}

function buildSystemPrompt(
  project: any,
  responses: any[],
  pageContext?: string
): string {
  const completedResponses = responses.filter((r) => r.completed_at);
  const avgCompletionTime =
    completedResponses.reduce((acc, r) => {
      if (r.timing_data?.completionTime) {
        return acc + r.timing_data.completionTime;
      }
      return acc;
    }, 0) / (completedResponses.length || 1);

  let prompt = `You are an intelligent analytics assistant for a survey project.

Project: ${project.title}
${project.description ? `Description: ${project.description}` : ''}

Quick Stats:
- Total Responses: ${responses.length}
- Completed: ${completedResponses.length}
- Avg Completion Time: ${Math.round(avgCompletionTime / 1000)}s

You have access to tools to query and analyze the survey data. Use them to answer user questions accurately.

When answering questions:
1. Be concise and actionable
2. Use specific numbers and data points
3. Highlight important insights
4. Format your response with markdown for readability

${pageContext ? `\nCurrent Page Context:\n${pageContext}\n` : ''}

You can answer complex queries like:
- "Who completed this survey in under 5 minutes?"
- "What are the common themes in the text responses?"
- "Show me flagged responses with quality issues"
- "What's the completion rate by day of week?"

Use your tools wisely to fetch the exact data needed.
`;

  return prompt;
}

// executeToolCall removed - Vercel AI SDK handles tool execution automatically

async function queryResponses(
  input: any,
  projectId: string,
  supabase: any
): Promise<any> {
  const { filters, limit = 10, order_by = 'created_at' } = input;

  let query = supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', projectId);

  // Apply filters
  if (filters) {
    if (filters.is_flagged !== undefined) {
      query = query.eq('is_flagged', filters.is_flagged);
    }
    if (filters.min_quality_score !== undefined) {
      query = query.gte('fraud_score', filters.min_quality_score);
    }
    if (filters.date_from) {
      query = query.gte('created_at', filters.date_from);
    }
    if (filters.date_to) {
      query = query.lte('created_at', filters.date_to);
    }
  }

  const { data, error } = await query.order(order_by, { ascending: false }).limit(limit);

  if (error) {
    return { error: error.message };
  }

  // Apply client-side filters for complex queries
  let filtered = data || [];

  if (filters?.max_completion_time || filters?.min_completion_time) {
    filtered = filtered.filter((r) => {
      const completionTime = r.timing_data?.completionTime;
      if (!completionTime) return false;

      const timeInSeconds = completionTime / 1000;
      if (filters.max_completion_time && timeInSeconds > filters.max_completion_time) {
        return false;
      }
      if (filters.min_completion_time && timeInSeconds < filters.min_completion_time) {
        return false;
      }
      return true;
    });
  }

  return {
    count: filtered.length,
    responses: filtered.map((r) => ({
      id: r.id,
      created_at: r.created_at,
      completed_at: r.completed_at,
      responses: r.responses,
      quality_score: r.fraud_score,
      is_flagged: r.is_flagged,
      flag_reasons: r.flag_reasons,
      device: r.device_data?.type,
      completion_time_seconds: r.timing_data?.completionTime
        ? Math.round(r.timing_data.completionTime / 1000)
        : null,
    })),
  };
}

async function getResponseDetails(
  responseId: string,
  projectId: string,
  supabase: any
): Promise<any> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('id', responseId)
    .eq('survey_id', projectId)
    .single();

  if (error) {
    return { error: error.message };
  }

  return data;
}

async function analyzeQuestion(
  questionId: string,
  projectId: string,
  supabase: any
): Promise<any> {
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('responses')
    .eq('survey_id', projectId);

  if (error) {
    return { error: error.message };
  }

  // Collect all responses to this question
  const answers = responses
    .map((r: any) => r.responses?.[questionId])
    .filter((a: any) => a !== null && a !== undefined);

  // Basic analysis
  const distribution: Record<string, number> = {};
  answers.forEach((answer: any) => {
    const key = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
    distribution[key] = (distribution[key] || 0) + 1;
  });

  return {
    question_id: questionId,
    total_responses: answers.length,
    distribution,
    sample_answers: answers.slice(0, 5),
  };
}

async function getSummaryStatistics(projectId: string, supabase: any): Promise<any> {
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('*')
    .eq('survey_id', projectId);

  if (error) {
    return { error: error.message };
  }

  const completed = responses.filter((r: any) => r.completed_at);
  const flagged = responses.filter((r: any) => r.is_flagged);

  const completionTimes = completed
    .map((r: any) => r.timing_data?.completionTime)
    .filter(Boolean);

  const avgCompletionTime =
    completionTimes.length > 0
      ? completionTimes.reduce((a: number, b: number) => a + b, 0) / completionTimes.length
      : 0;

  const qualityScores = responses.map((r: any) => r.fraud_score || 0).filter((s) => s > 0);
  const avgQuality =
    qualityScores.length > 0
      ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
      : 0;

  return {
    total_responses: responses.length,
    completed_responses: completed.length,
    completion_rate: responses.length > 0 ? (completed.length / responses.length) * 100 : 0,
    flagged_responses: flagged.length,
    avg_completion_time_seconds: Math.round(avgCompletionTime / 1000),
    avg_quality_score: avgQuality,
  };
}
