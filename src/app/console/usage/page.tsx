"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Download, Calendar } from 'lucide-react';

// Mock data
const mockUsageData = {
  totalRequests: 45230,
  totalCost: 37.82,
  avgRequestsPerDay: 1507,
  topEndpoint: '/api/v1/surveys',
  costTrend: '+12%',
};

const mockEndpointUsage = [
  { endpoint: '/api/v1/surveys', requests: 15420, cost: '$12.34', avgLatency: '120ms' },
  { endpoint: '/api/v1/responses', requests: 12350, cost: '$9.88', avgLatency: '305ms' },
  { endpoint: '/api/v1/analytics', requests: 8940, cost: '$7.15', avgLatency: '95ms' },
  { endpoint: '/api/v1/projects', requests: 5320, cost: '$4.26', avgLatency: '180ms' },
  { endpoint: '/api/v1/users', requests: 3200, cost: '$2.56', avgLatency: '65ms' },
];

export default function UsagePage() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
            Usage & Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--surbee-fg-muted)' }}>
            Monitor your API usage and costs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 rounded-lg border text-sm font-medium"
            style={{
              backgroundColor: 'var(--surbee-bg-primary)',
              borderColor: 'var(--surbee-border-primary)',
              color: 'var(--surbee-fg-primary)'
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Total Requests
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  {mockUsageData.totalRequests.toLocaleString()}
                </p>
              </div>
              <BarChart3 className="w-10 h-10" style={{ color: 'var(--surbee-accent-primary)', opacity: 0.6 }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-semantic-success)' }}>
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Total Cost
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  ${mockUsageData.totalCost}
                </p>
              </div>
              <DollarSign className="w-10 h-10" style={{ color: 'var(--surbee-accent-primary)', opacity: 0.6 }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
              This period
            </p>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Avg Daily Requests
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  {mockUsageData.avgRequestsPerDay.toLocaleString()}
                </p>
              </div>
              <Calendar className="w-10 h-10" style={{ color: 'var(--surbee-accent-primary)', opacity: 0.6 }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
              Per day average
            </p>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Cost Trend
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  {mockUsageData.costTrend}
                </p>
              </div>
              <TrendingUp className="w-10 h-10" style={{ color: 'var(--surbee-semantic-success)', opacity: 0.6 }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
              From last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Request Volume</CardTitle>
            <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
              Daily API requests over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--surbee-fg-muted)' }}>
              <p>Chart placeholder - integrate charting library (e.g., Recharts, Chart.js)</p>
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Cost Breakdown</CardTitle>
            <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
              Daily costs over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--surbee-fg-muted)' }}>
              <p>Chart placeholder - integrate charting library</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Usage Table */}
      <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Endpoint Usage</CardTitle>
          <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
            Top endpoints by request count
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surbee-border-primary)' }}>
                  <th className="text-left px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                    Endpoint
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                    Requests
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                    Cost
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold" style={{ color: 'var(--surbee-fg-primary)' }}>
                    Avg Latency
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockEndpointUsage.map((endpoint, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: index < mockEndpointUsage.length - 1 ? '1px solid var(--surbee-border-primary)' : 'none'
                    }}
                  >
                    <td className="px-6 py-4">
                      <code className="text-sm font-mono" style={{ color: 'var(--surbee-fg-primary)' }}>
                        {endpoint.endpoint}
                      </code>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                      {endpoint.requests.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                      {endpoint.cost}
                    </td>
                    <td className="px-6 py-4 text-right text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
                      {endpoint.avgLatency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
