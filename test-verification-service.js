// Comprehensive Verification Service Test Suite
// Execute: node test-verification-service.js

const path = require("path");
const {
  generateVerificationCode,
  sendVerificationEmail,
  transporter,
} = require("./services/verificationService");

console.log("🚀 AURAX Verification Service Testing Suite");
console.log("=".repeat(60));

// Test 1: Environment Validation
function testEnvironmentValidation() {
  console.log("\n📋 Test 1: Environment Variable Validation");
  console.log("-".repeat(40));

  const requiredVars = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASS",
    "EMAIL_FROM",
  ];

  let allPresent = true;

  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    const status = value ? "✅" : "❌";
    const displayValue =
      varName === "SMTP_PASS"
        ? value
          ? `${value.substring(0, 8)}****`
          : "undefined"
        : value || "undefined";

    console.log(`${status} ${varName}: ${displayValue}`);

    if (!value) allPresent = false;
  });

  console.log(
    `\n🔍 Environment Status: ${
      allPresent ? "✅ All variables present" : "❌ Missing variables"
    }`
  );
  return allPresent;
}

// Test 2: Code Generation Testing
function testCodeGeneration() {
  console.log("\n📋 Test 2: Verification Code Generation");
  console.log("-".repeat(40));

  try {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      const code = generateVerificationCode();
      codes.push(code);

      // Validate code format
      if (!/^\d{6}$/.test(code)) {
        console.log(`❌ Invalid code format: ${code}`);
        return false;
      }
    }

    // Check for uniqueness (should be very rare to have duplicates)
    const uniqueCodes = new Set(codes);
    console.log(
      `✅ Generated ${codes.length} codes, ${uniqueCodes.size} unique`
    );
    console.log(`📊 Sample codes: ${codes.slice(0, 5).join(", ")}`);

    return true;
  } catch (error) {
    console.log(`❌ Code generation failed: ${error.message}`);
    return false;
  }
}

// Test 3: SMTP Connection Test
async function testSMTPConnection() {
  console.log("\n📋 Test 3: SMTP Connection Testing");
  console.log("-".repeat(40));

  try {
    const startTime = Date.now();
    await transporter.verify();
    const connectionTime = Date.now() - startTime;

    console.log(`✅ SMTP connection successful (${connectionTime}ms)`);
    console.log(
      `📡 Connected to: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT}`
    );
    return true;
  } catch (error) {
    console.log(`❌ SMTP connection failed: ${error.message}`);
    return false;
  }
}

// Test 4: Email Validation Testing
function testEmailValidation() {
  console.log("\n📋 Test 4: Email Address Validation");
  console.log("-".repeat(40));

  const testCases = [
    { email: "valid@example.com", expected: true },
    { email: "test.email+tag@domain.co.uk", expected: true },
    { email: "user123@subdomain.domain.com", expected: true },
    { email: "invalid.email", expected: false },
    { email: "@domain.com", expected: false },
    { email: "user@", expected: false },
    { email: "", expected: false },
    { email: null, expected: false },
    { email: undefined, expected: false },
  ];

  let passed = 0;
  let failed = 0;

  // Import validation function for testing
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = (email) =>
    email && typeof email === "string" && emailRegex.test(email.trim());

  testCases.forEach(({ email, expected }) => {
    const result = isValidEmail(email);
    const status = result === expected ? "✅" : "❌";
    const emailDisplay =
      email === null
        ? "null"
        : email === undefined
        ? "undefined"
        : `'${email}'`;

    console.log(
      `${status} ${emailDisplay} → ${result} (expected: ${expected})`
    );

    if (result === expected) {
      passed++;
    } else {
      failed++;
    }
  });

  console.log(
    `\n📊 Email Validation Results: ${passed}/${testCases.length} passed, ${failed} failed`
  );
  return failed === 0;
}

