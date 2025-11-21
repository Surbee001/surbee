# Getting Started with SERBI Survey Data Scraper

## Complete Workflow

### Step 1: Install Dependencies

```bash
cd scripts/survey-scraper
npm install
```

### Step 2: Quick Start (Recommended)

Run the quick-start pipeline to scrape high-value examples and process them immediately:

```bash
npm run pipeline
```

This will:
1. Scrape TypeForm, healthcare, HR, and best practices examples
2. Process them into training datasets
3. Generate Mistral-formatted output

**Expected time**: 10-15 minutes

### Step 3: Review the Data

Check your results:

```bash
# Raw scraped data
ls data/scraped-surveys/

# Processed training datasets
ls data/training-datasets/

# View the processing report
cat data/training-datasets/processing-report.json
```

## Advanced Usage

### Full Dataset Collection

To scrape everything (⚠️ This will take 1-2 hours):

```bash
npm run scrape:all
```

### Scrape by Domain

Focus on specific areas:

```bash
# Healthcare surveys (PHQ-9, GAD-7, etc.)
npm run scrape:healthcare

# Financial wellness assessments
npm run scrape:finance

# Engineering & safety surveys
npm run scrape:engineering

# HR 360-degree reviews
npm run scrape:hr

# Academic research scales
npm run scrape:academic
```

### Custom URL Scraping

Scrape a specific survey:

```bash
npm run scrape url "https://example.com/survey-template" healthcare
```

### Process Data After Scraping

After scraping, process the data:

```bash
# Process into training examples
npm run process

# Generate Mistral format
npm run process:mistral

# Do both
npm run process:all
```

## Understanding the Output

### Raw Scraped Data

Location: `data/scraped-surveys/[category]/`

Each file contains:
- `metadata`: Source URL, category, timestamp
- `data.json`: Structured survey data matching our schema
- `data.markdown`: Human-readable content
- `data.branding`: Visual branding information

Example structure:
```json
{
  "metadata": {
    "source_url": "https://...",
    "category": "healthcare",
    "scraped_at": "2025-01-05T..."
  },
  "data": {
    "json": {
      "survey_basics": { ... },
      "questions": [ ... ],
      "skip_logic_and_branching": [ ... ],
      "ui_design_patterns": { ... }
    }
  }
}
```

### Training Datasets

Location: `data/training-datasets/`

Files generated:
- `complete-dataset.json`: All training examples combined
- `dataset-[category].json`: Category-specific datasets
- `mistral-training-dataset.jsonl`: Mistral-ready format
- `processing-report.json`: Statistics and analysis

Training example format:
```json
{
  "instruction": "Create a survey based on these requirements",
  "input": "{ industry: healthcare, use_case: patient screening }",
  "output": "{ complete survey structure }",
  "metadata": {
    "category": "healthcare",
    "source": "https://...",
    "complexity": "high"
  }
}
```

### Mistral Format

The `.jsonl` file contains training data in Mistral's conversational format:

```json
{
  "messages": [
    {
      "role": "system",
      "content": "You are SERBI, an expert survey designer..."
    },
    {
      "role": "user",
      "content": "Create a survey based on these requirements\n\n{input}"
    },
    {
      "role": "assistant",
      "content": "{output}"
    }
  ],
  "metadata": { ... }
}
```

## Training SERBI with Mistral

### Option 1: Mistral API Fine-tuning

```python
from mistralai.client import MistralClient

client = MistralClient(api_key="your-api-key")

# Upload training data
with open("data/training-datasets/mistral-training-dataset.jsonl", "rb") as f:
    training_file = client.files.create(file=f, purpose="fine-tune")

# Create fine-tuning job
job = client.fine_tuning.jobs.create(
    model="open-mistral-7b",
    training_files=[training_file.id],
    hyperparameters={
        "training_steps": 1000,
        "learning_rate": 0.0001
    }
)
```

### Option 2: Local Fine-tuning

```bash
# Use Hugging Face transformers
pip install transformers datasets accelerate

# Fine-tune locally (example script needed)
python train_mistral.py \
  --model mistralai/Mistral-7B-v0.1 \
  --data data/training-datasets/mistral-training-dataset.jsonl \
  --output models/serbi-v1
```

