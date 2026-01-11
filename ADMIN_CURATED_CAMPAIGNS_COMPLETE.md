# 🎯 AURAX LIVE - Admin-Curated Campaigns System

## Overview

AURAX LIVE has been transformed from a user-generated marketplace to a **curated newsroom/job board model**. The AURAX team manually sources, verifies, and publishes influencer opportunities from various channels, building trust through careful curation.

---

## 🏗️ Architecture

### Database Schema (Campaign Model)

**Public Fields** (visible to creators):
- Brand info: `brandName`, `posterName`, `posterRole`, `company`, `isVerified`
- Campaign details: `title`, `intent`, `description`, `objective`, `deliverables`
- Requirements: `budget`, `platform`, `category`, `locations`, `followerRange`, etc.
- Status: `status`, `isHandPicked`

**Admin-Only Fields** (internal tracking):
```javascript
source: {
  type: String, // 'linkedin', 'instagram', 'whatsapp', 'email', 'agency', 'referral', 'manual'
  url: String,  // Source URL (LinkedIn post, IG profile)
  contactPerson: String,  // Name of person who shared
  contactMethod: String,  // Email, phone, DM
  rawText: String,  // Original campaign text before formatting
  notes: String  // Internal notes about source
},
contactVerified: {
  default: Boolean,  // Admin marks after verification
  verifiedAt: Date,  // Timestamp
  verifiedBy: ObjectId  // Reference to admin User
}
```

---

## 📡 API Endpoints

### Public API (No Auth Required)

**GET /api/public/campaigns**
- Returns live campaigns feed
- **Excludes**: `source`, `contactVerified`, `createdBy`, `moderationNotes`
- **Includes**: `isHandPicked` (public trust signal)
- Query params: `sort`, `platform`, `category`, `page`, `limit`

**GET /api/public/campaigns/:id**
- Returns single campaign detail
- Same exclusions as above

### Admin API (Auth Required - Admin Role Only)

**POST /api/admin/campaigns**
- Create new campaign with source tracking
- Requires admin authentication
- Body: All campaign fields + source info
- Returns: Full campaign object

**GET /api/admin/campaigns**
- List all campaigns with admin details
- Shows internal source info, moderation notes
- Query params: `status`, `isHandPicked`, `sourceType`, `page`, `limit`, `sort`

**GET /api/admin/campaigns/:id**
- Get single campaign with full admin details
- Includes all source and verification info

**PATCH /api/admin/campaigns/:id**
- Update campaign
- Can modify any field including source info

**DELETE /api/admin/campaigns/:id**
- Delete campaign permanently

**POST /api/admin/campaigns/:id/verify-contact**
- Mark contact as verified
- Sets `contactVerified.default = true` with timestamp

**POST /api/admin/campaigns/:id/hand-pick**
- Toggle hand-picked status
- Flips `isHandPicked` boolean

**GET /api/admin/campaigns/stats/overview**
- Dashboard stats
- Returns: total, live, hand-picked, draft counts, sources breakdown, recent campaigns

---

## 🎨 Admin UI - Campaign Curator

### Location
`src/pages/admin/CampaignCurator.jsx`

### Features

1. **Access Control**
   - Checks if user is authenticated
   - Verifies user has 'admin' role
   - Redirects non-admins to homepage

2. **Add Campaign Form**
   - **Source Information** (internal only):
     - Source type dropdown
     - Source URL input
     - Contact person name
     - Contact method (email/phone/DM)
     - Raw campaign text paste area
     - Source notes
   
   - **Brand Information**:
     - Brand name (optional)
     - Poster name (required)
     - Poster role
     - Company (required)
     - Verified brand checkbox
   
   - **Campaign Details**:
     - Title (required)
     - Intent dropdown
     - Description textarea
     - Objective
     - Deliverables (comma-separated)
   
   - **Highlights**:
     - Budget (required)
     - Platform dropdown (required)
     - Category (comma-separated)
     - Locations (comma-separated)
   
   - **Requirements**:
     - Follower range (min/max)
     - Avg views
     - Creators needed
     - Gender preference
     - Age range
     - Timeline
     - Deadline
   
   - **Admin Options**:
     - Status dropdown (live/draft/closed)
     - Hand picked checkbox
     - Contact verified checkbox
     - Moderation notes

3. **Campaign List**
   - Grid view of all campaigns
   - Shows: title, company, badges (hand-picked, verified, status)
   - Displays: platform, budget, source type, views
   - Actions: Toggle hand-picked, Delete

---

## 🔐 Authentication & Authorization

### Admin Role
- User model includes `roles` array with enum: `['creator', 'inquirer', 'admin']`
- Admin routes use `isAdmin` middleware to verify role

### Middleware (in adminCampaigns.js)
```javascript
const isAdmin = async (req, res, next) => {
  // Check if user is authenticated
  // Verify user.roles includes 'admin'
  // Reject with 403 if not admin
}
```

---

## 🚀 Setup Instructions

### 1. Backend Setup

