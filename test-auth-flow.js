// AURAX Authentication Flow Manual Test Script
// Run this in Node.js to test the backend API endpoints

const fetch = require("node-fetch");

class AuthFlowTester {
  constructor() {
    this.apiUrl = "http://localhost:5002";
    this.testEmail = `test.user.${Date.now()}@example.com`;
    this.testPassword = "TestPassword123!";
    this.testUsername = `testuser${Date.now()}`;
    this.authToken = null;

    console.log("\n🧪 AURAX Authentication Flow Test");
    console.log("=".repeat(50));
    console.log(`📧 Test Email: ${this.testEmail}`);
    console.log(`👤 Test Username: ${this.testUsername}`);
    console.log(`🔒 Test Password: ${this.testPassword}`);
    console.log("=".repeat(50));
  }

  async testBackendHealth() {
    console.log("\n1️⃣ Testing Backend Health...");
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      if (response.ok) {
        console.log("✅ Backend is healthy and responding");
        return true;
      } else {
        console.log(`❌ Backend health check failed: ${response.status}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Backend is not accessible: ${error.message}`);
      return false;
    }
  }

  async testRegistration() {
    console.log("\n2️⃣ Testing User Registration...");
    try {
      const registrationData = {
        username: this.testUsername,
        email: this.testEmail,
        password: this.testPassword,
        role: "creator",
      };

      const response = await fetch(`${this.apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Registration successful");
        console.log(`📋 Response: ${data.message}`);
        return true;
      } else {
        console.log(`❌ Registration failed: ${data.message}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Registration error: ${error.message}`);
      return false;
    }
  }

  async testEmailSending() {
    console.log("\n3️⃣ Testing Direct Email Sending...");
    try {
      // Generate a verification code
      const verificationCode = Math.floor(
        100000 + Math.random() * 900000
      ).toString();
      console.log(`📧 Sending verification code: ${verificationCode}`);

      // Test the verification service directly
      const verificationService = require("./backend-copy/services/verificationService");
      const result = await verificationService.sendVerificationEmail(
        "sauravaura3@gmail.com",
        verificationCode
      );

      if (result.success) {
        console.log("✅ Email sent successfully via SendGrid");
        console.log(`📨 Message ID: ${result.messageId}`);
        console.log(`⏱️ Send time: ${result.sendTime}ms`);
        return true;
      } else {
        console.log(`❌ Email sending failed: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Email sending error: ${error.message}`);
      return false;
    }
  }

  async testLogin() {
    console.log("\n4️⃣ Testing Login (with simulated verified user)...");
    try {
      const loginData = {
        email: this.testEmail,
        password: this.testPassword,
      };

      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        this.authToken = data.token;
        console.log("✅ Login successful");
        console.log(`🎫 Token received: ${data.token.substring(0, 30)}...`);
        return true;
      } else {
        console.log(`❌ Login failed: ${data.message}`);
        // This might fail if user is not verified yet - that's expected
        if (data.message && data.message.includes("verify")) {
          console.log(
            "ℹ️  This is expected - user needs email verification first"
          );
        }
        return false;
      }
    } catch (error) {
      console.log(`❌ Login error: ${error.message}`);
      return false;
    }
  }

  async testInvalidCredentials() {
    console.log("\n5️⃣ Testing Invalid Credentials...");
    try {
      const invalidData = {
        email: this.testEmail,
        password: "WrongPassword123!",
      };

      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidData),
      });

      const data = await response.json();

      if (!response.ok && data.message) {
        console.log("✅ Invalid credentials properly rejected");
        console.log(`📋 Error message: ${data.message}`);
        return true;
      } else {
        console.log("❌ Invalid credentials were accepted (security issue!)");
        return false;
      }
    } catch (error) {
      console.log(`❌ Invalid credentials test error: ${error.message}`);
      return false;
    }
  }

  async runAllTests() {
    console.log("\n🚀 Starting comprehensive authentication flow tests...\n");

    const results = {
      backendHealth: await this.testBackendHealth(),
      registration: await this.testRegistration(),
      emailSending: await this.testEmailSending(),
      login: await this.testLogin(),
      invalidCredentials: await this.testInvalidCredentials(),
    };

    console.log("\n📊 TEST RESULTS SUMMARY");
    console.log("=".repeat(50));

    let passed = 0;
    let total = 0;

    Object.entries(results).forEach(([test, success]) => {
      total++;
      if (success) passed++;
      const status = success ? "✅" : "❌";
      console.log(`${status} ${test}: ${success ? "PASSED" : "FAILED"}`);
    });

    console.log("=".repeat(50));
    console.log(
      `🎯 Overall Success Rate: ${((passed / total) * 100).toFixed(
        1
      )}% (${passed}/${total})`
    );

    if (passed === total) {
      console.log(
        "🎉 All tests passed! Authentication flow is working correctly."
      );
    } else {
      console.log(
        "⚠️  Some tests failed. Please check the backend and fix issues."
      );
    }

    console.log("\n📚 MANUAL TESTING INSTRUCTIONS:");
    console.log("1. Open http://localhost:3000 in your browser");
    console.log("2. Navigate to registration page");
    console.log(`3. Use email: ${this.testEmail}`);
    console.log(`4. Use username: ${this.testUsername}`);
    console.log(`5. Use password: ${this.testPassword}`);
    console.log("6. Check sauravaura3@gmail.com for verification email");
    console.log("7. Complete verification and test login flow");

    return results;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const tester = new AuthFlowTester();
  tester.runAllTests().catch(console.error);
}

module.exports = AuthFlowTester;
