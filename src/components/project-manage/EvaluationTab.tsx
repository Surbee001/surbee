"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Play,
  Loader2,
  Check,
  Clock,
  AlertTriangle,
  Plus,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import {
  EvaluationMode,
  EvaluationEvent,
  EvaluationRun,
  AgentAnswer,
  EvaluationSuggestion,
  EVALUATION_MODELS,
  EVALUATION_TONES,
  MODE_DESCRIPTIONS,
} from '@/lib/schemas/evaluation-schemas';

interface EvaluationTabProps {
  projectId: string;
}

const RUN_COUNTS = [1, 2, 3, 4] as const;

export const EvaluationTab: React.FC<EvaluationTabProps> = ({ projectId }) => {
  const { user } = useAuth();

  // Refs for click outside detection
  const modelDropdownRef = useRef<HTMLDivElement>(null);
  const toneDropdownRef = useRef<HTMLDivElement>(null);
  const runCountDropdownRef = useRef<HTMLDivElement>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'successful' | 'failed'>('all');
  const [selectedModel, setSelectedModel] = useState<string>(EVALUATION_MODELS[0].id);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>(EVALUATION_TONES[0].id);
  const [isToneOpen, setIsToneOpen] = useState(false);
  const [runCount, setRunCount] = useState<number>(1);
  const [isRunCountOpen, setIsRunCountOpen] = useState(false);

  // Configuration state
  const [selectedMode, setSelectedMode] = useState<EvaluationMode>('human_like');
  const [customCriteria, setCustomCriteria] = useState('');
  const [userPrompt, setUserPrompt] = useState('');

  // Evaluation state
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [thinking, setThinking] = useState('');
  const [answers, setAnswers] = useState<AgentAnswer[]>([]);
  const [suggestions, setSuggestions] = useState<EvaluationSuggestion[]>([]);
  const [result, setResult] = useState<EvaluationRun | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [evaluationRuns, setEvaluationRuns] = useState<EvaluationRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<EvaluationRun | null>(null);

  // Apply state
  const [applyingId, setApplyingId] = useState<string | null>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setIsModelOpen(false);
      }
      if (toneDropdownRef.current && !toneDropdownRef.current.contains(event.target as Node)) {
        setIsToneOpen(false);
      }
      if (runCountDropdownRef.current && !runCountDropdownRef.current.contains(event.target as Node)) {
        setIsRunCountOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Run evaluation
  const runEvaluation = useCallback(async () => {
    if (!user?.id || isRunning) return;

    setIsRunning(true);
    setError(null);
    setAnswers([]);
    setSuggestions([]);
    setResult(null);
    setProgress({ current: 0, total: 0 });
    setThinking('Starting evaluation...');

    try {
      const response = await fetch(`/api/projects/${projectId}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          mode: selectedMode,
          model: selectedModel,
          tone: selectedTone,
          runCount: runCount,
          customCriteria: selectedMode === 'custom' ? customCriteria : undefined,
          userPrompt: userPrompt || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start evaluation');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: EvaluationEvent = JSON.parse(line.slice(6));
              handleEvent(event);
            } catch (e) {
              console.error('Error parsing event:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('Evaluation error:', err);
      setError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setIsRunning(false);
      setThinking('');
    }
  }, [user?.id, projectId, selectedMode, selectedModel, selectedTone, runCount, customCriteria, userPrompt, isRunning]);

  // Handle SSE events
  const handleEvent = (event: EvaluationEvent) => {
    switch (event.type) {
      case 'status':
        setThinking(event.message || `Status: ${event.status}`);
        break;
      case 'progress':
        setProgress({ current: event.current, total: event.total });
        break;
      case 'thinking':
        setThinking(event.content);
        break;
      case 'answer':
        setAnswers(prev => [...prev, event.answer]);
        break;
      case 'suggestion':
        setSuggestions(prev => [...prev, event.suggestion]);
        break;
      case 'complete':
        setResult(event.result);
        setThinking('');
        break;
      case 'error':
        setError(event.message);
        break;
    }
  };

  // Apply suggestion
  const applySuggestion = async (suggestion: EvaluationSuggestion) => {
    if (!user?.id || applyingId) return;

    setApplyingId(suggestion.id);
    try {
      const res = await fetch(`/api/projects/${projectId}/evaluate/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          suggestionId: suggestion.id,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to apply suggestion');
      }

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestion.id ? { ...s, status: 'applied' } : s
        )
      );
    } catch (err) {
      console.error('Error applying suggestion:', err);
    } finally {
      setApplyingId(null);
    }
  };

  // Dismiss suggestion
  const dismissSuggestion = async (suggestion: EvaluationSuggestion) => {
    try {
      await fetch(`/api/projects/${projectId}/evaluate/apply?suggestionId=${suggestion.id}`, {
        method: 'DELETE',
      });

      setSuggestions(prev =>
        prev.map(s =>
          s.id === suggestion.id ? { ...s, status: 'dismissed' } : s
        )
      );
    } catch (err) {
      console.error('Error dismissing suggestion:', err);
    }
  };

  const getModelName = (id: string) => {
    const model = EVALUATION_MODELS.find(m => m.id === id);
    return model?.name || id;
  };

  const getToneName = (id: string) => {
    const tone = EVALUATION_TONES.find(t => t.id === id);
    return tone?.name || id;
  };

  const hasResults = answers.length > 0 || result !== null;
  const filterButtons = [
    { key: 'all', label: 'All' },
    { key: 'successful', label: 'Successful' },
    { key: 'failed', label: 'Failed' },
  ] as const;

  // Calculate sliding indicator position
  const getIndicatorStyle = () => {
    const index = filterButtons.findIndex(b => b.key === activeFilter);
    const widths = [41, 85, 55]; // Approximate widths
    const positions = [2, 45, 132]; // Approximate positions
    return {
      width: `${widths[index]}px`,
      transform: `translateX(${positions[index]}px)`,
    };
  };

  return (
    <div className="eval-page">
      <style jsx>{`
        .eval-page {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 24px;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Header */
        .page-header {
          padding-bottom: 16px;
        }

        .header-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Filter Bar */
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        /* Segmented Control */
        .segmented-control {
          display: flex;
          align-items: center;
          position: relative;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          padding: 2px;
        }

        .segment-indicator {
          position: absolute;
          top: 2px;
          bottom: 2px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          transition: width 300ms cubic-bezier(.19,1,.22,1), transform 300ms cubic-bezier(.19,1,.22,1);
        }

        .segment-btn {
          position: relative;
          padding: 6px 12px;
          background: transparent;
          border: none;
          color: rgba(232, 232, 232, 0.7);
          font-size: 13px;
          cursor: pointer;
          z-index: 1;
          transition: color 0.15s ease;
        }

        .segment-btn[aria-checked="true"] {
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .segment-btn:hover {
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        /* Dropdown Trigger - /home style */
        .dropdown-wrapper {
          position: relative;
        }

        .dropdown-trigger {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px 6px 12px;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 9999px;
          color: var(--surbee-fg-primary, #E8E8E8);
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .dropdown-trigger:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-trigger svg {
          color: rgba(232, 232, 232, 0.6);
        }

        /* Dropdown Menu - /home style */
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 4px;
          background: rgb(19, 19, 20);
          border: 1px solid rgba(232, 232, 232, 0.08);
          border-radius: 24px;
          padding: 8px;
          min-width: 180px;
          z-index: 100;
          box-shadow: rgba(0, 0, 0, 0.04) 0px 7px 16px;
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 8px 8px 16px;
          border-radius: 18px;
          cursor: pointer;
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin-bottom: 1px;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .dropdown-item svg {
          color: rgba(232, 232, 232, 0.6);
        }

        .dropdown-menu-right {
          left: auto;
          right: 0;
          min-width: 120px;
        }

        /* Run Button */
        .run-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 18px;
          background: var(--surbee-fg-primary, #E8E8E8);
          border: none;
          border-radius: 9999px;
          color: rgb(19, 19, 20);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s ease;
        }

        .run-btn:hover {
          opacity: 0.9;
        }

        .run-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Prompt Section in Right Panel */
        .prompt-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(232, 232, 232, 0.08);
        }

        .prompt-label {
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin-bottom: 8px;
        }

        .prompt-sublabel {
          font-size: 13px;
          color: rgba(232, 232, 232, 0.5);
          margin-bottom: 12px;
        }

        .prompt-textarea {
          width: 100%;
          min-height: 100px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(232, 232, 232, 0.1);
          border-radius: 8px;
          color: var(--surbee-fg-primary, #E8E8E8);
          font-size: 13px;
          font-family: inherit;
          resize: vertical;
          outline: none;
          transition: border-color 0.15s ease;
        }

        .prompt-textarea::placeholder {
          color: rgba(232, 232, 232, 0.35);
        }

        .prompt-textarea:focus {
          border-color: rgba(232, 232, 232, 0.25);
        }

        /* Main Content */
        .main-content {
          display: flex;
          flex: 1;
          min-height: 0;
          border: 1px solid rgba(232, 232, 232, 0.08);
          border-radius: 8px;
          overflow: hidden;
        }

        /* Left Panel - Jobs List */
        .jobs-panel {
          width: 50%;
          border-right: 1px solid rgba(232, 232, 232, 0.08);
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          margin-bottom: 16px;
          color: rgba(232, 232, 232, 0.5);
        }

        .empty-title {
          font-size: 15px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin-bottom: 8px;
        }

        .empty-desc {
          font-size: 13px;
          color: rgba(232, 232, 232, 0.5);
          max-width: 280px;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .empty-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Right Panel - Details/Instructions */
        .details-panel {
          width: 50%;
          display: flex;
          flex-direction: column;
          padding: 32px;
          overflow-y: auto;
        }

        .instructions-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .instructions-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin-bottom: 4px;
        }

        .instruction-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .instruction-number {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          font-size: 12px;
          font-weight: 600;
          color: var(--surbee-fg-primary, #E8E8E8);
          flex-shrink: 0;
        }

        .instruction-text {
          font-size: 14px;
          color: rgba(232, 232, 232, 0.7);
          line-height: 1.6;
        }

        .instruction-text strong {
          color: var(--surbee-fg-primary, #E8E8E8);
          font-weight: 500;
        }

        /* Running State */
        .running-state {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
        }

        .progress-card {
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          margin-bottom: 16px;
        }

        .progress-text {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(232, 232, 232, 0.7);
          margin-bottom: 12px;
        }

        .progress-bar {
          height: 4px;
          background: rgba(232, 232, 232, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #10a37f;
          transition: width 0.3s ease;
        }

        /* Results */
        .results-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .result-item {
          padding: 14px 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 6px;
          border-left: 3px solid transparent;
        }

        .result-item.has-issues {
          border-left-color: #f59e0b;
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .result-num {
          font-size: 11px;
          font-weight: 600;
          color: rgba(232, 232, 232, 0.5);
        }

        .result-question {
          font-size: 12px;
          color: rgba(232, 232, 232, 0.6);
        }

        .result-answer {
          font-size: 14px;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin-bottom: 6px;
        }

        .result-meta {
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: rgba(232, 232, 232, 0.4);
        }

        /* Suggestions */
        .suggestions-section {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(232, 232, 232, 0.08);
        }

        .suggestions-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
          margin-bottom: 16px;
        }

        .suggestion-card {
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          margin-bottom: 12px;
        }

        .suggestion-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 8px;
        }

        .severity-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .severity-dot.critical { background: #ef4444; }
        .severity-dot.high { background: #f59e0b; }
        .severity-dot.medium { background: #3b82f6; }
        .severity-dot.low { background: rgba(232, 232, 232, 0.4); }

        .suggestion-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--surbee-fg-primary, #E8E8E8);
        }

        .suggestion-desc {
          font-size: 13px;
          color: rgba(232, 232, 232, 0.6);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .suggestion-actions {
          display: flex;
          gap: 8px;
        }

        .sug-btn {
          padding: 6px 12px;
          border-radius: 5px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: opacity 0.15s ease;
        }

        .sug-btn.apply {
          background: rgba(16, 163, 127, 0.15);
          color: #10a37f;
        }

        .sug-btn.dismiss {
          background: transparent;
          color: rgba(232, 232, 232, 0.5);
        }

        .sug-btn.dismiss:hover {
          color: rgba(232, 232, 232, 0.8);
        }

        .sug-btn.applied {
          background: rgba(16, 163, 127, 0.1);
          color: #10a37f;
          cursor: default;
        }

        .sug-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Score Badge */
        .score-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
        }

        .score-badge.good {
          background: rgba(16, 163, 127, 0.15);
          color: #10a37f;
        }

        .score-badge.medium {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .score-badge.bad {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        /* Error */
        .error-card {
          padding: 14px 16px;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 6px;
          border-left: 3px solid #ef4444;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #ef4444;
          font-size: 13px;
        }

        /* Success */
        .success-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          text-align: center;
        }

        .success-state svg {
          color: #10a37f;
          margin-bottom: 12px;
        }

        .success-state span {
          color: rgba(232, 232, 232, 0.6);
          font-size: 13px;
        }
      `}</style>

      {/* Header */}
      <div className="page-header">
        <div className="header-top">
          <h1 className="page-title">Evaluation</h1>
          <div className="header-actions">
            {/* Run Count Selector */}
            <div className="dropdown-wrapper" ref={runCountDropdownRef}>
              <button
                className="dropdown-trigger"
                onClick={() => setIsRunCountOpen(!isRunCountOpen)}
              >
                <span>{runCount}x</span>
                <ChevronDown size={14} />
              </button>
              {isRunCountOpen && (
                <div className="dropdown-menu dropdown-menu-right">
                  {RUN_COUNTS.map((count) => (
                    <div
                      key={count}
                      className="dropdown-item"
                      onClick={() => {
                        setRunCount(count);
                        setIsRunCountOpen(false);
                      }}
                    >
                      <span>{count} run{count > 1 ? 's' : ''}</span>
                      {runCount === count && <Check size={16} />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Run Button */}
            <button
              className="run-btn"
              onClick={runEvaluation}
              disabled={isRunning || !user?.id}
            >
              {isRunning ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Running...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Run</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="filter-bar">
          {/* Segmented Control */}
          <div className="segmented-control" role="group" aria-label="Evaluation status filter">
            <div className="segment-indicator" style={getIndicatorStyle()} />
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                className="segment-btn"
                type="button"
                role="radio"
                aria-checked={activeFilter === btn.key}
                onClick={() => setActiveFilter(btn.key)}
              >
                <span className="relative">{btn.label}</span>
              </button>
            ))}
          </div>

          {/* Model Select */}
          <div className="dropdown-wrapper" ref={modelDropdownRef}>
            <button
              className="dropdown-trigger"
              onClick={() => setIsModelOpen(!isModelOpen)}
            >
              <span>{getModelName(selectedModel)}</span>
              <ChevronDown size={14} />
            </button>
            {isModelOpen && (
              <div className="dropdown-menu">
                {EVALUATION_MODELS.map((model) => (
                  <div
                    key={model.id}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedModel(model.id);
                      setIsModelOpen(false);
                    }}
                  >
                    <span>{model.name}</span>
                    {selectedModel === model.id && <Check size={16} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tone Select */}
          <div className="dropdown-wrapper" ref={toneDropdownRef}>
            <button
              className="dropdown-trigger"
              onClick={() => setIsToneOpen(!isToneOpen)}
            >
              <span>{getToneName(selectedTone)}</span>
              <ChevronDown size={14} />
            </button>
            {isToneOpen && (
              <div className="dropdown-menu">
                {EVALUATION_TONES.map((tone) => (
                  <div
                    key={tone.id}
                    className="dropdown-item"
                    onClick={() => {
                      setSelectedTone(tone.id);
                      setIsToneOpen(false);
                    }}
                  >
                    <span>{tone.name}</span>
                    {selectedTone === tone.id && <Check size={16} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Panel */}
        <div className="jobs-panel">
          {!hasResults && !isRunning && !error ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Sliders size={24} />
              </div>
              <div className="empty-title">No evaluation runs found</div>
              <div className="empty-desc">
                Run an evaluation to have AI solve your survey and identify potential issues.
              </div>
              <div className="empty-actions">
                <button
                  className="run-btn"
                  onClick={runEvaluation}
                  disabled={isRunning || !user?.id}
                >
                  <Play size={14} />
                  <span>Run Evaluation</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="running-state">
              {/* Progress */}
              {isRunning && (
                <div className="progress-card">
                  <div className="progress-text">
                    <Loader2 size={14} className="animate-spin" />
                    {thinking || `Question ${progress.current} of ${progress.total}`}
                  </div>
                  {progress.total > 0 && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${(progress.current / progress.total) * 100}%` }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="error-card">
                  <AlertTriangle size={14} />
                  {error}
                </div>
              )}

              {/* Results */}
              {answers.length > 0 && (
                <div className="results-list">
                  {answers.map((answer, idx) => (
                    <div
                      key={answer.questionId}
                      className={`result-item ${answer.issues.length > 0 ? 'has-issues' : ''}`}
                    >
                      <div className="result-header">
                        <span className="result-num">Q{idx + 1}</span>
                        <span className="result-question">{answer.questionText}</span>
                      </div>
                      <div className="result-answer">
                        {typeof answer.answer === 'object' ? JSON.stringify(answer.answer) : String(answer.answer)}
                      </div>
                      <div className="result-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          {answer.timeSpent.toFixed(1)}s
                        </span>
                        {answer.issues.length > 0 && (
                          <span style={{ color: '#f59e0b' }}>
                            {answer.issues.length} issue{answer.issues.length > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="suggestions-section">
                  <div className="suggestions-title">Suggestions</div>
                  {suggestions.map((suggestion) => (
                    <div key={suggestion.id} className="suggestion-card">
                      <div className="suggestion-header">
                        <div className={`severity-dot ${suggestion.severity}`} />
                        <span className="suggestion-title">{suggestion.title}</span>
                      </div>
                      <div className="suggestion-desc">{suggestion.description}</div>
                      <div className="suggestion-actions">
                        {suggestion.status === 'pending' ? (
                          <>
                            <button
                              className="sug-btn apply"
                              onClick={() => applySuggestion(suggestion)}
                              disabled={applyingId === suggestion.id}
                            >
                              {applyingId === suggestion.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <Check size={12} />
                              )}
                              Apply
                            </button>
                            <button
                              className="sug-btn dismiss"
                              onClick={() => dismissSuggestion(suggestion)}
                            >
                              Dismiss
                            </button>
                          </>
                        ) : suggestion.status === 'applied' ? (
                          <span className="sug-btn applied">
                            <Check size={12} /> Applied
                          </span>
                        ) : (
                          <span className="sug-btn dismiss" style={{ cursor: 'default' }}>
                            Dismissed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Success */}
              {!isRunning && result && suggestions.length === 0 && (
                <div className="success-state">
                  <Check size={32} />
                  <span>No issues found. Your survey looks good.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="details-panel">
          {result ? (
            <div style={{ width: '100%' }}>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '15px', fontWeight: '500' }}>Evaluation Results</span>
                <span className={`score-badge ${
                  (result.overallScore || 0) >= 80 ? 'good' :
                  (result.overallScore || 0) >= 60 ? 'medium' : 'bad'
                }`}>
                  Score: {result.overallScore || 0}/100
                </span>
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(232, 232, 232, 0.6)', lineHeight: '1.6' }}>
                {result.reasoning || 'Evaluation completed successfully.'}
              </div>
            </div>
          ) : (
            <div className="instructions-container">
              <div className="instructions-title">Welcome to Evaluation</div>

              <div className="instruction-item">
                <div className="instruction-number">1</div>
                <div className="instruction-text">
                  Select a <strong>model</strong> and <strong>tone</strong> from the dropdowns above, then choose how many evaluation runs to perform.
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-number">2</div>
                <div className="instruction-text">
                  Click <strong>Run</strong> to start. The AI agent will complete your survey as a simulated respondent and identify potential issues.
                </div>
              </div>

              <div className="instruction-item">
                <div className="instruction-number">3</div>
                <div className="instruction-text">
                  Review the agent's responses and suggestions. Click <strong>Apply</strong> to automatically fix issues or <strong>Dismiss</strong> to ignore them.
                </div>
              </div>

              {/* Custom Instructions */}
              <div className="prompt-section">
                <div className="prompt-label">Custom Instructions</div>
                <div className="prompt-sublabel">
                  Guide how the AI evaluates your survey. Try: "Test as a non-native English speaker" or "Focus on accessibility issues"
                </div>
                <textarea
                  className="prompt-textarea"
                  placeholder="Enter specific instructions for the AI evaluator..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
