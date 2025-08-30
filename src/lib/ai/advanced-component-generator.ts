// Advanced Component Generation System - Like v0/Lovable but for survey components
// Generates sophisticated, animated, accessible React components

import { SurveyAnalysis, QuestionDefinition } from './multi-model-pipeline'

export class AdvancedComponentGenerator {
  // Component template library - sophisticated pre-built patterns
  private componentTemplates = {
    'text-input': {
      basic: this.generateBasicTextInput,
      advanced: this.generateAdvancedTextInput,
      research: this.generateResearchTextInput
    },
    'textarea': {
      basic: this.generateBasicTextarea,
      advanced: this.generateAdvancedTextarea,
      research: this.generateResearchTextarea
    },
    'radio': {
      basic: this.generateBasicRadio,
      advanced: this.generateAdvancedRadio,
      research: this.generateResearchRadio
    },
    'checkbox': {
      basic: this.generateBasicCheckbox,
      advanced: this.generateAdvancedCheckbox,
      research: this.generateResearchCheckbox
    },
    'scale': {
      basic: this.generateBasicScale,
      advanced: this.generateAdvancedScale,
      research: this.generateResearchScale
    },
    'nps': {
      basic: this.generateBasicNPS,
      advanced: this.generateAdvancedNPS,
      research: this.generateResearchNPS
    },
    'matrix': {
      basic: this.generateBasicMatrix,
      advanced: this.generateAdvancedMatrix,
      research: this.generateResearchMatrix
    },
    'ranking': {
      basic: this.generateBasicRanking,
      advanced: this.generateAdvancedRanking,
      research: this.generateResearchRanking
    },
    'file-upload': {
      basic: this.generateBasicFileUpload,
      advanced: this.generateAdvancedFileUpload,
      research: this.generateResearchFileUpload
    },
    'date-picker': {
      basic: this.generateBasicDatePicker,
      advanced: this.generateAdvancedDatePicker,
      research: this.generateResearchDatePicker
    }
  }

  // Design system themes
  private designThemes = {
    'modern-gradient': {
      colors: { primary: '#3b82f6', secondary: '#8b5cf6', accent: '#06b6d4' },
      gradients: 'from-blue-500 to-purple-600',
      shadows: 'shadow-xl',
      animations: 'transform hover:scale-105 transition-all duration-300'
    },
    'professional-blue': {
      colors: { primary: '#1e40af', secondary: '#3b82f6', accent: '#60a5fa' },
      gradients: 'from-blue-600 to-blue-800',
      shadows: 'shadow-lg',
      animations: 'hover:shadow-xl transition-shadow duration-200'
    },
    'academic-neutral': {
      colors: { primary: '#374151', secondary: '#6b7280', accent: '#9ca3af' },
      gradients: 'from-gray-600 to-gray-800',
      shadows: 'shadow-md',
      animations: 'hover:bg-gray-50 transition-colors duration-200'
    },
    'friendly-green': {
      colors: { primary: '#059669', secondary: '#10b981', accent: '#34d399' },
      gradients: 'from-green-500 to-emerald-600',
      shadows: 'shadow-lg',
      animations: 'transform hover:scale-102 transition-all duration-200'
    },
    'corporate-blue': {
      colors: { primary: '#1e3a8a', secondary: '#3b82f6', accent: '#93c5fd' },
      gradients: 'from-blue-800 to-blue-600',
      shadows: 'shadow-sm',
      animations: 'hover:shadow-md transition-shadow duration-200'
    },
    'research-purple': {
      colors: { primary: '#7c3aed', secondary: '#a855f7', accent: '#c084fc' },
      gradients: 'from-purple-600 to-violet-600',
      shadows: 'shadow-lg',
      animations: 'hover:shadow-xl transition-all duration-300'
    }
  }

  // Generate component based on sophistication level
  generateComponent(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    const complexity = this.getComplexityLevel(analysis)
    const componentType = question.type as keyof typeof this.componentTemplates
    
    if (!this.componentTemplates[componentType]) {
      return this.generateFallbackComponent(question, analysis, theme)
    }

    const generator = this.componentTemplates[componentType][complexity]
    return generator.call(this, question, analysis, theme)
  }

  private getComplexityLevel(analysis: SurveyAnalysis): 'basic' | 'advanced' | 'research' {
    if (analysis.complexity === 'academic' || analysis.complexity === 'research') return 'research'
    if (analysis.complexity === 'professional') return 'advanced'
    return 'basic'
  }

