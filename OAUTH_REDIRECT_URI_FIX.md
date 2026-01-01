# Instagram OAuth Redirect URI Fix

## Problem
Facebook OAuth error: **"URL blocked - redirect URI not whitelisted"**

## Root Cause
The backend's default config had **port 5000** but the backend runs on **port 5002** and Meta app is configured for **port 5002**.

## Fixes Applied

### 1. Updated Default Port in Config
**File**: `backend-copy/src/config/environment.js`
- Changed default port from 5000 → 5002
- Changed default redirect URI from port 5000 → 5002

### 2. Added OAuth Logging
**File**: `backend-copy/src/services/oauth.service.js`
- Now logs the exact redirect URI being sent to Facebook
- Shows App ID and full OAuth URL

## Meta Developer Console Setup

You need to configure your Meta App correctly. Follow these steps:

### Step 1: Go to Meta Developer Console
1. Visit: https://developers.facebook.com/apps
2. Select your app (App ID: **2742496619415444**)

### Step 2: Configure Facebook Login Settings
1. In left sidebar, click **"Facebook Login"** → **"Settings"**
2. Find **"Valid OAuth Redirect URIs"** section
3. Add these URLs (one per line):
   ```
   http://localhost:5002/api/auth/instagram/callback
   http://localhost:3000/dashboard
   ```

### Step 3: Enable Client OAuth Login
Make sure these are **ON**:
- ✅ **Client OAuth Login**: ON
- ✅ **Web OAuth Login**: ON
- ✅ **Use Strict Mode for Redirect URIs**: OFF (during development)

### Step 4: Configure App Domains
1. In left sidebar, click **"Settings"** → **"Basic"**
2. Find **"App Domains"**
3. Add: `localhost`

### Step 5: Add Platform
1. Still in **"Settings"** → **"Basic"**
2. Scroll to bottom, click **"+ Add Platform"**
3. Select **"Website"**
4. Site URL: `http://localhost:3000`

### Step 6: Save Changes
Click **"Save Changes"** at the bottom

## Testing After Fix

### 1. Restart Backend
```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
node server.js
```

### 2. Watch for OAuth Logs
When you click "Connect Instagram", the backend will show:
```
📍 OAuth Configuration:
   App ID: 2742496619415444
   Redirect URI: http://localhost:5002/api/auth/instagram/callback
   Full Auth URL: https://www.facebook.com/v18.0/dialog/oauth?...
```

**Verify the Redirect URI shows port 5002, not 5000!**

### 3. Test Instagram OAuth
1. Go to dashboard
2. Click "Connect Instagram"
3. Should redirect to Facebook (no error)
4. Approve permissions
5. Should redirect back to your dashboard

## Common Issues

### Issue: Still getting "URL blocked" error
**Check 1**: Verify redirect URI in backend logs shows port **5002**
**Check 2**: Verify Meta app has `http://localhost:5002/api/auth/instagram/callback` in whitelist
**Check 3**: Clear browser cache and cookies
**Check 4**: Make sure "Client OAuth Login" is **ON** in Meta app

### Issue: "App Not Set Up" error
**Solution**: Go to Meta app settings, add Platform → Website → `http://localhost:3000`

### Issue: "Invalid Scope" error
**Solution**: Make sure your Meta app has Instagram permissions enabled:
- Go to "App Review" → "Permissions and Features"
- Request: `instagram_basic`, `instagram_content_publish`, `pages_show_list`

### Issue: Backend shows port 5000 in logs
**Solution**: 
1. Check `.env` file has: `META_REDIRECT_URI=http://localhost:5002/api/auth/instagram/callback`
2. Restart backend server
3. Check logs again

## Verification Checklist

Before testing, verify:

### Backend
- [ ] `.env` file has `META_REDIRECT_URI=http://localhost:5002/api/auth/instagram/callback`
- [ ] `environment.js` default is port 5002
- [ ] Backend running on port 5002
- [ ] Backend logs show correct redirect URI

### Meta App
- [ ] Valid OAuth Redirect URIs includes `http://localhost:5002/api/auth/instagram/callback`
- [ ] Client OAuth Login is ON
- [ ] Web OAuth Login is ON
- [ ] App Domains includes `localhost`
- [ ] Platform added: Website with `http://localhost:3000`

### Frontend
- [ ] Frontend running on port 3000
- [ ] User is logged in
- [ ] Token exists in localStorage

## Expected Flow

1. User clicks "Connect Instagram"
2. Frontend redirects to: `http://localhost:5002/api/auth/instagram/login?token=...`
3. Backend logs show OAuth config with port 5002
4. Backend redirects to Facebook OAuth
5. Facebook checks: Is `http://localhost:5002/api/auth/instagram/callback` whitelisted? ✅ YES
6. Facebook shows permission screen
7. User approves
8. Facebook redirects to: `http://localhost:5002/api/auth/instagram/callback?code=...`
9. Backend processes OAuth, saves data
10. Backend redirects to: `http://localhost:3000/dashboard?instagram=connected`
11. Dashboard shows Instagram connection ✅

## Files Modified

1. `backend-copy/src/config/environment.js`
   - Line 2: Port default 5000 → 5002
   - Line 12: Redirect URI default port 5000 → 5002

2. `backend-copy/src/services/oauth.service.js`
   - Added logging to show exact OAuth configuration

## Meta App Configuration Screenshot Checklist

Make sure your Meta app settings look like this:

### Facebook Login → Settings
```
Valid OAuth Redirect URIs:
┌─────────────────────────────────────────────────┐
│ http://localhost:5002/api/auth/instagram/callback │
│ http://localhost:3000/dashboard                   │
└─────────────────────────────────────────────────┘

Client OAuth Login: [ON]
Web OAuth Login: [ON]
Force Web OAuth Reauthentication: [OFF]
Use Strict Mode for Redirect URIs: [OFF] (for development)
```

### Settings → Basic
```
App Domains:
┌───────────┐
│ localhost │
└───────────┘

Website:
┌──────────────────────────┐
│ http://localhost:3000    │
└──────────────────────────┘
```

## Production Notes

When deploying to production:
1. Update `META_REDIRECT_URI` in production .env
2. Add production redirect URI to Meta app (e.g., `https://auraxai.in/api/auth/instagram/callback`)
3. Add production domain to App Domains (e.g., `auraxai.in`)
4. Update Website platform URL to production URL
5. Enable "Use Strict Mode for Redirect URIs"
6. Switch Meta app to "Live" mode

