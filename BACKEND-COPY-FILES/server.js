// Aurax Backend Server with Full Authentication and Instagram Integration
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",")
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection (if URI is provided)
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.warn("⚠️ MongoDB connection failed:", err.message));
} else {
  console.log("📝 Running in demo mode - using in-memory storage");
}

// Import routes
const authRoutes = require("./routes/auth");
const instagramOAuthRoutes = require("./routes/instagram-oauth");
const instagramRoutes = require("./routes/instagram");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/instagram", instagramOAuthRoutes);
app.use("/api/instagram", instagramRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Aurax Backend Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    features: {
      authentication: true,
      instagram_oauth: true,
      instagram_api: true,
      mongodb: !!process.env.MONGODB_URI,
      email: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    },
    endpoints: {
      // Authentication
      "POST /api/auth/register": "Register new user",
      "POST /api/auth/verify-email": "Verify email with code",
      "POST /api/auth/login": "User login",
      "POST /api/auth/resend-verification": "Resend verification code",
      "GET /api/auth/profile": "Get user profile (authenticated)",

      // Instagram OAuth
      "GET /api/instagram/oauth/url": "Get Instagram OAuth URL",
      "POST /api/instagram/oauth/callback": "Handle OAuth callback",
      "POST /api/instagram/oauth/validate": "Validate access token",
      "POST /api/instagram/oauth/refresh": "Refresh access token",
      "GET /api/instagram/connection-status":
        "Get connection status (authenticated)",
      "POST /api/instagram/disconnect": "Disconnect Instagram (authenticated)",

      // Instagram API
      "GET /api/instagram/profile?accessToken=...":
        "Get Instagram profile data",
      "GET /api/instagram/insights?accessToken=...": "Get Instagram insights",
      "GET /api/instagram/my-profile":
        "Get user's connected Instagram profile (authenticated)",
      "GET /api/instagram/status": "Instagram API status",
    },
  });
});

// Configuration endpoint
app.get("/api/config", (req, res) => {
  res.json({
    success: true,
    config: {
      instagram: {
        client_id: process.env.INSTAGRAM_CLIENT_ID,
        redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
        oauth_url: `https://api.instagram.com/oauth/authorize?client_id=${
          process.env.INSTAGRAM_CLIENT_ID
        }&redirect_uri=${encodeURIComponent(
          process.env.INSTAGRAM_REDIRECT_URI
        )}&scope=user_profile,user_media&response_type=code`,
      },
      api: {
        base_url:
          process.env.API_BASE_URL ||
          `http://localhost:${process.env.PORT || 5002}`,
        frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
      },
      features: {
        email_verification: !!(
          process.env.EMAIL_USER && process.env.EMAIL_PASS
        ),
        mongodb_storage: !!process.env.MONGODB_URI,
      },
    },
  });
});

// Test endpoints for development
if (process.env.NODE_ENV === "development") {
  app.get("/api/test/users", (req, res) => {
    const { users } = require("./routes/auth");
    res.json({
      success: true,
      users: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        verified: u.verified,
        instagram_connected: u.instagram.connected,
        created_at: u.createdAt,
      })),
    });
  });

  app.delete("/api/test/reset", (req, res) => {
    const authModule = require("./routes/auth");
    authModule.users.length = 0; // Clear users array
    res.json({
      success: true,
      message: "Test data reset successfully",
    });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 API Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: `${req.method} ${req.path} is not a valid endpoint`,
    available_endpoints: "/api/health",
  });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log("🚀 Aurax Backend Server started successfully!");
  console.log("=".repeat(50));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`⚙️  Configuration: http://localhost:${PORT}/api/config`);
  console.log("");
  console.log("🔐 Authentication Endpoints:");
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/verify-email`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/profile`);
  console.log("");
  console.log("📱 Instagram OAuth Endpoints:");
  console.log(`   GET  http://localhost:${PORT}/api/instagram/oauth/url`);
  console.log(`   POST http://localhost:${PORT}/api/instagram/oauth/callback`);
  console.log(
    `   GET  http://localhost:${PORT}/api/instagram/connection-status`
  );
  console.log("");
  console.log("📊 Instagram API Endpoints:");
  console.log(
    `   GET  http://localhost:${PORT}/api/instagram/profile?accessToken=...`
  );
  console.log(`   GET  http://localhost:${PORT}/api/instagram/my-profile`);
  console.log("");
  console.log("🎯 Frontend should be running on: http://localhost:3000");
  console.log("🔗 CORS enabled for frontend communication");
  console.log("=".repeat(50));
});

module.exports = app;
