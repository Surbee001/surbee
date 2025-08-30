import { SurveyPage, SurveyComponent } from '@/lib/schemas/survey-schemas'

export interface LogicCondition {
  id: string
  field: string // component ID
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in'
  value: any
  action: 'show' | 'hide' | 'skip_to' | 'end_survey'
  target?: string // page ID or component ID
}

export interface SkipLogic {
  id: string
  condition: string // JS expression
  targetPageId: string
}

export class SurveyLogicEngine {
  private responses: Record<string, any> = {}
  private pages: SurveyPage[] = []
  private currentPageIndex: number = 0

  constructor(pages: SurveyPage[], initialResponses: Record<string, any> = {}) {
    this.pages = pages
    this.responses = initialResponses
  }

  updateResponse(componentId: string, value: any) {
    this.responses[componentId] = value
    this.evaluateLogic()
  }

  getCurrentPage(): SurveyPage | null {
    return this.pages[this.currentPageIndex] || null
  }

  getVisibleComponents(pageId: string): SurveyComponent[] {
    const page = this.pages.find(p => p.id === pageId)
    if (!page) return []

    return page.components.filter(component => {
      // Check if component should be visible based on logic conditions
      const conditions = page.logic?.conditions || []
      const relevantConditions = conditions.filter(c => c.target === component.id)

      // If no conditions apply to this component, it's visible by default
      if (relevantConditions.length === 0) return true

      // Evaluate all conditions for this component
      return relevantConditions.every(condition => {
        const fieldValue = this.responses[condition.field]
        const conditionMet = this.evaluateCondition(condition, fieldValue)
        
        // If condition is met and action is 'show', component is visible
        // If condition is met and action is 'hide', component is hidden
        if (condition.action === 'show') return conditionMet
        if (condition.action === 'hide') return !conditionMet
        
        return true // Default to visible for other actions
      })
    })
  }

  canNavigateToNextPage(): boolean {
    const currentPage = this.getCurrentPage()
    if (!currentPage) return false

    const visibleComponents = this.getVisibleComponents(currentPage.id)
    const requiredComponents = visibleComponents.filter(c => c.required)

    // Check if all required components have responses
    return requiredComponents.every(component => {
      const value = this.responses[component.id]
      return value !== undefined && value !== null && value !== ''
    })
  }

  getNextPageId(): string | null {
    const currentPage = this.getCurrentPage()
    if (!currentPage) return null

    // Check skip logic
    const skipLogic = currentPage.logic?.skipLogic || []
    for (const skip of skipLogic) {
      if (this.evaluateSkipCondition(skip.condition)) {
        return skip.targetPageId
      }
    }

    // Check action-based conditions
    const conditions = currentPage.logic?.conditions || []
    for (const condition of conditions) {
      const fieldValue = this.responses[condition.field]
      if (this.evaluateCondition(condition, fieldValue)) {
        if (condition.action === 'skip_to' && condition.target) {
          return condition.target
        }
        if (condition.action === 'end_survey') {
          return null // End survey
        }
      }
    }

    // Default: next page in sequence
    const nextIndex = this.currentPageIndex + 1
    return nextIndex < this.pages.length ? this.pages[nextIndex].id : null
  }

  navigateToPage(pageId: string): boolean {
    const pageIndex = this.pages.findIndex(p => p.id === pageId)
    if (pageIndex === -1) return false

    this.currentPageIndex = pageIndex
    return true
  }

  navigateToNextPage(): boolean {
    const nextPageId = this.getNextPageId()
    if (!nextPageId) return false // End of survey

    return this.navigateToPage(nextPageId)
  }

  navigateToPreviousPage(): boolean {
    if (this.currentPageIndex <= 0) return false
    this.currentPageIndex--
    return true
  }

  getProgress(): number {
    if (this.pages.length === 0) return 0
    return Math.round((this.currentPageIndex / this.pages.length) * 100)
  }

  isSurveyComplete(): boolean {
    // Survey is complete if we've reached the end or triggered an end condition
    const nextPageId = this.getNextPageId()
    return nextPageId === null && this.currentPageIndex === this.pages.length - 1
  }

  private evaluateCondition(condition: LogicCondition, fieldValue: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return fieldValue === condition.value
      case 'not_equals':
        return fieldValue !== condition.value
      case 'contains':
        return String(fieldValue || '').toLowerCase().includes(String(condition.value).toLowerCase())
      case 'greater_than':
        return Number(fieldValue) > Number(condition.value)
      case 'less_than':
        return Number(fieldValue) < Number(condition.value)
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(fieldValue)
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
      default:
        return false
    }
  }

  private evaluateSkipCondition(condition: string): boolean {
    try {
      // Create a safe evaluation context with only responses
      const context = { responses: this.responses }
      const fn = new Function('context', `
        const { responses } = context;
        return ${condition};
      `)
      return Boolean(fn(context))
    } catch (error) {
      console.warn('Skip condition evaluation failed:', error)
      return false
    }
  }

  private evaluateLogic() {
    // Re-evaluate all logic when responses change
    // This could trigger UI updates, page navigation, etc.
    const currentPage = this.getCurrentPage()
    if (!currentPage) return

    // Check for immediate actions
    const conditions = currentPage.logic?.conditions || []
    for (const condition of conditions) {
      const fieldValue = this.responses[condition.field]
      if (this.evaluateCondition(condition, fieldValue)) {
        if (condition.action === 'end_survey') {
          // Trigger survey completion
          this.triggerSurveyCompletion()
          break
        }
      }
    }
  }

  private triggerSurveyCompletion() {
    // Emit survey completion event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('survey:completed', {
        detail: {
          responses: this.responses,
          completedAt: new Date(),
        }
      }))
    }
  }

  // Export current state for persistence
  exportState() {
    return {
      responses: this.responses,
      currentPageIndex: this.currentPageIndex,
      timestamp: new Date(),
    }
  }

  // Import state for restoration
  importState(state: { responses: Record<string, any>; currentPageIndex: number }) {
    this.responses = state.responses || {}
    this.currentPageIndex = state.currentPageIndex || 0
  }
}
