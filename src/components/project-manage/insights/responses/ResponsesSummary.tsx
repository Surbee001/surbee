"use client";

import React from 'react';
import type { InsightsStats } from '../types';
import styles from '../insights.module.css';

interface ResponsesSummaryProps {
  stats: InsightsStats;
}

export function ResponsesSummary({ stats }: ResponsesSummaryProps) {
  return (
    <div className={styles.summaryStrip}>
      {/* Total Responses */}
      <div className={styles.summaryStripItem}>
        <span className={styles.summaryStripValue}>{stats.total}</span>
        <span className={styles.summaryStripLabel}>Responses</span>
      </div>

      <div className={styles.summaryStripDivider} />

      {/* Completed */}
      <div className={styles.summaryStripItem}>
        <span className={styles.summaryStripValue}>{stats.completed}</span>
        <span className={styles.summaryStripLabel}>Completed</span>
      </div>

      <div className={styles.summaryStripDivider} />

      {/* Flagged */}
      <div className={styles.summaryStripItem}>
        <span className={styles.summaryStripValue} style={{ color: stats.flaggedCount > 0 ? 'var(--insights-danger)' : undefined }}>
          {stats.flaggedCount}
        </span>
        <span className={styles.summaryStripLabel}>Flagged</span>
      </div>

      <div className={styles.summaryStripDivider} />

      {/* Avg Quality */}
      <div className={styles.summaryStripItem}>
        <span className={styles.summaryStripValue}>{stats.avgQuality}%</span>
        <span className={styles.summaryStripLabel}>Avg Quality</span>
      </div>
    </div>
  );
}

export default ResponsesSummary;
