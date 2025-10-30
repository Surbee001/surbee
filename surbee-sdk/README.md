# Surbee SDK

Official SDK for Surbee - AI-powered survey generation with multi-provider support.

Generate professional TypeScript React survey components using state-of-the-art AI models (GPT-5, Grok, Claude) with a simple, intuitive API.

## Features

- 🤖 **AI-Powered Generation** - Generate complete survey components from natural language prompts
- 🔧 **Multi-Provider Support** - Works with OpenAI, xAI Grok, Anthropic Claude, and more
- 📊 **Accuracy Detection** - Built-in response quality analysis (ML model coming soon)
- 🎨 **Customizable Output** - Generate TypeScript/JavaScript React components or JSON configs
- 🛠️ **Programmatic Tools** - Build surveys without AI using helper functions
- ⚡ **Streaming Support** - Real-time generation updates with SSE
- 🔑 **Flexible Auth** - Use Surbee Platform API or bring your own API keys (BYOK)

## Installation

```bash
npm install surbee-sdk
```

## Quick Start

### Using Surbee Platform API (Recommended)

```typescript
import { createClient } from 'surbee-sdk';

const client = createClient({
  apiKey: 'surbee_your_api_key_here' // Get from console.surbee.com
});

const result = await client.surveys.generate(
  'Create a customer satisfaction survey for a SaaS product'
);

console.log(result.code); // Generated TypeScript React component
```

### Using Your Own API Keys (BYOK)

```typescript
import { createClient } from 'surbee-sdk';

const client = createClient({
  apiKey: 'surbee_platform_key',
  providerKeys: {
    openai: process.env.OPENAI_API_KEY,
    xai: process.env.XAI_API_KEY
  },
  defaultProvider: 'gpt-5'
});

const result = await client.surveys.generate(
  'Create an employee feedback survey',
  { provider: 'gpt-5' }
);
```

## Usage Examples

### Generate a Survey

```typescript
const result = await client.surveys.generate(
  'Create a Net Promoter Score survey with 3 follow-up questions',
  {
    format: 'tsx_component',      // or 'react_component', 'json_config'
    framework: 'next',             // or 'react', 'remix'
    language: 'typescript',        // or 'javascript'
    reasoningEffort: 'high',       // or 'low', 'medium'
    componentLibrary: 'shadcn'     // or 'mui', 'chakra', 'none'
  }
);

// Access generated code
console.log(result.code);

// View metadata
console.log(result.metadata);
// {
//   provider: 'openai',
//   model: 'gpt-5',
//   generationTime: 3421,
//   tokensUsed: 2150
// }

// See reasoning steps (if available)
if (result.reasoning) {
  console.log('AI reasoning:', result.reasoning);
}
```

### Build Survey Programmatically

```typescript
import { createSurvey, question, content, themes } from 'surbee-sdk';

const survey = createSurvey('Customer Feedback')
  .theme(themes.modern)
  .addPage('intro', [
    content('welcome', '<h2>Welcome!</h2>'),
    question.text('name', 'What is your name?', { required: true }),
    question.email('email', 'Your email address')
  ])
  .addPage('feedback', [
    question.rating('satisfaction', 'How satisfied are you?', { scale: 5 }),
    question.multiSelect('features', 'Which features do you use?', [
      'Dashboard',
      'Analytics',
      'Reporting'
    ])
  ])
  .addBranchRule('satisfaction', { in: ['1', '2'] }, 'followup')
  .build();

console.log(survey);
```

### Accuracy Detection

```typescript
// Create detector
const detector = client.accuracy.create({
  surveyId: 'survey_123',
  events: ['mouseMovement', 'timeTracking', 'focusLoss'],
  sensitivity: 'high'
});

// Generate tracking script
const script = detector.generateTrackingScript();
// Embed this in your survey HTML

// Analyze responses
const analysis = await client.accuracy.analyze('survey_123', {
  answers: { q1: 'Yes', q2: 'Very satisfied' },
  questionTimes: [3000, 4500, 2000],
  mouseData: [/* movement data */]
});

console.log(`Quality score: ${analysis.score}/100`);
console.log(`Confidence: ${analysis.confidence}`);
console.log('Flags:', analysis.flags);
```

## API Reference

### `createClient(config: SurbeeConfig)`

Create a new Surbee SDK client.

**Config Options:**
- `apiKey` (string, required) - Surbee Platform API key
- `providerKeys` (object, optional) - Direct provider API keys for BYOK mode
  - `openai` - OpenAI API key
  - `xai` - xAI (Grok) API key
  - `anthropic` - Anthropic (Claude) API key
