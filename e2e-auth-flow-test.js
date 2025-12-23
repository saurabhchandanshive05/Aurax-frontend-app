// Comprehensive End-to-End Authentication Flow Test Suite
// Usage: Open this in browser or run with puppeteer for automated testing

class AuraxAuthFlowTester {
  constructor() {
    this.baseUrl = "http://localhost:3000";
    this.apiUrl = "http://localhost:5002";
    this.testResults = [];
    this.testEmail = `test.user.${Date.now()}@example.com`;
    this.testPassword = "TestPassword123!";
    this.testUsername = `testuser${Date.now()}`;
    this.verificationCode = null;

    console.log(`🧪 Starting E2E Auth Flow Test Suite`);
    console.log(`📧 Test Email: ${this.testEmail}`);
    console.log(`👤 Test Username: ${this.testUsername}`);
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async logResult(testName, success, details = "", error = null) {
    const timestamp = new Date().toISOString();
    const result = {
      testName,
      success,
      details,
      error: error ? error.message : null,
      timestamp,
    };

    this.testResults.push(result);

    const status = success ? "✅" : "❌";
    console.log(`${status} ${testName}: ${details}`);
    if (error) console.error(`   Error: ${error.message}`);
  }

  async checkBackendHealth() {
    try {
      const response = await fetch(`${this.apiUrl}/health`);
      if (response.ok) {
        await this.logResult(
          "Backend Health Check",
          true,
          "Backend API is responding"
        );
        return true;
      } else {
        await this.logResult(
          "Backend Health Check",
          false,
          `Backend returned status ${response.status}`
        );
        return false;
      }
    } catch (error) {
      await this.logResult(
        "Backend Health Check",
        false,
        "Backend is not accessible",
        error
      );
      return false;
    }
  }

  async testRegistrationAPI() {
    try {
      const registrationData = {
        username: this.testUsername,
        email: this.testEmail,
        password: this.testPassword,
        role: "creator",
      };

      const response = await fetch(`${this.apiUrl}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (
        response.ok &&
        data.message &&
        data.message.includes("verification")
      ) {
        await this.logResult(
          "Registration API",
          true,
          "Registration successful, verification email sent"
        );
        return true;
      } else {
        await this.logResult(
          "Registration API",
          false,
          `Registration failed: ${data.message || "Unknown error"}`
        );
        return false;
      }
    } catch (error) {
      await this.logResult(
        "Registration API",
        false,
        "Registration API call failed",
        error
      );
      return false;
    }
  }

  async testEmailVerificationEndpoint() {
    try {
      // Simulate verification code (in real test, this would come from email)
      this.verificationCode = "123456"; // We'll need to get this from email

      const verificationData = {
        email: this.testEmail,
        code: this.verificationCode,
      };

      const response = await fetch(`${this.apiUrl}/api/auth/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationData),
      });

      const data = await response.json();

      if (response.ok) {
        await this.logResult(
          "Email Verification API",
          true,
          "Email verification successful"
        );
        return true;
      } else {
        await this.logResult(
          "Email Verification API",
          false,
          `Verification failed: ${data.message || "Unknown error"}`
        );
        return false;
      }
    } catch (error) {
      await this.logResult(
        "Email Verification API",
        false,
        "Email verification API call failed",
        error
      );
      return false;
    }
  }

  async testLoginAPI() {
    try {
      const loginData = {
        email: this.testEmail,
        password: this.testPassword,
      };

      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        await this.logResult(
          "Login API",
          true,
          `Login successful, token received: ${data.token.substring(0, 20)}...`
        );
        this.authToken = data.token;
        return true;
      } else {
        await this.logResult(
          "Login API",
          false,
          `Login failed: ${data.message || "Unknown error"}`
        );
        return false;
      }
    } catch (error) {
      await this.logResult("Login API", false, "Login API call failed", error);
      return false;
    }
  }

  async testProtectedRoute() {
    try {
      if (!this.authToken) {
        await this.logResult(
          "Protected Route Access",
          false,
          "No auth token available"
        );
        return false;
      }

      const response = await fetch(`${this.apiUrl}/api/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.user) {
        await this.logResult(
          "Protected Route Access",
          true,
          `Profile data retrieved for user: ${data.user.email}`
        );
        return true;
      } else {
        await this.logResult(
          "Protected Route Access",
          false,
          `Protected route failed: ${data.message || "Unknown error"}`
        );
        return false;
      }
    } catch (error) {
      await this.logResult(
        "Protected Route Access",
        false,
        "Protected route API call failed",
        error
      );
      return false;
    }
  }

  async testInvalidCredentials() {
    try {
      const invalidLoginData = {
        email: this.testEmail,
        password: "WrongPassword123!",
      };

      const response = await fetch(`${this.apiUrl}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invalidLoginData),
      });

      const data = await response.json();

      if (!response.ok && data.message && data.message.includes("Invalid")) {
        await this.logResult(
          "Invalid Credentials Test",
          true,
          "Invalid credentials properly rejected"
        );
        return true;
      } else {
        await this.logResult(
          "Invalid Credentials Test",
          false,
          "Invalid credentials were accepted (security issue!)"
        );
        return false;
      }
    } catch (error) {
      await this.logResult(
        "Invalid Credentials Test",
        false,
        "Invalid credentials test failed",
        error
      );
      return false;
    }
  }

  async generateTestReport() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(
      (result) => result.success
    ).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    const report = {
      timestamp: new Date().toISOString(),
      testConfiguration: {
        frontendUrl: this.baseUrl,
        backendUrl: this.apiUrl,
        testEmail: this.testEmail,
        testUsername: this.testUsername,
      },
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: `${successRate}%`,
      },
      results: this.testResults,
    };

    console.log("\n" + "=".repeat(80));
    console.log("🎯 END-TO-END AUTHENTICATION FLOW TEST REPORT");
    console.log("=".repeat(80));
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`🎯 Success Rate: ${successRate}%`);
    console.log("\n📋 Detailed Results:");

    this.testResults.forEach((result, index) => {
      const status = result.success ? "✅" : "❌";
      console.log(`${index + 1}. ${status} ${result.testName}`);
      console.log(`   ${result.details}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    return report;
  }

  async runFullTestSuite() {
    console.log("\n🚀 Starting Full Authentication Flow Test Suite...\n");

    // Test 1: Backend Health Check
    const backendHealthy = await this.checkBackendHealth();
    if (!backendHealthy) {
      console.error(
        "❌ Backend is not accessible. Cannot continue with tests."
      );
      return await this.generateTestReport();
    }

    // Test 2: Registration API
    await this.testRegistrationAPI();

    // Test 3: Email Verification API (simulated)
    await this.testEmailVerificationEndpoint();

    // Test 4: Login API
    await this.testLoginAPI();

    // Test 5: Protected Route Access
    await this.testProtectedRoute();

    // Test 6: Invalid Credentials Handling
    await this.testInvalidCredentials();

    // Generate final report
    const report = await this.generateTestReport();

    console.log("\n🏁 Test Suite Complete!");
    console.log(`📝 Full report available in console above`);

    return report;
  }
}

// Manual Testing Instructions
console.log(`
📚 MANUAL TESTING INSTRUCTIONS:
=================================

1. Open browser to: http://localhost:3000
2. Navigate to the registration page
3. Fill out the form with:
   - Email: test.user.${Date.now()}@example.com  
   - Username: testuser${Date.now()}
   - Password: TestPassword123!
4. Submit the form
5. Check your email (sauravaura3@gmail.com) for verification code
6. Enter the 6-digit verification code
7. Verify success message and UI changes
8. Navigate to login page
9. Enter the registered credentials
10. Verify successful login and dashboard redirect

🤖 AUTOMATED TESTING:
====================
Run: const tester = new AuraxAuthFlowTester(); await tester.runFullTestSuite();
`);

// Export for use in browser console or automated testing
if (typeof window !== "undefined") {
  window.AuraxAuthFlowTester = AuraxAuthFlowTester;
  console.log(
    "🔧 AuraxAuthFlowTester loaded. Run: const tester = new AuraxAuthFlowTester(); await tester.runFullTestSuite();"
  );
}

// For Node.js environment
if (typeof module !== "undefined" && module.exports) {
  module.exports = AuraxAuthFlowTester;
}
