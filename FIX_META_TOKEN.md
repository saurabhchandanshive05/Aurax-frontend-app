# 🔧 Fix Meta Access Token - Step-by-Step Guide

## ❌ Problem Detected
Your `META_PAGE_ACCESS_TOKEN` has **expired**.

```
Error: Session has expired on Sunday, 18-Jan-26 11:00:00 PST
```

Access tokens typically expire after **60 days** for long-lived tokens.

---

## ✅ Solution: Generate New Long-Lived Page Access Token

### Option 1: Using Meta Business Suite (Recommended)

#### Step 1: Go to Meta Business Suite
1. Open: https://business.facebook.com/
2. Login with your Facebook account
3. Select your business: **Shubhamchandan1**

#### Step 2: Access System Users or Business Settings
1. Click on **Settings** (⚙️ icon in bottom left)
2. Navigate to **Business Settings**
3. Under "Users", click **System Users** (or **Business Assets** → **Pages**)

#### Step 3: Generate Page Access Token
1. Find or create a System User (e.g., "Instagram API User")
2. Click **Generate New Token**
3. Select your Page: **Shubhamchandan1** (Page ID: 927134967156119)
4. Select the following permissions:
   - ☑️ **instagram_basic**
   - ☑️ **instagram_content_publish**
   - ☑️ **pages_read_engagement**
   - ☑️ **business_management**
   - ☑️ **ads_read** (optional, for analytics)
5. Click **Generate Token**
6. **Copy the token immediately** (you won't see it again!)

#### Step 4: Update Your .env File
1. Open `backend-copy/.env`
2. Replace the `META_PAGE_ACCESS_TOKEN` line:
   ```env
   META_PAGE_ACCESS_TOKEN=<paste_your_new_token_here>
   ```
3. Save the file

#### Step 5: Restart Backend
```powershell
# Stop current backend
Get-Process -Name node | Stop-Process -Force

# Start backend
cd backend-copy
node server.js
```

---

### Option 2: Using Facebook Graph API Explorer (Quick but Short-Lived)

#### Step 1: Go to Graph API Explorer
Open: https://developers.facebook.com/tools/explorer/

#### Step 2: Select Your App
1. In the top-right, select your Facebook App
2. If you don't have an app, create one at https://developers.facebook.com/apps/

#### Step 3: Get User Access Token
1. Click **Generate Access Token**
2. Login and grant permissions:
   - pages_show_list
   - pages_read_engagement
   - instagram_basic
   - instagram_content_publish

#### Step 4: Exchange for Long-Lived Token
This user token expires in ~1 hour. To get a long-lived token:

```powershell
# Replace values below
$app_id = "YOUR_APP_ID"
$app_secret = "YOUR_APP_SECRET"
$short_lived_token = "SHORT_LIVED_USER_TOKEN_FROM_EXPLORER"

$url = "https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=$app_id&client_secret=$app_secret&fb_exchange_token=$short_lived_token"

Invoke-RestMethod -Uri $url
```

This returns a long-lived **user token** (60 days).

#### Step 5: Get Page Access Token from User Token
```powershell
$long_lived_user_token = "YOUR_LONG_LIVED_USER_TOKEN"
$page_id = "927134967156119"

$url = "https://graph.facebook.com/v19.0/$page_id?fields=access_token&access_token=$long_lived_user_token"

Invoke-RestMethod -Uri $url
```

This returns a **Page Access Token** that never expires (as long as the app isn't deauthorized).

#### Step 6: Update .env and Restart
Same as Option 1, Step 4 and Step 5.

---

### Option 3: Programmatic Token Refresh (Advanced)

If you want to automate token refresh, you need:
1. **App ID** and **App Secret** of your Facebook app
2. Implement token refresh logic before expiry
3. Store tokens securely (e.g., database, not .env)

Example refresh logic:
```javascript
const axios = require('axios');

async function refreshToken(oldToken) {
  const response = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
    params: {
      grant_type: 'fb_exchange_token',
      client_id: process.env.FB_APP_ID,
      client_secret: process.env.FB_APP_SECRET,
      fb_exchange_token: oldToken
    }
  });
  
  return response.data.access_token;
}
```

---

## 🧪 Verify New Token Works

After updating the token, test it:

```powershell
cd backend-copy
node diagnostic-instagram.js
```

**Expected Output**:
```
✅ CONNECTED INSTAGRAM ACCOUNT:
   Username: @cutxp_ert
   Name: cutcraft
   Followers: 1,005
   ...
```

---

## 📝 Your Connected Instagram Account

After fixing the token, you can search for:

### ✅ Will Work (Your Connected Account):
- **@cutxp_ert** (cutcraft account)
- Instagram Business Account ID: 17841477241590041
- Followers: 1,005

### ❌ Will NOT Work (Random Accounts):
- @carryminati (public but not connected)
- @komalpandey (public but not connected)
- Any other random username

This is **expected behavior**. Instagram Graph API only allows you to fetch data for Instagram Business accounts connected to your authorized Facebook Page.

---

## 🔐 Security Best Practices

1. **Never commit tokens to git**
   - Tokens are in `.env` (already in `.gitignore`)
   
2. **Rotate tokens regularly**
   - Set calendar reminder every 50 days
   
3. **Use System Users in production**
   - More reliable than user-based tokens
   
4. **Monitor token expiry**
   - Implement alerts 1 week before expiry
   
5. **Store tokens securely**
   - Use environment variables (never hardcode)
   - Consider secret management service (Azure Key Vault, AWS Secrets Manager)

---

## 📚 Official Documentation

- **Long-Lived Tokens**: https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived
- **Page Access Tokens**: https://developers.facebook.com/docs/pages/access-tokens
- **Instagram Graph API**: https://developers.facebook.com/docs/instagram-api
- **Token Debugger**: https://developers.facebook.com/tools/debug/accesstoken/

---

## 🚨 If You Get Stuck

**Common Issues**:

1. **"Token is for the wrong app"**
   - Make sure you're generating token for the correct Facebook app
   
2. **"Invalid OAuth access token"**
   - Token might be malformed. Regenerate from scratch.
   
3. **"User hasn't authorized permission"**
   - You need to grant all required permissions when generating token
   
4. **"This endpoint requires instagram_basic permission"**
   - Select instagram_basic when generating token
   
5. **"No Instagram Business Account linked"**
   - Go to Facebook Page settings → Instagram → Connect Account

---

## ✅ After Token is Fixed

Test the full flow:

1. **Frontend**: http://localhost:3000/admin/influencers
2. **Search**: @cutxp_ert
3. **Expected**: ✅ Full profile with 1,005 followers
4. **Second Search**: Same username → ⚡ Loaded from cache (instant)
5. **Random Username**: @carryminati → ❌ "Not Accessible via Graph API"

---

**Last Updated**: January 19, 2026
**Status**: Waiting for new access token
**Next Step**: Generate new META_PAGE_ACCESS_TOKEN using Option 1 or 2 above
