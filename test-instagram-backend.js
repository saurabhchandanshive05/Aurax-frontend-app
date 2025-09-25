// Test script for Instagram API backend routes
// Run with: node test-instagram-backend.js

const fetch = globalThis.fetch;

const BASE_URL = "http://localhost:5002";
const ACCESS_TOKEN =
  "IGAAcEeAqNxHZABZAE1wZAlYyWThkei12QmlvYVlaejRIQXBrMElyZAE0zX0VFT1VLZAm9oeTZAqeHVJcFJQYjdEVTJ1ZAktvdUQ1MGF6dS1SZA0tENjladVZAUd2VfdFNmSmtWdlQ5Mm5Db3QtSHNmdk9pd3BWX0lMUzAySEVWNy11cGJYWQZDZD";

async function testInstagramBackend() {
  console.log("🧪 Testing Instagram Backend API Routes\n");

  try {
    // Test 1: Health check
    console.log("🔍 Test 1: Health Check");
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();

    if (healthData.success) {
      console.log("✅ Backend server is running");
      console.log(`   Server: ${healthData.message}`);
    } else {
      throw new Error("Health check failed");
    }

    // Test 2: Instagram status endpoint
    console.log("\n🔍 Test 2: Instagram Status Endpoint");
    const statusResponse = await fetch(`${BASE_URL}/api/instagram/status`);
    const statusData = await statusResponse.json();

    if (statusData.success) {
      console.log("✅ Instagram routes are active");
      console.log(`   Available endpoints: ${statusData.endpoints.length}`);
    } else {
      throw new Error("Instagram status check failed");
    }

    // Test 3: Instagram profile endpoint
    console.log("\n🔍 Test 3: Instagram Profile Fetch");
    const profileResponse = await fetch(
      `${BASE_URL}/api/instagram/profile?accessToken=${ACCESS_TOKEN}`
    );
    const profileData = await profileResponse.json();

    if (profileData.success) {
      console.log("✅ Instagram profile data fetched successfully");
      console.log(`   Username: @${profileData.profile.username}`);
      console.log(`   Account Type: ${profileData.profile.account_type}`);
      console.log(
        `   Followers: ${profileData.profile.followers_count.toLocaleString()}`
      );
      console.log(`   Posts Retrieved: ${profileData.media.length}`);
      console.log(
        `   Engagement Rate: ${profileData.profile.engagement_metrics.engagement_rate}%`
      );

      // Test sample media
      if (profileData.media.length > 0) {
        const samplePost = profileData.media[0];
        console.log("\n📱 Sample Post:");
        console.log(`   Likes: ${samplePost.like_count}`);
        console.log(`   Comments: ${samplePost.comments_count}`);
        console.log(`   Date: ${samplePost.formatted_date}`);
        console.log(`   Type: ${samplePost.media_type}`);
      }
    } else {
      throw new Error(`Profile fetch failed: ${profileData.error}`);
    }

    // Test 4: Instagram insights (optional)
    console.log("\n🔍 Test 4: Instagram Insights (Optional)");
    try {
      const insightsResponse = await fetch(
        `${BASE_URL}/api/instagram/insights?accessToken=${ACCESS_TOKEN}`
      );
      const insightsData = await insightsResponse.json();

      if (insightsData.success) {
        console.log("✅ Instagram insights fetched successfully");
        console.log(`   Insights available: ${insightsData.insights.length}`);
      } else {
        console.log(
          "⚠️ Instagram insights not available (requires Business account)"
        );
      }
    } catch (insightsError) {
      console.log("⚠️ Instagram insights endpoint not available");
    }

    console.log("\n🎉 All Backend Tests Completed Successfully!");
    console.log("\n📋 Summary:");
    console.log("✅ Backend server running");
    console.log("✅ Instagram routes active");
    console.log("✅ Profile data retrieval working");
    console.log("✅ Media posts fetched");
    console.log("✅ Engagement metrics calculated");

    console.log("\n🚀 Ready for Frontend Integration!");
    console.log("Next steps:");
    console.log("1. Start your React frontend: npm start");
    console.log("2. Login to creator dashboard");
    console.log('3. Click "Enhanced View" in Instagram section');
    console.log("4. View your Instagram profile and media!");
  } catch (error) {
    console.error("\n❌ Backend test failed:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("1. Ensure backend server is running on port 5002");
    console.log("2. Check that Instagram API routes are properly integrated");
    console.log("3. Verify access token is valid and not expired");
    console.log("4. Make sure all required npm packages are installed");

    console.log("\n💡 Quick fixes:");
    console.log("- Start backend: node backend-integration-setup.js");
    console.log("- Check logs for detailed error messages");
    console.log("- Test individual endpoints manually");
  }
}

// Run the tests
testInstagramBackend();
