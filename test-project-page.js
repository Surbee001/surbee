// Test the project page generation via tRPC API
const http = require('http');

async function testProjectPageGeneration() {
  console.log('🧪 Testing project page survey generation...');
  
  const payload = {
    json: {
      prompt: "create me a fun survey on user ice creams! try to go for that new apple look, where its glassy",
      mode: "advanced",
      context: {
        surveyType: "research",
        complexity: "professional",
        designStyle: "modern",
        length: "medium"
      },
      useTemplate: true
    }
  };

  const postData = JSON.stringify(payload);

  const options = {
    hostname: 'localhost',
    port: 3006,
    path: '/api/trpc/survey.generate',
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
          console.log('✅ Status:', res.statusCode);
          
          if (res.statusCode === 200) {
            const result = JSON.parse(data);
            console.log('✅ tRPC Survey generation successful!');
            console.log('Full result structure:', JSON.stringify(result, null, 2));
            
            // Check all possible paths
            console.log('\n=== Structure Analysis ===');
            console.log('result keys:', Object.keys(result));
            console.log('result.result keys:', result.result ? Object.keys(result.result) : 'N/A');
            console.log('result.result.data keys:', result.result?.data ? Object.keys(result.result.data) : 'N/A');
            console.log('result.json keys:', result.json ? Object.keys(result.json) : 'N/A');
            
            // Try different paths
            const surveyData = result.result?.data?.aiOutput || result.result?.aiOutput || result.json?.aiOutput || result.aiOutput;
            const survey = result.result?.data?.survey || result.result?.survey || result.json?.survey || result.survey;
            
            console.log('\n=== Survey Data Found ===');
            console.log('Survey title:', survey?.title);
            console.log('Survey pages:', survey?.pages?.length);
            console.log('Components:', surveyData?.components?.length);
            console.log('Pipeline used:', surveyData?.metadata?.pipeline);
            
            resolve(result);
          } else {
            console.log('❌ Error response:', data);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (error) {
          console.error('❌ Parse error:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

testProjectPageGeneration().catch(console.error);