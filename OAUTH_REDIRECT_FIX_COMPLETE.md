# Instagram OAuth Redirect Issue - COMPLETE FIX

## Problem
After Instagram OAuth, backend redirects to `/connect-socials` instead of `/dashboard`.

## Root Cause
There are **multiple OAuth callback routes** in the codebase:

1. ✅ `/api/auth/instagram/callback` (NEW - redirects to `/dashboard`) - Line 359 in socialAuth.js
2. ❌ `/api/auth/facebook/callback` (OLD - redirects to `/connect-socials`) - Line 42-208 in socialAuth.js  
3. ⚠️ `/auth/instagram/callback` (ALTERNATIVE - redirects to `/dashboard`) - Line 3552 in server.js

The issue is that your **Meta App is configured to use the OLD callback** URL.

## The Fix

### Step 1: Verify Meta App Configuration

Go to: https://developers.facebook.com/apps/2742496619415444/fb-login/settings/

**Check "Valid OAuth Redirect URIs"** - you might see:
```
❌ https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/facebook/callback (OLD)
✅ https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback (NEW)
```

**Action**: 
- **REMOVE** the old `/api/auth/facebook/callback` URL
- **KEEP ONLY** the new `/api/auth/instagram/callback` URL

### Step 2: Check Which Route is Being Hit

Add this logging to see which callback is being called.

When you test Instagram OAuth, check backend logs:

**If you see these logs** (from OLD route):
```
✅ Facebook OAuth successful, processing Instagram connection...
🔄 Exchanging for long-lived token...
📄 Fetching Facebook pages...
```
→ **You're hitting the OLD Facebook callback that redirects to `/connect-socials`**

**If you see these logs** (from NEW route):
```
🔔 Instagram callback hit!
📍 Frontend URL: http://localhost:3000
✅ Received authorization code, completing OAuth flow...
```
→ **You're hitting the NEW Instagram callback that redirects to `/dashboard`** ✅

### Step 3: Restart Backend Server

**CRITICAL**: The new code won't work until you restart!

```powershell
# Stop all node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Start backend
cd C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
node server.js
```

### Step 4: Test OAuth Flow

1. Go to dashboard: `http://localhost:3000`
2. Click "Connect Instagram"
3. **Watch backend terminal carefully** - which logs appear?
4. Complete OAuth on Facebook
5. Check where you land: `/dashboard` ✅ or `/connect-socials` ❌

## Verification Checklist

Before testing, verify:

### Backend
- [ ] `.env` has: `META_REDIRECT_URI=https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback`
- [ ] Backend server restarted
- [ ] Ngrok tunnel active: `https://semianimated-implosively-sunday.ngrok-free.dev/api/me` works

### Meta App
- [ ] **ONLY** `/api/auth/instagram/callback` in whitelist (NOT `/api/auth/facebook/callback`)
- [ ] Client OAuth Login: ON
- [ ] Web OAuth Login: ON

### Test
- [ ] Backend logs show "🔔 Instagram callback hit!" (NOT "Facebook OAuth successful")
- [ ] Redirects to `/dashboard` (NOT `/connect-socials`)
- [ ] Dashboard shows Instagram connected

## Quick Test Script

Run this to see which OAuth configuration is active:

```javascript
// In browser console on dashboard, before clicking Connect:
fetch('http://localhost:5002/api/auth/instagram/login?token=' + localStorage.getItem('token'), {
  method: 'GET',
  redirect: 'manual'
})
.then(r => r.text())
.then(html => {
  const match = html.match(/redirect_uri=([^&]+)/);
  if (match) {
    const redirectUri = decodeURIComponent(match[1]);
    console.log('🔍 OAuth Redirect URI:', redirectUri);
    
    if (redirectUri.includes('/api/auth/instagram/callback')) {
      console.log('✅ Using NEW Instagram callback (redirects to /dashboard)');
    } else if (redirectUri.includes('/api/auth/facebook/callback')) {
      console.log('❌ Using OLD Facebook callback (redirects to /connect-socials)');
    }
  }
});
```

## The Solution

The backend code is CORRECT and redirects to `/dashboard`. The issue is **Meta App configuration**.

**Your Meta App is configured with the OLD callback URL** that redirects to `/connect-socials`.

### Fix Meta App Now:

1. Go to Meta Developer Console
2. Facebook Login → Settings
3. Find "Valid OAuth Redirect URIs"
4. **Remove**: `https://.../api/auth/facebook/callback`
5. **Keep**: `https://.../api/auth/instagram/callback`
6. Save Changes
7. Test again

## Alternative: Check Actual OAuth URL

When you click "Connect Instagram", the backend generates an OAuth URL. You can see it in backend logs:

```
📍 OAuth Configuration:
   Redirect URI: https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback
   Full Auth URL: https://www.facebook.com/v18.0/dialog/oauth?client_id=...&redirect_uri=...
```

Copy that `redirect_uri` parameter from the URL. It should be `/api/auth/instagram/callback`, not `/api/auth/facebook/callback`.

If it's showing `/api/auth/facebook/callback`, then there's a different OAuth service being used.

## Expected Flow (Correct)

1. User clicks "Connect Instagram"
2. Frontend: `http://localhost:5002/api/auth/instagram/login?token=...`
3. Backend generates OAuth URL with redirect_uri = `https://...ngrok-free.dev/api/auth/instagram/callback`
4. Facebook OAuth screen
5. User approves
6. Facebook redirects to: `https://...ngrok-free.dev/api/auth/instagram/callback?code=...`
7. Backend logs: "🔔 Instagram callback hit!"
8. Backend saves data
9. Backend redirects to: `http://localhost:3000/dashboard?instagram=connected`
10. Dashboard shows Instagram connected ✅

## Current Flow (Broken)

If you're seeing `/connect-socials`, this is happening:

1-4. Same as above
5. Facebook redirects to: `https://...ngrok-free.dev/api/auth/facebook/callback?code=...` (OLD URL!)
6. Backend logs: "✅ Facebook OAuth successful..."
7. Backend saves data
8. Backend redirects to: `http://localhost:3000/connect-socials` ❌
9. Connect socials page shows "Connect Instagram" again

## Files to Check

1. **Meta Developer Console** - Most likely issue!
   - Check redirect URI configuration
   
2. **backend-copy/.env**
   - Should have: `META_REDIRECT_URI=https://...ngrok-free.dev/api/auth/instagram/callback`

3. **Backend logs**
   - Should show: "🔔 Instagram callback hit!" (not "Facebook OAuth successful")

4. **Ngrok**
   - Should be running and accessible
   - Test: `https://semianimated-implosively-sunday.ngrok-free.dev/api/me`