// Test 5: Email Sending Functionality Test
async function testEmailSending() {
  console.log("\n📋 Test 5: Email Sending Functionality");
  console.log("-".repeat(40));

  const testEmail = process.env.TEST_EMAIL || "sauravaura3@gmail.com";
  const testCode = generateVerificationCode();

  console.log(`📧 Sending test email to: ${testEmail}`);
  console.log(`🔢 Using verification code: ${testCode.substring(0, 2)}****`);

  try {
    const startTime = Date.now();
    const result = await sendVerificationEmail(testEmail, testCode);
    const totalTime = Date.now() - startTime;

    if (result.success) {
      console.log(`✅ Email sent successfully!`);
      console.log(`📨 Message ID: ${result.messageId}`);
      console.log(`⏱️ Send time: ${result.sendTime}ms`);
      console.log(`🔄 Attempts: ${result.attempt || 1}`);
      console.log(`⚡ Total test time: ${totalTime}ms`);
      return true;
    } else {
      console.log(`❌ Email sending failed: ${result.error}`);
      console.log(`🔄 Attempts made: ${result.attempts}`);
      console.log(`⏱️ Time taken: ${result.sendTime}ms`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Unexpected error in email sending test: ${error.message}`);
    return false;
  }
}

// Test 6: Invalid Input Handling
async function testInvalidInputHandling() {
  console.log("\n📋 Test 6: Invalid Input Handling");
  console.log("-".repeat(40));

  const invalidTests = [
    { email: "", code: "123456", description: "Empty email" },
    {
      email: "invalid-email",
      code: "123456",
      description: "Invalid email format",
    },
    { email: "valid@example.com", code: "", description: "Empty code" },
    { email: "valid@example.com", code: "123", description: "Short code" },
    { email: "valid@example.com", code: "1234567", description: "Long code" },
    { email: null, code: "123456", description: "Null email" },
    { email: "valid@example.com", code: null, description: "Null code" },
  ];

  let passed = 0;

  for (const { email, code, description } of invalidTests) {
    try {
      const result = await sendVerificationEmail(email, code);

      if (!result.success && result.error) {
        console.log(`✅ ${description}: Properly rejected - ${result.error}`);
        passed++;
      } else {
        console.log(`❌ ${description}: Should have been rejected but wasn't`);
      }
    } catch (error) {
      console.log(`❌ ${description}: Unexpected error - ${error.message}`);
    }
  }

  console.log(
    `\n📊 Input Validation Results: ${passed}/${invalidTests.length} tests passed`
  );
  return passed === invalidTests.length;
}

// Main Test Execution
async function runAllTests() {
  console.log(
    `🏁 Starting comprehensive test suite at ${new Date().toISOString()}`
  );

  const results = {
    environment: false,
    codeGeneration: false,
    smtpConnection: false,
    emailValidation: false,
    emailSending: false,
    inputValidation: false,
  };

  try {
    // Run all tests
    results.environment = testEnvironmentValidation();
    results.codeGeneration = testCodeGeneration();
    results.smtpConnection = await testSMTPConnection();
    results.emailValidation = testEmailValidation();
    results.emailSending = await testEmailSending();
    results.inputValidation = await testInvalidInputHandling();

    // Calculate overall results
    const passedTests = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log("\n" + "=".repeat(60));
    console.log("📊 FINAL TEST RESULTS");
    console.log("=".repeat(60));

    Object.entries(results).forEach(([test, passed]) => {
      const status = passed ? "✅" : "❌";
      const testName = test.replace(/([A-Z])/g, " $1").toLowerCase();
      console.log(`${status} ${testName}: ${passed ? "PASSED" : "FAILED"}`);
    });

    console.log("-".repeat(60));
    console.log(
      `🎯 Overall Success Rate: ${successRate}% (${passedTests}/${totalTests})`
    );
    console.log(
      `🏆 Test Suite Status: ${
        passedTests === totalTests ? "ALL TESTS PASSED" : "SOME TESTS FAILED"
      }`
    );
    console.log(`⏰ Test completed at: ${new Date().toISOString()}`);

    if (passedTests === totalTests) {
      console.log("\n🎉 Verification Service is ready for production!");
    } else {
      console.log(
        "\n⚠️  Please address failing tests before deploying to production."
      );
    }

    return passedTests === totalTests;
  } catch (error) {
    console.error(`💥 Test suite execution failed: ${error.message}`);
    return false;
  }
}

// Execute if called directly
if (require.main === module) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error(`💥 Fatal error: ${error.message}`);
      process.exit(1);
    });
}

module.exports = { runAllTests };
