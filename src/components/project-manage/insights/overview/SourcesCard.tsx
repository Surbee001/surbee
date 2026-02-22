"use client";

import React from 'react';
import type { SourceData } from '../types';
import styles from '../insights.module.css';

interface SourcesCardProps {
  sources: SourceData[];
  total: number;
}

export function SourcesCard({ sources, total }: SourcesCardProps) {
  return (
    <div className={styles.sourcesCard}>
      <div className={styles.analyticsCardTitle}>Sources</div>
      <div className={styles.sourcesList}>
        {sources.map((source) => {
          const pct = total > 0 ? ((source.count / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={source.name} className={styles.sourcesItem}>
              <span className={styles.sourcesDot} style={{ backgroundColor: source.color }} />
              <span className={styles.sourcesName}>{source.name}</span>
              <span className={styles.sourcesCount}>{source.count.toLocaleString()}</span>
              <span className={styles.sourcesPercent}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SourcesCard;
