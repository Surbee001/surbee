/**
 * Default block and page factories.
 */

import { nanoid } from 'nanoid'
import type {
  Block,
  BlockContentMap,
  BlockType,
  EditorPage,
  BlockEditorSurvey,
  SurveySettings,
  SurveyTheme,
  Option,
} from './types'

// ---------------------------------------------------------------------------
// Option helper
// ---------------------------------------------------------------------------

export function createOption(label: string, index?: number): Option {
  const id = nanoid(8)
  return { id, label, value: label.toLowerCase().replace(/\s+/g, '_') }
}

function defaultOptions(count: number, prefix = 'Option'): Option[] {
  return Array.from({ length: count }, (_, i) =>
    createOption(`${prefix} ${i + 1}`, i)
  )
}

// ---------------------------------------------------------------------------
// Default content per block type
// ---------------------------------------------------------------------------

const defaultContent: { [K in BlockType]: () => BlockContentMap[K] } = {
  heading: () => ({ text: '', level: 2 }),
  paragraph: () => ({ text: '' }),
  divider: () => ({ style: 'solid' }),
  spacer: () => ({ height: 32 }),
  image: () => ({ src: '', alt: '' }),
  video: () => ({ src: '' }),
  button: () => ({ label: 'Submit', action: 'submit', variant: 'primary', align: 'left' }),
  'custom-code': () => ({ html: '<div style="padding: 20px; text-align: center; color: #666;">Custom HTML here</div>', css: '' }),
  columns: () => ({ layout: '1:1' as const, cells: [{ id: nanoid(8), blockType: null, content: null }, { id: nanoid(8), blockType: null, content: null }] }),
  'text-input': () => ({ label: 'Your question here', placeholder: 'Type your answer...', required: false }),
  textarea: () => ({ label: 'Your question here', placeholder: 'Share your thoughts...', required: false, rows: 4 }),
  radio: () => ({ label: 'Your question here', required: false, options: defaultOptions(3) }),
  checkbox: () => ({ label: 'Select all that apply', required: false, options: defaultOptions(3) }),
  select: () => ({ label: 'Choose one', required: false, options: defaultOptions(3), placeholder: 'Select an option...' }),
  scale: () => ({ label: 'How would you rate this?', required: false, min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent' }),
  nps: () => ({ label: 'How likely are you to recommend us?', required: false }),
  slider: () => ({ label: 'Drag to select a value', required: false, min: 0, max: 100, step: 1, showValue: true }),
  'yes-no': () => ({ label: 'Your question here', required: false, yesLabel: 'Yes', noLabel: 'No' }),
  'date-picker': () => ({ label: 'Select a date', required: false }),
  matrix: () => ({
    label: 'Rate the following',
    required: false,
    rows: [
      { id: nanoid(8), label: 'Row 1' },
      { id: nanoid(8), label: 'Row 2' },
    ],
    columns: [
      { id: nanoid(8), label: 'Column 1' },
      { id: nanoid(8), label: 'Column 2' },
      { id: nanoid(8), label: 'Column 3' },
    ],
  }),
  ranking: () => ({ label: 'Rank these in order of preference', required: false, items: defaultOptions(3, 'Item') }),
  'file-upload': () => ({ label: 'Upload your file', required: false, maxFileSizeMB: 10 }),
  likert: () => ({
    label: 'How much do you agree?',
    required: false,
    statements: [
      { id: nanoid(8), text: 'Statement 1' },
      { id: nanoid(8), text: 'Statement 2' },
    ],
    scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
  }),
  'image-choice': () => ({
    label: 'Pick your favorite',
    required: false,
    options: [
      { id: nanoid(8), label: 'Option 1', imageUrl: '' },
      { id: nanoid(8), label: 'Option 2', imageUrl: '' },
    ],
    columns: 2,
  }),
}

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------

let questionCounter = 0

export function resetQuestionCounter() {
  questionCounter = 0
}

export function createDefaultBlock<T extends BlockType>(
  type: T,
  position: number = 0,
  contentOverride?: Partial<BlockContentMap[T]>,
): Block<T> {
  const content = { ...defaultContent[type](), ...contentOverride } as BlockContentMap[T]
  const isQuestion = ![
    'heading', 'paragraph', 'divider', 'spacer', 'image', 'video', 'columns',
  ].includes(type)

  questionCounter++
  return {
    id: nanoid(10),
    type,
    content,
    meta: {
      position,
      ...(isQuestion ? { questionId: `q${questionCounter}` } : {}),
    },
  }
}

export function createDefaultPage(position: number = 0, title?: string): EditorPage {
  return {
    id: nanoid(10),
    title: title || `Page ${position + 1}`,
    position,
    blocks: [],
  }
}

export const DEFAULT_SETTINGS: SurveySettings = {
  allowBack: true,
  showProgress: true,
  randomizeQuestions: false,
  requireAuth: false,
  collectBehavioralData: true,
}

export const DEFAULT_THEME: SurveyTheme = {
  primaryColor: '#2563eb',
  secondaryColor: '#7c3aed',
  backgroundColor: '#ffffff',
  textColor: '#0a0a0a',
  fontFamily: 'FK Grotesk, sans-serif',
  borderRadius: '0.5rem',
  accentColor: '#2563eb',
}

export function createDefaultSurvey(id: string, title: string = 'Untitled Survey'): BlockEditorSurvey {
  resetQuestionCounter()
  const now = new Date().toISOString()
  return {
    id,
    title,
    pages: [createDefaultPage(0)],
    settings: { ...DEFAULT_SETTINGS },
    theme: { ...DEFAULT_THEME },
    metadata: {
      createdAt: now,
      updatedAt: now,
      version: 1,
    },
  }
}
