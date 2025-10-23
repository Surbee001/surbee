import React, { useState } from 'react';
import { TrendingUp, Users, Clock, CheckCircle, BarChart3 } from 'lucide-react';

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
    type: 'multiple_choice',
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
    type: 'rating',
    responses: 150,
    skipRate: 5.2,
    avgRating: 4.2,
  },
];

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ projectId }) => {
  const [view, setView] = useState<'summary' | 'detailed'>('summary');

  return (
    <div className="analytics-tab">
      {/* View Toggle */}
      <div className="analytics-view-toggle">
        <button
          onClick={() => setView('summary')}
          className={`analytics-toggle-btn ${view === 'summary' ? 'active' : ''}`}
        >
          Summary
        </button>
        <button
          onClick={() => setView('detailed')}
          className={`analytics-toggle-btn ${view === 'detailed' ? 'active' : ''}`}
        >
          Detailed
        </button>
      </div>

      {view === 'summary' ? (
        <>
          {/* Summary Metrics */}
          <div className="analytics-metrics">
            <div className="analytics-metric-card">
              <div className="analytics-metric-icon">
                <Users className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Total Views</div>
                <div className="analytics-metric-value">1,234</div>
                <div className="analytics-metric-change positive">+12% from last week</div>
              </div>
            </div>

            <div className="analytics-metric-card">
              <div className="analytics-metric-icon">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Responses</div>
                <div className="analytics-metric-value">154</div>
                <div className="analytics-metric-change positive">+8% from last week</div>
              </div>
            </div>

            <div className="analytics-metric-card">
              <div className="analytics-metric-icon">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Completion Rate</div>
                <div className="analytics-metric-value">67%</div>
                <div className="analytics-metric-change negative">-3% from last week</div>
              </div>
            </div>

            <div className="analytics-metric-card">
              <div className="analytics-metric-icon">
                <Clock className="h-5 w-5" />
              </div>
              <div className="analytics-metric-content">
                <div className="analytics-metric-label">Avg. Time</div>
                <div className="analytics-metric-value">3.5 min</div>
                <div className="analytics-metric-change neutral">No change</div>
              </div>
            </div>
          </div>

          {/* Response Trend Chart */}
          <div className="analytics-chart-section">
            <h3 className="analytics-section-title">Response Trend (Last 30 Days)</h3>
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
                  <div className="analytics-breakdown-fill" style={{ width: '60%' }} />
                </div>
                <div className="analytics-breakdown-value">60%</div>
              </div>
              <div className="analytics-breakdown-item">
                <div className="analytics-breakdown-label">Mobile</div>
                <div className="analytics-breakdown-bar">
                  <div className="analytics-breakdown-fill" style={{ width: '30%' }} />
                </div>
                <div className="analytics-breakdown-value">30%</div>
              </div>
              <div className="analytics-breakdown-item">
                <div className="analytics-breakdown-label">Tablet</div>
                <div className="analytics-breakdown-bar">
                  <div className="analytics-breakdown-fill" style={{ width: '10%' }} />
                </div>
                <div className="analytics-breakdown-value">10%</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Detailed Analytics - Per Question */}
          <div className="analytics-detailed">
            <h3 className="analytics-section-title">Question-by-Question Analytics</h3>

            {mockQuestionAnalytics.map((question) => (
              <div key={question.id} className="analytics-question-card">
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

                {question.type === 'rating' && (
                  <div className="analytics-rating">
                    <div className="analytics-rating-score">
                      <span className="analytics-rating-value">{question.avgRating}</span>
                      <span className="analytics-rating-label">Average Rating</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
