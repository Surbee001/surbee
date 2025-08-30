"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ComponentType } from '../base-components'

interface ComponentPreviewProps {
  id: string
  type: ComponentType
  label: string
  required?: boolean
  placeholder?: string
  helpText?: string
  options?: string[]
  props?: Record<string, any>
  style?: {
    container?: React.CSSProperties
    label?: React.CSSProperties
    input?: React.CSSProperties
  }
}

// Standalone preview components that don't use survey hooks
export const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  id,
  type,
  label,
  required = false,
  placeholder = "",
  helpText,
  options = [],
  props = {},
  style = {}
}) => {
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

  const renderPreview = () => {
    switch (type) {
      case 'text-input':
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <input
              type="text"
              placeholder={placeholder}
              style={defaultStyle.input}
              disabled
            />
            {helpText && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {helpText}
              </p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <textarea
              placeholder={placeholder}
              rows={4}
              style={{ ...defaultStyle.input, resize: 'vertical' as const, minHeight: '100px' }}
              disabled
            />
            {helpText && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {helpText}
              </p>
            )}
          </div>
        )

      case 'radio':
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <input
                    type="radio"
                    name={id}
                    style={{ marginRight: '0.75rem', accentColor: '#3b82f6' }}
                    disabled
                  />
                  <span style={{ fontSize: '1rem', color: '#374151' }}>{option}</span>
                </div>
              ))}
            </div>
            {helpText && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                {helpText}
              </p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {options.map((option, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <input
                    type="checkbox"
                    style={{ marginRight: '0.75rem', accentColor: '#3b82f6' }}
                    disabled
                  />
                  <span style={{ fontSize: '1rem', color: '#374151' }}>{option}</span>
                </div>
              ))}
            </div>
            {helpText && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                {helpText}
              </p>
            )}
          </div>
        )

      case 'scale':
        const min = props.min || 1
        const max = props.max || 5
        const scaleValues = Array.from({ length: max - min + 1 }, (_, i) => min + i)
        
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '0.5rem',
              marginTop: '1rem'
            }}>
              {scaleValues.map((value) => (
                <button
                  key={value}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: '2px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'not-allowed'
                  }}
                  disabled
                >
                  {value}
                </button>
              ))}
            </div>
            {helpText && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                {helpText}
              </p>
            )}
          </div>
        )

      case 'nps':
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(11, 1fr)',
              gap: '0.5rem',
              marginTop: '1rem'
            }}>
              {Array.from({ length: 11 }, (_, i) => i).map((value) => (
                <button
                  key={value}
                  style={{
                    height: '40px',
                    borderRadius: '6px',
                    border: '2px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'not-allowed'
                  }}
                  disabled
                >
                  {value}
                </button>
              ))}
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280'
            }}>
              <span>Not at all likely</span>
              <span>Extremely likely</span>
            </div>
            {helpText && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                {helpText}
              </p>
            )}
          </div>
        )

      case 'select':
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <select
              style={{
                ...defaultStyle.input,
                cursor: 'not-allowed'
              }}
              disabled
            >
              <option value="">{placeholder || 'Select an option...'}</option>
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
          </div>
        )

      case 'date-picker':
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <input
              type="date"
              style={defaultStyle.input}
              disabled
            />
            {helpText && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                {helpText}
              </p>
            )}
          </div>
        )

      case 'yes-no':
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              {[
                { value: 'yes', label: 'Yes', color: '#10b981' },
                { value: 'no', label: 'No', color: '#ef4444' }
              ].map((option) => (
                <button
                  key={option.value}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    border: '2px solid #d1d5db',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'not-allowed',
                    minWidth: '100px'
                  }}
                  disabled
                >
                  {option.label}
                </button>
              ))}
            </div>
            {helpText && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                {helpText}
              </p>
            )}
          </div>
        )

      default:
        return (
          <div style={defaultStyle.container}>
            <label style={defaultStyle.label}>
              {label}
              {required && <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>}
            </label>
            <div style={{
              padding: '1rem',
              border: '1px dashed #d1d5db',
              borderRadius: '0.5rem',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              {type} component
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {renderPreview()}
    </motion.div>
  )
}

export default ComponentPreview