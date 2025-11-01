import { NextRequest, NextResponse } from 'next/server';
import { ProjectsService } from '@/lib/services/projects';
import { AnalyticsService } from '@/lib/services/analytics';
import { supabase } from '@/lib/supabase-server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await ProjectsService.getProject(id, userId);
    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found or you do not have permission' },
        { status: 404 }
      );
    }

    // If no survey schema, return empty analytics
    if (!project.survey_schema) {
      return NextResponse.json({
        projectId: id,
        surveyTitle: project.title,
        totalResponses: 0,
        completionRate: 0,
        questionsAnalytics: [],
        responses: [],
        lastUpdated: new Date().toISOString()
      });
    }

    // Extract questions from survey schema
    const questions = extractQuestionsFromSchema(project.survey_schema);

    // Fetch responses from Supabase
    const { data: responses, error: responsesError } = await supabase
      .from('survey_responses')
      .select('*')
      .eq('survey_id', id);

    if (responsesError) {
      return NextResponse.json(
        { error: responsesError.message },
        { status: 500 }
      );
    }

    const mappedResponses = (responses || []).map(r => ({
      id: r.id,
      created_at: r.created_at,
      survey_id: r.survey_id,
      user_id: r.user_id,
      session_id: r.session_id,
      responses: r.responses,
      mouse_data: r.mouse_data,
      keystroke_data: r.keystroke_data,
      timing_data: r.timing_data,
      device_data: r.device_data,
      fraud_score: r.fraud_score,
      is_flagged: r.is_flagged,
      flag_reasons: r.flag_reasons,
      respondent_id: r.respondent_id,
      completed_at: r.completed_at,
      ip_address: r.ip_address
    }));

    // Aggregate responses
    const analytics = AnalyticsService.aggregateResponses(
      questions,
      mappedResponses,
      project.title,
      id
    );

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract questions from survey schema
 * Handles both SurveySchema and SurveySpec formats
 */
function extractQuestionsFromSchema(schema: any): any[] {
  const questions: any[] = [];

  // Handle SurveySchema format (with pages)
  if (schema.pages && Array.isArray(schema.pages)) {
    for (const page of schema.pages) {
      if (page.components && Array.isArray(page.components)) {
        for (const component of page.components) {
          if (component.type !== 'text-block' && component.type !== 'content') {
            questions.push({
              id: component.id,
              project_id: schema.id,
              question_text: component.label,
              question_type: mapComponentTypeToQuestionType(component.type),
              options: component.props?.options || component.validation?.options,
              required: component.required || false,
              metadata: component.props
            });
          }
        }
      }
    }
  }

  // Handle SurveySpec format (with pages containing blocks)
  if (schema.pages && Array.isArray(schema.pages)) {
    for (const page of schema.pages) {
      if (page.blocks && Array.isArray(page.blocks)) {
        for (const block of page.blocks) {
          if (block.kind === 'question') {
            questions.push({
              id: block.id,
              project_id: schema.id,
              question_text: block.label,
              question_type: block.type,
              options: block.options,
              required: block.required,
              metadata: { helpText: block.helpText, tags: block.analyticsTags }
            });
          }
        }
      }
    }
  }

  return questions;
}

/**
 * Map component types to question types
 */
function mapComponentTypeToQuestionType(componentType: string): string {
  const typeMap: Record<string, string> = {
    'text-input': 'text_input',
    'textarea': 'long_text',
    'select': 'dropdown',
    'multiselect': 'checkbox',
    'radio': 'multiple_choice',
    'checkbox': 'checkbox',
    'scale': 'rating',
    'matrix': 'matrix',
    'ranking': 'ranking',
    'date-picker': 'date',
    'time-picker': 'time',
    'slider': 'slider',
    'yes-no': 'yes_no',
    'likert': 'likert',
    'nps': 'nps',
    'semantic-differential': 'semantic-differential',
    'custom': 'other'
  };

  return typeMap[componentType] || componentType;
}