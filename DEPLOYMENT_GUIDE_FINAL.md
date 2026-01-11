# 🚀 AURAX Production Deployment Guide

**Last Updated**: January 11, 2026
**Status**: READY FOR DEPLOYMENT
**Deployment Targets**:
- Backend: Render.com
- Frontend: Netlify.com

---

## ✅ PRE-DEPLOYMENT CHECKLIST COMPLETED

### 1. Security & Environment
- ✅ Created `.env.example` templates (frontend & backend)
- ✅ `.gitignore` configured to exclude `.env` files
- ✅ Health check endpoint added: `/health`, `/health/ready`, `/health/live`
- ✅ Production logger created (only error logs in production)
- ✅ Helmet security headers configured
- ✅ Rate limiting enabled
- ✅ CORS configured for production

### 2. Production Features
- ✅ Dynamic API URL detection (mobile support)
- ✅ Error boundaries ready for frontend
- ✅ Session management with secure cookies
- ✅ MongoDB Atlas production database ready
- ✅ Email services configured (MailerSend + Brevo)

---

## 🔐 CRITICAL: SECRETS MANAGEMENT

### ⚠️ NEVER COMMIT THESE VALUES TO GITHUB

Before deployment, you must:

1. **Rotate all API keys** (since they were in .env files):
   - MongoDB credentials
   - JWT_SECRET & COOKIE_SECRET
   - MailerSend API Key
   - Brevo API Key
   - Instagram/Facebook App Secrets

2. **Generate new production secrets**:
```powershell
# JWT Secret (64 characters)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Cookie Secret (32 characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📋 DEPLOYMENT STEPS

### Step 1: Prepare GitHub Repositories

#### Backend Repository (`influencer-backend`)

1. **Navigate to backend folder**:
```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
```

2. **Check Git status**:
```powershell
git status
```

3. **Add all changes**:
```powershell
git add .
```

4. **Commit with clear message**:
```powershell
git commit -m "Production ready: Add health checks, environment templates, security hardening"
```

5. **Push to GitHub**:
```powershell
git push origin main
```

#### Frontend Repository (`Aurax-frontend-app`)

1. **Navigate to frontend folder**:
```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy
```

2. **Check Git status**:
```powershell
git status
```

3. **Add all changes**:
```powershell
git add .
```

4. **Commit with clear message**:
```powershell
git commit -m "Production ready: Mobile-first UI, dynamic API URLs, environment templates"
```

5. **Push to GitHub**:
```powershell
git push origin main
```

---

### Step 2: Deploy Backend to Render

1. **Go to**: https://render.com/
2. **Click "New +" → "Web Service"**
3. **Connect GitHub repository**: `saurabhchandanshive05/influencer-backend`
4. **Configure settings**:
   - **Name**: `aurax-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):

```env
NODE_ENV=production
IS_PRODUCTION=true
PORT=5002

# Database (get from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aurax?retryWrites=true&w=majority

# Generate NEW secrets!
JWT_SECRET=<paste_64_char_secret>
COOKIE_SECRET=<paste_32_char_secret>
SESSION_SECRET=<paste_32_char_secret>

# URLs (UPDATE after Render assigns your URL)
BACKEND_URL=https://aurax-backend.onrender.com
FRONTEND_URL=https://your-app.netlify.app

# CORS
ALLOWED_ORIGINS=https://your-app.netlify.app

# Email - MailerSend
MAILERSEND_API_KEY=<your_mailersend_key>
FROM_EMAIL=noreply@auraxai.in
FROM_NAME=AURAX

# Email - Brevo (OTP)
BREVO_API_KEY=<your_brevo_key>

# OTP Configuration
OTP_TTL_SECONDS=900
MAX_OTP_ATTEMPTS=3
OTP_RATE_LIMIT=5

# Instagram OAuth
INSTAGRAM_APP_ID=1975238456624246
INSTAGRAM_APP_SECRET=<your_secret>

# Facebook OAuth
FACEBOOK_APP_ID=1975238456624246
FACEBOOK_APP_SECRET=<your_secret>
FACEBOOK_CALLBACK_URL_PROD=https://aurax-backend.onrender.com/api/auth/facebook/callback

# Meta OAuth
META_APP_ID=2742496619415444
META_APP_SECRET=<your_secret>
META_REDIRECT_URI=https://aurax-backend.onrender.com/api/auth/instagram/callback
```

6. **Configure Health Check**:
   - Health Check Path: `/health`
   - Expected Status: `200`

7. **Click "Create Web Service"**

8. **Wait for deployment** (~5-10 minutes)

9. **Test health endpoint**:
```powershell
curl https://aurax-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-11T...",
  "uptime": 123.456,
  "environment": "production",
  "database": "connected"
}
```

---

### Step 3: Update Instagram/Facebook OAuth Settings

1. **Go to**: https://developers.facebook.com/apps/
2. **Select your app** (ID: 2742496619415444)
3. **Update OAuth Redirect URIs**:
   - Remove or disable: `http://localhost:*`
   - Add: `https://aurax-backend.onrender.com/api/auth/instagram/callback`
   - Add: `https://your-app.netlify.app/dashboard`
4. **Save changes**
5. **Test OAuth flow** after frontend deployment

---

### Step 4: Deploy Frontend to Netlify

1. **Go to**: https://app.netlify.com/
2. **Click "Add new site" → "Import an existing project"**
3. **Connect GitHub repository**: `saurabhchandanshive05/Aurax-frontend-app`
4. **Configure build settings**:
   - **Branch**: `main`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Node version**: `18` (in Environment → Node version)

5. **Add Environment Variables** (Site settings → Environment variables):

