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

interface MasterTrainingExample {
  id: string;
  instruction: string;
  input: string;
  output: string;
  metadata: {
    category: string;
    source: string;
    complexity: string;
    quality_score: number;
    domains: string[];
    features: string[];
  };
}

interface QualityMetrics {
  has_questions: boolean;
  has_logic: boolean;
  has_ui_patterns: boolean;
  has_domain_elements: boolean;
  question_count: number;
  completeness_score: number;
}

class MasterDatasetBuilder {
  private dataDir: string;
  private outputDir: string;
  private allExamples: MasterTrainingExample[] = [];
  private seenHashes: Set<string> = new Set();

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

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private isDuplicate(content: string): boolean {
    const hash = this.simpleHash(content);
    if (this.seenHashes.has(hash)) {
      return true;
    }
    this.seenHashes.add(hash);
    return false;
  }

  private assessQuality(surveyData: any): QualityMetrics {
    const metrics: QualityMetrics = {
      has_questions: false,
      has_logic: false,
      has_ui_patterns: false,
      has_domain_elements: false,
      question_count: 0,
      completeness_score: 0
    };

    if (surveyData.questions && Array.isArray(surveyData.questions)) {
      metrics.has_questions = surveyData.questions.length > 0;
      metrics.question_count = surveyData.questions.length;
    }

    if (surveyData.skip_logic_and_branching && Array.isArray(surveyData.skip_logic_and_branching)) {
      metrics.has_logic = surveyData.skip_logic_and_branching.length > 0;
    }

    if (surveyData.ui_design_patterns) {
      metrics.has_ui_patterns = Object.keys(surveyData.ui_design_patterns).length > 0;
    }

    if (surveyData.domain_specific_elements) {
      metrics.has_domain_elements = Object.keys(surveyData.domain_specific_elements).length > 0;
    }

    // Calculate completeness score (0-100)
    let score = 0;
    if (metrics.has_questions) score += 30;
    if (metrics.question_count >= 5) score += 10;
    if (metrics.question_count >= 10) score += 10;
    if (metrics.has_logic) score += 20;
    if (metrics.has_ui_patterns) score += 15;
    if (metrics.has_domain_elements) score += 15;

    metrics.completeness_score = score;

    return metrics;
  }

  private extractDomains(surveyData: any, category: string): string[] {
    const domains = new Set<string>();

    // Add category as domain
    domains.add(category);

    // Extract from survey basics
    if (surveyData.survey_basics?.target_industry) {
      domains.add(surveyData.survey_basics.target_industry.toLowerCase());
    }

    // Extract from domain-specific elements
    if (surveyData.domain_specific_elements?.industry_terminology) {
      domains.add('specialized');
    }

    if (surveyData.domain_specific_elements?.validated_scales_used?.length > 0) {
      domains.add('validated_scales');
    }

    return Array.from(domains);
  }

  private extractFeatures(surveyData: any): string[] {
    const features = new Set<string>();

    if (surveyData.skip_logic_and_branching?.length > 0) {
      features.add('conditional_logic');
      features.add('branching');
    }

    if (surveyData.survey_structure?.has_sections) {
      features.add('multi_section');
    }

    if (surveyData.survey_structure?.has_randomization) {
      features.add('randomization');
    }

    if (surveyData.ui_design_patterns?.has_progress_indicator) {
      features.add('progress_indicator');
    }

    if (surveyData.ui_design_patterns?.is_mobile_optimized) {
      features.add('mobile_optimized');
    }

    if (surveyData.domain_specific_elements?.validated_scales_used?.length > 0) {
      features.add('validated_scales');
    }

    // Detect question types
    if (surveyData.questions) {
      const questionTypes = new Set(surveyData.questions.map((q: any) => q.question_type).filter(Boolean));
      questionTypes.forEach(type => features.add(`qtype_${type}`));
    }

    return Array.from(features);
  }

