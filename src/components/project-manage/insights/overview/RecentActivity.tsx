"use client";

import React from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { QualityBadge } from '../shared/QualityBadge';
import type { Response, DeviceType } from '../types';
import styles from '../insights.module.css';

interface RecentActivityProps {
  responses: Response[];
  limit?: number;
}

function DeviceIcon({ type }: { type: DeviceType }) {
  const iconProps = { size: 14, strokeWidth: 1.5 };
  switch (type) {
    case 'mobile':
      return <Smartphone {...iconProps} />;
    case 'tablet':
      return <Tablet {...iconProps} />;
    default:
      return <Monitor {...iconProps} />;
  }
}

export function RecentActivity({ responses, limit = 4 }: RecentActivityProps) {
  const recentResponses = responses.slice(0, limit);

  return (
    <div className={cn(styles.metricCard, styles.recentCard)}>
      <div className={styles.cardTitle}>Recent</div>
      <div className={styles.recentList}>
        {recentResponses.length > 0 ? (
          recentResponses.map((response) => (
            <div key={response.id} className={styles.recentItem}>
              <div className={styles.recentAvatar}>
                <DeviceIcon type={response.deviceType} />
              </div>
              <div className={styles.recentInfo}>
                <span className={styles.recentTime}>
                  {formatDistanceToNow(response.submittedAt, { addSuffix: true })}
                </span>
                <span className={styles.recentStatus}>{response.status}</span>
              </div>
              <QualityBadge score={response.qualityScore || 100} variant="compact" />
            </div>
          ))
        ) : (
          <div className={styles.recentEmpty}>No responses yet</div>
        )}
      </div>
    </div>
  );
}

export default RecentActivity;
