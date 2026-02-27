"use client";

import React, { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useInsightsData } from './useInsightsData';
import { useAnalyticsStream } from '@/hooks/useAnalyticsStream';
import type { TimePeriod, Response as InsightResponse, FunnelStep } from './types';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Wifi, RefreshCw, WifiOff, Search,
  ChevronDown, ChevronRight,
  Monitor, Smartphone, Tablet, Laptop,
  Download, CheckCircle, XCircle, AlertCircle,
} from 'lucide-react';

/* ─── Types ─── */

type SubTab = 'overview' | 'responses' | 'funnel' | 'questions';
type PeriodKey = '7d' | '30d' | '90d' | '1y';

const PERIOD_MAP: Record<PeriodKey, TimePeriod> = {
  '7d': 'week',
  '30d': 'month',
  '90d': 'quarter',
  '1y': 'year',
};

const DEVICE_ICONS: Record<string, React.ReactNode> = {
  desktop: <Monitor size={14} />,
  laptop: <Laptop size={14} />,
  mobile: <Smartphone size={14} />,
  tablet: <Tablet size={14} />,
};

/* ─── Helpers ─── */

function fmtTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function qualityLabel(score: number): { text: string; cls: string } {
  if (score >= 80) return { text: 'High', cls: 'badge-green' };
  if (score >= 60) return { text: 'Medium', cls: 'badge-yellow' };
  return { text: 'Low', cls: 'badge-red' };
}

function statusLabel(status: string): { text: string; cls: string } {
  if (status === 'completed') return { text: 'Completed', cls: 'badge-green' };
  if (status === 'partial') return { text: 'Partial', cls: 'badge-yellow' };
  return { text: 'Abandoned', cls: 'badge-red' };
}

/* ─── CSV Export ─── */

function downloadCSV(rows: InsightResponse[], filename = 'responses.csv') {
  if (!rows.length) return;
  const headers = ['ID', 'Status', 'Quality', 'Submitted', 'Duration (s)', 'Device', 'Flagged'];
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      r.id, r.status, r.qualityScore ?? '',
      r.submittedAt?.toISOString?.() || '',
      Math.round(r.completionTime),
      r.deviceType,
      r.isFlagged ? 'Yes' : 'No',
    ].map(esc).join(',')),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ─── PDF Export (print) ─── */

function openPrintPreview(rows: InsightResponse[]) {
  const w = window.open('', '_blank');
  if (!w) return;
  const header = ['ID', 'Status', 'Quality', 'Submitted', 'Duration', 'Device', 'Flagged'];
  const rowsHtml = rows.map(r => `<tr>
    <td>${r.id}</td><td>${r.status}</td><td>${r.qualityScore ?? ''}</td>
    <td>${r.submittedAt?.toISOString?.() || ''}</td><td>${Math.round(r.completionTime)}s</td>
    <td>${r.deviceType}</td><td>${r.isFlagged ? 'Yes' : 'No'}</td>
  </tr>`).join('');
  w.document.write(`<!doctype html><html><head><meta charset="utf-8">
    <style>body{font-family:Arial,sans-serif;padding:24px;color:#111}
    h1{font-size:20px;margin-bottom:16px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#f3f4f6}</style></head>
    <body><h1>Survey Responses Export</h1>
    <table><thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rowsHtml}</tbody></table></body></html>`);
  w.document.close(); w.focus(); w.print();
}

/* ─── Custom Recharts Tooltip ─── */

function ChartTooltipContent({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surbee-bg-secondary)',
      border: '1px solid var(--surbee-border-primary)',
      borderRadius: '8px',
      padding: '8px 12px',
      fontSize: '13px',
      color: 'var(--surbee-fg-primary)',
    }}>
      <div style={{ fontWeight: 500, marginBottom: '2px' }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ color: 'var(--surbee-fg-secondary)' }}>{p.value} responses</div>
      ))}
    </div>
  );
}

/* ─── Funnel Insight Heuristics ─── */

function getFunnelInsight(step: FunnelStep, questionType?: string): { cause: string; fix: string } {
  const type = (questionType || '').toLowerCase();
  if (type.includes('scale') || type.includes('rating')) {
    return {
      cause: 'Rating questions without clear labels often cause confusion and drop-off.',
      fix: 'Add descriptive labels to each scale point (e.g., 1 = Poor, 5 = Excellent).',
    };
  }
  if (type.includes('text') || type.includes('open')) {
    return {
      cause: 'Open-ended questions require more effort, leading to higher abandonment.',
      fix: 'Add example answers or make the question optional to reduce friction.',
    };
  }
  if (type.includes('choice')) {
    return {
      cause: 'Too many options or unclear choices can overwhelm respondents.',
      fix: 'Reduce options to 5-7 and group related choices logically.',
    };
  }
  if (step.questionNumber > 4) {
    return {
      cause: 'Questions later in the survey have naturally higher drop-off due to fatigue.',
      fix: 'Consider removing this question or moving it earlier in the survey.',
    };
  }
  return {
    cause: 'High drop-off may indicate confusing wording or sensitive topic.',
    fix: 'Simplify the question wording and ensure it feels relevant to respondents.',
  };
}

/* ─── Main Component ─── */

interface InsightsTabProps {
  projectId: string;
}

