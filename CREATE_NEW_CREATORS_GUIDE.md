# 📋 Guide: Creating New Creator Records via Dashboard

**Status**: ✅ Complete & Verified  
**Date**: February 1, 2026  
**Method**: Manual creation via "+ Create New Creator" button  

---

## Overview

This guide explains how to create new creator records using the existing Creator Intelligence dashboard. The "+ Create New Creator" functionality provides a complete form to add creators with all supported fields.

**What You Get:**
- ✅ Web UI form for manual creator creation
- ✅ Complete field mapping to MongoDB schema
- ✅ Automatic audit trail (admin ID, timestamp)
- ✅ Real-time dashboard integration
- ✅ No duplicates (search by Instagram handle)
- ✅ Full validation and error handling

---

## How to Use the Dashboard

### Step 1: Access Creator Database
```
1. Go to Admin Dashboard
2. Click "Creator Database" (left sidebar)
3. You'll see the Creator Intelligence page
```

### Step 2: Click "Create New Creator"
```
On the Creator List page:
- Look for the PURPLE button "+ Create New Creator"
- Click it to open the creation form
```

### Step 3: Fill in the Form
The form is organized into sections. Each section contains related fields:

#### 📝 Basic Information (Required)
```
- Creator Name *         → What the creator is called
- Display Name           → Public display name (defaults to Creator Name)
- Category               → Fashion, Beauty, Lifestyle, Food, Travel, Fitness, Tech, etc.
- Priority               → High, Medium, Low
- City                   → Where they're based (e.g., Mumbai)
- Location               → Full location (e.g., Mumbai, India)
- Bio                    → Short description of the creator
```

#### 📱 Social Media Handles (At least Instagram required)
```
- Instagram Handle *     → Username without @
- YouTube Channel        → Channel name
- TikTok                 → Username
- Facebook               → Page name
- Twitter/X              → Username
```

#### 📊 Social Media Stats
```
- Followers              → Number of Instagram followers
- Following              → Number of accounts they follow
- Posts                  → Total posts count
- Avg Reel Views         → Average views per reel
- Engagement Rate (%)    → Engagement percentage (e.g., 8.2)
- Profile Picture URL    → Link to profile picture image
```

#### 📞 Contact Information
```
- Business Email         → creator@example.com
- Phone Number           → +91 XXXXX XXXXX
- WhatsApp Number        → +91 XXXXX XXXXX
- Website URL            → https://example.com
- Media Kit Link         → PDF or document link
```

#### 🏢 Management Details
```
- Management Type        → Self-Managed, Agency Managed, or Unknown
- Management Handle      → @agencyname (if applicable)
- Manager Name           → Person's name
- Manager Contact        → Email or phone
```

#### 🎨 Content Details
```
- Primary Niche          → Main content category
- Secondary Niche        → Secondary content category
- Languages              → Comma-separated (English, Hindi, Tamil)
- Content Formats        → Comma-separated (Reels, Stories, Posts, IGTV)
```

#### 💰 Pricing (INR - Indian Rupees)
```
- Story Rate             → Price per Instagram Story
- Reel Rate              → Price per Instagram Reel
- Post Rate              → Price per Instagram Post
```

#### ⚙️ Status & Controls
```
- Onboarding Status      → New, Pending, In Review, Approved, Rejected
- Verified Contact       → Checkbox (is contact verified?)
- Available for PR       → Checkbox (available for PR campaigns?)
- Available for Paid     → Checkbox (available for paid campaigns?)
- Allow Campaigns        → Checkbox (can participate in campaigns?)
```

#### 📋 Admin Notes
```
- Text area for internal notes
- Not visible to creators
- Use for internal communication
```

### Step 4: Submit the Form
```
Click "✓ Create Creator Profile" button
- Form validates
- Creator is saved to database
- Success message appears
- Modal closes
- New creator appears in the list!
```

---

## Required vs Optional Fields

### REQUIRED (Must Fill)
- **Creator Name** - The creator's name
- **Instagram Handle** - At least one social media account (Instagram is primary)

### RECOMMENDED (Should Fill)
- Category
- Location / City
- Followers
- Email
- At least one pricing field

