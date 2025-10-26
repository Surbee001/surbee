import React, { useState } from 'react';
import { ChevronRight, AlertCircle, CheckCircle2, Download } from 'lucide-react';

interface FunnelStep {
  questionId: string;
  questionText: string;
  questionNumber: number;
  started: number;
  completed: number;
  abandoned: number;
  avgTimeSeconds: number;
}

interface CompletionFunnelProps {
  steps: FunnelStep[];
  totalStarted: number;
}

export const CompletionFunnel: React.FC<CompletionFunnelProps> = ({ steps, totalStarted }) => {
  const [selectedStep, setSelectedStep] = useState<number | null>(null);

  const calculateRetentionRate = (step: FunnelStep) => {
    return Math.round((step.completed / totalStarted) * 100);
  };

  const calculateDropoffRate = (step: FunnelStep) => {
    return Math.round((step.abandoned / step.started) * 100);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getHealthColor = (dropoffRate: number) => {
    if (dropoffRate < 10) return '#86efac'; // green
    if (dropoffRate < 25) return '#fcd34d'; // yellow
    return '#fca5a5'; // red
  };

  const exportFunnel = () => {
    // Create CSV content
    const csvContent = [
      ['Question', 'Started', 'Completed', 'Abandoned', 'Retention Rate', 'Dropoff Rate', 'Avg. Time'].join(','),
      ...steps.map(step => [
        `"${step.questionText}"`,
        step.started,
        step.completed,
        step.abandoned,
        `${calculateRetentionRate(step)}%`,
        `${calculateDropoffRate(step)}%`,
        formatTime(step.avgTimeSeconds)
      ].join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'completion-funnel.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'white',
            margin: '0 0 8px 0',
          }}>
            Completion Funnel
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#adadad',
            margin: '0',
          }}>
            Track where users drop off in your survey
          </p>
        </div>
        <button
          onClick={exportFunnel}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            borderRadius: '8px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
        >
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      {/* Funnel Visualization */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {steps.map((step, index) => {
          const retentionRate = calculateRetentionRate(step);
          const dropoffRate = calculateDropoffRate(step);
          const healthColor = getHealthColor(dropoffRate);
          const isSelected = selectedStep === index;

          return (
            <div key={step.questionId}>
              {/* Funnel Step */}
              <div
                onClick={() => setSelectedStep(isSelected ? null : index)}
                style={{
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 1fr 80px 80px',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  border: `1px solid ${isSelected ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.08)'}`,
                }}>
                  {/* Step Number */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '50%',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                  }}>
                    {step.questionNumber}
                  </div>

                  {/* Question Text & Funnel Bar */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'white',
                    }}>
                      {step.questionText}
                    </div>
                    {/* Funnel Bar */}
                    <div style={{
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      <div style={{
                        width: `${retentionRate}%`,
                        height: '100%',
                        background: healthColor,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                  </div>

                  {/* Retention Rate */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: healthColor,
                    }}>
                      {retentionRate}%
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#adadad',
                      marginTop: '2px',
                    }}>
                      Retention
                    </div>
                  </div>

                  {/* Health Indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {dropoffRate < 10 ? (
                      <CheckCircle2 className="h-5 w-5" style={{ color: healthColor }} />
                    ) : (
                      <AlertCircle className="h-5 w-5" style={{ color: healthColor }} />
                    )}
                  </div>
                </div>

                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '4px 0',
                  }}>
                    <ChevronRight className="h-4 w-4 transform rotate-90" style={{ color: '#adadad' }} />
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {isSelected && (
                <div style={{
                  marginTop: '8px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '16px',
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Started</div>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>{step.started}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Completed</div>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#86efac' }}>{step.completed}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Abandoned</div>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: '#fca5a5' }}>{step.abandoned}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Dropoff Rate</div>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: healthColor }}>{dropoffRate}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Avg. Time</div>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>{formatTime(step.avgTimeSeconds)}</div>
                    </div>
                  </div>

                  {/* Insights */}
                  {dropoffRate > 20 && (
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: 'rgba(252, 165, 165, 0.1)',
                      borderRadius: '6px',
                      border: '1px solid rgba(252, 165, 165, 0.2)',
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}>
                        <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#fca5a5', marginTop: '2px' }} />
                        <div>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#fca5a5',
                            marginBottom: '4px',
                          }}>
                            High Dropoff Detected
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: '#adadad',
                            lineHeight: '1.5',
                          }}>
                            This question has a higher than average abandonment rate. Consider simplifying the question or making it optional.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        display: 'flex',
        justifyContent: 'space-around',
        gap: '16px',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Total Started</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>{totalStarted}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Avg. Completion</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#86efac' }}>
            {Math.round((steps[steps.length - 1]?.completed / totalStarted) * 100)}%
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Total Dropoffs</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#fca5a5' }}>
            {steps.reduce((sum, step) => sum + step.abandoned, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};
