import type { SurveyResponse, SurveyQuestion } from '@/types/database';

export interface QuestionAnalytics {
  questionId: string;
  questionText: string;
  questionType: string;
  totalResponses: number;
  metadata?: Record<string, any>;
  // Aggregated response data based on question type
  responseBreakdown?: {
    [key: string]: number | { value: string | number; count: number }[];
  };
  averageValue?: number; // For rating/numeric questions
  uniqueAnswers?: string[]; // For text questions
}

export interface SurveyAnalytics {
  projectId: string;
  surveyTitle: string;
  totalResponses: number;
  completionRate: number;
  averageCompletionTime?: number;
  questionsAnalytics: QuestionAnalytics[];
  responses: SurveyResponse[]; // Raw responses for detailed view
  lastUpdated: string;
}

export class AnalyticsService {
  /**
   * Aggregate responses for a survey based on its schema and responses
   */
  static aggregateResponses(
    questions: SurveyQuestion[],
    responses: SurveyResponse[],
    surveyTitle: string,
    projectId: string
  ): SurveyAnalytics {
    const questionsAnalytics: QuestionAnalytics[] = [];

    for (const question of questions) {
      const questionResponses = responses
        .map(r => r.responses?.[question.id])
        .filter(r => r !== undefined && r !== null);

      const questionAnalytics: QuestionAnalytics = {
        questionId: question.id,
        questionText: question.question_text,
        questionType: question.question_type,
        totalResponses: questionResponses.length,
        metadata: question.metadata
      };

      // Handle different question types
      switch (question.question_type) {
        case 'multiple_choice':
        case 'radio':
        case 'dropdown':
          questionAnalytics.responseBreakdown = this.aggregateMultipleChoice(
            questionResponses,
            question.options || []
          );
          break;

        case 'checkbox':
        case 'multiselect':
          questionAnalytics.responseBreakdown = this.aggregateMultiSelect(
            questionResponses
          );
          break;

        case 'rating':
        case 'nps':
        case 'scale':
        case 'slider':
          questionAnalytics.responseBreakdown = this.aggregateNumeric(
            questionResponses
          );
          questionAnalytics.averageValue = this.calculateAverage(
            questionResponses.map(r => typeof r === 'number' ? r : parseInt(r))
          );
          break;

        case 'likert':
        case 'semantic-differential':
          questionAnalytics.responseBreakdown = this.aggregateLikertScale(
            questionResponses
          );
          break;

        case 'text':
        case 'text_input':
        case 'long_text':
        case 'textarea':
        case 'email':
        case 'phone':
        case 'date':
        case 'time':
          questionAnalytics.uniqueAnswers = [...new Set(questionResponses.filter(r => typeof r === 'string'))];
          break;

        case 'ranking':
          questionAnalytics.responseBreakdown = this.aggregateRanking(
            questionResponses
          );
          break;

        case 'yes_no':
          questionAnalytics.responseBreakdown = this.aggregateYesNo(
            questionResponses
          );
          break;

        case 'other':
          // For custom types, just store the raw responses
          questionAnalytics.uniqueAnswers = questionResponses;
          break;

        default:
          break;
      }

      questionsAnalytics.push(questionAnalytics);
    }

    return {
      projectId,
      surveyTitle,
      totalResponses: responses.length,
      completionRate: responses.length > 0 ? 100 : 0,
      averageCompletionTime: this.calculateAverageCompletionTime(responses),
      questionsAnalytics,
      responses,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Aggregate multiple choice responses
   */
  private static aggregateMultipleChoice(
    responses: any[],
    options: string[]
  ): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const option of options) {
      breakdown[option] = 0;
    }

    for (const response of responses) {
      const answer = response?.toString?.() || response;
      if (answer in breakdown) {
        breakdown[answer]++;
      } else {
        breakdown[answer] = 1;
      }
    }

    return breakdown;
  }

  /**
   * Aggregate multi-select responses
   */
  private static aggregateMultiSelect(responses: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const response of responses) {
      if (Array.isArray(response)) {
        for (const item of response) {
          const key = item?.toString?.() || item;
          breakdown[key] = (breakdown[key] || 0) + 1;
        }
      }
    }

    return breakdown;
  }

  /**
   * Aggregate numeric responses (ratings, scales, NPS)
   */
  private static aggregateNumeric(responses: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const response of responses) {
      const num = typeof response === 'number' ? response : parseInt(response);
      if (!isNaN(num)) {
        const key = num.toString();
        breakdown[key] = (breakdown[key] || 0) + 1;
      }
    }

    return breakdown;
  }

  /**
   * Aggregate Likert scale responses
   */
  private static aggregateLikertScale(responses: any[]): Record<string, number> {
    const breakdown: Record<string, number> = {};

    for (const response of responses) {
      const key = response?.toString?.() || response;
      breakdown[key] = (breakdown[key] || 0) + 1;
    }

    return breakdown;
  }

  /**
   * Aggregate ranking responses
   */
  private static aggregateRanking(responses: any[]): Record<string, any> {
    const breakdown: Record<string, any> = {};

    for (const response of responses) {
      if (Array.isArray(response)) {
        response.forEach((item, index) => {
          const key = item?.toString?.() || item;
          if (!breakdown[key]) {
            breakdown[key] = [];
          }
          breakdown[key].push({ position: index + 1 });
        });
      }
    }

    return breakdown;
  }

  /**
   * Aggregate yes/no responses
   */
  private static aggregateYesNo(responses: any[]): Record<string, number> {
    return {
      'Yes': responses.filter(r => r === true || r === 'yes' || r === 'Yes').length,
      'No': responses.filter(r => r === false || r === 'no' || r === 'No').length
    };
  }

  /**
   * Calculate average value from numeric responses
   */
  private static calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round((sum / values.length) * 100) / 100;
  }

  /**
   * Calculate average completion time in seconds
   */
  private static calculateAverageCompletionTime(responses: SurveyResponse[]): number {
    if (responses.length === 0) return 0;

    const times = responses
      .map(r => {
        if (r.created_at && r.completed_at) {
          const created = new Date(r.created_at).getTime();
          const completed = new Date(r.completed_at).getTime();
          return (completed - created) / 1000;
        }
        return 0;
      })
      .filter(t => t > 0);

    if (times.length === 0) return 0;
    return Math.round(times.reduce((a, b) => a + b, 0) / times.length);
  }

  /**
   * Get percentage breakdown for a question
   */
  static getPercentages(
    breakdown: Record<string, number>
  ): Record<string, number> {
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);
    if (total === 0) return {};

    const percentages: Record<string, number> = {};
    for (const [key, value] of Object.entries(breakdown)) {
      percentages[key] = Math.round((value / total) * 10000) / 100;
    }
    return percentages;
  }
}
