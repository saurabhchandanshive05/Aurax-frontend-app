// Simple test server to verify port 5002 works
const http = require("http");

const server = http.createServer((req, res) => {
  console.log(`Received ${req.method} request to ${req.url}`);
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(
    JSON.stringify({
      status: "success",
      message: "Simple test server is working",
      timestamp: new Date().toISOString(),
    })
  );
});

server.listen(5002, "127.0.0.1", () => {
  console.log("✅ Simple test server running on http://127.0.0.1:5002");
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error("❌ Port 5002 is already in use");
  } else {
    console.error("❌ Server error:", error);
  }
});

// Keep server running for a while
setTimeout(() => {
  console.log("⏰ Test server will shutdown in 5 seconds...");
}, 10000);

setTimeout(() => {
  server.close(() => {
    console.log("✅ Test server shutdown complete");
    process.exit(0);
  });
}, 15000);
