'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useSurveyStore } from '@/lib/surbee/store';
import { QuestionAtom } from './atoms/QuestionAtom';
import type { DNAMix, AtomStyle, SurveyAtom } from '@/lib/surbee/types';

interface SurbeePlaygroundProps {
  surveyData?: {
    description?: string;
    dnaMix?: DNAMix;
    generatedStyle?: AtomStyle;
    surveyAtoms?: SurveyAtom[];
    isGenerating?: boolean;
  };
}

export function SurbeePlayground({ surveyData }: SurbeePlaygroundProps) {
  const { atoms, currentStyle, isGenerating } = useSurveyStore();
  const [displayAtoms, setDisplayAtoms] = useState<SurveyAtom[]>([]);
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);

  // Update display atoms when store changes
  useEffect(() => {
    if (atoms.length > 0) {
      setDisplayAtoms(atoms);
    } else if (surveyData?.surveyAtoms) {
      setDisplayAtoms(surveyData.surveyAtoms);
    }
  }, [atoms, surveyData?.surveyAtoms]);

  // Show thinking process when generating
  useEffect(() => {
    if (isGenerating || surveyData?.isGenerating) {
      setShowThinking(true);
      setThinkingSteps([
        'Analyzing survey requirements...',
        'Generating optimal DNA mix...',
        'Creating survey questions...',
        'Applying design styles...',
        'Finalizing survey structure...',
      ]);
    } else {
      setShowThinking(false);
    }
  }, [isGenerating, surveyData?.isGenerating]);

  const style = surveyData?.generatedStyle || currentStyle;

  return (
    <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">
            Surbee Playground
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {isGenerating || surveyData?.isGenerating ? (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </div>
          ) : displayAtoms.length > 0 ? (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>{displayAtoms.length} questions</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <AlertCircle className="w-4 h-4" />
              <span>Ready for input</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          {showThinking ? (
            <motion.div
              key="thinking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  AI is designing your survey
                </h4>
                <p className="text-gray-600">
                  Surbee is analyzing your requirements and generating the
                  perfect survey design
                </p>
              </div>

              <div className="space-y-3">
                {thinkingSteps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <span className="text-sm text-gray-700">{step}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : displayAtoms.length > 0 ? (
            <motion.div
              key="survey"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Survey Header */}
              <div className="text-center pb-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {surveyData?.description || 'Your Survey'}
                </h2>
                {surveyData?.dnaMix && (
                  <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                    <span>DNA Mix:</span>
                    {Object.entries(surveyData.dnaMix).map(([key, value]) => (
                      <span key={key} className="px-2 py-1 bg-gray-100 rounded">
                        {key}: {value}%
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Survey Questions */}
              <div className="space-y-6">
                {displayAtoms.map((atom, index) => (
                  <motion.div
                    key={atom.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <QuestionAtom
                      style={atom.style || style}
                      content={atom.content}
                      type={atom.type}
                      options={atom.options}
                      placeholder={atom.placeholder}
                      required={atom.required}
                      id={atom.id}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <Sparkles className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Ready to Create
              </h3>
              <p className="text-gray-600 max-w-md">
                Describe your survey in the chat and Surbee will generate a
                beautiful, AI-powered survey design just for you.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
