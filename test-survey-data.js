// Test data to verify enhanced renderer is working
const testSurveyData = {
  survey: {
    id: 'test-survey',
    title: 'Test Survey',
    description: 'This is a test to verify the enhanced renderer works',
    pages: [
      {
        id: 'page_1',
        name: 'Test Page',
        title: 'Questions',
        position: 1,
        components: [
          {
            id: 'q1',
            type: 'text-input',
            label: 'What is your name?',
            required: true,
            position: 1,
            pageId: 'page_1'
          }
        ]
      }
    ],
    theme: {
      primaryColor: '#171717',
      secondaryColor: '#8a8a8a',
      backgroundColor: '#ffffff',
      textColor: '#171717',
      fontFamily: 'Inter, sans-serif',
      borderRadius: 8,
      spacing: 16,
      animations: true
    },
    settings: { showProgress: true, allowBack: true },
    analytics: {},
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      creatorId: 'test-user',
      version: '1.0',
      originalPrompt: 'Create a test survey',
      tags: []
    }
  },
  components: [
    {
      id: 'q1',
      name: 'TestInput',
      type: 'text-input',
      code: `import React from 'react';
import { useSurveyState } from '@/features/survey';

export default function TestInput() {
  const { submitAnswer, responses } = useSurveyState();
  const value = responses['q1'] || '';
  
  return (
    <div className="space-y-3 p-6 bg-white rounded-lg border border-gray-200">
      <label className="block text-lg font-medium text-gray-900">
        What is your name? <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={value}
        placeholder="Enter your name..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        onChange={(e) => submitAnswer('q1', e.target.value)}
      />
    </div>
  );
}`,
      dependencies: ['react']
    }
  ],
  designSystem: {
    colors: {
      primary: '#171717',
      secondary: '#8a8a8a',
      background: '#ffffff',
      text: '#171717'
    }
  },
  validationRules: {
    global: {},
    perComponent: {
      q1: {
        rules: ['required'],
        errorMessages: {
          required: 'Please enter your name'
        }
      }
    }
  },
  analyticsConfig: {
    events: [],
    accuracyChecks: []
  },
  followUpSuggestions: [
    {
      id: 'test-suggestion',
      text: 'Add more questions to gather additional information',
      action: 'add_question',
      priority: 'medium'
    }
  ]
};

console.log('Test survey data structure:');
console.log(JSON.stringify(testSurveyData, null, 2));