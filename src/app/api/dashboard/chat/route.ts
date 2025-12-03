import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Tool implementations for multi-survey queries

async function listUserSurveys(userId: string, statusFilter?: string): Promise<string> {
  let query = supabase
    .from('projects')
    .select('id, title, description, status, created_at, updated_at, published_at, published_url')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter);
  }

  const { data: projects, error } = await query;

  if (error) return JSON.stringify({ error: error.message });

  // Get response counts for each project
  const surveysWithStats = await Promise.all(
    (projects || []).map(async (project) => {
      const { count: totalResponses } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', project.id);

      const { count: completedResponses } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .eq('survey_id', project.id)
        .not('completed_at', 'is', null);

      return {
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        created_at: project.created_at,
        updated_at: project.updated_at,
        published_at: project.published_at,
        published_url: project.published_url,
        total_responses: totalResponses || 0,
        completed_responses: completedResponses || 0,
        completion_rate: totalResponses && totalResponses > 0
          ? `${((completedResponses || 0) / totalResponses * 100).toFixed(1)}%`
          : '0%',
      };
    })
  );

  return JSON.stringify({
    total_surveys: surveysWithStats.length,
    surveys: surveysWithStats,
  });
}

async function getAggregateStats(userId: string): Promise<string> {
  // Get all user projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, status')
    .eq('user_id', userId);

  if (projectsError) return JSON.stringify({ error: projectsError.message });

  const projectIds = projects?.map(p => p.id) || [];

  if (projectIds.length === 0) {
    return JSON.stringify({
      total_surveys: 0,
      published_surveys: 0,
      draft_surveys: 0,
      total_responses: 0,
      total_completed: 0,
      overall_completion_rate: '0%',
    });
  }

  // Count by status
  const publishedCount = projects?.filter(p => p.status === 'published').length || 0;
  const draftCount = projects?.filter(p => p.status === 'draft').length || 0;

  // Get all responses across all projects
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select('id, completed_at, fraud_score, timing_data')
    .in('survey_id', projectIds);

  if (responsesError) return JSON.stringify({ error: responsesError.message });

  const totalResponses = responses?.length || 0;
  const completedResponses = responses?.filter(r => r.completed_at)?.length || 0;
  const flaggedResponses = responses?.filter(r => r.fraud_score && r.fraud_score < 0.5)?.length || 0;

  // Calculate average completion time
  const completionTimes = responses
    ?.filter(r => r.timing_data?.completionTime)
    .map(r => r.timing_data.completionTime) || [];

  const avgCompletionTime = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length / 1000)
    : 0;

  return JSON.stringify({
    total_surveys: projectIds.length,
    published_surveys: publishedCount,
    draft_surveys: draftCount,
    total_responses: totalResponses,
    total_completed: completedResponses,
    overall_completion_rate: totalResponses > 0
      ? `${((completedResponses / totalResponses) * 100).toFixed(1)}%`
      : '0%',
    flagged_responses: flaggedResponses,
    average_completion_time_seconds: avgCompletionTime,
  });
}

async function searchSurveys(userId: string, query: string, searchType?: string): Promise<string> {
  // Get all user projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title, survey_schema')
    .eq('user_id', userId);

  if (projectsError) return JSON.stringify({ error: projectsError.message });

  const results: any[] = [];
  const searchLower = query.toLowerCase();

  for (const project of projects || []) {
    // Search in title
    if (project.title?.toLowerCase().includes(searchLower)) {
      results.push({
        type: 'survey_title',
        survey_id: project.id,
        survey_title: project.title,
        match: project.title,
      });
    }

    // Search in questions
    const surveySchema = project.survey_schema;
    if (!surveySchema) continue;

    const questions: any[] = [];
    if (surveySchema.questions) {
      questions.push(...surveySchema.questions);
    } else if (surveySchema.pages) {
      surveySchema.pages.forEach((page: any) => {
        if (page.questions) questions.push(...page.questions);
      });
    } else if (Array.isArray(surveySchema)) {
      questions.push(...surveySchema);
    }

    for (const q of questions) {
      const questionText = q.title || q.question || q.text || '';
      if (questionText.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'question',
          survey_id: project.id,
          survey_title: project.title,
          question_id: q.id,
          question_text: questionText,
          question_type: q.type,
        });
      }
    }
  }

  return JSON.stringify({
    query,
    total_matches: results.length,
    results: results.slice(0, 20), // Limit to 20 results
  });
}

