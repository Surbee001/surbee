"use client";

import React, { useState } from 'react';
import { Play, Loader2, Check } from 'lucide-react';

interface FunnelStep {
  questionNumber: number;
  questionText: string;
  questionType: string;
  started: number;
  completed: number;
  dropOff: number;
  avgTime: number;
}

interface DropOffInsight {
  id: string;
  where: string;
  questionNumber: number;
  why: string[];
  howToFix: string[];
  priority: 'high' | 'medium' | 'low';
}

interface DataFunnelAnalysisProps {
  projectId?: string;
}

// Sample funnel data
const sampleFunnelData: FunnelStep[] = [
  { questionNumber: 1, questionText: 'How satisfied are you with our product overall?', questionType: 'rating', started: 247, completed: 245, dropOff: 0.8, avgTime: 12 },
  { questionNumber: 2, questionText: 'Which features do you use most frequently?', questionType: 'multiple_choice', started: 245, completed: 243, dropOff: 0.8, avgTime: 18 },
  { questionNumber: 3, questionText: 'Would you recommend our product to a colleague?', questionType: 'yes_no', started: 243, completed: 241, dropOff: 0.8, avgTime: 8 },
  { questionNumber: 4, questionText: 'What improvements would you like to see?', questionType: 'text', started: 241, completed: 189, dropOff: 21.6, avgTime: 45 },
  { questionNumber: 5, questionText: 'How easy was it to get started with our product?', questionType: 'rating', started: 189, completed: 185, dropOff: 2.1, avgTime: 10 },
];

// Generate insights based on drop-off patterns
const generateInsights = (steps: FunnelStep[]): DropOffInsight[] => {
  const insights: DropOffInsight[] = [];

  steps.forEach((step, index) => {
    if (step.dropOff > 10) {
      const insight: DropOffInsight = {
        id: `insight-${step.questionNumber}`,
        where: `Question ${step.questionNumber}: "${step.questionText.slice(0, 50)}..."`,
        questionNumber: step.questionNumber,
        why: [],
        howToFix: [],
        priority: step.dropOff > 20 ? 'high' : step.dropOff > 10 ? 'medium' : 'low',
      };

      // Analyze why based on question type and metrics
      if (step.questionType === 'text') {
        insight.why.push('Open-ended questions require more cognitive effort');
        insight.why.push('Users may feel the question is too personal or complex');
        insight.howToFix.push('Consider making this question optional');
        insight.howToFix.push('Add placeholder text with example responses');
        insight.howToFix.push('Move this question earlier in the survey when engagement is higher');
      }

      if (step.avgTime > 30) {
        insight.why.push('High average time suggests question complexity');
        insight.howToFix.push('Simplify the question wording');
        insight.howToFix.push('Break into multiple smaller questions');
      }

      if (index > 2) {
        insight.why.push('Survey fatigue - question appears late in the flow');
        insight.howToFix.push('Consider shortening the survey');
        insight.howToFix.push('Add a progress indicator to motivate completion');
      }

      insights.push(insight);
    }
  });

  return insights;
};

