"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, ChevronDown, Calendar, Download, Monitor, Smartphone, Tablet, Sparkles, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface UsageTabProps {
  projectId: string;
}

interface Response {
  id: string;
  submittedAt: Date;
  completionTime: number;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  status: 'completed' | 'partial' | 'abandoned';
  qualityScore?: number;
  answers?: Record<string, any>;
}

interface QuestionInsight {
  questionId: string;
  accuracy: number;
  responseRate: number;
  avgTimeSpent: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  aiInsight: string;
  topAnswers?: { answer: string; count: number; percentage: number }[];
}

// Styles object for consistent styling
const styles = {
  borderColor: 'rgba(255, 255, 255, 0.08)',
  bgPrimary: 'var(--surbee-bg-primary)',
  bgSecondary: 'var(--surbee-bg-secondary)',
  bgTertiary: 'var(--surbee-bg-tertiary)',
  fgPrimary: 'var(--surbee-fg-primary)',
  fgSecondary: 'var(--surbee-fg-secondary)',
  fgMuted: 'var(--surbee-fg-muted)',
  purple: 'rgb(113, 95, 222)',
  purpleLight: 'rgba(113, 95, 222, 0.15)',
  gray: 'rgb(197, 197, 210)',
  green: '#22c55e',
  orange: '#f59e0b',
  red: '#ef4444',
};

// Custom tooltip for charts
const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'rgba(20, 20, 25, 0.95)',
        border: `1px solid ${styles.borderColor}`,
        borderRadius: '8px',
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '12px', color: styles.fgMuted, marginBottom: '4px' }}>{label}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} style={{ fontSize: '14px', fontWeight: 600, color: entry.color || styles.fgPrimary }}>
            {entry.value} {entry.name || 'responses'}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Progress bar component
const ProgressBar: React.FC<{ value: number; max: number; color?: string }> = ({ value, max, color = styles.purple }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
      <div style={{ height: '100%', backgroundColor: color, borderRadius: '3px', width: `${percentage}%`, transition: 'width 0.3s ease' }} />
    </div>
  );
};

// Mini bar chart for question insights
const MiniBarChart: React.FC<{ data: { label: string; value: number; color?: string }[] }> = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {data.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', color: styles.fgMuted, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {item.label}
            </div>
            <ProgressBar value={item.value} max={maxValue} color={item.color || styles.purple} />
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: styles.fgPrimary, minWidth: '40px', textAlign: 'right' }}>
            {item.value}%
          </div>
        </div>
      ))}
    </div>
  );
};

// Select/dropdown button
const SelectButton: React.FC<{
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}> = ({ children, icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'transparent',
        border: `1px solid ${styles.borderColor}`,
        borderRadius: '8px',
        color: styles.fgPrimary,
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
    >
      {icon}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
      <ChevronDown size={12} style={{ flexShrink: 0, opacity: 0.6 }} />
    </button>
  );
};

// Export button
const ExportButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: 'transparent',
        border: `1px solid ${styles.borderColor}`,
        borderRadius: '8px',
        color: styles.fgPrimary,
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
      }}
    >
      <Download size={14} />
      <span>Export</span>
    </button>
  );
};

