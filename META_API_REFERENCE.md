# 📡 Meta Graph API - API Reference

## Base URL
```
http://localhost:5002/api/meta/ad-library
```

---

## Authentication

All endpoints require JWT authentication:

```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

Get JWT token from login endpoint: `POST /api/auth/login`

---

## Endpoints

### 1. Fetch Ads from Meta Graph API

**Endpoint:** `POST /fetch`

**Description:** Fetches ads from Meta Graph API with automatic pagination and 6-hour caching.

**Request Body:**
```json
{
  "pageId": "241130119248568",        // Required: Meta Page ID
  "country": "IN",                    // Optional: Default "IN"
  "activeStatus": "ACTIVE",           // Optional: ACTIVE | INACTIVE | ALL
  "limit": 25,                        // Optional: Default 25, max 100
  "forceRefresh": false               // Optional: Bypass cache
}
```

**Response (Success - Fresh Data):**
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
      "country": "IN",
      "status": "ACTIVE",
      "mediaType": "IMAGE",
      "snapshotUrl": "https://www.facebook.com/ads/archive/render_ad/?id=1234567890",
      "creativeBodies": ["Get smooth skin instantly!"],
      "creativeLinkTitles": ["Shop Now"],
      "creativeLinkCaptions": ["veet.in"],
      "creativeLinkDescriptions": ["Discover our range"],
      "platforms": ["facebook", "instagram"],
      "adCreationTime": "2025-01-10T12:00:00.000Z",
      "adDeliveryStartTime": "2025-01-15T00:00:00.000Z",
      "adDeliveryStopTime": null,
      "fetchedAt": "2025-01-28T10:30:00.000Z"
    }
  ],
  "message": "Successfully fetched 42 ads from Meta Graph API"
}
```

**Response (Success - Cached Data):**
```json
{
  "success": true,
  "cached": true,
  "summary": { ... },
  "ads": [ ... ],
  "message": "Returned 25 cached ads (fetched 2 hours ago)"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Meta API Error: Invalid OAuth access token",
  "fallbackUrl": "https://www.facebook.com/ads/library/?view_all_page_id=241130119248568",
  "error": {
    "code": 190,
    "type": "OAuthException"
  }
}
```

**Caching Logic:**
- If brand was fetched in last 6 hours → returns cached data from DB
- If `forceRefresh=true` → always fetches fresh data from Meta API
- Updates Brand model with latest metadata

**Example cURL:**
```bash
curl -X POST http://localhost:5002/api/meta/ad-library/fetch \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "pageId": "241130119248568",
    "country": "IN",
    "activeStatus": "ACTIVE",
    "limit": 25
  }'
```

---

### 2. Validate Meta Page

**Endpoint:** `GET /validate/:pageId`

**Description:** Quickly checks if a Meta page exists and has ads.

**URL Parameters:**
- `pageId` (required): Meta Page ID

**Query Parameters:**
- `country` (optional): Default "IN"

**Request:**
```http
GET /api/meta/ad-library/validate/241130119248568?country=IN
Authorization: Bearer <JWT_TOKEN>
```

**Response (Valid Page):**
```json
{
  "success": true,
  "valid": true,
  "hasAds": true,
  "pageName": "Veet India",
  "message": "Page is valid and has active ads"
}
```

**Response (Invalid Page):**
```json
{
  "success": false,
  "valid": false,
  "hasAds": false,
  "message": "Page validation failed: Page not found or no ads available"
}
```

