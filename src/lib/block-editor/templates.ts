/**
 * Survey templates — ready-made block layouts for different use cases.
 * Each template provides a set of blocks that get instantly placed on a page.
 */

import { nanoid } from 'nanoid'
import type { Block, BlockType, EditorPage, SurveyTheme } from './types'
import { createDefaultBlock } from './block-defaults'

// ---------------------------------------------------------------------------
// Layout templates (quick structure inserts)
// ---------------------------------------------------------------------------

export interface LayoutTemplate {
  id: string
  label: string
  description: string
  /** Mini thumbnail type for the card icon */
  thumbnail: 'text-only' | 'image-left' | 'text-stack' | 'image-right' | 'two-columns' | 'accent-left'
  blocks: () => Block<BlockType>[]
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'text-only',
    label: 'Text Only',
    description: 'Heading, text, and a button',
    thumbnail: 'text-only',
    blocks: () => [
      createDefaultBlock('heading', 0, { text: 'Your heading here', level: 1 }),
      createDefaultBlock('paragraph', 1, { text: 'Add your description or introduction text here. This sets the context for your survey respondents.' }),
      createDefaultBlock('button', 2, { label: 'Get Started', action: 'next_page', variant: 'primary', align: 'left' }),
    ],
  },
  {
    id: 'image-left',
    label: 'Image + Text',
    description: 'Image with text beside it',
    thumbnail: 'image-left',
    blocks: () => [
      createDefaultBlock('image', 0, { src: '', alt: 'Add an image' }),
      createDefaultBlock('heading', 1, { text: 'Your heading here', level: 2 }),
      createDefaultBlock('paragraph', 2, { text: 'Describe your survey or provide context for respondents.' }),
    ],
  },
  {
    id: 'text-stack',
    label: 'Content Stack',
    description: 'Heading, text, and questions',
    thumbnail: 'text-stack',
    blocks: () => [
      createDefaultBlock('heading', 0, { text: 'Section Title', level: 2 }),
      createDefaultBlock('paragraph', 1, { text: 'Brief instructions for this section.' }),
      createDefaultBlock('divider', 2),
      createDefaultBlock('text-input', 3, { label: 'Your question here', placeholder: 'Type your answer...' }),
    ],
  },
  {
    id: 'image-right',
    label: 'Text + Image',
    description: 'Text content with trailing image',
    thumbnail: 'image-right',
    blocks: () => [
      createDefaultBlock('heading', 0, { text: 'Your heading here', level: 2 }),
      createDefaultBlock('paragraph', 1, { text: 'Add your description or introduction text here.' }),
      createDefaultBlock('image', 2, { src: '', alt: 'Add an image' }),
    ],
  },
  {
    id: 'two-columns',
    label: 'Two Columns',
    description: 'Side-by-side layout',
    thumbnail: 'two-columns',
    blocks: () => [
      createDefaultBlock('heading', 0, { text: 'Your heading here', level: 1 }),
      createDefaultBlock('columns', 1, {
        layout: '1:1',
        cells: [
          { id: nanoid(8), blockType: 'paragraph', content: { text: 'Left column content goes here.' } },
          { id: nanoid(8), blockType: 'paragraph', content: { text: 'Right column content goes here.' } },
        ],
      } as any),
    ],
  },
  {
    id: 'accent-left',
    label: 'Accent Left',
    description: 'Image accent with text',
    thumbnail: 'accent-left',
    blocks: () => [
      createDefaultBlock('columns', 0, {
        layout: '1:2',
        cells: [
          { id: nanoid(8), blockType: 'image', content: { src: '', alt: 'Add an image' } },
          { id: nanoid(8), blockType: 'heading', content: { text: 'Your heading here', level: 2 } },
        ],
      } as any),
      createDefaultBlock('paragraph', 1, { text: 'Add your description or introduction text here.' }),
    ],
  },
]

// ---------------------------------------------------------------------------
// Full survey templates
// ---------------------------------------------------------------------------

