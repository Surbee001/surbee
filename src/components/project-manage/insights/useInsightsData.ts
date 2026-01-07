"use client";

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, subHours } from 'date-fns';
import type {
  Response,
  Question,
  QuestionResponse,
  InsightsStats,
  TrendDataPoint,
  FunnelStep,
  QualityDistribution,
  GeoLocation,
  HeatmapCell,
  QuestionStats,
  InsightsData,
  TimePeriod,
} from './types';

interface UseInsightsDataOptions {
  timePeriod?: TimePeriod;
  useMockData?: boolean;
}

// Generate mock data for demonstration
function generateMockData(): { responses: Response[]; questions: Question[] } {
  const mockQuestions: Question[] = [
    { question_id: 'q1', question_text: 'What is your primary role at work?', question_type: 'text' },
    { question_id: 'q2', question_text: 'How satisfied are you with our product?', question_type: 'scale' },
    { question_id: 'q3', question_text: 'What features would you like to see improved?', question_type: 'text' },
    { question_id: 'q4', question_text: 'Rate your overall experience from 1-10', question_type: 'scale' },
    { question_id: 'q5', question_text: 'Would you recommend us to a friend?', question_type: 'choice' },
    { question_id: 'q6', question_text: 'Any additional feedback?', question_type: 'text' },
  ];

  const devices: ('desktop' | 'mobile' | 'tablet')[] = ['desktop', 'mobile', 'tablet'];
  const statuses: ('completed' | 'partial' | 'abandoned')[] = ['completed', 'completed', 'completed', 'partial', 'abandoned'];

  const mockResponses: Response[] = Array.from({ length: 47 }, (_, i) => {
    const hoursAgo = Math.random() * 336; // Up to 14 days ago
    const isFlagged = Math.random() < 0.08;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const qualityScore = isFlagged ? 30 + Math.random() * 20 : 65 + Math.random() * 35;
    const completionTime = 60 + Math.random() * 300;

    const answeredQuestions = status === 'completed' ? 6 : status === 'partial' ? Math.floor(Math.random() * 4) + 2 : 1;

    const questionResponses: QuestionResponse[] = mockQuestions.slice(0, answeredQuestions).map((q, idx) => ({
      questionId: q.question_id,
      questionText: q.question_text,
      answer: ['Product Manager', 'Very satisfied', 'Better analytics', '8', 'Yes', 'Great product!'][idx] || 'N/A',
      accuracyScore: isFlagged ? 40 + Math.random() * 20 : 75 + Math.random() * 25,
      timeTaken: 5 + Math.random() * 30,
      issues: isFlagged && idx === 0 ? [{ type: 'spam' as const, description: 'Suspicious pattern detected', severity: 'high' as const }] : undefined,
    }));

    return {
      id: `resp-${i.toString().padStart(4, '0')}`,
      submittedAt: subHours(new Date(), hoursAgo),
      completionTime,
      deviceType: devices[Math.floor(Math.random() * devices.length)],
      status,
      responses: questionResponses,
      qualityScore: Math.round(qualityScore),
      fraudScore: isFlagged ? 0.6 + Math.random() * 0.3 : Math.random() * 0.2,
      isFlagged,
      flagReasons: isFlagged ? ['Pattern anomaly', 'Speed flagged'] : undefined,
    };
  });

  return { responses: mockResponses, questions: mockQuestions };
}

