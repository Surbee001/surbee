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
  Eye
} from 'lucide-react';
import { format, subDays, subHours } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/database';

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
  
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial' | 'abandoned'>('all');
  const [accuracyFilter, setAccuracyFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || !projectId) return;
      
      try {
        const response = await fetch(`/api/projects/${projectId}/analytics?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data.analytics);
        } else {
          console.error('Failed to fetch analytics');
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && !authLoading && projectId) {
      fetchAnalytics();
    }
  }, [user, authLoading, projectId]);

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


  const filteredResponses = useMemo(() => {
    if (!analyticsData) return [];
    
    return analyticsData.responses.filter(response => {
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
  }, [analyticsData?.responses, searchQuery, statusFilter, accuracyFilter]);

  const deviceTypeData = useMemo(() => {
    if (!analyticsData?.responses?.length) return [];
    
    const deviceCounts = analyticsData.responses.reduce((acc, response) => {
      const deviceType = response.deviceType || 'unknown';
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(deviceCounts).map(([device, count]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      count,
      percentage: (count / analyticsData.responses.length * 100).toFixed(1)
    }));
  }, [analyticsData?.responses]);

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
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-400"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  // Show error state if no data
  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Project not found</h1>
          <p className="text-gray-600">The project you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/dashboard/projects')} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }


  return (
    <div className="h-full" style={{ color: 'var(--surbee-fg-primary)' }}>
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-12 h-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">{analyticsData.project.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Continue Editing
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Accuracy Metrics */}
        <div className="mb-6">
          <AccuracyMetricsCard metrics={analyticsData.accuracyMetrics} />
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
              <div className="text-2xl font-semibold mb-1">{analyticsData.metrics.totalViews.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">+12% from last week</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Responses</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold mb-1">{analyticsData.metrics.totalResponses}</div>
              <div className="text-xs text-muted-foreground">+8% from last week</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold mb-1">{analyticsData.metrics.completionRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">-2% from last week</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Time</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold mb-1">{analyticsData.metrics.avgCompletionTime.toFixed(1)}m</div>
              <div className="text-xs text-muted-foreground">Average completion</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {/* Accuracy Trend Chart */}
          <AccuracyTrendChart data={generateAccuracyTrendData()} />
          <SmartChart 
            title="Response Timeline"
            description="Daily responses over the last 30 days"
            data={analyticsData.timelineData}
            dataType="time-series"
            config={chartConfig}
            dataKey="responses"
            xAxisKey="date"
          />

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

        {/* Question Analytics */}
        <div className="space-y-4 mb-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold tracking-tight mb-1">Question Analytics</h2>
            <p className="text-sm text-muted-foreground">Detailed breakdown of each question</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {analyticsData.questionAnalytics.map((question) => {
              const chartData = question.options?.map(option => ({
                name: option.label.length > 20 ? option.label.substring(0, 20) + '...' : option.label,
                value: option.count,
                percentage: option.percentage
              })) || [];
              
              let dataType: 'rating' | 'categorical' | 'proportional' = 'categorical';
              if (question.type === 'rating') dataType = 'rating';
              else if (question.type === 'yes_no') dataType = 'proportional';
              else if (question.type === 'multiple_choice') dataType = 'categorical';

              return (
                <SmartChart
                  key={question.id}
                  title={question.question}
                  description={`${question.responses} responses • ${question.skipRate}% skip rate${question.avgRating ? ` • Avg: ${question.avgRating}/5` : ''}`}
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