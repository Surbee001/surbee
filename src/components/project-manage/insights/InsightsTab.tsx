"use client";

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarRadiusAxis,
  Label,
} from 'recharts';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { useInsightsData } from './useInsightsData';
import type { TimePeriod } from './types';

interface InsightsTabProps {
  projectId: string;
}

const periodLabels: Record<TimePeriod, string> = {
  week: '7D',
  month: '30D',
  quarter: '90D',
  year: '1Y',
};

const deviceChartConfig = {
  desktop: { label: 'Desktop', color: '#4955FF' },
  laptop: { label: 'Laptop', color: '#49C3FF' },
  mobile: { label: 'Mobile', color: '#49FFD5' },
  tablet: { label: 'Tablet', color: '#FFCB49' },
} satisfies ChartConfig;


export function InsightsTab({ projectId }: InsightsTabProps) {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const data = useInsightsData(projectId, { timePeriod });

  const total = data.trendData.reduce((sum, point) => sum + point.count, 0);

  // Device data
  const { devices } = data.stats;
  const DEVICE_COLORS = {
    desktop: '#4955FF',
    laptop: '#49C3FF',
    mobile: '#49FFD5',
    tablet: '#FFCB49',
  };
  const deviceEntries = [
    { key: 'desktop', label: 'Monitor', count: devices.desktop, color: DEVICE_COLORS.desktop },
    { key: 'laptop', label: 'Laptop', count: devices.laptop, color: DEVICE_COLORS.laptop },
    { key: 'mobile', label: 'Mobile', count: devices.mobile, color: DEVICE_COLORS.mobile },
    { key: 'tablet', label: 'Tablet', count: devices.tablet, color: DEVICE_COLORS.tablet },
  ];
  const deviceTotal = deviceEntries.reduce((s, d) => s + d.count, 0);

  // AI Insights — derived from response data
  const { completionRate, avgTime, avgQuality, flaggedCount } = data.stats;
  const avgMinutes = Math.floor(avgTime / 60);
  const avgSeconds = Math.round(avgTime % 60);
  const aiInsights = [
    {
      title: 'Completion rate is strong',
      description: `${completionRate}% of respondents complete the full survey. This is ${completionRate >= 70 ? 'above' : 'below'} the industry average of 70%.`,
      type: 'positive' as const,
    },
    {
      title: `Average time: ${avgMinutes}m ${avgSeconds}s`,
      description: avgTime > 180
        ? 'Respondents are spending over 3 minutes. Consider shortening the survey to reduce abandonment.'
        : 'Time-to-complete is healthy. Respondents are engaged without rushing.',
      type: (avgTime > 180 ? 'warning' : 'positive') as const,
    },
    {
      title: `${flaggedCount} flagged response${flaggedCount !== 1 ? 's' : ''}`,
      description: flaggedCount > 0
        ? `Cipher ML detected ${flaggedCount} suspicious submissions. Review them in the Responses tab.`
        : 'No suspicious activity detected. All responses appear genuine.',
      type: (flaggedCount > 0 ? 'warning' : 'positive') as const,
    },
    {
      title: 'Mobile vs Desktop split',
      description: `${devices.mobile} mobile and ${devices.desktop + devices.laptop} desktop responses. ${
        devices.mobile > devices.desktop + devices.laptop
          ? 'Most users are on mobile — ensure your survey is mobile-optimized.'
          : 'Desktop dominates. Consider promoting mobile-friendly links.'
      }`,
      type: 'info' as const,
    },
    {
      title: `Quality score: ${avgQuality}%`,
      description: avgQuality >= 80
        ? 'Response quality is excellent. Respondents are providing thoughtful answers.'
        : avgQuality >= 60
        ? 'Response quality is good but could improve. Consider adding attention checks.'
        : 'Response quality is low. Add validation or attention-check questions.',
      type: (avgQuality >= 80 ? 'positive' : avgQuality >= 60 ? 'info' : 'warning') as const,
    },
  ];

  if (data.loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#E8E8E8',
            animation: 'spin 0.8s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* ── Chart Card (full width) ── */}
      <div
        style={{
          boxSizing: 'border-box',
          background: '#141714',
          border: '1px solid #212521',
          boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
          borderRadius: 12,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 24,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span
                style={{
                  fontSize: 13,
                  color: '#808080',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                Total Responses
              </span>
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {total.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 2,
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: 8,
                padding: 2,
              }}
            >
              {(Object.keys(periodLabels) as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  style={{
                    padding: '6px 14px',
                    background: timePeriod === period ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 500,
                    color: timePeriod === period ? '#FFFFFF' : '#808080',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                >
                  {periodLabels[period]}
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="insightsAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E8E8E8" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#E8E8E8" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid horizontal={true} vertical={false} stroke="#212521" />
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
                  width={36}
                  allowDecimals={false}
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1E1E1F',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    fontSize: 12,
                    padding: '10px 14px',
                    color: '#E8E8E8',
                    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} responses`, '']}
                  labelFormatter={(label) => label}
                  cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#E8E8E8"
                  strokeWidth={1.5}
                  fill="url(#insightsAreaGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#E8E8E8', stroke: '#141714', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
      </div>

      {/* Second row — Devices (1) + AI Insights (2) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16 }}>
        {/* ── Devices Card (left) ── */}
        <div
          style={{
            boxSizing: 'border-box',
            background: '#141714',
            border: '1px solid #212521',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: 12,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', gap: 10 }}>
            {/* CPU Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
              <path d="M15 2v2M9 2v2M15 20v2M9 20v2M2 15h2M2 9h2M20 15h2M20 9h2" />
            </svg>
            <span
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: '#FFFFFF',
                fontFamily: 'var(--font-geist, -apple-system, sans-serif)',
                flex: 1,
              }}
            >
              Devices
            </span>
            {/* Last Month dropdown */}
            <button
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                gap: 8,
                border: '1px solid #353B35',
                borderRadius: 7,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 510,
                  color: '#FFFFFF',
                  fontFamily: 'var(--font-geist, -apple-system, sans-serif)',
                  lineHeight: '20px',
                }}
              >
                Last Month
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
            {/* Export button */}
            <button
              style={{
                boxSizing: 'border-box',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 6,
                width: 28,
                height: 28,
                border: '1px solid #353B35',
                borderRadius: 7,
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </button>
          </div>

          {/* Separator */}
          <div style={{ height: 1, background: '#272B27' }} />

          {/* Radial half-donut chart */}
          <div style={{ padding: '4px 12px 0', display: 'flex', justifyContent: 'center' }}>
            <ChartContainer
              config={deviceChartConfig}
              className="w-full"
              style={{ maxWidth: 300, height: 165 }}
            >
              <RadialBarChart
                data={[{
                  desktop: devices.desktop,
                  laptop: devices.laptop,
                  mobile: devices.mobile,
                  tablet: devices.tablet,
                }]}
                endAngle={180}
                innerRadius={90}
                outerRadius={140}
                cy="70%"
              >
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 16}
                              style={{ fill: '#FFFFFF', fontSize: 28, fontWeight: 600 }}
                            >
                              {deviceTotal.toLocaleString()}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 4}
                              style={{ fill: '#808080', fontSize: 14, fontWeight: 500 }}
                            >
                              Clicks
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </PolarRadiusAxis>
                <RadialBar
                  dataKey="desktop"
                  stackId="a"
                  cornerRadius={8}
                  fill="var(--color-desktop)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="laptop"
                  stackId="a"
                  cornerRadius={8}
                  fill="var(--color-laptop)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="mobile"
                  stackId="a"
                  cornerRadius={8}
                  fill="var(--color-mobile)"
                  className="stroke-transparent stroke-2"
                />
                <RadialBar
                  dataKey="tablet"
                  stackId="a"
                  cornerRadius={8}
                  fill="var(--color-tablet)"
                  className="stroke-transparent stroke-2"
                />
              </RadialBarChart>
            </ChartContainer>
          </div>

          {/* Device legend rows */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: '8px 24px 24px',
            }}
          >
            {deviceEntries.map((device) => {
              const pct = deviceTotal > 0 ? ((device.count / deviceTotal) * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={device.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {/* Left: dot + icon + label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: device.color,
                        flexShrink: 0,
                      }}
                    />
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#808080" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      {device.key === 'desktop' && (
                        <>
                          <rect x="3" y="3" width="18" height="13" rx="2" />
                          <path d="M8 21h8M12 16v5" />
                        </>
                      )}
                      {device.key === 'laptop' && (
                        <>
                          <rect x="4" y="4" width="16" height="11" rx="2" />
                          <path d="M2 18h20" />
                        </>
                      )}
                      {device.key === 'mobile' && (
                        <>
                          <rect x="6" y="2" width="12" height="20" rx="2" />
                          <path d="M12 18h.01" />
                        </>
                      )}
                      {device.key === 'tablet' && (
                        <>
                          <rect x="5" y="2" width="14" height="20" rx="2" />
                          <path d="M12 18h.01" />
                        </>
                      )}
                    </svg>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-geist, -apple-system, sans-serif)',
                        lineHeight: '20px',
                      }}
                    >
                      {device.label}
                    </span>
                  </div>

                  {/* Right: count | percentage */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-geist, -apple-system, sans-serif)',
                        lineHeight: '20px',
                      }}
                    >
                      {device.count}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#272B27', lineHeight: '20px' }}>
                      |
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-geist, -apple-system, sans-serif)',
                        lineHeight: '20px',
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── AI Insights Card (2 cols) ── */}
        <div
          style={{
            boxSizing: 'border-box',
            background: '#141714',
            border: '1px solid #212521',
            boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
            borderRadius: 12,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 24px', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span
              style={{
                fontSize: 18,
                fontWeight: 500,
                color: '#FFFFFF',
                fontFamily: 'var(--font-geist, -apple-system, sans-serif)',
                flex: 1,
              }}
            >
              AI Insights
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#808080',
                fontFamily: 'var(--font-geist, -apple-system, sans-serif)',
                padding: '4px 10px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 6,
              }}
            >
              Powered by Surbee AI
            </span>
          </div>

          <div style={{ height: 1, background: '#272B27' }} />

          {/* Insights table rows */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {aiInsights.map((insight, i) => (
              <div key={i}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '16px 24px',
                  }}
                >
                  {/* Status indicator */}
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      marginTop: 5,
                      flexShrink: 0,
                      background:
                        insight.type === 'positive' ? '#49FFD5'
                        : insight.type === 'warning' ? '#FFCB49'
                        : '#49C3FF',
                    }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-geist, -apple-system, sans-serif)',
                        lineHeight: '20px',
                      }}
                    >
                      {insight.title}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 400,
                        color: '#808080',
                        fontFamily: 'var(--font-geist, -apple-system, sans-serif)',
                        lineHeight: '18px',
                      }}
                    >
                      {insight.description}
                    </span>
                  </div>
                </div>
                {i < aiInsights.length - 1 && (
                  <div style={{ height: 1, background: '#272B27', margin: '0 24px' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default InsightsTab;
