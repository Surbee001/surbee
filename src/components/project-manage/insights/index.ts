// Insights Dashboard - Main exports

export { InsightsTab } from './InsightsTab';
export { InsightsHeader } from './InsightsHeader';
export { useInsightsData } from './useInsightsData';

// Shared components
export { MetricCard } from './shared/MetricCard';
export { StatusBadge } from './shared/StatusBadge';
export { QualityBadge } from './shared/QualityBadge';
export { ProgressBar } from './shared/ProgressBar';

// Tab components
export { OverviewTab } from './overview/OverviewTab';
export { ResponsesTab } from './responses/ResponsesTab';
export { FunnelTab } from './funnel/FunnelTab';

// Types
export type {
  InsightsData,
  InsightsStats,
  Response,
  Question,
  QuestionResponse,
  FunnelStep,
  TrendDataPoint,
  QualityDistribution,
  InsightView,
  TimePeriod,
  DeviceType,
  ResponseStatus,
} from './types';
