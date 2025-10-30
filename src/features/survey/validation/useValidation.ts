import { useMemo, useState } from 'react'
import type { ValidationRule } from './types'
import { useValidationConfig } from './ValidationProvider'

export function useValidation(questionId?: string, rules: ValidationRule[] = []) {
  const [errors, setErrors] = useState<{ type: ValidationRule['type']; message: string }[]>([])
  const { getRulesFor } = useValidationConfig()
  const mergedRules = useMemo(() => {
    const conf = questionId ? getRulesFor(questionId) : undefined
    const extra: ValidationRule[] = []
    if (conf?.min) extra.push({ type: 'min', message: `Minimum ${conf.min}`, min: conf.min })
    if (conf?.max) extra.push({ type: 'max', message: `Maximum ${conf.max}`, max: conf.max })
    if (conf?.pattern) extra.push({ type: 'pattern', message: 'Invalid format', pattern: conf.pattern })
    return [...rules, ...extra]
  }, [questionId, rules, getRulesFor])

  const validateInput = (value: any) => {
    const errs: { type: ValidationRule['type']; message: string }[] = []
    for (const r of mergedRules) {
      if (r.type === 'required') {
        const empty = value === undefined || value === null || value === ''
        if (empty) errs.push({ type: 'required', message: r.message })
      } else if (r.type === 'min' && typeof r.min === 'number') {
        if (Number(value) < r.min) errs.push({ type: 'min', message: r.message })
      } else if (r.type === 'max' && typeof r.max === 'number') {
        if (Number(value) > r.max) errs.push({ type: 'max', message: r.message })
      } else if (r.type === 'pattern' && r.pattern) {
        const re = new RegExp(r.pattern)
        if (!re.test(String(value))) errs.push({ type: 'pattern', message: r.message })
      } else if (r.type === 'custom' && r.validator) {
        if (!r.validator(value)) errs.push({ type: 'custom', message: r.message })
      }
    }
    setErrors(errs)
    if (typeof window !== 'undefined' && errs.length) {
      const el = document.getElementById('aria-live-region')
      if (el) el.textContent = errs.map((e) => e.message).join('. ')
    }
    return errs.length === 0
  }

  const isValid = errors.length === 0
  return { validateInput, errors, isValid }
}