export function InsightsTab({ projectId }: InsightsTabProps) {
  const { user } = useAuth();
  const router = useRouter();

  /* State */
  const [activeTab, setActiveTab] = useState<SubTab>('overview');
  const [period, setPeriod] = useState<PeriodKey>('30d');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial' | 'abandoned'>('all');
  const [qualityFilter, setQualityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedResponses, setExpandedResponses] = useState<Set<string>>(new Set());
  const [showExport, setShowExport] = useState(false);
  const [expandedFunnelSteps, setExpandedFunnelSteps] = useState<Set<number>>(new Set());
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const PAGE_SIZE = 15;

  /* Data hooks */
  const {
    stats, trendData, funnelData, responses, questions,
    questionStats, loading,
  } = useInsightsData(projectId, { timePeriod: PERIOD_MAP[period] });

  const { isConnected, usePolling } = useAnalyticsStream({
    projectId: projectId || '',
    userId: user?.id || '',
  });

  /* Computed: filtered responses */
  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchId = r.id.toLowerCase().includes(q);
        const matchAnswer = r.responses.some(qr => qr.answer.toLowerCase().includes(q));
        if (!matchId && !matchAnswer) return false;
      }
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (qualityFilter !== 'all') {
        const s = r.qualityScore ?? 100;
        if (qualityFilter === 'high' && s < 80) return false;
        if (qualityFilter === 'medium' && (s < 60 || s >= 80)) return false;
        if (qualityFilter === 'low' && s >= 60) return false;
      }
      return true;
    });
  }, [responses, searchQuery, statusFilter, qualityFilter]);

  const totalPages = Math.ceil(filteredResponses.length / PAGE_SIZE);
  const pagedResponses = filteredResponses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const pageStart = filteredResponses.length > 0 ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, filteredResponses.length);

  /* Computed: device breakdown */
  const deviceBreakdown = useMemo(() => {
    const total = stats.total || 1;
    return Object.entries(stats.devices)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([device, count]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        key: device,
        count,
        pct: Math.round((count / total) * 100),
      }));
  }, [stats]);

  /* Computed: AI insights */
  const aiInsights = useMemo(() => {
    const insights: { color: string; title: string; description: string }[] = [];

    if (stats.completionRate >= 70) {
      insights.push({ color: 'var(--surbee-success)', title: 'Strong completion rate', description: `${stats.completionRate}% completion is above the 70% benchmark. Your survey flow is working well.` });
    } else {
      insights.push({ color: 'var(--surbee-warning)', title: 'Completion rate below benchmark', description: `${stats.completionRate}% is below the 70% target. Consider shortening the survey or simplifying complex questions.` });
    }

    const avgMin = stats.avgTime / 60;
    if (avgMin > 5) {
      insights.push({ color: 'var(--surbee-warning)', title: 'Long average completion time', description: `${avgMin.toFixed(1)} minutes average. Surveys over 5 minutes see higher abandonment.` });
    } else {
      insights.push({ color: 'var(--surbee-success)', title: 'Good completion time', description: `${avgMin.toFixed(1)} minutes average keeps respondents engaged without fatigue.` });
    }

    if (stats.flaggedCount > 0) {
      const flagPct = Math.round((stats.flaggedCount / Math.max(stats.total, 1)) * 100);
      insights.push({ color: 'var(--surbee-error)', title: `${stats.flaggedCount} flagged responses (${flagPct}%)`, description: 'Cipher detected quality issues. Review flagged responses in the Responses tab.' });
    } else {
      insights.push({ color: 'var(--surbee-success)', title: 'No flagged responses', description: 'All responses passed Cipher quality checks. Data integrity looks solid.' });
    }

    const mobileCount = (stats.devices.mobile || 0) + (stats.devices.tablet || 0);
    const mobilePct = stats.total > 0 ? Math.round((mobileCount / stats.total) * 100) : 0;
    if (mobilePct > 50) {
      insights.push({ color: 'var(--surbee-info)', title: `${mobilePct}% mobile respondents`, description: 'Majority access on mobile. Ensure all question types render well on smaller screens.' });
    } else {
      insights.push({ color: 'var(--surbee-info)', title: `${mobilePct}% mobile, ${100 - mobilePct}% desktop`, description: 'Desktop-heavy audience. Consider QR codes or social sharing to boost mobile reach.' });
    }

    if (stats.avgQuality >= 80) {
      insights.push({ color: 'var(--surbee-success)', title: 'High data quality', description: `Average quality score of ${stats.avgQuality}% indicates reliable, trustworthy responses.` });
    } else if (stats.avgQuality >= 60) {
      insights.push({ color: 'var(--surbee-warning)', title: 'Moderate data quality', description: `Average quality score of ${stats.avgQuality}%. Review low-quality responses for patterns.` });
    } else {
      insights.push({ color: 'var(--surbee-error)', title: 'Low data quality', description: `Average quality score of ${stats.avgQuality}%. Consider adding attention checks or tightening validation.` });
    }

    return insights;
  }, [stats]);

  /* Computed: answer distributions for Questions tab */
  const answerDistributions = useMemo(() => {
    const result: Record<string, { answer: string; count: number; pct: number }[]> = {};
    questionStats.forEach((qs, idx) => {
      const counts: Record<string, number> = {};
      responses.forEach(r => {
        const qr = r.responses.find(q => q.questionId === qs.questionId || q.questionId === `q${idx + 1}`);
        if (qr) counts[qr.answer] = (counts[qr.answer] || 0) + 1;
      });
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      result[qs.questionId] = Object.entries(counts)
        .map(([answer, count]) => ({ answer, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 }))
        .sort((a, b) => b.count - a.count);
    });
    return result;
  }, [responses, questionStats]);

  /* Computed: cipher stats per question */
  const cipherStatsMap = useMemo(() => {
    const result: Record<string, { attentionRate: number; speedAnomalies: number; patternFlags: number }> = {};
    questionStats.forEach((qs, idx) => {
      const qResps = responses.flatMap(r =>
        r.responses.filter(q => q.questionId === qs.questionId || q.questionId === `q${idx + 1}`)
      );
      const total = qResps.length || 1;
      result[qs.questionId] = {
        attentionRate: Math.round((qResps.filter(qr => qr.accuracyScore >= 80).length / total) * 100),
        speedAnomalies: qResps.filter(qr => qr.timeTaken < 2).length,
        patternFlags: qResps.filter(qr => qr.issues?.length).length,
      };
    });
    return result;
  }, [responses, questionStats]);

  /* Toggle helpers */
  const toggleResponse = (id: string) => {
    setExpandedResponses(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleFunnelStep = (num: number) => {
    setExpandedFunnelSteps(prev => { const n = new Set(prev); n.has(num) ? n.delete(num) : n.add(num); return n; });
  };
  const toggleQuestion = (id: string) => {
    setExpandedQuestions(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="insights-root">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--surbee-fg-muted)' }} />
        </div>
        <style jsx>{`
          .insights-root { max-width: 1100px; margin: 0 auto; }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  /* Tab config */
  const tabs: { key: SubTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'responses', label: 'Responses' },
    { key: 'funnel', label: 'Funnel' },
    { key: 'questions', label: 'Questions' },
  ];

  return (
    <div className="insights-root">

      {/* ─── Header ─── */}
      <header className="insights-header">
        <h1 className="insights-title">Insights</h1>
        <p className="insights-subtitle">
          {isConnected ? (
            <span className="status-indicator">
              <Wifi size={13} style={{ color: 'var(--surbee-success)' }} />
              <span style={{ color: 'var(--surbee-success)' }}>Live</span>
            </span>
          ) : usePolling ? (
            <span className="status-indicator">
              <RefreshCw size={13} style={{ color: 'var(--surbee-info)' }} />
              <span style={{ color: 'var(--surbee-info)' }}>Polling</span>
            </span>
          ) : (
            <span className="status-indicator">
              <WifiOff size={13} style={{ color: 'var(--surbee-fg-muted)' }} />
              <span style={{ color: 'var(--surbee-fg-muted)' }}>Offline</span>
            </span>
          )}
        </p>
      </header>

      {/* ─── Pill Tabs ─── */}
      <nav className="insights-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`insights-tab${activeTab === t.key ? ' active' : ''}`}
            onClick={() => { setActiveTab(t.key); setCurrentPage(1); }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* ─── Tab Content ─── */}
      <div className="insights-content">

        {/* ═══════════════ OVERVIEW ═══════════════ */}
        {activeTab === 'overview' && (
          <>
            {/* Metrics strip */}
            <div className="metrics-strip">
              <div className="metric-item">
                <div className="metric-value">{stats.total}</div>
                <div className="metric-label">Total Responses</div>
              </div>
              <div className="metric-divider" />
              <div className="metric-item">
                <div className="metric-value">{stats.completionRate}%</div>
                <div className="metric-label">Completion Rate</div>
              </div>
              <div className="metric-divider" />
              <div className="metric-item">
                <div className="metric-value">{fmtTime(stats.avgTime)}</div>
                <div className="metric-label">Avg Time</div>
              </div>
              <div className="metric-divider" />
              <div className="metric-item">
                <div className="metric-value">{stats.flaggedCount}</div>
                <div className="metric-label">Flagged</div>
              </div>
            </div>

            {/* Response trend chart */}
            <div className="chart-card">
              <div className="chart-header">
                <span className="chart-card-title">Response Trend</span>
                <div className="period-toggle">
                  {(['7d', '30d', '90d', '1y'] as PeriodKey[]).map(p => (
                    <button
                      key={p}
                      className={`period-btn${period === p ? ' active' : ''}`}
                      onClick={() => setPeriod(p)}
                    >
                      {p.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-body">
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={trendData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--surbee-fg-primary)" stopOpacity={0.12} />
                        <stop offset="100%" stopColor="var(--surbee-fg-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--surbee-border-secondary)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--surbee-fg-muted)' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: 'var(--surbee-fg-muted)' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="count" stroke="var(--surbee-fg-primary)" strokeWidth={2} fill="url(#trendFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Two-column: Devices + AI Insights */}
            <div className="overview-grid">
              <div className="card">
                <h3 className="card-heading">Devices</h3>
                <div className="device-list">
                  {deviceBreakdown.map(d => (
                    <div key={d.key} className="device-row">
                      <span className="device-icon">{DEVICE_ICONS[d.key] || <Monitor size={14} />}</span>
                      <span className="device-name">{d.device}</span>
                      <div className="device-bar-track">
                        <div className="device-bar-fill" style={{ width: `${d.pct}%` }} />
                      </div>
                      <span className="device-pct">{d.pct}%</span>
                    </div>
                  ))}
                  {deviceBreakdown.length === 0 && <div className="empty-state">No device data yet</div>}
                </div>
              </div>

              <div className="card">
                <h3 className="card-heading">AI Insights</h3>
                <div className="insights-list">
                  {aiInsights.map((insight, i) => (
                    <div key={i} className="insight-row">
                      <span className="insight-dot" style={{ background: insight.color }} />
                      <div>
                        <div className="insight-title">{insight.title}</div>
                        <div className="insight-desc">{insight.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ RESPONSES ═══════════════ */}
        {activeTab === 'responses' && (
          <>
            <div className="responses-toolbar">
              <div className="search-box">
                <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--surbee-fg-muted)', pointerEvents: 'none' }} />
                <input type="text" className="search-input" placeholder="Search responses..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="filter-pills">
                {(['all', 'completed', 'partial', 'abandoned'] as const).map(s => (
                  <button key={s} className={`filter-pill${statusFilter === s ? ' active' : ''}`} onClick={() => { setStatusFilter(s); setCurrentPage(1); }}>
                    {s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
                <span className="filter-sep" />
                {(['all', 'high', 'medium', 'low'] as const).map(q => (
                  <button key={q} className={`filter-pill${qualityFilter === q ? ' active' : ''}`} onClick={() => { setQualityFilter(q); setCurrentPage(1); }}>
                    {q === 'all' ? 'All Quality' : q.charAt(0).toUpperCase() + q.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-card">
              <div className="table-grid table-header-row">
                <div className="th">#</div>
                <div className="th">Status</div>
                <div className="th">Quality</div>
                <div className="th">Submitted</div>
                <div className="th">Duration</div>
                <div className="th">Device</div>
                <div className="th">Cipher</div>
              </div>

              {pagedResponses.map((r, idx) => {
                const sLabel = statusLabel(r.status);
                const qLabel = qualityLabel(r.qualityScore ?? 100);
                const isExpanded = expandedResponses.has(r.id);
                const cipherScore = r.qualityScore ?? 100;

                return (
                  <React.Fragment key={r.id}>
                    <div className={`table-grid table-row${r.isFlagged ? ' flagged' : ''}`} onClick={() => toggleResponse(r.id)}>
                      <div className="td td-num">
                        {isExpanded ? <ChevronDown size={12} style={{ flexShrink: 0 }} /> : <ChevronRight size={12} style={{ flexShrink: 0 }} />}
                        <span>{pageStart + idx}</span>
                      </div>
                      <div className="td"><span className={`badge ${sLabel.cls}`}>{sLabel.text}</span></div>
                      <div className="td"><span className={`badge ${qLabel.cls}`}>{qLabel.text}</span></div>
                      <div className="td td-muted">{format(r.submittedAt, 'MMM d, h:mm a')}</div>
                      <div className="td td-muted">{fmtTime(r.completionTime)}</div>
                      <div className="td td-muted" style={{ textTransform: 'capitalize' }}>{r.deviceType}</div>
                      <div className="td">
                        <span className="cipher-icon">
                          {cipherScore >= 80 ? <CheckCircle size={14} style={{ color: 'var(--surbee-success)' }} />
                            : cipherScore >= 60 ? <AlertCircle size={14} style={{ color: 'var(--surbee-warning)' }} />
                            : <XCircle size={14} style={{ color: 'var(--surbee-error)' }} />}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="expanded-row">
                        {r.responses.map((qr, qi) => (
                          <div key={qi} className={`answer-row${qr.issues?.length ? ' answer-flagged' : ''}`}>
                            <span className="q-badge">Q{qi + 1}</span>
                            <div className="answer-content">
                              <div className="answer-question">{qr.questionText}</div>
                              <div className="answer-text">{qr.answer}</div>
                            </div>
                            <span className="answer-time">{qr.timeTaken.toFixed(1)}s</span>
                          </div>
                        ))}
                        {r.isFlagged && r.flagReasons && (
                          <div className="flag-reasons">
                            <AlertCircle size={13} style={{ color: 'var(--surbee-warning)', flexShrink: 0 }} />
                            <span>Flagged: {r.flagReasons.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
              {filteredResponses.length === 0 && <div className="empty-state" style={{ padding: '32px' }}>No responses match your filters</div>}
            </div>

            <div className="table-footer">
              <div className="pagination">
                <button className="page-btn" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                <span className="page-info">{filteredResponses.length > 0 ? `${pageStart}\u2013${pageEnd} of ${filteredResponses.length}` : '0 results'}</span>
                <button className="page-btn" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
              </div>
              <div className="export-wrapper">
                <button className="export-btn" onClick={() => setShowExport(v => !v)}>
                  <Download size={14} /> Export
                </button>
                {showExport && (
                  <div className="export-dropdown">
                    <button onClick={() => { downloadCSV(filteredResponses); setShowExport(false); }}>CSV</button>
                    <button onClick={() => { openPrintPreview(filteredResponses); setShowExport(false); }}>PDF</button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ FUNNEL ═══════════════ */}
        {activeTab === 'funnel' && (
          <>
            <div className="metrics-strip">
              <div className="metric-item"><div className="metric-value">{questions.length}</div><div className="metric-label">Questions</div></div>
              <div className="metric-divider" />
              <div className="metric-item"><div className="metric-value">{stats.total}</div><div className="metric-label">Started</div></div>
              <div className="metric-divider" />
              <div className="metric-item"><div className="metric-value">{stats.completed}</div><div className="metric-label">Completed</div></div>
              <div className="metric-divider" />
              <div className="metric-item"><div className="metric-value">{stats.completionRate}%</div><div className="metric-label">Completion Rate</div></div>
            </div>

            <div className="card">
              {funnelData.map(step => {
                const isHighDropoff = step.dropOff > 10;
                const isExpanded = expandedFunnelSteps.has(step.questionNumber);
                const question = questions.find(q => q.question_id === step.questionId);
                const insight = getFunnelInsight(step, question?.question_type);

                return (
                  <div key={step.questionNumber}>
                    <div className={`funnel-row${isHighDropoff ? ' high-dropoff' : ''}`} onClick={() => isHighDropoff && toggleFunnelStep(step.questionNumber)} style={{ cursor: isHighDropoff ? 'pointer' : 'default' }}>
                      <span className="funnel-num">Q{step.questionNumber}</span>
                      <div className="funnel-text">{step.questionText}</div>
                      <div className="funnel-bar-track"><div className="funnel-bar-fill" style={{ width: `${step.retention}%` }} /></div>
                      <span className="funnel-retention">{step.retention}%</span>
                      <span className={`funnel-dropoff${isHighDropoff ? ' high' : ''}`}>{step.dropOff > 0 ? `\u2212${step.dropOff}%` : '\u2014'}</span>
                      {isHighDropoff && (isExpanded ? <ChevronDown size={14} style={{ flexShrink: 0, color: 'var(--surbee-fg-muted)' }} /> : <ChevronRight size={14} style={{ flexShrink: 0, color: 'var(--surbee-fg-muted)' }} />)}
                    </div>

                    {isExpanded && isHighDropoff && (
                      <div className="funnel-insight">
                        <div className="funnel-insight-icon"><AlertCircle size={18} /></div>
                        <div className="funnel-insight-body">
                          <div className="funnel-insight-section"><span className="funnel-insight-label">Likely cause</span><p className="funnel-insight-text">{insight.cause}</p></div>
                          <div className="funnel-insight-section"><span className="funnel-insight-label">Suggested fix</span><p className="funnel-insight-text">{insight.fix}</p></div>
                          <button className="fix-now-btn" onClick={(e) => { e.stopPropagation(); router.push(`/projects/${projectId}/manage?focusQuestion=${encodeURIComponent(step.questionId)}`); }}>Fix Now</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {funnelData.length === 0 && <div className="empty-state" style={{ padding: '32px' }}>No funnel data available yet</div>}
            </div>
          </>
        )}

        {/* ═══════════════ QUESTIONS ═══════════════ */}
        {activeTab === 'questions' && (
          <div className="table-card">
            <div className="table-grid-q table-header-row">
              <div className="th">Question</div>
              <div className="th">Responses</div>
              <div className="th">Skip Rate</div>
              <div className="th">Avg Score</div>
              <div className="th">Dropoff</div>
            </div>

            {questionStats.map((qs) => {
              const isExpanded = expandedQuestions.has(qs.questionId);
              const question = questions.find(q => q.question_id === qs.questionId);
              const qType = question?.question_type || 'text';
              const skipRate = qs.responseCount > 0 && stats.total > 0
                ? Math.round(((stats.total - qs.responseCount) / stats.total) * 100) : 0;
              const dist = answerDistributions[qs.questionId] || [];
              const cipher = cipherStatsMap[qs.questionId] || { attentionRate: 0, speedAnomalies: 0, patternFlags: 0 };

              return (
                <React.Fragment key={qs.questionId}>
                  <div className="table-grid-q table-row" onClick={() => toggleQuestion(qs.questionId)}>
                    <div className="td" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isExpanded ? <ChevronDown size={12} style={{ flexShrink: 0 }} /> : <ChevronRight size={12} style={{ flexShrink: 0 }} />}
                      <span style={{ flex: 1, minWidth: 0 }}>{qs.questionText}</span>
                      <span className="type-badge">{qType}</span>
                    </div>
                    <div className="td">{qs.responseCount}</div>
                    <div className="td">{skipRate}%</div>
                    <div className="td">{qs.avgScore}%</div>
                    <div className="td">{qs.dropoffRate}%</div>
                  </div>

                  {isExpanded && (
                    <div className="expanded-row">
                      {dist.length > 0 && (
                        <div className="distribution">
                          <div className="distribution-title">Answer Distribution</div>
                          {dist.slice(0, 10).map((a, i) => (
                            <div key={i} className="dist-row">
                              <span className="dist-answer">{a.answer}</span>
                              <div className="dist-bar-track"><div className="dist-bar-fill" style={{ width: `${a.pct}%` }} /></div>
                              <span className="dist-count">{a.count}</span>
                              <span className="dist-pct">{a.pct}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="cipher-stats">
                        <span className="cipher-stat-badge"><CheckCircle size={12} style={{ color: 'var(--surbee-success)' }} /> Attention: {cipher.attentionRate}%</span>
                        <span className="cipher-stat-badge"><AlertCircle size={12} style={{ color: 'var(--surbee-warning)' }} /> Speed anomalies: {cipher.speedAnomalies}</span>
                        <span className="cipher-stat-badge"><XCircle size={12} style={{ color: 'var(--surbee-error)' }} /> Pattern flags: {cipher.patternFlags}</span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
            {questionStats.length === 0 && <div className="empty-state" style={{ padding: '32px' }}>No question data available yet</div>}
          </div>
        )}
      </div>

      {/* ─── Styles ─── */}
      <style jsx>{`
        .insights-root { max-width: 1100px; margin: 0 auto; padding: 8px 0 80px; color: var(--surbee-fg-primary, #E8E8E8); }
        .insights-header { margin-bottom: 24px; }
        .insights-title { font-family: 'Kalice-Trial-Regular', sans-serif; font-size: 28px; font-weight: 400; line-height: 1.4; margin: 0 0 4px 0; color: var(--surbee-fg-primary, #E8E8E8); }
        .insights-subtitle { font-size: 14px; color: var(--surbee-fg-secondary, #d1d5db); margin: 0; }
        .status-indicator { display: inline-flex; align-items: center; gap: 5px; }

        .insights-tabs { display: flex; gap: 8px; margin-bottom: 32px; flex-wrap: wrap; }
        .insights-tab { padding: 8px 16px; font-size: 14px; font-weight: 500; color: var(--surbee-fg-primary, #E8E8E8); background: transparent; border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 9999px; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
        .insights-tab:hover { background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.05)); }
        .insights-tab.active { background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.05)); border-color: transparent; }

        .metrics-strip { display: flex; align-items: center; margin-bottom: 24px; padding: 20px 0; border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 12px; }
        .metric-item { flex: 1; text-align: center; padding: 0 20px; }
        .metric-value { font-size: 24px; font-weight: 600; color: var(--surbee-fg-primary, #E8E8E8); line-height: 1.2; }
        .metric-label { font-size: 13px; color: var(--surbee-fg-muted, #9ca3af); margin-top: 4px; }
        .metric-divider { width: 1px; height: 40px; background: var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); flex-shrink: 0; }

        .chart-card { border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 12px; margin-bottom: 24px; overflow: hidden; }
        .chart-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px 0; }
        .chart-card-title { font-size: 14px; font-weight: 500; color: var(--surbee-fg-primary, #E8E8E8); }
        .chart-body { padding: 12px 8px 8px; }

        .period-toggle { display: flex; gap: 4px; }
        .period-btn { padding: 4px 10px; font-size: 12px; font-weight: 500; color: var(--surbee-fg-muted, #9ca3af); background: transparent; border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 9999px; cursor: pointer; transition: all 0.2s ease; font-family: inherit; }
        .period-btn:hover { color: var(--surbee-fg-primary, #E8E8E8); }
        .period-btn.active { color: var(--surbee-fg-primary, #E8E8E8); background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.05)); border-color: transparent; }

        .overview-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
        .card { border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 12px; padding: 20px; }
        .card-heading { font-size: 14px; font-weight: 500; color: var(--surbee-fg-primary, #E8E8E8); margin: 0 0 16px 0; }

        .device-list { display: flex; flex-direction: column; gap: 12px; }
        .device-row { display: flex; align-items: center; gap: 10px; }
        .device-icon { display: flex; align-items: center; color: var(--surbee-fg-muted, #9ca3af); flex-shrink: 0; }
        .device-name { font-size: 13px; color: var(--surbee-fg-primary, #E8E8E8); width: 60px; flex-shrink: 0; }
        .device-bar-track { flex: 1; height: 6px; background: var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); border-radius: 3px; overflow: hidden; }
        .device-bar-fill { height: 100%; background: var(--surbee-fg-primary, #E8E8E8); border-radius: 3px; opacity: 0.6; transition: width 0.3s ease; }
        .device-pct { font-size: 13px; font-weight: 500; color: var(--surbee-fg-secondary, #d1d5db); width: 36px; text-align: right; flex-shrink: 0; }

        .insights-list { display: flex; flex-direction: column; gap: 14px; }
        .insight-row { display: flex; gap: 10px; align-items: flex-start; }
        .insight-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; }
        .insight-title { font-size: 13px; font-weight: 500; color: var(--surbee-fg-primary, #E8E8E8); margin-bottom: 2px; }
        .insight-desc { font-size: 13px; color: var(--surbee-fg-muted, #9ca3af); line-height: 1.4; }

        .responses-toolbar { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
        .search-box { position: relative; max-width: 320px; }
        .search-input { width: 100%; padding: 8px 12px 8px 32px; font-size: 14px; font-family: inherit; color: var(--surbee-fg-primary, #E8E8E8); background: var(--surbee-input-bg, #1E1E1F); border: 1px solid var(--surbee-input-border, rgba(255, 255, 255, 0.1)); border-radius: 9999px; outline: none; transition: border-color 0.2s ease; }
        .search-input:focus { border-color: var(--surbee-border-focus, #9ca3af); }
        .search-input::placeholder { color: var(--surbee-input-placeholder, #6b7280); }
        .filter-pills { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .filter-pill { padding: 5px 12px; font-size: 13px; font-weight: 500; font-family: inherit; color: var(--surbee-fg-muted, #9ca3af); background: transparent; border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 9999px; cursor: pointer; transition: all 0.2s ease; }
        .filter-pill:hover { color: var(--surbee-fg-primary, #E8E8E8); }
        .filter-pill.active { color: var(--surbee-fg-primary, #E8E8E8); background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.05)); border-color: transparent; }
        .filter-sep { width: 1px; height: 20px; background: var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); margin: 0 4px; }

        .table-card { border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 12px; overflow: hidden; }
        .table-grid { display: grid; grid-template-columns: 60px 100px 90px 140px 90px 90px 60px; }
        .table-grid-q { display: grid; grid-template-columns: 1fr 90px 90px 90px 80px; }
        .table-header-row { border-bottom: 1px solid var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); }
        .th { padding: 10px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--surbee-fg-muted, #9ca3af); }
        .table-row { border-bottom: 1px solid var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); cursor: pointer; transition: background 0.15s ease; }
        .table-row:hover { background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.03)); }
        .table-row.flagged { border-left: 3px solid var(--surbee-warning, #f59e0b); }
        .td { padding: 14px 12px; font-size: 14px; color: var(--surbee-fg-primary, #E8E8E8); display: flex; align-items: center; min-width: 0; }
        .td-num { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--surbee-fg-muted, #9ca3af); }
        .td-muted { color: var(--surbee-fg-muted, #9ca3af); font-size: 13px; }

        .badge { display: inline-flex; align-items: center; padding: 2px 8px; font-size: 12px; font-weight: 500; border-radius: 9999px; white-space: nowrap; }
        .badge-green { background: var(--surbee-success-subtle, rgba(16, 185, 129, 0.1)); color: var(--surbee-success, #10b981); }
        .badge-yellow { background: var(--surbee-warning-subtle, rgba(245, 158, 11, 0.1)); color: var(--surbee-warning, #f59e0b); }
        .badge-red { background: var(--surbee-error-subtle, rgba(239, 68, 68, 0.1)); color: var(--surbee-error, #ef4444); }

        .cipher-icon { display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; }

        .expanded-row { padding: 12px 20px 16px; background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.03)); border-bottom: 1px solid var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); }
        .answer-row { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); }
        .answer-row:last-child { border-bottom: none; }
        .answer-row.answer-flagged { background: var(--surbee-warning-subtle, rgba(245, 158, 11, 0.1)); margin: 0 -8px; padding: 8px; border-radius: 6px; }
        .q-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 28px; height: 22px; padding: 0 6px; font-size: 11px; font-weight: 600; color: var(--surbee-fg-muted, #9ca3af); background: var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); border-radius: 4px; flex-shrink: 0; }
        .answer-content { flex: 1; min-width: 0; }
        .answer-question { font-size: 12px; color: var(--surbee-fg-muted, #9ca3af); margin-bottom: 2px; }
        .answer-text { font-size: 14px; color: var(--surbee-fg-primary, #E8E8E8); }
        .answer-time { font-size: 12px; color: var(--surbee-fg-muted, #9ca3af); flex-shrink: 0; white-space: nowrap; }
        .flag-reasons { display: flex; align-items: center; gap: 6px; padding: 8px 0 0; font-size: 13px; color: var(--surbee-warning, #f59e0b); }

        .table-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 16px; }
        .pagination { display: flex; align-items: center; gap: 12px; }
        .page-btn { padding: 6px 14px; font-size: 13px; font-weight: 500; font-family: inherit; color: var(--surbee-fg-primary, #E8E8E8); background: transparent; border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 9999px; cursor: pointer; transition: all 0.2s ease; }
        .page-btn:hover:not(:disabled) { background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.05)); }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-info { font-size: 13px; color: var(--surbee-fg-muted, #9ca3af); }
        .export-wrapper { position: relative; }
        .export-btn { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 14px; font-weight: 500; font-family: inherit; color: var(--surbee-fg-primary, #E8E8E8); background: transparent; border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 9999px; cursor: pointer; transition: all 0.2s ease; }
        .export-btn:hover { background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.05)); }
        .export-dropdown { position: absolute; bottom: 100%; right: 0; margin-bottom: 4px; background: var(--surbee-dropdown-bg, rgba(19, 19, 20, 0.95)); border: 1px solid var(--surbee-dropdown-border, rgba(232, 232, 232, 0.15)); border-radius: 8px; overflow: hidden; z-index: 10; }
        .export-dropdown button { display: block; width: 100%; padding: 8px 20px; font-size: 14px; font-family: inherit; color: var(--surbee-dropdown-text, #E8E8E8); background: transparent; border: none; cursor: pointer; text-align: left; transition: background 0.15s ease; }
        .export-dropdown button:hover { background: var(--surbee-dropdown-item-hover, rgba(255, 255, 255, 0.05)); }

        .funnel-row { display: flex; align-items: center; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); transition: background 0.15s ease; }
        .funnel-row:last-child { border-bottom: none; }
        .funnel-row.high-dropoff { background: var(--surbee-warning-subtle, rgba(245, 158, 11, 0.1)); margin: 0 -20px; padding: 14px 20px; border-left: 3px solid var(--surbee-warning, #f59e0b); }
        .funnel-row.high-dropoff:hover { background: var(--surbee-warning-subtle, rgba(245, 158, 11, 0.15)); }
        .funnel-num { font-size: 12px; font-weight: 600; color: var(--surbee-fg-muted, #9ca3af); width: 28px; flex-shrink: 0; }
        .funnel-text { flex: 1; font-size: 14px; color: var(--surbee-fg-primary, #E8E8E8); min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .funnel-bar-track { width: 120px; height: 6px; background: var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); border-radius: 3px; overflow: hidden; flex-shrink: 0; }
        .funnel-bar-fill { height: 100%; background: var(--surbee-fg-primary, #E8E8E8); border-radius: 3px; opacity: 0.5; transition: width 0.3s ease; }
        .funnel-retention { font-size: 13px; font-weight: 500; color: var(--surbee-fg-secondary, #d1d5db); width: 40px; text-align: right; flex-shrink: 0; }
        .funnel-dropoff { font-size: 13px; color: var(--surbee-fg-muted, #9ca3af); width: 48px; text-align: right; flex-shrink: 0; }
        .funnel-dropoff.high { color: var(--surbee-warning, #f59e0b); font-weight: 500; }

        .funnel-insight { display: flex; gap: 12px; padding: 16px 20px; margin: 0 -20px; background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.03)); border-bottom: 1px solid var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); }
        .funnel-insight-icon { display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: var(--surbee-warning-subtle, rgba(245, 158, 11, 0.1)); color: var(--surbee-warning, #f59e0b); flex-shrink: 0; }
        .funnel-insight-body { flex: 1; min-width: 0; }
        .funnel-insight-section { margin-bottom: 10px; }
        .funnel-insight-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--surbee-fg-muted, #9ca3af); display: block; margin-bottom: 2px; }
        .funnel-insight-text { font-size: 14px; color: var(--surbee-fg-primary, #E8E8E8); margin: 0; line-height: 1.4; }
        .fix-now-btn { padding: 6px 16px; font-size: 14px; font-weight: 500; font-family: inherit; color: var(--surbee-fg-primary, #E8E8E8); background: transparent; border: 1px solid var(--surbee-border-primary, rgba(232, 232, 232, 0.1)); border-radius: 9999px; cursor: pointer; transition: all 0.2s ease; }
        .fix-now-btn:hover { background: var(--surbee-accent-subtle, rgba(232, 232, 232, 0.05)); }

        .type-badge { display: inline-flex; padding: 1px 6px; font-size: 11px; font-weight: 500; color: var(--surbee-fg-muted, #9ca3af); background: var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); border-radius: 4px; flex-shrink: 0; text-transform: lowercase; }

        .distribution { margin-bottom: 16px; }
        .distribution-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--surbee-fg-muted, #9ca3af); margin-bottom: 10px; }
        .dist-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
        .dist-answer { font-size: 13px; color: var(--surbee-fg-primary, #E8E8E8); width: 140px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dist-bar-track { flex: 1; height: 6px; background: var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); border-radius: 3px; overflow: hidden; }
        .dist-bar-fill { height: 100%; background: var(--surbee-fg-primary, #E8E8E8); border-radius: 3px; opacity: 0.5; transition: width 0.3s ease; }
        .dist-count { font-size: 13px; font-weight: 500; color: var(--surbee-fg-secondary, #d1d5db); width: 32px; text-align: right; flex-shrink: 0; }
        .dist-pct { font-size: 13px; color: var(--surbee-fg-muted, #9ca3af); width: 36px; text-align: right; flex-shrink: 0; }

        .cipher-stats { display: flex; gap: 12px; flex-wrap: wrap; }
        .cipher-stat-badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; font-size: 12px; font-weight: 500; color: var(--surbee-fg-secondary, #d1d5db); background: var(--surbee-border-secondary, rgba(232, 232, 232, 0.05)); border-radius: 6px; }

        .empty-state { text-align: center; font-size: 14px; color: var(--surbee-fg-muted, #9ca3af); padding: 24px; }

        @media (max-width: 768px) {
          .metrics-strip { flex-direction: column; gap: 16px; }
          .metric-divider { width: 100%; height: 1px; }
          .overview-grid { grid-template-columns: 1fr; }
          .table-grid { grid-template-columns: 40px 80px 70px 120px 70px 70px 50px; font-size: 12px; }
          .table-grid-q { grid-template-columns: 1fr 60px 60px 60px 60px; }
          .search-box { max-width: 100%; }
          .table-footer { flex-direction: column; gap: 12px; align-items: flex-start; }
          .funnel-bar-track { width: 80px; }
          .dist-answer { width: 100px; }
        }

        @media (max-width: 480px) {
          .table-grid { grid-template-columns: 36px 72px 64px 1fr; }
          .table-grid .td:nth-child(5), .table-grid .td:nth-child(6), .table-grid .td:nth-child(7),
          .table-grid .th:nth-child(5), .table-grid .th:nth-child(6), .table-grid .th:nth-child(7) { display: none; }
        }
      `}</style>
    </div>
  );
}

export default InsightsTab;
