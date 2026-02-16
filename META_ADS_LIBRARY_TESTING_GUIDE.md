# 🧪 Meta Ads Library-Style Search - Testing Guide

## Quick Test Checklist

### ✅ Test 1: Search → No Results → Meta Search CTA
**Duration:** 2 minutes

1. Open `http://localhost:3000/admin/brand-intelligence`
2. Click "🔍 Search & Discover" tab
3. In search box, type: `GHAR SOAP BRAND TEST`
4. Press Enter or wait for search

**Expected Results:**
- ✅ Empty state message appears:
  - 🔍 Icon shows
  - Heading: "No brands found in Aurax for 'GHAR SOAP BRAND TEST'"
  - Description text explaining Meta search option
- ✅ Two buttons visible:
  - "🔗 Search on Meta Ads Library" (blue gradient)
  - "➕ Add Brand Manually" (gray)

5. Click "🔗 Search on Meta Ads Library"

**Expected Results:**
- ✅ New tab opens with Meta Ads Library
- ✅ URL includes: `q=GHAR%20SOAP%20BRAND%20TEST`
- ✅ Search is pre-filled in Meta's search box

---

### ✅ Test 2: Add Brand via Header Button
**Duration:** 3 minutes

1. Look at top-right header
2. Find "➕ Add Brand" button (green gradient)
3. Click it

**Expected Results:**
- ✅ Modal opens with title "➕ Add Brand from Meta Ads Library"
- ✅ Form shows 5 fields:
  - Brand Name (empty)
  - Meta Page ID (empty) with help text
  - Meta Page Name (empty)
  - Meta Ads Library URL (empty) with help text
  - Industry (dropdown)
  - Active Ads Count (empty)
- ✅ Two buttons: "Cancel" and "✅ Add Brand"

4. Fill form:
   ```
   Brand Name: Test Brand 123
   Meta Page ID: 999888777666
   Meta Page Name: Test Brand Official
   Industry: Fashion & Beauty
   Active Ads Count: 25
   ```

5. Click "✅ Add Brand"

**Expected Results:**
- ✅ Alert shows: "✅ Brand added and verified successfully"
- ✅ Modal closes automatically
- ✅ Brand list refreshes
- ✅ New brand "Test Brand 123" appears in list with:
  - ✅ Verified badge
  - Meta page name shown
  - "View in Meta Ad Library" link

---

### ✅ Test 3: Add Brand from Search (Pre-fill)
**Duration:** 2 minutes

1. Go to "Search & Discover" tab
2. Search: `MYNTRA TEST`
3. Wait for no results CTA
4. Click "➕ Add Brand Manually"

**Expected Results:**
- ✅ Modal opens
- ✅ Brand Name field pre-filled with: "MYNTRA TEST"
- ✅ Other fields empty
- ✅ Can type normally in all fields

5. Add Meta Page ID: `111222333444`
6. Click "✅ Add Brand"

**Expected Results:**
- ✅ Success alert
- ✅ Modal closes
- ✅ Search still shows "MYNTRA TEST" in search box
- ✅ Brand now appears in results

---

### ✅ Test 4: View in Meta Ad Library Link
**Duration:** 1 minute

1. Find any verified brand card (e.g., "Nykaa")
2. Look for "🔗 View in Meta Ad Library" button
3. Click it

**Expected Results:**
- ✅ New tab opens
- ✅ URL format: `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=IN&view_all_page_id={page_id}`
- ✅ Meta Ad Library shows ads for that brand
- ✅ Country filter set to "India"

---

### ✅ Test 5: Only Verified Brands Show
**Duration:** 2 minutes

1. Go to "Search & Discover" tab
2. Clear search box
3. Look at all brands in list

**Expected Results:**
- ✅ Every brand has:
  - ✅ Verified badge with Meta page name
  - "View in Meta Ad Library" link
  - Verification date shown
  - Confidence: 100%
- ✅ NO brands without verification show
- ✅ All brands have active "View in Meta" links

---

### ✅ Test 6: Search Works for Meta Page Name
**Duration:** 1 minute

1. Search: `NYKAA INDIA`
2. Wait for results

**Expected Results:**
- ✅ Nykaa brand shows up (searches meta_page_name)
- ✅ Brand card shows correct verification details

3. Search: `NYKAA`

**Expected Results:**
- ✅ Same brand shows (searches brand_name OR meta_page_name)

---

### ✅ Test 7: URL Parsing (Advanced)
**Duration:** 3 minutes

