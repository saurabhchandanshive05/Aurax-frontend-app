# ✅ FINAL QA TEST SUITE - Creator Onboarding Flow

## 🎯 FINAL QA RULE (LOCKED)

**No user should ever ask: "Why am I here again?"**

- ✅ Approved user never sees profile setup again or welcome page
- ✅ Purpose always controls form logic
- ✅ CTA always returns user to correct context
- ✅ No broken redirects
- ✅ No duplicate submissions

---

## 🔍 Test Scenarios

### Test 1: Admin User Login ⭐
**User:** sourabh.chandanshive@gmail.com (admin + creator, approved)

**Expected Flow:**
```
Login → /admin/campaigns ✅
```

**Should NEVER see:**
- ❌ /creator/welcome
- ❌ /creator/profile-setup
- ❌ /creator/dashboard

**Console Logs to Verify:**
```
✅ Fetched full response during login
📊 User roles: { hasAdminRole: true, hasCreatorRole: true, ... }
🔀 Redirecting to admin dashboard (admin role detected)
```

**Test Steps:**
1. Open http://localhost:3000/creator/login
2. Login with sourabh.chandanshive@gmail.com
3. ✅ PASS: Redirected to /admin/campaigns
4. Manually navigate to http://localhost:3000/creator/welcome
5. ✅ PASS: Instantly redirected to /admin/campaigns
6. Manually navigate to http://localhost:3000/creator/profile-setup
7. ✅ PASS: Instantly redirected to /admin/campaigns

---

### Test 2: New Creator (No Profile) 🆕
**User:** newcreator@example.com (creator, no profile)

**Expected Flow:**
```
Login → /creator/welcome → "Get Started" → /creator/profile-setup
```

**Console Logs:**
```
📊 Creator onboarding status: { reviewStatus: null, isApproved: false }
🔀 Redirecting to welcome (not submitted)
```

**Test Steps:**
1. Register as creator with newcreator@example.com
2. Login
3. ✅ PASS: Lands on /creator/welcome
4. Click "Get Started"
5. ✅ PASS: Goes to /creator/profile-setup
6. Fill form and submit
7. ✅ PASS: Redirected to /creator/under-review

---

### Test 3: Pending Creator ⏳
**User:** pending@example.com (creator, pending approval)

**Expected Flow:**
```
Login → /creator/under-review ✅
```

**Should NEVER see:**
- ❌ /creator/welcome
- ❌ /creator/profile-setup

**Console Logs:**
```
📊 Creator onboarding status: { reviewStatus: 'pending', isApproved: false }
🔀 Redirecting to under review (pending)
```

**Test Steps:**
1. Login as pending creator
2. ✅ PASS: Lands on /creator/under-review
3. Manually navigate to /creator/welcome
4. ✅ PASS: Instantly redirected to /creator/under-review
5. Manually navigate to /creator/profile-setup
6. ✅ PASS: Instantly redirected to /creator/under-review

---

### Test 4: Approved Creator (Non-Admin) ✅
**User:** saurabhchandan05@gmail.com (creator, approved, no admin role)

**Expected Flow:**
```
Login → /creator/dashboard ✅
```

**Should NEVER see:**
- ❌ /creator/welcome
- ❌ /creator/profile-setup
- ❌ /creator/under-review

**Console Logs:**
```
📊 Creator onboarding status: { reviewStatus: 'approved', isApproved: true }
🔀 Redirecting to dashboard (approved)
```

**Test Steps:**
1. Login as approved creator
2. ✅ PASS: Lands on /creator/dashboard
3. Manually navigate to /creator/welcome
4. ✅ PASS: Instantly redirected to /creator/dashboard
5. Manually navigate to /creator/profile-setup
6. ✅ PASS: Instantly redirected to /creator/dashboard
7. Manually navigate to /creator/under-review
8. ✅ PASS: Can view page (no redirect)

---

### Test 5: Rejected Creator ❌
**User:** rejected@example.com (creator, rejected)

**Expected Flow:**
```
Login → /creator/welcome → Can resubmit profile
```

**Console Logs:**
```
📊 Creator onboarding status: { reviewStatus: 'rejected', isApproved: false }
🔀 Redirecting to rejected screen
```

**Test Steps:**
1. Login as rejected creator
2. ✅ PASS: Can access /creator/welcome
3. ✅ PASS: Can access /creator/profile-setup to resubmit
4. Fill form and resubmit
5. ✅ PASS: Status changes to pending, redirected to /creator/under-review

---

### Test 6: Brand User 🏢
**User:** brand@example.com (brand role)

**Expected Flow:**
```
Login → /brand/dashboard ✅
```

**Should NEVER see:**
- ❌ /creator/welcome
- ❌ /creator/profile-setup
- ❌ /creator/dashboard

**Test Steps:**
1. Login as brand user
2. ✅ PASS: Lands on /brand/dashboard
3. Manually navigate to /creator/welcome
4. ✅ PASS: Redirected to /brand/dashboard

---

## 🔄 Redirect Protection Matrix

| User Type | Login Dest | /creator/welcome | /creator/profile-setup | /creator/dashboard |
|-----------|-----------|------------------|------------------------|-------------------|
| Admin | /admin/campaigns | → /admin/campaigns | → /admin/campaigns | ❌ No access |
| Approved Creator | /creator/dashboard | → /creator/dashboard | → /creator/dashboard | ✅ Stay |
| Pending Creator | /creator/under-review | → /creator/under-review | → /creator/under-review | ❌ No access |
| New Creator | /creator/welcome | ✅ Stay | ✅ Stay (after click) | ❌ No access |
| Rejected Creator | /creator/rejected | ✅ Can access | ✅ Can resubmit | ❌ No access |
| Brand | /brand/dashboard | → /brand/dashboard | → /brand/dashboard | ❌ No access |

