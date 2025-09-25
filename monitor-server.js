// Simple server process monitor
const http = require("http");

async function monitorServer() {
  console.log("🔍 Monitoring backend server process...");

  // Check if server is responsive
  for (let i = 0; i < 10; i++) {
    try {
      await testConnection();
      console.log(`✅ Attempt ${i + 1}: Server is responsive`);
      break;
    } catch (error) {
      console.log(`❌ Attempt ${i + 1}: ${error.message}`);
      if (i < 9) {
        console.log("   Waiting 2 seconds before retry...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
}

function testConnection() {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 5002,
        path: "/",
        method: "GET",
        timeout: 3000,
      },
      (res) => {
        resolve(`Server responded with status ${res.statusCode}`);
      }
    );

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Connection timeout"));
    });

    req.end();
  });
}

monitorServer()
  .then(() => {
    console.log("✅ Server monitoring complete");
  })
  .catch((error) => {
    console.log("❌ Monitor failed:", error.message);
  });
