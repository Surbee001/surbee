import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Shield,
  Hash,
  Copy,
  Zap,
  AlertTriangle,
  Plus,
  X,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { AIInsightDot } from './AIInsightDot';
import { AccuracyDetector } from './AccuracyDetector';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface UnifiedInsightsTabProps {
  projectId: string;
}

interface QuestionResponse {
  questionId: string;
  questionText: string;
  answer: string;
  accuracyScore: number;
  timeTaken: number; // in seconds
  issues?: {
    type: 'spam' | 'copy-paste' | 'too-quick' | 'pattern';
    description: string;
    severity: 'low' | 'medium' | 'high';
  }[];
  aiSummary?: string;
}

interface Response {
  id: string;
  submittedAt: Date;
  completionTime: number;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  status: 'completed' | 'partial' | 'abandoned';
  responses: QuestionResponse[];
  qualityScore?: number;
  aiSummary?: string;
}

// Mock data
const mockResponses: Response[] = [
  {
    id: '1',
    submittedAt: new Date('2025-01-20T14:30:00'),
    completionTime: 3.5,
    deviceType: 'desktop',
    status: 'completed',
    responses: [
      {
        questionId: 'q1',
        questionText: 'What is your primary goal?',
        answer: 'Very satisfied with the product. The interface is intuitive and the features are exactly what I needed. Would definitely recommend to colleagues.',
        accuracyScore: 95,
        timeTaken: 125,
      },
      {
        questionId: 'q2',
        questionText: 'How satisfied are you?',
        answer: 'Would recommend to others',
        accuracyScore: 92,
        timeTaken: 15,
      },
    ],
    qualityScore: 95,
    aiSummary: 'Highly positive feedback focusing on product satisfaction and user interface design. Strong recommendation intent with emphasis on intuitive features meeting user needs.'
  },
  {
    id: '2',
    submittedAt: new Date('2025-01-20T15:45:00'),
    completionTime: 5.2,
    deviceType: 'mobile',
    status: 'completed',
    responses: [
      {
        questionId: 'q1',
        questionText: 'What is your primary goal?',
        answer: 'Good experience overall, but there are some areas that could be improved, particularly the mobile responsiveness.',
        accuracyScore: 85,
        timeTaken: 180,
      },
      {
        questionId: 'q2',
        questionText: 'How satisfied are you?',
        answer: 'Needs improvement in some areas',
        accuracyScore: 78,
        timeTaken: 25,
        issues: [
          {
            type: 'too-quick',
            description: 'Response time unusually fast',
            severity: 'low',
          }
        ]
      },
    ],
    qualityScore: 82,
    aiSummary: 'Generally positive with constructive criticism. Main concern is mobile experience optimization. User satisfied but sees room for improvement.'
  },
  {
    id: '3',
    submittedAt: new Date('2025-01-19T10:15:00'),
    completionTime: 2.1,
    deviceType: 'tablet',
    status: 'partial',
    responses: [
      {
        questionId: 'q1',
        questionText: 'What is your primary goal?',
        answer: 'Satisfied',
        accuracyScore: 65,
        timeTaken: 8,
        issues: [
          {
            type: 'too-quick',
            description: 'Answered in under 10 seconds',
            severity: 'medium',
          }
        ]
      },
    ],
    qualityScore: 65,
  },
];

const mockFunnelData = [
  { questionNumber: 1, questionText: 'What is your primary goal?', started: 250, completed: 244, abandoned: 6, avgTimeSeconds: 12 },
  { questionNumber: 2, questionText: 'How satisfied are you with the product?', started: 244, completed: 230, abandoned: 14, avgTimeSeconds: 18 },
  { questionNumber: 3, questionText: 'Tell us about your experience', started: 230, completed: 195, abandoned: 35, avgTimeSeconds: 125 },
  { questionNumber: 4, questionText: 'Would you recommend us?', started: 195, completed: 182, abandoned: 13, avgTimeSeconds: 8 },
];

