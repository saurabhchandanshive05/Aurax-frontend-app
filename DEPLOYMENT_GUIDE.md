# 🚀 PRODUCTION DEPLOYMENT GUIDE

## ✅ CRITICAL FIXES COMPLETED

All 5 critical production blockers have been fixed:

1. ✅ **Removed hardcoded Meta App ID**
2. ✅ **Removed all localhost fallbacks**
3. ✅ **Fixed JWT_SECRET to throw error if missing**
4. ✅ **Fixed session cookie secure flag for production**
5. ✅ **Removed duplicate /api/me endpoint**
6. ✅ **Added environment variable validation**

---

## 📋 REQUIRED ENVIRONMENT VARIABLES

### Backend (Render.com)

Copy these variables to your Render dashboard:

```bash
# ===== DATABASE =====
MONGODB_URI=mongodb+srv://username:password@cluster0.jgx4opz.mongodb.net/influencer_production?retryWrites=true&w=majority

# ===== SECURITY =====
JWT_SECRET=<generate-64-char-random-string>
SESSION_SECRET=<generate-64-char-random-string>
COOKIE_SECRET=<generate-64-char-random-string>

# ===== META/INSTAGRAM OAUTH =====
META_APP_ID=<your-facebook-app-id>
META_APP_SECRET=<your-facebook-app-secret>
META_REDIRECT_URI=https://your-backend.onrender.com/api/auth/instagram/callback

# ===== EMAIL SERVICE =====
MAILERSEND_API_KEY=<your-mailersend-api-key>
FROM_EMAIL=noreply@auraxai.in
FROM_NAME=AURAX AI

# ===== URLS =====
FRONTEND_URL=https://your-frontend.netlify.app
BACKEND_URL=https://your-backend.onrender.com
BACKEND_URL_PROD=https://your-backend.onrender.com

# ===== CORS (comma-separated) =====
CORS_ORIGINS=https://your-frontend.netlify.app,https://www.your-domain.com

# ===== ENVIRONMENT =====
NODE_ENV=production
PORT=5002
```

### Frontend (Netlify)

Copy these variables to your Netlify dashboard:

```bash
# ===== API CONFIGURATION =====
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_BACKEND_URL=https://your-backend.onrender.com

# ===== ENVIRONMENT =====
NODE_ENV=production
REACT_APP_ENV=production
```

---

## 🔐 GENERATE SECURE SECRETS

Use these commands to generate secure random strings:

### On Linux/Mac:
```bash
# Generate JWT_SECRET (64 characters)
openssl rand -hex 32

# Generate SESSION_SECRET
openssl rand -hex 32

# Generate COOKIE_SECRET
openssl rand -hex 32
```

### On Windows PowerShell:
```powershell
# Generate JWT_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Generate SESSION_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Generate COOKIE_SECRET
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

### Online Alternative:
Visit: https://www.random.org/strings/?num=3&len=64&digits=on&upperalpha=on&loweralpha=on&format=plain

---

## 🔧 RENDER.COM DEPLOYMENT STEPS

### 1. Create New Web Service

1. Go to https://render.com/
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `saurabhchandanshive05/influencer-backend`
4. Configure:
   - **Name:** `aurax-backend`
   - **Region:** Choose closest to your users
   - **Branch:** `main`
   - **Root Directory:** `backend-copy`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid plan)

### 2. Set Environment Variables

Go to **Environment** tab and add all variables listed above.

**IMPORTANT:** Update these values:
- Replace `<your-facebook-app-id>` with your actual Meta App ID
- Replace `<your-facebook-app-secret>` with your actual Meta App Secret
- Replace `<your-mailersend-api-key>` with your actual MailerSend API key
- Use generated secrets from above for JWT_SECRET, SESSION_SECRET, COOKIE_SECRET

### 3. Update Meta App Settings

1. Go to https://developers.facebook.com/
2. Select your app
3. Go to **App Settings** → **Basic**
4. Add to **App Domains:**
   - `your-backend.onrender.com`
   - `your-frontend.netlify.app`
5. Go to **Products** → **Facebook Login** → **Settings**
6. Add to **Valid OAuth Redirect URIs:**
   - `https://your-backend.onrender.com/api/auth/instagram/callback`
   - `https://your-backend.onrender.com/api/auth/facebook/callback`
7. Save changes

### 4. Deploy

Click **"Create Web Service"** - Render will automatically deploy!

---

## 🌐 NETLIFY DEPLOYMENT STEPS

### 1. Create New Site

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository: `saurabhchandanshive05/Aurax-frontend-app`
4. Configure:
   - **Branch:** `main`
   - **Base directory:** Leave empty (root)
   - **Build command:** `npm run build`
   - **Publish directory:** `build`

### 2. Set Environment Variables

Go to **Site settings** → **Environment variables** and add:

```bash
REACT_APP_API_URL=https://your-backend.onrender.com
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
NODE_ENV=production
REACT_APP_ENV=production
```

