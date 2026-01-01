# 🚀 PRODUCTION DEPLOYMENT CHECKLIST
**Date:** December 31, 2025  
**Status:** ⚠️ BLOCKERS FOUND - DO NOT DEPLOY

---

## ❌ CRITICAL BLOCKERS (Must Fix Before Deployment)

### 🔴 **BLOCKER #1: Localhost References in Production Code**
**Status:** ❌ FAILED  
**Severity:** CRITICAL - Will break production

**Files with localhost:**
- ❌ `backend-copy/server.js` - 11 instances (lines 807-809, 2094, 2401-2403, 2886-2888, 2915)
- ❌ `src/context/AuthContext.js` - 2 instances (lines 32, 113)
- ❌ `src/pages/CreatorDashboardNew.js` - 2 instances (lines 269, 276)
- ❌ `src/pages/MinimalWelcome.js` - 2 instances (lines 46, 128)
- ❌ `src/pages/PublicPageSetup.js` - 3 instances (lines 46, 88, 188)
- ❌ `src/pages/PublicCreatorPage.js` - 2 instances (lines 38, 67)
- ❌ `src/pages/CreatorOnboardingNew.js` - 7 instances
- ❌ `src/services/authService.js` - 1 instance (line 38)
- ❌ `src/setupProxy.js` - 1 instance (line 7)
- ❌ `src/components/EmailVerificationBanner.jsx` - 1 instance (line 19)

**Impact:** API calls will fail in production, OAuth callbacks will break

**Fix Required:** Replace all hardcoded localhost URLs with environment variables

---

### 🔴 **BLOCKER #2: Hardcoded Production URLs**
**Status:** ❌ FAILED  
**Severity:** HIGH - Limits flexibility

**Found in:**
- `backend-copy/server.js` lines 807-815 - Hardcoded Netlify & Render URLs in CORS
- `backend-copy/server.js` lines 2401-2410 - Hardcoded URLs in health endpoint
- `backend-copy/server.js` lines 2886-2893 - Hardcoded URLs in error handler

**Fix Required:** Move to `ALLOWED_ORIGINS` environment variable (comma-separated)

---

## ✅ SECURITY CHECKS

### A. Repository & Branch Safety

| Check | Status | Notes |
|-------|--------|-------|
| ✅ .env never committed | PASS | .gitignore configured correctly |
| ✅ .env.example exists | PASS | Both frontend & backend have examples |
| ✅ .gitignore correct | PASS | Includes env, node_modules, build |
| ⚠️ Secrets removed from git history | MANUAL | **ACTION:** Run `git log --all --full-history -- "*.env"` to verify |
| ⚠️ main branch protected | MANUAL | **ACTION:** Configure in GitHub repo settings |
| ⚠️ PR required | MANUAL | **ACTION:** Enable branch protection rules |

**Git History Verification Command:**
```bash
# Check if .env was ever committed
git log --all --full-history -- "*.env"
git log --all --full-history -- "**/backend.env"

# If found, remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

### B. Environment Configuration Validation

| Check | Status | Required Variables |
|-------|--------|-------------------|
| ✅ .env.example complete | PASS | All variables documented |
| ❌ localhost references | **FAIL** | **30+ instances found** |
| ❌ Hardcoded secrets | **FAIL** | Hardcoded URLs in multiple files |
| ✅ NODE_ENV check | PASS | Used in server.js |
| ⚠️ Frontend URL matches | PENDING | Update after Netlify deployment |
| ⚠️ Instagram redirect URI | PENDING | Update after Render deployment |

**Backend Required Variables (.env):**
```env
# MUST SET IN RENDER
PORT=5002
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=[GENERATE 32+ chars]
SESSION_SECRET=[GENERATE 32+ chars]
COOKIE_SECRET=[GENERATE 32+ chars]

META_APP_ID=[From Facebook Developer]
META_APP_SECRET=[From Facebook Developer]
META_REDIRECT_URI=https://YOUR-BACKEND.onrender.com/api/auth/instagram/callback

