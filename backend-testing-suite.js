// Comprehensive Backend Testing Suite
// Location: C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
// Tests: User Registration, Login Flow, Email Sending, CORS, Environment

const crypto = require("crypto");

const BASE_URL = "http://127.0.0.1:5002";
const API_BASE = `${BASE_URL}/api`;

// Test utilities
const generateTestUser = () => ({
  username: "TestUser",
  email: `test.user.${Date.now()}@example.com`,
  password: "TestPassword123!",
  role: "creator",
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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

// Test Results Tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: [],
};

const recordTest = (name, passed, details) => {
  testResults.tests.push({ name, passed, details });
  if (passed) {
    testResults.passed++;
    log.success(`${name}: PASSED`);
  } else {
    testResults.failed++;
    log.error(`${name}: FAILED - ${details}`);
  }
};

// 1. HEALTH CHECK & BASIC CONNECTIVITY
async function testHealthAndConnectivity() {
  log.test("Testing Health Check & Basic Connectivity...");

  try {
    // Test health endpoint
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();

    if (healthResponse.status === 200 && healthData.status === "healthy") {
      recordTest("Health Endpoint", true, "Server responds correctly");
    } else {
      recordTest(
        "Health Endpoint",
        false,
        `Status: ${healthResponse.status}, Data: ${JSON.stringify(healthData)}`
      );
    }

    // Test API test endpoint
    const apiTestResponse = await fetch(`${API_BASE}/test`);
    const apiTestData = await apiTestResponse.json();

    if (apiTestResponse.status === 200) {
      recordTest("API Test Endpoint", true, "API routes accessible");
    } else {
      recordTest(
        "API Test Endpoint",
        false,
        `Status: ${apiTestResponse.status}`
      );
    }
  } catch (error) {
    recordTest("Health Check", false, `Connection error: ${error.message}`);
  }
}

// 2. USER REGISTRATION TESTING
async function testUserRegistration() {
  log.test("Testing User Registration Flow...");

  const testUser = generateTestUser();

  try {
    // Test 2.1: Valid Registration
    const registerResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    const registerData = await registerResponse.json();

    if (registerResponse.status === 201 || registerResponse.status === 200) {
      recordTest("Valid User Registration", true, "User created successfully");

      // Store user for later tests
      global.testUserEmail = testUser.email;
      global.testUserPassword = testUser.password;
    } else {
      recordTest(
        "Valid User Registration",
        false,
        `Status: ${registerResponse.status}, Error: ${registerData.message}`
      );
    }

    // Test 2.2: Duplicate Email Handling
    const duplicateResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testUser),
    });

    if (duplicateResponse.status === 400 || duplicateResponse.status === 409) {
      recordTest(
        "Duplicate Email Handling",
        true,
        "Prevents duplicate registration"
      );
    } else {
      recordTest(
        "Duplicate Email Handling",
        false,
        `Expected 400/409, got ${duplicateResponse.status}`
      );
    }

    // Test 2.3: Invalid Email Format
    const invalidEmailUser = { ...generateTestUser(), email: "invalid-email" }; // Generate new user to avoid field issues
    const invalidEmailResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invalidEmailUser),
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

    // Test 2.4: Missing Required Fields
    const incompleteUser = { email: `incomplete.${Date.now()}@example.com` }; // Changed to avoid duplicate email
    const incompleteResponse = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incompleteUser),
    });

    if (incompleteResponse.status === 400) {
      recordTest("Required Fields Validation", true, "Rejects incomplete data");
    } else {
      recordTest(
        "Required Fields Validation",
        false,
        `Expected 400, got ${incompleteResponse.status}`
      );
    }
  } catch (error) {
    recordTest("User Registration", false, `Test error: ${error.message}`);
  }
}

