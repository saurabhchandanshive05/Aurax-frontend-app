# 🧠 AURAX INTERNAL INTELLIGENCE – Implementation Guide

## Overview

Aurax Internal Intelligence is an embedded research and outreach platform within the Brand Intelligence Admin Dashboard. It enables internal teams to discover, analyze, and verify brands actively running Instagram ads in India, supporting data-backed outreach and partnership strategies.

---

## ✅ Implementation Status: COMPLETE

### What Was Built

**Backend Enhancements:**
- ✅ Extended `BrandIntelligence` schema with 15+ new verification and research fields
- ✅ Added advanced search API with prefix matching and multi-filter support
- ✅ Created manual brand verification endpoint (queue + complete modes)
- ✅ Built research tracking API for notes, tags, and sales readiness
- ✅ Added CTA types and internal tags metadata endpoints
- ✅ Updated seed script to populate sample research data

**Frontend Enhancements:**
- ✅ Created `BrandIntelligenceEnhanced.jsx` with modern UI/UX
- ✅ Implemented advanced search with 10+ filter options
- ✅ Added activity freshness indicators (Active ≤ 12h, Recent ≤ 24h, Stale ≥ 48h)
- ✅ Built verification workflow UI with queue and status tracking
- ✅ Created research modal for internal notes and tags
- ✅ Designed sales readiness badges and confidence indicators
- ✅ Added pagination, sorting, and empty states
- ✅ Styled 400+ lines of responsive CSS

---

## 🧱 Functional Scope

### 1️⃣ Brand Search & Discovery

**Capabilities:**
- Prefix search on brand name (e.g., "Pay" matches "PayFast Digital")
- Multi-criteria filtering:
  - Industry (D2C, SaaS, Fintech, EdTech, etc.)
  - Intent score range (0-10 slider)
  - CTA type (buy_now, shop_now, install_app, etc.)
  - Activity status (Active, Recently Active, Possibly Inactive)
  - Sales readiness (Ready, Needs Research, Low Priority, Not Ready)
  - Internal tags (High Priority, Outbound Ready, etc.)
  - New advertisers / Scaling brands checkboxes

**Sorting Options:**
- Intent score (desc/asc)
- Last verified timestamp (desc/asc)
- Last active date (desc/asc)

**API Endpoint:**
```http
GET /api/brand-intelligence/brands
Query Parameters:
  - search: string (prefix)
  - intent_min: number (0-10)
  - intent_max: number (0-10)
  - industry: string
  - cta_type: string
  - activity_status: "Active" | "Recently Active" | "Possibly Inactive"
  - sales_readiness: "Ready" | "Needs Research" | "Low Priority" | "Not Ready"
  - internal_tag: string
  - is_new: boolean
  - is_scaling: boolean
  - sort: "intent_score" | "last_verified" | "last_active"
  - order: "asc" | "desc"
  - page: number
  - limit: number
```

---

### 2️⃣ Brand Intelligence View

**Enhanced Brand Cards Display:**
- Brand name + industry classification
- Intent score badge (color-coded: High=Green, Mid=Yellow, Low=Gray)
- Activity freshness label:
  - 🟢 Active (verified ≤ 12h)
  - 🟡 Recently Active (verified ≤ 24h)
  - 🟠 Possibly Inactive (verified ≥ 48h)
  - ⚪ Never Verified
- Last verified timestamp with hour precision
- Ad intelligence: Active ads, formats (Reels/Stories/Feed), consecutive days streak
- Sales readiness badge with color coding
- Confidence note (internal assessment)
- Internal tags (High Priority, Outbound Ready, etc.)
- Action buttons: View Details, Research Notes, Verify

**Data Points Per Brand:**
```typescript
{
  brand_name: string
  industry: string
  intent_score: number (0-10)
  active_ads: number
  ad_formats: string[]
  cta_types: string[]
  activity_status: "Active" | "Recently Active" | "Possibly Inactive"
  last_verified: Date
  freshness_hours: number
  freshness_label: string
  internal_notes: string
  internal_tags: string[]
  confidence_note: string
  sales_readiness: string
  verification_status: string
}
```

---

### 3️⃣ On-Demand Brand Verification

**Manual Verification Workflow:**

**Step 1: Queue Verification**
```http
POST /api/brand-intelligence/brands/:brand_id/verify
Body: { mode: "queue" }
```
- Adds verification request to internal queue
- Updates `verification_status` to "pending"
- Records timestamp and admin user ID

**Step 2: Complete Verification**
```http
POST /api/brand-intelligence/brands/:brand_id/verify
Body: {
  mode: "complete",
  active_ads: number,
  status: "verified" | "failed" | "stale",
  notes: string
}
```
- Updates `last_verified` timestamp
- Recalculates activity status based on freshness
- Recalculates intent score if ad count changed
- Appends to `verification_history` array
- Updates `verification_status` to "verified"

