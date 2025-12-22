"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Shield,
  AlertTriangle,
  Eye,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Clock,
  Bot,
  ChevronDown,
  Check,
  Loader2,
  BarChart2,
  Lock,
  Unlock,
} from 'lucide-react';
import { formatDistanceToNow, subDays } from 'date-fns';

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

const VIEWS = ['Overview', 'Alerts', 'Patterns'] as const;
type ViewType = typeof VIEWS[number];

export const CipherTab: React.FC<CipherTabProps> = ({ projectId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [activeView, setActiveView] = useState<ViewType>('Overview');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const viewDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewDropdownRef.current && !viewDropdownRef.current.contains(event.target as Node)) {
        setIsViewOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return '#ef4444';
      case 'elevated': return '#f59e0b';
      case 'guarded': return '#3b82f6';
      case 'low': return '#22c55e';
      default: return '#888';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      default: return 'rgba(232, 232, 232, 0.5)';
    }
  };

  if (loading) {
    return (
      <div className="cipher-loading">
        <Loader2 size={24} className="animate-spin" />
        <span>Initializing Cipher...</span>
        <style jsx>{`
          .cipher-loading {
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            color: rgba(232, 232, 232, 0.6);
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="cipher-page">
      <style jsx>{`
        .cipher-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 24px;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Header */
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .title-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(34, 197, 94, 0.15);
          border-radius: 8px;
          color: #22c55e;
        }

        /* Dropdown */
        .dropdown-wrapper {
          position: relative;
        }

        .dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px 6px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 9999px;
          color: var(--surbee-fg-primary, #E8E8E8);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .dropdown-trigger:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-trigger svg {
          color: rgba(232, 232, 232, 0.6);
        }

        .dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 4px;
          background: rgb(19, 19, 20);
          border: 1px solid rgba(232, 232, 232, 0.08);
          border-radius: 24px;
          padding: 8px;
          min-width: 160px;
          z-index: 100;
          box-shadow: rgba(0, 0, 0, 0.04) 0px 7px 16px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 8px 8px 16px;
          border-radius: 18px;
          cursor: pointer;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin-bottom: 1px;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-item svg {
          color: rgba(232, 232, 232, 0.6);
        }

        /* Status Badge */
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Main Content */
        .main-content {
          display: flex;
          flex: 1;
          min-height: 0;
          gap: 16px;
        }

        /* Left Panel - Stats */
        .stats-panel {
          width: 320px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex-shrink: 0;
        }

        .stat-card {
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(232, 232, 232, 0.08);
          border-radius: 12px;
        }

        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: rgba(232, 232, 232, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-icon {
          color: rgba(232, 232, 232, 0.4);
        }

        .stat-value {
          font-size: 32px;
          font-weight: 600;
          line-height: 1;
          margin-bottom: 8px;
        }

        .stat-meta {
          font-size: 12px;
          color: rgba(232, 232, 232, 0.5);
        }

        .stat-bar {
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
          margin-top: 12px;
        }

        .stat-bar-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .trend {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .trend.positive {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .trend.negative {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        /* Right Panel - Details */
        .details-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(232, 232, 232, 0.08);
          border-radius: 12px;
          overflow: hidden;
        }

        .details-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(232, 232, 232, 0.08);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .details-title {
          font-size: 14px;
          font-weight: 500;
        }

        .details-count {
          font-size: 12px;
          color: rgba(232, 232, 232, 0.5);
        }

        .details-content {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 12px;
          color: rgba(232, 232, 232, 0.5);
          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(34, 197, 94, 0.15);
          border-radius: 12px;
          color: #22c55e;
        }

        .empty-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .empty-desc {
          font-size: 13px;
          max-width: 280px;
          line-height: 1.5;
        }

        /* Alert List */
        .alert-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .alert-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          border-left: 3px solid transparent;
        }

        .alert-item.critical { border-left-color: #ef4444; }
        .alert-item.high { border-left-color: #f59e0b; }
        .alert-item.medium { border-left-color: #3b82f6; }
        .alert-item.low { border-left-color: rgba(232, 232, 232, 0.3); }

        .alert-type-icon {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          flex-shrink: 0;
        }

        .alert-type-icon.critical {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .alert-type-icon.high {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .alert-type-icon.medium {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .alert-body {
          flex: 1;
          min-width: 0;
        }

        .alert-message {
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 6px;
        }

        .alert-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 11px;
          color: rgba(232, 232, 232, 0.5);
        }

        .alert-meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .severity-tag {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 6px;
          border-radius: 4px;
        }

        /* Pattern List */
        .pattern-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .pattern-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .pattern-rank {
          font-size: 12px;
          font-weight: 600;
          color: rgba(232, 232, 232, 0.4);
          width: 20px;
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
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .pattern-bar-fill {
          height: 100%;
          background: var(--surbee-fg-primary, #E8E8E8);
          border-radius: 2px;
          transition: width 0.5s ease;
        }

        .pattern-count {
          font-size: 12px;
          font-weight: 500;
          color: rgba(232, 232, 232, 0.6);
        }

        /* Overview Grid */
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .overview-card {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .overview-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 12px;
          color: rgba(232, 232, 232, 0.6);
        }

        .overview-card-value {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .overview-card-label {
          font-size: 12px;
          color: rgba(232, 232, 232, 0.5);
        }

        /* AI Insight */
        .ai-insight-card {
          grid-column: span 2;
          padding: 20px;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(59, 130, 246, 0.08));
          border: 1px solid rgba(139, 92, 246, 0.15);
          border-radius: 12px;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 4px 8px;
          background: rgba(139, 92, 246, 0.2);
          border-radius: 4px;
          color: #a78bfa;
          margin-bottom: 12px;
        }

        .ai-insight-text {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(232, 232, 232, 0.8);
        }

        .ai-insight-text strong {
          color: var(--surbee-fg-primary, #E8E8E8);
          font-weight: 500;
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">
            <div className="title-icon">
              <Shield size={18} />
            </div>
            Cipher
          </h1>
          <div
            className="status-badge"
            style={{
              background: `${getThreatColor(metrics.threatLevel)}15`,
              color: getThreatColor(metrics.threatLevel),
            }}
          >
            <div
              className="status-dot"
              style={{ background: getThreatColor(metrics.threatLevel) }}
            />
            {metrics.threatLevel.toUpperCase()}
          </div>
        </div>

        <div className="dropdown-wrapper" ref={viewDropdownRef}>
          <button
            className="dropdown-trigger"
            onClick={() => setIsViewOpen(!isViewOpen)}
          >
            <span>{activeView}</span>
            <ChevronDown size={14} />
          </button>
          {isViewOpen && (
            <div className="dropdown-menu">
              {VIEWS.map((view) => (
                <div
                  key={view}
                  className="dropdown-item"
                  onClick={() => {
                    setActiveView(view);
                    setIsViewOpen(false);
                  }}
                >
                  <span>{view}</span>
                  {activeView === view && <Check size={16} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel - Stats */}
        <div className="stats-panel">
          {/* Threat Level */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Threat Level</span>
              <Shield size={16} className="stat-icon" />
            </div>
            <div className="stat-value" style={{ color: getThreatColor(metrics.threatLevel) }}>
              {metrics.threatLevel.charAt(0).toUpperCase() + metrics.threatLevel.slice(1)}
            </div>
            <div className="stat-meta">
              {metrics.flagged} of {metrics.total} responses flagged
            </div>
          </div>

          {/* Data Integrity */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Data Integrity</span>
              <Lock size={16} className="stat-icon" />
            </div>
            <div className="stat-value" style={{ color: metrics.dataIntegrity >= 90 ? '#22c55e' : metrics.dataIntegrity >= 70 ? '#f59e0b' : '#ef4444' }}>
              {metrics.dataIntegrity}%
            </div>
            <div className="stat-meta">
              {metrics.clean} verified responses
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${metrics.dataIntegrity}%`,
                  background: metrics.dataIntegrity >= 90 ? '#22c55e' : metrics.dataIntegrity >= 70 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
          </div>

          {/* Risk Score */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Avg. Risk Score</span>
              <Activity size={16} className="stat-icon" />
            </div>
            <div className="stat-value" style={{ color: metrics.avgFraudScore <= 20 ? '#22c55e' : metrics.avgFraudScore <= 50 ? '#f59e0b' : '#ef4444' }}>
              {metrics.avgFraudScore}
            </div>
            <div className="stat-meta">
              {metrics.avgFraudScore <= 20 ? 'Low risk' : metrics.avgFraudScore <= 50 ? 'Moderate risk' : 'High risk'}
            </div>
          </div>

          {/* Weekly Trend */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Weekly Trend</span>
              {metrics.flaggedTrend >= 0 ? (
                <TrendingUp size={16} className="stat-icon" />
              ) : (
                <TrendingDown size={16} className="stat-icon" />
              )}
            </div>
            <div className="stat-value">
              <span className={`trend ${metrics.flaggedTrend >= 0 ? 'negative' : 'positive'}`}>
                {metrics.flaggedTrend >= 0 ? '+' : ''}{metrics.flaggedTrend}%
              </span>
            </div>
            <div className="stat-meta">
              {metrics.flaggedTrend >= 0 ? 'Increase in threats' : 'Decrease in threats'}
            </div>
          </div>

          {/* Speed Anomalies */}
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Speed Anomalies</span>
              <Zap size={16} className="stat-icon" />
            </div>
            <div className="stat-value" style={{ color: metrics.suspiciouslyFast > 0 ? '#f59e0b' : '#22c55e' }}>
              {metrics.suspiciouslyFast}
            </div>
            <div className="stat-meta">
              Suspiciously fast completions
            </div>
          </div>
        </div>

        {/* Right Panel - Details */}
        <div className="details-panel">
          <div className="details-header">
            <span className="details-title">
              {activeView === 'Overview' && 'Security Overview'}
              {activeView === 'Alerts' && 'Active Alerts'}
              {activeView === 'Patterns' && 'Detected Patterns'}
            </span>
            <span className="details-count">
              {activeView === 'Alerts' && `${alerts.length} alerts`}
              {activeView === 'Patterns' && `${patterns.length} patterns`}
            </span>
          </div>

          <div className="details-content">
            {/* Overview View */}
            {activeView === 'Overview' && (
              <div className="overview-grid">
                <div className="overview-card">
                  <div className="overview-card-header">
                    <Eye size={14} />
                    Total Responses
                  </div>
                  <div className="overview-card-value">{metrics.total}</div>
                  <div className="overview-card-label">Analyzed by Cipher</div>
                </div>

                <div className="overview-card">
                  <div className="overview-card-header">
                    <AlertTriangle size={14} />
                    Flagged
                  </div>
                  <div className="overview-card-value" style={{ color: metrics.flagged > 0 ? '#f59e0b' : '#22c55e' }}>{metrics.flagged}</div>
                  <div className="overview-card-label">Require review</div>
                </div>

                <div className="overview-card">
                  <div className="overview-card-header">
                    <Bot size={14} />
                    High Risk
                  </div>
                  <div className="overview-card-value" style={{ color: metrics.highFraud > 0 ? '#ef4444' : '#22c55e' }}>{metrics.highFraud}</div>
                  <div className="overview-card-label">Critical threats</div>
                </div>

                <div className="overview-card">
                  <div className="overview-card-header">
                    <CheckCircle size={14} />
                    Verified
                  </div>
                  <div className="overview-card-value" style={{ color: '#22c55e' }}>{metrics.clean}</div>
                  <div className="overview-card-label">Clean responses</div>
                </div>

                {/* AI Insight */}
                <div className="ai-insight-card">
                  <div className="ai-badge">
                    <BarChart2 size={12} />
                    AI Analysis
                  </div>
                  <div className="ai-insight-text">
                    {metrics.total === 0 ? (
                      <>No response data available for analysis. Start collecting responses to enable Cipher intelligence.</>
                    ) : metrics.flagged === 0 ? (
                      <>All <strong>{metrics.total} responses</strong> appear legitimate. Data integrity is excellent with no suspicious patterns detected.</>
                    ) : metrics.highFraud > 0 ? (
                      <>Detected <strong>{metrics.highFraud} critical threat{metrics.highFraud > 1 ? 's' : ''}</strong> requiring immediate attention. Review flagged responses in the Alerts view.</>
                    ) : (
                      <><strong>{metrics.flagged} response{metrics.flagged > 1 ? 's' : ''}</strong> flagged for review. Most common issue: {patterns[0]?.name || 'Pattern anomaly'}. Overall data quality remains {metrics.dataIntegrity >= 90 ? 'excellent' : 'good'}.</>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Alerts View */}
            {activeView === 'Alerts' && (
              alerts.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="empty-title">All Clear</div>
                  <div className="empty-desc">
                    No active alerts. Cipher is monitoring your responses for suspicious activity.
                  </div>
                </div>
              ) : (
                <div className="alert-list">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`alert-item ${alert.severity}`}>
                      <div className={`alert-type-icon ${alert.severity}`}>
                        {alert.type === 'fraud' && <Shield size={14} />}
                        {alert.type === 'bot' && <Bot size={14} />}
                        {alert.type === 'anomaly' && <Activity size={14} />}
                      </div>
                      <div className="alert-body">
                        <div className="alert-message">{alert.message}</div>
                        <div className="alert-meta">
                          <span className="alert-meta-item">
                            <Clock size={10} />
                            {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                          </span>
                          <span
                            className="severity-tag"
                            style={{
                              background: `${getSeverityColor(alert.severity)}20`,
                              color: getSeverityColor(alert.severity)
                            }}
                          >
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {/* Patterns View */}
            {activeView === 'Patterns' && (
              patterns.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <CheckCircle size={24} />
                  </div>
                  <div className="empty-title">No Patterns Detected</div>
                  <div className="empty-desc">
                    No suspicious patterns have been identified in your responses.
                  </div>
                </div>
              ) : (
                <div className="pattern-list">
                  {patterns.map((pattern, idx) => (
                    <div key={pattern.name} className="pattern-item">
                      <span className="pattern-rank">{idx + 1}</span>
                      <div className="pattern-info">
                        <span className="pattern-name">{pattern.name}</span>
                        <div className="pattern-bar">
                          <div
                            className="pattern-bar-fill"
                            style={{ width: `${(pattern.count / (patterns[0]?.count || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="pattern-count">{pattern.count}</span>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CipherTab;
