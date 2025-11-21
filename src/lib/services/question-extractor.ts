/**
 * Question Extraction Service
 *
 * Extracts question metadata from AI-generated survey code and stores them in the database.
 * This enables the Insights tab to display real questions and track responses properly.
 */

import { supabaseAdmin } from '@/lib/supabase-server'
import * as cheerio from 'cheerio'

export interface ExtractedQuestion {
  id: string
  question_text: string
  question_type: string
  required: boolean
  order_index: number
  options?: string[]
  scale_min?: number
  scale_max?: number
  rows?: string[]
  columns?: string[]
}

/**
 * Extract questions from HTML/React code using data attributes
 */
export function extractQuestionsFromHTML(html: string): ExtractedQuestion[] {
  const $ = cheerio.load(html)
  const questions: ExtractedQuestion[] = []

  // Find all elements with data-question-id
  $('[data-question-id]').each((index, element) => {
    const $el = $(element)

    const questionId = $el.attr('data-question-id')
    const questionText = $el.attr('data-question-text')
    const questionType = $el.attr('data-question-type')
    const required = $el.attr('data-required') === 'true'

    if (!questionId || !questionText || !questionType) {
      return // Skip invalid questions
    }

    const question: ExtractedQuestion = {
      id: questionId,
      question_text: questionText,
      question_type: questionType,
      required,
      order_index: index,
    }

    // Extract type-specific metadata
    if (questionType === 'rating_scale' || questionType === 'nps') {
      const scaleMin = $el.attr('data-scale-min')
      const scaleMax = $el.attr('data-scale-max')
      if (scaleMin) question.scale_min = parseInt(scaleMin, 10)
      if (scaleMax) question.scale_max = parseInt(scaleMax, 10)
    }

    if (questionType === 'multiple_choice' || questionType === 'checkbox') {
      const optionsAttr = $el.attr('data-options')
      if (optionsAttr) {
        try {
          question.options = JSON.parse(optionsAttr)
        } catch (e) {
          // Fallback: extract from <option> tags
          const options: string[] = []
          $el.find('option').each((_, opt) => {
            const value = $(opt).attr('value')
            const text = $(opt).text()
            if (value && value !== '') {
              options.push(text || value)
            }
          })
          if (options.length > 0) {
            question.options = options
          }
        }
      }
    }

    if (questionType === 'matrix') {
      const rowsAttr = $el.attr('data-rows')
      const columnsAttr = $el.attr('data-columns')
      if (rowsAttr) {
        try {
          question.rows = JSON.parse(rowsAttr)
        } catch (e) {
          console.error('Failed to parse matrix rows:', e)
        }
      }
      if (columnsAttr) {
        try {
          question.columns = JSON.parse(columnsAttr)
        } catch (e) {
          console.error('Failed to parse matrix columns:', e)
        }
      }
    }

    questions.push(question)
  })

  return questions
}

/**
 * Extract questions from React/TSX code using regex patterns
 * (Fallback if HTML parsing doesn't work)
 */
export function extractQuestionsFromCode(code: string): ExtractedQuestion[] {
  const questions: ExtractedQuestion[] = []

  // Pattern: data-question-id="q1" data-question-text="..." data-question-type="..."
  const questionPattern =
    /data-question-id=["']([^"']+)["']\s+data-question-text=["']([^"']+)["']\s+data-question-type=["']([^"']+)["']/g

  let match
  let orderIndex = 0

  while ((match = questionPattern.exec(code)) !== null) {
    const questionId = match[1]
    const questionText = match[2]
    const questionType = match[3]

    const question: ExtractedQuestion = {
      id: questionId,
      question_text: questionText,
      question_type: questionType,
      required: code.includes(`data-required="true"`), // Simplified check
      order_index: orderIndex++,
    }

    questions.push(question)
  }

  return questions
}

/**
 * Store extracted questions in the database
 */
export async function storeQuestions(projectId: string, questions: ExtractedQuestion[]) {
  try {
    // Delete existing questions for this project
    await supabaseAdmin.from('survey_questions').delete().eq('project_id', projectId)

    // Insert new questions
    const questionRecords = questions.map((q) => ({
      project_id: projectId,
      question_id: q.id,
      question_text: q.question_text,
      question_type: q.question_type,
      required: q.required,
      order_index: q.order_index,
      options: q.options,
      scale_min: q.scale_min,
      scale_max: q.scale_max,
      matrix_rows: q.rows,
      matrix_columns: q.columns,
    }))

    const { data, error } = await supabaseAdmin.from('survey_questions').insert(questionRecords).select()

    if (error) {
      console.error('Error storing questions:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Exception storing questions:', error)
    return { success: false, error }
  }
}

/**
 * Extract and store questions from generated survey code
 */
export async function extractAndStoreQuestions(projectId: string, surveyCode: string) {
  // Try HTML parsing first
  let questions = extractQuestionsFromHTML(surveyCode)

  // Fallback to regex if HTML parsing yields no results
  if (questions.length === 0) {
    questions = extractQuestionsFromCode(surveyCode)
  }

  if (questions.length === 0) {
    console.warn(`No questions found in survey code for project ${projectId}`)
    return { success: true, questions: [] }
  }

  console.log(`Extracted ${questions.length} questions from project ${projectId}`)

  return await storeQuestions(projectId, questions)
}
