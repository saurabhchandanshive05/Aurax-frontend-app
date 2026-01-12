# 🧠 Brand Intelligence Module - Complete Setup Guide

**Version:** 1.0  
**Access Level:** Admin Only (sourabh.chandanshive@gmail.com)  
**Compliance:** Public data only, enterprise-safe, platform-compliant

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Data Sources](#data-sources)
5. [API Reference](#api-reference)
6. [Admin Dashboard](#admin-dashboard)
7. [Data Pipeline](#data-pipeline)
8. [Compliance & Legal](#compliance--legal)
9. [Production Deployment](#production-deployment)

---

## 🎯 Overview

The **Brand Intelligence Module** is a creator-led market intelligence system that discovers, analyzes, and ranks brands in India actively running high-intent Instagram ad campaigns.

### Key Features

- ✅ **Intent Scoring Engine** (0-10 scale)
- ✅ **Trend Detection** (new advertisers, scaling brands)
- ✅ **Industry Classification** (12+ verticals)
- ✅ **Spend Estimation** (4-tier bucketing)
- ✅ **Creator Partnership Tracking**
- ✅ **Time-Series Analysis** (monthly snapshots)
- ✅ **Admin Dashboard** (React UI)

### Purpose

Help Aurax identify brands that are:
- Already spending on Instagram
- Ready to convert creator influence into measurable growth
- Actively scaling ad campaigns
- Showing high purchase intent

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────┐
│              DATA INGESTION LAYER                       │
│  - Meta Ads Library API                                 │
│  - Brand Landing Page Analysis                          │
│  - Creator Disclosure Tracking                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│           NORMALIZATION ENGINE                          │
│  - Brand deduplication                                  │
│  - Industry classification                              │
│  - CTA type standardization                             │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│           INTENT SCORING ENGINE                         │
│  Signals:                                               │
│  +3 → Conversion-focused CTA                            │
│  +2 → 7+ consecutive days active                        │
│  +2 → Multiple creatives running                        │
│  +1 → Reel/Story format                                 │
│  +1 → Direct landing page                               │
│  −2 → Awareness-only messaging                          │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│       BRAND INTELLIGENCE DATABASE                       │
│  - MongoDB collection: brand_intelligence               │
│  - Time-series activity history                         │
│  - Indexed for high-performance queries                 │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│         AURAX DASHBOARD & API                           │
│  - Admin UI (React)                                     │
│  - RESTful API (Express)                                │
│  - Real-time filtering & search                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### 1. Backend Setup

**New Files Created:**
- `backend-copy/models/BrandIntelligence.js` - MongoDB schema
- `backend-copy/routes/brandIntelligence.js` - API routes
- `backend-copy/services/brandIntelligenceIngestion.js` - Data pipeline
- `backend-copy/scripts/seedBrandIntelligence.js` - Sample data

**Server Integration:**
Already mounted in `server.js`:
```javascript
const brandIntelligenceRoutes = require('./routes/brandIntelligence');
app.use('/api/brand-intelligence', brandIntelligenceRoutes);
```

**Dependencies:**
All required packages already installed:
- `mongoose` - Database ODM
- `express` - Web framework
- `axios` - HTTP client (for data ingestion)
- `cheerio` - HTML parsing (for landing page analysis)
- `uuid` - Brand ID generation

### 2. Frontend Setup

**New Files Created:**
- `src/pages/admin/BrandIntelligence.jsx` - Dashboard UI
- `src/pages/admin/BrandIntelligence.module.css` - Styles

**Route Integration:**
Add to `src/App.js`:

```jsx
import BrandIntelligenceDashboard from "./pages/admin/BrandIntelligence";

// Inside <Routes>
<Route 
  path="/admin/brand-intelligence" 
  element={<BrandIntelligenceDashboard />} 
/>
```

### 3. Database Setup

**Create Indexes:**
```bash
cd backend-copy
node -e "
const mongoose = require('mongoose');
const BrandIntelligence = require('./models/BrandIntelligence');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => BrandIntelligence.createIndexes())
  .then(() => console.log('✅ Indexes created'))
  .then(() => process.exit(0));
"
```

### 4. Seed Sample Data

```bash
cd backend-copy
node scripts/seedBrandIntelligence.js
```

**Expected Output:**
```
🌱 Starting Brand Intelligence seed...
✅ Created brand: StyleHub India (Intent: 9/10)
✅ Created brand: PayFast Digital (Intent: 10/10)
...
🎉 Brand Intelligence seed complete!
📊 Total brands seeded: 10

📈 Intent Distribution:
   High-Intent: 6
   Mid-Intent: 3
   Low-Intent: 1
```

---

## 📊 Data Sources

### Allowed Sources (Compliant)

#### 1. Meta Ads Library
- **URL:** https://www.facebook.com/ads/library
- **Access:** Public transparency data
- **Data:** Active ads, page names, ad creative text, delivery dates
- **Compliance:** ✅ Public, read-only

#### 2. Brand Landing Pages
- **Source:** Brand-owned websites
- **Data:** Page type (ecommerce, lead-gen, app), funnel depth, CTA clarity
- **Compliance:** ✅ Public, first-party

#### 3. Creator-Shared Content
- **Source:** Instagram posts with #ad/#sponsored
- **Data:** Tagged brands, collaboration signals
- **Compliance:** ✅ Public disclosure

#### 4. App Stores
- **Source:** Google Play, Apple App Store
- **Data:** App names, redirect URLs
- **Compliance:** ✅ Public metadata

### Prohibited Sources (Non-Compliant)

❌ **Personal user data**  
❌ **Private performance metrics** (CTR, CPC, ROAS)  
❌ **Scraped private endpoints**  
❌ **Leaked or inferred analytics**

---

## 🔌 API Reference

### Base URL
```
Production: https://influencer-backend-7.onrender.com/api/brand-intelligence
Development: http://localhost:5002/api/brand-intelligence
```

### Authentication
All endpoints require admin authentication:
```http
Authorization: Bearer <JWT_TOKEN>
```

### Endpoints

#### 1. Get All Brands
```http
GET /brands
```

**Query Parameters:**
| Param | Type | Values | Description |
|-------|------|--------|-------------|
| `intent` | string | `high`, `mid`, `low` | Filter by intent category |
| `industry` | string | See industries list | Filter by industry |
| `spend_bucket` | string | `very_high`, `high`, `medium`, `low` | Filter by spend |
| `is_new` | boolean | `true`, `false` | New advertisers only |
| `is_scaling` | boolean | `true`, `false` | Scaling brands only |
| `page` | number | Default: `1` | Page number |
| `limit` | number | Default: `20`, Max: `100` | Results per page |

**Example Request:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "https://influencer-backend-7.onrender.com/api/brand-intelligence/brands?intent=high&industry=Fintech&page=1"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "brand_id": "uuid-here",
      "brand_name": "PayFast Digital",
      "industry": "Fintech",
      "active_ads": 28,
      "intent_score": 10,
      "intent_category": "High-Intent",
      "estimated_spend_bucket": "very_high",
      "last_active": "2026-01-12T00:00:00.000Z",
      "is_scaling": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

#### 2. Get Trending Brands
```http
GET /brands/trending
```

Returns brands with growth signals (new advertisers or scaling).

#### 3. Get High-Intent Brands
```http
GET /brands/high-intent?industry=Fintech
```

Returns only brands with intent score 8-10.

#### 4. Get Brand Details
```http
GET /brands/:brand_id
```

Returns full brand intelligence including scoring breakdown and activity history.

#### 5. Get Statistics
```http
GET /stats
```

Returns aggregate statistics:
```json
{
  "success": true,
  "data": {
    "total_brands": 150,
    "high_intent_brands": 45,
    "active_this_week": 78,
    "new_advertisers": 12,
    "scaling_brands": 23,
    "top_industries": [...]
  }
}
```

#### 6. Create Brand (Admin)
```http
POST /brands
Content-Type: application/json

{
  "brand_name": "TechStart Pro",
  "industry": "SaaS",
  "active_ads": 5,
  "ad_formats": ["reels", "story"],
  "cta_types": ["sign_up", "book_demo"],
  "landing_page_url": "https://techstart.pro",
  "data_sources": ["meta_ads_library"]
}
```

#### 7. Update Brand Activity (Admin)
```http
PATCH /brands/:brand_id/activity
Content-Type: application/json

{
  "active_ads": 12
}
```

This automatically:
- Updates consecutive active days
- Detects scaling behavior
- Recalculates intent score
- Adds to time-series history

#### 8. Bulk Import (Admin)
```http
POST /brands/bulk-import
Content-Type: application/json

{
  "brands": [...]
}
```

---

## 🎨 Admin Dashboard

### Access
```
URL: https://[your-domain].netlify.app/admin/brand-intelligence
Auth: Admin login required
```

### Features

#### 1. Overview Tab
- **Stats Cards:** Total brands, high-intent count, active this week, new advertisers, scaling brands
- **Top Industries:** Bar chart of most active verticals
- **Trending Brands:** Preview of fastest-growing advertisers

#### 2. Brands Tab
**Filters:**
- Intent level (high/mid/low)
- Industry (12+ options)
- Spend bucket (very_high/high/medium/low)
- New advertisers (checkbox)
- Scaling fast (checkbox)

**Brand Cards Show:**
- Brand name
- Intent score badge (0-10)
- Industry
- Active ads count
- Spend bucket
- CTA types
- Status badges (NEW, SCALING)
- Last active date
- Consecutive days streak

#### 3. Trending Tab
- New advertisers (first seen <30 days)
- Scaling brands (50%+ ad increase)
- Accelerating growth velocity

#### 4. Brand Detail Modal
**Click any brand to view:**
- Full intent score breakdown
- Classification details
- Ad campaign intelligence
- Spend signals
- Landing page analysis
- Activity timeline
- Creator partnerships (if any)

### Screenshots

**Overview Dashboard:**
```
┌─────────────────────────────────────────────────────────┐
│  🧠 Brand Intelligence                       🔄 Refresh  │
│  High-Intent Instagram Advertisers · India              │
├─────────────────────────────────────────────────────────┤
│  📊 Overview  |  🏢 All Brands  |  🔥 Trending          │
├─────────────────────────────────────────────────────────┤
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐│
│  │ 🏢    │  │ 🎯    │  │ ⚡    │  │ 🆕    │  │ 📈    ││
│  │  150  │  │  45   │  │  78   │  │  12   │  │  23   ││
│  │ Total │  │ High  │  │Active │  │ New   │  │Scaling││
│  └───────┘  └───────┘  └───────┘  └───────┘  └───────┘│
│                                                         │
│  🏭 Top Industries                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │ #1  Fintech              42 brands              │   │
│  │ #2  D2C                  38 brands              │   │
│  │ #3  EdTech               25 brands              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Pipeline

### Integration Flow

#### 1. Meta Ads Library Integration

**Setup Required:**
1. Register for Meta Ads Library API: https://www.facebook.com/ads/library/api/
2. Get access token
3. Update `services/brandIntelligenceIngestion.js`:

```javascript
async ingestFromMetaAdsLibrary(searchQuery, country = "IN") {
  const response = await axios.get(
    "https://graph.facebook.com/v18.0/ads_archive",
    {
      params: {
        access_token: process.env.META_ADS_LIBRARY_TOKEN,
        search_terms: searchQuery,
        ad_reached_countries: country,
        ad_active_status: "ACTIVE",
        fields: "page_name,page_id,ad_creative_bodies,ad_delivery_start_time",
        limit: 100,
      },
    }
  );
  
  return this.parseMetaAdsData(response.data.data);
}
```

#### 2. Automated Discovery Cron Job

Create `workers/brandDiscoveryWorker.js`:

```javascript
const cron = require("node-cron");
const BrandIntelligence = require("../models/BrandIntelligence");
const ingestion = require("../services/brandIntelligenceIngestion");

// Run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  console.log("🔍 Starting brand discovery...");
  
  const industries = ["Fintech", "D2C", "EdTech", "SaaS"];
  
  for (const industry of industries) {
    try {
      const brands = await ingestion.ingestFromMetaAdsLibrary(industry, "IN");
      
      for (const brandData of brands) {
        // Create or update
        let brand = await BrandIntelligence.findOne({
          brand_name: brandData.brand_name,
        });
        
        if (brand) {
          brand.updateActivity(brandData.active_ads);
        } else {
          brand = new BrandIntelligence(brandData);
        }
        
        brand.calculateIntentScore();
        await brand.save();
      }
      
      console.log(`✅ Processed ${brands.length} brands for ${industry}`);
    } catch (error) {
      console.error(`❌ Error processing ${industry}:`, error);
    }
  }
});
```

#### 3. Manual Brand Addition

Via API:
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"brand_name":"NewBrand","industry":"Fintech",...}' \
  https://influencer-backend-7.onrender.com/api/brand-intelligence/brands
```

Via Admin UI:
- [ ] TODO: Add "Create Brand" form in dashboard

---

## ⚖️ Compliance & Legal

### Legal Boundaries (Non-Negotiable)

✅ **Allowed:**
- Public ad transparency data (Meta Ads Library)
- Brand-owned landing pages
- Creator disclosures (#ad, #sponsored)
- App store metadata

❌ **Prohibited:**
- Personal user data
- Private performance metrics (CTR, CPC, ROAS, conversion rates)
- Inferred or leaked ad analytics
- Scraped private endpoints
- Non-public brand data

### Data Retention

- **Active Brands:** Retained indefinitely
- **Inactive Brands:** Archived after 90 days of no activity
- **Blocked Brands:** Soft-deleted (is_blocked: true)

### Privacy

- **No PII:** Zero personal identifiable information collected
- **Brand-Level Only:** All data aggregated at brand level
- **Read-Only:** Intelligence ≠ analytics

### Platform Compliance

- **Meta ToS:** Compliant with Ads Library API terms
- **Instagram ToS:** Public data only, no scraping
- **India IT Act:** Data sovereignty compliant

---

## 🚀 Production Deployment

### Backend (Render)

**Environment Variables:**
```env
# Existing vars
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...

# New (optional for full pipeline)
META_ADS_LIBRARY_TOKEN=your_token_here
```

**No code changes needed** - routes already mounted!

### Frontend (Netlify)

**1. Add Route to App.js:**
```jsx
import BrandIntelligenceDashboard from "./pages/admin/BrandIntelligence";

<Route 
  path="/admin/brand-intelligence" 
  element={<BrandIntelligenceDashboard />} 
/>
```

**2. Update Admin Navigation:**
In your admin menu, add:
```jsx
<Link to="/admin/brand-intelligence">
  🧠 Brand Intelligence
</Link>
```

**3. Deploy:**
```bash
cd frontend-copy
git add .
git commit -m "feat: add Brand Intelligence module"
git push origin main
```

Netlify will auto-deploy.

### Database Migration

**Run in production:**
```bash
# SSH into Render instance or use Render shell
cd /opt/render/project/src
node scripts/seedBrandIntelligence.js
```

Or use MongoDB Compass to import sample data.

### Post-Deployment Checklist

- [ ] API accessible: `curl https://influencer-backend-7.onrender.com/api/brand-intelligence/stats`
- [ ] Admin can access: `https://[domain]/admin/brand-intelligence`
- [ ] Sample data seeded
- [ ] Indexes created
- [ ] Meta Ads Library token configured (optional)
- [ ] Monitoring alerts set up

---

## 📈 Future Enhancements

### Phase 2 (Q2 2026)
- [ ] Creator match algorithm (brands → creators)
- [ ] Email alerts for new high-intent brands
- [ ] Export to CSV/PDF
- [ ] Advanced filtering (date ranges, custom scores)
- [ ] Brand comparison view

### Phase 3 (Q3 2026)
- [ ] Real-time Meta Ads Library webhook
- [ ] Predictive spend modeling
- [ ] Industry trend reports
- [ ] API rate limiting & quotas
- [ ] Public API for verified partners

---

## 🤝 Support

**Admin Contact:**
- Email: sourabh.chandanshive@gmail.com
- Access Level: Full system access

**Documentation:**
- API Docs: `/api/brand-intelligence` (Postman collection)
- Code Comments: See model and route files

**Issues:**
- GitHub: saurabhchandanshive05/influencer-backend
- Tag: `enhancement: brand-intelligence`

---

## ✅ Quick Start Checklist

For sourabh.chandanshive@gmail.com:

1. **Backend (Already Done ✅)**
   - [x] Model created
   - [x] Routes mounted
   - [x] Services added

2. **Frontend (Action Required)**
   - [ ] Add route to App.js
   - [ ] Add nav link in admin menu
   - [ ] Deploy to Netlify

3. **Database**
   - [ ] Run seed script
   - [ ] Verify data in MongoDB

4. **Test**
   - [ ] Login as admin
   - [ ] Navigate to /admin/brand-intelligence
   - [ ] Verify dashboard loads
   - [ ] Test filters
   - [ ] View brand details

5. **Optional: Live Data**
   - [ ] Get Meta Ads Library API token
   - [ ] Update ingestion service
   - [ ] Set up cron job

---

**Module Status:** ✅ Core implementation complete  
**Ready for:** Testing & deployment  
**Next Step:** Add route to frontend App.js and deploy
