// Insights Dashboard Types

export type DeviceType = 'desktop' | 'mobile' | 'tablet';
export type ResponseStatus = 'completed' | 'partial' | 'abandoned';
export type IssueSeverity = 'low' | 'medium' | 'high';
export type IssueType = 'spam' | 'copy-paste' | 'too-quick' | 'pattern';
export type TimePeriod = 'week' | 'month' | 'quarter' | 'year';
export type InsightView = 'overview' | 'responses' | 'funnel';

export interface QuestionIssue {
  type: IssueType;
  description: string;
  severity: IssueSeverity;
}

export interface QuestionResponse {
  questionId: string;
  questionText: string;
  answer: string;
  accuracyScore: number;
  timeTaken: number;
  issues?: QuestionIssue[];
}

export interface Response {
  id: string;
  submittedAt: Date;
  completionTime: number; // in seconds
  deviceType: DeviceType;
  status: ResponseStatus;
  responses: QuestionResponse[];
  qualityScore?: number;
  fraudScore?: number;
  isFlagged?: boolean;
  flagReasons?: string[];
}

export interface Question {
  question_id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  required?: boolean;
  order_index?: number;
}

export interface FunnelStep {
  questionNumber: number;
  questionId: string;
  questionText: string;
  started: number;
  completed: number;
  retention: number;
  dropOff: number;
  avgTime?: number;
}

export interface DeviceStats {
  desktop: number;
  mobile: number;
  tablet: number;
}

export interface InsightsStats {
  total: number;
  completed: number;
  partial: number;
  abandoned: number;
  completionRate: number;
  avgTime: number; // in seconds
  avgQuality: number;
  devices: DeviceStats;
  weekChange: number;
  thisWeek: number;
  flaggedCount: number;
}

export interface TrendDataPoint {
  day: string;
  count: number;
  date: string;
}

export interface QualityDistribution {
  excellent: number; // 80-100
  good: number; // 60-79
  poor: number; // 0-59
}

// Geographic data for globe visualization
export interface GeoLocation {
  country: string;
  countryCode: string;
  city?: string;
  lat: number;
  lng: number;
  count: number;
}

// Heatmap data - responses by hour and day
export interface HeatmapCell {
  day: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  count: number;
}

// Question performance stats
export interface QuestionStats {
  questionId: string;
  questionText: string;
  avgScore: number;
  avgTime: number;
  responseCount: number;
  dropoffRate: number;
}

export interface InsightsData {
  responses: Response[];
  questions: Question[];
  stats: InsightsStats;
  trendData: TrendDataPoint[];
  funnelData: FunnelStep[];
  qualityDistribution: QualityDistribution;
  geoData: GeoLocation[];
  heatmapData: HeatmapCell[];
  questionStats: QuestionStats[];
  loading: boolean;
  error: Error | null;
}
