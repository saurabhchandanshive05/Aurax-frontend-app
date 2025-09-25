#!/usr/bin/env node

// Test script for Aurax Backend Integration
require("dotenv").config();

console.log("🔧 Testing Aurax Backend Configuration...\n");

// Test environment variables
console.log("📋 Environment Configuration:");
console.log("✓ NODE_ENV:", process.env.NODE_ENV || "development");
console.log("✓ PORT:", process.env.PORT || 5002);
console.log(
  "✓ Instagram Client ID:",
  process.env.INSTAGRAM_CLIENT_ID ? "configured" : "❌ missing"
);
console.log(
  "✓ Instagram Client Secret:",
  process.env.INSTAGRAM_CLIENT_SECRET ? "configured" : "❌ missing"
);
console.log(
  "✓ Instagram Redirect URI:",
  process.env.INSTAGRAM_REDIRECT_URI || "❌ missing"
);
console.log(
  "✓ JWT Secret:",
  process.env.JWT_SECRET ? "configured" : "❌ missing"
);

console.log("\n📦 Testing Dependencies:");
try {
  require("express");
  console.log("✅ express");
} catch (e) {
  console.log("❌ express - not installed");
}

try {
  require("cors");
  console.log("✅ cors");
} catch (e) {
  console.log("❌ cors - not installed");
}

try {
  require("jsonwebtoken");
  console.log("✅ jsonwebtoken");
} catch (e) {
  console.log("❌ jsonwebtoken - not installed");
}

try {
  require("bcryptjs");
  console.log("✅ bcryptjs");
} catch (e) {
  console.log("❌ bcryptjs - not installed");
}

try {
  require("nodemailer");
  console.log("✅ nodemailer");
} catch (e) {
  console.log("❌ nodemailer - not installed");
}

console.log("\n🚀 Ready to start server!");
console.log("Run: npm start or node server.js");
console.log("Server will be available at: http://localhost:5002");
console.log("Health check: http://localhost:5002/api/health");
