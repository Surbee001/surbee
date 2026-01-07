"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import styles from '../insights.module.css';

interface MetricCardProps {
  value: string | number;
  label: string;
  unit?: string;
  progress?: number; // 0-100
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  variant?: 'default' | 'large' | 'compact';
  className?: string;
  children?: React.ReactNode;
}

export function MetricCard({
  value,
  label,
  unit,
  progress,
  trend,
  variant = 'default',
  className,
  children,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        styles.metricCard,
        variant === 'large' && styles.metricCardLarge,
        variant === 'compact' && styles.metricCardCompact,
        className
      )}
    >
      <div className={styles.metricContent}>
        <div className={styles.metricValue}>
          <span className={styles.metricNumber}>{value}</span>
          {unit && <span className={styles.metricUnit}>{unit}</span>}
        </div>

        <div className={styles.metricLabel}>{label}</div>

        {trend && (
          <div
            className={cn(
              styles.metricTrend,
              trend.direction === 'up' ? styles.trendUp : styles.trendDown
            )}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              className={trend.direction === 'down' ? styles.trendIconDown : ''}
            >
              <path
                d="M6 2.5V9.5M6 2.5L3 5.5M6 2.5L9 5.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{trend.direction === 'up' ? '+' : ''}{trend.value}%</span>
          </div>
        )}
      </div>

      {progress !== undefined && (
        <div className={styles.metricProgress}>
          <div
            className={styles.metricProgressFill}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

      {children}
    </div>
  );
}

export default MetricCard;
