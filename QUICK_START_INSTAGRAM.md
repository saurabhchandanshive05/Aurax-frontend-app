# 🚀 Quick Start - Get Instagram Profiles Working in 5 Minutes

## ⚡ TL;DR
Your Instagram Influencer Profiles module is **already built** (backend + frontend). You just need to refresh your expired Meta access token.

---

## 🎯 What You'll Search For
**Your Connected Instagram Account**: **@cutxp_ert** (cutcraft)
- Followers: 1,005
- Connected to Facebook Page: Shubhamchandan1

---

## 📋 5-Minute Checklist

### ✅ Step 1: Generate New Meta Token (2 mins)

**Option A: Meta Business Suite** (Recommended)
1. Go to: https://business.facebook.com/
2. Login → Select business "Shubhamchandan1"
3. Settings → Business Settings → System Users
4. Create/Select a System User
5. Click "Generate New Token"
6. Select Page: **Shubhamchandan1** (ID: 927134967156119)
7. Select permissions:
   - ☑️ instagram_basic
   - ☑️ pages_read_engagement
   - ☑️ instagram_content_publish
   - ☑️ business_management
8. Click "Generate Token"
9. **COPY THE TOKEN** (you won't see it again!)

**Option B: Graph API Explorer** (Faster but expires in 60 days)
1. Go to: https://developers.facebook.com/tools/explorer/
2. Select your App (or create one)
3. Click "Generate Access Token"
4. Grant permissions (instagram_basic, pages_read_engagement)
5. Copy the token

---

### ✅ Step 2: Update .env File (1 min)

```powershell
# Navigate to backend folder
cd "c:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy"

# Edit .env file (use Notepad or VS Code)
notepad .env
```

Find this line:
```env
META_PAGE_ACCESS_TOKEN=<META_ACCESS_TOKEN>
```

Replace with your new token:
```env
META_PAGE_ACCESS_TOKEN=<PASTE_YOUR_NEW_TOKEN_HERE>
```

Save and close.

---

### ✅ Step 3: Restart Backend (1 min)

```powershell
# Stop running backend
Get-Process -Name node | Stop-Process -Force

# Start backend
cd "c:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy"
node server.js
```

Wait for:
```
✅ Backend server running on http://localhost:5002
✅ MongoDB connected successfully
```

---

### ✅ Step 4: Test It Works (1 min)

**Option A: Run Diagnostic Script**
```powershell
cd "c:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy"
node diagnostic-instagram.js
```

**Expected Output**:
```
✅ CONNECTED INSTAGRAM ACCOUNT:
   Username: @cutxp_ert
   Name: cutcraft
   Followers: 1,005
```

**Option B: Test Frontend**
1. Go to: http://localhost:3000/admin/influencers
2. Login as admin
3. Search: **@cutxp_ert**
4. See profile card with 1,005 followers ✅

---

## 🎉 Success Criteria

You should see:
- ✅ Diagnostic shows "Connected Instagram: @cutxp_ert"
- ✅ Frontend search returns full profile with avatar
- ✅ Second search loads instantly (from cache)
- ✅ Random username (e.g., @carryminati) shows "Not Accessible" error

---

## ❌ Troubleshooting

### "Token expired" error persists
- Make sure you saved the .env file
- Restart backend after updating .env
- Check token was copied correctly (no spaces/line breaks)

### "No Instagram Business Account linked"
- Your Page needs an Instagram Business account connected
- Go to Facebook Page Settings → Instagram → Link Account

### Backend won't start
```powershell
cd backend-copy
npm install
node server.js
```

### Frontend not loading
```powershell
cd frontend-copy
npm install
npm start
```

---

## 📚 Full Documentation

- **Detailed Guide**: [INSTAGRAM_PROFILES_TEST_GUIDE.md](./INSTAGRAM_PROFILES_TEST_GUIDE.md)
- **Token Instructions**: [FIX_META_TOKEN.md](./FIX_META_TOKEN.md)
- **Complete Summary**: [INSTAGRAM_PROFILES_SUMMARY.md](./INSTAGRAM_PROFILES_SUMMARY.md)

---

## 🎯 What to Test

### Test 1: Your Account (Should Work ✅)
```
Search: @cutxp_ert
Expected: Full profile with 1,005 followers
```

### Test 2: Random Account (Should Fail ❌)
```
Search: @carryminati
Expected: "Not Accessible via Graph API" error
```

### Test 3: Caching (Should Be Fast ⚡)
```
Search: @cutxp_ert (first time) → ~2 seconds
Search: @cutxp_ert (second time) → <100ms (cached)
```

---

**That's it! 🚀**

Generate token → Update .env → Restart backend → Search @cutxp_ert

**Total Time**: 5 minutes
