"use client"
import { useEffect, type PropsWithChildren } from 'react'
import type { SurveyConfig } from '../types'
import { useSurveyStore } from './useSurveyStore'

export interface SurveyStateProviderProps extends PropsWithChildren {
  config: SurveyConfig
}

export function SurveyStateProvider({ children, config }: SurveyStateProviderProps) {
  const initialize = useSurveyStore((s) => s.initialize)
  useEffect(() => {
    initialize(config.surveyId, config.components)
  }, [config.surveyId, config.components, initialize])
  return children as any
}

