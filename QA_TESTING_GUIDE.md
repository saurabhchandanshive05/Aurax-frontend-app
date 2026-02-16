# 🧪 QA Testing Guide for Meta Graph API
## Testing Page ID: 1737772143174400
## Acceptance Criteria: 100% Data Fetch

---

## ⚡ Quick Test (3 Steps)

### Step 1: Get Meta Access Token (2 minutes)

**Option A: Use Graph API Explorer (Fastest)**
1. Open: https://developers.facebook.com/tools/explorer/
2. Click **"Permissions"** → Check **`ads_read`**
3. Click **"Generate Access Token"**
4. Copy the token (starts with `EAAG...`)

**Option B: Use Your Existing App**
- You already have Meta App ID: `2742496619415444`
- Go to Graph API Explorer, select your app, add `ads_read` permission

### Step 2: Add Token to .env

Open `backend-copy/.env` and update line 93:

```env
META_AD_LIBRARY_ACCESS_TOKEN=YOUR_TOKEN_HERE
```

**Example:**
```env
META_AD_LIBRARY_ACCESS_TOKEN=EAAGm0PX4ZCpsBO7y8e5RwZBZAP3...
```

### Step 3: Run QA Test

```bash
cd backend-copy
node test-meta-api.js
```

---

## 📊 What the Test Does

The QA script performs **4 comprehensive tests**:

### ✅ Test 1: Environment Configuration
- Validates META_AD_LIBRARY_ACCESS_TOKEN is configured
- Checks token format
- Verifies API version

### ✅ Test 2: Meta Graph API Connectivity
- Tests connection to Meta's servers
- Validates token permissions
- Fetches sample ad to verify access

### ✅ Test 3: Complete Data Fetch (100% Accuracy)
- **Fetches ALL ads** for page 1737772143174400
- **Automatic pagination** (up to 2000 ads)
- **Data quality analysis**:
  - Page name coverage
  - Snapshot URL coverage
  - Creative content coverage
  - Platform distribution
  - Delivery date coverage
- **Performance metrics**:
  - Total fetch time
  - Ads per second
  - Average page response time

### ✅ Test 4: Backend Integration
- Checks if backend is running
- Validates API routes are mounted

---

## 🎯 Expected Output

### Success Output:
```
═══════════════════════════════════════════════════════════
   QA TEST PASSED - 100% DATA FETCH ACCEPTANCE MET
═══════════════════════════════════════════════════════════

Summary:
✅ Tests Passed: 12/12
✅ All ads fetched successfully: 45 ads
✅ Pagination working correctly
✅ Data quality verified
✅ Platform detection working
✅ Snapshot URLs available

Data Quality:
✅ Page Name Coverage: 45/45 (100.0%)
✅ Snapshot URL Coverage: 45/45 (100.0%)
✅ Creative Body Coverage: 42/45 (93.3%)
✅ Platform Info Coverage: 45/45 (100.0%)

Platform Distribution:
  - facebook: 30 ads (66.7%)
  - instagram: 15 ads (33.3%)

Performance:
✅ Total time: 3.45s
✅ Avg per page: 865ms
```

### Failure Output (if token missing):
```
❌ Environment Config: META_AD_LIBRARY_ACCESS_TOKEN is not configured in .env
Please add your Meta access token to backend-copy/.env
Get token from: https://developers.facebook.com/tools/explorer/
```

---

## 🔧 Alternative: Test via Frontend

If you prefer to test via the UI:

1. **Start Backend:**
   ```bash
   cd backend-copy
   node server.js
   ```
   Look for: `✅ Meta Ads Archive Service initialized`

2. **Start Frontend:**
   ```bash
   cd ..
   npm start
   ```

3. **Test in Browser:**
   - Go to: http://localhost:3000/admin/brand-intelligence
   - Click **"Add Brand"**
   - Enter Page ID: `1737772143174400`
   - Click **"🚀 Auto Fetch using Meta Graph API"**
   - Verify form auto-populates with data

---

## 🧪 Manual API Test (Using curl)

Test the Meta API directly:

```bash
# Replace YOUR_TOKEN with your actual token
curl "https://graph.facebook.com/v19.0/ads_archive?search_page_ids=1737772143174400&ad_reached_countries=[\"IN\"]&ad_active_status=ACTIVE&limit=5&fields=id,page_id,page_name,publisher_platforms&access_token=YOUR_TOKEN"
```

Expected response:
```json
{
  "data": [
    {
      "id": "1234567890",
      "page_id": "1737772143174400",
      "page_name": "Brand Name",
      "publisher_platforms": ["facebook", "instagram"]
    }
  ]
}
```

---

## 🐛 Troubleshooting

### Error: "META_AD_LIBRARY_ACCESS_TOKEN not configured"
**Solution:** Add token to `backend-copy/.env` (line 93)

### Error: "Invalid OAuth access token"
**Solution:** Token expired. Generate new one from Graph API Explorer

### Error: "Missing permission: ads_read"
**Solution:** 
1. Go to Graph API Explorer
2. Click "Permissions"
3. Check "ads_read"
4. Generate new token

### Error: "Page has no active ads"
**Solution:** This is normal - the page may have paused all ads. Try a different page ID like `241130119248568` (Veet India)

### Error: "Rate limit exceeded"
**Solution:** Wait 5-10 minutes and try again. Meta limits to ~200 calls/hour

---

## ✅ Acceptance Criteria Checklist

For QA to pass with 100% data fetch:

- [ ] Token configured in .env
- [ ] All tests pass (12/12)
- [ ] All ads fetched (pagination complete)
- [ ] Data quality > 90% coverage
- [ ] No errors in backend logs
- [ ] Frontend auto-fetch works
- [ ] Snapshot URLs available
- [ ] Platform detection working
- [ ] Creative content extracted
- [ ] Performance < 5s for 100 ads

---

## 📞 Quick Commands

```bash
# Get token (open in browser)
start https://developers.facebook.com/tools/explorer/

# Edit .env
notepad backend-copy\.env

# Run QA test
cd backend-copy && node test-meta-api.js

# Start backend
cd backend-copy && node server.js

# Start frontend
npm start

# Test specific page
curl "https://graph.facebook.com/v19.0/ads_archive?search_page_ids=1737772143174400&ad_reached_countries=[\"IN\"]&ad_active_status=ACTIVE&limit=1&access_token=YOUR_TOKEN"
```

---

## 🎉 Success Criteria Met

When you see this, QA is complete:

```
✅ Tests Passed: 12/12
✅ Total Ads Fetched: [NUMBER] ads
✅ Data Quality: 100%
✅ Performance: < 5s
✅ QA TEST PASSED - 100% DATA FETCH ACCEPTANCE MET
```

---

**Created:** January 17, 2026  
**Test Script:** `backend-copy/test-meta-api.js`  
**Page ID:** 1737772143174400  
**Acceptance:** 100% Data Fetch Accuracy
