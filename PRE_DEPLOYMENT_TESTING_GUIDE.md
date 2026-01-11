# 🚀 Pre-Deployment Testing Guide

## Issues Fixed

### 1. ❌ Missing Backend API Endpoint
**Problem:** Frontend calling `/api/public/creator/:slug` but backend didn't have this route
**Solution:** Added public creator endpoint to `backend-copy/server.js` at line ~2508

```javascript
app.get("/api/public/creator/:slug", async (req, res) => {
  // Fetches creator profile by slug
  // Returns JSON with creator data and content
  // Returns 404 JSON (not HTML) if creator not found
});
```

### 2. ❌ Backend Returning HTML Instead of JSON
**Problem:** When routes didn't exist, Express returned HTML 404 pages
**Solution:** Added global API 404 handler and error handler (line ~3010)

```javascript
// All /api/* routes that don't exist return JSON 404
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found'
  });
});

// Global error handler ensures all errors return JSON
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    error: err.message
  });
});
```

### 3. ✅ Enhanced Frontend Error Handling
**Already Fixed:** `src/utils/apiClient.js` now checks Content-Type before parsing

```javascript
const contentType = response.headers.get("content-type");
const isJSON = contentType && contentType.includes("application/json");

if (!isJSON) {
  // Handle HTML error pages gracefully
  responseData = { 
    message: `Server returned ${response.status} error`,
    htmlError: true 
  };
}
```

---

## 🧪 Local Testing Checklist

### Step 1: Start Backend (Port 5002)

```powershell
cd "C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy"
npm start
```

**Expected Output:**
```
✅ Backend server running on http://localhost:5002
🌐 Environment: development
🔐 CORS Origins: http://localhost:3000, ...
✅ MongoDB connected successfully
```

**❌ If Port 5002 is Busy:**
```powershell
# Find process using port 5002
netstat -ano | findstr :5002

# Kill the process (replace PID with actual number)
taskkill /PID <PID> /F
```

---

### Step 2: Start Frontend (Port 3000)

```powershell
cd "C:\Users\hp\OneDrive\Desktop\frontend-copy"
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view influencer-app in the browser.
  Local:            http://localhost:3000
```

**❌ If Port 3000 is Busy:**
- Frontend will auto-suggest port 3001
- Or kill the process manually like above

---

### Step 3: Test Public Creator Page

#### Test 1: Creator That Doesn't Exist
**URL:** `http://localhost:3000/creator/nonexistent`

**Expected Behavior:**
- ✅ Page loads without crashing
- ✅ Shows error message: "Creator not found or page is not active"
- ✅ NO "Connection failed: Unexpected token '<'" error

**Backend Console Should Show:**
```
📄 Fetching public creator page for slug: nonexistent
❌ Creator not found for slug: nonexistent
```

---

#### Test 2: Creator With Slug (if exists in DB)
**URL:** `http://localhost:3000/creator/saurabh` (or your actual slug)

**Expected Behavior:**
- ✅ Page loads with creator profile
- ✅ Shows profile picture, bio, Instagram link
- ✅ "Exclusive Content" section is HIDDEN (because no content)
- ✅ "Paid Services" section shows if services exist

**Backend Console Should Show:**
```
📄 Fetching public creator page for slug: saurabh
✅ Public creator page data sent for: Saurabh
```

---

### Step 4: Test Dashboard Navigation

1. Login at `http://localhost:3000/creator/login`
2. Navigate to `http://localhost:3000/creator/dashboard`
3. **Check:** Sidebar footer should show "🏠 Back to Home" button
4. **Click:** Button should navigate to homepage (`/`)

**Expected:** ✅ Navigation works without errors

---

### Step 5: Test Login Page

**URL:** `http://localhost:3000/creator/login`

**Expected Behavior:**
- ✅ Navbar is VISIBLE at top
- ✅ Footer is VISIBLE at bottom
- ✅ Login form centered
- ✅ Entering wrong credentials shows: "Login failed" (not JSON parse error)

---

### Step 6: Test API Endpoints Directly

Use browser or Postman:

#### Test Public Creator API
```
GET http://localhost:5002/api/public/creator/saurabh
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "creator": {
    "username": "saurabh",
    "displayName": "Saurabh",
    "bio": "Creator bio...",
    "profilePicture": "url...",
    "subscriptionPlans": [],
    "services": []
  },
  "content": []
}
```

**If creator doesn't exist (404):**
```json
{
  "success": false,
  "message": "Creator not found or page is not active"
}
```

---

#### Test 404 Handler
```
GET http://localhost:5002/api/this-route-does-not-exist
```

**Expected Response (404):**
```json
{
  "success": false,
  "error": "API endpoint not found",
  "path": "/api/this-route-does-not-exist"
}
```

**❌ SHOULD NOT RETURN HTML PAGE**

---

## 🔍 Common Issues & Debugging

### Issue: "ECONNREFUSED"
**Cause:** Backend not running
**Fix:** Start backend on port 5002

### Issue: "Cannot GET /api/public/creator/slug"
**Cause:** Wrong backend URL in frontend
**Fix:** Check `src/utils/getApiUrl.js` - should use `http://localhost:5002`

### Issue: "JWT_SECRET is required"
**Cause:** Missing environment variable
**Fix:** Check `backend-copy/.env` has `JWT_SECRET=your-secret-key`

### Issue: "MongoDB connection failed"
**Cause:** Invalid MONGODB_URI
**Fix:** Verify MONGODB_URI in `backend-copy/.env`

---

## 📊 Validation Results

Run automated checks:
```powershell
node pre-deployment-check.js
```

**Current Status:**
```
✅ Public creator endpoint exists
✅ API 404 handler configured
✅ Global error handler configured
✅ API client handles HTML responses
✅ Empty content section hidden
✅ Frontend build script configured
✅ Backend start script configured

⚠️  BREVO_API_KEY not found in .env (backend)
```

---

## ✅ Final Checklist Before GitHub Push

- [ ] Backend starts on port 5002 without errors
- [ ] Frontend starts on port 3000 without errors
- [ ] `/creator/nonexistent` shows error (not crash)
- [ ] `/creator/login` shows navbar and footer
- [ ] Dashboard has "Back to Home" button
- [ ] API endpoints return JSON (not HTML)
- [ ] `npm run build` succeeds (frontend)
- [ ] No console errors in browser
- [ ] Pre-deployment check passes

---

## 🚀 Deployment Commands (AFTER LOCAL TESTS PASS)

### Commit Backend Changes
```powershell
cd "C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy"
git add server.js
git commit -m "feat: add public creator endpoint and JSON error handlers"
git push origin main
```

### Frontend Already Pushed
Frontend changes were pushed in commit `a874719`:
- Hide empty exclusive content
- Add dashboard home navigation
- Improve API error handling

---

## 📞 Support

If any test fails:
1. Check browser console (F12) for errors
2. Check backend terminal for errors
3. Verify environment variables in `.env` files
4. Ensure MongoDB Atlas connection is working
5. Report specific error message and URL

---

**Last Updated:** January 3, 2026
**Status:** Ready for local testing
