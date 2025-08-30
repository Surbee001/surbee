// Test script to verify survey builder behavior
require('dotenv').config({ path: '.env.local' });

const testRequests = [
  {
    name: "Valid Survey Request",
    prompt: "Create a simple customer feedback survey with 3 questions",
    shouldBuild: true
  }
];

async function testSurveyBuilder() {
  console.log('🧪 Testing Survey Builder Validation...\n');
  
  for (let i = 0; i < testRequests.length; i++) {
    const test = testRequests[i];
    
    if (i > 0) {
      console.log('\n   Waiting 5 seconds to avoid rate limiting...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    console.log(`\n📝 Test: ${test.name}`);
    console.log(`   Request: "${test.prompt}"`);
    console.log(`   Expected: ${test.shouldBuild ? '✅ Should build' : '❌ Should refuse'}`);
    
    try {
      const response = await fetch('http://localhost:3000/api/website-builder/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-forwarded-for': 'test-client'
        },
        body: JSON.stringify({
          prompt: test.prompt,
          provider: 'deepseek',
          model: 'deepseek-chat',
          html: ''
        })
      });

      if (!response.ok) {
        console.log(`   Result: ❌ Request failed with status ${response.status}`);
        continue;
      }

      // Read the stream with timeout
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';
      const timeout = 30000; // 30 seconds
      const startTime = Date.now();
      let chunks = 0;
      
      console.log(`   Reading stream...`);
      
      while (true) {
        if (Date.now() - startTime > timeout) {
          console.log(`   Result: ⏱️ Timeout after ${timeout/1000}s`);
          break;
        }
        
        const readPromise = reader.read();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Read timeout')), 5000)
        );
        
        try {
          const { done, value } = await Promise.race([readPromise, timeoutPromise]);
          if (done) {
            console.log(`   Stream complete (${chunks} chunks, ${result.length} chars)`);
            break;
          }
          result += decoder.decode(value);
          chunks++;
          if (chunks % 10 === 0) {
            console.log(`   ...received ${chunks} chunks (${result.length} chars)`);
          }
        } catch (err) {
          if (err.message === 'Read timeout') {
            console.log(`   Stream ended (timeout after ${chunks} chunks)`);
            break;
          }
          throw err;
        }
      }

      // Check if HTML was generated
      const hasHtml = result.includes('<!DOCTYPE html>') && result.includes('</html>');
      
      // Debug: Show first 200 chars of result
      if (result.length > 0) {
        console.log(`   Preview: "${result.substring(0, 200).replace(/\n/g, ' ')}..."`);
      }
      
      if (test.shouldBuild && hasHtml) {
        console.log(`   Result: ✅ Built successfully`);
      } else if (!test.shouldBuild && !hasHtml) {
        console.log(`   Result: ✅ Correctly refused`);
        // Show refusal message
        const refusalMatch = result.match(/[^<>]+/);
        if (refusalMatch) {
          console.log(`   Message: "${refusalMatch[0].trim().substring(0, 100)}..."`);
        }
      } else if (test.shouldBuild && !hasHtml) {
        console.log(`   Result: ❌ Failed to build (should have built)`);
      } else {
        console.log(`   Result: ❌ Built when should have refused`);
      }
      
    } catch (error) {
      console.log(`   Result: ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n\n✨ Test complete!');
}

// Check for DeepSeek API key
if (!process.env.DEEPSEEK_API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY environment variable is not set');
  console.log('Please set it before running tests:');
  console.log('  export DEEPSEEK_API_KEY=your_api_key_here');
  process.exit(1);
}

testSurveyBuilder().catch(console.error);