export interface SurveyTemplate {
  id: string
  label: string
  description: string
  category: 'marketing' | 'research' | 'education' | 'general'
  theme: Partial<SurveyTheme>
  pages: () => { title: string; blocks: Block<BlockType>[] }[]
}

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
  // --- Marketing ---
  {
    id: 'product-satisfaction',
    label: 'Product Satisfaction',
    description: 'Measure customer happiness with your product',
    category: 'marketing',
    theme: {
      primaryColor: '#6366f1',
      accentColor: '#6366f1',
      backgroundColor: '#ffffff',
      textColor: '#1e1b4b',
      fontFamily: 'DM Sans, sans-serif',
    },
    pages: () => [
      {
        title: 'Page 1',
        blocks: [
          createDefaultBlock('heading', 0, { text: 'How satisfied are you?', level: 1 }),
          createDefaultBlock('paragraph', 1, { text: 'Your feedback helps us build a better product. This takes about 2 minutes.' }),
          createDefaultBlock('scale', 2, { label: 'Overall, how satisfied are you with our product?', min: 1, max: 5, minLabel: 'Very Unsatisfied', maxLabel: 'Very Satisfied', required: true }),
          createDefaultBlock('radio', 3, { label: 'How often do you use our product?', required: false, options: [{ id: nanoid(8), label: 'Daily', value: 'daily' }, { id: nanoid(8), label: 'Weekly', value: 'weekly' }, { id: nanoid(8), label: 'Monthly', value: 'monthly' }, { id: nanoid(8), label: 'Rarely', value: 'rarely' }] }),
          createDefaultBlock('textarea', 4, { label: 'What could we improve?', placeholder: 'Share your thoughts...', required: false, rows: 4 }),
          createDefaultBlock('nps', 5, { label: 'How likely are you to recommend us to a friend?', required: false }),
          createDefaultBlock('button', 6, { label: 'Submit', action: 'submit', variant: 'primary', align: 'left' }),
        ],
      },
    ],
  },
  {
    id: 'brand-awareness',
    label: 'Brand Awareness',
    description: 'Understand how people perceive your brand',
    category: 'marketing',
    theme: {
      primaryColor: '#ec4899',
      accentColor: '#ec4899',
      backgroundColor: '#ffffff',
      textColor: '#1a1a2e',
      fontFamily: 'Plus Jakarta Sans, sans-serif',
    },
    pages: () => [
      {
        title: 'Page 1',
        blocks: [
          createDefaultBlock('heading', 0, { text: 'Brand Perception Survey', level: 1 }),
          createDefaultBlock('paragraph', 1, { text: 'Help us understand how you see our brand. All responses are anonymous.' }),
          createDefaultBlock('radio', 2, { label: 'How did you first hear about us?', required: true, options: [{ id: nanoid(8), label: 'Social Media', value: 'social' }, { id: nanoid(8), label: 'Word of Mouth', value: 'word_of_mouth' }, { id: nanoid(8), label: 'Search Engine', value: 'search' }, { id: nanoid(8), label: 'Advertisement', value: 'ad' }, { id: nanoid(8), label: 'Other', value: 'other' }] }),
          createDefaultBlock('checkbox', 3, { label: 'Which words describe our brand? (Select all that apply)', required: false, options: [{ id: nanoid(8), label: 'Innovative', value: 'innovative' }, { id: nanoid(8), label: 'Trustworthy', value: 'trustworthy' }, { id: nanoid(8), label: 'Affordable', value: 'affordable' }, { id: nanoid(8), label: 'Premium', value: 'premium' }, { id: nanoid(8), label: 'Friendly', value: 'friendly' }] }),
          createDefaultBlock('scale', 4, { label: 'How familiar are you with our brand?', min: 1, max: 5, minLabel: 'Not at all', maxLabel: 'Very familiar', required: false }),
          createDefaultBlock('button', 5, { label: 'Submit', action: 'submit', variant: 'primary', align: 'left' }),
        ],
      },
    ],
  },
  {
    id: 'event-feedback',
    label: 'Event Feedback',
    description: 'Collect feedback after events or webinars',
    category: 'marketing',
    theme: {
      primaryColor: '#f59e0b',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1c1917',
      fontFamily: 'Outfit, sans-serif',
    },
    pages: () => [
      {
        title: 'Page 1',
        blocks: [
          createDefaultBlock('heading', 0, { text: 'Event Feedback', level: 1 }),
          createDefaultBlock('paragraph', 1, { text: 'Thank you for attending! Share your experience so we can make future events even better.' }),
          createDefaultBlock('scale', 2, { label: 'How would you rate the event overall?', min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent', required: true }),
          createDefaultBlock('likert', 3, { label: 'Rate the following aspects:', required: false, statements: [{ id: nanoid(8), text: 'Content quality' }, { id: nanoid(8), text: 'Speaker presentation' }, { id: nanoid(8), text: 'Venue / platform' }, { id: nanoid(8), text: 'Networking opportunities' }], scale: ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'] }),
          createDefaultBlock('textarea', 4, { label: 'Any additional comments?', placeholder: 'What stood out? What could improve?', required: false, rows: 3 }),
          createDefaultBlock('button', 5, { label: 'Submit Feedback', action: 'submit', variant: 'primary', align: 'left' }),
        ],
      },
    ],
  },

  // --- Research ---
  {
    id: 'user-research',
    label: 'User Research',
    description: 'In-depth user interview screener',
    category: 'research',
    theme: {
      primaryColor: '#0ea5e9',
      accentColor: '#0ea5e9',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      fontFamily: 'Inter, sans-serif',
    },
    pages: () => [
      {
        title: 'Page 1',
        blocks: [
          createDefaultBlock('heading', 0, { text: 'User Research Study', level: 1 }),
          createDefaultBlock('paragraph', 1, { text: 'We\'re conducting research to improve our product. Your insights are invaluable. This survey takes approximately 5 minutes.' }),
          createDefaultBlock('text-input', 2, { label: 'What is your current role/title?', placeholder: 'e.g. Product Manager', required: true }),
          createDefaultBlock('radio', 3, { label: 'How long have you been using this type of product?', required: true, options: [{ id: nanoid(8), label: 'Less than 6 months', value: '<6m' }, { id: nanoid(8), label: '6 months - 1 year', value: '6m-1y' }, { id: nanoid(8), label: '1-3 years', value: '1-3y' }, { id: nanoid(8), label: '3+ years', value: '3y+' }] }),
          createDefaultBlock('textarea', 4, { label: 'Describe your biggest pain point with current solutions', placeholder: 'Be as specific as possible...', required: true, rows: 5 }),
          createDefaultBlock('ranking', 5, { label: 'Rank these features by importance to you:', required: false, items: [{ id: nanoid(8), label: 'Speed / Performance', value: 'speed' }, { id: nanoid(8), label: 'Ease of Use', value: 'ease' }, { id: nanoid(8), label: 'Customization', value: 'custom' }, { id: nanoid(8), label: 'Integrations', value: 'integrations' }, { id: nanoid(8), label: 'Pricing', value: 'pricing' }] }),
          createDefaultBlock('button', 6, { label: 'Continue', action: 'submit', variant: 'primary', align: 'left' }),
        ],
      },
    ],
  },
  {
    id: 'academic-survey',
    label: 'Academic Survey',
    description: 'Structured research questionnaire',
    category: 'research',
    theme: {
      primaryColor: '#1d4ed8',
      accentColor: '#1d4ed8',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontFamily: 'Source Serif 4, serif',
    },
    pages: () => [
      {
        title: 'Demographics',
        blocks: [
          createDefaultBlock('heading', 0, { text: 'Research Questionnaire', level: 1 }),
          createDefaultBlock('paragraph', 1, { text: 'This survey is part of an academic research study. All responses are confidential and will be used for research purposes only. Participation is voluntary.' }),
          createDefaultBlock('divider', 2),
          createDefaultBlock('heading', 3, { text: 'Section A: Demographics', level: 2 }),
          createDefaultBlock('select', 4, { label: 'Age range', required: true, options: [{ id: nanoid(8), label: '18-24', value: '18-24' }, { id: nanoid(8), label: '25-34', value: '25-34' }, { id: nanoid(8), label: '35-44', value: '35-44' }, { id: nanoid(8), label: '45-54', value: '45-54' }, { id: nanoid(8), label: '55+', value: '55+' }], placeholder: 'Select your age range' }),
          createDefaultBlock('radio', 5, { label: 'Highest level of education completed', required: true, options: [{ id: nanoid(8), label: 'High School', value: 'hs' }, { id: nanoid(8), label: 'Bachelor\'s Degree', value: 'bachelors' }, { id: nanoid(8), label: 'Master\'s Degree', value: 'masters' }, { id: nanoid(8), label: 'Doctoral Degree', value: 'doctoral' }, { id: nanoid(8), label: 'Other', value: 'other' }] }),
          createDefaultBlock('likert', 6, { label: 'Please indicate your agreement with the following statements:', required: true, statements: [{ id: nanoid(8), text: 'I am satisfied with my current learning environment' }, { id: nanoid(8), text: 'I have access to adequate resources' }, { id: nanoid(8), text: 'I feel supported in my academic journey' }], scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] }),
          createDefaultBlock('button', 7, { label: 'Submit Response', action: 'submit', variant: 'primary', align: 'left' }),
        ],
      },
    ],
  },

  // --- Education ---
  {
    id: 'course-evaluation',
    label: 'Course Evaluation',
    description: 'Student feedback on courses',
    category: 'education',
    theme: {
      primaryColor: '#10b981',
      accentColor: '#10b981',
      backgroundColor: '#ffffff',
      textColor: '#064e3b',
      fontFamily: 'Nunito, sans-serif',
    },
    pages: () => [
      {
        title: 'Page 1',
        blocks: [
          createDefaultBlock('heading', 0, { text: 'Course Evaluation', level: 1 }),
          createDefaultBlock('paragraph', 1, { text: 'Your honest feedback helps improve this course for future students. All responses are anonymous.' }),
          createDefaultBlock('text-input', 2, { label: 'Course name', placeholder: 'e.g. Introduction to Psychology', required: true }),
          createDefaultBlock('scale', 3, { label: 'Rate the overall course quality', min: 1, max: 5, minLabel: 'Poor', maxLabel: 'Excellent', required: true }),
          createDefaultBlock('matrix', 4, { label: 'Rate each aspect of the course:', required: false, rows: [{ id: nanoid(8), label: 'Course content' }, { id: nanoid(8), label: 'Instructor clarity' }, { id: nanoid(8), label: 'Assignments' }, { id: nanoid(8), label: 'Pace of learning' }], columns: [{ id: nanoid(8), label: 'Poor' }, { id: nanoid(8), label: 'Fair' }, { id: nanoid(8), label: 'Good' }, { id: nanoid(8), label: 'Excellent' }] }),
          createDefaultBlock('textarea', 5, { label: 'What was the most valuable part of this course?', placeholder: 'Share your thoughts...', required: false, rows: 3 }),
          createDefaultBlock('yes-no', 6, { label: 'Would you recommend this course to other students?', required: false, yesLabel: 'Yes', noLabel: 'No' }),
          createDefaultBlock('button', 7, { label: 'Submit Evaluation', action: 'submit', variant: 'primary', align: 'left' }),
        ],
      },
    ],
  },
  {
    id: 'student-wellbeing',
    label: 'Student Wellbeing',
    description: 'Check-in on student mental health',
    category: 'education',
    theme: {
      primaryColor: '#8b5cf6',
      accentColor: '#8b5cf6',
      backgroundColor: '#ffffff',
      textColor: '#2e1065',
      fontFamily: 'Poppins, sans-serif',
    },
    pages: () => [
      {
        title: 'Page 1',
        blocks: [
          createDefaultBlock('heading', 0, { text: 'How are you doing?', level: 1 }),
          createDefaultBlock('paragraph', 1, { text: 'This quick check-in helps us understand how students are feeling. Your responses are completely confidential.' }),
          createDefaultBlock('scale', 2, { label: 'How would you rate your overall wellbeing this week?', min: 1, max: 5, minLabel: 'Struggling', maxLabel: 'Thriving', required: true }),
          createDefaultBlock('checkbox', 3, { label: 'What areas are you finding challenging? (Select all that apply)', required: false, options: [{ id: nanoid(8), label: 'Academic workload', value: 'workload' }, { id: nanoid(8), label: 'Time management', value: 'time' }, { id: nanoid(8), label: 'Social connections', value: 'social' }, { id: nanoid(8), label: 'Financial concerns', value: 'financial' }, { id: nanoid(8), label: 'Sleep / Health', value: 'health' }] }),
          createDefaultBlock('slider', 4, { label: 'How stressed have you felt this week?', min: 0, max: 10, step: 1, showValue: true, required: false }),
          createDefaultBlock('textarea', 5, { label: 'Is there anything you\'d like to share?', placeholder: 'This is a safe space...', required: false, rows: 3 }),
          createDefaultBlock('button', 6, { label: 'Submit', action: 'submit', variant: 'primary', align: 'left' }),
        ],
      },
    ],
  },

  // --- General ---
  {
    id: 'customer-feedback',
    label: 'Customer Feedback',
    description: 'General customer satisfaction form',
    category: 'general',
    theme: {
      primaryColor: '#2563eb',
      accentColor: '#2563eb',
      backgroundColor: '#ffffff',
      textColor: '#0a0a0a',
      fontFamily: 'FK Grotesk, sans-serif',
    },
    pages: () => [
      {
        title: 'Page 1',
        blocks: [
          createDefaultBlock('heading', 0, { text: 'We\'d love your feedback', level: 1 }),
          createDefaultBlock('paragraph', 1, { text: 'Help us serve you better. This only takes a minute.' }),
          createDefaultBlock('scale', 2, { label: 'How was your experience?', min: 1, max: 5, minLabel: 'Terrible', maxLabel: 'Amazing', required: true }),
          createDefaultBlock('textarea', 3, { label: 'What went well?', placeholder: 'Tell us what you liked...', required: false, rows: 3 }),
          createDefaultBlock('textarea', 4, { label: 'What could be better?', placeholder: 'Tell us what to improve...', required: false, rows: 3 }),
          createDefaultBlock('nps', 5, { label: 'How likely are you to recommend us?', required: false }),
          createDefaultBlock('button', 6, { label: 'Send Feedback', action: 'submit', variant: 'primary', align: 'left' }),
        ],
      },
    ],
  },
  {
    id: 'employee-engagement',
    label: 'Employee Engagement',
    description: 'Measure team satisfaction and morale',
    category: 'general',
    theme: {
      primaryColor: '#059669',
      accentColor: '#059669',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      fontFamily: 'Space Grotesk, sans-serif',
    },
    pages: () => [
      {
        title: 'Page 1',
        blocks: [
          createDefaultBlock('heading', 0, { text: 'Employee Engagement Survey', level: 1 }),
          createDefaultBlock('paragraph', 1, { text: 'Your voice matters. This anonymous survey helps us build a better workplace.' }),
          createDefaultBlock('likert', 2, { label: 'How much do you agree with the following?', required: true, statements: [{ id: nanoid(8), text: 'I feel valued at work' }, { id: nanoid(8), text: 'I have opportunities for growth' }, { id: nanoid(8), text: 'I trust my team leadership' }, { id: nanoid(8), text: 'I would recommend this workplace' }], scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'] }),
          createDefaultBlock('scale', 3, { label: 'How satisfied are you with work-life balance?', min: 1, max: 5, minLabel: 'Very Unsatisfied', maxLabel: 'Very Satisfied', required: false }),
          createDefaultBlock('textarea', 4, { label: 'What\'s one thing we could do to improve your experience?', placeholder: 'Be honest - this is anonymous...', required: false, rows: 4 }),
          createDefaultBlock('button', 5, { label: 'Submit', action: 'submit', variant: 'primary', align: 'left' }),
        ],
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Helper to apply a template to the current survey
// ---------------------------------------------------------------------------

export function getTemplateCategories() {
  return [
    { id: 'marketing', label: 'Marketing', color: '#ec4899' },
    { id: 'research', label: 'Research', color: '#0ea5e9' },
    { id: 'education', label: 'Education', color: '#10b981' },
    { id: 'general', label: 'General', color: '#6366f1' },
  ] as const
}
