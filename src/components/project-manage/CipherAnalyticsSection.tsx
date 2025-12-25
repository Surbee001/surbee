"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, AlertTriangle, Shield, ShieldAlert, ShieldCheck, Eye } from 'lucide-react';

interface ModelScore {
  name: string;
  score: number;
  description: string;
}

interface FraudCase {
  id: string;
  responseId: string;
  timestamp: string;
  fraudScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  modelScores: ModelScore[];
  evidence: { type: string; description: string }[];
  reasoning: string;
  reviewed: boolean;
  reviewDecision?: 'accept' | 'reject' | 'flag';
}

interface CipherAnalyticsSectionProps {
  projectId?: string;
}

// Sample data
const sampleModelScores: ModelScore[] = [
  { name: 'Behavioral', score: 0.12, description: 'Mouse/keyboard patterns, timing' },
  { name: 'AI Content', score: 0.08, description: 'AI-generated text detection' },
  { name: 'Plagiarism', score: 0.05, description: 'Web source matching' },
  { name: 'Contradictions', score: 0.03, description: 'Logical inconsistencies' },
  { name: 'Device', score: 0.15, description: 'Device fingerprint analysis' },
  { name: 'Fraud Ring', score: 0.02, description: 'Cross-session patterns' },
];

const sampleFraudCases: FraudCase[] = [
  {
    id: 'fraud-1',
    responseId: 'resp-247',
    timestamp: '2024-01-15 14:32',
    fraudScore: 0.87,
    riskLevel: 'critical',
    confidence: 0.92,
    modelScores: [
      { name: 'AI Content', score: 0.95, description: 'AI-generated text' },
      { name: 'Behavioral', score: 0.78, description: 'Abnormal patterns' },
      { name: 'Plagiarism', score: 0.65, description: 'Web matches' },
    ],
    evidence: [
      { type: 'critical', description: 'Clear AI-generated content (ChatGPT/Claude signature)' },
      { type: 'high', description: 'Fast completion time (2s per question)' },
      { type: 'high', description: '5 paste events detected' },
    ],
    reasoning: 'Response contains AI signature phrase "As an AI language model" and exhibits perfect grammar with no natural errors.',
    reviewed: false,
  },
  {
    id: 'fraud-2',
    responseId: 'resp-189',
    timestamp: '2024-01-15 11:18',
    fraudScore: 0.72,
    riskLevel: 'high',
    confidence: 0.85,
    modelScores: [
      { name: 'Fraud Ring', score: 0.88, description: 'Coordinated submission' },
      { name: 'Device', score: 0.72, description: 'Shared device' },
      { name: 'Behavioral', score: 0.45, description: 'Similar patterns' },
    ],
    evidence: [
      { type: 'high', description: 'Device fingerprint matches 4 other submissions' },
      { type: 'high', description: 'Submitted within 3-minute window of similar responses' },
      { type: 'medium', description: 'Same IP address as flagged responses' },
    ],
    reasoning: 'Detected coordinated fraud ring activity. Multiple submissions from same device with nearly identical answers.',
    reviewed: true,
    reviewDecision: 'reject',
  },
  {
    id: 'fraud-3',
    responseId: 'resp-156',
    timestamp: '2024-01-14 16:45',
    fraudScore: 0.58,
    riskLevel: 'medium',
    confidence: 0.71,
    modelScores: [
      { name: 'Behavioral', score: 0.62, description: 'Automation detected' },
      { name: 'AI Content', score: 0.45, description: 'Possible AI assist' },
    ],
    evidence: [
      { type: 'medium', description: 'Robotic mouse movements (straight lines)' },
      { type: 'medium', description: 'Uniform keystroke timing' },
      { type: 'low', description: '12 tab switches during survey' },
    ],
    reasoning: 'Behavioral patterns suggest possible automation or scripting. Mouse movements lack natural variation.',
    reviewed: true,
    reviewDecision: 'flag',
  },
];

const sampleStats = {
  totalResponses: 247,
  flaggedCount: 18,
  criticalCount: 3,
  highCount: 7,
  mediumCount: 8,
  avgFraudScore: 0.12,
  detectionRate: 0.073,
  falsePositiveRate: 0.02,
};

