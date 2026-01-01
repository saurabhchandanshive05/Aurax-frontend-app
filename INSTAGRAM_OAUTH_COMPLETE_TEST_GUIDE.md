# 🎯 Instagram OAuth Complete Test Guide

## 🔍 CRITICAL ISSUE IDENTIFIED

**Problem**: Dashboard fetches from `/api/me` but Instagram data is in `/api/creator/dashboard`

**Root Cause**: 
- `fetchDashboardData()` calls `/me` endpoint (line 43 of CreatorDashboardNew.js)
- `/me` returns basic user fields WITHOUT Instagram connection data
- `/api/creator/dashboard` endpoint HAS Instagram connection data from SocialAccount collection
- Dashboard `renderInstagram()` section looks for `creatorData?.instagram?.connected` which is NEVER populated!

---

## 🔧 FIX REQUIRED

### Option 1: Update `/api/me` Endpoint (RECOMMENDED)

Add Instagram connection lookup to `/api/me` endpoint in `server.js`:

```javascript
// In /api/me endpoint (around line 2230)
app.get("/api/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ ADD THIS: Check Instagram connection status
    const instagramAccount = await SocialAccount.findOne({
      userId: user._id,
      platform: 'instagram',
      isActive: true
    });

    console.log('📊 /api/me called for user:', {
      userId: user._id,
      username: user.username,
      hasInstagram: !!instagramAccount
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profilesConnected: user.profilesConnected || false,
        hasCompletedOnboarding: user.hasCompletedOnboarding || false,
        // Minimal profile fields
        minimalProfileCompleted: user.minimalProfileCompleted || false,
        isProfileCompleted: user.isProfileCompleted || false,
        fullName: user.fullName,
        creatorType: user.creatorType,
        instagramUsername: user.instagramUsername,
        location: user.location,
        // Profile fields
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        bio: user.bio,
        website: user.website,
        phone: user.phone,
        // Creator monetization fields
        creatorSlug: user.creatorSlug,
        displayName: user.displayName,
        welcomeMessage: user.welcomeMessage,
        coverImage: user.coverImage,
        subscriptionPlans: user.subscriptionPlans || [],
        services: user.services || [],
        isPublicPageActive: user.isPublicPageActive || false,
        totalSubscribers: user.totalSubscribers || 0,
        totalEarnings: user.totalEarnings || 0,
        totalFollowers: user.totalFollowers || 0,
        // ✅ ADD THIS: Instagram connection data
        instagram: instagramAccount ? {
          connected: true,
          username: instagramAccount.username,
          accountId: instagramAccount.instagramBusinessAccountId,
          followersCount: instagramAccount.followersCount,
          profilePicture: instagramAccount.profilePicture
        } : {
          connected: false
        },
        // Timestamps
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user data" });
  }
});
```

**Required Imports**: Make sure `SocialAccount` model is imported at top of server.js:
```javascript
const SocialAccount = require('./models/SocialAccount');
```

### Option 2: Update Dashboard to Call `/api/creator/dashboard`

Change `fetchDashboardData()` in CreatorDashboardNew.js:

```javascript
const fetchDashboardData = async () => {
  try {
    setLoading(true);
    // ✅ CHANGE: Call /creator/dashboard instead of /me
    const response = await apiClient.request('/creator/dashboard');
    
    if (response && response.creator) {
      setCreatorData(response.creator); // Already includes instagram object
      setStats(response.stats);
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  } finally {
    setLoading(false);
  }
};
```

---

## 📋 COMPLETE TEST CHECKLIST

### Pre-Test Setup

**1. Update Meta Developer Console** ⚠️ CRITICAL
- Go to: https://developers.facebook.com/apps/2742496619415444/fb-login/settings/
- **Valid OAuth Redirect URIs** section:
  - ❌ **REMOVE**: `https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/facebook/callback`
  - ✅ **KEEP**: `https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback`
- **Client OAuth Settings**:
  - ✅ Client OAuth Login: **ON**
  - ✅ Web OAuth Login: **ON**
- **SAVE CHANGES**

