# Ngrok Instagram OAuth Configuration Guide

## Current Setup

### Backend (.env)
```env
META_REDIRECT_URI=https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback
FRONTEND_URL=http://localhost:3000
```

### Frontend
```javascript
// Dashboard initiates OAuth to localhost (this is fine)
window.location.href = `http://localhost:5002/api/auth/instagram/login?token=${token}`
```

## How It Works

1. **User clicks "Connect Instagram"** → Frontend redirects to `http://localhost:5002/api/auth/instagram/login`
2. **Backend generates OAuth URL** → Points to Facebook with redirect_uri = ngrok URL
3. **User approves on Facebook** → Facebook redirects to `https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback?code=...`
4. **Ngrok tunnels to localhost:5002** → Backend receives callback
5. **Backend redirects to frontend** → `http://localhost:3000/dashboard?instagram=connected`

## Verification Steps

### Step 1: Verify Ngrok Tunnel is Active

Open in browser:
```
https://semianimated-implosively-sunday.ngrok-free.dev/api/me
```

**Expected outcomes:**
- ✅ **If not logged in**: See `{"success":false,"message":"No token provided"}` or similar auth error
- ✅ **If logged in**: See JSON with user data
- ❌ **If tunnel down**: Browser shows "ngrok error" or connection timeout

**What this proves**: Ngrok is active and routing to your backend on port 5002

### Step 2: Verify OAuth Configuration

Restart backend and check logs when clicking "Connect Instagram":

```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
node server.js
```

Look for:
```
📍 OAuth Configuration:
   App ID: 2742496619415444
   Redirect URI: https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback
   Full Auth URL: https://www.facebook.com/v18.0/dialog/oauth?...
```

**Verify**: Redirect URI shows **ngrok URL**, not localhost!

### Step 3: Update Meta Developer Settings

Go to: https://developers.facebook.com/apps/2742496619415444/fb-login/settings/

**Add to "Valid OAuth Redirect URIs":**
```
https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback
```

**Important Notes:**
- ⚠️ Remove or comment out `http://localhost:5002/api/auth/instagram/callback` if testing with ngrok
- ⚠️ Keep `http://localhost:3000/dashboard` (for frontend redirect after OAuth)
- ⚠️ Ngrok URLs change when you restart ngrok - update Meta settings when URL changes!

**Make sure these are ON:**
- ✅ Client OAuth Login: ON
- ✅ Web OAuth Login: ON

### Step 4: Test Instagram OAuth Flow

1. **Login to dashboard**: `http://localhost:3000`
2. **Click "Connect Instagram"**
3. **Watch backend logs** - should show ngrok redirect URI
4. **Approve on Facebook**
5. **Should redirect to**: `http://localhost:3000/dashboard?instagram=connected`

## Expected Backend Logs

```
🔐 Initiating Instagram OAuth...
Query params: { token: 'eyJ...' }
✅ Token verified, user ID stored in session: 507f1f77bcf86cd799439011
📍 OAuth Configuration:
   App ID: 2742496619415444
   Redirect URI: https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback
   Full Auth URL: https://www.facebook.com/v18.0/dialog/oauth?...
✅ Auth URL generated, redirecting...

[User approves on Facebook]

🔔 Instagram callback hit!
📍 Frontend URL: http://localhost:3000
✅ Received authorization code, completing OAuth flow...
✅ User verified: user@example.com
✅ OAuth flow completed successfully
✅ Updated existing Instagram connection
✅ Instagram connected successfully, redirecting to: http://localhost:3000/dashboard?instagram=connected&success=Instagram connected successfully
```

## Troubleshooting

### Issue: Ngrok tunnel not working

**Test**: Open `https://semianimated-implosively-sunday.ngrok-free.dev/api/me`

**If connection refused**:
1. Check ngrok is running: `ngrok http 5002`
2. Check backend is running on port 5002
3. Verify ngrok URL in .env matches actual ngrok URL

### Issue: "URL blocked" error from Facebook

**Solution**:
1. Copy the EXACT ngrok URL from backend logs
2. Add it to Meta Developer Console → Facebook Login → Valid OAuth Redirect URIs
3. Save changes
4. Clear browser cache
5. Try again

### Issue: Backend logs show localhost redirect URI

**Solution**:
1. Verify `.env` has ngrok URL: `META_REDIRECT_URI=https://...ngrok-free.dev/api/auth/instagram/callback`
2. Restart backend server
3. Check logs again - should show ngrok URL

### Issue: "Tunnel not found" from ngrok

**Solution**:
1. Ngrok URLs change when you restart ngrok
2. Get new URL: Look at ngrok terminal output
3. Update `.env` with new URL
4. Update Meta Developer Console with new URL
5. Restart backend

### Issue: OAuth completes but redirects to wrong page

**Solution**:
Check `FRONTEND_URL` in `.env` is `http://localhost:3000`

## Ngrok Best Practices

### 1. Keep Ngrok Running
Don't close the ngrok terminal window while testing OAuth

### 2. Use Free Static Domain (Optional)
- Sign up for ngrok account
- Get a free static domain
- URL won't change when you restart ngrok
- Update once in Meta settings

### 3. Monitor Ngrok Dashboard
Visit: http://localhost:4040
- See all HTTP requests
- Useful for debugging OAuth flow
- Shows request/response data

## Quick Test Commands

### Test Backend Health (via ngrok)
```bash
curl https://semianimated-implosively-sunday.ngrok-free.dev/api/me
```

### Test OAuth URL Generation
```bash
# In browser console on dashboard
const token = localStorage.getItem('token');
console.log('OAuth URL:', `http://localhost:5002/api/auth/instagram/login?token=${token}`);
```

### Check Current Meta Redirect URI
```bash
# In backend terminal, watch for this log when clicking Connect:
# "Redirect URI: https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback"
```

## Production Considerations

When deploying to production:

1. **Replace ngrok with production domain**:
   ```env
   META_REDIRECT_URI=https://api.auraxai.in/api/auth/instagram/callback
   FRONTEND_URL=https://www.auraxai.in
   ```

2. **Update Meta Developer Console** with production URLs

3. **Use HTTPS** everywhere in production

4. **Remove localhost URLs** from Meta whitelist

## Meta Developer Console Configuration

### Required Settings for Ngrok

**Facebook Login → Settings:**
```
Valid OAuth Redirect URIs:
┌──────────────────────────────────────────────────────────────────────┐
│ https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback │
│ http://localhost:3000/dashboard                                       │
└──────────────────────────────────────────────────────────────────────┘

Client OAuth Login: [ON]
Web OAuth Login: [ON]
```

**Settings → Basic:**
```
App Domains:
┌────────────────────────────────────┐
│ semianimated-implosively-sunday.ngrok-free.dev │
│ localhost                          │
└────────────────────────────────────┘
```

## Files Modified

1. `backend-copy/.env`
   - Updated `META_REDIRECT_URI` to ngrok URL

## Next Steps

1. ✅ Update `.env` with ngrok URL
2. ✅ Restart backend server
3. ✅ Add ngrok URL to Meta Developer Console
4. ✅ Test ngrok connectivity: `https://semianimated-implosively-sunday.ngrok-free.dev/api/me`
5. ✅ Test OAuth flow end-to-end
6. ✅ Verify dashboard shows Instagram connection

