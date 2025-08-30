"use client";

import React from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  TrendingUp, 
  Clock, 
  BarChart3 
} from 'lucide-react';

export interface ResponseAccuracy {
  score: number;
  flags: string[];
  checks: {
    attention: boolean;
    consistency: boolean;
    speed: 'normal' | 'too_fast' | 'too_slow';
    pattern: 'normal' | 'straight_line' | 'random';
  };
}

interface ResponseQualityBadgeProps {
  accuracy: ResponseAccuracy;
  compact?: boolean;
}

export default function ResponseQualityBadge({ accuracy, compact = false }: ResponseQualityBadgeProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 50) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="w-3 h-3" />;
    if (score >= 50) return <AlertTriangle className="w-3 h-3" />;
    return <XCircle className="w-3 h-3" />;
  };

  const getQualityLabel = (score: number) => {
    if (score >= 80) return 'High';
    if (score >= 50) return 'Medium';
    return 'Low';
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${getScoreColor(accuracy.score)}`}>
        {getScoreIcon(accuracy.score)}
        <span>{accuracy.score}%</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium border ${getScoreColor(accuracy.score)}`}>
        {getScoreIcon(accuracy.score)}
        <span>{getQualityLabel(accuracy.score)} Quality</span>
        <span className="font-bold">{accuracy.score}%</span>
      </div>

      {/* Quality Check Details */}
      {accuracy.flags.length > 0 && (
        <div className="space-y-1">
          <div className="text-[11px] text-theme-muted">Quality Checks:</div>
          <div className="flex flex-wrap gap-1">
            {!accuracy.checks.attention && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] border border-red-500/20">
                <Eye className="w-3 h-3" />
                <span>Attention</span>
              </div>
            )}
            {accuracy.checks.consistency === false && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] border border-red-500/20">
                <TrendingUp className="w-3 h-3" />
                <span>Consistency</span>
              </div>
            )}
            {accuracy.checks.speed !== 'normal' && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/10 text-orange-400 text-[10px] border border-orange-500/20">
                <Clock className="w-3 h-3" />
                <span>{accuracy.checks.speed === 'too_fast' ? 'Too Fast' : 'Too Slow'}</span>
              </div>
            )}
            {accuracy.checks.pattern !== 'normal' && (
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/10 text-red-400 text-[10px] border border-red-500/20">
                <BarChart3 className="w-3 h-3" />
                <span>{accuracy.checks.pattern === 'straight_line' ? 'Straight-lining' : 'Random'}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}