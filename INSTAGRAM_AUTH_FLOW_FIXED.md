# Instagram Authentication Flow - Fixed

## 🎯 TL;DR - Quick Fix for "App Not Active" Error

**Problem:** Instagram OAuth fails with "App not active" and "URL blocked" errors.

**5-Minute Solution:**
1. Meta Dashboard → Switch to **Development Mode**
2. **Roles** → Add your Facebook account as **Tester**
3. Accept invitation in Facebook notifications
4. **App Settings** → Add `http://localhost:5002/api/auth/instagram/callback` to Valid OAuth Redirect URIs
5. **Client OAuth Settings** → Set Enforce HTTPS: **No**, Use Strict Mode: **No**

**Done!** Restart backend and test the flow.

---

## Issue Resolved
Previously, hitting `http://localhost:5002/api/auth/facebook?token=...` directly returned an authentication error because the backend wasn't properly receiving or validating the token.

## Meta OAuth Redirect URI Configuration

### ⚠️ Common Errors: "URL Blocked" & "App Not Active"

#### Error 1: "URL blocked – redirect URI not whitelisted"
This occurs when the redirect URI in your code doesn't match Meta's whitelist.

#### Error 2: "App not active"
This means your Meta app is either:
- In **Live Mode** without proper Business Verification
- Missing required permissions setup
- Not configured for the test user's account

### ✅ Complete Fix: Meta App Configuration

#### Step 1: Switch to Development Mode

1. Go to **Meta App Dashboard**: https://developers.facebook.com/apps/
2. Select your app (App ID: `2742496619415444` based on your .env)
3. At the top of dashboard, ensure the toggle shows: **"App Mode: Development"**
4. If it says "Live", click and switch to "Development Mode"

**⚠️ Important:** Development mode allows testing without Business Verification

#### Step 2: Configure Valid OAuth Redirect URIs

1. Navigate to **App Settings** → **Basic**
2. Scroll to **"Valid OAuth Redirect URIs"** section
3. Add BOTH development and production URIs:

```
http://localhost:5002/api/auth/instagram/callback
https://www.auraxai.in/auth/instagram/callback
```

**Note:** Even though Meta says "localhost redirects are automatically allowed," you MUST add them explicitly when these settings are enabled:
- Enforce HTTPS: Yes
- Use Strict Mode for redirect URIs: Yes

#### Step 3: Configure OAuth Settings

In **App Settings** → **Basic**, scroll to **Client OAuth Settings**:

**For Development (Recommended):**
```
✅ Client OAuth Login: Yes
✅ Web OAuth Login: Yes
❌ Enforce HTTPS: No (turn off for local dev)
❌ Use Strict Mode for redirect URIs: No (turn off for local dev)
```

**For Production:**
```
✅ Client OAuth Login: Yes
✅ Web OAuth Login: Yes
✅ Enforce HTTPS: Yes
✅ Use Strict Mode for redirect URIs: Yes
```

#### Step 4: Add Test Users (Critical for Development Mode)

**Why:** Apps in Development Mode can only be accessed by:
- App Admins
- App Developers  
- App Testers

**How to Add Test Users:**

1. Go to **Roles** → **Roles** in left sidebar
2. Click **"Add Testers"**
3. Enter Facebook/Instagram account email or ID
4. User will receive invite → must accept
5. OR create test users: **Roles** → **Test Users** → **Add**

**Test User Account You're Using MUST:**
- Be added as Tester, Developer, or Admin
- Have accepted the role invitation
- Have Instagram Business Account connected to Facebook Page

#### Step 5: Verify Instagram API Permissions

1. Go to **Use Cases** (left sidebar)
2. Ensure these are added:
   - **Instagram Basic Display** (for profile data)
   - **Instagram Public Content Access** (for business accounts)
   - **Pages** (to access Instagram Business accounts)

3. Click each use case and verify permissions:
   - `instagram_basic`
   - `pages_show_list`  
   - `instagram_manage_insights`
   - `pages_read_engagement`

#### Step 6: Check Products Configuration

1. Go to **Products** (left sidebar)
2. Ensure **"Facebook Login"** is added
3. Click **Facebook Login** → **Settings**
4. Verify **Valid OAuth Redirect URIs** match Step 2

### 🔧 Backend Configuration Fix

Your current `.env` has the correct redirect URI, but ensure it matches Meta dashboard:

```env
# Current (Correct for Development)
META_APP_ID=2742496619415444
META_APP_SECRET=c5bad23eb81e36b0173bd07a0608ad09
META_REDIRECT_URI=http://localhost:5002/api/auth/instagram/callback

# For Production, add:
META_REDIRECT_URI_PROD=https://www.auraxai.in/auth/instagram/callback
```

