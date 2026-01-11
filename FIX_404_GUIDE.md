# 🔧 Fixing 404 Error on Creator Profile Setup

## Problem
When accessing `localhost:3000/creator/profile-setup`, you get:
```
Connection failed: HTTP error! status: 404
```

## Root Cause
The frontend is calling `http://localhost:5002/api/onboarding/creator-profile` but getting a 404 response.

## Solution Steps

### Step 1: Make Sure Backend is Running

**Kill any existing backend process:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Start the backend:**
```powershell
cd backend-copy
node server.js
```

**Look for these confirmations in console:**
```
✅ Creator onboarding routes mounted at /api/onboarding
✅ Backend server running on http://localhost:5002
✅ MongoDB connected successfully
```

### Step 2: Test the Endpoint

Open a new terminal and run:
```powershell
node test-creator-endpoint.js
```

**Expected output (401 or 400 is OK):**
```
✅ Route exists! (401 means auth required - expected)
```

**Bad output (indicates problem):**
```
❌ 404 Error - Route not found!
```

### Step 3: Check Frontend

Make sure frontend is running:
```powershell
npm start
```

Should open on `http://localhost:3000`

### Step 4: Clear Browser Cache

Sometimes cached API responses cause issues:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Click "Empty Cache and Hard Reload"

### Step 5: Check Token

Open browser console and check:
```javascript
console.log(localStorage.getItem('token'));
```

Should show a JWT token. If `null`, you need to login again.

---

## Quick Fix Script

Run this all-in-one script:

```powershell
# Stop backend if running
Get-Process -Id (Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start backend
Push-Location backend-copy
Start-Process powershell -ArgumentList "-NoExit", "-Command", "node server.js"
Pop-Location

# Wait for backend to start
Start-Sleep -Seconds 5

# Test endpoint
node test-creator-endpoint.js
```

---

## Common Issues

### Issue 1: Backend Not Running
**Symptom:** `ECONNREFUSED` or network error
**Fix:** Start backend with `node server.js`

### Issue 2: Wrong Port
**Symptom:** Backend runs on different port
**Fix:** Check `.env` file in `backend-copy/` - should have `PORT=5002`

### Issue 3: MongoDB Not Connected
**Symptom:** Backend starts but routes don't work
**Fix:** 
- Check MongoDB is running
- Verify `MONGO_URI` in `.env`
- Look for "MongoDB connected successfully" in console

### Issue 4: Route Not Mounted
**Symptom:** 404 even though backend is running
**Fix:** 
- Check server.js line ~718: `app.use("/api/onboarding", creatorOnboardingRoutes);`
- Restart backend

### Issue 5: Auth Token Missing
**Symptom:** 401 Unauthorized
**Fix:**
- Login again
- Check token in localStorage
- Verify token is sent in Authorization header

---

## Debugging Checklist

- [ ] Backend running on port 5002
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] "Creator onboarding routes mounted" message appears
- [ ] Token exists in localStorage
- [ ] Browser cache cleared
- [ ] No CORS errors in console
- [ ] Network tab shows request to correct URL

---

## Still Having Issues?

### Enable Debug Logging

Add this to `backend-copy/routes/creatorOnboarding.js` at the top of the POST handler:

```javascript
router.post('/creator-profile', authMiddleware, async (req, res) => {
  console.log('🔍 Creator profile endpoint hit!');
  console.log('📊 Request body:', req.body);
  console.log('👤 User from auth:', req.user);
  
  // ... rest of code
});
```

Then watch the backend console when you submit the form.

### Check Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Submit the profile form
4. Look for the request to `/api/onboarding/creator-profile`
5. Check:
   - Status code (should be 200, 400, or 401 - NOT 404)
   - Request headers (Authorization header present?)
   - Request payload (form data correct?)
   - Response (what error message?)

---

## Admin Access Setup

Once creator profile setup is working, to add admin role:

```powershell
cd backend-copy
node setup-admin.js add sourabh.chandanshive@gmail.com
```

Then login and go to: `http://localhost:3000/admin/campaigns`

---

## Success Criteria

✅ Backend shows: "Creator onboarding routes mounted at /api/onboarding"
✅ Frontend submits form without 404
✅ You see "Under Review" page after submission
✅ Admin dashboard accessible at `/admin/campaigns` (after adding admin role)
