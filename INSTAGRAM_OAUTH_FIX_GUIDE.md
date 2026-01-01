# Instagram OAuth Fix - Quick Test Guide

## The Problem
After Instagram OAuth callback, backend redirects to `/connect-socials` instead of `/dashboard`.

## The Fix Applied
✅ Updated `backend-copy/routes/socialAuth.js` line 469 to redirect to `/dashboard`
✅ Added comprehensive logging to show exact redirect URL
✅ All error paths also redirect to `/dashboard`

## CRITICAL: Backend Must Be Restarted!

The code changes won't work until you restart the backend server.

### Step 1: Stop All Node Processes
```powershell
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
```

### Step 2: Start Backend (NEW TERMINAL)
```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
node server.js
```

Wait for:
```
✅ MongoDB connected successfully
🚀 Server running on port 5002
```

### Step 3: Start Frontend (DIFFERENT TERMINAL)
```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy
npm start
```

## Testing Instagram OAuth

### 1. Login to Dashboard
- Go to `http://localhost:3000`
- Login as creator
- Navigate to Dashboard

### 2. Click "Connect Instagram"
Watch the backend terminal - you should see:
```
🔐 Initiating Instagram OAuth...
✅ Token verified, user ID stored in session
✅ Auth URL generated, redirecting...
```

### 3. Complete Meta OAuth
- Approve on Facebook
- Wait for redirect

### 4. Check Backend Logs (CRITICAL!)
The backend terminal should show:
```
🔔 Instagram callback hit!
📍 Frontend URL: http://localhost:3000
✅ Received authorization code, completing OAuth flow...
✅ User verified: [email]
✅ OAuth flow completed successfully
✅ Updated existing Instagram connection
✅ Instagram connected successfully, redirecting to: http://localhost:3000/dashboard?instagram=connected&success=Instagram connected successfully
```

**The key line**: `redirecting to: http://localhost:3000/dashboard`

If you see `/connect-socials` in that log, then there's a different issue.
If you DON'T see this log at all, the old server code is still running.

### 5. Check Browser
Should land on: `http://localhost:3000/dashboard?instagram=connected&success=...`

Should see Instagram connection details on dashboard.

## If Still Going to /connect-socials

### Check 1: Is Backend Using New Code?
In backend terminal after clicking "Connect Instagram", you should see:
```
✅ Instagram connected successfully, redirecting to: http://localhost:3000/dashboard...
```

If this says `/connect-socials`, the backend code didn't update.
If you don't see this line at all, check if Meta redirect URI is wrong.

### Check 2: Check Meta App Configuration
1. Go to https://developers.facebook.com/apps
2. Open your app (ID: 2742496619415444)
3. Go to "Facebook Login" → "Settings"
4. Check "Valid OAuth Redirect URIs"
5. Should include: `http://localhost:5002/api/auth/instagram/callback`

### Check 3: Browser Cache
Clear browser cache and cookies, try again.

### Check 4: Check Session
The OAuth flow requires a valid session. Make sure:
- User is logged in
- Token is in localStorage: `localStorage.getItem('token')`
- Session is valid on backend

## Expected Final Behavior

✅ Click "Connect Instagram" on dashboard
✅ Redirect to Meta OAuth
✅ Approve on Facebook
✅ Redirect back to `http://localhost:3000/dashboard?instagram=connected`
✅ Dashboard shows Instagram account details
✅ Instagram connection persists (no re-prompting)

## Debugging Commands

### Check if Backend is Running
```powershell
Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue
```

### Check Current User's Instagram Status
Open browser console on dashboard:
```javascript
fetch('http://localhost:5002/api/debug/user-status', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
})
.then(r => r.json())
.then(d => console.log('Instagram Connected:', d));
```

### Test OAuth Endpoint Directly
```javascript
// Check if OAuth endpoint is accessible
fetch('http://localhost:5002/api/auth/instagram/login?token=' + localStorage.getItem('token'))
  .then(r => console.log('OAuth endpoint status:', r.status))
```

## Common Issues

### Issue: "Backend still redirects to /connect-socials"
**Solution**: Make sure backend is restarted. Check terminal logs.

### Issue: "No logs in backend terminal"
**Solution**: Meta redirect URI might be wrong. Check Facebook app settings.

### Issue: "Error: No user ID in session"
**Solution**: User must be logged in first. Check if token is passed in URL.

### Issue: "Dashboard shows 'Connect Instagram' after connecting"
**Solution**: 
1. Check if `user.profilesConnected` was set to `true` in database
2. Run debug endpoint to verify
3. Check dashboard data fetching logic

## Files Modified

1. `backend-copy/routes/socialAuth.js` (lines 360-470)
   - Added logging for all redirect paths
   - Ensured all redirects go to `/dashboard`

2. `backend-copy/routes/creatorDashboard.js` (lines 180-240)
   - Enhanced logging for profile saves

3. `backend-copy/server.js` (line 2230)
   - Added logging to `/api/me` endpoint
   - Added `/api/debug/user-status` endpoint

## Next Steps After Testing

If OAuth works correctly:
1. Test Instagram disconnect
2. Test logout → login → dashboard (should show connected state)
3. Test accessing welcome page (should redirect to dashboard if profile complete)