FRONTEND_URL=https://YOUR-APP.netlify.app
BACKEND_URL=https://YOUR-BACKEND.onrender.com
ALLOWED_ORIGINS=https://YOUR-APP.netlify.app,https://YOUR-BACKEND.onrender.com

MAILERSEND_API_KEY=[From MailerSend]
FROM_EMAIL=noreply@auraxai.in
FROM_NAME=AURAX AI
```

**Frontend Required Variables (.env):**
```env
# MUST SET IN NETLIFY
REACT_APP_API_URL=https://YOUR-BACKEND.onrender.com
REACT_APP_NAME=AURAX AI
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_OTP_VERIFICATION=true
```

---

### C. Dependency & Build Integrity

| Check | Status | Command | Notes |
|-------|--------|---------|-------|
| ⚠️ npm install (backend) | PENDING | `cd backend-copy && npm install` | Test clean install |
| ⚠️ npm install (frontend) | PENDING | `npm install` | Test clean install |
| ⚠️ npm run build (frontend) | PENDING | `npm run build` | Must succeed without errors |
| ⚠️ Vulnerability scan | PENDING | `npm audit` | Fix high/critical issues |
| ✅ Lock file committed | PASS | package-lock.json exists |
| ⚠️ Deprecated packages | PENDING | Check npm warnings |

**Test Commands:**
```bash
# Backend
cd backend-copy
rm -rf node_modules package-lock.json
npm install
npm audit --audit-level=high
npm start

# Frontend
cd ..
rm -rf node_modules package-lock.json
npm install
npm audit --audit-level=high
npm run build
```

---

### D. Runtime Safety Checks

| Check | Status | Location | Notes |
|-------|--------|----------|-------|
| ✅ Listens on process.env.PORT | PASS | server.js:88 | `const PORT = process.env.PORT \|\| 5002` |
| ⚠️ Server boots without warnings | PENDING | Test locally | Run and check console |
| ⚠️ Health endpoint returns 200 | PENDING | /api/health | Test: `curl http://localhost:5002/api/health` |
| ✅ Graceful error handling | PASS | server.js:2896 | Global error middleware exists |
| ⚠️ Unhandled rejection handling | PENDING | Check process handlers | Add if missing |

**Server Startup Log Check:**
```bash
# Run backend and look for:
✅ "Backend server running on..." 
✅ "MongoDB Atlas connection successful"
✅ No deprecation warnings
✅ No "localhost" in production logs

# Health check:
curl https://YOUR-BACKEND.onrender.com/api/health
# Should return: {"status":"ok","environment":"production"}
```

---

## 📋 PRE-DEPLOYMENT ACTIONS

### 1. Fix All Localhost References
**Priority:** CRITICAL  
**Time Estimate:** 30 minutes

Create a utility to use environment variables everywhere:

**Backend Fix:** Update `backend-copy/server.js`
- Lines 807-815: Replace hardcoded origins with `process.env.ALLOWED_ORIGINS.split(',')`
- Lines 2094: Replace with `process.env.META_REDIRECT_URI`
- Lines 2401-2410: Use `ALLOWED_ORIGINS` env var
- Lines 2886-2893: Use `ALLOWED_ORIGINS` env var
- Line 2915: Update log to show `BASE_URL` instead of localhost

**Frontend Fix:** Create API utility function
```javascript
// src/utils/getApiUrl.js
export const getApiUrl = () => {
  if (!process.env.REACT_APP_API_URL) {
    throw new Error('REACT_APP_API_URL environment variable is required');
  }
  return process.env.REACT_APP_API_URL;
};
```

Replace all instances:
- `src/context/AuthContext.js` - Use `getApiUrl()`
- `src/pages/CreatorDashboardNew.js` - Use `getApiUrl()`
- `src/pages/MinimalWelcome.js` - Use `getApiUrl()`
- `src/pages/PublicPageSetup.js` - Use `getApiUrl()`
- `src/pages/PublicCreatorPage.js` - Use `getApiUrl()`
- `src/pages/CreatorOnboardingNew.js` - Use `getApiUrl()`
- `src/services/authService.js` - Use `getApiUrl()`
- `src/components/EmailVerificationBanner.jsx` - Use `getApiUrl()`

