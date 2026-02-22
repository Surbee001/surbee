"use client";

import React from 'react';
import { ResponsesSummary } from './ResponsesSummary';
import { ResponseTable } from './ResponseTable';
import type { InsightsData } from '../types';
import styles from '../insights.module.css';

interface ResponsesTabProps {
  data: InsightsData;
  onExport?: () => void;
}

export function ResponsesTab({ data, onExport }: ResponsesTabProps) {
  const { stats, responses } = data;

  return (
    <div className={styles.dashboardContainer}>
      {/* Summary Strip */}
      <ResponsesSummary stats={stats} />

      {/* Response Table with integrated export */}
      <ResponseTable responses={responses} pageSize={15} onExport={onExport} />
    </div>
  );
}

export default ResponsesTab;
