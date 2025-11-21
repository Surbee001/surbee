# SERBI Survey Data Scraper

Comprehensive data extraction system for training SERBI to understand perfect survey design across all domains and use cases.

## What This Scrapes

### 🎨 Survey Platforms (UI/UX Excellence)
- **TypeForm**: Beautiful, conversational survey designs
- **SurveyMonkey**: Professional templates and best practices
- **Google Forms**: Simple, accessible design patterns
- **JotForm**: Diverse form types and layouts

### 🏥 Healthcare & Clinical
- PHQ-9 (Depression screening)
- GAD-7 (Anxiety assessment)
- Validated psychometric scales
- Clinical trial questionnaires
- Patient outcome measures

### 💼 HR & Employee Assessment
- 360-degree feedback surveys
- Multi-rater assessments
- Employee engagement surveys
- Performance reviews

### 💰 Finance & Accounting
- Financial wellness assessments
- Multi-stage logic surveys
- Compliance questionnaires

### 🔧 Engineering & Safety
- Technical skill assessments
- Safety protocol evaluations
- Product testing surveys

### 🎓 Academic Research
- Psychometric scales
- Longitudinal study designs
- Factor analysis questionnaires
- Reverse-coded items

### 📚 Best Practices & Guidelines
- Survey design principles
- UX best practices
- Question writing tips
- Logic and branching patterns

## Installation

```bash
cd scripts/survey-scraper
npm install
```

## Quick Start

### Option 1: Comprehensive Dataset (Recommended)
```bash
npm run scrape:all      # Scrapes all 100+ sources (60-90 min)
# Wait for completion, then:
npm run build-master    # Builds master training dataset
```

### Option 2: Quick Test Run
```bash
npm run quick-start     # High-value examples only (~15 min)
npm run build-master    # Process into training dataset
```

The quick start will scrape:
- TypeForm templates (best UI/UX)
- Healthcare validated scales
- HR 360-review examples
- Best practices guides

## Usage

### Scrape Everything
```bash
npm run scrape:all
```

### Scrape by Category

```bash
# Survey platforms
npm run scrape:platforms

# Healthcare surveys
npm run scrape:healthcare

# HR & 360 reviews
npm run scrape:hr

# Financial wellness
npm run scrape:finance

# Engineering assessments
npm run scrape:engineering

# Academic research
npm run scrape:academic

# Best practices
npm run scrape:best-practices
```

### Scrape Custom URL

```bash
npm run scrape url "https://example.com/survey" category_name
```

### Scrape Specific Categories

```bash
npm run scrape category typeform healthcare finance
```

## Output Structure

```
data/
└── scraped-surveys/
    ├── typeform/
    │   ├── survey_1.json
    │   └── survey_2.json
    ├── healthcare/
    │   ├── phq9_survey.json
    │   └── gad7_survey.json
    ├── hr_360_review/
    ├── finance/
    ├── engineering/
    ├── academic/
    └── scrape-log.json
```

## Data Schema

Each scraped survey includes:

### Survey Basics
- Title, description, purpose
- Target industry & audience
- Completion time estimate
- Use case information

### Questions
- Question text & type
- Response options with scoring
- Validation rules
- Conditional logic
- Scale details (Likert, rating, etc.)
- Matrix configurations
- Help text & placeholders

### Skip Logic & Branching
- Conditional rules
- Trigger conditions
- Actions and targets
- Complex logic patterns

### Survey Structure
- Section organization
- Question ordering
- Branching patterns
- Randomization rules
- Piping logic

### UI Design Patterns
- Layout styles
- Visual design elements
- Progress indicators
- Mobile optimization
- Color schemes
- Typography
- Button styles
- Animations

### UX Best Practices
- Observed patterns
- Implementation details
- User experience optimizations

### Domain-Specific Elements
- Validated scales (PHQ-9, GAD-7, etc.)
- Compliance requirements (HIPAA, etc.)
- Industry terminology
- Specialized question types

### Scoring & Analytics
- Scoring methods
- Result categories
- Interpretation guidance

### Accessibility Features
- WCAG compliance
- Screen reader support
- Keyboard navigation

## Rate Limiting

The scraper includes built-in rate limiting:
- Maximum 10 requests per minute
- 6-second delay between requests
- Automatic retry on failure
- Configurable in `config.ts`

## Adding New URLs

Edit `config.ts` and add URLs to the appropriate category:

```typescript
export const TARGET_URLS = {
  your_category: [
    'https://example.com/survey1',
    'https://example.com/survey2',
  ]
};
```

## Monitoring Progress

The scraper provides real-time progress updates:
- Current URL being scraped
- Success/failure status
- Saved file locations
- Summary report at completion

Check `data/scraped-surveys/scrape-log.json` for detailed results.

## Tips for Best Results

1. **Start with quick-start**: Get high-quality samples fast
2. **Scrape by category**: Focus on specific domains as needed
3. **Review the log**: Check for failed URLs and retry if needed
4. **Expand URL list**: Add more sources as you find them
5. **Customize schema**: Modify `SURVEY_SCHEMA` in config.ts for specific needs

## Training SERBI

Once you have scraped data:

1. **Review the JSON files** in `data/scraped-surveys/`
2. **Combine datasets** from multiple categories
3. **Format for Mistral fine-tuning** using their data format
4. **Include diverse examples** across all domains
5. **Balance the dataset** between general and domain-specific surveys

## Troubleshooting

### API Rate Limits
If you hit rate limits, increase the delay in `config.ts`:
```typescript
delayBetweenRequests: 10000, // 10 seconds instead of 6
```

### Failed Scrapes
Check `scrape-log.json` for error details. Common issues:
- URL no longer exists
- Page requires authentication
- Content behind paywall
- PDF parsing issues

### Schema Issues
If the extracted data doesn't match expectations:
1. Check the raw markdown output
2. Adjust the schema in `config.ts`
3. Add more specific field descriptions

## API Key

The FireCrawl API key is configured in `config.ts`. If you need to rotate keys:

```typescript
export const FIRECRAWL_API_KEY = 'your-new-key-here';
```

## Next Steps

After scraping:
1. **Analyze the data**: Look for patterns and best practices
2. **Curate high-quality examples**: Not all scraped data will be perfect
3. **Augment with manual examples**: Add edge cases manually if needed
4. **Format for training**: Convert to Mistral's expected format
5. **Validate results**: Test SERBI's outputs after training

## Support

For issues or questions:
- Check FireCrawl API documentation: https://docs.firecrawl.dev/
- Review the scrape-log.json for error details
- Verify URL accessibility manually
