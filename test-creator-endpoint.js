/**
 * Test Creator Profile Submission Endpoint
 * This script tests if the /api/onboarding/creator-profile endpoint is accessible
 */

const testEndpoint = async () => {
  try {
    console.log('🔍 Testing creator profile endpoint...\n');
    
    // Test 1: Check if endpoint responds
    const response = await fetch('http://localhost:5002/api/onboarding/creator-profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        test: 'data'
      })
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📊 Response OK: ${response.ok}`);
    
    const data = await response.json();
    console.log('📊 Response Data:', data);
    
    if (response.status === 404) {
      console.log('\n❌ 404 Error - Route not found!');
      console.log('Possible causes:');
      console.log('1. Backend server not running');
      console.log('2. Route not properly mounted');
      console.log('3. Incorrect route path');
    } else if (response.status === 401) {
      console.log('\n✅ Route exists! (401 means auth required - expected)');
    } else if (response.status === 400) {
      console.log('\n✅ Route exists! (400 means validation error - expected)');
    } else {
      console.log(`\n⚠️ Unexpected status: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. Backend is running on port 5002');
    console.log('2. Run: cd backend-copy && node server.js');
  }
};

testEndpoint();
