# 🚀 Get Your Meta Access Token in 3 Minutes

## ⚡ Quick Steps

### Step 1: Open Graph API Explorer
**Click this link:** https://developers.facebook.com/tools/explorer/

### Step 2: Select Your App
In the "Meta App" dropdown at the top:
- **Option A:** Select your existing app (if you have one)
- **Option B:** Use "Graph API Explorer" (default app for testing)

### Step 3: Add Permission
1. Click the **"Permissions"** tab (below the app selector)
2. Search for: **`ads_read`**
3. Check the box next to `ads_read`
4. Click **"Generate Access Token"**
5. Log in with your Facebook account if prompted
6. Click **"Continue"** to grant permission

### Step 4: Copy the Token
1. You'll see a long token in the "Access Token" field (starts with `EAAG...`)
2. Click the **copy icon** next to the token
3. The token should look like: `EAAGm0PX4ZCpsBO...` (very long, ~200 characters)

### Step 5: Add Token to .env
1. Open: `backend-copy/.env`
2. Find the line: `META_AD_LIBRARY_ACCESS_TOKEN=`
3. Paste your token after the `=` sign:
   ```env
   META_AD_LIBRARY_ACCESS_TOKEN=EAAGm0PX4ZCpsBO7y8e...
   ```
4. Save the file

### Step 6: Restart Backend
```bash
# Stop the current backend (Ctrl+C in the terminal running node server.js)
# Then restart:
cd backend-copy
node server.js
```

**Look for this message:**
```
✅ Meta Ads Archive Service initialized with Graph API v19.0
```

### Step 7: Test in Frontend
1. Go to: http://localhost:3000/admin/brand-intelligence
2. Click **"Add Brand"**
3. Enter Meta Page ID: `241130119248568` (Veet India test page)
4. Click **"🚀 Auto Fetch using Meta Graph API"**
5. ✅ Form should auto-populate with data!

---

## 🎯 Alternative: Use Your Existing Meta App

If you already have a Meta app (I see you have app ID `2742496619415444` in your .env):

1. Go to: https://developers.facebook.com/apps/2742496619415444/settings/basic/
2. Scroll down to find **"App Secret"** (you already have: `c5bad23eb81e36b0173bd07a0608ad09`)
3. Go to: https://developers.facebook.com/tools/explorer/
4. Select your app from the dropdown
5. Add `ads_read` permission
6. Generate token
7. Copy and paste to `.env`

---

## ⚠️ Token Expiration

**User Access Tokens expire in 60-90 days**

For production, you should use a **System User Token** which never expires:
1. Go to: https://business.facebook.com/settings/system-users
2. Create a System User
3. Assign `ads_read` permission
4. Generate a token
5. Use that token in production

---

## 🧪 Test the Token

You can test if your token works using this curl command:

```bash
curl "https://graph.facebook.com/v19.0/ads_archive?search_page_ids=241130119248568&ad_reached_countries=[\"IN\"]&ad_active_status=ACTIVE&limit=1&access_token=YOUR_TOKEN_HERE"
```

If it works, you'll see JSON with ad data!

---

## 🆘 Troubleshooting

### Error: "Invalid OAuth access token"
- Your token expired or is invalid
- Go back to Graph API Explorer and generate a new one

### Error: "Missing permission: ads_read"
- You didn't add the `ads_read` permission
- Go back to Permissions tab and check the box

### Error: "User must be an admin or developer of the application"
- You're trying to use an app you don't have access to
- Use the "Graph API Explorer" default app instead

---

## ✅ Success Checklist

- [ ] Opened Graph API Explorer
- [ ] Selected app (or used default)
- [ ] Added `ads_read` permission
- [ ] Generated access token
- [ ] Copied token (starts with EAAG...)
- [ ] Pasted into backend-copy/.env
- [ ] Restarted backend (node server.js)
- [ ] Saw "✅ Meta Ads Archive Service initialized"
- [ ] Tested in frontend with Page ID 241130119248568
- [ ] Form auto-populated successfully!

---

**Total Time:** 3-5 minutes  
**Next:** Once token is added, try the Auto Fetch button again!
