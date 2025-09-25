console.log("🧪 Quick Login Test");

const fetch = require("node-fetch");

async function quickTest() {
  try {
    // Test health
    const health = await fetch("http://127.0.0.1:5002/health");
    console.log("Health check:", health.status);

    // Test registration
    const user = {
      username: "QuickTest",
      email: `quick.test.${Date.now()}@example.com`,
      password: "QuickPassword123!",
      role: "creator",
    };

    const regResponse = await fetch("http://127.0.0.1:5002/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const regData = await regResponse.json();
    console.log(
      "Registration:",
      regResponse.status,
      regData.success ? "SUCCESS" : "FAILED"
    );

    if (regData.success) {
      // Test login
      const loginResponse = await fetch(
        "http://127.0.0.1:5002/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emailOrPhone: user.email,
            password: user.password,
          }),
        }
      );

      const loginData = await loginResponse.json();
      console.log(
        "Login:",
        loginResponse.status,
        loginData.success ? "SUCCESS" : "FAILED"
      );

      if (loginData.token) {
        console.log("✅ LOGIN WORKING! Token received");
      } else {
        console.log("❌ Login failed:", loginData.message);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

quickTest();
