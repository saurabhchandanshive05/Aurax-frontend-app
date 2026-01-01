# 🔧 Instagram OAuth Session Fix - Complete Guide

## 🚨 Problem: "Please login first before connecting Instagram"

### Error Flow
```
Dashboard (authenticated)
  → Click "Connect Instagram"
  → /api/auth/instagram/login (stores userId in session)
  → Redirects to Facebook OAuth
  → Meta OAuth → User approves
  → /api/auth/instagram/callback ❌ SESSION LOST
  → Backend: "No userId in session"
  → Redirect to /login?error=Please%20login%20first
```

### Root Causes

**1. Session Not Persisting**
- Session created in `/instagram/login` route
- Session cookie not being sent back to `/instagram/callback`
- Ngrok OAuth redirects break session continuity

**2. Session Configuration Issues**
- `secure: true` in production mode breaks with ngrok HTTPS → localhost HTTP
- `saveUninitialized: false` prevents session creation for OAuth
- Missing `sameSite` configuration for cross-origin OAuth flows
- Session not explicitly saved before redirect

**3. Cookie Not Transmitted**
- Browser doesn't send session cookie during OAuth callback
- Cookie settings incompatible with OAuth redirect flow

---

## ✅ Fixes Applied

### Fix 1: Session Configuration (server.js)

**File**: `backend-copy/server.js` (lines ~165-180)

**Before**:
```javascript
session({
  secret: process.env.SESSION_SECRET || "your_session_secret_change_in_production",
  resave: false,
  saveUninitialized: false, // ❌ Prevents OAuth session creation
  cookie: {
    secure: process.env.NODE_ENV === "production", // ❌ Breaks with ngrok
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
})
```

**After**:
```javascript
session({
  secret: process.env.SESSION_SECRET || "your_session_secret_change_in_production",
  resave: false,
  saveUninitialized: true, // ✅ Allow session creation for OAuth
  cookie: {
    secure: false, // ✅ Works with ngrok → localhost
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax', // ✅ Allow cookies on OAuth redirects
  },
})
```

**Changes**:
- `saveUninitialized: true` - Allows session creation for OAuth flows
- `secure: false` - Works with ngrok (HTTPS) → localhost (HTTP) setup
- `sameSite: 'lax'` - Permits cookies during OAuth redirect navigation

### Fix 2: Explicit Session Save (socialAuth.js)

**File**: `backend-copy/routes/socialAuth.js` (lines ~313-360)

**Before**:
```javascript
router.get("/instagram/login", (req, res) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.session.pendingOAuthUserId = decoded._id;
  console.log("✅ User ID stored in session");
  
  const authUrl = OAuthService.getAuthorizationUrl();
  res.redirect(authUrl); // ❌ Redirect before session is saved!
});
```

**After**:
```javascript
router.get("/instagram/login", (req, res) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.session.pendingOAuthUserId = decoded._id;
  console.log("✅ User ID stored in session:", req.session.pendingOAuthUserId);
  console.log("✅ Session ID:", req.sessionID);
  
  // ✅ Save session explicitly before redirect
  req.session.save((err) => {
    if (err) {
      console.error("❌ Session save error:", err);
      return res.status(500).json({
        success: false,
        error: "Failed to save session"
      });
    }
    
    console.log("✅ Session saved successfully");
    console.log("Session data after save:", req.session);
    
    const authUrl = OAuthService.getAuthorizationUrl();
    console.log("✅ Redirecting to Meta OAuth...");
    
    res.redirect(authUrl); // ✅ Redirect AFTER session is saved
  });
});
```

**Changes**:
- Explicit `req.session.save()` before redirect
- Error handling for session save failures
- Enhanced logging to track session state

### Fix 3: Enhanced Callback Debugging (socialAuth.js)

**File**: `backend-copy/routes/socialAuth.js` (lines ~390-410)

**Added Logging**:
```javascript
router.get("/instagram/callback", async (req, res) => {
  console.log("═".repeat(70));
  console.log("🔔 ✅ NEW INSTAGRAM CALLBACK HIT!");
  console.log("═".repeat(70));
  console.log("📝 Session ID:", req.sessionID);
  console.log("📝 Session data:", req.session);
  console.log("📝 Session userId:", req.session?.pendingOAuthUserId);
  console.log("📝 Headers:", {
    origin: req.headers.origin,
    referer: req.headers.referer,
    cookie: req.headers.cookie ? "Present" : "None",
  });
  
  const userId = req.session?.pendingOAuthUserId;
  
  if (!userId) {
    console.error("❌ No user ID in session");
    console.error("❌ Session ID on callback:", req.sessionID);
    console.error("❌ Full session object:", req.session);
    // ... error handling
  }
});
```