**2. Apply Fix**
- Choose Option 1 (update `/api/me`) OR Option 2 (update dashboard)
- Save file

**3. Start Backend Server**
```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
node server.js
```

**Expected Output:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5002
```

**4. Verify Ngrok Tunnel**
- Check ngrok is running: `https://semianimated-implosively-sunday.ngrok-free.dev`
- Test endpoint: Open `https://semianimated-implosively-sunday.ngrok-free.dev/api/me` in browser
- Should get: `{"success":false,"message":"No token provided"}`

**5. Start Frontend**
```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy
npm start
```

---

### Test Flow

**Test Credentials:**
- Email: `saurabhchandan05@gmail.com`
- Password: `Saurabh@123`

---

#### ✅ STEP 1: Login & Access Dashboard

1. Navigate to: `http://localhost:3000`
2. Enter credentials and login
3. **Expected**: Redirect to `/creator/dashboard`
4. **Backend Logs**:
   ```
   📊 /api/me called for user: {
     userId: ...,
     username: 'saurabhchandan05',
     hasInstagram: false
   }
   ```

**✅ Success Criteria:**
- Dashboard loads without errors
- Instagram section shows "Not Connected"
- Connect Instagram button is visible

**❌ If Failed:**
- Check browser console for errors
- Verify localStorage has 'token'
- Check backend logs for `/api/me` call

---

#### ✅ STEP 2: Initiate Instagram OAuth

1. Click **"Connect Instagram Account"** button
2. **Expected**: Redirect to Meta OAuth page
3. **Backend Logs**:
   ```
   📍 Instagram OAuth initiated
   📍 Storing userId in session: ...
   📍 OAuth Configuration:
      App ID: 2742496619415444
      Redirect URI: https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback
      Full Auth URL: https://www.facebook.com/v18.0/dialog/oauth?...
   🔀 Redirecting to Meta OAuth page
   ```
4. **Meta OAuth Page Should Show:**
   - Facebook login (if not already logged in)
   - Permission request screen
   - "Select Facebook Page" dropdown
   - "Select Instagram Business Account" dropdown

**✅ Success Criteria:**
- Meta OAuth page loads
- Shows correct permissions (manage_pages, instagram_basic, etc.)
- Displays Page + Instagram account selection

**❌ If Failed:**
- **Error "URL blocked"**: Meta App still using old callback URL
  - Double-check Meta Console settings
  - Clear browser cache
  - Try incognito window
- **Error "Invalid OAuth 2.0 Client ID"**: Meta App ID mismatch
  - Verify `META_APP_ID` in `.env` matches Meta Console
- **Session error**: Backend session not stored
  - Check backend logs for session creation

---

#### ✅ STEP 3: Complete Meta OAuth

1. Select Facebook Page from dropdown
2. Select Instagram Business Account
3. Click "Continue" / "Allow"
4. **Backend Should Log:**
   ```
   ════════════════════════════════════════════════════════════════════
   🔔 ✅ NEW INSTAGRAM CALLBACK HIT! (Redirects to /dashboard)
   ════════════════════════════════════════════════════════════════════
   📍 OAuth code received: ...
   📍 Retrieved userId from session: ...
   ```
5. **Backend OAuth Exchange:**
   ```
   ✅ OAuth access token obtained
   ✅ Instagram Business Account ID: ...
   ✅ Instagram Profile fetched
   ✅ OAuth flow completed successfully
   ```
6. **Database Operations:**
   ```
   ✅ Created new Instagram connection
   (or)
   ✅ Updated existing Instagram connection
   
   ✅ Instagram connected successfully, redirecting to: 
      http://localhost:3000/dashboard?instagram=connected&success=Instagram connected successfully
   ```

**✅ Success Criteria:**
- Backend logs show "NEW INSTAGRAM CALLBACK HIT!"
- NO logs showing "Facebook OAuth successful" (old route)
- SocialAccount document created in MongoDB
- `user.profilesConnected` set to true

**❌ If Failed:**
- **Still shows "Facebook OAuth successful"**: 
  - Meta App using WRONG callback URL
  - Update Meta Console to remove old URL
