"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import type { InsightView, TimePeriod } from './types';
import styles from './insights.module.css';

interface InsightsHeaderProps {
  activeView: InsightView;
  timePeriod: TimePeriod;
  onViewChange: (view: InsightView) => void;
  onTimePeriodChange: (period: TimePeriod) => void;
  customDateRange?: { start: Date; end: Date };
  onCustomDateChange?: (range: { start: Date; end: Date }) => void;
}

const views: { key: InsightView; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'responses', label: 'Responses' },
  { key: 'funnel', label: 'Flow' },
];

const periods: { key: TimePeriod | 'custom'; label: string }[] = [
  { key: 'week', label: 'Last 7 days' },
  { key: 'month', label: 'Last 30 days' },
  { key: 'quarter', label: 'Last 90 days' },
  { key: 'year', label: 'Last year' },
  { key: 'custom', label: 'Custom range' },
];

export function InsightsHeader({
  activeView,
  timePeriod,
  onViewChange,
  onTimePeriodChange,
  customDateRange,
  onCustomDateChange,
}: InsightsHeaderProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState<Date | undefined>(customDateRange?.start);
  const [customEnd, setCustomEnd] = useState<Date | undefined>(customDateRange?.end);
  const [selectingStart, setSelectingStart] = useState(true);

  const viewRef = useRef<HTMLDivElement>(null);
  const periodRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (viewRef.current && !viewRef.current.contains(event.target as Node)) {
        setIsViewOpen(false);
      }
      if (periodRef.current && !periodRef.current.contains(event.target as Node)) {
        setIsPeriodOpen(false);
        setShowCustomPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewLabel = (key: InsightView) => views.find((v) => v.key === key)?.label || 'Overview';
  const getPeriodLabel = (key: TimePeriod) => {
    if (customDateRange && timePeriod === 'month') {
      // If we have custom dates, show them
      return `${format(customDateRange.start, 'MMM d')} - ${format(customDateRange.end, 'MMM d')}`;
    }
    return periods.find((p) => p.key === key)?.label || 'Last 30 days';
  };

  const handlePeriodSelect = (key: TimePeriod | 'custom') => {
    if (key === 'custom') {
      setShowCustomPicker(true);
      setSelectingStart(true);
    } else {
      onTimePeriodChange(key);
      setIsPeriodOpen(false);
      setShowCustomPicker(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (selectingStart) {
      setCustomStart(date);
      setCustomEnd(undefined);
      setSelectingStart(false);
    } else {
      // Ensure end is after start
      if (customStart && date < customStart) {
        setCustomStart(date);
        setCustomEnd(customStart);
      } else {
        setCustomEnd(date);
      }
    }
  };

  const handleApplyCustomRange = () => {
    if (customStart && customEnd && onCustomDateChange) {
      onCustomDateChange({
        start: customStart,
        end: customEnd,
      });
    }
    setIsPeriodOpen(false);
    setShowCustomPicker(false);
  };

  return (
    <header className={styles.insightsHeader}>
      {/* View Selector - Pill Style (Left) */}
      <div className={styles.dropdownWrapper} ref={viewRef}>
        <button
          className={styles.dropdownTrigger}
          onClick={() => setIsViewOpen(!isViewOpen)}
        >
          <span>{getViewLabel(activeView)}</span>
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

      {/* Time Period Selector - Pill Style (Right) */}
      <div className={styles.insightsHeaderRight}>
        <Popover open={isPeriodOpen} onOpenChange={setIsPeriodOpen}>
          <PopoverTrigger asChild>
            <button
              className={styles.dropdownTrigger}
              onClick={() => setIsPeriodOpen(!isPeriodOpen)}
            >
              <CalendarIcon size={14} />
              <span>{getPeriodLabel(timePeriod)}</span>
              <ChevronDown size={14} />
            </button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="end"
            style={{
              backgroundColor: 'var(--surbee-sidebar-bg)',
              borderColor: 'var(--surbee-sidebar-border)',
              borderRadius: '12px',
            }}
          >
            {!showCustomPicker ? (
              <div className="p-2">
                {periods.map(({ key, label }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer hover:bg-[var(--surbee-bg-card-hover)] text-sm"
                    style={{ color: 'var(--surbee-fg-primary)' }}
                    onClick={() => handlePeriodSelect(key)}
                  >
                    <span>{label}</span>
                    {key !== 'custom' && timePeriod === key && <Check size={16} className="text-[var(--insights-info)]" />}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3">
                <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
                  <span className={cn(
                    "px-2 py-1 rounded",
                    selectingStart ? "bg-[var(--insights-info)] text-white" : "bg-[var(--surbee-bg-card)]"
                  )}>
                    {customStart ? format(customStart, 'MMM d, yyyy') : 'Start date'}
                  </span>
                  <span>→</span>
                  <span className={cn(
                    "px-2 py-1 rounded",
                    !selectingStart ? "bg-[var(--insights-info)] text-white" : "bg-[var(--surbee-bg-card)]"
                  )}>
                    {customEnd ? format(customEnd, 'MMM d, yyyy') : 'End date'}
                  </span>
                </div>
                <Calendar
                  mode="single"
                  selected={selectingStart ? customStart : customEnd}
                  onSelect={handleDateSelect}
                  captionLayout="dropdown"
                  className="rounded-md"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--surbee-sidebar-border)] hover:bg-[var(--surbee-bg-card-hover)]"
                    style={{ color: 'var(--surbee-fg-muted)' }}
                    onClick={() => {
                      setShowCustomPicker(false);
                      setSelectingStart(true);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-[var(--insights-info)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleApplyCustomRange}
                    disabled={!customStart || !customEnd}
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

export default InsightsHeader;
