/**
 * Zod schemas for block editor types.
 * Used by AI agent tool input validation.
 */

import { z } from 'zod'

// ---------------------------------------------------------------------------
// Block Types
// ---------------------------------------------------------------------------

export const layoutBlockTypeSchema = z.enum([
  'heading', 'paragraph', 'divider', 'spacer', 'image', 'video', 'button', 'custom-code',
])

export const questionBlockTypeSchema = z.enum([
  'text-input', 'textarea', 'radio', 'checkbox', 'select',
  'scale', 'nps', 'slider', 'yes-no', 'date-picker',
  'matrix', 'ranking', 'file-upload', 'likert', 'image-choice',
])

export const blockTypeSchema = z.union([layoutBlockTypeSchema, questionBlockTypeSchema])

// ---------------------------------------------------------------------------
// Block Content Schemas
// ---------------------------------------------------------------------------

export const optionSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  imageUrl: z.string().optional(),
})

export const headingContentSchema = z.object({
  text: z.string(),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
})

export const paragraphContentSchema = z.object({
  text: z.string(),
})

export const dividerContentSchema = z.object({
  style: z.enum(['solid', 'dashed', 'dotted']).default('solid'),
})

export const spacerContentSchema = z.object({
  height: z.number().min(8).max(200).default(32),
})

export const imageContentSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
})

export const videoContentSchema = z.object({
  src: z.string(),
  caption: z.string().optional(),
})

export const customCodeContentSchema = z.object({
  html: z.string(),
  css: z.string().optional(),
})

export const buttonContentSchema = z.object({
  label: z.string(),
  action: z.enum(['next_page', 'submit', 'url']).default('submit'),
  url: z.string().optional(),
  variant: z.enum(['primary', 'secondary', 'outline']).default('primary'),
  align: z.enum(['left', 'center', 'right']).default('left'),
})

export const textInputContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
})

export const textAreaContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  rows: z.number().optional(),
})

export const radioContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(optionSchema),
  allowOther: z.boolean().optional(),
})

export const checkboxContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(optionSchema),
  minSelections: z.number().optional(),
  maxSelections: z.number().optional(),
  allowOther: z.boolean().optional(),
})

export const selectContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(optionSchema),
  placeholder: z.string().optional(),
})

export const scaleContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  min: z.number().default(1),
  max: z.number().default(5),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
})

export const npsContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
})

export const sliderContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  min: z.number().default(0),
  max: z.number().default(100),
  step: z.number().default(1),
  minLabel: z.string().optional(),
  maxLabel: z.string().optional(),
  showValue: z.boolean().optional(),
})

export const yesNoContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  yesLabel: z.string().optional(),
  noLabel: z.string().optional(),
})

export const datePickerContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  includeTime: z.boolean().optional(),
})

export const matrixRowSchema = z.object({
  id: z.string(),
  label: z.string(),
})

export const matrixColumnSchema = z.object({
  id: z.string(),
  label: z.string(),
})

export const matrixContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  rows: z.array(matrixRowSchema),
  columns: z.array(matrixColumnSchema),
  allowMultiple: z.boolean().optional(),
})

export const rankingContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  items: z.array(optionSchema),
})

export const fileUploadContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  acceptedTypes: z.array(z.string()).optional(),
  maxFileSizeMB: z.number().optional(),
})

export const likertStatementSchema = z.object({
  id: z.string(),
  text: z.string(),
})

export const likertContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  statements: z.array(likertStatementSchema),
  scale: z.array(z.string()),
})

export const imageChoiceOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  imageUrl: z.string(),
})

export const imageChoiceContentSchema = z.object({
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  options: z.array(imageChoiceOptionSchema),
  allowMultiple: z.boolean().optional(),
  columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
})

