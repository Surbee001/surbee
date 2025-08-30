"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Users, Clock, TrendingUp, AlertTriangle, CheckCircle, Eye, Target } from 'lucide-react'

interface AnalyticsData {
  events: any[]
  insights: {
    completionRate: number
    averageCompletionTime: number
    totalSessions: number
    completedSessions: number
    dropoffPoints: { pageId: string; views: number }[]
    recommendations: { type: string; priority: string; message: string }[]
  }
  summary: {
    totalEvents: number
    uniqueSessions: number
    completionRate: number
    averageTime: number
  }
}

interface SurveyAnalyticsDashboardProps {
  surveyId: string
  className?: string
}

export const SurveyAnalyticsDashboard: React.FC<SurveyAnalyticsDashboardProps> = ({
  surveyId,
  className = ''
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [surveyId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/analytics/capture?surveyId=${surveyId}`)
      const result = await response.json()
      
      if (result.success) {
        setAnalytics(result.data)
      } else {
        setError(result.error || 'Failed to load analytics')
      }
    } catch (err) {
      setError('Network error loading analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-red-800 font-semibold">Analytics Error</h3>
          </div>
          <p className="text-red-700 text-sm mt-2">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-3 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!analytics) return null

  const { insights, summary } = analytics

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="flex items-center gap-3">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Survey Analytics</h2>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          icon={<Users className="w-5 h-5 text-blue-600" />}
          title="Total Sessions"
          value={summary.uniqueSessions.toString()}
          subtitle={`${insights.completedSessions} completed`}
        />
        <MetricCard
          icon={<Target className="w-5 h-5 text-green-600" />}
          title="Completion Rate"
          value={`${insights.completionRate}%`}
          subtitle={insights.completionRate > 70 ? 'Excellent' : insights.completionRate > 50 ? 'Good' : 'Needs improvement'}
        />
        <MetricCard
          icon={<Clock className="w-5 h-5 text-orange-600" />}
          title="Avg. Time"
          value={`${Math.round(insights.averageCompletionTime / 60)}m`}
          subtitle={`${insights.averageCompletionTime}s total`}
        />
        <MetricCard
          icon={<Eye className="w-5 h-5 text-purple-600" />}
          title="Total Events"
          value={summary.totalEvents.toString()}
          subtitle="Interactions tracked"
        />
      </div>

      {/* Drop-off Analysis */}
      {insights.dropoffPoints.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Drop-off Analysis
          </h3>
          <div className="space-y-2">
            {insights.dropoffPoints.slice(0, 5).map((point, index) => (
              <div key={point.pageId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">Page: {point.pageId}</span>
                <span className="text-sm font-medium text-gray-900">{point.views} views</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-white rounded border"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{rec.message}</p>
                  <span className="text-xs text-gray-500 capitalize">{rec.type.replace('_', ' ')}</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {rec.priority}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Events (latest 10) */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {analytics.events.slice(-10).reverse().map((event, index) => (
            <div key={event.id || index} className="flex items-center justify-between p-2 text-sm border-l-2 border-gray-200 pl-3">
              <div>
                <span className="font-medium text-gray-900">{event.eventType.replace('_', ' ')}</span>
                {event.componentId && <span className="text-gray-500 ml-2">({event.componentId})</span>}
              </div>
              <span className="text-gray-400 text-xs">
                {new Date(event.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
          {analytics.events.length === 0 && (
            <p className="text-gray-500 text-center py-4">No events recorded yet</p>
          )}
        </div>
      </div>
    </div>
  )
}

const MetricCard: React.FC<{
  icon: React.ReactNode
  title: string
  value: string
  subtitle: string
}> = ({ icon, title, value, subtitle }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white border border-gray-200 rounded-lg p-4"
  >
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
    </div>
    <div className="space-y-1">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
  </motion.div>
)
