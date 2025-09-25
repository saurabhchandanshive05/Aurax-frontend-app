// Minimal server to test basic functionality
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5003; // Use different port to avoid conflicts

// Basic middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "healthy" });
});

// Test registration
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password, role } = req.body;

  console.log("Registration attempt:", { username, email, role });

  // Basic validation
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields required",
    });
  }

  // Simple response
  res.status(201).json({
    success: true,
    message: "Registration successful",
    user: { username, email, role: role || "creator" },
  });
});

// Test login
app.post("/api/auth/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;

  console.log("Login attempt:", { emailOrPhone });

  if (!emailOrPhone || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required",
    });
  }

  // Mock successful login
  res.json({
    success: true,
    message: "Login successful",
    token: "mock_token_123",
  });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Minimal server running on port ${PORT}`);
});

server.on("error", (error) => {
  console.error("❌ Server error:", error);
});

// Keep the process alive
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    process.exit(0);
  });
});
