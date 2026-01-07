"use client";

import React from 'react';
import { Eye, Users } from 'lucide-react';
import styles from './share.module.css';

interface StatsStripProps {
  isLive: boolean;
  views: number;
  responses: number;
}

export function StatsStrip({ isLive, views, responses }: StatsStripProps) {
  return (
    <div className={styles.statsStrip}>
      <div className={styles.statCard}>
        <div className={`${styles.statIndicator} ${!isLive ? styles.statIndicatorInactive : ''}`} />
        <div className={styles.statValue}>{isLive ? 'Live' : 'Paused'}</div>
        <div className={styles.statLabel}>{isLive ? 'Accepting responses' : 'Not accepting responses'}</div>
      </div>

      <div className={styles.statCard}>
        <Eye size={18} className={styles.statIcon} />
        <div className={styles.statValue}>{views > 0 ? views.toLocaleString() : '--'}</div>
        <div className={styles.statLabel}>Views</div>
      </div>

      <div className={styles.statCard}>
        <Users size={18} className={styles.statIcon} />
        <div className={styles.statValue}>{responses > 0 ? responses.toLocaleString() : '--'}</div>
        <div className={styles.statLabel}>Responses</div>
      </div>
    </div>
  );
}

export default StatsStrip;
