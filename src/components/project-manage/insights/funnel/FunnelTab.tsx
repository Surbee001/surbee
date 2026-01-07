"use client";

import React from 'react';
import { FunnelSummary } from './FunnelSummary';
import { FunnelVisualization } from './FunnelVisualization';
import { FunnelTable } from './FunnelTable';
import type { InsightsData } from '../types';
import styles from '../insights.module.css';

interface FunnelTabProps {
  data: InsightsData;
}

export function FunnelTab({ data }: FunnelTabProps) {
  const { stats, funnelData, questions } = data;

  return (
    <div className={styles.dashboardContainer}>
      {/* Summary Strip */}
      <FunnelSummary stats={stats} questionsCount={questions.length} />

      {/* Visual Funnel */}
      <FunnelVisualization funnelData={funnelData} stats={stats} />

      {/* Detail Table */}
      <FunnelTable funnelData={funnelData} />
    </div>
  );
}

export default FunnelTab;
