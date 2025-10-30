import { useState, useEffect, useCallback } from 'react'
import { SurveyLogicEngine } from '@/lib/survey/logic-engine'
import { SurveyPage } from '@/lib/schemas/survey-schemas'

export function useSurveyLogic(pages: SurveyPage[], initialResponses: Record<string, any> = {}) {
  const [logicEngine] = useState(() => new SurveyLogicEngine(pages, initialResponses))
  const [currentPage, setCurrentPage] = useState<SurveyPage | null>(logicEngine.getCurrentPage())
  const [progress, setProgress] = useState(logicEngine.getProgress())
  const [isComplete, setIsComplete] = useState(false)

  const updateResponse = useCallback((componentId: string, value: any) => {
    logicEngine.updateResponse(componentId, value)
    
    // Update UI state
    setCurrentPage(logicEngine.getCurrentPage())
    setProgress(logicEngine.getProgress())
    setIsComplete(logicEngine.isSurveyComplete())
  }, [logicEngine])

  const navigateToNextPage = useCallback(() => {
    if (logicEngine.canNavigateToNextPage()) {
      const success = logicEngine.navigateToNextPage()
      if (success) {
        setCurrentPage(logicEngine.getCurrentPage())
        setProgress(logicEngine.getProgress())
        setIsComplete(logicEngine.isSurveyComplete())
      }
      return success
    }
    return false
  }, [logicEngine])

  const navigateToPreviousPage = useCallback(() => {
    const success = logicEngine.navigateToPreviousPage()
    if (success) {
      setCurrentPage(logicEngine.getCurrentPage())
      setProgress(logicEngine.getProgress())
    }
    return success
  }, [logicEngine])

  const navigateToPage = useCallback((pageId: string) => {
    const success = logicEngine.navigateToPage(pageId)
    if (success) {
      setCurrentPage(logicEngine.getCurrentPage())
      setProgress(logicEngine.getProgress())
    }
    return success
  }, [logicEngine])

  const getVisibleComponents = useCallback((pageId: string) => {
    return logicEngine.getVisibleComponents(pageId)
  }, [logicEngine])

  const canNavigateNext = useCallback(() => {
    return logicEngine.canNavigateToNextPage()
  }, [logicEngine])

  const exportState = useCallback(() => {
    return logicEngine.exportState()
  }, [logicEngine])

  const importState = useCallback((state: any) => {
    logicEngine.importState(state)
    setCurrentPage(logicEngine.getCurrentPage())
    setProgress(logicEngine.getProgress())
    setIsComplete(logicEngine.isSurveyComplete())
  }, [logicEngine])

  // Listen for survey completion events
  useEffect(() => {
    const handleCompletion = (event: CustomEvent) => {
      setIsComplete(true)
      // Could trigger additional completion logic here
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('survey:completed', handleCompletion as EventListener)
      return () => window.removeEventListener('survey:completed', handleCompletion as EventListener)
    }
  }, [])

  return {
    currentPage,
    progress,
    isComplete,
    updateResponse,
    navigateToNextPage,
    navigateToPreviousPage,
    navigateToPage,
    getVisibleComponents,
    canNavigateNext,
    exportState,
    importState,
    logicEngine,
  }
}