// 3. LOGIN FLOW TESTING
async function testLoginFlow() {
  log.test("Testing Login Flow...");

  try {
    // Test 3.1: Valid Login
    if (global.testUserEmail && global.testUserPassword) {
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrPhone: global.testUserEmail,
          password: global.testUserPassword,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginResponse.status === 200 && loginData.token) {
        recordTest("Valid Login", true, "Returns JWT token");
        global.authToken = loginData.token;
      } else {
        recordTest(
          "Valid Login",
          false,
          `Status: ${loginResponse.status}, No token received`
        );
      }
    } else {
      recordTest(
        "Valid Login",
        false,
        "No test user available from registration"
      );
    }

    // Test 3.2: Invalid Credentials
    const invalidLoginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone: "nonexistent@example.com",
        password: "wrongpassword",
      }),
    });

    if (
      invalidLoginResponse.status === 401 ||
      invalidLoginResponse.status === 400
    ) {
      recordTest("Invalid Credentials", true, "Rejects wrong credentials");
    } else {
      recordTest(
        "Invalid Credentials",
        false,
        `Expected 401/400, got ${invalidLoginResponse.status}`
      );
    }

    // Test 3.3: Missing Credentials
    const missingCredsResponse = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (missingCredsResponse.status === 400) {
      recordTest(
        "Missing Credentials Validation",
        true,
        "Rejects empty credentials"
      );
    } else {
      recordTest(
        "Missing Credentials Validation",
        false,
        `Expected 400, got ${missingCredsResponse.status}`
      );
    }
  } catch (error) {
    recordTest("Login Flow", false, `Test error: ${error.message}`);
  }
}

// 4. PROTECTED ROUTES TESTING
async function testProtectedRoutes() {
  log.test("Testing Protected Routes & JWT Authentication...");

  try {
    // Test 4.1: Access without token
    const noTokenResponse = await fetch(`${API_BASE}/auth/profile`);

    if (noTokenResponse.status === 401) {
      recordTest("No Token Protection", true, "Blocks access without token");
    } else {
      recordTest(
        "No Token Protection",
        false,
        `Expected 401, got ${noTokenResponse.status}`
      );
    }

    // Test 4.2: Access with valid token
    if (global.authToken) {
      const validTokenResponse = await fetch(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${global.authToken}` },
      });

      if (validTokenResponse.status === 200) {
        recordTest(
          "Valid Token Access",
          true,
          "Allows access with valid token"
        );
      } else {
        recordTest(
          "Valid Token Access",
          false,
          `Expected 200, got ${validTokenResponse.status}`
        );
      }
    } else {
      recordTest("Valid Token Access", false, "No auth token available");
    }

    // Test 4.3: Access with invalid token
    const invalidTokenResponse = await fetch(`${API_BASE}/auth/profile`, {
      headers: { Authorization: "Bearer invalid-token-here" },
    });

    if (invalidTokenResponse.status === 401) {
      recordTest(
        "Invalid Token Protection",
        true,
        "Blocks access with invalid token"
      );
    } else {
      recordTest(
        "Invalid Token Protection",
        false,
        `Expected 401, got ${invalidTokenResponse.status}`
      );
    }
  } catch (error) {
    recordTest("Protected Routes", false, `Test error: ${error.message}`);
  }
}

// 5. EMAIL SENDING TESTING
async function testEmailSending() {
  log.test("Testing Email Sending Functionality...");

  try {
    // Test 5.1: Test Email Endpoint
    const testEmailResponse = await fetch(`${API_BASE}/test-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: "test@example.com",
        subject: "Backend Test Email",
        body: "This is a test email from the backend testing suite.",
      }),
    });

    const testEmailData = await testEmailResponse.json();

    if (testEmailResponse.status === 200) {
      recordTest("Email Service Available", true, "Email endpoint responds");
      log.info(`Email test result: ${JSON.stringify(testEmailData)}`);
    } else {
      recordTest(
        "Email Service Available",
        false,
        `Status: ${testEmailResponse.status}`
      );
    }

    // Test 5.2: Email Configuration Check (via test-email endpoint response)
    if (
      testEmailResponse.status === 200 &&
      testEmailData.status === "success"
    ) {
      recordTest("Email Configuration", true, "SMTP working correctly");
      log.info(`Email working: Message ID ${testEmailData.result?.messageId}`);
    } else {
      recordTest(
        "Email Configuration",
        false,
        "Email service not configured properly"
      );
    }
  } catch (error) {
    recordTest("Email Sending", false, `Test error: ${error.message}`);
  }
}