The admin routes are already mounted in `server.js`:
```javascript
const adminCampaignsRoutes = require('./routes/adminCampaigns');
app.use('/api/admin', adminCampaignsRoutes);
```

### 2. Create Admin User

Use MongoDB shell or Compass to add admin role:
```javascript
db.users.updateOne(
  { email: "admin@aurax.com" },
  { $addToSet: { roles: "admin" } }
);
```

Or create new admin user via registration then update:
```javascript
db.users.updateOne(
  { _id: ObjectId("your-user-id") },
  { $set: { roles: ["admin"] } }
);
```

### 3. Frontend Route

Add to your router (e.g., `App.jsx` or routes file):
```javascript
import CampaignCurator from './pages/admin/CampaignCurator';

// Inside your routes
<Route path="/admin/campaigns" element={<CampaignCurator />} />
```

### 4. Test Admin Access

1. Login as admin user
2. Navigate to `/admin/campaigns`
3. Should see Campaign Curator dashboard
4. Non-admin users will be redirected

---

## 📋 Admin Workflow

### Daily Curation Process

1. **Source Discovery**
   - Browse LinkedIn for "#lookingforcreator" posts
   - Check Instagram DMs and tagged posts
   - Review WhatsApp groups for opportunities
   - Check email inbox for brand inquiries
   - Agency partner submissions
   - Referrals from network

2. **Campaign Entry**
   - Click "+ Add Campaign" in curator dashboard
   - Select source type (LinkedIn, Instagram, WhatsApp, etc.)
   - Paste source URL if available
   - Copy raw campaign text into "Raw Campaign Text" field
   - Fill in contact person details

3. **Campaign Formatting**
   - Extract and structure campaign details:
     - Brand name (or leave blank for "Available on request")
     - Poster info (name, role, company)
     - Campaign title (create engaging title if needed)
     - Intent, description, objective
     - Budget, platform, category
     - Requirements (followers, views, etc.)
   
4. **Verification**
   - Research brand/company online
   - Check if brand should be marked "Verified"
   - Check "Contact Verified" if you've confirmed legitimacy
   - Mark "Hand Picked" for premium opportunities

5. **Publishing**
   - Set status to "Live" for immediate publishing
   - Or "Draft" if needs review
   - Click "Publish Campaign"
   - Campaign appears in public feed immediately

6. **Ongoing Management**
   - Monitor campaign performance (views, click-throughs)
   - Toggle "Hand Picked" status as needed
   - Delete campaigns when filled or expired
   - Update details if brand provides changes

---

## 🎯 Trust Model Benefits

### For Creators
- **Curated Quality**: Only verified opportunities, no spam
- **Trust Signal**: "Feed by AURAX" branding builds confidence
- **Time Saving**: No need to verify legitimacy themselves
- **Clear Standards**: Consistent campaign format and details
- **No Noise**: No low-quality or fake campaigns

### For Brands
- **Reach**: AURAX promotes their opportunities to creators
- **Credibility**: Association with curated platform
- **Management**: AURAX handles initial filtering
- **Privacy**: Contact details shared only with selected creators

### For AURAX
- **Quality Control**: Manual review ensures high standards
- **Competitive Edge**: Curated content vs open marketplace
- **Data Insights**: Track which sources provide best campaigns
- **Relationships**: Build trust with brands and agencies
- **Monetization**: Premium placement for verified partners

---

## 🔍 Source Tracking Benefits

### Why Track Sources Internally?

1. **Quality Analysis**
   - Which sources provide best campaigns?
   - LinkedIn vs Instagram vs WhatsApp effectiveness
   - Agency partner performance tracking

2. **Relationship Management**
   - Know who referred which brands
   - Credit internal team members
   - Track contact person engagement

3. **Process Improvement**
   - Identify high-yield sources
   - Optimize sourcing efforts
   - Build automated scrapers for top sources

4. **Legal Protection**
   - Document original source of campaign
   - Maintain raw text for reference
   - Verify legitimacy if questioned

5. **Analytics Dashboard** (future)
   - Source conversion rates
   - Best-performing channels
   - ROI per source type

---

## 🚦 Campaign Lifecycle

```
1. SOURCING
   ↓
   LinkedIn/Instagram/WhatsApp/Email
   ↓
2. ENTRY
   ↓
   Admin pastes into curator form
   ↓
3. FORMATTING
   ↓
   Structure into standard fields
   ↓
4. VERIFICATION
   ↓
   Check brand legitimacy
   ↓
5. PUBLISHING
   ↓
   Status = "live"
   ↓
6. LIVE FEED
   ↓
   Visible to all creators
   ↓
7. ENGAGEMENT
   ↓
   Creators contact via inquiry
   ↓
8. CLOSURE
   ↓
   Status = "closed" or deleted
```

---

## 📊 Future Enhancements

### Phase 1: Current Implementation ✅
- [x] Campaign model with source tracking
- [x] Admin API endpoints
- [x] Public API filtering (hide source info)
- [x] Admin UI for campaign curation
- [x] Role-based access control

