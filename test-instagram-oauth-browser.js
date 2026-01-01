/**
 * 🧪 Quick Test Script for Instagram OAuth Integration
 * 
 * Run this in browser console after backend is running
 * Navigate to: http://localhost:3000/creator/dashboard
 * Open DevTools Console and paste this script
 */

console.log('🧪 Starting Instagram OAuth Integration Test...\n');

// Test 1: Check if token exists
const token = localStorage.getItem('token');
if (!token) {
  console.error('❌ Test 1 FAILED: No authentication token found');
  console.log('   → Please login first');
} else {
  console.log('✅ Test 1 PASSED: Authentication token found');
}

// Test 2: Fetch user data from /api/me
async function testMeEndpoint() {
  console.log('\n📍 Test 2: Fetching data from /api/me...');
  
  try {
    const response = await fetch('http://localhost:5002/api/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.user) {
      console.log('✅ Test 2 PASSED: /api/me endpoint working');
      console.log('   User ID:', data.user._id);
      console.log('   Username:', data.user.username);
      console.log('   Email:', data.user.email);
      
      // Check Instagram data
      if (data.user.instagram) {
        console.log('\n📱 Instagram Data Found:');
        console.log('   Connected:', data.user.instagram.connected);
        
        if (data.user.instagram.connected) {
          console.log('   ✅ Instagram Username:', data.user.instagram.username);
          console.log('   ✅ Account ID:', data.user.instagram.accountId);
          console.log('   ✅ Followers:', data.user.instagram.followersCount);
          console.log('   ✅ Profile Picture:', data.user.instagram.profilePicture);
        } else {
          console.log('   ℹ️  Instagram not connected yet');
        }
      } else {
        console.error('   ❌ Instagram field MISSING in response');
        console.error('   → Fix not applied or backend not restarted');
      }
      
      // Store for inspection
      window.testUserData = data.user;
      console.log('\n💾 User data stored in: window.testUserData');
      
    } else {
      console.error('❌ Test 2 FAILED: Invalid response structure');
      console.log('   Response:', data);
    }
  } catch (error) {
    console.error('❌ Test 2 FAILED: Request error');
    console.error('   Error:', error.message);
  }
}

// Test 3: Check dashboard endpoint
async function testDashboardEndpoint() {
  console.log('\n📍 Test 3: Fetching data from /api/creator/dashboard...');
  
  try {
    const response = await fetch('http://localhost:5002/api/creator/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (data.success && data.creator) {
      console.log('✅ Test 3 PASSED: /api/creator/dashboard endpoint working');
      
      if (data.creator.instagram) {
        console.log('\n📱 Dashboard Instagram Data:');
        console.log('   Connected:', data.creator.instagram.connected);
        
        if (data.creator.instagram.connected) {
          console.log('   ✅ Username:', data.creator.instagram.username);
          console.log('   ✅ Account ID:', data.creator.instagram.accountId);
          console.log('   ✅ Followers:', data.creator.instagram.followersCount);
        }
      } else {
        console.warn('   ⚠️  Instagram field missing in dashboard response');
      }
      
      window.testDashboardData = data.creator;
      console.log('\n💾 Dashboard data stored in: window.testDashboardData');
      
    } else {
      console.error('❌ Test 3 FAILED: Invalid response structure');
      console.log('   Response:', data);
    }
  } catch (error) {
    console.error('❌ Test 3 FAILED: Request error');
    console.error('   Error:', error.message);
  }
}

// Test 4: Check MongoDB connection (backend check)
console.log('\n📍 Test 4: Check backend logs for MongoDB queries');
console.log('   → Open backend terminal and look for:');
console.log('   → "📊 /api/me called for user: { hasInstagram: true/false }"');

// Run all tests
if (token) {
  (async () => {
    await testMeEndpoint();
    await testDashboardEndpoint();
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 TEST SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n📋 Next Steps:');
    console.log('1. If Instagram data is MISSING in /api/me:');
    console.log('   → Backend fix not applied or not restarted');
    console.log('   → Restart backend: cd backend-copy && node server.js');
    console.log('');
    console.log('2. If Instagram shows "connected: false":');
    console.log('   → Click "Connect Instagram" button on dashboard');
    console.log('   → Complete Meta OAuth flow');
    console.log('   → Run this test again after OAuth');
    console.log('');
    console.log('3. If test shows "connected: true":');
    console.log('   → ✅ Integration working correctly!');
    console.log('   → Check dashboard UI shows connection details');
    console.log('');
    console.log('4. To inspect full data:');
    console.log('   → Type: window.testUserData');
    console.log('   → Type: window.testDashboardData');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  })();
}

// Export test functions for manual testing
window.testInstagramIntegration = {
  testMeEndpoint,
  testDashboardEndpoint,
  runAll: async () => {
    await testMeEndpoint();
    await testDashboardEndpoint();
  }
};

console.log('\n💡 TIP: Run individual tests with:');
console.log('   window.testInstagramIntegration.testMeEndpoint()');
console.log('   window.testInstagramIntegration.testDashboardEndpoint()');
console.log('   window.testInstagramIntegration.runAll()');
