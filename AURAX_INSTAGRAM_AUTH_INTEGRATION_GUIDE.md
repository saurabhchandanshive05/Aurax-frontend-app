# 🎯 Aurax Instagram Authentication & Integration Guide

## ✅ What's Been Implemented

### 1. Enhanced Registration System

- **File**: `SignupEnhanced.js`
- **Features**:
  - Username, email, phone number, password fields
  - Email verification with 6-digit codes
  - Auto-login after email verification
  - Admin notification emails to `hello@auraxai.in`
  - Role selection (Brand/Creator)

### 2. Enhanced Login System

- **File**: `CreatorLoginEnhanced.js`
- **Features**:
  - Login with email OR phone number
  - Enhanced validation and error handling
  - Verification code resend functionality
  - Remember me option

### 3. Instagram OAuth Integration

- **Files**:
  - Frontend: Enhanced `CreatorDashboard.js`
  - Backend: `backend-instagram-oauth-routes.js`
- **Features**:
  - One-tap Instagram OAuth connection
  - Long-lived access token management
  - Secure token storage and refresh
  - Instagram profile and media fetching

### 4. Backend Authentication Routes

- **File**: `backend-auth-routes.js`
- **Features**:
  - User registration with email verification
  - Login with email/phone support
  - Nodemailer integration for emails
  - Admin notifications
  - Password hashing with bcrypt

---

## 🚀 Setup Instructions

### Backend Integration (in your `backend-copy` directory):

#### 1. Install Required Dependencies

```bash
cd C:\Users\hp\OneDrive\Desktop\backend-copy
npm install bcryptjs jsonwebtoken nodemailer
```

#### 2. Add Authentication Routes to Your Server

```javascript
// In your main server file (server.js or app.js)
const authRoutes = require("./backend-auth-routes");
const instagramRoutes = require("./backend-instagram-api-routes");
const instagramOAuthRoutes = require("./backend-instagram-oauth-routes");

// Add routes
app.use("/api", authRoutes);
app.use("/api", instagramRoutes);
app.use("/api", instagramOAuthRoutes);
```

#### 3. Environment Variables

Create/update your `.env` file:

```env
# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Instagram OAuth
INSTAGRAM_CLIENT_ID=your-instagram-client-id
INSTAGRAM_CLIENT_SECRET=your-instagram-client-secret

# MongoDB Connection (if needed)
MONGODB_URI=mongodb://localhost:27017/aurax_db
```

#### 4. Create User Model (if not exists)

```javascript
// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["brand", "creator"], required: true },
  isEmailVerified: { type: Boolean, default: false },
  isManuallyVerified: { type: Boolean, default: false },
  instagramConnected: { type: Boolean, default: false },
  instagramAccessToken: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", userSchema);
```

### Frontend Integration:

#### 1. Update Your Routes

```javascript
// In your routing file (App.js or routes)
import SignupEnhanced from './pages/SignupEnhanced';
import CreatorLoginEnhanced from './pages/CreatorLoginEnhanced';

// Add routes
<Route path="/signup" element={<SignupEnhanced />} />
<Route path="/creator-login" element={<CreatorLoginEnhanced />} />
```

#### 2. Instagram OAuth Setup

1. Go to [Instagram Developer Portal](https://developers.facebook.com/apps/)
2. Create new app or use existing
3. Add Instagram Basic Display product
4. Set redirect URI: `https://your-domain.com/auth/instagram/callback`
5. Copy Client ID and Secret to your `.env`

#### 3. Update Environment Variables

```env
# Frontend .env
REACT_APP_INSTAGRAM_CLIENT_ID=your-instagram-client-id
```

---

## 🎯 Testing the Integration

### 1. Test Registration Flow

1. Go to `/signup`
2. Fill out all fields (username, email, phone, password)
3. Submit form → Should show "verification code sent" message
4. Check email for 6-digit code
5. Enter code → Should auto-login and redirect to dashboard
6. Check `hello@auraxai.in` for admin notification

### 2. Test Login Flow

1. Go to `/creator-login`
2. Enter email OR phone number + password
3. Should redirect to dashboard on success
4. Try with unverified account → Should show verification prompt

### 3. Test Instagram Connection

1. Login to dashboard
2. Look for "Connect Instagram" card
3. Click "Connect Instagram" → Should redirect to Instagram OAuth
4. Authorize app → Should return with success message
5. Instagram dashboard should now show profile data and media

### 4. Test Instagram Dashboard

1. After connecting Instagram, click "🎨 Enhanced View"
2. Should display:
   - Profile picture and info
   - Recent media posts in grid
   - Engagement metrics
   - Interactive media modals

---

## 📧 Email Configuration

### Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on Gmail
2. Generate App Password: Google Account → Security → App passwords
3. Use app password (not your regular password) in `EMAIL_PASS`

### Email Templates

The system sends 2 types of emails:

1. **User Verification**: Styled verification code email
2. **Admin Notification**: New user details to `hello@auraxai.in`

---

## 🔧 Troubleshooting

### Common Issues:

#### Backend Issues:

- **"Cannot find module 'bcryptjs'"**: Run `npm install bcryptjs jsonwebtoken nodemailer`
- **Email not sending**: Check Gmail app password and 2FA settings
- **MongoDB errors**: Ensure MongoDB is running and connection string is correct

#### Frontend Issues:

- **API calls failing**: Check if backend is running on correct port
- **Instagram OAuth fails**: Verify Client ID and redirect URI match Instagram app settings
- **Token storage issues**: Check browser localStorage for tokens

#### Instagram Issues:

- **OAuth redirect fails**: Ensure redirect URI is whitelisted in Instagram app
- **Token expired**: Implement token refresh or reconnection flow
- **Profile data not loading**: Check Instagram Graph API permissions

---

## 🎉 Success Indicators

You'll know everything is working when:

- ✅ New users can register with email/phone verification
- ✅ Admin gets notified of new registrations at `hello@auraxai.in`
- ✅ Users can login with email OR phone number
- ✅ Instagram OAuth redirects work smoothly
- ✅ Instagram dashboard shows profile and media data
- ✅ All forms have proper validation and error handling

---

## 🔄 Next Steps (Optional Enhancements)

1. **User Management**: Admin panel to approve/reject users
2. **Advanced Instagram Analytics**: Hashtag analysis, competitor insights
3. **Campaign Management**: Connect brands with creators
4. **Payment Integration**: Stripe/PayPal for campaign payments
5. **Real-time Notifications**: WebSocket for live updates

Your Aurax platform now has comprehensive authentication and Instagram integration! 🚀
