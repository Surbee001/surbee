"use client";

import React from 'react';
import { Sparkles } from 'lucide-react';
import { StatsCards } from './StatsCards';
import { ResponseTrendChart } from './ResponseTrendChart';
import { DeviceBreakdown } from './DeviceBreakdown';
import { QualityDistributionChart } from './QualityDistributionChart';
import { GlobeVisualization } from './GlobeVisualization';
import { ResponseHeatmap } from './ResponseHeatmap';
import { QuestionPerformance } from './QuestionPerformance';
import { FunnelVisualization } from '../funnel/FunnelVisualization';
import type { InsightsData, TimePeriod } from '../types';
import styles from '../insights.module.css';

interface OverviewTabProps {
  data: InsightsData;
  timePeriod: TimePeriod;
}

function AnalysisCard({ stats, funnelData }: { stats: InsightsData['stats']; funnelData: InsightsData['funnelData'] }) {
  // Find the biggest drop-off question
  const biggestDropoff = funnelData.reduce((max, step, idx) => {
    if (idx === 0) return max;
    return step.dropOff > (max?.dropOff || 0) ? step : max;
  }, null as typeof funnelData[0] | null);

  return (
    <div className={styles.analysisCard}>
      <div className={styles.analysisHeader}>
        <Sparkles size={16} style={{ color: 'var(--insights-info)' }} />
        <span className={styles.analysisTitle}>Personalized Analysis</span>
      </div>

      <p className={styles.analysisSummary}>
        {stats.total > 0 ? (
          <>
            Your survey has collected <strong>{stats.total}</strong> responses with a{' '}
            <strong>{stats.completionRate}%</strong> completion rate.
            {biggestDropoff && biggestDropoff.dropOff > 10 && (
              <> Question {biggestDropoff.questionNumber} shows the highest drop-off at <strong>{biggestDropoff.dropOff}%</strong>.</>
            )}
            {stats.flaggedCount > 0 && (
              <> Cipher detected <strong>{stats.flaggedCount}</strong> potentially low-quality responses.</>
            )}
          </>
        ) : (
          'No responses yet. Share your survey to start collecting data.'
        )}
      </p>

      <div className={styles.analysisStats}>
        <div className={styles.analysisStat}>
          <span className={styles.analysisStatLabel}>Response rate</span>
          <span className={styles.analysisStatValue}>{stats.completionRate}%</span>
        </div>
        <div className={styles.analysisStat}>
          <span className={styles.analysisStatLabel}>Avg. time</span>
          <span className={styles.analysisStatValue}>{(stats.avgTime / 60).toFixed(1)} min</span>
        </div>
        <div className={styles.analysisStat}>
          <span className={styles.analysisStatLabel}>Quality score</span>
          <span className={styles.analysisStatValue}>{stats.avgQuality}</span>
        </div>
      </div>
    </div>
  );
}

export function OverviewTab({ data, timePeriod }: OverviewTabProps) {
  const { stats, trendData, qualityDistribution, funnelData, geoData, heatmapData, questionStats } = data;

  return (
    <div className={styles.dashboardContainer}>
      {/* Top Row: Chart + Analysis */}
      <div className={styles.topRow}>
        <ResponseTrendChart data={trendData} timePeriod={timePeriod} />
        <AnalysisCard stats={stats} funnelData={funnelData} />
      </div>

      {/* Funnel Analysis Card */}
      <FunnelVisualization funnelData={funnelData} stats={stats} />

      {/* Metrics Row */}
      <div className={styles.metricsRow}>
        <StatsCards stats={stats} />
      </div>

      {/* Secondary Row: Devices + Quality */}
      <div className={styles.secondaryRow}>
        <DeviceBreakdown devices={stats.devices} total={stats.total} />
        <QualityDistributionChart distribution={qualityDistribution} total={stats.total} />
      </div>

      {/* TODO: Re-enable when ready */}
      {/* Tertiary Row: Geographic + Heatmap */}
      {/* <div className={styles.secondaryRow}>
        <GlobeVisualization geoData={geoData} total={stats.total} />
        <ResponseHeatmap heatmapData={heatmapData} />
      </div> */}

      {/* Question Performance */}
      {/* <QuestionPerformance questionStats={questionStats} /> */}
    </div>
  );
}

export default OverviewTab;
