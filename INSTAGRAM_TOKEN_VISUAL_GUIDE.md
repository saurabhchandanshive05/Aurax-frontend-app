# Instagram Influencer Profiles - Token Configuration Visual Guide

## 🎯 Goal

Get these two values and add them to `.env`:
- `META_PAGE_ID` (Facebook Page ID)
- `META_PAGE_ACCESS_TOKEN` (Page Access Token with Instagram permissions)

---

## 📸 Step-by-Step with Screenshots

### Step 1: Open Graph API Explorer

Navigate to: **https://developers.facebook.com/tools/explorer/**

```
┌─────────────────────────────────────────────┐
│  Graph API Explorer                          │
├─────────────────────────────────────────────┤
│  Meta App: [Auraxai.in ▼]  ← Select this   │
│  User or Page: [Get Page Access Token]      │
├─────────────────────────────────────────────┤
│  GET /me                                     │
│  [Submit]                                    │
└─────────────────────────────────────────────┘
```

**Actions**:
- ✅ Select "Auraxai.in" from Meta App dropdown
- ✅ Click "User or Page" → "Get Page Access Token"

---

### Step 2: Select Facebook Page

A dialog will appear:

```
┌─────────────────────────────────────────────┐
│  Choose a Page                               │
├─────────────────────────────────────────────┤
│  ○ Your Page Name (123456789)                │
│  ○ Other Page (987654321)                    │
├─────────────────────────────────────────────┤
│  [Continue]                                  │
└─────────────────────────────────────────────┘
```

**Actions**:
- ✅ Select the Facebook Page linked to your Instagram Business Account
- ✅ Click "Continue"

---

### Step 3: Add Permissions

After selecting page, click "Permissions" tab:

```
┌─────────────────────────────────────────────┐
│  Permissions  Configurations                 │
├─────────────────────────────────────────────┤
│  ☐ instagram_basic          ← CHECK THIS    │
│  ☐ pages_read_engagement    ← CHECK THIS    │
│  ☐ pages_show_list                           │
│  ☐ other_permissions...                      │
├─────────────────────────────────────────────┤
│  [Generate Access Token]                     │
└─────────────────────────────────────────────┘
```

**Actions**:
- ✅ Check: `instagram_basic` (REQUIRED)
- ✅ Check: `pages_read_engagement` (REQUIRED)
- ✅ Check: `pages_show_list` (optional but recommended)
- ✅ Click "Generate Access Token"

---

### Step 4: Copy Access Token

Token will appear in the "Access Token" field:

```
┌─────────────────────────────────────────────────────────────┐
│  Access Token                                   [Copy Token]│
├─────────────────────────────────────────────────────────────┤
│  EAAGm0PX4ZCBAO...very_long_string...ZBZD                  │
└─────────────────────────────────────────────────────────────┘
```

