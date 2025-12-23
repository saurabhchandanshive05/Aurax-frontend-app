// backend-copy/models/User.js
// Add these fields to your existing User schema

const UserSchema = new mongoose.Schema({
  // ========== EXISTING FIELDS ==========
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['creator', 'brand', 'admin'],
    default: 'creator'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  profilesConnected: {
    type: Boolean,
    default: false
  },

  // ========== NEW ONBOARDING FIELDS ==========
  
  // Profile Information
  fullName: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  location: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },

  // Onboarding Status Flags
  isProfileCompleted: {
    type: Boolean,
    default: false
  },
  hasAudienceInfo: {
    type: Boolean,
    default: false
  },
  hasCompletedOnboarding: {
    type: Boolean,
    default: false
  },

  // Instagram Connection Flag (you may already have this)
  isInstagramConnected: {
    type: Boolean,
    default: false
  },

  // Audience Preferences
  audienceInfo: {
    categories: {
      type: [String],
      default: []
    },
    contentTypes: {
      type: [String],
      default: []
    },
    regions: {
      type: [String],
      default: []
    }
  },

  // Instagram Data Cache (for quick access)
  instagram: {
    username: String,
    profilePicture: String,
    followersCount: Number,
    mediaCount: Number
  },

  // ========== EXISTING TIMESTAMPS ==========
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update timestamps
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual to check if onboarding is complete
UserSchema.virtual('onboardingComplete').get(function() {
  return this.isProfileCompleted && 
         this.profilesConnected && 
         this.hasAudienceInfo;
});

// Method to update onboarding completion status
UserSchema.methods.updateOnboardingStatus = function() {
  this.hasCompletedOnboarding = (
    this.isProfileCompleted && 
    this.profilesConnected && 
    this.hasAudienceInfo
  );
};

module.exports = mongoose.model('User', UserSchema);
