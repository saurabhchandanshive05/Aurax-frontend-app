const axios = require("axios");

// Test the email verification fix
async function testVerificationFlow() {
  console.log("🧪 Testing Email Verification Flow Fix...\n");

  const BASE_URL = "http://localhost:5002/api";
  const testUser = {
    username: `testuser${Date.now()}`,
    email: `test.${Date.now()}@example.com`,
    phone: "+1234567890",
    password: "TestPassword123!",
    role: "brand",
  };

  try {
    // Step 1: Test Registration
    console.log("📝 Step 1: Testing Registration...");
    const registerResponse = await axios.post(`${BASE_URL}/register`, testUser);
    console.log("✅ Registration Response:", registerResponse.data);

    if (!registerResponse.data.success) {
      throw new Error("Registration failed");
    }

    // Step 2: Extract development OTP (if provided)
    const developmentOTP = registerResponse.data.developmentOTP;
    if (developmentOTP) {
      console.log(`🔑 Development OTP received: ${developmentOTP}`);

      // Step 3: Test Email Verification with OTP
      console.log("\n🔍 Step 2: Testing Email Verification...");
      const verifyResponse = await axios.post(`${BASE_URL}/verify-email`, {
        email: testUser.email,
        code: developmentOTP,
      });

      console.log("✅ Verification Response:", verifyResponse.data);

      if (verifyResponse.data.success) {
        console.log(
          "\n🎉 SUCCESS: Email verification flow is working correctly!"
        );
        console.log(
          "User received JWT token:",
          verifyResponse.data.token ? "Yes" : "No"
        );
        console.log("User profile:", verifyResponse.data.user);
      } else {
        throw new Error("Verification failed: " + verifyResponse.data.message);
      }
    } else {
      console.log(
        "⚠️  No development OTP provided. Email was sent to:",
        testUser.email
      );
      console.log("Please check email for verification code or test manually");
    }
  } catch (error) {
    console.error("❌ Test Failed:", error.response?.data || error.message);

    if (error.code === "ECONNREFUSED") {
      console.log(
        "\n💡 Server is not running. Please start the backend server first:"
      );
      console.log("   cd backend-copy");
      console.log("   node server.js");
    }
  }
}

// Check if server is running first
async function checkServerHealth() {
  try {
    const response = await axios.get("http://localhost:5002/api/auth-status");
    console.log("🟢 Server is running:", response.data.message);
    return true;
  } catch (error) {
    console.log("🔴 Server is not running. Please start it first.");
    return false;
  }
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("🧪 AURAX VERIFICATION FIX TEST SUITE");
  console.log("═══════════════════════════════════════\n");

  // Check server status
  const serverRunning = await checkServerHealth();
  if (!serverRunning) {
    return;
  }

  console.log("");

  // Run the test
  await testVerificationFlow();

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Test completed!");
  console.log("═══════════════════════════════════════");
}

main().catch(console.error);
