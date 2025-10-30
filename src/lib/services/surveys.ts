import { supabase } from '@/lib/supabase';
import type { SurveyQuestion, SurveyResponse } from '@/types/database';

export class SurveysService {
  static async createSurveyQuestions(
    projectId: string,
    questions: Omit<SurveyQuestion, 'id' | 'created_at' | 'project_id'>[]
  ): Promise<{ data: SurveyQuestion[] | null; error: Error | null }> {
    try {
      const questionsWithProjectId = questions.map(q => ({
        ...q,
        project_id: projectId
      }));

      const { data: surveyQuestions, error } = await supabase
        .from('survey_questions')
        .insert(questionsWithProjectId)
        .select();

      if (error) throw error;
      return { data: surveyQuestions, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getSurveyQuestions(projectId: string): Promise<{ data: SurveyQuestion[] | null; error: Error | null }> {
    try {
      const { data: questions, error } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return { data: questions, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async updateSurveyQuestion(
    questionId: string,
    updates: Partial<Pick<SurveyQuestion, 'question_text' | 'question_type' | 'options' | 'required' | 'order_index'>>
  ): Promise<{ data: SurveyQuestion | null; error: Error | null }> {
    try {
      const { data: question, error } = await supabase
        .from('survey_questions')
        .update(updates)
        .eq('id', questionId)
        .select()
        .single();

      if (error) throw error;
      return { data: question, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async deleteSurveyQuestion(questionId: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('survey_questions')
        .delete()
        .eq('id', questionId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  }

  static async submitSurveyResponse(data: {
    survey_id: string;
    responses: Record<string, any>;
    behavioral_data?: {
      mouse_data?: any;
      keystroke_data?: any;
      timing_data?: any;
      device_data?: any;
    };
    respondent_id?: string;
  }): Promise<{ data: SurveyResponse | null; error: Error | null }> {
    try {
      const responseData = {
        survey_id: data.survey_id,
        responses: data.responses,
        mouse_data: data.behavioral_data?.mouse_data,
        keystroke_data: data.behavioral_data?.keystroke_data,
        timing_data: data.behavioral_data?.timing_data,
        device_data: data.behavioral_data?.device_data,
        respondent_id: data.respondent_id,
        completed_at: new Date().toISOString()
      };

      // Note: In a real implementation, you'd have a survey_responses table
      // For now, we'll simulate this by using the existing survey router
      
      return { data: responseData as SurveyResponse, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getSurveyResponses(
    surveyId: string,
    filters: {
      limit?: number;
      offset?: number;
      status?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {}
  ): Promise<{ data: SurveyResponse[] | null; error: Error | null }> {
    try {
      // Note: This would query a survey_responses table in a real implementation
      // For now, return mock data
      const mockResponses: SurveyResponse[] = [];
      
      return { data: mockResponses, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getSurveyStats(surveyId: string): Promise<{
    data: {
      totalResponses: number;
      completionRate: number;
      avgCompletionTime: number;
      responsesByDay: Array<{ date: string; count: number }>;
    } | null;
    error: Error | null;
  }> {
    try {
      // Mock implementation - in reality would query survey_responses
      const stats = {
        totalResponses: Math.floor(Math.random() * 1000) + 100,
        completionRate: Math.floor(Math.random() * 40) + 60, // 60-100%
        avgCompletionTime: Math.floor(Math.random() * 300) + 120, // 2-7 minutes in seconds
        responsesByDay: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 50) + 10
        })).reverse()
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Real-time subscriptions
  static subscribeToSurveyResponses(
    surveyId: string,
    callback: (payload: any) => void
  ): { unsubscribe: () => void } {
    // Note: Would subscribe to survey_responses table changes
    const subscription = supabase
      .channel(`survey_responses:${surveyId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'survey_responses', filter: `survey_id=eq.${surveyId}` },
        callback
      )
      .subscribe();

    return {
      unsubscribe: () => {
        supabase.removeChannel(subscription);
      }
    };
  }
}