  // Advanced Text Input with real-time validation and analytics
  private generateAdvancedTextInput(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    const themeConfig = this.designThemes[theme as keyof typeof this.designThemes] || this.designThemes['modern-gradient']
    
    return `import React, { useState, useEffect } from 'react';
import { useSurveyState } from '@/features/survey';
import { motion } from 'framer-motion';

export default function AdvancedTextInput_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const [value, setValue] = useState(responses['${question.id}'] || '');
  const [isFocused, setIsFocused] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    setCharCount(value.length);
    
    // Real-time validation
    if (${question.required} && !value.trim()) {
      setValidationError('${question.validation?.messages?.required || 'This field is required'}');
    } else if (value.length < 10 && value.length > 0) {
      setValidationError('Please provide a more detailed response (minimum 10 characters)');
    } else {
      setValidationError('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    submitAnswer('${question.id}', newValue);
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'question_interaction', {
        question_id: '${question.id}',
        question_type: 'text-input',
        interaction_type: 'typing',
        value_length: newValue.length
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 p-6 bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <label 
          htmlFor="${question.id}"
          className="block text-lg font-semibold text-gray-900"
        >
          ${question.label}
          ${question.required ? '<span className="text-red-500 ml-1">*</span>' : ''}
        </label>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: charCount > 0 ? 1 : 0 }}
          className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
        >
          {charCount}
        </motion.div>
      </div>

      <div className="relative">
        <input
          id="${question.id}"
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type your response here..."
          className={\`w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none \${
            isFocused 
              ? 'border-${themeConfig.colors.primary} ring-4 ring-${themeConfig.colors.primary}/20' 
              : validationError 
                ? 'border-red-400' 
                : 'border-gray-300 hover:border-gray-400'
          }\`}
          aria-describedby="${question.id}-error ${question.id}-help"
          aria-invalid={!!validationError}
        />
        
        {/* Animated focus indicator */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isFocused ? 1 : 0 }}
          className={\`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r \${themeConfig.gradients} origin-left\`}
          style={{ width: '100%' }}
        />
      </div>

      {/* Validation feedback */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: validationError ? 1 : 0,
          height: validationError ? 'auto' : 0
        }}
        className="overflow-hidden"
      >
        <div 
          id="${question.id}-error"
          className="text-red-600 text-sm flex items-center gap-2"
          role="alert"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {validationError}
        </div>
      </motion.div>

      {/* Help text */}
      <div id="${question.id}-help" className="text-sm text-gray-600">
        ${analysis.tone === 'casual' ? 'Feel free to share your thoughts!' : 'Please provide a detailed response.'}
      </div>
    </motion.div>
  );
}`
  }

