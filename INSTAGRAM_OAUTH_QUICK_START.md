# Instagram OAuth Integration - Quick Start Guide

## ✅ What's Been Fixed

### 1. **Root Cause Identified**
The frontend was calling the OLD Facebook OAuth route (`/api/auth/facebook?token=...`) which required authentication, instead of the NEW public Instagram OAuth flow.

### 2. **Components Updated**
- **ConnectSocials.js** - Now uses `/api/auth/instagram/login` endpoint
- **InstagramDashboard.jsx** - New component to display profile after OAuth
- **App.js** - Added route for `/dashboard`

### 3. **Backend Configuration**
- **backend-copy/.env** - Updated `FRONTEND_URL` to port 3001

---

## 🚀 Testing the Complete OAuth Flow

### Step 1: Start Backend Server
```bash
cd backend-copy
node server.js
```

**Expected Output:**
```
✅ MongoDB connected successfully!
🚀 Server running on http://localhost:5002
📝 Environment: development
```

### Step 2: Start Frontend
```bash
cd frontend-copy
npm start
```

**Should open:** `http://localhost:3001`

### Step 3: Test OAuth Flow
1. Navigate to: `http://localhost:3001/connect-socials`
2. Click **"Connect Instagram Account"** button
3. You'll be redirected to Meta OAuth page
4. **Approve** the permissions
5. Meta redirects back to: `http://localhost:3001/dashboard?auth=success`
6. The dashboard loads your profile automatically

---

## 🔍 What Happens Behind the Scenes

### Frontend Flow:
```
ConnectSocials.js
    ↓
GET /api/auth/instagram/login
    ↓
Receives: { authUrl: "https://www.facebook.com/v18.0/dialog/oauth?..." }
    ↓
window.location.href = authUrl
    ↓
User approves on Meta
    ↓
Meta redirects to: /api/auth/instagram/callback?code=XXX
    ↓
Backend exchanges code → token → profile
    ↓
Sets auth_token cookie
    ↓
Redirects to: http://localhost:3001/dashboard?auth=success
    ↓
InstagramDashboard.jsx calls GET /api/user/profile
    ↓
Displays user + Instagram profile data
```

### Backend Flow:
```
GET /api/auth/instagram/login (PUBLIC)
    ↓
Returns Meta OAuth URL with redirect_uri
    ↓
User approves
    ↓
GET /api/auth/instagram/callback?code=XXX (PUBLIC)
    ↓
oauth.service.js:
  1. Exchange code → short-lived token
  2. Exchange short → long-lived token (60 days)
  3. Fetch user's Facebook pages
  4. Find Instagram Business Account
  5. Fetch Instagram profile details
  6. Save to MongoDB (User + InstagramProfile)
  7. Generate JWT token
  8. Set HTTP-only cookie
  9. Redirect to frontend/dashboard?auth=success
    ↓
GET /api/user/profile (REQUIRES AUTH)
    ↓
Returns: { user: {...}, instagramProfile: {...} }
```

---

## 📋 Backend Routes

### Public Routes (No Auth Required):
- `GET /api/auth/instagram/login` - Get Meta OAuth URL
- `GET /api/auth/instagram/callback` - Handle Meta redirect
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/session` - Check auth status

### Protected Routes (Auth Cookie Required):
- `GET /api/user/profile` - Get user + Instagram profile
- `GET /api/user/instagram/stats` - Get Instagram stats

---

## 🧪 Testing Commands

### Test 1: Check Backend Health
```bash
curl http://localhost:5002/health
```

### Test 2: Get OAuth URL
```bash
curl http://localhost:5002/api/auth/instagram/login
```

**Expected Response:**
```json
{
  "success": true,
  "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?client_id=2742496619415444&redirect_uri=http://localhost:5002/api/auth/instagram/callback&scope=instagram_basic,pages_show_list,instagram_content_publish,pages_read_engagement,business_management"
}
```

### Test 3: Check Session (After OAuth)
```bash
curl -b cookies.txt http://localhost:5002/api/auth/session
```

### Test 4: Get Profile (After OAuth)
```bash
curl -b cookies.txt http://localhost:5002/api/user/profile
```

---

## ⚠️ Important Configuration

### Meta App Settings Required:
Go to: https://developers.facebook.com/apps/2742496619415444/fb-login/settings/

**Valid OAuth Redirect URIs:**
```
http://localhost:5002/api/auth/instagram/callback
```

**Deauthorize Callback URL:**
```
http://localhost:5002/api/auth/instagram/deauthorize
```

### Environment Variables (.env files):

**Backend (.env):**
```env
META_APP_ID=2742496619415444
META_APP_SECRET=c5bad23eb81e36b0173bd07a0608ad09
META_REDIRECT_URI=http://localhost:5002/api/auth/instagram/callback
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:5002
JWT_SECRET=your-secret-key
```

**Frontend (.env):**
```env
REACT_APP_API_BASE_URL=http://localhost:5002
REACT_APP_REDIRECT_URI=http://localhost:3001/dashboard
```

---

## 🐛 Troubleshooting

### Error: "No authentication token provided"
**Cause:** Frontend is calling OLD `/api/auth/facebook?token=...` route
**Solution:** Ensure using NEW `/api/auth/instagram/login` endpoint
**File:** `src/pages/ConnectSocials.js` line 116-130

### Error: "Cannot GET /api/auth/instagram/callback"
**Cause:** Routes not loaded in server.js
**Solution:** Verify line 645 in server.js: `app.use("/api/auth", socialAuthRoutes);`

### Error: Meta redirects to wrong port
**Cause:** FRONTEND_URL mismatch
**Solution:** Update backend/.env `FRONTEND_URL=http://localhost:3001`

