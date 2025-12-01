"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Users, Activity, Calendar, RefreshCw } from 'lucide-react';

interface AnalyticsSummary {
  totalEvents: number;
  uniqueUsers: number;
  eventCounts: Record<string, number>;
  categoryCounts: Record<string, number>;
  dailyCounts: Record<string, number>;
  period: string;
}

export default function AdminAnalyticsPage() {
  const [adminKey, setAdminKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async () => {
    if (!adminKey) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analytics/events?days=${days}&adminKey=${adminKey}`);

      if (response.status === 401) {
        setError('Invalid admin key');
        setIsAuthenticated(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
      setIsAuthenticated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAnalytics();
  };

  // Sort and format event data for display
  const sortedEvents = analytics?.eventCounts
    ? Object.entries(analytics.eventCounts).sort(([, a], [, b]) => b - a)
    : [];

  const sortedCategories = analytics?.categoryCounts
    ? Object.entries(analytics.categoryCounts).sort(([, a], [, b]) => b - a)
    : [];

  const sortedDays = analytics?.dailyCounts
    ? Object.entries(analytics.dailyCounts).sort(([a], [b]) => b.localeCompare(a)).slice(0, 14)
    : [];

  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--surbee-bg-primary)' }}
      >
        <Card className="w-full max-w-md" style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>
              Admin Analytics
            </CardTitle>
            <CardDescription style={{ color: 'var(--surbee-fg-muted)' }}>
              Enter your admin key to view analytics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                placeholder="Admin Key"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                className="w-full p-3 rounded-lg border text-[14px]"
                style={{
                  backgroundColor: 'var(--surbee-bg-secondary)',
                  borderColor: 'var(--surbee-border-subtle)',
                  color: 'var(--surbee-fg-primary)',
                }}
              />
              {error && (
                <p className="text-red-400 text-sm">{error}</p>
              )}
              <button
                type="submit"
                disabled={isLoading || !adminKey}
                className="w-full py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--surbee-fg-primary)',
                  color: 'var(--surbee-bg-primary)',
                }}
              >
                {isLoading ? 'Loading...' : 'View Analytics'}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: 'var(--surbee-bg-primary)' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
              Analytics Dashboard
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--surbee-fg-muted)' }}>
              Viewing data for the last {analytics?.period}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
              }}
              className="p-2 rounded-lg border text-sm"
              style={{
                backgroundColor: 'var(--surbee-bg-secondary)',
                borderColor: 'var(--surbee-border-subtle)',
                color: 'var(--surbee-fg-primary)',
              }}
            >
              <option value={7}>Last 7 days</option>
              <option value={14}>Last 14 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="p-2 rounded-lg transition-all"
              style={{ backgroundColor: 'var(--surbee-bg-tertiary)' }}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} style={{ color: 'var(--surbee-fg-primary)' }} />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surbee-bg-tertiary)' }}>
                  <Activity className="w-6 h-6" style={{ color: 'var(--surbee-fg-primary)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>Total Events</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {analytics?.totalEvents?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surbee-bg-tertiary)' }}>
                  <Users className="w-6 h-6" style={{ color: 'var(--surbee-fg-primary)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>Unique Users</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {analytics?.uniqueUsers?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surbee-bg-tertiary)' }}>
                  <BarChart3 className="w-6 h-6" style={{ color: 'var(--surbee-fg-primary)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>Event Types</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {sortedEvents.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--surbee-bg-tertiary)' }}>
                  <Calendar className="w-6 h-6" style={{ color: 'var(--surbee-fg-primary)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: 'var(--surbee-fg-muted)' }}>Daily Avg</p>
                  <p className="text-2xl font-bold" style={{ color: 'var(--surbee-fg-primary)' }}>
                    {sortedDays.length > 0
                      ? Math.round(analytics?.totalEvents! / sortedDays.length).toLocaleString()
                      : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Events by Category */}
          <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Events by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm capitalize" style={{ color: 'var(--surbee-fg-secondary)' }}>
                      {category}
                    </span>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${Math.max((count / (analytics?.totalEvents || 1)) * 200, 20)}px`,
                          backgroundColor: 'var(--surbee-fg-primary)',
                          opacity: 0.7,
                        }}
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                        {count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
                {sortedCategories.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--surbee-fg-muted)' }}>
                    No data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Events */}
          <Card style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Top Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {sortedEvents.slice(0, 15).map(([event, count], index) => (
                  <div key={event} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs w-6 h-6 flex items-center justify-center rounded-full"
                        style={{
                          backgroundColor: 'var(--surbee-bg-tertiary)',
                          color: 'var(--surbee-fg-muted)'
                        }}
                      >
                        {index + 1}
                      </span>
                      <span className="text-sm" style={{ color: 'var(--surbee-fg-secondary)' }}>
                        {event.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: 'var(--surbee-fg-primary)' }}>
                      {count.toLocaleString()}
                    </span>
                  </div>
                ))}
                {sortedEvents.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--surbee-fg-muted)' }}>
                    No data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Daily Activity */}
          <Card className="lg:col-span-2" style={{ backgroundColor: 'var(--surbee-card-bg)', borderColor: 'var(--surbee-card-border)' }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--surbee-fg-primary)' }}>Daily Activity (Last 14 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between gap-2 h-48">
                {sortedDays.reverse().map(([date, count]) => {
                  const maxCount = Math.max(...sortedDays.map(([, c]) => c));
                  const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                  return (
                    <div key={date} className="flex flex-col items-center flex-1 gap-1">
                      <div
                        className="w-full max-w-8 rounded-t"
                        style={{
                          height: `${Math.max(height, 5)}%`,
                          backgroundColor: 'var(--surbee-fg-primary)',
                          opacity: 0.7,
                        }}
                        title={`${date}: ${count} events`}
                      />
                      <span className="text-[10px] rotate-45 origin-left" style={{ color: 'var(--surbee-fg-muted)' }}>
                        {date.slice(5)} {/* Show MM-DD only */}
                      </span>
                    </div>
                  );
                })}
                {sortedDays.length === 0 && (
                  <p className="text-sm text-center w-full py-8" style={{ color: 'var(--surbee-fg-muted)' }}>
                    No data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
