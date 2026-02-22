"use client";

import React from 'react';
import type { BrowserData } from '../types';
import styles from '../insights.module.css';

interface BrowsersCardProps {
  browsers: BrowserData[];
  total: number;
}

export function BrowsersCard({ browsers, total }: BrowsersCardProps) {
  return (
    <div className={styles.browsersCard}>
      <div className={styles.analyticsCardTitle}>Browsers</div>
      <div className={styles.browsersList}>
        {browsers.map((browser) => {
          const pct = total > 0 ? ((browser.count / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={browser.name} className={styles.browsersItem}>
              <span className={styles.browsersDot} style={{ backgroundColor: browser.color }} />
              <span className={styles.browsersName}>{browser.name}</span>
              <span className={styles.browsersCount}>{browser.count.toLocaleString()}</span>
              <span className={styles.browsersPercent}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default BrowsersCard;
