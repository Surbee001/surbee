import { create } from 'zustand'
import type { QuestionDescriptor, ValidationError, BehavioralMetrics } from '../types'

export interface SurveyState {
  surveyId: string
  components: QuestionDescriptor[]
  responses: Record<string, any>
  currentQuestionIndex: number
  startTime: number
  questionTimings: number[]
  isComplete: boolean
  validationErrors: ValidationError[]
  behavioralData: BehavioralMetrics
  // actions
  initialize: (surveyId: string, components: QuestionDescriptor[]) => void
  setQuestions: (components: QuestionDescriptor[]) => void
  setCurrentIndex: (idx: number) => void
  submitAnswer: (
    questionId: string,
    answer: any,
    options?: {
      timestampMs?: number
      onValidated?: (isValid: boolean, errors: ValidationError[]) => void
      onTracked?: () => void
    },
  ) => void
  goNext: () => void
  goPrev: () => void
  complete: () => void
  reset: () => void
}

export const useSurveyStore = create<SurveyState>((set, get) => ({
  surveyId: '',
  components: [],
  responses: {},
  currentQuestionIndex: 0,
  startTime: Date.now(),
  questionTimings: [],
  isComplete: false,
  validationErrors: [],
  behavioralData: {},
  initialize: (surveyId, components) => {
    set({
      surveyId,
      components,
      responses: {},
      currentQuestionIndex: 0,
      startTime: Date.now(),
      questionTimings: new Array(components.length).fill(0),
      isComplete: false,
      validationErrors: [],
    })
  },
  setQuestions: (components) => set({ components, questionTimings: new Array(components.length).fill(0) }),
  setCurrentIndex: (idx) => set({ currentQuestionIndex: Math.max(0, Math.min(idx, get().components.length - 1)) }),
  submitAnswer: (questionId, answer, options) => {
    const now = options?.timestampMs ?? Date.now()
    const state = get()
    const idx = state.components.findIndex((q) => q.id === questionId)
    // accumulate timing for the current index
    if (idx >= 0) {
      const timings = [...state.questionTimings]
      const last = timings[idx] || 0
      const delta = Math.max(0, now - state.startTime)
      timings[idx] = last + delta
      set({ questionTimings: timings, startTime: now })
    }
    set((s) => ({ responses: { ...s.responses, [questionId]: answer } }))
    options?.onTracked?.()
  },
  goNext: () => set((s) => ({ currentQuestionIndex: Math.min(s.currentQuestionIndex + 1, s.components.length - 1) })),
  goPrev: () => set((s) => ({ currentQuestionIndex: Math.max(s.currentQuestionIndex - 1, 0) })),
  complete: () => set({ isComplete: true }),
  reset: () => set((s) => ({
    responses: {},
    currentQuestionIndex: 0,
    startTime: Date.now(),
    questionTimings: new Array(s.components.length).fill(0),
    isComplete: false,
    validationErrors: [],
  })),
}))