  // Research-grade Scale with advanced analytics
  private generateResearchScale(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    const themeConfig = this.designThemes[theme as keyof typeof this.designThemes] || this.designThemes['academic-neutral']
    
    return `import React, { useState, useEffect, useRef } from 'react';
import { useSurveyState } from '@/features/survey';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResearchScale_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const [value, setValue] = useState(responses['${question.id}'] || null);
  const [hoveredValue, setHoveredValue] = useState(null);
  const [interactionStartTime] = useState(Date.now());
  const [responseTime, setResponseTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Research-grade analytics
  const trackInteraction = (eventType: string, data: any) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'research_interaction', {
        question_id: '${question.id}',
        event_type: eventType,
        response_time: Date.now() - interactionStartTime,
        ...data
      });
    }
  };

  const handleSelection = (selectedValue: number) => {
    const newResponseTime = Date.now() - interactionStartTime;
    setResponseTime(newResponseTime);
    setValue(selectedValue);
    submitAnswer('${question.id}', selectedValue);
    
    trackInteraction('scale_selection', {
      selected_value: selectedValue,
      response_time_ms: newResponseTime,
      was_hovering: hoveredValue !== null
    });
  };

  const scale = { min: 1, max: 7 };
  const labels = ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 p-8 bg-white rounded-lg border border-gray-200 shadow-md"
    >
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          ${question.label}
          ${question.required ? '<span className="text-red-500 ml-1">*</span>' : ''}
        </h3>
        <p className="text-sm text-gray-600">
          Please select the option that best represents your opinion
        </p>
      </div>

      {/* Scale visualization */}
      <div className="flex justify-between items-center py-6">
        {Array.from({ length: scale.max }, (_, i) => i + 1).map((scaleValue) => (
          <motion.div
            key={scaleValue}
            className="flex flex-col items-center space-y-3 cursor-pointer group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setHoveredValue(scaleValue)}
            onMouseLeave={() => setHoveredValue(null)}
            onClick={() => handleSelection(scaleValue)}
          >
            {/* Scale number */}
            <motion.div
              className={\`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold transition-all duration-200 \${
                value === scaleValue
                  ? 'bg-${themeConfig.colors.primary} border-${themeConfig.colors.primary} text-white shadow-lg'
                  : hoveredValue === scaleValue
                    ? 'border-${themeConfig.colors.primary} text-${themeConfig.colors.primary} bg-${themeConfig.colors.primary}/10'
                    : 'border-gray-300 text-gray-600 hover:border-${themeConfig.colors.secondary}'
              }\`}
              animate={{
                scale: value === scaleValue ? 1.1 : hoveredValue === scaleValue ? 1.05 : 1,
              }}
            >
              {scaleValue}
            </motion.div>

            {/* Scale label */}
            <motion.span
              className={\`text-xs text-center max-w-20 leading-tight transition-colors duration-200 \${
                value === scaleValue || hoveredValue === scaleValue
                  ? 'text-${themeConfig.colors.primary} font-semibold'
                  : 'text-gray-500'
              }\`}
              animate={{
                opacity: value === scaleValue || hoveredValue === scaleValue ? 1 : 0.7,
              }}
            >
              {labels[scaleValue - 1]}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Visual scale bar */}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={\`h-full bg-gradient-to-r \${themeConfig.gradients} rounded-full\`}
          initial={{ width: 0 }}
          animate={{ 
            width: value ? \`\${(value / scale.max) * 100}%\` : hoveredValue ? \`\${(hoveredValue / scale.max) * 100}%\` : 0
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Research indicators */}
      ${analysis.complexity === 'academic' ? `
      <div className="flex justify-between text-xs text-gray-500 pt-2">
        <span>Response time: {responseTime > 0 ? \`\${(responseTime / 1000).toFixed(1)}s\` : '--'}</span>
        <span>Scale: 7-point Likert</span>
      </div>
      ` : ''}

      {/* Validation feedback */}
      <AnimatePresence>
        {${question.required} && !value && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3"
          >
            <div className="text-red-700 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              ${question.validation?.messages?.required || 'Please select a rating to continue'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}`
  }

  // Advanced Matrix Question with row/column validation
  private generateAdvancedMatrix(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    const themeConfig = this.designThemes[theme as keyof typeof this.designThemes] || this.designThemes['professional-blue']
    
    return `import React, { useState, useEffect } from 'react';
import { useSurveyState } from '@/features/survey';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdvancedMatrix_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const [matrixValues, setMatrixValues] = useState(responses['${question.id}'] || {});
  const [hoveredCell, setHoveredCell] = useState({ row: null, col: null });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Sample matrix data - in real implementation, this would come from question.matrix
  const matrix = {
    rows: ['Quality', 'Price', 'Service', 'Design', 'Reliability'],
    columns: ['Not Important', 'Slightly Important', 'Moderately Important', 'Very Important', 'Extremely Important']
  };

  useEffect(() => {
    // Validate matrix completion
    const errors: string[] = [];
    matrix.rows.forEach(row => {
      if (!matrixValues[row] && ${question.required}) {
        errors.push(\`Please rate: \${row}\`);
      }
    });
    setValidationErrors(errors);
    
    // Submit the complete matrix data
    submitAnswer('${question.id}', matrixValues);
  }, [matrixValues]);

  const handleCellSelect = (row: string, column: string, colIndex: number) => {
    const newValues = {
      ...matrixValues,
      [row]: { column, value: colIndex + 1 }
    };
    setMatrixValues(newValues);
    
    // Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'matrix_interaction', {
        question_id: '${question.id}',
        row_name: row,
        column_name: column,
        value: colIndex + 1
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6 p-6 bg-white rounded-xl border border-gray-200 shadow-lg"
    >
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          ${question.label}
          ${question.required ? '<span className="text-red-500 ml-1">*</span>' : ''}
        </h3>
        <p className="text-sm text-gray-600">
          Rate each item using the scale provided
        </p>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Column headers */}
          <div className="grid grid-cols-6 gap-2 mb-4">
            <div className="font-medium text-gray-700"></div>
            {matrix.columns.map((col, colIndex) => (
              <div key={col} className="text-center">
                <div className="text-sm font-medium text-gray-700 p-2 bg-gray-50 rounded-lg">
                  {col}
                </div>
              </div>
            ))}
          </div>

          {/* Matrix rows */}
          <div className="space-y-3">
            {matrix.rows.map((row, rowIndex) => (
              <motion.div
                key={row}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.1, duration: 0.4 }}
                className="grid grid-cols-6 gap-2 items-center"
              >
                {/* Row label */}
                <div className="font-medium text-gray-800 text-right pr-4">
                  {row}
                  ${question.required ? '<span className="text-red-400">*</span>' : ''}
                </div>

                {/* Rating options */}
                {matrix.columns.map((col, colIndex) => (
                  <div key={\`\${row}-\${col}\`} className="flex justify-center">
                    <motion.button
                      type="button"
                      onClick={() => handleCellSelect(row, col, colIndex)}
                      onMouseEnter={() => setHoveredCell({ row, col })}
                      onMouseLeave={() => setHoveredCell({ row: null, col: null })}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={\`w-8 h-8 rounded-full border-2 transition-all duration-200 \${
                        matrixValues[row]?.column === col
                          ? 'bg-${themeConfig.colors.primary} border-${themeConfig.colors.primary} text-white shadow-lg'
                          : hoveredCell.row === row && hoveredCell.col === col
                            ? 'border-${themeConfig.colors.primary} bg-${themeConfig.colors.primary}/20'
                            : 'border-gray-300 hover:border-${themeConfig.colors.secondary} hover:bg-gray-50'
                      }\`}
                      aria-label={\`Rate \${row} as \${col}\`}
                    >
                      {matrixValues[row]?.column === col && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2 h-2 bg-white rounded-full mx-auto"
                        />
                      )}
                    </motion.button>
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-600">
            {Object.keys(matrixValues).length} of {matrix.rows.length} completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className={\`h-2 rounded-full bg-gradient-to-r \${themeConfig.gradients}\`}
            initial={{ width: 0 }}
            animate={{ 
              width: \`\${(Object.keys(matrixValues).length / matrix.rows.length) * 100}%\`
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Validation feedback */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div className="text-red-700">
              <div className="font-medium mb-2">Please complete all required ratings:</div>
              <ul className="text-sm space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}`
  }

  // Basic implementations for other component types (simplified for brevity)
  private generateBasicTextInput(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function BasicTextInput_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['${question.id}'] || '';
  
  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border">
      <label className="block text-base font-medium text-gray-900">
        ${question.label}
        ${question.required ? '<span className="text-red-500">*</span>' : ''}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => submitAnswer('${question.id}', e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        placeholder="Enter your response..."
      />
    </div>
  );
}`
  }

  // Add other basic implementations...
  private generateBasicTextarea(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function BasicTextarea_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['${question.id}'] || '';
  
  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border">
      <label className="block text-base font-medium text-gray-900">
        ${question.label}
        ${question.required ? '<span className="text-red-500">*</span>' : ''}
      </label>
      <textarea
        value={value}
        onChange={(e) => submitAnswer('${question.id}', e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 resize-vertical"
        placeholder="Share your thoughts..."
      />
    </div>
  );
}`
  }

