'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Sparkles } from 'lucide-react';

interface ThoughtProcessProps {
  isThinking: boolean;
  currentThought: string;
  thoughts: string[];
  onComplete?: () => void;
  startTime?: number;
  phase?: 'thinking' | 'streaming' | 'answered';
}

export default function ThoughtProcess({
  isThinking,
  currentThought,
  thoughts,
  onComplete,
  startTime = Date.now(),
  phase = 'thinking',
}: ThoughtProcessProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [thinkingTime, setThinkingTime] = useState(0);
  const [openedAt] = useState<number>(Date.now());

  useEffect(() => {
    if (!isThinking && (thoughts.length > 0 || currentThought)) {
      const endTime = Date.now();
      const base = startTime || openedAt;
      const calculatedTime = Math.round((endTime - base) / 1000 * 1000) / 1000; // Show decimals like 0.343s
      setThinkingTime(calculatedTime);
    }
  }, [isThinking, thoughts.length, currentThought, startTime, openedAt]);

  useEffect(() => {
    if (!isThinking && !isExpanded && onComplete) {
      onComplete();
    }
  }, [isThinking, isExpanded, onComplete]);

  // Show thinking state - active thinking animation
  if (phase === 'thinking' || isThinking) {
    return (
      <motion.div
        className="flex flex-col gap-6 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2 h-[20px] select-none relative min-w-0">
          <Sparkles 
            className="lucide lucide-sparkle text-text-secondary flex-shrink-0"
            height="15"
            width="15"
            style={{ color: '#8a8a8a' }}
          />
          <p 
            className="text-sm text-text-secondary truncate min-w-0"
            style={{ 
              fontSize: '14px', 
              lineHeight: '20px', 
              color: '#8a8a8a' 
            }}
          >
            Thinking...
          </p>
        </div>

        {/* Real-time streaming thoughts */}
        <div className="text-text-secondary text-sm flex flex-col gap-2">
          <div className="whitespace-pre-wrap font-[450]">
            <div className="tracking-[-0.16px] break-words space-y-2">
              {thoughts.map((thought, index) => (
                <motion.div
                  key={`thought-${index}-${thought.slice(0, 10)}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ 
                    fontSize: '14px', 
                    lineHeight: '20px', 
                    color: '#8a8a8a',
                    fontWeight: 450
                  }}
                >
                  {thought}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Show collapsed state after thinking is complete
  if (phase === 'answered' && thoughts.length > 0) {
    return (
      <div className="flex flex-col gap-6 mb-4">
        <div
          className="cursor-pointer flex items-center gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
          role="button"
          aria-expanded={isExpanded}
        >
          <div className="flex items-center gap-2 h-[20px] select-none relative min-w-0">
            <Sparkles 
              className="lucide lucide-sparkle text-text-secondary flex-shrink-0"
              height="15"
              width="15"
              style={{ color: '#8a8a8a' }}
            />
            <p 
              className="text-sm text-text-secondary truncate min-w-0"
              style={{ 
                fontSize: '14px', 
                lineHeight: '20px', 
                color: '#8a8a8a' 
              }}
            >
              Thought for {thinkingTime}s
            </p>
          </div>
          <ChevronDown
            className="lucide lucide-chevron-down text-feint-foreground"
            height="15"
            width="15"
            style={{
              color: '#6c6c6c',
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          />
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="overflow-hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ 
                height: 'auto', 
                opacity: 1,
                animation: '0.2s ease-out 0s 1 normal none running collapsible-down'
              }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div 
                className="text-text-secondary text-sm flex flex-col gap-2"
                style={{ 
                  fontSize: '14px', 
                  lineHeight: '20px', 
                  color: '#8a8a8a' 
                }}
              >
                <div className="whitespace-pre-wrap font-[450]">
                  <div className="tracking-[-0.16px] break-words space-y-1">
                    {thoughts.map((thought, index) => (
                      <div
                        key={`thought-collapsed-${index}`}
                        style={{ 
                          fontSize: '14px', 
                          lineHeight: '20px', 
                          color: '#8a8a8a',
                          fontWeight: 450
                        }}
                      >
                        {thought}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return null;
}
