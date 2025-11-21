import * as fs from 'fs';
import * as path from 'path';

class ProgressMonitor {
  private dataDir: string;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data', 'scraped-surveys');
  }

  monitor(): void {
    console.clear();
    console.log('📊 Surbee Data Collection - Live Progress Monitor');
    console.log('='.repeat(70));
    console.log(`Last updated: ${new Date().toLocaleString()}\n`);

    if (!fs.existsSync(this.dataDir)) {
      console.log('⏳ Waiting for scraping to start...\n');
      return;
    }

    const categories = fs.readdirSync(this.dataDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    let totalFiles = 0;
    const categoryStats: Record<string, number> = {};

    console.log('📁 Data Collection by Category:\n');

    categories.forEach(category => {
      const categoryPath = path.join(this.dataDir, category);
      const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.json') && file !== 'scrape-log.json');

      categoryStats[category] = files.length;
      totalFiles += files.length;

      const bar = '█'.repeat(files.length) + '░'.repeat(Math.max(0, 10 - files.length));
      console.log(`  ${category.padEnd(25)} ${bar} ${files.length} files`);
    });

    console.log('\n' + '─'.repeat(70));
    console.log(`\n📈 Total Files Collected: ${totalFiles}`);
    console.log(`📂 Categories with Data: ${Object.keys(categoryStats).length}`);

    // Calculate estimated data quality
    let sampleCount = 0;
    let hasDataCount = 0;

    categories.slice(0, 3).forEach(category => {
      const categoryPath = path.join(this.dataDir, category);
      const files = fs.readdirSync(categoryPath)
        .filter(file => file.endsWith('.json') && file !== 'scrape-log.json')
        .slice(0, 5);

      files.forEach(file => {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(categoryPath, file), 'utf-8'));
          sampleCount++;
          if (content.data?.json) {
            hasDataCount++;
          }
        } catch (e) {
          // Skip invalid files
        }
      });
    });

    if (sampleCount > 0) {
      const dataRate = (hasDataCount / sampleCount * 100).toFixed(1);
      console.log(`✨ Data Extraction Success Rate: ${dataRate}% (sampled)`);
    }

    // Check for log file
    const logPath = path.join(this.dataDir, 'scrape-log.json');
    if (fs.existsSync(logPath)) {
      try {
        const log = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        console.log(`\n📊 Scraping Complete!`);
        console.log(`  ✅ Successful: ${log.summary?.successful || 0}`);
        console.log(`  ❌ Failed: ${log.summary?.failed || 0}`);
        console.log(`  📈 Success Rate: ${log.summary?.success_rate || 'N/A'}`);
      } catch (e) {
        // Log file not ready yet
      }
    }

    console.log('\n' + '='.repeat(70));
    console.log('\n💡 Next Steps:');
    console.log('  1. Wait for all scraping to complete');
    console.log('  2. Run: npm run build-master');
    console.log('  3. Check: data/training-datasets/surbee-master-training.jsonl\n');
  }
}

// Run monitor
const monitor = new ProgressMonitor();
monitor.monitor();
