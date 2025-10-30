"use client"
import { createContext, useContext, type PropsWithChildren } from 'react'
import type { ValidationRules } from '@/lib/surbee/survey-types'

interface Ctx {
  rules: ValidationRules
  getRulesFor: (questionId: string) => ValidationRules['perComponent'][string] | undefined
}

const ValidationCtx = createContext<Ctx | null>(null)

export interface ValidationProviderProps extends PropsWithChildren {
  rules: ValidationRules
}

export function ValidationProvider({ children, rules }: ValidationProviderProps) {
  const value: Ctx = {
    rules,
    getRulesFor: (questionId) => rules.perComponent?.[questionId],
  }
  return <ValidationCtx.Provider value={value}>{children}</ValidationCtx.Provider>
}

export function useValidationConfig() {
  const ctx = useContext(ValidationCtx)
  if (!ctx) throw new Error('useValidationConfig must be used within ValidationProvider')
  return ctx
}

