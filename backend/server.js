// Aurax Backend Server with Instagram Integration
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/aurax";
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    // For development, continue without MongoDB
    console.log("⚠️ Continuing without MongoDB - using mock data");
  }
};

// Initialize database connection
connectDB();

// Global mock users array (fallback when MongoDB is unavailable)
global.mockUsers = [];

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://aaurax.netlify.app",
      "https://influencer-backend-etq5.onrender.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-environment",
      "X-Copy-Environment",
      "X-Database",
      "Origin",
      "Accept",
    ],
  })
);
app.use(express.json());

// Import routes
const authRoutes = require("./routes/auth");
const instagramOauthRoutes = require("./routes/instagram-oauth");
const instagramRoutes = require("./routes/instagram");

// Legacy Instagram API routes from parent directory
const legacyInstagramRoutes = require("../backend-instagram-api-routes");

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/instagram-oauth", instagramOauthRoutes);
app.use("/api/instagram", instagramRoutes);

// Legacy routes for backward compatibility
app.use("/api", legacyInstagramRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Aurax Backend Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      // Authentication
      "POST /api/auth/register": "User registration",
      "POST /api/auth/verify-email": "Email verification",
      "POST /api/auth/login": "User login",
      "POST /api/auth/resend-verification": "Resend verification code",
      "GET /api/auth/profile": "Get user profile (requires auth)",

      // Instagram OAuth
      "GET /api/instagram-oauth/oauth/url": "Get Instagram OAuth URL",
      "POST /api/instagram-oauth/oauth/callback": "Instagram OAuth callback",
      "POST /api/instagram-oauth/oauth/validate": "Validate Instagram token",
      "POST /api/instagram-oauth/oauth/refresh": "Refresh Instagram token",
      "POST /api/instagram-oauth/disconnect":
        "Disconnect Instagram (requires auth)",

      // Instagram API
      "GET /api/instagram/profile": "Get Instagram profile data",
      "GET /api/instagram/insights": "Get Instagram insights",
      "GET /api/instagram/connection-status":
        "Get connection status (requires auth)",
      "GET /api/instagram/media": "Get user media (requires auth)",
      "GET /api/instagram/status": "Instagram API status",

      // Legacy endpoints
      "GET /api/health": "Health check",
      "GET /api/status": "API status",
    },
  });
});

// Configuration endpoint for frontend
app.get("/api/config", (req, res) => {
  res.json({
    success: true,
    config: {
      instagram_client_id: process.env.INSTAGRAM_CLIENT_ID,
      instagram_redirect_uri: process.env.INSTAGRAM_REDIRECT_URI,
      frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
      api_base_url: process.env.API_BASE_URL || "http://localhost:5002",
    },
  });
});

// Basic API endpoint for testing
app.get("/api/status", (req, res) => {
  res.json({
    status: "OK",
    message: "Aurax API is running",
    timestamp: new Date().toISOString(),
    users_count: global.mockUsers.length,
    connected_instagram_accounts: global.mockUsers.filter(
      (u) => u.instagram?.connected
    ).length,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("🚨 API Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    message: `${req.method} ${req.path} is not a valid endpoint`,
  });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Aurax Backend Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log("");
  console.log("� Authentication endpoints:");
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
  console.log(`   POST http://localhost:${PORT}/api/auth/verify-email`);
  console.log(`   POST http://localhost:${PORT}/api/auth/login`);
  console.log(`   GET  http://localhost:${PORT}/api/auth/profile`);
  console.log("");
  console.log("📱 Instagram OAuth endpoints:");
  console.log(`   GET  http://localhost:${PORT}/api/instagram-oauth/oauth/url`);
  console.log(
    `   POST http://localhost:${PORT}/api/instagram-oauth/oauth/callback`
  );
  console.log(
    `   POST http://localhost:${PORT}/api/instagram-oauth/oauth/validate`
  );
  console.log("");
  console.log("📊 Instagram API endpoints:");
  console.log(
    `   GET  http://localhost:${PORT}/api/instagram/profile?accessToken=...`
  );
  console.log(
    `   GET  http://localhost:${PORT}/api/instagram/connection-status`
  );
  console.log(`   GET  http://localhost:${PORT}/api/instagram/media`);
  console.log("");
  console.log("🔧 Utility endpoints:");
  console.log(`   GET  http://localhost:${PORT}/api/health`);
  console.log(`   GET  http://localhost:${PORT}/api/config`);
  console.log(`   GET  http://localhost:${PORT}/api/status`);
  console.log("");
  console.log("🎯 Frontend should be running on: http://localhost:3000");
  console.log("🔗 CORS enabled for frontend communication");
  console.log("");
  console.log("📧 Email configuration:", {
    host: process.env.EMAIL_HOST || "not configured",
    user: process.env.EMAIL_USER || "not configured",
  });
  console.log("📱 Instagram OAuth:", {
    client_id: process.env.INSTAGRAM_CLIENT_ID
      ? "configured"
      : "not configured",
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI || "not configured",
  });
});
