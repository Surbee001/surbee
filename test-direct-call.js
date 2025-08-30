// Direct test of survey generation through HTTP
const http = require('http');

async function testDirectCall() {
  console.log('🧪 Testing direct survey generation...');
  
  const payload = {
    json: {
      prompt: "Create a simple customer feedback survey",
      mode: "advanced",
      context: {
        surveyType: "feedback",
        complexity: "simple",
        designStyle: "modern"
      },
      useTemplate: true
    }
  };

  const postData = JSON.stringify(payload);

  const options = {
    hostname: 'localhost',
    port: 3005,
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
          const result = JSON.parse(data);
          console.log('✅ Status:', res.statusCode);
          
          if (result.result && result.result.data) {
            console.log('✅ Survey generated successfully!');
            console.log('Title:', result.result.data.survey?.title);
            console.log('Pages:', result.result.data.survey?.pages?.length);
            console.log('Components:', result.result.data.aiOutput?.components?.length);
            console.log('Quality Score:', result.result.data.aiOutput?.metadata?.qualityScore);
            console.log('Pipeline:', result.result.data.aiOutput?.metadata?.pipeline);
            console.log('Generation Time:', result.result.data.aiOutput?.metadata?.generationTime + 'ms');
            resolve(result);
          } else {
            console.log('❌ Error response:', JSON.stringify(result, null, 2));
            reject(new Error('Survey generation failed'));
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

testDirectCall().catch(console.error);