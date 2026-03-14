/**
 * Block Editor Type Definitions
 *
 * Core data model for the block-based survey page editor.
 * Surveys are collections of pages, each containing blocks.
 */

// ---------------------------------------------------------------------------
// Block Types
// ---------------------------------------------------------------------------

export type LayoutBlockType =
  | 'heading'
  | 'paragraph'
  | 'divider'
  | 'spacer'
  | 'image'
  | 'video'
  | 'button'
  | 'custom-code'
  | 'columns'

export type QuestionBlockType =
  | 'text-input'
  | 'textarea'
  | 'radio'
  | 'checkbox'
  | 'select'
  | 'scale'
  | 'nps'
  | 'slider'
  | 'yes-no'
  | 'date-picker'
  | 'matrix'
  | 'ranking'
  | 'file-upload'
  | 'likert'
  | 'image-choice'

export type BlockType = LayoutBlockType | QuestionBlockType

// ---------------------------------------------------------------------------
// Block Content — Discriminated union per block type
// ---------------------------------------------------------------------------

export interface HeadingContent {
  text: string
  level: 1 | 2 | 3
}

export interface ParagraphContent {
  text: string
}

export interface DividerContent {
  style: 'solid' | 'dashed' | 'dotted'
}

export interface SpacerContent {
  height: number // in px
}

export interface ImageContent {
  src: string
  alt: string
  caption?: string
}

export interface VideoContent {
  src: string
  caption?: string
}

export interface CustomCodeContent {
  html: string
  css?: string
}

export interface ButtonContent {
  label: string
  action: 'next_page' | 'submit' | 'url'
  url?: string
  variant: 'primary' | 'secondary' | 'outline'
  align: 'left' | 'center' | 'right'
}

export interface ColumnCell {
  id: string
  blockType: BlockType | null
  content: BlockContentMap[BlockType] | null
}

export interface ColumnsContent {
  layout: '1:1' | '1:2' | '2:1' | '1:1:1' | '1:2:1'
  cells: ColumnCell[]
}

// -- Question block content types --

export interface Option {
  id: string
  label: string
  value: string
  imageUrl?: string
}

export interface TextInputContent {
  label: string
  description?: string
  placeholder?: string
  required?: boolean
}

export interface TextAreaContent {
  label: string
  description?: string
  placeholder?: string
  required?: boolean
  rows?: number
}

export interface RadioContent {
  label: string
  description?: string
  required?: boolean
  options: Option[]
  allowOther?: boolean
}

export interface CheckboxContent {
  label: string
  description?: string
  required?: boolean
  options: Option[]
  minSelections?: number
  maxSelections?: number
  allowOther?: boolean
}

export interface SelectContent {
  label: string
  description?: string
  required?: boolean
  options: Option[]
  placeholder?: string
}

export interface ScaleContent {
  label: string
  description?: string
  required?: boolean
  min: number
  max: number
  minLabel?: string
  maxLabel?: string
}

export interface NPSContent {
  label: string
  description?: string
  required?: boolean
}

export interface SliderContent {
  label: string
  description?: string
  required?: boolean
  min: number
  max: number
  step: number
  minLabel?: string
  maxLabel?: string
  showValue?: boolean
}

export interface YesNoContent {
  label: string
  description?: string
  required?: boolean
  yesLabel?: string
  noLabel?: string
}

export interface DatePickerContent {
  label: string
  description?: string
  required?: boolean
  includeTime?: boolean
}

export interface MatrixRow {
  id: string
  label: string
}

export interface MatrixColumn {
  id: string
  label: string
}

export interface MatrixContent {
  label: string
  description?: string
  required?: boolean
  rows: MatrixRow[]
  columns: MatrixColumn[]
  allowMultiple?: boolean
}

export interface RankingContent {
  label: string
  description?: string
  required?: boolean
  items: Option[]
}

export interface FileUploadContent {
  label: string
  description?: string
  required?: boolean
  acceptedTypes?: string[]
  maxFileSizeMB?: number
}

export interface LikertStatement {
  id: string
  text: string
}

export interface LikertContent {
  label: string
  description?: string
  required?: boolean
  statements: LikertStatement[]
  scale: string[] // e.g. ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
}

export interface ImageChoiceOption {
  id: string
  label: string
  imageUrl: string
}

export interface ImageChoiceContent {
  label: string
  description?: string
  required?: boolean
  options: ImageChoiceOption[]
  allowMultiple?: boolean
  columns?: 2 | 3 | 4
}

// -- Content map for type safety --

