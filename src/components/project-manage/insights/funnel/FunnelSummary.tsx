"use client";

import React from 'react';
import type { InsightsStats } from '../types';
import styles from '../insights.module.css';

interface FunnelSummaryProps {
  stats: InsightsStats;
  questionsCount: number;
}

export function FunnelSummary({ stats, questionsCount }: FunnelSummaryProps) {
  return (
    <div className={styles.summaryStrip}>
      <div className={styles.summaryStripItem}>
        <span className={styles.summaryStripValue}>{questionsCount}</span>
        <span className={styles.summaryStripLabel}>Questions</span>
      </div>

      <div className={styles.summaryStripDivider} />

      <div className={styles.summaryStripItem}>
        <span className={styles.summaryStripValue}>{stats.total}</span>
        <span className={styles.summaryStripLabel}>Started</span>
      </div>

      <div className={styles.summaryStripDivider} />

      <div className={styles.summaryStripItem}>
        <span className={styles.summaryStripValue}>{stats.completed}</span>
        <span className={styles.summaryStripLabel}>Completed</span>
      </div>

      <div className={styles.summaryStripDivider} />

      <div className={styles.summaryStripItem}>
        <span className={styles.summaryStripValue}>{stats.completionRate}%</span>
        <span className={styles.summaryStripLabel}>Completion</span>
      </div>
    </div>
  );
}

export default FunnelSummary;
