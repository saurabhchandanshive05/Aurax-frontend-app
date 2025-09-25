// Complete Backend Server for Aurax Platform
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const fetch = require("node-fetch");

const app = express();

// In-memory storage for demo (replace with MongoDB in production)
const users = [];
const verificationCodes = new Map();

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://fe84fc3a4e9e.ngrok-free.app",
    ],
    credentials: true,
  })
);
app.use(express.json());

// Environment variables with defaults
const PORT = process.env.PORT || 5003;
const JWT_SECRET = process.env.JWT_SECRET || "aurax-jwt-secret-2024";
const INSTAGRAM_CLIENT_ID =
  process.env.INSTAGRAM_CLIENT_ID || "1975238456624246";
const INSTAGRAM_CLIENT_SECRET =
  process.env.INSTAGRAM_CLIENT_SECRET || "cc0057dc09a2a96574ef62c230a0d54f";
const INSTAGRAM_REDIRECT_URI =
  process.env.INSTAGRAM_REDIRECT_URI ||
  "http://localhost:3000/auth/instagram/callback";

// Email configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER || "your-email@gmail.com",
      pass: process.env.EMAIL_PASS || "your-app-password",
    },
  });
};

// Generate verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code, username) => {
  if (!process.env.EMAIL_USER) {
    console.log(`📧 Demo mode - Verification code for ${email}: ${code}`);
    return;
  }

  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Aurax Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to Aurax!</h2>
        <p>Hi ${username},</p>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 4px; margin: 0;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  });
};

// Send admin notification
const sendAdminNotification = async (user) => {
  if (!process.env.EMAIL_USER) {
    console.log(
      `📧 Demo mode - New user notification: ${user.username} (${user.email})`
    );
    return;
  }

  const transporter = createEmailTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "hello@auraxai.in",
    subject: "New User Registration - Aurax Platform",
    html: `
      <h2>New User Registration</h2>
      <ul>
        <li><strong>Username:</strong> ${user.username}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Phone:</strong> ${user.phone}</li>
        <li><strong>Role:</strong> ${user.role}</li>
        <li><strong>Registered:</strong> ${new Date().toLocaleString()}</li>
      </ul>
    `,
  });
};

// AUTHENTICATION ROUTES
// =====================

// Register user
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, phone, password, role = "creator" } = req.body;

    console.log("📝 Registration request:", { username, email, phone, role });

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Username, email, and password are required",
      });
    }

    // Check if user exists
    const existingUser = users.find(
      (u) => u.email === email || (phone && u.phone === phone)
    );
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: "User with this email or phone already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create user
    const user = {
      id: Date.now().toString(),
      username,
      email,
      phone,
      password: hashedPassword,
      role,
      verified: false,
      createdAt: new Date(),
      instagram: {
        connected: false,
        accessToken: null,
        profile: null,
      },
    };

    // Store user and verification code
    users.push(user);
    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      userId: user.id,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, verificationCode, username);
      await sendAdminNotification(user);
    } catch (emailError) {
      console.warn("⚠️ Email sending failed:", emailError.message);
    }

    console.log(
      `✅ User registered: ${username} (${email}) - Code: ${verificationCode}`
    );

    res.status(201).json({
      success: true,
      message:
        "Registration successful. Please check your email for the verification code.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: false,
      },
      // Include code in response for demo/testing
      verificationCode: verificationCode,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed",
      message: error.message,
    });
  }
});