export interface BlockContentMap {
  heading: HeadingContent
  paragraph: ParagraphContent
  divider: DividerContent
  spacer: SpacerContent
  image: ImageContent
  video: VideoContent
  button: ButtonContent
  'custom-code': CustomCodeContent
  columns: ColumnsContent
  'text-input': TextInputContent
  textarea: TextAreaContent
  radio: RadioContent
  checkbox: CheckboxContent
  select: SelectContent
  scale: ScaleContent
  nps: NPSContent
  slider: SliderContent
  'yes-no': YesNoContent
  'date-picker': DatePickerContent
  matrix: MatrixContent
  ranking: RankingContent
  'file-upload': FileUploadContent
  likert: LikertContent
  'image-choice': ImageChoiceContent
}

// ---------------------------------------------------------------------------
// Block Metadata
// ---------------------------------------------------------------------------

export interface BlockStyle {
  padding?: string
  margin?: string
  backgroundColor?: string
  borderRadius?: string
  textAlign?: 'left' | 'center' | 'right'
  fontSize?: string
  fontFamily?: string
  fontWeight?: string
  color?: string
  width?: string
  maxWidth?: string
  display?: 'block' | 'flex' | 'grid'
  flexDirection?: 'row' | 'column'
  gap?: string
  alignItems?: string
  justifyContent?: string
}

export interface BlockValidation {
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: string
  customMessage?: string
}

export interface ConditionalRule {
  sourceBlockId: string
  operator: BranchOperator
  value: unknown
}

export interface BlockMeta {
  questionId?: string
  position: number
  style?: BlockStyle
  validation?: BlockValidation
  conditionalVisibility?: ConditionalRule[]
}

// ---------------------------------------------------------------------------
// Block
// ---------------------------------------------------------------------------

export interface Block<T extends BlockType = BlockType> {
  id: string
  type: T
  content: BlockContentMap[T]
  meta: BlockMeta
}

// ---------------------------------------------------------------------------
// Branching / Conditional Logic
// ---------------------------------------------------------------------------

export type BranchOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'in'
  | 'not_in'
  | 'is_answered'
  | 'is_not_answered'

export type BranchAction =
  | 'go_to_page'
  | 'skip_page'
  | 'end_survey'
  | 'show_block'
  | 'hide_block'

export interface BranchRule {
  id: string
  sourceBlockId: string
  sourcePageId: string
  operator: BranchOperator
  value: unknown
  action: BranchAction
  targetId: string
}

export interface PageLogic {
  defaultNextPageId?: string
  branches: BranchRule[]
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export interface PageStyle {
  backgroundColor?: string
  maxWidth?: string
  padding?: string
}

export interface EditorPage {
  id: string
  title: string
  description?: string
  position: number
  blocks: Block[]
  style?: PageStyle
  logic?: PageLogic
}

// ---------------------------------------------------------------------------
// Survey Settings & Theme
// ---------------------------------------------------------------------------

export interface SurveySettings {
  allowBack: boolean
  showProgress: boolean
  randomizeQuestions: boolean
  timeLimit?: number
  responseLimit?: number
  requireAuth: boolean
  collectBehavioralData: boolean
}

export interface SurveyTheme {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  secondaryFontFamily?: string
  borderRadius: string
  accentColor: string
  logoUrl?: string
  logoPosition?: 'top-left' | 'top-center' | 'top-right'
}

export interface SurveyMetadata {
  createdAt: string
  updatedAt: string
  version: number
}

// ---------------------------------------------------------------------------
// Top-level Survey
// ---------------------------------------------------------------------------

export interface BlockEditorSurvey {
  id: string
  title: string
  description?: string
  pages: EditorPage[]
  settings: SurveySettings
  theme: SurveyTheme
  metadata: SurveyMetadata
}

// ---------------------------------------------------------------------------
// Utility types
// ---------------------------------------------------------------------------

export const LAYOUT_BLOCK_TYPES: LayoutBlockType[] = [
  'heading', 'paragraph', 'divider', 'spacer', 'image', 'video', 'button', 'custom-code', 'columns',
]

export const QUESTION_BLOCK_TYPES: QuestionBlockType[] = [
  'text-input', 'textarea', 'radio', 'checkbox', 'select',
  'scale', 'nps', 'slider', 'yes-no', 'date-picker',
  'matrix', 'ranking', 'file-upload', 'likert', 'image-choice',
]

export function isQuestionBlock(type: BlockType): type is QuestionBlockType {
  return (QUESTION_BLOCK_TYPES as string[]).includes(type)
}

export function isLayoutBlock(type: BlockType): type is LayoutBlockType {
  return (LAYOUT_BLOCK_TYPES as string[]).includes(type)
}