// Chart data
const responseTrendData = [
  { date: 'Jan 15', responses: 12 },
  { date: 'Jan 16', responses: 18 },
  { date: 'Jan 17', responses: 15 },
  { date: 'Jan 18', responses: 25 },
  { date: 'Jan 19', responses: 22 },
  { date: 'Jan 20', responses: 30 },
  { date: 'Jan 21', responses: 28 },
];

const deviceData = [
  { name: 'Desktop', value: 60 },
  { name: 'Mobile', value: 30 },
  { name: 'Tablet', value: 10 },
];

const completionTimeData = [
  { range: '0-2m', count: 45 },
  { range: '2-4m', count: 68 },
  { range: '4-6m', count: 32 },
  { range: '6-8m', count: 18 },
  { range: '8m+', count: 12 },
];

const dayOfWeekData = [
  { day: 'Mon', responses: 32 },
  { day: 'Tue', responses: 45 },
  { day: 'Wed', responses: 38 },
  { day: 'Thu', responses: 52 },
  { day: 'Fri', responses: 28 },
  { day: 'Sat', responses: 15 },
  { day: 'Sun', responses: 12 },
];

const hourOfDayData = [
  { hour: '12am', responses: 2 },
  { hour: '4am', responses: 1 },
  { hour: '8am', responses: 12 },
  { hour: '12pm', responses: 28 },
  { hour: '4pm', responses: 35 },
  { hour: '8pm', responses: 18 },
];

const questionCompletionData = [
  { question: 'Q1', completed: 244, abandoned: 6 },
  { question: 'Q2', completed: 230, abandoned: 14 },
  { question: 'Q3', completed: 195, abandoned: 35 },
  { question: 'Q4', completed: 182, abandoned: 13 },
];

const sentimentTrendData = [
  { date: 'Jan 15', positive: 8, neutral: 3, negative: 1 },
  { date: 'Jan 16', positive: 12, neutral: 4, negative: 2 },
  { date: 'Jan 17', positive: 10, neutral: 3, negative: 2 },
  { date: 'Jan 18', positive: 18, neutral: 5, negative: 2 },
  { date: 'Jan 19', positive: 15, neutral: 5, negative: 2 },
  { date: 'Jan 20', positive: 22, neutral: 6, negative: 2 },
];

type ChartType = 'responseTrend' | 'deviceDistribution' | 'completionTime' | 'responseByDay' | 'responseByHour' | 'questionCompletion' | 'sentimentTrend';

