const mongoose = require("mongoose");
const crypto = require("crypto");

const otpTokenSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    otp: {
      type: String,
      required: [true, "OTP is required"],
      length: [6, "OTP must be exactly 6 digits"],
    },

    hashedOTP: {
      type: String,
      required: true,
      select: false,
    },

    purpose: {
      type: String,
      required: [true, "OTP purpose is required"],
      enum: {
        values: [
          "registration",
          "login",
          "password-reset",
          "email-verification",
        ],
        message:
          "Purpose must be one of: registration, login, password-reset, email-verification",
      },
    },

    attempts: {
      type: Number,
      default: 0,
      max: [3, "Maximum 3 verification attempts allowed"],
    },

    isUsed: {
      type: Boolean,
      default: false,
    },

    ipAddress: {
      type: String,
      required: false,
    },

    userAgent: {
      type: String,
      required: false,
    },

    metadata: {
      type: Map,
      of: String,
      default: new Map(),
    },

    expiresAt: {
      type: Date,
      required: true,
      default: function () {
        // Default expiry: 10 minutes from creation
        return new Date(Date.now() + 10 * 60 * 1000);
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    usedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance and automatic cleanup
otpTokenSchema.index({ email: 1, purpose: 1 });
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic cleanup
otpTokenSchema.index({ createdAt: -1 });
otpTokenSchema.index({ hashedOTP: 1 });

// Virtual for checking if OTP is expired
otpTokenSchema.virtual("isExpired").get(function () {
  return this.expiresAt < new Date();
});

// Virtual for checking if OTP is valid (not used, not expired, not exceeded attempts)
otpTokenSchema.virtual("isValid").get(function () {
  return !this.isUsed && !this.isExpired && this.attempts < 3;
});

// Static Methods
otpTokenSchema.statics.generateOTP = function () {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

otpTokenSchema.statics.hashOTP = function (otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

otpTokenSchema.statics.createOTPToken = async function (
  email,
  purpose,
  options = {}
) {
  const {
    expiryMinutes = 10,
    ipAddress = null,
    userAgent = null,
    metadata = {},
  } = options;

  // Clean up any existing unused OTPs for this email and purpose
  await this.deleteMany({
    email: email.toLowerCase(),
    purpose,
    $or: [
      { isUsed: true },
      { expiresAt: { $lt: new Date() } },
      { attempts: { $gte: 3 } },
    ],
  });

  // Generate new OTP
  const otp = this.generateOTP();
  const hashedOTP = this.hashOTP(otp);

  // Create expiry date
  const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

  // Create the token document
  const otpToken = new this({
    email: email.toLowerCase(),
    otp, // Store plain OTP temporarily for email sending
    hashedOTP,
    purpose,
    ipAddress,
    userAgent,
    metadata: new Map(Object.entries(metadata)),
    expiresAt,
  });

  await otpToken.save();

  // Return the token with plain OTP for email sending
  return {
    token: otpToken,
    plainOTP: otp,
  };
};

otpTokenSchema.statics.verifyOTP = async function (email, otp, purpose) {
  const hashedOTP = this.hashOTP(otp);

  // Find the matching OTP token
  const otpToken = await this.findOne({
    email: email.toLowerCase(),
    hashedOTP,
    purpose,
    isUsed: false,
  });

  if (!otpToken) {
    return {
      success: false,
      error: "Invalid or expired OTP",
      code: "INVALID_OTP",
    };
  }

  // Check if expired
  if (otpToken.isExpired) {
    await otpToken.deleteOne();
    return {
      success: false,
      error: "OTP has expired",
      code: "EXPIRED_OTP",
    };
  }

  // Check attempts
  if (otpToken.attempts >= 3) {
    await otpToken.deleteOne();
    return {
      success: false,
      error: "Maximum verification attempts exceeded",
      code: "MAX_ATTEMPTS_EXCEEDED",
    };
  }

  // Mark as used
  otpToken.isUsed = true;
  otpToken.usedAt = new Date();
  await otpToken.save();

  return {
    success: true,
    token: otpToken,
    message: "OTP verified successfully",
  };
};

otpTokenSchema.statics.incrementAttempt = async function (email, otp, purpose) {
  const hashedOTP = this.hashOTP(otp);

  const result = await this.updateOne(
    {
      email: email.toLowerCase(),
      hashedOTP,
      purpose,
      isUsed: false,
    },
    {
      $inc: { attempts: 1 },
    }
  );

  return result.modifiedCount > 0;
};

otpTokenSchema.statics.cleanupExpired = async function () {
  const result = await this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      {
        isUsed: true,
        usedAt: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      }, // Clean used OTPs older than 24 hours
      { attempts: { $gte: 3 } },
    ],
  });

  return result.deletedCount;
};

otpTokenSchema.statics.findActiveOTP = async function (email, purpose) {
  return await this.findOne({
    email: email.toLowerCase(),
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
    attempts: { $lt: 3 },
  });
};

otpTokenSchema.statics.hasRecentOTP = async function (
  email,
  purpose,
  withinMinutes = 1
) {
  const cutoffTime = new Date(Date.now() - withinMinutes * 60 * 1000);

  const recentOTP = await this.findOne({
    email: email.toLowerCase(),
    purpose,
    createdAt: { $gt: cutoffTime },
  });

  return !!recentOTP;
};

// Instance Methods
otpTokenSchema.methods.markAsUsed = async function () {
  this.isUsed = true;
  this.usedAt = new Date();
  return await this.save();
};

otpTokenSchema.methods.incrementAttempts = async function () {
  this.attempts += 1;
  return await this.save();
};

otpTokenSchema.methods.isValidForVerification = function () {
  return !this.isUsed && !this.isExpired && this.attempts < 3;
};

otpTokenSchema.methods.getRemainingAttempts = function () {
  return Math.max(0, 3 - this.attempts);
};

otpTokenSchema.methods.getTimeRemaining = function () {
  if (this.isExpired) return 0;
  return Math.max(0, this.expiresAt.getTime() - Date.now());
};

otpTokenSchema.methods.getTimeRemainingMinutes = function () {
  return Math.ceil(this.getTimeRemaining() / (60 * 1000));
};

// Pre-save middleware
otpTokenSchema.pre("save", function (next) {
  // Clear the plain OTP after first save for security
  if (!this.isNew && this.otp) {
    this.otp = undefined;
  }
  next();
});

// Post-save middleware to clean up plain OTP
otpTokenSchema.post("save", function (doc) {
  // Remove plain OTP from memory after saving
  if (doc.otp) {
    doc.otp = undefined;
  }
});

module.exports = mongoose.model("OTPToken", otpTokenSchema);
