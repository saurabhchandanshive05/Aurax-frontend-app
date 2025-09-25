// Simple Backend Test - User Registration & Login Validation
const fetch = require("node-fetch");

async function simpleTest() {
  console.log("🧪 Backend Validation Test");
  console.log("Testing: User Registration, Login Flow, Email Service");
  console.log("=".repeat(50));

  const API_BASE = "http://127.0.0.1:5002/api";

  try {
    // 1. Health Check
    console.log("\n1️⃣ Health Check...");
    const health = await fetch("http://127.0.0.1:5002/health");
    const healthData = await health.json();
    console.log(`   Status: ${health.status} - ${healthData.status}`);

    if (health.status !== 200) {
      console.log("❌ Health check failed - stopping tests");
      return;
    }

    // 2. User Registration
    console.log("\n2️⃣ User Registration...");
    const user = {
      username: `TestUser${Date.now()}`,
      email: `test.${Date.now()}@example.com`,
      password: "TestPassword123!",
      role: "creator",
    };

    const regResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const regData = await regResponse.json();
    console.log(`   Registration Status: ${regResponse.status}`);
    console.log(`   Success: ${regData.success}`);
    console.log(`   Email Sent: ${regData.emailSent}`);

    if (!regData.success) {
      console.log("❌ Registration failed");
      return;
    }

    // 3. Login Test (PASSWORD FIX VALIDATION)
    console.log("\n3️⃣ Login Flow (Password Fix Test)...");
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: user.email,
        password: user.password,
      }),
    });

    const loginData = await loginResponse.json();
    console.log(`   Login Status: ${loginResponse.status}`);
    console.log(`   Success: ${loginData.success}`);
    console.log(`   Token Generated: ${!!loginData.token}`);

    if (loginData.success && loginData.token) {
      console.log("✅ PASSWORD FIX WORKING! Login successful with token");

      // Test protected route
      const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });
      console.log(
        `   Protected Route Access: ${
          profileResponse.status === 200 ? "SUCCESS" : "FAILED"
        }`
      );
    } else {
      console.log("❌ PASSWORD FIX NEEDED - Login failed");
      console.log(`   Error: ${loginData.message}`);
    }

    // 4. Email Service Test
    console.log("\n4️⃣ Email Service...");
    const emailResponse = await fetch(`${API_BASE}/test-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "test@example.com",
        subject: "Test Email",
        body: "Testing SMTP service",
      }),
    });

    const emailData = await emailResponse.json();
    console.log(`   Email Status: ${emailResponse.status}`);
    console.log(`   SMTP Success: ${emailData.status === "success"}`);
    if (emailData.result?.messageId) {
      console.log(`   Message ID: ${emailData.result.messageId}`);
    }

    // 5. Input Validation Test
    console.log("\n5️⃣ Input Validation...");
    const invalidResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email" }),
    });

    console.log(
      `   Invalid Input Rejection: ${
        invalidResponse.status === 400 ? "WORKING" : "FAILED"
      }`
    );

    console.log("\n" + "=".repeat(50));
    console.log("🎯 BACKEND VALIDATION COMPLETE");
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

simpleTest();
