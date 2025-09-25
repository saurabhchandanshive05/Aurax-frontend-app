// Debug Login Test
const fetch = require("node-fetch");

const BASE_URL = "http://127.0.0.1:5002";
const API_BASE = `${BASE_URL}/api`;

async function debugLogin() {
  console.log("🔍 Debug Login Test");

  // First register a user
  const testUser = {
    username: "DebugUser",
    email: `debug.user.${Date.now()}@example.com`,
    password: "DebugPassword123!",
    role: "creator",
  };

  console.log("📝 Registering user:", testUser.email);

  const registerResponse = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(testUser),
  });

  const registerData = await registerResponse.json();
  console.log("📋 Registration response:", {
    status: registerResponse.status,
    data: registerData,
  });

  if (registerResponse.status !== 201 && registerResponse.status !== 200) {
    console.error("❌ Registration failed");
    return;
  }

  // Now try to login
  console.log("\n🔐 Attempting login with:", testUser.email);

  const loginResponse = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      emailOrPhone: testUser.email,
      password: testUser.password,
    }),
  });

  const loginData = await loginResponse.json();
  console.log("🔑 Login response:", {
    status: loginResponse.status,
    data: loginData,
  });

  // Check if it's a verification issue
  if (loginData.requiresVerification) {
    console.log("📧 User requires email verification");
  }

  if (loginData.token) {
    console.log("✅ Login successful - Token received");
  } else {
    console.log("❌ Login failed - No token in response");
  }
}

debugLogin().catch((error) => {
  console.error("💥 Debug test failed:", error.message);
});
