# Instagram Influencer Profiles Module - Complete Setup Guide

## 🎯 Overview

The Instagram Influencer Profiles module allows AURAX admins to fetch and display Instagram Business Account profiles using Meta's official Graph API. All data is fetched securely server-side with 6-hour caching.

---

## ✅ What Was Implemented

### Backend Components

1. **Model**: `InfluencerProfile.js`
   - Stores Instagram profile data
   - 6-hour cache validation
   - Upsert functionality for efficient updates
   - Indexes for performance

2. **Service**: `instagramGraphAPI.js`
   - Fetches Instagram Business Account ID from Facebook Page
   - Retrieves profile fields: username, name, bio, followers, etc.
   - Comprehensive error handling
   - Token validation

3. **Routes**: `influencerProfiles.js`
   - `GET /api/influencers/instagram/profile` - Fetch profile with caching
   - `GET /api/influencers/instagram/profiles/search` - Search cached profiles
   - `GET /api/influencers/instagram/profiles/cached` - List all cached profiles
   - `GET /api/influencers/instagram/config/status` - Check configuration

4. **Server Integration**: Routes mounted at `/api/influencers`

### Frontend Component

1. **Page**: `InstagramInfluencerProfiles.jsx` at `/admin/influencers`
   - Search UI for Instagram usernames
   - Premium influencer card design
   - "Verified by Graph API" badge
   - Real-time statistics display
   - Cache status indicators
   - Error handling with user-friendly messages

---

## 🔧 Configuration Required

### Step 1: Get Facebook Page Access Token

You need a **Page Access Token** (not User Access Token) with Instagram permissions.

#### Option A: Using Graph API Explorer (Quick - 2 hours expiry)

1. Go to: https://developers.facebook.com/tools/explorer/

2. **Select Your App**:
   - Click "Meta App" dropdown
   - Select: **Auraxai.in (2742496619415444)**

3. **Switch to Page Token**:
   - Click "User or Page" dropdown
   - Select: **Get Page Access Token**
   - Choose your Facebook Page that's linked to Instagram Business Account

4. **Add Permissions**:
   - Click "Permissions" tab
   - Add these permissions:
     ```
     ✅ instagram_basic
     ✅ instagram_manage_insights (optional - for future media analytics)
     ✅ pages_read_engagement
     ✅ pages_show_list
     ```

5. **Generate Token**:
   - Click "Generate Access Token"
   - Copy the token (starts with `EAAG...`)

6. **Get Page ID**:
   - In Graph API Explorer, enter: `/me?fields=id,name`
   - Click "Submit"
   - Copy the `id` value

#### Option B: Long-Lived Page Access Token (60 days)

After getting the short-lived token from Graph API Explorer:

1. **Exchange for Long-Lived Token**:
   ```bash
   curl "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN"
   ```

2. **Get Page Access Token**:
   ```bash
   curl "https://graph.facebook.com/v19.0/me/accounts?access_token=LONG_LIVED_USER_TOKEN"
   ```
   
   Find your page in the response and copy its `access_token`.

#### Option C: Never-Expiring System User Token (Recommended for Production)

See Meta's documentation: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived

---

### Step 2: Configure Backend Environment

Open `backend-copy/.env` and add:

```bash
# ==============================================================================
# INSTAGRAM GRAPH API (Influencer Profiles)
# ==============================================================================
META_PAGE_ID=YOUR_FACEBOOK_PAGE_ID
META_PAGE_ACCESS_TOKEN=YOUR_PAGE_ACCESS_TOKEN
```

**Example**:
```bash
META_PAGE_ID=123456789012345
META_PAGE_ACCESS_TOKEN=EAAGm0PX4ZC...very_long_token...
```

---

### Step 3: Link Instagram Business Account to Facebook Page

Your Instagram account must be a **Business Account** linked to your Facebook Page.

1. **Convert to Business Account** (if not already):
   - Open Instagram app
   - Go to Settings → Account → Switch to Professional Account
   - Choose "Business"

2. **Link to Facebook Page**:
   - In Instagram Settings → Business
   - Click "Page" or "Linked Accounts"
   - Connect to your Facebook Page

3. **Verify Connection**:
   ```bash
   curl "https://graph.facebook.com/v19.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_TOKEN"
   ```
   
   Should return:
   ```json
   {
     "instagram_business_account": {
       "id": "17841..."
     },
     "id": "123..."
   }
   ```

