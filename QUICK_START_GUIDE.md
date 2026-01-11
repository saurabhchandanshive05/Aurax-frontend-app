# AURAX Unified Auth - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Run Migration Script
Update existing users to support multi-role system:

```bash
cd backend-copy
node migrate-users-to-multi-role.js
```

### Step 2: Start Backend
```bash
cd backend-copy
npm start
```

Backend should be running on `http://localhost:5002`

### Step 3: Start Frontend
```bash
# In new terminal
cd frontend-copy
npm start
```

Frontend should be running on `http://localhost:3000`

### Step 4: Test the Flow

#### Option A: Create New User
1. Visit `http://localhost:3000/signup`
2. Create account (no role selection needed!)
3. Login at `http://localhost:3000/login`
4. See **Role Selection Modal** appear
5. Choose an option
6. Complete **Inquiry Form** if needed

#### Option B: Test Existing Creator
1. Login with existing creator account
2. Should go **directly to dashboard** (no modal)
3. Full access to platform

#### Option C: Test CTA Gating
1. Visit `http://localhost:3000/live/campaigns`
2. Click **Quick Chat** or **Call** button
3. If not logged in → redirects to login
4. If logged in but not verified → shows inquiry form
5. After verification → can access chat/call

---

## 📋 Testing Checklist

### ✅ Backend API Tests

```bash
# Run automated test suite
cd backend-copy
node test-unified-auth.js
```

**Manual API Tests:**

```bash
# 1. Login
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 2. Check User Status
curl http://localhost:5002/api/auth/user-status \
  -H "Authorization: Bearer YOUR_TOKEN"

# 3. Select Role
curl -X POST http://localhost:5002/api/auth/select-role \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"action":"connect"}'

# 4. Submit Inquiry
curl -X POST http://localhost:5002/api/inquiry/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "purpose":"connect",
    "name":"John Doe",
    "userRole":"Brand",
    "message":"Want to connect with creators",
    "targetPlatform":["Instagram"]
  }'
```

### ✅ Frontend Flow Tests

1. **New User Registration**
   - [ ] Sign up without role selection
   - [ ] Login shows role modal
   - [ ] Can skip role modal
   - [ ] Can select role option
   
2. **Existing Creator Login**
   - [ ] Login goes straight to dashboard
   - [ ] No role modal appears
   - [ ] Full platform access

3. **CTA Button Gating**
   - [ ] Guest clicks CTA → Login
   - [ ] Logged in unverified → Inquiry form
   - [ ] Verified user → Direct action

4. **Inquiry Form**
   - [ ] All fields work
   - [ ] Validation works
   - [ ] Submission succeeds
   - [ ] Success screen shows

5. **Mobile Responsive**
   - [ ] Role modal stacks vertically
   - [ ] Inquiry form readable
   - [ ] CTA buttons accessible

---

## 🎯 Key URLs

### Frontend Routes
- `/login` - Unified login page
- `/signup` - Registration (no role selection)
- `/inquiry/form?purpose=connect` - Inquiry form for chat/call
- `/inquiry/form?purpose=campaign` - Inquiry form for campaigns
- `/live/campaigns` - Public LIVE board (CTA testing)
- `/dashboard` - Creator dashboard

### Backend API Endpoints
- `POST /api/auth/login` - User login
- `GET /api/auth/user-status` - Get roles & verification
- `POST /api/auth/select-role` - Assign role after login
- `POST /api/inquiry/submit` - Submit verification inquiry
- `GET /api/inquiry/status` - Check inquiry status
- `GET /api/admin/inquiries` - Admin: View all inquiries
- `POST /api/admin/inquiries/:id/approve` - Admin: Approve
- `POST /api/admin/inquiries/:id/reject` - Admin: Reject

---

## 🔧 Troubleshooting

### Issue: Role Modal Not Appearing
**Check:**
1. User is logged in (token in localStorage)
2. User is NOT an approved creator
3. Console for errors
4. RoleSelectionModal component imported correctly

### Issue: Inquiry Form Not Submitting
**Check:**
1. Authorization header present
2. All required fields filled
3. Backend `/api/inquiry` routes mounted
4. MongoDB connection active

### Issue: CTA Buttons Not Gating
**Check:**
1. `handleCTAClick` is async
2. API call to `/api/auth/user-status` works
3. `inquirerVerified` field exists on user
4. axios imported in component

### Issue: Admin Can't See Inquiries
**Check:**
1. User has 'admin' in roles array OR role='admin'
2. `/api/admin/inquiries` route mounted
3. Auth middleware applied correctly

---

## 📊 Database Verification

Check MongoDB to verify migration:

```javascript
// Connect to MongoDB
use aurax_db

// Check users have roles array
db.users.find({ roles: { $exists: true } }).count()

// Find verified creators
db.users.find({ creatorVerified: true })

// Find verified inquirers
db.users.find({ inquirerVerified: true })

// Check inquiries collection
db.inquiries.find({ verificationStatus: 'pending' })
```

---

## 🎨 UI Components Overview

### 1. RoleSelectionModal
- **Trigger:** After login for non-verified users
- **Location:** `src/components/RoleSelectionModal.jsx`
- **Styling:** `src/components/RoleSelectionModal.css`

### 2. InquiryForm
- **Route:** `/inquiry/form`
- **Location:** `src/components/InquiryForm.jsx`
- **Styling:** `src/components/InquiryForm.css`

### 3. UnifiedLogin
- **Route:** `/login`
- **Location:** `src/pages/UnifiedLogin.jsx`
- **Styling:** Uses `BrandLogin.module.css`

---

## 🚨 Common Errors & Solutions

### Error: "Cannot find module 'axios'"
```bash
npm install axios
```

### Error: "Inquiry already exists"
**Solution:** User has pending inquiry. Check `/api/inquiry/status`

### Error: "Token expired"
**Solution:** Login again to refresh token

### Error: "Admin privileges required"
**Solution:** Add 'admin' to user's roles array in database

---

## 📞 Need Help?

Check these files for implementation details:
1. `AURAX_UNIFIED_AUTH_IMPLEMENTATION.md` - Complete documentation
2. `backend-copy/routes/inquiry.js` - Inquiry API logic
3. `backend-copy/models/User.js` - User schema
4. `src/components/RoleSelectionModal.jsx` - Role selection UI
5. `src/components/InquiryForm.jsx` - Inquiry form UI

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ New users see role modal after login
- ✅ Creators go straight to dashboard
- ✅ CTA buttons require verification
- ✅ Inquiry forms submit successfully
- ✅ Admin can approve/reject inquiries
- ✅ No console errors in browser
- ✅ Backend logs show successful requests

---

## 🎉 You're All Set!

The unified authentication system is now live. Users can:
- Login once
- Choose roles after login
- Get verified for gated actions
- Have multiple roles simultaneously

**Next Steps:**
1. Build admin inquiry management UI
2. Add email notifications for approvals
3. Create user dashboard for verification status
4. Test with real users
5. Monitor inquiry approval workflow
