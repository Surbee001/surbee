"use client"

import React from 'react'
import { useSurveyState } from '@/features/survey'
import { motion } from 'framer-motion'

// Base component style interface
export interface ComponentStyle {
  container?: React.CSSProperties
  label?: React.CSSProperties
  input?: React.CSSProperties
  option?: React.CSSProperties
  error?: React.CSSProperties
  // Animation properties
  animation?: {
    initial?: any
    animate?: any
    exit?: any
    transition?: any
  }
}

export interface BaseComponentProps {
  id: string
  label: string
  required?: boolean
  placeholder?: string
  helpText?: string
  style?: ComponentStyle
  validation?: {
    rules: string[]
    errorMessages: Record<string, string>
  }
  className?: string
}

// Text Input Component
export const TextInputComponent: React.FC<BaseComponentProps> = ({
  id,
  label,
  required = false,
  placeholder = "",
  helpText,
  style = {},
  validation,
  className = ""
}) => {
  const { submitAnswer, responses } = useSurveyState()
  const value = responses[id] || ''

  const defaultStyle = {
    container: {
      marginBottom: '1.5rem',
      ...style.container
    },
    label: {
      display: 'block',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
      ...style.label
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.2s',
      backgroundColor: '#ffffff',
      ...style.input
    }
  }

  return (
    <motion.div 
      style={defaultStyle.container}
      className={className}
      {...(style.animation || {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <label style={defaultStyle.label}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => submitAnswer(id, e.target.value)}
        style={defaultStyle.input}
        onFocus={(e) => {
          e.target.style.outline = 'none'
          e.target.style.borderColor = '#3b82f6'
          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db'
          e.target.style.boxShadow = 'none'
        }}
      />
      {helpText && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
          {helpText}
        </p>
      )}
    </motion.div>
  )
}

// Textarea Component
export const TextAreaComponent: React.FC<BaseComponentProps & { rows?: number }> = ({
  id,
  label,
  required = false,
  placeholder = "",
  helpText,
  style = {},
  rows = 4,
  className = ""
}) => {
  const { submitAnswer, responses } = useSurveyState()
  const value = responses[id] || ''

  const defaultStyle = {
    container: {
      marginBottom: '1.5rem',
      ...style.container
    },
    label: {
      display: 'block',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
      ...style.label
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.2s',
      backgroundColor: '#ffffff',
      resize: 'vertical' as const,
      minHeight: '100px',
      ...style.input
    }
  }

  return (
    <motion.div 
      style={defaultStyle.container}
      className={className}
      {...(style.animation || {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <label style={defaultStyle.label}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={rows}
        onChange={(e) => submitAnswer(id, e.target.value)}
        style={defaultStyle.textarea}
        onFocus={(e) => {
          e.target.style.outline = 'none'
          e.target.style.borderColor = '#3b82f6'
          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db'
          e.target.style.boxShadow = 'none'
        }}
      />
      {helpText && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
          {helpText}
        </p>
      )}
    </motion.div>
  )
}

// Radio Group Component
export const RadioGroupComponent: React.FC<BaseComponentProps & { options: string[] }> = ({
  id,
  label,
  required = false,
  options = [],
  helpText,
  style = {},
  className = ""
}) => {
  const { submitAnswer, responses } = useSurveyState()
  const value = responses[id] || ''

  const defaultStyle = {
    container: {
      marginBottom: '1.5rem',
      ...style.container
    },
    label: {
      display: 'block',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.75rem',
      ...style.label
    },
    optionsContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: '#ffffff',
      ...style.option
    }
  }

  return (
    <motion.div 
      style={defaultStyle.container}
      className={className}
      {...(style.animation || {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <label style={defaultStyle.label}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <div style={defaultStyle.optionsContainer}>
        {options.map((option, index) => (
          <motion.div
            key={index}
            style={{
              ...defaultStyle.option,
              backgroundColor: value === option ? '#eff6ff' : '#ffffff',
              borderColor: value === option ? '#3b82f6' : '#e5e7eb',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => submitAnswer(id, option)}
          >
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={() => submitAnswer(id, option)}
              style={{ marginRight: '0.75rem', accentColor: '#3b82f6' }}
            />
            <span style={{ fontSize: '1rem', color: '#374151' }}>{option}</span>
          </motion.div>
        ))}
      </div>
      {helpText && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          {helpText}
        </p>
      )}
    </motion.div>
  )
}

// Scale Rating Component
export const ScaleRatingComponent: React.FC<BaseComponentProps & { min?: number; max?: number; labels?: string[] }> = ({
  id,
  label,
  required = false,
  min = 1,
  max = 5,
  labels = [],
  helpText,
  style = {},
  className = ""
}) => {
  const { submitAnswer, responses } = useSurveyState()
  const value = responses[id] || null

  const defaultStyle = {
    container: {
      marginBottom: '1.5rem',
      ...style.container
    },
    label: {
      display: 'block',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.75rem',
      ...style.label
    },
    scaleContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    scaleButton: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '0.5rem',
      minWidth: '60px'
    }
  }

  const scaleValues = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  return (
    <motion.div 
      style={defaultStyle.container}
      className={className}
      {...(style.animation || {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <label style={defaultStyle.label}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <div style={defaultStyle.scaleContainer}>
        {scaleValues.map((scaleValue, index) => (
          <div key={scaleValue} style={defaultStyle.scaleButton}>
            <motion.button
              type="button"
              onClick={() => submitAnswer(id, scaleValue)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '2px solid',
                borderColor: value === scaleValue ? '#3b82f6' : '#d1d5db',
                backgroundColor: value === scaleValue ? '#3b82f6' : '#ffffff',
                color: value === scaleValue ? '#ffffff' : '#374151',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              whileHover={{ 
                scale: 1.1,
                borderColor: '#3b82f6',
                backgroundColor: value === scaleValue ? '#2563eb' : '#eff6ff'
              }}
              whileTap={{ scale: 0.95 }}
            >
              {scaleValue}
            </motion.button>
            {labels[index] && (
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                textAlign: 'center',
                maxWidth: '60px',
                lineHeight: '1.2'
              }}>
                {labels[index]}
              </span>
            )}
          </div>
        ))}
      </div>
      {helpText && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          {helpText}
        </p>
      )}
    </motion.div>
  )
}

// Yes/No Component
export const YesNoComponent: React.FC<BaseComponentProps> = ({
  id,
  label,
  required = false,
  helpText,
  style = {},
  className = ""
}) => {
  const { submitAnswer, responses } = useSurveyState()
  const value = responses[id] || null

  const options = [
    { value: 'yes', label: 'Yes', color: '#10b981' },
    { value: 'no', label: 'No', color: '#ef4444' }
  ]

  const defaultStyle = {
    container: {
      marginBottom: '1.5rem',
      ...style.container
    },
    label: {
      display: 'block',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.75rem',
      ...style.label
    },
    optionsContainer: {
      display: 'flex',
      gap: '1rem',
      marginTop: '0.5rem'
    }
  }

  return (
    <motion.div 
      style={defaultStyle.container}
      className={className}
      {...(style.animation || {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <label style={defaultStyle.label}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <div style={defaultStyle.optionsContainer}>
        {options.map((option) => (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => submitAnswer(id, option.value)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: '2px solid',
              borderColor: value === option.value ? option.color : '#d1d5db',
              backgroundColor: value === option.value ? option.color : '#ffffff',
              color: value === option.value ? '#ffffff' : '#374151',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              minWidth: '100px'
            }}
            whileHover={{ 
              scale: 1.05,
              borderColor: option.color,
              backgroundColor: value === option.value ? option.color : `${option.color}10`
            }}
            whileTap={{ scale: 0.95 }}
          >
            {option.label}
          </motion.button>
        ))}
      </div>
      {helpText && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          {helpText}
        </p>
      )}
    </motion.div>
  )
}

// Checkbox Group Component
export const CheckboxGroupComponent: React.FC<BaseComponentProps & { options: string[] }> = ({
  id,
  label,
  required = false,
  options = [],
  helpText,
  style = {},
  className = ""
}) => {
  const { submitAnswer, responses } = useSurveyState()
  const value = responses[id] || []

  const defaultStyle = {
    container: {
      marginBottom: '1.5rem',
      ...style.container
    },
    label: {
      display: 'block',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.75rem',
      ...style.label
    },
    optionsContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem'
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      padding: '0.75rem',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      backgroundColor: '#ffffff',
      ...style.option
    }
  }

  const handleToggle = (option: string) => {
    const currentValues = Array.isArray(value) ? value : []
    const newValues = currentValues.includes(option)
      ? currentValues.filter(v => v !== option)
      : [...currentValues, option]
    submitAnswer(id, newValues)
  }

  return (
    <motion.div 
      style={defaultStyle.container}
      className={className}
      {...(style.animation || {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <label style={defaultStyle.label}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <div style={defaultStyle.optionsContainer}>
        {options.map((option, index) => (
          <motion.div
            key={index}
            style={{
              ...defaultStyle.option,
              backgroundColor: value.includes(option) ? '#eff6ff' : '#ffffff',
              borderColor: value.includes(option) ? '#3b82f6' : '#e5e7eb',
            }}
            whileHover={{ scale: 1.02, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleToggle(option)}
          >
            <input
              type="checkbox"
              name={id}
              value={option}
              checked={value.includes(option)}
              onChange={() => handleToggle(option)}
              style={{ marginRight: '0.75rem', accentColor: '#3b82f6' }}
            />
            <span style={{ fontSize: '1rem', color: '#374151' }}>{option}</span>
          </motion.div>
        ))}
      </div>
      {helpText && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          {helpText}
        </p>
      )}
    </motion.div>
  )
}

// NPS Rating Component (0-10 scale)
export const NPSRatingComponent: React.FC<BaseComponentProps> = ({
  id,
  label,
  required = false,
  helpText,
  style = {},
  className = ""
}) => {
  const { submitAnswer, responses } = useSurveyState()
  const value = responses[id] || null

  const defaultStyle = {
    container: {
      marginBottom: '1.5rem',
      ...style.container
    },
    label: {
      display: 'block',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.75rem',
      ...style.label
    },
    scaleContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(11, 1fr)',
      gap: '0.5rem',
      marginTop: '1rem'
    },
    legendContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: '0.5rem',
      fontSize: '0.875rem',
      color: '#6b7280'
    }
  }

  const scaleValues = Array.from({ length: 11 }, (_, i) => i)

  return (
    <motion.div 
      style={defaultStyle.container}
      className={className}
      {...(style.animation || {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <label style={defaultStyle.label}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <div style={defaultStyle.scaleContainer}>
        {scaleValues.map((scaleValue) => (
          <motion.button
            key={scaleValue}
            type="button"
            onClick={() => submitAnswer(id, scaleValue)}
            style={{
              height: '40px',
              borderRadius: '6px',
              border: '2px solid',
              borderColor: value === scaleValue ? '#3b82f6' : '#d1d5db',
              backgroundColor: value === scaleValue ? '#3b82f6' : '#ffffff',
              color: value === scaleValue ? '#ffffff' : '#374151',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            whileHover={{ 
              scale: 1.05,
              borderColor: '#3b82f6',
              backgroundColor: value === scaleValue ? '#2563eb' : '#eff6ff'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {scaleValue}
          </motion.button>
        ))}
      </div>
      <div style={defaultStyle.legendContainer}>
        <span>Not at all likely</span>
        <span>Extremely likely</span>
      </div>
      {helpText && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
          {helpText}
        </p>
      )}
    </motion.div>
  )
}

// Select Dropdown Component
export const SelectComponent: React.FC<BaseComponentProps & { options: string[] }> = ({
  id,
  label,
  required = false,
  options = [],
  placeholder = "Select an option...",
  helpText,
  style = {},
  className = ""
}) => {
  const { submitAnswer, responses } = useSurveyState()
  const value = responses[id] || ''

  const defaultStyle = {
    container: {
      marginBottom: '1.5rem',
      ...style.container
    },
    label: {
      display: 'block',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
      ...style.label
    },
    select: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.2s',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      ...style.input
    }
  }

  return (
    <motion.div 
      style={defaultStyle.container}
      className={className}
      {...(style.animation || {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <label style={defaultStyle.label}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => submitAnswer(id, e.target.value)}
        style={defaultStyle.select}
        onFocus={(e) => {
          e.target.style.outline = 'none'
          e.target.style.borderColor = '#3b82f6'
          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db'
          e.target.style.boxShadow = 'none'
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
      {helpText && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
          {helpText}
        </p>
      )}
    </motion.div>
  )
}

// Date Picker Component
export const DatePickerComponent: React.FC<BaseComponentProps> = ({
  id,
  label,
  required = false,
  helpText,
  style = {},
  className = ""
}) => {
  const { submitAnswer, responses } = useSurveyState()
  const value = responses[id] || ''

  const defaultStyle = {
    container: {
      marginBottom: '1.5rem',
      ...style.container
    },
    label: {
      display: 'block',
      fontSize: '1.1rem',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '0.5rem',
      ...style.label
    },
    input: {
      width: '100%',
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      fontSize: '1rem',
      transition: 'all 0.2s',
      backgroundColor: '#ffffff',
      ...style.input
    }
  }

  return (
    <motion.div 
      style={defaultStyle.container}
      className={className}
      {...(style.animation || {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 }
      })}
    >
      <label style={defaultStyle.label}>
        {label}
        {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => submitAnswer(id, e.target.value)}
        style={defaultStyle.input}
        onFocus={(e) => {
          e.target.style.outline = 'none'
          e.target.style.borderColor = '#3b82f6'
          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#d1d5db'
          e.target.style.boxShadow = 'none'
        }}
      />
      {helpText && (
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
          {helpText}
        </p>
      )}
    </motion.div>
  )
}

// Component Registry
export const ComponentRegistry = {
  'text-input': TextInputComponent,
  'textarea': TextAreaComponent,
  'radio': RadioGroupComponent,
  'checkbox': CheckboxGroupComponent,
  'scale': ScaleRatingComponent,
  'nps': NPSRatingComponent,
  'select': SelectComponent,
  'date-picker': DatePickerComponent,
  'yes-no': YesNoComponent
}

export type ComponentType = keyof typeof ComponentRegistry