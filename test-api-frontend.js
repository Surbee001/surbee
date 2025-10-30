// Test GPT-5 frontend generation through HTTP API
const http = require('http');

async function testFrontendGeneration() {
  console.log('🧪 Testing GPT-5 style frontend generation through API...');
  
  // Test 1: Generate complete frontend
  const testPayload = {
    id: 1,
    jsonrpc: '2.0',
    method: 'generateFrontend',
    params: {
      input: {
        prompt: "Create a fun ice cream preference survey with colorful design",
        context: {
          surveyType: 'marketing',
          targetAudience: 'general public',
          complexity: 'simple',
          designStyle: 'creative',
          length: 'short'
        },
        useTemplate: true,
        saveToFile: true,
        filename: 'ice_cream_survey_test.html'
      }
    }
  };

  const postData = JSON.stringify(testPayload);

  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/trpc/survey.generateFrontend?input=' + encodeURIComponent(JSON.stringify({
      prompt: "Create a fun ice cream preference survey with colorful design",
      context: {
        surveyType: 'marketing',
        targetAudience: 'general public',
        complexity: 'simple',
        designStyle: 'creative',
        length: 'short'
      },
      useTemplate: true,
      saveToFile: true,
      filename: 'ice_cream_survey_test.html'
    })),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Frontend generation API response:');
          console.log('Status:', res.statusCode);
          console.log('Response keys:', Object.keys(result));
          
          if (result.result && result.result.data) {
            console.log('✅ Frontend generated successfully!');
            console.log('HTML size:', result.result.data.html?.length || 0, 'characters');
            console.log('File path:', result.result.data.filePath);
            console.log('Preview URL:', result.result.data.previewUrl);
            resolve(result);
          } else {
            console.log('❌ Unexpected response structure:', result);
            reject(new Error('Unexpected response structure'));
          }
        } catch (error) {
          console.error('❌ Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.end();
  });
}

// Test refinement API
async function testFrontendRefinement() {
  console.log('\n🎨 Testing frontend refinement...');
  
  const testPayload = {
    id: 2,
    jsonrpc: '2.0',
    method: 'refineFrontend',
    params: {
      input: {
        originalPrompt: "Create a professional customer feedback survey",
        styleDirection: "Make it lighter and more pastel with softer colors",
        context: {
          surveyType: 'feedback',
          targetAudience: 'customers',
          complexity: 'professional',
          designStyle: 'modern'
        },
        useTemplate: true,
        saveToFile: true,
        filename: 'refined_survey_test.html'
      }
    }
  };

  const postData = JSON.stringify(testPayload);

  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/trpc/survey.refineFrontend',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Refinement API response:');
          console.log('Status:', res.statusCode);
          
          if (result.result && result.result.data) {
            console.log('✅ Refinement completed successfully!');
            console.log('HTML size:', result.result.data.html?.length || 0, 'characters');
            console.log('File path:', result.result.data.filePath);
            console.log('Style direction applied:', result.result.data.styleDirection);
            resolve(result);
          } else {
            console.log('❌ Unexpected refinement response:', result);
            reject(new Error('Unexpected refinement response'));
          }
        } catch (error) {
          console.error('❌ Error parsing refinement response:', error);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Refinement request error:', error);
      reject(error);
    });

    req.end();
  });
}

async function runTests() {
  try {
    console.log('🚀 Starting GPT-5 frontend generation tests...\n');
    
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 1: Basic frontend generation
    await testFrontendGeneration();
    
    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Frontend refinement
    await testFrontendRefinement();
    
    console.log('\n🎉 All frontend generation tests completed!');
    console.log('Check the "outputs" folder for generated HTML files.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

runTests();