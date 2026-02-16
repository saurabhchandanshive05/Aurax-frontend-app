# 🚀 Meta Graph API Integration - Complete Setup Guide

## ✅ What's Been Implemented

The Aurax platform has been upgraded to use the **official Meta Graph API** instead of the old scraper + OCR approach. This provides:

- ✅ **Official Meta API Integration** (Graph API v19.0)
- ✅ **Real-time ads data** from Meta's Ads Archive
- ✅ **Automatic pagination** (fetches up to 500 ads per page)
- ✅ **Smart caching** (6-hour cache to avoid excessive API calls)
- ✅ **Platform detection** (Facebook, Instagram, Messenger, Audience Network)
- ✅ **Database storage** (MetaAd model for storing all ads)
- ✅ **Brand verification** (metaVerifiedSource='META_GRAPH_API')
- ✅ **Error handling** with fallback to manual Ad Library URL
- ✅ **Frontend integration** with auto-fetch button

---

## 📋 Prerequisites

Before you can use this feature, you need to obtain a **Meta Ad Library Access Token**:

### 1. Get a Meta Access Token

**Option A: Using Graph API Explorer (Recommended for Testing)**

1. Go to [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your App (or create a new app if needed)
3. Under "Permissions", add:
   - ✅ `ads_read` (required)
   - ✅ `pages_read_engagement` (optional but recommended)
4. Click "Generate Access Token"
5. Copy the token (starts with `EAAG...`)

**Option B: Using System User Token (Recommended for Production)**

1. Go to [Meta Business Settings](https://business.facebook.com/settings)
2. Create a System User
3. Assign the `ads_read` permission
4. Generate a long-lived token (never expires)

### 2. Add Token to Backend Environment

Add the token to `backend-copy/.env`:

```env
# META AD LIBRARY API (Official Graph API Integration)
META_AD_LIBRARY_ACCESS_TOKEN=YOUR_TOKEN_HERE
META_GRAPH_VERSION=v19.0
```

### 3. Restart Backend

```bash
cd backend-copy
node server.js
```

You should see:
```
✅ Meta Ads Archive Service initialized with Graph API v19.0
Mounting /api/meta/ad-library
✅ Backend server running on http://localhost:5002
```

---

## 🎯 How to Use

### Frontend: Auto Fetch Button

1. Navigate to **Admin → Brand Intelligence**
2. Click **"Add Brand"**
3. Enter a **Meta Page ID** (e.g., `241130119248568` for Veet India)
   - Find this in Meta Ad Library URL: `view_all_page_id=XXXXXX`
4. Click **"🚀 Auto Fetch using Meta Graph API"**
5. Wait for data to be fetched (takes 2-10 seconds)
6. Form will auto-populate with:
   - ✅ Page Name
   - ✅ Active Ads Count
   - ✅ Platforms (Facebook, Instagram, etc.)
   - ✅ Meta Ad Library URL
7. Review and click **"Add Brand"**

### Backend: API Endpoints

#### POST `/api/meta/ad-library/fetch`

Fetch ads from Meta Graph API:

```bash
curl -X POST http://localhost:5002/api/meta/ad-library/fetch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "241130119248568",
    "country": "IN",
    "activeStatus": "ACTIVE",
    "limit": 25,
    "forceRefresh": false
  }'
```

**Response:**
```json
{
  "success": true,
  "cached": false,
  "summary": {
    "pageId": "241130119248568",
    "pageName": "Veet India",
    "activeAdsCount": 42,
    "platforms": ["facebook", "instagram"],
    "lastFetchedAt": "2025-01-28T10:30:00.000Z",
    "adLibraryUrl": "https://www.facebook.com/ads/library/?view_all_page_id=241130119248568"
  },
  "ads": [
    {
      "libraryId": "1234567890",
      "pageId": "241130119248568",
      "pageName": "Veet India",
      "snapshotUrl": "https://www.facebook.com/ads/archive/render_ad/?id=1234567890",
      "platforms": ["facebook", "instagram"],
      "creativeBodies": ["Smooth skin, confident you!"],
      "adDeliveryStartTime": "2025-01-15T00:00:00.000Z",
      "status": "ACTIVE"
    }
  ]
}
```

**Caching:** If data was fetched in the last 6 hours, returns cached data unless `forceRefresh=true`.

#### GET `/api/meta/ad-library/validate/:pageId`

Validate if a page exists and has ads:

```bash
curl http://localhost:5002/api/meta/ad-library/validate/241130119248568 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "hasAds": true,
  "pageName": "Veet India"
}
```

#### GET `/api/meta/ad-library/brand/:brandId/ads`

Get stored ads for a brand from database:

```bash
curl "http://localhost:5002/api/meta/ad-library/brand/679987654321abcd/ads?limit=10&skip=0&status=ACTIVE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "ads": [...],
  "pagination": {
    "total": 42,
    "limit": 10,
    "skip": 0,
    "hasMore": true
  },
  "brand": {
    "metaPageId": "241130119248568",
    "metaPageName": "Veet India",
    "metaAdCountActive": 42
  }
}
```

#### GET `/api/meta/ad-library/url/:pageId`

Generate Meta Ad Library URL for manual viewing:

```bash
curl http://localhost:5002/api/meta/ad-library/url/241130119248568 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📊 Database Schema

### MetaAd Model

Stores individual ads fetched from Meta:

```javascript
{
  libraryId: "1234567890",          // Unique Meta ad ID
  brandId: ObjectId("..."),         // Reference to Brand
  pageId: "241130119248568",
  pageName: "Veet India",
  country: "IN",
  status: "ACTIVE",                 // ACTIVE | INACTIVE | ALL
  mediaType: "IMAGE",               // IMAGE | VIDEO | CAROUSEL
  snapshotUrl: "https://...",       // Meta's ad preview URL
  creativeBodies: ["..."],          // Ad copy text
  creativeLinkTitles: ["..."],
  creativeLinkCaptions: ["..."],
  platforms: ["facebook", "instagram"],
  adCreationTime: Date,
  adDeliveryStartTime: Date,
  adDeliveryStopTime: Date,
  fetchedAt: Date,
  lastUpdatedAt: Date
}
```

**Indexes:**
- `libraryId` (unique)
- `pageId + status` (compound)
- `brandId + status` (compound)
- `fetchedAt` (desc)

### Brand Model Updates

New fields added to Brand model:

```javascript
{
  // ... existing fields ...
  
  // Meta API Integration Fields
  metaPageId: "241130119248568",
  metaPageName: "Veet India",
  metaAdLibraryUrl: "https://...",
  metaAdCountActive: 42,
  metaPlatforms: ["facebook", "instagram"],
  metaVerifiedSource: "META_GRAPH_API",  // META_GRAPH_API | SCRAPER | MANUAL
  metaLastFetchedAt: Date,
  metaFetchStatus: "success",            // success | failed | pending
  metaFetchError: null
}
```

---

## 🔧 Architecture

### Backend Service Layer

**File:** `backend-copy/services/metaAdsArchive.js`

- Handles all Meta Graph API communication
- Automatic pagination (loops through `paging.next`)
- Rate limit protection (100ms delay between requests)
- Error handling (401, 403, 429, 500, timeouts)
- Platform detection and aggregation

### Backend Routes

**File:** `backend-copy/routes/metaAdLibrary.js`

- 4 REST endpoints
- JWT authentication on all routes
- 6-hour caching mechanism
- Bulk upsert using `MetaAd.bulkUpsert()`
- Brand status updates

### Frontend Integration

**File:** `src/pages/admin/BrandIntelligenceEnhanced.jsx`

**Updated:**
- `handleAutoFetch()` function (line 367)
- "Auto Fetch" button UI (line 1660)
- Help text updated to mention Meta Graph API

---

## 🛡️ Error Handling

### Common Errors

#### 1. Invalid/Expired Token
**Error:** `Meta API Error: Invalid OAuth access token`
**Solution:** Regenerate token from Graph API Explorer

#### 2. Insufficient Permissions
**Error:** `Meta API Error: Missing permission: ads_read`
**Solution:** Add `ads_read` permission to your token

#### 3. Rate Limit Hit
**Error:** `Meta API Error: Rate limit exceeded`
**Solution:** Wait 5-10 minutes or use forceRefresh=false to use cached data

#### 4. Page Not Found
**Error:** `Page validation failed`
**Solution:** Verify the Page ID is correct and the page has ads

#### 5. Token Missing in .env
**Error:** `⚠️ META_AD_LIBRARY_ACCESS_TOKEN not found in environment`
**Solution:** Add token to backend-copy/.env

### Fallback Behavior

If Meta API fails:
- Frontend shows error message
- Offers to open Meta Ad Library manually
- User can still enter data manually

---

## 🧪 Testing

### Test with Veet India

```bash
# Test Page ID: 241130119248568 (Veet India)
curl -X POST http://localhost:5002/api/meta/ad-library/fetch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "241130119248568",
    "country": "IN",
    "activeStatus": "ACTIVE",
    "limit": 25
  }'
```

### Test Cache Behavior

```bash
# First call: fetches from Meta API
curl -X POST http://localhost:5002/api/meta/ad-library/fetch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pageId": "241130119248568", "country": "IN"}'

# Second call (within 6 hours): returns cached data
curl -X POST http://localhost:5002/api/meta/ad-library/fetch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pageId": "241130119248568", "country": "IN"}'

# Force refresh: bypasses cache
curl -X POST http://localhost:5002/api/meta/ad-library/fetch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"pageId": "241130119248568", "country": "IN", "forceRefresh": true}'
```

---

## 📝 Next Steps

### Phase 1: ✅ Complete (Backend + Frontend Integration)
- [x] Meta Ads Archive service
- [x] MetaAd database model
- [x] Brand model updates
- [x] API routes with caching
- [x] Frontend auto-fetch button
- [x] Error handling with fallback

### Phase 2: 🚧 Pending (UI Enhancements)
- [ ] Add "View Snapshot" buttons for each ad
- [ ] Show platform badges on brand cards
- [ ] Display "Last fetched" time on brand cards
- [ ] Show verification badge: "Verified from Meta API"
- [ ] Add toast notifications instead of alerts

### Phase 3: 🔮 Future (Advanced Features)
- [ ] Webhook integration for real-time ad updates
- [ ] Ad performance metrics (impressions, spend estimates)
- [ ] Competitor comparison dashboard
- [ ] Historical ad archive (track ad changes over time)
- [ ] AI-powered ad copy analysis

---

## 🔐 Security Notes

1. **Never commit your Meta access token** to git
2. **Use .env for all secrets** (already configured)
3. **Rotate tokens regularly** (every 60-90 days)
4. **Use System User tokens** for production (never expires)
5. **Monitor API usage** (Facebook has rate limits)

---

## 📞 Troubleshooting

### Backend not starting?
```bash
# Check if .env has the token
cat backend-copy/.env | grep META_AD_LIBRARY_ACCESS_TOKEN

# Check backend logs
cd backend-copy
node server.js
```

### Frontend not calling new API?
```bash
# Restart frontend to pick up changes
npm start
```

### Token issues?
```bash
# Validate token manually
curl "https://graph.facebook.com/v19.0/ads_archive?search_page_ids=241130119248568&ad_reached_countries=[\"IN\"]&ad_active_status=ACTIVE&limit=1&access_token=YOUR_TOKEN"
```

---

## 🎉 Success Checklist

- [ ] Meta access token added to `.env`
- [ ] Backend restarted successfully
- [ ] Frontend shows "🚀 Auto Fetch using Meta Graph API" button
- [ ] Clicking button fetches data (no errors)
- [ ] Form auto-populates with page name, ad count, platforms
- [ ] Brand saved to database with `metaVerifiedSource='META_GRAPH_API'`
- [ ] Second fetch returns cached data (within 6 hours)
- [ ] Brand cards show correct active ad counts

---

**Created:** January 28, 2025  
**Status:** ✅ Meta Graph API Integration Complete  
**Next:** User needs to add Meta access token to `.env`