### Error: Instagram profile not found
**Cause:** No Instagram Business Account linked to Facebook Page
**Solution:** 
1. Create Facebook Page
2. Convert Instagram to Business Account
3. Link Instagram to Facebook Page

### Cookie not being set
**Cause:** CORS or cookie settings
**Solution:** Check:
```javascript
// Frontend axios config
axios.get(url, { withCredentials: true })

// Backend CORS config
cors({
  origin: 'http://localhost:3001',
  credentials: true
})
```

---

## 📊 Database Schema

### User Collection:
```javascript
{
  _id: ObjectId,
  facebookId: "12345678",
  email: "user@example.com",
  name: "John Doe",
  picture: "https://...",
  instagramProfile: ObjectId, // Reference
  createdAt: Date,
  updatedAt: Date
}
```

### InstagramProfile Collection:
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  instagramBusinessAccountId: "17841400000000",
  username: "example_account",
  name: "Example Account",
  profilePictureUrl: "https://...",
  biography: "Bio text",
  website: "https://...",
  followersCount: 1500,
  followsCount: 300,
  mediaCount: 50,
  facebookPageId: "123456789",
  facebookPageName: "My Page",
  accessToken: "encrypted_long_lived_token",
  expiresAt: Date, // 60 days from now
  createdAt: Date,
  updatedAt: Date
}
```

---

## ✅ Checklist Before Testing

- [ ] Backend server running on port 5002
- [ ] Frontend server running on port 3001
- [ ] MongoDB connected (local or Atlas)
- [ ] Meta App credentials in backend/.env
- [ ] FRONTEND_URL set to http://localhost:3001
- [ ] Meta App redirect URI configured
- [ ] Facebook Page created
- [ ] Instagram Business Account linked to Page
- [ ] ConnectSocials.js uses new OAuth endpoint

---

## 🎯 Expected Success Flow

1. ✅ Click "Connect Instagram Account"
2. ✅ Redirected to Meta OAuth page
3. ✅ Approve permissions
4. ✅ Redirected to /dashboard?auth=success
5. ✅ See loading spinner
6. ✅ Profile loads with Instagram data
7. ✅ Stats displayed (followers, following, posts)
8. ✅ Token expiry date shown

---

## 📝 Next Steps After Success

1. **Token Refresh** - Implement automatic token refresh before expiry
2. **Multi-Account** - Support multiple Instagram accounts per user
3. **Media Fetching** - Add endpoint to fetch Instagram posts
4. **Post Scheduling** - Create posts via API
5. **Error Handling** - Add retry logic for failed requests
6. **Rate Limiting** - Implement Instagram API rate limits
7. **Webhook Setup** - Handle Instagram webhook events

---

## 🔗 Useful Links

- **Meta App Dashboard:** https://developers.facebook.com/apps/2742496619415444
- **Instagram Graph API Docs:** https://developers.facebook.com/docs/instagram-api
- **OAuth Documentation:** https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow

---

## 🆘 Still Having Issues?

Check the backend logs for:
```
🔔 Instagram callback hit!
```

This confirms the OAuth flow reached the callback endpoint.

If you don't see this, check:
1. Meta App redirect URI configuration
2. Network tab in browser DevTools
3. Backend server is running
4. No firewall blocking port 5002

---

**Created:** 2024
**Last Updated:** After fixing frontend OAuth trigger
**Status:** ✅ Ready for Testing
