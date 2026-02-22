"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { DeviceStats } from '../types';
import styles from '../insights.module.css';

interface DeviceBreakdownProps {
  devices: DeviceStats;
  total: number;
}

const deviceConfig = [
  { key: 'desktop' as const, label: 'Desktop', color: '#3ECC8C' },
  { key: 'laptop' as const, label: 'Laptop', color: '#0BA5EC' },
  { key: 'mobile' as const, label: 'Mobile', color: '#F79009' },
  { key: 'tablet' as const, label: 'Tablet', color: '#667085' },
];

export function DeviceBreakdown({ devices, total }: DeviceBreakdownProps) {
  const chartData = deviceConfig
    .map(({ key, label, color }) => ({
      name: label,
      value: devices[key] || 0,
      color,
    }))
    .filter((d) => d.value > 0);

  return (
    <div className={styles.devicesCard}>
      <div className={styles.analyticsCardTitle}>Devices</div>
      <div className={styles.devicesLayout}>
        <div className={styles.devicesDonutWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="90%"
                strokeWidth={0}
                paddingAngle={2}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.devicesLegend}>
          {deviceConfig.map(({ key, label, color }) => {
            const count = devices[key] || 0;
            if (count === 0) return null;
            const pct = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
            return (
              <div key={key} className={styles.devicesLegendItem}>
                <span className={styles.devicesLegendDot} style={{ backgroundColor: color }} />
                <span className={styles.devicesLegendName}>{label}</span>
                <span className={styles.devicesLegendCount}>{count.toLocaleString()}</span>
                <span className={styles.devicesLegendPercent}>{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DeviceBreakdown;
