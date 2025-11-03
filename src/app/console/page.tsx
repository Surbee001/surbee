"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Key, TrendingUp, Clock, CheckCircle, Activity, DollarSign } from 'lucide-react';
import CreateApiKeyModal from '@/components/console/CreateApiKeyModal';

// Mock data - replace with actual API calls
const mockHasApiKeys = false; // Change to true to see stats view

const mockStats = {
  totalRequests: 15420,
  successRate: 99.2,
  avgLatency: 245,
  estimatedCost: 12.45,
};

const mockRecentActivity = [
  { id: 1, endpoint: '/api/v1/surveys', method: 'GET', status: 200, time: '2m ago', duration: '120ms' },
  { id: 2, endpoint: '/api/v1/responses', method: 'POST', status: 201, time: '5m ago', duration: '305ms' },
  { id: 3, endpoint: '/api/v1/analytics', method: 'GET', status: 200, time: '12m ago', duration: '95ms' },
  { id: 4, endpoint: '/api/v1/projects', method: 'GET', status: 200, time: '25m ago', duration: '180ms' },
];

export default function ConsoleDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasApiKeys, setHasApiKeys] = useState(mockHasApiKeys);

  const handleCreateApiKey = () => {
    setIsModalOpen(true);
  };

  const handleApiKeyCreated = (newKey: any) => {
    setHasApiKeys(true);
    setIsModalOpen(false);
    // TODO: Refresh data
  };

  // Empty State - No API Keys
  if (!hasApiKeys) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <div className="text-center max-w-2xl mx-auto space-y-8">
          {/* Heading */}
          <h1
            className="text-4xl font-bold"
            style={{ color: 'var(--surbee-fg-primary)' }}
          >
            Start building with Surbee
          </h1>

          {/* CTA Button */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleCreateApiKey}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{
                backgroundColor: 'var(--surbee-accent-primary)',
                color: '#ffffff',
                transform: 'translateY(0px)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surbee-accent-hover)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surbee-accent-primary)';
                e.currentTarget.style.transform = 'translateY(0px)';
              }}
            >
              Create API Key
            </button>

            <a
              href="/console/documentation"
              className="text-sm hover:opacity-80 transition-opacity"
              style={{ color: 'var(--surbee-fg-secondary)' }}
            >
              Read the documentation
            </a>
          </div>
        </div>

        <CreateApiKeyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleApiKeyCreated}
        />
      </div>
    );
  }

  // Stats View - Has API Keys
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
          Dashboard
        </h1>
        <button
          onClick={handleCreateApiKey}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all"
          style={{
            backgroundColor: 'var(--surbee-accent-primary)',
            color: '#ffffff',
            transform: 'translateY(0px)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surbee-accent-hover)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surbee-accent-primary)';
            e.currentTarget.style.transform = 'translateY(0px)';
          }}
        >
          Create API Key
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Total Requests
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  {mockStats.totalRequests.toLocaleString()}
                </p>
              </div>
              <Activity className="w-10 h-10" style={{ color: 'var(--surbee-accent-primary)', opacity: 0.6 }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-semantic-success)' }}>
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Success Rate
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  {mockStats.successRate}%
                </p>
              </div>
              <CheckCircle className="w-10 h-10" style={{ color: 'var(--surbee-semantic-success)', opacity: 0.6 }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
              Excellent uptime
            </p>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Avg Latency
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  {mockStats.avgLatency}ms
                </p>
              </div>
              <Clock className="w-10 h-10" style={{ color: 'var(--surbee-accent-primary)', opacity: 0.6 }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-semantic-success)' }}>
              -8% faster
            </p>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--surbee-fg-muted)' }}>
                  Estimated Cost
                </p>
                <p className="text-2xl font-bold mt-2" style={{ color: 'var(--surbee-fg-primary)' }}>
                  ${mockStats.estimatedCost}
                </p>
              </div>
              <DollarSign className="w-10 h-10" style={{ color: 'var(--surbee-accent-primary)', opacity: 0.6 }} />
            </div>
            <p className="text-xs mt-2" style={{ color: 'var(--surbee-fg-muted)' }}>
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Over Time */}
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Requests Over Time</CardTitle>
            <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
              Last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--surbee-fg-muted)' }}>
              <p>Chart placeholder - integrate charting library</p>
            </div>
          </CardContent>
        </Card>

        {/* Latency Over Time */}
        <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Average Latency</CardTitle>
            <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
              Last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center" style={{ color: 'var(--surbee-fg-muted)' }}>
              <p>Chart placeholder - integrate charting library</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Recent Activity</CardTitle>
          <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
            Latest API requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockRecentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  backgroundColor: 'var(--surbee-bg-secondary)',
                  border: '1px solid var(--surbee-border-primary)'
                }}
              >
                <div className="flex items-center gap-4">
                  <span
                    className="px-2 py-1 rounded text-xs font-mono font-semibold"
                    style={{
                      backgroundColor: activity.status === 200 || activity.status === 201
                        ? 'var(--surbee-semantic-successSubtle)'
                        : 'var(--surbee-semantic-errorSubtle)',
                      color: activity.status === 200 || activity.status === 201
                        ? 'var(--surbee-semantic-success)'
                        : 'var(--surbee-semantic-error)',
                    }}
                  >
                    {activity.method}
                  </span>
                  <code className="text-sm" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {activity.endpoint}
                  </code>
                </div>
                <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>
                  <span>{activity.duration}</span>
                  <span>{activity.time}</span>
                  <span
                    className="font-mono"
                    style={{
                      color: activity.status === 200 || activity.status === 201
                        ? 'var(--surbee-semantic-success)'
                        : 'var(--surbee-semantic-error)'
                    }}
                  >
                    {activity.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateApiKeyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleApiKeyCreated}
      />
    </div>
  );
}
