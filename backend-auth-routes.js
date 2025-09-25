// Enhanced Backend Authentication Routes for Aurax Platform
// File: backend-auth-routes.js (Place this in your backend-copy directory)

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const router = express.Router();

// Assuming you have a User model - adjust based on your MongoDB setup
// const User = require('./models/User'); // Adjust path as needed

// Email configuration for Nodemailer
const transporter = nodemailer.createTransporter({
  service: "gmail", // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
});

// Temporary storage for verification codes (use Redis in production)
const verificationCodes = new Map();

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || "noreply@auraxai.in",
    to: email,
    subject: "🎯 Aurax Email Verification",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1>🎯 Welcome to Aurax!</h1>
          <p>Your Influencer Marketing Platform</p>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for joining Aurax! Use the verification code below to complete your registration:</p>
          
          <div style="background: #fff; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #667eea; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          
          <p><strong>This code will expire in 15 minutes.</strong></p>
          
          <p>If you didn't create an account with Aurax, please ignore this email.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
              Best regards,<br>
              The Aurax Team<br>
              <a href="https://auraxai.in">auraxai.in</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Send new user notification to admin
const sendAdminNotification = async (userData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || "system@auraxai.in",
    to: "hello@auraxai.in",
    subject: "🎉 New User Registration - Aurax Platform",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; padding: 20px; text-align: center; color: white;">
          <h2>🎉 New User Registration</h2>
        </div>
        <div style="padding: 30px; background: #f9f9f9;">
          <h3>New User Details:</h3>
          <ul style="background: white; padding: 20px; border-radius: 8px;">
            <li><strong>Username:</strong> ${userData.username}</li>
            <li><strong>Email:</strong> ${userData.email}</li>
            <li><strong>Phone:</strong> ${userData.phone}</li>
            <li><strong>Role:</strong> ${userData.role}</li>
            <li><strong>Registration Date:</strong> ${new Date().toLocaleString()}</li>
          </ul>
          
          <p><strong>Action Required:</strong> Please verify and approve this user manually in the admin dashboard.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Admin notification sent for new user:", userData.email);
  } catch (error) {
    console.error("❌ Failed to send admin notification:", error);
  }
};

// 1. Enhanced Registration Route
router.post("/register", async (req, res) => {
  try {
    const { username, email, phone, password, role } = req.body;

    // Validation
    if (!username || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: "User with this email or phone already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (unverified initially)
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword,
      role,
      isEmailVerified: false,
      isManuallyVerified: false,
      createdAt: new Date(),
    });

    await newUser.save();

    // Generate and store verification code
    const verificationCode = generateVerificationCode();
    verificationCodes.set(email, {
      code: verificationCode,
      userId: newUser._id,
      expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // Send verification email to user
    await sendVerificationEmail(email, verificationCode);

    // Send notification to admin
    await sendAdminNotification({ username, email, phone, role });

    res.json({
      success: true,
      message: "Registration initiated. Please verify your email.",
      userId: newUser._id,
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration failed. Please try again.",
    });
  }
});

// 2. Email Verification Route
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
    const storedData = verificationCodes.get(email);
    if (!storedData) {
      return res.status(400).json({
        success: false,
        error: "No verification code found for this email",
      });
    }

    if (Date.now() > storedData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        error: "Verification code has expired",
      });
    }

    if (storedData.code !== code) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification code",
      });
    }

    // Update user as email verified
    const user = await User.findByIdAndUpdate(
      storedData.userId,
      { isEmailVerified: true },
      { new: true }
    ).select("-password");

    // Clean up verification code
    verificationCodes.delete(email);

    // Generate JWT token for auto-login
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isManuallyVerified: user.isManuallyVerified,
      },
    });
  } catch (error) {
    console.error("❌ Email verification error:", error);
    res.status(500).json({
      success: false,
      error: "Verification failed. Please try again.",
    });
  }
});

// 3. Enhanced Login Route (email or phone)
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        error: "Email/phone and password are required",
      });
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        error: "Please verify your email before logging in",
        needsVerification: true,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isManuallyVerified: user.isManuallyVerified,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      error: "Login failed. Please try again.",
    });
  }
});

// 4. Resend Verification Code
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: "Email is already verified",
      });
    }

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    verificationCodes.set(email, {
      code: verificationCode,
      userId: user._id,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    // Send new verification email
    await sendVerificationEmail(email, verificationCode);

    res.json({
      success: true,
      message: "New verification code sent to your email",
    });
  } catch (error) {
    console.error("❌ Resend verification error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resend verification code",
    });
  }
});

module.exports = router;
