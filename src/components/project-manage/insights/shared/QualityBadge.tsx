"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import styles from '../insights.module.css';

type QualityLevel = 'excellent' | 'good' | 'poor';

interface QualityBadgeProps {
  score: number;
  variant?: 'badge' | 'indicator' | 'compact';
  showScore?: boolean;
  className?: string;
}

function getQualityLevel(score: number): QualityLevel {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  return 'poor';
}

const qualityLabels: Record<QualityLevel, string> = {
  excellent: 'Excellent',
  good: 'Good',
  poor: 'Needs Review',
};

export function QualityBadge({
  score,
  variant = 'badge',
  showScore = true,
  className,
}: QualityBadgeProps) {
  const level = getQualityLevel(score);

  if (variant === 'indicator') {
    return (
      <div className={cn(styles.qualityIndicator, className)}>
        <span className={cn(styles.qualityDot, styles[`quality${level.charAt(0).toUpperCase() + level.slice(1)}`])} />
        <span className={styles.qualityLabel}>{qualityLabels[level]}</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <span
        className={cn(
          styles.qualityCompact,
          styles[`qualityCompact${level.charAt(0).toUpperCase() + level.slice(1)}`],
          className
        )}
      >
        {score}
      </span>
    );
  }

  // badge variant
  return (
    <span
      className={cn(
        styles.qualityBadge,
        styles[`qualityBadge${level.charAt(0).toUpperCase() + level.slice(1)}`],
        className
      )}
    >
      {showScore && <span className={styles.qualityScore}>{score}</span>}
      <span className={styles.qualityText}>{qualityLabels[level]}</span>
    </span>
  );
}

export default QualityBadge;
