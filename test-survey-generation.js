// Quick test of survey generation
const { AdvancedComponentGenerator } = require('./src/lib/ai/advanced-component-generator.ts');

const generator = new AdvancedComponentGenerator();

// Test question definitions
const testQuestions = [
  {
    id: 'q1',
    type: 'text-input',
    label: 'What is your name?',
    required: true,
    validation: { rules: ['required'], messages: {} },
    logic: {},
    analytics: { trackingEvents: ['view'] }
  },
  {
    id: 'q2', 
    type: 'checkbox',
    label: 'Select your favorite colors',
    required: false,
    validation: { rules: [], messages: {} },
    logic: {},
    analytics: { trackingEvents: ['view'] }
  },
  {
    id: 'q3',
    type: 'ranking',
    label: 'Rank these items',
    required: true,
    validation: { rules: ['required'], messages: {} },
    logic: {},
    analytics: { trackingEvents: ['view'] }
  }
];

const testAnalysis = {
  surveyType: 'user-research',
  complexity: 'simple',
  targetAudience: 'general-public',
  industry: 'technology',
  objectives: ['Test survey'],
  estimatedLength: 'short',
  dataTypes: ['mixed'],
  specialRequirements: [],
  tone: 'casual',
  urgency: 'standard'
};

console.log('Testing component generation...');

testQuestions.forEach(question => {
  try {
    console.log(`\n=== Testing ${question.type} ===`);
    const component = generator.generateComponent(question, testAnalysis, 'modern-gradient');
    console.log('✅ Success - Component generated');
    console.log(`Length: ${component.length} characters`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
});

console.log('\nComponent generation test complete!');