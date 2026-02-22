"use client";

import React from 'react';
import type { GeoLocation } from '../types';
import styles from '../insights.module.css';

interface GlobeVisualizationProps {
  geoData: GeoLocation[];
  total: number;
}

const countryColors = ['#3ECC8C', '#2970FF', '#F79009', '#F04438', '#7A5AF8'];
const defaultDotColor = '#212521';

// Hexagonal dot-grid world map coordinates
// Each dot is positioned on a hex grid; 1 = land, 0 = water
// Simplified continent shapes at ~15x30 resolution
const WORLD_MAP_ROWS = [
  //         N.America              Europe    Asia
  '                   111         1111111111       ',
  '               111111111      11111111111111    ',
  '              1111111111111   111111111111111   ',
  '             111111111111111 1111111111111111   ',
  '            1111111111111111111111111111111111  ',
  '           11111111111111111111111111111111111  ',
  '           1111111111111  1111111111111111111   ',
  '            111111111111   11111111111111111    ',
  '             1111111111     1111111111111111    ',
  '              111111111      111111111111111    ',
  '                1111111    11111111111111111    ',
  '                 11111    111111111111111       ',
  '                  1111     1111111111           ',
  '                   111  1   111111111           ',
  // S.America           Africa    SE Asia
  '                   111111    111111  111        ',
  '                   1111111  1111111  1111       ',
  '                    1111111111111111  111       ',
  '                     111111111111111   11       ',
  '                      1111111111111     1       ',
  '                       11111111111              ',
  '                        111111111               ',
  '                         1111111                ',
  '                          11111                 ',
  '                           111                  ',
  //                                    Australia
  '                            1       1111        ',
  '                                   111111       ',
  '                                   111111       ',
  '                                    1111        ',
  '                                     11         ',
];

// Map country codes to approximate grid regions for highlighting
function getCountryRegion(code: string): { rowRange: [number, number]; colRange: [number, number] } {
  const regions: Record<string, { rowRange: [number, number]; colRange: [number, number] }> = {
    US: { rowRange: [2, 8], colRange: [5, 18] },
    CA: { rowRange: [0, 3], colRange: [5, 18] },
    GB: { rowRange: [2, 5], colRange: [23, 27] },
    DE: { rowRange: [3, 6], colRange: [27, 30] },
    FR: { rowRange: [4, 7], colRange: [25, 28] },
    CN: { rowRange: [4, 9], colRange: [35, 42] },
    JP: { rowRange: [4, 8], colRange: [42, 45] },
    IN: { rowRange: [8, 13], colRange: [34, 39] },
    BR: { rowRange: [14, 22], colRange: [17, 24] },
    AU: { rowRange: [24, 28], colRange: [37, 43] },
    NL: { rowRange: [3, 5], colRange: [26, 28] },
    MX: { rowRange: [8, 11], colRange: [6, 14] },
  };
  return regions[code] || { rowRange: [-1, -1], colRange: [-1, -1] };
}

function HexDotGlobe({ geoData }: { geoData: GeoLocation[] }) {
  const dotSize = 3.2;
  const gapX = 8;
  const gapY = 7;
  const offsetX = 3.5; // offset for odd rows

  // Build a map of country highlights
  const sortedCountries = [...geoData].sort((a, b) => b.count - a.count).slice(0, 5);
  const countryColorMap = new Map<string, string>();
  sortedCountries.forEach((c, idx) => {
    countryColorMap.set(c.countryCode, countryColors[idx] || countryColors[countryColors.length - 1]);
  });

  const dots: { cx: number; cy: number; fill: string }[] = [];

  WORLD_MAP_ROWS.forEach((row, rowIdx) => {
    const isOddRow = rowIdx % 2 === 1;
    for (let col = 0; col < row.length; col++) {
      if (row[col] === '1') {
        const cx = col * gapX + (isOddRow ? offsetX : 0) + dotSize;
        const cy = rowIdx * gapY + dotSize;

        // Check if this dot falls in a highlighted country region
        let fill = defaultDotColor;
        for (const [code, color] of countryColorMap.entries()) {
          const region = getCountryRegion(code);
          if (
            rowIdx >= region.rowRange[0] &&
            rowIdx <= region.rowRange[1] &&
            col >= region.colRange[0] &&
            col <= region.colRange[1]
          ) {
            fill = color;
            break;
          }
        }

        dots.push({ cx, cy, fill });
      }
    }
  });

  const maxX = Math.max(...dots.map((d) => d.cx)) + dotSize * 2;
  const maxY = WORLD_MAP_ROWS.length * gapY + dotSize * 2;

  return (
    <div className={styles.demographicsGlobe}>
      <svg
        viewBox={`0 0 ${maxX} ${maxY}`}
        className={styles.demographicsGlobeSvg}
        preserveAspectRatio="xMidYMid meet"
      >
        {dots.map((dot, idx) => (
          <circle
            key={idx}
            cx={dot.cx}
            cy={dot.cy}
            r={dotSize / 2}
            fill={dot.fill}
            opacity={dot.fill === defaultDotColor ? 0.4 : 0.85}
          />
        ))}
      </svg>
    </div>
  );
}

export function GlobeVisualization({ geoData, total }: GlobeVisualizationProps) {
  const sortedCountries = [...geoData].sort((a, b) => b.count - a.count);
  const topCountries = sortedCountries.slice(0, 5);
  const otherCount = sortedCountries.slice(5).reduce((sum, c) => sum + c.count, 0);

  return (
    <div className={styles.demographicsCard}>
      <div className={styles.analyticsCardTitle}>Demographics</div>
      <HexDotGlobe geoData={geoData} />
      <div className={styles.demographicsCountryList}>
        {topCountries.map((country, idx) => {
          const pct = total > 0 ? ((country.count / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={country.countryCode} className={styles.demographicsCountryItem}>
              <span
                className={styles.demographicsCountryDot}
                style={{ backgroundColor: countryColors[idx] || countryColors[countryColors.length - 1] }}
              />
              <span className={styles.demographicsCountryName}>{country.country}</span>
              <span className={styles.demographicsCountryCount}>{country.count.toLocaleString()}</span>
              <span className={styles.demographicsCountryPercent}>{pct}%</span>
            </div>
          );
        })}
        {otherCount > 0 && (
          <div className={styles.demographicsCountryItem}>
            <span
              className={styles.demographicsCountryDot}
              style={{ backgroundColor: '#667085' }}
            />
            <span className={styles.demographicsCountryName}>Other</span>
            <span className={styles.demographicsCountryCount}>{otherCount.toLocaleString()}</span>
            <span className={styles.demographicsCountryPercent}>
              {total > 0 ? ((otherCount / total) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default GlobeVisualization;
