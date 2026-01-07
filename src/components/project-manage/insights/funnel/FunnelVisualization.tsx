"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, AlertTriangle, Loader2, Check, ChevronDown } from 'lucide-react';
import type { FunnelStep, InsightsStats } from '../types';
import styles from '../insights.module.css';

interface FunnelVisualizationProps {
  funnelData: FunnelStep[];
  stats?: InsightsStats;
}

// AI-generated insights for high dropoff questions
function generateDropoffInsight(step: FunnelStep): { cause: string; fix: string } {
  const insights: Record<string, { cause: string; fix: string }> = {
    default: {
      cause: 'Users may find this question confusing or too personal.',
      fix: 'Consider rephrasing the question or making it optional.',
    },
    satisfaction: {
      cause: 'Rating questions without context can feel arbitrary to respondents.',
      fix: 'Add a brief explanation of what the scale means (e.g., "1 = Very Dissatisfied").',
    },
    personal: {
      cause: 'Questions about roles or personal info early in the survey can create friction.',
      fix: 'Move personal questions to the end after building rapport.',
    },
    openEnded: {
      cause: 'Open-ended questions require more effort and cause fatigue.',
      fix: 'Provide example answers or change to multiple choice with "Other" option.',
    },
    long: {
      cause: 'Survey length may be causing respondent fatigue at this point.',
      fix: 'Consider making remaining questions optional or removing less critical ones.',
    },
  };

  // Simple heuristic to pick an insight based on question text
  const text = step.questionText.toLowerCase();
  if (text.includes('rate') || text.includes('scale') || text.includes('1-10')) {
    return insights.satisfaction;
  }
  if (text.includes('role') || text.includes('job') || text.includes('position')) {
    return insights.personal;
  }
  if (text.includes('feedback') || text.includes('describe') || text.includes('explain')) {
    return insights.openEnded;
  }
  if (step.questionNumber > 4) {
    return insights.long;
  }
  return insights.default;
}

interface FunnelRowProps {
  step: FunnelStep;
  idx: number;
  isExpanded: boolean;
  onToggle: () => void;
  onFix?: () => void;
}

function FunnelRow({ step, idx, isExpanded, onToggle, onFix }: FunnelRowProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [isApplied, setIsApplied] = useState(false);
  const isHighDropoff = step.dropOff > 10 && idx > 0;
  const insight = generateDropoffInsight(step);

  const handleFix = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsApplying(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsApplying(false);
    setIsApplied(true);
    onFix?.();
  };

  return (
    <>
      <div
        className={cn(
          styles.funnelItem,
          isHighDropoff && styles.funnelItemWarning,
          isHighDropoff && 'cursor-pointer'
        )}
        onClick={isHighDropoff ? onToggle : undefined}
      >
        <span className={styles.funnelNumber}>
          Q{String(step.questionNumber).padStart(2, '0')}
        </span>
        <div className={styles.funnelQuestion}>
          <span className={styles.funnelQuestionText}>
            {step.questionText.length > 60 ? `${step.questionText.slice(0, 60)}...` : step.questionText}
          </span>
          <div className={styles.funnelBar}>
            <div
              className={styles.funnelBarFill}
              style={{ width: `${step.retention}%` }}
            />
          </div>
        </div>
        <span className={styles.funnelRetention}>{step.retention}%</span>
        <div className="flex items-center gap-2">
          <span className={cn(styles.funnelDropoff, isHighDropoff && styles.funnelDropoffWarning)}>
            {idx === 0 ? '—' : `-${step.dropOff}%`}
          </span>
          {isHighDropoff && (
            <ChevronDown
              size={14}
              className={cn(
                'transition-transform duration-200',
                isExpanded && 'rotate-180'
              )}
              style={{ color: 'var(--insights-warning)' }}
            />
          )}
        </div>
      </div>

      {/* Expanded Insight Row */}
      {isHighDropoff && isExpanded && (
        <div className={styles.funnelInsightRow}>
          <div className={styles.funnelInsightContent}>
            <div className={styles.funnelInsightIcon}>
              <AlertTriangle size={14} />
            </div>
            <div className={styles.funnelInsightDetails}>
              <div className={styles.funnelInsightSection}>
                <span className={styles.funnelInsightLabel}>Likely cause</span>
                <p className={styles.funnelInsightText}>{insight.cause}</p>
              </div>
              <div className={styles.funnelInsightSection}>
                <span className={styles.funnelInsightLabel}>
                  <Sparkles size={10} style={{ marginRight: 4 }} />
                  AI Suggested fix
                </span>
                <p className={styles.funnelInsightText}>{insight.fix}</p>
              </div>
            </div>
            <div className={styles.funnelInsightAction}>
              {!isApplied ? (
                <button
                  className={styles.funnelFixBtn}
                  onClick={handleFix}
                  disabled={isApplying}
                >
                  {isApplying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Applying...
                    </>
                  ) : (
                    'Fix Now'
                  )}
                </button>
              ) : (
                <span className={styles.funnelFixApplied}>
                  <Check size={14} />
                  Applied
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function FunnelVisualization({ funnelData, stats }: FunnelVisualizationProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  if (funnelData.length === 0) {
    return null;
  }

  const toggleRow = (questionId: string) => {
    setExpandedRow(expandedRow === questionId ? null : questionId);
  };

  return (
    <div className={styles.funnelCard}>
      <div className={styles.funnelHeader}>
        <span className={styles.funnelTitle}>Funnel Analysis</span>
        {stats && (
          <div className={styles.funnelStats}>
            <div className={styles.funnelStat}>
              <span className={styles.funnelStatValue}>{stats.total}</span>
              <span className={styles.funnelStatLabel}>started</span>
            </div>
            <div className={styles.funnelStat}>
              <span className={styles.funnelStatValue}>{stats.completed}</span>
              <span className={styles.funnelStatLabel}>completed</span>
            </div>
            <div className={styles.funnelStat}>
              <span className={styles.funnelStatValue}>{stats.completionRate}%</span>
              <span className={styles.funnelStatLabel}>rate</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.funnelList}>
        {funnelData.map((step, idx) => (
          <FunnelRow
            key={step.questionId}
            step={step}
            idx={idx}
            isExpanded={expandedRow === step.questionId}
            onToggle={() => toggleRow(step.questionId)}
          />
        ))}
      </div>
    </div>
  );
}

export default FunnelVisualization;