---

### Step 4: Restart Backend Server

```bash
cd backend-copy
npm start
```

Check for these log messages:
```
✅ Connected to MongoDB
Mounting /api/influencers
✅ Creator routes mounted
Server running on port 5002
```

---

## 🚀 Usage Guide

### Access the Module

1. **Login as Admin**
2. **Navigate to**: http://localhost:3000/admin/influencers

### Fetch Instagram Profile

1. **Enter Username**: Type Instagram username (without @)
2. **Click Search**: Fetches profile from Instagram Graph API
3. **View Profile**: Premium card displays:
   - Profile picture
   - Username with "Verified by Graph API" badge
   - Full name
   - Biography
   - Website link
   - **Statistics**:
     - Followers count
     - Following count
     - Media count (posts)
   - Cache status
   - Last updated timestamp

### Features

✅ **6-Hour Caching**: Subsequent requests within 6 hours load from database (faster)

✅ **Cache Indicator**: Shows if data is cached and age

✅ **Refresh Button**: Force fetch fresh data from Instagram

✅ **Verified Badge**: All profiles show "Verified by Meta Graph API" badge

✅ **External Links**: Quick links to Instagram profile and website

✅ **Error Handling**: User-friendly error messages for:
- Configuration issues
- Token expiration
- Missing permissions
- Account not found
- Network errors

---

## 🔒 Security Features

✅ **Server-Only API Calls**: Access tokens NEVER exposed to client

✅ **JWT Authentication**: All endpoints require valid JWT token

✅ **Environment Variables**: Sensitive credentials stored in .env (not in code)

✅ **Error Sanitization**: API errors sanitized before sending to frontend

✅ **Rate Limiting**: Meta's rate limits respected (100ms delay between requests)

---

## 🧪 Testing

### Test Configuration Status

```bash
# Using curl
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5002/api/influencers/instagram/config/status
```

Expected response:
```json
{
  "success": true,
  "configured": true,
  "message": "Instagram Graph API is configured and ready"
}
```

### Test Profile Fetch

```bash
# Using curl (fetches connected account)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:5002/api/influencers/instagram/profile"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "instagramId": "17841...",
    "username": "yourhandle",
    "name": "Your Name",
    "biography": "Your bio...",
    "followersCount": 1234,
    "followsCount": 567,
    "mediaCount": 89,
    "profileUrl": "https://www.instagram.com/yourhandle/",
    ...
  },
  "cached": false,
  "verifiedBy": "meta_graph_api"
}
```

---

## ⚠️ Known Limitations

### 1. Single Account Only (Current Implementation)

**Limitation**: Currently fetches only the Instagram Business Account connected to your Facebook Page.

**Reason**: Meta's Instagram Graph API doesn't provide username → ID lookup without additional APIs.

**Workarounds**:
- Use Instagram Basic Display API (for personal accounts)
- Use Instagram Username to ID mapping services
- Request Instagram Account ID directly

### 2. Business Accounts Only

**Limitation**: Only Instagram Business/Creator accounts can be fetched.

**Reason**: Meta Graph API only supports business accounts.

**Solution**: Target account must convert to Business Account first.

### 3. Token Expiration

**Short-lived tokens** (2 hours): Need frequent regeneration

**Solution**: Use System User tokens or implement auto-refresh

### 4. Rate Limits

Meta enforces rate limits. Service includes 100ms delay between requests.

---

## 🐛 Troubleshooting

### Error: "Instagram Graph API not configured"

**Cause**: `META_PAGE_ID` or `META_PAGE_ACCESS_TOKEN` missing in `.env`

**Fix**:
1. Add both variables to `backend-copy/.env`
2. Restart backend server

---

### Error: "Access token expired"

**Cause**: Token expired (short-lived tokens expire in 2 hours)

**Fix**:
1. Generate new token in Graph API Explorer
2. Update `META_PAGE_ACCESS_TOKEN` in `.env`
3. Restart backend server

---

### Error: "Missing required permissions"

**Cause**: Token doesn't have `instagram_basic` permission

**Fix**:
1. Go to Graph API Explorer
2. Add permissions: `instagram_basic`, `pages_read_engagement`
3. Regenerate token
4. Update `.env`

---

### Error: "No Instagram Business Account linked"

