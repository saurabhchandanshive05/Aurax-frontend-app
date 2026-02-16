# 🏗️ Meta Graph API Integration - Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AURAX PLATFORM                                 │
│                     Meta Graph API Integration v1.0                      │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│                         (React on Port 3000)                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST
                                    │ /api/meta/ad-library/fetch
                                    │ + JWT Token
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              BACKEND                                     │
│                    (Node.js + Express on Port 5002)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    API Routes Layer                              │   │
│  │              (routes/metaAdLibrary.js)                          │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │  1. POST /api/meta/ad-library/fetch                             │   │
│  │     ├─ authMiddleware (JWT validation)                          │   │
│  │     ├─ Check cache (6 hours)                                    │   │
│  │     ├─ If cached → query MongoDB                                │   │
│  │     └─ If not cached → call metaAdsArchiveService               │   │
│  │                                                                   │   │
│  │  2. GET /api/meta/ad-library/validate/:pageId                   │   │
│  │     └─ Quick page validation via Meta API                       │   │
│  │                                                                   │   │
│  │  3. GET /api/meta/ad-library/brand/:brandId/ads                 │   │
│  │     └─ Query stored ads from MongoDB                            │   │
│  │                                                                   │   │
│  │  4. GET /api/meta/ad-library/url/:pageId                        │   │
│  │     └─ Generate Meta Ad Library URL                             │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Service Layer                                 │   │
│  │          (services/metaAdsArchive.js)                           │   │
│  ├─────────────────────────────────────────────────────────────────┤   │
│  │                                                                   │   │
│  │  fetchAds(pageId, country, activeStatus, limit, maxPages)      │   │
│  │  ├─ Build API request                                           │   │
│  │  ├─ Loop through pages (automatic pagination)                   │   │
│  │  ├─ Aggregate platforms from all ads                            │   │
│  │  ├─ Handle errors (401, 403, 429, 500)                          │   │
│  │  └─ Return {success, summary, ads}                              │   │
│  │                                                                   │   │
│  │  validatePage(pageId, country)                                  │   │
│  │  └─ Quick check if page exists                                  │   │
│  │                                                                   │   │
│  │  getAdLibraryUrl(pageId, country)                               │   │
│  │  └─ Generate fallback URL                                       │   │
│  │                                                                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│                                    │ HTTPS Request                       │
│                                    ▼                                     │
└─────────────────────────────────────────────────────────────────────────┘

                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                    │
                  ▼                                    ▼
┌──────────────────────────────────┐   ┌──────────────────────────────────┐
│       META GRAPH API             │   │         MONGODB                  │
│    (graph.facebook.com)          │   │     (localhost:27017)            │
├──────────────────────────────────┤   ├──────────────────────────────────┤
│                                  │   │                                  │
│  GET /v19.0/ads_archive          │   │  Collections:                    │
│                                  │   │  ┌────────────────────────────┐ │
│  Parameters:                     │   │  │  brands                    │ │
│  • search_page_ids               │   │  │  ├─ metaPageId (indexed)  │ │
│  • ad_reached_countries          │   │  │  ├─ metaPageName          │ │
│  • ad_active_status              │   │  │  ├─ metaAdCountActive     │ │
│  • limit (max 100)               │   │  │  ├─ metaPlatforms          │ │
│  • fields (20+ fields)           │   │  │  ├─ metaVerifiedSource    │ │
│  • access_token (required)       │   │  │  ├─ metaLastFetchedAt     │ │
│                                  │   │  │  └─ metaFetchStatus        │ │
│  Response:                       │   │  └────────────────────────────┘ │
│  {                               │   │                                  │
│    "data": [                     │   │  ┌────────────────────────────┐ │
│      {                           │   │  │  metaads                   │ │
│        "id": "1234567890",       │   │  │  ├─ libraryId (unique)    │ │
│        "page_id": "...",         │   │  │  ├─ brandId (ref)         │ │
│        "page_name": "...",       │   │  │  ├─ pageId (indexed)      │ │
│        "ad_snapshot_url": "...", │   │  │  ├─ snapshotUrl           │ │
│        "platforms": [...],       │   │  │  ├─ platforms             │ │
│        ...                       │   │  │  ├─ creativeBodies         │ │
│      }                           │   │  │  ├─ adDeliveryStartTime    │ │
│    ],                            │   │  │  └─ fetchedAt (indexed)    │ │
│    "paging": {                   │   │  └────────────────────────────┘ │
│      "next": "..."               │   │                                  │
│    }                             │   │  Indexes:                        │
│  }                               │   │  • libraryId (unique)            │
│                                  │   │  • pageId + status (compound)    │
│  Rate Limits:                    │   │  • brandId + status (compound)   │
│  • 200 calls/hour (app-level)    │   │  • fetchedAt (desc)              │
│                                  │   │                                  │
└──────────────────────────────────┘   └──────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                          DATA FLOW                                       │
└─────────────────────────────────────────────────────────────────────────┘

1. USER ACTION
   └─> Enters Meta Page ID in frontend form
   └─> Clicks "Auto Fetch using Meta Graph API"

