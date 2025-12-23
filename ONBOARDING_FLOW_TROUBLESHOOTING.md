# 🔧 Onboarding Flow - Troubleshooting & Verification

## Issue: Login Goes Directly to Dashboard (Skipping Onboarding)

### ✅ Fixed Components

1. **CreatorLogin.js** - Now checks `/api/me` after login and redirects based on `hasCompletedOnboarding`
2. **Signup.js** - Always redirects creators to `/creator/welcome` after registration
3. **CreatorDashboard.js** - Added onboarding check on mount, redirects to `/creator/welcome` if incomplete
4. **App.js** - Route `/creator/welcome` is configured

---

## 🔍 How to Verify It's Working

### Test 1: New Signup Flow
```
1. Go to http://localhost:3000/signup
2. Register as a creator
3. ✅ Should redirect to /creator/welcome (not /creator/dashboard)
4. Complete onboarding steps
5. Click "Go to Dashboard"
6. ✅ Should now see dashboard
```

### Test 2: Login Flow (Incomplete Onboarding)
```
1. Use account that hasn't completed onboarding
2. Go to http://localhost:3000/creator/login
3. Log in
4. ✅ Should redirect to /creator/welcome
5. Complete onboarding
6. ✅ Can now access dashboard
```

### Test 3: Login Flow (Completed Onboarding)
```
1. Use account that HAS completed onboarding
2. Go to http://localhost:3000/creator/login
3. Log in
4. ✅ Should go directly to /creator/dashboard
```

### Test 4: Direct Dashboard Access (Protection)
```
1. Login with incomplete onboarding account
2. Manually navigate to /creator/dashboard
3. ✅ Should redirect back to /creator/welcome
```

---

## 🐛 Debugging Steps

### Step 1: Check Browser Console

Open DevTools (F12) and check for:

```javascript
// You should see this log in CreatorLogin.js:
console.log('User Data:', userData);
console.log('Has Completed Onboarding:', hasCompletedOnboarding);

// In CreatorDashboard.js:
console.log('Checking onboarding status...');
console.log('Onboarding complete, showing dashboard');
```

### Step 2: Check Network Tab

In DevTools → Network:

1. **After Login:**
   - Look for `POST /api/auth/login` → Should return `{ success: true, token: "..." }`
   - Look for `GET /api/me` → Should return user data with onboarding flags

2. **Check /api/me Response:**
```json
{
  "username": "testcreator",
  "email": "test@example.com",
  "role": "creator",
  "hasCompletedOnboarding": false,    ← Key field!
  "isProfileCompleted": false,
  "profilesConnected": false,
  "hasAudienceInfo": false
}
```

### Step 3: Check localStorage

In DevTools → Application → Local Storage:

