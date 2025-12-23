"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow, subDays, format } from 'date-fns';
import { AreaChart, Area, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from 'recharts';

interface CipherTabProps {
  projectId: string;
}

interface Alert {
  id: string;
  type: 'fraud' | 'anomaly' | 'pattern' | 'bot' | 'spam';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  timestamp: Date;
  responseId?: string;
}

export const CipherTab: React.FC<CipherTabProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'alerts' | 'patterns'>('overview');
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  // Fetch response data for analysis
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const responsesRes = await fetch(`/api/projects/${projectId}/responses?userId=${user.id}&limit=100`);
        const responsesData = await responsesRes.json();
        setResponses(responsesData.responses || []);

        const generatedAlerts: Alert[] = (responsesData.responses || [])
          .filter((r: any) => r.is_flagged || r.fraud_score > 0.3)
          .map((r: any) => ({
            id: `alert-${r.id}`,
            type: r.fraud_score > 0.7 ? 'fraud' : r.fraud_score > 0.5 ? 'bot' : 'anomaly',
            severity: r.fraud_score > 0.7 ? 'critical' : r.fraud_score > 0.5 ? 'high' : 'medium',
            message: r.flag_reasons?.join(', ') || `Suspicious activity detected (score: ${Math.round(r.fraud_score * 100)}%)`,
            timestamp: new Date(r.created_at),
            responseId: r.id,
          }));

        setAlerts(generatedAlerts);
      } catch (err) {
        console.error('Error fetching cipher data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId, user?.id]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = responses.length;
    const flagged = responses.filter((r: any) => r.is_flagged).length;
    const highFraud = responses.filter((r: any) => r.fraud_score > 0.7).length;
    const medFraud = responses.filter((r: any) => r.fraud_score > 0.3 && r.fraud_score <= 0.7).length;
    const clean = total - flagged;

    const avgFraudScore = total > 0
      ? responses.reduce((acc: number, r: any) => acc + (r.fraud_score || 0), 0) / total
      : 0;

    const avgTime = total > 0
      ? responses.reduce((acc: number, r: any) => {
          const timing = r.timing_data || [];
          return acc + timing.reduce((a: number, b: number) => a + b, 0);
        }, 0) / total
      : 0;

    const suspiciouslyFast = responses.filter((r: any) => {
      const timing = r.timing_data || [];
      const totalTime = timing.reduce((a: number, b: number) => a + b, 0);
      return totalTime > 0 && totalTime < avgTime * 0.3;
    }).length;

    const oneWeekAgo = subDays(new Date(), 7);
    const twoWeeksAgo = subDays(new Date(), 14);
    const thisWeekFlagged = responses.filter((r: any) =>
      new Date(r.created_at) >= oneWeekAgo && r.is_flagged
    ).length;
    const lastWeekFlagged = responses.filter((r: any) =>
      new Date(r.created_at) >= twoWeeksAgo && new Date(r.created_at) < oneWeekAgo && r.is_flagged
    ).length;
    const flaggedTrend = lastWeekFlagged > 0
      ? Math.round(((thisWeekFlagged - lastWeekFlagged) / lastWeekFlagged) * 100)
      : thisWeekFlagged > 0 ? 100 : 0;

    return {
      total,
      flagged,
      clean,
      highFraud,
      medFraud,
      avgFraudScore: Math.round(avgFraudScore * 100),
      suspiciouslyFast,
      dataIntegrity: total > 0 ? Math.round((clean / total) * 100) : 100,
      flaggedTrend,
      thisWeekFlagged,
    };
  }, [responses]);

  // Trend data for charts
  const trendData = useMemo(() => {
    const days = timePeriod === 'week' ? 7 : timePeriod === 'month' ? 30 : 90;
    const data = Array.from({ length: Math.min(days, 14) }, (_, i) => {
      const date = subDays(new Date(), Math.min(days, 14) - 1 - i);
      const flaggedCount = responses.filter((r: any) =>
        format(new Date(r.created_at), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && r.is_flagged
      ).length;
      return {
        day: format(date, days <= 7 ? 'EEE' : 'MMM d'),
        count: flaggedCount,
      };
    });
    return data;
  }, [responses, timePeriod]);

  // Pattern analysis
  const patterns = useMemo(() => {
    const patternMap: Record<string, number> = {};
    responses.forEach((r: any) => {
      if (r.flag_reasons) {
        r.flag_reasons.forEach((reason: string) => {
          patternMap[reason] = (patternMap[reason] || 0) + 1;
        });
      }
    });
    return Object.entries(patternMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [responses]);

  if (loading) {
    return (
      <div className="cipher-loading">
        <div className="loader" />
        <style jsx>{`
          .cipher-loading {
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
    <div className="cipher-root">
      {/* Header with Navigation */}
      <header className="cipher-header">
        <nav className="cipher-nav">
          {(['overview', 'alerts', 'patterns'] as const).map((view) => (
            <button
              key={view}
              className={`nav-btn ${activeView === view ? 'active' : ''}`}
              onClick={() => setActiveView(view)}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </nav>

        {activeView === 'overview' && (
          <div className="time-selector">
            {(['week', 'month', 'quarter'] as const).map((period) => (
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
          <div className="bento-grid">
            {/* Main Stats Card */}
            <div className="bento-card main-stats">
              <div className="card-label">Data Integrity</div>
              <div className="main-number">{metrics.dataIntegrity}<span className="main-unit">%</span></div>
              <div className="change-indicator">
                <span className={`change ${metrics.flaggedTrend >= 0 ? 'negative' : 'positive'}`}>
                  {metrics.flaggedTrend >= 0 ? '+' : ''}{metrics.flaggedTrend}%
                </span>
                <span className="change-label">flagged vs last week</span>
              </div>
              <div className="mini-chart">
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cipherGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#E8E8E8" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#E8E8E8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="count" stroke="#E8E8E8" strokeWidth={2} fill="url(#cipherGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Verified */}
            <div className="bento-card stat-card">
              <div className="stat-content">
                <div className="stat-number">{metrics.clean}</div>
                <div className="stat-label">Verified</div>
              </div>
              <div className="stat-bar">
                <div className="stat-bar-fill" style={{ width: `${metrics.dataIntegrity}%` }} />
              </div>
            </div>

            {/* Flagged */}
            <div className="bento-card stat-card">
              <div className="stat-content">
                <div className="stat-number">{metrics.flagged}</div>
                <div className="stat-label">Flagged</div>
              </div>
            </div>

            {/* Risk Score */}
            <div className="bento-card stat-card">
              <div className="stat-content">
                <div className="stat-number">{metrics.avgFraudScore}</div>
                <div className="stat-label">Avg. Risk Score</div>
              </div>
              <div className="quality-indicator">
                <span className={`quality-dot ${metrics.avgFraudScore <= 20 ? 'excellent' : metrics.avgFraudScore <= 50 ? 'good' : 'needs-work'}`} />
                {metrics.avgFraudScore <= 20 ? 'Low risk' : metrics.avgFraudScore <= 50 ? 'Moderate' : 'High risk'}
              </div>
            </div>

            {/* Insight Feature Card */}
            <div className="bento-card insight-feature">
              <div className="insight-badge">Analysis</div>
              <div className="insight-text">
                {metrics.total === 0 ? (
                  <>No response data available. Start collecting responses to enable analysis.</>
                ) : metrics.flagged === 0 ? (
                  <>All <strong>{metrics.total} responses</strong> verified. No suspicious patterns detected.</>
                ) : (
                  <><strong>{metrics.flagged} response{metrics.flagged > 1 ? 's' : ''}</strong> flagged for review. {patterns[0]?.name ? `Most common: ${patterns[0].name}.` : ''}</>
                )}
              </div>
            </div>

            {/* Trend Chart */}
            <div className="bento-card chart-card">
              <div className="chart-header">
                <span className="chart-title">Flagged Responses</span>
                <span className="chart-period">{timePeriod === 'week' ? 'Last 7 days' : timePeriod === 'month' ? 'Last 30 days' : 'Last 90 days'}</span>
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
                      formatter={(value: number) => [`${value} flagged`, '']}
                    />
                    <Bar dataKey="count" fill="var(--surbee-fg-primary)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bento-card breakdown-card">
              <div className="card-title">Breakdown</div>
              <div className="breakdown-list">
                <div className="breakdown-item">
                  <span className="breakdown-label">High Risk</span>
                  <div className="breakdown-stats">
                    <div className="breakdown-bar">
                      <div className="breakdown-bar-fill" style={{ width: `${metrics.total > 0 ? (metrics.highFraud / metrics.total) * 100 : 0}%` }} />
                    </div>
                    <span className="breakdown-count">{metrics.highFraud}</span>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Medium Risk</span>
                  <div className="breakdown-stats">
                    <div className="breakdown-bar">
                      <div className="breakdown-bar-fill" style={{ width: `${metrics.total > 0 ? (metrics.medFraud / metrics.total) * 100 : 0}%` }} />
                    </div>
                    <span className="breakdown-count">{metrics.medFraud}</span>
                  </div>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">Speed Anomalies</span>
                  <div className="breakdown-stats">
                    <div className="breakdown-bar">
                      <div className="breakdown-bar-fill" style={{ width: `${metrics.total > 0 ? (metrics.suspiciouslyFast / metrics.total) * 100 : 0}%` }} />
                    </div>
                    <span className="breakdown-count">{metrics.suspiciouslyFast}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent */}
            <div className="bento-card recent-card">
              <div className="card-title">Recent Flags</div>
              <div className="recent-list">
                {alerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className="recent-item">
                    <div className="recent-info">
                      <span className="recent-time">{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                      <span className="recent-type">{alert.type}</span>
                    </div>
                    <div className="recent-score">
                      <span className={`severity-badge ${alert.severity}`}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="recent-empty">No flags yet</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERTS VIEW */}
      {activeView === 'alerts' && (
        <div className="view-content">
          <div className="alerts-summary">
            <div className="summary-stat">
              <span className="summary-num">{alerts.length}</span>
              <span className="summary-label">Total Alerts</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-stat">
              <span className="summary-num">{alerts.filter(a => a.severity === 'critical').length}</span>
              <span className="summary-label">Critical</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-stat">
              <span className="summary-num">{alerts.filter(a => a.severity === 'high').length}</span>
              <span className="summary-label">High</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-stat">
              <span className="summary-num">{alerts.filter(a => a.severity === 'medium').length}</span>
              <span className="summary-label">Medium</span>
            </div>
          </div>

          <div className="alerts-table">
            <div className="table-header">
              <span className="col-time">Time</span>
              <span className="col-type">Type</span>
              <span className="col-message">Message</span>
              <span className="col-severity">Severity</span>
              <span className="col-expand"></span>
            </div>

            {alerts.length === 0 ? (
              <div className="table-empty">
                <div className="empty-circle" />
                <span>No alerts detected</span>
              </div>
            ) : (
              alerts.map((alert) => (
                <React.Fragment key={alert.id}>
                  <div
                    className={`table-row ${expandedAlert === alert.id ? 'expanded' : ''}`}
                    onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                  >
                    <span className="col-time">{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                    <span className="col-type">{alert.type}</span>
                    <span className="col-message">{alert.message}</span>
                    <span className={`col-severity ${alert.severity}`}>{alert.severity}</span>
                    <span className="col-expand">
                      {expandedAlert === alert.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                  {expandedAlert === alert.id && (
                    <div className="table-row-detail">
                      <div className="detail-item">
                        <span className="detail-label">Response ID</span>
                        <span className="detail-value">{alert.responseId || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Detected</span>
                        <span className="detail-value">{format(alert.timestamp, 'MMM d, yyyy HH:mm')}</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      )}

      {/* PATTERNS VIEW */}
      {activeView === 'patterns' && (
        <div className="view-content">
          <div className="patterns-summary">
            <div className="summary-stat">
              <span className="summary-num">{patterns.length}</span>
              <span className="summary-label">Patterns Detected</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-stat">
              <span className="summary-num">{patterns.reduce((acc, p) => acc + p.count, 0)}</span>
              <span className="summary-label">Total Occurrences</span>
            </div>
          </div>

          <div className="patterns-table">
            <div className="table-header">
              <span className="col-rank">#</span>
              <span className="col-pattern">Pattern</span>
              <span className="col-count">Count</span>
              <span className="col-bar">Distribution</span>
            </div>

            {patterns.length === 0 ? (
              <div className="table-empty">
                <div className="empty-circle" />
                <span>No patterns detected</span>
              </div>
            ) : (
              patterns.map((pattern, idx) => (
                <div key={pattern.name} className="table-row">
                  <span className="col-rank">{String(idx + 1).padStart(2, '0')}</span>
                  <span className="col-pattern">{pattern.name}</span>
                  <span className="col-count">{pattern.count}</span>
                  <div className="col-bar">
                    <div className="pattern-bar">
                      <div
                        className="pattern-bar-fill"
                        style={{ width: `${(pattern.count / (patterns[0]?.count || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .cipher-root {
          --font-display: 'Kalice Regular', 'Kalice-Trial-Regular', Georgia, serif;
          --font-body: var(--font-inter, 'Sohne', -apple-system, sans-serif);
          --font-mono: 'Menlo', 'Monaco', 'Courier New', monospace;

          font-family: var(--font-body);
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Header */
        .cipher-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .cipher-nav {
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
          .bento-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .bento-grid { grid-template-columns: 1fr; }
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

        .main-unit {
          font-size: 48px;
          opacity: 0.5;
        }

        .change-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
        }

        .change {
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

        .stat-content { flex: 1; }

        .stat-number {
          font-family: var(--font-mono);
          font-size: 32px;
          font-weight: 500;
          line-height: 1;
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
          background: var(--surbee-fg-primary, #E8E8E8);
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
          background: var(--surbee-fg-muted, #888);
        }

        .quality-dot.excellent { background: #22c55e; }
        .quality-dot.good { background: #f59e0b; }
        .quality-dot.needs-work { background: #ef4444; }

        /* Insight Feature */
        .insight-feature {
          grid-column: span 2;
          background: #091717;
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
        }

        .insight-text strong { font-weight: 600; }

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

        .chart-container { height: 140px; }

        /* Breakdown Card */
        .breakdown-card .card-title,
        .recent-card .card-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .breakdown-label {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        .breakdown-stats {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .breakdown-bar {
          flex: 1;
          height: 4px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 2px;
          overflow: hidden;
        }

        .breakdown-bar-fill {
          height: 100%;
          background: var(--surbee-fg-primary, #E8E8E8);
          border-radius: 2px;
        }

        .breakdown-count {
          font-family: var(--font-mono);
          font-size: 12px;
          min-width: 24px;
          text-align: right;
        }

        /* Recent Card */
        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .recent-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 8px;
        }

        .recent-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .recent-time {
          font-size: 12px;
        }

        .recent-type {
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
        }

        .severity-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .severity-badge.critical {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .severity-badge.high {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .severity-badge.medium {
          background: rgba(156, 163, 175, 0.15);
          color: var(--surbee-fg-muted, #888);
        }

        .recent-empty {
          font-size: 13px;
          color: var(--surbee-fg-muted, #888);
          text-align: center;
          padding: 20px;
        }

        /* Summary Bars */
        .alerts-summary,
        .patterns-summary {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 24px 32px;
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .summary-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-num {
          font-family: var(--font-display);
          font-size: 28px;
        }

        .summary-label {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--surbee-fg-muted, #888);
        }

        .summary-divider {
          width: 1px;
          height: 40px;
          background: var(--surbee-border-primary, rgba(255,255,255,0.1));
        }

        /* Tables */
        .alerts-table,
        .patterns-table {
          background: var(--surbee-bg-secondary, #1E1E1F);
          border-radius: 8px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
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

        .alerts-table .table-header {
          grid-template-columns: 120px 80px 1fr 80px 40px;
        }

        .patterns-table .table-header {
          grid-template-columns: 50px 1fr 80px 200px;
        }

        .table-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 60px;
          color: var(--surbee-fg-muted, #888);
        }

        .empty-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px dashed var(--surbee-border-primary, rgba(255,255,255,0.1));
        }

        .table-row {
          display: grid;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 1px solid var(--surbee-border-secondary, rgba(255,255,255,0.05));
          transition: background 0.15s ease;
          cursor: pointer;
        }

        .alerts-table .table-row {
          grid-template-columns: 120px 80px 1fr 80px 40px;
        }

        .patterns-table .table-row {
          grid-template-columns: 50px 1fr 80px 200px;
          cursor: default;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .table-row:hover {
          background: var(--surbee-bg-tertiary, #252526);
        }

        .table-row.expanded {
          background: var(--surbee-bg-tertiary, #252526);
        }

        .col-time {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        .col-type {
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
        }

        .col-message {
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .col-severity {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
        }

        .col-severity.critical { color: #ef4444; }
        .col-severity.high { color: #f59e0b; }
        .col-severity.medium { color: var(--surbee-fg-muted, #888); }

        .col-expand {
          color: var(--surbee-fg-muted, #888);
          display: flex;
          align-items: center;
        }

        .col-rank {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        .col-pattern {
          font-size: 13px;
        }

        .col-count {
          font-family: var(--font-mono);
          font-size: 13px;
          text-align: right;
        }

        .col-bar {
          display: flex;
          align-items: center;
        }

        .pattern-bar {
          flex: 1;
          height: 4px;
          background: var(--surbee-bg-tertiary, #252526);
          border-radius: 2px;
          overflow: hidden;
        }

        .pattern-bar-fill {
          height: 100%;
          background: var(--surbee-fg-primary, #E8E8E8);
          border-radius: 2px;
        }

        .table-row-detail {
          padding: 16px 24px;
          background: var(--surbee-bg-tertiary, #252526);
          border-bottom: 1px solid var(--surbee-border-secondary, rgba(255,255,255,0.05));
          display: flex;
          gap: 32px;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .detail-label {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          color: var(--surbee-fg-muted, #888);
        }

        .detail-value {
          font-size: 13px;
        }
      `}</style>
    </div>
  );
};

export default CipherTab;
