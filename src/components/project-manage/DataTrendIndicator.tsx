"use client";

import React from 'react';

interface TrendData {
  label: string;
  currentValue: number;
  previousValue: number;
  suffix?: string;
  invertTrend?: boolean; // true if lower is better (e.g., drop-off rate)
}

interface DataTrendIndicatorProps {
  trends: TrendData[];
  periodLabel: string;
}

export default function DataTrendIndicator({ trends, periodLabel }: DataTrendIndicatorProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
        borderRadius: '6px',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <span
          style={{
            fontSize: '13px',
            color: 'var(--surbee-fg-tertiary)',
          }}
        >
          Trends
        </span>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--surbee-fg-tertiary)',
            padding: '4px 10px',
            backgroundColor: 'var(--surbee-bg-primary, #fff)',
            borderRadius: '4px',
          }}
        >
          vs {periodLabel}
        </span>
      </div>

      {/* Trend Items */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        {trends.map((trend, index) => {
          const change = calculateChange(trend.currentValue, trend.previousValue);
          const isPositive = trend.invertTrend ? change < 0 : change > 0;
          const isNegative = trend.invertTrend ? change > 0 : change < 0;
          const isNeutral = change === 0;

          return (
            <div
              key={index}
              style={{
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                borderRadius: '6px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  color: 'var(--surbee-fg-tertiary)',
                }}
              >
                {trend.label}
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '24px',
                    fontWeight: 500,
                    color: 'var(--surbee-fg-primary)',
                  }}
                >
                  {trend.currentValue}
                  {trend.suffix && (
                    <span style={{ fontSize: '14px', fontWeight: 400 }}>{trend.suffix}</span>
                  )}
                </span>

                {/* Change Indicator */}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '12px',
                    fontWeight: 500,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: isPositive
                      ? 'rgba(34, 197, 94, 0.1)'
                      : isNegative
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(156, 163, 175, 0.1)',
                    color: isPositive
                      ? '#22c55e'
                      : isNegative
                        ? '#ef4444'
                        : 'var(--surbee-fg-tertiary)',
                  }}
                >
                  {/* Arrow */}
                  {!isNeutral && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: change > 0 ? 'rotate(-45deg)' : 'rotate(45deg)',
                      }}
                    >
                      <path d="M5 12h14M12 5l7 7" />
                    </svg>
                  )}
                  {isNeutral ? '0%' : `${change > 0 ? '+' : ''}${change}%`}
                </span>
              </div>

              {/* Mini comparison bar */}
              <div
                style={{
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center',
                  marginTop: '4px',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: '4px',
                    backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  {/* Previous period bar */}
                  <div
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: `${Math.min((trend.previousValue / Math.max(trend.currentValue, trend.previousValue)) * 100, 100)}%`,
                      backgroundColor: 'var(--surbee-fg-tertiary)',
                      borderRadius: '2px',
                      opacity: 0.3,
                    }}
                  />
                  {/* Current period bar */}
                  <div
                    style={{
                      position: 'absolute',
                      height: '100%',
                      width: `${Math.min((trend.currentValue / Math.max(trend.currentValue, trend.previousValue)) * 100, 100)}%`,
                      backgroundColor: 'var(--surbee-fg-primary)',
                      borderRadius: '2px',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--surbee-fg-tertiary)',
                    minWidth: '40px',
                    textAlign: 'right',
                  }}
                >
                  was {trend.previousValue}{trend.suffix || ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
