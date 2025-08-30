import { useCallback, useMemo } from 'react'
import { useSurveyStore } from './useSurveyStore'
import { useValidation } from '../validation/useValidation'
import { useBehavior } from '../behavior/useBehavior'
import { computeSuspicionScore } from '../behavior/scoring'
import { useAnalytics } from '../analytics/useAnalytics'
import { useProgress } from '../progress/useProgress'

export function useSurveyState() {
  const { currentQuestionIndex, components, responses, submitAnswer: storeSubmit } = useSurveyStore((s) => ({
    currentQuestionIndex: s.currentQuestionIndex,
    components: s.components,
    responses: s.responses,
    submitAnswer: s.submitAnswer,
  }))
  const currentQuestion = components[currentQuestionIndex]
  const { trackInteraction, trackTiming, trackCompletion } = useAnalytics()
  const { nextQuestion } = useProgress()
  const { validateInput, errors, isValid } = useValidation(
    currentQuestion?.id,
    currentQuestion?.validation ? [
      ...(currentQuestion.required ? [{ type: 'required', message: 'This field is required' as const }] : []),
    ] : [ ...(currentQuestion?.required ? [{ type: 'required', message: 'This field is required' as const }] : []) ],
  )

  const submitAnswer = useCallback(
    (questionId: string, answer: any) => {
      const ok = validateInput(answer)
      storeSubmit(questionId, answer, {
        onTracked: () => {
          trackInteraction('answer_submitted', { questionId, type: currentQuestion?.type })
        },
      })
      if (ok) {
        nextQuestion()
      }
      return ok
    },
    [storeSubmit, validateInput, trackInteraction, nextQuestion, currentQuestion?.type],
  )

  // Alias for compatibility
  const updateResponse = submitAnswer

  return useMemo(
    () => ({ submitAnswer, updateResponse, currentQuestion, responses, errors, isValid, trackTiming, trackCompletion }),
    [submitAnswer, currentQuestion, responses, errors, isValid, trackTiming, trackCompletion],
  )
}

