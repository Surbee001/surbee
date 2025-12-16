import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'

const STORAGE_KEY = 'surbee_surveys_store'

export interface SurveyMetadata {
  id: string
  title: string
  description?: string
  status: 'draft' | 'preview' | 'published'
  previewUrl?: string
  publishedUrl?: string
  createdAt: Date
  updatedAt: Date
  creatorId: string
  responseCount: number
  projectId?: string
  settings: {
    allowAnonymous: boolean
    requirePassword: boolean
    password?: string
    expiresAt?: Date
    limitResponses?: number
  }
}

export interface StoredSurvey extends SurveyMetadata {
  data: AIGenerationOutput
}

export class SurveyManager {
  private surveys: Map<string, StoredSurvey> = new Map()
  private initialized: boolean = false
  
  constructor() {
    this.loadFromStorage()
  }

  // Load surveys from localStorage
  private loadFromStorage(): void {
    if (typeof window === 'undefined') return
    if (this.initialized) return
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert dates back from strings
        Object.entries(parsed).forEach(([id, survey]: [string, any]) => {
          survey.createdAt = new Date(survey.createdAt)
          survey.updatedAt = new Date(survey.updatedAt)
          if (survey.settings?.expiresAt) {
            survey.settings.expiresAt = new Date(survey.settings.expiresAt)
          }
          this.surveys.set(id, survey as StoredSurvey)
        })
        console.log(`📂 Loaded ${this.surveys.size} surveys from storage`)
      }
    } catch (error) {
      console.error('Failed to load surveys from storage:', error)
    }
    this.initialized = true
  }

  // Save surveys to localStorage
  private saveToStorage(): void {
    if (typeof window === 'undefined') return
    
    try {
      const obj: Record<string, StoredSurvey> = {}
      this.surveys.forEach((survey, id) => {
        obj[id] = survey
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj))
      
      // Also save the latest survey for quick access by view/form pages
      const latest = Array.from(this.surveys.values())
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
      if (latest) {
        localStorage.setItem('surbee_latest_survey', JSON.stringify(latest.data))
        // Also save by project ID if available
        if (latest.projectId) {
          localStorage.setItem(`surbee_survey_${latest.projectId}`, JSON.stringify(latest.data))
        }
      }
    } catch (error) {
      console.error('Failed to save surveys to storage:', error)
    }
  }
  
  // Generate unique IDs
  private generateId(): string {
    return `survey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generatePreviewUrl(surveyId: string): string {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000'
    return `${baseUrl}/survey/preview/${surveyId}`
  }

  private generatePublishedUrl(surveyId: string): string {
    const baseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'http://localhost:3000'
    return `${baseUrl}/survey/${surveyId}`
  }

  // Save survey as draft
  saveDraft(surveyData: AIGenerationOutput, creatorId: string = 'anonymous', projectId?: string): StoredSurvey {
    const surveyId = this.generateId()
    const now = new Date()
    
    const survey: StoredSurvey = {
      id: surveyId,
      title: surveyData.survey?.title || 'Untitled Survey',
      description: surveyData.survey?.description,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      creatorId,
      projectId,
      responseCount: 0,
      settings: {
        allowAnonymous: true,
        requirePassword: false
      },
      data: surveyData
    }

    this.surveys.set(surveyId, survey)
    this.saveToStorage()
    console.log(`💾 Survey saved as draft: ${surveyId}`)
    return survey
  }

  // Generate preview URL
  generatePreview(surveyId: string): { success: boolean; previewUrl?: string; error?: string } {
    const survey = this.surveys.get(surveyId)
    if (!survey) {
      return { success: false, error: 'Survey not found' }
    }

    const previewUrl = this.generatePreviewUrl(surveyId)
    survey.status = 'preview'
    survey.previewUrl = previewUrl
    survey.updatedAt = new Date()

    this.surveys.set(surveyId, survey)
    this.saveToStorage()
    console.log(`👁️ Preview URL generated: ${previewUrl}`)
    
    return { success: true, previewUrl }
  }

  // Publish survey
  publishSurvey(
    surveyId: string, 
    settings?: Partial<SurveyMetadata['settings']>
  ): { success: boolean; publishedUrl?: string; error?: string } {
    const survey = this.surveys.get(surveyId)
    if (!survey) {
      return { success: false, error: 'Survey not found' }
    }

    const publishedUrl = this.generatePublishedUrl(surveyId)
    survey.status = 'published'
    survey.publishedUrl = publishedUrl
    survey.updatedAt = new Date()
    
    if (settings) {
      survey.settings = { ...survey.settings, ...settings }
    }

    this.surveys.set(surveyId, survey)
    this.saveToStorage()
    console.log(`🚀 Survey published: ${publishedUrl}`)
    
    return { success: true, publishedUrl }
  }

  // Get survey by ID
  getSurvey(surveyId: string): StoredSurvey | null {
    return this.surveys.get(surveyId) || null
  }

  // Get all surveys for a creator
  getSurveysForCreator(creatorId: string): StoredSurvey[] {
    return Array.from(this.surveys.values()).filter(s => s.creatorId === creatorId)
  }

  // Update survey data
  updateSurvey(surveyId: string, surveyData: AIGenerationOutput): { success: boolean; error?: string } {
    const survey = this.surveys.get(surveyId)
    if (!survey) {
      return { success: false, error: 'Survey not found' }
    }

    survey.data = surveyData
    survey.title = surveyData.survey?.title || survey.title
    survey.description = surveyData.survey?.description || survey.description
    survey.updatedAt = new Date()

    this.surveys.set(surveyId, survey)
    this.saveToStorage()
    console.log(`📝 Survey updated: ${surveyId}`)
    
    return { success: true }
  }

  // Delete survey
  deleteSurvey(surveyId: string): { success: boolean; error?: string } {
    if (!this.surveys.has(surveyId)) {
      return { success: false, error: 'Survey not found' }
    }

    this.surveys.delete(surveyId)
    this.saveToStorage()
    console.log(`🗑️ Survey deleted: ${surveyId}`)
    
    return { success: true }
  }

  // Get survey analytics
  getSurveyAnalytics(surveyId: string) {
    const survey = this.surveys.get(surveyId)
    if (!survey) return null

    return {
      id: surveyId,
      title: survey.title,
      status: survey.status,
      responseCount: survey.responseCount,
      createdAt: survey.createdAt,
      updatedAt: survey.updatedAt,
      previewUrl: survey.previewUrl,
      publishedUrl: survey.publishedUrl,
      settings: survey.settings
    }
  }

  // Simulate response submission (increments counter)
  recordResponse(surveyId: string): { success: boolean; error?: string } {
    const survey = this.surveys.get(surveyId)
    if (!survey) {
      return { success: false, error: 'Survey not found' }
    }

    if (survey.status !== 'published') {
      return { success: false, error: 'Survey is not published' }
    }

    survey.responseCount++
    survey.updatedAt = new Date()
    this.surveys.set(surveyId, survey)
    this.saveToStorage()
    
    console.log(`📊 Response recorded for survey: ${surveyId} (Total: ${survey.responseCount})`)
    return { success: true }
  }

  // Copy survey
  copySurvey(surveyId: string, creatorId: string = 'anonymous'): { success: boolean; newSurveyId?: string; error?: string } {
    const originalSurvey = this.surveys.get(surveyId)
    if (!originalSurvey) {
      return { success: false, error: 'Survey not found' }
    }

    const newSurvey = this.saveDraft({
      ...originalSurvey.data,
      survey: {
        ...originalSurvey.data.survey!,
        title: `${originalSurvey.title} (Copy)`,
        id: this.generateId()
      }
    }, creatorId, originalSurvey.projectId)

    return { success: true, newSurveyId: newSurvey.id }
  }

  // Set project ID for a survey
  setProjectId(surveyId: string, projectId: string): { success: boolean; error?: string } {
    const survey = this.surveys.get(surveyId)
    if (!survey) {
      return { success: false, error: 'Survey not found' }
    }

    survey.projectId = projectId
    survey.updatedAt = new Date()
    this.surveys.set(surveyId, survey)
    this.saveToStorage()
    
    return { success: true }
  }

  // Get survey by project ID
  getSurveyByProjectId(projectId: string): StoredSurvey | null {
    for (const survey of this.surveys.values()) {
      if (survey.projectId === projectId) {
        return survey
      }
    }
    return null
  }

  // Get all surveys
  getAllSurveys(): StoredSurvey[] {
    return Array.from(this.surveys.values())
  }
}

export const surveyManager = new SurveyManager()