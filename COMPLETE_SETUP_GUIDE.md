# 🚀 Aurax Platform - Complete Setup & Fix Guide

## 📋 **What's Already Built**

Your platform has:
- ✅ Email/Password authentication (registration, login, OTP verification)
- ✅ Instagram Graph API integration (OAuth, profile fetch, insights sync)
- ✅ Facebook Page connection flow
- ✅ Background Instagram analysis worker (BullMQ)
- ✅ Frontend dashboard with Instagram connect button
- ✅ MailerSend email service integration

## ❌ **Current Blocking Issues**

1. **Registration endpoint crashes** - "socket hang up" error
2. **Server stability** - Backend exits unexpectedly
3. **Authentication middleware conflict** - Fixed but needs server restart

---

## 🔧 **FIXES APPLIED**

### Fix 1: Authentication Middleware (✅ COMPLETE)

**Problem:** All `/api/auth/*` routes required authentication token, blocking public registration/login

**Solution:**
```javascript
// backend-copy/server.js - Line 642
// BEFORE (Wrong):
app.use("/api/auth", authMiddleware, socialAuthRoutes);

// AFTER (Fixed):
app.use("/api/auth", socialAuthRoutes); // No global auth required
```

**Files Modified:**
- `backend-copy/server.js` (removed global authMiddleware)
- `backend-copy/routes/socialAuth.js` (added authMiddleware to protected routes only)

### Fix 2: Redis Worker Stability (✅ COMPLETE)

**Problem:** Redis connection errors flooding console and potentially crashing server

**Solution:**
- Added Redis availability check before initializing BullMQ
- Graceful fallback to synchronous analysis mode
- Suppressed connection error spam

**File:** `backend-copy/workers/instagramAnalysisWorker.js`

### Fix 3: Error Handlers (✅ COMPLETE)

**Problem:** Unhandled errors causing process exit

**Solution:**
- Moved error handlers to top of server.js (before any imports)
- Added SIGINT/SIGTERM handling
- Added process exit logging

---

## 🎬 **STEP-BY-STEP STARTUP GUIDE**

### **Prerequisites**
```powershell
# Check Node.js version
node --version  # Should be 14+ or 16+

# Check if MongoDB is accessible
# Your MONGODB_URI should be set in .env file

# Check npm is working
npm --version
```

### **Step 1: Install Dependencies**

```powershell
# Backend dependencies
cd "C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy"
npm install

# Frontend dependencies (if needed)
cd "C:\Users\hp\OneDrive\Desktop\frontend-copy"
npm install
```

### **Step 2: Environment Variables**

Verify `backend-copy/.env` has these values:

```env
# MongoDB
MONGODB_URI=mongodb+srv://your-connection-string

# JWT
JWT_SECRET=your-secret-key

# Email (MailerSend)
MAILERSEND_API_KEY=your-mailersend-key
EMAIL_FROM=hello@auraxai.in

# Instagram/Facebook
FACEBOOK_APP_ID=1975238456624246
FACEBOOK_APP_SECRET=3bd5b248c7c7438df7b1262b9f909c4f
FACEBOOK_CALLBACK_URL=http://localhost:5002/api/auth/facebook/callback

# Server
PORT=5002
NODE_ENV=development

# Session
SESSION_SECRET=your-session-secret
```

### **Step 3: Start Backend (Stable Method)**

**Option A: Dedicated PowerShell Window (Recommended)**
```powershell
# Open a NEW PowerShell window (keep it open)
cd "C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy"
$env:NODE_ENV="development"
node server.js

# DO NOT CLOSE THIS WINDOW
# You should see:
# ✅ Backend server running on http://localhost:5002
# ✅ MongoDB connected successfully
```

**Option B: Using npm start**
```powershell
cd "C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy"
npm start
```

**Option C: Using nodemon (auto-restart on changes)**
```powershell
# Install nodemon globally (one time)
npm install -g nodemon

# Start with nodemon
cd "C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy"
nodemon server.js
```

### **Step 4: Verify Backend is Running**

Open a **SEPARATE** PowerShell window:

```powershell
# Test health endpoint
curl http://localhost:5002/health

# Expected response:
# {"status":"ok","message":"Server is healthy","timestamp":"...","environment":"development"}
```

### **Step 5: Start Frontend**

```powershell
cd "C:\Users\hp\OneDrive\Desktop\frontend-copy"
npm start

# Opens browser at http://localhost:3000
```

---

## 🧪 **TESTING THE COMPLETE FLOW**

### **Test 1: Registration Flow**

1. **Navigate to:** http://localhost:3000/signup
2. **Fill in registration form:**
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `Test123!@#`
   - Role: Creator

3. **Submit form**
4. **Expected:** "Registration successful! Check your email" message
5. **Check email** for OTP code
6. **Enter OTP** on verification screen
7. **Expected:** Redirected to `/connect-socials`

### **Test 2: Instagram Connection Flow**

1. **After successful registration/login**
2. **You'll be redirected to:** `/connect-socials`
3. **Click:** "Connect Instagram Account" button
4. **Redirects to:** Facebook OAuth dialog
5. **Grant permissions:**
   - Public profile
   - Pages access
   - Instagram access

