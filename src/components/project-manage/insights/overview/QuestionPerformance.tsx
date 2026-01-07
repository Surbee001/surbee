"use client";

import React from 'react';
import { BarChart3, TrendingDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuestionStats } from '../types';
import styles from '../insights.module.css';

interface QuestionPerformanceProps {
  questionStats: QuestionStats[];
}

export function QuestionPerformance({ questionStats }: QuestionPerformanceProps) {
  const lowestScoring = [...questionStats]
    .filter(q => q.responseCount > 0)
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 3);

  const slowestQuestions = [...questionStats]
    .filter(q => q.responseCount > 0)
    .sort((a, b) => b.avgTime - a.avgTime)
    .slice(0, 3);

  return (
    <div className={styles.questionPerfCard}>
      <div className={styles.cardTitle}>
        <BarChart3 size={16} style={{ color: 'var(--insights-cyan)' }} />
        Question Performance
      </div>

      <div className={styles.questionPerfGrid}>
        {/* Lowest Scoring Questions */}
        <div className={styles.questionPerfSection}>
          <div className={styles.questionPerfSectionTitle}>
            <TrendingDown size={12} />
            Lowest Scoring
          </div>
          {lowestScoring.length > 0 ? (
            <div className={styles.questionPerfList}>
              {lowestScoring.map((q, idx) => (
                <div key={q.questionId} className={styles.questionPerfItem}>
                  <span className={styles.questionPerfRank}>Q{idx + 1}</span>
                  <span className={styles.questionPerfText}>
                    {q.questionText.length > 35 ? `${q.questionText.slice(0, 35)}...` : q.questionText}
                  </span>
                  <span className={cn(
                    styles.questionPerfScore,
                    q.avgScore >= 80 ? styles.questionPerfScoreGood :
                    q.avgScore >= 60 ? styles.questionPerfScoreWarning :
                    styles.questionPerfScorePoor
                  )}>
                    {q.avgScore}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.questionPerfEmpty}>No data yet</div>
          )}
        </div>

        {/* Slowest Questions */}
        <div className={styles.questionPerfSection}>
          <div className={styles.questionPerfSectionTitle}>
            <Clock size={12} />
            Longest Time
          </div>
          {slowestQuestions.length > 0 ? (
            <div className={styles.questionPerfList}>
              {slowestQuestions.map((q, idx) => (
                <div key={q.questionId} className={styles.questionPerfItem}>
                  <span className={styles.questionPerfRank}>Q{idx + 1}</span>
                  <span className={styles.questionPerfText}>
                    {q.questionText.length > 35 ? `${q.questionText.slice(0, 35)}...` : q.questionText}
                  </span>
                  <span className={styles.questionPerfTime}>
                    {q.avgTime.toFixed(1)}s
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.questionPerfEmpty}>No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPerformance;
