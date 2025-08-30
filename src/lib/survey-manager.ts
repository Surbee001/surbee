import { AIGenerationOutput } from '@/lib/schemas/survey-schemas'

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
  saveDraft(surveyData: AIGenerationOutput, creatorId: string = 'anonymous'): StoredSurvey {
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
      responseCount: 0,
      settings: {
        allowAnonymous: true,
        requirePassword: false
      },
      data: surveyData
    }

    this.surveys.set(surveyId, survey)
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
    console.log(`📝 Survey updated: ${surveyId}`)
    
    return { success: true }
  }

  // Delete survey
  deleteSurvey(surveyId: string): { success: boolean; error?: string } {
    if (!this.surveys.has(surveyId)) {
      return { success: false, error: 'Survey not found' }
    }

    this.surveys.delete(surveyId)
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
    }, creatorId)

    return { success: true, newSurveyId: newSurvey.id }
  }
}

export const surveyManager = new SurveyManager()