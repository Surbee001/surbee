"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { TrendDataPoint, TimePeriod } from '../types';
import styles from '../insights.module.css';

interface ResponseTrendChartProps {
  data: TrendDataPoint[];
  timePeriod: TimePeriod;
}

const periodLabels: Record<TimePeriod, string> = {
  week: 'Last 7 days',
  month: 'Last 30 days',
  quarter: 'Last 90 days',
  year: 'Last year',
};

export function ResponseTrendChart({ data, timePeriod }: ResponseTrendChartProps) {
  // Calculate total from chart data
  const total = data.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className={styles.chartCard}>
      <div className={styles.chartHeader}>
        <span className={styles.chartTitle}>Response Activity</span>
        <div className={styles.chartControls}>
          <span style={{
            fontFamily: 'var(--insights-font-mono)',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--insights-fg-primary)',
            marginRight: 12,
          }}>
            {total.toLocaleString()} total
          </span>
          <span style={{
            fontSize: 12,
            color: 'var(--insights-fg-muted)',
          }}>
            {periodLabels[timePeriod]}
          </span>
        </div>
      </div>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--insights-fg-primary)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="var(--insights-fg-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--insights-fg-muted)', fontSize: 11, fontFamily: 'var(--insights-font-mono)' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--insights-fg-subtle)', fontSize: 10, fontFamily: 'var(--insights-font-mono)' }}
              width={40}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--insights-bg-card)',
                border: '1px solid var(--insights-border)',
                borderRadius: 4,
                fontSize: 12,
                padding: '10px 14px',
                fontFamily: 'var(--insights-font-mono)',
              }}
              formatter={(value: number) => [`${value.toLocaleString()} responses`, '']}
              labelFormatter={(label) => label}
              cursor={{ stroke: 'var(--insights-fg-muted)', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--insights-fg-primary)"
              strokeWidth={2}
              fill="url(#areaFill)"
              dot={false}
              activeDot={{
                r: 4,
                fill: 'var(--insights-fg-primary)',
                stroke: 'var(--insights-bg-card)',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ResponseTrendChart;
