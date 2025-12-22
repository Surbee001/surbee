import { generateText, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { supabaseAdmin } from '@/lib/supabase-server';
import {
  EvaluationMode,
  EvaluationStatus,
  ParsedQuestion,
  AgentAnswer,
  EvaluationIssue,
  EvaluationSuggestion,
  SuggestedChange,
  EvaluationEvent,
  EVALUATION_MODELS,
} from '@/lib/schemas/evaluation-schemas';
import { SurveyComponent, SurveyPage } from '@/lib/schemas/survey-schemas';
import { v4 as uuidv4 } from 'uuid';

// Create Anthropic provider
const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Types
interface SandboxBundle {
  files: Record<string, string>;
  entry: string;
  dependencies?: string[];
}

interface EvaluationConfig {
  projectId: string;
  userId: string;
  mode: EvaluationMode;
  modelId: string;
  customCriteria?: string;
  includeResponseData?: boolean;
  onEvent: (event: EvaluationEvent) => void;
}

interface ProjectData {
  id: string;
  title: string;
  survey_schema: any;
  sandbox_bundle: SandboxBundle | null;
}

// Get model instance based on ID
function getModel(modelId: string) {
  const modelConfig = EVALUATION_MODELS.find(m => m.id === modelId);

  if (!modelConfig) {
    return openai('gpt-4o');
  }

  switch (modelConfig.provider) {
    case 'anthropic':
      return anthropic(modelId);
    case 'openai':
    default:
      return openai(modelId);
  }
}

// Parse survey schema to extract questions
function parseSurveyQuestions(surveySchema: any): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  if (!surveySchema) return questions;

  // Handle different schema formats
  if (surveySchema.pages && Array.isArray(surveySchema.pages)) {
    for (const page of surveySchema.pages) {
      if (page.components && Array.isArray(page.components)) {
        for (const component of page.components as SurveyComponent[]) {
          questions.push({
            id: component.id,
            type: component.type,
            label: component.label,
            description: component.description,
            required: component.required || false,
            options: component.props?.options || component.validation?.options,
            validation: component.validation,
            pageId: component.pageId || page.id,
            position: component.position,
          });
        }
      }
    }
  }

  // Handle flat component array
  if (surveySchema.components && Array.isArray(surveySchema.components)) {
    for (const component of surveySchema.components as SurveyComponent[]) {
      questions.push({
        id: component.id,
        type: component.type,
        label: component.label,
        description: component.description,
        required: component.required || false,
        options: component.props?.options || component.validation?.options,
        validation: component.validation,
        pageId: component.pageId,
        position: component.position,
      });
    }
  }

  // Handle detected_questions from imports
  if (surveySchema.detected_questions && Array.isArray(surveySchema.detected_questions)) {
    for (let i = 0; i < surveySchema.detected_questions.length; i++) {
      const q = surveySchema.detected_questions[i];
      questions.push({
        id: q.id || `q_${i}`,
        type: q.type || 'text-input',
        label: q.text || q.label || `Question ${i + 1}`,
        description: q.description,
        required: q.required || false,
        options: q.options,
        position: i,
      });
    }
  }

  return questions.sort((a, b) => (a.position || 0) - (b.position || 0));
}

