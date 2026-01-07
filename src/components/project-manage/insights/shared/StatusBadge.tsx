"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import styles from '../insights.module.css';

type Status = 'completed' | 'partial' | 'abandoned';

interface StatusBadgeProps {
  status: Status;
  variant?: 'dot' | 'badge' | 'pill';
  showLabel?: boolean;
  className?: string;
}

const statusLabels: Record<Status, string> = {
  completed: 'Completed',
  partial: 'Partial',
  abandoned: 'Abandoned',
};

export function StatusBadge({
  status,
  variant = 'dot',
  showLabel = false,
  className,
}: StatusBadgeProps) {
  if (variant === 'dot') {
    return (
      <div className={cn(styles.statusDotWrapper, className)}>
        <span className={cn(styles.statusDot, styles[`status${status.charAt(0).toUpperCase() + status.slice(1)}`])} />
        {showLabel && <span className={styles.statusLabel}>{statusLabels[status]}</span>}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={cn(
          styles.statusBadge,
          styles[`statusBadge${status.charAt(0).toUpperCase() + status.slice(1)}`],
          className
        )}
      >
        {statusLabels[status]}
      </span>
    );
  }

  // pill variant
  return (
    <span
      className={cn(
        styles.statusPill,
        styles[`statusPill${status.charAt(0).toUpperCase() + status.slice(1)}`],
        className
      )}
    >
      <span className={styles.statusPillDot} />
      {statusLabels[status]}
    </span>
  );
}

export default StatusBadge;