**⚠️ Important:** Your production URL is different from development:
- Dev: `http://localhost:5002/api/auth/instagram/callback`
- Prod: `https://www.auraxai.in/auth/instagram/callback` (note: no `/api/auth/` prefix)

You may need to update your production backend routes to match this URL structure.

### 🧪 Testing Checklist

Before testing Instagram OAuth:

- [ ] Meta app in **Development Mode**
- [ ] Test user added as **Tester/Developer/Admin**
- [ ] Test user **accepted invite**
- [ ] Both redirect URIs added to Meta dashboard
- [ ] **Enforce HTTPS: No** (for local testing)
- [ ] **Use Strict Mode: No** (for local testing)
- [ ] Backend running on port 5002
- [ ] Frontend running on port 3000
- [ ] Test user has Instagram Business Account

### 🔄 Development vs Production Setup

| Setting | Development | Production |
|---------|-------------|------------|
| App Mode | Development | Live (requires Business Verification) |
| Redirect URI | `http://localhost:5002/...` | `https://www.auraxai.in/...` |
| Enforce HTTPS | No | Yes |
| Strict Mode | No | Yes |
| Test Users | Required | Not required (public access) |
| Business Verification | Not required | Required for Live mode |

### 🐛 Troubleshooting "App Not Active" Error

If you still see "App not active" after following above steps:

**1. Verify App Status**
```
Dashboard → Settings → Basic → App Mode: Development ✅
```

**2. Check User Role**
```
Dashboard → Roles → Roles → [Your Facebook/Instagram account listed] ✅
```

**3. Accept Pending Invitations**
- Check Facebook notifications for pending role invitations
- Go to: https://developers.facebook.com/apps/
- Look for pending invitations banner

**4. Use Admin Account for Testing**
- The Facebook account that created the app automatically has Admin access
- Test with this account first to isolate user permission issues

**5. Clear Facebook OAuth Cache**
- Logout of Facebook completely
- Clear browser cookies for facebook.com and instagram.com
- Log back in and retry

**6. Check App Review Status**
- If accidentally submitted for review, app might be in "Pending" state
- Go to **App Review** → **Requests** → Check for pending reviews

### 📱 Instagram Business Account Setup

Instagram OAuth requires a **Business Account**, not a personal account:

1. **Convert to Business Account**:
   - Instagram app → Settings → Account → Switch to Professional Account
   - Choose "Business"

2. **Connect to Facebook Page**:
   - Instagram → Settings → Account → Linked Accounts → Facebook
   - Choose your Facebook Page (create one if needed)
   - Must be Page Admin

3. **Verify Connection**:
   - Facebook Page → Settings → Instagram → Should show connected account

---

## 🚀 Quick Start: Fix "App Not Active" in 5 Minutes

1. **Switch App to Development Mode**
   - Go to: https://developers.facebook.com/apps/2742496619415444
   - Toggle: App Mode → **Development**

2. **Add Your Account as Tester**
   - Roles → Roles → Add Testers
   - Enter your Facebook account email
   - Accept invitation in Facebook notifications

3. **Add Redirect URIs**
   - App Settings → Basic → Valid OAuth Redirect URIs
   - Add: `http://localhost:5002/api/auth/instagram/callback`

4. **Disable Strict Security (Dev Only)**
   - App Settings → Basic → Client OAuth Settings
   - Enforce HTTPS: **No**
   - Use Strict Mode: **No**

5. **Test the Flow**
   - Restart backend: `node server.js`
   - Visit: http://localhost:3000/dashboard
   - Click "Connect Instagram"

---

## Changes Made

### Backend Changes (backend-copy/routes/socialAuth.js)

1. **Added JWT import** to verify authentication tokens
2. **Updated `/api/auth/instagram/login` endpoint**:
   - Now accepts token from query string (`?token=...`) or Authorization header
   - Verifies JWT token and extracts user ID
   - Stores user ID in session for the callback
   - Redirects to Instagram/Facebook OAuth page

3. **Enhanced `/api/auth/instagram/callback` endpoint**:
   - Retrieves user ID from session (set during login)
   - Verifies user exists in database
   - Completes OAuth flow with Instagram
   - Saves Instagram account data to SocialAccount model
   - Updates user's `profilesConnected` flag
   - Redirects to dashboard with success message

### Frontend Changes

Updated all Instagram connection buttons to use the new flow:

