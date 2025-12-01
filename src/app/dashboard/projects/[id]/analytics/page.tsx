"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Download,
  Share2,
  Edit,
  MoreVertical,
  BarChart3,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Wifi,
  WifiOff,
  Loader
} from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AccuracyMetricsCard, { AccuracyMetrics } from '@/components/analytics/AccuracyMetricsCard';
import AccuracyTrendChart from '@/components/analytics/AccuracyTrendChart';
import ResponseQualityBadge, { ResponseAccuracy } from '@/components/analytics/ResponseQualityBadge';
import SmartChart from '@/components/analytics/SmartChart';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/database';
import { useAnalyticsStream } from '@/hooks/useAnalyticsStream';
import { ProjectBreadcrumb } from '@/components/ui/project-breadcrumb';
import { useTheme } from '@/hooks/useTheme';

interface AnalyticsPageProps {
  params: {
    id: string;
  };
}

interface ResponseData {
  id: string;
  submittedAt: Date;
  completionTime: number; // in minutes
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  status: 'completed' | 'partial' | 'abandoned';
  responses: Record<string, any>;
  accuracy: ResponseAccuracy;
}

interface QuestionAnalytics {
  id: string;
  question: string;
  type: 'multiple_choice' | 'text' | 'rating' | 'yes_no';
  responses: number;
  skipRate: number;
  avgRating?: number;
  options?: { label: string; count: number; percentage: number; }[];
}

// Analytics data interfaces
interface AnalyticsData {
  project: Project;
  metrics: {
    totalViews: number;
    totalResponses: number;
    completionRate: number;
    avgCompletionTime: number;
    lastResponse: Date | null;
  };
  accuracyMetrics: AccuracyMetrics;
  timelineData: Array<{ date: string; responses: number; views: number; }>;
  responses: any[];
  questionAnalytics: any[];
}

// Generate mock response timeline data
const generateTimelineData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'MMM dd'),
      responses: Math.floor(Math.random() * 20) + 5,
      views: Math.floor(Math.random() * 40) + 10
    });
  }
  return data;
};

// Generate mock accuracy trend data
const generateAccuracyTrendData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const baseAccuracy = 85 + Math.random() * 10; // Base between 85-95%
    data.push({
      date: format(date, 'MMM dd'),
      overallAccuracy: Math.max(70, Math.min(95, baseAccuracy + (Math.random() - 0.5) * 10)),
      attentionCheck: Math.max(80, Math.min(98, baseAccuracy + (Math.random() - 0.5) * 8)),
      consistencyCheck: Math.max(75, Math.min(92, baseAccuracy + (Math.random() - 0.5) * 12)),
      responseCount: Math.floor(Math.random() * 15) + 5
    });
  }
  return data;
};

// Mock question analytics
const mockQuestionAnalytics: QuestionAnalytics[] = [
  {
    id: 'q1',
    question: 'How satisfied are you with our service?',
    type: 'rating',
    responses: 340,
    skipRate: 2.1,
    avgRating: 4.2,
    options: [
      { label: '5 - Very Satisfied', count: 156, percentage: 45.9 },
      { label: '4 - Satisfied', count: 102, percentage: 30.0 },
      { label: '3 - Neutral', count: 51, percentage: 15.0 },
      { label: '2 - Dissatisfied', count: 21, percentage: 6.2 },
      { label: '1 - Very Dissatisfied', count: 10, percentage: 2.9 }
    ]
  },
  {
    id: 'q2',
    question: 'Which features do you use most?',
    type: 'multiple_choice',
    responses: 338,
    skipRate: 3.2,
    options: [
      { label: 'Dashboard', count: 285, percentage: 84.3 },
      { label: 'Reports', count: 198, percentage: 58.6 },
      { label: 'Analytics', count: 167, percentage: 49.4 },
      { label: 'Integrations', count: 89, percentage: 26.3 },
      { label: 'API', count: 45, percentage: 13.3 }
    ]
  },
  {
    id: 'q3',
    question: 'Would you recommend us to others?',
    type: 'yes_no',
    responses: 341,
    skipRate: 1.8,
    options: [
      { label: 'Yes', count: 289, percentage: 84.8 },
      { label: 'No', count: 52, percentage: 15.2 }
    ]
  }
];

