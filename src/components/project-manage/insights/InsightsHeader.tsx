"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import type { InsightView, TimePeriod } from './types';
import styles from './insights.module.css';

interface InsightsHeaderProps {
  activeView: InsightView;
  timePeriod: TimePeriod;
  onViewChange: (view: InsightView) => void;
  onTimePeriodChange: (period: TimePeriod) => void;
}

const views: { key: InsightView; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'responses', label: 'Responses' },
  { key: 'funnel', label: 'Flow' },
];

const periods: { key: TimePeriod; label: string }[] = [
  { key: 'week', label: 'Last Week' },
  { key: 'month', label: 'Last Month' },
  { key: 'quarter', label: 'Last Quarter' },
  { key: 'year', label: 'Last Year' },
];

export function InsightsHeader({
  activeView,
  timePeriod,
  onViewChange,
  onTimePeriodChange,
}: InsightsHeaderProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const viewRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewRef.current && !viewRef.current.contains(event.target as Node)) {
        setIsViewOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPeriodLabel = (key: TimePeriod) =>
    periods.find((p) => p.key === key)?.label || 'Last Month';

  return (
    <header className={styles.analyticsHeader}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <h1 className={styles.analyticsTitle}>Analytics</h1>
        {/* View Selector */}
        <div className={styles.dropdownWrapper} ref={viewRef} style={{ position: 'relative' }}>
          <button className={styles.analyticsDropdown} onClick={() => setIsViewOpen(!isViewOpen)}>
            <span>{views.find((v) => v.key === activeView)?.label}</span>
            <ChevronDown size={14} />
          </button>
          {isViewOpen && (
            <div className={styles.dropdownMenu}>
              {views.map(({ key, label }) => (
                <div
                  key={key}
                  className={styles.dropdownItem}
                  onClick={() => {
                    onViewChange(key);
                    setIsViewOpen(false);
                  }}
                >
                  <span>{label}</span>
                  {activeView === key && <Check size={16} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles.analyticsHeaderRight}>
        <div ref={periodRef} style={{ position: 'relative' }}>
          <button className={styles.analyticsDropdown} onClick={() => setIsPeriodOpen(!isPeriodOpen)}>
            <span>{getPeriodLabel(timePeriod)}</span>
            <ChevronDown size={14} />
          </button>
          {isPeriodOpen && (
            <div className={styles.dropdownMenu} style={{ right: 0, left: 'auto' }}>
              {periods.map(({ key, label }) => (
                <div
                  key={key}
                  className={styles.dropdownItem}
                  onClick={() => {
                    onTimePeriodChange(key);
                    setIsPeriodOpen(false);
                  }}
                >
                  <span>{label}</span>
                  {timePeriod === key && <Check size={16} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default InsightsHeader;
