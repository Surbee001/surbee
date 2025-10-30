import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Shield, ChevronDown, ChevronUp, Copy, Zap, Clock, Hash } from 'lucide-react';

interface QuestionAccuracy {
  questionId: string;
  questionText: string;
  accuracyScore: number;
  issues: {
    type: 'spam' | 'copy-paste' | 'too-quick' | 'pattern';
    description: string;
    severity: 'low' | 'medium' | 'high';
    affectedResponses: number;
  }[];
}

interface AccuracyDetectorProps {
  overallAccuracy: number;
  questionAccuracy: QuestionAccuracy[];
  totalResponses: number;
  flaggedResponses: number;
}

// Mock data
const mockData: AccuracyDetectorProps = {
  overallAccuracy: 78,
  totalResponses: 154,
  flaggedResponses: 34,
  questionAccuracy: [
    {
      questionId: 'q1',
      questionText: 'What is your primary goal?',
      accuracyScore: 92,
      issues: [
        {
          type: 'too-quick',
          description: '5 responses answered in under 2 seconds',
          severity: 'medium',
          affectedResponses: 5,
        },
      ],
    },
    {
      questionId: 'q2',
      questionText: 'How satisfied are you?',
      accuracyScore: 65,
      issues: [
        {
          type: 'spam',
          description: '18 responses selected the same option consecutively (pattern detected)',
          severity: 'high',
          affectedResponses: 18,
        },
        {
          type: 'pattern',
          description: '12 responses show A-B-C-D sequential pattern',
          severity: 'high',
          affectedResponses: 12,
        },
      ],
    },
    {
      questionId: 'q3',
      questionText: 'Tell us about your experience',
      accuracyScore: 72,
      issues: [
        {
          type: 'copy-paste',
          description: '8 responses appear to be copied from external sources',
          severity: 'high',
          affectedResponses: 8,
        },
        {
          type: 'spam',
          description: '6 responses contain repeated words (e.g., "good good good")',
          severity: 'medium',
          affectedResponses: 6,
        },
      ],
    },
    {
      questionId: 'q4',
      questionText: 'Would you recommend us?',
      accuracyScore: 88,
      issues: [
        {
          type: 'too-quick',
          description: '3 responses answered instantly',
          severity: 'low',
          affectedResponses: 3,
        },
      ],
    },
  ],
};

export const AccuracyDetector: React.FC<AccuracyDetectorProps> = ({
  overallAccuracy,
  questionAccuracy,
  totalResponses,
  flaggedResponses,
}) => {
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  const getAccuracyColor = (score: number) => {
    if (score >= 80) return 'white';
    if (score >= 60) return 'rgba(255, 255, 255, 0.7)';
    return 'rgba(255, 255, 255, 0.5)';
  };

  const getAccuracyLabel = (score: number) => {
    if (score >= 80) return 'High Quality';
    if (score >= 60) return 'Medium Quality';
    return 'Needs Review';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'rgba(255, 255, 255, 0.9)';
      case 'medium': return 'rgba(255, 255, 255, 0.7)';
      default: return 'rgba(255, 255, 255, 0.5)';
    }
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'spam': return <Hash className="h-4 w-4" />;
      case 'copy-paste': return <Copy className="h-4 w-4" />;
      case 'too-quick': return <Zap className="h-4 w-4" />;
      case 'pattern': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div>
      {/* Overall Accuracy Card */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 8px 0' }}>
              Response Quality Score
            </h3>
            <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', margin: 0 }}>
              AI-powered detection of spam, patterns, and low-quality responses
            </p>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '40px', fontWeight: '600', color: getAccuracyColor(overallAccuracy), lineHeight: 1 }}>
                {overallAccuracy}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                {getAccuracyLabel(overallAccuracy)}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          height: '8px',
          background: 'rgba(255, 255, 255, 0.08)',
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${overallAccuracy}%`,
            height: '100%',
            background: 'white',
            borderRadius: '4px',
            transition: 'width 0.3s ease',
          }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginTop: '20px',
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
              Total Responses
            </div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>
              {totalResponses}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
              Flagged Responses
            </div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: flaggedResponses > 20 ? 'rgba(255, 255, 255, 0.7)' : 'white' }}>
              {flaggedResponses}
            </div>
          </div>
        </div>
      </div>

      {/* Question-by-Question Accuracy */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '12px',
        padding: '24px',
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: '0 0 20px 0' }}>
          Question Accuracy Breakdown
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {questionAccuracy.map((question) => {
            const isExpanded = expandedQuestion === question.questionId;

            return (
              <div key={question.questionId}>
                <div
                  onClick={() => setExpandedQuestion(isExpanded ? null : question.questionId)}
                  style={{
                    padding: '16px',
                    background: isExpanded ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: 'white', marginBottom: '4px' }}>
                        {question.questionText}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                        }}>
                          <Shield className="h-3 w-3" style={{ color: getAccuracyColor(question.accuracyScore) }} />
                          <span style={{ fontSize: '12px', fontWeight: '600', color: getAccuracyColor(question.accuracyScore) }}>
                            {question.accuracyScore}% Accuracy
                          </span>
                        </div>
                        {question.issues.length > 0 && (
                          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                            {question.issues.length} issue{question.issues.length > 1 ? 's' : ''} detected
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      ) : (
                        <ChevronDown className="h-4 w-4" style={{ color: 'rgba(255, 255, 255, 0.4)' }} />
                      )}
                    </div>
                  </div>

                  {/* Accuracy Bar */}
                  <div style={{
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${question.accuracyScore}%`,
                      height: '100%',
                      background: getAccuracyColor(question.accuracyScore),
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>

                {/* Expanded Issues */}
                {isExpanded && question.issues.length > 0 && (
                  <div style={{
                    marginTop: '8px',
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '8px',
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '12px' }}>
                      Detected Issues:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {question.issues.map((issue, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px',
                          padding: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '6px',
                        }}>
                          <div style={{
                            color: getSeverityColor(issue.severity),
                            marginTop: '2px',
                            flexShrink: 0,
                          }}>
                            {getIssueIcon(issue.type)}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '4px',
                            }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: getSeverityColor(issue.severity),
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}>
                                {issue.type.replace('-', ' ')}
                              </span>
                              <span style={{
                                padding: '2px 6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '4px',
                                fontSize: '10px',
                                color: getSeverityColor(issue.severity),
                                textTransform: 'uppercase',
                              }}>
                                {issue.severity}
                              </span>
                            </div>
                            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '6px' }}>
                              {issue.description}
                            </div>
                            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}>
                              Affects {issue.affectedResponses} response{issue.affectedResponses > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '6px',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: 'white', marginBottom: '6px' }}>
                        💡 Recommendations:
                      </div>
                      <ul style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        margin: 0,
                        paddingLeft: '20px',
                        lineHeight: '1.6',
                      }}>
                        {question.issues.some(i => i.type === 'spam') && (
                          <li>Consider adding attention check questions to filter spam</li>
                        )}
                        {question.issues.some(i => i.type === 'copy-paste') && (
                          <li>Rephrase question to discourage copy-pasted responses</li>
                        )}
                        {question.issues.some(i => i.type === 'too-quick') && (
                          <li>Add minimum time requirement or attention verification</li>
                        )}
                        {question.issues.some(i => i.type === 'pattern') && (
                          <li>Randomize answer options to prevent pattern-based responses</li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Export with mock data for demo
export const AccuracyDetectorDemo = () => <AccuracyDetector {...mockData} />;