// Generate mode-specific persona prompt
function getModePersona(mode: EvaluationMode, customCriteria?: string): string {
  const personas: Record<EvaluationMode, string> = {
    human_like: `You are simulating a typical survey respondent. Behave naturally:
- Read questions carefully but not too slowly
- Give thoughtful, realistic answers
- Occasionally pause to think (vary response times)
- Make occasional typos or informal responses where appropriate
- Show natural hesitation on sensitive questions
- Skip optional questions sometimes`,

    edge_case: `You are a QA tester looking for edge cases and boundary conditions:
- Test empty inputs on required fields
- Try maximum length text inputs
- Use special characters (!@#$%^&*()_+-=[]{}|;':\",./<>?)
- Test unicode and emoji characters
- Try very long and very short answers
- Test skip logic by giving unexpected answers
- Look for validation bypass opportunities
- Test all boundary values for numeric inputs`,

    stress_test: `You are stress testing the survey for performance and robustness:
- Complete as quickly as possible
- Use random selections for choice questions
- Test required field validation
- Submit partial responses
- Try to break the flow with rapid responses
- Test back/forward navigation if available`,

    custom: customCriteria || 'Follow user-specified evaluation criteria.',

    all: `You are conducting a comprehensive evaluation combining multiple perspectives:
1. First pass: Human-like realistic responses
2. Second pass: Edge case testing
3. Third pass: Stress testing
Identify issues from all perspectives.`,
  };

  return personas[mode];
}

// Generate answer for a question based on mode
async function generateAnswer(
  question: ParsedQuestion,
  mode: EvaluationMode,
  modelId: string,
  customCriteria?: string,
  previousAnswers?: AgentAnswer[]
): Promise<AgentAnswer> {
  const model = getModel(modelId);
  const persona = getModePersona(mode, customCriteria);

  const prompt = `${persona}

You are answering the following survey question:

Question ID: ${question.id}
Question Type: ${question.type}
Question: ${question.label}
${question.description ? `Description: ${question.description}` : ''}
Required: ${question.required ? 'Yes' : 'No'}
${question.options ? `Options: ${question.options.join(', ')}` : ''}
${question.validation ? `Validation: ${JSON.stringify(question.validation)}` : ''}

${previousAnswers?.length ? `Previous answers in this session:
${previousAnswers.map(a => `- ${a.questionText}: ${JSON.stringify(a.answer)}`).join('\n')}` : ''}

Respond with a JSON object containing:
{
  "answer": <your answer - string, number, array, or object depending on question type>,
  "reasoning": "<why you chose this answer based on your persona>",
  "timeSpent": <simulated seconds to answer, realistic for the persona>,
  "issues": [
    {
      "id": "<unique id>",
      "type": "<ux|clarity|logic|accessibility|bias|technical|validation>",
      "severity": "<critical|high|medium|low>",
      "description": "<what issue you found>"
    }
  ],
  "observations": ["<any observations about the question>"]
}

Be thorough in identifying issues. Consider:
- Is the question clear and unambiguous?
- Are there any UX problems?
- Could the wording be biased?
- Are there accessibility concerns?
- Is the validation appropriate?
- Could this confuse respondents?`;

  try {
    const result = await generateText({
      model,
      prompt,
      temperature: mode === 'human_like' ? 0.8 : 0.3,
    });

    const parsed = JSON.parse(result.text.replace(/```json\n?|\n?```/g, ''));

    return {
      questionId: question.id,
      questionText: question.label,
      questionType: question.type,
      answer: parsed.answer,
      reasoning: parsed.reasoning,
      timeSpent: parsed.timeSpent || Math.random() * 10 + 2,
      issues: (parsed.issues || []).map((issue: any) => ({
        ...issue,
        id: issue.id || uuidv4(),
        questionId: question.id,
      })),
      observations: parsed.observations || [],
    };
  } catch (error) {
    console.error('Error generating answer:', error);
    return {
      questionId: question.id,
      questionText: question.label,
      questionType: question.type,
      answer: mode === 'edge_case' ? '' : 'Error generating response',
      reasoning: 'Failed to generate answer',
      timeSpent: 0,
      issues: [{
        id: uuidv4(),
        questionId: question.id,
        type: 'technical',
        severity: 'high',
        description: `Agent failed to process this question: ${error}`,
      }],
      observations: [],
    };
  }
}