export const UnifiedInsightsTab: React.FC<UnifiedInsightsTabProps> = ({ projectId }) => {
  const { user } = useUser();
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [selectedFunnelStep, setSelectedFunnelStep] = useState<number | null>(null);
  const [showAdvancedAnalytics, setShowAdvancedAnalytics] = useState(false);
  const [showChartSelector, setShowChartSelector] = useState(false);
  const [selectedCharts, setSelectedCharts] = useState<ChartType[]>(['responseTrend', 'deviceDistribution']);
  const [chartHovers, setChartHovers] = useState<Record<ChartType, boolean>>({
    responseTrend: false,
    deviceDistribution: false,
    completionTime: false,
    responseByDay: false,
    responseByHour: false,
    questionCompletion: false,
    sentimentTrend: false,
  });

  // Real data state
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions and responses
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch questions
        const questionsRes = await fetch(`/api/projects/${projectId}/questions?userId=${user.id}`);
        const questionsData = await questionsRes.json();

        if (!questionsRes.ok) {
          throw new Error(questionsData.error || 'Failed to fetch questions');
        }

        // Fetch responses
        const responsesRes = await fetch(`/api/projects/${projectId}/responses?userId=${user.id}&limit=100`);
        const responsesData = await responsesRes.json();

        if (!responsesRes.ok) {
          throw new Error(responsesData.error || 'Failed to fetch responses');
        }

        setQuestions(questionsData.questions);

        // Transform survey_responses to Response format
        const transformedResponses: Response[] = responsesData.responses.map((r: any) => {
          const questionResponses: QuestionResponse[] = Object.entries(r.responses || {}).map(([qId, answer]: [string, any]) => {
            const question = questionsData.questions.find((q: any) => q.question_id === qId);
            const timingData = r.timing_data || [];
            const qIndex = questionsData.questions.findIndex((q: any) => q.question_id === qId);

            return {
              questionId: qId,
              questionText: question?.question_text || qId,
              answer: typeof answer === 'string' ? answer : JSON.stringify(answer),
              accuracyScore: r.fraud_score ? Math.round((1 - r.fraud_score) * 100) : 100,
              timeTaken: timingData[qIndex] || 0,
              issues: r.is_flagged ? [{
                type: 'spam' as const,
                description: r.flag_reasons?.join(', ') || 'Flagged by Cipher',
                severity: 'high' as const,
              }] : undefined,
            };
          });

          return {
            id: r.id,
            submittedAt: new Date(r.created_at),
            completionTime: r.timing_data?.reduce((a: number, b: number) => a + b, 0) / 1000 || 0,
            deviceType: r.device_data?.platform === 'mobile' ? 'mobile' : r.device_data?.platform === 'tablet' ? 'tablet' : 'desktop',
            status: r.completed_at ? 'completed' : 'partial' as const,
            responses: questionResponses,
            qualityScore: r.fraud_score ? Math.round((1 - r.fraud_score) * 100) : 100,
          };
        });

        setResponses(transformedResponses);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, user?.id]);

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '12px',
      fontWeight: '600' as const,
      textTransform: 'capitalize' as const,
    };

    switch (status) {
      case 'completed':
        return { ...baseStyle, background: 'rgba(255, 255, 255, 0.2)', color: 'white' };
      case 'partial':
        return { ...baseStyle, background: 'rgba(255, 255, 255, 0.15)', color: 'rgba(255, 255, 255, 0.7)' };
      default:
        return { ...baseStyle, background: 'rgba(255, 255, 255, 0.1)', color: 'rgba(255, 255, 255, 0.5)' };
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'white';
    if (score >= 75) return 'rgba(255, 255, 255, 0.8)';
    if (score >= 60) return 'rgba(255, 255, 255, 0.6)';
    return 'rgba(255, 255, 255, 0.4)';
  };

  const getPreviewText = (responses: QuestionResponse[]) => {
    if (responses.length === 0) return '';
    const firstAnswer = responses[0].answer;
    return firstAnswer.length > 60 ? firstAnswer.substring(0, 60) + '...' : firstAnswer;
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'spam': return <Hash className="h-3 w-3" />;
      case 'copy-paste': return <Copy className="h-3 w-3" />;
      case 'too-quick': return <Zap className="h-3 w-3" />;
      case 'pattern': return <AlertTriangle className="h-3 w-3" />;
      default: return <AlertTriangle className="h-3 w-3" />;
    }
  };

  // Chart metadata
  const chartMetadata: Record<ChartType, { title: string; description: string; icon: React.ReactNode }> = {
    responseTrend: {
      title: 'Response Trend',
      description: 'Daily response volume over time',
      icon: <TrendingUp className="h-4 w-4" />
    },
    deviceDistribution: {
      title: 'Device Distribution',
      description: 'Breakdown by device type',
      icon: <PieChartIcon className="h-4 w-4" />
    },
    completionTime: {
      title: 'Completion Time',
      description: 'Time taken to complete survey',
      icon: <BarChart3 className="h-4 w-4" />
    },
    responseByDay: {
      title: 'Response by Day',
      description: 'Which days get most responses',
      icon: <BarChart3 className="h-4 w-4" />
    },
    responseByHour: {
      title: 'Response by Hour',
      description: 'Peak response times',
      icon: <BarChart3 className="h-4 w-4" />
    },
    questionCompletion: {
      title: 'Question Completion',
      description: 'Completion rate per question',
      icon: <BarChart3 className="h-4 w-4" />
    },
    sentimentTrend: {
      title: 'Sentiment Trend',
      description: 'Sentiment analysis over time',
      icon: <TrendingUp className="h-4 w-4" />
    },
  };

  const toggleChart = (chartType: ChartType) => {
    if (selectedCharts.includes(chartType)) {
      setSelectedCharts(selectedCharts.filter(c => c !== chartType));
    } else {
      if (selectedCharts.length < 4) {
        setSelectedCharts([...selectedCharts, chartType]);
      }
    }
  };

  const handleChartHover = (chartType: ChartType, isHovered: boolean) => {
    setChartHovers(prev => ({ ...prev, [chartType]: isHovered }));
  };

  const renderChart = (chartType: ChartType) => {
    const isHovered = chartHovers[chartType];

    const chartStyle = {
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      padding: '16px',
      position: 'relative' as const,
    };

    switch (chartType) {
      case 'responseTrend':
        return (
          <div
            key={chartType}
            style={chartStyle}
            onMouseEnter={() => handleChartHover(chartType, true)}
            onMouseLeave={() => handleChartHover(chartType, false)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Response Trend
              </h4>
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChart('responseTrend');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={responseTrendData}>
                <XAxis
                  dataKey="date"
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="responses"
                  stroke="white"
                  strokeWidth={2}
                  dot={{ fill: 'white', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'deviceDistribution':
        return (
          <div
            key={chartType}
            style={chartStyle}
            onMouseEnter={() => handleChartHover(chartType, true)}
            onMouseLeave={() => handleChartHover(chartType, false)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Device Distribution
              </h4>
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChart('deviceDistribution');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === 0 ? 'rgba(255, 255, 255, 0.9)' : index === 1 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
              {deviceData.map((item, index) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    background: index === 0 ? 'rgba(255, 255, 255, 0.9)' : index === 1 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)'
                  }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'completionTime':
        return (
          <div
            key={chartType}
            style={chartStyle}
            onMouseEnter={() => handleChartHover(chartType, true)}
            onMouseLeave={() => handleChartHover(chartType, false)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Completion Time
              </h4>
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChart('completionTime');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={completionTimeData}>
                <XAxis
                  dataKey="range"
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="rgba(255, 255, 255, 0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'responseByDay':
        return (
          <div
            key={chartType}
            style={chartStyle}
            onMouseEnter={() => handleChartHover(chartType, true)}
            onMouseLeave={() => handleChartHover(chartType, false)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Response by Day
              </h4>
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChart('responseByDay');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={dayOfWeekData}>
                <XAxis
                  dataKey="day"
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="responses" fill="white" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'responseByHour':
        return (
          <div
            key={chartType}
            style={chartStyle}
            onMouseEnter={() => handleChartHover(chartType, true)}
            onMouseLeave={() => handleChartHover(chartType, false)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Response by Hour
              </h4>
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChart('responseByHour');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={hourOfDayData}>
                <XAxis
                  dataKey="hour"
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="responses" fill="rgba(255, 255, 255, 0.8)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'questionCompletion':
        return (
          <div
            key={chartType}
            style={chartStyle}
            onMouseEnter={() => handleChartHover(chartType, true)}
            onMouseLeave={() => handleChartHover(chartType, false)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Question Completion
              </h4>
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChart('questionCompletion');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={questionCompletionData}>
                <XAxis
                  dataKey="question"
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="completed" fill="white" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="abandoned" fill="rgba(255, 255, 255, 0.3)" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'sentimentTrend':
        return (
          <div
            key={chartType}
            style={chartStyle}
            onMouseEnter={() => handleChartHover(chartType, true)}
            onMouseLeave={() => handleChartHover(chartType, false)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
                Sentiment Trend
              </h4>
              {isHovered && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleChart('sentimentTrend');
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
                </button>
              )}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={sentimentTrendData}>
                <XAxis
                  dataKey="date"
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <YAxis
                  stroke="rgba(255, 255, 255, 0.3)"
                  style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(26, 26, 26, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px'
                  }}
                />
                <Line type="monotone" dataKey="positive" stroke="white" strokeWidth={2} dot={{ fill: 'white', r: 3 }} />
                <Line type="monotone" dataKey="neutral" stroke="rgba(255, 255, 255, 0.6)" strokeWidth={2} dot={{ fill: 'rgba(255, 255, 255, 0.6)', r: 3 }} />
                <Line type="monotone" dataKey="negative" stroke="rgba(255, 255, 255, 0.3)" strokeWidth={2} dot={{ fill: 'rgba(255, 255, 255, 0.3)', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      default:
        return null;
    }
  };

  // Calculate statistics
  const totalViews = 250;
  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.status === 'completed').length;
  const responseRate = totalResponses > 0 ? Math.round((totalResponses / totalViews) * 100) : 0;
  const completionRate = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;
  const avgCompletionTime = totalResponses > 0 ? (responses.reduce((acc, r) => acc + r.completionTime, 0) / totalResponses).toFixed(1) : '0';
  const overallQualityScore = totalResponses > 0 ? Math.round(responses.reduce((acc, r) => acc + (r.qualityScore || 0), 0) / totalResponses) : 0;
  const flaggedResponses = responses.filter(r => (r.qualityScore || 100) < 75).length;

  // Show loading state
  if (loading) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
        Loading insights...
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255, 100, 100, 0.8)' }}>
        Error loading insights: {error}
      </div>
    );
  }

  // Show empty state
  if (responses.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)' }}>
        No responses yet. Share your survey to start collecting data!
      </div>
    );
  }

  return (
    <div style={{
      padding: '0 32px 32px 32px',
      maxWidth: '1400px',
      margin: '0 auto',
    }}>
      {/* HERO SECTION - Quick Stats + Overall Quality + Key Charts */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        {/* Stats Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Response Rate</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: 'white' }}>{responseRate}%</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>
              {totalResponses} of {totalViews} views
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Completion Rate</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: 'white' }}>{completionRate}%</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>
              {completedResponses} completed
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Avg. Time</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: 'white' }}>{avgCompletionTime}m</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>
              Per completion
            </div>
          </div>

          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Quality Score</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: getQualityColor(overallQualityScore) }}>{overallQualityScore}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>
              {flaggedResponses} flagged
            </div>
          </div>
        </div>

        {/* Key Charts - Customizable */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedCharts.length === 0 ? '1fr' : `repeat(auto-fit, minmax(300px, 1fr))`,
          gap: '20px',
          position: 'relative',
        }}>
          {/* Render selected charts */}
          {selectedCharts.map(chartType => renderChart(chartType))}

          {/* Add Chart Button / Empty State */}
          {selectedCharts.length < 4 && (
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              position: 'relative',
            }}>
              <button
                onClick={() => setShowChartSelector(!showChartSelector)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  padding: '16px 24px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }}
              >
                <Plus className="h-6 w-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Add Chart
                </span>
              </button>

              {/* Chart Selector Dropdown */}
              {showChartSelector && (
                <>
                  {/* Backdrop */}
                  <div
                    onClick={() => setShowChartSelector(false)}
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 999,
                    }}
                  />

                  {/* Dropdown */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(26, 26, 26, 0.98)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000,
                    minWidth: '280px',
                    maxWidth: '320px',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>
                      Select Chart Type
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(Object.keys(chartMetadata) as ChartType[]).map(chartType => {
                        const isSelected = selectedCharts.includes(chartType);
                        const meta = chartMetadata[chartType];

                        return (
                          <button
                            key={chartType}
                            onClick={() => {
                              if (!isSelected && selectedCharts.length < 4) {
                                toggleChart(chartType);
                                setShowChartSelector(false);
                              }
                            }}
                            disabled={isSelected}
                            style={{
                              padding: '12px',
                              background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: isSelected ? 'not-allowed' : 'pointer',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '12px',
                              textAlign: 'left',
                              opacity: isSelected ? 0.5 : 1,
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')}
                            onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                          >
                            <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '2px' }}>
                              {meta.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', color: 'white', marginBottom: '2px' }}>
                                {meta.title}
                              </div>
                              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>
                                {meta.description}
                              </div>
                            </div>
                            {isSelected && (
                              <div style={{
                                fontSize: '10px',
                                color: 'rgba(255, 255, 255, 0.5)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginTop: '2px',
                              }}>
                                Added
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RESPONSES & COMPLETION FLOW */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>
            Individual Responses
          </h3>
          <button style={{
            padding: '8px 16px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: 'none',
            borderRadius: '8px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <Download className="h-4 w-4" />
            Export All
          </button>
        </div>

        {/* Completion Flow - Integrated */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            marginBottom: '12px',
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>
              Completion Flow by Question
            </h4>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {mockFunnelData.map((step, index) => {
              const retentionRate = Math.round((step.completed / 250) * 100);
              const dropoffRate = Math.round((step.abandoned / step.started) * 100);
              const isSelected = selectedFunnelStep === index;

              return (
                <div key={index}>
                  <div
                    onClick={() => setSelectedFunnelStep(isSelected ? null : index)}
                    style={{
                      padding: '16px',
                      background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 80px 24px',
                      alignItems: 'center',
                      gap: '16px',
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'white',
                      }}>
                        {step.questionNumber}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>
                          {step.questionText}
                        </div>
                        <div style={{
                          height: '6px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            width: `${retentionRate}%`,
                            height: '100%',
                            background: 'white',
                            borderRadius: '3px',
                            transition: 'width 0.3s ease',
                          }} />
                        </div>
                      </div>

                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
                          {retentionRate}%
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                          Retention
                        </div>
                      </div>

                      {dropoffRate < 10 ? (
                        <CheckCircle2 className="h-5 w-5" style={{ color: 'white' }} />
                      ) : (
                        <AlertCircle className="h-5 w-5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{
                      marginTop: '8px',
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '8px',
                    }}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '16px',
                      }}>
                        <div>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Started</div>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>{step.started}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Completed</div>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>{step.completed}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Abandoned</div>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' }}>{step.abandoned}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Avg. Time</div>
                          <div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>{step.avgTimeSeconds}s</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {index < mockFunnelData.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                      <ChevronRight className="h-4 w-4 transform rotate-90" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', overflow: 'hidden' }}>
          {responses.map((response) => (
            <div key={response.id}>
              {/* Response Preview Row */}
              <div
                onClick={() => {
                  setSelectedResponse(selectedResponse === response.id ? null : response.id);
                  setExpandedQuestion(null); // Reset expanded question when collapsing
                }}
                style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
                    {/* Response ID */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>#{response.id}</span>
                    </div>

                    {/* Date/Time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {format(response.submittedAt, 'MMM d, h:mm a')}
                      </span>
                    </div>

                    {/* Device */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getDeviceIcon(response.deviceType)}
                      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'capitalize' }}>
                        {response.deviceType}
                      </span>
                    </div>

                    {/* Status */}
                    <span style={getStatusBadgeStyle(response.status)}>
                      {response.status}
                    </span>

                    {/* Quality Score */}
                    {response.qualityScore && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '6px',
                      }}>
                        <Shield className="h-3 w-3" style={{ color: getQualityColor(response.qualityScore) }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: getQualityColor(response.qualityScore) }}>
                          {response.qualityScore}
                        </span>
                      </div>
                    )}

                    {/* Completion Time */}
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                      {response.completionTime}m
                    </span>

                    {/* AI Summary Dot */}
                    {response.aiSummary && <AIInsightDot summary={response.aiSummary} />}

                    {/* Preview Text */}
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>
                      "{getPreviewText(response.responses)}"
                    </div>
                  </div>

                  <div>
                    {selectedResponse === response.id ? (
                      <ChevronUp className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                    ) : (
                      <ChevronDown className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Q&A */}
              {selectedResponse === response.id && (
                <div style={{
                  padding: '0 16px 16px 16px',
                  background: 'rgba(255, 255, 255, 0.01)',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {response.responses.map((qr, idx) => {
                      const isQuestionExpanded = expandedQuestion === `${response.id}-${qr.questionId}`;

                      return (
                        <div key={qr.questionId} style={{
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '8px',
                          overflow: 'hidden',
                        }}>
                          {/* Question Row */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedQuestion(isQuestionExpanded ? null : `${response.id}-${qr.questionId}`);
                            }}
                            style={{
                              padding: '12px 16px',
                              cursor: 'pointer',
                              background: isQuestionExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                              transition: 'background 0.15s ease',
                            }}
                            onMouseEnter={(e) => !isQuestionExpanded && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                            onMouseLeave={(e) => !isQuestionExpanded && (e.currentTarget.style.background = 'transparent')}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                  Question {idx + 1}
                                </div>
                                <div style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
                                  {qr.questionText}
                                </div>
                                <div style={{ fontSize: '14px', color: 'white', lineHeight: '1.6' }}>
                                  {qr.answer}
                                </div>

                                {/* Inline Metrics */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                                  {/* Accuracy */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '3px 8px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '4px',
                                  }}>
                                    <Shield className="h-3 w-3" style={{ color: getQualityColor(qr.accuracyScore) }} />
                                    <span style={{ fontSize: '11px', fontWeight: '600', color: getQualityColor(qr.accuracyScore) }}>
                                      {qr.accuracyScore}%
                                    </span>
                                  </div>

                                  {/* Time */}
                                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                    {qr.timeTaken}s
                                  </div>

                                  {/* Issues Badge */}
                                  {qr.issues && qr.issues.length > 0 && (
                                    <div style={{
                                      padding: '3px 8px',
                                      background: 'rgba(255, 255, 255, 0.08)',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      color: 'rgba(255, 255, 255, 0.7)',
                                    }}>
                                      {qr.issues.length} issue{qr.issues.length > 1 ? 's' : ''}
                                    </div>
                                  )}

                                  {/* AI Summary for specific question */}
                                  {qr.aiSummary && <AIInsightDot summary={qr.aiSummary} />}
                                </div>
                              </div>

                              <div>
                                {isQuestionExpanded ? (
                                  <ChevronUp className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                                ) : (
                                  <ChevronDown className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Question Details */}
                          {isQuestionExpanded && qr.issues && qr.issues.length > 0 && (
                            <div style={{
                              padding: '12px 16px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            }}>
                              <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Detected Issues:
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {qr.issues.map((issue, issueIdx) => (
                                  <div key={issueIdx} style={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '10px',
                                    padding: '10px',
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    borderRadius: '6px',
                                  }}>
                                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1px', flexShrink: 0 }}>
                                      {getIssueIcon(issue.type)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        marginBottom: '4px',
                                      }}>
                                        <span style={{
                                          fontSize: '10px',
                                          fontWeight: '600',
                                          color: 'rgba(255, 255, 255, 0.7)',
                                          textTransform: 'uppercase',
                                          letterSpacing: '0.5px',
                                        }}>
                                          {issue.type.replace('-', ' ')}
                                        </span>
                                        <span style={{
                                          padding: '2px 5px',
                                          background: 'rgba(255, 255, 255, 0.05)',
                                          borderRadius: '3px',
                                          fontSize: '9px',
                                          color: 'rgba(255, 255, 255, 0.6)',
                                          textTransform: 'uppercase',
                                        }}>
                                          {issue.severity}
                                        </span>
                                      </div>
                                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                                        {issue.description}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
