# Creator Onboarding Flow - Implementation Guide

## 🎯 Overview

A complete onboarding experience for creators on the Aurax influencer marketing platform. New creators are guided through profile setup, Instagram connection, and audience preferences before accessing their dashboard.

---

## ✅ What's Implemented

### **1. CreatorOnboarding Component** (`src/pages/CreatorOnboarding.js`)

**Features:**
- ✅ Welcome header with creator's name and email
- ✅ 4-step progress indicator (Account Created → Profile Setup → Connect Instagram → Ready to Go)
- ✅ Three main interactive cards:
  - **Profile Card**: Complete profile with modal form
  - **Instagram Card**: Connect/manage Instagram Business Account
  - **Audience Card**: Select categories, content types, and regions
- ✅ Completion summary with status indicators
- ✅ Smart routing to dashboard (allows skip or enforces completion)
- ✅ Loading states and error handling
- ✅ Responsive design with modern UI

**API Integrations:**
```javascript
GET  /api/me                      // Fetch creator profile
PUT  /api/creator/profile         // Update profile info
POST /api/creator/audience        // Save audience preferences
GET  /api/auth/facebook           // Initiate Instagram OAuth
POST /api/instagram/refresh       // Refresh Instagram stats
```

---

## 📋 User Flow

### **After Signup:**
```
User completes signup
    ↓
Token stored → login()
    ↓
Redirect to /creator/welcome
    ↓
CreatorOnboarding page loads
```

### **After Login:**
```
User logs in successfully
    ↓
Fetch user data from /api/me
    ↓
Check: hasCompletedOnboarding?
    ↓ NO
Redirect to /creator/welcome
    ↓ YES
Redirect to /creator/dashboard
```

### **Onboarding Steps:**

**Step 1: Profile Setup**
- User clicks "Complete Now"
- Modal opens with form fields:
  - Full Name (required)
  - Bio (required)
  - Location (optional)
  - Phone (optional)
- On save → PUT /api/creator/profile
- Card status updates to "Completed"

**Step 2: Connect Instagram**
- User clicks "Connect Instagram Account"
- Redirects to `/api/auth/facebook` (Facebook OAuth)
- User grants permissions
- Callback fetches Instagram data
- Profile picture, handle, followers, posts display
- "Refresh Stats" button available after connection

**Step 3: Content & Audience**
- Select content categories (Fashion, Tech, Beauty, Gaming, etc.)
- Select content types (Reels, Posts, Stories, etc.)
- Select target regions (North America, Europe, Asia, etc.)
- On save → POST /api/creator/audience
- Card status updates to "Completed"

**Step 4: Go to Dashboard**
- Summary shows: Profile ✅ / Instagram ✅ / Audience ✅
- Primary button: "🚀 Go to Dashboard"
- If incomplete: "⏭️ Skip to Dashboard" (with warning message)

---

## 🛠️ Backend Requirements

### **Required API Endpoints:**

#### 1. **GET /api/me**
Returns current user data including onboarding flags.

**Response:**
```json
{
  "id": "user_id",
  "username": "creator_username",
  "email": "creator@email.com",
  "fullName": "Creator Name",
  "bio": "Creator bio text",
  "location": "City, Country",
  "phone": "+1234567890",
  "role": "creator",
  "isProfileCompleted": true,
  "profilesConnected": true,
  "isInstagramConnected": true,
  "hasAudienceInfo": true,
  "hasCompletedOnboarding": true,
  "instagram": {
    "username": "instagram_handle",
    "profilePicture": "https://...",
    "followersCount": 50000,
    "mediaCount": 250
  },
  "audienceInfo": {
    "categories": ["Fashion", "Beauty"],
    "contentTypes": ["Reels", "Posts"],
    "regions": ["North America", "Europe"]
  }
}
```

#### 2. **PUT /api/creator/profile**
Updates creator profile information.

