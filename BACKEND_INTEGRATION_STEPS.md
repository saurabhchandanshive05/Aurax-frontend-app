# Backend Integration Instructions

## Step 1: Update User Model

Add the new fields to your User schema in `backend-copy/models/User.js`:

```javascript
// Add these fields to your existing User schema
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

See `BACKEND_USER_SCHEMA_UPDATE.md` for complete schema.

---

## Step 2: Mount Creator Profile Routes

In `backend-copy/server.js`, add the new routes:

```javascript
// Around line 640-650, add this with other route imports:
const creatorProfileRoutes = require('./routes/creatorProfile');

// Then mount the routes (around line 700):
app.use('/api/creator', creatorProfileRoutes);
```

---

## Step 3: Update /api/me Endpoint

Ensure your `/api/me` endpoint returns all onboarding-related fields:

```javascript
// In server.js or wherever /api/me is defined
app.get('/api/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .lean();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch Instagram data if connected
    if (user.profilesConnected) {
      const SocialAccount = require('./models/SocialAccount');
      const socialAccount = await SocialAccount.findOne({ 
        userId: user._id, 
        platform: 'instagram' 
      });
      
      if (socialAccount) {
        user.instagram = {
          username: socialAccount.username,
          profilePicture: socialAccount.profilePicture,
          followersCount: socialAccount.followersCount,
          mediaCount: socialAccount.mediaCount
        };
      }
    }

    // Calculate onboarding flags if not set
    if (!user.isProfileCompleted) {
      user.isProfileCompleted = !!(user.fullName && user.bio);
    }
    
    if (!user.hasAudienceInfo) {
      user.hasAudienceInfo = !!(user.audienceInfo?.categories?.length > 0);
    }

    user.hasCompletedOnboarding = (
      user.isProfileCompleted && 
      user.profilesConnected && 
      user.hasAudienceInfo
    );

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
```

---

## Step 4: Update Facebook OAuth Callback

After successful Instagram connection, update the user's flags:

```javascript
// In backend-copy/routes/socialAuth.js, Facebook callback route
// After saving SocialAccount, update user:

user.profilesConnected = true;
user.isInstagramConnected = true;

// Cache Instagram data
user.instagram = {
  username: profile.username,
  profilePicture: profile.profile_picture_url,
  followersCount: profile.followers_count || 0,
  mediaCount: profile.media_count || 0
};

// Check onboarding completion
if (user.isProfileCompleted && user.hasAudienceInfo) {
  user.hasCompletedOnboarding = true;
}

await user.save();
```

---

## Step 5: Test the Integration

### Test Profile Update:
```bash
curl -X PUT http://localhost:5002/api/creator/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "bio": "Fashion content creator",
    "location": "New York, USA",
    "phone": "+1234567890"
  }'
```

### Test Audience Save:
```bash
curl -X POST http://localhost:5002/api/creator/audience \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "categories": ["Fashion", "Beauty"],
    "contentTypes": ["Reels", "Posts"],
    "regions": ["North America"]
  }'
```

### Test /api/me:
```bash
curl -X GET http://localhost:5002/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Expected Response from /api/me:

```json
{
  "_id": "user_id_here",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "creator",
  "fullName": "John Doe",
  "bio": "Fashion content creator",
  "location": "New York, USA",
  "phone": "+1234567890",
  "isProfileCompleted": true,
  "profilesConnected": true,
  "isInstagramConnected": true,
  "hasAudienceInfo": true,
  "hasCompletedOnboarding": true,
  "audienceInfo": {
    "categories": ["Fashion", "Beauty"],
    "contentTypes": ["Reels", "Posts"],
    "regions": ["North America"]
  },
  "instagram": {
    "username": "johndoe_insta",
    "profilePicture": "https://...",
    "followersCount": 50000,
    "mediaCount": 250
  },
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-01-20T15:30:00.000Z"
}
```

---

## Troubleshooting

### Issue: "Cannot read property 'categories' of undefined"
**Solution:** Initialize `audienceInfo` in User schema with default empty arrays

### Issue: Onboarding doesn't mark as complete
**Solution:** Check all three flags are true in backend before setting `hasCompletedOnboarding`

### Issue: Instagram data not showing
**Solution:** Ensure SocialAccount is queried and data is merged into user object in `/api/me`

---

## File Checklist

- [ ] `backend-copy/models/User.js` - Updated with new fields
- [ ] `backend-copy/routes/creatorProfile.js` - Created (3 new endpoints)
- [ ] `backend-copy/server.js` - Mounted `/api/creator` routes
- [ ] `backend-copy/server.js` - Updated `/api/me` endpoint
- [ ] `backend-copy/routes/socialAuth.js` - Updated OAuth callback to set flags

---

## Next Steps

1. ✅ Update User model
2. ✅ Create creatorProfile routes
3. ✅ Mount routes in server.js
4. ✅ Update /api/me endpoint
5. ✅ Test all endpoints
6. ✅ Restart backend server
7. ✅ Test frontend onboarding flow
8. ✅ Verify Instagram connection
9. ✅ Check dashboard redirect logic

---

**Important:** After making these changes, restart your backend server:

```bash
cd backend-copy
# Kill existing process
Get-Process -Name "node" | Stop-Process -Force

# Start fresh
node server.js
```