// Generate suggestions based on issues found
async function generateSuggestions(
  issues: EvaluationIssue[],
  projectId: string,
  evaluationRunId: string,
  sandboxBundle: SandboxBundle | null,
  modelId: string
): Promise<EvaluationSuggestion[]> {
  if (issues.length === 0) return [];

  const model = getModel(modelId);
  const filesList = sandboxBundle?.files
    ? Object.keys(sandboxBundle.files).map(f => `- ${f}`).join('\n')
    : 'No files available';

  const prompt = `You are a survey UX expert generating actionable suggestions to fix issues.

Issues found during evaluation:
${issues.map(i => `- [${i.severity.toUpperCase()}] ${i.type}: ${i.description} (Question: ${i.questionId || 'N/A'})`).join('\n')}

Available files in the project:
${filesList}

For each issue, generate a suggestion with specific code changes if applicable.

Respond with a JSON array of suggestions:
[
  {
    "category": "<ux|clarity|logic|accessibility|bias|technical|validation>",
    "severity": "<critical|high|medium|low>",
    "title": "<short title>",
    "description": "<detailed description of what to change>",
    "reasoning": "<why this will help>",
    "questionId": "<if applicable>",
    "suggestedChanges": [
      {
        "filePath": "<file to modify>",
        "changeType": "<edit|add|delete>",
        "searchPattern": "<text to find for edit>",
        "replaceWith": "<replacement text>",
        "description": "<what this change does>"
      }
    ]
  }
]

Group related issues into single suggestions where appropriate.
Prioritize by severity (critical first).
Only include suggestedChanges if you have enough context to make specific code changes.`;

  try {
    const result = await generateText({
      model,
      prompt,
      temperature: 0.3,
    });

    const parsed = JSON.parse(result.text.replace(/```json\n?|\n?```/g, ''));

    return parsed.map((suggestion: any) => ({
      id: uuidv4(),
      evaluationRunId,
      projectId,
      category: suggestion.category,
      severity: suggestion.severity,
      title: suggestion.title,
      description: suggestion.description,
      reasoning: suggestion.reasoning,
      questionId: suggestion.questionId,
      suggestedChanges: suggestion.suggestedChanges,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error generating suggestions:', error);
    return [];
  }
}

// Calculate overall score based on issues
function calculateScore(issues: EvaluationIssue[]): number {
  if (issues.length === 0) return 100;

  const weights = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3,
  };

  const deductions = issues.reduce((sum, issue) => {
    return sum + (weights[issue.severity] || 5);
  }, 0);

  return Math.max(0, 100 - deductions);
}

// Main evaluation function
export async function runEvaluation(config: EvaluationConfig): Promise<void> {
  const { projectId, userId, mode, modelId, customCriteria, includeResponseData, onEvent } = config;

  // Create evaluation run in database
  const { data: evalRun, error: createError } = await supabaseAdmin
    .from('evaluation_runs')
    .insert({
      project_id: projectId,
      user_id: userId,
      mode,
      model_used: modelId,
      custom_criteria: customCriteria,
      include_response_data: includeResponseData,
      status: 'running',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError || !evalRun) {
    onEvent({ type: 'error', message: `Failed to create evaluation run: ${createError?.message}` });
    return;
  }

  const evaluationRunId = evalRun.id;

  try {
    onEvent({ type: 'status', status: 'running', message: 'Starting evaluation...' });

    // Fetch project data
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, title, survey_schema, sandbox_bundle')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      throw new Error(`Failed to fetch project: ${projectError?.message}`);
    }

    onEvent({ type: 'thinking', content: 'Analyzing survey structure...' });

    // Parse questions from survey schema
    const questions = parseSurveyQuestions(project.survey_schema);

    if (questions.length === 0) {
      throw new Error('No questions found in survey schema');
    }

    onEvent({ type: 'thinking', content: `Found ${questions.length} questions to evaluate` });
    onEvent({ type: 'progress', current: 0, total: questions.length });

    // Answer each question
    const allAnswers: AgentAnswer[] = [];
    const allIssues: EvaluationIssue[] = [];

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      onEvent({
        type: 'thinking',
        content: `Answering question ${i + 1}/${questions.length}: "${question.label.substring(0, 50)}..."`
      });

      const answer = await generateAnswer(
        question,
        mode,
        modelId,
        customCriteria,
        allAnswers
      );

      allAnswers.push(answer);
      allIssues.push(...answer.issues);

      onEvent({ type: 'answer', answer });
      onEvent({ type: 'progress', current: i + 1, total: questions.length, questionId: question.id });

      // Emit issues as they're found
      for (const issue of answer.issues) {
        onEvent({ type: 'issue', issue });
      }
    }

    onEvent({ type: 'thinking', content: 'Generating improvement suggestions...' });

    // Generate suggestions based on issues
    const suggestions = await generateSuggestions(
      allIssues,
      projectId,
      evaluationRunId,
      project.sandbox_bundle as SandboxBundle | null,
      modelId
    );

    // Save suggestions to database
    if (suggestions.length > 0) {
      const { error: suggestionsError } = await supabaseAdmin
        .from('evaluation_suggestions')
        .insert(suggestions.map(s => ({
          id: s.id,
          evaluation_run_id: evaluationRunId,
          project_id: projectId,
          category: s.category,
          severity: s.severity,
          title: s.title,
          description: s.description,
          reasoning: s.reasoning,
          question_id: s.questionId,
          suggested_changes: s.suggestedChanges,
          status: 'pending',
        })));

      if (suggestionsError) {
        console.error('Error saving suggestions:', suggestionsError);
      }

      // Emit suggestions
      for (const suggestion of suggestions) {
        onEvent({ type: 'suggestion', suggestion });
      }
    }

    // Calculate overall score
    const overallScore = calculateScore(allIssues);

    // Generate overall reasoning
    const model = getModel(modelId);
    const reasoningResult = await generateText({
      model,
      prompt: `Summarize the evaluation of this survey in 2-3 sentences.

Score: ${overallScore}/100
Issues found: ${allIssues.length}
- Critical: ${allIssues.filter(i => i.severity === 'critical').length}
- High: ${allIssues.filter(i => i.severity === 'high').length}
- Medium: ${allIssues.filter(i => i.severity === 'medium').length}
- Low: ${allIssues.filter(i => i.severity === 'low').length}

Top issues:
${allIssues.slice(0, 5).map(i => `- ${i.description}`).join('\n')}

Provide a brief, actionable summary.`,
    });

    // Update evaluation run with results
    const { error: updateError } = await supabaseAdmin
      .from('evaluation_runs')
      .update({
        status: 'completed',
        overall_score: overallScore,
        agent_responses: allAnswers,
        issues_found: allIssues,
        reasoning: reasoningResult.text,
        completed_at: new Date().toISOString(),
      })
      .eq('id', evaluationRunId);

    if (updateError) {
      console.error('Error updating evaluation run:', updateError);
    }

    // Emit completion
    onEvent({
      type: 'complete',
      result: {
        id: evaluationRunId,
        projectId,
        userId,
        mode,
        modelUsed: modelId,
        customCriteria,
        includeResponseData: includeResponseData || false,
        status: 'completed',
        overallScore,
        agentResponses: allAnswers,
        issuesFound: allIssues,
        reasoning: reasoningResult.text,
        startedAt: evalRun.started_at,
        completedAt: new Date().toISOString(),
        createdAt: evalRun.created_at,
      },
    });

  } catch (error) {
    console.error('Evaluation error:', error);

    // Update run as failed
    await supabaseAdmin
      .from('evaluation_runs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', evaluationRunId);

    onEvent({
      type: 'error',
      message: error instanceof Error ? error.message : 'Evaluation failed',
    });
  }
}

// Apply a suggestion to the project
export async function applySuggestion(
  suggestionId: string,
  projectId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch suggestion
    const { data: suggestion, error: fetchError } = await supabaseAdmin
      .from('evaluation_suggestions')
      .select('*')
      .eq('id', suggestionId)
      .single();

    if (fetchError || !suggestion) {
      return { success: false, error: 'Suggestion not found' };
    }

    if (suggestion.status === 'applied') {
      return { success: false, error: 'Suggestion already applied' };
    }

    // Fetch project sandbox bundle
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('sandbox_bundle')
      .eq('id', projectId)
      .single();

    if (projectError || !project) {
      return { success: false, error: 'Project not found' };
    }

    const sandboxBundle = project.sandbox_bundle as SandboxBundle | null;

    if (!sandboxBundle?.files) {
      return { success: false, error: 'No sandbox files to modify' };
    }

    const changes = suggestion.suggested_changes as SuggestedChange[] | null;

    if (!changes || changes.length === 0) {
      // No code changes, just mark as applied
      await supabaseAdmin
        .from('evaluation_suggestions')
        .update({
          status: 'applied',
          applied_at: new Date().toISOString(),
          applied_by: userId,
        })
        .eq('id', suggestionId);

      return { success: true };
    }

    // Apply each change
    const updatedFiles = { ...sandboxBundle.files };

    for (const change of changes) {
      const filePath = change.filePath;

      if (change.changeType === 'edit' && change.searchPattern && change.replaceWith) {
        if (updatedFiles[filePath]) {
          updatedFiles[filePath] = updatedFiles[filePath].replace(
            change.searchPattern,
            change.replaceWith
          );
        }
      } else if (change.changeType === 'add' && change.newContent) {
        updatedFiles[filePath] = (updatedFiles[filePath] || '') + '\n' + change.newContent;
      } else if (change.changeType === 'delete') {
        delete updatedFiles[filePath];
      }
    }

    // Update project with new sandbox bundle
    const { error: updateError } = await supabaseAdmin
      .from('projects')
      .update({
        sandbox_bundle: {
          ...sandboxBundle,
          files: updatedFiles,
        },
      })
      .eq('id', projectId);

    if (updateError) {
      return { success: false, error: 'Failed to update project' };
    }

    // Mark suggestion as applied
    await supabaseAdmin
      .from('evaluation_suggestions')
      .update({
        status: 'applied',
        applied_at: new Date().toISOString(),
        applied_by: userId,
      })
      .eq('id', suggestionId);

    return { success: true };
  } catch (error) {
    console.error('Error applying suggestion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply suggestion'
    };
  }
}

