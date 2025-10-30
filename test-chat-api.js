// Test the new survey-builder chat API
const http = require('http');

async function testChatAPI() {
  console.log('🧪 Testing survey-builder chat API...');
  
  const payload = {
    messages: [
      {
        role: 'user',
        content: 'create me a fun survey on user ice creams! try to go for that new apple look, where its glassy'
      }
    ],
    survey: null,
    stream: false
  };

  const postData = JSON.stringify(payload);

  const options = {
    hostname: 'localhost',
    port: 3005,
    path: '/api/survey-builder/chat',
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
            console.log('✅ Survey generation successful!');
            console.log('Title:', result.survey?.title);
            console.log('Pages:', result.survey?.pages?.length);
            console.log('Total questions:', result.survey?.pages?.reduce((sum, p) => sum + (p.questions?.length || 0), 0));
            console.log('Agent used:', result.agentUsed);
            console.log('Assistant message:', result.assistantMessage);
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

testChatAPI().catch(console.error);