**Example cURL:**
```bash
curl http://localhost:5002/api/meta/ad-library/validate/241130119248568 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 3. Get Stored Ads for Brand

**Endpoint:** `GET /brand/:brandId/ads`

**Description:** Retrieves stored ads for a specific brand from the database (not from Meta API).

**URL Parameters:**
- `brandId` (required): MongoDB ObjectId of the brand

**Query Parameters:**
- `limit` (optional): Number of ads to return (default: 25)
- `skip` (optional): Number of ads to skip (default: 0)
- `status` (optional): Filter by status (ACTIVE | INACTIVE | ALL)

**Request:**
```http
GET /api/meta/ad-library/brand/679987654321abcd/ads?limit=10&skip=0&status=ACTIVE
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "ads": [
    {
      "_id": "67998765abcdef123456",
      "libraryId": "1234567890",
      "brandId": "679987654321abcd",
      "pageId": "241130119248568",
      "pageName": "Veet India",
      "snapshotUrl": "https://www.facebook.com/ads/archive/render_ad/?id=1234567890",
      "platforms": ["facebook", "instagram"],
      "creativeBodies": ["Get smooth skin instantly!"],
      "status": "ACTIVE",
      "fetchedAt": "2025-01-28T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 10,
    "skip": 0,
    "hasMore": true
  },
  "brand": {
    "brand_id": "679987654321abcd",
    "brand_name": "Veet India",
    "metaPageId": "241130119248568",
    "metaPageName": "Veet India",
    "metaAdCountActive": 42,
    "metaPlatforms": ["facebook", "instagram"],
    "metaLastFetchedAt": "2025-01-28T10:30:00.000Z"
  }
}
```

**Response (Brand Not Found):**
```json
{
  "success": false,
  "message": "Brand not found"
}
```

**Response (No Ads):**
```json
{
  "success": true,
  "ads": [],
  "pagination": {
    "total": 0,
    "limit": 10,
    "skip": 0,
    "hasMore": false
  },
  "brand": { ... },
  "message": "No ads found for this brand. Try fetching from Meta API first."
}
```

**Example cURL:**
```bash
curl "http://localhost:5002/api/meta/ad-library/brand/679987654321abcd/ads?limit=10&status=ACTIVE" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### 4. Generate Meta Ad Library URL

**Endpoint:** `GET /url/:pageId`

**Description:** Generates a Meta Ad Library URL for manual viewing.

**URL Parameters:**
- `pageId` (required): Meta Page ID

**Query Parameters:**
- `country` (optional): Default "IN"

**Request:**
```http
GET /api/meta/ad-library/url/241130119248568?country=IN
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "url": "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=IN&view_all_page_id=241130119248568",
  "pageId": "241130119248568",
  "country": "IN"
}
```

