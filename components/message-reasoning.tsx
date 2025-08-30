'use client';

import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Markdown } from './markdown';
import { TextShimmer } from './ui/text-shimmer';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="flex items-center justify-center w-4 h-4">
            <TextShimmer className="w-4 h-4 text-primary" duration={1.5}>
              <Brain size={16} />
            </TextShimmer>
          </div>
          <TextShimmer className="font-headline" duration={1.5}>
            Lyra is thinking
          </TextShimmer>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="flex items-center justify-center w-4 h-4">
            <Brain size={16} className="text-primary" />
          </div>
          <div className="font-medium">Lyra thought for a few seconds</div>
          <button
            data-testid="message-reasoning-toggle"
            type="button"
            className="cursor-pointer"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            <ChevronDownIcon />
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            data-testid="message-reasoning"
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="pl-4 text-zinc-600 dark:text-zinc-400 border-l border-primary flex flex-col gap-4"
          >
            <Markdown>{reasoning}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
