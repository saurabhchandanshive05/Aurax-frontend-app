# 🔄 Complete Onboarding Flow - Visual Guide

## 📊 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER JOURNEY                            │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  New User    │
│  Signup      │
└──────┬───────┘
       │
       v
┌──────────────────┐
│  POST /register  │
│  Token received  │
└──────┬───────────┘
       │
       v
┌──────────────────────────┐
│  Signup.js               │
│  Redirects to:           │
│  /creator/welcome        │ ← Always for creators
└──────┬───────────────────┘
       │
       v
┌────────────────────────────────────────────────────┐
│  CreatorOnboarding.js (/creator/welcome)          │
│                                                    │
│  Step 1: Profile Setup        ⭕ Pending          │
│  Step 2: Connect Instagram    ⭕ Pending          │
│  Step 3: Audience Preferences ⭕ Pending          │
│                                                    │
│  User completes all steps...                      │
│                                                    │
│  Step 1: Profile Setup        ✅ Complete         │
│  Step 2: Connect Instagram    ✅ Complete         │
│  Step 3: Audience Preferences ✅ Complete         │
│                                                    │
│  [Go to Dashboard] Button clicked                 │
└────────────────────┬───────────────────────────────┘
                     │
                     v
          ┌──────────────────┐
          │  Navigate to:    │
          │  /creator/       │
          │  dashboard       │
          └────────┬─────────┘
                   │
                   v
┌────────────────────────────────────────────────────┐
│  CreatorDashboard.js                               │
│                                                    │
│  useEffect runs on mount:                         │
│  1. Fetch GET /api/me                             │
│  2. Check hasCompletedOnboarding                  │
│  3. IF false → redirect to /creator/welcome       │
│  4. IF true → show dashboard                      │
└────────────────────┬───────────────────────────────┘
                     │
                     v
          ┌──────────────────┐
          │  Dashboard shows │
          │  Full content    │
          │  ✅ SUCCESS!     │
          └──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                    EXISTING USER LOGIN                          │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐
│  User Login  │
│  Page        │
└──────┬───────┘
       │
       v
┌──────────────────┐
│  POST /login     │
│  Token received  │
└──────┬───────────┘
       │
       v
┌──────────────────────────────────────┐
│  CreatorLogin.js                     │
│  1. Store token                      │
│  2. Fetch GET /api/me                │
│  3. Read hasCompletedOnboarding      │
└──────┬───────────────────────────────┘
       │
       ├─── hasCompletedOnboarding = false ───┐
       │                                       │
       v                                       v
┌──────────────────┐              ┌────────────────────┐
│  Navigate to:    │              │  Navigate to:      │
│  /creator/       │              │  /creator/         │
│  dashboard       │              │  welcome           │
└────────┬─────────┘              └────────┬───────────┘
         │                                  │
         v                                  v
┌────────────────────┐           ┌────────────────────┐
│  Dashboard mounts  │           │  Onboarding shows  │
│  Checks onboarding │           │  User completes    │
│  ✅ Complete!      │           │  steps             │
│  Shows content     │           └────────┬───────────┘
└────────────────────┘                    │
                                          v
                                ┌──────────────────┐
                                │  Go to Dashboard │
                                │  Flow continues  │
                                └──────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│              MANUAL URL ACCESS (PROTECTION)                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│  User types URL:     │
│  /creator/dashboard  │
└──────┬───────────────┘
       │
       v
┌────────────────────────────────────────────────────┐
│  CreatorDashboard.js mounts                        │
│                                                    │
│  useEffect:                                        │
│  1. Check if token exists                         │
│  2. Fetch GET /api/me                             │
│  3. Read hasCompletedOnboarding                   │
└────────────────────┬───────────────────────────────┘
                     │
                     ├─── false ────┐
                     │               │
                     v               v
          ┌──────────────┐   ┌──────────────────┐
          │  true        │   │  Redirect to:    │
          │  Show        │   │  /creator/       │
          │  dashboard   │   │  welcome         │
          └──────────────┘   └────────┬─────────┘
                                      │
                                      v
                             ┌────────────────────┐
                             │  Must complete     │
                             │  onboarding first  │
                             └────────────────────┘
```

---

## 🔑 Key Components

### 1. CreatorLogin.js
**Responsibility:** Check onboarding status after login
```javascript
// After successful login:
const userData = await fetch('/api/me');

if (!userData.hasCompletedOnboarding) {
  navigate('/creator/welcome');  // ← Onboarding
} else {
  navigate('/creator/dashboard'); // ← Dashboard
}
```

### 2. Signup.js
**Responsibility:** Always redirect to onboarding
```javascript
// After successful signup:
const redirect = role === "creator" 
  ? "/creator/welcome"      // ← Always onboarding
  : "/brand/dashboard";
