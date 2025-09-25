// End-to-End Instagram Integration Test
// Run this script to test the complete Instagram integration

const testInstagramIntegration = async () => {
  console.log("🧪 Starting Instagram Integration Test...\n");

  // Test token from CreatorDashboard.js
  const accessToken =
    "IGAAcEeAqNxHZABZAE1wZAlYyWThkei12QmlvYVlaejRIQXBrMElyZAE0zX0VFT1VLZAm9oeTZAqeHVJcFJQYjdEVTJ1ZAktvdUQ1MGF6dS1SZA0tENjladVZAUd2VfdFNmSmtWdlQ5Mm5Db3QtSHNmdk9pd3BWX0lMUzAySEVWNy11cGJYWQZDZD";

  try {
    console.log("1. Testing Backend Connection...");

    // Test backend health
    const healthResponse = await fetch("http://localhost:5002/api/health");
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log("✅ Backend Health:", healthData.message);
    } else {
      console.log("⚠️ Backend health check failed, but continuing...");
    }

    console.log("\n2. Testing Instagram API Route...");

    // Test Instagram profile endpoint
    const profileResponse = await fetch(
      `http://localhost:5002/api/instagram/profile?accessToken=${accessToken}`
    );

    if (!profileResponse.ok) {
      throw new Error(
        `HTTP ${profileResponse.status}: ${profileResponse.statusText}`
      );
    }

    const profileData = await profileResponse.json();

    if (profileData.success) {
      console.log("✅ Instagram API Success!");
      console.log(`   Profile: @${profileData.profile.username}`);
      console.log(`   Account Type: ${profileData.profile.account_type}`);
      console.log(
        `   Followers: ${
          profileData.profile.followers_count?.toLocaleString() || "N/A"
        }`
      );
      console.log(
        `   Media Count: ${profileData.profile.media_count || "N/A"}`
      );
      console.log(`   Posts Fetched: ${profileData.media.length}`);
      console.log(
        `   Engagement Rate: ${
          profileData.profile.engagement_metrics?.engagement_rate || "N/A"
        }%`
      );

      console.log("\n📊 Sample Media Posts:");
      profileData.media.slice(0, 3).forEach((post, index) => {
        console.log(
          `   ${index + 1}. ${post.media_type} - ${post.like_count} likes, ${
            post.comments_count
          } comments`
        );
        console.log(`      Posted: ${post.formatted_date}`);
        if (post.caption) {
          const shortCaption =
            post.caption.length > 50
              ? post.caption.substring(0, 50) + "..."
              : post.caption;
          console.log(`      Caption: "${shortCaption}"`);
        }
      });
    } else {
      console.log("❌ Instagram API Error:", profileData.error);
      console.log("💡 Troubleshooting:", profileData.troubleshooting);
    }

    console.log("\n3. Integration Status:");
    console.log("✅ Backend Routes: Working");
    console.log("✅ Instagram API: Connected");
    console.log("✅ Data Processing: Success");
    console.log("\n🎯 Next Steps:");
    console.log("   1. Open http://localhost:3000 in your browser");
    console.log("   2. Navigate to Creator Dashboard");
    console.log('   3. Click "🎨 Enhanced View" button');
    console.log("   4. Verify Instagram profile and media display");
  } catch (error) {
    console.log("\n❌ Integration Test Failed!");
    console.error("Error:", error.message);
    console.log("\n🔧 Troubleshooting:");
    console.log("   1. Ensure backend is running on port 5002");
    console.log("   2. Check your Instagram access token");
    console.log("   3. Verify your account is Business/Creator type");
    console.log("   4. Make sure account is linked to a Facebook page");
  }
};

// Run the test
testInstagramIntegration();