export function useInsightsData(
  projectId: string,
  options: UseInsightsDataOptions = {}
): InsightsData {
  const { timePeriod = 'month', useMockData = false } = options;
  const { user } = useAuth();
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch data
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [questionsRes, responsesRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/questions?userId=${user.id}`),
          fetch(`/api/projects/${projectId}/responses?userId=${user.id}&limit=100`)
        ]);

        if (!questionsRes.ok || !responsesRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const questionsData = await questionsRes.json();
        const responsesData = await responsesRes.json();

        setQuestions(questionsData.questions || []);

        // Transform responses
        const transformedResponses: Response[] = (responsesData.responses || []).map((r: any) => {
          const questionResponses: QuestionResponse[] = Object.entries(r.responses || {}).map(
            ([qId, answer]: [string, any]) => {
              let question = questionsData.questions?.find((q: any) => q.question_id === qId);
              let qIndex = questionsData.questions?.findIndex((q: any) => q.question_id === qId) ?? -1;

              // Handle legacy q1, q2, etc. format
              if (!question && qId.startsWith('q')) {
                const orderIdx = parseInt(qId.slice(1)) - 1;
                if (orderIdx >= 0 && orderIdx < (questionsData.questions?.length || 0)) {
                  question = questionsData.questions[orderIdx];
                  qIndex = orderIdx;
                }
              }

              const timingData = r.timing_data || [];

              return {
                questionId: qId,
                questionText: question?.question_text || qId,
                answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
                accuracyScore: r.fraud_score ? Math.round((1 - r.fraud_score) * 100) : 100,
                timeTaken: timingData[qIndex >= 0 ? qIndex : 0] || 0,
                issues: r.is_flagged
                  ? [
                      {
                        type: 'spam' as const,
                        description: r.flag_reasons?.join(', ') || 'Flagged by Cipher',
                        severity: 'high' as const,
                      },
                    ]
                  : undefined,
              };
            }
          );

          return {
            id: r.id,
            submittedAt: new Date(r.created_at),
            completionTime:
              r.timing_data?.reduce((a: number, b: number) => a + b, 0) / 1000 || 0,
            deviceType:
              r.device_data?.platform === 'mobile'
                ? 'mobile'
                : r.device_data?.platform === 'tablet'
                ? 'tablet'
                : 'desktop',
            status: r.completed_at ? 'completed' : ('partial' as const),
            responses: questionResponses,
            qualityScore: r.fraud_score ? Math.round((1 - r.fraud_score) * 100) : 100,
            fraudScore: r.fraud_score,
            isFlagged: r.is_flagged,
            flagReasons: r.flag_reasons,
          };
        });

        // If no responses, use mock data for demonstration
        if (transformedResponses.length === 0 || useMockData) {
          const mockData = generateMockData();
          setResponses(mockData.responses);
          if (questionsData.questions?.length === 0) {
            setQuestions(mockData.questions);
          }
        } else {
          setResponses(transformedResponses);
        }
      } catch (err) {
        console.error('Error fetching insights data:', err);
        // On error, still show mock data for demonstration
        const mockData = generateMockData();
        setResponses(mockData.responses);
        setQuestions(mockData.questions);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, user?.id, useMockData]);

  // Calculate stats
  const stats = useMemo((): InsightsStats => {
    const total = responses.length;
    const completed = responses.filter((r) => r.status === 'completed').length;
    const partial = responses.filter((r) => r.status === 'partial').length;
    const abandoned = responses.filter((r) => r.status === 'abandoned').length;
    const avgTime = total > 0 ? responses.reduce((acc, r) => acc + r.completionTime, 0) / total : 0;
    const avgQuality =
      total > 0 ? responses.reduce((acc, r) => acc + (r.qualityScore || 100), 0) / total : 100;

    const deviceCounts = responses.reduce(
      (acc, r) => {
        acc[r.deviceType] = (acc[r.deviceType] || 0) + 1;
        return acc;
      },
      { desktop: 0, mobile: 0, tablet: 0 } as Record<string, number>
    );

    // Calculate week over week change
    const oneWeekAgo = subDays(new Date(), 7);
    const twoWeeksAgo = subDays(new Date(), 14);
    const thisWeek = responses.filter((r) => r.submittedAt >= oneWeekAgo).length;
    const lastWeek = responses.filter(
      (r) => r.submittedAt >= twoWeeksAgo && r.submittedAt < oneWeekAgo
    ).length;
    const weekChange =
      lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;

    const flaggedCount = responses.filter((r) => r.isFlagged).length;

    return {
      total,
      completed,
      partial,
      abandoned,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgTime,
      avgQuality: Math.round(avgQuality),
      devices: {
        desktop: deviceCounts.desktop || 0,
        mobile: deviceCounts.mobile || 0,
        tablet: deviceCounts.tablet || 0,
      },
      weekChange,
      thisWeek,
      flaggedCount,
    };
  }, [responses]);

  // Trend data for charts
  const trendData = useMemo((): TrendDataPoint[] => {
    const days =
      timePeriod === 'week' ? 7 : timePeriod === 'month' ? 30 : timePeriod === 'quarter' ? 90 : 365;
    const displayDays = Math.min(days, 14);

    return Array.from({ length: displayDays }, (_, i) => {
      const date = subDays(new Date(), displayDays - 1 - i);
      const count = responses.filter(
        (r) => format(r.submittedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
      ).length;
      return {
        day: format(date, days <= 7 ? 'EEE' : 'MMM d'),
        count,
        date: format(date, 'MMM d'),
      };
    });
  }, [responses, timePeriod]);

  // Funnel data
  const funnelData = useMemo((): FunnelStep[] => {
    return questions.map((q, idx) => {
      const answered = responses.filter((r) =>
        r.responses.some((qr) => qr.questionId === q.question_id || qr.questionId === `q${idx + 1}`)
      ).length;

      const prevAnswered =
        idx === 0
          ? stats.total
          : responses.filter((r) =>
              r.responses.some(
                (qr) =>
                  qr.questionId === questions[idx - 1]?.question_id || qr.questionId === `q${idx}`
              )
            ).length;

      const retention = stats.total > 0 ? Math.round((answered / stats.total) * 100) : 0;
      const dropOff =
        prevAnswered > 0 ? Math.round(((prevAnswered - answered) / prevAnswered) * 100) : 0;

      return {
        questionNumber: idx + 1,
        questionId: q.question_id,
        questionText: q.question_text,
        started: stats.total,
        completed: answered,
        retention,
        dropOff,
      };
    });
  }, [questions, responses, stats.total]);

  // Quality distribution
  const qualityDistribution = useMemo((): QualityDistribution => {
    return {
      excellent: responses.filter((r) => (r.qualityScore || 100) >= 80).length,
      good: responses.filter((r) => (r.qualityScore || 100) >= 60 && (r.qualityScore || 100) < 80)
        .length,
      poor: responses.filter((r) => (r.qualityScore || 100) < 60).length,
    };
  }, [responses]);

  // Geographic data (mock data for demonstration)
  const geoData = useMemo((): GeoLocation[] => {
    // In production, this would come from actual response location data
    const mockGeoData: GeoLocation[] = [
      { country: 'United States', countryCode: 'US', lat: 37.0902, lng: -95.7129, count: Math.floor(responses.length * 0.35) },
      { country: 'United Kingdom', countryCode: 'GB', lat: 55.3781, lng: -3.4360, count: Math.floor(responses.length * 0.15) },
      { country: 'Germany', countryCode: 'DE', lat: 51.1657, lng: 10.4515, count: Math.floor(responses.length * 0.12) },
      { country: 'Canada', countryCode: 'CA', lat: 56.1304, lng: -106.3468, count: Math.floor(responses.length * 0.10) },
      { country: 'Australia', countryCode: 'AU', lat: -25.2744, lng: 133.7751, count: Math.floor(responses.length * 0.08) },
      { country: 'France', countryCode: 'FR', lat: 46.2276, lng: 2.2137, count: Math.floor(responses.length * 0.07) },
      { country: 'Japan', countryCode: 'JP', lat: 36.2048, lng: 138.2529, count: Math.floor(responses.length * 0.05) },
      { country: 'India', countryCode: 'IN', lat: 20.5937, lng: 78.9629, count: Math.floor(responses.length * 0.04) },
      { country: 'Brazil', countryCode: 'BR', lat: -14.2350, lng: -51.9253, count: Math.floor(responses.length * 0.03) },
      { country: 'Netherlands', countryCode: 'NL', lat: 52.1326, lng: 5.2913, count: Math.floor(responses.length * 0.01) },
    ].filter(g => g.count > 0);

    return mockGeoData;
  }, [responses.length]);

  // Heatmap data - responses by day and hour
  const heatmapData = useMemo((): HeatmapCell[] => {
    const cells: HeatmapCell[] = [];

    // Initialize all cells
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        cells.push({ day, hour, count: 0 });
      }
    }

    // Count responses by day/hour
    responses.forEach(r => {
      const date = new Date(r.submittedAt);
      const day = date.getDay();
      const hour = date.getHours();
      const cellIndex = day * 24 + hour;
      if (cells[cellIndex]) {
        cells[cellIndex].count++;
      }
    });

    return cells;
  }, [responses]);

  // Question performance stats
  const questionStats = useMemo((): QuestionStats[] => {
    return questions.map((q, idx) => {
      const questionResponses = responses.flatMap(r =>
        r.responses.filter(qr => qr.questionId === q.question_id || qr.questionId === `q${idx + 1}`)
      );

      const avgScore = questionResponses.length > 0
        ? questionResponses.reduce((sum, qr) => sum + qr.accuracyScore, 0) / questionResponses.length
        : 0;

      const avgTime = questionResponses.length > 0
        ? questionResponses.reduce((sum, qr) => sum + qr.timeTaken, 0) / questionResponses.length
        : 0;

      const dropoffRate = idx === 0 ? 0 :
        stats.total > 0 ? Math.round(((stats.total - questionResponses.length) / stats.total) * 100) : 0;

      return {
        questionId: q.question_id,
        questionText: q.question_text,
        avgScore: Math.round(avgScore),
        avgTime: Math.round(avgTime * 10) / 10,
        responseCount: questionResponses.length,
        dropoffRate,
      };
    });
  }, [questions, responses, stats.total]);

  return {
    responses,
    questions,
    stats,
    trendData,
    funnelData,
    qualityDistribution,
    geoData,
    heatmapData,
    questionStats,
    loading,
    error,
  };
}

export default useInsightsData;
