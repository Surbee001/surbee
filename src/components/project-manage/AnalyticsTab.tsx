import React, { useState } from 'react';
import {
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  BarChart3,
  Download,
  FileText,
  Target,
  Activity,
  Brain,
  Filter,
  Eye
} from 'lucide-react';
import { CompletionFunnel } from './CompletionFunnel';
import { SentimentAnalysis } from './SentimentAnalysis';

interface AnalyticsTabProps {
  projectId: string;
}

// Mock analytics data
const mockTimelineData = Array.from({ length: 30 }, (_, i) => ({
  date: `Day ${i + 1}`,
  responses: Math.floor(Math.random() * 50) + 10,
}));

const mockQuestionAnalytics = [
  {
    id: 'q1',
    question: 'What is your primary goal?',
    type: 'multiple_choice' as const,
    responses: 154,
    skipRate: 2.5,
    options: [
      { label: 'Option A', count: 65, percentage: 42 },
      { label: 'Option B', count: 45, percentage: 29 },
      { label: 'Option C', count: 30, percentage: 19 },
      { label: 'Option D', count: 14, percentage: 9 },
    ]
  },
  {
    id: 'q2',
    question: 'How satisfied are you?',
    type: 'rating' as const,
    responses: 150,
    skipRate: 5.2,
    avgRating: 4.2,
  },
  {
    id: 'q3',
    question: 'Tell us about your experience',
    type: 'text' as const,
    responses: 142,
    skipRate: 8.1,
    sentiment: {
      positive: 92,
      neutral: 35,
      negative: 15,
    },
    avgResponseLength: 87,
  },
];

