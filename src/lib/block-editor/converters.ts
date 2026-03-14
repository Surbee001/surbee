/**
 * Converters between block editor survey and other formats.
 */

import type { BlockEditorSurvey, Block } from './types'
import { isQuestionBlock } from './types'

interface QuestionData {
  id: string
  text: string
  type: string
  required: boolean
  options?: string[]
  pageId: string
  position: number
}

/**
 * Convert a BlockEditorSurvey to the questions format expected by
 * the save_survey_questions tool and /api/projects/[id]/questions endpoint.
 */
export function blockSurveyToQuestions(survey: BlockEditorSurvey): QuestionData[] {
  const questions: QuestionData[] = []

  for (const page of survey.pages) {
    for (const block of page.blocks) {
      if (!isQuestionBlock(block.type)) continue

      const content = block.content as unknown as Record<string, unknown>
      const questionId = block.meta.questionId || block.id

      const question: QuestionData = {
        id: questionId,
        text: (content.label as string) || '',
        type: mapBlockTypeToQuestionType(block.type),
        required: (content.required as boolean) || false,
        pageId: page.id,
        position: block.meta.position,
      }

      // Extract options for choice-based questions
      const options = content.options as Array<{ label: string }> | undefined
      if (options) {
        question.options = options.map(o => o.label)
      }

      // Extract items for ranking
      const items = content.items as Array<{ label: string }> | undefined
      if (items) {
        question.options = items.map(i => i.label)
      }

      questions.push(question)
    }
  }

  return questions
}

function mapBlockTypeToQuestionType(type: string): string {
  const map: Record<string, string> = {
    'text-input': 'text',
    'textarea': 'long_text',
    'radio': 'single_select',
    'checkbox': 'multi_select',
    'select': 'single_select',
    'scale': 'rating',
    'nps': 'nps',
    'slider': 'rating',
    'yes-no': 'single_select',
    'date-picker': 'date',
    'matrix': 'matrix',
    'ranking': 'ranking',
    'file-upload': 'file',
    'likert': 'matrix',
    'image-choice': 'single_select',
  }
  return map[type] || type
}
