# Instagram Influencer Profiles - Quick Start (5 Minutes)

## 🚀 Fast Setup Guide

### 1. Get Your Tokens (2 minutes)

1. **Open Graph API Explorer**: https://developers.facebook.com/tools/explorer/

2. **Select App**: Choose "Auraxai.in" from dropdown

3. **Get Page Token**:
   - Click "User or Page" → "Get Page Access Token"
   - Select your Facebook Page (must be linked to Instagram)
   
4. **Add Permissions**:
   - Click "Permissions"
   - Add: `instagram_basic`, `pages_read_engagement`
   - Click "Generate Access Token"

5. **Copy Values**:
   - Copy the token (long string starting with EAAG...)
   - Enter `/me` in field and click Submit
   - Copy the `id` value (this is your Page ID)

---

### 2. Configure Backend (1 minute)

Open `backend-copy/.env` and find these lines (around line 107):

```bash
META_PAGE_ID=
META_PAGE_ACCESS_TOKEN=
```

Replace with your values:

```bash
META_PAGE_ID=123456789012345
META_PAGE_ACCESS_TOKEN=EAAGm0PX...your_long_token...
```

**Save the file.**

---

### 3. Restart Backend (30 seconds)

```bash
cd backend-copy
npm start
```

Wait for:
```
✅ Connected to MongoDB
Mounting /api/influencers
Server running on port 5002
```

---

### 4. Test in Frontend (1 minute)

1. **Open browser**: http://localhost:3000

2. **Login as Admin**

3. **Navigate to**: http://localhost:3000/admin/influencers

4. **Test**:
   - Leave username blank (fetches your connected account)
   - Click "Search"
   - Profile should appear with verified badge ✅

---

## ✅ Success Checklist

- [ ] Graph API Explorer shows instagram_basic permission
- [ ] META_PAGE_ID and META_PAGE_ACCESS_TOKEN in .env
- [ ] Backend started without errors
- [ ] Frontend loads at /admin/influencers
- [ ] Configuration status shows "configured: true"
- [ ] Profile loads with verified badge

---

## 🐛 Quick Troubleshooting

### "Instagram Graph API not configured"
→ Check .env has both META_PAGE_ID and META_PAGE_ACCESS_TOKEN  
→ Restart backend

### "No Instagram Business Account linked"
→ Link Instagram to Facebook Page:
  1. Instagram app → Settings → Business → Page
  2. Connect to your Facebook Page

### "Profile not found"
→ Make sure Instagram is Business Account (not personal)

### "Token expired"
→ Generate new token in Graph API Explorer  
→ Update .env  
→ Restart backend

---

## 📊 What You Get

✅ **Profile Fields**:
- Username
- Name
- Biography
- Website
- Profile picture
- Followers count
- Following count
- Media count

✅ **Features**:
- 6-hour caching (fast subsequent loads)
- Verified by Graph API badge
- Real-time statistics
- Instagram profile link
- Auto-refresh option

---

## 🎯 Usage

1. Navigate to: `/admin/influencers`
2. Leave search blank or enter username
3. Click "Search"
4. View profile with verified badge
5. Click "View on Instagram" to open profile
6. Use refresh icon to update data

---

## 📞 Need Help?

See full setup guide: `INSTAGRAM_INFLUENCER_PROFILES_SETUP.md`

Check:
- [ ] Token has instagram_basic permission in Graph API Explorer
- [ ] Facebook Page is linked to Instagram Business Account
- [ ] .env file is saved with correct values
- [ ] Backend restarted after .env changes
- [ ] Browser console for error messages

---

**Ready to Go!** 🚀

Navigate to `/admin/influencers` and start fetching profiles!
