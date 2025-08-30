"use client"
import { createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { useSurveyStore } from '../state/useSurveyStore'

interface ProgressCtxValue {
  progress: number
  nextQuestion: () => void
  previousQuestion: () => void
}

const ProgressCtx = createContext<ProgressCtxValue | null>(null)

export interface ProgressProviderProps extends PropsWithChildren {
  questionCount: number
}

export function ProgressProvider({ children, questionCount }: ProgressProviderProps) {
  const idx = useSurveyStore((s) => s.currentQuestionIndex)
  const responses = useSurveyStore((s) => s.responses)
  const goNext = useSurveyStore((s) => s.goNext)
  const goPrev = useSurveyStore((s) => s.goPrev)
  const progress = useMemo(() => {
    const answered = Object.keys(responses).length
    return questionCount === 0 ? 0 : Math.round((answered / questionCount) * 100)
  }, [responses, questionCount])
  const value = useMemo(() => ({ progress, nextQuestion: goNext, previousQuestion: goPrev }), [progress, goNext, goPrev])
  return <ProgressCtx.Provider value={value}>{children}</ProgressCtx.Provider>
}

export function useProgress() {
  const ctx = useContext(ProgressCtx)
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider')
  return ctx
}