  private generateAdvancedExamples(survey: ScrapedSurvey, quality: QualityMetrics): MasterTrainingExample[] {
    const examples: MasterTrainingExample[] = [];
    const surveyData = survey.data?.json;

    if (!surveyData) return examples;

    const domains = this.extractDomains(surveyData, survey.metadata.category);
    const features = this.extractFeatures(surveyData);

    // Example 1: Complete Survey Generation
    if (quality.completeness_score >= 60) {
      const input = {
        requirement: 'Create a comprehensive survey',
        industry: surveyData.survey_basics?.target_industry || 'general',
        use_case: surveyData.survey_basics?.use_case || 'feedback',
        target_audience: surveyData.survey_basics?.target_audience,
        estimated_questions: quality.question_count,
        needs_branching: quality.has_logic,
        needs_sections: surveyData.survey_structure?.has_sections
      };

      const example: MasterTrainingExample = {
        id: `complete_${this.simpleHash(survey.metadata.source_url)}_${Date.now()}`,
        instruction: 'Create a complete survey with all necessary components including questions, logic, UI design, and best practices.',
        input: JSON.stringify(input, null, 2),
        output: JSON.stringify(surveyData, null, 2),
        metadata: {
          category: survey.metadata.category,
          source: survey.metadata.source_url,
          complexity: this.mapComplexity(quality),
          quality_score: quality.completeness_score,
          domains,
          features
        }
      };

      if (!this.isDuplicate(example.output)) {
        examples.push(example);
      }
    }

    // Example 2: Question Design Mastery
    if (quality.has_questions && surveyData.questions.length >= 3) {
      const sampleQuestions = surveyData.questions.slice(0, Math.min(5, surveyData.questions.length));

      const example: MasterTrainingExample = {
        id: `questions_${this.simpleHash(survey.metadata.source_url)}_${Date.now()}`,
        instruction: 'Design survey questions that follow best practices for the given use case and industry.',
        input: JSON.stringify({
          use_case: surveyData.survey_basics?.use_case,
          industry: surveyData.survey_basics?.target_industry,
          target_audience: surveyData.survey_basics?.target_audience,
          number_of_questions: sampleQuestions.length
        }, null, 2),
        output: JSON.stringify(sampleQuestions, null, 2),
        metadata: {
          category: 'question_design',
          source: survey.metadata.source_url,
          complexity: 'medium',
          quality_score: quality.completeness_score,
          domains,
          features
        }
      };

      if (!this.isDuplicate(example.output)) {
        examples.push(example);
      }
    }

    // Example 3: Conditional Logic & Branching
    if (quality.has_logic) {
      const example: MasterTrainingExample = {
        id: `logic_${this.simpleHash(survey.metadata.source_url)}_${Date.now()}`,
        instruction: 'Implement skip logic and branching rules for a survey to create a dynamic, personalized experience.',
        input: JSON.stringify({
          questions: surveyData.questions?.slice(0, 10),
          requirements: 'Add appropriate conditional logic and branching based on user responses'
        }, null, 2),
        output: JSON.stringify({
          skip_logic: surveyData.skip_logic_and_branching,
          branching_strategy: surveyData.survey_structure?.has_branching
        }, null, 2),
        metadata: {
          category: 'conditional_logic',
          source: survey.metadata.source_url,
          complexity: 'high',
          quality_score: quality.completeness_score,
          domains,
          features: ['branching', 'skip_logic', ...features]
        }
      };

      if (!this.isDuplicate(example.output)) {
        examples.push(example);
      }
    }

    // Example 4: UI/UX Design Patterns
    if (quality.has_ui_patterns) {
      const example: MasterTrainingExample = {
        id: `ui_${this.simpleHash(survey.metadata.source_url)}_${Date.now()}`,
        instruction: 'Design the UI/UX for a survey that is beautiful, accessible, and optimized for user completion.',
        input: JSON.stringify({
          survey_type: surveyData.survey_basics?.use_case,
          question_count: quality.question_count,
          target_platform: 'web_and_mobile',
          brand_tone: surveyData.ui_design_patterns?.visual_style
        }, null, 2),
        output: JSON.stringify(surveyData.ui_design_patterns, null, 2),
        metadata: {
          category: 'ui_design',
          source: survey.metadata.source_url,
          complexity: 'medium',
          quality_score: quality.completeness_score,
          domains,
          features: ['ui_design', 'ux_patterns', ...features]
        }
      };

      if (!this.isDuplicate(example.output)) {
        examples.push(example);
      }
    }

    // Example 5: Domain-Specific Survey Creation
    if (quality.has_domain_elements) {
      const example: MasterTrainingExample = {
        id: `domain_${this.simpleHash(survey.metadata.source_url)}_${Date.now()}`,
        instruction: 'Create a domain-specific survey with appropriate validated scales, compliance considerations, and industry terminology.',
        input: JSON.stringify({
          domain: surveyData.survey_basics?.target_industry,
          specific_needs: surveyData.survey_basics?.purpose,
          compliance_required: surveyData.domain_specific_elements?.compliance_considerations?.length > 0
        }, null, 2),
        output: JSON.stringify({
          domain_elements: surveyData.domain_specific_elements,
          questions: surveyData.questions,
          structure: surveyData.survey_structure
        }, null, 2),
        metadata: {
          category: 'domain_specific',
          source: survey.metadata.source_url,
          complexity: 'high',
          quality_score: quality.completeness_score,
          domains,
          features: ['domain_expertise', ...features]
        }
      };

      if (!this.isDuplicate(example.output)) {
        examples.push(example);
      }
    }

    // Example 6: Survey Structure & Organization
    if (surveyData.survey_structure) {
      const example: MasterTrainingExample = {
        id: `structure_${this.simpleHash(survey.metadata.source_url)}_${Date.now()}`,
        instruction: 'Design the optimal structure and organization for a survey including sections, flow, and question ordering.',
        input: JSON.stringify({
          total_questions: quality.question_count,
          survey_purpose: surveyData.survey_basics?.purpose,
          needs_grouping: true
        }, null, 2),
        output: JSON.stringify(surveyData.survey_structure, null, 2),
        metadata: {
          category: 'survey_structure',
          source: survey.metadata.source_url,
          complexity: 'medium',
          quality_score: quality.completeness_score,
          domains,
          features: ['structure_design', ...features]
        }
      };

      if (!this.isDuplicate(example.output)) {
        examples.push(example);
      }
    }

    // Example 7: Best Practices Application
    if (surveyData.ux_best_practices || surveyData.best_practices_observed) {
      const bestPractices = surveyData.ux_best_practices || surveyData.best_practices_observed;

      const example: MasterTrainingExample = {
        id: `practices_${this.simpleHash(survey.metadata.source_url)}_${Date.now()}`,
        instruction: 'Apply survey design best practices to ensure high completion rates and quality data collection.',
        input: JSON.stringify({
          survey_context: surveyData.survey_basics,
          current_design: 'needs_improvement'
        }, null, 2),
        output: JSON.stringify({
          best_practices: bestPractices,
          implementation: 'Best practices have been applied throughout the survey design'
        }, null, 2),
        metadata: {
          category: 'best_practices',
          source: survey.metadata.source_url,
          complexity: 'medium',
          quality_score: quality.completeness_score,
          domains,
          features: ['best_practices', ...features]
        }
      };

      if (!this.isDuplicate(example.output)) {
        examples.push(example);
      }
    }

    return examples;
  }

