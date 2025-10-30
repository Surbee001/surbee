'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShiningText } from '@/components/ui/shining-text';

interface SpinnerAnimationProps {
  states?: string[];
}

export default function SpinnerAnimation({
  states = [],
}: SpinnerAnimationProps) {
  const defaultStates = [
    'Analyzing request...',
    'Exploring design options...',
    'Structuring survey flow...',
    'Crafting questions...',
    'Optimizing user experience...',
    'Refining layout...',
    'Applying design principles...',
    'Finalizing survey design...',
  ];

  const spinnerStates = states.length > 0 ? states : defaultStates;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Jackpot spinner effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % spinnerStates.length);
    }, 2000); // Change state every 2 seconds

    return () => clearInterval(interval);
  }, [spinnerStates.length]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-zinc-900 text-white">
      <div className="w-full max-w-md mx-auto p-8 flex flex-col items-center">
        {/* Jackpot Spinner */}
        <div className="w-full bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden shadow-lg mb-8">
          {/* Spinner Window */}
          <div className="p-1 bg-gradient-to-r from-zinc-700 to-zinc-800">
            {/* Spinner Slot */}
            <div className="bg-zinc-900 p-5 rounded-md relative overflow-hidden">
              {/* Highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent pointer-events-none" />

              {/* Spinner Content */}
              <div className="relative h-20 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    className="absolute"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                    }}
                  >
                    <ShiningText
                      text={spinnerStates[currentIndex]}
                      className="text-xl font-medium text-center"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Bar */}
        <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-orange-500"
            initial={{ width: '0%' }}
            animate={{
              width: '100%',
            }}
            transition={{
              duration: spinnerStates.length * 2,
              ease: 'linear',
            }}
          />
        </div>
      </div>
    </div>
  );
}
