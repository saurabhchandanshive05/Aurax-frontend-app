// Focused Backend Validation Test
// Testing User Registration, Login Flow, and Email Sending
const fetch = require("node-fetch");

const BASE_URL = "http://127.0.0.1:5002";
const API_BASE = `${BASE_URL}/api`;

// Color coding for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  test: (msg) => console.log(`${colors.cyan}🧪 ${msg}${colors.reset}`),
};

// Test Results
const results = { passed: 0, failed: 0, tests: [] };

const recordTest = (name, passed, details) => {
  results.tests.push({ name, passed, details });
  if (passed) {
    results.passed++;
    log.success(`${name}: PASSED`);
  } else {
    results.failed++;
    log.error(`${name}: FAILED - ${details}`);
  }
};

async function runFocusedTests() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════════╗
║               FOCUSED BACKEND VALIDATION TEST                 ║
║     User Registration • Login Flow • Email Sending            ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  log.info(`Testing backend at: ${BASE_URL}`);
  log.info(`Test started at: ${new Date().toISOString()}`);

  try {
    // Step 1: Health Check
    log.test("Step 1: Health Check & Connectivity");
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();

    if (healthResponse.status === 200 && healthData.status === "healthy") {
      recordTest("Health Check", true, "Server responding correctly");
    } else {
      recordTest("Health Check", false, `Status: ${healthResponse.status}`);
      return; // Exit if health check fails
    }

    // Step 2: User Registration Testing
    log.test("Step 2: User Registration Testing");
    const testUser = {
      username: `TestUser${Date.now()}`,
      email: `test.user.${Date.now()}@example.com`,
      password: "TestPassword123!",
      role: "creator",
    };

    log.info(`Registering user: ${testUser.email}`);

    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const registerData = await registerResponse.json();

    if (registerResponse.status === 201 && registerData.success) {
      recordTest("User Registration", true, "User created successfully");
      log.info(`User ID: ${registerData.userId}`);
      log.info(`Email sent: ${registerData.emailSent}`);

      // Test duplicate email handling
      const duplicateResponse = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testUser),
      });

      if (duplicateResponse.status === 409) {
        recordTest(
          "Duplicate Email Handling",
          true,
          "Prevents duplicate registration"
        );
      } else {
        recordTest(
          "Duplicate Email Handling",
          false,
          `Expected 409, got ${duplicateResponse.status}`
        );
      }
    } else {
      recordTest(
        "User Registration",
        false,
        `Status: ${registerResponse.status}, Message: ${registerData.message}`
      );
      return; // Exit if registration fails
    }

    // Step 3: Input Validation Testing
    log.test("Step 3: Input Validation Testing");

    // Test invalid email
    const invalidEmailResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: "TestUser",
        email: "invalid-email",
        password: "TestPassword123!",
        role: "creator",
      }),
    });

    if (invalidEmailResponse.status === 400) {
      recordTest("Email Validation", true, "Rejects invalid email format");
    } else {
      recordTest(
        "Email Validation",
        false,
        `Expected 400, got ${invalidEmailResponse.status}`
      );
    }

    // Test missing fields
    const missingFieldsResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    if (missingFieldsResponse.status === 400) {
      recordTest("Required Fields Validation", true, "Rejects incomplete data");
    } else {
      recordTest(
        "Required Fields Validation",
        false,
        `Expected 400, got ${missingFieldsResponse.status}`
      );
    }

    // Step 4: Login Flow Testing (PASSWORD FIX VALIDATION)
    log.test("Step 4: Login Flow Testing (Password Fix Validation)");

    log.info(`Attempting login with: ${testUser.email}`);

    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: testUser.email,
        password: testUser.password,
      }),
    });

    const loginData = await loginResponse.json();

    if (loginResponse.status === 200 && loginData.success && loginData.token) {
      recordTest(
        "Login Authentication",
        true,
        "Password fix working - token generated"
      );
      log.info(`JWT Token: ${loginData.token.substring(0, 20)}...`);
      log.info(`User verified: ${loginData.user.isVerified}`);

      // Test protected route with token
      const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${loginData.token}` },
      });

      if (profileResponse.status === 200) {
        recordTest(
          "JWT Token Validation",
          true,
          "Protected route accessible with token"
        );
      } else {
        recordTest(
          "JWT Token Validation",
          false,
          `Protected route failed: ${profileResponse.status}`
        );
      }
    } else {
      recordTest(
        "Login Authentication",
        false,
        `Status: ${loginResponse.status}, Message: ${loginData.message}`
      );
      log.error("PASSWORD FIX STILL NEEDED");
    }

    // Test invalid login
    const invalidLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: "nonexistent@example.com",
        password: "wrongpassword",
      }),
    });

    if (invalidLoginResponse.status === 401) {
      recordTest(
        "Invalid Credentials Handling",
        true,
        "Rejects wrong credentials"
      );
    } else {
      recordTest(
        "Invalid Credentials Handling",
        false,
        `Expected 401, got ${invalidLoginResponse.status}`
      );
    }

    // Step 5: Email Sending Testing
    log.test("Step 5: Email Sending Testing");

    const emailTestResponse = await fetch(`${API_BASE}/test-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "test@example.com",
        subject: "Backend Validation Test",
        body: "This email confirms the SMTP service is working correctly.",
      }),
    });

    const emailTestData = await emailTestResponse.json();

    if (
      emailTestResponse.status === 200 &&
      emailTestData.status === "success"
    ) {
      recordTest("Email Service", true, "SMTP sending working correctly");
      log.info(`Message ID: ${emailTestData.result?.messageId}`);
    } else {
      recordTest("Email Service", false, `Status: ${emailTestResponse.status}`);
    }

    // Step 6: Environment & Configuration
    log.test("Step 6: Environment & Configuration");

    const envResponse = await fetch(`${API_BASE}/environment`);
    const envData = await envResponse.json();

    if (envResponse.status === 200 && envData.environment) {
      recordTest(
        "Environment Configuration",
        true,
        "Config endpoint accessible"
      );
      log.info(`Node Environment: ${envData.environment.nodeEnv}`);
      log.info(
        `Database: ${
          envData.environment.memoryStore ? "Memory Store" : "MongoDB Connected"
        }`
      );
    } else {
      recordTest(
        "Environment Configuration",
        false,
        `Status: ${envResponse.status}`
      );
    }
  } catch (error) {
    recordTest(
      "Test Suite Execution",
      false,
      `Execution error: ${error.message}`
    );
  }

  // Final Results
  console.log("\n" + "=".repeat(60));
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════════╗
║                       TEST RESULTS SUMMARY                    ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(
    `${colors.green}✅ Tests Passed: ${results.passed}${colors.reset}`
  );
  console.log(`${colors.red}❌ Tests Failed: ${results.failed}${colors.reset}`);
  console.log(`📊 Total Tests: ${results.tests.length}`);
  console.log(
    `🎯 Success Rate: ${((results.passed / results.tests.length) * 100).toFixed(
      1
    )}%`
  );

  if (results.failed > 0) {
    console.log(`\n${colors.red}❌ FAILED TESTS:${colors.reset}`);
    results.tests
      .filter((test) => !test.passed)
      .forEach((test) => {
        console.log(`   • ${test.name}: ${test.details}`);
      });
  }

  // Password Fix Status
  const loginTest = results.tests.find(
    (t) => t.name === "Login Authentication"
  );
  if (loginTest && loginTest.passed) {
    console.log(
      `\n${colors.green}🎉 PASSWORD FIX SUCCESSFUL! Login authentication working correctly.${colors.reset}`
    );
  } else {
    console.log(
      `\n${colors.red}⚠️ PASSWORD FIX NEEDED: Login authentication still failing.${colors.reset}`
    );
  }

  console.log(`\n📅 Test completed at: ${new Date().toISOString()}`);
}

runFocusedTests().catch((error) => {
  console.error(
    `${colors.red}💥 Test suite failed: ${error.message}${colors.reset}`
  );
});
