// Simple backend connectivity test
const http = require("http");

function testBackendConnectivity() {
  console.log("🔍 Testing backend connectivity...");

  // Test basic connection
  const options = {
    hostname: "127.0.0.1",
    port: 5002,
    path: "/",
    method: "GET",
    headers: {
      "User-Agent": "Backend-Test/1.0",
    },
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Connection successful: ${res.statusCode}`);
    console.log(`   Headers:`, res.headers);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      console.log(`   Response body:`, data.slice(0, 200));
    });
  });

  req.on("error", (error) => {
    console.log("❌ Connection failed:", error.message);
  });

  req.setTimeout(5000, () => {
    console.log("❌ Connection timeout");
    req.destroy();
  });

  req.end();
}

// Test specific auth endpoints
function testAuthEndpoints() {
  console.log("\n🔍 Testing auth endpoints...");

  // Test registration endpoint
  const testData = JSON.stringify({
    email: "test@example.com",
    password: "Test123!@#",
    confirmPassword: "Test123!@#",
    role: "creator",
  });

  const options = {
    hostname: "127.0.0.1",
    port: 5002,
    path: "/auth/register",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(testData),
      "User-Agent": "Backend-Test/1.0",
    },
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Registration endpoint responded: ${res.statusCode}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const response = JSON.parse(data);
        console.log(`   Response:`, response);
      } catch (e) {
        console.log(`   Raw response:`, data.slice(0, 200));
      }
    });
  });

  req.on("error", (error) => {
    console.log("❌ Registration endpoint failed:", error.message);
  });

  req.setTimeout(5000, () => {
    console.log("❌ Registration endpoint timeout");
    req.destroy();
  });

  req.write(testData);
  req.end();
}

console.log("=".repeat(60));
console.log("BACKEND CONNECTIVITY DIAGNOSTIC");
console.log("=".repeat(60));

testBackendConnectivity();

setTimeout(() => {
  testAuthEndpoints();
}, 2000);

setTimeout(() => {
  console.log("\n" + "=".repeat(60));
  console.log("DIAGNOSTIC COMPLETE");
  console.log("=".repeat(60));
}, 5000);