async function getSurveyDetails(userId: string, surveyId: string): Promise<string> {
  // Verify user owns the survey
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', surveyId)
    .eq('user_id', userId)
    .single();

  if (error) return JSON.stringify({ error: 'Survey not found or unauthorized' });

  // Get response stats
  const { data: responses } = await supabase
    .from('survey_responses')
    .select('id, completed_at, fraud_score')
    .eq('survey_id', surveyId);

  const totalResponses = responses?.length || 0;
  const completedResponses = responses?.filter(r => r.completed_at)?.length || 0;

  // Extract questions
  const surveySchema = project.survey_schema;
  const questions: any[] = [];

  if (surveySchema?.questions) {
    questions.push(...surveySchema.questions);
  } else if (surveySchema?.pages) {
    surveySchema.pages.forEach((page: any) => {
      if (page.questions) questions.push(...page.questions);
    });
  } else if (Array.isArray(surveySchema)) {
    questions.push(...surveySchema);
  }

  return JSON.stringify({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    created_at: project.created_at,
    updated_at: project.updated_at,
    published_at: project.published_at,
    published_url: project.published_url,
    total_questions: questions.length,
    questions: questions.map((q, i) => ({
      id: q.id || `q_${i}`,
      text: q.title || q.question || q.text,
      type: q.type,
      required: q.required,
    })),
    total_responses: totalResponses,
    completed_responses: completedResponses,
    completion_rate: totalResponses > 0
      ? `${((completedResponses / totalResponses) * 100).toFixed(1)}%`
      : '0%',
  });
}

async function compareSurveys(userId: string, surveyIds: string[]): Promise<string> {
  const comparisons = await Promise.all(
    surveyIds.map(async (surveyId) => {
      const { data: project, error } = await supabase
        .from('projects')
        .select('id, title, status, created_at')
        .eq('id', surveyId)
        .eq('user_id', userId)
        .single();

      if (error) return { id: surveyId, error: 'Not found or unauthorized' };

      const { data: responses } = await supabase
        .from('survey_responses')
        .select('id, completed_at, fraud_score, timing_data')
        .eq('survey_id', surveyId);

      const total = responses?.length || 0;
      const completed = responses?.filter(r => r.completed_at)?.length || 0;
      const avgQuality = responses?.filter(r => r.fraud_score)
        .reduce((sum, r) => sum + (r.fraud_score || 0), 0) / (responses?.filter(r => r.fraud_score).length || 1);

      const completionTimes = responses
        ?.filter(r => r.timing_data?.completionTime)
        .map(r => r.timing_data.completionTime) || [];
      const avgTime = completionTimes.length > 0
        ? Math.round(completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length / 1000)
        : 0;

      return {
        id: project.id,
        title: project.title,
        status: project.status,
        created_at: project.created_at,
        total_responses: total,
        completed_responses: completed,
        completion_rate: total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '0%',
        average_quality_score: avgQuality.toFixed(2),
        average_completion_time_seconds: avgTime,
      };
    })
  );

  return JSON.stringify({ comparisons });
}

async function analyzeSurveyQuestion(userId: string, surveyId: string, questionId: string): Promise<string> {
  // Verify ownership
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('id, title')
    .eq('id', surveyId)
    .eq('user_id', userId)
    .single();

  if (projectError) return JSON.stringify({ error: 'Survey not found or unauthorized' });

  // Get responses
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select('responses')
    .eq('survey_id', surveyId);

  if (responsesError) return JSON.stringify({ error: responsesError.message });

  const answers = responses
    ?.map(r => r.responses?.[questionId])
    .filter(a => a !== null && a !== undefined) || [];

  const distribution: Record<string, number> = {};
  answers.forEach(answer => {
    const key = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
    distribution[key] = (distribution[key] || 0) + 1;
  });

  const sortedDistribution = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return JSON.stringify({
    survey_id: surveyId,
    survey_title: project.title,
    question_id: questionId,
    total_answers: answers.length,
    top_answers: sortedDistribution.map(([answer, count]) => ({
      answer,
      count,
      percentage: `${((count / answers.length) * 100).toFixed(1)}%`,
    })),
  });
}