1. **CreatorOnboarding.js**: Updated `handleConnectInstagram()` to redirect to `/api/auth/instagram/login?token=${token}`
2. **ConnectSocials.js**: Updated `handleConnectInstagram()` to redirect to `/api/auth/instagram/login?token=${token}`
3. **CreatorDashboard.js**: Updated `connectInstagram()` to use backend OAuth flow instead of direct Instagram OAuth

## Updated Authentication Flow

### Step 1: User Login
1. User logs in with email/password
2. Backend returns JWT token
3. Frontend stores token in localStorage/sessionStorage
4. User is redirected to Dashboard

### Step 2: Connect Instagram
1. User clicks "Connect Instagram" button
2. Frontend calls: `GET http://localhost:5002/api/auth/instagram/login?token={JWT_TOKEN}`
3. Backend verifies token and stores user ID in session
4. Backend redirects to Meta/Facebook authorization page

### Step 3: Meta Authorization
1. User authorizes the app on Meta/Facebook
2. Meta redirects back to: `GET http://localhost:5002/api/auth/instagram/callback?code={AUTH_CODE}`

### Step 4: Complete Connection
1. Backend retrieves user ID from session
2. Backend exchanges auth code for access token
3. Backend fetches Instagram profile data
4. Backend saves to SocialAccount model
5. Backend updates user's `profilesConnected = true`
6. Backend redirects to: `http://localhost:3000/dashboard?instagram=connected&success=Instagram connected successfully`

### Step 5: Dashboard Display
1. Frontend detects success parameters
2. Dashboard fetches and displays Instagram account details
3. User sees connected Instagram profile with analytics

## Error Handling

### Missing Token
- **Error**: "Invalid authentication token"
- **Action**: User redirected to login page

### Missing Session
- **Error**: "Please login first before connecting Instagram"
- **Action**: User redirected to login with error message

### OAuth Failure
- **Error**: Specific error from Meta/Instagram API
- **Action**: User redirected to dashboard with error message

### User Not Found
- **Error**: "User session expired"
- **Action**: User redirected to login page

## Testing the Flow

### Prerequisites
1. Backend running on `http://localhost:5002`
2. Frontend running on `http://localhost:3000`
3. Instagram/Facebook App configured with proper redirect URI
4. Environment variables set in backend `.env`:
   ```
   INSTAGRAM_CLIENT_ID=your_client_id
   INSTAGRAM_CLIENT_SECRET=your_client_secret
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   ```

### Manual Test Steps

1. **Register/Login**
   ```
   POST http://localhost:5002/api/register
   Body: { "username": "testuser", "email": "test@example.com", "password": "Test123!" }
   
   POST http://localhost:5002/api/login
   Body: { "email": "test@example.com", "password": "Test123!" }
   Response: { "token": "eyJhbGc..." }
   ```

2. **Connect Instagram**
   - Navigate to Dashboard
   - Click "Connect Instagram" button
   - Browser redirects to: `http://localhost:5002/api/auth/instagram/login?token=eyJhbGc...`
   - Backend logs: "✅ Token verified, user ID stored in session"
   - Browser redirects to Meta OAuth page

3. **Authorize on Meta**
   - Log in to Facebook/Instagram account
   - Authorize the app
   - Meta redirects to callback with code

4. **Verify Connection**
   - Backend processes callback
   - Backend logs: "✅ Instagram connected successfully"
   - Browser redirects to dashboard
   - Dashboard shows Instagram profile

### Backend Logs to Watch For

```
🔐 Initiating Instagram OAuth...
✅ Token verified, user ID stored in session: 507f1f77bcf86cd799439011
✅ Auth URL generated, redirecting...

🔔 Instagram callback hit!
📝 Session data: { userId: '507f1f77bcf86cd799439011' }
✅ User verified: test@example.com
✅ OAuth flow completed successfully
✅ Created new Instagram connection
✅ Instagram connected successfully, redirecting to dashboard
```

## API Endpoints

### GET /api/auth/instagram/login
- **Purpose**: Initiate Instagram OAuth
- **Query Params**: `token` (optional, JWT token)
- **Headers**: `Authorization: Bearer {token}` (alternative)
- **Response**: 302 Redirect to Instagram OAuth

### GET /api/auth/instagram/callback
- **Purpose**: Handle OAuth callback
- **Query Params**: `code` (from Instagram), `error` (if failed)
- **Response**: 302 Redirect to dashboard

### GET /api/auth/instagram/status
- **Purpose**: Check connection status
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 
  ```json
  {
    "success": true,
    "connected": true,
    "profile": {
      "username": "test_user",
      "displayName": "Test User",
      "followersCount": 1000
    }
  }
  ```

