# 🎯 Meta Graph API - Quick Start

## ⚡ 3-Minute Setup

### 1. Get Meta Access Token (2 mins)
1. Open https://developers.facebook.com/tools/explorer/
2. Select your app (or create one)
3. Add permission: `ads_read`
4. Click "Generate Access Token"
5. Copy the token (starts with `EAAG...`)

### 2. Add to Backend (30 seconds)
Open `backend-copy/.env` and add:
```env
META_AD_LIBRARY_ACCESS_TOKEN=PASTE_YOUR_TOKEN_HERE
```

### 3. Restart Backend (30 seconds)
```bash
cd backend-copy
node server.js
```

Look for: `✅ Meta Ads Archive Service initialized`

---

## 🚀 How to Use

1. Go to **Admin → Brand Intelligence**
2. Click **"Add Brand"**
3. Enter **Meta Page ID** (e.g., `241130119248568`)
4. Click **"🚀 Auto Fetch using Meta Graph API"**
5. Done! Data auto-fills in 2-5 seconds.

---

## 🧪 Test It

Use this Page ID to test: **241130119248568** (Veet India)

Expected result:
- Page Name: ✅ Veet India
- Active Ads: ✅ 40+ ads
- Platforms: ✅ Facebook, Instagram

---

## ❌ Common Errors

| Error | Fix |
|-------|-----|
| "Invalid OAuth token" | Regenerate token from Graph API Explorer |
| "Missing permission: ads_read" | Add `ads_read` permission to your token |
| "Token not found" | Add `META_AD_LIBRARY_ACCESS_TOKEN` to `.env` |
| "Rate limit exceeded" | Wait 5-10 minutes or use cached data |

---

## 📚 Full Documentation

See [META_GRAPH_API_INTEGRATION_GUIDE.md](./META_GRAPH_API_INTEGRATION_GUIDE.md) for:
- API endpoint documentation
- Database schema details
- Advanced configuration
- Troubleshooting guide
- Architecture overview

---

## ✅ What's New?

### Before (Old Scraper):
- ❌ Scraped Meta Ad Library HTML
- ❌ Used PaddleOCR for text extraction
- ❌ Error-prone (422 errors)
- ❌ No real ad data
- ❌ Limited to visible ads on page

### After (Meta Graph API):
- ✅ Official Meta Graph API
- ✅ Real-time ads data
- ✅ Up to 500 ads per page
- ✅ Automatic pagination
- ✅ 6-hour smart caching
- ✅ Ad snapshot URLs for preview
- ✅ Platform detection (FB, IG, etc.)

---

**Status:** ✅ Backend Complete | ✅ Frontend Complete | ⏳ User Token Setup Pending
