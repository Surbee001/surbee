"use client";

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import type { TrendDataPoint, TimePeriod } from '../types';
import styles from '../insights.module.css';

interface ResponseTrendChartProps {
  data: TrendDataPoint[];
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

const periodLabels: Record<TimePeriod, string> = {
  week: 'Last Week',
  month: 'Last Month',
  quarter: 'Last Quarter',
  year: 'Last Year',
};

export function ResponseTrendChart({ data, timePeriod, onTimePeriodChange }: ResponseTrendChartProps) {
  const [mode, setMode] = useState<'aggregate' | 'individual'>('aggregate');
  const total = data.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className={styles.responseChartCard}>
      <div className={styles.responseChartHeader}>
        <div className={styles.responseChartTitleGroup}>
          <span className={styles.responseChartLabel}>Total Responses</span>
          <span className={styles.responseChartValue}>{total.toLocaleString()}</span>
        </div>
        <div className={styles.responseChartControls}>
          <div className={styles.chartToggleGroup}>
            <button
              className={`${styles.chartToggleBtn} ${mode === 'aggregate' ? styles.chartToggleBtnActive : ''}`}
              onClick={() => setMode('aggregate')}
            >
              Aggregate
            </button>
            <button
              className={`${styles.chartToggleBtn} ${mode === 'individual' ? styles.chartToggleBtnActive : ''}`}
              onClick={() => setMode('individual')}
            >
              Individual
            </button>
          </div>
          <button className={styles.analyticsDropdown}>
            {periodLabels[timePeriod]}
          </button>
          <button className={styles.analyticsExportBtn}>
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className={styles.responseChartContainer}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="responseAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3ECC8C" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3ECC8C" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              horizontal={true}
              vertical={false}
              stroke="#212521"
              strokeDasharray=""
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#808080', fontSize: 11, fontFamily: '-apple-system, sans-serif' }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#808080', fontSize: 11, fontFamily: '-apple-system, sans-serif' }}
              width={40}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                background: '#1a1f1a',
                border: '1px solid #212521',
                borderRadius: 8,
                fontSize: 12,
                padding: '10px 14px',
                color: '#fff',
              }}
              formatter={(value: number) => [`${value.toLocaleString()} responses`, '']}
              labelFormatter={(label) => label}
              cursor={{ stroke: '#3ECC8C', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3ECC8C"
              strokeWidth={2}
              fill="url(#responseAreaGradient)"
              dot={false}
              activeDot={{
                r: 4,
                fill: '#3ECC8C',
                stroke: '#141714',
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