### OPTIONAL (Can Leave Empty)
- Display Name (defaults to Creator Name)
- Bio
- Other social handles (YouTube, TikTok, etc.)
- Media Kit URL
- Admin Notes

---

## Field Mapping to Database

When you create a creator via the dashboard form, here's how it maps to the database:

```
FORM FIELD                    DATABASE FIELD
Creator Name              →   name *
Display Name              →   displayName
Category                  →   category
Priority                  →   priority
City                      →   city
Location                  →   location
Bio                       →   bio

Instagram Handle          →   socials.instagram *
YouTube Channel           →   socials.youtube
TikTok                    →   socials.tiktok
Facebook                  →   socials.facebook
Twitter/X                 →   socials.twitter

Followers                 →   followers
Following                 →   followingCount
Posts                     →   postCount
Avg Reel Views            →   avgReelViews
Engagement Rate           →   engagementRate
Profile Picture URL       →   profilePictureUrl

Business Email            →   email
Phone Number              →   phone
WhatsApp Number           →   whatsappNumber
Website URL               →   websiteUrl
Media Kit Link            →   mediaKitLink

Management Type           →   managementType
Management Handle         →   managementHandle
Manager Name              →   managerName
Manager Contact           →   managerContact

Primary Niche             →   primaryNiche
Secondary Niche           →   secondaryNiche
Languages                 →   languages (array)
Content Formats           →   contentFormats (array)

Story Rate                →   rateStory
Reel Rate                 →   rateReel
Post Rate                 →   ratePost

Onboarding Status         →   onboardingStatus
Verified Contact          →   verifiedContact
Available for PR           →   availableForPR
Available for Paid         →   availableForPaid
Allow Campaigns            →   allowCampaigns

Admin Notes               →   adminNotes
```

---

## Automatic Fields (Set by System)

When you create a creator, these fields are **automatically** set:

```javascript
{
  source: 'MANUAL',                          // Creation method
  importedFrom: 'ADMIN_DASHBOARD',           // Where created from
  createdBy: <YOUR_ADMIN_ID>,                // Your admin user ID
  createdAt: <CURRENT_TIMESTAMP>,            // Creation time
  updatedAt: <CURRENT_TIMESTAMP>,            // Last updated time
  
  profileLink: 'https://instagram.com/...',  // Auto-generated from Instagram
  tags: [category.toLowerCase()]             // Auto-tagged with category
}
```

### Audit Trail
```
- createdBy          → Admin user who created it (tracked)
- createdAt          → When it was created (tracked)
- lastModifiedBy     → Last admin who modified it
- lastModifiedAt     → When it was last modified
```

These fields are **immutable** - they can't be changed and provide a complete audit history.

---

## Example: Creating a Fashion Creator

Let's say you want to add a fashion influencer. Here's how to fill the form:

```
📝 BASIC INFORMATION
- Creator Name:      Priya Sharma
- Display Name:      @priyastyle
- Category:          Fashion
- Priority:          High
- City:              Mumbai
- Location:          Mumbai, India
- Bio:               Fashion blogger & styling enthusiast. Curating style for every occasion!

📱 SOCIAL MEDIA
- Instagram Handle:  priyastyle
- YouTube Channel:   Priya Sharma Vlogs
- TikTok:            priyastyle
- Facebook:          Priya Style Official
- Twitter/X:         @priyastyle

📊 STATS
- Followers:         450000
- Following:         2150
- Posts:             1250
- Avg Reel Views:    28500
- Engagement Rate:   6.8
- Profile Picture:   https://example.com/priya.jpg

📞 CONTACT
- Business Email:    priya@example.com
- Phone:             +91 XXXXX XXXXX
- WhatsApp:          +91 XXXXX XXXXX
- Website:           https://priyastyle.com
- Media Kit:         https://priyastyle.com/mediakit.pdf

🏢 MANAGEMENT
- Management Type:   Agency Managed
- Management Handle: @styleagency
- Manager Name:      Rajesh Kumar
- Manager Contact:   rajesh@styleagency.com

🎨 CONTENT
- Primary Niche:     Fashion & Styling
- Secondary Niche:   Lifestyle
- Languages:         English, Hindi
- Content Formats:   Reels, Stories, Posts, IGTV

💰 PRICING
- Story Rate:        ₹8,000
- Reel Rate:         ₹18,000
- Post Rate:         ₹12,000

⚙️ STATUS
- Onboarding:        Approved
- Verified Contact:  ✓ Checked
- Available PR:      ✓ Checked
- Available Paid:    ✓ Checked
- Allow Campaigns:   ✓ Checked

📋 NOTES
"Top fashion influencer in Mumbai market. Great engagement rates. Preferred for luxury brands."
```