### Phase 2: Automation
- [ ] LinkedIn scraper for "#lookingforcreator" posts
- [ ] Instagram DM webhook integration
- [ ] Email parser for brand inquiries
- [ ] Auto-fill suggestions based on raw text
- [ ] Duplicate detection

### Phase 3: Analytics
- [ ] Admin dashboard with source performance
- [ ] Campaign engagement metrics
- [ ] Creator matching suggestions
- [ ] Brand satisfaction tracking
- [ ] ROI per source type

### Phase 4: Advanced Features
- [ ] Campaign approval workflow (multi-admin)
- [ ] Scheduled publishing
- [ ] Campaign expiry automation
- [ ] Notification to creators on new campaigns
- [ ] A/B testing for campaign formats

---

## 🔧 Technical Notes

### Security Considerations
1. **Admin-Only Fields**: Never exposed in public API
2. **Role Verification**: Middleware checks on every admin route
3. **Token Auth**: JWT tokens for admin sessions
4. **Input Validation**: Server-side validation on all inputs
5. **Rate Limiting**: Consider adding to prevent abuse

### Performance Optimizations
1. **Lean Queries**: Use `.lean()` for read-only data
2. **Field Selection**: Exclude heavy fields with `.select()`
3. **Pagination**: Limit results to 20 per page
4. **Indexes**: Campaign model has indexes on status, platform, category
5. **Async Updates**: View counts updated without blocking response

### Data Privacy
- Source information is **internal only**
- Contact person details never exposed to creators
- Raw text stored for internal reference only
- Moderation notes are admin-only

---

## 📝 Sample Campaign Entry

### LinkedIn Post Example

**Raw Source:**
```
Looking for tech influencers for our new SaaS product launch!

Budget: ₹75K-1.5L
Platform: Instagram + YouTube
Looking for: 50K-200K followers
Timeline: 2 weeks

DM if interested!
```

**Admin Entry:**
- Source Type: LinkedIn
- Source URL: https://linkedin.com/posts/xyz123
- Contact Person: Rahul Sharma
- Contact Method: LinkedIn DM
- Raw Text: [paste above]

**Formatted Campaign:**
- Title: "Looking for tech influencers for SaaS product launch"
- Poster Name: Rahul Sharma
- Poster Role: Marketing Manager
- Company: [research and fill]
- Budget: ₹75K-1.5L
- Platform: Instagram
- Category: Tech, SaaS
- Follower Range: 50,000 - 200,000
- Timeline: 2 weeks
- Hand Picked: ✓ (if high quality)
- Contact Verified: ✓ (if verified via DM)

---

## 🎓 Training for Admin Team

### Checklist for New Admins

- [ ] Understand "Feed by AURAX" trust model
- [ ] Know difference between public and admin-only fields
- [ ] Practice campaign formatting from raw text
- [ ] Learn brand verification process
- [ ] Understand when to mark "Hand Picked"
- [ ] Know how to use Contact Verified checkbox
- [ ] Familiar with all source types
- [ ] Can identify spam/fake campaigns
- [ ] Understand campaign lifecycle
- [ ] Know how to monitor performance

### Best Practices

1. **Always verify brand legitimacy** before publishing
2. **Use descriptive campaign titles** that attract creators
3. **Mark source information** accurately for tracking
4. **Check for duplicates** before creating new campaigns
5. **Update status promptly** when campaigns are filled
6. **Hand-pick sparingly** to maintain exclusivity signal
7. **Add moderation notes** for future reference
8. **Standardize formatting** across all campaigns
9. **Respond to creator feedback** about campaigns
10. **Review analytics** to improve sourcing strategy

---

## 📞 Support

### For Admins
- Access issues: Check user.roles includes 'admin'
- Form validation errors: Check required fields
- API errors: Check browser console and network tab

### For Developers
- Campaign model: `backend-copy/models/Campaign.js`
- Admin routes: `backend-copy/routes/adminCampaigns.js`
- Public routes: `backend-copy/routes/publicCampaigns.js`
- Admin UI: `src/pages/admin/CampaignCurator.jsx`

---

## ✅ Completion Status

**Implemented:**
- ✅ Campaign model with admin-only source tracking
- ✅ Admin API routes with authentication
- ✅ Public API filtering (hides source info)
- ✅ Campaign Curator UI component
- ✅ Role-based access control
- ✅ CRUD operations for campaigns
- ✅ Hand-picked and verification toggles
- ✅ Source type tracking

**Ready for Production:**
- Create admin users in database
- Add route in frontend router
- Test end-to-end workflow
- Train admin team on curator process
- Begin daily curation from LinkedIn/Instagram

---

## 🎉 Result

AURAX LIVE is now a **trusted, curated feed of influencer opportunities** that builds creator confidence through careful manual curation, while maintaining internal source tracking for optimization and quality control.

Creators see: "Feed by AURAX" 
Admins see: Complete sourcing and verification history

This trust-based model positions AURAX as the premier platform for discovering legitimate influencer opportunities!