// Verify email
app.post("/api/auth/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

    console.log("🔍 Email verification:", { email, code });

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: "Email and verification code are required",
      });
    }

    // Check verification code
    const storedVerification = verificationCodes.get(email);
    if (!storedVerification) {
      return res.status(400).json({
        success: false,
        error: "Verification code not found or expired",
      });
    }

    if (storedVerification.code !== code) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    if (Date.now() > storedVerification.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        error: "Verification code has expired",
      });
    }

    // Find and verify user
    const user = users.find((u) => u.id === storedVerification.userId);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    user.verified = true;
    user.verifiedAt = new Date();
    verificationCodes.delete(email);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ User verified: ${user.username} (${email})`);

    res.json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: true,
        instagram: user.instagram,
      },
    });
  } catch (error) {
    console.error("❌ Verification error:", error);
    res.status(500).json({
      success: false,
      error: "Verification failed",
      message: error.message,
    });
  }
});

// Login user
app.post("/api/auth/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    console.log("🔐 Login attempt:", { emailOrPhone });

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        error: "Email/phone and password are required",
      });
    }

    // Find user
    const user = users.find(
      (u) => u.email === emailOrPhone || u.phone === emailOrPhone
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if verified
    if (!user.verified) {
      return res.status(400).json({
        success: false,
        error: "Please verify your email before logging in",
        needsVerification: true,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ User logged in: ${user.username} (${user.email})`);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: true,
        instagram: user.instagram,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed",
      message: error.message,
    });
  }
});

// Resend verification
app.post("/api/auth/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.verified) {
      return res.status(400).json({
        success: false,
        error: "User is already verified",
      });
    }

    const verificationCode = generateVerificationCode();
    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
      userId: user.id,
    });

    await sendVerificationEmail(email, verificationCode, user.username);

    res.json({
      success: true,
      message: "New verification code sent",
      verificationCode: verificationCode,
    });
  } catch (error) {
    console.error("❌ Resend verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resend verification code",
    });
  }
});

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: "Invalid or expired token",
      });
    }
    req.user = user;
    next();
  });
};

// Get user profile
app.get("/api/auth/profile", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  res.json({
    success: true,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      verified: user.verified,
      instagram: user.instagram,
      createdAt: user.createdAt,
    },
  });
});

// INSTAGRAM OAUTH ROUTES
// ======================

// Get Instagram OAuth URL
app.get("/api/instagram/oauth/url", (req, res) => {
  const oauthUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    INSTAGRAM_REDIRECT_URI
  )}&scope=user_profile,user_media&response_type=code&state=${Math.random()
    .toString(36)
    .substring(7)}`;

  res.json({
    success: true,
    oauth_url: oauthUrl,
    client_id: INSTAGRAM_CLIENT_ID,
    redirect_uri: INSTAGRAM_REDIRECT_URI,
  });
});

// Instagram OAuth callback
app.post("/api/instagram/oauth/callback", async (req, res) => {
  try {
    const { code } = req.body;
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    console.log("🔄 Instagram OAuth callback...");

    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Authorization code is required",
      });
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://api.instagram.com/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: INSTAGRAM_CLIENT_ID,
          client_secret: INSTAGRAM_CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: INSTAGRAM_REDIRECT_URI,
          code: code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      throw new Error(
        error.error_message || "Failed to exchange code for token"
      );
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Instagram token obtained");

    // Get profile data
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${tokenData.access_token}`
    );

    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      throw new Error(
        error.error?.message || "Failed to fetch Instagram profile"
      );
    }

    const profileData = await profileResponse.json();
    console.log(`✅ Instagram profile: @${profileData.username}`);

    // Save to user profile if authenticated
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userIndex = users.findIndex((u) => u.id === decoded.userId);

        if (userIndex >= 0) {
          users[userIndex].instagram = {
            connected: true,
            accessToken: tokenData.access_token,
            profile: profileData,
            connectedAt: new Date(),
          };
          console.log(`✅ Instagram connected for user: ${decoded.username}`);
        }
      } catch (error) {
        console.warn("⚠️ Failed to save Instagram connection:", error.message);
      }
    }

    res.json({
      success: true,
      message: "Instagram connected successfully",
      instagram: {
        connected: true,
        profile: profileData,
        access_token: tokenData.access_token,
      },
    });
  } catch (error) {
    console.error("❌ Instagram OAuth error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get Instagram connection status
app.get("/api/instagram/connection-status", authenticateToken, (req, res) => {
  const user = users.find((u) => u.id === req.user.userId);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "User not found",
    });
  }

  res.json({
    success: true,
    instagram: {
      connected: user.instagram.connected || false,
      profile: user.instagram.connected ? user.instagram.profile : null,
      connected_at: user.instagram.connectedAt || null,
    },
  });
});

