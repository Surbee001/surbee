"use client";

import React, { useState, useMemo } from 'react';
import {
  Monitor, Smartphone, Tablet, ChevronDown, ChevronUp, Check, AlertTriangle, X,
  Download, ChevronLeft, ChevronRight, Search, Filter, Clock, Award
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { StatusBadge } from '../shared/StatusBadge';
import type { Response, DeviceType } from '../types';
import styles from '../insights.module.css';

interface ResponseTableProps {
  responses: Response[];
  pageSize?: number;
  onExport?: () => void;
}

type StatusFilter = 'all' | 'completed' | 'partial' | 'abandoned';
type QualityFilter = 'all' | 'excellent' | 'good' | 'poor';

function DeviceIcon({ type }: { type: DeviceType }) {
  const iconProps = { size: 14, strokeWidth: 1.5 };
  switch (type) {
    case 'mobile':
      return <Smartphone {...iconProps} />;
    case 'tablet':
      return <Tablet {...iconProps} />;
    default:
      return <Monitor {...iconProps} />;
  }
}

function CipherIndicator({ response }: { response: Response }) {
  const fraudScore = response.fraudScore || 0;
  const isFlagged = response.isFlagged;

  if (isFlagged) {
    return (
      <span className={cn(styles.cipherIndicator, styles.cipherFail)}>
        <X size={12} strokeWidth={2.5} />
      </span>
    );
  }
  if (fraudScore > 0.3) {
    return (
      <span className={cn(styles.cipherIndicator, styles.cipherWarning)}>
        <AlertTriangle size={12} strokeWidth={2} />
      </span>
    );
  }
  return (
    <span className={cn(styles.cipherIndicator, styles.cipherPass)}>
      <Check size={12} strokeWidth={2.5} />
    </span>
  );
}

// Export Modal Component
interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  responses: Response[];
}

type ExportFormat = 'summary' | 'detailed' | 'grading';

