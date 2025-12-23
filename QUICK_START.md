# 🚀 Quick Reference - Creator Onboarding

## Frontend Files (✅ Already Created)

```
src/pages/CreatorOnboarding.js     ← Main component
src/pages/CreatorOnboarding.css    ← Styling
src/pages/CreatorLogin.js          ← Updated (onboarding check)
src/pages/Signup.js                ← Updated (redirect)
src/App.js                         ← Updated (route added)
```

## Backend Files (⚠️ You Need to Create/Update)

```
backend-copy/models/User.js              ← Add new fields
backend-copy/routes/creatorProfile.js    ← Create this file
backend-copy/server.js                   ← Mount routes + update /api/me
```

---

## 3-Step Backend Setup

### Step 1: Update User Model
Add to `backend-copy/models/User.js`:
```javascript
fullName: String,
bio: String,
location: String,
phone: String,
isProfileCompleted: { type: Boolean, default: false },
hasAudienceInfo: { type: Boolean, default: false },
hasCompletedOnboarding: { type: Boolean, default: false },
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
```

### Step 2: Mount Routes
Add to `backend-copy/server.js`:
```javascript
const creatorProfileRoutes = require('./routes/creatorProfile');
app.use('/api/creator', creatorProfileRoutes);
```

### Step 3: Update /api/me
Ensure it returns all onboarding flags (see BACKEND_INTEGRATION_STEPS.md)

---

## Test URLs

```
Frontend:
http://localhost:3000/creator/welcome   ← Onboarding page
http://localhost:3000/signup             ← Sign up
http://localhost:3000/creator/login      ← Login

Backend:
http://localhost:5002/api/me                  ← Get user
http://localhost:5002/api/creator/profile     ← Update profile
http://localhost:5002/api/creator/audience    ← Save audience
http://localhost:5002/api/instagram/refresh   ← Refresh stats
```

---

## Quick Test

1. Start backend: `cd backend-copy && node server.js`
2. Start frontend: `cd frontend-copy && npm start`
3. Go to: `http://localhost:3000/signup`
4. Register as creator
5. Should see onboarding page!

---

## File to Copy

The file `backend-copy/routes/creatorProfile.js` is ready to use.
Just copy it to your backend and mount in server.js!

---

## Need Help?

📖 Full Guide: `CREATOR_ONBOARDING_GUIDE.md`  
🔧 Backend Steps: `BACKEND_INTEGRATION_STEPS.md`  
📊 Schema Update: `BACKEND_USER_SCHEMA_UPDATE.md`  
✨ Summary: `ONBOARDING_IMPLEMENTATION_SUMMARY.md`