---

## 🧪 Testing Instructions

### Step 1: Restart Backend

```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
node server.js
```

**Watch for**:
```
✅ MongoDB connected successfully
🚀 Server running on port 5002
```

### Step 2: Test OAuth Flow

**Login**: http://localhost:3000
- Email: `saurabhchandan05@gmail.com`
- Password: `Saurabh@123`

**Click "Connect Instagram"**

### Step 3: Monitor Backend Logs

**OAuth Initiation** (`/instagram/login`):
```
🔐 Initiating Instagram OAuth...
✅ Token verified, user ID stored in session: 675f2e6e4b1c8d9e2a3f4b5c
✅ Session ID: s:abc123def456
✅ Session saved successfully
Session data after save: { 
  cookie: { ... }, 
  pendingOAuthUserId: '675f2e6e4b1c8d9e2a3f4b5c' 
}
✅ Auth URL generated, redirecting to Meta OAuth...
```

**OAuth Callback** (`/instagram/callback`):
```
════════════════════════════════════════════════════════════════════
🔔 ✅ NEW INSTAGRAM CALLBACK HIT!
════════════════════════════════════════════════════════════════════
📝 Session ID: s:abc123def456
📝 Session data: { 
  cookie: { ... }, 
  pendingOAuthUserId: '675f2e6e4b1c8d9e2a3f4b5c' 
}
📝 Session userId: 675f2e6e4b1c8d9e2a3f4b5c
📝 Headers: {
  origin: undefined,
  referer: 'https://www.facebook.com/',
  cookie: 'Present'
}
✅ Received authorization code, completing OAuth flow...
```

### Step 4: Verify Success

**Expected Flow**:
```
✅ OAuth access token obtained
✅ Instagram Business Account ID: 123456789
✅ Instagram Profile fetched
✅ Created new Instagram connection
✅ Instagram connected successfully
🔀 Redirecting to: http://localhost:3000/dashboard?instagram=connected&success=...
```

**Dashboard Should Show**:
- Success alert: "Instagram connected successfully"
- Instagram section: "✓ Connected"
- Username: @your_instagram_username
- Disconnect button

---

## 🐛 Troubleshooting

### Issue: Session ID Different Between Init and Callback

**Symptoms**:
```
OAuth Init - Session ID: s:abc123
Callback - Session ID: s:xyz789  ❌ Different!
```

**Cause**: Browser not sending session cookie

**Fix**: Check cookie settings in browser DevTools:
1. Open Network tab
2. Check `/instagram/login` request
3. Verify `Set-Cookie` header present
4. Check `/instagram/callback` request
5. Verify `Cookie` header sent

### Issue: Session Data Empty in Callback

**Symptoms**:
```
📝 Session data: { cookie: { ... } }  ❌ No pendingOAuthUserId
```

**Causes**:
1. Session not saved before redirect
2. Session expired (timeout)
3. Session store not persisting data

**Fixes**:
1. Verify `req.session.save()` is called (applied in Fix 2)
2. Check session timeout (currently 24 hours)
3. Check MongoDB connection for session store

### Issue: "Please login first" Still Appears

**Symptoms**: Still redirects to `/login?error=Please%20login%20first`

**Debug Steps**:

1. **Check Session Cookie**:
```javascript
// In browser console after clicking "Connect Instagram"
document.cookie
// Should show connect.sid cookie
```

2. **Check Backend Logs**:
```
Look for "Session saved successfully" message
If missing → session.save() failed
If present but callback has different session ID → cookie not transmitted
```

3. **Check Session Store**:
```javascript
// In backend, add temporary debug route
app.get('/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session
  });
});

// Call from browser:
fetch('http://localhost:5002/debug/session', {
  credentials: 'include'
}).then(r => r.json()).then(console.log);
```

### Issue: Cookies Not Working with Ngrok

**Symptoms**: Session works with direct localhost but fails with ngrok

**Additional Fix** (if needed):
```javascript
// In server.js session config
cookie: {
  secure: false,
  httpOnly: true,
  sameSite: 'none', // ⚠️ Change to 'none' if 'lax' doesn't work
  domain: undefined, // Don't set domain for OAuth
  path: '/',
}
```

⚠️ **Note**: `sameSite: 'none'` requires `secure: true`, which needs HTTPS. If this is needed, you'll need to use ngrok for both frontend and backend.

---

