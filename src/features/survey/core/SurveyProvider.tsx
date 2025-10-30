"use client"
import type { PropsWithChildren } from 'react'
import type { SurveyConfig } from '../types'
import { SurveyStateProvider } from '../state/SurveyStateProvider'
import { ValidationProvider } from '../validation/ValidationProvider'
import { AnalyticsProvider } from '../analytics/AnalyticsProvider'
import { ProgressProvider } from '../progress/ProgressProvider'
import { BehaviorProvider } from '../behavior/BehaviorProvider'

export interface SurveyProviderProps extends PropsWithChildren {
  config: SurveyConfig
}

export const SurveyProvider = ({ children, config }: SurveyProviderProps) => {
  return (
    <SurveyStateProvider config={config}>
      <ValidationProvider rules={config.validation}>
        <AnalyticsProvider trackingConfig={config.analytics}>
          <BehaviorProvider>
            <ProgressProvider questionCount={config.components.length}>
              {children}
            </ProgressProvider>
          </BehaviorProvider>
        </AnalyticsProvider>
      </ValidationProvider>
    </SurveyStateProvider>
  )
}

