# Quick Reference - SERBI Survey Scraper

## One-Command Start

```bash
cd scripts/survey-scraper
npm run pipeline
```

This scrapes high-value examples and processes them immediately.

## Common Commands

### Scraping

```bash
# Quick start (recommended first run)
npm run quick-start

# Scrape everything
npm run scrape:all

# Scrape by domain
npm run scrape:healthcare
npm run scrape:finance
npm run scrape:hr
npm run scrape:engineering
npm run scrape:academic

# Scrape survey platforms
npm run scrape:platforms

# Custom URL
npm run scrape url "https://example.com/survey" category_name
```

### Data Processing

```bash
# Process scraped data into training examples
npm run process

# Generate Mistral-specific format
npm run process:mistral

# Do both
npm run process:all

# Complete pipeline (scrape + process)
npm run pipeline
```

## File Locations

```
scripts/survey-scraper/
├── config.ts              # API key, schema, target URLs
├── scraper.ts             # Main scraping logic
├── data-processor.ts      # Training data generator
├── quick-start.ts         # Quick start script
└── data/
    ├── scraped-surveys/   # Raw scraped data
    │   ├── typeform/
    │   ├── healthcare/
    │   ├── finance/
    │   └── ...
    └── training-datasets/ # Processed training data
        ├── complete-dataset.json
        ├── mistral-training-dataset.jsonl  ⭐ Use this for training
        └── processing-report.json
```

## Key Configuration

Edit `config.ts` to:
- Add new URLs to scrape
- Modify the extraction schema
- Adjust rate limiting
- Change API settings

## What Gets Scraped

### Survey Platforms
- TypeForm - Beautiful UI/UX
- SurveyMonkey - Professional templates
- Google Forms - Simple design patterns
- JotForm - Diverse form types

### Domains
- **Healthcare**: PHQ-9, GAD-7, clinical scales
- **Finance**: Wellness assessments, compliance forms
- **HR**: 360-reviews, multi-rater feedback
- **Engineering**: Safety protocols, technical assessments
- **Academic**: Psychometric scales, research questionnaires

### Best Practices
- Survey design principles
- UX patterns
- Question writing guidelines
- Logic and branching examples

## Output Formats

### Raw Data
Each scraped survey includes:
- Survey basics (title, purpose, industry)
- Questions with types and options
- Skip logic and branching rules
- Survey structure and sections
- UI design patterns
- UX best practices
- Domain-specific elements
- Scoring and analytics
- Accessibility features

### Training Dataset
Converted into instruction-tuning format:
```json
{
  "instruction": "Create a survey...",
  "input": "{ requirements }",
  "output": "{ complete survey }",
  "metadata": { category, source, complexity }
}
```

### Mistral Format
Ready-to-use conversational format:
```json
{
  "messages": [
    {"role": "system", "content": "You are SERBI..."},
    {"role": "user", "content": "Create a survey..."},
    {"role": "assistant", "content": "{ survey data }"}
  ]
}
```

## Training SERBI

Use the Mistral format dataset:
```bash
# Location
data/training-datasets/mistral-training-dataset.jsonl

# Upload to Mistral API or use locally
```

## Typical Workflow

1. **Initial scrape** → `npm run quick-start`
2. **Check results** → `ls data/scraped-surveys/`
3. **Add more data** → `npm run scrape:healthcare`
4. **Process** → `npm run process:all`
5. **Review** → `cat data/training-datasets/processing-report.json`
6. **Train** → Use `mistral-training-dataset.jsonl`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Rate limited | Increase delay in `config.ts` |
| No data extracted | Check URL accessibility, try different schema |
| PDF parsing fails | Check markdown output, consider manual entry |
| Missing categories | Add URLs to `config.ts` |

## Adding New URLs

```typescript
// In config.ts
export const TARGET_URLS = {
  your_category: [
    'https://example.com/survey1',
    'https://example.com/survey2',
  ]
};
```

Then scrape:
```bash
npm run scrape category your_category
```

## API Key

Located in `config.ts`:
```typescript
export const FIRECRAWL_API_KEY = 'fc-516e1455c6e34c2ab73faa9cd54ed409';
```

## Rate Limits

Configured to:
- 10 requests per minute
- 6 second delay between requests
- 3 retry attempts
- 10 second retry delay

Modify in `config.ts` if needed.

## Next Steps

1. Run `npm run pipeline`
2. Check `data/training-datasets/processing-report.json`
3. Review quality of examples
4. Add more URLs if needed
5. Use `mistral-training-dataset.jsonl` for training

## Documentation

- Full guide: `README.md`
- Getting started: `GETTING-STARTED.md`
- This reference: `QUICK-REFERENCE.md`