1. Click "➕ Add Brand"
2. Fill form:
   ```
   Brand Name: Amazon India Test
   Meta Page ID: (leave empty)
   Meta Ads Library URL: https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=IN&view_all_page_id=555666777888
   Industry: E-commerce
   ```

3. Click "✅ Add Brand"

**Expected Results:**
- ✅ Backend extracts page ID: `555666777888`
- ✅ Auto-generates Meta URLs
- ✅ Brand added successfully
- ✅ "View in Meta Ad Library" link works correctly

---

### ✅ Test 8: Duplicate Brand Handling
**Duration:** 2 minutes

1. Try adding existing brand "Nykaa"
2. Fill form:
   ```
   Brand Name: Nykaa
   Meta Page ID: (actual Nykaa page ID)
   ```

3. Click "✅ Add Brand"

**Expected Results:**
- ✅ Alert: "✅ Brand updated successfully" (not "added")
- ✅ Existing brand's verification data updated
- ✅ No duplicate brand created

---

### ✅ Test 9: Form Validation
**Duration:** 2 minutes

1. Click "➕ Add Brand"
2. Leave Brand Name empty
3. Try to submit

**Expected Results:**
- ✅ Browser validation: "Please fill out this field"

4. Fill Brand Name: "Test"
5. Leave Meta Page ID empty
6. Try to submit

**Expected Results:**
- ✅ Browser validation: "Please fill out this field"

---

### ✅ Test 10: Cancel Modal
**Duration:** 1 minute

1. Click "➕ Add Brand"
2. Start typing in Brand Name: "Test Cancel"
3. Click "Cancel" button

**Expected Results:**
- ✅ Modal closes immediately
- ✅ No brand added
- ✅ Can re-open modal and fields are cleared

4. Click "➕ Add Brand" again
5. Click outside modal (on overlay)

**Expected Results:**
- ✅ Modal closes when clicking overlay
- ✅ Modal stays open when clicking inside modal content

---

## 🐛 Known Issues to Check

### Issue 1: Token Expired
**Symptom:** 401 error when adding brand
**Fix:** User needs to log out and log back in

### Issue 2: API URL Mismatch
**Symptom:** Network error when adding brand
**Fix:** Check `API_URL` in frontend matches backend URL

### Issue 3: Industries Not Loading
**Symptom:** Industry dropdown empty
**Fix:** Check `fetchDashboardData()` populates `industries` state

---

## 📊 Backend API Testing (Optional)

### Test `/verify-from-meta` Endpoint with Postman

**Request:**
```
POST http://localhost:5001/api/brand-intelligence/verify-from-meta
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "brand_name": "Test Brand API",
  "meta_page_id": "123123123123",
  "meta_page_name": "Test Brand Official",
  "industry": "Technology",
  "active_ads_count": 10
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "✅ Brand added and verified successfully",
  "action": "created",
  "data": {
    "brand_id": "generated-uuid",
    "brand_name": "Test Brand API",
    "industry": "Technology",
    "verification": {
      "status": "VERIFIED",
      "source": "META_ADS_LIBRARY",
      "meta_page_id": "123123123123",
      "meta_page_name": "Test Brand Official",
      "meta_page_url": "https://www.facebook.com/123123123123",
      "meta_ads_library_url": "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=IN&view_all_page_id=123123123123",
      "verified_at": "2025-01-28T...",
      "active_ads_count": 10,
      "platforms": ["instagram"],
      "confidence": 100
    }
  }
}
```

---

## ✅ Acceptance Criteria

All tests passed? Check these:

- ✅ Only verified brands show in dashboard (6 strict checks)
- ✅ Search queries both meta_page_name and brand_name
- ✅ "Search on Meta" CTA appears when no results + search query
- ✅ "Add Brand" button in header works
- ✅ Add Brand modal pre-fills search query
- ✅ Meta Page ID required for brand addition
- ✅ Auto-generates Meta URLs from page ID
- ✅ Duplicate brands update instead of create
- ✅ "View in Meta Ad Library" links work for all brands
- ✅ Form validation prevents empty submissions
- ✅ Modal closes on cancel or overlay click

---

## 🎯 Performance Checks

- ✅ Search response time: < 1 second
- ✅ Add brand submission: < 2 seconds
- ✅ Modal opens/closes smoothly
- ✅ No console errors
- ✅ No 404s for images or resources

---

## 🚀 Ready for Production?

**Before deploying:**

1. ✅ All 10 tests passed
2. ✅ No console errors
3. ✅ Backend API responses correct
4. ✅ Database has real brands with verification
5. ✅ Git committed and pushed
6. ✅ Documentation updated

**If all checked → Deploy! 🎉**
