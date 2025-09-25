// Password Fix Test
const fetch = require("node-fetch");

const BASE_URL = "http://127.0.0.1:5002";
const API_BASE = `${BASE_URL}/api`;

async function testPasswordFix() {
  console.log("🔧 Testing Password Fix");

  // Create a new test user
  const testUser = {
    username: "PasswordFixTest",
    email: `passwordfix.test.${Date.now()}@example.com`,
    password: "PasswordFix123!",
    role: "creator",
  };

  try {
    console.log("📝 Registering user:", testUser.email);

    // Step 1: Register user
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const registerData = await registerResponse.json();
    console.log("📋 Registration:", {
      status: registerResponse.status,
      success: registerData.success,
      message: registerData.message,
    });

    if (!registerData.success) {
      console.error("❌ Registration failed:", registerData);
      return;
    }

    console.log("\n🔐 Testing login with same credentials...");

    // Step 2: Login with same credentials
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: testUser.email,
        password: testUser.password,
      }),
    });

    const loginData = await loginResponse.json();
    console.log("🔑 Login:", {
      status: loginResponse.status,
      success: loginData.success,
      message: loginData.message,
      hasToken: !!loginData.token,
    });

    if (loginData.success && loginData.token) {
      console.log("✅ PASSWORD FIX SUCCESS! Login working correctly");
      console.log(
        "🎯 Token received:",
        loginData.token.substring(0, 20) + "..."
      );

      // Step 3: Test protected route with token
      const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });

      if (profileResponse.status === 200) {
        console.log("🔒 Protected route access: SUCCESS");
      } else {
        console.log("🔒 Protected route access: FAILED");
      }
    } else {
      console.log("❌ PASSWORD FIX FAILED");
      console.log("Login response:", loginData);
    }
  } catch (error) {
    console.error("💥 Test failed:", error.message);
  }
}

testPasswordFix();