```env
NODE_ENV=production

# API URL (use YOUR Render backend URL)
REACT_APP_API_URL=https://aurax-backend.onrender.com
REACT_APP_API_BASE_URL=https://aurax-backend.onrender.com

# Instagram OAuth
REACT_APP_INSTAGRAM_CLIENT_ID=1975238456624246
REACT_APP_REDIRECT_URI=https://your-app.netlify.app/dashboard

# Build config
GENERATE_SOURCEMAP=false
```

6. **Configure Redirects** (Already created in `public/_redirects`):
   - File ensures all routes are handled by React Router

7. **Deploy site** → Click "Deploy site"

8. **Wait for build** (~2-5 minutes)

9. **Note your Netlify URL**: `https://your-app.netlify.app`

10. **Update backend environment**:
   - Go back to Render dashboard
   - Update `FRONTEND_URL` and `ALLOWED_ORIGINS` with your Netlify URL
   - Trigger manual deploy on Render

---

### Step 5: Configure Custom Domain (Optional)

#### For Netlify (Frontend):
1. **Go to**: Site settings → Domain management
2. **Add custom domain**: `www.auraxai.in`
3. **Update DNS records** (at your domain registrar):
   - CNAME: `www` → `your-app.netlify.app`
4. **Enable HTTPS** (automatic with Netlify)

#### For Render (Backend):
1. **Go to**: Dashboard → Settings → Custom Domains
2. **Add custom domain**: `api.auraxai.in`
3. **Update DNS records**:
   - CNAME: `api` → `aurax-backend.onrender.com`
4. **Enable HTTPS** (automatic with Render)

---

## 🧪 POST-DEPLOYMENT TESTING

### 1. Backend Health Check
```powershell
# Test health endpoint
curl https://aurax-backend.onrender.com/health

# Expected: {"status":"ok","database":"connected"}
```

### 2. Frontend Load Test
1. Open: `https://your-app.netlify.app`
2. Check browser console for errors
3. Verify no 404s on assets
4. Check mobile responsiveness

### 3. User Flow Tests

#### Test Registration:
1. Go to signup page
2. Register new account
3. Verify email received
4. Check MongoDB for new user

#### Test Login:
1. Go to login page
2. Enter credentials
3. Verify redirect to dashboard
4. Check session persistence

#### Test Creator Onboarding:
1. Login as creator
2. Complete profile setup
3. Upload Instagram verification
4. Check admin review page

#### Test Instagram OAuth:
1. Click "Connect Instagram"
2. Verify redirect to Instagram
3. Authorize app
4. Verify callback success
5. Check Instagram profile data loaded

#### Test Mobile Access:
1. Open site on mobile device
2. Test all breakpoints
3. Verify touch-friendly UI
4. Test forms and navigation

### 4. Performance Tests
- Frontend load time < 3 seconds
- API response time < 500ms
- No console errors in production
- Mobile layout perfect
- HTTPS active

---

## 📊 MONITORING

### Render Monitoring:
- **Logs**: Dashboard → Logs tab
- **Metrics**: CPU, Memory, Response times
- **Alerts**: Configure email alerts for downtime

### Netlify Monitoring:
- **Deploys**: Check build logs
- **Analytics**: Traffic and performance
- **Forms**: Monitor form submissions (if enabled)

### MongoDB Atlas:
- **Metrics**: Database performance
- **Alerts**: Configure for high CPU/memory
- **Backup**: Enable automated backups

---

## 🔄 ROLLBACK PROCEDURE

If deployment fails or issues arise:

### Quick Rollback:
```powershell
# Revert last commit
git revert HEAD
git push origin main

# Render and Netlify will auto-deploy previous version
```

### Manual Rollback:
1. **Render**: Dashboard → Deploys → Select previous deploy → "Redeploy"
2. **Netlify**: Deploys tab → Select previous deploy → "Publish deploy"

---

## 🚨 TROUBLESHOOTING

### Backend won't start:
- Check Render logs for errors
- Verify all environment variables set
- Test MongoDB connection string locally
- Check JWT_SECRET is set

### Frontend build fails:
- Check Netlify build logs
- Verify Node version (18)
- Check for missing dependencies
- Test `npm run build` locally

### CORS errors:
- Verify `FRONTEND_URL` matches Netlify URL
- Check `ALLOWED_ORIGINS` includes frontend
- Ensure no trailing slashes in URLs

### Database connection fails:
- Check MongoDB Atlas network access
- Add Render IP to whitelist (or allow 0.0.0.0/0)
- Verify connection string format
- Test connection locally

### OAuth redirect fails:
- Update Facebook Developer Console with production URIs
- Verify `META_REDIRECT_URI` matches backend URL
- Check Instagram app settings
- Test OAuth flow in incognito mode

---

## 📞 SUPPORT RESOURCES

- **Render Docs**: https://render.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **MongoDB Atlas**: https://www.mongodb.com/docs/atlas/
- **Facebook Developer**: https://developers.facebook.com/support

---

## ✅ DEPLOYMENT COMPLETION CHECKLIST

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Netlify
- [ ] All environment variables configured
- [ ] OAuth redirect URIs updated
- [ ] Health check endpoint responding
- [ ] MongoDB connected successfully
- [ ] HTTPS active on both domains
- [ ] Custom domains configured (if applicable)
- [ ] Registration flow tested
- [ ] Login flow tested
- [ ] Creator onboarding tested
- [ ] Instagram OAuth tested
- [ ] Mobile UI verified
- [ ] Admin dashboard accessible
- [ ] Email notifications working
- [ ] Monitoring configured
- [ ] Rollback procedure documented
- [ ] Team notified of deployment

---

**Deployment Complete!** 🎉

Monitor logs for 24 hours and perform regular smoke tests.

---

**Need Help?**
Contact: hello@auraxai.in