**Actions**:
- ✅ Click "Copy Token" button
- ✅ Save this token temporarily (you'll paste it into .env soon)

**⚠️ Important**: This token expires in 2 hours! For production, use a long-lived token.

---

### Step 5: Get Page ID

In the query field, enter: `/me`

```
┌─────────────────────────────────────────────┐
│  GET /me                                     │
│  [Submit]                                    │
├─────────────────────────────────────────────┤
│  Response:                                   │
│  {                                           │
│    "id": "123456789012345",  ← THIS IS IT!  │
│    "name": "Your Page Name"                  │
│  }                                           │
└─────────────────────────────────────────────┘
```

**Actions**:
- ✅ Click "Submit"
- ✅ Copy the `id` value (numbers only)
- ✅ Save this ID temporarily

---

### Step 6: Configure .env

Open: `backend-copy/.env`

Find this section (around line 107):

```bash
# ==============================================================================
# INSTAGRAM GRAPH API (Influencer Profiles)
# ==============================================================================
META_PAGE_ID=
META_PAGE_ACCESS_TOKEN=
```

**Paste your values**:

```bash
# ==============================================================================
# INSTAGRAM GRAPH API (Influencer Profiles)
# ==============================================================================
META_PAGE_ID=123456789012345
META_PAGE_ACCESS_TOKEN=EAAGm0PX4ZCBAO1iZAXYourVeryLongTokenHereZBZD
```

**Save the file** (Ctrl+S or Cmd+S)

---

### Step 7: Verify Instagram Connection

**Test in Graph API Explorer**:

Enter: `/{YOUR_PAGE_ID}?fields=instagram_business_account`

```
┌─────────────────────────────────────────────┐
│  GET /123456789/...instagram_business...    │
│  [Submit]                                    │
├─────────────────────────────────────────────┤
│  Response:                                   │
│  {                                           │
│    "instagram_business_account": {           │
│      "id": "17841..."   ← Instagram linked! │
│    },                                        │
│    "id": "123456789"                         │
│  }                                           │
└─────────────────────────────────────────────┘
```

**Expected Result**:
- ✅ See `instagram_business_account` with an ID
- ❌ If missing: Instagram not linked to this page

---

### Step 8: Link Instagram to Facebook Page (if needed)

If Instagram is not linked, do this on your phone:

```
┌─────────────────────────────────┐
│  Instagram App                   │
├─────────────────────────────────┤
│  [Profile Icon]                  │
│  ↓                               │
│  [☰ Menu]                        │
│  ↓                               │
│  Settings                        │
│  ↓                               │
│  Account                         │
│  ↓                               │
│  Switch to Professional Account  │
│  ↓                               │
│  Choose "Business"               │
│  ↓                               │
│  Connect to Facebook Page        │
│  ↓                               │
│  Select your page                │
└─────────────────────────────────┘
```

---

### Step 9: Restart Backend

Open terminal:

```bash
cd backend-copy
npm start
```

**Watch for these log messages**:

```
✅ Connected to MongoDB
Mounting /api/influencers
✅ Creator routes mounted
Server running on port 5002
```

**No errors = Success!** 🎉

---

### Step 10: Test in Frontend

1. **Open browser**: http://localhost:3000

2. **Login as Admin**

3. **Navigate to**: http://localhost:3000/admin/influencers

4. **You should see**:

```
┌───────────────────────────────────────────────┐
│  Instagram Influencer Profiles                 │
├───────────────────────────────────────────────┤
│  ✅ Configuration status: Configured           │
│                                                │
│  Search:                                       │
│  [@_____________] [Search]                     │
│                                                │
│  Leave blank to fetch your connected account   │
└───────────────────────────────────────────────┘
```

5. **Click "Search" with empty field**

6. **Profile should load**:

```
┌───────────────────────────────────────────────┐
│  [Profile Pic]  @your_username  [✓ Verified]  │
│                 Your Name                      │
│                                                │
│  [View on Instagram]  [↻]                     │
├───────────────────────────────────────────────┤
│  Followers: 1.2K  Following: 567  Posts: 89   │
├───────────────────────────────────────────────┤
│  Biography:                                    │
│  Your bio text here...                         │
│                                                │
│  🔗 yourwebsite.com                            │
└───────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

Go through this checklist to verify everything is working:

- [ ] ✅ Graph API Explorer shows your token
- [ ] ✅ Permissions tab shows `instagram_basic` checked
- [ ] ✅ Page ID copied from `/me` response
- [ ] ✅ Token copied from Access Token field
- [ ] ✅ Both values pasted into `backend-copy/.env`
- [ ] ✅ File saved (check file modification time)
- [ ] ✅ Backend restarted with `npm start`
- [ ] ✅ No errors in terminal logs
- [ ] ✅ Frontend loads at `/admin/influencers`
- [ ] ✅ Configuration status shows "configured"
- [ ] ✅ Profile loads when clicking Search
- [ ] ✅ Profile shows "Verified by Graph API" badge
- [ ] ✅ Statistics display (followers, posts, etc.)

---

## 🐛 Troubleshooting Common Issues

### ❌ "Instagram Graph API not configured"

**Cause**: Backend can't find `META_PAGE_ID` or `META_PAGE_ACCESS_TOKEN` in .env

**Fix**:
1. ✅ Open `backend-copy/.env`
2. ✅ Verify both values are present (no empty values)
3. ✅ Make sure there are NO spaces around the `=` sign
4. ✅ Save file
5. ✅ Restart backend (`Ctrl+C`, then `npm start`)

**Correct format**:
```bash
META_PAGE_ID=123456789
META_PAGE_ACCESS_TOKEN=EAAGm0...
```

**Wrong format** (will fail):
```bash
META_PAGE_ID =123456789          ← Space before =
META_PAGE_ACCESS_TOKEN= EAAGm0   ← Space after =
META_PAGE_ID="123456789"         ← Quotes (not needed)
```

---

### ❌ "No Instagram Business Account linked"

**Cause**: Facebook Page not connected to Instagram Business Account

**Fix**:
1. ✅ Convert Instagram to Business Account (Settings → Professional Account)
2. ✅ Link to Facebook Page (Settings → Business → Page)
3. ✅ Verify in Graph API Explorer:
   ```
   /{YOUR_PAGE_ID}?fields=instagram_business_account
   ```
4. ✅ Should see `instagram_business_account.id` in response

---

### ❌ "Access token expired"

**Cause**: Short-lived token from Graph API Explorer expired (2 hours)

**Fix**:
1. ✅ Go back to Graph API Explorer
2. ✅ Click "Generate Access Token" again
3. ✅ Copy new token
4. ✅ Update `META_PAGE_ACCESS_TOKEN` in .env
5. ✅ Restart backend

**Long-term solution**: Use System User token (never expires)

---

### ❌ "Missing required permissions"

**Cause**: Token doesn't have `instagram_basic` permission

**Fix**:
1. ✅ Go to Graph API Explorer
2. ✅ Click "Permissions" tab
3. ✅ Make sure `instagram_basic` is CHECKED
4. ✅ Click "Generate Access Token" to get new token with permissions
5. ✅ Update .env with new token
6. ✅ Restart backend

---

### ❌ Profile loads but shows 0 followers

**Cause**: Could be real (no followers) or permissions issue

**Fix**:
1. ✅ Verify Instagram account has followers
2. ✅ Check permissions include `instagram_basic`
3. ✅ Try refreshing profile data (click refresh icon)

---

## 🎉 You're Done!

If profile loads with verified badge, you're all set! 🚀

Navigate to `/admin/influencers` anytime to fetch Instagram profiles.

---

## 📞 Still Having Issues?

1. ✅ Check browser console (F12) for errors
2. ✅ Check backend terminal for error logs
3. ✅ Verify token works in Graph API Explorer:
   ```
   /{YOUR_PAGE_ID}?fields=instagram_business_account
   ```
4. ✅ Review full setup guide: `INSTAGRAM_INFLUENCER_PROFILES_SETUP.md`

---

**Congratulations!** Your Instagram Influencer Profiles module is now live! 🎊
