const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },

    password: {
      type: String,
      required: function () {
        return !this.isOAuthUser;
      },
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Don't include password in queries by default
    },

    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },

    // Account Type and Role
    accountType: {
      type: String,
      required: [true, "Account type is required"],
      enum: {
        values: ["brand", "creator", "admin"],
        message: "Account type must be either brand, creator, or admin",
      },
    },

    role: {
      type: String,
      default: function () {
        return this.accountType;
      },
      enum: ["brand", "creator", "admin"],
    },

    // Verification and Security
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    // Password Reset
    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    // OTP Authentication
    otpEnabled: {
      type: Boolean,
      default: false,
      description: "Whether user prefers OTP login over password",
    },

    preferredLoginMethod: {
      type: String,
      enum: ["password", "otp"],
      default: "password",
    },

    // Security Features
    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      select: false,
    },

    lastLoginAt: {
      type: Date,
    },

    lastLoginIP: {
      type: String,
    },

    // OAuth Integration
    isOAuthUser: {
      type: Boolean,
      default: false,
    },

    oauthProviders: [
      {
        provider: {
          type: String,
          enum: ["instagram", "google", "facebook"],
        },
        providerId: String,
        accessToken: {
          type: String,
          select: false,
        },
        refreshToken: {
          type: String,
          select: false,
        },
        connectedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Profile Information
    avatar: {
      type: String,
      default: null,
    },

    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },

    website: {
      type: String,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty values
          return /^https?:\/\//.test(v);
        },
        message:
          "Website must be a valid URL starting with http:// or https://",
      },
    },

    // Creator-specific fields
    instagramHandle: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true; // Allow empty values
          return /^[a-zA-Z0-9._]{1,30}$/.test(v);
        },
        message:
          "Instagram handle must be valid (1-30 characters, letters, numbers, dots, underscores only)",
      },
    },

    followerCount: {
      type: Number,
      min: [0, "Follower count cannot be negative"],
      default: 0,
    },

    categories: [
      {
        type: String,
        enum: [
          "fashion",
          "beauty",
          "lifestyle",
          "food",
          "travel",
          "fitness",
          "tech",
          "gaming",
          "education",
          "entertainment",
          "business",
          "parenting",
          "pets",
          "automotive",
          "sports",
        ],
      },
    ],

    // Brand-specific fields
    companyName: {
      type: String,
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },

    industry: {
      type: String,
      enum: [
        "fashion",
        "beauty",
        "food",
        "tech",
        "automotive",
        "healthcare",
        "finance",
        "education",
        "entertainment",
        "travel",
        "sports",
        "gaming",
        "lifestyle",
        "other",
      ],
    },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },

    isSuspended: {
      type: Boolean,
      default: false,
    },

    suspensionReason: {
      type: String,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.lockUntil;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ accountType: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({
  "oauthProviders.provider": 1,
  "oauthProviders.providerId": 1,
});

// Virtual for full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware
userSchema.pre("save", async function (next) {
  // Update the updatedAt field
  this.updatedAt = new Date();

  // Hash password if it's modified and not an OAuth user
  if (this.isModified("password") && !this.isOAuthUser) {
    if (this.password) {
      const salt = await bcrypt.genSalt(12);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Set role based on accountType
  if (this.isModified("accountType")) {
    this.role = this.accountType;
  }

  next();
});

// Instance Methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) {
    throw new Error("Password comparison not available for OAuth users");
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.incrementLoginAttempts = function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

userSchema.methods.updateLastLogin = function (ipAddress) {
  return this.updateOne({
    $set: {
      lastLoginAt: new Date(),
      lastLoginIP: ipAddress,
    },
    $unset: { loginAttempts: 1, lockUntil: 1 },
  });
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

userSchema.methods.toggleOTPLogin = function (enabled) {
  this.otpEnabled = enabled;
  this.preferredLoginMethod = enabled ? "otp" : "password";
  return this.save();
};

userSchema.methods.getPublicProfile = function () {
  const profile = this.toObject();

  // Remove sensitive fields
  delete profile.password;
  delete profile.emailVerificationToken;
  delete profile.emailVerificationExpires;
  delete profile.passwordResetToken;
  delete profile.passwordResetExpires;
  delete profile.lockUntil;
  delete profile.loginAttempts;
  delete profile.oauthProviders;

  return profile;
};

// Static Methods
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findVerifiedByEmail = function (email) {
  return this.findOne({
    email: email.toLowerCase(),
    isEmailVerified: true,
  });
};

userSchema.statics.findByEmailVerificationToken = function (token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return this.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
};

userSchema.statics.findByPasswordResetToken = function (token) {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  return this.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
};

userSchema.statics.createUser = async function (userData) {
  const user = new this(userData);
  await user.save();
  return user;
};

module.exports = mongoose.model("User", userSchema);
