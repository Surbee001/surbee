"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import styles from '../insights.module.css';

interface ProgressBarProps {
  value: number; // 0-100
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  variant = 'default',
  size = 'sm',
  showLabel = false,
  animated = true,
  className,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn(styles.progressWrapper, className)}>
      <div
        className={cn(
          styles.progressTrack,
          size === 'sm' && styles.progressSm,
          size === 'md' && styles.progressMd,
          size === 'lg' && styles.progressLg
        )}
      >
        <div
          className={cn(
            styles.progressFill,
            styles[`progress${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
            animated && styles.progressAnimated
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className={styles.progressLabel}>{Math.round(clampedValue)}%</span>
      )}
    </div>
  );
}

export default ProgressBar;