**Cause**: Facebook Page not linked to Instagram Business Account

**Fix**:
1. Convert Instagram to Business Account
2. Link to Facebook Page (Settings → Business → Page)
3. Verify with:
   ```bash
   curl "https://graph.facebook.com/v19.0/YOUR_PAGE_ID?fields=instagram_business_account&access_token=YOUR_TOKEN"
   ```

---

### Error: "Profile not found or not accessible"

**Cause**: Username doesn't exist or is a personal account (not business)

**Fix**:
- Verify username is correct
- Ensure account is a Business/Creator account
- Check account privacy settings

---

## 📊 Database Schema

### InfluencerProfile Collection

```javascript
{
  instagramId: String (unique),
  username: String (unique, lowercase),
  name: String,
  biography: String,
  website: String,
  profilePictureUrl: String,
  followersCount: Number,
  followsCount: Number,
  mediaCount: Number,
  verifiedSource: "meta_graph_api" | "manual" | "imported",
  isBusinessAccount: Boolean,
  lastFetchedAt: Date,
  fetchStatus: "success" | "error" | "pending" | "expired",
  fetchError: String,
  categories: [String],
  tags: [String],
  engagementRate: Number, // For future
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔮 Future Enhancements

### Phase 2 Features (Planned)

1. **Recent Posts Fetch**
   - Fetch last 10 media posts
   - Display engagement metrics (likes, comments)
   - Calculate average engagement rate

2. **Username Search**
   - Implement username → ID mapping
   - Search any Instagram Business Account

3. **Batch Profile Fetch**
   - Upload CSV of usernames
   - Fetch multiple profiles at once

4. **Analytics Dashboard**
   - Compare multiple influencers
   - Track growth over time
   - Engagement rate calculator

5. **Auto-Refresh**
   - Scheduled cache refresh (nightly)
   - Token auto-renewal
   - Webhook for profile updates

---

## 📚 API Documentation

### GET /api/influencers/instagram/profile

Fetch Instagram profile with 6-hour caching.

**Headers**:
```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**:
- `username` (optional): Instagram username

**Response** (200 OK):
```json
{
  "success": true,
  "data": { /* InfluencerProfile object */ },
  "cached": false,
  "message": "Profile fetched successfully",
  "verifiedBy": "meta_graph_api"
}
```

**Error** (503 Service Unavailable):
```json
{
  "success": false,
  "error": "Service not configured",
  "message": "Please configure META_PAGE_ID and META_PAGE_ACCESS_TOKEN",
  "code": "SERVICE_NOT_CONFIGURED"
}
```

---

### GET /api/influencers/instagram/profiles/search

Search cached profiles.

**Query Parameters**:
- `query` (required): Search term
- `limit` (optional): Results limit (default: 10)
- `sortBy` (optional): Sort field (default: followersCount)

**Response** (200 OK):
```json
{
  "success": true,
  "data": [ /* Array of InfluencerProfile */ ],
  "count": 5,
  "query": "nike"
}
```

---

### GET /api/influencers/instagram/config/status

Check if Instagram Graph API is configured.

**Response** (200 OK):
```json
{
  "success": true,
  "configured": true,
  "message": "Instagram Graph API is configured and ready"
}
```

---

## ✅ Deployment Checklist

- [ ] Configure `META_PAGE_ID` in production `.env`
- [ ] Configure `META_PAGE_ACCESS_TOKEN` in production `.env`
- [ ] Use long-lived or System User token (not short-lived)
- [ ] Verify Instagram Business Account is linked to Facebook Page
- [ ] Test API endpoints with production token
- [ ] Test frontend profile fetch
- [ ] Verify 6-hour caching works
- [ ] Set up monitoring for token expiration
- [ ] Document token renewal process
- [ ] Train admins on usage

---

## 📞 Support

For issues or questions:
1. Check error messages in browser console
2. Check backend logs for detailed errors
3. Verify `.env` configuration
4. Test token in Graph API Explorer
5. Review troubleshooting section above

---

## 🎉 Success!

Your Instagram Influencer Profiles module is now ready! Navigate to `/admin/influencers` to start fetching profiles.

**Next Steps**:
1. Configure META_PAGE_ID and META_PAGE_ACCESS_TOKEN
2. Link Instagram Business Account to Facebook Page
3. Restart backend server
4. Test profile fetch in frontend

Happy profiling! 🚀
