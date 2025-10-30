import React, { useState } from 'react';
import {
  Download,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Activity,
  Target,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { AIInsightsCard } from './AIInsightsCard';

interface ResultsTabProps {
  projectId: string;
}

interface Response {
  id: string;
  submittedAt: Date;
  completionTime: number; // minutes
  deviceType: 'desktop' | 'mobile' | 'tablet';
  status: 'completed' | 'partial' | 'abandoned';
  responses: Record<string, any>;
  qualityScore?: number;
  aiSummary?: string;
}

// Mock data - replace with real API call
const mockResponses: Response[] = [
  {
    id: '1',
    submittedAt: new Date('2025-01-20T14:30:00'),
    completionTime: 3.5,
    deviceType: 'desktop',
    status: 'completed',
    responses: { q1: 'Very satisfied with the product. The interface is intuitive and the features are exactly what I needed. Would definitely recommend to colleagues.', q2: 'Would recommend to others' },
    qualityScore: 95,
    aiSummary: 'Highly positive feedback focusing on product satisfaction and user interface design. Strong recommendation intent.'
  },
  {
    id: '2',
    submittedAt: new Date('2025-01-20T15:45:00'),
    completionTime: 5.2,
    deviceType: 'mobile',
    status: 'completed',
    responses: { q1: 'Good experience overall, but there are some areas that could be improved, particularly the mobile responsiveness.', q2: 'Needs improvement in some areas' },
    qualityScore: 82,
    aiSummary: 'Generally positive with constructive criticism. Main concern is mobile experience optimization.'
  },
  {
    id: '3',
    submittedAt: new Date('2025-01-19T10:15:00'),
    completionTime: 2.1,
    deviceType: 'tablet',
    status: 'partial',
    responses: { q1: 'Satisfied' },
    qualityScore: 65,
  },
];

const mockAIInsights = [
  {
    type: 'theme' as const,
    title: 'Product Satisfaction',
    description: '87% of responses express high satisfaction with the product\'s core features and usability.',
    confidence: 92,
    trend: 'up' as const,
  },
  {
    type: 'pattern' as const,
    title: 'Mobile Experience Concerns',
    description: 'Multiple users mentioned issues with mobile responsiveness, suggesting a need for optimization.',
    confidence: 85,
    trend: 'neutral' as const,
  },
  {
    type: 'sentiment' as const,
    title: 'Strong Recommendations',
    description: 'Users with completion time between 3-5 minutes show 95% likelihood to recommend.',
    confidence: 88,
    trend: 'up' as const,
  },
];

export const ResultsTab: React.FC<ResultsTabProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial' | 'abandoned'>('all');
  const [showAISummary, setShowAISummary] = useState<Record<string, boolean>>({});

  const filteredResponses = mockResponses.filter(response => {
    if (statusFilter !== 'all' && response.status !== statusFilter) return false;
    return true;
  });

  const handleExport = () => {
    console.log('Exporting responses...');
  };

  const toggleResponseDetails = (id: string) => {
    setSelectedResponse(selectedResponse === id ? null : id);
  };

  const toggleAISummary = (id: string) => {
    setShowAISummary(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'results-status-badge completed';
      case 'partial':
        return 'results-status-badge partial';
      case 'abandoned':
        return 'results-status-badge abandoned';
      default:
        return 'results-status-badge';
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return '#86efac';
    if (score >= 60) return '#fcd34d';
    return '#fca5a5';
  };

  // Calculate statistics
  const totalViews = 250;
  const totalResponses = mockResponses.length;
  const completedResponses = mockResponses.filter(r => r.status === 'completed').length;
  const responseRate = Math.round((totalResponses / totalViews) * 100);
  const completionRate = Math.round((completedResponses / totalResponses) * 100);
  const avgCompletionTime = (mockResponses.reduce((acc, r) => acc + r.completionTime, 0) / totalResponses).toFixed(1);
  const avgQualityScore = Math.round(mockResponses.reduce((acc, r) => acc + (r.qualityScore || 0), 0) / totalResponses);

  return (
    <div className="results-tab">
      {/* Quick Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {/* Response Rate */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(134, 239, 172, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Target className="h-5 w-5" style={{ color: '#86efac' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Response Rate</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>{responseRate}%</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#86efac' }}>
            {totalResponses} of {totalViews} views
          </div>
        </div>

        {/* Completion Rate */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(147, 197, 253, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <CheckCircle2 className="h-5 w-5" style={{ color: '#93c5fd' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Completion Rate</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>{completionRate}%</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#93c5fd' }}>
            <TrendingUp className="h-3 w-3 inline mr-1" />
            +5% from last week
          </div>
        </div>

        {/* Avg. Completion Time */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'rgba(252, 211, 77, 0.1)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Clock className="h-5 w-5" style={{ color: '#fcd34d' }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Avg. Time</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>{avgCompletionTime}m</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#adadad' }}>
            Optimal range: 2-5 min
          </div>
        </div>

        {/* Data Quality Score */}
        <div style={{
          background: '#1a1a1a',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: `rgba(${avgQualityScore >= 80 ? '134, 239, 172' : avgQualityScore >= 60 ? '252, 211, 77' : '252, 165, 165'}, 0.1)`,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Zap className="h-5 w-5" style={{ color: getQualityColor(avgQualityScore) }} />
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#adadad', marginBottom: '4px' }}>Quality Score</div>
              <div style={{ fontSize: '24px', fontWeight: '600', color: 'white' }}>{avgQualityScore}/100</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: getQualityColor(avgQualityScore) }}>
            {avgQualityScore >= 80 ? 'Excellent' : avgQualityScore >= 60 ? 'Good' : 'Needs attention'}
          </div>
        </div>
      </div>

      {/* AI-Powered Insights Section */}
      <AIInsightsCard
        responseCount={totalResponses}
        insights={mockAIInsights}
        overallSentiment={{
          positive: 65,
          neutral: 25,
          negative: 10,
        }}
        keywords={[
          { word: 'satisfied', count: 12 },
          { word: 'intuitive', count: 8 },
          { word: 'mobile', count: 7 },
          { word: 'recommend', count: 15 },
          { word: 'improvement', count: 5 },
        ]}
      />

      {/* Response Quality Dashboard */}
      <div style={{
        marginBottom: '32px',
      }}>
        <h3 className="section-title">Response Quality Dashboard</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {/* Device Breakdown */}
          <div style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#adadad',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Device Breakdown
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'white' }}>
                    <Monitor className="h-4 w-4" />
                    Desktop
                  </div>
                  <span style={{ fontSize: '13px', color: '#adadad' }}>50%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '50%', height: '100%', background: '#86efac', transition: 'width 0.3s ease' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'white' }}>
                    <Smartphone className="h-4 w-4" />
                    Mobile
                  </div>
                  <span style={{ fontSize: '13px', color: '#adadad' }}>35%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '35%', height: '100%', background: '#93c5fd', transition: 'width 0.3s ease' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'white' }}>
                    <Tablet className="h-4 w-4" />
                    Tablet
                  </div>
                  <span style={{ fontSize: '13px', color: '#adadad' }}>15%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: '15%', height: '100%', background: '#fcd34d', transition: 'width 0.3s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Response Length */}
          <div style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#adadad',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Response Length
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              height: '80px',
            }}>
              {[32, 58, 45, 72, 65, 48].map((height, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: `${height}%`,
                  background: 'rgba(147, 197, 253, 0.3)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(147, 197, 253, 0.5)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(147, 197, 253, 0.3)'}
                />
              ))}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '12px',
              fontSize: '11px',
              color: '#7a7a7a',
            }}>
              <span>Short</span>
              <span>Long</span>
            </div>
          </div>

          {/* Completion Time Distribution */}
          <div style={{
            background: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '20px',
          }}>
            <h4 style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#adadad',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              Time Distribution
            </h4>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '80px',
              position: 'relative',
            }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: `conic-gradient(
                  #86efac 0deg ${120}deg,
                  #93c5fd ${120}deg ${240}deg,
                  #fca5a5 ${240}deg 360deg
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: '#1a1a1a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <div style={{ fontSize: '20px', fontWeight: '600', color: 'white' }}>3.5m</div>
                  <div style={{ fontSize: '10px', color: '#adadad' }}>Average</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responses Section */}
      <div className="responses-section">
        <div className="responses-header">
          <h3 className="section-title">Individual Responses</h3>
          <button onClick={handleExport} className="results-export-btn">
            <Download className="h-4 w-4" />
            <span>Export with AI Summaries</span>
          </button>
        </div>

        {/* Filters */}
        <div className="results-filters">
          <div className="results-search">
            <Search className="h-4 w-4 results-search-icon" />
            <input
              type="text"
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="results-search-input"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="results-filter-select"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="partial">Partial</option>
            <option value="abandoned">Abandoned</option>
          </select>
        </div>

        {/* Responses Table */}
        {filteredResponses.length > 0 ? (
          <div className="results-table">
            {filteredResponses.map((response) => (
              <div key={response.id} className="results-row-wrapper">
                <div
                  className="results-row"
                  onClick={() => toggleResponseDetails(response.id)}
                >
                  <div className="results-cell">
                    <User className="h-4 w-4 results-cell-icon" />
                    <span>Response #{response.id}</span>
                  </div>
                  <div className="results-cell">
                    <Clock className="h-4 w-4 results-cell-icon" />
                    <span>{format(response.submittedAt, 'MMM d, yyyy h:mm a')}</span>
                  </div>
                  <div className="results-cell">
                    {getDeviceIcon(response.deviceType)}
                    <span className="capitalize">{response.deviceType}</span>
                  </div>
                  <div className="results-cell">
                    <span className={getStatusBadgeClass(response.status)}>
                      {response.status}
                    </span>
                  </div>
                  <div className="results-cell">
                    <span>{response.completionTime} min</span>
                  </div>
                  {response.qualityScore && (
                    <div className="results-cell">
                      <div style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: `${getQualityColor(response.qualityScore)}20`,
                        color: getQualityColor(response.qualityScore),
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        {response.qualityScore}
                      </div>
                    </div>
                  )}
                  <div className="results-cell results-cell-expand">
                    {selectedResponse === response.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedResponse === response.id && (
                  <div className="results-details">
                    {/* AI Summary */}
                    {response.aiSummary && (
                      <div style={{
                        marginBottom: '20px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, rgba(106, 165, 194, 0.05), rgba(255, 109, 103, 0.05))',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '8px',
                      }}>
                        <button
                          onClick={() => toggleAISummary(response.id)}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0',
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}>
                            <Sparkles className="h-4 w-4" style={{ color: '#6aa5c2' }} />
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>AI Summary</span>
                          </div>
                          {showAISummary[response.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                        {showAISummary[response.id] && (
                          <p style={{
                            marginTop: '12px',
                            fontSize: '13px',
                            color: '#adadad',
                            lineHeight: '1.6',
                            paddingLeft: '28px',
                          }}>
                            {response.aiSummary}
                          </p>
                        )}
                      </div>
                    )}

                    <h4 className="results-details-title">Response Details</h4>
                    <div className="results-details-content">
                      {Object.entries(response.responses).map(([question, answer], idx) => (
                        <div key={idx} className="results-detail-item">
                          <div className="results-detail-question">Question {idx + 1}:</div>
                          <div className="results-detail-answer">{answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="results-empty">
            <User className="h-16 w-16" />
            <h3 className="results-empty-title">No responses yet</h3>
            <p className="results-empty-description">
              Share your survey to start collecting responses
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