**Example cURL:**
```bash
curl http://localhost:5002/api/meta/ad-library/url/241130119248568 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Data Models

### MetaAd Schema
```javascript
{
  libraryId: String,           // Unique Meta ad ID
  brandId: ObjectId,           // Reference to Brand
  pageId: String,              // Meta Page ID
  pageName: String,            // Meta Page Name
  country: String,             // Country code (e.g., "IN")
  status: String,              // ACTIVE | INACTIVE | ALL
  mediaType: String,           // IMAGE | VIDEO | CAROUSEL
  snapshotUrl: String,         // Meta's ad preview URL
  creativeBodies: [String],    // Ad copy text
  creativeLinkTitles: [String],
  creativeLinkCaptions: [String],
  creativeLinkDescriptions: [String],
  platforms: [String],         // facebook, instagram, messenger, audience_network
  adCreationTime: Date,
  adDeliveryStartTime: Date,
  adDeliveryStopTime: Date,
  fetchedAt: Date,
  lastUpdatedAt: Date
}
```

### Brand Schema (Meta Fields)
```javascript
{
  // ... existing fields ...
  
  metaPageId: String,
  metaPageName: String,
  metaAdLibraryUrl: String,
  metaAdCountActive: Number,
  metaPlatforms: [String],
  metaVerifiedSource: String,  // META_GRAPH_API | SCRAPER | MANUAL
  metaLastFetchedAt: Date,
  metaFetchStatus: String,     // success | failed | pending
  metaFetchError: String
}
```

---

## Error Codes

| HTTP Status | Error Code | Meaning | Solution |
|-------------|------------|---------|----------|
| 400 | `INVALID_PAGE_ID` | Page ID is missing or invalid | Provide a valid Meta Page ID |
| 401 | `INVALID_TOKEN` | Meta access token is invalid | Regenerate token from Graph API Explorer |
| 403 | `INSUFFICIENT_PERMISSIONS` | Token doesn't have `ads_read` | Add `ads_read` permission |
| 404 | `BRAND_NOT_FOUND` | Brand doesn't exist in DB | Create brand first |
| 429 | `RATE_LIMIT_EXCEEDED` | Too many requests to Meta API | Wait 5-10 minutes or use cached data |
| 500 | `META_API_ERROR` | Meta API returned an error | Check Meta API status |
| 500 | `DATABASE_ERROR` | Database operation failed | Check MongoDB connection |

---

## Rate Limits

### Meta API Limits
- **App-level:** ~200 calls/hour per app
- **User-level:** Varies by token type
- **Recommendation:** Use caching (6-hour default) to minimize API calls

### Aurax Backend Limits
- No rate limiting on these endpoints currently
- Consider adding rate limiting in production

---

## Testing

### Test Page IDs
```
241130119248568 - Veet India (40+ active ads)
147164935301978 - Nykaa (100+ active ads)
```

### Test Sequence
1. **Validate page:**
   ```bash
   curl GET /api/meta/ad-library/validate/241130119248568
   ```

2. **Fetch ads (first time):**
   ```bash
   curl POST /api/meta/ad-library/fetch -d '{"pageId":"241130119248568"}'
   ```

3. **Fetch ads (cached):**
   ```bash
   curl POST /api/meta/ad-library/fetch -d '{"pageId":"241130119248568"}'
   # Should return cached=true
   ```

4. **Force refresh:**
   ```bash
   curl POST /api/meta/ad-library/fetch -d '{"pageId":"241130119248568","forceRefresh":true}'
   # Should return cached=false
   ```

5. **Get stored ads:**
   ```bash
   curl GET /api/meta/ad-library/brand/<BRAND_ID>/ads?limit=10
   ```

---

## Frontend Integration

### Example: Auto Fetch Button

```javascript
const handleAutoFetch = async () => {
  try {
    const token = localStorage.getItem("token");
    
    const response = await axios.post(
      'http://localhost:5002/api/meta/ad-library/fetch',
      {
        pageId: '241130119248568',
        country: 'IN',
        activeStatus: 'ACTIVE',
        limit: 25
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    if (response.data.success) {
      const { summary, ads, cached } = response.data;
      
      console.log('Page Name:', summary.pageName);
      console.log('Active Ads:', summary.activeAdsCount);
      console.log('Platforms:', summary.platforms);
      console.log('Cached:', cached);
      console.log('Ads:', ads);
    }
  } catch (error) {
    console.error('Error:', error.response?.data?.message);
    
    // Show fallback URL if available
    if (error.response?.data?.fallbackUrl) {
      window.open(error.response.data.fallbackUrl, '_blank');
    }
  }
};
```

### Example: Show Ad Snapshot

```javascript
ads.map(ad => (
  <div key={ad.libraryId}>
    <h4>{ad.creativeBodies?.[0]}</h4>
    <p>Platforms: {ad.platforms.join(', ')}</p>
    <button onClick={() => window.open(ad.snapshotUrl, '_blank')}>
      View Ad Preview
    </button>
  </div>
))
```

---

## Security Notes

1. **Never expose Meta access token** to frontend
2. **Use JWT authentication** on all endpoints
3. **Validate user permissions** before allowing brand operations
4. **Sanitize page IDs** to prevent injection attacks
5. **Rate limit** endpoints in production

---

## Changelog

### v1.0.0 (January 28, 2025)
- ✅ Initial release
- ✅ 4 REST endpoints
- ✅ 6-hour caching
- ✅ Automatic pagination
- ✅ Error handling with fallbacks

---

**API Version:** 1.0.0  
**Meta Graph API Version:** v19.0  
**Last Updated:** January 28, 2025
