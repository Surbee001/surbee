"use client";

import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import type { HeatmapCell } from '../types';
import styles from '../insights.module.css';

interface ResponseHeatmapProps {
  heatmapData: HeatmapCell[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export function ResponseHeatmap({ heatmapData }: ResponseHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const maxCount = Math.max(...heatmapData.map(c => c.count), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return 0;
    // Scale from 0.15 to 1 for non-zero values
    return 0.15 + (count / maxCount) * 0.85;
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12am';
    if (hour === 12) return '12pm';
    if (hour < 12) return `${hour}am`;
    return `${hour - 12}pm`;
  };

  // Find peak times
  const sortedCells = [...heatmapData].sort((a, b) => b.count - a.count);
  const peakTime = sortedCells[0];
  const totalResponses = heatmapData.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className={styles.heatmapCard}>
      <div className={styles.cardTitle}>
        <Clock size={16} style={{ color: 'var(--insights-purple)' }} />
        Response Activity
      </div>

      {/* Peak time summary */}
      {peakTime && peakTime.count > 0 && (
        <div className={styles.heatmapPeak}>
          Peak time: <strong>{DAYS[peakTime.day]} {formatHour(peakTime.hour)}</strong>
          <span className={styles.heatmapPeakCount}>{peakTime.count} responses</span>
        </div>
      )}

      {/* Heatmap grid */}
      <div className={styles.heatmapContainer}>
        {/* Hour labels - show every 4 hours */}
        <div className={styles.heatmapHourLabels}>
          <div className={styles.heatmapCorner}></div>
          {HOURS.filter(h => h % 4 === 0).map(hour => (
            <div key={hour} className={styles.heatmapHourLabel} style={{ left: `${(hour / 24) * 100}%` }}>
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.heatmapGrid}>
          {DAYS.map((day, dayIdx) => (
            <div key={day} className={styles.heatmapRow}>
              <div className={styles.heatmapDayLabel}>{day}</div>
              <div className={styles.heatmapCells}>
                {HOURS.map(hour => {
                  const cell = heatmapData.find(c => c.day === dayIdx && c.hour === hour);
                  const count = cell?.count || 0;
                  const intensity = getIntensity(count);

                  return (
                    <div
                      key={hour}
                      className={styles.heatmapCell}
                      style={{
                        backgroundColor: count > 0
                          ? `rgba(168, 85, 247, ${intensity})`
                          : 'var(--insights-bg-card-hover)',
                      }}
                      onMouseEnter={() => setHoveredCell(cell || { day: dayIdx, hour, count: 0 })}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredCell && (
        <div className={styles.heatmapTooltip}>
          <span className={styles.heatmapTooltipTime}>
            {DAYS[hoveredCell.day]} {formatHour(hoveredCell.hour)}
          </span>
          <span className={styles.heatmapTooltipCount}>
            {hoveredCell.count} response{hoveredCell.count !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Legend */}
      <div className={styles.heatmapLegend}>
        <span className={styles.heatmapLegendLabel}>Less</span>
        <div className={styles.heatmapLegendScale}>
          {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => (
            <div
              key={idx}
              className={styles.heatmapLegendCell}
              style={{
                backgroundColor: intensity === 0
                  ? 'var(--insights-bg-card-hover)'
                  : `rgba(168, 85, 247, ${0.15 + intensity * 0.85})`,
              }}
            />
          ))}
        </div>
        <span className={styles.heatmapLegendLabel}>More</span>
      </div>
    </div>
  );
}

export default ResponseHeatmap;