**Rate Limiting & Constraints:**
- Internal use only (admin-only endpoint)
- Not real-time (manual/queued workflow)
- No automated scraping or private API calls
- Uses public ad transparency signals only

**Frontend UI:**
- "🔄 Verify" button on each brand card
- Loading state while verification queues
- Success/error toast notifications
- Auto-refresh brand list after verification

---

### 4️⃣ Research & Outreach Support

**Research Modal Features:**

**Internal Notes Field:**
- Free-form textarea (500 chars)
- Use cases:
  - Contact information (email, phone, LinkedIn)
  - Outreach attempts log (dates, channels, responses)
  - Decision-maker names
  - Budget insights
  - Competitive intel

**Internal Tags (Multi-Select):**
- High Priority
- Outbound Ready
- Contacted
- Follow Up
- Pending Response
- Qualified Lead
- Not Interested
- Wrong Fit
- Partner Potential
- Watch List

**Confidence Note:**
- Short assessment of data quality
- Examples:
  - "Strong signals: conversion CTAs, daily creative refresh"
  - "Limited budget signals, awareness-focused"
  - "High engagement on recent posts"

**Sales Readiness:**
- 🟢 Ready (intent ≥8, active ads, conversion CTAs)
- 🟡 Needs Research (intent 5-7, requires verification)
- ⚪ Low Priority (intent <5, awareness campaigns)
- 🔴 Not Ready (inactive, blocked, or irrelevant)

**API Endpoint:**
```http
PATCH /api/brand-intelligence/brands/:brand_id/research
Body: {
  internal_notes: string,
  internal_tags: string[],
  confidence_note: string,
  sales_readiness: "Ready" | "Needs Research" | "Low Priority" | "Not Ready"
}
```

---

## 🧠 Copilot Behavior (Compliance)

**Language Guidelines:**

✅ **Use:**
- "Verified X hours ago"
- "Recently active advertiser"
- "High-intent brand signals detected"
- "Estimated from public data"
- "Based on ad transparency signals"

❌ **Never Claim:**
- Real-time ad tracking
- Exact spend amounts (CPC, CTR, ROAS, CAC)
- Private performance metrics
- Unauthorized data sources
- Scraped personal data

