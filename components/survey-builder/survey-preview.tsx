'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, X, Check, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBuilder } from './builder-context';

interface SurveyPreviewProps {
  survey: any;
}

export default function SurveyPreview({ survey }: SurveyPreviewProps) {
  const { currentPageIndex, goToPage, nextPage, prevPage } = useBuilder();
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = survey?.pages || [];
  const currentPage = pages[currentPageIndex] || { questions: [] };

  // Auto-focus on input when question becomes active
  useEffect(() => {
    if (activeQuestion && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeQuestion]);

  const goToNextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        nextPage();
        setActiveQuestion(null);
        setIsAnimating(false);
      }, 500);
    }
  };

  const goToPrevPage = () => {
    if (currentPageIndex > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        prevPage();
        setActiveQuestion(null);
        setIsAnimating(false);
      }, 500);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Survey answers:', answers);
  };

  const progress = ((currentPageIndex + 1) / pages.length) * 100;

  // Horizontal page transition
  const pageTransition = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
    transition: { duration: 0.5, ease: 'easeInOut' },
  };

  // Get background color from survey theme or default
  const bgColor = survey?.theme?.bgColor || '#191A1A';
  const textColor = survey?.theme?.fontColor || '#FFFFFF';
  const accentColor = survey?.theme?.accentColor || '#FF6B00';

  // Calculate contrasting text color based on background
  const isDarkBg = bgColor.match(/^#(?:[0-9a-f]{3}){1,2}$/i)
    ? Number.parseInt(bgColor.substring(1), 16) < 0xffffff / 1.8
    : true;

  const contrastTextColor = isDarkBg ? '#FFFFFF' : '#191A1A';
  const contrastSecondaryColor = isDarkBg ? 'text-zinc-300' : 'text-zinc-600';
  const questionBgColor = isDarkBg ? 'bg-zinc-800/30' : 'bg-zinc-50';
  const inputBorderColor = isDarkBg ? 'border-zinc-600' : 'border-zinc-300';
  const optionBorderColor = isDarkBg ? 'border-zinc-700' : 'border-zinc-300';

  return (
    <div
      className="flex flex-col size-full overflow-hidden font-dmsans"
      style={{ backgroundColor: bgColor, color: contrastTextColor }}
    >
      {/* Progress bar */}
      <div className={`w-full h-1 ${isDarkBg ? 'bg-zinc-800' : 'bg-zinc-200'}`}>
        <motion.div
          className="h-full"
          style={{ backgroundColor: accentColor }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={`page-${currentPageIndex}`}
            className="w-full max-w-3xl mx-auto flex flex-col items-center"
            {...pageTransition}
          >
            {/* Page title and description */}
            <div className="text-center mb-10">
              <motion.h1
                className="text-4xl font-medium mb-4 tracking-tight font-dmsans"
                style={{ color: contrastTextColor }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {currentPage.title}
              </motion.h1>
              {currentPage.description && (
                <motion.p
                  className={`text-lg max-w-lg mx-auto font-dmsans leading-relaxed ${contrastSecondaryColor}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {currentPage.description}
                </motion.p>
              )}
            </div>

            {/* Questions */}
            <div className="w-full space-y-8">
              {currentPage.questions.map((question: any, qIndex: number) => {
                const isActive = activeQuestion === question.id;
                const questionNumber = qIndex + 1;

                return (
                  <motion.div
                    key={`question-${question.id}`}
                    className={cn(
                      'rounded-lg transition-all duration-300',
                      isActive
                        ? `${questionBgColor} p-6 ${isDarkBg ? 'border border-zinc-700' : 'border border-zinc-200'}`
                        : 'cursor-pointer hover:opacity-80',
                    )}
                    onClick={() => !isActive && setActiveQuestion(question.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + qIndex * 0.1 }}
                  >
                    <div className="flex items-center mb-3">
                      <span
                        className="size-6 rounded-full border flex items-center justify-center text-sm mr-3 font-medium font-dmsans"
                        style={{ borderColor: accentColor, color: accentColor }}
                      >
                        {questionNumber}
                      </span>
                      <h3
                        className="text-lg font-medium flex-1 font-dmsans"
                        style={{ color: contrastTextColor }}
                      >
                        {question.label}
                      </h3>
                      {!isActive && (
                        <ChevronRight
                          size={16}
                          className={
                            isDarkBg ? 'text-zinc-500' : 'text-zinc-400'
                          }
                        />
                      )}
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="pt-4"
                        >
                          {/* Text input */}
                          {question.type === 'text' && (
                            <div className="mb-4">
                              <input
                                ref={inputRef}
                                type="text"
                                value={answers[question.id] || ''}
                                onChange={(e) =>
                                  handleAnswerChange(
                                    question.id,
                                    e.target.value,
                                  )
                                }
                                className={`w-full bg-transparent border-b-2 ${inputBorderColor} focus:border-opacity-100 py-2 px-1 outline-none text-lg transition-colors font-dmsans`}
                                style={{
                                  borderBottomColor: accentColor,
                                  color: contrastTextColor,
                                }}
                                placeholder="Type your answer here..."
                              />
                            </div>
                          )}

                          {/* Multiple choice */}
                          {question.type === 'multiple-choice' && (
                            <div className="space-y-3">
                              {question.options.map(
                                (option: string, i: number) => (
                                  <motion.div
                                    key={`${question.id}-option-${i}`}
                                    className={cn(
                                      `flex items-center p-3 rounded-md border cursor-pointer transition-all font-dmsans ${optionBorderColor}`,
                                      answers[question.id] === option
                                        ? isDarkBg
                                          ? `bg-opacity-20 border-opacity-100`
                                          : `bg-opacity-10 border-opacity-100`
                                        : isDarkBg
                                          ? 'hover:border-zinc-500'
                                          : 'hover:border-zinc-400',
                                    )}
                                    style={{
                                      backgroundColor:
                                        answers[question.id] === option
                                          ? accentColor
                                          : 'transparent',
                                      borderColor:
                                        answers[question.id] === option
                                          ? accentColor
                                          : undefined,
                                    }}
                                    onClick={() =>
                                      handleAnswerChange(question.id, option)
                                    }
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 + i * 0.05 }}
                                  >
                                    <div
                                      className={cn(
                                        'w-5 h-5 rounded-full border mr-3 flex items-center justify-center',
                                        answers[question.id] === option
                                          ? 'border-opacity-100'
                                          : isDarkBg
                                            ? 'border-zinc-500'
                                            : 'border-zinc-400',
                                      )}
                                      style={{
                                        borderColor:
                                          answers[question.id] === option
                                            ? accentColor
                                            : undefined,
                                      }}
                                    >
                                      {answers[question.id] === option && (
                                        <motion.div
                                          className="size-2.5 rounded-full"
                                          style={{
                                            backgroundColor: accentColor,
                                          }}
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          transition={{ type: 'spring' }}
                                        />
                                      )}
                                    </div>
                                    <span
                                      className="text-lg"
                                      style={{ color: contrastTextColor }}
                                    >
                                      {option}
                                    </span>
                                  </motion.div>
                                ),
                              )}
                            </div>
                          )}

                          {/* Scale/Rating */}
                          {question.type === 'scale' && (
                            <div className="pt-6 pb-2">
                              <div className="flex justify-between">
                                {question.options.map(
                                  (label: string, i: number) => (
                                    <motion.button
                                      key={`${question.id}-scale-${i}`}
                                      className={cn(
                                        'w-12 h-12 rounded-full flex items-center justify-center text-lg transition-all font-medium font-dmsans',
                                        answers[question.id] === label
                                          ? ''
                                          : isDarkBg
                                            ? 'bg-zinc-800 hover:bg-zinc-700'
                                            : 'bg-zinc-100 hover:bg-zinc-200',
                                      )}
                                      style={{
                                        backgroundColor:
                                          answers[question.id] === label
                                            ? accentColor
                                            : undefined,
                                        color:
                                          answers[question.id] === label
                                            ? '#FFFFFF'
                                            : contrastTextColor,
                                      }}
                                      onClick={() =>
                                        handleAnswerChange(question.id, label)
                                      }
                                      initial={{ opacity: 0, y: 20 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: 0.2 + i * 0.05 }}
                                    >
                                      {label.split(' ')[0]}
                                    </motion.button>
                                  ),
                                )}
                              </div>
                              <div
                                className={`flex justify-between mt-2 px-3 text-xs ${isDarkBg ? 'text-zinc-500' : 'text-zinc-500'} font-dmsans`}
                              >
                                <span>
                                  {question.options[0]?.split('-')[1]?.trim() ||
                                    'Low'}
                                </span>
                                <span>
                                  {question.options[question.options.length - 1]
                                    ?.split('-')[1]
                                    ?.trim() || 'High'}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="mt-8 flex justify-end">
                            <motion.button
                              type="button"
                              className="text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors font-dmsans font-medium hover:opacity-90"
                              style={{ backgroundColor: accentColor }}
                              onClick={() => {
                                const nextQuestionIndex =
                                  currentPage.questions.findIndex(
                                    (q: any) => q.id === activeQuestion,
                                  ) + 1;

                                if (
                                  nextQuestionIndex <
                                  currentPage.questions.length
                                ) {
                                  setActiveQuestion(
                                    currentPage.questions[nextQuestionIndex].id,
                                  );
                                } else {
                                  goToNextPage();
                                }
                              }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.5 }}
                            >
                              {qIndex < currentPage.questions.length - 1
                                ? 'Next'
                                : 'Continue'}
                              <ArrowRight size={16} />
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Navigation buttons */}
            <div className="mt-12 w-full flex justify-between items-center">
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPageIndex === 0}
                className={cn(
                  'px-4 py-2 flex items-center gap-1 rounded font-dmsans',
                  currentPageIndex === 0
                    ? 'opacity-0'
                    : isDarkBg
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900',
                )}
              >
                <ChevronDown size={16} className="rotate-90" />
                <span>Back</span>
              </button>

              <div
                className={`text-sm ${isDarkBg ? 'text-zinc-400' : 'text-zinc-500'} font-dmsans`}
              >
                {currentPageIndex + 1} / {pages.length}
              </div>

              {currentPageIndex === pages.length - 1 ? (
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  className="text-white px-6 py-2 rounded-md flex items-center gap-2 transition-colors font-dmsans font-medium"
                  style={{ backgroundColor: accentColor }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Submit</span>
                  <Check size={16} />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={goToNextPage}
                  className={cn(
                    'px-4 py-2 flex items-center gap-1 rounded font-dmsans',
                    isDarkBg
                      ? 'text-zinc-400 hover:text-zinc-200'
                      : 'text-zinc-600 hover:text-zinc-900',
                  )}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Next</span>
                  <ChevronDown size={16} className="-rotate-90" />
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
