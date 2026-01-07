"use client";

import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface DataStatisticsSectionProps {
  projectId?: string;
}

// Sample response data
interface ResponseData {
  id: string;
  submittedAt: Date;
  status: 'completed' | 'partial' | 'abandoned';
  score: number;
  answers: { question: string; answer: string }[];
}

const sampleResponses: ResponseData[] = [
  {
    id: 'a3f2b1c9',
    submittedAt: new Date('2025-01-15T14:30:00'),
    status: 'completed',
    score: 92,
    answers: [
      { question: 'How satisfied are you with our product overall?', answer: '5 stars - Very satisfied' },
      { question: 'Which features do you use most frequently?', answer: 'Dashboard, Analytics' },
      { question: 'Would you recommend our product to a colleague?', answer: 'Yes' },
      { question: 'What improvements would you like to see?', answer: 'Mobile app would be great for on-the-go access.' },
    ],
  },
  {
    id: 'b4c3d2e8',
    submittedAt: new Date('2025-01-15T13:45:00'),
    status: 'completed',
    score: 78,
    answers: [
      { question: 'How satisfied are you with our product overall?', answer: '4 stars - Satisfied' },
      { question: 'Which features do you use most frequently?', answer: 'Reports, Integrations' },
      { question: 'Would you recommend our product to a colleague?', answer: 'Yes' },
    ],
  },
  {
    id: 'c5d4e3f7',
    submittedAt: new Date('2025-01-15T12:20:00'),
    status: 'partial',
    score: 45,
    answers: [
      { question: 'How satisfied are you with our product overall?', answer: '3 stars - Neutral' },
    ],
  },
  {
    id: 'd6e5f4g6',
    submittedAt: new Date('2025-01-15T11:15:00'),
    status: 'completed',
    score: 88,
    answers: [
      { question: 'How satisfied are you with our product overall?', answer: '5 stars - Very satisfied' },
      { question: 'Which features do you use most frequently?', answer: 'Analytics, API Access' },
    ],
  },
  {
    id: 'e7f6g5h5',
    submittedAt: new Date('2025-01-15T10:00:00'),
    status: 'abandoned',
    score: 12,
    answers: [
      { question: 'How satisfied are you with our product overall?', answer: '2 stars - Dissatisfied' },
    ],
  },
];

// Funnel data
const funnelData = [
  { question: 'Q1: Satisfaction Rating', started: 247, completed: 245, dropOff: 0.8 },
  { question: 'Q2: Feature Usage', started: 245, completed: 243, dropOff: 0.8 },
  { question: 'Q3: Recommendation', started: 243, completed: 241, dropOff: 0.8 },
  { question: 'Q4: Improvements', started: 241, completed: 232, dropOff: 3.7 },
  { question: 'Q5: Onboarding', started: 232, completed: 225, dropOff: 3.0 },
];

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const getStatusColor = (status: ResponseData['status']) => {
  switch (status) {
    case 'completed': return '#059669';
    case 'partial': return '#d97706';
    case 'abandoned': return '#999999';
  }
};

const getScoreColor = (score: number) => {
  if (score >= 80) return '#059669';
  if (score >= 60) return '#d97706';
  return '#dc2626';
};

// Bento Card Component with Framer-style vertical line
const BentoCard = ({
  children,
  className = '',
  style = {},
  hasAccent = false,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hasAccent?: boolean;
}) => (
  <div
    className={className}
    style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      borderLeft: hasAccent ? '2px solid #0A0A0A' : '1px solid rgba(0, 0, 0, 0.08)',
      padding: '24px',
      paddingLeft: hasAccent ? '24px' : '24px',
      transition: 'all 0.2s ease',
      ...style,
    }}
  >
    {children}
  </div>
);

// Card Label Component - Monospace uppercase
const CardLabel = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
      fontSize: '10px',
      fontWeight: 600,
      color: '#6B6B6B',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      display: 'block',
      marginBottom: '12px',
    }}
  >
    {children}
  </span>
);

// Card Value Component
const CardValue = ({ children, color = '#0A0A0A' }: { children: React.ReactNode; color?: string }) => (
  <span
    style={{
      fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
      fontSize: '32px',
      fontWeight: 600,
      color,
      letterSpacing: '-0.02em',
      lineHeight: 1,
    }}
  >
    {children}
  </span>
);