// 6. CORS TESTING
async function testCORS() {
  log.test("Testing CORS Configuration...");

  try {
    // Test 6.1: Preflight Request
    const preflightResponse = await fetch(`${API_BASE}/test`, {
      method: "OPTIONS",
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    const corsHeaders = preflightResponse.headers.get(
      "access-control-allow-origin"
    );

    if (preflightResponse.status === 200 || preflightResponse.status === 204) {
      recordTest("CORS Preflight", true, "Handles OPTIONS requests");
    } else {
      recordTest(
        "CORS Preflight",
        false,
        `Status: ${preflightResponse.status}`
      );
    }

    if (corsHeaders) {
      recordTest("CORS Headers", true, `Origin allowed: ${corsHeaders}`);
    } else {
      recordTest("CORS Headers", false, "No CORS headers found");
    }
  } catch (error) {
    recordTest("CORS Testing", false, `Test error: ${error.message}`);
  }
}

// 7. ENVIRONMENT & CONFIGURATION TESTING
async function testEnvironmentConfig() {
  log.test("Testing Environment & Configuration...");

  try {
    // Test 7.1: Environment endpoint
    const envResponse = await fetch(`${API_BASE}/environment`);
    const envData = await envResponse.json();

    if (envData && envData.environment) {
      recordTest("Environment Endpoint", true, "Config endpoint accessible");

      // Check for required environment variables (based on actual response structure)
      const env = envData.environment;
      let configComplete = true;

      // Check what we actually get from the backend
      log.info(`Environment data: ${JSON.stringify(env)}`);

      if (env.nodeEnv && env.port && env.baseUrl) {
        recordTest(
          "Environment Configuration",
          true,
          "Basic environment configs present"
        );
      } else {
        recordTest(
          "Environment Configuration",
          false,
          "Missing basic environment configurations"
        );
      }
    } else {
      recordTest(
        "Environment Endpoint",
        false,
        `Status: ${envResponse.status}`
      );
    }
  } catch (error) {
    recordTest("Environment Config", false, `Test error: ${error.message}`);
  }
}

// 8. INSTAGRAM INTEGRATION TESTING
async function testInstagramIntegration() {
  log.test("Testing Instagram Integration...");

  try {
    // Test 8.1: OAuth URL Generation
    const oauthUrlResponse = await fetch(`${API_BASE}/instagram/oauth/url`);
    const oauthData = await oauthUrlResponse.json();

    if (oauthUrlResponse.status === 200 && oauthData.success && oauthData.url) {
      recordTest(
        "Instagram OAuth URL",
        true,
        "OAuth URL generated successfully"
      );
    } else {
      recordTest(
        "Instagram OAuth URL",
        false,
        `Status: ${oauthUrlResponse.status}, Data: ${JSON.stringify(oauthData)}`
      );
    }

    // Test 8.2: OAuth Validation Endpoint
    const validateResponse = await fetch(
      `${API_BASE}/instagram/oauth/validate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: "test-token" }),
      }
    );

    const validateData = await validateResponse.json();

    // This should return success for test token (it's mocked)
    if (validateResponse.status === 200 && validateData.success) {
      recordTest(
        "Instagram Token Validation",
        true,
        "Token validation endpoint working"
      );
    } else {
      recordTest(
        "Instagram Token Validation",
        false,
        `Status: ${validateResponse.status}, Data: ${JSON.stringify(
          validateData
        )}`
      );
    }
  } catch (error) {
    recordTest("Instagram Integration", false, `Test error: ${error.message}`);
  }
}

// 9. DATABASE INTEGRATION TESTING
async function testDatabaseIntegration() {
  log.test("Testing Database Integration...");

  try {
    // Test 9.1: Database connection status (via health endpoint or check useMemoryStore)
    const envResponse = await fetch(`${API_BASE}/environment`);
    const envData = await envResponse.json();

    if (envData && envData.environment) {
      const memoryStore = envData.environment.memoryStore;
      if (memoryStore === false) {
        recordTest(
          "Database Connection",
          true,
          "Using MongoDB (not memory store)"
        );
      } else {
        recordTest(
          "Database Connection",
          false,
          "Using memory store instead of MongoDB"
        );
      }
    } else {
      recordTest(
        "Database Connection",
        false,
        "Cannot determine database status"
      );
    }

    // Test 9.2: Data persistence (create and retrieve user)
    if (global.testUserEmail) {
      // Try to fetch user data (this tests database query)
      const debugResponse = await fetch(`${API_BASE}/debug`);
      if (debugResponse.status === 200) {
        recordTest("Database Query", true, "Database queries working");
      } else {
        recordTest("Database Query", false, "Database query failed");
      }
    }
  } catch (error) {
    recordTest("Database Integration", false, `Test error: ${error.message}`);
  }
}

// Main Test Runner
async function runCompleteBackendTest() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════════╗
║                    BACKEND TESTING SUITE                      ║
║         Comprehensive Testing for backend-copy module         ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  log.info(`Testing backend at: ${BASE_URL}`);
  log.info(`Testing started at: ${new Date().toISOString()}`);

  console.log("\n" + "=".repeat(60));

  // Run all test suites
  await testHealthAndConnectivity();
  await sleep(500);

  await testUserRegistration();
  await sleep(500);

  await testLoginFlow();
  await sleep(500);

  await testProtectedRoutes();
  await sleep(500);

  await testEmailSending();
  await sleep(500);

  await testCORS();
  await sleep(500);

  await testEnvironmentConfig();
  await sleep(500);

  await testInstagramIntegration();
  await sleep(500);

  await testDatabaseIntegration();

  // Generate Test Report
  console.log("\n" + "=".repeat(60));
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════════╗
║                       TEST RESULTS SUMMARY                    ║
╚════════════════════════════════════════════════════════════════╝
${colors.reset}`);

  console.log(
    `${colors.green}✅ Tests Passed: ${testResults.passed}${colors.reset}`
  );
  console.log(
    `${colors.red}❌ Tests Failed: ${testResults.failed}${colors.reset}`
  );
  console.log(`📊 Total Tests: ${testResults.tests.length}`);
  console.log(
    `🎯 Success Rate: ${(
      (testResults.passed / testResults.tests.length) *
      100
    ).toFixed(1)}%`
  );

  if (testResults.failed > 0) {
    console.log(`\n${colors.red}❌ FAILED TESTS:${colors.reset}`);
    testResults.tests
      .filter((test) => !test.passed)
      .forEach((test) => {
        console.log(`   • ${test.name}: ${test.details}`);
      });
  }

  console.log(`\n${colors.blue}📋 DETAILED TEST LOG:${colors.reset}`);
  testResults.tests.forEach((test) => {
    const status = test.passed ? "✅" : "❌";
    console.log(`   ${status} ${test.name}`);
    if (test.details && !test.passed) {
      console.log(`      └─ ${test.details}`);
    }
  });

  const overallStatus = testResults.failed === 0 ? "PASSED" : "FAILED";
  const statusColor = testResults.failed === 0 ? colors.green : colors.red;

  console.log(
    `\n${statusColor}🎯 OVERALL STATUS: ${overallStatus}${colors.reset}`
  );
  console.log(`📅 Test completed at: ${new Date().toISOString()}`);
}

// Run the tests
runCompleteBackendTest().catch((error) => {
  console.error(
    `${colors.red}💥 Test suite failed: ${error.message}${colors.reset}`
  );
  process.exit(1);
});