// Get Instagram profile data
app.get("/api/instagram/profile", async (req, res) => {
  try {
    const { accessToken } = req.query;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Access token is required",
      });
    }

    console.log("📊 Fetching Instagram profile data...");

    // Get profile info
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count,followers_count,follows_count&access_token=${accessToken}`
    );

    if (!profileResponse.ok) {
      const error = await profileResponse.json();
      throw new Error(error.error?.message || "Failed to fetch profile");
    }

    const profileData = await profileResponse.json();

    // Get recent media
    const mediaResponse = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink,timestamp,like_count,comments_count,media_type,thumbnail_url&limit=12&access_token=${accessToken}`
    );

    let mediaData = { data: [] };
    if (mediaResponse.ok) {
      mediaData = await mediaResponse.json();
    }

    // Enhanced media data
    const enhancedMedia = mediaData.data.map((post) => ({
      id: post.id,
      caption: post.caption || "",
      media_url: post.media_url,
      thumbnail_url: post.thumbnail_url || post.media_url,
      permalink: post.permalink,
      timestamp: post.timestamp,
      like_count: post.like_count || 0,
      comments_count: post.comments_count || 0,
      media_type: post.media_type || "IMAGE",
      formatted_date: new Date(post.timestamp).toLocaleDateString(),
      engagement: (post.like_count || 0) + (post.comments_count || 0),
    }));

    res.json({
      success: true,
      profile: {
        id: profileData.id,
        username: profileData.username,
        account_type: profileData.account_type,
        media_count: profileData.media_count,
        followers_count: profileData.followers_count || 0,
        follows_count: profileData.follows_count || 0,
      },
      media: enhancedMedia,
      meta: {
        posts_fetched: enhancedMedia.length,
        fetched_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Instagram API Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// SYSTEM ROUTES
// =============

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Aurax Backend Server is running",
    timestamp: new Date().toISOString(),
    users_count: users.length,
    verified_users: users.filter((u) => u.verified).length,
    instagram_connected: users.filter((u) => u.instagram?.connected).length,
    endpoints: {
      "POST /api/auth/register": "User registration",
      "POST /api/auth/verify-email": "Email verification",
      "POST /api/auth/login": "User login",
      "GET /api/auth/profile": "Get user profile",
      "GET /api/instagram/oauth/url": "Get Instagram OAuth URL",
      "POST /api/instagram/oauth/callback": "Instagram OAuth callback",
      "GET /api/instagram/connection-status": "Instagram connection status",
      "GET /api/instagram/profile": "Get Instagram profile data",
      "GET /api/health": "Health check",
    },
  });
});

// Configuration
app.get("/api/config", (req, res) => {
  res.json({
    success: true,
    config: {
      instagram_client_id: INSTAGRAM_CLIENT_ID,
      instagram_redirect_uri: INSTAGRAM_REDIRECT_URI,
      api_base_url: `http://localhost:${PORT}`,
      frontend_url: "http://localhost:3000",
    },
  });
});

// Test users endpoint (dev only)
app.get("/api/test/users", (req, res) => {
  res.json({
    success: true,
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      verified: u.verified,
      instagram_connected: u.instagram?.connected || false,
      created_at: u.createdAt,
    })),
  });
});

// Error handling
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
app.listen(PORT, () => {
  console.log("🚀 Aurax Backend Server started successfully!");
  console.log("=".repeat(60));
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
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
  console.log(`   GET  http://localhost:${PORT}/api/instagram/profile`);
  console.log("");
  console.log("🎯 Frontend should be running on: http://localhost:3000");
  console.log("🔗 CORS enabled for frontend and ngrok");
  console.log("=".repeat(60));
});

module.exports = app;
