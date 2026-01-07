import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { streamText, tool } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { requireAuth } from '@/lib/auth-utils';
import { checkCreditsForStream, deductCreditsAfterStream } from '@/lib/withCredits';
import { getChatModelAction, checkFeatureAccess } from '@/lib/credits';

export const runtime = 'nodejs';
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Model selection helper
const getModel = (modelName: string = 'claude-haiku') => {
  const normalizedModel = modelName.trim().toLowerCase();

  if (normalizedModel === 'gpt-5' || normalizedModel.includes('gpt')) {
    return openai('gpt-4o');
  }
  
  // Default to Claude Haiku
  return anthropic('claude-haiku-4-5-20251001');
};

// ============== TOOL IMPLEMENTATIONS ==============

// Get all surveys for a user
async function getAllSurveys(userId: string): Promise<string> {
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, description, status, created_at, updated_at, published_at, published_url')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) return JSON.stringify({ error: error.message });

  return JSON.stringify({
    total_surveys: projects?.length || 0,
    surveys: projects?.map(p => ({
      id: p.id,
      title: p.title || 'Untitled Survey',
      description: p.description,
      status: p.status,
      created_at: p.created_at,
      updated_at: p.updated_at,
      published: !!p.published_at,
      published_url: p.published_url,
    })),
  });
}

// Get survey details including questions
async function getSurveyDetails(surveyId: string, userId: string): Promise<string> {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', surveyId)
    .eq('user_id', userId)
    .single();

  if (error) return JSON.stringify({ error: error.message });
  if (!project) return JSON.stringify({ error: 'Survey not found or unauthorized' });

  // Parse survey schema to get questions
  const questions: any[] = [];
  const surveySchema = project.survey_schema;
  
  if (surveySchema) {
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
        });
      });
    }
  }

  return JSON.stringify({
    id: project.id,
    title: project.title,
    description: project.description,
    status: project.status,
    created_at: project.created_at,
    published_at: project.published_at,
    published_url: project.published_url,
    total_questions: questions.length,
    questions,
  });
}

// Get aggregate stats across all surveys or a specific survey
async function getSurveyStats(userId: string, surveyId?: string): Promise<string> {
  let query = supabase
    .from('survey_responses')
    .select('*, projects!inner(user_id, title)');
  
  if (surveyId) {
    query = query.eq('survey_id', surveyId);
  }
  query = query.eq('projects.user_id', userId);

  const { data: responses, error } = await query;

  if (error) return JSON.stringify({ error: error.message });

  const total = responses?.length || 0;
  const completed = responses?.filter((r) => r.completed_at)?.length || 0;
  const flagged = responses?.filter((r) => r.is_flagged)?.length || 0;

  const completionTimes = responses
    ?.filter((r) => r.timing_data?.completionTime)
    .map((r) => r.timing_data.completionTime) || [];

  const avgCompletionTime = completionTimes.length > 0
    ? Math.round(completionTimes.reduce((a: number, b: number) => a + b, 0) / completionTimes.length / 1000)
    : 0;

  // Group by survey
  const bySurvey: Record<string, number> = {};
  responses?.forEach((r: any) => {
    const title = r.projects?.title || 'Unknown';
    bySurvey[title] = (bySurvey[title] || 0) + 1;
  });

  return JSON.stringify({
    total_responses: total,
    completed_responses: completed,
    completion_rate: total > 0 ? `${((completed / total) * 100).toFixed(1)}%` : '0%',
    flagged_responses: flagged,
    average_completion_time_seconds: avgCompletionTime,
    responses_by_survey: bySurvey,
  });
}

