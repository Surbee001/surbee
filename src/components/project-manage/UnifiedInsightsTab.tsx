import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface UnifiedInsightsTabProps {
  projectId: string;
}

interface QuestionResponse {
  questionId: string;
  questionText: string;
  answer: string;
  accuracyScore: number;
  timeTaken: number;
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

interface FunnelStep {
  questionNumber: number;
  questionText: string;
  started: number;
  completed: number;
  abandoned: number;
  avgTimeSeconds: number;
}

type ChartType = 'responseTrend' | 'deviceDistribution' | 'completionTime' | 'responseByDay' | 'responseByHour' | 'questionCompletion' | 'sentimentTrend';

// Helper to get day name from date
const getDayName = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

export const UnifiedInsightsTab: React.FC<UnifiedInsightsTabProps> = ({ projectId }) => {
  const { user } = useAuth();
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

        setQuestions(questionsData.questions || []);

        // Transform survey_responses to Response format
        const transformedResponses: Response[] = (responsesData.responses || []).map((r: any) => {
          const questionResponses: QuestionResponse[] = Object.entries(r.responses || {}).map(([qId, answer]: [string, any]) => {
            let question = questionsData.questions?.find((q: any) => q.question_id === qId);
            let qIndex = questionsData.questions?.findIndex((q: any) => q.question_id === qId) ?? -1;

            // Fallback: try matching by extracting number from qId (e.g., "q1" -> index 0)
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

  const getPreviewText = (responsesList: QuestionResponse[]) => {
    if (responsesList.length === 0) return '';
    const firstAnswer = responsesList[0].answer;
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

  // Calculate statistics
  const totalViews = Math.max(250, responses.length * 2);
  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.status === 'completed').length;
  const responseRate = totalResponses > 0 ? Math.round((totalResponses / totalViews) * 100) : 0;
  const completionRate = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;
  const avgCompletionTime = totalResponses > 0 ? (responses.reduce((acc, r) => acc + r.completionTime, 0) / totalResponses).toFixed(1) : '0';
  const overallQualityScore = totalResponses > 0 ? Math.round(responses.reduce((acc, r) => acc + (r.qualityScore || 0), 0) / totalResponses) : 0;
  const flaggedResponses = responses.filter(r => (r.qualityScore || 100) < 75).length;

  // Generate funnel data from real questions
  const funnelData: FunnelStep[] = questions.map((q: any, index: number) => {
    const answeredCount = responses.filter(r =>
      r.responses.some(qr => qr.questionId === q.question_id || qr.questionId === `q${index + 1}`)
    ).length;

    const questionTimes = responses.flatMap(r =>
      r.responses
        .filter(qr => qr.questionId === q.question_id || qr.questionId === `q${index + 1}`)
        .map(qr => qr.timeTaken)
    );
    const avgTime = questionTimes.length > 0
      ? Math.round(questionTimes.reduce((a, b) => a + b, 0) / questionTimes.length)
      : 0;

    const previousAnswered = index === 0 ? totalResponses :
      responses.filter(r => r.responses.some(qr =>
        qr.questionId === questions[index - 1]?.question_id || qr.questionId === `q${index}`
      )).length;

    return {
      questionNumber: index + 1,
      questionText: q.question_text,
      started: index === 0 ? totalResponses : previousAnswered,
      completed: answeredCount,
      abandoned: Math.max(0, (index === 0 ? totalResponses : previousAnswered) - answeredCount),
      avgTimeSeconds: avgTime,
    };
  });

  // Generate device distribution from real responses
  const deviceCounts = responses.reduce((acc, r) => {
    acc[r.deviceType] = (acc[r.deviceType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceData = [
    { name: 'Desktop', value: Math.round((deviceCounts.desktop || 0) / Math.max(totalResponses, 1) * 100) || 60 },
    { name: 'Mobile', value: Math.round((deviceCounts.mobile || 0) / Math.max(totalResponses, 1) * 100) || 30 },
    { name: 'Tablet', value: Math.round((deviceCounts.tablet || 0) / Math.max(totalResponses, 1) * 100) || 10 },
  ];

  // Generate response trend from real responses (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const responseTrendData = last7Days.map(date => {
    const dateStr = format(date, 'MMM d');
    const count = responses.filter(r =>
      format(r.submittedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    ).length;
    return { date: dateStr, responses: count };
  });

  // Generate completion time distribution
  const timeRanges = [
    { range: '0-2m', min: 0, max: 2 },
    { range: '2-4m', min: 2, max: 4 },
    { range: '4-6m', min: 4, max: 6 },
    { range: '6-8m', min: 6, max: 8 },
    { range: '8m+', min: 8, max: Infinity },
  ];

  const completionTimeData = timeRanges.map(({ range, min, max }) => ({
    range,
    count: responses.filter(r => r.completionTime >= min && r.completionTime < max).length,
  }));

  // Generate day of week distribution
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = responses.reduce((acc, r) => {
    const day = getDayName(r.submittedAt);
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dayOfWeekData = dayNames.map(day => ({
    day,
    responses: dayCounts[day] || 0,
  }));

  // Generate hour of day distribution
  const hourRanges = [
    { label: '12am', min: 0, max: 4 },
    { label: '4am', min: 4, max: 8 },
    { label: '8am', min: 8, max: 12 },
    { label: '12pm', min: 12, max: 16 },
    { label: '4pm', min: 16, max: 20 },
    { label: '8pm', min: 20, max: 24 },
  ];

  const hourOfDayData = hourRanges.map(({ label, min, max }) => ({
    hour: label,
    responses: responses.filter(r => {
      const hour = r.submittedAt.getHours();
      return hour >= min && hour < max;
    }).length,
  }));

  // Generate question completion data
  const questionCompletionData = questions.slice(0, 4).map((q: any, index: number) => {
    const completed = responses.filter(r =>
      r.responses.some(qr => qr.questionId === q.question_id || qr.questionId === `q${index + 1}`)
    ).length;
    return {
      question: `Q${index + 1}`,
      completed,
      abandoned: Math.max(0, totalResponses - completed),
    };
  });

  // Generate sentiment trend
  const sentimentTrendData = last7Days.map(date => {
    const dateStr = format(date, 'MMM d');
    const dayResponses = responses.filter(r =>
      format(r.submittedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    const positive = dayResponses.filter(r => (r.qualityScore || 0) >= 80).length;
    const neutral = dayResponses.filter(r => (r.qualityScore || 0) >= 50 && (r.qualityScore || 0) < 80).length;
    const negative = dayResponses.filter(r => (r.qualityScore || 0) < 50).length;
    return { date: dateStr, positive, neutral, negative };
  });

  const renderChart = (chartType: ChartType) => {
    const isHovered = chartHovers[chartType];

    const chartStyle = {
      background: 'rgba(255, 255, 255, 0.03)',
      borderRadius: '12px',
      padding: '16px',
      position: 'relative' as const,
    };

    const renderRemoveButton = () => isHovered && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleChart(chartType);
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
    );

    switch (chartType) {
      case 'responseTrend':
        return (
          <div key={chartType} style={chartStyle} onMouseEnter={() => handleChartHover(chartType, true)} onMouseLeave={() => handleChartHover(chartType, false)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Response Trend</h4>
              {renderRemoveButton()}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={responseTrendData}>
                <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(26, 26, 26, 0.95)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                <Line type="monotone" dataKey="responses" stroke="white" strokeWidth={2} dot={{ fill: 'white', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case 'deviceDistribution':
        return (
          <div key={chartType} style={chartStyle} onMouseEnter={() => handleChartHover(chartType, true)} onMouseLeave={() => handleChartHover(chartType, false)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Device Distribution</h4>
              {renderRemoveButton()}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={2} dataKey="value">
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'rgba(255, 255, 255, 0.9)' : index === 1 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'rgba(26, 26, 26, 0.95)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
              {deviceData.map((item, index) => (
                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: index === 0 ? 'rgba(255, 255, 255, 0.9)' : index === 1 ? 'rgba(255, 255, 255, 0.6)' : 'rgba(255, 255, 255, 0.3)' }} />
                  <span style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'completionTime':
        return (
          <div key={chartType} style={chartStyle} onMouseEnter={() => handleChartHover(chartType, true)} onMouseLeave={() => handleChartHover(chartType, false)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Completion Time</h4>
              {renderRemoveButton()}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={completionTimeData}>
                <XAxis dataKey="range" stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(26, 26, 26, 0.95)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                <Bar dataKey="count" fill="rgba(255, 255, 255, 0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'responseByDay':
        return (
          <div key={chartType} style={chartStyle} onMouseEnter={() => handleChartHover(chartType, true)} onMouseLeave={() => handleChartHover(chartType, false)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Response by Day</h4>
              {renderRemoveButton()}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={dayOfWeekData}>
                <XAxis dataKey="day" stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(26, 26, 26, 0.95)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                <Bar dataKey="responses" fill="white" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'responseByHour':
        return (
          <div key={chartType} style={chartStyle} onMouseEnter={() => handleChartHover(chartType, true)} onMouseLeave={() => handleChartHover(chartType, false)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Response by Hour</h4>
              {renderRemoveButton()}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={hourOfDayData}>
                <XAxis dataKey="hour" stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(26, 26, 26, 0.95)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                <Bar dataKey="responses" fill="rgba(255, 255, 255, 0.8)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'questionCompletion':
        return (
          <div key={chartType} style={chartStyle} onMouseEnter={() => handleChartHover(chartType, true)} onMouseLeave={() => handleChartHover(chartType, false)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Question Completion</h4>
              {renderRemoveButton()}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={questionCompletionData}>
                <XAxis dataKey="question" stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(26, 26, 26, 0.95)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
                <Bar dataKey="completed" fill="white" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="abandoned" fill="rgba(255, 255, 255, 0.3)" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'sentimentTrend':
        return (
          <div key={chartType} style={chartStyle} onMouseEnter={() => handleChartHover(chartType, true)} onMouseLeave={() => handleChartHover(chartType, false)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)', margin: 0 }}>Sentiment Trend</h4>
              {renderRemoveButton()}
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={sentimentTrendData}>
                <XAxis dataKey="date" stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <YAxis stroke="rgba(255, 255, 255, 0.3)" style={{ fontSize: '10px', fill: 'rgba(255, 255, 255, 0.5)' }} tickLine={false} />
                <Tooltip contentStyle={{ background: 'rgba(26, 26, 26, 0.95)', border: 'none', borderRadius: '8px', color: 'white', fontSize: '12px' }} />
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

  return (
    <div style={{ padding: '0 32px 32px 32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* HERO SECTION - Quick Stats + Key Charts */}
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
        {/* Stats Row with Total Responses + Pulsing Dot */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', width: '12px', height: '12px' }}>
            <div style={{ width: '12px', height: '12px', background: 'white', borderRadius: '50%' }} />
            <span style={{ position: 'absolute', top: '50%', left: '50%', width: '12px', height: '12px', borderRadius: '50%', background: 'white', transform: 'translate(-50%, -50%)', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', opacity: 0.75 }} />
          </div>
          <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
            <span style={{ fontWeight: '600', color: 'white' }}>{totalResponses}</span> total responses
          </span>
          <style>{`@keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.75; } 50% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; } }`}</style>
        </div>

        {/* 4 Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Response Rate</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: 'white' }}>{responseRate}%</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>{totalResponses} of {totalViews} views</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Completion Rate</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: 'white' }}>{completionRate}%</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>{completedResponses} completed</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Avg. Time</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: 'white' }}>{avgCompletionTime}m</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>Per completion</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>Quality Score</div>
            <div style={{ fontSize: '32px', fontWeight: '600', color: getQualityColor(overallQualityScore) }}>{overallQualityScore}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '4px' }}>{flaggedResponses} flagged</div>
          </div>
        </div>

        {/* Key Charts - Selectable */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedCharts.length === 0 ? '1fr' : `repeat(auto-fit, minmax(300px, 1fr))`, gap: '20px', position: 'relative' }}>
          {selectedCharts.map(chartType => renderChart(chartType))}
          {selectedCharts.length < 4 && (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '200px', position: 'relative' }}>
              <button onClick={() => setShowChartSelector(!showChartSelector)} style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px dashed rgba(255, 255, 255, 0.2)', borderRadius: '8px', padding: '16px 24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', transition: 'all 0.15s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}>
                <Plus className="h-6 w-6" style={{ color: 'rgba(255, 255, 255, 0.7)' }} />
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.7)' }}>Add Chart</span>
              </button>
              {showChartSelector && (
                <>
                  <div onClick={() => setShowChartSelector(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(26, 26, 26, 0.98)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: '12px', padding: '16px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)', zIndex: 1000, minWidth: '280px', maxWidth: '320px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', marginBottom: '12px' }}>Select Chart Type</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {(Object.keys(chartMetadata) as ChartType[]).map(ct => {
                        const isSelected = selectedCharts.includes(ct);
                        const meta = chartMetadata[ct];
                        return (
                          <button key={ct} onClick={() => { if (!isSelected && selectedCharts.length < 4) { toggleChart(ct); setShowChartSelector(false); } }} disabled={isSelected} style={{ padding: '12px', background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)', border: 'none', borderRadius: '8px', cursor: isSelected ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px', textAlign: 'left', opacity: isSelected ? 0.5 : 1, transition: 'all 0.15s ease' }} onMouseEnter={(e) => !isSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)')} onMouseLeave={(e) => !isSelected && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}>
                            <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '2px' }}>{meta.icon}</div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '13px', fontWeight: '500', color: 'white', marginBottom: '2px' }}>{meta.title}</div>
                              <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', lineHeight: '1.4' }}>{meta.description}</div>
                            </div>
                            {isSelected && <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: '2px' }}>Added</div>}
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

      {/* COMPLETION FLOW */}
      {funnelData.length > 0 && (
        <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>Completion Flow</h3>
            <button style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {funnelData.map((step, index) => {
              const retentionRate = totalResponses > 0 ? Math.round((step.completed / totalResponses) * 100) : 0;
              const dropoffRate = step.started > 0 ? Math.round((step.abandoned / step.started) * 100) : 0;
              const isSelected = selectedFunnelStep === index;
              return (
                <div key={index}>
                  <div onClick={() => setSelectedFunnelStep(isSelected ? null : index)} style={{ padding: '16px', background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 80px 24px', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '32px', height: '32px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: 'white' }}>{step.questionNumber}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>{step.questionText}</div>
                        <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${retentionRate}%`, height: '100%', background: 'white', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                        </div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>{retentionRate}%</div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Retention</div>
                      </div>
                      {dropoffRate < 10 ? <CheckCircle2 className="h-5 w-5" style={{ color: 'white' }} /> : <AlertCircle className="h-5 w-5" style={{ color: 'rgba(255, 255, 255, 0.5)' }} />}
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ marginTop: '8px', padding: '16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '16px' }}>
                        <div><div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Started</div><div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>{step.started}</div></div>
                        <div><div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Completed</div><div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>{step.completed}</div></div>
                        <div><div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Abandoned</div><div style={{ fontSize: '20px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' }}>{step.abandoned}</div></div>
                        <div><div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '4px' }}>Avg. Time</div><div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>{step.avgTimeSeconds}s</div></div>
                      </div>
                    </div>
                  )}
                  {index < funnelData.length - 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
                      <ChevronRight className="h-4 w-4 transform rotate-90" style={{ color: 'rgba(255, 255, 255, 0.3)' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* INDIVIDUAL RESPONSES */}
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>Individual Responses</h3>
          <button style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '8px', color: 'rgba(255, 255, 255, 0.7)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download className="h-4 w-4" />
            Export All
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', overflow: 'hidden' }}>
          {responses.map((response) => (
            <div key={response.id}>
              <div onClick={() => { setSelectedResponse(selectedResponse === response.id ? null : response.id); setExpandedQuestion(null); }} style={{ padding: '16px', background: 'rgba(15, 15, 15, 1)', cursor: 'pointer', transition: 'background 0.15s ease' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'} onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(15, 15, 15, 1)'}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'white' }}>#{response.id.slice(0, 8)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock className="h-3 w-3" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>{format(response.submittedAt, 'MMM d, h:mm a')}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getDeviceIcon(response.deviceType)}
                      <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'capitalize' }}>{response.deviceType}</span>
                    </div>
                    <span style={getStatusBadgeStyle(response.status)}>{response.status}</span>
                    {response.qualityScore && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '6px' }}>
                        <Shield className="h-3 w-3" style={{ color: getQualityColor(response.qualityScore) }} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: getQualityColor(response.qualityScore) }}>{response.qualityScore}</span>
                      </div>
                    )}
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>{response.completionTime.toFixed(1)}m</span>
                    {response.aiSummary && <AIInsightDot summary={response.aiSummary} />}
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontStyle: 'italic' }}>"{getPreviewText(response.responses)}"</div>
                  </div>
                  <div>{selectedResponse === response.id ? <ChevronUp className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} /> : <ChevronDown className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />}</div>
                </div>
              </div>
              {selectedResponse === response.id && (
                <div style={{ padding: '0 16px 16px 16px', background: 'rgba(15, 15, 15, 1)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {response.responses.map((qr, idx) => {
                      const isQuestionExpanded = expandedQuestion === `${response.id}-${qr.questionId}`;
                      return (
                        <div key={qr.questionId} style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', overflow: 'hidden' }}>
                          <div onClick={(e) => { e.stopPropagation(); setExpandedQuestion(isQuestionExpanded ? null : `${response.id}-${qr.questionId}`); }} style={{ padding: '12px 16px', cursor: 'pointer', background: isQuestionExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent', transition: 'background 0.15s ease' }} onMouseEnter={(e) => !isQuestionExpanded && (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')} onMouseLeave={(e) => !isQuestionExpanded && (e.currentTarget.style.background = 'transparent')}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question {idx + 1}</div>
                                <div style={{ fontSize: '13px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>{qr.questionText}</div>
                                <div style={{ fontSize: '14px', color: 'white', lineHeight: '1.6' }}>{qr.answer}</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px', flexWrap: 'wrap' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px' }}>
                                    <Shield className="h-3 w-3" style={{ color: getQualityColor(qr.accuracyScore) }} />
                                    <span style={{ fontSize: '11px', fontWeight: '600', color: getQualityColor(qr.accuracyScore) }}>{qr.accuracyScore}%</span>
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>{qr.timeTaken}s</div>
                                  {qr.issues && qr.issues.length > 0 && <div style={{ padding: '3px 8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)' }}>{qr.issues.length} issue{qr.issues.length > 1 ? 's' : ''}</div>}
                                  {qr.aiSummary && <AIInsightDot summary={qr.aiSummary} />}
                                </div>
                              </div>
                              <div>{isQuestionExpanded ? <ChevronUp className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} /> : <ChevronDown className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />}</div>
                            </div>
                          </div>
                          {isQuestionExpanded && qr.issues && qr.issues.length > 0 && (
                            <div style={{ padding: '12px 16px', background: 'rgba(255, 255, 255, 0.02)', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                              <div style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detected Issues:</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {qr.issues.map((issue, issueIdx) => (
                                  <div key={issueIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px' }}>
                                    <div style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: '1px', flexShrink: 0 }}>{getIssueIcon(issue.type)}</div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{issue.type.replace('-', ' ')}</span>
                                        <span style={{ padding: '2px 5px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', fontSize: '9px', color: 'rgba(255, 255, 255, 0.6)', textTransform: 'uppercase' }}>{issue.severity}</span>
                                      </div>
                                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>{issue.description}</div>
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

      {/* ADVANCED ANALYTICS - Collapsible */}
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', padding: '24px' }}>
        <button onClick={() => setShowAdvancedAnalytics(!showAdvancedAnalytics)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>Advanced Analytics</h3>
          {showAdvancedAnalytics ? <ChevronUp className="h-5 w-5" style={{ color: 'rgba(255, 255, 255, 0.6)' }} /> : <ChevronDown className="h-5 w-5" style={{ color: 'rgba(255, 255, 255, 0.6)' }} />}
        </button>
        {showAdvancedAnalytics && (
          <div style={{ marginTop: '24px' }}>
            {questions.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <AccuracyDetector
                  overallAccuracy={overallQualityScore}
                  questionAccuracy={questions.map((q: any, index: number) => {
                    const questionResponses = responses.flatMap(r => r.responses.filter(qr => qr.questionId === q.question_id || qr.questionId === `q${index + 1}`));
                    const avgAccuracy = questionResponses.length > 0 ? Math.round(questionResponses.reduce((acc, qr) => acc + qr.accuracyScore, 0) / questionResponses.length) : 100;
                    return { questionId: q.question_id || `q${index + 1}`, questionText: q.question_text, accuracyScore: avgAccuracy, issues: [] };
                  })}
                  totalResponses={totalResponses}
                  flaggedResponses={flaggedResponses}
                />
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {renderChart('responseByDay')}
              {renderChart('responseByHour')}
              {renderChart('questionCompletion')}
              {renderChart('sentimentTrend')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
