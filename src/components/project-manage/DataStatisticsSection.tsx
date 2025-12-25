"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import DataDateSelector, { DatePreset } from './DataDateSelector';
import DataTrendIndicator from './DataTrendIndicator';
import DataFunnelAnalysis from './DataFunnelAnalysis';
import CipherAnalyticsSection from './CipherAnalyticsSection';

interface DateRange {
  start: Date;
  end: Date;
}

interface QuestionStat {
  id: string;
  questionNumber: number;
  questionText: string;
  questionType: 'multiple_choice' | 'rating' | 'text' | 'yes_no';
  responseCount: number;
  cipherAccuracy: number;
  cipherInsight: string;
  distribution?: { label: string; value: number; percentage: number }[];
  averageRating?: number;
  sentimentScore?: number;
}

interface DataStatisticsSectionProps {
  projectId?: string;
}

interface ViewOptions {
  showDistribution: boolean;
  showCipherInsight: boolean;
  showResponseCount: boolean;
  showAccuracy: boolean;
}

const sampleQuestions: QuestionStat[] = [
  {
    id: 'q1',
    questionNumber: 1,
    questionText: 'How satisfied are you with our product overall?',
    questionType: 'rating',
    responseCount: 247,
    cipherAccuracy: 94,
    cipherInsight: 'Strong positive sentiment detected. 78% of responses indicate satisfaction levels of 4 or higher. Consider highlighting premium features to the 22% who rated lower.',
    averageRating: 4.2,
    distribution: [
      { label: '5 stars', value: 98, percentage: 40 },
      { label: '4 stars', value: 94, percentage: 38 },
      { label: '3 stars', value: 35, percentage: 14 },
      { label: '2 stars', value: 15, percentage: 6 },
      { label: '1 star', value: 5, percentage: 2 },
    ],
  },
  {
    id: 'q2',
    questionNumber: 2,
    questionText: 'Which features do you use most frequently?',
    questionType: 'multiple_choice',
    responseCount: 243,
    cipherAccuracy: 89,
    cipherInsight: 'Dashboard and Analytics are the top features. Reports feature has lower engagement - consider improving discoverability or UX.',
    distribution: [
      { label: 'Dashboard', value: 187, percentage: 77 },
      { label: 'Analytics', value: 156, percentage: 64 },
      { label: 'Integrations', value: 98, percentage: 40 },
      { label: 'Reports', value: 67, percentage: 28 },
      { label: 'API Access', value: 45, percentage: 19 },
    ],
  },
  {
    id: 'q3',
    questionNumber: 3,
    questionText: 'Would you recommend our product to a colleague?',
    questionType: 'yes_no',
    responseCount: 245,
    cipherAccuracy: 97,
    cipherInsight: 'High NPS indicator. 82% would recommend. Cross-reference with Q1 shows strong correlation between satisfaction and recommendation intent.',
    distribution: [
      { label: 'Yes', value: 201, percentage: 82 },
      { label: 'No', value: 44, percentage: 18 },
    ],
  },
  {
    id: 'q4',
    questionNumber: 4,
    questionText: 'What improvements would you like to see?',
    questionType: 'text',
    responseCount: 189,
    cipherAccuracy: 86,
    cipherInsight: 'Top themes: Mobile app (34%), faster loading (28%), more integrations (22%). Sentiment analysis shows constructive feedback tone in 91% of responses.',
    sentimentScore: 72,
  },
  {
    id: 'q5',
    questionNumber: 5,
    questionText: 'How easy was it to get started with our product?',
    questionType: 'rating',
    responseCount: 247,
    cipherAccuracy: 92,
    cipherInsight: 'Onboarding experience is strong but not exceptional. Users who rated 3 or below often mention documentation gaps. Consider interactive tutorials.',
    averageRating: 3.8,
    distribution: [
      { label: '5 stars', value: 72, percentage: 29 },
      { label: '4 stars', value: 89, percentage: 36 },
      { label: '3 stars', value: 54, percentage: 22 },
      { label: '2 stars', value: 22, percentage: 9 },
      { label: '1 star', value: 10, percentage: 4 },
    ],
  },
];

const overallStats = {
  totalResponses: 247,
  completionRate: 94.2,
  averageTime: '4m 32s',
  overallAccuracy: 91.6,
};

// Sample trend data
const trendData = [
  { label: 'Responses', currentValue: 247, previousValue: 198, suffix: '' },
  { label: 'Completion Rate', currentValue: 94, previousValue: 89, suffix: '%' },
  { label: 'Avg. Time', currentValue: 272, previousValue: 310, suffix: 's', invertTrend: true },
  { label: 'Drop-off Rate', currentValue: 12, previousValue: 18, suffix: '%', invertTrend: true },
];

