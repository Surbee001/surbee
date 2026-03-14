'use client'

import { useEffect, useRef } from 'react'
import { useBlockEditorStore } from '@/stores/blockEditorStore'
import { blockSurveyToQuestions } from '@/lib/block-editor/converters'
import { capturePageScreenshot } from '@/lib/block-editor/thumbnail'

export function useBlockEditorPersistence(
  projectId: string | null,
  userId: string | null,
) {
  const saveVersion = useBlockEditorStore(s => s.saveVersion)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const screenshotTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isSavingRef = useRef(false)
  const lastScreenshotRef = useRef(0)

  // Debounced save (1.5s)
  useEffect(() => {
    if (saveVersion === 0 || !projectId || !userId) return

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

    saveTimerRef.current = setTimeout(async () => {
      if (isSavingRef.current) return
      isSavingRef.current = true

      const { survey, isDirty } = useBlockEditorStore.getState()
      if (!survey || !isDirty) { isSavingRef.current = false; return }

      try {
        const res = await fetch(`/api/projects/${projectId}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, blockSurvey: survey }),
        })

        if (res.ok) {
          // Save questions
          const questions = blockSurveyToQuestions(survey)
          if (questions.length > 0) {
            fetch(`/api/projects/${projectId}/questions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, questions }),
            }).catch(() => {})
          }

          const currentVersion = useBlockEditorStore.getState().saveVersion
          if (currentVersion === saveVersion) {
            useBlockEditorStore.setState({ isDirty: false })
          }
        }
      } catch (error) {
        console.error('[BlockEditor] Save failed:', error)
      } finally {
        isSavingRef.current = false
      }
    }, 1500)

    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [saveVersion, projectId, userId])

  // Screenshot capture (throttled to max once per 10 seconds)
  useEffect(() => {
    if (saveVersion === 0 || !projectId || !userId) return

    if (screenshotTimerRef.current) clearTimeout(screenshotTimerRef.current)

    const timeSinceLastScreenshot = Date.now() - lastScreenshotRef.current
    const delay = Math.max(10000 - timeSinceLastScreenshot, 3000)

    screenshotTimerRef.current = setTimeout(async () => {
      try {
        const dataUrl = await capturePageScreenshot()
        if (!dataUrl) return

        lastScreenshotRef.current = Date.now()

        // Save screenshot as preview image
        await fetch(`/api/projects/${projectId}/preview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, previewImage: dataUrl }),
        })
      } catch {}
    }, delay)

    return () => { if (screenshotTimerRef.current) clearTimeout(screenshotTimerRef.current) }
  }, [saveVersion, projectId, userId])

  // Save on page unload
  useEffect(() => {
    const handler = () => {
      const { survey, isDirty } = useBlockEditorStore.getState()
      if (!isDirty || !survey || !projectId || !userId) return
      const data = JSON.stringify({ userId, blockSurvey: survey })
      navigator.sendBeacon?.(`/api/projects/${projectId}/preview`, new Blob([data], { type: 'application/json' }))
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [projectId, userId])
}