  private generateBasicRadio(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    const options = (question as any).options || ['Option 1', 'Option 2', 'Option 3'];
    
    return `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function BasicRadio_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['${question.id}'] || '';
  const options = ${JSON.stringify(options)};
  
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <legend className="text-base font-medium text-gray-900">
        ${question.label}
        ${question.required ? '<span className="text-red-500">*</span>' : ''}
      </legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="radio"
              name="${question.id}"
              value={option}
              checked={value === option}
              onChange={(e) => submitAnswer('${question.id}', e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-900">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}`
  }

  private generateBasicScale(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function BasicScale_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['${question.id}'] || '';
  const scale = [1, 2, 3, 4, 5];
  
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <h3 className="text-base font-medium text-gray-900">
        ${question.label}
        ${question.required ? '<span className="text-red-500">*</span>' : ''}
      </h3>
      <div className="flex justify-between">
        {scale.map((rating) => (
          <button
            key={rating}
            onClick={() => submitAnswer('${question.id}', rating)}
            className={\`w-12 h-12 rounded-full border-2 transition-colors \${
              value === rating
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-gray-300 hover:border-blue-400'
            }\`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Poor</span>
        <span>Excellent</span>
      </div>
    </div>
  );
}`
  }

  // Implement other basic methods with simple patterns...
  private generateBasicCheckbox(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    const options = (question as any).options || ['Option 1', 'Option 2', 'Option 3'];
    
    return `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function BasicCheckbox_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['${question.id}'] || [];
  const options = ${JSON.stringify(options)};
  
  const handleChange = (option: string, checked: boolean) => {
    const newValue = checked 
      ? [...value, option]
      : value.filter((v: string) => v !== option);
    submitAnswer('${question.id}', newValue);
  };
  
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <legend className="text-base font-medium text-gray-900">
        ${question.label}
        ${question.required ? '<span className="text-red-500">*</span>' : ''}
      </legend>
      <div className="space-y-2">
        {options.map((option) => (
          <label key={option} className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              value={option}
              checked={value.includes(option)}
              onChange={(e) => handleChange(option, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-gray-900">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}`;
  }

  private generateBasicRanking(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    const options = (question as any).options || ['Option 1', 'Option 2', 'Option 3'];
    
    return `import React, { useState } from 'react';
import { useSurveyState } from '@/features/survey';

export default function BasicRanking_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const [rankings, setRankings] = useState(responses['${question.id}'] || {});
  const options = ${JSON.stringify(options)};
  
  const handleRankChange = (option: string, rank: number) => {
    const newRankings = { ...rankings, [option]: rank };
    setRankings(newRankings);
    submitAnswer('${question.id}', newRankings);
  };
  
  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border">
      <h3 className="text-base font-medium text-gray-900">
        ${question.label}
        ${question.required ? '<span className="text-red-500">*</span>' : ''}
      </h3>
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={option} className="flex items-center space-x-3">
            <select
              value={rankings[option] || ''}
              onChange={(e) => handleRankChange(option, parseInt(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value="">Rank</option>
              {options.map((_, i) => (
                <option key={i} value={i + 1}>{i + 1}</option>
              ))}
            </select>
            <span className="text-gray-900">{option}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`;
  }

  private generateBasicFileUpload(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function BasicFileUpload_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      submitAnswer('${question.id}', file.name);
    }
  };
  
  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border">
      <label className="block text-base font-medium text-gray-900">
        ${question.label}
        ${question.required ? '<span className="text-red-500">*</span>' : ''}
      </label>
      <input
        type="file"
        onChange={handleFileChange}
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}`;
  }

  private generateBasicDatePicker(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function BasicDatePicker_${question.id}() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['${question.id}'] || '';
  
  return (
    <div className="space-y-3 p-4 bg-white rounded-lg border">
      <label className="block text-base font-medium text-gray-900">
        ${question.label}
        ${question.required ? '<span className="text-red-500">*</span>' : ''}
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => submitAnswer('${question.id}', e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}`;
  }

  private generateBasicNPS(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateBasicScale(question, analysis, theme);
  }

  private generateBasicMatrix(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateAdvancedMatrix(question, analysis, theme);
  }

  // Advanced versions
  private generateAdvancedTextarea(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateAdvancedTextInput(question, analysis, theme).replace('input', 'textarea').replace('type="text"', '');
  }

  private generateAdvancedRadio(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateBasicRadio(question, analysis, theme);
  }

  private generateAdvancedCheckbox(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateBasicCheckbox(question, analysis, theme);
  }

  private generateAdvancedScale(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateResearchScale(question, analysis, theme);
  }

  private generateAdvancedNPS(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateResearchScale(question, analysis, theme);
  }

  private generateAdvancedRanking(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateBasicRanking(question, analysis, theme);
  }

  private generateAdvancedFileUpload(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateBasicFileUpload(question, analysis, theme);
  }

  private generateAdvancedDatePicker(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateBasicDatePicker(question, analysis, theme);
  }

  // Research versions
  private generateResearchTextInput(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateAdvancedTextInput(question, analysis, theme);
  }

  private generateResearchTextarea(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateAdvancedTextInput(question, analysis, theme);
  }

  private generateResearchRadio(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateResearchScale(question, analysis, theme);
  }

  private generateResearchCheckbox(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateResearchScale(question, analysis, theme);
  }

  private generateResearchNPS(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateResearchScale(question, analysis, theme);
  }

  private generateResearchMatrix(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateAdvancedMatrix(question, analysis, theme);
  }

  private generateResearchRanking(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateAdvancedMatrix(question, analysis, theme);
  }

  private generateResearchFileUpload(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateAdvancedTextInput(question, analysis, theme);
  }

  private generateResearchDatePicker(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateAdvancedTextInput(question, analysis, theme);
  }

  private generateFallbackComponent(question: QuestionDefinition, analysis: SurveyAnalysis, theme: string): string {
    return this.generateBasicTextInput(question, analysis, theme)
  }
}