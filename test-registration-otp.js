// Test Registration and OTP Flow
const http = require("http");

// Test user data
const testUser = {
  username: "testuser2024",
  email: "test.registration@gmail.com", // Use a real email you can check
  password: "TestPassword123!",
  role: "creator",
};

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

// Step 1: Try to delete existing user (if any) via login and delete
async function cleanupExistingUser() {
  console.log("🧹 STEP 1: Cleaning up existing test user...");

  try {
    // Try to login with test credentials to see if user exists
    const loginOptions = {
      hostname: "127.0.0.1",
      port: 5002,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const loginData = JSON.stringify({
      emailOrPhone: testUser.email,
      password: testUser.password,
    });

    const loginResponse = await makeRequest(loginOptions, loginData);

    if (loginResponse.status === 200) {
      console.log("✅ Found existing user, attempting cleanup...");
      // User exists and login successful
      // For now, we'll proceed with registration (it should fail with "email already in use")
      return { userExists: true, canLogin: true };
    } else if (loginResponse.status === 401) {
      console.log("⚠️ User exists but credentials don't match");
      return { userExists: true, canLogin: false };
    } else if (
      loginResponse.status === 404 ||
      loginResponse.data?.message?.includes("not found")
    ) {
      console.log("✅ No existing user found, ready for fresh registration");
      return { userExists: false, canLogin: false };
    } else {
      console.log(
        "❓ Unexpected login response:",
        loginResponse.status,
        loginResponse.data
      );
      return { userExists: false, canLogin: false };
    }
  } catch (error) {
    console.log("❌ Cleanup error:", error.message);
    return { userExists: false, canLogin: false };
  }
}

// Step 2: Test registration
async function testRegistration() {
  console.log("\n👤 STEP 2: Testing user registration...");

  try {
    const regOptions = {
      hostname: "127.0.0.1",
      port: 5002,
      path: "/api/auth/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const regData = JSON.stringify(testUser);
    console.log("📝 Registration payload:", testUser);

    const response = await makeRequest(regOptions, regData);

    console.log(`📊 Registration response: ${response.status}`);
    console.log("📄 Response data:", JSON.stringify(response.data, null, 2));

    if (response.status === 201) {
      console.log("✅ Registration successful!");
      console.log("📧 Check your email for verification code");
      return { success: true, userId: response.data.userId };
    } else if (response.status === 409) {
      console.log("⚠️ User already exists - need to clean up first");
      return { success: false, error: "User exists" };
    } else {
      console.log("❌ Registration failed:", response.data);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log("❌ Registration error:", error.message);
    return { success: false, error: error.message };
  }
}

// Step 3: Test resend verification
async function testResendVerification() {
  console.log("\n🔄 STEP 3: Testing resend verification...");

  try {
    const resendOptions = {
      hostname: "127.0.0.1",
      port: 5002,
      path: "/api/auth/resend-verification",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    };

    const resendData = JSON.stringify({
      email: testUser.email,
    });

    const response = await makeRequest(resendOptions, resendData);

    console.log(`📊 Resend response: ${response.status}`);
    console.log("📄 Response data:", JSON.stringify(response.data, null, 2));

    if (response.status === 200) {
      console.log("✅ Resend verification successful!");
      console.log("📧 Check your email for new verification code");
      return { success: true };
    } else {
      console.log("❌ Resend failed:", response.data);
      return { success: false, error: response.data };
    }
  } catch (error) {
    console.log("❌ Resend error:", error.message);
    return { success: false, error: error.message };
  }
}

// Step 4: Manual verification code input
function promptForVerificationCode() {
  console.log("\n🔐 STEP 4: Manual verification");
  console.log("📧 Please check your email and find the verification code");
  console.log("📝 After finding the code, you can test verification with:");
  console.log(`
    curl -X POST http://127.0.0.1:5002/api/auth/verify \\
      -H "Content-Type: application/json" \\
      -d '{"email":"${testUser.email}","code":"YOUR_CODE_HERE"}'
    `);
}

// Main test flow
async function runRegistrationTest() {
  console.log("🚀 REGISTRATION & OTP TEST SUITE");
  console.log("=".repeat(50));
  console.log(`📧 Test email: ${testUser.email}`);
  console.log(`👤 Test username: ${testUser.username}`);
  console.log("=".repeat(50));

  // Step 1: Cleanup
  const cleanupResult = await cleanupExistingUser();

  // Step 2: Registration
  const regResult = await testRegistration();

  if (!regResult.success) {
    if (regResult.error === "User exists") {
      console.log("\n⚠️ TEST ISSUE: User already exists in database");
      console.log(
        "💡 SOLUTION: Either use a different email or manually delete the user from MongoDB"
      );
      console.log(`📧 Current test email: ${testUser.email}`);
      console.log(
        "\n🔧 To use different email, update the testUser.email in this script"
      );
      return;
    } else {
      console.log("\n❌ Registration failed, cannot continue with OTP test");
      return;
    }
  }

  // Step 3: Test resend
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
  await testResendVerification();

  // Step 4: Manual verification
  promptForVerificationCode();

  console.log("\n" + "=".repeat(50));
  console.log("📋 TEST SUMMARY");
  console.log("=".repeat(50));
  console.log("✅ Backend server: Running");
  console.log(
    `✅ Registration: ${regResult.success ? "Successful" : "Failed"}`
  );
  console.log("📧 Email verification: Pending manual check");
  console.log("\n📝 NEXT STEPS:");
  console.log("1. Check email for verification code");
  console.log("2. Use the curl command above to verify");
  console.log("3. Test login after verification");
}

// Run the test
runRegistrationTest().catch(console.error);