export default function DataStatisticsSection({ projectId }: DataStatisticsSectionProps) {
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 3;

  const totalPages = Math.ceil(sampleResponses.length / ITEMS_PER_PAGE);
  const paginatedResponses = sampleResponses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <section
      style={{
        width: '100%',
        padding: '0 40px 60px',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {/* Bento Grid Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gridTemplateRows: 'auto auto auto',
            gap: '16px',
          }}
        >
          {/* Row 1: Stats Cards with vertical accents */}
          <BentoCard hasAccent>
            <CardLabel>Total Responses</CardLabel>
            <CardValue>247</CardValue>
          </BentoCard>

          <BentoCard hasAccent>
            <CardLabel>Completion Rate</CardLabel>
            <CardValue color="#059669">94.2%</CardValue>
          </BentoCard>

          <BentoCard hasAccent>
            <CardLabel>Avg. Time</CardLabel>
            <CardValue>4:32</CardValue>
          </BentoCard>

          <BentoCard hasAccent>
            <CardLabel>Quality Score</CardLabel>
            <CardValue>91.6</CardValue>
          </BentoCard>

          {/* Row 2: Funnel (2 cols) + Top Themes (2 cols) */}
          <BentoCard hasAccent style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <CardLabel>Response Funnel</CardLabel>
              <span
                style={{
                  fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                  fontSize: '10px',
                  color: '#999999',
                  padding: '4px 8px',
                  backgroundColor: '#F5F5F5',
                  borderRadius: '6px',
                }}
              >
                Last 30 days
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {funnelData.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '13px', color: '#4A4A4A', width: '140px', flexShrink: 0 }}>
                    {item.question}
                  </span>
                  <div style={{ flex: 1, height: '6px', backgroundColor: '#F5F5F5', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${(item.completed / 247) * 100}%`,
                        backgroundColor: item.dropOff > 2 ? '#d97706' : '#0A0A0A',
                        borderRadius: '3px',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                      fontSize: '11px',
                      color: item.dropOff > 2 ? '#dc2626' : '#6B6B6B',
                      width: '50px',
                      textAlign: 'right',
                    }}
                  >
                    -{item.dropOff}%
                  </span>
                </div>
              ))}
            </div>
          </BentoCard>

          <BentoCard hasAccent style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <CardLabel>Top Themes</CardLabel>
              <span
                style={{
                  fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                  fontSize: '10px',
                  color: '#999999',
                  padding: '4px 8px',
                  backgroundColor: '#F5F5F5',
                  borderRadius: '6px',
                }}
              >
                From open responses
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { theme: 'Mobile App Request', count: 84, percentage: 34 },
                { theme: 'Faster Loading', count: 69, percentage: 28 },
                { theme: 'More Integrations', count: 54, percentage: 22 },
                { theme: 'Better Documentation', count: 27, percentage: 11 },
                { theme: 'Dark Mode', count: 12, percentage: 5 },
              ].map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 500, flex: 1 }}>
                    {item.theme}
                  </span>
                  <span
                    style={{
                      fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                      fontSize: '11px',
                      color: '#6B6B6B',
                      width: '80px',
                      textAlign: 'right',
                    }}
                  >
                    {item.count} mentions
                  </span>
                  <div
                    style={{
                      width: '80px',
                      height: '4px',
                      backgroundColor: '#F5F5F5',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.percentage}%`,
                        backgroundColor: '#0A0A0A',
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Row 3: Recent Responses (full width) */}
          <BentoCard hasAccent style={{ gridColumn: 'span 4' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <CardLabel>Recent Responses</CardLabel>
              <span
                style={{
                  fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                  fontSize: '10px',
                  color: '#999999',
                  padding: '4px 8px',
                  backgroundColor: '#F5F5F5',
                  borderRadius: '6px',
                }}
              >
                {sampleResponses.length} total
              </span>
            </div>

            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '100px 1fr 120px 80px 32px',
                gap: '16px',
                padding: '12px 0',
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <span style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace", fontSize: '10px', fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '1px' }}>ID</span>
              <span style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace", fontSize: '10px', fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '1px' }}>Submitted</span>
              <span style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace", fontSize: '10px', fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '1px' }}>Status</span>
              <span style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace", fontSize: '10px', fontWeight: 600, color: '#6B6B6B', textTransform: 'uppercase', letterSpacing: '1px' }}>Score</span>
              <span></span>
            </div>

            {/* Table Rows */}
            {paginatedResponses.map((response) => {
              const isExpanded = expandedResponse === response.id;

              return (
                <div key={response.id}>
                  <button
                    onClick={() => setExpandedResponse(isExpanded ? null : response.id)}
                    style={{
                      width: '100%',
                      display: 'grid',
                      gridTemplateColumns: '100px 1fr 120px 80px 32px',
                      gap: '16px',
                      padding: '16px 0',
                      background: 'none',
                      border: 'none',
                      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <span style={{ fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace", fontSize: '12px', color: '#6B6B6B' }}>
                      #{response.id.slice(0, 8)}
                    </span>
                    <span style={{ fontSize: '13px', color: '#0A0A0A' }}>
                      {formatDate(response.submittedAt)}
                    </span>
                    <span
                      style={{
                        fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                        fontSize: '11px',
                        fontWeight: 500,
                        color: getStatusColor(response.status),
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {response.status}
                    </span>
                    <span
                      style={{
                        fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                        fontSize: '13px',
                        fontWeight: 600,
                        color: getScoreColor(response.score),
                      }}
                    >
                      {response.score}
                    </span>
                    <ChevronRight
                      size={16}
                      style={{
                        color: '#999999',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </button>

                  {/* Expanded Answers */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: '20px',
                        backgroundColor: '#FAFAFA',
                        borderRadius: '12px',
                        margin: '12px 0',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        borderLeft: '2px solid #0A0A0A',
                      }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {response.answers.map((qa, qaIndex) => (
                          <div key={qaIndex}>
                            <span
                              style={{
                                fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                                fontSize: '9px',
                                fontWeight: 600,
                                color: '#6B6B6B',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                display: 'block',
                                marginBottom: '8px',
                              }}
                            >
                              Q{qaIndex + 1}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6B6B6B', display: 'block', marginBottom: '8px', lineHeight: 1.5 }}>
                              {qa.question}
                            </span>
                            <span style={{ fontSize: '14px', color: '#0A0A0A', fontWeight: 500 }}>
                              {qa.answer}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '24px',
                  paddingTop: '16px',
                }}
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                      setExpandedResponse(null);
                    }}
                    style={{
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'SF Mono', 'Menlo', 'Monaco', 'Courier New', monospace",
                      fontSize: '12px',
                      fontWeight: currentPage === page ? 600 : 400,
                      color: currentPage === page ? '#FFFFFF' : '#6B6B6B',
                      backgroundColor: currentPage === page ? '#0A0A0A' : 'transparent',
                      border: currentPage === page ? 'none' : '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </BentoCard>
        </div>
      </div>
    </section>
  );
}