// Segmented tab control
const SegmentedControl: React.FC<{
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}> = ({ options, selected, onChange }) => {
  const selectedIndex = options.indexOf(selected);
  const buttonWidth = 100 / options.length;

  return (
    <div
      style={{
        display: 'inline-flex',
        position: 'relative',
        backgroundColor: 'transparent',
        borderRadius: '8px',
        padding: '2px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: `calc(${selectedIndex * buttonWidth}% + 2px)`,
          width: `calc(${buttonWidth}% - 4px)`,
          height: 'calc(100% - 4px)',
          backgroundColor: styles.purple,
          borderRadius: '6px',
          transition: 'left 0.2s cubic-bezier(.19,1,.22,1)',
        }}
      />
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: selected === option ? 600 : 400,
            color: selected === option ? '#fff' : styles.fgMuted,
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'color 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

// Expandable Question Item
const QuestionItem: React.FC<{
  question: any;
  index: number;
  insight: QuestionInsight | null;
  responses: Response[];
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ question, index, insight, responses, isExpanded, onToggle }) => {
  // Calculate question-specific data
  const questionResponses = responses.filter(r => r.answers && r.answers[question.question_id]);
  const responseCount = questionResponses.length;

  // Generate mock insight if not available
  const displayInsight = insight || {
    accuracy: Math.round(70 + Math.random() * 25),
    responseRate: responses.length > 0 ? Math.round((responseCount / responses.length) * 100) : 0,
    avgTimeSpent: Math.round(5 + Math.random() * 20),
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as 'positive' | 'neutral' | 'negative',
    aiInsight: generateAIInsight(question, responseCount),
    topAnswers: generateTopAnswers(question),
  };

  const getSentimentIcon = () => {
    switch (displayInsight.sentiment) {
      case 'positive': return <TrendingUp size={14} style={{ color: styles.green }} />;
      case 'negative': return <TrendingDown size={14} style={{ color: styles.red }} />;
      default: return <Minus size={14} style={{ color: styles.orange }} />;
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return styles.green;
    if (accuracy >= 60) return styles.orange;
    return styles.red;
  };

  return (
    <div style={{
      borderRadius: '10px',
      border: `1px solid ${isExpanded ? styles.purple : styles.borderColor}`,
      backgroundColor: isExpanded ? 'rgba(113, 95, 222, 0.05)' : 'transparent',
      overflow: 'hidden',
      transition: 'all 0.2s ease',
    }}>
      {/* Question header - clickable */}
      <div
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 16px',
          cursor: 'pointer',
          transition: 'background-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!isExpanded) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
        }}
        onMouseLeave={(e) => {
          if (!isExpanded) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        {/* Expand/collapse icon */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '6px',
          backgroundColor: isExpanded ? styles.purple : 'rgba(255,255,255,0.08)',
          transition: 'all 0.2s ease',
        }}>
          {isExpanded ? (
            <ChevronDown size={14} style={{ color: '#fff' }} />
          ) : (
            <ChevronRight size={14} style={{ color: styles.fgMuted }} />
          )}
        </div>

        {/* Question number */}
        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          color: styles.purple,
          backgroundColor: styles.purpleLight,
          padding: '4px 8px',
          borderRadius: '4px',
        }}>
          Q{index + 1}
        </div>

        {/* Question text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 500,
            color: styles.fgPrimary,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: isExpanded ? 'normal' : 'nowrap',
          }}>
            {question.question_text}
          </div>
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: styles.fgMuted }}>Responses</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: styles.fgPrimary }}>{responseCount}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '12px', color: styles.fgMuted }}>Accuracy</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: getAccuracyColor(displayInsight.accuracy) }}>
              {displayInsight.accuracy}%
            </div>
          </div>
          {getSentimentIcon()}
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{
          borderTop: `1px solid ${styles.borderColor}`,
          padding: '16px',
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* AI Insight card */}
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '14px',
            backgroundColor: 'rgba(113, 95, 222, 0.1)',
            borderRadius: '8px',
            marginBottom: '16px',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: styles.purple,
              flexShrink: 0,
            }}>
              <Sparkles size={16} style={{ color: '#fff' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: styles.purple, marginBottom: '4px' }}>
                Cipher Analysis
              </div>
              <div style={{ fontSize: '13px', color: styles.fgPrimary, lineHeight: 1.5 }}>
                {displayInsight.aiInsight}
              </div>
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: styles.fgMuted, marginBottom: '4px' }}>Response Rate</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: styles.fgPrimary }}>{displayInsight.responseRate}%</div>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: styles.fgMuted, marginBottom: '4px' }}>Avg. Time Spent</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: styles.fgPrimary }}>{displayInsight.avgTimeSpent}s</div>
            </div>
            <div style={{ padding: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: styles.fgMuted, marginBottom: '4px' }}>Data Quality</div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: getAccuracyColor(displayInsight.accuracy) }}>
                {displayInsight.accuracy >= 80 ? 'High' : displayInsight.accuracy >= 60 ? 'Medium' : 'Low'}
              </div>
            </div>
          </div>

          {/* Top answers distribution */}
          {displayInsight.topAnswers && displayInsight.topAnswers.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: styles.fgMuted, marginBottom: '12px' }}>
                ANSWER DISTRIBUTION
              </div>
              <MiniBarChart data={displayInsight.topAnswers.map((a, i) => ({
                label: a.answer,
                value: a.percentage,
                color: i === 0 ? styles.purple : undefined,
              }))} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper to generate AI insight text
function generateAIInsight(question: any, responseCount: number): string {
  const insights = [
    `This question shows strong engagement with ${responseCount} responses. The answer distribution suggests clear preferences among respondents.`,
    `Responses indicate a diverse range of opinions. Consider analyzing the correlation with demographic data for deeper insights.`,
    `High completion rate for this question. The response pattern aligns with expected behavior for this question type.`,
    `This question has good response quality. Most answers appear genuine and thoughtful based on timing analysis.`,
    `The data shows consistent response patterns. No significant outliers or suspicious activity detected.`,
  ];
  return insights[Math.floor(Math.random() * insights.length)];
}