```javascript
// Should have token stored
localStorage.getItem('token')  // Should return JWT string

// You can manually check user data
const token = localStorage.getItem('token');
fetch('http://localhost:5002/api/me', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Still Going to Dashboard After Login

**Cause:** Backend `/api/me` endpoint not returning onboarding flags

**Solution:**
```javascript
// Backend: Ensure /api/me returns these fields
{
  "hasCompletedOnboarding": false,
  "isProfileCompleted": false,
  "profilesConnected": false,
  "hasAudienceInfo": false
}
```

**Fix in Backend (server.js or routes/auth.js):**
```javascript
app.get('/api/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  
  // Add these fields if not in database
  const userData = user.toObject();
  userData.hasCompletedOnboarding = user.hasCompletedOnboarding || false;
  userData.isProfileCompleted = user.isProfileCompleted || false;
  userData.profilesConnected = user.profilesConnected || false;
  userData.hasAudienceInfo = user.hasAudienceInfo || false;
  
  res.json(userData);
});
```

### Issue 2: /api/me Returns 401 Unauthorized

**Cause:** Token not being sent or authMiddleware blocking request

**Solution:**
1. Check token is stored: `console.log(localStorage.getItem('token'))`
2. Check Authorization header: Look in Network tab
3. Verify authMiddleware doesn't block `/api/me`

### Issue 3: Infinite Redirect Loop

**Cause:** OnboardingPage redirecting back to dashboard which redirects to onboarding

**Solution:**
- CreatorDashboard should ONLY redirect if `hasCompletedOnboarding === false`
- CreatorOnboarding should ONLY redirect if user completes all steps
- Don't add redirect logic in both directions

### Issue 4: Loading Forever in Dashboard

**Cause:** `/api/me` request failing or not resolving

**Solution:**
```javascript
// Check if API is reachable
fetch('http://localhost:5002/api/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

If it fails:
- Verify backend is running on port 5002
- Check CORS is enabled for localhost:3000
- Verify authMiddleware is working

---

## 📝 Manual Backend Testing

### Test /api/me Endpoint:

```bash
# 1. Get a token (login first)
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrPhone":"test@test.com","password":"password123"}'

# 2. Copy the token from response

# 3. Test /api/me
curl http://localhost:5002/api/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Expected response:
{
  "_id": "...",
  "username": "test",
  "email": "test@test.com",
  "role": "creator",
  "hasCompletedOnboarding": false,  ← Must be present
  "isProfileCompleted": false,
  "profilesConnected": false,
  "hasAudienceInfo": false
}
```

### If Missing Fields:

Update your User model and `/api/me` endpoint using instructions in:
- `BACKEND_USER_SCHEMA_UPDATE.md`
- `BACKEND_INTEGRATION_STEPS.md`

---

## 🎯 Quick Fix Checklist

**Frontend:**
- [x] CreatorLogin.js - Fetches /api/me and checks flags ✅
- [x] Signup.js - Redirects to /creator/welcome ✅
- [x] CreatorDashboard.js - Checks onboarding on mount ✅
- [x] App.js - Route exists for /creator/welcome ✅
- [x] CreatorOnboarding.js - Component exists ✅

**Backend (You Need to Verify):**
- [ ] User model has `hasCompletedOnboarding` field
- [ ] User model has `isProfileCompleted` field
- [ ] User model has `profilesConnected` field
- [ ] User model has `hasAudienceInfo` field
- [ ] `/api/me` endpoint returns these fields
- [ ] `/api/creator/profile` endpoint updates flags
- [ ] `/api/creator/audience` endpoint updates flags

---

## 🔬 Debug Mode

Add this to CreatorLogin.js to see what's happening:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const resp = await apiClient.login(sanitized);
    
    if (resp?.success && resp?.token) {
      login(resp.token);
      
      // 🔍 DEBUG: Check what /api/me returns
      const userResponse = await fetch('http://localhost:5002/api/me', {
        headers: {
          'Authorization': `Bearer ${resp.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const userData = await userResponse.json();
      
      // 🔍 DEBUG: Log everything
      console.log('=== ONBOARDING DEBUG ===');
      console.log('User Data:', userData);
      console.log('Has Completed Onboarding:', userData.hasCompletedOnboarding);
      console.log('Is Profile Completed:', userData.isProfileCompleted);
      console.log('Profiles Connected:', userData.profilesConnected);
      console.log('Has Audience Info:', userData.hasAudienceInfo);
      console.log('User Role:', userData.role);
      
      const hasCompletedOnboarding = userData.hasCompletedOnboarding || 
                                    (userData.isProfileCompleted && 
                                     userData.profilesConnected && 
                                     userData.hasAudienceInfo);
      
      console.log('Calculated Onboarding Complete:', hasCompletedOnboarding);
      
      if (!hasCompletedOnboarding && userData.role === 'creator') {
        console.log('→ Redirecting to /creator/welcome');
        navigate('/creator/welcome');
      } else {
        console.log('→ Redirecting to dashboard');
        navigate(userData.role === 'creator' ? '/creator/dashboard' : '/brand/dashboard');
      }
      console.log('=== END DEBUG ===');
    }
  } catch (err) {
    console.error("Login error:", err);
  }
};
```

---

## ✅ Success Indicators

You know it's working when:

1. **Console logs show:**
   ```
   === ONBOARDING DEBUG ===
   User Data: { username: "...", hasCompletedOnboarding: false, ... }
   Has Completed Onboarding: false
   Calculated Onboarding Complete: false
   → Redirecting to /creator/welcome
   === END DEBUG ===
   ```

2. **URL changes to:**
   - After login: `http://localhost:3000/creator/welcome`
   - After completing onboarding: `http://localhost:3000/creator/dashboard`

3. **Network tab shows:**
   - `GET /api/me` → 200 OK
   - Response includes `hasCompletedOnboarding: false`

4. **User experience:**
   - New signups see onboarding page
   - Incomplete users see onboarding page
   - Completed users see dashboard directly
   - Dashboard redirects to onboarding if incomplete

---

## 🚀 Next Steps

1. **Test with console logs enabled**
2. **Verify /api/me response in Network tab**
3. **If fields are missing, update backend** (see BACKEND_INTEGRATION_STEPS.md)
4. **Test all 4 scenarios above**
5. **Remove debug logs after confirming it works**

---

**If still not working after these steps, check:**
- Is backend running? (`node server.js` in backend-copy)
- Is frontend running? (`npm start` in frontend-copy)
- Are there any console errors?
- Is the token being stored? (`localStorage.getItem('token')`)
- Does `/api/me` work in Postman/curl?

**Need more help?** Share:
1. Console logs from login
2. Network tab screenshot of `/api/me` response
3. Any error messages
