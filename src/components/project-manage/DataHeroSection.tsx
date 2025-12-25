"use client";

import React, { useState } from 'react';

interface DataHeroSectionProps {
  projectId?: string;
}

type ChartType = 'bar' | 'line' | 'area' | 'donut';

const chartData = [65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50, 88];
const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DataHeroSection({ projectId }: DataHeroSectionProps) {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(9);

  const maxValue = Math.max(...chartData);

  // Generate SVG path for line/area charts
  const generatePath = (filled: boolean = false) => {
    const width = 100;
    const height = 100;
    const padding = 5;
    const points = chartData.map((value, index) => {
      const x = padding + (index / (chartData.length - 1)) * (width - padding * 2);
      const y = height - padding - (value / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    });

    if (filled) {
      const firstX = padding;
      const lastX = padding + ((chartData.length - 1) / (chartData.length - 1)) * (width - padding * 2);
      return `M${firstX},${height - padding} L${points.join(' L')} L${lastX},${height - padding} Z`;
    }
    return `M${points.join(' L')}`;
  };

  // Donut chart segments
  const generateDonutSegments = () => {
    const total = chartData.reduce((a, b) => a + b, 0);
    let currentAngle = -90;
    const segments = [];
    const colors = [
      'var(--surbee-accent, #3b82f6)',
      '#60a5fa',
      '#93c5fd',
      '#bfdbfe',
      '#dbeafe',
      '#eff6ff',
      '#f0f9ff',
      '#e0f2fe',
      '#bae6fd',
      '#7dd3fc',
      '#38bdf8',
      '#0ea5e9',
    ];

    chartData.forEach((value, index) => {
      const percentage = (value / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + percentage;

      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      const x1 = 50 + 35 * Math.cos(startRad);
      const y1 = 50 + 35 * Math.sin(startRad);
      const x2 = 50 + 35 * Math.cos(endRad);
      const y2 = 50 + 35 * Math.sin(endRad);

      const largeArc = percentage > 180 ? 1 : 0;

      segments.push({
        path: `M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArc} 1 ${x2} ${y2} Z`,
        color: colors[index % colors.length],
        index,
        value,
        percentage: ((value / total) * 100).toFixed(1),
      });

      currentAngle = endAngle;
    });

    return segments;
  };

  const chartIcons: Record<ChartType, React.ReactNode> = {
    bar: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="12" width="4" height="9" rx="1" />
        <rect x="10" y="6" width="4" height="15" rx="1" />
        <rect x="17" y="9" width="4" height="12" rx="1" />
      </svg>
    ),
    line: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 18L9 12L13 16L21 6" />
      </svg>
    ),
    area: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 18L9 12L13 16L21 6V18H3Z" fill="currentColor" opacity="0.2" />
        <path d="M3 18L9 12L13 16L21 6" />
      </svg>
    ),
    donut: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  };

  return (
    <section
      style={{
        width: '100%',
        paddingLeft: '40px',
        paddingRight: '40px',
        paddingTop: 'clamp(35px, 1.66667cqw + 28px, 55px)',
        paddingBottom: 'clamp(70px, 5.5cqw + 46.9px, 100px)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '44px 40px',
          maxWidth: '1400px',
          marginLeft: 'auto',
          marginRight: 'auto',
          alignItems: 'flex-start',
        }}
      >
        {/* Left Side - Graph Area */}
        <aside>
          <figure
            style={{
              margin: 0,
              borderRadius: '6px',
              overflow: 'hidden',
              aspectRatio: '623 / 500',
              maxWidth: '623px',
              position: 'relative',
              width: '100%',
              backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {/* Graph Header with Chart Type Switcher */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: 'var(--surbee-fg-primary)',
                }}>
                  Response Trends
                </span>

                {/* Chart Type Switcher */}
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  backgroundColor: 'var(--surbee-bg-tertiary, #e5e5e5)',
                  borderRadius: '8px',
                  padding: '4px',
                }}>
                  {(Object.keys(chartIcons) as ChartType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setChartType(type)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: chartType === type
                          ? 'var(--surbee-bg-primary, #fff)'
                          : 'transparent',
                        color: chartType === type
                          ? 'var(--surbee-accent, #3b82f6)'
                          : 'var(--surbee-fg-tertiary)',
                        transition: 'all 0.2s ease',
                        boxShadow: chartType === type
                          ? '0 1px 3px rgba(0,0,0,0.1)'
                          : 'none',
                      }}
                      title={type.charAt(0).toUpperCase() + type.slice(1)}
                    >
                      {chartIcons[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Area */}
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'flex-end',
                position: 'relative',
              }}>
                {chartType === 'bar' && (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '8px',
                    paddingTop: '20px',
                  }}>
                    {chartData.map((height, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedIndex(i)}
                        onMouseEnter={() => setHoveredIndex(i)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        style={{
                          flex: 1,
                          height: `${height}%`,
                          backgroundColor: selectedIndex === i
                            ? 'var(--surbee-accent, #3b82f6)'
                            : hoveredIndex === i
                              ? 'var(--surbee-fg-tertiary, #999)'
                              : 'var(--surbee-bg-tertiary, #e5e5e5)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer',
                          position: 'relative',
                          transform: hoveredIndex === i ? 'scaleY(1.02)' : 'scaleY(1)',
                          transformOrigin: 'bottom',
                        }}
                      >
                        {(hoveredIndex === i || selectedIndex === i) && (
                          <div style={{
                            position: 'absolute',
                            top: '-30px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            backgroundColor: 'var(--surbee-fg-primary, #222)',
                            color: 'var(--surbee-bg-primary, #fff)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            zIndex: 10,
                          }}>
                            {labels[i]}: {height}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {chartType === 'line' && (
                  <svg
                    viewBox="0 0 100 100"
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'visible',
                    }}
                    preserveAspectRatio="none"
                  >
                    <path
                      d={generatePath()}
                      fill="none"
                      stroke="var(--surbee-accent, #3b82f6)"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    {chartData.map((value, index) => {
                      const x = 5 + (index / (chartData.length - 1)) * 90;
                      const y = 95 - (value / maxValue) * 90;
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r={hoveredIndex === index || selectedIndex === index ? 4 : 2.5}
                          fill={selectedIndex === index
                            ? 'var(--surbee-accent, #3b82f6)'
                            : 'var(--surbee-bg-primary, #fff)'}
                          stroke="var(--surbee-accent, #3b82f6)"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => setSelectedIndex(index)}
                        />
                      );
                    })}
                  </svg>
                )}

                {chartType === 'area' && (
                  <svg
                    viewBox="0 0 100 100"
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'visible',
                    }}
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--surbee-accent, #3b82f6)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="var(--surbee-accent, #3b82f6)" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                    <path
                      d={generatePath(true)}
                      fill="url(#areaGradient)"
                      style={{ transition: 'all 0.3s ease' }}
                    />
                    <path
                      d={generatePath()}
                      fill="none"
                      stroke="var(--surbee-accent, #3b82f6)"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                    {chartData.map((value, index) => {
                      const x = 5 + (index / (chartData.length - 1)) * 90;
                      const y = 95 - (value / maxValue) * 90;
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r={hoveredIndex === index || selectedIndex === index ? 4 : 2.5}
                          fill={selectedIndex === index
                            ? 'var(--surbee-accent, #3b82f6)'
                            : 'var(--surbee-bg-primary, #fff)'}
                          stroke="var(--surbee-accent, #3b82f6)"
                          strokeWidth="2"
                          vectorEffect="non-scaling-stroke"
                          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => setSelectedIndex(index)}
                        />
                      );
                    })}
                  </svg>
                )}

                {chartType === 'donut' && (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg
                      viewBox="0 0 100 100"
                      style={{
                        width: '80%',
                        height: '80%',
                        overflow: 'visible',
                      }}
                    >
                      {generateDonutSegments().map((segment) => (
                        <path
                          key={segment.index}
                          d={segment.path}
                          fill={segment.color}
                          stroke="var(--surbee-bg-secondary, #f5f5f5)"
                          strokeWidth="1"
                          style={{
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            transform: hoveredIndex === segment.index || selectedIndex === segment.index
                              ? 'scale(1.05)'
                              : 'scale(1)',
                            transformOrigin: 'center',
                            opacity: selectedIndex === segment.index ? 1 : hoveredIndex === segment.index ? 0.9 : 0.8,
                          }}
                          onMouseEnter={() => setHoveredIndex(segment.index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          onClick={() => setSelectedIndex(segment.index)}
                        />
                      ))}
                      {/* Center hole */}
                      <circle
                        cx="50"
                        cy="50"
                        r="20"
                        fill="var(--surbee-bg-secondary, #f5f5f5)"
                      />
                      {/* Center text */}
                      <text
                        x="50"
                        y="48"
                        textAnchor="middle"
                        style={{
                          fontSize: '8px',
                          fontWeight: 600,
                          fill: 'var(--surbee-fg-primary)',
                        }}
                      >
                        {selectedIndex !== null ? chartData[selectedIndex] : ''}
                      </text>
                      <text
                        x="50"
                        y="56"
                        textAnchor="middle"
                        style={{
                          fontSize: '5px',
                          fill: 'var(--surbee-fg-tertiary)',
                        }}
                      >
                        {selectedIndex !== null ? labels[selectedIndex] : ''}
                      </text>
                    </svg>
                  </div>
                )}

                {/* Tooltip for line/area charts */}
                {(chartType === 'line' || chartType === 'area') && hoveredIndex !== null && (
                  <div style={{
                    position: 'absolute',
                    top: `${100 - (chartData[hoveredIndex] / maxValue) * 90 - 15}%`,
                    left: `${5 + (hoveredIndex / (chartData.length - 1)) * 90}%`,
                    transform: 'translateX(-50%)',
                    backgroundColor: 'var(--surbee-fg-primary, #222)',
                    color: 'var(--surbee-bg-primary, #fff)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}>
                    {labels[hoveredIndex]}: {chartData[hoveredIndex]}
                  </div>
                )}
              </div>

              {/* X-axis labels */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '8px',
              }}>
                {chartType === 'donut' ? (
                  <span style={{
                    fontSize: '12px',
                    color: 'var(--surbee-fg-tertiary)',
                    width: '100%',
                    textAlign: 'center',
                  }}>
                    {selectedIndex !== null
                      ? `${labels[selectedIndex]}: ${chartData[selectedIndex]} responses`
                      : 'Click a segment to view details'}
                  </span>
                ) : (
                  <>
                    <span style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)' }}>Jan</span>
                    <span style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)' }}>Jun</span>
                    <span style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)' }}>Dec</span>
                  </>
                )}
              </div>
            </div>
          </figure>
        </aside>

        {/* Right Side - Content */}
        <aside
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'max(20px, min(2.4px + 4vw, 60px))',
            width: '100%',
            alignItems: 'flex-start',
          }}
        >
          {/* Heading */}
          <h2
            style={{
              margin: 0,
              padding: 0,
              textWrap: 'balance',
              color: 'var(--surbee-fg-primary)',
              fontSize: 'max(1rem, min(0.5rem + 1.5vw, 1.75rem))',
              letterSpacing: '-0.02em',
              lineHeight: '1.2em',
              fontWeight: 500,
            }}
          >
            Instant insights from your survey responses
          </h2>

          {/* Description - Two Column Layout */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0px, 366px) minmax(0px, 366px)',
              gap: '20px',
              textWrap: 'pretty',
              color: 'var(--surbee-fg-secondary)',
              fontSize: '14px',
              letterSpacing: '-0.01em',
              lineHeight: '1.5em',
              maxWidth: '752px',
              width: '100%',
            }}
          >
            <div>
              <p style={{ margin: 0 }}>
                Your survey data is being analyzed in real-time.
                Patterns are emerging across <strong style={{ fontWeight: 600 }}>247 responses</strong>,
                revealing key trends in user satisfaction and engagement metrics.
              </p>
            </div>
            <div>
              <p style={{ margin: 0 }}>
                AI-powered analysis detects sentiment shifts, identifies outliers,
                and surfaces the insights that matter most to your research objectives.
              </p>
              <p style={{ margin: '16px 0 0 0' }}>
                <strong style={{ fontWeight: 600 }}>Top insight:</strong> 78% of respondents show positive sentiment.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
