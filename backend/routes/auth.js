const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const router = express.Router();

// Mock user storage (replace with MongoDB in production)
const users = [];
const verificationCodes = new Map(); // Store verification codes temporarily

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code, username) => {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Aurax Account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to Aurax!</h2>
        <p>Hi ${username},</p>
        <p>Thank you for registering with Aurax. Please use the verification code below to complete your registration:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 4px; margin: 0;">${code}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Aurax Team</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send admin notification
const sendAdminNotification = async (user) => {
  const transporter = createEmailTransporter();

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.ADMIN_EMAIL || "hello@auraxai.in",
    subject: "New User Registration - Aurax Platform",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">New User Registration</h2>
        <p>A new user has registered on the Aurax platform:</p>
        <ul>
          <li><strong>Username:</strong> ${user.username}</li>
          <li><strong>Email:</strong> ${user.email}</li>
          <li><strong>Phone:</strong> ${user.phone || "Not provided"}</li>
          <li><strong>Role:</strong> ${user.role}</li>
          <li><strong>Registered:</strong> ${new Date().toLocaleString()}</li>
        </ul>
        <p>The user is pending email verification.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.warn("⚠️ Admin notification failed:", error.message);
  }
};

// Registration endpoint
router.post("/register", async (req, res) => {
  try {
    const { username, email, phone, password, role = "creator" } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Username, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = users.find(
      (u) => u.email === email || u.phone === phone
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

    // Create user (not verified yet)
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
    await sendVerificationEmail(email, verificationCode, username);

    // Send admin notification
    await sendAdminNotification(user);

    console.log(`✅ User registered: ${username} (${email})`);
    console.log(`📧 Verification code sent: ${verificationCode}`);

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

// Verify email endpoint
router.post("/verify-email", async (req, res) => {
  try {
    const { email, code } = req.body;

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
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || "7d" }
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

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({
        success: false,
        error: "Email/phone and password are required",
      });
    }

    // Find user by email or phone
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

    // Check if user is verified
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
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || "7d" }
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

// Resend verification code
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

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

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    verificationCodes.set(email, {
      code: verificationCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      userId: user.id,
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode, user.username);

    console.log(
      `📧 New verification code sent: ${verificationCode} for ${email}`
    );

    res.json({
      success: true,
      message: "New verification code sent to your email",
    });
  } catch (error) {
    console.error("❌ Resend verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resend verification code",
      message: error.message,
    });
  }
});

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Access token required",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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

// Get current user profile
router.get("/profile", authenticateToken, (req, res) => {
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

module.exports = router;