### 2. Update .gitignore
**Priority:** HIGH  
**Time Estimate:** 2 minutes

Verify .gitignore includes:
```
# Environment files
.env
.env.*
*.env
backend.env

# Dependencies
node_modules/
backend-copy/node_modules/

# Build outputs
build/
dist/
.next/

# Logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
```

### 3. Test Build Process
**Priority:** HIGH  
**Time Estimate:** 10 minutes

```bash
# Frontend
npm run build
# Check for:
# ✅ Build completes without errors
# ✅ No console warnings about missing env vars
# ✅ Build output in /build directory
# ✅ Assets properly hashed

# Backend
cd backend-copy
npm start
# Check for:
# ✅ Server starts without errors
# ✅ MongoDB connection successful
# ✅ No deprecation warnings
```

### 4. Generate Secure Secrets
**Priority:** CRITICAL  
**Time Estimate:** 5 minutes

```bash
# Linux/Mac
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # SESSION_SECRET
openssl rand -base64 32  # COOKIE_SECRET

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 5. Configure GitHub Repository
**Priority:** HIGH  
**Time Estimate:** 5 minutes

1. Go to Settings → Branches
2. Add branch protection rule for `main`:
   - ✅ Require pull request before merging
   - ✅ Require approvals: 1
   - ✅ Dismiss stale reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators

---

## 🚀 DEPLOYMENT SEQUENCE

### Phase 1: Backend Deployment (Render.com)

1. **Create New Web Service**
   - Connect GitHub repository: `influencer-backend`
   - Branch: `main`
   - Root Directory: `backend-copy`
   - Build Command: `npm install`
   - Start Command: `npm start`

2. **Set Environment Variables** (15 variables)
   ```
   NODE_ENV=production
   MONGODB_URI=[Your MongoDB Atlas URI]
   JWT_SECRET=[Generated secret]
   SESSION_SECRET=[Generated secret]
   COOKIE_SECRET=[Generated secret]
   META_APP_ID=[Facebook App ID]
   META_APP_SECRET=[Facebook App Secret]
   META_REDIRECT_URI=https://YOUR-APP.onrender.com/api/auth/instagram/callback
   FRONTEND_URL=https://YOUR-APP.netlify.app
   BACKEND_URL=https://YOUR-APP.onrender.com
   ALLOWED_ORIGINS=https://YOUR-APP.netlify.app
   MAILERSEND_API_KEY=[Your key]
   FROM_EMAIL=noreply@auraxai.in
   FROM_NAME=AURAX AI
   PORT=5002
   ```

3. **Verify Deployment**
   - Check logs for successful startup
   - Test health endpoint: `https://YOUR-APP.onrender.com/api/health`
   - Verify MongoDB connection

### Phase 2: Frontend Deployment (Netlify)

1. **Create New Site**
   - Connect GitHub repository: `Aurax-frontend-app`
   - Branch: `main`
   - Build Command: `npm run build`
   - Publish Directory: `build`

2. **Set Environment Variables** (4 variables)
   ```
   REACT_APP_API_URL=https://YOUR-BACKEND.onrender.com
   REACT_APP_NAME=AURAX AI
   REACT_APP_ENVIRONMENT=production
   REACT_APP_ENABLE_OTP_VERIFICATION=true
   ```

3. **Configure Redirects**
   Create `public/_redirects`:
   ```
   /* /index.html 200
   ```

4. **Verify Deployment**
   - Test site loads
   - Check console for errors
   - Verify API connection

### Phase 3: Meta App Configuration

1. **Update Facebook App Settings**
   - Go to Meta for Developers
   - Select your app
   - Add Production Domains:
     - `YOUR-APP.netlify.app`
     - `YOUR-BACKEND.onrender.com`
   
2. **Update OAuth Redirect URIs**
   - Instagram Basic Display → OAuth Redirect URIs:
     - `https://YOUR-BACKEND.onrender.com/api/auth/instagram/callback`
   