const mockFunnelData = [
  {
    questionId: 'q1',
    questionText: 'What is your primary goal?',
    questionNumber: 1,
    started: 250,
    completed: 244,
    abandoned: 6,
    avgTimeSeconds: 12,
  },
  {
    questionId: 'q2',
    questionText: 'How satisfied are you with the product?',
    questionNumber: 2,
    started: 244,
    completed: 230,
    abandoned: 14,
    avgTimeSeconds: 18,
  },
  {
    questionId: 'q3',
    questionText: 'Tell us about your experience',
    questionNumber: 3,
    started: 230,
    completed: 195,
    abandoned: 35,
    avgTimeSeconds: 125,
  },
  {
    questionId: 'q4',
    questionText: 'Would you recommend us?',
    questionNumber: 4,
    started: 195,
    completed: 182,
    abandoned: 13,
    avgTimeSeconds: 8,
  },
];

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ projectId }) => {
  const [view, setView] = useState<'overview' | 'deepdive'>('overview');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  const handleExportReport = () => {
    console.log('Generating research report...');
    alert('Report generation started! This would create a comprehensive PDF/DOCX with all analytics, charts, and insights.');
  };

  const handleExportData = () => {
    console.log('Exporting analytics data...');
    // Create CSV
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Views', '1,234'],
      ['Total Responses', '154'],
      ['Completion Rate', '67%'],
      ['Avg. Time', '3.5 min'],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'analytics-export.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="analytics-tab">
      {/* View Toggle & Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div className="analytics-view-toggle">
          <button
            onClick={() => setView('overview')}
            className={`analytics-toggle-btn ${view === 'overview' ? 'active' : ''}`}
          >
            <Eye className="h-4 w-4 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setView('deepdive')}
            className={`analytics-toggle-btn ${view === 'deepdive' ? 'active' : ''}`}
          >
            <Brain className="h-4 w-4 mr-2" />
            Deep Dive
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            style={{
              padding: '10px 16px',
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={handleExportData}
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
            Export CSV
          </button>

          <button
            onClick={handleExportReport}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: '#86efac',
              border: 'none',
              color: '#0f0f0f',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#6ee896'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#86efac'}
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </button>
        </div>
      </div>

      {view === 'overview' ? (
        <>
          {/* Enhanced Metrics */}
          <div className="analytics-metrics">
            <div className="analytics-metric-card">
              <div className="analytics-metric-icon" style={{ background: 'rgba(134, 239, 172, 0.1)', color: '#86efac' }}>
                <Users className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Total Views</div>
                <div className="analytics-metric-value">1,234</div>
                <div className="analytics-metric-change positive">+12% from last week</div>
              </div>
            </div>

            <div className="analytics-metric-card">
              <div className="analytics-metric-icon" style={{ background: 'rgba(147, 197, 253, 0.1)', color: '#93c5fd' }}>
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Responses</div>
                <div className="analytics-metric-value">154</div>
                <div className="analytics-metric-change positive">+8% from last week</div>
              </div>
            </div>

            <div className="analytics-metric-card">
              <div className="analytics-metric-icon" style={{ background: 'rgba(252, 211, 77, 0.1)', color: '#fcd34d' }}>
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Completion Rate</div>
                <div className="analytics-metric-value">67%</div>
                <div className="analytics-metric-change negative">-3% from last week</div>
              </div>
            </div>

            <div className="analytics-metric-card">
              <div className="analytics-metric-icon" style={{ background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa' }}>
                <Clock className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Avg. Time</div>
                <div className="analytics-metric-value">3.5 min</div>
                <div className="analytics-metric-change neutral">No change</div>
              </div>
            </div>

            <div className="analytics-metric-card">
              <div className="analytics-metric-icon" style={{ background: 'rgba(134, 239, 172, 0.1)', color: '#86efac' }}>
                <Target className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Response Quality</div>
                <div className="analytics-metric-value">85</div>
                <div className="analytics-metric-change positive">High quality</div>
              </div>
            </div>

            <div className="analytics-metric-card">
              <div className="analytics-metric-icon" style={{ background: 'rgba(251, 146, 60, 0.1)', color: '#fb923c' }}>
                <Activity className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Engagement Score</div>
                <div className="analytics-metric-value">8.4/10</div>
                <div className="analytics-metric-change positive">Excellent</div>
              </div>
            </div>
          </div>

          {/* Completion Funnel */}
          <CompletionFunnel
            steps={mockFunnelData}
            totalStarted={250}
          />

          {/* Response Trend Chart */}
          <div className="analytics-chart-section">
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}>
              <h3 className="analytics-section-title">Response Trend (Last 30 Days)</h3>
              <div style={{
                display: 'flex',
                gap: '8px',
                padding: '4px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
              }}>
                {['Responses', 'Completion', 'Avg. Time'].map((metric) => (
                  <button
                    key={metric}
                    style={{
                      padding: '6px 12px',
                      background: metric === 'Responses' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {metric}
                  </button>
                ))}
              </div>
            </div>
            <div className="analytics-chart-container">
              <div className="analytics-chart">
                {mockTimelineData.map((data, index) => (
                  <div
                    key={index}
                    className="analytics-bar"
                    style={{
                      height: `${(data.responses / 60) * 100}%`,
                    }}
                    title={`${data.date}: ${data.responses} responses`}
                  />
                ))}
              </div>
              <div className="analytics-chart-labels">
                <span>30 days ago</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="analytics-breakdown-section">
            <h3 className="analytics-section-title">Device Breakdown</h3>
            <div className="analytics-breakdown-grid">
              <div className="analytics-breakdown-item">
                <div className="analytics-breakdown-label">Desktop</div>
                <div className="analytics-breakdown-bar">
                  <div className="analytics-breakdown-fill" style={{ width: '60%', background: '#86efac' }} />
                </div>
                <div className="analytics-breakdown-value">60%</div>
              </div>
              <div className="analytics-breakdown-item">
                <div className="analytics-breakdown-label">Mobile</div>
                <div className="analytics-breakdown-bar">
                  <div className="analytics-breakdown-fill" style={{ width: '30%', background: '#93c5fd' }} />
                </div>
                <div className="analytics-breakdown-value">30%</div>
              </div>
              <div className="analytics-breakdown-item">
                <div className="analytics-breakdown-label">Tablet</div>
                <div className="analytics-breakdown-bar">
                  <div className="analytics-breakdown-fill" style={{ width: '10%', background: '#fcd34d' }} />
                </div>
                <div className="analytics-breakdown-value">10%</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Deep Dive Mode */}
          <div className="analytics-detailed">
            <h3 className="analytics-section-title">Question-by-Question Analytics</h3>

            {mockQuestionAnalytics.map((question) => (
              <div key={question.id}>
                {question.type === 'text' && question.sentiment ? (
                  // Text question with sentiment analysis
                  <SentimentAnalysis
                    questionText={question.question}
                    totalResponses={question.responses}
                    sentiment={question.sentiment}
                    trend={[
                      { date: 'Week 1', positive: 20, neutral: 8, negative: 5 },
                      { date: 'Week 2', positive: 25, neutral: 10, negative: 3 },
                      { date: 'Week 3', positive: 28, neutral: 12, negative: 4 },
                      { date: 'Week 4', positive: 19, neutral: 5, negative: 3 },
                    ]}
                    sampleQuotes={[
                      {
                        text: 'The product is amazing! Very intuitive and easy to use. Would highly recommend to anyone looking for a solution.',
                        sentiment: 'positive',
                        confidence: 95,
                      },
                      {
                        text: 'It works well but could use some improvements in the mobile experience. Overall satisfied with the purchase.',
                        sentiment: 'neutral',
                        confidence: 88,
                      },
                      {
                        text: 'Had some issues with setup but customer support was very helpful in resolving them quickly.',
                        sentiment: 'positive',
                        confidence: 82,
                      },
                    ]}
                  />
                ) : (
                  // Multiple choice or rating question
                  <div className="analytics-question-card">
                    <div className="analytics-question-header">
                      <h4 className="analytics-question-title">{question.question}</h4>
                      <div className="analytics-question-meta">
                        <span>{question.responses} responses</span>
                        <span>•</span>
                        <span>{question.skipRate}% skip rate</span>
                      </div>
                    </div>

                    {question.type === 'multiple_choice' && question.options && (
                      <div className="analytics-options">
                        {question.options.map((option, index) => (
                          <div key={index} className="analytics-option-item">
                            <div className="analytics-option-header">
                              <span className="analytics-option-label">{option.label}</span>
                              <span className="analytics-option-count">{option.count} ({option.percentage}%)</span>
                            </div>
                            <div className="analytics-option-bar">
                              <div
                                className="analytics-option-fill"
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {question.type === 'rating' && 'avgRating' in question && (
                      <div className="analytics-rating">
                        <div className="analytics-rating-score">
                          <span className="analytics-rating-value">{question.avgRating}</span>
                          <span className="analytics-rating-label">Average Rating</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Response Patterns & Correlations */}
            <div style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '24px',
              marginTop: '24px',
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '16px',
              }}>
                Response Patterns & Correlations
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#adadad',
                marginBottom: '24px',
              }}>
                Discover how responses to different questions correlate with each other
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
              }}>
                <div style={{
                  padding: '16px',
                  background: 'rgba(134, 239, 172, 0.05)',
                  border: '1px solid rgba(134, 239, 172, 0.2)',
                  borderRadius: '8px',
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#86efac',
                    marginBottom: '8px',
                  }}>
                    Strong Positive Correlation
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#adadad',
                    lineHeight: '1.5',
                    margin: '0',
                  }}>
                    Users who rate satisfaction highly (Q2) are 87% more likely to select "Would recommend" (Q4)
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  background: 'rgba(147, 197, 253, 0.05)',
                  border: '1px solid rgba(147, 197, 253, 0.2)',
                  borderRadius: '8px',
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#93c5fd',
                    marginBottom: '8px',
                  }}>
                    Moderate Correlation
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#adadad',
                    lineHeight: '1.5',
                    margin: '0',
                  }}>
                    Users selecting "Option A" (Q1) tend to provide longer, more detailed responses in open-ended questions
                  </p>
                </div>

                <div style={{
                  padding: '16px',
                  background: 'rgba(252, 165, 165, 0.05)',
                  border: '1px solid rgba(252, 165, 165, 0.2)',
                  borderRadius: '8px',
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#fca5a5',
                    marginBottom: '8px',
                  }}>
                    Attention Point
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#adadad',
                    lineHeight: '1.5',
                    margin: '0',
                  }}>
                    Users who skip Q1 are 3x more likely to abandon the survey before completion
                  </p>
                </div>
              </div>
            </div>

            {/* Export Ready Reports Section */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(134, 239, 172, 0.05), rgba(147, 197, 253, 0.05))',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '32px',
              marginTop: '24px',
              textAlign: 'center',
            }}>
              <FileText className="h-12 w-12" style={{
                color: '#86efac',
                margin: '0 auto 16px',
              }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '12px',
              }}>
                Export-Ready Research Reports
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#adadad',
                marginBottom: '24px',
                maxWidth: '600px',
                margin: '0 auto 24px',
              }}>
                Generate comprehensive research reports with all analytics, charts, statistical tables, and methodology notes. Perfect for academic papers, presentations, and research documentation.
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
                <button
                  onClick={handleExportReport}
                  style={{
                    padding: '12px 24px',
                    background: 'white',
                    border: 'none',
                    color: '#0f0f0f',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Download className="h-4 w-4" />
                  PDF Report
                </button>
                <button
                  onClick={handleExportReport}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Download className="h-4 w-4" />
                  DOCX Report
                </button>
                <button
                  onClick={handleExportData}
                  style={{
                    padding: '12px 24px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <Download className="h-4 w-4" />
                  CSV Data
                </button>
              </div>
              <p style={{
                fontSize: '12px',
                color: '#7a7a7a',
                marginTop: '16px',
              }}>
                Includes APA/MLA citation formats • Statistical tables • Methodology notes • All visualizations
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