  private mapComplexity(quality: QualityMetrics): string {
    if (quality.completeness_score >= 80) return 'high';
    if (quality.completeness_score >= 50) return 'medium';
    return 'low';
  }

  private getAllScrapedFiles(): { category: string; files: string[] }[] {
    const categories: { category: string; files: string[] }[] = [];

    if (!fs.existsSync(this.dataDir)) {
      console.warn('⚠️  Data directory does not exist. Run scraper first.');
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
      console.error(`❌ Error reading ${filepath}:`, error);
      return null;
    }
  }

  async buildMasterDataset(): Promise<void> {
    console.log('🚀 Building Master Training Dataset for Surbee');
    console.log('=' .repeat(70));
    console.log('\nThis will create one comprehensive, high-quality dataset');
    console.log('combining all scraped surveys with deduplication and quality filtering.\n');

    const stats = {
      totalFiles: 0,
      totalExamples: 0,
      filteredLowQuality: 0,
      duplicatesRemoved: 0,
      byCategory: {} as Record<string, number>,
      byComplexity: { low: 0, medium: 0, high: 0 },
      byQualityScore: { '0-30': 0, '30-60': 0, '60-80': 0, '80-100': 0 },
      averageQuality: 0
    };

    const categories = this.getAllScrapedFiles();
    let totalQuality = 0;

    console.log(`📂 Found ${categories.length} categories to process\n`);

    for (const { category, files } of categories) {
      console.log(`📁 Processing: ${category} (${files.length} files)`);

      for (const file of files) {
        stats.totalFiles++;
        const survey = this.readSurveyFile(file);

        if (!survey || !survey.data?.json) {
          console.log(`  ⏭️  Skipped: No data extracted`);
          continue;
        }

        const quality = this.assessQuality(survey.data.json);

        // Filter out very low quality
        if (quality.completeness_score < 20) {
          stats.filteredLowQuality++;
          console.log(`  🔽 Filtered: Low quality (score: ${quality.completeness_score})`);
          continue;
        }

        const examples = this.generateAdvancedExamples(survey, quality);

        if (examples.length > 0) {
          this.allExamples.push(...examples);
          stats.totalExamples += examples.length;
          totalQuality += quality.completeness_score;

          if (!stats.byCategory[category]) {
            stats.byCategory[category] = 0;
          }
          stats.byCategory[category] += examples.length;

          // Track complexity
          const complexity = this.mapComplexity(quality);
          stats.byComplexity[complexity as keyof typeof stats.byComplexity]++;

          // Track quality score ranges
          if (quality.completeness_score <= 30) stats.byQualityScore['0-30']++;
          else if (quality.completeness_score <= 60) stats.byQualityScore['30-60']++;
          else if (quality.completeness_score <= 80) stats.byQualityScore['60-80']++;
          else stats.byQualityScore['80-100']++;

          console.log(`  ✅ Added ${examples.length} examples (quality: ${quality.completeness_score})`);
        }
      }
      console.log('');
    }

    stats.averageQuality = stats.totalFiles > 0 ? totalQuality / stats.totalFiles : 0;
    stats.duplicatesRemoved = this.seenHashes.size - stats.totalExamples;

    console.log('💾 Saving master dataset...\n');
    this.saveMasterDataset(stats);
    this.generateMistralFormat(stats);
    this.generateDetailedReport(stats);

    console.log('\n' + '='.repeat(70));
    console.log('✨ MASTER DATASET BUILD COMPLETE');
    console.log('='.repeat(70));
    console.log(`\n📊 Statistics:`);
    console.log(`  Files processed: ${stats.totalFiles}`);
    console.log(`  Training examples: ${stats.totalExamples}`);
    console.log(`  Low quality filtered: ${stats.filteredLowQuality}`);
    console.log(`  Average quality score: ${stats.averageQuality.toFixed(2)}`);
    console.log(`\n📁 Output:`);
    console.log(`  Master dataset: ${this.outputDir}/surbee-master-dataset.json`);
    console.log(`  Mistral format: ${this.outputDir}/surbee-master-training.jsonl`);
    console.log(`  Detailed report: ${this.outputDir}/master-dataset-report.json`);
    console.log('\n🎉 Ready for Surbee training!\n');
  }