function ExportModal({ isOpen, onClose, responses }: ExportModalProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('summary');
  const [includeOptions, setIncludeOptions] = useState({
    responseId: true,
    timestamp: true,
    device: true,
    duration: true,
    status: true,
    qualityScore: true,
    cipherStatus: false,
    flagReasons: false,
    individualAnswers: false,
    answerTimings: false,
    accuracyScores: false,
  });

  if (!isOpen) return null;

  const handleExport = () => {
    // Build CSV based on format and options
    let headers: string[] = [];
    let rows: string[][] = [];

    if (exportFormat === 'summary') {
      headers = ['#', 'Response ID', 'Submitted', 'Device', 'Duration (min)', 'Status', 'Quality Score'];
      rows = responses.map((r, idx) => [
        String(idx + 1),
        r.id,
        format(r.submittedAt, 'yyyy-MM-dd HH:mm'),
        r.deviceType,
        (r.completionTime / 60).toFixed(2),
        r.status,
        String(r.qualityScore || 100),
      ]);
    } else if (exportFormat === 'detailed') {
      // Full export with all questions and answers
      headers = ['#', 'Response ID', 'Submitted', 'Device', 'Duration (min)', 'Status', 'Quality Score'];

      // Get unique questions from responses
      const allQuestions = new Set<string>();
      responses.forEach(r => {
        r.responses.forEach(qr => allQuestions.add(qr.questionText));
      });
      const questionList = Array.from(allQuestions);
      questionList.forEach((q, i) => {
        headers.push(`Q${i + 1}: ${q.slice(0, 50)}${q.length > 50 ? '...' : ''}`);
        if (includeOptions.answerTimings) headers.push(`Q${i + 1} Time (s)`);
        if (includeOptions.accuracyScores) headers.push(`Q${i + 1} Accuracy`);
      });

      rows = responses.map((r, idx) => {
        const row = [
          String(idx + 1),
          r.id,
          format(r.submittedAt, 'yyyy-MM-dd HH:mm'),
          r.deviceType,
          (r.completionTime / 60).toFixed(2),
          r.status,
          String(r.qualityScore || 100),
        ];

        questionList.forEach((q) => {
          const answer = r.responses.find(qr => qr.questionText === q);
          row.push(answer?.answer || '');
          if (includeOptions.answerTimings) row.push(answer ? String(answer.timeTaken) : '');
          if (includeOptions.accuracyScores) row.push(answer ? String(answer.accuracyScore) : '');
        });

        return row;
      });
    } else if (exportFormat === 'grading') {
      // Teacher-friendly format with student pseudonyms
      headers = ['Student', 'Submitted', 'Completion Time', 'Status', 'Overall Score'];

      // Get questions for grading
      const allQuestions = new Set<string>();
      responses.forEach(r => {
        r.responses.forEach(qr => allQuestions.add(qr.questionText));
      });
      const questionList = Array.from(allQuestions);
      questionList.forEach((q, i) => {
        headers.push(`Q${i + 1} Response`);
        headers.push(`Q${i + 1} Score`);
      });
      headers.push('Notes');

      rows = responses.map((r, idx) => {
        const row = [
          `Student ${idx + 1}`,
          format(r.submittedAt, 'MMM d, yyyy h:mm a'),
          `${(r.completionTime / 60).toFixed(1)} min`,
          r.status === 'completed' ? 'Complete' : r.status === 'partial' ? 'Incomplete' : 'Abandoned',
          `${r.qualityScore || 100}%`,
        ];

        questionList.forEach((q) => {
          const answer = r.responses.find(qr => qr.questionText === q);
          row.push(answer?.answer || '-');
          row.push(answer ? `${answer.accuracyScore}%` : '-');
        });

        // Notes column for flagged responses
        row.push(r.isFlagged ? `Flagged: ${r.flagReasons?.join(', ') || 'Low quality'}` : '');

        return row;
      });
    }

    // Generate CSV
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `responses-${exportFormat}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    onClose();
  };

  return (
    <div className={styles.exportModal} onClick={onClose}>
      <div className={styles.exportModalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.exportModalHeader}>
          <span className={styles.exportModalTitle}>Export Responses</span>
          <button className={styles.exportModalClose} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.exportModalBody}>
          <div className={styles.exportSection}>
            <div className={styles.exportSectionTitle}>Export Format</div>

            <div
              className={cn(styles.exportOption, exportFormat === 'summary' && styles.exportOptionActive)}
              onClick={() => setExportFormat('summary')}
            >
              <div className={cn(styles.exportOptionRadio, exportFormat === 'summary' && styles.exportOptionRadioActive)} />
              <div className={styles.exportOptionContent}>
                <div className={styles.exportOptionTitle}>Summary</div>
                <div className={styles.exportOptionDesc}>
                  Basic overview: ID, timestamp, device, duration, status, and quality score
                </div>
              </div>
            </div>

            <div
              className={cn(styles.exportOption, exportFormat === 'detailed' && styles.exportOptionActive)}
              onClick={() => setExportFormat('detailed')}
            >
              <div className={cn(styles.exportOptionRadio, exportFormat === 'detailed' && styles.exportOptionRadioActive)} />
              <div className={styles.exportOptionContent}>
                <div className={styles.exportOptionTitle}>Detailed</div>
                <div className={styles.exportOptionDesc}>
                  Complete data including every question and answer, timing per question
                </div>
              </div>
            </div>

            <div
              className={cn(styles.exportOption, exportFormat === 'grading' && styles.exportOptionActive)}
              onClick={() => setExportFormat('grading')}
            >
              <div className={cn(styles.exportOptionRadio, exportFormat === 'grading' && styles.exportOptionRadioActive)} />
              <div className={styles.exportOptionContent}>
                <div className={styles.exportOptionTitle}>Grading Sheet</div>
                <div className={styles.exportOptionDesc}>
                  Teacher-friendly format with student pseudonyms, scores, and notes column
                </div>
              </div>
            </div>
          </div>

          {exportFormat === 'detailed' && (
            <div className={styles.exportSection}>
              <div className={styles.exportSectionTitle}>Include Additional Data</div>

              <label className={styles.exportCheckbox}>
                <input
                  type="checkbox"
                  checked={includeOptions.answerTimings}
                  onChange={e => setIncludeOptions(prev => ({ ...prev, answerTimings: e.target.checked }))}
                />
                <span className={styles.exportCheckboxLabel}>Time spent on each question</span>
              </label>

              <label className={styles.exportCheckbox}>
                <input
                  type="checkbox"
                  checked={includeOptions.accuracyScores}
                  onChange={e => setIncludeOptions(prev => ({ ...prev, accuracyScores: e.target.checked }))}
                />
                <span className={styles.exportCheckboxLabel}>Accuracy scores per question</span>
              </label>

              <label className={styles.exportCheckbox}>
                <input
                  type="checkbox"
                  checked={includeOptions.flagReasons}
                  onChange={e => setIncludeOptions(prev => ({ ...prev, flagReasons: e.target.checked }))}
                />
                <span className={styles.exportCheckboxLabel}>Flag reasons for low-quality responses</span>
              </label>
            </div>
          )}
        </div>

        <div className={styles.exportModalFooter}>
          <button className={styles.exportCancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.exportDownloadBtn} onClick={handleExport}>
            <Download size={14} />
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export function ResponseTable({ responses, pageSize: initialPageSize = 15 }: ResponseTableProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [qualityFilter, setQualityFilter] = useState<QualityFilter>('all');
  const [showExportModal, setShowExportModal] = useState(false);

  // Filter responses
  const filteredResponses = useMemo(() => {
    return responses.filter(r => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesId = r.id.toLowerCase().includes(query);
        const matchesAnswer = r.responses.some(qr =>
          qr.answer.toLowerCase().includes(query) ||
          qr.questionText.toLowerCase().includes(query)
        );
        if (!matchesId && !matchesAnswer) return false;
      }

      // Status filter
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      // Quality filter
      if (qualityFilter !== 'all') {
        const score = r.qualityScore || 100;
        if (qualityFilter === 'excellent' && score < 80) return false;
        if (qualityFilter === 'good' && (score < 60 || score >= 80)) return false;
        if (qualityFilter === 'poor' && score >= 60) return false;
      }

      return true;
    });
  }, [responses, searchQuery, statusFilter, qualityFilter]);

  const totalPages = Math.ceil(filteredResponses.length / pageSize);
  const paginatedResponses = filteredResponses.slice(page * pageSize, (page + 1) * pageSize);

  // Reset page when filters change
  React.useEffect(() => {
    setPage(0);
  }, [searchQuery, statusFilter, qualityFilter, pageSize]);

  if (responses.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <div className={styles.tableEmpty}>
          <span>No responses yet</span>
          <span style={{ fontSize: 12, color: 'var(--insights-fg-subtle)' }}>
            Share your survey to start collecting data
          </span>
        </div>
      </div>
    );
  }

  const gridColumns = '50px 1fr 100px 28px';

  return (
    <>
      <div className={styles.tableWrapper}>
        {/* Toolbar with Search, Filters, and Rows Per Page */}
        <div className={styles.tableToolbar}>
          <div className={styles.tableToolbarLeft}>
            {/* Search */}
            <div className={styles.tableSearch}>
              <Search size={14} />
              <input
                type="text"
                placeholder="Search responses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter Dropdown */}
            <div className={styles.filterDropdown}>
              <Filter size={12} />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as StatusFilter)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>

            {/* Quality Filter Dropdown */}
            <div className={styles.filterDropdown}>
              <Award size={12} />
              <select
                value={qualityFilter}
                onChange={e => setQualityFilter(e.target.value as QualityFilter)}
                className={styles.filterSelect}
              >
                <option value="all">All Quality</option>
                <option value="excellent">Excellent (80+)</option>
                <option value="good">Good (60-79)</option>
                <option value="poor">Poor (&lt;60)</option>
              </select>
            </div>
          </div>

          <div className={styles.tableToolbarRight}>
            {/* Rows per page */}
            <div className={styles.rowsSelector}>
              <span>Show</span>
              <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>rows</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className={styles.tableHeader} style={{ gridTemplateColumns: gridColumns }}>
          <span>#</span>
          <span>Response</span>
          <span style={{ textAlign: 'right' }}>Metrics</span>
          <span></span>
        </div>

        {/* Rows */}
        {paginatedResponses.length === 0 ? (
          <div className={styles.tableEmpty}>
            <span>No matching responses</span>
            <span style={{ fontSize: 12, color: 'var(--insights-fg-subtle)' }}>
              Try adjusting your search or filters
            </span>
          </div>
        ) : (
          paginatedResponses.map((response, idx) => {
            const isExpanded = expandedId === response.id;
            const globalIdx = filteredResponses.indexOf(response);
            const isFlagged = response.isFlagged;
            const qualityScore = response.qualityScore || 100;

            return (
              <React.Fragment key={response.id}>
                <div
                  className={cn(
                    styles.tableRow,
                    styles.tableRowClickable,
                    isFlagged && styles.tableRowFlagged
                  )}
                  style={{ gridTemplateColumns: gridColumns }}
                  onClick={() => setExpandedId(isExpanded ? null : response.id)}
                >
                  {/* Row Number */}
                  <span style={{ fontFamily: 'var(--insights-font-mono)', fontSize: 11, color: 'var(--insights-fg-muted)' }}>
                    {String(globalIdx + 1).padStart(3, '0')}
                  </span>

                  {/* Response Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, color: 'var(--insights-fg-secondary)' }}>
                        {formatDistanceToNow(response.submittedAt, { addSuffix: true })}
                      </span>
                      <span style={{ color: 'var(--insights-fg-muted)' }}>
                        <DeviceIcon type={response.deviceType} />
                      </span>
                      <StatusBadge status={response.status} variant="badge" />
                      <CipherIndicator response={response} />
                    </div>
                  </div>

                  {/* Metrics Tags */}
                  <div className={styles.tableCellTags}>
                    <span className={styles.metaTag}>
                      <Clock size={10} />
                      {(response.completionTime / 60).toFixed(1)}m
                    </span>
                    <span className={cn(
                      styles.metaTag,
                      qualityScore >= 80 ? styles.metaTagSuccess :
                      qualityScore >= 60 ? styles.metaTagWarning :
                      styles.metaTagDanger
                    )}>
                      {qualityScore.toFixed(0)}
                    </span>
                  </div>

                  {/* Expand Toggle */}
                  <span style={{ color: 'var(--insights-fg-muted)', display: 'flex', justifyContent: 'center' }}>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </span>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{
                    padding: 20,
                    background: 'var(--insights-bg-card-hover)',
                    borderBottom: '1px solid var(--insights-border)'
                  }}>
                    <div style={{
                      display: 'flex',
                      gap: 16,
                      marginBottom: 16,
                      paddingBottom: 12,
                      borderBottom: '1px solid var(--insights-border)'
                    }}>
                      <span style={{
                        fontFamily: 'var(--insights-font-mono)',
                        fontSize: 10,
                        color: 'var(--insights-fg-muted)',
                        padding: '3px 8px',
                        background: 'var(--insights-bg-card)',
                        borderRadius: 4
                      }}>
                        {response.id.slice(0, 8)}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--insights-fg-muted)' }}>
                        {format(response.submittedAt, 'MMM d, yyyy h:mm a')}
                      </span>
                      {response.flagReasons && response.flagReasons.length > 0 && (
                        <span style={{
                          fontSize: 10,
                          color: 'var(--insights-danger)',
                          padding: '3px 8px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          borderRadius: 4,
                          fontFamily: 'var(--insights-font-mono)'
                        }}>
                          {response.flagReasons.join(', ')}
                        </span>
                      )}
                    </div>

                    <div className={styles.responseAnswers}>
                      {response.responses.map((qr, qIdx) => (
                        <div
                          key={qr.questionId}
                          className={cn(
                            styles.responseAnswer,
                            qr.issues?.length && styles.responseAnswerIssue
                          )}
                        >
                          <div className={styles.responseQuestion}>
                            <span className={styles.responseQNum}>Q{qIdx + 1}</span>
                            {qr.questionText}
                          </div>
                          <div className={styles.responseAnswerText}>{qr.answer}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <span className={styles.metaTag}>
                              <Clock size={10} />
                              {qr.timeTaken.toFixed(1)}s
                            </span>
                            <span className={cn(
                              styles.metaTag,
                              qr.accuracyScore >= 80 ? styles.metaTagSuccess :
                              qr.accuracyScore >= 60 ? styles.metaTagWarning :
                              styles.metaTagDanger
                            )}>
                              {qr.accuracyScore.toFixed(0)}%
                            </span>
                            {qr.issues && qr.issues.length > 0 && (
                              <span className={cn(styles.metaTag, styles.metaTagDanger)}>
                                {qr.issues.length} issue{qr.issues.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}

        {/* Footer with Pagination and Export */}
        <div className={styles.tableFooter}>
          <div className={styles.pagination}>
            <button
              className={styles.paginationBtn}
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft size={16} />
            </button>
            <span className={styles.paginationInfo}>
              {page + 1} / {Math.max(1, totalPages)}
            </span>
            <button
              className={styles.paginationBtn}
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <button className={styles.exportBtn} onClick={() => setShowExportModal(true)}>
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        responses={filteredResponses}
      />
    </>
  );
}

export default ResponseTable;
