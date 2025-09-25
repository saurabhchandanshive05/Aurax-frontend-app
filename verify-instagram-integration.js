// Instagram Integration Verification Script
// This simulates the frontend Instagram dashboard component behavior

console.log("🔍 Instagram Integration Verification\n");

// Simulate the same access token used in CreatorDashboard.js
const testToken =
  "IGAAcEeAqNxHZABZAE1wZAlYyWThkei12QmlvYVlaejRIQXBrMElyZAE0zX0VFT1VLZAm9oeTZAqeHVJcFJQYjdEVTJ1ZAktvdUQ1MGF6dS1SZA0tENjladVZAUd2VfdFNmSmtWdlQ5Mm5Db3QtSHNmdk9pd3BWX0lMUzAySEVWNy11cGJYWQZDZD";

// Test the Instagram API directly (bypassing proxy)
const testInstagramAPI = async () => {
  console.log("1. Testing Direct Instagram Graph API...");

  try {
    // Direct API call to Instagram (same as backend does)
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${testToken}`
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ Direct Instagram API Success:");
      console.log(`   Username: @${data.username}`);
      console.log(`   Account Type: ${data.account_type}`);
      console.log(`   Media Count: ${data.media_count}`);

      return true;
    } else {
      const error = await response.json();
      console.log("❌ Direct Instagram API Failed:");
      console.log("   Error:", error);
      return false;
    }
  } catch (error) {
    console.log("❌ Network Error:", error.message);
    return false;
  }
};

// Test frontend API call pattern
const testFrontendAPICall = async () => {
  console.log("\n2. Testing Frontend API Call Pattern...");

  // This is what the InstagramDashboard component does
  try {
    const response = await fetch(
      `/api/instagram/profile?accessToken=${testToken}`
    );

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log("✅ Frontend API Pattern Success:");
        console.log(`   Profile: @${data.profile.username}`);
        console.log(`   Media Posts: ${data.media.length}`);
        console.log(
          `   Engagement Rate: ${data.profile.engagement_metrics.engagement_rate}%`
        );
        return true;
      } else {
        console.log("❌ API returned error:", data.error);
        return false;
      }
    } else {
      console.log("❌ HTTP Error:", response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log("❌ Frontend API Call Failed:", error.message);
    console.log(
      "💡 This is expected if backend is not accessible from this environment"
    );
    return false;
  }
};

// Run tests
const runVerification = async () => {
  const directAPIWorks = await testInstagramAPI();
  const frontendAPIWorks = await testFrontendAPICall();

  console.log("\n📊 Verification Summary:");
  console.log(
    `   Direct Instagram API: ${directAPIWorks ? "✅ Working" : "❌ Failed"}`
  );
  console.log(
    `   Frontend API Pattern: ${
      frontendAPIWorks ? "✅ Working" : "⚠️ Needs Backend"
    }`
  );

  if (directAPIWorks && !frontendAPIWorks) {
    console.log("\n💡 Recommendation:");
    console.log(
      "   The Instagram API token works, but backend connection needs setup."
    );
    console.log(
      "   Ensure your backend includes the Instagram routes and is accessible."
    );
  }

  console.log("\n🎯 Next Action:");
  console.log(
    "   Go to http://localhost:3000 and test the Instagram dashboard manually."
  );
};

runVerification();
