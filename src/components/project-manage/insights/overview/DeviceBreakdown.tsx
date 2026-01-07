"use client";

import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import type { DeviceStats } from '../types';
import styles from '../insights.module.css';

interface DeviceBreakdownProps {
  devices: DeviceStats;
  total: number;
}

const deviceConfig = [
  { key: 'desktop' as const, label: 'Desktop', icon: Monitor },
  { key: 'mobile' as const, label: 'Mobile', icon: Smartphone },
  { key: 'tablet' as const, label: 'Tablet', icon: Tablet },
];

export function DeviceBreakdown({ devices, total }: DeviceBreakdownProps) {
  return (
    <div className={styles.deviceCard}>
      <div className={styles.cardTitle}>Devices</div>
      <div className={styles.deviceList}>
        {deviceConfig.map(({ key, label, icon: Icon }) => {
          const count = devices[key] || 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={key} className={styles.deviceItem}>
              <span className={styles.deviceIcon}>
                <Icon size={16} strokeWidth={1.5} />
              </span>
              <span className={styles.deviceName}>{label}</span>
              <div className={styles.deviceBar}>
                <div
                  className={styles.deviceBarFill}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className={styles.devicePercent}>{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DeviceBreakdown;
