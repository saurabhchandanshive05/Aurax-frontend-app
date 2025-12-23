# 🔍 Debug: Login Flow Not Working

## Problem
After login, user is going to the main Dashboard (Home page) instead of the onboarding flow.

## Possible Causes

### 1. Backend `/api/me` Not Returning Onboarding Flags
**Check:** Open browser DevTools → Network tab → Look for `/api/me` request after login

**Expected Response:**
```json
{
  "id": "...",
  "email": "...",
  "role": "creator",
  "hasCompletedOnboarding": false,  ← MUST BE HERE
  "isProfileCompleted": false,
  "profilesConnected": false,
  "hasAudienceInfo": false
}
```

**If Missing:** Backend needs to be updated (see BACKEND_INTEGRATION_STEPS.md)

---

### 2. Navigation Being Cancelled
**Check:** Open browser Console → Look for navigation logs

**Add Debug Code to CreatorLogin.js:**

Add this after line 70 (in handleSubmit, after fetching /api/me):

```javascript
console.log("=== LOGIN DEBUG ===");
console.log("User data:", userData);
console.log("hasCompletedOnboarding:", hasCompletedOnboarding);
console.log("Should redirect to:", !hasCompletedOnboarding && userData.role === 'creator' ? '/creator/welcome' : '/creator/dashboard');
console.log("==================");
```

---

### 3. React Router Navigation Issue
**Check:** Does `/creator/welcome` route exist in App.js?

**Verify in App.js:**
```javascript
<Route 
  path="/creator/welcome" 
  element={
    <ProtectedRoute role="creator">
      <CreatorOnboarding />
    </ProtectedRoute>
  } 
/>
```

---

### 4. Token Not Being Stored
**Check:** Open DevTools → Application tab → Local Storage

**Should see:**
```
token: "eyJhbGciOiJ..."
```

**If missing:** Token storage failed in AuthContext

---

## Quick Test Steps

### Step 1: Check Backend
```bash
# In terminal, test backend directly:
curl http://localhost:5002/api/test

# Should return: {"message": "Backend is working!"}
```

### Step 2: Check Backend User Model
```bash
# Check if User model has onboarding fields
# Open: backend-copy/models/User.js
# Search for: hasCompletedOnboarding
```

### Step 3: Test Login with Console Open
```bash
1. Open http://localhost:3000/creator/login
2. Open DevTools (F12)
3. Go to Console tab
4. Login with test account
5. Watch for:
   - "=== LOGIN DEBUG ===" logs
   - Network requests to /api/me
   - Any error messages
```

### Step 4: Check Network Tab
```bash
1. In DevTools, go to Network tab
2. Login
3. Look for requests:
   ✅ POST /api/auth/login → Status 200
   ✅ GET /api/me → Status 200
4. Click on /api/me
5. Check Response tab
6. Verify hasCompletedOnboarding field exists
```

---

## Most Likely Issue

**Backend hasn't been updated yet!**

The frontend code is correct, but the backend needs:

1. **User model updated** with onboarding fields
2. **Routes mounted** (creatorProfile.js)
3. **/api/me updated** to return onboarding flags

### Quick Fix (Backend)

#### File: `backend-copy/models/User.js`

Add these fields to the schema:

```javascript
const userSchema = new mongoose.Schema({
  // ... existing fields ...
  
  // Add these NEW fields:
  fullName: String,
  bio: String,
  location: String,
  phone: String,
  isProfileCompleted: { type: Boolean, default: false },
  hasAudienceInfo: { type: Boolean, default: false },
  hasCompletedOnboarding: { type: Boolean, default: false },
  profilesConnected: { type: Boolean, default: false },
  
  audienceInfo: {
    categories: [String],
    contentTypes: [String],
    regions: [String]
  },
  
  instagram: {
    username: String,
    profilePicture: String,
    followersCount: Number,
    mediaCount: Number
  }
});
```

#### File: `backend-copy/server.js`

Find where routes are mounted and add:

```javascript
const creatorProfileRoutes = require('./routes/creatorProfile');
app.use('/api/creator', creatorProfileRoutes);
```

#### File: `backend-copy/routes/auth.js` (or wherever `/api/me` is)

Update the `/api/me` endpoint:

```javascript
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    // Return user with onboarding flags
    res.json({
      ...user.toObject(),
      hasCompletedOnboarding: user.hasCompletedOnboarding || false,
      isProfileCompleted: user.isProfileCompleted || false,
      profilesConnected: user.profilesConnected || false,
      hasAudienceInfo: user.hasAudienceInfo || false
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
```

---

## Alternative: Frontend-Only Testing

If you want to test the frontend WITHOUT updating backend:

### Temporarily Mock the Response

Edit `CreatorLogin.js` around line 60, replace the fetch with:

```javascript
// TEMPORARY MOCK - REMOVE AFTER BACKEND UPDATE
const userData = {
  id: '123',
  email: email,
  role: 'creator',
  hasCompletedOnboarding: false,  // ← Change to false to test onboarding
  isProfileCompleted: false,
  profilesConnected: false,
  hasAudienceInfo: false
};

// Skip the actual fetch for testing
// const userResponse = await fetch(...)
```

Then login - it should redirect to `/creator/welcome`!

---

## Verification Checklist

After backend updates:

- [ ] Backend running (`node server.js` in backend-copy)
- [ ] Frontend running (`npm start` in frontend-copy)
- [ ] User model has onboarding fields
- [ ] `/api/me` returns onboarding flags
- [ ] Console shows debug logs
- [ ] Network tab shows `/api/me` request
- [ ] Navigation goes to `/creator/welcome`
- [ ] Onboarding page loads
- [ ] Can complete onboarding steps
- [ ] After completion, dashboard loads

---

## Expected Flow

```
1. User enters credentials
2. Click "Login"
3. POST /api/auth/login → Returns token
4. Token stored in localStorage
5. GET /api/me → Returns user with flags
6. Check hasCompletedOnboarding
7. If false → navigate('/creator/welcome')
8. If true → navigate('/creator/dashboard')
```

---

## Need More Help?

**Share these with me:**

1. Console logs (any errors?)
2. Network tab screenshot of `/api/me` response
3. Current User model schema
4. Whether backend has been updated yet

**Most common issue:** Backend not updated = no onboarding flags = wrong redirect

**Solution:** Follow BACKEND_INTEGRATION_STEPS.md (10 minutes)
