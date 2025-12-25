"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

export type DatePreset = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

interface DateRange {
  start: Date;
  end: Date;
}

interface DataDateSelectorProps {
  onDateChange: (preset: DatePreset, range: DateRange) => void;
  selectedPreset: DatePreset;
}

const presets: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'week', label: 'Last 7 days' },
  { key: 'month', label: 'Last 30 days' },
  { key: 'quarter', label: 'Last 90 days' },
  { key: 'year', label: 'Last 12 months' },
  { key: 'custom', label: 'Custom range' },
];

export default function DataDateSelector({ onDateChange, selectedPreset }: DataDateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDateRange = (preset: DatePreset): DateRange => {
    const now = new Date();
    const end = new Date(now);
    let start = new Date(now);

    switch (preset) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setDate(start.getDate() - 30);
        break;
      case 'quarter':
        start.setDate(start.getDate() - 90);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'custom':
        if (customRange.from && customRange.to) {
          start = customRange.from;
          end.setTime(customRange.to.getTime());
        }
        break;
    }

    return { start, end };
  };

  const handlePresetClick = (preset: DatePreset) => {
    if (preset === 'custom') {
      setShowCalendar(true);
    } else {
      setShowCalendar(false);
      onDateChange(preset, getDateRange(preset));
      setIsOpen(false);
    }
  };

  const handleCustomApply = () => {
    if (customRange.from && customRange.to) {
      onDateChange('custom', {
        start: customRange.from,
        end: customRange.to,
      });
      setIsOpen(false);
      setShowCalendar(false);
    }
  };

  const getSelectedLabel = () => {
    if (selectedPreset === 'custom' && customRange.from && customRange.to) {
      return `${format(customRange.from, 'MMM d')} - ${format(customRange.to, 'MMM d, yyyy')}`;
    }
    return presets.find(p => p.key === selectedPreset)?.label || 'Last 30 days';
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: 'relative' }}
    >
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px 8px 14px',
          background: 'var(--surbee-bg-primary, #fff)',
          border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
          borderRadius: '9999px',
          color: 'var(--surbee-fg-primary)',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      >
        <span>{getSelectedLabel()}</span>
        <ChevronDown
          size={14}
          style={{
            color: 'var(--surbee-fg-tertiary)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: 'var(--surbee-bg-primary, #fff)',
            border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
            borderRadius: '16px',
            padding: '8px',
            minWidth: showCalendar ? '320px' : '180px',
            zIndex: 100,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          {!showCalendar ? (
            // Preset Options
            presets.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handlePresetClick(key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  color: 'var(--surbee-fg-primary)',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  marginBottom: '2px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surbee-bg-secondary, #f5f5f5)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
              >
                <span>{label}</span>
                {selectedPreset === key && (
                  <Check size={14} style={{ color: 'var(--surbee-fg-tertiary)' }} />
                )}
              </button>
            ))
          ) : (
            // Calendar View
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  marginBottom: '8px',
                  borderBottom: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                }}
              >
                <button
                  onClick={() => setShowCalendar(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '12px',
                    color: 'var(--surbee-fg-tertiary)',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                  }}
                >
                  Back
                </button>
                <span style={{ fontSize: '12px', color: 'var(--surbee-fg-secondary)' }}>
                  Select date range
                </span>
              </div>

              <div style={{ padding: '0 8px' }}>
                <Calendar
                  mode="range"
                  selected={{ from: customRange.from, to: customRange.to }}
                  onSelect={(range) => {
                    if (range) {
                      setCustomRange({ from: range.from, to: range.to });
                    }
                  }}
                  numberOfMonths={1}
                  className="rounded-md"
                />
              </div>

              {/* Selected Range Display */}
              {customRange.from && (
                <div
                  style={{
                    padding: '12px',
                    borderTop: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                    marginTop: '8px',
                  }}
                >
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'var(--surbee-fg-tertiary)',
                      marginBottom: '8px',
                    }}
                  >
                    {customRange.from && customRange.to ? (
                      `${format(customRange.from, 'MMM d, yyyy')} - ${format(customRange.to, 'MMM d, yyyy')}`
                    ) : customRange.from ? (
                      `From ${format(customRange.from, 'MMM d, yyyy')} - Select end date`
                    ) : (
                      'Select start date'
                    )}
                  </div>
                  <button
                    onClick={handleCustomApply}
                    disabled={!customRange.from || !customRange.to}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      background: !customRange.from || !customRange.to
                        ? 'var(--surbee-fg-tertiary)'
                        : 'var(--surbee-fg-primary)',
                      color: 'var(--surbee-bg-primary, #fff)',
                      border: 'none',
                      borderRadius: '9999px',
                      fontSize: '13px',
                      fontWeight: 500,
                      cursor: !customRange.from || !customRange.to ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
