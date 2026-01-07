"use client";

import React from 'react';
import { MetricCard } from '../shared/MetricCard';
import type { InsightsStats } from '../types';

interface StatsCardsProps {
  stats: InsightsStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <>
      {/* Total Responses */}
      <MetricCard
        value={stats.total}
        label="Responses"
        trend={
          stats.weekChange !== 0
            ? {
                value: Math.abs(stats.weekChange),
                direction: stats.weekChange >= 0 ? 'up' : 'down',
              }
            : undefined
        }
      />

      {/* Completion Rate */}
      <MetricCard
        value={stats.completionRate}
        label="Completion"
        unit="%"
        progress={stats.completionRate}
      />

      {/* Average Time */}
      <MetricCard
        value={(stats.avgTime / 60).toFixed(1)}
        label="Avg. Time"
        unit="min"
      />

      {/* Quality Score */}
      <MetricCard
        value={stats.avgQuality}
        label="Quality"
        progress={stats.avgQuality}
      />
    </>
  );
}

export default StatsCards;