6. **Facebook redirects back**
7. **Backend fetches:**
   - Your Facebook Pages
   - Instagram Business Account linked to page
   - Instagram profile data (username, followers, media count)
   - Recent media posts

8. **Background job starts:**
   - Analyzes Instagram engagement
   - Calculates metrics (engagement rate, best posting times)
   - Takes 10-30 seconds

9. **Poll for status:** Frontend polls `/api/analysis/status`
10. **When complete:** Redirected to `/dashboard`
11. **Dashboard shows:**
    - Instagram profile info
    - Engagement metrics
    - Recent posts
    - Analytics graphs

### **Test 3: Manual API Testing**

```powershell
# Test registration
Invoke-RestMethod -Uri "http://localhost:5002/api/auth/register" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"username":"apitest","email":"apitest@test.com","password":"Test123!","role":"creator"}'

# Should return: {"success":true, "message":"Registration successful!", "otp":"123456"}

# Test verification
Invoke-RestMethod -Uri "http://localhost:5002/api/auth/verify-email" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"apitest@test.com","code":"123456"}'

# Should return: {"success":true, "token":"jwt-token-here"}

# Test login
Invoke-RestMethod -Uri "http://localhost:5002/api/auth/login" `
  -Method POST `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"email":"apitest@test.com","password":"Test123!"}'

# Should return: {"success":true, "token":"jwt-token-here"}
```

---

## 🔍 **TROUBLESHOOTING**

### Problem: "socket hang up" during registration

**Cause:** Server crashes mid-request

**Debug Steps:**
1. Check backend console for error messages
2. Look for stack traces before crash
3. Check MongoDB connection status
4. Verify MailerSend API key is valid

**Temporary Fix:**
```javascript
// In backend-copy/server.js registration endpoint
// Wrap everything in try-catch and log errors
console.log("📝 Registration request received");
console.log("Body:", req.body);
```

### Problem: "No authentication token provided"

**Status:** ✅ FIXED

**Verification:**
```powershell
# Registration should work WITHOUT token
curl -X POST http://localhost:5002/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"username":"test","email":"test@test.com","password":"Test123!","role":"creator"}'

# Should NOT return 401 error
```

### Problem: Instagram connection fails

**Check:**
1. Facebook App ID/Secret in `.env` are correct
2. Redirect URIs in Facebook Developer Console match:
   - `http://localhost:5002/api/auth/facebook/callback`
   - `http://localhost:3000/connect-socials`

3. Facebook Page has Instagram Business Account linked
4. User has granted all required permissions

### Problem: Analysis stays in "pending" state

**Causes:**
- Redis not running (worker can't process jobs)
- Instagram API permissions insufficient
- Instagram account not Business/Creator account

**Solutions:**
- Start Redis (or it will fallback to synchronous mode)
- Check Instagram account type
- Grant all Instagram permissions in Facebook dialog

---

## 📊 **MONITORING & LOGS**

### Backend Logs to Watch For:

```
✅ Good Signs:
✅ Backend server running on http://localhost:5002
✅ MongoDB connected successfully
✅ MailerSend service initialized
📝 Registration request received
✅ User successfully saved to database
📧 Registration OTP sent successfully

❌ Warning Signs:
❌ MongoDB connection error
❌ Failed to send verification code
⚠️  Redis unavailable - Running in MOCK mode
🛑 Process exiting with code: 1
```

### Frontend Console Logs:

```
✅ Good Signs:
Registration successful
JWT token received
Redirecting to /connect-socials
Instagram status: connected

❌ Warning Signs:
Network Error
401 Unauthorized
Registration failed
Cannot connect to backend
```

---

## 📈 **SUCCESS CRITERIA**

The platform is working correctly when:

- ✅ User can register without errors
- ✅ User receives OTP email via MailerSend
- ✅ User can verify OTP and get JWT token
- ✅ User is redirected to `/connect-socials`
- ✅ "Connect Instagram" button appears
- ✅ Facebook OAuth flow completes successfully
- ✅ Instagram profile data displays
- ✅ Analysis job processes in background
- ✅ Dashboard shows Instagram metrics
- ✅ No server crashes or 500 errors

---

## 🚀 **PRODUCTION DEPLOYMENT**

Before going live:

1. **Environment Variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=production-connection-string
   FACEBOOK_CALLBACK_URL=https://www.auraxai.in/api/auth/facebook/callback
   ```

2. **Facebook App Setup:**
   - Submit app for review
   - Add production redirect URIs
   - Switch from Development to Live mode

3. **Server Hosting:**
   - Use PM2 for process management
   - Enable HTTPS
   - Set up monitoring (logs, uptime)

4. **Database:**
   - Use MongoDB Atlas production cluster
   - Enable backups
   - Set up connection pooling

5. **Redis:**
   - Use managed Redis service (Redis Cloud, AWS ElastiCache)
   - Enable persistence
   - Configure memory limits

---

## 📞 **GETTING HELP**

If issues persist:

1. **Check backend console** for error stack traces
2. **Share error logs** from both backend and frontend
3. **Run E2E test suite:**
   ```powershell
   cd backend-copy
   node test-auth-flow-e2e.js
   ```
4. **Provide test results** showing which specific test fails

---

**Last Updated:** December 2, 2025  
**Status:** Authentication fixes applied, registration debugging in progress  
**Next Action:** Test registration flow end-to-end
