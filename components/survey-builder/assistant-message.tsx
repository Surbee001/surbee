'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThoughtProcess from './thought-process';
import LatestChange from './latest-change';
import { useBuilder } from './builder-context';
import { ShiningText } from '@/components/ui/shining-text';
import type { Survey } from './types';
import { BotIcon } from '@/components/icons';

interface AssistantMessageProps {
  id: string;
  role: 'assistant';
  content?: string;
  agentUsed?: string;
  changes?: Record<string, any>;
  previousSurvey?: Survey;
  thoughtProcess?: string[];
  phase?: 'thinking' | 'streaming' | 'answered';
}

export default function AssistantMessage({
  id,
  role,
  content = '',
  agentUsed = 'Design Expert',
  changes = {},
  previousSurvey,
  thoughtProcess = [],
  phase = 'answered',
}: AssistantMessageProps) {
  const { updateSurvey } = useBuilder();
  const [currentThought, setCurrentThought] = useState<string>('');
  const [thoughts, setThoughts] = useState<string[]>([]);
  const [startTime] = useState<number>(Date.now());

  useEffect(() => {
    // Update thoughts when they change
    if (phase === 'thinking' && thoughtProcess) {
      if (thoughtProcess.length > 0) {
        setThoughts(thoughtProcess.slice(0, -1));
        setCurrentThought(thoughtProcess[thoughtProcess.length - 1]);
      }
    } else if (phase === 'answered' && thoughtProcess) {
      setThoughts(thoughtProcess);
      setCurrentThought('');
    }
  }, [thoughtProcess, phase]);

  const handleRestore = useCallback(() => {
    if (previousSurvey && updateSurvey) {
      updateSurvey(previousSurvey);
    }
  }, [previousSurvey, updateSurvey]);

  const renderMarkdown = (text: string) => {
    // Simple markdown parsing: handle headers, bold, code blocks, lists
    return text.split('\n').map((line, i) => {
      // Create unique key with line content hash
      const lineKey = `${id}-line-${i}-${line.slice(0, 10).replace(/\s/g, '')}`;

      if (line.match(/^# /)) {
        return (
          <h1 key={lineKey} className="text-xl font-bold mt-4 mb-2">
            {line.replace(/^# /, '')}
          </h1>
        );
      } else if (line.match(/^## /)) {
        return (
          <h2 key={lineKey} className="text-lg font-bold mt-4 mb-2">
            {line.replace(/^## /, '')}
          </h2>
        );
      } else if (line.match(/^### /)) {
        return (
          <h3 key={lineKey} className="text-md font-bold mt-3 mb-1">
            {line.replace(/^### /, '')}
          </h3>
        );
      } else if (line.match(/^\* /)) {
        return (
          <li key={lineKey} className="ml-4 list-disc">
            {line.replace(/^\* /, '')}
          </li>
        );
      } else if (line.match(/^- /)) {
        return (
          <li key={lineKey} className="ml-4 list-disc">
            {line.replace(/^- /, '')}
          </li>
        );
      } else if (line === '') {
        return <br key={lineKey} />;
      } else {
        return (
          <p key={lineKey} className="my-1">
            {line}
          </p>
        );
      }
    });
  };

  const isDarkMode = true; // Force dark mode for chat interface

  return (
    <div className="w-full py-4 font-dmsans" id={id}>
      <div className="space-y-2 overflow-hidden">
        {/* Thinking Process */}
        {(phase === 'thinking' || thoughts.length > 0) && (
          <ThoughtProcess
            isThinking={phase === 'thinking'}
            currentThought={currentThought}
            thoughts={thoughts}
            startTime={startTime}
            phase={phase}
          />
        )}

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {phase === 'streaming' && !content && (
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-headline"
            >
              <ShiningText text="Generating response..." className="text-sm" />
            </motion.div>
          )}

          {content && (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="font-headline"
            >
              {/* Response content */}
              <div
                className={`prose prose-sm ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'} max-w-none`}
              >
                {renderMarkdown(content)}
              </div>

              {/* Latest Changes - only show after response is fully complete */}
              {phase === 'answered' && Object.keys(changes).length > 0 && (
                <div className="mt-4">
                  <LatestChange
                    changes={changes}
                    previousSurvey={previousSurvey}
                    onRestore={handleRestore}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
