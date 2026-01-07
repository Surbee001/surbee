"use client";

import React from 'react';

interface DataHeroSectionProps {
  projectId?: string;
}

export default function DataHeroSection({ projectId }: DataHeroSectionProps) {
  return (
    <section
      style={{
        width: '100%',
        paddingLeft: '40px',
        paddingRight: '40px',
        paddingTop: 'clamp(32px, 1.66667cqw + 24px, 48px)',
        paddingBottom: '0',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {/* Hero Text Content - with vertical line accent */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            width: '100%',
            maxWidth: '800px',
            paddingLeft: '24px',
            borderLeft: '2px solid #0A0A0A',
          }}
        >
          {/* Label - Monospace uppercase */}
          <span
            style={{
              fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
              fontSize: '11px',
              fontWeight: 500,
              color: '#6B6B6B',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Survey Insights
          </span>

          {/* Heading */}
          <h2
            style={{
              margin: 0,
              padding: 0,
              textWrap: 'balance',
              color: '#0A0A0A',
              fontSize: 'max(1.5rem, min(0.75rem + 2vw, 2.25rem))',
              letterSpacing: '-0.02em',
              lineHeight: '1.15em',
              fontWeight: 500,
            }}
          >
            Response Summary
          </h2>

          {/* Text Summary */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              color: '#4A4A4A',
              fontSize: '14px',
              letterSpacing: '-0.01em',
              lineHeight: '1.7em',
            }}
          >
            <p style={{ margin: 0 }}>
              Based on <strong style={{ color: '#0A0A0A', fontWeight: 600 }}>247 responses</strong> collected
              over the past 7 days, your survey shows strong positive sentiment. 78% of respondents expressed satisfaction
              with your product, with an average rating of 4.2 out of 5 stars.
            </p>

            <p style={{ margin: 0 }}>
              The most engaged demographic is users aged 25-34, who make up 42% of responses. Key themes emerging from
              open-ended questions include requests for mobile app improvements, faster loading times, and additional
              integrations with third-party tools.
            </p>

            <p style={{ margin: 0 }}>
              Your Net Promoter Score of <strong style={{ color: '#0A0A0A', fontWeight: 600 }}>67</strong> indicates strong customer loyalty, with 82% of respondents saying they would
              recommend your product to a colleague. Completion rate stands at 91%, suggesting the survey length and
              question flow are well-optimized.
            </p>
          </div>
        </div>

        {/* Divider Line */}
        <div
          style={{
            width: '100%',
            height: '1px',
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
            marginTop: '40px',
            marginBottom: '24px',
          }}
        />
      </div>
    </section>
  );
}