2. FRONTEND REQUEST
   └─> POST /api/meta/ad-library/fetch
   └─> Body: {pageId, country, activeStatus, limit}
   └─> Header: Authorization Bearer JWT

3. BACKEND PROCESSING
   └─> Validate JWT token
   └─> Check if brand exists in DB
   └─> Check if data fetched in last 6 hours
       ├─> YES (cached)
       │   └─> Query MetaAd collection
       │   └─> Return cached ads
       │
       └─> NO (fresh fetch)
           └─> Call metaAdsArchiveService.fetchAds()
           └─> Fetch from Meta Graph API
           └─> Loop through all pages (pagination)
           └─> Aggregate platforms
           └─> Bulk upsert to MetaAd collection
           └─> Update Brand model
           └─> Return fresh ads

4. META GRAPH API
   └─> Validates access token
   └─> Checks permissions (ads_read)
   └─> Fetches ads for given page ID
   └─> Returns paginated results
   └─> Includes paging.next for pagination

5. DATABASE STORAGE
   └─> MetaAd.bulkUpsert(ads) - efficient bulk operation
   └─> Brand.findOneAndUpdate() - update meta fields
   └─> Sets metaVerifiedSource = 'META_GRAPH_API'
   └─> Sets metaLastFetchedAt = now
   └─> Sets metaFetchStatus = 'success'

6. FRONTEND RESPONSE
   └─> Receives {success, summary, ads, cached}
   └─> Auto-populates form fields
       ├─ brand_name = summary.pageName
       ├─ meta_page_name = summary.pageName
       ├─ active_ads_count = summary.activeAdsCount
       ├─ ad_formats = formatted platforms
       └─ meta_ads_library_url = generated URL
   └─> Shows success message (with cache status)


┌─────────────────────────────────────────────────────────────────────────┐
│                       CACHING STRATEGY                                   │
└─────────────────────────────────────────────────────────────────────────┘

Fetch Request
     │
     ▼
Check Brand.metaLastFetchedAt
     │
     ├─> NULL or > 6 hours ago
     │   ├─> Fetch from Meta API
     │   ├─> Store in MetaAd collection
     │   ├─> Update Brand.metaLastFetchedAt
     │   └─> Return {cached: false}
     │
     └─> < 6 hours ago
         ├─> Query MetaAd collection
         ├─> Return stored ads
         └─> Return {cached: true}

Force Refresh (forceRefresh=true)
     │
     └─> Always fetch from Meta API
         └─> Bypass cache entirely


┌─────────────────────────────────────────────────────────────────────────┐
│                       ERROR HANDLING FLOW                                │
└─────────────────────────────────────────────────────────────────────────┘

Meta API Call
     │
     ├─> 200 OK
     │   └─> Success → Store in DB
     │
     ├─> 400 Bad Request
     │   └─> Invalid page ID → Return error
     │
     ├─> 401 Unauthorized
     │   └─> Invalid token → Ask user to regenerate
     │
     ├─> 403 Forbidden
     │   └─> Missing permissions → Ask user to add ads_read
     │
     ├─> 429 Rate Limit
     │   └─> Too many requests → Return cached data or ask to wait
     │
     ├─> 500 Internal Error
     │   └─> Meta API issue → Return fallback URL
     │
     └─> Timeout / Network Error
         └─> Retry once → If fails, return fallback URL

For ALL errors:
     └─> Update Brand.metaFetchStatus = 'failed'
     └─> Store error in Brand.metaFetchError
     └─> Return fallback Ad Library URL
     └─> User can open manually


┌─────────────────────────────────────────────────────────────────────────┐
│                     TECHNOLOGY STACK                                     │
└─────────────────────────────────────────────────────────────────────────┘

Frontend:
  • React 18
  • Axios (HTTP client)
  • CSS Modules

Backend:
  • Node.js v22
  • Express 4.x
  • JWT (jsonwebtoken)
  • Mongoose 8.x

Database:
  • MongoDB 7.x
  • Collections: brands, metaads

External APIs:
  • Meta Graph API v19.0
  • Endpoint: /ads_archive

Security:
  • JWT authentication
  • Environment variables (.env)
  • Input validation
  • Error sanitization


┌─────────────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE METRICS                                   │
└─────────────────────────────────────────────────────────────────────────┘

Typical Response Times:
  • Cached fetch: 50-200ms (DB query only)
  • Fresh fetch (25 ads): 2-5 seconds (Meta API + DB write)
  • Fresh fetch (100 ads): 8-15 seconds (4 pages × 2-3s each)
  • Fresh fetch (500 ads): 30-60 seconds (20 pages × 2-3s each)

Database Operations:
  • bulkUpsert (100 ads): ~500ms
  • Single ad query: ~10ms
  • Brand update: ~20ms

Meta API:
  • Single page (25 ads): ~1-2 seconds
  • Rate limit: 200 calls/hour
  • Timeout: 30 seconds

Caching:
  • Cache duration: 6 hours
  • Reduces API calls by ~95%
  • Improves response time by 10-20x