## Tips for Best Results

### 1. Start Small
- Use `npm run quick-start` first
- Review the quality of scraped data
- Adjust schema if needed

### 2. Curate Your Data
Not all scraped content will be perfect:
- Review examples manually
- Remove low-quality data
- Add manual examples for edge cases

### 3. Balance Your Dataset
Ensure diversity:
```bash
# Check distribution
cat data/training-datasets/processing-report.json | grep -A 10 "by_category"
```

If one category dominates, scrape more from others.

### 4. Validate Extraction Quality

Check random samples:
```bash
# View a random healthcare survey
cat data/scraped-surveys/healthcare/*.json | head -n 100
```

### 5. Expand Over Time

Add more URLs to `config.ts` as you discover quality examples:
```typescript
healthcare: [
  'https://new-survey-example.com',
  // Add your custom URLs here
]
```

## Troubleshooting

### No Data Extracted

If `data.json` is empty:
1. Check if the URL is accessible
2. Try with `onlyMainContent: true` in config
3. Check the markdown output for clues
4. Verify the schema matches the content

### Rate Limiting

If you see errors about rate limits:
1. Increase delay in `config.ts`
2. Scrape in smaller batches
3. Use category-specific commands

### PDF Parsing Issues

Some PDFs (like PHQ-9) may not parse perfectly:
1. Check the markdown output
2. Consider manual data entry for critical validated scales
3. Use multiple sources for the same scale

### Schema Mismatch

If extracted data doesn't match expectations:
1. Review the markdown output first
2. Adjust schema in `config.ts`
3. Add more specific field types
4. Use the FireCrawl API documentation for guidance

## Next Steps

After successfully scraping and processing:

1. **Analyze the Data**
   ```bash
   npm run process
   cat data/training-datasets/processing-report.json
   ```

2. **Quality Check**
   - Review random samples
   - Check complexity distribution
   - Ensure all categories are represented

3. **Augment if Needed**
   - Add manual examples for edge cases
   - Include more domain-specific validated scales
   - Add complex branching logic examples

4. **Train SERBI**
   - Use the Mistral format dataset
   - Follow Mistral's fine-tuning guide
   - Start with a smaller model for testing

5. **Evaluate**
   - Test SERBI on new survey requirements
   - Check if it understands:
     - Domain-specific needs
     - Complex logic patterns
     - UI/UX best practices
     - Validated scales

## Example Workflow

Complete end-to-end example:

```bash
# 1. Install
cd scripts/survey-scraper
npm install

# 2. Quick start with high-value data
npm run quick-start

# 3. Add domain-specific data
npm run scrape:healthcare
npm run scrape:finance

# 4. Process everything
npm run process:all

# 5. Review results
cat data/training-datasets/processing-report.json

# 6. Check a specific category
cat data/training-datasets/dataset-healthcare.json | head -n 50

# 7. Use Mistral format for training
# data/training-datasets/mistral-training-dataset.jsonl is ready!
```

## Support & Resources

- **FireCrawl API Docs**: https://docs.firecrawl.dev/
- **Mistral Fine-tuning**: https://docs.mistral.ai/guides/finetuning/
- **Survey Design Best Practices**: See scraped data from best_practices category

## Adding New Data Sources

To expand your dataset:

1. **Find Quality Sources**
   - Survey platform galleries
   - Academic research repositories
   - Professional template libraries
   - Validated scale databases

2. **Add to Config**
   ```typescript
   // In config.ts
   new_category: [
     'https://source1.com',
     'https://source2.com'
   ]
   ```

3. **Scrape**
   ```bash
   npm run scrape category new_category
   ```

4. **Process**
   ```bash
   npm run process:all
   ```

## Performance Optimization

For large-scale scraping:

1. **Parallel Processing**
   - Run multiple category scrapers in parallel
   - Use different terminals for different categories

2. **Caching**
   - FireCrawl API caches results for 48 hours
   - Re-running won't re-scrape cached URLs

3. **Selective Processing**
   - Process only new data after adding URLs
   - Use category-specific datasets for faster iteration

Good luck training SERBI! 🚀
