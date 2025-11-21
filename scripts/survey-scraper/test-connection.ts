import { FIRECRAWL_API_KEY, FIRECRAWL_API_URL, SURVEY_SCHEMA } from './config';

async function testConnection() {
  console.log('🔍 Testing FireCrawl API Connection...\n');

  // Test with a simple, reliable URL
  const testUrl = 'https://www.typeform.com/templates/';

  console.log(`📍 Test URL: ${testUrl}`);
  console.log(`🔑 API Key: ${FIRECRAWL_API_KEY.substring(0, 10)}...`);
  console.log(`🌐 API Endpoint: ${FIRECRAWL_API_URL}\n`);

  try {
    console.log('⏳ Sending test request...\n');

    const response = await fetch(FIRECRAWL_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: testUrl,
        onlyMainContent: false,
        maxAge: 172800000,
        formats: ['markdown']
      })
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (data.success) {
      console.log('✅ SUCCESS! FireCrawl API is working correctly.\n');
      console.log('Response preview:');
      console.log('─'.repeat(60));
      console.log(`Success: ${data.success}`);
      console.log(`Content length: ${data.data?.markdown?.length || 0} characters`);
      console.log('─'.repeat(60));
      console.log('\n🎉 You are ready to start scraping!\n');
      console.log('Next steps:');
      console.log('  1. npm run quick-start    - Start with high-value examples');
      console.log('  2. npm run scrape:all     - Scrape everything');
      console.log('  3. npm run pipeline       - Scrape and process in one command');
      return true;
    } else {
      throw new Error('API returned success: false');
    }
  } catch (error) {
    console.error('❌ ERROR: Connection test failed\n');
    console.error('Details:', error instanceof Error ? error.message : String(error));
    console.error('\nTroubleshooting:');
    console.error('  1. Check that your API key is valid');
    console.error('  2. Verify you have internet connection');
    console.error('  3. Check FireCrawl API status: https://status.firecrawl.dev/');
    console.error('  4. Review API documentation: https://docs.firecrawl.dev/');
    return false;
  }
}

// Run test
testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
