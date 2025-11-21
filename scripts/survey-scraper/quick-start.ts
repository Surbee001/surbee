import { SurveyScraper } from './scraper';

async function quickStart() {
  console.log('🎯 SERBI Survey Data Scraper - Quick Start');
  console.log('=' .repeat(60));
  console.log('\nThis will scrape a sample of high-value survey examples');
  console.log('to get you started quickly.\n');

  const scraper = new SurveyScraper();

  // Start with the most valuable sources for training
  const priorityCategories = [
    'typeform',        // Best UI/UX examples
    'best_practices',  // Design guidelines
    'healthcare',      // Validated clinical scales
    'hr_360_review'    // Complex multi-rater logic
  ];

  console.log('📋 Starting with priority categories:');
  priorityCategories.forEach(cat => console.log(`  ✓ ${cat}`));
  console.log('\n');

  await scraper.scrapeSpecificCategories(priorityCategories);

  console.log('\n✨ Quick start complete!');
  console.log('\nNext steps:');
  console.log('  1. Check the data/scraped-surveys/ folder for results');
  console.log('  2. Run "npm run scrape:all" to scrape everything');
  console.log('  3. Or run specific categories like "npm run scrape:finance"');
}

quickStart().catch(error => {
  console.error('Error during quick start:', error);
  process.exit(1);
});
