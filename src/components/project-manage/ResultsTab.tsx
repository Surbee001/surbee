import React, { useState } from 'react';
import { Download, Search, Filter, ChevronDown, ChevronUp, User, Clock, Monitor, Smartphone, Tablet, Sparkles, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

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
}

// Mock data - replace with real API call
const mockResponses: Response[] = [
  {
    id: '1',
    submittedAt: new Date('2025-01-20T14:30:00'),
    completionTime: 3.5,
    deviceType: 'desktop',
    status: 'completed',
    responses: { q1: 'Very satisfied with the product', q2: 'Would recommend to others' }
  },
  {
    id: '2',
    submittedAt: new Date('2025-01-20T15:45:00'),
    completionTime: 5.2,
    deviceType: 'mobile',
    status: 'completed',
    responses: { q1: 'Good experience overall', q2: 'Needs improvement in some areas' }
  },
  {
    id: '3',
    submittedAt: new Date('2025-01-19T10:15:00'),
    completionTime: 2.1,
    deviceType: 'tablet',
    status: 'partial',
    responses: { q1: 'Satisfied' }
  },
];

export const ResultsTab: React.FC<ResultsTabProps> = ({ projectId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResponse, setSelectedResponse] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'partial' | 'abandoned'>('all');

  const filteredResponses = mockResponses.filter(response => {
    if (statusFilter !== 'all' && response.status !== statusFilter) return false;
    return true;
  });

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting responses...');
  };

  const toggleResponseDetails = (id: string) => {
    setSelectedResponse(selectedResponse === id ? null : id);
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

  return (
    <div className="results-tab">
      {/* Smart Insights Section */}
      <div className="smart-insights-section">
        <div className="smart-insights-header">
          <div className="smart-insights-title">
            <Sparkles className="h-5 w-5" />
            <h3>Smart Insights</h3>
          </div>
          <span className="smart-insights-badge">AI-Powered</span>
        </div>
        <div className="smart-insights-empty">
          <div className="smart-insights-empty-icon">
            <Sparkles className="h-12 w-12" />
          </div>
          <p className="smart-insights-empty-text">
            AI-powered insights will appear here once you have enough responses
          </p>
          <p className="smart-insights-empty-subtext">
            Minimum 10 responses required for meaningful insights
          </p>
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h3 className="section-title">Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon trending">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div className="insight-content">
              <h4 className="insight-title">Response Trend</h4>
              <p className="insight-value">+15% this week</p>
              <p className="insight-description">Compared to last 7 days</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="insight-content">
              <h4 className="insight-title">Completion Quality</h4>
              <p className="insight-value">High</p>
              <p className="insight-description">Most responses are complete</p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon warning">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="insight-content">
              <h4 className="insight-title">Drop-off Point</h4>
              <p className="insight-value">Question 3</p>
              <p className="insight-description">Consider simplifying</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="summary-section">
        <h3 className="section-title">Summary</h3>
        <div className="results-summary">
          <div className="results-card">
            <div className="results-card-label">Total Responses</div>
            <div className="results-card-value">{mockResponses.length}</div>
            <div className="results-card-change positive">+{mockResponses.length} this week</div>
          </div>
          <div className="results-card">
            <div className="results-card-label">Completion Rate</div>
            <div className="results-card-value">
              {Math.round((mockResponses.filter(r => r.status === 'completed').length / mockResponses.length) * 100)}%
            </div>
            <div className="results-card-change positive">+5% from last week</div>
          </div>
          <div className="results-card">
            <div className="results-card-label">Avg. Completion Time</div>
            <div className="results-card-value">
              {(mockResponses.reduce((acc, r) => acc + r.completionTime, 0) / mockResponses.length).toFixed(1)} min
            </div>
            <div className="results-card-change neutral">Same as last week</div>
          </div>
          <div className="results-card">
            <div className="results-card-label">Last Response</div>
            <div className="results-card-value">
              {mockResponses.length > 0 ? format(new Date(mockResponses[0].submittedAt), 'MMM d, h:mm a') : 'N/A'}
            </div>
            <div className="results-card-change">2 hours ago</div>
          </div>
        </div>
      </div>

      {/* Responses Section */}
      <div className="responses-section">
        <div className="responses-header">
          <h3 className="section-title">Responses</h3>
          <button onClick={handleExport} className="results-export-btn">
            <Download className="h-4 w-4" />
            <span>Export</span>
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
