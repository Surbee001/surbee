'use client'; // OLD component retained for legacy references

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextShimmer } from './text-shimmer';
import { cn } from '@/lib/utils';

interface ThinkingDisplayProps {
  isThinking: boolean;
  isBuilding: boolean;
  thinkingContent: string[];
  thinkingStartTime?: number;
  className?: string;
}

export function ThinkingDisplay({
  isThinking,
  isBuilding,
  thinkingContent,
  thinkingStartTime,
  className,
}: ThinkingDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [thinkingDuration, setThinkingDuration] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Auto-expand when thinking starts
  useEffect(() => {
    if (isThinking && !isExpanded) {
      setIsExpanded(true);
      setThinkingDuration(null);
    }
  }, [isThinking, isExpanded]);

  // Track thinking duration
  useEffect(() => {
    if (isThinking && thinkingStartTime) {
      intervalRef.current = setInterval(() => {
        const duration = (Date.now() - thinkingStartTime) / 1000;
        setThinkingDuration(duration);
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (!isThinking && thinkingStartTime) {
        const finalDuration = (Date.now() - thinkingStartTime) / 1000;
        setThinkingDuration(finalDuration);
        // Auto-collapse after a brief delay
        setTimeout(() => setIsExpanded(false), 2000);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isThinking, thinkingStartTime]);

  const formatDuration = (seconds: number) => {
    return seconds < 10 ? seconds.toFixed(1) : Math.floor(seconds).toString();
  };

  if (!isThinking && !isBuilding && !thinkingContent.length) {
    return null;
  }

  return (
    <div className={cn('mb-2', className)}>
      {/* Main status display */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors group w-full text-left"
      >
        {isThinking ? (
          <TextShimmer
            as="span" 
            className="text-blue-400 font-medium"
            duration={1.5}
          >
            Thinking
          </TextShimmer>
        ) : isBuilding ? (
          <TextShimmer
            as="span" 
            className="text-green-400 font-medium"
            duration={1.2}
          >
            Building
          </TextShimmer>
        ) : thinkingDuration ? (
          <span className="text-gray-400 font-medium">
            Thought for {formatDuration(thinkingDuration)}s
          </span>
        ) : null}

        {thinkingContent.length > 0 && (
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="opacity-50 group-hover:opacity-100"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        )}
      </button>

      {/* Collapsible thinking content */}
      <AnimatePresence>
        {isExpanded && thinkingContent.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2 pl-4 border-l-2 border-blue-500/30 space-y-1">
              {thinkingContent.map((line, index) => {
                // Parse THINK: and PLAN: prefixes
                const match = line.match(/^(THINK|PLAN):\s*(.+)$/);
                if (match) {
                  const [, prefix, content] = match;
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="text-xs text-gray-400"
                    >
                      <span className={cn(
                        'font-medium mr-1',
                        prefix === 'THINK' ? 'text-blue-400' : 'text-purple-400'
                      )}>
                        {prefix}:
                      </span>
                      <span className="text-gray-300">{content}</span>
                    </motion.div>
                  );
                }
                
                // Regular content
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="text-xs text-gray-400"
                  >
                    {line}
                  </motion.div>
                );
              })}
              
              {/* Show live duration while thinking */}
              {isThinking && thinkingDuration && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-gray-500 italic mt-1"
                >
                  {formatDuration(thinkingDuration)}s...
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
