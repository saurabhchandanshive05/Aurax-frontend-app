const fetch = require("node-fetch");

async function testMinimal() {
  console.log("🧪 Testing minimal server on port 5003");

  try {
    // Test health
    const health = await fetch("http://127.0.0.1:5003/health");
    const healthData = await health.json();
    console.log("✅ Health:", health.status, healthData.status);

    // Test registration
    const regResponse = await fetch("http://127.0.0.1:5003/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "TestUser",
        email: "test@example.com",
        password: "password123",
        role: "creator",
      }),
    });

    const regData = await regResponse.json();
    console.log(
      "✅ Registration:",
      regResponse.status,
      regData.success ? "SUCCESS" : "FAILED"
    );

    // Test login
    const loginResponse = await fetch("http://127.0.0.1:5003/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: "test@example.com",
        password: "password123",
      }),
    });

    const loginData = await loginResponse.json();
    console.log(
      "✅ Login:",
      loginResponse.status,
      loginData.success ? "SUCCESS" : "FAILED"
    );
    console.log("Token:", loginData.token);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testMinimal();
