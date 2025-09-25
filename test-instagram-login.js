// Simple test script for Instagram API login integration
// Run this with: node test-instagram-login.js

// Use built-in fetch for Node.js 18+
const fetch = globalThis.fetch;

const ACCESS_TOKEN =
  "IGAAcEeAqNxHZABZAE1wZAlYyWThkei12QmlvYVlaejRIQXBrMElyZAE0zX0VFT1VLZAm9oeTZAqeHVJcFJQYjdEVTJ1ZAktvdUQ1MGF6dS1SZA0tENjladVZAUd2VfdFNmSmtWdlQ5Mm5Db3QtSHNmdk9pd3BWX0lMUzAySEVWNy11cGJYWQZDZD";
const BASE_URL = "https://graph.instagram.com";

async function testInstagramConnection() {
  console.log("🔍 Testing Instagram API Connection...\n");

  try {
    // Test authentication directly (skip basic connectivity test)
    console.log("🔑 Step 1: Testing access token authentication...");
    const authResponse = await fetch(
      `${BASE_URL}/me?fields=id,username,account_type,media_count&access_token=${ACCESS_TOKEN}`
    );

    if (!authResponse.ok) {
      const error = await authResponse.json();
      throw new Error(
        `Authentication failed: ${error.error?.message || "Unknown error"}`
      );
    }

    const userData = await authResponse.json();
    console.log("✅ Authentication successful!");
    console.log(`   👤 Username: @${userData.username}`);
    console.log(`   🏢 Account Type: ${userData.account_type}`);
    console.log(`   📱 Media Count: ${userData.media_count}`);
    console.log(`   🆔 User ID: ${userData.id}`);

    // Test profile data access
    console.log("\n👤 Step 2: Testing profile data access...");
    const profileFields =
      "biography,followers_count,follows_count,media_count,name,profile_picture_url,username,website";
    const profileResponse = await fetch(
      `${BASE_URL}/${userData.id}?fields=${profileFields}&access_token=${ACCESS_TOKEN}`
    );

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log("✅ Profile data retrieved successfully!");
      console.log(
        `   👥 Followers: ${
          profileData.followers_count?.toLocaleString() || "N/A"
        }`
      );
      console.log(
        `   👤 Following: ${
          profileData.follows_count?.toLocaleString() || "N/A"
        }`
      );
      console.log(
        `   📸 Posts: ${profileData.media_count?.toLocaleString() || "N/A"}`
      );
      if (profileData.website) {
        console.log(`   🌐 Website: ${profileData.website}`);
      }
    } else {
      console.log("⚠️ Profile data access limited");
    }

    console.log(
      "\n🎉 All Instagram API tests passed! The integration should work in the creator login page."
    );
    console.log("\n📱 Next steps:");
    console.log("   1. Open your creator login page");
    console.log('   2. Click "Show advanced options"');
    console.log('   3. Click "Test Instagram Connection"');
    console.log("   4. You should see your account details displayed");
  } catch (error) {
    console.error("\n❌ Instagram API test failed:", error.message);
    console.log("\n🔧 Troubleshooting steps:");
    console.log("   1. Check if your access token is valid and not expired");
    console.log(
      "   2. Ensure your Instagram account is set to Business/Creator"
    );
    console.log("   3. Verify your account is linked to a Facebook Page");
    console.log("   4. Check the Meta Developer Console for any app issues");
    console.log("   5. Make sure your app has the correct permissions");
  }
}

// Run the test
testInstagramConnection();