export default function DataFunnelAnalysis({ projectId }: DataFunnelAnalysisProps) {
  const [expandedInsight, setExpandedInsight] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'funnel' | 'insights'>('funnel');
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());

  const insights = generateInsights(sampleFunnelData);
  const totalStarted = sampleFunnelData[0]?.started || 0;
  const totalCompleted = sampleFunnelData[sampleFunnelData.length - 1]?.completed || 0;
  const overallCompletionRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return 'var(--surbee-fg-tertiary)';
      default: return 'var(--surbee-fg-tertiary)';
    }
  };

  const handleApplyFix = async (insightId: string) => {
    if (applyingId || appliedIds.has(insightId)) return;

    setApplyingId(insightId);

    try {
      // Simulate API call to apply fix in sandbox
      const response = await fetch(`/api/projects/${projectId}/apply-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId }),
      });

      // Simulate some processing time for demo
      await new Promise(resolve => setTimeout(resolve, 2000));

      setAppliedIds(prev => new Set([...prev, insightId]));
    } catch (error) {
      console.error('Error applying fix:', error);
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
        borderRadius: '6px',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--surbee-fg-tertiary)',
            }}
          >
            Funnel Analysis
          </span>

          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '4px',
              backgroundColor: 'var(--surbee-bg-primary, #fff)',
              borderRadius: '9999px',
              border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
            }}
          >
            {(['funnel', 'insights'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: viewMode === mode ? 'var(--surbee-bg-primary, #fff)' : 'var(--surbee-fg-secondary)',
                  backgroundColor: viewMode === mode ? 'var(--surbee-fg-primary)' : 'transparent',
                  border: 'none',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode === 'funnel' ? 'Flow' : 'Insights'}
              </button>
            ))}
          </div>
        </div>

        {/* Overall Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)' }}>Started</span>
            <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>{totalStarted}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)' }}>Completed</span>
            <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>{totalCompleted}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)' }}>Completion</span>
            <div style={{ fontSize: '18px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>{overallCompletionRate}%</div>
          </div>
        </div>
      </div>

      {/* Funnel View */}
      {viewMode === 'funnel' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {sampleFunnelData.map((step, index) => {
            const widthPercent = totalStarted > 0 ? (step.completed / totalStarted) * 100 : 0;
            const isHighDropOff = step.dropOff > 10;

            return (
              <div
                key={step.questionNumber}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--surbee-bg-primary, #fff)',
                  borderRadius: index === 0 ? '6px 6px 0 0' : index === sampleFunnelData.length - 1 ? '0 0 6px 6px' : '0',
                }}
              >
                {/* Question Number */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: 'var(--surbee-fg-tertiary)',
                    minWidth: '24px',
                  }}
                >
                  {String(step.questionNumber).padStart(2, '0')}
                </span>

                {/* Question Text & Bar */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '13px',
                      color: 'var(--surbee-fg-primary)',
                      lineHeight: '1.4',
                    }}
                  >
                    {step.questionText}
                  </span>

                  {/* Progress Bar */}
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
                        width: `${widthPercent}%`,
                        backgroundColor: isHighDropOff ? '#ef4444' : 'var(--surbee-fg-primary)',
                        borderRadius: '3px',
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center', minWidth: '200px' }}>
                  <div style={{ textAlign: 'center', minWidth: '50px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>{step.completed}</div>
                    <div style={{ fontSize: '10px', color: 'var(--surbee-fg-tertiary)' }}>responses</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '50px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>{step.avgTime}s</div>
                    <div style={{ fontSize: '10px', color: 'var(--surbee-fg-tertiary)' }}>avg time</div>
                  </div>
                  <div style={{ textAlign: 'center', minWidth: '60px' }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: isHighDropOff ? '#ef4444' : 'var(--surbee-fg-tertiary)',
                      }}
                    >
                      {index === 0 ? '—' : `-${step.dropOff}%`}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--surbee-fg-tertiary)' }}>drop-off</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insights View */}
      {viewMode === 'insights' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {insights.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--surbee-fg-tertiary)',
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                borderRadius: '6px',
              }}
            >
              No significant drop-offs detected. Your survey flow is performing well.
            </div>
          ) : (
            insights.map((insight, index) => {
              const isApplying = applyingId === insight.id;
              const isApplied = appliedIds.has(insight.id);

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: 'var(--surbee-bg-primary, #fff)',
                    borderRadius: '6px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Insight Header */}
                  <button
                    onClick={() => setExpandedInsight(expandedInsight === index ? null : index)}
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
                          {insight.where}
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: getPriorityColor(insight.priority),
                            marginTop: '2px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                            fontWeight: 500,
                          }}
                        >
                          {insight.priority} priority
                        </div>
                      </div>
                    </div>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--surbee-fg-tertiary)"
                      strokeWidth="2"
                      style={{
                        transform: expandedInsight === index ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>

                  {/* Expanded Content */}
                  {expandedInsight === index && (
                    <div
                      style={{
                        padding: '0 20px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '16px',
                      }}
                    >
                      {/* Two Column Layout */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '16px',
                        }}
                      >
                        {/* Why Section */}
                        <div
                          style={{
                            padding: '16px',
                            backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                            borderRadius: '6px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--surbee-fg-primary)',
                              marginBottom: '12px',
                            }}
                          >
                            Why this happens
                          </div>
                          <ul
                            style={{
                              margin: 0,
                              padding: 0,
                              listStyle: 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            {insight.why.map((reason, i) => (
                              <li
                                key={i}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px',
                                  fontSize: '13px',
                                  color: 'var(--surbee-fg-secondary)',
                                  lineHeight: '1.5',
                                }}
                              >
                                <span
                                  style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--surbee-fg-tertiary)',
                                    flexShrink: 0,
                                    marginTop: '6px',
                                  }}
                                />
                                {reason}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* How to Fix Section */}
                        <div
                          style={{
                            padding: '16px',
                            backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                            borderRadius: '6px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 600,
                              color: 'var(--surbee-fg-primary)',
                              marginBottom: '12px',
                            }}
                          >
                            How to fix
                          </div>
                          <ul
                            style={{
                              margin: 0,
                              padding: 0,
                              listStyle: 'none',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '10px',
                            }}
                          >
                            {insight.howToFix.map((fix, i) => (
                              <li
                                key={i}
                                style={{
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '10px',
                                  fontSize: '13px',
                                  color: 'var(--surbee-fg-secondary)',
                                  lineHeight: '1.5',
                                }}
                              >
                                <span
                                  style={{
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--surbee-bg-primary, #fff)',
                                    border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '10px',
                                    fontWeight: 500,
                                    color: 'var(--surbee-fg-tertiary)',
                                    flexShrink: 0,
                                  }}
                                >
                                  {i + 1}
                                </span>
                                {fix}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Apply Fix Button */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <button
                          onClick={() => handleApplyFix(insight.id)}
                          disabled={isApplying || isApplied}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 18px',
                            background: isApplied
                              ? 'rgba(34, 197, 94, 0.1)'
                              : 'var(--surbee-fg-primary)',
                            border: 'none',
                            borderRadius: '9999px',
                            color: isApplied
                              ? '#22c55e'
                              : 'var(--surbee-bg-primary, #fff)',
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: isApplying || isApplied ? 'not-allowed' : 'pointer',
                            opacity: isApplying ? 0.7 : 1,
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isApplying ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              <span>Applying...</span>
                            </>
                          ) : isApplied ? (
                            <>
                              <Check size={14} />
                              <span>Applied</span>
                            </>
                          ) : (
                            <>
                              <Play size={14} />
                              <span>Apply Fix</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