**After clicking "Create":**
- ✅ Priya Sharma appears in Creator List
- ✅ All fields visible in profile
- ✅ Can be searched and filtered
- ✅ Can be assigned to campaigns
- ✅ Audit trail shows created by you on Feb 1, 2026

---

## Verifying Creator Was Created

### In Dashboard
```
1. Go to Creator Database
2. Search for the creator's name in the search bar
3. Creator should appear in the list
4. Click on creator to see full profile
5. Verify all fields are correct
```

### Field Visibility
When you click on a creator, you'll see all sections:
- ✅ Profile header with name and stats
- ✅ Social media presence
- ✅ Contact details
- ✅ Pricing information
- ✅ Content details
- ✅ Management info
- ✅ Admin notes

### Profile Link
```
Each creator profile has:
- Creator name and display name
- Profile picture (if provided)
- Bio
- Location and city
- All social media handles (clickable to Instagram, YouTube, etc.)
- Follower count
- Email and phone (admin-only view)
```

---

## Common Issues & Solutions

### Issue: "Creator Name is Required"
**Solution:** Fill in the Creator Name field - it cannot be empty

### Issue: "Instagram Handle is Required"
**Solution:** At least one social media handle (Instagram) is required

### Issue: Creator Not Appearing in List
**Solution:** 
1. Refresh the page (F5)
2. Clear filters if any
3. Search by creator name
4. Check admin permissions

### Issue: Numbers Not Saving Correctly
**Solution:** 
- For followers/posts: Enter as plain numbers (e.g., 450000, not 450K)
- For engagement: Use decimal (e.g., 6.8 for 6.8%)
- For pricing: Use full rupee amount (e.g., 8000, not 8K)

### Issue: Email Not Updating
**Solution:**
- Make sure you're using a valid email format
- Email is optional but recommended

### Issue: "Email Already Exists"
**Solution:**
- Creator with that email already in database
- Use different email or leave blank if duplicate

---

## Best Practices

### 1. Complete All Important Fields
```
Always fill:
✓ Creator Name
✓ Instagram Handle
✓ Category
✓ Followers count
✓ Email
✓ Location
✓ At least one pricing field
```

### 2. Use Consistent Formatting
```
Social Handles:
✗ @priyastyle (with @)
✓ priyastyle (without @)

Emails:
✗ Priya@EXAMPLE.COM
✓ priya@example.com

Phone:
✗ XXXXXXXXXX
✓ +91 XXXXX XXXXX
```

### 3. Add Descriptive Bio
```
✗ "Fashion"
✓ "Fashion blogger & styling enthusiast. Curating style for every occasion!"

✗ ""
✓ "Luxury lifestyle content creator based in Mumbai"
```

### 4. Set Correct Management Type
```
If self-managing:    SELF_MANAGED
If has agency:       AGENCY_MANAGED
If unknown:          UNKNOWN (don't guess)
```

### 5. Categories to Use
```
✓ Fashion
✓ Beauty
✓ Lifestyle
✓ Food
✓ Travel
✓ Fitness
✓ Tech
✓ Entertainment
✓ Business
✓ Other
```

### 6. Realistic Engagement Rates
```
Typical ranges:
- Micro (10K-100K followers):    8-15%
- Mid-tier (100K-1M followers):   4-8%
- Macro (1M+ followers):          2-5%
```

### 7. Add Admin Notes for Context
```
Good notes:
✓ "Top fashion influencer in Mumbai. Great for luxury brands."
✓ "Recently verified. High engagement on reels."
✓ "Agency managed - contact Rajesh for deals"

Not helpful:
✗ "ok"
✗ "added today"
```