export default function DataStatisticsSection({ projectId }: DataStatisticsSectionProps) {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>('q1');
  const [showCustomize, setShowCustomize] = useState(false);
  const [selectedDatePreset, setSelectedDatePreset] = useState<DatePreset>('month');
  const [viewOptions, setViewOptions] = useState<ViewOptions>({
    showDistribution: true,
    showCipherInsight: true,
    showResponseCount: false,
    showAccuracy: true,
  });
  const customizeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customizeRef.current && !customizeRef.current.contains(event.target as Node)) {
        setShowCustomize(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateChange = (preset: DatePreset, range: DateRange) => {
    setSelectedDatePreset(preset);
    // In real app, fetch data for the selected date range
    console.log('Date range changed:', preset, range);
  };

  const handleToggleQuestion = (questionId: string) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const toggleOption = (option: keyof ViewOptions) => {
    setViewOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const viewOptionsList = [
    { key: 'showDistribution', label: 'Distribution' },
    { key: 'showCipherInsight', label: 'Cipher Insight' },
    { key: 'showAccuracy', label: 'Accuracy' },
  ];

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
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Date Selector and Customize */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
          }}
        >
          <DataDateSelector
            selectedPreset={selectedDatePreset}
            onDateChange={handleDateChange}
          />

          {/* Customize Dropdown */}
          <div ref={customizeRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowCustomize(!showCustomize)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px 8px 14px',
                background: 'var(--surbee-bg-primary, #fff)',
                border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                borderRadius: '9999px',
                color: 'var(--surbee-fg-primary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <span>Customize</span>
              <ChevronDown
                size={14}
                style={{
                  color: 'var(--surbee-fg-tertiary)',
                  transform: showCustomize ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>

            {showCustomize && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--surbee-bg-primary, #fff)',
                  border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                  borderRadius: '16px',
                  padding: '8px',
                  minWidth: '180px',
                  zIndex: 100,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                {viewOptionsList.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => toggleOption(key as keyof ViewOptions)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: 'var(--surbee-fg-primary)',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surbee-bg-secondary, #f5f5f5)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <span>{label}</span>
                    {viewOptions[key as keyof ViewOptions] && (
                      <Check size={14} style={{ color: 'var(--surbee-fg-tertiary)' }} />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats Row */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {[
            { label: 'Total Responses', value: overallStats.totalResponses.toString(), show: viewOptions.showResponseCount },
            { label: 'Completion Rate', value: `${overallStats.completionRate}%`, show: true },
            { label: 'Avg. Time', value: overallStats.averageTime, show: true },
            { label: 'Cipher Accuracy', value: `${overallStats.overallAccuracy}%`, show: viewOptions.showAccuracy },
          ].filter(stat => stat.show).map((stat, index) => (
            <div
              key={index}
              style={{
                flex: 1,
                backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                borderRadius: '6px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  color: 'var(--surbee-fg-tertiary)',
                  fontWeight: 400,
                }}
              >
                {stat.label}
              </span>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: 500,
                  color: 'var(--surbee-fg-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Trend Indicator */}
        <DataTrendIndicator
          trends={trendData}
          periodLabel="previous 30 days"
        />

        {/* Funnel Analysis */}
        <DataFunnelAnalysis projectId={projectId} />

        {/* Cipher Analytics Section */}
        <CipherAnalyticsSection projectId={projectId} />

        {/* Section Title for Questions */}
        <div
          style={{
            marginTop: '20px',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--surbee-fg-primary)',
              }}
            >
              Question Analysis
            </h3>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '13px',
                color: 'var(--surbee-fg-tertiary)',
              }}
            >
              Detailed breakdown for each survey question
            </p>
          </div>
        </div>

        {/* Questions List */}
        {sampleQuestions.map((question) => {
          const isExpanded = expandedQuestion === question.id;

          return (
            <div
              key={question.id}
              style={{
                backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              {/* Question Header */}
              <button
                onClick={() => handleToggleQuestion(question.id)}
                style={{
                  width: '100%',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '20px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* Question Number */}
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: 'var(--surbee-fg-tertiary)',
                    minWidth: '24px',
                  }}
                >
                  {String(question.questionNumber).padStart(2, '0')}
                </span>

                {/* Question Text */}
                <span
                  style={{
                    flex: 1,
                    fontSize: '14px',
                    fontWeight: 400,
                    color: 'var(--surbee-fg-primary)',
                    lineHeight: '1.4',
                  }}
                >
                  {question.questionText}
                </span>

                {/* Stats */}
                {viewOptions.showAccuracy && (
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 500,
                      color: 'var(--surbee-fg-primary)',
                      flexShrink: 0,
                    }}
                  >
                    {question.cipherAccuracy}% accuracy
                  </span>
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div
                  style={{
                    padding: '0 20px 20px',
                    display: 'flex',
                    gap: '20px',
                  }}
                >
                  {/* Left: Distribution */}
                  {viewOptions.showDistribution && (
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--surbee-bg-primary, #fff)',
                        borderRadius: '6px',
                        padding: '20px',
                      }}
                    >
                      <p
                        style={{
                          margin: '0 0 16px 0',
                          fontSize: '13px',
                          color: 'var(--surbee-fg-tertiary)',
                        }}
                      >
                        Distribution
                      </p>

                      {question.distribution ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {question.distribution.map((item, idx) => (
                            <div
                              key={idx}
                              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                            >
                              <span
                                style={{
                                  width: '80px',
                                  fontSize: '13px',
                                  color: 'var(--surbee-fg-secondary)',
                                  flexShrink: 0,
                                }}
                              >
                                {item.label}
                              </span>
                              <div
                                style={{
                                  flex: 1,
                                  height: '6px',
                                  backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                                  borderRadius: '3px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    height: '100%',
                                    width: `${item.percentage}%`,
                                    backgroundColor: 'var(--surbee-fg-primary)',
                                    borderRadius: '3px',
                                  }}
                                />
                              </div>
                              <span
                                style={{
                                  width: '40px',
                                  fontSize: '13px',
                                  color: 'var(--surbee-fg-primary)',
                                  textAlign: 'right',
                                  flexShrink: 0,
                                }}
                              >
                                {item.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '8px',
                              }}
                            >
                              <span style={{ fontSize: '13px', color: 'var(--surbee-fg-tertiary)' }}>
                                Sentiment
                              </span>
                              <span
                                style={{
                                  fontSize: '13px',
                                  color: 'var(--surbee-fg-primary)',
                                }}
                              >
                                {question.sentimentScore}%
                              </span>
                            </div>
                            <div
                              style={{
                                height: '6px',
                                backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                                borderRadius: '3px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${question.sentimentScore}%`,
                                  backgroundColor: 'var(--surbee-fg-primary)',
                                  borderRadius: '3px',
                                }}
                              />
                            </div>
                          </div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '13px',
                              color: 'var(--surbee-fg-secondary)',
                              lineHeight: '1.5',
                            }}
                          >
                            Top themes: Mobile app (34%), Faster loading (28%), More integrations (22%)
                          </p>
                        </div>
                      )}

                      {question.averageRating && (
                        <div
                          style={{
                            marginTop: '20px',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--surbee-bg-secondary, #f5f5f5)',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '4px',
                          }}
                        >
                          <span style={{ fontSize: '13px', color: 'var(--surbee-fg-tertiary)' }}>
                            Average
                          </span>
                          <span
                            style={{
                              fontSize: '20px',
                              fontWeight: 500,
                              color: 'var(--surbee-fg-primary)',
                              marginLeft: '8px',
                            }}
                          >
                            {question.averageRating}
                          </span>
                          <span style={{ fontSize: '13px', color: 'var(--surbee-fg-tertiary)' }}>
                            / 5
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Right: Cipher Insight */}
                  {viewOptions.showCipherInsight && (
                    <div
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--surbee-bg-primary, #fff)',
                        borderRadius: '6px',
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {/* AI Indicator Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          marginBottom: '16px',
                        }}
                      >
                        {/* AI Video Indicator */}
                        <div
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            flexShrink: 0,
                          }}
                        >
                          <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            src="https://framerusercontent.com/assets/cdgTlEeojTdZY77oir3VopVK4Y.mp4"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: '13px',
                            color: 'var(--surbee-fg-tertiary)',
                          }}
                        >
                          Cipher Insight
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: 'var(--surbee-fg-secondary)',
                          flex: 1,
                        }}
                      >
                        {question.cipherInsight}
                      </p>

                      <div
                        style={{
                          marginTop: '20px',
                          paddingTop: '16px',
                          borderTop: '1px solid var(--surbee-bg-secondary, #f5f5f5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '13px', color: 'var(--surbee-fg-tertiary)' }}>
                          Analysis confidence
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: 'var(--surbee-fg-primary)',
                          }}
                        >
                          {question.cipherAccuracy}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