// Query responses with advanced filters
async function queryResponses(userId: string, options: {
  survey_id?: string;
  limit?: number;
  offset?: number;
  completed_only?: boolean;
  flagged_only?: boolean;
  min_completion_time_seconds?: number;
  max_completion_time_seconds?: number;
  order_by?: string;
  order_direction?: string;
  date_from?: string;
  date_to?: string;
}): Promise<string> {
  let query = supabase
    .from('survey_responses')
    .select('*, projects!inner(user_id, title)')
    .eq('projects.user_id', userId);

  if (options.survey_id) {
    query = query.eq('survey_id', options.survey_id);
  }
  if (options.completed_only) {
    query = query.not('completed_at', 'is', null);
  }
  if (options.flagged_only) {
    query = query.eq('is_flagged', true);
  }
  if (options.date_from) {
    query = query.gte('created_at', options.date_from);
  }
  if (options.date_to) {
    query = query.lte('created_at', options.date_to);
  }

  const orderField = options.order_by || 'created_at';
  const ascending = options.order_direction === 'asc';
  query = query.order(orderField, { ascending });

  const limit = options.limit || 20;
  const offset = options.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) return JSON.stringify({ error: error.message });

  // Filter by completion time in-memory (Supabase doesn't support JSONB field filtering directly)
  let filtered = data || [];
  if (options.min_completion_time_seconds !== undefined) {
    filtered = filtered.filter((r: any) => {
      const timeMs = r.timing_data?.completionTime;
      return timeMs && (timeMs / 1000) >= options.min_completion_time_seconds!;
    });
  }
  if (options.max_completion_time_seconds !== undefined) {
    filtered = filtered.filter((r: any) => {
      const timeMs = r.timing_data?.completionTime;
      return timeMs && (timeMs / 1000) <= options.max_completion_time_seconds!;
    });
  }

  const formatted = filtered.map((r: any, index: number) => ({
    id: r.id,
    survey_title: r.projects?.title || 'Unknown',
    survey_id: r.survey_id,
    respondent: `Respondent ${offset + index + 1}`,
    respondent_id: r.respondent_id,
    submitted_at: r.created_at,
    completed_at: r.completed_at,
    completion_time_seconds: r.timing_data?.completionTime
      ? Math.round(r.timing_data.completionTime / 1000)
      : null,
    quality_score: r.fraud_score,
    is_flagged: r.is_flagged,
    device: r.device_data?.type || r.device_data?.device || 'Unknown',
    browser: r.device_data?.browser,
    os: r.device_data?.os,
    ip_address: r.ip_address,
  }));

  return JSON.stringify({ 
    count: formatted.length, 
    total_available: data?.length || 0,
    responses: formatted 
  });
}

// Get detailed response data including all answers
async function getResponseDetails(userId: string, responseId: string): Promise<string> {
  const { data, error } = await supabase
    .from('survey_responses')
    .select('*, projects!inner(user_id, title, survey_schema)')
    .eq('id', responseId)
    .eq('projects.user_id', userId)
    .single();

  if (error) return JSON.stringify({ error: error.message });
  if (!data) return JSON.stringify({ error: 'Response not found or unauthorized' });

  // Map question IDs to titles
  const questionMap: Record<string, string> = {};
  const schema = data.projects?.survey_schema;
  if (schema?.questions) {
    schema.questions.forEach((q: any) => {
      if (q.id) questionMap[q.id] = q.title || q.question || q.text;
    });
  }

  const formattedAnswers = Object.entries(data.responses || {}).map(([qId, answer]) => ({
    question_id: qId,
    question_title: questionMap[qId] || qId,
    answer,
  }));

  return JSON.stringify({
    id: data.id,
    survey_title: data.projects?.title,
    survey_id: data.survey_id,
    respondent_id: data.respondent_id,
    submitted_at: data.created_at,
    completed_at: data.completed_at,
    completion_time_seconds: data.timing_data?.completionTime
      ? Math.round(data.timing_data.completionTime / 1000)
      : null,
    quality_score: data.fraud_score,
    is_flagged: data.is_flagged,
    flag_reasons: data.flag_reasons,
    device_data: data.device_data,
    answers: formattedAnswers,
  });
}

// Analyze a specific question across responses
async function analyzeQuestion(userId: string, surveyId: string, questionId: string): Promise<string> {
  const { data: responses, error } = await supabase
    .from('survey_responses')
    .select('responses, projects!inner(user_id)')
    .eq('survey_id', surveyId)
    .eq('projects.user_id', userId);

  if (error) return JSON.stringify({ error: error.message });

  const answers = responses
    ?.map((r: any) => r.responses?.[questionId])
    .filter((a: any) => a !== null && a !== undefined) || [];

  const distribution: Record<string, number> = {};
  answers.forEach((answer: any) => {
    const key = typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
    distribution[key] = (distribution[key] || 0) + 1;
  });

  const sortedDistribution = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15);

  return JSON.stringify({
    survey_id: surveyId,
    question_id: questionId,
    total_responses: answers.length,
    unique_answers: Object.keys(distribution).length,
    answer_distribution: sortedDistribution.map(([answer, count]) => ({
      answer,
      count,
      percentage: `${((count / answers.length) * 100).toFixed(1)}%`,
    })),
  });
}

