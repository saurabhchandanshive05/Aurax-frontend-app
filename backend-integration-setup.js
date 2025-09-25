// Backend Integration Setup for Instagram API Routes
// Add this to your main Express app file (e.g., server.js or app.js)

const express = require("express");
const cors = require("cors");
const app = express();

// Import the Instagram API routes
const instagramRoutes = require("./backend-instagram-api-routes");

// Middleware
app.use(cors());
app.use(express.json());

// Instagram API Routes
app.use("/api", instagramRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Aurax Instagram API Server is running",
    timestamp: new Date().toISOString(),
    endpoints: {
      instagram_profile: "/api/instagram/profile?accessToken=...",
      instagram_insights: "/api/instagram/insights?accessToken=...",
      instagram_status: "/api/instagram/status",
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Aurax Instagram API Server running on port ${PORT}`);
  console.log("📱 Instagram endpoints available:");
  console.log(
    `   GET  http://localhost:${PORT}/api/instagram/profile?accessToken=...`
  );
  console.log(
    `   GET  http://localhost:${PORT}/api/instagram/insights?accessToken=...`
  );
  console.log(`   GET  http://localhost:${PORT}/api/instagram/status`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
});

module.exports = app;
