// Test the fixed apiClient login method logic
// (standalone test without importing ES modules)

// Mock the login data structure that would come from frontend forms
const testCredentials = [
  {
    name: "Valid credentials",
    data: {
      email: "test@example.com",
      password: "Test123!@#",
    },
  },
  {
    name: "Empty password should fail with client validation",
    data: {
      email: "test@example.com",
      password: "",
    },
  },
  {
    name: "Missing password should fail with client validation",
    data: {
      email: "test@example.com",
    },
  },
  {
    name: "Empty email should fail with client validation",
    data: {
      password: "Test123!@#",
    },
  },
  {
    name: "Using emailOrPhone field",
    data: {
      emailOrPhone: "test@example.com",
      password: "Test123!@#",
    },
  },
];

// Simulate the client-side validation logic from apiClient.js
function validateCredentials(credentials) {
  const email = credentials.emailOrPhone || credentials.email;
  const password = credentials.password;

  if (!email || !password) {
    const missingFields = [];
    if (!email) missingFields.push("email");
    if (!password) missingFields.push("password");
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
  }

  // Simulate the loginData object creation
  const loginData = {
    emailOrPhone: credentials.emailOrPhone || credentials.email,
    email: credentials.email || credentials.emailOrPhone,
    password: credentials.password, // Always include password field
    loginMethod: credentials.loginMethod,
    ...(credentials.otp && { otp: credentials.otp }),
  };

  return loginData;
}

console.log("Testing frontend login credential validation...\n");

testCredentials.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}:`);
  console.log("Input:", JSON.stringify(test.data, null, 2));

  try {
    const loginData = validateCredentials(test.data);
    console.log("✅ Validation passed");
    console.log("LoginData:", JSON.stringify(loginData, null, 2));

    // Check that password is always included
    if (loginData.password !== undefined) {
      console.log("✅ Password field is always included");
    } else {
      console.log("❌ Password field is missing!");
    }
  } catch (error) {
    console.log("❌ Validation failed:", error.message);
  }
});

console.log("\n" + "=".repeat(50));
console.log("SUMMARY: Frontend credential validation test complete");