## 📊 Session Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        OAuth Session Flow                        │
└─────────────────────────────────────────────────────────────────┘

1. User on Dashboard (has JWT token in localStorage)
   ↓
2. Click "Connect Instagram"
   → Frontend redirects to: /api/auth/instagram/login?token={jwt}
   ↓
3. Backend /instagram/login Route
   ✅ Verify JWT token
   ✅ Extract userId from JWT
   ✅ Store in session: req.session.pendingOAuthUserId = userId
   ✅ Save session: req.session.save()
   ✅ Create sessionID and Set-Cookie header
   → Redirect to: Meta OAuth URL
   ↓
4. User on Facebook OAuth Page
   → Select Facebook Page
   → Select Instagram Business Account
   → Click "Continue"
   ↓
5. Meta Redirects Back
   → Callback URL: /api/auth/instagram/callback?code=AUTH_CODE
   → Browser sends Cookie header with sessionID
   ↓
6. Backend /instagram/callback Route
   ✅ Read sessionID from Cookie header
   ✅ Retrieve session: req.session
   ✅ Extract userId: req.session.pendingOAuthUserId
   ✅ Exchange code for access token
   ✅ Fetch Instagram profile
   ✅ Save to SocialAccount collection
   → Redirect to: /dashboard?instagram=connected
   ↓
7. Dashboard Loads
   ✅ Shows success alert
   ✅ Fetches updated user data
   ✅ Displays Instagram connection details
```

---

## ✅ Verification Checklist

After applying fixes and restarting backend:

- [ ] Backend starts without errors
- [ ] Login to dashboard successfully
- [ ] Click "Connect Instagram" button
- [ ] Backend logs show "Session saved successfully"
- [ ] Backend logs show Session ID
- [ ] Meta OAuth page loads
- [ ] Select Page + Instagram account
- [ ] Backend logs show same Session ID in callback
- [ ] Backend logs show `pendingOAuthUserId` retrieved
- [ ] Backend logs show "Instagram connected successfully"
- [ ] Redirects to `/dashboard?instagram=connected`
- [ ] Dashboard shows "✓ Connected"
- [ ] Instagram username displayed
- [ ] No "Please login first" error

---

## 🔍 Session Debug Commands

### Check Session in MongoDB

If using MongoDB session store (optional):
```javascript
db.sessions.find().pretty()
// Look for session with pendingOAuthUserId field
```

### Test Session Persistence

```javascript
// 1. Hit /instagram/login endpoint
fetch('http://localhost:5002/api/auth/instagram/login?token=YOUR_JWT', {
  credentials: 'include',
  redirect: 'manual'
})
.then(r => {
  console.log('Set-Cookie:', r.headers.get('set-cookie'));
  console.log('Session created');
});

// 2. Check session persists
fetch('http://localhost:5002/debug/session', {
  credentials: 'include'
})
.then(r => r.json())
.then(data => {
  console.log('Session persists:', !!data.session.pendingOAuthUserId);
});
```

---

## 🎯 Expected Results

### Before Fix

```
❌ OAuth callback → "Please login first"
❌ Session userId: undefined
❌ Redirect to: /login?error=...
```

### After Fix

```
✅ OAuth callback → Session userId found
✅ Instagram connected successfully
✅ Redirect to: /dashboard?instagram=connected
✅ Dashboard shows connection details
```

---

## 📞 Support

If session issues persist after applying fixes:

1. **Provide Backend Logs**: Full logs from OAuth init through callback
2. **Browser DevTools**: 
   - Network tab for `/instagram/login` and `/instagram/callback`
   - Application tab → Cookies → Check `connect.sid` cookie
3. **Session Configuration**: Screenshot of session config in server.js
4. **Environment**: `NODE_ENV` value, ngrok vs localhost setup

---

## 🔗 Related Files

- [backend-copy/server.js](../backend-copy/server.js) - Session configuration
- [backend-copy/routes/socialAuth.js](../backend-copy/routes/socialAuth.js) - OAuth routes
- [QUICK_START_INSTAGRAM_TEST.md](./QUICK_START_INSTAGRAM_TEST.md) - Quick testing guide
- [INSTAGRAM_OAUTH_COMPLETE_TEST_GUIDE.md](./INSTAGRAM_OAUTH_COMPLETE_TEST_GUIDE.md) - Full test guide

---

**Status**: ✅ Session Fix Applied - Ready for Testing

**Changes**: 
1. Session config updated (saveUninitialized, secure, sameSite)
2. Explicit session save before OAuth redirect
3. Enhanced session debugging in both routes
