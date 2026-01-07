"use client";

import React, { useState } from 'react';
import { InsightsHeader } from './InsightsHeader';
import { OverviewTab } from './overview/OverviewTab';
import { ResponsesTab } from './responses/ResponsesTab';
import { FunnelTab } from './funnel/FunnelTab';
import { useInsightsData } from './useInsightsData';
import type { InsightView, TimePeriod } from './types';
import styles from './insights.module.css';

interface InsightsTabProps {
  projectId: string;
}

export function InsightsTab({ projectId }: InsightsTabProps) {
  const [activeView, setActiveView] = useState<InsightView>('overview');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');

  const data = useInsightsData(projectId, { timePeriod });

  const handleExport = () => {
    // Export responses as CSV
    if (data.responses.length === 0) return;

    const headers = ['ID', 'Submitted', 'Device', 'Duration (min)', 'Status', 'Quality'];
    const rows = data.responses.map((r) => [
      r.id.slice(0, 8),
      r.submittedAt.toISOString(),
      r.deviceType,
      (r.completionTime / 60).toFixed(2),
      r.status,
      r.qualityScore || 100,
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `responses-${projectId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (data.loading) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.loader} />
      </div>
    );
  }

  return (
    <div className={styles.insightsRoot}>
      <InsightsHeader
        activeView={activeView}
        timePeriod={timePeriod}
        onViewChange={setActiveView}
        onTimePeriodChange={setTimePeriod}
      />

      {activeView === 'overview' && <OverviewTab data={data} timePeriod={timePeriod} />}

      {activeView === 'responses' && <ResponsesTab data={data} onExport={handleExport} />}

      {activeView === 'funnel' && <FunnelTab data={data} />}
    </div>
  );
}

export default InsightsTab;