  private saveMasterDataset(stats: any): void {
    const masterDataset = {
      metadata: {
        name: 'Surbee Master Training Dataset',
        version: '1.0.0',
        created_at: new Date().toISOString(),
        description: 'Comprehensive survey design training dataset combining all sources',
        total_examples: this.allExamples.length,
        statistics: stats,
        quality_filtered: true,
        deduplicated: true
      },
      examples: this.allExamples
    };

    const filepath = path.join(this.outputDir, 'surbee-master-dataset.json');
    fs.writeFileSync(filepath, JSON.stringify(masterDataset, null, 2));
    console.log(`✅ Master dataset saved: ${filepath}`);
  }

  private generateMistralFormat(stats: any): void {
    const mistralExamples = this.allExamples.map(example => ({
      messages: [
        {
          role: 'system',
          content: `You are Surbee, an expert AI survey designer with deep knowledge of:
- UI/UX design principles and best practices
- Domain-specific requirements across healthcare, finance, HR, engineering, education, and more
- Validated psychometric scales and clinical assessments
- Complex survey logic, branching, and conditional flows
- Accessibility and mobile optimization
- Data collection best practices and compliance (HIPAA, GDPR, etc.)

You create elegant, effective surveys that maximize completion rates and data quality while providing excellent user experiences.`
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

    const jsonlContent = mistralExamples.map(ex => JSON.stringify(ex)).join('\n');
    const filepath = path.join(this.outputDir, 'surbee-master-training.jsonl');
    fs.writeFileSync(filepath, jsonlContent);
    console.log(`✅ Mistral format saved: ${filepath}`);
  }

  private generateDetailedReport(stats: any): void {
    const report = {
      generation_info: {
        generated_at: new Date().toISOString(),
        total_sources_processed: stats.totalFiles,
        total_training_examples: stats.totalExamples,
        quality_filtered: stats.filteredLowQuality,
        average_quality_score: stats.averageQuality
      },
      distribution: {
        by_category: stats.byCategory,
        by_complexity: stats.byComplexity,
        by_quality_score: stats.byQualityScore
      },
      top_examples_by_quality: this.allExamples
        .sort((a, b) => b.metadata.quality_score - a.metadata.quality_score)
        .slice(0, 10)
        .map(ex => ({
          id: ex.id,
          category: ex.metadata.category,
          quality_score: ex.metadata.quality_score,
          complexity: ex.metadata.complexity,
          domains: ex.metadata.domains,
          features: ex.metadata.features
        })),
      feature_coverage: this.calculateFeatureCoverage(),
      domain_coverage: this.calculateDomainCoverage()
    };

    const filepath = path.join(this.outputDir, 'master-dataset-report.json');
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`✅ Detailed report saved: ${filepath}`);
  }

  private calculateFeatureCoverage(): Record<string, number> {
    const featureCounts: Record<string, number> = {};

    this.allExamples.forEach(example => {
      example.metadata.features.forEach(feature => {
        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
      });
    });

    return featureCounts;
  }

  private calculateDomainCoverage(): Record<string, number> {
    const domainCounts: Record<string, number> = {};

    this.allExamples.forEach(example => {
      example.metadata.domains.forEach(domain => {
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      });
    });

    return domainCounts;
  }
}

// CLI Usage
if (require.main === module) {
  const builder = new MasterDatasetBuilder();

  (async () => {
    try {
      await builder.buildMasterDataset();
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  })();
}

export { MasterDatasetBuilder };