- **OAuth exchange error**:
  - Check Meta App Secret in `.env`
  - Verify Meta App permissions configured
- **Session userId not found**:
  - Session expired (restart OAuth flow)
  - Backend restart cleared sessions

---

#### ✅ STEP 4: Dashboard Redirect & Display

1. **Expected**: Redirect to `http://localhost:3000/dashboard?instagram=connected&success=...`
2. Browser should show success alert: "Instagram connected successfully"
3. Dashboard should reload and display Instagram connection

**Dashboard Instagram Section Should Show:**
```
📱 Connect Instagram
✓ Connected
@your_instagram_username
Instagram Business Account ID: 123456789
[Disconnect Instagram] button
```

**Backend Logs (after redirect):**
```
📊 /api/me called for user: {
  userId: ...,
  username: 'saurabhchandan05',
  hasInstagram: true  ← Should be true now!
}
```

**Browser Console (DevTools):**
```javascript
// Check creatorData state
{
  instagram: {
    connected: true,
    username: "your_instagram_username",
    accountId: "123456789",
    followersCount: 1234,
    profilePicture: "https://..."
  }
}
```

**✅ Success Criteria:**
- Success alert displays
- Instagram section shows "✓ Connected"
- Instagram username displayed
- Account ID shown
- Disconnect button visible
- `creatorData.instagram.connected === true` in state

**❌ If Failed:**
- **Still shows "Not Connected"**:
  - Dashboard didn't fetch Instagram data (FIX NOT APPLIED)
  - Apply Option 1 or Option 2 fix above
  - Restart backend
- **"undefined" values**:
  - SocialAccount not saved correctly
  - Check MongoDB for SocialAccount document
- **Redirect to `/connect-socials`**:
  - Meta App STILL using old callback URL
  - Clear browser cache and try again

---

#### ✅ STEP 5: Verify Data Persistence

1. Refresh page: `http://localhost:3000/dashboard`
2. **Expected**: Instagram still shows as connected
3. Check MongoDB:

```javascript
// In MongoDB Compass or shell
db.socialaccounts.findOne({ 
  userId: ObjectId("..."), 
  platform: "instagram" 
})

// Should return:
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  platform: "instagram",
  platformUserId: "...",
  username: "your_instagram_username",
  displayName: "Your Name",
  followersCount: 1234,
  instagramBusinessAccountId: "123456789",
  facebookPageId: "...",
  accessToken: "...",
  isActive: true,
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

**✅ Success Criteria:**
- Instagram connection persists after refresh
- SocialAccount document exists in MongoDB
- `user.profilesConnected === true` in users collection

---

#### ✅ STEP 6: Test Disconnect Flow

1. Click **"Disconnect Instagram"** button
2. **Expected**: 
   - Confirmation alert
   - Instagram section shows "Not Connected"
3. **Backend Logs:**
   ```
   📍 Disconnect Instagram request
   ✅ Instagram disconnected successfully
   ```

**✅ Success Criteria:**
- Instagram section switches to "Not Connected"
- SocialAccount `isActive` set to false (soft delete)
- "Connect Instagram Account" button reappears

---

## 🐛 DEBUGGING COMMANDS

### Check Instagram Connection in Database

```javascript
// Open MongoDB shell or run in backend:
const SocialAccount = require('./models/SocialAccount');
const User = require('./models/User');

// Find user by email
const user = await User.findOne({ email: 'saurabhchandan05@gmail.com' });
console.log('User ID:', user._id);
console.log('Profiles Connected:', user.profilesConnected);