**Request Body:**
```json
{
  "fullName": "Creator Name",
  "bio": "Bio text",
  "location": "City, Country",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { /* updated user object */ }
}
```

**Recommended Logic:**
- Update user fields
- Set `isProfileCompleted = true` if fullName and bio are provided
- Check if all onboarding steps complete → set `hasCompletedOnboarding = true`

#### 3. **POST /api/creator/audience**
Saves audience and content preferences.

**Request Body:**
```json
{
  "categories": ["Fashion", "Tech"],
  "contentTypes": ["Reels", "Posts"],
  "regions": ["North America", "Asia"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Audience preferences saved",
  "user": { /* updated user object */ }
}
```

**Recommended Logic:**
- Store preferences in `user.audienceInfo`
- Set `hasAudienceInfo = true`
- Check if all onboarding steps complete → set `hasCompletedOnboarding = true`

#### 4. **GET /api/auth/facebook** (Already Implemented)
Initiates Facebook OAuth for Instagram connection.

#### 5. **POST /api/instagram/refresh** (Recommended)
Refreshes Instagram statistics.

**Response:**
```json
{
  "success": true,
  "instagram": {
    "username": "handle",
    "followersCount": 51000,
    "mediaCount": 255
  }
}
```

---

## 🗄️ Database Schema Updates

### **User Model Additions:**

```javascript
{
  // Existing fields...
  username: String,
  email: String,
  password: String,
  role: String,
  
  // New onboarding fields
  fullName: String,
  bio: String,
  location: String,
  phone: String,
  
  // Onboarding flags
  isProfileCompleted: { type: Boolean, default: false },
  hasAudienceInfo: { type: Boolean, default: false },
  hasCompletedOnboarding: { type: Boolean, default: false },
  
  // Audience preferences
  audienceInfo: {
    categories: [String],
    contentTypes: [String],
    regions: [String]
  },
  
  // Instagram data (from SocialAccount or embedded)
  instagram: {
    username: String,
    profilePicture: String,
    followersCount: Number,
    mediaCount: Number
  }
}
```

### **Onboarding Completion Logic:**

```javascript
// After each step, check completion
const isOnboardingComplete = (
  user.isProfileCompleted && 
  user.profilesConnected && 
  user.hasAudienceInfo
);

if (isOnboardingComplete) {
  user.hasCompletedOnboarding = true;
}
```

---

## 🎨 Styling

**CSS File:** `src/pages/CreatorOnboarding.css`

**Design Features:**
- Gradient background (purple/pink)
- Modern card-based layout
- Smooth animations and transitions
- Progress indicator with active states
- Instagram-branded connect button
- Responsive design (mobile-first)
- Modal with blur backdrop
- Accessible form controls

**Color Palette:**
```css
Primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
Success: #4caf50
Warning: #ff9800
Instagram: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)
```

---

## 🚀 Testing Checklist

### **Frontend:**
- [ ] Navigate to `/creator/welcome` after signup
- [ ] Welcome header shows correct username and email
- [ ] Progress indicator highlights current step
- [ ] Profile modal opens and saves data
- [ ] Instagram connect button redirects to OAuth
- [ ] Instagram data displays after connection
- [ ] Audience form saves preferences
- [ ] Completion summary updates in real-time
- [ ] "Go to Dashboard" button works
- [ ] Skip option available when incomplete
- [ ] Mobile responsive design works
- [ ] Loading states display correctly
- [ ] Error handling works

### **Backend:**
- [ ] `/api/me` returns all required fields
- [ ] `/api/creator/profile` updates user data
- [ ] `/api/creator/audience` saves preferences
- [ ] Instagram OAuth flow completes
- [ ] `hasCompletedOnboarding` flag updates automatically
- [ ] Subsequent logins skip onboarding if complete

### **Integration:**
- [ ] Login redirects to onboarding if incomplete
- [ ] Login redirects to dashboard if complete
- [ ] Signup always redirects to onboarding
- [ ] Dashboard accessible via skip button
- [ ] Onboarding can be resumed later

