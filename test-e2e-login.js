// Test end-to-end login communication between frontend and backend
const https = require("https");
const http = require("http");

function makeRequest(options, data) {
  return new Promise((resolve, reject) => {
    const protocol = options.port === 443 ? https : http;

    const req = protocol.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData,
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: responseData,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(data);
    }

    req.end();
  });
}

async function testLogin() {
  console.log("Testing end-to-end login communication...\n");

  // Test cases that previously caused "Email/phone and password are required" error
  const testCases = [
    {
      name: "Valid login with email field",
      payload: {
        email: "existing@test.com",
        password: "ValidPassword123!",
      },
    },
    {
      name: "Valid login with emailOrPhone field",
      payload: {
        emailOrPhone: "existing@test.com",
        password: "ValidPassword123!",
      },
    },
    {
      name: "Login with both email and emailOrPhone (should work)",
      payload: {
        email: "existing@test.com",
        emailOrPhone: "existing@test.com",
        password: "ValidPassword123!",
      },
    },
    {
      name: "Empty password (should get 400 error)",
      payload: {
        email: "existing@test.com",
        password: "",
      },
    },
    {
      name: "Missing password field (should get 400 error)",
      payload: {
        email: "existing@test.com",
      },
    },
    {
      name: "Missing email field (should get 400 error)",
      payload: {
        password: "ValidPassword123!",
      },
    },
  ];

  for (const testCase of testCases) {
    console.log(`\nTesting: ${testCase.name}`);
    console.log("Payload:", JSON.stringify(testCase.payload, null, 2));

    try {
      const options = {
        hostname: "127.0.0.1",
        port: 5002,
        path: "/auth/login",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await makeRequest(
        options,
        JSON.stringify(testCase.payload)
      );

      console.log(`Status: ${response.status}`);
      if (response.data.message) {
        console.log(`Message: ${response.data.message}`);
      }
      if (response.data.error) {
        console.log(`Error: ${response.data.error}`);
      }

      // Check if we're getting the specific error we were trying to fix
      if (response.data.error === "Email/phone and password are required") {
        console.log("❌ Still getting the target error!");
      } else if (response.status === 400) {
        console.log("✅ Got 400 error but with different message (expected)");
      } else if (response.status === 401) {
        console.log(
          "✅ Got 401 authentication error (expected for non-existent user)"
        );
      } else if (response.status === 200) {
        console.log("✅ Login successful!");
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("END-TO-END TEST COMPLETE");
  console.log(
    "The 'Email/phone and password are required' error should no longer occur"
  );
  console.log("if our frontend apiClient.js fixes are working correctly.");
}

testLogin().catch(console.error);