// Find Instagram connection
const instagram = await SocialAccount.findOne({
  userId: user._id,
  platform: 'instagram',
  isActive: true
});
console.log('Instagram Account:', instagram);
```

### Test `/api/me` Endpoint Directly

```javascript
// In browser console on localhost:3000
fetch('http://localhost:5002/api/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('User data:', data);
  console.log('Instagram connected:', data.user?.instagram?.connected);
  console.log('Instagram username:', data.user?.instagram?.username);
});
```

### Test Dashboard Endpoint

```javascript
// In browser console
fetch('http://localhost:5002/api/creator/dashboard', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('Dashboard data:', data);
  console.log('Instagram:', data.creator?.instagram);
});
```

### Verify Ngrok Connectivity

```powershell
# Test ngrok endpoint
curl https://semianimated-implosively-sunday.ngrok-free.dev/api/me
```

---

## 📝 EXPECTED FINAL STATE

### Backend Logs Timeline

```
1. Login: 📊 /api/me called for user: { hasInstagram: false }
2. OAuth Init: 📍 Instagram OAuth initiated, redirecting to Meta
3. OAuth Callback: 🔔 ✅ NEW INSTAGRAM CALLBACK HIT!
4. OAuth Success: ✅ Instagram connected successfully
5. Dashboard Refresh: 📊 /api/me called for user: { hasInstagram: true }
```

### Frontend State

```javascript
creatorData = {
  username: "saurabhchandan05",
  email: "saurabhchandan05@gmail.com",
  minimalProfileCompleted: true,
  profilesConnected: true,
  instagram: {
    connected: true,
    username: "your_instagram_username",
    accountId: "123456789",
    followersCount: 1234,
    profilePicture: "https://..."
  }
}
```

### Database State

**Users Collection:**
```javascript
{
  _id: ObjectId("..."),
  email: "saurabhchandan05@gmail.com",
  username: "saurabhchandan05",
  profilesConnected: true,  // ✅ Set to true after OAuth
  minimalProfileCompleted: true,
  instagramUsername: "your_handle"
}
```

**SocialAccounts Collection:**
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  platform: "instagram",
  platformUserId: "17841...",
  username: "your_instagram_username",
  displayName: "Your Name",
  followersCount: 1234,
  instagramBusinessAccountId: "123456789",
  facebookPageId: "456789",
  accessToken: "EAAZ...",
  isActive: true
}
```

---

## ✅ SUCCESS INDICATORS

### Visual Indicators
- ✅ Dashboard loads without errors
- ✅ Instagram section shows "✓ Connected"
- ✅ Instagram username displayed (not undefined)
- ✅ Account ID shown
- ✅ Disconnect button visible

### Backend Logs
- ✅ "NEW INSTAGRAM CALLBACK HIT!" appears
- ✅ NO "Facebook OAuth successful" (old route)
- ✅ "Instagram connected successfully"
- ✅ Session userId retrieved correctly

### Database
- ✅ SocialAccount document created with platform: "instagram"
- ✅ user.profilesConnected === true
- ✅ accessToken stored (long token)

---

## ❌ FAILURE INDICATORS & FIXES

| Symptom | Cause | Fix |
|---------|-------|-----|
| Still redirects to `/connect-socials` | Meta App using old callback URL | Update Meta Console, remove old URL |
| "Not Connected" after OAuth | Dashboard not fetching Instagram data | Apply Option 1 or 2 fix above |
| "Invalid OAuth 2.0 Client ID" | App ID mismatch | Check `META_APP_ID` in `.env` |
| "URL blocked" error | Ngrok URL not whitelisted | Update Meta Console redirect URIs |
| Session error in callback | Session expired/lost | Restart OAuth flow from dashboard |
| Undefined Instagram values | SocialAccount not saved | Check backend logs for save errors |
| Backend shows "Facebook OAuth successful" | Wrong callback route hit | CRITICAL: Update Meta Console NOW |

---

## 🎯 CRITICAL NEXT STEPS

1. **APPLY FIX** (Option 1 or 2 above)
2. **UPDATE META CONSOLE** (Remove old callback URL)
3. **RESTART BACKEND** (`node server.js`)
4. **TEST COMPLETE FLOW** (Login → OAuth → Dashboard)
5. **VERIFY DISPLAY** (Instagram section shows connection)

---

## 📞 Support Checklist

If test fails, provide:
- [ ] Backend terminal logs (full OAuth flow)
- [ ] Browser console logs (React DevTools)
- [ ] Network tab (API requests to `/me` and `/creator/dashboard`)
- [ ] Meta Console screenshot (Valid OAuth Redirect URIs)
- [ ] MongoDB query result (SocialAccount document)
- [ ] Step where it failed (1-6 above)
