// Direct Node.js registration test
const http = require("http");

// Test user data - UPDATE THIS EMAIL TO YOUR REAL EMAIL
const testUser = {
  username: "testuser2024",
  email: "test.registration.otp.2024@gmail.com", // Test email - change this to your real email
  password: "TestPassword123!",
  role: "creator",
};

console.log("🚀 DIRECT REGISTRATION TEST");
console.log("==========================");
console.log(
  "⚠️  IMPORTANT: Update the email address in testUser object to your real email!"
);
console.log(`📧 Current email: ${testUser.email}`);
console.log("");

function testRegistration() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(testUser);

    const options = {
      hostname: "127.0.0.1",
      port: 5002,
      path: "/api/auth/register",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    console.log("📤 Sending registration request...");
    console.log(
      "🎯 Target:",
      `http://${options.hostname}:${options.port}${options.path}`
    );
    console.log("📦 Payload:", testUser);

    const req = http.request(options, (res) => {
      console.log(`📊 Response Status: ${res.statusCode}`);
      console.log("📋 Response Headers:", res.headers);

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          console.log("📄 Response Body:", JSON.stringify(response, null, 2));

          if (res.statusCode === 201) {
            console.log("✅ REGISTRATION SUCCESSFUL!");
            console.log("📧 Check your email for verification code");
            resolve({ success: true, data: response });
          } else if (res.statusCode === 409) {
            console.log(
              "⚠️  User already exists - this is expected if testing multiple times"
            );
            resolve({ success: false, reason: "User exists", data: response });
          } else {
            console.log("❌ Registration failed");
            resolve({ success: false, reason: "Server error", data: response });
          }
        } catch (error) {
          console.log("❌ Failed to parse response:", data);
          resolve({ success: false, reason: "Parse error", raw: data });
        }
      });
    });

    req.on("error", (error) => {
      console.log("❌ Request Error:", error.message);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.log("❌ Request timeout");
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.write(postData);
    req.end();
  });
}

async function testResendVerification() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ email: testUser.email });

    const options = {
      hostname: "127.0.0.1",
      port: 5002,
      path: "/api/auth/resend-verification",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(postData),
      },
    };

    console.log("\n🔄 Testing resend verification...");

    const req = http.request(options, (res) => {
      console.log(`📊 Resend Status: ${res.statusCode}`);

      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          console.log("📄 Resend Response:", JSON.stringify(response, null, 2));

          if (res.statusCode === 200) {
            console.log("✅ RESEND SUCCESSFUL!");
            console.log("📧 Check your email for new verification code");
          }
          resolve({ success: res.statusCode === 200, data: response });
        } catch (error) {
          console.log("❌ Failed to parse resend response:", data);
          resolve({ success: false, raw: data });
        }
      });
    });

    req.on("error", (error) => {
      console.log("❌ Resend Error:", error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  try {
    // Test registration
    const regResult = await testRegistration();

    // If registration successful or user exists, try resend
    if (regResult.success || regResult.reason === "User exists") {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second
      await testResendVerification();
    }

    console.log("\n" + "=".repeat(50));
    console.log("📋 TEST COMPLETE");
    console.log("=".repeat(50));

    if (regResult.success) {
      console.log("✅ Registration: SUCCESS");
      console.log("📧 Action required: Check your email for verification code");
      console.log(
        "💡 Next step: Use the verification code to verify your account"
      );
    } else if (regResult.reason === "User exists") {
      console.log("⚠️  Registration: User already exists (expected)");
      console.log(
        "📧 Action required: Check your email for resent verification code"
      );
    } else {
      console.log("❌ Registration: FAILED");
      console.log("💡 Check server logs for more details");
    }

    console.log("\n🔗 To verify manually after receiving the code:");
    console.log("Use this format in a new terminal:");
    console.log(
      `Invoke-RestMethod -Uri "http://localhost:5002/api/auth/verify" -Method POST -ContentType "application/json" -Body '{"email":"${testUser.email}","code":"YOUR_CODE_HERE"}'`
    );
  } catch (error) {
    console.log("❌ Test failed:", error.message);
    console.log("💡 Make sure the backend server is running on port 5002");
  }
}

main();