---

## 🛠️ Code Changes Summary

### 1. Backend - `/api/me` Endpoint
**File:** `backend-copy/server.js`

**Changes:**
- Added `roles: user.roles || []` to response
- Added `reviewStatus`, `isApproved`, `onboardingStep` fields

**Why:** Multi-role support + onboarding status for smart redirects

---

### 2. Frontend - AuthContext Login
**File:** `src/context/AuthContext.js`

**Changes:**
- Added `roles` array to user object
- Priority: Admin > Creator > Brand
- Uses `reviewStatus` from `/api/me` (no extra API call)

**Logic:**
```javascript
if (hasAdminRole) return "/admin/campaigns";
if (hasCreatorRole) {
  if (approved) return "/creator/dashboard";
  if (pending) return "/creator/under-review";
  if (rejected) return "/creator/rejected";
  return "/creator/welcome"; // new
}
if (hasBrandRole) return "/brand/dashboard";
```

---

### 3. Frontend - WelcomeScreen Guard
**File:** `src/pages/creator/WelcomeScreen.jsx`

**Changes:**
- Added role check: Admin → /admin/campaigns
- Added status check: Approved → /creator/dashboard
- Added status check: Pending → /creator/under-review

**Why:** Prevents approved/pending users from seeing welcome screen

---

### 4. Frontend - ProfileSetup Guard
**File:** `src/pages/creator/ProfileSetup.jsx`

**Changes:**
- Added admin check: Admin → /admin/campaigns
- Added status check: Approved → /dashboard
- Added status check: Pending → /creator/under-review

**Why:** Prevents approved/pending users from seeing setup form

---

### 5. Database - User Roles Fix
**Script:** `backend-copy/fix-sourabh-admin.js`

**Changes:**
- Added both `admin` and `creator` to `roles` array for sourabh.chandanshive@gmail.com

**Before:**
```javascript
{
  role: 'creator',
  roles: []
}
```

**After:**
```javascript
{
  role: 'creator',
  roles: ['admin', 'creator']
}
```

---

## 🐛 Debug Commands

### Check User Roles in Database
```bash
cd backend-copy
node check-sourabh-user.js
```

**Expected Output:**
```
Email: sourabh.chandanshive@gmail.com
Role (legacy): creator
Roles (array): [ 'admin', 'creator' ]
Review Status: approved
Is Approved: true
```

---

### Test `/api/me` Endpoint
```bash
# 1. Login to get token (via browser or Postman)
# 2. Test endpoint:
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5002/api/me | jq
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "role": "creator",
    "roles": ["admin", "creator"],
    "reviewStatus": "approved",
    "isApproved": true,
    ...
  }
}
```

---

### Watch Console Logs During Login
Open browser console and look for:

**✅ Good Flow (Admin):**
```
✅ Fetched full response during login
👤 Setting current user with complete data
📊 User roles: { hasAdminRole: true, hasCreatorRole: true, ... }
🔀 Redirecting to admin dashboard (admin role detected)
```

**❌ Bad Flow (Would show if broken):**
```
🔀 Redirecting to welcome (not submitted)  ← WRONG for approved user
```

---

## 📋 Pre-Flight Checklist

Before testing, verify:

- [ ] Backend running on port 5002
- [ ] Frontend running on port 3000
- [ ] MongoDB connected
- [ ] User `sourabh.chandanshive@gmail.com` has:
  - [ ] `role: 'creator'`
  - [ ] `roles: ['admin', 'creator']`
  - [ ] `reviewStatus: 'approved'`
  - [ ] `isApproved: true`
- [ ] Browser cache cleared
- [ ] localStorage cleared (or use incognito)

---

## 🎯 Success Criteria

All tests MUST pass:

1. ✅ Admin user → /admin/campaigns (never sees creator pages)
2. ✅ New creator → /creator/welcome → /creator/profile-setup
3. ✅ Pending creator → /creator/under-review (never sees welcome/setup)
4. ✅ Approved creator → /creator/dashboard (never sees welcome/setup/review)
5. ✅ Rejected creator → Can resubmit profile
6. ✅ Brand user → /brand/dashboard (never sees creator pages)
7. ✅ Manual navigation blocked for wrong states
8. ✅ No infinite redirect loops
9. ✅ No "Profile already submitted" errors for approved users
10. ✅ Console logs show correct reasoning

---

## 🚨 Common Issues & Fixes

### Issue: Admin still sees /creator/welcome
**Cause:** `roles` array not in database  
**Fix:** Run `node fix-sourabh-admin.js`

### Issue: Approved creator sees profile setup
**Cause:** `reviewStatus` not in `/api/me` response  
**Fix:** Already fixed in backend (restart server)

### Issue: Redirect loop
**Cause:** Conflicting redirects in multiple components  
**Fix:** Check console logs to identify loop source

### Issue: "Profile already submitted" error
**Cause:** Backend rejecting duplicate submission  
**Fix:** Already fixed - users redirected before they can submit

---

## 📞 Support Checklist

If user reports "Why am I here again?", check:

1. What is their `reviewStatus` in database?
2. What does `/api/me` return for them?
3. What do browser console logs show during login?
4. Are they in the correct `roles` array?
5. Did they manually navigate to wrong page?

---

**Status:** ✅ ALL FIXES APPLIED  
**Date:** January 6, 2026  
**Priority:** CRITICAL  
**Tested:** Pending user testing
