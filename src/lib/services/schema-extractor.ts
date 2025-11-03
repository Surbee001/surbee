/**
 * Utility to extract survey schema from generated components
 * and save it to the project
 */

import { ProjectsService } from './projects';

/**
 * Extract survey schema from generated React components or HTML
 * This function attempts to parse the structure from component code
 */
export async function extractAndSaveSurveySchema(
  projectId: string,
  userId: string,
  generatedContent: {
    components?: any[];
    survey?: any;
    spec?: any;
  }
): Promise<{ success: boolean; schema: any; error?: string }> {
  try {
    let schema = null;

    // Priority 1: Use survey spec if available (from AI generation output)
    if (generatedContent.spec) {
      schema = generatedContent.spec;
    }

    // Priority 2: Use survey object if available
    if (generatedContent.survey && !schema) {
      schema = generatedContent.survey;
    }

    // Priority 3: Build schema from components
    if (!schema && generatedContent.components) {
      schema = buildSchemaFromComponents(generatedContent.components);
    }

    if (!schema) {
      return {
        success: false,
        schema: null,
        error: 'Could not extract survey schema from generated content'
      };
    }

    // Save the schema to the project
    const { data: updatedProject, error } = await ProjectsService.updateSurveySchema(
      projectId,
      userId,
      schema
    );

    if (error) {
      return {
        success: false,
        schema: null,
        error: error.message
      };
    }

    return {
      success: true,
      schema: schema,
      error: undefined
    };
  } catch (error: any) {
    return {
      success: false,
      schema: null,
      error: error?.message || 'Failed to extract and save survey schema'
    };
  }
}

/**
 * Build a survey schema from an array of components
 */
function buildSchemaFromComponents(components: any[]): any {
  const questions: any[] = [];
  
  for (const component of components) {
    // Skip non-question components
    if (component.type === 'text' || component.type === 'content' || !component.type) {
      continue;
    }

    const question = {
      id: component.id || `q-` + Math.random().toString(36).substr(2, 9),
      question_text: component.label || component.name || '',
      question_type: mapComponentTypeToQuestionType(component.type),
      options: component.options || [],
      required: component.required || false,
      metadata: {
        description: component.description,
        props: component.props,
        validation: component.validation
      }
    };

    questions.push(question);
  }

  return {
    id: `survey-` + Date.now(),
    title: 'Generated Survey',
    pages: [{
      id: 'page-1',
      title: 'Survey',
      blocks: questions.map(q => ({
        kind: 'question',
        id: q.id,
        label: q.question_text,
        type: q.question_type,
        options: q.options,
        required: q.required,
        helpText: q.metadata?.description || '',
        analyticsTags: []
      }))
    }]
  };
}

/**
 * Map component type to question type
 */
function mapComponentTypeToQuestionType(componentType: string): string {
  const typeMap: Record<string, string> = {
    'text-input': 'text',
    'textarea': 'long_text',
    'select': 'single_select',
    'multiselect': 'multi_select',
    'radio': 'single_select',
    'checkbox': 'multi_select',
    'scale': 'rating',
    'slider': 'rating',
    'yes-no': 'yes_no',
    'likert': 'likert',
    'nps': 'nps',
    'date-picker': 'date',
    'time-picker': 'time',
    'email': 'email',
    'phone': 'phone',
    'matrix': 'matrix',
    'ranking': 'ranking'
  };

  return typeMap[componentType] || componentType;
}

/**
 * Generate a schema snapshot at a specific generation step
 */
export function createSchemaSnapshot(
  schema: any,
  generatedAt: string = new Date().toISOString(),
  version: string = '1.0'
): any {
  return {
    ...schema,
    metadata: {
      ...schema.metadata,
      generatedAt,
      version,
      schemaVersion: version
    }
  };
}
