const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5002;

// Middleware
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Backend server is working!",
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

app.get("/test", (req, res) => {
  res.json({
    status: "OK",
    message: "Test endpoint working",
    port: PORT,
  });
});

// Start server with explicit callback
const server = app.listen(PORT, "0.0.0.0", () => {
  const address = server.address();
  console.log(`✅ Server started successfully!`);
  console.log(`📍 Address Info:`, address);
  console.log(`🌐 Listening on: http://localhost:${PORT}`);
  console.log(`🌐 Also try: http://127.0.0.1:${PORT}`);

  // Additional network interface check
  const os = require("os");
  const interfaces = os.networkInterfaces();
  console.log("\n🔍 Available network interfaces:");
  Object.keys(interfaces).forEach((name) => {
    interfaces[name].forEach((details) => {
      if (details.family === "IPv4" && !details.internal) {
        console.log(`   ${name}: http://${details.address}:${PORT}`);
      }
    });
  });
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use`);
  } else if (error.code === "EACCES") {
    console.error(`❌ Permission denied for port ${PORT}`);
  }
});

server.on("listening", () => {
  console.log("🎉 Server is now listening for connections");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