// Get time series data for charting
async function getTimeSeriesData(userId: string, options: {
  survey_id?: string;
  group_by?: string;
  date_from?: string;
  date_to?: string;
}): Promise<string> {
  let query = supabase
    .from('survey_responses')
    .select('created_at, survey_id, projects!inner(user_id, title)')
    .eq('projects.user_id', userId)
    .order('created_at', { ascending: true });

  if (options.survey_id) {
    query = query.eq('survey_id', options.survey_id);
  }
  if (options.date_from) {
    query = query.gte('created_at', options.date_from);
  }
  if (options.date_to) {
    query = query.lte('created_at', options.date_to);
  }

  const { data: responses, error } = await query;

  if (error) return JSON.stringify({ error: error.message });

  const groupBy = options.group_by || 'day';
  const counts: Record<string, number> = {};

  responses?.forEach((r: any) => {
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

  return JSON.stringify({ 
    group_by: groupBy, 
    data_points: timeSeries.length, 
    time_series: timeSeries 
  });
}

// Generate chart configuration
async function generateChart(options: {
  type: string;
  title: string;
  description?: string;
  data: any[];
  config: Record<string, { label: string; color?: string }>;
  xAxisKey?: string;
  dataKey?: string;
}): Promise<string> {
  // Assign colors if not provided
  const chartColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const configWithColors: Record<string, any> = {};
  let colorIndex = 0;
  
  for (const [key, value] of Object.entries(options.config)) {
    configWithColors[key] = {
      ...value,
      color: value.color || chartColors[colorIndex % chartColors.length],
    };
    colorIndex++;
  }

  const chartConfig = {
    type: options.type,
    title: options.title,
    description: options.description || '',
    data: options.data,
    config: configWithColors,
    xAxisKey: options.xAxisKey || 'name',
    dataKey: options.dataKey || 'value',
  };

  // Return as a special format that the frontend will recognize
  return `\`\`\`chart\n${JSON.stringify(chartConfig, null, 2)}\n\`\`\``;
}

// Create tools with userId closure
function createTools(userId: string) {
  return {
    get_all_surveys: tool({
      description: 'Get a list of all surveys/projects owned by the user. Use this first to see what surveys exist.',
      inputSchema: z.object({
        include_archived: z.boolean().default(false).describe('Whether to include archived surveys (default: false)'),
      }),
      execute: async () => getAllSurveys(userId),
    }),
    
    get_survey_details: tool({
      description: 'Get detailed information about a specific survey including all its questions.',
      inputSchema: z.object({
        survey_id: z.string().describe('The ID of the survey to get details for'),
      }),
      execute: async ({ survey_id }) => getSurveyDetails(survey_id, userId),
    }),
    
    get_survey_stats: tool({
      description: 'Get aggregate statistics - total responses, completion rate, average time, etc. Can be for all surveys or a specific one.',
      inputSchema: z.object({
        survey_id: z.string().optional().describe('Optional: specific survey ID to get stats for. Omit for all surveys.'),
      }),
      execute: async ({ survey_id }) => getSurveyStats(userId, survey_id),
    }),
    
    query_responses: tool({
      description: 'Query survey responses with powerful filters. Can filter by survey, completion status, time taken, date range, flagged status, and more. Use this for questions like "show me responses that took under 10 minutes" or "who completed the survey fastest".',
      inputSchema: z.object({
        survey_id: z.string().optional().describe('Filter by specific survey ID'),
        limit: z.number().optional().describe('Maximum responses to return (default 20)'),
        offset: z.number().optional().describe('Number of responses to skip for pagination'),
        completed_only: z.boolean().optional().describe('Only return completed responses'),
        flagged_only: z.boolean().optional().describe('Only return flagged/suspicious responses'),
        min_completion_time_seconds: z.number().optional().describe('Minimum completion time in seconds'),
        max_completion_time_seconds: z.number().optional().describe('Maximum completion time in seconds (e.g., 600 for under 10 minutes)'),
        order_by: z.enum(['created_at', 'completed_at', 'fraud_score']).optional().describe('Field to sort by'),
        order_direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
        date_from: z.string().optional().describe('Filter responses from this date (ISO format)'),
        date_to: z.string().optional().describe('Filter responses until this date (ISO format)'),
      }),
      execute: async (args) => queryResponses(userId, args),
    }),
    
    get_response_details: tool({
      description: 'Get full details of a specific response including all answers given.',
      inputSchema: z.object({
        response_id: z.string().describe('The UUID of the response to get details for'),
      }),
      execute: async ({ response_id }) => getResponseDetails(userId, response_id),
    }),
    
    analyze_question: tool({
      description: 'Analyze responses to a specific question - see answer distribution, most common answers, percentages.',
      inputSchema: z.object({
        survey_id: z.string().describe('The survey ID containing the question'),
        question_id: z.string().describe('The question ID to analyze'),
      }),
      execute: async ({ survey_id, question_id }) => analyzeQuestion(userId, survey_id, question_id),
    }),
    
    get_time_series_data: tool({
      description: 'Get response counts over time for creating time-based charts. Useful for seeing trends.',
      inputSchema: z.object({
        survey_id: z.string().optional().describe('Filter by specific survey'),
        group_by: z.enum(['hour', 'day', 'week', 'month']).optional().describe('How to group the data'),
        date_from: z.string().optional().describe('Start date (ISO format)'),
        date_to: z.string().optional().describe('End date (ISO format)'),
      }),
      execute: async (args) => getTimeSeriesData(userId, args),
    }),
    
    generate_chart: tool({
      description: 'Generate a chart visualization. Use this AFTER getting data from other tools. The chart will be rendered inline in the chat.',
      inputSchema: z.object({
        type: z.enum(['bar', 'line', 'area', 'pie', 'radar', 'radial']).describe('Type of chart to generate'),
        title: z.string().describe('Chart title'),
        description: z.string().optional().describe('Brief description for the chart'),
        data: z.array(z.record(z.any())).describe('Array of data objects for the chart'),
        config: z.record(z.object({
          label: z.string(),
          color: z.string().optional(),
        })).describe('Configuration for each data series (key = data field name)'),
        xAxisKey: z.string().optional().describe('Key in data objects for x-axis labels (default: "name")'),
        dataKey: z.string().optional().describe('Key for single-value charts like pie (default: "value")'),
      }),
      execute: async (args) => generateChart(args),
    }),
  };
}

// Web search tool (only added when enabled)
function createWebSearchTool() {
  return {
    search_web: tool({
      description: 'Search the web for information. Use this when the user asks about something not in their survey data, or needs external information like best practices, industry benchmarks, or general knowledge.',
      inputSchema: z.object({
        query: z.string().describe('The search query'),
      }),
      execute: async ({ query }) => {
        // For now, return a message indicating the search would happen
        // In production, you would integrate with a search API like Tavily, Brave, or SerpAPI
        return JSON.stringify({
          note: 'Web search capability is enabled. In production, this would search the web.',
          query,
          suggestion: 'For now, I can help you with your survey data instead. What would you like to know?',
        });
      },
    }),
  };
}

export async function POST(request: NextRequest) {
  try {
    // Security: Get authenticated user from session instead of trusting client
    const [user, errorResponse] = await requireAuth();
    if (!user) return errorResponse;

    const body = await request.json();
    const { messages, model = 'claude-haiku', userPreferences, createMode, searchWebEnabled = true, references = [], designTheme } = body;

    // Check if user can use premium models (free users only get Claude Haiku)
    const isPremiumModel = model !== 'claude-haiku' && !model.includes('haiku');
    if (isPremiumModel) {
      const featureCheck = await checkFeatureAccess(user.id, 'premiumModels');
      if (!featureCheck) {
        return Response.json(
          {
            error: 'Premium model not available',
            message: 'Upgrade to Pro or Max to use GPT-5 and other premium models',
            upgradeRequired: 'pro'
          },
          { status: 403 }
        );
      }
    }

    // Check credits for this chat action
    const creditAction = getChatModelAction(model);
    const creditCheck = await checkCreditsForStream(user.id, creditAction, {
      rateLimitFeature: 'dashboardChat',
    });

    if (!creditCheck.allowed) {
      return creditCheck.error;
    }

    // Deduct credits (for streaming, we deduct upfront)
    await deductCreditsAfterStream(user.id, creditAction, {
      model,
      createMode,
      messageCount: messages?.length || 0,
    });

    console.log('📦 Dashboard chat received:', {
      messageCount: messages?.length,
      model,
      userId: user.id,
      createMode,
      searchWebEnabled,
      referencesCount: references?.length || 0,
      designTheme: designTheme?.name || 'default',
    });

    // Fetch referenced content
    let referenceContext = '';
    if (references && references.length > 0) {
      const refContents: string[] = [];
      
      for (const ref of references) {
        if (ref.type === 'survey') {
          // Fetch survey details
          const { data: survey } = await supabase
            .from('projects')
            .select('id, title, description, survey_schema, status')
            .eq('id', ref.id)
            .eq('user_id', user.id)
            .single();
          
          if (survey) {
            let surveyInfo = `\n--- REFERENCED SURVEY: "${survey.title}" (ID: ${survey.id}) ---\n`;
            surveyInfo += `Status: ${survey.status}\n`;
            if (survey.description) surveyInfo += `Description: ${survey.description}\n`;
            
            // Extract questions from schema
            if (survey.survey_schema) {
              const questions: string[] = [];
              const schema = survey.survey_schema;
              
              if (schema.questions) {
                schema.questions.forEach((q: any, idx: number) => {
                  questions.push(`${idx + 1}. [${q.type}] ${q.title || q.question || q.text}`);
                });
              } else if (Array.isArray(schema)) {
                schema.forEach((q: any, idx: number) => {
                  questions.push(`${idx + 1}. [${q.type}] ${q.title || q.question || q.text}`);
                });
              }
              
              if (questions.length > 0) {
                surveyInfo += `Questions (${questions.length}):\n${questions.join('\n')}\n`;
              }
            }
            
            refContents.push(surveyInfo);
          }
        } else if (ref.type === 'chat') {
          // Fetch chat session
          const { data: chat } = await supabase
            .from('dashboard_chat_sessions')
            .select('id, title, messages')
            .eq('id', ref.id)
            .eq('user_id', user.id)
            .single();
          
          if (chat && chat.messages) {
            let chatInfo = `\n--- REFERENCED CHAT: "${chat.title}" (ID: ${chat.id}) ---\n`;
            const msgs = Array.isArray(chat.messages) ? chat.messages : [];
            chatInfo += msgs.slice(-10).map((m: any) => `${m.role}: ${m.content?.slice(0, 500)}${m.content?.length > 500 ? '...' : ''}`).join('\n');
            refContents.push(chatInfo);
          }
        }
      }
      
      if (refContents.length > 0) {
        referenceContext = '\n\nREFERENCED CONTENT (user has attached this for context):\n' + refContents.join('\n');
      }
    }

    // Get user's survey count for context
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title')
      .eq('user_id', user.id);

    const surveyCount = projects?.length || 0;
    const surveyList = projects?.slice(0, 5).map(p => `"${p.title || 'Untitled'}"`).join(', ') || 'none';

    // Build personalization based on user preferences
    let personalization = '';
    if (userPreferences) {
      const parts: string[] = [];

      if (userPreferences.displayName) {
        parts.push(`The user's name is "${userPreferences.displayName}". Address them by name when appropriate, especially in greetings.`);
      }

      const toneInstructions: Record<string, string> = {
        professional: 'Maintain a professional, business-like tone. Be clear, direct, and focused on results.',
        casual: 'Use a casual, relaxed tone. Feel free to use contractions and be conversational.',
        friendly: 'Be warm and friendly. Use an encouraging, supportive tone while remaining helpful.',
        formal: 'Use formal language. Be respectful, precise, and maintain a traditional professional demeanor.',
        creative: 'Be creative and engaging. Use vivid language, analogies, and make the conversation interesting.',
      };

      if (userPreferences.tone) {
        parts.push(toneInstructions[userPreferences.tone] || toneInstructions.professional);
      }

      if (userPreferences.workFunction && userPreferences.workFunction !== 'Select your work function') {
        parts.push(`The user works as a ${userPreferences.workFunction}. Tailor your responses to their professional context when relevant.`);
      }

      if (userPreferences.personalPreferences) {
        parts.push(`User's custom preferences: ${userPreferences.personalPreferences}`);
      }

      if (parts.length > 0) {
        personalization = '\n\nUser Preferences:\n' + parts.join('\n');
      }
    }

    // Build design theme instructions
    let designThemeInstructions = '';
    if (designTheme && designTheme.id !== 'default') {
      designThemeInstructions = `

SELECTED COLOR THEME: ${designTheme.name}

**Color Palette:**
- Background: ${designTheme.colors[0]}
- Text: ${designTheme.colors[1]}
- Surface: ${designTheme.colors[2]}
- Accent: ${designTheme.colors[3]}

${designTheme.description ? `**Theme Vibe:** ${designTheme.description}` : ''}

**CRITICAL:** Apply these colors throughout the survey design:
- Use Background for page/container backgrounds
- Use Text for all readable content
- Use Surface for cards, inputs, and secondary containers
- Use Accent for buttons, links, and highlights`;
    }

    // Build system prompt based on create mode
    let systemPrompt = '';
    
    if (createMode === 'Charts') {
      systemPrompt = `You are Surbee, an expert data analyst and visualization specialist.

User has ${surveyCount} surveys: ${surveyList}${surveyCount > 5 ? '...' : ''}

Your job is to help users visualize their survey data with beautiful charts.

WORKFLOW:
1. First, understand what the user wants to visualize
2. Use tools to fetch the relevant data (get_all_surveys, get_survey_stats, query_responses, analyze_question, get_time_series_data)
3. Process and format the data appropriately
4. Use generate_chart tool to create the visualization

IMPORTANT: When generating charts, ALWAYS use the generate_chart tool. The chart will be rendered inline.

Available chart types:
- bar: Compare categories (best for survey response distributions)
- line: Show trends over time
- area: Show cumulative data over time
- pie: Show proportions/percentages
- radar: Compare multiple metrics
- radial: Show progress toward goals

Tips:
- For question analysis, use 'bar' or 'pie' charts
- For time-based data, use 'line' or 'area' charts
- Keep data series to 5 or fewer for readability
- Always provide clear titles and descriptions${personalization}${referenceContext}${designThemeInstructions}`;
    } else {
      systemPrompt = `You are Surbee, an intelligent AI assistant with deep access to survey data.

User has ${surveyCount} surveys: ${surveyList}${surveyCount > 5 ? '...' : ''}

CAPABILITIES:
You have powerful tools to access ANY data from the user's surveys:
- List all surveys and their details
- Query responses with complex filters (by time, completion status, date range, etc.)
- Get individual response details with all answers
- Analyze specific questions (distribution, common answers)
- Generate time series data
- Create charts and visualizations

EXAMPLES OF WHAT YOU CAN DO:
- "Show me the first 10 people who completed survey X in under 10 minutes" → Use query_responses with max_completion_time_seconds=600, order_by=created_at, limit=10
- "What were the most common answers to question Y?" → Use analyze_question
- "How many responses did I get last week?" → Use get_time_series_data or query_responses with date filters
- "Show me flagged responses" → Use query_responses with flagged_only=true
- "Create a chart of responses over time" → Use get_time_series_data then generate_chart

RULES:
- Always use tools to get real data before answering data questions
- Be concise but thorough
- If asked to visualize data, use generate_chart after fetching data
- For complex queries, break them into steps using multiple tool calls
- Never make up data - always fetch it first${searchWebEnabled ? '\n- You can search the web for information using the search_web tool if needed' : ''}${personalization}${referenceContext}${designThemeInstructions}`;
    }

    // Transform messages to model format
    const transformedMessages = messages.map((m: any) => {
      if (m.parts && Array.isArray(m.parts)) {
        const textParts = m.parts.filter((p: any) => p.type === 'text');
        const content = textParts.map((p: any) => p.text).join('\n') || '';
        return { role: m.role, content };
      }
      if (typeof m.content === 'string') {
        return { role: m.role, content: m.content };
      }
      return { role: m.role, content: '' };
    }).filter((m: any) => m.content);

    console.log('📤 Sending to model with tools');

    // Create tools with userId
    const baseTools = createTools(user.id);
    
    // Conditionally add web search tool
    const tools = searchWebEnabled 
      ? { ...baseTools, ...createWebSearchTool() }
      : baseTools;

    // Use streamText with tools
    const result = streamText({
      model: getModel(model),
      system: systemPrompt,
      messages: transformedMessages,
      tools,
      maxSteps: 10, // Allow multiple tool calls for complex queries
    });

    // Return the UI message stream response for useChat
    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('Error in dashboard chat API:', error);
    console.error('Error stack:', error.stack);
    return Response.json(
      { error: error.message || 'Failed to process chat', details: error.toString() },
      { status: 500 }
    );
  }
}
