"use client";

import React from 'react';
import { 
  Shield, 
  Eye, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface AccuracyMetrics {
  overallScore: number; // 0-100
  attentionCheckPassRate: number;
  consistencyScore: number;
  speedAnomalies: number;
  patternFlags: number;
  qualityDistribution: {
    high: number; // >80%
    medium: number; // 50-80%
    low: number; // <50%
  };
}

interface AccuracyMetricsCardProps {
  metrics: AccuracyMetrics;
}

export default function AccuracyMetricsCard({ metrics }: AccuracyMetricsCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/30';
    if (score >= 50) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <Card className="theme-card col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[18px] text-theme-primary">
              Data Accuracy Analytics
            </CardTitle>
            <CardDescription className="text-theme-muted">
              Quality and reliability metrics for survey responses
            </CardDescription>
          </div>
          
          {/* Overall Score Badge */}
          <div className={`px-4 py-2 rounded-full border ${getScoreBgColor(metrics.overallScore)}`}>
            <div className="flex items-center gap-2">
              <div className={`text-[24px] font-bold ${getScoreColor(metrics.overallScore)}`}>
                {metrics.overallScore.toFixed(1)}%
              </div>
              <div className="text-[12px] text-theme-muted">Overall Accuracy</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Attention Check Pass Rate */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-[14px] font-medium text-theme-secondary">Attention Checks</span>
            </div>
            <div className="space-y-2">
              <div className={`text-[28px] font-bold ${getScoreColor(metrics.attentionCheckPassRate)}`}>
                {metrics.attentionCheckPassRate.toFixed(1)}%
              </div>
              <div className="text-[12px] text-theme-muted">Pass Rate</div>
              <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metrics.attentionCheckPassRate >= 80 ? 'bg-green-400' :
                    metrics.attentionCheckPassRate >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${metrics.attentionCheckPassRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Consistency Score */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className="text-[14px] font-medium text-theme-secondary">Consistency</span>
            </div>
            <div className="space-y-2">
              <div className={`text-[28px] font-bold ${getScoreColor(metrics.consistencyScore)}`}>
                {metrics.consistencyScore.toFixed(1)}%
              </div>
              <div className="text-[12px] text-theme-muted">Score</div>
              <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    metrics.consistencyScore >= 80 ? 'bg-green-400' :
                    metrics.consistencyScore >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${metrics.consistencyScore}%` }}
                />
              </div>
            </div>
          </div>

          {/* Speed Anomalies */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-[14px] font-medium text-theme-secondary">Speed Anomalies</span>
            </div>
            <div className="space-y-2">
              <div className="text-[28px] font-bold text-theme-primary">
                {metrics.speedAnomalies}
              </div>
              <div className="text-[12px] text-theme-muted">Flagged Responses</div>
              {metrics.speedAnomalies > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-orange-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Too fast/slow responses</span>
                </div>
              )}
            </div>
          </div>

          {/* Pattern Flags */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-400" />
              <span className="text-[14px] font-medium text-theme-secondary">Pattern Flags</span>
            </div>
            <div className="space-y-2">
              <div className="text-[28px] font-bold text-theme-primary">
                {metrics.patternFlags}
              </div>
              <div className="text-[12px] text-theme-muted">Suspicious Patterns</div>
              {metrics.patternFlags > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Straight-lining detected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quality Distribution */}
        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.05)]">
          <h4 className="text-[16px] font-medium text-theme-primary mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            Response Quality Distribution
          </h4>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-3 mb-2 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-400 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.qualityDistribution.high / (metrics.qualityDistribution.high + metrics.qualityDistribution.medium + metrics.qualityDistribution.low)) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-[18px] font-bold text-green-400">{metrics.qualityDistribution.high}</span>
              </div>
              <div className="text-[12px] text-theme-muted">High Quality (&gt;80%)</div>
            </div>

            <div className="text-center">
              <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-3 mb-2 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.qualityDistribution.medium / (metrics.qualityDistribution.high + metrics.qualityDistribution.medium + metrics.qualityDistribution.low)) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-[18px] font-bold text-yellow-400">{metrics.qualityDistribution.medium}</span>
              </div>
              <div className="text-[12px] text-theme-muted">Medium Quality (50-80%)</div>
            </div>

            <div className="text-center">
              <div className="w-full bg-[rgba(255,255,255,0.05)] rounded-full h-3 mb-2 relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-red-400 rounded-full transition-all duration-500"
                  style={{ width: `${(metrics.qualityDistribution.low / (metrics.qualityDistribution.high + metrics.qualityDistribution.medium + metrics.qualityDistribution.low)) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-center gap-1 mb-1">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-[18px] font-bold text-red-400">{metrics.qualityDistribution.low}</span>
              </div>
              <div className="text-[12px] text-theme-muted">Low Quality (&lt;50%)</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}