---

## 🔍 Error Resolution Flowchart

```
❌ "App not active" error
    ↓
    Is app in Development Mode?
    ├─ No → Switch to Development Mode in Meta Dashboard
    └─ Yes ↓
           Is your account added as Tester/Developer/Admin?
           ├─ No → Add account in Roles → Roles → Add Testers
           └─ Yes ↓
                  Did you accept the role invitation?
                  ├─ No → Check Facebook notifications → Accept invite
                  └─ Yes ↓
                         Do you have Instagram Business Account?
                         ├─ No → Convert to Business Account in Instagram app
                         └─ Yes → Should work! Clear cache and retry

❌ "URL blocked – redirect URI not whitelisted"
    ↓
    Are redirect URIs added to Meta dashboard?
    ├─ No → Add both http://localhost:5002/... and https://www.auraxai.in/...
    └─ Yes ↓
           Is "Enforce HTTPS" disabled for dev?
           ├─ No → Disable in App Settings → Basic → Client OAuth Settings
           └─ Yes ↓
                  Is "Use Strict Mode" disabled for dev?
                  ├─ No → Disable in App Settings → Basic → Client OAuth Settings
                  └─ Yes ↓
                         Does backend redirect_uri match Meta dashboard exactly?
                         ├─ No → Check .env file: META_REDIRECT_URI
                         └─ Yes → Should work! Check for typos/trailing slashes

❌ Backend returns "No authentication token provided"
    ↓
    Is token being passed in URL?
    ├─ No → Update frontend: window.location.href = `...?token=${token}`
    └─ Yes ↓
           Is express-session configured?
           ├─ No → Add express-session middleware in server.js
           └─ Yes → Check session secret in .env: COOKIE_SECRET

❌ "Invalid scope" error
    ↓
    Go to Meta Dashboard → Use Cases
    ↓
    Add required permissions:
    - instagram_basic
    - pages_show_list
    - instagram_manage_insights
    - pages_read_engagement
```

---

## 📋 Pre-Launch Production Checklist

Before switching to production/live mode:

### Meta App Configuration
- [ ] Valid OAuth Redirect URIs updated:
  - Remove: `http://localhost:5002/api/auth/instagram/callback`
  - Keep: `https://www.auraxai.in/auth/instagram/callback`
- [ ] Client OAuth Settings:
  - [ ] Enforce HTTPS: **Yes**
  - [ ] Use Strict Mode: **Yes**
- [ ] App Mode: **Live** (requires Business Verification)
- [ ] Privacy Policy URL added
- [ ] Terms of Service URL added
- [ ] App Icon uploaded (1024x1024)

### Backend Configuration
- [ ] Update `.env`:
  ```env
  NODE_ENV=production
  IS_PRODUCTION=true
  META_REDIRECT_URI=https://www.auraxai.in/auth/instagram/callback
  BACKEND_URL=https://api.auraxai.in  # or your production backend URL
  ```
- [ ] Ensure HTTPS enabled on production server
- [ ] Session secret changed from dev value
- [ ] CORS configured for production frontend URL

### Business Verification (Required for Live Mode)
- [ ] Company/Business information submitted
- [ ] Business documents uploaded (if required)
- [ ] Email verification completed
- [ ] Phone number verified
- [ ] App Review completed (if restricted permissions used)

### Testing
- [ ] Test OAuth flow on production URL
- [ ] Verify Instagram data syncing
- [ ] Test with non-admin users
- [ ] Check error handling for declined permissions
- [ ] Monitor logs for any issues

---

## Security Considerations

1. **Token Verification**: JWT tokens are verified before storing user ID in session
2. **Session Storage**: User ID stored in session with expiry
3. **CSRF Protection**: State parameter can be added for additional security
4. **Scope Limitation**: Only requests necessary Instagram permissions
5. **Token Encryption**: Access tokens stored encrypted in database

## Next Steps

1. ✅ Fix token validation
2. ✅ Update all frontend components
3. 🔄 Test complete flow end-to-end
4. ⏳ Add state parameter for CSRF protection
5. ⏳ Implement token refresh mechanism
6. ⏳ Add comprehensive error logging

## Related Files

- Backend: `backend-copy/routes/socialAuth.js`
- Frontend: 
  - `src/pages/CreatorOnboarding.js`
  - `src/pages/ConnectSocials.js`
  - `src/pages/CreatorDashboard.js`
- Models: 
  - `backend-copy/models/User.js`
  - `backend-copy/models/SocialAccount.js`
