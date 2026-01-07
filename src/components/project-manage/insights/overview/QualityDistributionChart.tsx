"use client";

import React from 'react';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { QualityDistribution } from '../types';
import styles from '../insights.module.css';

interface QualityDistributionChartProps {
  distribution: QualityDistribution;
  total: number;
}

const qualityConfig = [
  { key: 'excellent' as const, label: '80-100', barClass: 'qualityBarExcellent', desc: 'Excellent quality' },
  { key: 'good' as const, label: '60-79', barClass: 'qualityBarGood', desc: 'Good quality' },
  { key: 'poor' as const, label: '<60', barClass: 'qualityBarPoor', desc: 'Needs review' },
];

export function QualityDistributionChart({
  distribution,
  total,
}: QualityDistributionChartProps) {
  return (
    <div className={styles.qualityCard}>
      <div className={styles.cardTitle}>
        Quality Distribution
        <Tooltip>
          <TooltipTrigger asChild>
            <Info
              size={14}
              style={{ color: 'var(--insights-fg-subtle)', cursor: 'help' }}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[240px]">
            Quality scores are calculated by Cipher based on response patterns, timing, and consistency. Higher scores indicate more thoughtful responses.
          </TooltipContent>
        </Tooltip>
      </div>
      <div className={styles.qualityList}>
        {qualityConfig.map(({ key, label, barClass }) => {
          const count = distribution[key];
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={key} className={styles.qualityItem}>
              <span className={styles.qualityLabel}>{label}</span>
              <div className={styles.qualityBar}>
                <div
                  className={styles[barClass as keyof typeof styles]}
                  style={{ width: `${pct}%`, height: '100%', borderRadius: 2 }}
                />
              </div>
              <span className={styles.qualityCount}>{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default QualityDistributionChart;