// Dismiss a suggestion
export async function dismissSuggestion(
  suggestionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from('evaluation_suggestions')
      .update({ status: 'dismissed' })
      .eq('id', suggestionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to dismiss suggestion'
    };
  }
}

// Get evaluation history for a project
export async function getEvaluationHistory(
  projectId: string,
  limit: number = 10
): Promise<{ runs: any[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('evaluation_runs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { runs: [], error: error.message };
    }

    return { runs: data || [] };
  } catch (error) {
    return {
      runs: [],
      error: error instanceof Error ? error.message : 'Failed to fetch history'
    };
  }
}

// Get suggestions for an evaluation run
export async function getEvaluationSuggestions(
  evaluationRunId: string
): Promise<{ suggestions: EvaluationSuggestion[]; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from('evaluation_suggestions')
      .select('*')
      .eq('evaluation_run_id', evaluationRunId)
      .order('severity', { ascending: true });

    if (error) {
      return { suggestions: [], error: error.message };
    }

    return {
      suggestions: (data || []).map(s => ({
        id: s.id,
        evaluationRunId: s.evaluation_run_id,
        projectId: s.project_id,
        category: s.category,
        severity: s.severity,
        title: s.title,
        description: s.description,
        reasoning: s.reasoning,
        questionId: s.question_id,
        suggestedChanges: s.suggested_changes,
        status: s.status,
        appliedAt: s.applied_at,
        appliedBy: s.applied_by,
        createdAt: s.created_at,
      }))
    };
  } catch (error) {
    return {
      suggestions: [],
      error: error instanceof Error ? error.message : 'Failed to fetch suggestions'
    };
  }
}
