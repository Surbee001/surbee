'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  MessageSquarePlus,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import SurveyChat from './survey-chat';
import { useBuilder } from './builder-context';

export default function WelcomeScreen() {
  const { setHasStarted } = useBuilder();

  const handleStart = () => {
    setHasStarted(true);
  };

  return (
    <div className="flex flex-col h-full w-full items-center justify-center p-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center mb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
            className="bg-orange-500 rounded-full p-3"
          >
            <Sparkles size={24} className="text-white" />
          </motion.div>
        </div>
        <h1 className="text-3xl font-light tracking-tight mb-2">
          Elegant Survey Builder
        </h1>
        <p className="text-zinc-400 max-w-md mx-auto">
          Create beautiful, professional surveys with AI assistance and
          Typeform-inspired design
        </p>
      </motion.div>

      <motion.div
        className="w-full max-w-lg space-y-6 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="bg-zinc-800/50 rounded-lg p-4 flex items-start gap-3">
          <div className="mt-1">
            <MessageSquarePlus size={20} className="text-orange-500" />
          </div>
          <div className="text-left">
            <h3 className="font-medium mb-1">Describe your survey needs</h3>
            <p className="text-sm text-zinc-400">
              Tell our AI what kind of survey you want to create, including
              purpose, target audience, and design preferences.
            </p>
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 flex items-start gap-3">
          <div className="mt-1">
            <Lightbulb size={20} className="text-orange-500" />
          </div>
          <div className="text-left">
            <h3 className="font-medium mb-1">Get expert design suggestions</h3>
            <p className="text-sm text-zinc-400">
              Our AI experts will help with question design, layout
              improvements, accessibility, and analytics best practices.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <motion.button
          onClick={handleStart}
          className="bg-orange-500 hover:bg-orange-600 text-white rounded-md px-6 py-3 flex items-center gap-2 font-medium transition-colors"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          Get Started
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    </div>
  );
}
