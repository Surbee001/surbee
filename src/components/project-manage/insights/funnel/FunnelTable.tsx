"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FunnelStep } from '../types';
import styles from '../insights.module.css';

interface FunnelTableProps {
  funnelData: FunnelStep[];
}

export function FunnelTable({ funnelData }: FunnelTableProps) {
  if (funnelData.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.tableEmpty}>
          <div className={styles.emptyCircle} />
          <span>No questions found</span>
        </div>
      </div>
    );
  }

  const gridColumns = '50px 1fr 90px 90px 90px';

  return (
    <div className={styles.tableWrapper}>
      {/* Header */}
      <div className={styles.tableHeader} style={{ gridTemplateColumns: gridColumns }}>
        <span>#</span>
        <span>Question</span>
        <span>Responses</span>
        <span>Retention</span>
        <span>Drop-off</span>
      </div>

      {/* Rows */}
      {funnelData.map((step, idx) => {
        const isHighDropoff = step.dropOff > 10 && idx > 0;

        return (
          <div
            key={step.questionId}
            className={cn(styles.tableRow, isHighDropoff && styles.tableRowWarning)}
            style={{ gridTemplateColumns: gridColumns }}
          >
            {/* Question Number with warning indicator */}
            <span
              style={{
                fontFamily: 'var(--insights-font-mono)',
                fontSize: 12,
                color: isHighDropoff ? 'var(--insights-warning)' : 'var(--insights-fg-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {isHighDropoff && <AlertTriangle size={12} />}
              {String(step.questionNumber).padStart(2, '0')}
            </span>

            {/* Question Text */}
            <span style={{
              fontSize: 13,
              lineHeight: 1.5,
              color: 'var(--insights-fg-secondary)',
              display: 'flex',
              alignItems: 'center',
            }}>
              {step.questionText.length > 60 ? `${step.questionText.slice(0, 60)}...` : step.questionText}
            </span>

            {/* Responses Count */}
            <span
              style={{
                fontFamily: 'var(--insights-font-mono)',
                fontSize: 13,
                color: 'var(--insights-fg-secondary)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {step.completed}
            </span>

            {/* Retention */}
            <span
              style={{
                fontFamily: 'var(--insights-font-mono)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--insights-fg-primary)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {step.retention}%
            </span>

            {/* Drop-off */}
            <span
              className={cn(styles.funnelDropoff, isHighDropoff && styles.funnelDropoffDanger)}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {idx === 0 ? '—' : `-${step.dropOff}%`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default FunnelTable;
