# Surbee SDK - Quick Start Guide

Get started with Surbee SDK in 5 minutes.

## Installation

```bash
npm install surbee-sdk
```

## Step 1: Get Your API Key

Visit [console.surbee.com](https://console.surbee.com) and:
1. Sign up or log in
2. Go to "API Keys" section
3. Generate a new API key
4. Copy the key (starts with `surbee_`)

## Step 2: Basic Usage

Create a file `generate-survey.ts`:

```typescript
import { createClient } from 'surbee-sdk';

const client = createClient({
  apiKey: 'surbee_your_api_key_here'
});

async function main() {
  const result = await client.surveys.generate(
    'Create a customer satisfaction survey for a SaaS product with 5 questions'
  );

  console.log(result.code);
}

main();
```

Run it:

```bash
npx tsx generate-survey.ts
```

## Step 3: Save Generated Component

```typescript
import { createClient } from 'surbee-sdk';
import fs from 'fs';

const client = createClient({
  apiKey: 'surbee_your_api_key_here'
});

async function main() {
  const result = await client.surveys.generate(
    'Create an employee feedback survey',
    {
      format: 'tsx_component',
      framework: 'next',
      componentLibrary: 'shadcn'
    }
  );

  // Save to file
  fs.writeFileSync('Survey.tsx', result.code);
  console.log('Survey component saved to Survey.tsx');
}

main();
```

## Step 4: Use in Your App

Now you can import and use the generated component:

```tsx
// In your Next.js app
import Survey from './Survey';

export default function SurveyPage() {
  return (
    <div>
      <h1>Customer Survey</h1>
      <Survey />
    </div>
  );
}
```

## Advanced: Programmatic Building

Build surveys without AI:

```typescript
import { createSurvey, question, themes } from 'surbee-sdk';

const survey = createSurvey('Quick Feedback')
  .theme(themes.modern)
  .addPage('main', [
    question.rating('satisfaction', 'How satisfied are you?', { scale: 5 }),
    question.text('feedback', 'Any comments?')
  ])
  .build();

console.log(JSON.stringify(survey, null, 2));
```

## Advanced: BYOK Mode

Use your own AI provider keys:

```typescript
import { createClient } from 'surbee-sdk';

const client = createClient({
  apiKey: 'surbee_platform_key',
  providerKeys: {
    openai: process.env.OPENAI_API_KEY
  },
  defaultProvider: 'gpt-5'
});

// Generate with specific provider
const result = await client.surveys.generate(
  'Create an NPS survey',
  { provider: 'gpt-5' }
);
```

## Next Steps

- Read the full [README](./README.md) for all features
- Check out [examples](./examples/) for more use cases
- Visit [docs.surbee.com](https://docs.surbee.com) for detailed guides

## Troubleshooting

### "Missing Authorization header"

Make sure you're passing a valid API key:

```typescript
const client = createClient({
  apiKey: 'surbee_your_api_key_here' // Must start with 'surbee_'
});
```

### "No AI providers available"

In BYOK mode, ensure you have valid provider API keys:

```typescript
const client = createClient({
  providerKeys: {
    openai: process.env.OPENAI_API_KEY // Make sure this is set
  }
});
```

### "Rate limit exceeded"

You've hit your plan's generation limit. Upgrade at [console.surbee.com](https://console.surbee.com).

## Support

- Discord: [discord.gg/surbee](https://discord.gg/surbee)
- Email: support@surbee.com
- Issues: [github.com/surbee/surbee-sdk/issues](https://github.com/surbee/surbee-sdk/issues)
