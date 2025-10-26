import React, { useState } from 'react';
import { Smile, Meh, Frown, TrendingUp, TrendingDown, Quote } from 'lucide-react';

interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

interface SentimentTrend {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

interface SampleQuote {
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
}

interface SentimentAnalysisProps {
  questionText: string;
  totalResponses: number;
  sentiment: SentimentData;
  trend?: SentimentTrend[];
  sampleQuotes?: SampleQuote[];
}

export const SentimentAnalysis: React.FC<SentimentAnalysisProps> = ({
  questionText,
  totalResponses,
  sentiment,
  trend = [],
  sampleQuotes = []
}) => {
  const [selectedSentiment, setSelectedSentiment] = useState<'positive' | 'neutral' | 'negative' | null>(null);

  const getSentimentColor = (type: 'positive' | 'neutral' | 'negative') => {
    switch (type) {
      case 'positive':
        return '#86efac';
      case 'negative':
        return '#fca5a5';
      default:
        return '#93c5fd';
    }
  };

  const getSentimentIcon = (type: 'positive' | 'neutral' | 'negative') => {
    switch (type) {
      case 'positive':
        return <Smile className="h-5 w-5" />;
      case 'negative':
        return <Frown className="h-5 w-5" />;
      default:
        return <Meh className="h-5 w-5" />;
    }
  };

  const getTrendDirection = () => {
    if (trend.length < 2) return null;
    const recent = trend[trend.length - 1];
    const previous = trend[trend.length - 2];
    const recentPositive = recent.positive / (recent.positive + recent.neutral + recent.negative);
    const previousPositive = previous.positive / (previous.positive + previous.neutral + previous.negative);

    if (recentPositive > previousPositive) return 'up';
    if (recentPositive < previousPositive) return 'down';
    return 'neutral';
  };

  const trendDirection = getTrendDirection();

  const filteredQuotes = selectedSentiment
    ? sampleQuotes.filter(q => q.sentiment === selectedSentiment)
    : sampleQuotes;

  return (
    <div style={{
      background: '#1a1a1a',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      borderRadius: '12px',
      padding: '24px',
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '24px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
            margin: '0',
          }}>
            {questionText}
          </h4>
          {trendDirection && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: trendDirection === 'up'
                ? 'rgba(134, 239, 172, 0.1)'
                : trendDirection === 'down'
                  ? 'rgba(252, 165, 165, 0.1)'
                  : 'rgba(173, 173, 173, 0.1)',
              borderRadius: '6px',
            }}>
              {trendDirection === 'up' && <TrendingUp className="h-4 w-4" style={{ color: '#86efac' }} />}
              {trendDirection === 'down' && <TrendingDown className="h-4 w-4" style={{ color: '#fca5a5' }} />}
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                color: trendDirection === 'up'
                  ? '#86efac'
                  : trendDirection === 'down'
                    ? '#fca5a5'
                    : '#adadad',
              }}>
                {trendDirection === 'up' ? 'Improving' : trendDirection === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          )}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#adadad',
        }}>
          {totalResponses} text responses analyzed
        </div>
      </div>

      {/* Sentiment Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {(['positive', 'neutral', 'negative'] as const).map((type) => {
          const count = sentiment[type];
          const percentage = Math.round((count / totalResponses) * 100);
          const isSelected = selectedSentiment === type;

          return (
            <button
              key={type}
              onClick={() => setSelectedSentiment(isSelected ? null : type)}
              style={{
                padding: '16px',
                background: isSelected ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isSelected ? getSentimentColor(type) : 'rgba(255, 255, 255, 0.08)'}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'center',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: '8px',
                color: getSentimentColor(type),
              }}>
                {getSentimentIcon(type)}
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '600',
                color: getSentimentColor(type),
                marginBottom: '4px',
              }}>
                {percentage}%
              </div>
              <div style={{
                fontSize: '12px',
                color: '#adadad',
                textTransform: 'capitalize',
              }}>
                {type}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#7a7a7a',
                marginTop: '4px',
              }}>
                {count} responses
              </div>
            </button>
          );
        })}
      </div>

      {/* Visual Bar */}
      <div style={{
        height: '48px',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        marginBottom: '24px',
        background: 'rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{
          width: `${Math.round((sentiment.positive / totalResponses) * 100)}%`,
          background: getSentimentColor('positive'),
          transition: 'width 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          {sentiment.positive > 0 && `${Math.round((sentiment.positive / totalResponses) * 100)}%`}
        </div>
        <div style={{
          width: `${Math.round((sentiment.neutral / totalResponses) * 100)}%`,
          background: getSentimentColor('neutral'),
          transition: 'width 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          {sentiment.neutral > 0 && `${Math.round((sentiment.neutral / totalResponses) * 100)}%`}
        </div>
        <div style={{
          width: `${Math.round((sentiment.negative / totalResponses) * 100)}%`,
          background: getSentimentColor('negative'),
          transition: 'width 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: '600',
        }}>
          {sentiment.negative > 0 && `${Math.round((sentiment.negative / totalResponses) * 100)}%`}
        </div>
      </div>

      {/* Sentiment Trend Over Time */}
      {trend.length > 0 && (
        <div style={{
          marginBottom: '24px',
        }}>
          <h5 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#adadad',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Sentiment Trend
          </h5>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '4px',
            height: '100px',
            padding: '8px 0',
          }}>
            {trend.map((data, index) => {
              const total = data.positive + data.neutral + data.negative;
              const positiveHeight = (data.positive / total) * 100;

              return (
                <div key={index} style={{
                  flex: 1,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  gap: '1px',
                }}>
                  <div style={{
                    height: `${positiveHeight}%`,
                    background: getSentimentColor('positive'),
                    borderRadius: '2px',
                    minHeight: data.positive > 0 ? '4px' : '0',
                    transition: 'height 0.3s ease',
                  }} />
                  <div style={{
                    height: `${(data.neutral / total) * 100}%`,
                    background: getSentimentColor('neutral'),
                    borderRadius: '2px',
                    minHeight: data.neutral > 0 ? '4px' : '0',
                    transition: 'height 0.3s ease',
                  }} />
                  <div style={{
                    height: `${(data.negative / total) * 100}%`,
                    background: getSentimentColor('negative'),
                    borderRadius: '2px',
                    minHeight: data.negative > 0 ? '4px' : '0',
                    transition: 'height 0.3s ease',
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#7a7a7a',
            marginTop: '8px',
          }}>
            <span>{trend[0]?.date}</span>
            <span>{trend[trend.length - 1]?.date}</span>
          </div>
        </div>
      )}

      {/* Sample Quotes */}
      {filteredQuotes.length > 0 && (
        <div>
          <h5 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#adadad',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Sample Responses {selectedSentiment && `(${selectedSentiment})`}
          </h5>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            {filteredQuotes.slice(0, 3).map((quote, index) => (
              <div key={index} style={{
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderLeft: `3px solid ${getSentimentColor(quote.sentiment)}`,
                borderRadius: '6px',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                }}>
                  <Quote className="h-4 w-4 flex-shrink-0" style={{
                    color: getSentimentColor(quote.sentiment),
                    marginTop: '2px',
                  }} />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: '13px',
                      color: 'white',
                      margin: '0 0 8px 0',
                      lineHeight: '1.5',
                    }}>
                      {quote.text}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      <span style={{
                        fontSize: '11px',
                        color: getSentimentColor(quote.sentiment),
                        textTransform: 'capitalize',
                      }}>
                        {quote.sentiment}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        color: '#7a7a7a',
                      }}>
                        {quote.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
