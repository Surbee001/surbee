import { supabase } from '@/lib/supabase';
import type { SurveyResponse, Project } from '@/types/database';
import { subDays, format } from 'date-fns';

export interface AnalyticsMetrics {
  totalViews: number;
  totalResponses: number;
  completionRate: number;
  avgCompletionTime: number;
  lastResponse: Date | null;
}

export interface AccuracyMetrics {
  overallScore: number;
  attentionCheckPassRate: number;
  consistencyScore: number;
  speedAnomalies: number;
  patternFlags: number;
  qualityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface TimelineDataPoint {
  date: string;
  responses: number;
  views: number;
}

export interface QuestionAnalytics {
  id: string;
  question: string;
  type: string;
  responses: number;
  skipRate: number;
  avgRating?: number;
  options?: Array<{
    label: string;
    count: number;
    percentage: number;
  }>;
}

export class AnalyticsService {
  static async getProjectAnalytics(projectId: string, userId: string): Promise<{
    data: {
      project: Project;
      metrics: AnalyticsMetrics;
      accuracyMetrics: AccuracyMetrics;
      timelineData: TimelineDataPoint[];
      responses: SurveyResponse[];
      questionAnalytics: QuestionAnalytics[];
    } | null;
    error: Error | null;
  }> {
    try {
      // Get project details
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (projectError) throw projectError;

      // Get survey responses (mock for now since we don't have survey_responses table)
      // In a real scenario, you would have a survey_responses table
      const mockResponses: SurveyResponse[] = this.generateMockResponses(projectId);

      // Calculate metrics
      const metrics = this.calculateMetrics(mockResponses);
      const accuracyMetrics = this.calculateAccuracyMetrics(mockResponses);
      const timelineData = this.generateTimelineData();
      const questionAnalytics = this.generateQuestionAnalytics();

      return {
        data: {
          project,
          metrics,
          accuracyMetrics,
          timelineData,
          responses: mockResponses.slice(0, 50), // Limit for display
          questionAnalytics
        },
        error: null
      };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getProjectMetrics(projectId: string, userId: string): Promise<{
    data: AnalyticsMetrics | null;
    error: Error | null;
  }> {
    try {
      // In a real scenario, query actual survey responses
      const mockResponses = this.generateMockResponses(projectId);
      const metrics = this.calculateMetrics(mockResponses);
      
      return { data: metrics, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  static async getResponsesForProject(projectId: string, userId: string, filters: {
    status?: string;
    accuracyFilter?: string;
    searchQuery?: string;
  } = {}): Promise<{
    data: SurveyResponse[] | null;
    error: Error | null;
  }> {
    try {
      // Generate mock responses for now
      let responses = this.generateMockResponses(projectId);

      // Apply filters
      if (filters.status && filters.status !== 'all') {
        // Mock status filtering since we don't have real data
        responses = responses.filter(r => Math.random() > 0.3); // Mock filter
      }

      if (filters.accuracyFilter && filters.accuracyFilter !== 'all') {
        responses = responses.filter(response => {
          const score = response.fraud_score || 0;
          switch (filters.accuracyFilter) {
            case 'high': return score >= 0.8;
            case 'medium': return score >= 0.5 && score < 0.8;
            case 'low': return score < 0.5;
            default: return true;
          }
        });
      }

      if (filters.searchQuery) {
        responses = responses.filter(response => 
          response.id.toLowerCase().includes(filters.searchQuery!.toLowerCase())
        );
      }

      return { data: responses, error: null };
    } catch (error) {
      return { data: null, error: error as Error };
    }
  }

  // Helper methods for mock data generation
  private static generateMockResponses(projectId: string): SurveyResponse[] {
    const responses: SurveyResponse[] = [];
    const now = new Date();

    for (let i = 0; i < 100; i++) {
      const fraudScore = Math.random();
      const completedAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      
      responses.push({
        id: `response_${i + 1}`,
        created_at: completedAt.toISOString(),
        survey_id: projectId,
        responses: {
          q1: Math.floor(Math.random() * 5) + 1,
          q2: ['Option A', 'Option B', 'Option C'][Math.floor(Math.random() * 3)],
          q3: Math.random() > 0.2 ? 'Yes' : 'No'
        },
        fraud_score: fraudScore,
        is_flagged: fraudScore > 0.7,
        flag_reasons: fraudScore > 0.7 ? ['speed_anomaly', 'pattern_detected'] : [],
        completed_at: completedAt.toISOString()
      });
    }

    return responses;
  }

  private static calculateMetrics(responses: SurveyResponse[]): AnalyticsMetrics {
    const completed = responses.filter(r => r.completed_at);
    const totalViews = Math.floor(responses.length * 1.4); // Assume some didn't complete
    
    return {
      totalViews,
      totalResponses: responses.length,
      completionRate: totalViews > 0 ? (responses.length / totalViews) * 100 : 0,
      avgCompletionTime: 4.2, // Mock average
      lastResponse: responses.length > 0 ? new Date(responses[0].completed_at) : null
    };
  }

  private static calculateAccuracyMetrics(responses: SurveyResponse[]): AccuracyMetrics {
    const validResponses = responses.filter(r => r.fraud_score !== undefined);
    const avgScore = validResponses.reduce((sum, r) => sum + (r.fraud_score || 0), 0) / validResponses.length;
    
    const distribution = validResponses.reduce((acc, r) => {
      const score = (r.fraud_score || 0) * 100;
      if (score >= 80) acc.high++;
      else if (score >= 50) acc.medium++;
      else acc.low++;
      return acc;
    }, { high: 0, medium: 0, low: 0 });

    return {
      overallScore: avgScore * 100,
      attentionCheckPassRate: 91.2,
      consistencyScore: 85.7,
      speedAnomalies: validResponses.filter(r => r.flag_reasons?.includes('speed_anomaly')).length,
      patternFlags: validResponses.filter(r => r.flag_reasons?.includes('pattern_detected')).length,
      qualityDistribution: distribution
    };
  }

  private static generateTimelineData(): TimelineDataPoint[] {
    const data: TimelineDataPoint[] = [];
    for (let i = 30; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MMM dd'),
        responses: Math.floor(Math.random() * 20) + 5,
        views: Math.floor(Math.random() * 40) + 10
      });
    }
    return data;
  }

  private static generateQuestionAnalytics(): QuestionAnalytics[] {
    return [
      {
        id: 'q1',
        question: 'How satisfied are you with our service?',
        type: 'rating',
        responses: 340,
        skipRate: 2.1,
        avgRating: 4.2,
        options: [
          { label: '5 - Very Satisfied', count: 156, percentage: 45.9 },
          { label: '4 - Satisfied', count: 102, percentage: 30.0 },
          { label: '3 - Neutral', count: 51, percentage: 15.0 },
          { label: '2 - Dissatisfied', count: 21, percentage: 6.2 },
          { label: '1 - Very Dissatisfied', count: 10, percentage: 2.9 }
        ]
      },
      {
        id: 'q2',
        question: 'Which features do you use most?',
        type: 'multiple_choice',
        responses: 338,
        skipRate: 3.2,
        options: [
          { label: 'Dashboard', count: 285, percentage: 84.3 },
          { label: 'Reports', count: 198, percentage: 58.6 },
          { label: 'Analytics', count: 167, percentage: 49.4 },
          { label: 'Integrations', count: 89, percentage: 26.3 },
          { label: 'API', count: 45, percentage: 13.3 }
        ]
      }
    ];
  }
}