**IMPORTANT:** Replace `your-backend.onrender.com` with your actual Render URL!

### 3. Configure Redirects (for React Router)

Create a file `public/_redirects` with:
```
/*    /index.html   200
```

This ensures React Router works correctly on page refresh.

### 4. Deploy

Click **"Deploy site"** - Netlify will automatically build and deploy!

---

## 🧪 POST-DEPLOYMENT TESTING

After both deployments are complete:

### 1. Test Backend Health
```bash
curl https://your-backend.onrender.com/api/health
```
Expected: `{"status":"ok","message":"Server is running"}`

### 2. Test Frontend
Visit: `https://your-frontend.netlify.app`
- Should load homepage
- Check browser console for errors

### 3. Test Registration
1. Go to registration page
2. Create a new account
3. Verify email is sent
4. Complete registration

### 4. Test Login
1. Login with created account
2. Verify redirect to dashboard

### 5. Test Instagram OAuth
1. Go to dashboard
2. Click "Connect Instagram"
3. Complete OAuth flow
4. Verify Instagram connected

### 6. Test Public Creator Page
1. Create public page from dashboard
2. Visit `/creator/your-slug`
3. Verify page displays correctly

---

## 🚨 COMMON ISSUES & FIXES

### Issue: "CORS Error"
**Solution:** Add your Netlify URL to CORS_ORIGINS in Render environment variables

### Issue: "Meta App Invalid Redirect URI"
**Solution:** Add your Render callback URL to Meta App's OAuth settings

### Issue: "Database Connection Failed"
**Solution:** Check MONGODB_URI is correct and IP whitelist includes `0.0.0.0/0` (allow all)

### Issue: "Environment Variable Not Defined"
**Solution:** Check spelling matches exactly in both Render/Netlify and code

### Issue: "Session/Cookie Not Working"
**Solution:** Ensure `sameSite: 'none'` and `secure: true` in production

---

## 📊 MONITORING

### Render Dashboard
- View logs: Go to your service → **Logs** tab
- Check metrics: **Metrics** tab
- Set up alerts: **Settings** → **Notifications**

### Netlify Dashboard
- View deploy logs: Go to your site → **Deploys** tab
- Check function logs: **Functions** tab (if using)
- Analytics: **Analytics** tab (paid feature)

---

## 🔄 CONTINUOUS DEPLOYMENT

Both Render and Netlify support auto-deploy:

**Enabled by default:** Any push to `main` branch triggers automatic deployment

**To disable:** 
- Render: Go to **Settings** → **Build & Deploy** → Toggle off
- Netlify: Go to **Site settings** → **Build & deploy** → **Continuous deployment** → Stop builds

---

## 📝 ENVIRONMENT VARIABLE CHECKLIST

Before going live, verify ALL variables are set:

### Backend (Render) - 13 variables
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] SESSION_SECRET
- [ ] COOKIE_SECRET
- [ ] META_APP_ID
- [ ] META_APP_SECRET
- [ ] META_REDIRECT_URI
- [ ] MAILERSEND_API_KEY
- [ ] FROM_EMAIL
- [ ] FROM_NAME
- [ ] FRONTEND_URL
- [ ] BACKEND_URL
- [ ] CORS_ORIGINS
- [ ] NODE_ENV=production
- [ ] PORT=5002

### Frontend (Netlify) - 4 variables
- [ ] REACT_APP_API_URL
- [ ] REACT_APP_BACKEND_URL
- [ ] NODE_ENV=production
- [ ] REACT_APP_ENV=production

### Meta App (Facebook Developer Console)
- [ ] Added Render domain to App Domains
- [ ] Added OAuth redirect URI
- [ ] App is in "Live" mode (not Development)

---

## ✅ FINAL VERIFICATION

Run through this checklist:

1. [ ] All environment variables set in Render
2. [ ] All environment variables set in Netlify
3. [ ] Meta App OAuth settings updated
4. [ ] MongoDB whitelist includes `0.0.0.0/0`
5. [ ] Backend deploys successfully on Render
6. [ ] Frontend deploys successfully on Netlify
7. [ ] Registration works
8. [ ] Login works
9. [ ] Email sending works
10. [ ] Instagram OAuth works
11. [ ] Public creator pages work
12. [ ] Subscription flow works
13. [ ] No console errors in browser
14. [ ] No errors in Render logs

---

## 🎉 YOU'RE LIVE!

Once all tests pass, your application is production-ready!

**Your URLs:**
- Frontend: `https://your-frontend.netlify.app`
- Backend API: `https://your-backend.onrender.com`

**Next steps:**
1. Set up custom domain (optional)
2. Enable monitoring/alerts
3. Configure backup strategy
4. Set up error tracking (e.g., Sentry)
5. Monitor usage and scale as needed

---

**Need Help?**
- Render Docs: https://render.com/docs
- Netlify Docs: https://docs.netlify.com/
- Meta Developer: https://developers.facebook.com/docs/
