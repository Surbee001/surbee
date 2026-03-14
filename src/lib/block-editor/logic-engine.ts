/**
 * Logic engine for evaluating conditional branching and block visibility.
 */

import type { PageLogic, BranchRule, BranchOperator, ConditionalRule, Block } from './types'

type ResponseMap = Record<string, unknown>

function evaluateOperator(
  operator: BranchOperator,
  actual: unknown,
  expected: unknown,
): boolean {
  switch (operator) {
    case 'equals':
      return actual === expected
    case 'not_equals':
      return actual !== expected
    case 'contains':
      return typeof actual === 'string' && typeof expected === 'string' && actual.includes(expected)
    case 'not_contains':
      return typeof actual === 'string' && typeof expected === 'string' && !actual.includes(expected)
    case 'greater_than':
      return Number(actual) > Number(expected)
    case 'less_than':
      return Number(actual) < Number(expected)
    case 'in':
      return Array.isArray(expected) && expected.includes(actual)
    case 'not_in':
      return Array.isArray(expected) && !expected.includes(actual)
    case 'is_answered':
      return actual !== undefined && actual !== null && actual !== ''
    case 'is_not_answered':
      return actual === undefined || actual === null || actual === ''
    default:
      return false
  }
}

/**
 * Evaluate page-level branching logic.
 * Returns the target page ID to navigate to, or null for default sequential navigation.
 */
export function evaluatePageLogic(
  logic: PageLogic | undefined,
  responses: ResponseMap,
): string | null {
  if (!logic) return null

  // Evaluate branches in order — first match wins
  for (const branch of logic.branches) {
    const answer = responses[branch.sourceBlockId]
    if (evaluateOperator(branch.operator, answer, branch.value)) {
      switch (branch.action) {
        case 'go_to_page':
          return branch.targetId
        case 'skip_page':
          return branch.targetId // skip to this page
        case 'end_survey':
          return '__end__' // special sentinel
        default:
          continue
      }
    }
  }

  return logic.defaultNextPageId ?? null
}

/**
 * Evaluate whether a block should be visible based on conditional rules.
 */
export function evaluateBlockVisibility(
  block: Block,
  responses: ResponseMap,
): boolean {
  const rules = block.meta.conditionalVisibility
  if (!rules || rules.length === 0) return true

  // All rules must pass (AND logic)
  return rules.every(rule =>
    evaluateOperator(rule.operator, responses[rule.sourceBlockId], rule.value)
  )
}
