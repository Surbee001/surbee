"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRight, Calendar, Download, ChevronDown, Monitor, Smartphone, Tablet } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, LineChart, Line } from 'recharts';

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
}

// Mini sparkline chart component
const SparklineChart: React.FC<{ data: { count: number }[]; color?: string; height?: number }> = ({
  data,
  color = '#715FDE',
  height = 160
}) => {
  return (
    <div style={{ width: '100%', height: `${height}px`, position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="count"
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${color.replace('#', '')})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Mini line chart for sidebar metrics
const MiniLineChart: React.FC<{ data: { value1: number; value2: number }[]; color1?: string; color2?: string }> = ({
  data,
  color1 = '#E36E30',
  color2 = '#D53670'
}) => {
  return (
    <div style={{ width: '100%', height: '44px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <Line type="monotone" dataKey="value1" stroke={color1} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="value2" stroke={color2} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// Mini bar chart
const MiniBarChart: React.FC<{ data: { count: number }[] }> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: '44px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
          <Bar dataKey="count" fill="#C5C5D2" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Metric card component
const MetricCard: React.FC<{
  title: string;
  stats: { label: string; color: string }[];
  data: { count: number }[];
  onClick?: () => void;
}> = ({ title, stats, data, onClick }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        borderRadius: '8px',
        border: '1px solid var(--surbee-border-subtle)',
        padding: '16px',
        backgroundColor: 'var(--surbee-bg-secondary)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px',
            color: 'var(--surbee-fg-primary)',
          }}
          onClick={onClick}
        >
          <span>{title}</span>
          <ChevronRight size={16} style={{ marginTop: '2px' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '16px', color: 'var(--surbee-fg-muted)' }}>
        {stats.map((stat, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <div
              style={{
                height: '8px',
                width: '8px',
                borderRadius: '2px',
                backgroundColor: stat.color,
              }}
            />
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
      <SparklineChart data={data} height={120} />
    </div>
  );
};

// Progress bar component
const ProgressBar: React.FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <div
      style={{
        width: '100%',
        height: '8px',
        backgroundColor: 'var(--surbee-bg-tertiary)',
        borderRadius: '4px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${percentage}%`,
          height: '100%',
          backgroundColor: '#715FDE',
          borderRadius: '4px',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
};

// Tab toggle component
const TabToggle: React.FC<{
  options: string[];
  selected: string;
  onChange: (value: string) => void;
}> = ({ options, selected, onChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        backgroundColor: 'var(--surbee-bg-tertiary)',
        borderRadius: '8px',
        padding: '2px',
      }}
    >
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: selected === option ? 600 : 400,
            color: selected === option ? 'var(--surbee-fg-primary)' : 'var(--surbee-fg-muted)',
            backgroundColor: selected === option ? 'var(--surbee-bg-secondary)' : 'transparent',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export const UsageTab: React.FC<UsageTabProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('Question types');
  const [selectedGroup, setSelectedGroup] = useState('Devices');
  const [dateRange, setDateRange] = useState('');

  // Fetch data
  useEffect(() => {
    if (!user?.id) return;

    // Set date range
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

  // Calculate stats
  const stats = useMemo(() => {
    const total = responses.length;
    const completed = responses.filter(r => r.status === 'completed').length;
    const avgTime = total > 0 ? responses.reduce((acc, r) => acc + r.completionTime, 0) / total : 0;
    const avgQuality = total > 0 ? responses.reduce((acc, r) => acc + (r.qualityScore || 100), 0) / total : 100;

    const deviceCounts = responses.reduce((acc, r) => {
      acc[r.deviceType] = (acc[r.deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate week over week change
    const oneWeekAgo = subDays(new Date(), 7);
    const twoWeeksAgo = subDays(new Date(), 14);
    const thisWeek = responses.filter(r => r.submittedAt >= oneWeekAgo).length;
    const lastWeek = responses.filter(r => r.submittedAt >= twoWeeksAgo && r.submittedAt < oneWeekAgo).length;

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgTime: avgTime.toFixed(1),
      avgQuality: Math.round(avgQuality),
      devices: deviceCounts,
      thisWeek,
      lastWeek,
      questionCount: questions.length,
    };
  }, [responses, questions]);

  // Trend data for charts
  const trendData = useMemo(() => {
    const data = Array.from({ length: 16 }, (_, i) => {
      const date = subDays(new Date(), 15 - i);
      const count = responses.filter(r => format(r.submittedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).length;
      return { day: format(date, 'MMM d'), count };
    });
    return data;
  }, [responses]);

  // Question type distribution
  const questionTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    questions.forEach(q => {
      const type = q.question_type || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    return Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      responses: responses.length,
    }));
  }, [questions, responses]);

  // Device data for mini chart
  const deviceTrendData = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const date = subDays(new Date(), 15 - i);
      const dayResponses = responses.filter(r => format(r.submittedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
      return {
        value1: dayResponses.filter(r => r.deviceType === 'desktop').length,
        value2: dayResponses.filter(r => r.deviceType === 'mobile').length,
      };
    });
  }, [responses]);

  // Completion trend data
  const completionTrendData = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => {
      const date = subDays(new Date(), 15 - i);
      const count = responses.filter(r =>
        format(r.submittedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') &&
        r.status === 'completed'
      ).length;
      return { count };
    });
  }, [responses]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        backgroundColor: 'var(--surbee-bg-primary)',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid var(--surbee-border-primary)',
          borderTopColor: 'var(--surbee-fg-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      backgroundColor: 'var(--surbee-bg-primary)',
    }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          borderBottom: '1px solid var(--surbee-border-subtle)',
          padding: '12px 24px',
        }}
      >
        <h1 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--surbee-fg-primary)'
        }}>
          Data
        </h1>
        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
          {/* Date picker */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: 'var(--surbee-bg-secondary)',
              border: '1px solid var(--surbee-border-subtle)',
              borderRadius: '8px',
              color: 'var(--surbee-fg-primary)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Calendar size={14} />
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>{dateRange}</span>
            <ChevronDown size={14} />
          </button>

          {/* Export button */}
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'var(--surbee-bg-secondary)',
              border: '1px solid var(--surbee-border-subtle)',
              borderRadius: '8px',
              color: 'var(--surbee-fg-primary)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Top metrics row */}
        <div style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid var(--surbee-border-subtle)' }}>
          {/* Main chart section */}
          <div style={{ flex: 1, padding: '16px 24px', borderRight: '1px solid var(--surbee-border-subtle)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '14px', color: 'var(--surbee-fg-muted)', padding: '4px 0 8px 0' }}>
                    Total Responses
                  </div>
                  <div style={{ fontSize: '48px', fontWeight: 600, color: 'var(--surbee-fg-primary)', lineHeight: 1 }}>
                    {stats.total}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: 'var(--surbee-bg-secondary)',
                      border: '1px solid var(--surbee-border-subtle)',
                      borderRadius: '8px',
                      color: 'var(--surbee-fg-muted)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    Group by <ChevronDown size={12} style={{ marginLeft: '4px' }} />
                  </button>
                  <div style={{ borderLeft: '1px solid var(--surbee-border-subtle)', paddingLeft: '12px' }}>
                    <div
                      style={{
                        padding: '6px 12px',
                        backgroundColor: 'var(--surbee-bg-tertiary)',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--surbee-fg-primary)',
                      }}
                    >
                      1d
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ height: '240px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 20, right: 10, left: 10, bottom: 30 }}>
                    <defs>
                      <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#715FDE" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#715FDE" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#715FDE"
                      strokeWidth={2}
                      fill="url(#responseGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--surbee-fg-muted)', fontSize: '13px', padding: '0 10px' }}>
                <span>{trendData[0]?.day}</span>
                <span>{trendData[trendData.length - 1]?.day}</span>
              </div>
            </div>
          </div>

          {/* Right sidebar metrics */}
          <div style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
            {/* Completion Rate section */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--surbee-border-subtle)' }}>
              <div style={{ fontSize: '14px', color: 'var(--surbee-fg-muted)' }}>Completion Rate</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginTop: '4px' }}>
                {stats.completionRate}% <span style={{ color: 'var(--surbee-fg-muted)', fontWeight: 400, fontSize: '14px' }}>({stats.completed} of {stats.total})</span>
              </div>
              <div style={{ marginTop: '16px' }}>
                <ProgressBar value={stats.completed} max={stats.total || 1} />
              </div>
              <div style={{ fontSize: '13px', color: 'var(--surbee-fg-muted)', marginTop: '12px' }}>
                {stats.questionCount} questions in survey
              </div>
            </div>

            {/* Quality Score section */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--surbee-border-subtle)', flex: 1 }}>
              <div style={{ fontSize: '14px', color: 'var(--surbee-fg-muted)' }}>Avg Quality Score</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginTop: '4px' }}>{stats.avgQuality}%</div>
              <div style={{ marginTop: '16px' }}>
                <MiniLineChart data={deviceTrendData} color1="#22c55e" color2="#715FDE" />
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '12px', color: 'var(--surbee-fg-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#22c55e' }} />
                  Desktop
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#715FDE' }} />
                  Mobile
                </span>
              </div>
            </div>

            {/* Avg Completion Time section */}
            <div style={{ padding: '16px', flex: 1 }}>
              <div style={{ fontSize: '14px', color: 'var(--surbee-fg-muted)' }}>Avg Completion Time</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginTop: '4px' }}>{stats.avgTime}m</div>
              <div style={{ marginTop: '16px' }}>
                <MiniBarChart data={completionTrendData} />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {/* Left: Question type cards */}
          <div style={{ flex: 1, borderRight: '1px solid var(--surbee-border-subtle)' }}>
            <div style={{ padding: '8px 24px', borderBottom: '1px solid var(--surbee-border-subtle)' }}>
              <TabToggle
                options={['Question types', 'Response status']}
                selected={selectedView}
                onChange={setSelectedView}
              />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                padding: '16px 24px 80px 24px',
              }}
            >
              {selectedView === 'Question types' ? (
                <>
                  <MetricCard
                    title="Multiple Choice"
                    stats={[
                      { label: `${questions.filter(q => q.question_type === 'multiple_choice' || q.question_type === 'radio').length} questions`, color: '#715FDE' },
                      { label: `${stats.total} responses`, color: '#C5C5D2' },
                    ]}
                    data={trendData}
                  />
                  <MetricCard
                    title="Text Input"
                    stats={[
                      { label: `${questions.filter(q => q.question_type === 'text' || q.question_type === 'textarea').length} questions`, color: '#715FDE' },
                      { label: `${stats.total} responses`, color: '#C5C5D2' },
                    ]}
                    data={trendData}
                  />
                  <MetricCard
                    title="Rating / Scale"
                    stats={[
                      { label: `${questions.filter(q => q.question_type === 'rating' || q.question_type === 'scale' || q.question_type === 'nps').length} questions`, color: '#715FDE' },
                    ]}
                    data={trendData}
                  />
                  <MetricCard
                    title="Checkbox / Multi-select"
                    stats={[
                      { label: `${questions.filter(q => q.question_type === 'checkbox' || q.question_type === 'multi_select').length} questions`, color: '#715FDE' },
                    ]}
                    data={trendData}
                  />
                  <MetricCard
                    title="Dropdown"
                    stats={[
                      { label: `${questions.filter(q => q.question_type === 'dropdown' || q.question_type === 'select').length} questions`, color: '#715FDE' },
                    ]}
                    data={trendData}
                  />
                  <MetricCard
                    title="Date / Time"
                    stats={[
                      { label: `${questions.filter(q => q.question_type === 'date' || q.question_type === 'time' || q.question_type === 'datetime').length} questions`, color: '#715FDE' },
                    ]}
                    data={trendData}
                  />
                </>
              ) : (
                <>
                  <MetricCard
                    title="Completed"
                    stats={[
                      { label: `${stats.completed} responses`, color: '#22c55e' },
                      { label: `${stats.completionRate}%`, color: '#C5C5D2' },
                    ]}
                    data={completionTrendData}
                  />
                  <MetricCard
                    title="Partial"
                    stats={[
                      { label: `${stats.total - stats.completed} responses`, color: '#f59e0b' },
                      { label: `${100 - stats.completionRate}%`, color: '#C5C5D2' },
                    ]}
                    data={trendData}
                  />
                  <MetricCard
                    title="This Week"
                    stats={[
                      { label: `${stats.thisWeek} responses`, color: '#715FDE' },
                    ]}
                    data={trendData.slice(-7)}
                  />
                  <MetricCard
                    title="Last Week"
                    stats={[
                      { label: `${stats.lastWeek} responses`, color: '#715FDE' },
                    ]}
                    data={trendData.slice(0, 7)}
                  />
                </>
              )}
            </div>
          </div>

          {/* Right: Devices/Sources/Questions */}
          <div style={{ width: '320px' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--surbee-border-subtle)' }}>
              <TabToggle
                options={['Devices', 'Sources', 'Questions']}
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
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px',
                        backgroundColor: 'var(--surbee-bg-secondary)',
                        borderRadius: '8px',
                        gap: '12px',
                      }}>
                        <div style={{ color: 'var(--surbee-fg-muted)' }}>{icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>{label}</div>
                          <div style={{ fontSize: '12px', color: 'var(--surbee-fg-muted)' }}>{count} responses</div>
                        </div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--surbee-fg-primary)' }}>{pct}%</div>
                      </div>
                    );
                  })}
                  {stats.total === 0 && (
                    <div style={{
                      display: 'flex',
                      minHeight: '200px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: 'var(--surbee-fg-muted)',
                    }}>
                      No device data yet
                    </div>
                  )}
                </div>
              ) : selectedGroup === 'Questions' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {questions.slice(0, 5).map((q, idx) => (
                    <div key={q.question_id || idx} style={{
                      padding: '12px',
                      backgroundColor: 'var(--surbee-bg-secondary)',
                      borderRadius: '8px',
                    }}>
                      <div style={{ fontSize: '12px', color: 'var(--surbee-fg-muted)', marginBottom: '4px' }}>Q{idx + 1}</div>
                      <div style={{ fontSize: '13px', color: 'var(--surbee-fg-primary)', lineHeight: 1.4 }}>
                        {q.question_text?.slice(0, 50)}{q.question_text?.length > 50 ? '...' : ''}
                      </div>
                    </div>
                  ))}
                  {questions.length === 0 && (
                    <div style={{
                      display: 'flex',
                      minHeight: '200px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      fontSize: '14px',
                      color: 'var(--surbee-fg-muted)',
                    }}>
                      No questions found
                    </div>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    minHeight: '240px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: '14px',
                    color: 'var(--surbee-fg-muted)',
                  }}
                >
                  Source tracking coming soon
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