// Map block type to its content schema
export const blockContentSchemas: Record<string, z.ZodType> = {
  heading: headingContentSchema,
  paragraph: paragraphContentSchema,
  divider: dividerContentSchema,
  spacer: spacerContentSchema,
  image: imageContentSchema,
  video: videoContentSchema,
  button: buttonContentSchema,
  'custom-code': customCodeContentSchema,
  'text-input': textInputContentSchema,
  textarea: textAreaContentSchema,
  radio: radioContentSchema,
  checkbox: checkboxContentSchema,
  select: selectContentSchema,
  scale: scaleContentSchema,
  nps: npsContentSchema,
  slider: sliderContentSchema,
  'yes-no': yesNoContentSchema,
  'date-picker': datePickerContentSchema,
  matrix: matrixContentSchema,
  ranking: rankingContentSchema,
  'file-upload': fileUploadContentSchema,
  likert: likertContentSchema,
  'image-choice': imageChoiceContentSchema,
}

// ---------------------------------------------------------------------------
// Block Meta & Logic Schemas
// ---------------------------------------------------------------------------

export const blockStyleSchema = z.object({
  padding: z.string().optional(),
  margin: z.string().optional(),
  backgroundColor: z.string().optional(),
  borderRadius: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  fontSize: z.string().optional(),
  fontFamily: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  width: z.string().optional(),
  maxWidth: z.string().optional(),
  display: z.enum(['block', 'flex', 'grid']).optional(),
  flexDirection: z.enum(['row', 'column']).optional(),
  gap: z.string().optional(),
  alignItems: z.string().optional(),
  justifyContent: z.string().optional(),
})

export const blockValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  customMessage: z.string().optional(),
})

export const branchOperatorSchema = z.enum([
  'equals', 'not_equals', 'contains', 'not_contains',
  'greater_than', 'less_than', 'in', 'not_in',
  'is_answered', 'is_not_answered',
])

export const branchActionSchema = z.enum([
  'go_to_page', 'skip_page', 'end_survey', 'show_block', 'hide_block',
])

export const branchRuleSchema = z.object({
  id: z.string(),
  sourceBlockId: z.string(),
  sourcePageId: z.string(),
  operator: branchOperatorSchema,
  value: z.unknown(),
  action: branchActionSchema,
  targetId: z.string(),
})

export const pageLogicSchema = z.object({
  defaultNextPageId: z.string().optional(),
  branches: z.array(branchRuleSchema),
})

export const blockMetaSchema = z.object({
  questionId: z.string().optional(),
  position: z.number(),
  style: blockStyleSchema.optional(),
  validation: blockValidationSchema.optional(),
  conditionalVisibility: z.array(z.object({
    sourceBlockId: z.string(),
    operator: branchOperatorSchema,
    value: z.unknown(),
  })).optional(),
})

// ---------------------------------------------------------------------------
// Block Schema (generic)
// ---------------------------------------------------------------------------

export const blockSchema = z.object({
  id: z.string(),
  type: blockTypeSchema,
  content: z.record(z.unknown()), // validated per-type via blockContentSchemas
  meta: blockMetaSchema,
})

// ---------------------------------------------------------------------------
// Page & Survey Schemas
// ---------------------------------------------------------------------------

export const pageStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  maxWidth: z.string().optional(),
  padding: z.string().optional(),
})

export const editorPageSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  position: z.number(),
  blocks: z.array(blockSchema),
  style: pageStyleSchema.optional(),
  logic: pageLogicSchema.optional(),
})

export const surveySettingsSchema = z.object({
  allowBack: z.boolean().default(true),
  showProgress: z.boolean().default(true),
  randomizeQuestions: z.boolean().default(false),
  timeLimit: z.number().optional(),
  responseLimit: z.number().optional(),
  requireAuth: z.boolean().default(false),
  collectBehavioralData: z.boolean().default(true),
})

export const surveyThemeSchema = z.object({
  primaryColor: z.string().default('#2563eb'),
  secondaryColor: z.string().default('#7c3aed'),
  backgroundColor: z.string().default('#ffffff'),
  textColor: z.string().default('#0a0a0a'),
  fontFamily: z.string().default('FK Grotesk, sans-serif'),
  borderRadius: z.string().default('0.5rem'),
  accentColor: z.string().default('#2563eb'),
})

export const surveyMetadataSchema = z.object({
  createdAt: z.string(),
  updatedAt: z.string(),
  version: z.number(),
})

export const blockEditorSurveySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  pages: z.array(editorPageSchema),
  settings: surveySettingsSchema,
  theme: surveyThemeSchema,
  metadata: surveyMetadataSchema,
})