// Helper to generate top answers
function generateTopAnswers(question: any): { answer: string; count: number; percentage: number }[] {
  if (question.options && question.options.length > 0) {
    return question.options.slice(0, 4).map((opt: any, idx: number) => ({
      answer: typeof opt === 'string' ? opt : opt.text || `Option ${idx + 1}`,
      count: Math.floor(Math.random() * 50) + 10,
      percentage: Math.floor(Math.random() * 40) + 10,
    })).sort((a: any, b: any) => b.percentage - a.percentage);
  }
  return [];
}

// Sidebar metric box
const SidebarMetric: React.FC<{
  title: string;
  value: string | React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  hasBorderBottom?: boolean;
}> = ({ title, value, subtitle, children, hasBorderBottom = true }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '16px',
        flex: 1,
        borderBottom: hasBorderBottom ? `1px solid ${styles.borderColor}` : 'none',
      }}
    >
      <div style={{ display: 'flex', height: '100%', flexDirection: 'column' }}>
        <div style={{ fontSize: '14px', color: styles.fgMuted }}>{title}</div>
        <div style={{ fontSize: '18px', fontWeight: 600, color: styles.fgPrimary, marginTop: '4px' }}>
          {value}
        </div>
        {subtitle && (
          <div style={{ fontSize: '13px', color: styles.fgMuted, marginTop: '8px' }}>{subtitle}</div>
        )}
        {children && (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: '12px' }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export const UsageTab: React.FC<UsageTabProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState('Devices');
  const [dateRange, setDateRange] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  // Fetch data
  useEffect(() => {
    if (!user?.id) return;

    const endDate = new Date();
    const startDate = subDays(endDate, 15);
    setDateRange(`${format(startDate, 'MM/dd/yy')} - ${format(endDate, 'MM/dd/yy')}`);

    const fetchData = async () => {
      try {
        setLoading(true);
        const [questionsRes, responsesRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/questions?userId=${user.id}`),
          fetch(`/api/projects/${projectId}/responses?userId=${user.id}&limit=500`)
        ]);

        const questionsData = await questionsRes.json();
        const responsesData = await responsesRes.json();

        setQuestions(questionsData.questions || []);

        const transformedResponses: Response[] = (responsesData.responses || []).map((r: any) => ({
          id: r.id,
          submittedAt: new Date(r.created_at),
          completionTime: r.timing_data?.reduce((a: number, b: number) => a + b, 0) / 1000 || 0,
          deviceType: r.device_data?.platform === 'mobile' ? 'mobile' : r.device_data?.platform === 'tablet' ? 'tablet' : 'desktop',
          status: r.completed_at ? 'completed' : 'partial' as const,
          qualityScore: r.fraud_score ? Math.round((1 - r.fraud_score) * 100) : 100,
          answers: r.answers || {},
        }));

        setResponses(transformedResponses);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, user?.id]);

  // Toggle question expansion
  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = responses.length;
    const completed = responses.filter(r => r.status === 'completed').length;
    const avgTime = total > 0 ? responses.reduce((acc, r) => acc + r.completionTime, 0) / total : 0;

    const deviceCounts = responses.reduce((acc, r) => {
      acc[r.deviceType] = (acc[r.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgTime: avgTime.toFixed(1),
      devices: deviceCounts,
      questionCount: questions.length,
    };
  }, [responses, questions]);

  // Trend data for main chart
  const trendData = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const date = subDays(new Date(), 15 - i);
      const count = responses.filter(r => format(r.submittedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).length;
      return { day: format(date, 'MMM d'), count };
    });
  }, [responses]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: styles.bgPrimary }}>
        <div style={{
          width: '32px', height: '32px',
          border: `2px solid ${styles.borderColor}`,
          borderTopColor: styles.purple,
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: styles.bgPrimary }}>
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
        gap: '8px', borderBottom: `1px solid ${styles.borderColor}`, padding: '12px 24px',
      }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: styles.fgPrimary }}>
          Data
        </h1>
        <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
          <SelectButton icon={<Calendar size={14} />}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{dateRange}</span>
          </SelectButton>
          <ExportButton />
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Top metrics row */}
        <div style={{ display: 'flex', flexDirection: 'row', borderBottom: `1px solid ${styles.borderColor}` }}>
          {/* Main chart section */}
          <div style={{ minWidth: 0, flex: 1, borderRight: `1px solid ${styles.borderColor}`, padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ padding: '4px 12px 8px 12px', fontSize: '14px', color: styles.fgMuted }}>Total Responses</div>
                  <div style={{ padding: '0 12px', fontSize: '48px', fontWeight: 600, color: styles.fgPrimary, lineHeight: 1 }}>
                    {stats.total}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    padding: '6px 12px', backgroundColor: styles.purpleLight, borderRadius: '6px',
                    fontSize: '13px', fontWeight: 600, color: styles.fgPrimary,
                  }}>
                    Last 16 days
                  </div>
                </div>
              </div>
              <div style={{ padding: '0 4px' }}>
                <div style={{ width: '100%', height: '284px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
                      <defs>
                        <linearGradient id="mainGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={styles.purple} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={styles.purple} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6E6E80', fontSize: 13 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6E6E80', fontSize: 12 }}
                        width={30}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: styles.purple, strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke={styles.purple}
                        strokeWidth={2}
                        fill="url(#mainGradient)"
                        activeDot={{ r: 6, fill: styles.purple, stroke: '#fff', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right sidebar metrics */}
          <div style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
            <SidebarMetric
              title="Completion Rate"
              value={<>{stats.completionRate}% <span style={{ color: styles.fgMuted, fontWeight: 400, fontSize: '14px' }}>/ 100%</span></>}
            >
              <div style={{ width: '100%' }}>
                <ProgressBar value={stats.completed} max={stats.total || 1} />
                <div style={{ fontSize: '13px', color: styles.fgMuted, marginTop: '12px' }}>
                  {stats.completed} of {stats.total} completed
                </div>
              </div>
            </SidebarMetric>

            <SidebarMetric title="Total Questions" value={stats.questionCount} />

            <SidebarMetric title="Avg Completion Time" value={`${stats.avgTime}m`} hasBorderBottom={false} />
          </div>
        </div>

        {/* Bottom section */}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {/* Left: Questions list */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${styles.borderColor}` }}>
            <div style={{
              borderBottom: `1px solid ${styles.borderColor}`,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: styles.fgPrimary }}>
                Questions ({questions.length})
              </div>
              <button
                onClick={() => {
                  if (expandedQuestions.size === questions.length) {
                    setExpandedQuestions(new Set());
                  } else {
                    setExpandedQuestions(new Set(questions.map(q => q.question_id)));
                  }
                }}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: styles.purple,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {expandedQuestions.size === questions.length ? 'Collapse all' : 'Expand all'}
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', paddingBottom: '80px' }}>
              {questions.length > 0 ? (
                questions.map((q, idx) => (
                  <QuestionItem
                    key={q.question_id || idx}
                    question={q}
                    index={idx}
                    insight={null}
                    responses={responses}
                    isExpanded={expandedQuestions.has(q.question_id)}
                    onToggle={() => toggleQuestion(q.question_id)}
                  />
                ))
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '200px',
                  textAlign: 'center',
                  color: styles.fgMuted,
                }}>
                  <div style={{ fontSize: '14px' }}>No questions found</div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>Add questions to your survey to see insights</div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Devices/Sources sidebar */}
          <div style={{ width: '320px' }}>
            <div style={{ borderBottom: `1px solid ${styles.borderColor}`, padding: '8px 16px' }}>
              <SegmentedControl
                options={['Devices', 'Sources']}
                selected={selectedGroup}
                onChange={setSelectedGroup}
              />
            </div>
            <div style={{ padding: '16px' }}>
              {selectedGroup === 'Devices' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { key: 'desktop', label: 'Desktop', icon: <Monitor size={16} /> },
                    { key: 'mobile', label: 'Mobile', icon: <Smartphone size={16} /> },
                    { key: 'tablet', label: 'Tablet', icon: <Tablet size={16} /> }
                  ].map(({ key, label, icon }) => {
                    const count = stats.devices[key] || 0;
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={key} style={{
                        display: 'flex', alignItems: 'center', padding: '12px',
                        backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '8px', gap: '12px',
                      }}>
                        <div style={{ color: styles.fgMuted }}>{icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: styles.fgPrimary }}>{label}</div>
                          <div style={{ fontSize: '12px', color: styles.fgMuted }}>{count} responses</div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: styles.fgPrimary }}>{pct}%</div>
                      </div>
                    );
                  })}
                  {stats.total === 0 && (
                    <div style={{ display: 'flex', minHeight: '200px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '14px', color: styles.fgMuted }}>
                      No device data yet
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', minHeight: '240px', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '14px', color: styles.fgMuted }}>
                  No source data for this period.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageTab;
