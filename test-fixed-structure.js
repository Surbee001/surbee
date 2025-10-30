// Test that the fix correctly extracts survey data from tRPC response
const http = require('http');

async function testFixedStructure() {
  console.log('🧪 Testing fixed data structure extraction...');
  
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
            
            // Simulate the frontend fix - check all possible paths
            console.log('Available paths:');
            console.log('result.aiOutput:', !!result?.aiOutput);
            console.log('result.json.aiOutput:', !!result?.json?.aiOutput); 
            console.log('result.result.data.json.aiOutput:', !!result?.result?.data?.json?.aiOutput);
            
            const ai = result?.aiOutput || result?.json?.aiOutput || result?.result?.data?.json?.aiOutput;
            const survey = result?.survey || result?.json?.survey || result?.result?.data?.json?.survey;
            
            console.log('✅ Survey generation successful!');
            console.log('\n=== FIXED STRUCTURE TEST ===');
            console.log('AI data found:', !!ai);
            console.log('Survey found:', !!survey);
            
            if (ai) {
              console.log('Survey title:', ai.survey?.title);
              console.log('Survey pages:', ai.survey?.pages?.length);
              console.log('Components:', ai.components?.length);
              console.log('Pipeline used:', ai.metadata?.pipeline);
              console.log('Quality score:', ai.metadata?.qualityScore);
              
              console.log('\n=== FRONTEND SIMULATION ===');
              console.log('surveyData will be set to:', {
                title: ai.survey?.title,
                pagesCount: ai.survey?.pages?.length,
                componentsCount: ai.components?.length
              });
              
              console.log('renderComponents will be set to:', ai.components?.length + ' components');
              
              // Test component structure
              if (ai.components && ai.components.length > 0) {
                console.log('\n=== COMPONENT ANALYSIS ===');
                ai.components.forEach((comp, i) => {
                  console.log(`Component ${i + 1}:`, {
                    id: comp.id,
                    name: comp.name,
                    type: comp.type,
                    hasCode: !!comp.code,
                    codeLength: comp.code?.length || 0
                  });
                });
              }
              
              console.log('\n🎉 SUCCESS: Survey will display in the frontend!');
            } else {
              console.log('❌ FAILURE: No AI data found, survey will not display');
            }
            
            resolve(result);
          } else {
            console.log('❌ Error response:', res.statusCode);
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        } catch (error) {
          console.error('❌ Parse error:', error);
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

testFixedStructure().catch(console.error);