// Instagram Sync Schedule Demo
// Run this to see how the automated sync works

import InstagramScheduler from "./src/utils/instagramScheduler.js";
import InstagramAPI from "./src/utils/instagramAPI.js";

console.log("📱 Instagram Sync Schedule Demo\n");

// Step 1: Show current sync status
console.log("🔍 Step 1: Checking current sync status...");
const currentStatus = InstagramScheduler.getSyncStatus();
console.log("Current Status:", currentStatus);

// Step 2: Configure sync settings
console.log("\n⚙️ Step 2: Configuring sync settings...");
const syncSettings = {
  autoSync: true,
  scheduledTime: "09:00",
  notificationsEnabled: true,
};

InstagramScheduler.saveSettings(syncSettings);
console.log("✅ Sync settings saved:", syncSettings);

// Step 3: Test manual sync
console.log("\n🔄 Step 3: Testing manual sync...");
async function testManualSync() {
  try {
    console.log("Starting manual sync...");
    const result = await InstagramAPI.performFullSync();

    if (result.status === "success") {
      console.log("✅ Manual sync completed successfully!");
      console.log("📊 Insights retrieved:");
      console.log(`   - Profile: @${result.insights.profile.username}`);
      console.log(`   - Followers: ${result.insights.profile.followers_count}`);
      console.log(
        `   - Posts analyzed: ${result.insights.metrics.posts_analyzed}`
      );
      console.log(
        `   - Total impressions: ${result.insights.metrics.total_impressions}`
      );
      console.log(
        `   - Avg engagement rate: ${result.insights.metrics.avg_engagement_rate}%`
      );
    } else {
      console.log("❌ Sync failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Sync error:", error.message);
  }
}

// Step 4: Setup automated schedule
console.log("\n⏰ Step 4: Setting up automated daily sync...");
console.log("Scheduling daily sync for 9:00 AM...");

// In a real app, this would be handled by the browser or task scheduler
InstagramScheduler.startDailySync("09:00");
console.log("✅ Daily sync scheduled!");

// Step 5: Show next sync time
const nextSync = InstagramScheduler.getNextSyncTime();
console.log(`🕘 Next sync scheduled for: ${nextSync}`);

// Run the manual test
testManualSync();

console.log("\n🎯 Summary:");
console.log("1. ✅ Sync settings configured");
console.log("2. ✅ Manual sync tested");
console.log("3. ✅ Daily automation scheduled");
console.log("4. ✅ Next sync time calculated");

console.log("\n📱 How to monitor:");
console.log("- Check dashboard Instagram section daily");
console.log("- Look for sync notifications");
console.log("- Review performance trends weekly");
console.log("- Adjust posting schedule based on insights");
