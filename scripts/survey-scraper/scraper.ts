import * as fs from 'fs';
import * as path from 'path';
import {
  FIRECRAWL_API_KEY,
  FIRECRAWL_API_URL,
  SURVEY_SCHEMA,
  TARGET_URLS,
  RATE_LIMIT_CONFIG
} from './config';

interface ScrapeResult {
  url: string;
  category: string;
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

interface ScrapeOptions {
  onlyMainContent?: boolean;
  maxAge?: number;
}

class SurveyScraper {
  private resultsDir: string;
  private logFile: string;
  private results: ScrapeResult[] = [];

  constructor() {
    this.resultsDir = path.join(process.cwd(), 'data', 'scraped-surveys');
    this.logFile = path.join(this.resultsDir, 'scrape-log.json');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists(): void {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }

    // Create subdirectories for each category
    Object.keys(TARGET_URLS).forEach(category => {
      const categoryDir = path.join(this.resultsDir, category);
      if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir, { recursive: true });
      }
    });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private sanitizeFilename(url: string): string {
    return url
      .replace(/https?:\/\//, '')
      .replace(/[^a-z0-9]/gi, '_')
      .substring(0, 100);
  }

  async scrapeSingleURL(
    url: string,
    category: string,
    options: ScrapeOptions = {}
  ): Promise<ScrapeResult> {
    console.log(`\n🔍 Scraping: ${url}`);
    console.log(`📁 Category: ${category}`);

    const result: ScrapeResult = {
      url,
      category,
      success: false,
      timestamp: new Date().toISOString()
    };

    try {
      const requestBody = {
        url,
        onlyMainContent: options.onlyMainContent ?? false,
        maxAge: options.maxAge ?? 172800000,
        parsers: ['pdf'],
        formats: [
          'markdown',
          {
            type: 'json',
            schema: SURVEY_SCHEMA
          },
          'branding'
        ]
      };

      const response = await fetch(FIRECRAWL_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Check if the scrape was successful
      if (data.success) {
        result.success = true;
        result.data = data.data;

        // Save to file
        this.saveResult(url, category, data);

        console.log(`✅ Success! Data extracted and saved.`);
      } else {
        throw new Error(data.error || 'Unknown error from FireCrawl API');
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
      console.error(`❌ Error: ${result.error}`);
    }

    this.results.push(result);
    return result;
  }

  private saveResult(url: string, category: string, data: any): void {
    const filename = `${this.sanitizeFilename(url)}_${Date.now()}.json`;
    const filepath = path.join(this.resultsDir, category, filename);

    const enrichedData = {
      metadata: {
        source_url: url,
        category,
        scraped_at: new Date().toISOString(),
        scraper_version: '1.0.0'
      },
      ...data
    };

    fs.writeFileSync(filepath, JSON.stringify(enrichedData, null, 2));
    console.log(`💾 Saved to: ${filepath}`);
  }

  async scrapeCategory(
    category: string,
    urls: string[],
    options: ScrapeOptions = {}
  ): Promise<void> {
    console.log(`\n\n${'='.repeat(60)}`);
    console.log(`📊 Starting category: ${category.toUpperCase()}`);
    console.log(`📝 URLs to scrape: ${urls.length}`);
    console.log('='.repeat(60));

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`\n[${i + 1}/${urls.length}] Processing...`);

      await this.scrapeSingleURL(url, category, options);

      // Rate limiting - wait between requests
      if (i < urls.length - 1) {
        console.log(`⏳ Waiting ${RATE_LIMIT_CONFIG.delayBetweenRequests / 1000}s before next request...`);
        await this.delay(RATE_LIMIT_CONFIG.delayBetweenRequests);
      }
    }
  }

  async scrapeAll(options: ScrapeOptions = {}): Promise<void> {
    console.log('🚀 Starting comprehensive survey data scraping...');
    console.log(`📅 Started at: ${new Date().toLocaleString()}\n`);

    const startTime = Date.now();

    for (const [category, urls] of Object.entries(TARGET_URLS)) {
      await this.scrapeCategory(category, urls, options);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    this.generateReport(duration);
  }

  async scrapeSpecificCategories(
    categories: string[],
    options: ScrapeOptions = {}
  ): Promise<void> {
    console.log('🚀 Starting targeted survey data scraping...');
    console.log(`📅 Started at: ${new Date().toLocaleString()}`);
    console.log(`🎯 Categories: ${categories.join(', ')}\n`);

    const startTime = Date.now();

    for (const category of categories) {
      if (TARGET_URLS[category as keyof typeof TARGET_URLS]) {
        const urls = TARGET_URLS[category as keyof typeof TARGET_URLS];
        await this.scrapeCategory(category, urls, options);
      } else {
        console.warn(`⚠️  Category '${category}' not found in TARGET_URLS`);
      }
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    this.generateReport(duration);
  }

  private generateReport(duration: string): void {
    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;

    const report = {
      summary: {
        total_urls: this.results.length,
        successful,
        failed,
        success_rate: `${((successful / this.results.length) * 100).toFixed(2)}%`,
        duration_minutes: duration,
        completed_at: new Date().toISOString()
      },
      results: this.results,
      errors: this.results
        .filter(r => !r.success)
        .map(r => ({ url: r.url, error: r.error }))
    };

    // Save log
    fs.writeFileSync(this.logFile, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SCRAPING COMPLETE - SUMMARY REPORT');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${report.summary.success_rate}`);
    console.log(`⏱️  Duration: ${duration} minutes`);
    console.log(`📁 Results saved to: ${this.resultsDir}`);
    console.log(`📋 Log file: ${this.logFile}`);
    console.log('='.repeat(60) + '\n');

    if (failed > 0) {
      console.log('\n⚠️  Failed URLs:');
      report.errors.forEach(err => {
        console.log(`  - ${err.url}`);
        console.log(`    Error: ${err.error}\n`);
      });
    }
  }

  async scrapeCustomURLs(
    urls: string[],
    category: string = 'custom',
    options: ScrapeOptions = {}
  ): Promise<void> {
    console.log('🚀 Starting custom URL scraping...');
    await this.scrapeCategory(category, urls, options);
    this.generateReport('N/A');
  }
}

// Export for use in other scripts
export { SurveyScraper, ScrapeResult, ScrapeOptions };

// CLI Usage
if (require.main === module) {
  const scraper = new SurveyScraper();

  // Parse command line arguments
  const args = process.argv.slice(2);
  const command = args[0];

  (async () => {
    try {
      switch (command) {
        case 'all':
          await scraper.scrapeAll();
          break;

        case 'category':
          const categories = args.slice(1);
          if (categories.length === 0) {
            console.log('Usage: npm run scrape category <category1> <category2> ...');
            console.log('Available categories:', Object.keys(TARGET_URLS).join(', '));
            process.exit(1);
          }
          await scraper.scrapeSpecificCategories(categories);
          break;

        case 'url':
          const customUrl = args[1];
          const customCategory = args[2] || 'custom';
          if (!customUrl) {
            console.log('Usage: npm run scrape url <url> [category]');
            process.exit(1);
          }
          await scraper.scrapeCustomURLs([customUrl], customCategory);
          break;

        default:
          console.log('Survey Data Scraper');
          console.log('\nUsage:');
          console.log('  npm run scrape all                           - Scrape all URLs');
          console.log('  npm run scrape category <cat1> <cat2>        - Scrape specific categories');
          console.log('  npm run scrape url <url> [category]          - Scrape a single URL');
          console.log('\nAvailable categories:');
          Object.keys(TARGET_URLS).forEach(cat => console.log(`  - ${cat}`));
          break;
      }
    } catch (error) {
      console.error('Fatal error:', error);
      process.exit(1);
    }
  })();
}
