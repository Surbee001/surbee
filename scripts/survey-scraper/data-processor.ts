import * as fs from 'fs';
import * as path from 'path';

interface ScrapedSurvey {
  metadata: {
    source_url: string;
    category: string;
    scraped_at: string;
  };
  data?: {
    json?: any;
    markdown?: string;
  };
}

interface TrainingExample {
  instruction: string;
  input: string;
  output: string;
  metadata: {
    category: string;
    source: string;
    complexity: string;
  };
}

class DataProcessor {
  private dataDir: string;
  private outputDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'scraped-surveys');
    this.outputDir = path.join(process.cwd(), 'data', 'training-datasets');
    this.ensureOutputDirectory();
  }

  private ensureOutputDirectory(): void {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  private getAllScrapedFiles(): { category: string; files: string[] }[] {
    const categories: { category: string; files: string[] }[] = [];

    if (!fs.existsSync(this.dataDir)) {
      console.warn('Data directory does not exist. Run scraper first.');
      return categories;
    }

    const categoryDirs = fs.readdirSync(this.dataDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const category of categoryDirs) {
      const categoryPath = path.join(this.dataDir, category);
      const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.json') && file !== 'scrape-log.json')
        .map(file => path.join(categoryPath, file));

      if (files.length > 0) {
        categories.push({ category, files });
      }
    }

    return categories;
  }

  private readSurveyFile(filepath: string): ScrapedSurvey | null {
    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.error(`Error reading ${filepath}:`, error);
      return null;
    }
  }

  private generateTrainingExamples(survey: ScrapedSurvey): TrainingExample[] {
    const examples: TrainingExample[] = [];
    const surveyData = survey.data?.json;

    if (!surveyData) return examples;

    // Example 1: Survey Creation from Requirements
    if (surveyData.survey_basics) {
      examples.push({
        instruction: "Create a survey based on these requirements",
        input: JSON.stringify({
          industry: surveyData.survey_basics.target_industry,
          use_case: surveyData.survey_basics.use_case,
          audience: surveyData.survey_basics.target_audience
        }, null, 2),
        output: JSON.stringify(surveyData, null, 2),
        metadata: {
          category: survey.metadata.category,
          source: survey.metadata.source_url,
          complexity: this.assessComplexity(surveyData)
        }
      });
    }

    // Example 2: UI Design Patterns
    if (surveyData.ui_design_patterns) {
      examples.push({
        instruction: "Design the UI/UX for this survey",
        input: JSON.stringify({
          survey_type: surveyData.survey_basics?.use_case,
          questions: surveyData.questions?.length || 0,
          has_sections: surveyData.survey_structure?.has_sections
        }, null, 2),
        output: JSON.stringify(surveyData.ui_design_patterns, null, 2),
        metadata: {
          category: 'ui_design',
          source: survey.metadata.source_url,
          complexity: 'medium'
        }
      });
    }

    // Example 3: Skip Logic and Branching
    if (surveyData.skip_logic_and_branching && surveyData.skip_logic_and_branching.length > 0) {
      examples.push({
        instruction: "Implement skip logic and branching for this survey",
        input: JSON.stringify({
          questions: surveyData.questions,
          requirements: "Add appropriate conditional logic"
        }, null, 2),
        output: JSON.stringify(surveyData.skip_logic_and_branching, null, 2),
        metadata: {
          category: 'skip_logic',
          source: survey.metadata.source_url,
          complexity: 'high'
        }
      });
    }

    // Example 4: Domain-Specific Elements
    if (surveyData.domain_specific_elements) {
      examples.push({
        instruction: "Add domain-specific elements to this survey",
        input: JSON.stringify({
          industry: surveyData.survey_basics?.target_industry,
          survey_purpose: surveyData.survey_basics?.purpose
        }, null, 2),
        output: JSON.stringify(surveyData.domain_specific_elements, null, 2),
        metadata: {
          category: 'domain_specific',
          source: survey.metadata.source_url,
          complexity: 'high'
        }
      });
    }

    // Example 5: Question Design
    if (surveyData.questions && surveyData.questions.length > 0) {
      const sampleQuestions = surveyData.questions.slice(0, 3);
      examples.push({
        instruction: "Design survey questions for this use case",
        input: JSON.stringify({
          use_case: surveyData.survey_basics?.use_case,
          target_audience: surveyData.survey_basics?.target_audience,
          number_of_questions: 3
        }, null, 2),
        output: JSON.stringify(sampleQuestions, null, 2),
        metadata: {
          category: 'question_design',
          source: survey.metadata.source_url,
          complexity: 'medium'
        }
      });
    }

    return examples;
  }

  private assessComplexity(surveyData: any): string {
    let score = 0;

    if (surveyData.skip_logic_and_branching?.length > 0) score += 2;
    if (surveyData.survey_structure?.has_branching) score += 1;
    if (surveyData.domain_specific_elements?.validated_scales_used?.length > 0) score += 2;
    if (surveyData.questions?.length > 20) score += 1;
    if (surveyData.survey_structure?.has_sections) score += 1;

    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  async processAll(): Promise<void> {
    console.log('🔄 Processing scraped surveys into training datasets...\n');

    const categories = this.getAllScrapedFiles();
    const allExamples: TrainingExample[] = [];
    const stats = {
      totalFiles: 0,
      totalExamples: 0,
      byCategory: {} as Record<string, number>
    };

    for (const { category, files } of categories) {
      console.log(`📁 Processing category: ${category} (${files.length} files)`);

      for (const file of files) {
        stats.totalFiles++;
        const survey = this.readSurveyFile(file);

        if (survey) {
          const examples = this.generateTrainingExamples(survey);
          allExamples.push(...examples);
          stats.totalExamples += examples.length;

          if (!stats.byCategory[category]) {
            stats.byCategory[category] = 0;
          }
          stats.byCategory[category] += examples.length;
        }
      }
    }

    // Save training dataset
    this.saveTrainingDataset(allExamples, 'complete-dataset.json');

    // Save by category
    this.saveByCategoryTrainingDataset(allExamples);

    // Generate statistics
    this.generateStatistics(stats, allExamples);

    console.log('\n✅ Processing complete!');
    console.log(`📊 Total training examples: ${stats.totalExamples}`);
    console.log(`📁 Output directory: ${this.outputDir}`);
  }

  private saveTrainingDataset(examples: TrainingExample[], filename: string): void {
    const filepath = path.join(this.outputDir, filename);

    const dataset = {
      metadata: {
        created_at: new Date().toISOString(),
        total_examples: examples.length,
        version: '1.0.0',
        format: 'instruction-tuning'
      },
      examples
    };

    fs.writeFileSync(filepath, JSON.stringify(dataset, null, 2));
    console.log(`\n💾 Saved complete dataset: ${filepath}`);
  }

  private saveByCategoryTrainingDataset(examples: TrainingExample[]): void {
    const byCategory = examples.reduce((acc, example) => {
      const cat = example.metadata.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(example);
      return acc;
    }, {} as Record<string, TrainingExample[]>);

    for (const [category, categoryExamples] of Object.entries(byCategory)) {
      const filename = `dataset-${category}.json`;
      const filepath = path.join(this.outputDir, filename);

      const dataset = {
        metadata: {
          created_at: new Date().toISOString(),
          category,
          total_examples: categoryExamples.length,
          version: '1.0.0'
        },
        examples: categoryExamples
      };

      fs.writeFileSync(filepath, JSON.stringify(dataset, null, 2));
    }

    console.log(`💾 Saved ${Object.keys(byCategory).length} category-specific datasets`);
  }

  private generateStatistics(
    stats: any,
    examples: TrainingExample[]
  ): void {
    const complexityDistribution = examples.reduce((acc, ex) => {
      acc[ex.metadata.complexity] = (acc[ex.metadata.complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const report = {
      summary: {
        total_files_processed: stats.totalFiles,
        total_training_examples: stats.totalExamples,
        examples_per_file: (stats.totalExamples / stats.totalFiles).toFixed(2)
      },
      by_category: stats.byCategory,
      complexity_distribution: complexityDistribution,
      generated_at: new Date().toISOString()
    };

    const reportPath = path.join(this.outputDir, 'processing-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 Statistics:');
    console.log(`  Files processed: ${stats.totalFiles}`);
    console.log(`  Training examples: ${stats.totalExamples}`);
    console.log(`  Examples per file: ${report.summary.examples_per_file}`);
    console.log('\n  By category:');
    Object.entries(stats.byCategory).forEach(([cat, count]) => {
      console.log(`    ${cat}: ${count}`);
    });
    console.log('\n  By complexity:');
    Object.entries(complexityDistribution).forEach(([level, count]) => {
      console.log(`    ${level}: ${count}`);
    });
  }

  async generateMistralFormat(): Promise<void> {
    console.log('🤖 Generating Mistral-specific training format...\n');

    const datasetPath = path.join(this.outputDir, 'complete-dataset.json');

    if (!fs.existsSync(datasetPath)) {
      console.error('❌ Dataset not found. Run process command first.');
      return;
    }

    const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf-8'));

    // Mistral format: conversational format with system, user, assistant messages
    const mistralFormatted = dataset.examples.map((example: TrainingExample) => ({
      messages: [
        {
          role: 'system',
          content: 'You are SERBI, an expert survey designer that understands perfect UI/UX design, domain-specific requirements, and best practices across all industries. You create elegant, effective surveys with appropriate logic, branching, and validated scales.'
        },
        {
          role: 'user',
          content: `${example.instruction}\n\n${example.input}`
        },
        {
          role: 'assistant',
          content: example.output
        }
      ],
      metadata: example.metadata
    }));

    const mistralDataset = {
      metadata: {
        format: 'mistral-instruct',
        created_at: new Date().toISOString(),
        total_examples: mistralFormatted.length,
        version: '1.0.0'
      },
      data: mistralFormatted
    };

    const outputPath = path.join(this.outputDir, 'mistral-training-dataset.jsonl');

    // Save as JSONL (one JSON object per line)
    const jsonlContent = mistralFormatted
      .map(example => JSON.stringify(example))
      .join('\n');

    fs.writeFileSync(outputPath, jsonlContent);

    console.log(`✅ Mistral format dataset created: ${outputPath}`);
    console.log(`📊 Total examples: ${mistralFormatted.length}`);
  }
}

// CLI Usage
if (require.main === module) {
  const processor = new DataProcessor();
  const command = process.argv[2];

  (async () => {
    try {
      switch (command) {
        case 'process':
          await processor.processAll();
          break;

        case 'mistral':
          await processor.generateMistralFormat();
          break;

        case 'all':
          await processor.processAll();
          await processor.generateMistralFormat();
          break;

        default:
          console.log('Data Processor for SERBI Training');
          console.log('\nUsage:');
          console.log('  npm run process         - Process scraped data into training examples');
          console.log('  npm run process mistral - Generate Mistral-specific format');
          console.log('  npm run process all     - Process and generate Mistral format');
          break;
      }
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  })();
}

export { DataProcessor, TrainingExample };