- `baseUrl` (string, optional) - Custom Surbee API base URL
- `defaultProvider` (string, optional) - Default AI provider ('auto', 'gpt-5', 'grok', etc.)
- `enableCaching` (boolean, optional) - Enable response caching
- `timeout` (number, optional) - Request timeout in milliseconds

### `client.surveys.generate(prompt, options)`

Generate a survey from a text prompt.

**Parameters:**
- `prompt` (string) - Natural language description of the survey
- `options` (GenerateOptions, optional)
  - `format` - Output format ('tsx_component', 'react_component', 'json_config')
  - `provider` - AI provider to use ('auto', 'gpt-5', 'gpt-4o', 'grok', 'claude')
  - `streaming` - Enable streaming (boolean)
  - `reasoningEffort` - Reasoning level ('low', 'medium', 'high')
  - `framework` - Target framework ('react', 'next', 'remix')
  - `language` - Code language ('typescript', 'javascript')
  - `componentLibrary` - UI library ('shadcn', 'mui', 'chakra', 'none')

**Returns:** `Promise<GenerateResult>`

### `client.accuracy.create(options)`

Create an accuracy detector for tracking response quality.

**Parameters:**
- `surveyId` (string) - Survey identifier
- `events` (array) - Events to track: 'mouseMovement', 'keyboardInput', 'timeTracking', 'focusLoss', 'scrollBehavior', 'clickPattern'
- `sensitivity` (string, optional) - Detection sensitivity ('low', 'medium', 'high')

**Returns:** `AccuracyDetector`

### `client.accuracy.analyze(surveyId, responseData)`

Analyze response accuracy.

**Parameters:**
- `surveyId` (string) - Survey identifier
- `responseData` (object) - Response and tracking data

**Returns:** `Promise<AccuracyScore>`

## Helper Functions

### Question Builders

```typescript
import { question } from 'surbee-sdk';

question.text(id, label, options)
question.longText(id, label, options)
question.singleSelect(id, label, optionsList, options)
question.multiSelect(id, label, optionsList, options)
question.rating(id, label, { scale: 5, ...options })
question.nps(id, label, options)
question.email(id, label, options)
question.phone(id, label, options)
question.date(id, label, options)
```

### Content Blocks

```typescript
import { content } from 'surbee-sdk';

content(id, '<h1>HTML content here</h1>')
```

### Themes

```typescript
import { themes } from 'surbee-sdk';

themes.modern    // Clean, modern design
themes.dark      // Dark mode theme
themes.minimal   // Minimalist design
themes.colorful  // Vibrant, colorful theme
```

### Validation

```typescript
import { validateSurvey } from 'surbee-sdk';

const validation = validateSurvey(surveySpec);
if (!validation.valid) {
  console.error(validation.errors);
}
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions.

```typescript
import {
  SurbeeClient,
  GenerateOptions,
  GenerateResult,
  SurveySpec,
  QuestionBlock,
  AccuracyScore
} from 'surbee-sdk';
```

## Examples

Check the `/examples` directory for complete working examples:

- `basic.ts` - Simple survey generation
- `byok.ts` - Using your own API keys
- `programmatic.ts` - Building surveys without AI
- `accuracy.ts` - Response quality tracking

## Getting API Keys

### Surbee Platform API Key

1. Visit [console.surbee.com](https://console.surbee.com)
2. Sign up or log in
3. Navigate to "API Keys" section
4. Generate a new API key
5. Copy and use in your SDK config

### Provider API Keys (BYOK)

- **OpenAI**: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
- **xAI (Grok)**: [console.x.ai](https://console.x.ai)
- **Anthropic**: [console.anthropic.com](https://console.anthropic.com)

## Pricing

When using Surbee Platform API:
- **Free Tier**: 10 generations/month
- **Pro Tier**: $29/month - 500 generations/month
- **Enterprise**: Custom pricing

When using BYOK mode, you pay your provider directly (no Surbee fees).

## Support

- 📖 **Documentation**: [docs.surbee.com](https://docs.surbee.com)
- 💬 **Discord**: [discord.gg/surbee](https://discord.gg/surbee)
- 🐛 **Issues**: [github.com/surbee/surbee-sdk/issues](https://github.com/surbee/surbee-sdk/issues)
- 📧 **Email**: support@surbee.com

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please read our contributing guidelines first.

---

Made with ❤️ by the Surbee team
