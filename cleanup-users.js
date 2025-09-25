const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

// Import the User model (assuming it's in the models directory)
const User = require("./models/User");

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// User accounts to remove
const emailsToRemove = [
  "sourabh.chandanshive@gmail.com",
  "Saurabhchandan5498@gmail.com",
  "Saurabhchandan544@gmail.com",
  "Saurabhchandan05@gmail.com",
];

const removeUserAccounts = async () => {
  try {
    console.log("🗑️  Starting user account cleanup...\n");

    for (const email of emailsToRemove) {
      console.log(`🔍 Searching for user: ${email}`);

      // Find and remove user by email
      const result = await User.findOneAndDelete({
        email: { $regex: new RegExp(`^${email}$`, "i") }, // Case-insensitive search
      });

      if (result) {
        console.log(`✅ Removed user: ${email}`);
        console.log(`   - Username: ${result.username}`);
        console.log(`   - Role: ${result.role}`);
        console.log(`   - Created: ${result.createdAt}`);
        console.log(`   - Verified: ${result.isVerified ? "Yes" : "No"}`);
      } else {
        console.log(`ℹ️  User not found: ${email}`);
      }
      console.log(""); // Empty line for readability
    }

    // Also check for any users with similar usernames (in case they were created with different emails)
    console.log("🔍 Checking for users with similar usernames...");
    const usernamePatterns = ["testuser2024", "saurabh", "sourabh"];

    for (const pattern of usernamePatterns) {
      const users = await User.find({
        username: { $regex: new RegExp(pattern, "i") },
      });

      if (users.length > 0) {
        console.log(
          `\n📋 Found ${users.length} user(s) matching "${pattern}":`
        );
        for (const user of users) {
          console.log(`   - ${user.username} (${user.email}) - ${user.role}`);
          console.log(
            `     Created: ${user.createdAt}, Verified: ${
              user.isVerified ? "Yes" : "No"
            }`
          );

          // Ask if you want to remove these too
          console.log(
            `     To remove this user, run: db.users.deleteOne({email: "${user.email}"})`
          );
        }
      }
    }

    console.log("\n✅ User cleanup completed!");
    console.log("🎯 You can now test registration with fresh accounts");
  } catch (error) {
    console.error("❌ Error during user cleanup:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
    process.exit(0);
  }
};

// Run the cleanup
const main = async () => {
  await connectDB();
  await removeUserAccounts();
};

main().catch((error) => {
  console.error("❌ Script error:", error);
  process.exit(1);
});
