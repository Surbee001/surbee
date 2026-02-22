"use client";

import React from 'react';
import { ResponseTrendChart } from './ResponseTrendChart';
import { GlobeVisualization } from './GlobeVisualization';
import { DeviceBreakdown } from './DeviceBreakdown';
import { SourcesCard } from './SourcesCard';
import { BrowsersCard } from './BrowsersCard';
import type { InsightsData, TimePeriod } from '../types';
import styles from '../insights.module.css';

interface OverviewTabProps {
  data: InsightsData;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

export function OverviewTab({ data, timePeriod, onTimePeriodChange }: OverviewTabProps) {
  const { stats, trendData, geoData, sourceData, browserData } = data;

  return (
    <div className={styles.dashboardContainer}>
      {/* Total Responses Chart - Full Width */}
      <ResponseTrendChart
        data={trendData}
        timePeriod={timePeriod}
        onTimePeriodChange={onTimePeriodChange}
      />

      {/* Two-Column Grid: Demographics (left) | Sources + Devices + Browsers (right) */}
      <div className={styles.analyticsGrid}>
        <div className={styles.analyticsGridLeft}>
          <GlobeVisualization geoData={geoData} total={stats.total} />
        </div>
        <div className={styles.analyticsGridRight}>
          <SourcesCard sources={sourceData} total={stats.total} />
          <DeviceBreakdown devices={stats.devices} total={stats.total} />
          <BrowsersCard browsers={browserData} total={stats.total} />
        </div>
      </div>
    </div>
  );
}

export default OverviewTab;