async function getRecentActivity(userId: string, limit: number = 10): Promise<string> {
  // Get user's projects
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('id, title')
    .eq('user_id', userId);

  if (projectsError) return JSON.stringify({ error: projectsError.message });

  const projectIds = projects?.map(p => p.id) || [];
  if (projectIds.length === 0) {
    return JSON.stringify({ recent_responses: [] });
  }

  // Get recent responses across all surveys
  const { data: responses, error: responsesError } = await supabase
    .from('survey_responses')
    .select('id, survey_id, respondent_name, created_at, completed_at')
    .in('survey_id', projectIds)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (responsesError) return JSON.stringify({ error: responsesError.message });

  const projectMap = Object.fromEntries(projects?.map(p => [p.id, p.title]) || []);

  return JSON.stringify({
    recent_responses: responses?.map(r => ({
      id: r.id,
      survey_id: r.survey_id,
      survey_title: projectMap[r.survey_id] || 'Unknown',
      respondent: r.respondent_name || 'Anonymous',
      submitted_at: r.created_at,
      completed: !!r.completed_at,
    })),
  });
}

// Create tools with userId closure
function createDashboardTools(userId: string) {
  return {
    list_surveys: tool({
      description: 'List all surveys owned by the user with response counts and completion rates. Use this to see all available surveys.',
      parameters: z.object({
        status_filter: z.enum(['all', 'draft', 'published', 'archived']).optional()
          .describe('Filter by survey status'),
      }),
      execute: async ({ status_filter }) => listUserSurveys(userId, status_filter),
    }),

    get_aggregate_stats: tool({
      description: 'Get aggregate statistics across ALL user surveys - total responses, completion rates, etc.',
      parameters: z.object({}),
      execute: async () => getAggregateStats(userId),
    }),

    search_surveys: tool({
      description: 'Search for surveys or questions by keyword. Searches in survey titles and question text.',
      parameters: z.object({
        query: z.string().describe('The search query'),
        search_type: z.enum(['all', 'titles', 'questions']).optional()
          .describe('What to search in'),
      }),
      execute: async ({ query, search_type }) => searchSurveys(userId, query, search_type),
    }),

    get_survey_details: tool({
      description: 'Get detailed information about a specific survey including questions and stats.',
      parameters: z.object({
        survey_id: z.string().describe('The ID of the survey to get details for'),
      }),
      execute: async ({ survey_id }) => getSurveyDetails(userId, survey_id),
    }),

    compare_surveys: tool({
      description: 'Compare statistics between multiple surveys side by side.',
      parameters: z.object({
        survey_ids: z.array(z.string()).describe('Array of survey IDs to compare'),
      }),
      execute: async ({ survey_ids }) => compareSurveys(userId, survey_ids),
    }),

    analyze_question: tool({
      description: 'Analyze responses to a specific question in a survey. Shows answer distribution.',
      parameters: z.object({
        survey_id: z.string().describe('The survey ID'),
        question_id: z.string().describe('The question ID to analyze'),
      }),
      execute: async ({ survey_id, question_id }) => analyzeSurveyQuestion(userId, survey_id, question_id),
    }),

    get_recent_activity: tool({
      description: 'Get recent response activity across all surveys.',
      parameters: z.object({
        limit: z.number().optional().describe('Maximum number of recent responses to return'),
      }),
      execute: async ({ limit }) => getRecentActivity(userId, limit),
    }),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, userId, model = 'claude-haiku' } = body;

    if (!userId) {
      return Response.json({ error: 'User ID required' }, { status: 401 });
    }

    // Get initial stats for context
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId);

    const projectCount = projects?.length || 0;

    // Build system prompt
    const systemPrompt = `You are Surbee, a data analyst assistant for survey insights.
You have access to ALL of this user's surveys (${projectCount} total). Help them understand their survey data across all their projects.

Rules:
- Be extremely concise. Answer only what was asked.
- Never list your capabilities unless explicitly asked "what can you do?"
- If someone greets you, respond briefly and ask what they'd like to know.
- Use tools to get real data before answering data questions.
- Numbers and facts only. No fluff, no filler, no unnecessary context.
- When mentioning a specific survey, always include its ID so the user can navigate to it.
- Use tables for comparisons. Use bullet points sparingly.
- Don't explain what you're doing. Just do it and present results.

Tools: list_surveys, get_aggregate_stats, search_surveys, get_survey_details, compare_surveys, analyze_question, get_recent_activity`;

    // Create tools with userId
    const tools = createDashboardTools(userId);

    // Use streamText from AI SDK
    const result = await streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: systemPrompt,
      messages,
      tools,
      maxSteps: 5,
    });

    // Return the data stream response
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('Error in dashboard chat API:', error);
    return Response.json(
      { error: error.message || 'Failed to process chat' },
      { status: 500 }
    );
  }
}