export default function CipherAnalyticsSection({ projectId }: CipherAnalyticsSectionProps) {
  const [viewMode, setViewMode] = useState<'overview' | 'cases'>('overview');
  const [expandedCase, setExpandedCase] = useState<string | null>(null);
  const [filterRisk, setFilterRisk] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22c55e';
      default: return 'var(--surbee-fg-tertiary)';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'critical': return <ShieldAlert size={16} style={{ color: getRiskColor(risk) }} />;
      case 'high': return <AlertTriangle size={16} style={{ color: getRiskColor(risk) }} />;
      case 'medium': return <Shield size={16} style={{ color: getRiskColor(risk) }} />;
      default: return <ShieldCheck size={16} style={{ color: getRiskColor(risk) }} />;
    }
  };

  const filteredCases = sampleFraudCases.filter(c =>
    filterRisk === 'all' || c.riskLevel === filterRisk
  );

  const filterOptions = [
    { key: 'all', label: 'All Risk Levels' },
    { key: 'critical', label: 'Critical Only' },
    { key: 'high', label: 'High & Above' },
    { key: 'medium', label: 'Medium & Above' },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
        borderRadius: '6px',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Cipher Video Icon */}
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <video
              autoPlay
              loop
              muted
              playsInline
              src="https://framerusercontent.com/assets/cdgTlEeojTdZY77oir3VopVK4Y.mp4"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
              Cipher Analysis
            </span>
            <div style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)', marginTop: '2px' }}>
              7-Layer Fraud Detection
            </div>
          </div>

          {/* View Toggle */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '4px',
              backgroundColor: 'var(--surbee-bg-primary, #fff)',
              borderRadius: '9999px',
              marginLeft: '12px',
              border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
            }}
          >
            {(['overview', 'cases'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 14px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: viewMode === mode ? 'var(--surbee-bg-primary, #fff)' : 'var(--surbee-fg-secondary)',
                  backgroundColor: viewMode === mode ? 'var(--surbee-fg-primary)' : 'transparent',
                  border: 'none',
                  borderRadius: '9999px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {mode === 'overview' ? 'Overview' : 'Fraud Cases'}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Dropdown (for cases view) */}
        {viewMode === 'cases' && (
          <div ref={filterRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px 8px 14px',
                background: 'var(--surbee-bg-primary, #fff)',
                border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                borderRadius: '9999px',
                color: 'var(--surbee-fg-primary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              <span>{filterOptions.find(f => f.key === filterRisk)?.label}</span>
              <ChevronDown
                size={14}
                style={{
                  color: 'var(--surbee-fg-tertiary)',
                  transform: showFilterDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>

            {showFilterDropdown && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '4px',
                  background: 'var(--surbee-bg-primary, #fff)',
                  border: '1px solid var(--surbee-bg-tertiary, #e5e5e5)',
                  borderRadius: '16px',
                  padding: '8px',
                  minWidth: '160px',
                  zIndex: 100,
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                }}
              >
                {filterOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => {
                      setFilterRisk(key as typeof filterRisk);
                      setShowFilterDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: 'var(--surbee-fg-primary)',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surbee-bg-secondary, #f5f5f5)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <span>{label}</span>
                    {filterRisk === key && <Check size={14} style={{ color: 'var(--surbee-fg-tertiary)' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overview View */}
      {viewMode === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Stats Row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)', marginBottom: '4px' }}>
                Total Flagged
              </div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
                {sampleStats.flaggedCount}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)', marginTop: '4px' }}>
                of {sampleStats.totalResponses} responses
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)', marginBottom: '4px' }}>
                Detection Rate
              </div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
                {(sampleStats.detectionRate * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)', marginTop: '4px' }}>
                flagged as suspicious
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)', marginBottom: '4px' }}>
                Avg Fraud Score
              </div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
                {(sampleStats.avgFraudScore * 100).toFixed(0)}%
              </div>
              <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '4px' }}>
                Low risk overall
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <div style={{ fontSize: '12px', color: 'var(--surbee-fg-tertiary)', marginBottom: '4px' }}>
                False Positive Rate
              </div>
              <div style={{ fontSize: '24px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
                {(sampleStats.falsePositiveRate * 100).toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)', marginTop: '4px' }}>
                Target: &lt;5%
              </div>
            </div>
          </div>

          {/* Risk Breakdown */}
          <div
            style={{
              backgroundColor: 'var(--surbee-bg-primary, #fff)',
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginBottom: '16px' }}>
              Risk Level Breakdown
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[
                { label: 'Critical', count: sampleStats.criticalCount, color: '#ef4444' },
                { label: 'High', count: sampleStats.highCount, color: '#f97316' },
                { label: 'Medium', count: sampleStats.mediumCount, color: '#eab308' },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                    borderRadius: '6px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '20px', fontWeight: 500, color: item.color }}>
                    {item.count}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)', marginTop: '4px' }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            {/* Risk Bar */}
            <div
              style={{
                height: '8px',
                backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                borderRadius: '4px',
                overflow: 'hidden',
                display: 'flex',
              }}
            >
              <div style={{ width: `${(sampleStats.criticalCount / sampleStats.flaggedCount) * 100}%`, backgroundColor: '#ef4444' }} />
              <div style={{ width: `${(sampleStats.highCount / sampleStats.flaggedCount) * 100}%`, backgroundColor: '#f97316' }} />
              <div style={{ width: `${(sampleStats.mediumCount / sampleStats.flaggedCount) * 100}%`, backgroundColor: '#eab308' }} />
            </div>
          </div>

          {/* Model Performance */}
          <div
            style={{
              backgroundColor: 'var(--surbee-bg-primary, #fff)',
              borderRadius: '6px',
              padding: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginBottom: '16px' }}>
              Detection Model Performance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sampleModelScores.map((model) => (
                <div key={model.name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '80px', fontSize: '12px', color: 'var(--surbee-fg-secondary)' }}>
                    {model.name}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: '6px',
                      backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                      borderRadius: '3px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${model.score * 100}%`,
                        backgroundColor: model.score > 0.5 ? '#ef4444' : model.score > 0.2 ? '#eab308' : 'var(--surbee-fg-primary)',
                        borderRadius: '3px',
                      }}
                    />
                  </div>
                  <div style={{ width: '40px', fontSize: '12px', color: 'var(--surbee-fg-tertiary)', textAlign: 'right' }}>
                    {(model.score * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)', marginTop: '12px' }}>
              Average score across all responses. Lower is better.
            </div>
          </div>
        </div>
      )}

      {/* Cases View */}
      {viewMode === 'cases' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredCases.length === 0 ? (
            <div
              style={{
                padding: '40px',
                textAlign: 'center',
                color: 'var(--surbee-fg-tertiary)',
                backgroundColor: 'var(--surbee-bg-primary, #fff)',
                borderRadius: '6px',
              }}
            >
              No fraud cases found for this filter.
            </div>
          ) : (
            filteredCases.map((fraudCase) => (
              <div
                key={fraudCase.id}
                style={{
                  backgroundColor: 'var(--surbee-bg-primary, #fff)',
                  borderRadius: '6px',
                  overflow: 'hidden',
                }}
              >
                {/* Case Header */}
                <button
                  onClick={() => setExpandedCase(expandedCase === fraudCase.id ? null : fraudCase.id)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getRiskIcon(fraudCase.riskLevel)}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--surbee-fg-primary)' }}>
                          Response #{fraudCase.responseId.split('-')[1]}
                        </span>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 500,
                            color: getRiskColor(fraudCase.riskLevel),
                            textTransform: 'uppercase',
                            letterSpacing: '0.03em',
                          }}
                        >
                          {fraudCase.riskLevel}
                        </span>
                        {fraudCase.reviewed && (
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: fraudCase.reviewDecision === 'reject' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                              color: fraudCase.reviewDecision === 'reject' ? '#ef4444' : '#eab308',
                            }}
                          >
                            {fraudCase.reviewDecision === 'reject' ? 'Rejected' : 'Flagged'}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--surbee-fg-tertiary)', marginTop: '2px' }}>
                        {fraudCase.timestamp} • Score: {(fraudCase.fraudScore * 100).toFixed(0)}% • Confidence: {(fraudCase.confidence * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {!fraudCase.reviewed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Review action
                        }}
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: 'var(--surbee-fg-primary)',
                          backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Eye size={12} />
                        Review
                      </button>
                    )}
                    <ChevronDown
                      size={16}
                      style={{
                        color: 'var(--surbee-fg-tertiary)',
                        transform: expandedCase === fraudCase.id ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedCase === fraudCase.id && (
                  <div
                    style={{
                      padding: '0 16px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    {/* Model Scores */}
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginBottom: '10px' }}>
                        Detection Model Scores
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {fraudCase.modelScores.map((model) => (
                          <div
                            key={model.name}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: 'var(--surbee-bg-primary, #fff)',
                              borderRadius: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                            }}
                          >
                            <span style={{ fontSize: '12px', color: 'var(--surbee-fg-secondary)' }}>
                              {model.name}
                            </span>
                            <span
                              style={{
                                fontSize: '12px',
                                fontWeight: 500,
                                color: model.score > 0.7 ? '#ef4444' : model.score > 0.4 ? '#eab308' : 'var(--surbee-fg-primary)',
                              }}
                            >
                              {(model.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Evidence */}
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginBottom: '10px' }}>
                        Evidence
                      </div>
                      <ul
                        style={{
                          margin: 0,
                          padding: 0,
                          listStyle: 'none',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        {fraudCase.evidence.map((e, i) => (
                          <li
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              fontSize: '12px',
                              color: 'var(--surbee-fg-secondary)',
                            }}
                          >
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 600,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: e.type === 'critical' ? 'rgba(239, 68, 68, 0.1)' : e.type === 'high' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                                color: e.type === 'critical' ? '#ef4444' : e.type === 'high' ? '#f97316' : '#eab308',
                                textTransform: 'uppercase',
                                flexShrink: 0,
                              }}
                            >
                              {e.type}
                            </span>
                            {e.description}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Reasoning */}
                    <div
                      style={{
                        padding: '12px',
                        backgroundColor: 'var(--surbee-bg-secondary, #f5f5f5)',
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--surbee-fg-primary)', marginBottom: '8px' }}>
                        AI Reasoning
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '12px',
                          color: 'var(--surbee-fg-secondary)',
                          lineHeight: '1.5',
                        }}
                      >
                        {fraudCase.reasoning}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
