import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AIInsight {
  type: 'theme' | 'sentiment' | 'pattern' | 'keyword';
  title: string;
  description: string;
  confidence?: number;
  trend?: 'up' | 'down' | 'neutral';
}

interface AIInsightsCardProps {
  responseCount: number;
  insights?: AIInsight[];
  overallSentiment?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  keywords?: { word: string; count: number; }[];
  loading?: boolean;
}

export const AIInsightsCard: React.FC<AIInsightsCardProps> = ({
  responseCount,
  insights = [],
  overallSentiment,
  keywords = [],
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (type: string) => {
    switch (type) {
      case 'positive':
        return '#86efac';
      case 'negative':
        return '#fca5a5';
      default:
        return '#93c5fd';
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(106, 165, 194, 0.05), rgba(255, 109, 103, 0.05))',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '32px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isExpanded ? '20px' : '0',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'white',
        }}>
          <Sparkles className="h-5 w-5" style={{ color: '#6aa5c2' }} />
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            margin: '0',
          }}>
            AI-Powered Insights
          </h3>
          <span style={{
            padding: '4px 10px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            fontSize: '11px',
            fontWeight: '600',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            AI-Enhanced
          </span>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
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
          {isExpanded ? 'Hide Insights' : `View AI Insights from ${responseCount} responses`}
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}>
          {loading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              textAlign: 'center',
            }}>
              <Sparkles className="h-12 w-12 animate-pulse" style={{ color: '#adadad', opacity: 0.5, marginBottom: '16px' }} />
              <p style={{ fontSize: '15px', color: 'white', marginBottom: '8px', fontWeight: '500' }}>
                Analyzing responses...
              </p>
              <p style={{ fontSize: '13px', color: '#adadad' }}>
                AI is processing your data to generate insights
              </p>
            </div>
          ) : responseCount < 10 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              textAlign: 'center',
            }}>
              <Sparkles className="h-12 w-12" style={{ color: '#adadad', opacity: 0.5, marginBottom: '16px' }} />
              <p style={{ fontSize: '15px', color: 'white', marginBottom: '8px', fontWeight: '500' }}>
                AI-powered insights will appear here once you have enough responses
              </p>
              <p style={{ fontSize: '13px', color: '#adadad' }}>
                Minimum 10 responses required for meaningful insights
              </p>
            </div>
          ) : (
            <>
              {/* Sentiment Breakdown */}
              {overallSentiment && (
                <div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#adadad',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Overall Sentiment
                  </h4>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px',
                  }}>
                    {/* Sentiment Bars */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        height: '32px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: 'rgba(0, 0, 0, 0.2)',
                      }}>
                        <div style={{
                          width: `${overallSentiment.positive}%`,
                          background: getSentimentColor('positive'),
                          transition: 'width 0.3s ease',
                        }} />
                        <div style={{
                          width: `${overallSentiment.neutral}%`,
                          background: getSentimentColor('neutral'),
                          transition: 'width 0.3s ease',
                        }} />
                        <div style={{
                          width: `${overallSentiment.negative}%`,
                          background: getSentimentColor('negative'),
                          transition: 'width 0.3s ease',
                        }} />
                      </div>
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    justifyContent: 'space-around',
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: getSentimentColor('positive') }}>
                        {overallSentiment.positive}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#adadad' }}>Positive</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: getSentimentColor('neutral') }}>
                        {overallSentiment.neutral}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#adadad' }}>Neutral</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '600', color: getSentimentColor('negative') }}>
                        {overallSentiment.negative}%
                      </div>
                      <div style={{ fontSize: '12px', color: '#adadad' }}>Negative</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Insights */}
              {insights.length > 0 && (
                <div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#adadad',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Key Themes
                  </h4>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '12px',
                  }}>
                    {insights.map((insight, index) => (
                      <div key={index} style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                        }}>
                          <span style={{
                            fontSize: '14px',
                            fontWeight: '600',
                            color: 'white',
                          }}>
                            {insight.title}
                          </span>
                          {getTrendIcon(insight.trend)}
                        </div>
                        <p style={{
                          fontSize: '13px',
                          color: '#adadad',
                          margin: '0',
                          lineHeight: '1.5',
                        }}>
                          {insight.description}
                        </p>
                        {insight.confidence && (
                          <div style={{
                            marginTop: '8px',
                            fontSize: '11px',
                            color: '#7a7a7a',
                          }}>
                            Confidence: {insight.confidence}%
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {keywords.length > 0 && (
                <div>
                  <h4 style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#adadad',
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>
                    Common Keywords
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                  }}>
                    {keywords.map((keyword, index) => (
                      <span key={index} style={{
                        padding: '6px 12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        fontSize: '13px',
                        fontWeight: '500',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                      }}>
                        {keyword.word}
                        <span style={{
                          marginLeft: '6px',
                          color: '#adadad',
                          fontSize: '11px',
                        }}>
                          ({keyword.count})
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