---

## 📁 Files Modified/Created

### **Created:**
```
src/pages/CreatorOnboarding.js     (550 lines - main component)
src/pages/CreatorOnboarding.css    (650 lines - styling)
CREATOR_ONBOARDING_GUIDE.md        (this file)
```

### **Modified:**
```
src/pages/CreatorLogin.js          (Added onboarding check logic)
src/pages/Signup.js                (Redirect to /creator/welcome)
src/App.js                         (Added /creator/welcome route)
```

---

## 🔧 Configuration

### **Environment Variables:**
No new environment variables required. Uses existing backend API URL:
```javascript
http://localhost:5002  // Backend API
http://localhost:3000  // Frontend
```

### **Route Configuration:**
```javascript
// App.js
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

## 🎯 Key Features

### **1. Smart Progress Tracking**
Progress indicator automatically updates based on:
- Account created: ✅ (always true after signup)
- Profile setup: ✅ (when fullName + bio completed)
- Instagram connected: ✅ (when profilesConnected = true)
- Ready to go: ✅ (all steps complete)

### **2. Flexible Completion**
- Users can skip to dashboard anytime
- Incomplete steps marked with ⭕
- Complete steps marked with ✅
- Warning message if skipping incomplete onboarding

### **3. Instagram Integration**
- OAuth via Facebook Developer App
- Displays profile picture, handle, followers, posts
- Refresh button to update stats
- Error handling for connection failures

### **4. Audience Preferences**
- Multi-select checkboxes for categories
- Content types selection
- Geographic targeting
- Visual feedback for selections
- Saved to database for campaign matching

### **5. Profile Management**
- Modal-based editing
- Required vs optional fields
- Real-time validation
- Persistent data across sessions

---

## 🐛 Known Issues & Solutions

### **Issue: Token not found**
**Solution:** Ensure token is stored in localStorage after login
```javascript
localStorage.setItem('token', resp.token);
```

### **Issue: Instagram OAuth fails**
**Solution:** Check Facebook Developer Console:
- Valid OAuth redirect URIs configured
- App not in development mode restriction
- Required permissions granted

### **Issue: Progress doesn't update**
**Solution:** Backend must update flags on save:
```javascript
user.isProfileCompleted = true;
user.hasAudienceInfo = true;
user.hasCompletedOnboarding = (all flags true);
```

### **Issue: Infinite redirect loop**
**Solution:** Ensure `hasCompletedOnboarding` is set to true when all steps done

---

## 📊 Analytics Recommendations

Track these events for insights:
- `onboarding_started` - User lands on /creator/welcome
- `profile_completed` - Profile form submitted
- `instagram_connected` - OAuth successful
- `audience_saved` - Preferences submitted
- `onboarding_skipped` - User clicks skip button
- `onboarding_completed` - All steps finished
- `time_to_complete` - Duration from start to finish

---

## 🚀 Next Steps (Enhancements)

1. **Email Notifications**
   - Welcome email after signup
   - Reminder email if onboarding incomplete after 24h

2. **Dashboard Reminder**
   - Banner on dashboard if onboarding incomplete
   - "Complete your profile" call-to-action

3. **Advanced Features**
   - Upload portfolio images
   - Add social media links (YouTube, TikTok)
   - Set pricing/rates
   - Video introduction upload

4. **Gamification**
   - Progress percentage (75% complete)
   - Completion badges
   - Profile strength indicator

5. **A/B Testing**
   - Test skip vs enforce completion
   - Measure conversion rates
   - Optimize step order

---

## 📞 Support

For questions or issues:
- **Frontend:** Check browser console for errors
- **Backend:** Check server logs for API failures
- **Instagram:** Verify Facebook Developer App settings

**Documentation Version:** 1.0  
**Last Updated:** December 2, 2025  
**Author:** GitHub Copilot