navigate(redirect);
```

### 3. CreatorDashboard.js
**Responsibility:** Guard dashboard access
```javascript
// On component mount:
useEffect(() => {
  const userData = await fetch('/api/me');
  
  if (!userData.hasCompletedOnboarding) {
    navigate('/creator/welcome');  // ← Redirect to onboarding
  }
}, []);
```

### 4. CreatorOnboarding.js
**Responsibility:** Collect onboarding data
```javascript
// Three main cards:
1. Profile (name, bio, location, phone)
2. Instagram (OAuth connection)
3. Audience (categories, types, regions)

// After completion:
navigate('/creator/dashboard');
```

---

## 🎯 Backend Data Flow

```
User completes onboarding step
        ↓
Frontend calls API endpoint
        ↓
Backend updates User model
        ↓
Backend sets completion flags

Profile completed?
  → isProfileCompleted = true

Instagram connected?
  → profilesConnected = true

Audience saved?
  → hasAudienceInfo = true

All three true?
  → hasCompletedOnboarding = true
```

### Database State Transitions

**Initial State (New User):**
```json
{
  "hasCompletedOnboarding": false,
  "isProfileCompleted": false,
  "profilesConnected": false,
  "hasAudienceInfo": false
}
```

**After Profile Update:**
```json
{
  "hasCompletedOnboarding": false,
  "isProfileCompleted": true,  ← Changed
  "profilesConnected": false,
  "hasAudienceInfo": false
}
```

**After Instagram Connect:**
```json
{
  "hasCompletedOnboarding": false,
  "isProfileCompleted": true,
  "profilesConnected": true,   ← Changed
  "hasAudienceInfo": false
}
```

**After Audience Save:**
```json
{
  "hasCompletedOnboarding": true,  ← Auto-calculated
  "isProfileCompleted": true,
  "profilesConnected": true,
  "hasAudienceInfo": true          ← Changed
}
```

---

## 🛡️ Protection Layers

### Layer 1: Login Redirect
```
CreatorLogin.js checks /api/me
  → Redirects to onboarding if incomplete
```

### Layer 2: Signup Redirect
```
Signup.js always goes to onboarding
  → No chance to skip
```

### Layer 3: Dashboard Guard
```
CreatorDashboard.js checks on mount
  → Redirects if incomplete
  → Prevents manual URL access
```

### Layer 4: Protected Route (in App.js)
```
Both /creator/welcome and /creator/dashboard
  → Require authentication
  → No access without token
```

---

## 📝 API Calls Map

```
Login Flow:
  POST /api/auth/login
    → Returns { success: true, token: "..." }
  GET /api/me
    → Returns { hasCompletedOnboarding: boolean, ... }

Onboarding Flow:
  PUT /api/creator/profile
    → Updates profile, sets isProfileCompleted = true
  GET /api/auth/facebook
    → Initiates Instagram OAuth
  Callback sets profilesConnected = true
  POST /api/creator/audience
    → Saves preferences, sets hasAudienceInfo = true
    → Auto-sets hasCompletedOnboarding = true

Dashboard Access:
  GET /api/me
    → Checks hasCompletedOnboarding
    → Redirects if false
```

---

## ✅ Success Checklist

- [x] New signups go to onboarding ✅
- [x] Incomplete users redirected to onboarding ✅
- [x] Complete users see dashboard directly ✅
- [x] Manual dashboard access blocked if incomplete ✅
- [x] Loading state while checking ✅
- [x] All three onboarding steps tracked ✅
- [x] Backend flags set automatically ✅
- [x] No way to bypass onboarding ✅

---

## 🎨 Visual States

### Loading State (Dashboard Check)
```
┌───────────────────────┐
│                       │
│     [Spinner]         │
│                       │
│  Loading your         │
│  dashboard...         │
│                       │
└───────────────────────┘
```

### Onboarding Page
```
┌─────────────────────────────────────┐
│  Welcome, John! 🎉                  │
│  john@example.com                   │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  ✓    2    3    4                   │
│  Account → Profile → Instagram → Go │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                     │
│  [Profile Card - Complete Now]      │
│  [Instagram Card - Connect]         │
│  [Audience Card - Select Prefs]     │
│                                     │
│  Profile ⭕ / Instagram ⭕ / Audience ⭕ │
│  [Skip to Dashboard]                │
└─────────────────────────────────────┘
```

### Dashboard (Onboarding Complete)
```
┌─────────────────────────────────────┐
│  Creator Dashboard                  │
│                                     │
│  [Pending Offers] [Active Campaigns]│
│  [Earnings] [Engagement]            │
│                                     │
│  [Instagram Integration]            │
│  ✅ Connected                       │
│                                     │
│  [Your Progress]                    │
│  Level 15 - 8500 Points            │
└─────────────────────────────────────┘
```

---

**The onboarding flow is now completely implemented and protected!** 🎉
