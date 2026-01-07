"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Globe, MapPin } from 'lucide-react';
import type { GeoLocation } from '../types';
import styles from '../insights.module.css';

interface GlobeVisualizationProps {
  geoData: GeoLocation[];
  total: number;
}

// Simple SVG world map with dots
function WorldMapSVG({ geoData, total }: { geoData: GeoLocation[]; total: number }) {
  const [hoveredCountry, setHoveredCountry] = useState<GeoLocation | null>(null);

  // Convert lat/lng to SVG coordinates (simple equirectangular projection)
  const toSVGCoords = (lat: number, lng: number) => {
    const x = ((lng + 180) / 360) * 360;
    const y = ((90 - lat) / 180) * 180;
    return { x, y };
  };

  const maxCount = Math.max(...geoData.map(g => g.count), 1);

  return (
    <div className={styles.globeMapContainer}>
      <svg viewBox="0 0 360 180" className={styles.globeMap}>
        {/* World outline - simplified continents */}
        <defs>
          <linearGradient id="dotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--insights-info)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--insights-purple)" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(lng => (
          <line
            key={`lng-${lng}`}
            x1={lng}
            y1={0}
            x2={lng}
            y2={180}
            stroke="var(--insights-border)"
            strokeWidth="0.3"
            strokeDasharray="2,2"
          />
        ))}
        {[30, 60, 90, 120, 150].map(lat => (
          <line
            key={`lat-${lat}`}
            x1={0}
            y1={lat}
            x2={360}
            y2={lat}
            stroke="var(--insights-border)"
            strokeWidth="0.3"
            strokeDasharray="2,2"
          />
        ))}

        {/* Response dots */}
        {geoData.map((location, idx) => {
          const { x, y } = toSVGCoords(location.lat, location.lng);
          const radius = 3 + (location.count / maxCount) * 8;
          const pulseRadius = radius + 4;

          return (
            <g
              key={location.countryCode}
              onMouseEnter={() => setHoveredCountry(location)}
              onMouseLeave={() => setHoveredCountry(null)}
              style={{ cursor: 'pointer' }}
            >
              {/* Pulse animation */}
              <circle
                cx={x}
                cy={y}
                r={pulseRadius}
                fill="url(#dotGradient)"
                opacity="0.2"
                className={styles.globePulse}
              />
              {/* Main dot */}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill="url(#dotGradient)"
                stroke="var(--insights-bg-card)"
                strokeWidth="1"
              />
              {/* Count label for large dots */}
              {location.count >= 5 && (
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="5"
                  fill="white"
                  fontWeight="600"
                >
                  {location.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Hover tooltip */}
      {hoveredCountry && (
        <div className={styles.globeTooltip}>
          <span className={styles.globeTooltipCountry}>{hoveredCountry.country}</span>
          <span className={styles.globeTooltipCount}>
            {hoveredCountry.count} response{hoveredCountry.count !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export function GlobeVisualization({ geoData, total }: GlobeVisualizationProps) {
  const countriesWithData = geoData.filter(g => g.count > 0);
  const topCountries = [...countriesWithData].sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className={styles.globeCard}>
      <div className={styles.cardTitle}>
        <Globe size={16} style={{ color: 'var(--insights-info)' }} />
        Geographic Distribution
      </div>

      {/* Map visualization */}
      <WorldMapSVG geoData={geoData} total={total} />

      {/* Top countries list */}
      <div className={styles.globeCountryList}>
        {topCountries.map((country, idx) => (
          <div key={country.countryCode} className={styles.globeCountryItem}>
            <span className={styles.globeCountryRank}>{idx + 1}</span>
            <span className={styles.globeCountryName}>{country.country}</span>
            <div className={styles.globeCountryBar}>
              <div
                className={styles.globeCountryBarFill}
                style={{ width: `${(country.count / total) * 100}%` }}
              />
            </div>
            <span className={styles.globeCountryCount}>
              {country.count}
              <span className={styles.globeCountryPercent}>
                ({Math.round((country.count / total) * 100)}%)
              </span>
            </span>
          </div>
        ))}
      </div>

      {countriesWithData.length > 5 && (
        <div className={styles.globeMoreCountries}>
          +{countriesWithData.length - 5} more countries
        </div>
      )}
    </div>
  );
}

export default GlobeVisualization;
