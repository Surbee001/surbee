// Production-ready survey component templates for AI generation
// These templates ensure consistent, high-quality components

export const SURVEY_COMPONENT_TEMPLATES = {
  'text-input': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function TextInput() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || '';
  
  return (
    <div className="space-y-3">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <input
        type="text"
        value={value}
        placeholder="{{PLACEHOLDER}}"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        onChange={(e) => updateResponse('{{COMPONENT_ID}}', e.target.value)}
        {{REQUIRED_ATTR}}
        data-analytics-component="text-input"
        data-question-id="{{COMPONENT_ID}}"
      />
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'PLACEHOLDER', 'REQUIRED_ATTR']
  },

  'textarea': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function TextArea() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || '';
  
  return (
    <div className="space-y-3">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <textarea
        value={value}
        placeholder="{{PLACEHOLDER}}"
        rows={{ROWS}}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
        onChange={(e) => updateResponse('{{COMPONENT_ID}}', e.target.value)}
        {{REQUIRED_ATTR}}
        data-analytics-component="textarea"
        data-question-id="{{COMPONENT_ID}}"
      />
      {{CHARACTER_COUNT}}
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'PLACEHOLDER', 'ROWS', 'REQUIRED_ATTR', 'CHARACTER_COUNT']
  },

  'radio': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function RadioQuestion() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || '';
  const options = {{OPTIONS_ARRAY}};
  
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              type="radio"
              name="{{COMPONENT_ID}}"
              value={option}
              checked={value === option}
              onChange={(e) => updateResponse('{{COMPONENT_ID}}', e.target.value)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2"
              {{REQUIRED_ATTR}}
              data-analytics-component="radio"
              data-question-id="{{COMPONENT_ID}}"
            />
            <label className="ml-3 text-sm text-gray-700 cursor-pointer">
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'OPTIONS_ARRAY', 'REQUIRED_ATTR']
  },

  'checkbox': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function CheckboxQuestion() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || [];
  const options = {{OPTIONS_ARRAY}};
  
  const handleChange = (option: string, checked: boolean) => {
    const newValue = checked 
      ? [...value, option]
      : value.filter((v: string) => v !== option);
    updateResponse('{{COMPONENT_ID}}', newValue);
  };
  
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <div className="space-y-3">
        {options.map((option, index) => (
          <div key={index} className="flex items-center">
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={(e) => handleChange(option, e.target.checked)}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 focus:ring-2 rounded"
              data-analytics-component="checkbox"
              data-question-id="{{COMPONENT_ID}}"
            />
            <label className="ml-3 text-sm text-gray-700 cursor-pointer">
              {option}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'OPTIONS_ARRAY']
  },

  'scale': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function ScaleQuestion() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || null;
  const min = {{MIN_VALUE}};
  const max = {{MAX_VALUE}};
  const labels = {{SCALE_LABELS}};
  
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <div className="flex justify-between items-center space-x-2">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map((num) => (
          <div key={num} className="flex flex-col items-center space-y-2">
            <input
              type="radio"
              name="{{COMPONENT_ID}}"
              value={num}
              checked={value === num}
              onChange={(e) => updateResponse('{{COMPONENT_ID}}', parseInt(e.target.value))}
              className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
              data-analytics-component="scale"
              data-question-id="{{COMPONENT_ID}}"
            />
            <span className="text-sm font-medium text-gray-900">{num}</span>
            {labels[num - min] && (
              <span className="text-xs text-gray-600 text-center max-w-20">{labels[num - min]}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'MIN_VALUE', 'MAX_VALUE', 'SCALE_LABELS']
  },

  'select': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function SelectQuestion() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || '';
  const options = {{OPTIONS_ARRAY}};
  
  return (
    <div className="space-y-3">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <select
        value={value}
        onChange={(e) => updateResponse('{{COMPONENT_ID}}', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
        {{REQUIRED_ATTR}}
        data-analytics-component="select"
        data-question-id="{{COMPONENT_ID}}"
      >
        <option value="">{{PLACEHOLDER}}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'OPTIONS_ARRAY', 'PLACEHOLDER', 'REQUIRED_ATTR']
  },

  'matrix': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function MatrixQuestion() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || {};
  const rows = {{MATRIX_ROWS}};
  const columns = {{MATRIX_COLUMNS}};
  
  const handleChange = (rowId: string, columnValue: string) => {
    updateResponse('{{COMPONENT_ID}}', { ...value, [rowId]: columnValue });
  };
  
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b border-gray-200"></th>
              {columns.map((col, index) => (
                <th key={index} className="text-center p-3 border-b border-gray-200 text-sm font-medium text-gray-700">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-gray-100">
                <td className="p-3 text-sm text-gray-900 font-medium">{row.label}</td>
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="p-3 text-center">
                    <input
                      type="radio"
                      name={\`{{COMPONENT_ID}}_\${row.id}\`}
                      value={col}
                      checked={value[row.id] === col}
                      onChange={() => handleChange(row.id, col)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      data-analytics-component="matrix"
                      data-question-id="{{COMPONENT_ID}}"
                      data-row-id={row.id}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'MATRIX_ROWS', 'MATRIX_COLUMNS']
  },

  'slider': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function SliderQuestion() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || {{DEFAULT_VALUE}};
  
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{{MIN_LABEL}}</span>
          <span className="font-medium text-lg text-gray-900">{value}</span>
          <span>{{MAX_LABEL}}</span>
        </div>
        <input
          type="range"
          min={{MIN_VALUE}}
          max={{MAX_VALUE}}
          step={{STEP_VALUE}}
          value={value}
          onChange={(e) => updateResponse('{{COMPONENT_ID}}', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          data-analytics-component="slider"
          data-question-id="{{COMPONENT_ID}}"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>{{MIN_VALUE}}</span>
          <span>{{MAX_VALUE}}</span>
        </div>
      </div>
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'MIN_VALUE', 'MAX_VALUE', 'STEP_VALUE', 'DEFAULT_VALUE', 'MIN_LABEL', 'MAX_LABEL']
  },

  'date': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function DateQuestion() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || '';
  
  return (
    <div className="space-y-3">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <input
        type="date"
        value={value}
        min="{{MIN_DATE}}"
        max="{{MAX_DATE}}"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        onChange={(e) => updateResponse('{{COMPONENT_ID}}', e.target.value)}
        {{REQUIRED_ATTR}}
        data-analytics-component="date"
        data-question-id="{{COMPONENT_ID}}"
      />
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'MIN_DATE', 'MAX_DATE', 'REQUIRED_ATTR']
  },

  'number': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function NumberQuestion() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || '';
  
  return (
    <div className="space-y-3">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <input
        type="number"
        value={value}
        min={{MIN_VALUE}}
        max={{MAX_VALUE}}
        step={{STEP_VALUE}}
        placeholder="{{PLACEHOLDER}}"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        onChange={(e) => updateResponse('{{COMPONENT_ID}}', parseFloat(e.target.value) || '')}
        {{REQUIRED_ATTR}}
        data-analytics-component="number"
        data-question-id="{{COMPONENT_ID}}"
      />
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'MIN_VALUE', 'MAX_VALUE', 'STEP_VALUE', 'PLACEHOLDER', 'REQUIRED_ATTR']
  },

  'email': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function EmailQuestion() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || '';
  
  return (
    <div className="space-y-3">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <input
        type="email"
        value={value}
        placeholder="{{PLACEHOLDER}}"
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        onChange={(e) => updateResponse('{{COMPONENT_ID}}', e.target.value)}
        {{REQUIRED_ATTR}}
        data-analytics-component="email"
        data-question-id="{{COMPONENT_ID}}"
      />
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'PLACEHOLDER', 'REQUIRED_ATTR']
  },

  'likert': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function LikertScale() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || '';
  const statements = {{STATEMENTS_ARRAY}};
  const scaleLabels = {{SCALE_LABELS}};
  
  return (
    <div className="space-y-4">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 border-b border-gray-200"></th>
              {scaleLabels.map((label, index) => (
                <th key={index} className="text-center p-3 border-b border-gray-200 text-sm font-medium text-gray-700">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statements.map((statement, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="p-3 text-sm text-gray-900">{statement}</td>
                {scaleLabels.map((label, labelIndex) => (
                  <td key={labelIndex} className="p-3 text-center">
                    <input
                      type="radio"
                      name={\`{{COMPONENT_ID}}_\${index}\`}
                      value={label}
                      checked={value[\`statement_\${index}\`] === label}
                      onChange={() => {
                        const newValue = { ...value, [\`statement_\${index}\`]: label };
                        updateResponse('{{COMPONENT_ID}}', newValue);
                      }}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      data-analytics-component="likert"
                      data-question-id="{{COMPONENT_ID}}"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'STATEMENTS_ARRAY', 'SCALE_LABELS']
  },

  'file-upload': {
    template: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function FileUpload() {
  const { updateResponse, responses } = useSurveyState();
  const value = responses['{{COMPONENT_ID}}'] || null;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateResponse('{{COMPONENT_ID}}', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
    }
  };
  
  return (
    <div className="space-y-3">
      <label className="block text-lg font-medium text-gray-900">
        {{QUESTION_LABEL}}{{REQUIRED_ASTERISK}}
      </label>
      {{HELPER_TEXT}}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          accept="{{ACCEPTED_TYPES}}"
          onChange={handleFileChange}
          className="hidden"
          id="{{COMPONENT_ID}}_file"
          {{REQUIRED_ATTR}}
          data-analytics-component="file-upload"
          data-question-id="{{COMPONENT_ID}}"
        />
        <label 
          htmlFor="{{COMPONENT_ID}}_file" 
          className="cursor-pointer flex flex-col items-center space-y-2"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <span className="text-sm text-gray-600">
            {value ? value.name : 'Click to upload or drag and drop'}
          </span>
          <span className="text-xs text-gray-500">{{FILE_TYPES_DESCRIPTION}}</span>
        </label>
      </div>
    </div>
  );
}`,
    variables: ['COMPONENT_ID', 'QUESTION_LABEL', 'REQUIRED_ASTERISK', 'HELPER_TEXT', 'ACCEPTED_TYPES', 'FILE_TYPES_DESCRIPTION', 'REQUIRED_ATTR']
  }
};

// Helper function to generate component code from templates
export function generateComponentFromTemplate(
  type: string, 
  componentId: string, 
  label: string, 
  props: Record<string, any> = {},
  required: boolean = false
): string {
  const template = SURVEY_COMPONENT_TEMPLATES[type as keyof typeof SURVEY_COMPONENT_TEMPLATES];
  if (!template) {
    throw new Error(`Unknown component type: ${type}`);
  }

  let code = template.template;
  
  // Replace standard variables
  code = code.replace(/\{\{COMPONENT_ID\}\}/g, componentId);
  code = code.replace(/\{\{QUESTION_LABEL\}\}/g, label);
  code = code.replace(/\{\{REQUIRED_ASTERISK\}\}/g, required ? ' *' : '');
  code = code.replace(/\{\{REQUIRED_ATTR\}\}/g, required ? 'required' : '');
  
  // Replace helper text
  const helperText = props.helperText 
    ? `<p className="text-sm text-gray-600">${props.helperText}</p>`
    : '';
  code = code.replace(/\{\{HELPER_TEXT\}\}/g, helperText);
  
  // Replace type-specific variables
  if (type === 'textarea') {
    code = code.replace(/\{\{ROWS\}\}/g, props.rows?.toString() || '4');
    code = code.replace(/\{\{CHARACTER_COUNT\}\}/g, 
      props.maxLength ? `<div className="text-right text-xs text-gray-500">{value.length}/${props.maxLength}</div>` : ''
    );
  }
  
  if (type === 'radio' || type === 'checkbox' || type === 'select') {
    code = code.replace(/\{\{OPTIONS_ARRAY\}\}/g, JSON.stringify(props.options || []));
  }
  
  if (type === 'scale') {
    code = code.replace(/\{\{MIN_VALUE\}\}/g, props.min?.toString() || '1');
    code = code.replace(/\{\{MAX_VALUE\}\}/g, props.max?.toString() || '5');
    code = code.replace(/\{\{SCALE_LABELS\}\}/g, JSON.stringify(props.labels || []));
  }
  
  if (type === 'slider') {
    code = code.replace(/\{\{MIN_VALUE\}\}/g, props.min?.toString() || '0');
    code = code.replace(/\{\{MAX_VALUE\}\}/g, props.max?.toString() || '100');
    code = code.replace(/\{\{STEP_VALUE\}\}/g, props.step?.toString() || '1');
    code = code.replace(/\{\{DEFAULT_VALUE\}\}/g, props.defaultValue?.toString() || props.min?.toString() || '0');
    code = code.replace(/\{\{MIN_LABEL\}\}/g, props.minLabel || 'Low');
    code = code.replace(/\{\{MAX_LABEL\}\}/g, props.maxLabel || 'High');
  }
  
  if (type === 'matrix') {
    code = code.replace(/\{\{MATRIX_ROWS\}\}/g, JSON.stringify(props.rows || []));
    code = code.replace(/\{\{MATRIX_COLUMNS\}\}/g, JSON.stringify(props.columns || []));
  }
  
  if (type === 'file-upload') {
    code = code.replace(/\{\{ACCEPTED_TYPES\}\}/g, props.acceptedTypes || '*/*');
    code = code.replace(/\{\{FILE_TYPES_DESCRIPTION\}\}/g, props.fileTypesDescription || 'Any file type');
  }
  
  if (type === 'date') {
    code = code.replace(/\{\{MIN_DATE\}\}/g, props.minDate || '');
    code = code.replace(/\{\{MAX_DATE\}\}/g, props.maxDate || '');
  }
  
  if (type === 'number') {
    code = code.replace(/\{\{MIN_VALUE\}\}/g, props.min?.toString() || '');
    code = code.replace(/\{\{MAX_VALUE\}\}/g, props.max?.toString() || '');
    code = code.replace(/\{\{STEP_VALUE\}\}/g, props.step?.toString() || '1');
  }
  
  // Replace placeholder
  code = code.replace(/\{\{PLACEHOLDER\}\}/g, props.placeholder || `Enter your ${type === 'email' ? 'email address' : 'response'}...`);
  
  return code;
}

// Available component types for AI to choose from
export const AVAILABLE_COMPONENT_TYPES = [
  'text-input',
  'textarea', 
  'radio',
  'checkbox',
  'scale',
  'select',
  'matrix',
  'slider',
  'date',
  'number',
  'email',
  'likert',
  'file-upload'
];
