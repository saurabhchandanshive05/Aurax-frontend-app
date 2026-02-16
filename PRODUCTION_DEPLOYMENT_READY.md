# AURAX Production Deployment Checklist ✅

## Pre-Deployment Status

### ✅ Frontend (Netlify)
- [x] Console.logs removed from production code (43 files cleaned)
- [x] Production build tested successfully  
- [x] Environment variables configured (.env.production)
- [x] LinkedIn badge rendering fixed
- [x] No hardcoded secrets in codebase
- [x] Build warnings reviewed (non-breaking)

### ✅ Backend (Render)
- [x] Environment files in .gitignore
- [x] Production environment template created
- [x] MongoDB connection configured
- [x] SMTP settings ready (Hostinger)
- [x] CORS configured for production domains

## Environment Variables

### Frontend (Netlify)
Configure in Netlify dashboard:
```
REACT_APP_API_URL=https://influencer-backend-7.onrender.com
REACT_APP_ENVIRONMENT=production
NODE_ENV=production
```

### Backend (Render)
Configure in Render dashboard (**DO NOT commit these**):
```
PORT=10000
NODE_ENV=production
MONGODB_URI=mongodb+srv://[username]:[password]@cluster0.jgx4opz.mongodb.net/...
JWT_SECRET=[generate-secure-secret]
FRONTEND_URL=https://aaurax.netlify.app
BACKEND_URL=https://influencer-backend-7.onrender.com
IS_PRODUCTION=true

# Email (Hostinger SMTP)
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=hello@auraxai.in
SMTP_PASS=[smtp-password]

# Instagram OAuth  
INSTAGRAM_CLIENT_ID=[your-instagram-app-id]
INSTAGRAM_CLIENT_SECRET=[your-instagram-app-secret]
INSTAGRAM_REDIRECT_URI=https://aaurax.netlify.app/creator/dashboard
```

## OAuth Redirect URIs

### Instagram Graph API
Update in Facebook Developer Console:
- Valid OAuth Redirect URIs: `https://aaurax.netlify.app/creator/dashboard`
- Remove all localhost URLs from production app

## Deployment Steps

### 1. Frontend to Netlify
```bash
cd C:\Users\hp\OneDrive\Desktop\frontend-copy
git add .
git commit -m "Production ready: Remove console.logs, fix LinkedIn badges, optimize build"
git push origin main
```

Netlify will auto-deploy from main branch.

### 2. Backend to Render
```bash
cd C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
git add .
git commit -m "Production ready: Configure environment, update CORS, optimize logging"
git push origin main
```

Render will auto-deploy from main branch.

## Post-Deployment Verification

### Frontend Checks
- [ ] Browse to https://aaurax.netlify.app
- [ ] Test mobile layout (no horizontal scroll)
- [ ] Verify LinkedIn badges render correctly
- [ ] Test login flow (Creator + Brand)
- [ ] Check browser console (no errors)

### Backend Checks
- [ ] Health check: `https://influencer-backend-7.onrender.com/health`
- [ ] API responds: `https://influencer-backend-7.onrender.com/api/test`
- [ ] Check Render logs for startup errors
- [ ] Verify MongoDB connection successful

### User Flows
- [ ] Creator Login → Onboarding → Dashboard
- [ ] Brand Login → Dashboard
- [ ] Admin Login → Campaign Curator
- [ ] Instagram OAuth → Connect Account
- [ ] Logout clears session correctly

## Rollback Plan

If deployment fails:
1. Check Render/Netlify logs for error details
2. Verify environment variables are set correctly
3. Use Git to revert to previous commit:
   ```bash
   git revert HEAD
   git push origin main
   ```

## Security Checklist

- [x] No .env files committed to Git
- [x] Secrets stored in Render/Netlify dashboards only
- [x] CORS restricted to production domains
- [x] Rate limiting enabled
- [x] Helmet security headers active
- [x] JWT secrets are strong and unique

## Monitoring

- **Frontend**: Netlify Analytics + Browser DevTools
- **Backend**: Render Logs + MongoDB Atlas monitoring
- **Errors**: Check console.error output in Render logs

## Current Status
✅ **Ready for deployment**

Last build: ${new Date().toISOString()}
Frontend build: SUCCESS
Backend configured: SUCCESS