---

## Field Descriptions

### Management Types
- **Self-Managed**: Creator manages own brand collaborations
- **Agency-Managed**: Creator represented by management agency
- **Unknown**: Management status not determined

### Onboarding Status
- **New**: Just added to database
- **Pending**: Waiting for verification
- **In Review**: Admin reviewing profile
- **Approved**: Verified and ready for campaigns
- **Rejected**: Profile not approved

### Availability Flags
- **Available for PR**: Can participate in PR/gifting campaigns
- **Available for Paid**: Can participate in paid campaigns
- **Verified Contact**: Contact information has been verified
- **Allow Campaigns**: Profile is active for campaign participation

---

## API Endpoint (For Developers)

If integrating programmatically:

```
POST /api/admin/creators
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Priya Sharma",
  "instagram": "priyastyle",
  "category": "Fashion",
  "followers": 450000,
  "email": "priya@example.com",
  "location": "Mumbai, India",
  ...
}

Response:
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Priya Sharma",
    "socials": { "instagram": "priyastyle" },
    "createdBy": "admin_id_here",
    "createdAt": "2026-02-01T10:30:00.000Z",
    ...
  }
}
```

---

## Batch Creating Multiple Creators

**Method 1: One by One via Dashboard**
```
1. Click "+ Create New Creator"
2. Fill form
3. Click "Create"
4. Repeat for each creator
```

**Method 2: Prepare Data in Advance**
```
Create a template or spreadsheet with all creator info
Reference it while filling dashboard form
Ensures consistency and faster creation
```

**Method 3: Use CLI Script (Developer Only)**
```bash
# Use the import script for bulk operations
node scripts/import-creators-from-excel.js creators.xlsx
```

---

## Checking Audit Trail

To see who created a creator and when:

```
In Creator Profile:
1. Click on creator name
2. Scroll to bottom "Admin Controls" section
3. See:
   - Created by: Admin ID
   - Created at: Timestamp
   - Last modified by: Admin ID
   - Last modified at: Timestamp
```

### Viewing Via Database
```javascript
// Query to see audit info
db.creators.findOne({ _id: ObjectId("...") }, {
  createdBy: 1,
  createdAt: 1,
  lastModifiedBy: 1,
  lastModifiedAt: 1
})

Result:
{
  createdBy: ObjectId("admin_user_id"),
  createdAt: 2026-02-01T10:30:00.000Z,
  lastModifiedBy: ObjectId("admin_user_id"),
  lastModifiedAt: 2026-02-01T10:30:00.000Z
}
```

---

## Complete Checklist

Before creating a creator, use this checklist:

```
✓ Creator Name filled
✓ Instagram handle filled
✓ Category selected
✓ Priority set
✓ Location/City added
✓ Follower count entered
✓ Email added
✓ Bio written
✓ At least one pricing field set
✓ Management type correct
✓ Status flags set appropriately
✓ Admin notes added (recommended)

Then:
✓ Click "Create Creator Profile"
✓ See success message
✓ Refresh page
✓ Search for creator name
✓ Verify in list
✓ Click to view full profile
✓ Confirm all fields correct
```

---

## Summary

**✅ Complete System for Manual Creator Creation**

| Feature | Status |
|---------|--------|
| Web UI Form | ✅ Ready |
| Field Validation | ✅ Working |
| Audit Trail | ✅ Tracking |
| Dashboard Integration | ✅ Live |
| Search & Filter | ✅ Functional |
| Profile Views | ✅ Complete |
| Error Handling | ✅ Implemented |

**Time to Create One Creator:** ~5-10 minutes (including form filling)

**Creators Now in Database:** 80 (all visible and searchable)

**Ready to Add More?** Use this guide and the "+ Create New Creator" button!

---

**Questions?** See the [CREATOR_DATABASE_IMPLEMENTATION_COMPLETE.md](CREATOR_DATABASE_IMPLEMENTATION_COMPLETE.md) for technical details.

**Last Updated:** February 1, 2026  
**Version:** 1.0 - Complete & Production Ready