3. **Switch to Live Mode**
   - Change app mode from Development to Live
   - Submit for review if needed

---

## ✅ POST-DEPLOYMENT TESTING

### 1. Basic Functionality (5 min)
- [ ] Homepage loads without errors
- [ ] Navigation works
- [ ] Footer displays correctly
- [ ] Images load

### 2. Authentication Flow (10 min)
- [ ] Creator signup works
- [ ] Email verification sends
- [ ] Login successful
- [ ] Logout works
- [ ] Session persists on refresh

### 3. Instagram OAuth (10 min)
- [ ] "Connect Instagram" button works
- [ ] Redirects to Instagram
- [ ] Callback successful
- [ ] Profile data syncs
- [ ] Disconnect works

### 4. Creator Dashboard (10 min)
- [ ] Dashboard loads
- [ ] Profile updates save
- [ ] Image upload works
- [ ] Public page URL works
- [ ] Analytics display

### 5. Public Creator Page (5 min)
- [ ] Public page loads at /creator/:slug
- [ ] Subscription button works
- [ ] Social links work
- [ ] Image gallery displays

### 6. Error Handling (5 min)
- [ ] Invalid routes redirect
- [ ] API errors show friendly messages
- [ ] Network errors handled
- [ ] Unauthorized access blocked

---

## 🔍 MONITORING SETUP

### Backend Logs (Render)
```bash
# Access logs
render logs -t aurax-backend

# Look for:
❌ Unhandled errors
❌ Failed database connections
❌ OAuth failures
✅ Successful requests
```

### Frontend Analytics (Netlify)
- Enable Netlify Analytics
- Monitor:
  - Page load times
  - API call failures
  - 404 errors
  - User sessions

### Database Monitoring (MongoDB Atlas)
- Set up alerts for:
  - High CPU usage
  - Connection spikes
  - Slow queries
  - Storage limits

---

## 🚨 ROLLBACK PLAN

If deployment fails:

1. **Immediate Actions**
   - Revert to previous Netlify deployment
   - Roll back Render deployment
   - Check error logs

2. **Communication**
   - Update status page
   - Notify team
   - Document issues

3. **Investigation**
   - Review deployment logs
   - Check environment variables
   - Test locally
   - Fix issues in development

---

## 📊 FINAL CHECKLIST SUMMARY

| Category | Status | Blockers |
|----------|--------|----------|
| Repository Safety | ⚠️ PARTIAL | Git history check needed |
| Environment Config | ❌ **FAILED** | **30+ localhost references** |
| Dependencies | ⚠️ PENDING | Build tests needed |
| Runtime Safety | ⚠️ PARTIAL | Health checks needed |
| **OVERALL STATUS** | **❌ NOT READY** | **Fix localhost first** |

---

## 🎯 NEXT IMMEDIATE ACTIONS

1. **FIX LOCALHOST REFERENCES** (CRITICAL)
   - Create API utility function
   - Replace all 30+ instances
   - Test locally
   - Commit changes

2. **RUN BUILD TESTS**
   - Test npm install clean
   - Test npm run build
   - Fix any build errors

3. **GENERATE SECRETS**
   - Create JWT_SECRET
   - Create SESSION_SECRET
   - Create COOKIE_SECRET
   - Store securely

4. **VERIFY GIT HISTORY**
   - Check for committed .env
   - Clean if needed
   - Update .gitignore

5. **CONFIGURE GITHUB**
   - Enable branch protection
   - Require PR approvals
   - Add status checks

---

## 📞 SUPPORT CONTACTS

- **MongoDB Atlas:** support@mongodb.com
- **Render:** help@render.com
- **Netlify:** support@netlify.com
- **Meta Developers:** developers.facebook.com/support

---

**⚠️ DO NOT PROCEED WITH DEPLOYMENT UNTIL ALL ❌ BLOCKERS ARE RESOLVED**

**Last Updated:** December 31, 2025  
**Next Review:** After localhost fixes
