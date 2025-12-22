"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Download, ChevronDown, ChevronUp, Monitor, Smartphone, Tablet, AlertTriangle, Zap, Copy, Hash, TrendingUp, TrendingDown, ArrowUpRight, Users } from 'lucide-react';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, BarChart, Bar, LineChart, Line } from 'recharts';

interface InsightsTabRedesignProps {
  projectId: string;
}

interface QuestionIssue {
  type: 'spam' | 'copy-paste' | 'too-quick' | 'pattern';
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface QuestionResponse {
  questionId: string;
  questionText: string;
  answer: string;
  accuracyScore: number;
  timeTaken: number;
  issues?: QuestionIssue[];
}

interface Response {
  id: string;
  submittedAt: Date;
  completionTime: number;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  status: 'completed' | 'partial' | 'abandoned';
  responses: QuestionResponse[];
  qualityScore?: number;
}

export const InsightsTabRedesign: React.FC<InsightsTabRedesignProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [responses, setResponses] = useState<Response[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'responses' | 'funnel'>('overview');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // Fetch data
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const [questionsRes, responsesRes] = await Promise.all([
          fetch(`/api/projects/${projectId}/questions?userId=${user.id}`),
          fetch(`/api/projects/${projectId}/responses?userId=${user.id}&limit=100`)
        ]);

        const questionsData = await questionsRes.json();
        const responsesData = await responsesRes.json();

        setQuestions(questionsData.questions || []);

        const transformedResponses: Response[] = (responsesData.responses || []).map((r: any) => {
          const questionResponses: QuestionResponse[] = Object.entries(r.responses || {}).map(([qId, answer]: [string, any]) => {
            let question = questionsData.questions?.find((q: any) => q.question_id === qId);
            let qIndex = questionsData.questions?.findIndex((q: any) => q.question_id === qId) ?? -1;

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
    const weekChange = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;

    return {
      total,
      completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgTime: avgTime.toFixed(1),
      avgQuality: Math.round(avgQuality),
      devices: deviceCounts,
      weekChange,
      thisWeek
    };
  }, [responses]);

  // Trend data for charts
  const trendData = useMemo(() => {
    const days = timePeriod === 'week' ? 7 : timePeriod === 'month' ? 30 : timePeriod === 'quarter' ? 90 : 365;
    const data = Array.from({ length: Math.min(days, 14) }, (_, i) => {
      const date = subDays(new Date(), Math.min(days, 14) - 1 - i);
      const count = responses.filter(r => format(r.submittedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')).length;
      return {
        day: format(date, days <= 7 ? 'EEE' : 'MMM d'),
        count,
        date: format(date, 'MMM d')
      };
    });
    return data;
  }, [responses, timePeriod]);

  // Hourly distribution for bar chart
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    responses.forEach(r => {
      const hour = r.submittedAt.getHours();
      hours[hour].count++;
    });
    return hours;
  }, [responses]);

  const getDeviceIcon = (device: string) => {
    const iconProps = { size: 14, strokeWidth: 1.5 };
    switch (device) {
      case 'mobile': return <Smartphone {...iconProps} />;
      case 'tablet': return <Tablet {...iconProps} />;
      default: return <Monitor {...iconProps} />;
    }
  };

  const getIssueIcon = (type: string) => {
    const iconProps = { size: 12, strokeWidth: 1.5 };
    switch (type) {
      case 'spam': return <Hash {...iconProps} />;
      case 'copy-paste': return <Copy {...iconProps} />;
      case 'too-quick': return <Zap {...iconProps} />;
      case 'pattern': return <AlertTriangle {...iconProps} />;
      default: return <AlertTriangle {...iconProps} />;
    }
  };

  if (loading) {
    return (
      <div className="insights-loading">
        <div className="loader" />
        <style jsx>{`
          .insights-loading {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loader {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 2px solid var(--surbee-border-primary, rgba(255,255,255,0.1));
            border-top-color: var(--surbee-fg-primary, #E8E8E8);
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="insights-root">
      {/* Header with Navigation and Time Period */}
      <header className="insights-header">
        <nav className="insights-nav">
          {(['overview', 'responses', 'funnel'] as const).map((view) => (
            <button
              key={view}
              className={`nav-btn ${activeView === view ? 'active' : ''}`}
              onClick={() => setActiveView(view)}
            >
              {view === 'funnel' ? 'Flow' : view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </nav>

        {activeView === 'overview' && (
          <div className="time-selector">
            {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
              <button
                key={period}
                className={`time-btn ${timePeriod === period ? 'active' : ''}`}
                onClick={() => setTimePeriod(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* OVERVIEW VIEW */}
      {activeView === 'overview' && (
        <div className="view-content">
          {/* Bento Grid Layout */}
          <div className="bento-grid">
            {/* Main Stats Card - Large */}
            <div className="bento-card main-stats">
              <div className="card-label">Total Responses</div>
              <div className="main-number">{stats.total}</div>
              <div className="change-indicator">
                {stats.weekChange >= 0 ? (
                  <span className="change positive">
                    <TrendingUp size={14} />
                    +{stats.weekChange}%
                  </span>
                ) : (
                  <span className="change negative">
                    <TrendingDown size={14} />
                    {stats.weekChange}%
                  </span>
                )}
                <span className="change-label">vs last week</span>
              </div>
              <div className="mini-chart">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="miniGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8E8E8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#E8E8E8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="count" stroke="#E8E8E8" strokeWidth={2} fill="url(#miniGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="bento-card stat-card">
              <div className="stat-content">
                <div className="stat-number">
                  {stats.completionRate}<span className="stat-unit">%</span>
                </div>
                <div className="stat-label">Completion Rate</div>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${stats.completionRate}%` }} />
              </div>
            </div>

            {/* Average Time */}
            <div className="bento-card stat-card">
              <div className="stat-content">
                <div className="stat-number">
                  {stats.avgTime}<span className="stat-unit">m</span>
                </div>
                <div className="stat-label">Avg. Completion</div>
              </div>
            </div>

            {/* Quality Score */}
            <div className="bento-card stat-card">
              <div className="stat-content">
                <div className="stat-number">{stats.avgQuality}</div>
                <div className="stat-label">Quality Score</div>
              </div>
              <div className="quality-indicator">
                <span className={`quality-dot ${stats.avgQuality >= 80 ? 'excellent' : stats.avgQuality >= 60 ? 'good' : 'needs-work'}`} />
                {stats.avgQuality >= 80 ? 'Excellent' : stats.avgQuality >= 60 ? 'Good' : 'Needs Review'}
              </div>
            </div>

            {/* Featured Insight Card */}
            <div className="bento-card insight-feature">
              <div className="insight-badge">Insight</div>
              <div className="insight-text">
                {stats.total > 0 ? (
                  <>
                    Your survey collected <strong>{stats.thisWeek} responses</strong> this week
                    {stats.weekChange > 0 && <>, showing <strong>{stats.weekChange}% growth</strong></>}
                  </>
                ) : (
                  <>No responses yet. Share your survey to start collecting data.</>
                )}
              </div>
              <div className="insight-chart">
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                    <Line type="monotone" dataKey="count" stroke="#0a0a0a" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activity Chart */}
            <div className="bento-card chart-card">
              <div className="chart-header">
                <span className="chart-title">Response Activity</span>
                <span className="chart-period">{timePeriod === 'week' ? 'Last 7 days' : timePeriod === 'month' ? 'Last 30 days' : timePeriod === 'quarter' ? 'Last 90 days' : 'Last year'}</span>
              </div>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--surbee-fg-muted)', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--surbee-bg-elevated)',
                        border: '1px solid var(--surbee-border-primary)',
                        borderRadius: 8,
                        fontSize: 12,
                        padding: '8px 12px'
                      }}
                      formatter={(value: number) => [`${value} responses`, '']}
                    />
                    <Bar dataKey="count" fill="var(--surbee-fg-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Devices Breakdown */}
            <div className="bento-card devices-card">
              <div className="card-title">Devices</div>
              <div className="devices-list">
                {[
                  { key: 'desktop', label: 'Desktop', icon: <Monitor size={16} /> },
                  { key: 'mobile', label: 'Mobile', icon: <Smartphone size={16} /> },
                  { key: 'tablet', label: 'Tablet', icon: <Tablet size={16} /> }
                ].map(({ key, label, icon }) => {
                  const count = stats.devices[key] || 0;
                  const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={key} className="device-item">
                      <div className="device-info">
                        <span className="device-icon">{icon}</span>
                        <span className="device-name">{label}</span>
                      </div>
                      <div className="device-stats">
                        <div className="device-bar">
                          <div className="device-bar-fill" style={{ width: `${Math.max(pct, 2)}%` }} />
                        </div>
                        <span className="device-pct">{pct}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bento-card recent-card">
              <div className="card-title">Recent</div>
              <div className="recent-list">
                {responses.slice(0, 4).map((r, idx) => (
                  <div key={r.id} className="recent-item">
                    <div className="recent-avatar">{getDeviceIcon(r.deviceType)}</div>
                    <div className="recent-info">
                      <span className="recent-time">{formatDistanceToNow(r.submittedAt, { addSuffix: true })}</span>
                      <span className="recent-status">{r.status}</span>
                    </div>
                    <div className="recent-score">
                      <span className={`score-badge ${(r.qualityScore || 100) >= 80 ? 'high' : 'mid'}`}>
                        {r.qualityScore || 100}
                      </span>
                    </div>
                  </div>
                ))}
                {responses.length === 0 && (
                  <div className="recent-empty">No responses yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESPONSES VIEW - Bento Style */}
      {activeView === 'responses' && (
        <div className="view-content">
          {/* Top Stats Row */}
          <div className="responses-bento">
            {/* Summary Stats */}
            <div className="bento-card resp-total">
              <div className="resp-big-number">{stats.total}</div>
              <div className="resp-label">Total Responses</div>
              <button className="export-fab">
                <Download size={14} />
              </button>
            </div>

            <div className="bento-card resp-stat">
              <div className="resp-stat-number">{stats.completed}</div>
              <div className="resp-stat-label">Completed</div>
              <div className="resp-stat-bar">
                <div className="resp-stat-fill completed" style={{ width: `${stats.completionRate}%` }} />
              </div>
            </div>

            <div className="bento-card resp-stat">
              <div className="resp-stat-number">{responses.filter(r => r.qualityScore && r.qualityScore < 60).length}</div>
              <div className="resp-stat-label">Flagged</div>
              <div className="resp-stat-icon flagged">
                <AlertTriangle size={14} />
              </div>
            </div>

            <div className="bento-card resp-stat">
              <div className="resp-stat-number">{stats.avgQuality}<span className="resp-unit">%</span></div>
              <div className="resp-stat-label">Avg Quality</div>
              <div className={`resp-quality-dot ${stats.avgQuality >= 80 ? 'high' : stats.avgQuality >= 60 ? 'mid' : 'low'}`} />
            </div>

            {/* Response Cards Grid */}
            {responses.length === 0 ? (
              <div className="bento-card resp-empty-card">
                <div className="empty-circle" />
                <span>No responses yet</span>
              </div>
            ) : (
              responses.slice(0, 8).map((response, idx) => {
                const isExpanded = expandedResponse === response.id;
                return (
                  <div
                    key={response.id}
                    className={`bento-card resp-card ${isExpanded ? 'expanded' : ''} ${idx === 0 ? 'featured' : ''}`}
                    onClick={() => {
                      setExpandedResponse(isExpanded ? null : response.id);
                      setExpandedQuestion(null);
                    }}
                  >
                    <div className="resp-card-header">
                      <span className="resp-card-id">#{String(idx + 1).padStart(3, '0')}</span>
                      <span className={`resp-card-quality ${(response.qualityScore || 100) >= 80 ? 'high' : (response.qualityScore || 100) >= 60 ? 'mid' : 'low'}`}>
                        {response.qualityScore || 100}
                      </span>
                    </div>
                    <div className="resp-card-time">{formatDistanceToNow(response.submittedAt, { addSuffix: true })}</div>
                    <div className="resp-card-meta">
                      <span className="resp-card-device">{getDeviceIcon(response.deviceType)}</span>
                      <span className="resp-card-duration">{response.completionTime.toFixed(1)}m</span>
                      <span className={`resp-card-status ${response.status}`} />
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="resp-card-expanded" onClick={(e) => e.stopPropagation()}>
                        <div className="resp-card-divider" />
                        <div className="resp-card-answers">
                          {response.responses.map((qr, qIdx) => {
                            const questionKey = `${response.id}-${qr.questionId}`;
                            const isQuestionExpanded = expandedQuestion === questionKey;
                            const hasIssues = qr.issues && qr.issues.length > 0;

                            return (
                              <div
                                key={qr.questionId}
                                className={`resp-answer ${hasIssues ? 'has-issues' : ''}`}
                                onClick={() => hasIssues && setExpandedQuestion(isQuestionExpanded ? null : questionKey)}
                              >
                                <div className="resp-answer-q">
                                  <span className="resp-q-num">Q{qIdx + 1}</span>
                                  {qr.questionText}
                                </div>
                                <div className="resp-answer-a">{qr.answer}</div>
                                <div className="resp-answer-meta">
                                  <span>{qr.timeTaken}s</span>
                                  <span className={`resp-score ${qr.accuracyScore >= 80 ? 'high' : 'low'}`}>{qr.accuracyScore}%</span>
                                  {hasIssues && <span className="resp-issues-badge">{qr.issues!.length} issue{qr.issues!.length > 1 ? 's' : ''}</span>}
                                </div>
                                {isQuestionExpanded && hasIssues && (
                                  <div className="resp-issues-detail">
                                    {qr.issues!.map((issue, i) => (
                                      <div key={i} className="resp-issue">
                                        <span className="resp-issue-type">{issue.type}</span>
                                        <span className={`resp-issue-sev ${issue.severity}`}>{issue.severity}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Show more card if more than 8 responses */}
            {responses.length > 8 && (
              <div className="bento-card resp-more">
                <span className="resp-more-count">+{responses.length - 8}</span>
                <span className="resp-more-label">more responses</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FUNNEL VIEW - Table Style */}
      {activeView === 'funnel' && (
        <div className="view-content">
          {/* Summary Stats Row */}
          <div className="flow-summary">
            <div className="flow-summary-stat">
              <span className="flow-summary-num">{questions.length}</span>
              <span className="flow-summary-label">Questions</span>
            </div>
            <div className="flow-summary-divider" />
            <div className="flow-summary-stat">
              <span className="flow-summary-num">{stats.total}</span>
              <span className="flow-summary-label">Started</span>
            </div>
            <div className="flow-summary-divider" />
            <div className="flow-summary-stat">
              <span className="flow-summary-num">{stats.completed}</span>
              <span className="flow-summary-label">Completed</span>
            </div>
            <div className="flow-summary-divider" />
            <div className="flow-summary-stat highlight">
              <span className="flow-summary-num">{stats.completionRate}%</span>
              <span className="flow-summary-label">Completion Rate</span>
            </div>
          </div>

          {/* Questions Table */}
          <div className="flow-table">
            <div className="flow-table-header">
              <span className="flow-col-num">#</span>
              <span className="flow-col-question">Question</span>
              <span className="flow-col-responses">Responses</span>
              <span className="flow-col-retention">Retention</span>
              <span className="flow-col-dropoff">Drop-off</span>
            </div>

            {questions.length === 0 ? (
              <div className="flow-table-empty">
                <div className="empty-circle" />
                <span>No questions found</span>
              </div>
            ) : (
              questions.map((q: any, idx: number) => {
                const answered = responses.filter(r =>
                  r.responses.some(qr => qr.questionId === q.question_id || qr.questionId === `q${idx + 1}`)
                ).length;
                const retention = stats.total > 0 ? Math.round((answered / stats.total) * 100) : 0;
                const prevAnswered = idx === 0 ? stats.total : responses.filter(r =>
                  r.responses.some(qr => qr.questionId === questions[idx - 1]?.question_id || qr.questionId === `q${idx}`)
                ).length;
                const dropoff = prevAnswered > 0 ? Math.round(((prevAnswered - answered) / prevAnswered) * 100) : 0;
                const isHighDropoff = dropoff > 10 && idx > 0;

                return (
                  <div key={q.question_id || idx} className={`flow-table-row ${isHighDropoff ? 'high-dropoff' : ''}`}>
                    <span className="flow-col-num">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="flow-col-question">
                      <span className="flow-question-text">{q.question_text}</span>
                      <div className="flow-progress-bar">
                        <div className="flow-progress-fill" style={{ width: `${retention}%` }} />
                      </div>
                    </div>
                    <span className="flow-col-responses">{answered}</span>
                    <span className="flow-col-retention">{retention}%</span>
                    <span className={`flow-col-dropoff ${isHighDropoff ? 'danger' : ''}`}>
                      {idx === 0 ? '—' : `-${dropoff}%`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .insights-root {
          --font-display: 'Kalice Regular', 'Kalice-Trial-Regular', Georgia, serif;
          --font-body: var(--font-inter, 'Sohne', -apple-system, sans-serif);
          --font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;
          --accent: #091717;

          font-family: var(--font-body);
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Header */
        .insights-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .insights-nav {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 12px;
        }

        .nav-btn {
          padding: 10px 20px;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          color: var(--surbee-fg-muted, #888);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .nav-btn:hover {
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .nav-btn.active {
          background: var(--surbee-bg-primary, #131314);
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .time-selector {
          display: flex;
          gap: 4px;
        }

        .time-btn {
          padding: 8px 14px;
          background: transparent;
          border: 1px solid var(--surbee-border-primary, rgba(255,255,255,0.1));
          border-radius: 8px;
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .time-btn:hover {
          border-color: var(--surbee-fg-muted, #888);
        }

        .time-btn.active {
          background: var(--surbee-fg-primary, #E8E8E8);
          border-color: var(--surbee-fg-primary, #E8E8E8);
          color: var(--surbee-bg-primary, #131314);
        }

        /* Bento Grid */
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: minmax(120px, auto);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .bento-grid {
            grid-template-columns: 1fr;
          }
        }

        .bento-card {
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 8px;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Main Stats Card */
        .main-stats {
          grid-column: span 2;
          grid-row: span 2;
        }

        .card-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .main-number {
          font-family: var(--font-display);
          font-size: 96px;
          font-weight: 400;
          line-height: 1;
          margin-bottom: 16px;
          letter-spacing: -4px;
        }

        .change-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 13px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .change.positive {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .change.negative {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .change-label {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        .mini-chart {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 80px;
        }

        /* Stat Cards */
        .stat-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .stat-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 10px;
          color: var(--surbee-fg-muted, #888);
        }

        .stat-content {
          flex: 1;
        }

        .stat-number {
          font-family: var(--font-mono);
          font-size: 32px;
          font-weight: 500;
          line-height: 1;
        }

        .stat-unit {
          font-size: 18px;
          opacity: 0.5;
          margin-left: 2px;
        }

        .stat-label {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          margin-top: 4px;
        }

        .stat-bar {
          height: 4px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 2px;
          overflow: hidden;
          margin-top: auto;
        }

        .stat-bar-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .quality-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          margin-top: auto;
        }

        .quality-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .quality-dot.excellent { background: #22c55e; }
        .quality-dot.good { background: #f59e0b; }
        .quality-dot.needs-work { background: #ef4444; }

        /* Insight Feature Card */
        .insight-feature {
          grid-column: span 2;
          background: var(--accent);
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .insight-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 8px;
          background: rgba(255,255,255,0.15);
          border-radius: 4px;
          display: inline-block;
          margin-bottom: 16px;
        }

        .insight-text {
          font-size: 18px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .insight-text strong {
          font-weight: 600;
        }

        .insight-chart {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          opacity: 0.3;
        }

        .insight-chart :global(path),
        .insight-chart :global(line) {
          stroke: var(--surbee-fg-primary, #E8E8E8) !important;
        }

        /* Chart Card */
        .chart-card {
          grid-column: span 2;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .chart-title {
          font-size: 14px;
          font-weight: 600;
        }

        .chart-period {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
          padding: 4px 8px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 4px;
        }

        .chart-container {
          height: 140px;
        }

        /* Devices Card */
        .devices-card .card-title,
        .recent-card .card-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .devices-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .device-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .device-info {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 90px;
        }

        .device-icon {
          color: var(--surbee-fg-muted, #888);
        }

        .device-name {
          font-size: 13px;
        }

        .device-stats {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .device-bar {
          flex: 1;
          height: 4px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 2px;
          overflow: hidden;
        }

        .device-bar-fill {
          height: 100%;
          background: var(--surbee-fg-primary, #E8E8E8);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .device-pct {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          min-width: 32px;
          text-align: right;
        }

        /* Recent Card */
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .recent-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 10px;
        }

        .recent-avatar {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 8px;
          color: var(--surbee-fg-muted, #888);
        }

        .recent-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .recent-time {
          font-size: 12px;
        }

        .recent-status {
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
          text-transform: capitalize;
        }

        .recent-score .score-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
        }

        .score-badge.high {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .score-badge.mid {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .recent-empty {
          font-size: 13px;
          color: var(--surbee-fg-muted, #888);
          text-align: center;
          padding: 20px;
        }

        /* ==================== */
        /* RESPONSES BENTO VIEW */
        /* ==================== */
        .responses-bento {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .responses-bento { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .responses-bento { grid-template-columns: 1fr; }
        }

        .resp-total {
          grid-column: span 2;
          position: relative;
        }

        .resp-big-number {
          font-family: var(--font-display);
          font-size: 72px;
          line-height: 1;
          letter-spacing: -3px;
        }

        .resp-label {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          margin-top: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .export-fab {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--surbee-bg-tertiary, #252526);
          border: none;
          color: var(--surbee-fg-primary, #E8E8E8);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .export-fab:hover {
          background: var(--accent);
          color: #0a0a0a;
        }

        .resp-stat {
          position: relative;
        }

        .resp-stat-number {
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 500;
        }

        .resp-unit {
          font-size: 16px;
          opacity: 0.5;
        }

        .resp-stat-label {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          margin-top: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .resp-stat-bar {
          height: 3px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 2px;
          margin-top: auto;
          overflow: hidden;
        }

        .resp-stat-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .resp-stat-fill.completed {
          background: #22c55e;
        }

        .resp-stat-icon {
          position: absolute;
          top: 20px;
          right: 20px;
        }

        .resp-stat-icon.flagged {
          color: #ef4444;
        }

        .resp-quality-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: auto;
        }

        .resp-quality-dot.high { background: #22c55e; }
        .resp-quality-dot.mid { background: #f59e0b; }
        .resp-quality-dot.low { background: #ef4444; }

        .resp-empty-card {
          grid-column: span 4;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px;
          color: var(--surbee-fg-muted, #888);
        }

        .resp-card {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .resp-card:hover {
          transform: translateY(-2px);
        }

        .resp-card.featured {
          grid-column: span 2;
        }

        .resp-card.expanded {
          grid-column: span 2;
          grid-row: span 2;
        }

        .resp-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .resp-card-id {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
        }

        .resp-card-quality {
          font-family: var(--font-mono);
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .resp-card-quality.high {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .resp-card-quality.mid {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .resp-card-quality.low {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .resp-card-time {
          font-size: 14px;
          margin-bottom: 8px;
        }

        .resp-card-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        .resp-card-device {
          display: flex;
          align-items: center;
        }

        .resp-card-status {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-left: auto;
        }

        .resp-card-status.completed { background: #22c55e; }
        .resp-card-status.partial { background: #f59e0b; }
        .resp-card-status.abandoned { background: var(--surbee-fg-muted); opacity: 0.4; }

        .resp-card-expanded {
          margin-top: 16px;
        }

        .resp-card-divider {
          height: 1px;
          background: var(--surbee-border-primary, rgba(255,255,255,0.1));
          margin-bottom: 16px;
        }

        .resp-card-answers {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .resp-answer {
          padding: 12px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 10px;
          cursor: default;
        }

        .resp-answer.has-issues {
          cursor: pointer;
          border-left: 2px solid #ef4444;
        }

        .resp-answer-q {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          margin-bottom: 6px;
          display: flex;
          gap: 8px;
        }

        .resp-q-num {
          font-family: var(--font-mono);
          font-size: 9px;
          padding: 2px 5px;
          background: var(--surbee-bg-secondary);
          border-radius: 3px;
        }

        .resp-answer-a {
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 8px;
        }

        .resp-answer-meta {
          display: flex;
          gap: 10px;
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
        }

        .resp-score.high { color: #22c55e; }
        .resp-score.low { color: #ef4444; }

        .resp-issues-badge {
          color: #ef4444;
          padding: 1px 6px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
        }

        .resp-issues-detail {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--surbee-border-secondary);
        }

        .resp-issue {
          display: flex;
          gap: 8px;
          font-size: 11px;
          padding: 6px 0;
        }

        .resp-issue-type {
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .resp-issue-sev {
          font-family: var(--font-mono);
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 3px;
        }

        .resp-issue-sev.high {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .resp-issue-sev.medium {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .resp-issue-sev.low {
          background: rgba(156, 163, 175, 0.15);
          color: var(--surbee-fg-muted);
        }

        .resp-more {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .resp-more:hover {
          background: var(--surbee-bg-tertiary, #252526);
        }

        .resp-more-count {
          font-family: var(--font-display);
          font-size: 32px;
        }

        .resp-more-label {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
        }

        /* =============== */
        /* FLOW BENTO VIEW */
        /* =============== */
        .flow-bento {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .flow-bento { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .flow-bento { grid-template-columns: 1fr; }
        }

        .flow-hero {
          grid-column: span 3;
        }

        .flow-hero-label {
          font-family: var(--font-display);
          font-size: 28px;
          margin-bottom: 24px;
        }

        .flow-hero-stats {
          display: flex;
          gap: 32px;
          margin-bottom: 24px;
        }

        .flow-hero-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .flow-stat-num {
          font-family: var(--font-mono);
          font-size: 32px;
          font-weight: 500;
        }

        .flow-stat-label {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .flow-hero-divider {
          width: 1px;
          background: var(--surbee-border-primary, rgba(255,255,255,0.1));
        }

        .flow-hero-rate {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .flow-rate-bar {
          flex: 1;
          height: 6px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 3px;
          overflow: hidden;
        }

        .flow-rate-fill {
          height: 100%;
          background: var(--surbee-fg-primary, #E8E8E8);
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .flow-rate-pct {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          white-space: nowrap;
        }

        /* Flow Table Styles */
        .flow-summary {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px 32px;
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .flow-summary-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .flow-summary-stat.highlight .flow-summary-num {
          color: var(--surbee-fg-primary, #E8E8E8);
          font-weight: 600;
        }

        .flow-summary-num {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .flow-summary-label {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--surbee-fg-muted, #888);
        }

        .flow-summary-divider {
          width: 1px;
          height: 40px;
          background: var(--surbee-border-primary, rgba(255,255,255,0.1));
        }

        .flow-table {
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 8px;
          overflow: hidden;
        }

        .flow-table-header {
          display: grid;
          grid-template-columns: 50px 1fr 100px 100px 100px;
          gap: 16px;
          padding: 16px 24px;
          background: var(--surbee-bg-tertiary, #252526);
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--surbee-fg-muted, #888);
        }

        .flow-table-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px;
          color: var(--surbee-fg-muted, #888);
        }

        .flow-table-row {
          display: grid;
          grid-template-columns: 50px 1fr 100px 100px 100px;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--surbee-border-secondary, rgba(255,255,255,0.05));
          transition: background 0.15s ease;
        }

        .flow-table-row:last-child {
          border-bottom: none;
        }

        .flow-table-row:hover {
          background: var(--surbee-bg-tertiary, #252526);
        }

        .flow-table-row.high-dropoff {
          background: rgba(239, 68, 68, 0.05);
        }

        .flow-table-row.high-dropoff:hover {
          background: rgba(239, 68, 68, 0.08);
        }

        .flow-col-num {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          display: flex;
          align-items: center;
        }

        .flow-col-question {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .flow-question-text {
          font-size: 14px;
          line-height: 1.5;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .flow-progress-bar {
          height: 4px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 2px;
          overflow: hidden;
          width: 100%;
          max-width: 300px;
        }

        .flow-progress-fill {
          height: 100%;
          background: var(--surbee-fg-primary, #E8E8E8);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .flow-col-responses,
        .flow-col-retention,
        .flow-col-dropoff {
          font-family: var(--font-mono);
          font-size: 13px;
          display: flex;
          align-items: center;
        }

        .flow-col-responses {
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .flow-col-retention {
          color: var(--surbee-fg-primary, #E8E8E8);
          font-weight: 600;
        }

        .flow-col-dropoff {
          color: var(--surbee-fg-muted, #888);
        }

        .flow-col-dropoff.danger {
          color: #ef4444;
          font-weight: 500;
        }

        /* Legacy export btn override */
        .export-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--surbee-bg-secondary, #1E1E1F);
          border: 1px solid var(--surbee-border-primary, rgba(255,255,255,0.1));
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .export-btn:hover {
          background: var(--surbee-bg-tertiary, #252526);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 80px 20px;
          color: var(--surbee-fg-muted, #888);
        }

        .empty-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px dashed var(--surbee-border-primary, rgba(255,255,255,0.1));
        }

        .responses-list {
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 8px;
          overflow: hidden;
        }

        .list-header {
          display: grid;
          grid-template-columns: 60px 1fr 60px 60px 60px 60px 40px;
          gap: 8px;
          padding: 14px 20px;
          background: var(--surbee-bg-tertiary, #252526);
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--surbee-fg-muted, #888);
        }

        .response-row {
          display: grid;
          grid-template-columns: 60px 1fr 60px 60px 60px 60px 40px;
          gap: 8px;
          padding: 16px 20px;
          border-bottom: 1px solid var(--surbee-border-secondary, rgba(255,255,255,0.05));
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .response-row:hover {
          background: var(--surbee-bg-tertiary, #252526);
        }

        .response-row.expanded {
          background: var(--surbee-bg-tertiary, #252526);
          border-bottom-color: transparent;
        }

        .col-id {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
        }

        .col-when {
          font-size: 13px;
        }

        .when-relative {
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .col-device {
          color: var(--surbee-fg-muted, #888);
        }

        .col-time {
          font-family: var(--font-mono);
          font-size: 12px;
        }

        .col-status {
          display: flex;
          align-items: center;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.completed { background: #22c55e; }
        .status-dot.partial { background: #f59e0b; }
        .status-dot.abandoned { background: var(--surbee-fg-muted, #888); opacity: 0.4; }

        .quality-badge {
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 6px;
        }

        .quality-badge.high {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .quality-badge.mid {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .quality-badge.low {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .expand-icon {
          color: var(--surbee-fg-muted, #888);
          transition: transform 0.2s ease;
        }

        .expand-icon.rotated {
          transform: rotate(180deg);
        }

        .response-detail {
          padding: 20px;
          background: var(--surbee-bg-tertiary, #252526);
          border-bottom: 1px solid var(--surbee-border-secondary, rgba(255,255,255,0.05));
        }

        .detail-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--surbee-border-secondary, rgba(255,255,255,0.05));
        }

        .meta-id {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
          padding: 3px 8px;
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 4px;
        }

        .meta-date {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        .answers-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .answer-card {
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 12px;
          overflow: hidden;
        }

        .answer-clickable {
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .answer-clickable.has-issues {
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .answer-clickable.has-issues:hover {
          background: var(--surbee-bg-tertiary, #252526);
        }

        .answer-main { flex: 1; }

        .answer-expand {
          color: var(--surbee-fg-muted, #888);
          flex-shrink: 0;
          margin-top: 4px;
        }

        .answer-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-bottom: 10px;
        }

        .q-number {
          font-family: var(--font-mono);
          font-size: 9px;
          font-weight: 600;
          color: var(--surbee-fg-muted, #888);
          padding: 3px 6px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 4px;
          flex-shrink: 0;
        }

        .q-text {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          line-height: 1.4;
        }

        .answer-content {
          font-size: 14px;
          line-height: 1.6;
          margin-bottom: 12px;
          padding-left: 32px;
        }

        .answer-footer {
          display: flex;
          gap: 12px;
          padding-left: 32px;
          align-items: center;
        }

        .footer-time {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
        }

        .footer-score {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 500;
        }

        .footer-score.high { color: #22c55e; }
        .footer-score.mid { color: #f59e0b; }
        .footer-score.low { color: #ef4444; }

        .footer-issues {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #ef4444;
          padding: 2px 8px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
        }

        /* Issues Section */
        .issues-section {
          padding: 16px;
          background: var(--surbee-bg-tertiary, #252526);
          border-top: 1px solid var(--surbee-border-secondary, rgba(255,255,255,0.05));
        }

        .issues-header {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .issues-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .issue-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 8px;
        }

        .issue-icon {
          color: var(--surbee-fg-muted, #888);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .issue-content { flex: 1; }

        .issue-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .issue-type {
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .issue-severity {
          font-family: var(--font-mono);
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .issue-severity.high {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .issue-severity.medium {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .issue-severity.low {
          background: rgba(156, 163, 175, 0.15);
          color: var(--surbee-fg-muted, #888);
        }

        .issue-description {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          line-height: 1.5;
        }

        /* FUNNEL VIEW */
        .funnel-header {
          margin-bottom: 32px;
        }

        .funnel-title {
          font-family: var(--font-display);
          font-size: 28px;
          display: block;
          margin-bottom: 8px;
        }

        .funnel-subtitle {
          font-size: 14px;
          color: var(--surbee-fg-muted, #888);
        }

        .funnel-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .funnel-step {
          display: grid;
          grid-template-columns: 48px 1fr 60px;
          gap: 20px;
          align-items: center;
          padding: 24px;
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 8px;
          transition: transform 0.2s ease;
        }

        .funnel-step:hover {
          transform: translateX(4px);
        }

        .step-index {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          opacity: 0.5;
        }

        .step-content {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .step-question {
          font-size: 14px;
          font-weight: 500;
          line-height: 1.5;
        }

        .step-bar-track {
          height: 6px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 3px;
          overflow: hidden;
        }

        .step-bar-fill {
          height: 100%;
          background: var(--surbee-fg-primary, #E8E8E8);
          border-radius: 3px;
          transition: width 0.6s ease;
        }

        .step-stats {
          display: flex;
          gap: 16px;
          font-size: 12px;
        }

        .stat-answered {
          color: var(--surbee-fg-muted, #888);
        }

        .stat-dropoff {
          font-family: var(--font-mono);
          font-size: 10px;
          color: #ef4444;
          padding: 2px 6px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 4px;
        }

        .step-retention {
          font-family: var(--font-mono);
          font-size: 20px;
          font-weight: 500;
          text-align: right;
        }
      `}</style>
    </div>
  );
};

export default InsightsTabRedesign;
