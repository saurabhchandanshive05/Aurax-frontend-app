// Test if creator-profile endpoint is accessible
const https = require('http');

const testEndpoint = () => {
  const options = {
    hostname: 'localhost',
    port: 5002,
    path: '/api/onboarding/creator-profile',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log('🔍 Testing POST /api/onboarding/creator-profile...\n');

  const req = https.request(options, (res) => {
    console.log(`📊 Status Code: ${res.statusCode}`);
    console.log(`📊 Status Message: ${res.statusMessage}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\n📊 Response:');
      try {
        const parsed = JSON.parse(data);
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(data);
      }

      console.log('\n');
      if (res.statusCode === 404) {
        console.log('❌ 404 - Route NOT found!');
        console.log('This means the route is not mounted correctly.');
      } else if (res.statusCode === 401) {
        console.log('✅ Route EXISTS! (401 Unauthorized is expected without token)');
      } else if (res.statusCode === 400) {
        console.log('✅ Route EXISTS! (400 Bad Request is expected without data)');
      } else {
        console.log(`ℹ️  Got status ${res.statusCode}`);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error:', error.message);
    console.log('\nMake sure backend is running on port 5002');
  });

  req.write(JSON.stringify({}));
  req.end();
};

testEndpoint();
