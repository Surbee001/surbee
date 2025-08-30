'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';

interface LatestChangeProps {
  changes?: Record<string, any>;
  previousSurvey?: Record<string, any>;
  onRestore?: () => void;
}

export default function LatestChange({
  changes,
  previousSurvey,
  onRestore,
}: LatestChangeProps) {
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  if (!changes || Object.keys(changes).length === 0) return null;

  const getCompactSummary = (changes: Record<string, any>) => {
    const changedParts = [];

    if (changes.title) changedParts.push('title');
    if (changes.theme) changedParts.push('theme');
    if (changes.pages) {
      const pageCount = Array.isArray(changes.pages)
        ? changes.pages.length
        : Object.keys(changes.pages).length;

      if (pageCount === 1) {
        changedParts.push('1 page');
      } else if (pageCount > 1) {
        changedParts.push(`${pageCount} pages`);
      }
    }

    if (changedParts.length === 0) return 'Updated survey';

    const mainChanges = changedParts.slice(0, 2).join(' & ');
    const extraCount = changedParts.length > 2 ? changedParts.length - 2 : 0;

    return `Updated ${mainChanges}${extraCount > 0 ? ` +${extraCount}` : ''}`;
  };

  const changeSummary = getCompactSummary(changes);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-3 py-2 mt-3 backdrop-blur-sm font-dmsans"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-md bg-orange-500" />
          <span className="text-sm text-zinc-100">{changeSummary}</span>
          <span className="text-xs text-zinc-400">now</span>
        </div>

        <div className="flex items-center gap-2">
          {onRestore && previousSurvey && (
            <motion.button
              className="p-1 rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              onClick={onRestore}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Restore previous version"
            >
              <RotateCcw size={16} />
            </motion.button>
          )}
          <motion.button
            className={`p-1 rounded transition-colors ${
              feedback === 'up'
                ? 'text-green-500'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            onClick={() => setFeedback('up')}
            whileHover={feedback !== 'up' ? { scale: 1.05 } : {}}
            whileTap={feedback !== 'up' ? { scale: 0.95 } : {}}
            disabled={feedback === 'up'}
            title="This change is helpful"
          >
            <ThumbsUp size={16} />
          </motion.button>
          <motion.button
            className={`p-1 rounded transition-colors ${
              feedback === 'down'
                ? 'text-red-500'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
            }`}
            onClick={() => setFeedback('down')}
            whileHover={feedback !== 'down' ? { scale: 1.05 } : {}}
            whileTap={feedback !== 'down' ? { scale: 0.95 } : {}}
            disabled={feedback === 'down'}
            title="This change is not helpful"
          >
            <ThumbsDown size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
