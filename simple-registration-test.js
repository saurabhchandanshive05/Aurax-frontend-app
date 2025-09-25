// Simple registration test
console.log("🔍 Testing backend connectivity and registration...");

const testUser = {
  username: "testuser2024",
  email: "test.user.2024@gmail.com", // Change this to your email
  password: "TestPassword123!",
  role: "creator",
};

// Test with fetch if available, otherwise show curl commands
async function testRegistration() {
  console.log("📝 Test user data:");
  console.log(JSON.stringify(testUser, null, 2));

  console.log("\n🚀 Testing registration endpoint...");
  console.log("Backend should be running on http://127.0.0.1:5002");

  // Show curl command for manual testing
  console.log("\n📋 MANUAL TEST COMMAND:");
  console.log("Copy and paste this command in a new terminal:");
  console.log("");
  console.log(`curl -X POST http://127.0.0.1:5002/api/auth/register \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '${JSON.stringify(testUser)}'`);
  console.log("");

  // PowerShell command alternative
  console.log("📋 POWERSHELL ALTERNATIVE:");
  console.log(
    `Invoke-RestMethod -Uri "http://127.0.0.1:5002/api/auth/register" -Method POST -ContentType "application/json" -Body '${JSON.stringify(
      testUser
    )}'`
  );

  console.log("\n📧 Expected result:");
  console.log("- Status 201: Registration successful");
  console.log("- Email sent to: " + testUser.email);
  console.log("- Check inbox and spam folder");

  console.log("\n🔄 To test resend verification:");
  console.log(
    `Invoke-RestMethod -Uri "http://127.0.0.1:5002/api/auth/resend-verification" -Method POST -ContentType "application/json" -Body '{"email":"${testUser.email}"}'`
  );

  console.log("\n✅ If user already exists, you'll get status 409");
  console.log("💡 Try with a different email address");
}

testRegistration();
