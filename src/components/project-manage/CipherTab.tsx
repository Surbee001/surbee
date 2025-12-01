"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  AlertTriangle,
  Eye,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Bot,
  Copy,
  Hash,
  Fingerprint,
  Radar,
  Brain,
  Lock,
  Unlock,
  BarChart3,
  PieChart,
  Sparkles
} from 'lucide-react';
import { formatDistanceToNow, subDays, format } from 'date-fns';

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
  resolved: boolean;
}

interface ThreatMetric {
  label: string;
  value: number;
  trend: number;
  status: 'safe' | 'warning' | 'danger';
}

export const CipherTab: React.FC<CipherTabProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activePanel, setActivePanel] = useState<'overview' | 'alerts' | 'patterns' | 'intelligence'>('overview');

  // Fetch response data for analysis
  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const responsesRes = await fetch(`/api/projects/${projectId}/responses?userId=${user.id}&limit=100`);
        const responsesData = await responsesRes.json();
        setResponses(responsesData.responses || []);

        // Generate alerts from flagged responses
        const generatedAlerts: Alert[] = (responsesData.responses || [])
          .filter((r: any) => r.is_flagged || r.fraud_score > 0.3)
          .map((r: any, idx: number) => ({
            id: `alert-${r.id}`,
            type: r.fraud_score > 0.7 ? 'fraud' : r.fraud_score > 0.5 ? 'bot' : 'anomaly',
            severity: r.fraud_score > 0.7 ? 'critical' : r.fraud_score > 0.5 ? 'high' : 'medium',
            message: r.flag_reasons?.join(', ') || `Suspicious activity detected (score: ${Math.round(r.fraud_score * 100)}%)`,
            timestamp: new Date(r.created_at),
            responseId: r.id,
            resolved: false,
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

  // Calculate threat metrics
  const metrics = useMemo(() => {
    const total = responses.length;
    const flagged = responses.filter((r: any) => r.is_flagged).length;
    const highFraud = responses.filter((r: any) => r.fraud_score > 0.7).length;
    const medFraud = responses.filter((r: any) => r.fraud_score > 0.3 && r.fraud_score <= 0.7).length;
    const clean = total - flagged;

    // Calculate averages
    const avgFraudScore = total > 0
      ? responses.reduce((acc: number, r: any) => acc + (r.fraud_score || 0), 0) / total
      : 0;

    // Calculate completion time anomalies
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

    // Week comparison
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
      threatLevel: highFraud > 0 ? 'critical' : medFraud > 2 ? 'elevated' : flagged > 0 ? 'guarded' : 'low',
      dataIntegrity: total > 0 ? Math.round((clean / total) * 100) : 100,
      flaggedTrend,
    };
  }, [responses]);

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
      .slice(0, 6);
  }, [responses]);

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'elevated': return '#f59e0b';
      case 'guarded': return '#3b82f6';
      case 'low': return '#22c55e';
      default: return '#888';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle size={14} />;
      case 'high': return <AlertCircle size={14} />;
      case 'medium': return <AlertTriangle size={14} />;
      case 'low': return <Eye size={14} />;
      default: return <Eye size={14} />;
    }
  };

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'fraud': return <Shield size={14} />;
      case 'bot': return <Bot size={14} />;
      case 'anomaly': return <Activity size={14} />;
      case 'pattern': return <Fingerprint size={14} />;
      case 'spam': return <Hash size={14} />;
      default: return <AlertTriangle size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="cipher-loading">
        <div className="cipher-loader">
          <div className="loader-ring" />
          <div className="loader-core">
            <Shield size={20} />
          </div>
        </div>
        <span className="loader-text">Initializing Cipher...</span>
        <style jsx>{`
          .cipher-loading {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
          .cipher-loader {
            position: relative;
            width: 64px;
            height: 64px;
          }
          .loader-ring {
            position: absolute;
            inset: 0;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: var(--surbee-fg-primary, #E8E8E8);
            animation: spin 1s linear infinite;
          }
          .loader-ring::before {
            content: '';
            position: absolute;
            inset: 4px;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: rgba(255,255,255,0.3);
            animation: spin 0.8s linear infinite reverse;
          }
          .loader-core {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--surbee-fg-primary, #E8E8E8);
            animation: pulse 1.5s ease-in-out infinite;
          }
          .loader-text {
            font-family: var(--font-mono);
            font-size: 12px;
            color: var(--surbee-fg-muted, #888);
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cipher-root">
      {/* Navigation */}
      <header className="cipher-header">
        <div className="cipher-brand">
          <div className="cipher-logo">
            <Shield size={20} />
          </div>
          <div className="cipher-title">
            <span className="cipher-name">Cipher</span>
            <span className="cipher-tagline">Intelligent Response Verification</span>
          </div>
        </div>

        <nav className="cipher-nav">
          {(['overview', 'alerts', 'patterns', 'intelligence'] as const).map((panel) => (
            <button
              key={panel}
              className={`cipher-nav-btn ${activePanel === panel ? 'active' : ''}`}
              onClick={() => setActivePanel(panel)}
            >
              {panel === 'overview' && <Radar size={14} />}
              {panel === 'alerts' && <AlertTriangle size={14} />}
              {panel === 'patterns' && <Fingerprint size={14} />}
              {panel === 'intelligence' && <Brain size={14} />}
              <span>{panel.charAt(0).toUpperCase() + panel.slice(1)}</span>
            </button>
          ))}
        </nav>
      </header>

      {/* OVERVIEW PANEL */}
      {activePanel === 'overview' && (
        <div className="cipher-content">
          <div className="cipher-bento">
            {/* Threat Level Card - Main */}
            <div className="cipher-card threat-level-card">
              <div className="threat-header">
                <span className="threat-label">Current Threat Level</span>
                <div className="threat-indicator" style={{ '--threat-color': getThreatLevelColor(metrics.threatLevel) } as any}>
                  <div className="threat-pulse" />
                  <Shield size={16} />
                </div>
              </div>
              <div className="threat-level" style={{ color: getThreatLevelColor(metrics.threatLevel) }}>
                {metrics.threatLevel.toUpperCase()}
              </div>
              <div className="threat-stats">
                <div className="threat-stat">
                  <span className="threat-stat-num">{metrics.flagged}</span>
                  <span className="threat-stat-label">Flagged</span>
                </div>
                <div className="threat-divider" />
                <div className="threat-stat">
                  <span className="threat-stat-num">{metrics.highFraud}</span>
                  <span className="threat-stat-label">Critical</span>
                </div>
                <div className="threat-divider" />
                <div className="threat-stat">
                  <span className="threat-stat-num">{alerts.length}</span>
                  <span className="threat-stat-label">Alerts</span>
                </div>
              </div>
              <div className="threat-trend">
                {metrics.flaggedTrend >= 0 ? (
                  <span className="trend negative">
                    <TrendingUp size={12} />
                    +{metrics.flaggedTrend}% threats
                  </span>
                ) : (
                  <span className="trend positive">
                    <TrendingDown size={12} />
                    {metrics.flaggedTrend}% threats
                  </span>
                )}
                <span className="trend-period">vs last week</span>
              </div>
            </div>

            {/* Data Integrity */}
            <div className="cipher-card integrity-card">
              <div className="card-header">
                <Lock size={14} />
                <span>Data Integrity</span>
              </div>
              <div className="integrity-score">
                <span className="integrity-num">{metrics.dataIntegrity}</span>
                <span className="integrity-unit">%</span>
              </div>
              <div className="integrity-bar">
                <div
                  className="integrity-fill"
                  style={{
                    width: `${metrics.dataIntegrity}%`,
                    background: metrics.dataIntegrity >= 90 ? '#22c55e' : metrics.dataIntegrity >= 70 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <div className="integrity-label">
                {metrics.clean} of {metrics.total} responses verified
              </div>
            </div>

            {/* Avg Fraud Score */}
            <div className="cipher-card fraud-score-card">
              <div className="card-header">
                <Activity size={14} />
                <span>Avg. Risk Score</span>
              </div>
              <div className="fraud-gauge">
                <div className="gauge-track">
                  <div
                    className="gauge-fill"
                    style={{
                      width: `${metrics.avgFraudScore}%`,
                      background: metrics.avgFraudScore <= 20 ? '#22c55e' : metrics.avgFraudScore <= 50 ? '#f59e0b' : '#ef4444'
                    }}
                  />
                </div>
                <div className="gauge-labels">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <div className="fraud-value">
                <span className="fraud-num">{metrics.avgFraudScore}</span>
                <span className="fraud-label">Risk Index</span>
              </div>
            </div>

            {/* Speed Anomalies */}
            <div className="cipher-card anomaly-card">
              <div className="card-header">
                <Zap size={14} />
                <span>Speed Anomalies</span>
              </div>
              <div className="anomaly-value">
                <span className={`anomaly-num ${metrics.suspiciouslyFast > 0 ? 'warning' : ''}`}>
                  {metrics.suspiciouslyFast}
                </span>
              </div>
              <div className="anomaly-desc">
                Responses completed suspiciously fast
              </div>
            </div>

            {/* Active Alerts Preview */}
            <div className="cipher-card alerts-preview">
              <div className="card-header">
                <AlertTriangle size={14} />
                <span>Recent Alerts</span>
                {alerts.length > 0 && (
                  <span className="alert-badge">{alerts.length}</span>
                )}
              </div>
              <div className="alerts-list">
                {alerts.slice(0, 4).map((alert) => (
                  <div key={alert.id} className={`alert-item ${alert.severity}`}>
                    <div className="alert-icon">{getAlertTypeIcon(alert.type)}</div>
                    <div className="alert-content">
                      <span className="alert-message">{alert.message}</span>
                      <span className="alert-time">{formatDistanceToNow(alert.timestamp, { addSuffix: true })}</span>
                    </div>
                    <div className={`alert-severity ${alert.severity}`}>
                      {getSeverityIcon(alert.severity)}
                    </div>
                  </div>
                ))}
                {alerts.length === 0 && (
                  <div className="alerts-empty">
                    <CheckCircle size={20} />
                    <span>No active alerts</span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Insight Card */}
            <div className="cipher-card ai-insight-card">
              <div className="ai-badge">
                <Sparkles size={12} />
                <span>AI Analysis</span>
              </div>
              <div className="ai-insight">
                {metrics.total === 0 ? (
                  <>No response data available for analysis. Start collecting responses to enable Cipher intelligence.</>
                ) : metrics.flagged === 0 ? (
                  <>All <strong>{metrics.total} responses</strong> appear legitimate. Data integrity is excellent with no suspicious patterns detected.</>
                ) : metrics.highFraud > 0 ? (
                  <>Detected <strong>{metrics.highFraud} critical</strong> threat{metrics.highFraud > 1 ? 's' : ''} requiring immediate attention. Review flagged responses in the Alerts panel.</>
                ) : (
                  <><strong>{metrics.flagged} responses</strong> flagged for review. Most common issue: {patterns[0]?.name || 'Pattern anomaly'}. Overall data quality remains {metrics.dataIntegrity >= 90 ? 'excellent' : 'good'}.</>
                )}
              </div>
              <div className="ai-footer">
                <div className="ai-confidence">
                  <span className="confidence-label">Confidence</span>
                  <div className="confidence-dots">
                    <span className="dot active" />
                    <span className="dot active" />
                    <span className="dot active" />
                    <span className={`dot ${metrics.total >= 50 ? 'active' : ''}`} />
                    <span className={`dot ${metrics.total >= 100 ? 'active' : ''}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALERTS PANEL */}
      {activePanel === 'alerts' && (
        <div className="cipher-content">
          <div className="alerts-header-row">
            <div className="alerts-summary">
              <div className="summary-stat">
                <span className="summary-num critical">{alerts.filter(a => a.severity === 'critical').length}</span>
                <span className="summary-label">Critical</span>
              </div>
              <div className="summary-stat">
                <span className="summary-num high">{alerts.filter(a => a.severity === 'high').length}</span>
                <span className="summary-label">High</span>
              </div>
              <div className="summary-stat">
                <span className="summary-num medium">{alerts.filter(a => a.severity === 'medium').length}</span>
                <span className="summary-label">Medium</span>
              </div>
              <div className="summary-stat">
                <span className="summary-num low">{alerts.filter(a => a.severity === 'low').length}</span>
                <span className="summary-label">Low</span>
              </div>
            </div>
          </div>

          <div className="alerts-feed">
            {alerts.length === 0 ? (
              <div className="alerts-empty-state">
                <div className="empty-icon">
                  <Shield size={32} />
                </div>
                <span className="empty-title">All Clear</span>
                <span className="empty-desc">No alerts detected. Cipher is actively monitoring your responses.</span>
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className={`alert-card ${alert.severity}`}>
                  <div className="alert-card-header">
                    <div className="alert-type-badge">
                      {getAlertTypeIcon(alert.type)}
                      <span>{alert.type}</span>
                    </div>
                    <div className={`severity-badge ${alert.severity}`}>
                      {alert.severity}
                    </div>
                  </div>
                  <div className="alert-card-body">
                    <p className="alert-card-message">{alert.message}</p>
                  </div>
                  <div className="alert-card-footer">
                    <span className="alert-timestamp">
                      <Clock size={12} />
                      {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                    </span>
                    {alert.responseId && (
                      <span className="alert-response-id">Response #{alert.responseId.slice(0, 8)}</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PATTERNS PANEL */}
      {activePanel === 'patterns' && (
        <div className="cipher-content">
          <div className="patterns-grid">
            <div className="cipher-card patterns-overview">
              <div className="card-header">
                <Fingerprint size={14} />
                <span>Detected Patterns</span>
              </div>
              {patterns.length === 0 ? (
                <div className="patterns-empty">
                  <CheckCircle size={24} />
                  <span>No suspicious patterns detected</span>
                </div>
              ) : (
                <div className="patterns-list">
                  {patterns.map((pattern, idx) => (
                    <div key={pattern.name} className="pattern-item">
                      <div className="pattern-rank">{idx + 1}</div>
                      <div className="pattern-info">
                        <span className="pattern-name">{pattern.name}</span>
                        <div className="pattern-bar">
                          <div
                            className="pattern-fill"
                            style={{ width: `${(pattern.count / (patterns[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="pattern-count">{pattern.count}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="cipher-card behavior-card">
              <div className="card-header">
                <Activity size={14} />
                <span>Behavior Analysis</span>
              </div>
              <div className="behavior-metrics">
                <div className="behavior-metric">
                  <div className="metric-icon"><Bot size={16} /></div>
                  <div className="metric-info">
                    <span className="metric-name">Bot-like Behavior</span>
                    <span className="metric-value">{responses.filter((r: any) => r.fraud_score > 0.7).length} detected</span>
                  </div>
                </div>
                <div className="behavior-metric">
                  <div className="metric-icon"><Copy size={16} /></div>
                  <div className="metric-info">
                    <span className="metric-name">Copy-Paste Answers</span>
                    <span className="metric-value">{patterns.find(p => p.name.toLowerCase().includes('copy'))?.count || 0} instances</span>
                  </div>
                </div>
                <div className="behavior-metric">
                  <div className="metric-icon"><Zap size={16} /></div>
                  <div className="metric-info">
                    <span className="metric-name">Speed Anomalies</span>
                    <span className="metric-value">{metrics.suspiciouslyFast} responses</span>
                  </div>
                </div>
                <div className="behavior-metric">
                  <div className="metric-icon"><Hash size={16} /></div>
                  <div className="metric-info">
                    <span className="metric-name">Spam Indicators</span>
                    <span className="metric-value">{patterns.find(p => p.name.toLowerCase().includes('spam'))?.count || 0} flagged</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTELLIGENCE PANEL */}
      {activePanel === 'intelligence' && (
        <div className="cipher-content">
          <div className="intelligence-grid">
            <div className="cipher-card intel-main">
              <div className="intel-header">
                <div className="intel-icon">
                  <Brain size={24} />
                </div>
                <div className="intel-title">
                  <span className="intel-name">Deep Analysis</span>
                  <span className="intel-subtitle">AI-Powered Response Intelligence</span>
                </div>
              </div>

              <div className="intel-insights">
                <div className="insight-item">
                  <div className="insight-icon quality">
                    <CheckCircle size={16} />
                  </div>
                  <div className="insight-content">
                    <span className="insight-title">Data Quality Score</span>
                    <span className="insight-value">{metrics.dataIntegrity}%</span>
                    <span className="insight-desc">
                      {metrics.dataIntegrity >= 95 ? 'Excellent - Your data is highly reliable' :
                       metrics.dataIntegrity >= 80 ? 'Good - Minor concerns detected' :
                       metrics.dataIntegrity >= 60 ? 'Fair - Review flagged responses' :
                       'Poor - Significant data quality issues'}
                    </span>
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-icon threat">
                    <Shield size={16} />
                  </div>
                  <div className="insight-content">
                    <span className="insight-title">Threat Assessment</span>
                    <span className="insight-value" style={{ color: getThreatLevelColor(metrics.threatLevel) }}>
                      {metrics.threatLevel.toUpperCase()}
                    </span>
                    <span className="insight-desc">
                      {metrics.threatLevel === 'low' ? 'No significant threats detected' :
                       metrics.threatLevel === 'guarded' ? 'Minor suspicious activity observed' :
                       metrics.threatLevel === 'elevated' ? 'Multiple anomalies require attention' :
                       'Critical threats detected - immediate review recommended'}
                    </span>
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-icon prediction">
                    <TrendingUp size={16} />
                  </div>
                  <div className="insight-content">
                    <span className="insight-title">Trend Prediction</span>
                    <span className="insight-value">
                      {metrics.flaggedTrend > 0 ? 'Increasing Risk' : metrics.flaggedTrend < 0 ? 'Decreasing Risk' : 'Stable'}
                    </span>
                    <span className="insight-desc">
                      {metrics.flaggedTrend > 20 ? 'Significant increase in suspicious activity' :
                       metrics.flaggedTrend > 0 ? 'Slight uptick in flagged responses' :
                       metrics.flaggedTrend < -20 ? 'Notable improvement in data quality' :
                       metrics.flaggedTrend < 0 ? 'Positive trend in response quality' :
                       'No significant changes from previous period'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="cipher-card recommendations">
              <div className="card-header">
                <Sparkles size={14} />
                <span>Recommendations</span>
              </div>
              <div className="recs-list">
                {metrics.highFraud > 0 && (
                  <div className="rec-item critical">
                    <span className="rec-priority">Urgent</span>
                    <span className="rec-text">Review {metrics.highFraud} critical-risk response{metrics.highFraud > 1 ? 's' : ''} immediately</span>
                  </div>
                )}
                {metrics.suspiciouslyFast > 2 && (
                  <div className="rec-item warning">
                    <span className="rec-priority">Moderate</span>
                    <span className="rec-text">Investigate speed anomalies - possible bot activity</span>
                  </div>
                )}
                {patterns.length > 0 && (
                  <div className="rec-item info">
                    <span className="rec-priority">Info</span>
                    <span className="rec-text">Most common issue: {patterns[0].name}</span>
                  </div>
                )}
                {metrics.dataIntegrity >= 95 && (
                  <div className="rec-item success">
                    <span className="rec-priority">Good</span>
                    <span className="rec-text">Data quality is excellent - no action needed</span>
                  </div>
                )}
                {metrics.total < 10 && (
                  <div className="rec-item info">
                    <span className="rec-priority">Note</span>
                    <span className="rec-text">Collect more responses for improved analysis accuracy</span>
                  </div>
                )}
              </div>
            </div>
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
          gap: 20px;
        }

        .cipher-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .cipher-logo {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .cipher-title {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .cipher-name {
          font-family: var(--font-display);
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.5px;
        }

        .cipher-tagline {
          font-family: var(--font-mono);
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .cipher-nav {
          display: flex;
          gap: 4px;
          padding: 4px;
          background: rgba(30, 30, 31, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 14px;
        }

        .cipher-nav-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: transparent;
          border: none;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          color: var(--surbee-fg-muted, #888);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .cipher-nav-btn:hover {
          color: var(--surbee-fg-primary, #E8E8E8);
          background: rgba(255,255,255,0.05);
        }

        .cipher-nav-btn.active {
          background: rgba(255,255,255,0.1);
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Bento Grid */
        .cipher-bento {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        @media (max-width: 1200px) {
          .cipher-bento { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .cipher-bento { grid-template-columns: 1fr; }
        }

        .cipher-card {
          background: rgba(30, 30, 31, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          font-weight: 600;
          color: var(--surbee-fg-muted, #888);
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* Threat Level Card */
        .threat-level-card {
          grid-column: span 2;
          grid-row: span 2;
        }

        .threat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .threat-label {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--surbee-fg-muted, #888);
        }

        .threat-indicator {
          position: relative;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--threat-color);
        }

        .threat-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--threat-color);
          opacity: 0.2;
          animation: pulse-ring 2s ease-out infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.3; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        .threat-level {
          font-family: var(--font-display);
          font-size: 56px;
          font-weight: 400;
          line-height: 1;
          margin-bottom: 24px;
          letter-spacing: -2px;
        }

        .threat-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 24px;
        }

        .threat-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .threat-stat-num {
          font-family: var(--font-mono);
          font-size: 28px;
          font-weight: 500;
        }

        .threat-stat-label {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .threat-divider {
          width: 1px;
          background: rgba(255,255,255,0.1);
        }

        .threat-trend {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-family: var(--font-mono);
          font-size: 12px;
          padding: 4px 10px;
          border-radius: 6px;
        }

        .trend.positive {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .trend.negative {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .trend-period {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
        }

        /* Integrity Card */
        .integrity-score {
          display: flex;
          align-items: baseline;
          gap: 2px;
          margin-bottom: 12px;
        }

        .integrity-num {
          font-family: var(--font-display);
          font-size: 48px;
          line-height: 1;
        }

        .integrity-unit {
          font-size: 20px;
          color: var(--surbee-fg-muted, #888);
        }

        .integrity-bar {
          height: 6px;
          background: rgba(255,255,255,0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .integrity-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .integrity-label {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        /* Fraud Score Card */
        .fraud-gauge {
          margin-bottom: 16px;
        }

        .gauge-track {
          height: 8px;
          background: linear-gradient(90deg, #22c55e 0%, #f59e0b 50%, #ef4444 100%);
          border-radius: 4px;
          opacity: 0.3;
          position: relative;
          margin-bottom: 8px;
        }

        .gauge-fill {
          height: 100%;
          border-radius: 4px;
          position: absolute;
          top: 0;
          left: 0;
        }

        .gauge-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
        }

        .fraud-value {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .fraud-num {
          font-family: var(--font-mono);
          font-size: 36px;
          font-weight: 500;
        }

        .fraud-label {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
        }

        /* Anomaly Card */
        .anomaly-value {
          margin-bottom: 8px;
        }

        .anomaly-num {
          font-family: var(--font-display);
          font-size: 48px;
          line-height: 1;
        }

        .anomaly-num.warning {
          color: #f59e0b;
        }

        .anomaly-desc {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        /* Alerts Preview */
        .alerts-preview {
          grid-column: span 2;
        }

        .alert-badge {
          margin-left: auto;
          font-family: var(--font-mono);
          font-size: 10px;
          padding: 2px 8px;
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
          border-radius: 10px;
        }

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .alert-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border-left: 3px solid transparent;
        }

        .alert-item.critical { border-left-color: #ef4444; }
        .alert-item.high { border-left-color: #f59e0b; }
        .alert-item.medium { border-left-color: #3b82f6; }
        .alert-item.low { border-left-color: var(--surbee-fg-muted); }

        .alert-icon {
          color: var(--surbee-fg-muted, #888);
        }

        .alert-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .alert-message {
          font-size: 13px;
          line-height: 1.4;
        }

        .alert-time {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
        }

        .alert-severity {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
        }

        .alert-severity.critical {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .alert-severity.high {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .alert-severity.medium {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .alert-severity.low {
          background: rgba(136, 136, 136, 0.2);
          color: var(--surbee-fg-muted);
        }

        .alerts-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 32px;
          color: #22c55e;
        }

        /* AI Insight Card */
        .ai-insight-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          border-color: rgba(139, 92, 246, 0.2);
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 6px 10px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 6px;
          margin-bottom: 16px;
          color: #a78bfa;
        }

        .ai-insight {
          font-size: 15px;
          line-height: 1.6;
          margin-bottom: 16px;
        }

        .ai-insight strong {
          color: var(--surbee-fg-primary, #E8E8E8);
          font-weight: 600;
        }

        .ai-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ai-confidence {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .confidence-label {
          font-size: 10px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
        }

        .confidence-dots {
          display: flex;
          gap: 4px;
        }

        .confidence-dots .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
        }

        .confidence-dots .dot.active {
          background: #a78bfa;
        }

        /* ============= */
        /* ALERTS PANEL */
        /* ============= */
        .alerts-header-row {
          margin-bottom: 24px;
        }

        .alerts-summary {
          display: flex;
          gap: 32px;
          padding: 20px 24px;
          background: rgba(30, 30, 31, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
        }

        .summary-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .summary-num {
          font-family: var(--font-mono);
          font-size: 24px;
          font-weight: 600;
        }

        .summary-num.critical { color: #ef4444; }
        .summary-num.high { color: #f59e0b; }
        .summary-num.medium { color: #3b82f6; }
        .summary-num.low { color: var(--surbee-fg-muted); }

        .summary-label {
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .alerts-feed {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .alert-card {
          background: rgba(30, 30, 31, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 20px;
          border-left: 4px solid transparent;
        }

        .alert-card.critical { border-left-color: #ef4444; }
        .alert-card.high { border-left-color: #f59e0b; }
        .alert-card.medium { border-left-color: #3b82f6; }
        .alert-card.low { border-left-color: var(--surbee-fg-muted); }

        .alert-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .alert-type-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          color: var(--surbee-fg-muted, #888);
        }

        .severity-badge {
          font-family: var(--font-mono);
          font-size: 10px;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .severity-badge.critical {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .severity-badge.high {
          background: rgba(245, 158, 11, 0.2);
          color: #f59e0b;
        }

        .severity-badge.medium {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .severity-badge.low {
          background: rgba(136, 136, 136, 0.2);
          color: var(--surbee-fg-muted);
        }

        .alert-card-message {
          font-size: 14px;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .alert-card-footer {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        .alert-timestamp {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .alert-response-id {
          font-family: var(--font-mono);
          font-size: 11px;
        }

        .alerts-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 80px;
          background: rgba(30, 30, 31, 0.8);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px;
        }

        .empty-icon {
          color: #22c55e;
        }

        .empty-title {
          font-family: var(--font-display);
          font-size: 24px;
        }

        .empty-desc {
          font-size: 14px;
          color: var(--surbee-fg-muted, #888);
          text-align: center;
          max-width: 300px;
        }

        /* =============== */
        /* PATTERNS PANEL */
        /* =============== */
        .patterns-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        @media (max-width: 900px) {
          .patterns-grid { grid-template-columns: 1fr; }
        }

        .patterns-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 40px;
          color: #22c55e;
        }

        .patterns-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .pattern-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
        }

        .pattern-rank {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
          width: 24px;
        }

        .pattern-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .pattern-name {
          font-size: 13px;
        }

        .pattern-bar {
          height: 4px;
          background: rgba(255,255,255,0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .pattern-fill {
          height: 100%;
          background: var(--surbee-fg-primary, #E8E8E8);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .pattern-count {
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        /* Behavior Card */
        .behavior-metrics {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .behavior-metric {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
        }

        .metric-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          color: var(--surbee-fg-muted, #888);
        }

        .metric-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .metric-name {
          font-size: 13px;
        }

        .metric-value {
          font-family: var(--font-mono);
          font-size: 11px;
          color: var(--surbee-fg-muted, #888);
        }

        /* =================== */
        /* INTELLIGENCE PANEL */
        /* =================== */
        .intelligence-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 16px;
        }

        @media (max-width: 900px) {
          .intelligence-grid { grid-template-columns: 1fr; }
        }

        .intel-main {
          grid-row: span 2;
        }

        .intel-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }

        .intel-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
          border-radius: 16px;
          color: #a78bfa;
        }

        .intel-title {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .intel-name {
          font-family: var(--font-display);
          font-size: 24px;
        }

        .intel-subtitle {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
        }

        .intel-insights {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .insight-item {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
        }

        .insight-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .insight-icon.quality {
          background: rgba(34, 197, 94, 0.2);
          color: #22c55e;
        }

        .insight-icon.threat {
          background: rgba(239, 68, 68, 0.2);
          color: #ef4444;
        }

        .insight-icon.prediction {
          background: rgba(59, 130, 246, 0.2);
          color: #3b82f6;
        }

        .insight-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .insight-title {
          font-size: 12px;
          color: var(--surbee-fg-muted, #888);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .insight-value {
          font-family: var(--font-display);
          font-size: 20px;
        }

        .insight-desc {
          font-size: 13px;
          color: var(--surbee-fg-muted, #888);
          line-height: 1.5;
          margin-top: 4px;
        }

        /* Recommendations */
        .recs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .rec-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 14px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          border-left: 3px solid transparent;
        }

        .rec-item.critical {
          border-left-color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }

        .rec-item.warning {
          border-left-color: #f59e0b;
          background: rgba(245, 158, 11, 0.05);
        }

        .rec-item.info {
          border-left-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
        }

        .rec-item.success {
          border-left-color: #22c55e;
          background: rgba(34, 197, 94, 0.05);
        }

        .rec-priority {
          font-family: var(--font-mono);
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--surbee-fg-muted, #888);
        }

        .rec-text {
          font-size: 13px;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default CipherTab;