**Data Sources (Public & Compliant):**
- Meta Ads Library (public transparency portal)
- Brand-owned landing pages (publicly accessible URLs)
- Creator-shared sponsored content (#ad disclosures on Instagram)
- App store listings (download counts, ratings)
- Manual curation by admins

---

## 🔐 Access & Safety

**Authentication:**
- Admin-only access (`sourabh.chandanshive@gmail.com`)
- JWT token required for all API calls
- Role check: `user.roles.includes('admin') || user.role === 'admin'`

**Data Privacy:**
- ❌ No personal user data ingestion
- ❌ No creator performance metrics
- ✅ Read-only brand intelligence
- ✅ All actions logged with user ID and timestamp

**Audit Trail:**
- `verification_history` array tracks all verifications
- `verified_by` field references admin User ID
- `curated_by` field for brand creation
- Timestamps: `last_verified`, `createdAt`, `updatedAt`

---

## 🧩 Internal Positioning

**Team Communication:**
> "Aurax Internal Intelligence helps our team identify brands already investing in Instagram advertising, so outreach, creator matching, and partnerships are faster and more targeted."

**Use Cases:**
1. **Sales Team:** Prioritize high-intent brands for outbound calls
2. **Strategy Team:** Track advertiser momentum across industries
3. **Partnerships:** Identify scaling brands for creator collaborations
4. **Compliance:** Ensure data boundaries and public-only sources

---

## 📊 Database Schema Changes

### New Fields Added to `BrandIntelligence` Model

```javascript
// Verification & Freshness
last_verified: Date (indexed)
verification_status: enum ["pending", "verified", "failed", "stale"]
activity_status: enum ["Active", "Recently Active", "Possibly Inactive"]
freshness_hours: Number

// Internal Research
internal_notes: String (500 chars)
internal_tags: Array<String> (enum: 10 values)
confidence_note: String (200 chars)
sales_readiness: enum ["Ready", "Needs Research", "Low Priority", "Not Ready"]

// Verification History
verification_history: [{
  verified_at: Date,
  verified_by: ObjectId (ref: User),
  status: String,
  active_ads_found: Number,
  notes: String
}]
```

### New Indexes
```javascript
brandIntelligenceSchema.index({ last_verified: -1 });
brandIntelligenceSchema.index({ activity_status: 1, intent_score: -1 });
brandIntelligenceSchema.index({ sales_readiness: 1, last_verified: -1 });
brandIntelligenceSchema.index({ internal_tags: 1 });
```

---

## 🚀 API Endpoints Reference

### Brand Search (Enhanced)
```http
GET /api/brand-intelligence/brands
Headers: Authorization: Bearer <token>
Query: see "Brand Search & Discovery" section
Response: {
  success: true,
  data: Brand[],
  pagination: { page, limit, total, pages },
  filters_applied: { ... },
  sort: { field, order }
}
```

### Brand Verification
```http
POST /api/brand-intelligence/brands/:brand_id/verify
Headers: Authorization: Bearer <token>
Body: {
  mode: "queue" | "complete",
  active_ads?: number,
  status?: "verified" | "failed" | "stale",
  notes?: string
}
Response: {
  success: true,
  message: string,
  data: { brand_id, brand_name, verification_status, ... }
}
```

### Research Data Update
```http
PATCH /api/brand-intelligence/brands/:brand_id/research
Headers: Authorization: Bearer <token>
Body: {
  internal_notes?: string,
  internal_tags?: string[],
  confidence_note?: string,
  sales_readiness?: string
}
Response: {
  success: true,
  message: "Research data updated successfully",
  data: { brand_id, brand_name, internal_notes, ... }
}
```

### Verification History
```http
GET /api/brand-intelligence/brands/:brand_id/verification-history
Headers: Authorization: Bearer <token>
Response: {
  success: true,
  data: {
    brand_id, brand_name,
    verification_history: [{
      verified_at, verified_by: { username, email },
      status, active_ads_found, notes
    }]
  }
}
```

### Metadata Endpoints
```http
GET /api/brand-intelligence/cta-types
GET /api/brand-intelligence/internal-tags
Response: { success: true, data: string[] }
```

---

## 🎨 Frontend Components

### File Structure
```
src/pages/admin/
├── BrandIntelligenceEnhanced.jsx  (1000+ lines, main component)
└── BrandIntelligence.module.css   (1000+ lines, enhanced styles)
```

### Key UI Sections

**1. Header**
- Title: "🧠 Aurax Internal Intelligence"
- Subtitle: "High-Intent Instagram Advertisers · Research & Outreach Support"
- Refresh button

**2. Tabs**
- 📊 Overview (stats + positioning statement + top industries)
- 🔍 Search & Discover (enhanced filters + brand cards)
- 🔥 High-Growth Signals (trending brands)

**3. Search Bar**
- Prefix search input with 🔍 icon
- Real-time filtering as user types

**4. Advanced Filters (2 Rows)**
- Row 1: Industry, Activity Status, CTA Type, Sales Readiness, Internal Tag
- Row 2: Intent Range (Min-Max), Sort By, Sort Order, New Advertisers, Scaling Fast

**5. Enhanced Brand Cards**
- Brand header (name, industry, intent badge)
- Freshness indicator (color-coded status + last verified time)
- Ad intelligence (active ads, formats, streak)
- Sales readiness badge + confidence note
- Internal tags (chip badges)
- Action buttons (View Details, Research Notes, Verify)

**6. Research Modal**
- Internal notes textarea (500 chars)
- Internal tags (10 checkboxes in 2-column grid)
- Confidence note input
- Sales readiness dropdown
- Cancel / Save buttons

**7. Brand Detail Modal**
- Intent score (large badge)
- Activity status + verification info
- Classification (industry, country, Instagram handle)
- Ad campaign intelligence (formats, CTAs, consecutive days)
- Internal research summary
- Spend signals + growth velocity
- Activity timeline

---

## 📱 Mobile Responsiveness

**Breakpoint: 768px**

**Desktop (≥768px):**
- Sidebar: Fixed left, 280px width
- Main content: margin-left 280px
- Filters: 2 rows of horizontal fields
- Brand cards: Grid layout (2-3 columns)
- Modals: 800px max width, centered

**Mobile (<768px):**
- Sidebar: Relative positioning, horizontal layout below navbar
- Main content: Full width, margin-left 0
- Filters: Stacked vertically, full width
- Brand cards: Single column, full width
- Action buttons: Stacked vertically
- Tag selector: Single column grid
- Modals: Full width, reduced padding

---

## 🧪 Testing Guide

### Test the Enhanced Dashboard

1. **Start Backend:**
   ```bash
   cd backend-copy
   npm start
   # Backend runs on http://localhost:5002
   ```

2. **Start Frontend:**
   ```bash
   npm start
   # Frontend runs on http://localhost:3000
   ```

3. **Login as Admin:**
   - Email: `sourabh.chandanshive@gmail.com`
   - Password: (your admin password)
   - Auto-redirect to `/admin/brand-intelligence`

4. **Test Search & Filters:**
   - Search: Type "Pay" → Should show "PayFast Digital"
   - Filter: Select "Fintech" industry
   - Filter: Activity status "Active"
   - Filter: Intent range 8-10
   - Verify results update in real-time

5. **Test Brand Cards:**
   - Check freshness indicators (green/yellow/orange dots)
   - Verify "Last verified" timestamp shows recent times
   - Check sales readiness badges display correctly
   - View internal tags on high-intent brands

6. **Test Verification:**
   - Click "🔄 Verify" on any brand
   - Should see loading state ("⏳")
   - Success toast: "Verification queued successfully"
   - Brand list auto-refreshes

7. **Test Research Modal:**
   - Click "✏️ Research Notes" on any brand
   - Add internal notes (free text)
   - Select 2-3 internal tags
   - Add confidence note
   - Change sales readiness
   - Click "💾 Save Research Data"
   - Success toast: "Research data saved successfully"
   - Close modal and verify tags appear on card

8. **Test Detail Modal:**
   - Click "📋 View Details" on any brand
   - Verify all sections display:
     - Intent score, activity status
     - Classification, ad intelligence
     - Internal research summary
     - Spend signals, timeline
   - Close modal (X button or click outside)

9. **Test Pagination:**
   - If >20 brands: Verify pagination controls appear
   - Click "Next →" → Should load page 2
   - Click "← Previous" → Should return to page 1

10. **Test Mobile View:**
    - Resize browser to <768px width
    - Sidebar becomes horizontal
    - Filters stack vertically
    - Brand cards full width
    - Action buttons stack vertically
    - Verify all interactions still work

---

## 📈 Success Criteria

This integration is successful when:

✅ **Discovery:** Internal teams can find high-intent brands in <2 minutes using search/filters  
✅ **Analysis:** Brand cards display freshness indicators and sales readiness at a glance  
✅ **Verification:** Manual verification workflow updates brand status within 30 seconds  
✅ **Research:** Teams can add notes/tags and track outreach status per brand  
✅ **Compliance:** All data sourced from public transparency signals only  
✅ **Performance:** Search returns results in <500ms with pagination  
✅ **Mobile:** Full feature parity on tablets and smartphones  

---

## 🔄 Deployment Checklist

### Backend
- [x] Schema changes deployed to MongoDB Atlas
- [x] New indexes created on `last_verified`, `activity_status`, `internal_tags`
- [x] API routes tested with Postman/curl
- [x] Admin middleware enforces `sourabh.chandanshive@gmail.com` only
- [x] Database seeded with sample research data (10 brands)
- [ ] Deploy to production (Render.com or Heroku)
- [ ] Run seed script on production database
- [ ] Verify CORS allows production frontend domain

### Frontend
- [x] `BrandIntelligenceEnhanced.jsx` routes to `/admin/brand-intelligence`
- [x] Lazy loading in `App.js` updated
- [x] CSS module styles compiled and responsive
- [x] All API calls use correct backend URL (env variable)
- [x] Success/error toast notifications working
- [ ] Build production bundle (`npm run build`)
- [ ] Deploy to Netlify/Vercel
- [ ] Test on real mobile devices (iOS Safari, Android Chrome)

### Documentation
- [x] This implementation guide (AURAX_INTERNAL_INTELLIGENCE_GUIDE.md)
- [x] API endpoint documentation
- [x] Frontend component architecture
- [x] Database schema changes documented
- [ ] Add to main README.md
- [ ] Create video demo/walkthrough
- [ ] Internal team training session

---

## 🐛 Known Issues & Future Enhancements

### Known Issues
- None currently reported

### Future Enhancements
1. **Export to CSV:** Allow admins to export filtered brand lists
2. **Bulk Actions:** Select multiple brands and apply tags/readiness
3. **Activity Charts:** Visualize ad spend trends over time (monthly snapshots)
4. **Email Alerts:** Notify when high-intent brands go inactive (≥7 days)
5. **CRM Integration:** Sync internal notes with Salesforce/HubSpot
6. **Verification Scheduling:** Automated daily verification for "High Priority" tags
7. **Collaboration:** Multi-user comments/threads per brand
8. **Machine Learning:** Auto-suggest sales readiness based on historical patterns

---

## 📞 Support

**Questions or Issues?**
- Email: `sourabh.chandanshive@gmail.com`
- Internal Slack: `#aurax-internal-intelligence`
- GitHub: Open issue in `Aurax-frontend-app` repo

---

**Document Version:** 1.0.0  
**Last Updated:** January 12, 2026  
**Author:** Aurax Engineering Team