// Mock individual responses
const generateMockResponses = (): ResponseData[] => {
  const responses = [];
  for (let i = 0; i < 50; i++) {
    // Generate accuracy score and flags
    const accuracyScore = Math.random() * 100;
    const attentionCheck = Math.random() > 0.08; // 92% pass rate
    const consistency = accuracyScore > 40;
    const speedValue = Math.random();
    const speed = speedValue < 0.05 ? 'too_fast' : speedValue > 0.95 ? 'too_slow' : 'normal';
    const patternValue = Math.random();
    const pattern = patternValue < 0.03 ? 'straight_line' : patternValue > 0.97 ? 'random' : 'normal';
    
    const flags = [];
    if (!attentionCheck) flags.push('attention_failed');
    if (!consistency) flags.push('inconsistent');
    if (speed !== 'normal') flags.push('speed_anomaly');
    if (pattern !== 'normal') flags.push('pattern_detected');

    responses.push({
      id: `response_${i + 1}`,
      submittedAt: subHours(new Date(), Math.random() * 24 * 30),
      completionTime: Math.random() * 10 + 2,
      deviceType: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)] as any,
      location: ['United States', 'Canada', 'United Kingdom', 'Germany', 'France'][Math.floor(Math.random() * 5)],
      status: ['completed', 'partial', 'abandoned'][Math.floor(Math.random() * 3)] as any,
      responses: {
        q1: Math.floor(Math.random() * 5) + 1,
        q2: ['Dashboard', 'Reports', 'Analytics'][Math.floor(Math.random() * 3)],
        q3: Math.random() > 0.15 ? 'Yes' : 'No'
      },
      accuracy: {
        score: Math.round(accuracyScore * 10) / 10,
        flags,
        checks: {
          attention: attentionCheck,
          consistency,
          speed,
          pattern
        }
      }
    });
  }
  return responses.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
};

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const resolvedParams = (params && typeof params.then === 'function') ? (React as any).use(params) : params;
  const projectId = resolvedParams?.id;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial' | 'abandoned'>('all');
  const [accuracyFilter, setAccuracyFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const [comparePeriod, setComparePeriod] = useState<'last30' | 'vsPrev30'>('last30');

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDarkMode = isMounted && theme === 'dark';

  // Use the real-time analytics hook
  const {
    analytics: streamedAnalytics,
    isConnected,
    isLoading: analyticsLoading,
    error: analyticsError,
    usePolling,
    refetch: refetchAnalytics
  } = useAnalyticsStream({
    projectId: projectId || '',
    userId: user?.id || '',
    onUpdate: (data) => {
      console.log('Analytics updated:', data);
    }
  });

  // Build mock analytics data (fallback for missing user/project)
  const buildMockAnalytics = (): AnalyticsData => {
    const timeline = generateTimelineData();
    const responses = generateMockResponses();
    const totalViews = timeline.reduce((sum, d: any) => sum + (d.views as number), 0);
    const totalResponses = timeline.reduce((sum, d: any) => sum + (d.responses as number), 0);
    const completionRate = totalViews > 0 ? (totalResponses / totalViews) * 100 : 0;

    const speedAnomalies = responses.filter(r => r.accuracy?.checks?.speed && r.accuracy.checks.speed !== 'normal').length;
    const patternFlags = responses.filter(r => r.accuracy?.checks?.pattern && r.accuracy.checks.pattern !== 'normal').length;
    const attentionPass = responses.filter(r => r.accuracy?.checks?.attention).length;
    const overallScore = responses.reduce((acc, r) => acc + (r.accuracy?.score || 0), 0) / (responses.length || 1);
    const qualityDist = {
      high: responses.filter(r => (r.accuracy?.score || 0) >= 80).length,
      medium: responses.filter(r => (r.accuracy?.score || 0) >= 50 && (r.accuracy?.score || 0) < 80).length,
      low: responses.filter(r => (r.accuracy?.score || 0) < 50).length,
    };

    const mockProject: Project = {
      id: projectId || 'demo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title: 'Demo Project',
      description: 'Mock analytics for design work',
      user_id: user?.id || 'demo-user',
      status: 'draft',
    };

    const accuracyMetrics: AccuracyMetrics = {
      overallScore: Number.isFinite(overallScore) ? overallScore : 75,
      attentionCheckPassRate: responses.length ? (attentionPass / responses.length) * 100 : 90,
      consistencyScore: 78,
      speedAnomalies,
      patternFlags,
      qualityDistribution: qualityDist,
    };

    return {
      project: mockProject,
      metrics: {
        totalViews,
        totalResponses,
        completionRate,
        avgCompletionTime: 6.2,
        lastResponse: responses[0]?.submittedAt || null,
      },
      accuracyMetrics,
      timelineData: timeline,
      responses,
      questionAnalytics: mockQuestionAnalytics,
    };
  };

  // Helpers: export to CSV and print to PDF
  const downloadCSV = (rows: any[], filename = 'analytics.csv') => {
    if (!rows || rows.length === 0) return;
    const headers = [
      'id','status','accuracy_score','submitted_at','completion_time_m','device','location'
    ];
    const escape = (val: any) => {
      const s = String(val ?? '').replace(/"/g, '""');
      return `"${s}"`;
    };
    const csv = [
      headers.join(','),
      ...rows.map(r => [
        r.id,
        r.status,
        r.accuracy?.score ?? '',
        r.submittedAt?.toISOString?.() || r.submittedAt,
        typeof r.completionTime === 'number' ? r.completionTime.toFixed(2) : r.completionTime,
        r.deviceType,
        r.location,
      ].map(escape).join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openPrintPreview = (rows: any[]) => {
    const doc = window.open('', '_blank');
    if (!doc) return;
    const style = `
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 20px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f3f4f6; }
      </style>
    `;
    const header = ['Response ID','Status','Accuracy','Submitted','Time (m)','Device','Location'];
    const rowsHtml = rows.map(r => `
      <tr>
        <td>${r.id}</td>
        <td>${r.status}</td>
        <td>${r.accuracy?.score ?? ''}</td>
        <td>${r.submittedAt?.toISOString?.() || r.submittedAt}</td>
        <td>${typeof r.completionTime === 'number' ? r.completionTime.toFixed(2) : r.completionTime}</td>
        <td>${r.deviceType}</td>
        <td>${r.location}</td>
      </tr>
    `).join('');
    const html = `
      <!doctype html><html><head><meta charset="utf-8">${style}</head>
      <body>
        <h1>Survey Analytics Export</h1>
        <table>
          <thead><tr>${header.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body></html>
    `;
    doc.document.write(html);
    doc.document.close();
    doc.focus();
    doc.print();
  };

  // Fetch analytics data
  const chartConfig = {
    responses: {
      label: "Responses",
      color: "#3B82F6",
    },
    views: {
      label: "Views",
      color: "#10B981",
    },
  };

  // Safe analytics data for UI (use streamed data or fallback to mock)
  const safeData = streamedAnalytics ?
    {
      project: {
        id: projectId,
        created_at: new Date().toISOString(),
        updated_at: streamedAnalytics.lastUpdated,
        title: streamedAnalytics.surveyTitle,
        description: '',
        user_id: user?.id || 'demo-user',
        status: 'published' as const,
      },
      metrics: {
        totalViews: streamedAnalytics.totalResponses,
        totalResponses: streamedAnalytics.totalResponses,
        completionRate: streamedAnalytics.completionRate,
        avgCompletionTime: streamedAnalytics.averageCompletionTime || 0,
        lastResponse: streamedAnalytics.responses[0]?.completed_at ? new Date(streamedAnalytics.responses[0].completed_at) : null,
      },
      accuracyMetrics: {
        overallScore: 85,
        attentionCheckPassRate: 92,
        consistencyScore: 88,
        speedAnomalies: 0,
        patternFlags: 0,
        qualityDistribution: { high: 0, medium: 0, low: 0 },
      },
      timelineData: [],
      responses: streamedAnalytics.responses,
      questionAnalytics: streamedAnalytics.questionsAnalytics,
    }
  : buildMockAnalytics();

  const filteredResponses = useMemo(() => {
    return safeData.responses.filter(response => {
      const matchesSearch = searchQuery === '' || 
        (response.location && response.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
        response.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || response.status === statusFilter;
      
      let matchesAccuracy = true;
      if (accuracyFilter === 'high') {
        matchesAccuracy = response.accuracy?.score >= 80;
      } else if (accuracyFilter === 'medium') {
        matchesAccuracy = response.accuracy?.score >= 50 && response.accuracy?.score < 80;
      } else if (accuracyFilter === 'low') {
        matchesAccuracy = response.accuracy?.score < 50;
      }
      
      return matchesSearch && matchesStatus && matchesAccuracy;
    });
  }, [safeData.responses, searchQuery, statusFilter, accuracyFilter]);

  // Compare period deltas
  const prevTimeline = useMemo(() => {
    // Generate a synthetic previous period series with similar structure
    const data = [] as Array<{ date: string; responses: number; views: number }>;
    for (let i = 60; i >= 31; i--) {
      const date = format(subDays(new Date(), i), 'MMM dd');
      data.push({
        date,
        responses: Math.floor(Math.random() * 20) + 4,
        views: Math.floor(Math.random() * 40) + 8,
      });
    }
    return data;
  }, []);

  const currentTotals = useMemo(() => {
    const t = safeData.timelineData.reduce(
      (acc, d: any) => {
        acc.responses += d.responses || 0;
        acc.views += d.views || 0;
        return acc;
      },
      { responses: 0, views: 0 }
    );
    return t;
  }, [safeData.timelineData]);

  const prevTotals = useMemo(() => {
    const t = prevTimeline.reduce(
      (acc, d: any) => {
        acc.responses += d.responses || 0;
        acc.views += d.views || 0;
        return acc;
      },
      { responses: 0, views: 0 }
    );
    return t;
  }, [prevTimeline]);

  const deltas = useMemo(() => {
    const respDelta = prevTotals.responses ? ((currentTotals.responses - prevTotals.responses) / prevTotals.responses) * 100 : 0;
    const viewDelta = prevTotals.views ? ((currentTotals.views - prevTotals.views) / prevTotals.views) * 100 : 0;
    const completionNow = safeData.metrics.completionRate;
    // Estimate previous completion rate from prev totals
    const completionPrev = prevTotals.views ? (prevTotals.responses / prevTotals.views) * 100 : completionNow;
    const completionDelta = completionPrev ? completionNow - completionPrev : 0;
    return {
      respDelta,
      viewDelta,
      completionDelta,
    };
  }, [currentTotals, prevTotals, safeData.metrics.completionRate]);

  const deviceTypeData = useMemo(() => {
    if (!safeData?.responses?.length) return [];
    const deviceCounts = safeData.responses.reduce((acc: Record<string, number>, response: any) => {
      const deviceType = response.deviceType || 'unknown';
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(deviceCounts).map(([device, count]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      count,
      percentage: (count / safeData.responses.length * 100).toFixed(1)
    }));
  }, [safeData.responses, projectId, user]);

  const handleEdit = () => {
    router.push(`/project/${projectId}`);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/survey/${projectId}`;
    navigator.clipboard.writeText(shareUrl);
    // Could add a toast notification here
  };

  const handleExport = () => {
    console.log('Export analytics data');
  };

  // Show loading state while authenticating or loading data
  if (authLoading || analyticsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  


  return (
    <div className="h-full" style={{ color: 'var(--surbee-fg-primary)' }}>
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-12 h-full">
        {/* Header with Breadcrumb */}
        <div
          className="flex items-center justify-between pb-6 mb-6"
          style={{
            borderBottom: isDarkMode ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <div className="flex items-center gap-4">
            <ProjectBreadcrumb
              projectId={projectId || ''}
              currentSection="analytics"
              onSectionChange={(section) => {
                if (section === 'preview' || section === 'share') {
                  router.push(`/dashboard/projects/${projectId}/manage`);
                } else if (section === 'insights') {
                  router.push(`/dashboard/projects/${projectId}/manage`);
                }
              }}
              isDarkMode={isDarkMode}
            />
            {!analyticsLoading && (
              <span className="inline-flex items-center gap-1.5 ml-4">
                {isConnected ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-500" />
                    <span className="text-xs text-green-600">Live</span>
                  </>
                ) : usePolling ? (
                  <>
                    <RefreshCw className="w-3 h-3 text-blue-500" />
                    <span className="text-xs text-blue-600">Polling</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">Offline</span>
                  </>
                )}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Share */}
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            {/* Export dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => downloadCSV(filteredResponses, 'analytics.csv')}>
                  CSV (Excel)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => openPrintPreview(filteredResponses)}>
                  PDF (Print)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Primary white button on the right */}
            <Button size="sm" onClick={handleEdit} className="bg-white text-black hover:bg-gray-100">
              <Edit className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </div>

        {/* Survey Preview Section - NEW */}
        {(safeData.project as any).preview_image && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Survey Preview</CardTitle>
              <CardDescription>Visual preview of your published survey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border bg-gray-50">
                <img
                  src={(safeData.project as any).preview_image}
                  alt="Survey Preview"
                  className="w-full h-auto max-h-[400px] object-contain"
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/s/${(safeData.project as any).published_url}`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Live Survey
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accuracy Metrics */}
        {/* AI Insights */}
        <div className="mb-6 theme-card border border-theme-primary rounded-xl p-5">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-theme-primary">AI Insights</h2>
              <p className="text-sm text-theme-muted">Quick takeaways and suggested actions based on recent data</p>
            </div>
            <span className="text-xs text-theme-muted">Updated just now</span>
          </div>
          <ul className="grid sm:grid-cols-2 gap-3 list-disc pl-5">
            <li className="text-sm text-theme-primary">
              Peak responses on {safeData.timelineData.length > 0 ? safeData.timelineData.reduce((a,b)=> (b.responses>a.responses?b:a))?.date : 'N/A'} &mdash; consider scheduling sends around this day.
              <span className="block text-xs text-theme-muted">Why this insight: Sending campaigns near historical peaks increases visibility and response likelihood.</span>
            </li>
            <li className="text-sm text-theme-primary">
              Top device: {(deviceTypeData[0]?.device) || 'Desktop'} &mdash; ensure mobile layout remains optimized.
              <span className="block text-xs text-theme-muted">Why this insight: Optimizing for your most common device reduces friction and drop-offs.</span>
            </li>
            <li className="text-sm text-theme-primary">
              Completion rate {safeData.metrics.completionRate.toFixed(1)}% &mdash; aim for &gt; 60% by trimming friction before longest questions.
              <span className="block text-xs text-theme-muted">Why this insight: 60%+ is a healthy benchmark for completion in short surveys.</span>
            </li>
            <li className="text-sm text-theme-primary">
              Overall data quality {safeData.accuracyMetrics.overallScore.toFixed(1)}% &mdash; {safeData.accuracyMetrics.patternFlags>0? 'address pattern flags in options' : 'quality is stable'}.
              <span className="block text-xs text-theme-muted">Why this insight: Pattern flags like straight-lining can bias results and should be mitigated.</span>
            </li>
            <li className="text-sm text-theme-primary">
              Suggestion: shorten any high skip-rate question and move it later in the flow.
              <span className="block text-xs text-theme-muted">Why this insight: Early friction disproportionately reduces overall completion.</span>
            </li>
          </ul>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold mb-1">{safeData.metrics.totalViews.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                {comparePeriod === 'vsPrev30'
                  ? `${deltas.viewDelta >= 0 ? '+' : ''}${deltas.viewDelta.toFixed(1)}% vs prev 30d`
                  : 'Last 30 days'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Responses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold mb-1">{safeData.metrics.totalResponses}</div>
              <div className="text-xs text-muted-foreground">
                {comparePeriod === 'vsPrev30'
                  ? `${deltas.respDelta >= 0 ? '+' : ''}${deltas.respDelta.toFixed(1)}% vs prev 30d`
                  : 'Last 30 days'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold mb-1">{safeData.metrics.completionRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">
                {comparePeriod === 'vsPrev30'
                  ? `Î” ${deltas.completionDelta >= 0 ? '+' : ''}${deltas.completionDelta.toFixed(1)} pts vs prev 30d`
                  : 'Last 30 days'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold mb-1">{safeData.metrics.avgCompletionTime.toFixed(1)}m</div>
              <div className="text-xs text-muted-foreground">Average completion</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center justify-end mb-1 lg:col-span-2">
            <div className="text-xs text-theme-muted mr-2">Range</div>
            <select
              value={comparePeriod}
              onChange={(e) => setComparePeriod(e.target.value as any)}
              className="h-8 px-2 rounded-md border text-xs bg-theme-secondary border-theme-primary text-theme-primary"
            >
              <option value="last30">Last 30 days</option>
              <option value="vsPrev30">Compare previous 30 days</option>
            </select>
          </div>
          {/* Response Timeline */}
          <SmartChart 
            title="Responses Over Time"
            description="Daily responses over the last 30 days"
            data={safeData.timelineData}
            dataType="time-series"
            config={chartConfig}
            dataKey="responses"
            xAxisKey="date"
          />
          {/* Accuracy Trend */}
          <AccuracyTrendChart data={generateAccuracyTrendData()} />
          {/* Device Types full width */}
          <div className="lg:col-span-2">
            <SmartChart 
              title="Device Types"
              description="How users accessed the survey"
              data={deviceTypeData.map(item => ({ name: item.device, value: item.count }))}
              dataType="proportional"
              config={chartConfig}
              dataKey="value"
              xAxisKey="name"
            />
          </div>
          {/* Overlay: Responses vs Views */}
          <div className="lg:col-span-2">
            <div className="theme-card border border-theme-primary rounded-xl">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-[16px] font-medium text-theme-primary">Responses vs Views</div>
                    <div className="text-theme-muted text-sm">Overlay to spot correlation and campaigns impact</div>
                  </div>
                </div>
                <ChartContainer config={chartConfig} className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={safeData.timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
                      <YAxis stroke="#6b7280" fontSize={11} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line type="monotone" dataKey="responses" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="views" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Data Quality Metrics */}
        <div className="mb-6">
          <AccuracyMetricsCard metrics={safeData.accuracyMetrics} />
        </div>

        {/* Geography & Time-of-Day */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <SmartChart
            title="Top Locations"
            description="Where respondents are based"
            data={(() => {
              const map: Record<string, number> = {};
              (safeData.responses || []).forEach((r: any) => {
                const loc = r.location || 'Unknown';
                map[loc] = (map[loc] || 0) + 1;
              });
              return Object.entries(map)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);
            })()}
            dataType="categorical"
            config={{ value: { label: 'Responses' } } as any}
            dataKey="value"
            xAxisKey="name"
          />
          <SmartChart
            title="Responses by Hour"
            description="Engagement throughout the day"
            data={(() => {
              const hours = Array.from({ length: 24 }, (_, h) => ({ name: `${h}:00`, value: 0 }));
              (safeData.responses || []).forEach((r: any) => {
                const d = new Date(r.submittedAt);
                const h = d.getHours();
                hours[h].value += 1;
              });
              return hours;
            })()}
            dataType="categorical"
            config={{ value: { label: 'Responses' } } as any}
            dataKey="value"
            xAxisKey="name"
          />
        </div>

        {/* Skip-rate Hotspots (Heatmap) */}
        <div className="mb-6 theme-card border border-theme-primary rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-[16px] font-medium text-theme-primary">Skip-rate Hotspots</h3>
              <p className="text-sm text-theme-muted">Questions with elevated skip rates and suggested improvements</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {(safeData.questionAnalytics as any[])
              .slice() // copy
              .sort((a: any, b: any) => (b.skipRate || 0) - (a.skipRate || 0))
              .slice(0, 9)
              .map((q: any, idx: number) => {
                const sr = Number(q.skipRate || 0);
                const hue = Math.max(0, 120 - Math.min(100, sr) * 1.2); // 0=red, 120=green
                const suggestion = (() => {
                  if (q.type === 'text') return 'Shorten text, add context, or make optional';
                  if (q.type === 'multiple_choice') return 'Reduce options or group choices logically';
                  if (q.type === 'rating') return 'Clarify scale and allow N/A';
                  if (q.type === 'yes_no') return 'Clarify wording and intent';
                  return 'Simplify wording and placement';
                })();
                return (
                  <div key={q.id || idx} className="rounded-lg p-3 border" style={{ borderColor: 'var(--surbee-border-primary)', background: `linear-gradient(0deg, hsla(${hue},80%,50%,0.12), transparent 80%)` }}>
                    <div className="text-xs text-theme-muted mb-1">Skip rate</div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[14px] font-medium text-theme-primary truncate" title={q.question}>{q.question}</div>
                      <div className="text-[13px] font-semibold" style={{ color: sr >= 30 ? '#ef4444' : sr >= 15 ? '#f59e0b' : '#10b981' }}>{sr.toFixed(1)}%</div>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-theme-muted">Suggestion: {suggestion}</div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => router.push(`/project/${projectId}?focusQuestion=${encodeURIComponent(q.id || '')}`)}
                      >
                        View question
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Question Analytics */}
        <div className="space-y-4 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight mb-1">Question Analytics</h2>
            <p className="text-sm text-muted-foreground">Detailed breakdown of each question</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {safeData.questionAnalytics.map((question) => {
              const chartData = question.options?.map(option => ({
                name: option.label.length > 20 ? option.label.substring(0, 20) + '...' : option.label,
                value: option.count,
                percentage: option.percentage
              })) || [];
              
              let dataType: 'rating' | 'categorical' | 'proportional' = 'categorical';
              if (question.type === 'rating') dataType = 'rating';
              else if (question.type === 'yes_no') dataType = 'proportional';
              else if (question.type === 'multiple_choice') dataType = 'categorical';

              const desc = `${question.responses} responses - ${question.skipRate}% skip rate${question.avgRating ? ` - Avg: ${question.avgRating}/5` : ''}`;
              return (
                <SmartChart
                  key={question.id}
                  title={question.question}
                  description={desc}
                  data={chartData}
                  dataType={dataType}
                  config={{
                    value: { label: 'Responses' },
                    name: { label: 'Option' }
                  }}
                  dataKey="value"
                  xAxisKey="name"
                  className="h-auto"
                />
              );
            })}
          </div>
        </div>

        {/* Individual Responses */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold tracking-tight">Individual Responses</CardTitle>
                <CardDescription>Recent survey submissions</CardDescription>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search responses..."
                    className="h-8 pr-8"
                  />
                  <Search className="w-4 h-4 text-muted-foreground absolute right-2 top-2" />
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="abandoned">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={accuracyFilter} onValueChange={(v) => setAccuracyFilter(v as any)}>
                  <SelectTrigger className="h-8 w-[160px]">
                    <SelectValue placeholder="Accuracy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Accuracy</SelectItem>
                    <SelectItem value="high">High (&gt;80%)</SelectItem>
                    <SelectItem value="medium">Medium (50-80%)</SelectItem>
                    <SelectItem value="low">Low (&lt;50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Response ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Accuracy</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Time Taken</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResponses.slice(0, 20).map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-mono text-muted-foreground">{response.id}</TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        response.status === 'completed' ? 'bg-green-500/20 text-green-600' :
                        response.status === 'partial' ? 'bg-yellow-500/20 text-yellow-700' :
                        'bg-red-500/20 text-red-600'
                      }`}>
                        {response.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                        {response.status === 'partial' && <AlertCircle className="w-3 h-3" />}
                        {response.status === 'abandoned' && <XCircle className="w-3 h-3" />}
                        {response.status.charAt(0).toUpperCase() + response.status.slice(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ResponseQualityBadge accuracy={response.accuracy} compact />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(response.submittedAt, 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {response.completionTime.toFixed(1)}m
                    </TableCell>
                    <TableCell className="capitalize text-muted-foreground">
                      {response.deviceType}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {response.location}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-7 px-2">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {filteredResponses.length > 20 && (
              <div className="text-center py-4">
                <Button variant="ghost" size="sm">
                  Load More ({filteredResponses.length - 20} remaining)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
