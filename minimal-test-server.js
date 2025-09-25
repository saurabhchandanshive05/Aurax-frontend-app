// Minimal test server on port 5002
const http = require("http");

const server = http.createServer((req, res) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });

  if (req.method === "OPTIONS") {
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/auth/register") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      console.log("Registration request body:", body);
      res.end(
        JSON.stringify({
          success: true,
          message: "Test server received registration request",
          data: JSON.parse(body),
        })
      );
    });
  } else {
    res.end(
      JSON.stringify({
        success: true,
        message: "Minimal test server is working",
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString(),
      })
    );
  }
});

server.listen(5002, "127.0.0.1", () => {
  console.log("✅ Minimal test server running on http://127.0.0.1:5002");
  console.log("🔍 Testing connectivity in 2 seconds...");

  setTimeout(() => {
    // Test connectivity
    const http = require("http");
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: 5002,
        path: "/",
        method: "GET",
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          console.log("✅ Self-test successful:", JSON.parse(data));
        });
      }
    );
    req.on("error", (err) => {
      console.log("❌ Self-test failed:", err.message);
    });
    req.end();
  }, 2000);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error("❌ Port 5002 is already in use");
  } else {
    console.error("❌ Server error:", error);
  }
});

// Keep server running
console.log("⏰ Server will run for 30 seconds for testing...");
setTimeout(() => {
  server.close(() => {
    console.log("✅ Test server shutdown");
    process.exit(0);
  });
}, 30000);
