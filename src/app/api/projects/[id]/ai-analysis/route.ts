import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const runtime = 'edge';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { component, userId } = body;

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

    // Fetch project survey responses for context
    const { data: responses } = await supabaseAdmin
      .from('survey_responses')
      .select('*')
      .eq('survey_id', projectId)
      .order('created_at', { ascending: false })
      .limit(100);

    // Build analysis prompt
    const prompt = buildAnalysisPrompt(component, project, responses || []);

    // Stream using Vercel AI SDK
    const result = streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt: prompt,
      maxTokens: 1024,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Error in AI analysis:', error);
    return new Response('Failed to generate analysis', { status: 500 });
  }
}

function buildAnalysisPrompt(
  component: any,
  project: any,
  responses: any[]
): string {
  let prompt = `You are an expert data analyst helping analyze survey data and components.

Project: ${project.title}
${project.description ? `Description: ${project.description}` : ''}

Total Responses: ${responses.length}

`;

  if (component) {
    prompt += `You are analyzing the following component:

Component Type: ${component.componentType}
Component Label: ${component.componentLabel}

Component Data:
${component.summary}

`;
  } else {
    prompt += `No specific component is being analyzed. Provide general insights about the project.\n\n`;
  }

  // Add summary statistics
  if (responses.length > 0) {
    const completedResponses = responses.filter((r) => r.completed_at);
    const avgQuality =
      responses.reduce((acc, r) => acc + (r.fraud_score || 0), 0) /
      responses.length;

    prompt += `
Response Statistics:
- Completed: ${completedResponses.length} / ${responses.length}
- Average Quality Score: ${(avgQuality * 100).toFixed(1)}%

`;
  }

  prompt += `
Please provide a concise, insightful analysis of this ${component ? 'component' : 'project'}. Include:
1. Key insights or patterns
2. Notable trends or anomalies
3. Actionable recommendations

Keep your response under 200 words and use markdown formatting for readability.
`;

  return prompt;
}
