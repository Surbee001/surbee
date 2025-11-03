"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter, Download, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

// Mock log data
const mockLogs = [
  {
    id: '1',
    timestamp: '2024-01-20 14:32:15',
    method: 'GET',
    endpoint: '/api/v1/surveys',
    status: 200,
    latency: '120ms',
    ip: '192.168.1.100',
    request: '{"limit": 10, "offset": 0}',
    response: '{"data": [...], "total": 42}'
  },
  {
    id: '2',
    timestamp: '2024-01-20 14:31:58',
    method: 'POST',
    endpoint: '/api/v1/responses',
    status: 201,
    latency: '305ms',
    ip: '192.168.1.101',
    request: '{"survey_id": "123", "answers": [...]}',
    response: '{"id": "resp_xyz", "created": true}'
  },
  {
    id: '3',
    timestamp: '2024-01-20 14:31:42',
    method: 'GET',
    endpoint: '/api/v1/analytics',
    status: 200,
    latency: '95ms',
    ip: '192.168.1.100',
    request: '{"survey_id": "123"}',
    response: '{"views": 1234, "responses": 567}'
  },
  {
    id: '4',
    timestamp: '2024-01-20 14:30:15',
    method: 'DELETE',
    endpoint: '/api/v1/projects/456',
    status: 404,
    latency: '45ms',
    ip: '192.168.1.102',
    request: '{}',
    response: '{"error": "Project not found"}'
  },
];

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'var(--surbee-semantic-success)';
    if (status >= 400 && status < 500) return 'var(--surbee-semantic-warning)';
    if (status >= 500) return 'var(--surbee-semantic-error)';
    return 'var(--surbee-fg-muted)';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'var(--surbee-accent-primary)';
      case 'POST': return 'var(--surbee-semantic-success)';
      case 'PUT': case 'PATCH': return 'var(--surbee-semantic-warning)';
      case 'DELETE': return 'var(--surbee-semantic-error)';
      default: return 'var(--surbee-fg-muted)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
            API Logs
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--surbee-fg-muted)' }}>
            Real-time API request logs and monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
            style={{
              backgroundColor: 'var(--surbee-bg-primary)',
              borderColor: 'var(--surbee-border-primary)',
              color: 'var(--surbee-fg-primary)'
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium border transition-colors"
            style={{
              backgroundColor: 'var(--surbee-bg-primary)',
              borderColor: 'var(--surbee-border-primary)',
              color: 'var(--surbee-fg-primary)'
            }}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--surbee-fg-muted)' }} />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: 'var(--surbee-input-background)',
                  borderColor: 'var(--surbee-input-border)',
                  color: 'var(--surbee-fg-primary)'
                }}
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--surbee-input-background)',
                borderColor: 'var(--surbee-input-border)',
                color: 'var(--surbee-fg-primary)'
              }}
            >
              <option value="all">All Status Codes</option>
              <option value="2xx">2xx Success</option>
              <option value="4xx">4xx Client Error</option>
              <option value="5xx">5xx Server Error</option>
            </select>

            {/* Time Range */}
            <select
              className="px-4 py-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--surbee-input-background)',
                borderColor: 'var(--surbee-input-border)',
                color: 'var(--surbee-fg-primary)'
              }}
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
        <CardContent className="p-0">
          <div className="space-y-0">
            {mockLogs.map((log, index) => (
              <div key={log.id}>
                <div
                  className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors"
                  style={{
                    borderBottom: index < mockLogs.length - 1 ? '1px solid var(--surbee-border-primary)' : 'none',
                    backgroundColor: expandedLog === log.id ? 'var(--surbee-bg-secondary)' : 'transparent'
                  }}
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  onMouseEnter={(e) => {
                    if (expandedLog !== log.id) {
                      e.currentTarget.style.backgroundColor = 'var(--surbee-card-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (expandedLog !== log.id) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {expandedLog === log.id ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--surbee-fg-muted)' }} />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--surbee-fg-muted)' }} />
                  )}

                  <span className="text-sm font-mono" style={{ color: 'var(--surbee-fg-muted)', minWidth: '140px' }}>
                    {log.timestamp}
                  </span>

                  <span
                    className="px-2 py-1 rounded text-xs font-mono font-semibold min-w-[60px] text-center"
                    style={{
                      backgroundColor: `${getMethodColor(log.method)}15`,
                      color: getMethodColor(log.method)
                    }}
                  >
                    {log.method}
                  </span>

                  <code className="flex-1 text-sm" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {log.endpoint}
                  </code>

                  <span
                    className="px-2 py-1 rounded text-xs font-mono font-semibold min-w-[50px] text-center"
                    style={{
                      backgroundColor: `${getStatusColor(log.status)}15`,
                      color: getStatusColor(log.status)
                    }}
                  >
                    {log.status}
                  </span>

                  <span className="text-sm min-w-[60px] text-right" style={{ color: 'var(--surbee-fg-muted)' }}>
                    {log.latency}
                  </span>
                </div>

                {/* Expanded Details */}
                {expandedLog === log.id && (
                  <div className="px-6 py-4 space-y-4" style={{ backgroundColor: 'var(--surbee-bg-secondary)', borderBottom: index < mockLogs.length - 1 ? '1px solid var(--surbee-border-primary)' : 'none' }}>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>IP Address:</span>
                        <code className="ml-2" style={{ color: 'var(--surbee-fg-primary)' }}>{log.ip}</code>
                      </div>
                      <div>
                        <span className="font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>Latency:</span>
                        <span className="ml-2" style={{ color: 'var(--surbee-fg-primary)' }}>{log.latency}</span>
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2" style={{ color: 'var(--surbee-fg-muted)' }}>Request:</div>
                      <pre
                        className="p-3 rounded text-xs font-mono overflow-x-auto"
                        style={{
                          backgroundColor: 'var(--surbee-bg-primary)',
                          border: '1px solid var(--surbee-border-primary)',
                          color: 'var(--surbee-fg-primary)'
                        }}
                      >
                        {JSON.stringify(JSON.parse(log.request), null, 2)}
                      </pre>
                    </div>

                    <div>
                      <div className="font-medium text-sm mb-2" style={{ color: 'var(--surbee-fg-muted)' }}>Response:</div>
                      <pre
                        className="p-3 rounded text-xs font-mono overflow-x-auto"
                        style={{
                          backgroundColor: 'var(--surbee-bg-primary)',
                          border: '1px solid var(--surbee-border-primary)',
                          color: 'var(--surbee-fg-primary)'
                        }}
                      >
                        {JSON.stringify(JSON.parse(log.response), null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
