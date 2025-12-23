# Instagram Graph API Integration - Complete Setup Guide

## Overview

This implementation provides a complete first-run social connect flow for AuraxAI, requiring users to connect their Instagram Business Account after login before accessing their dashboard.

## Features

✅ Facebook OAuth authentication  
✅ Instagram Business Account connection  
✅ Automatic profile data fetching  
✅ Background Instagram analysis with BullMQ  
✅ Real-time progress polling  
✅ Comprehensive error handling  
✅ Middleware-based access control  

---

## Quick Start

### 1. Start Redis

```bash
# Windows (Memurai) or Docker
docker run -d -p 6379:6379 redis:alpine

# Mac
brew services start redis

# Linux
sudo systemctl start redis
```

### 2. Start Backend

```bash
cd backend-copy
npm start
```

### 3. Start Frontend

```bash
cd frontend-copy  
npm start
```

### 4. Test Flow

1. Login at `http://localhost:3000/login`
2. You'll be redirected to `/connect-socials`
3. Click "Connect Instagram Account"
4. Complete Facebook OAuth
5. Watch analysis progress
6. Redirected to dashboard when complete

---

## API Endpoints Reference

### OAuth
- `GET /api/auth/facebook` - Initiate OAuth
- `GET /api/auth/facebook/callback` - OAuth callback
- `GET /api/auth/instagram/status` - Connection status
- `POST /api/auth/disconnect-instagram` - Disconnect

### Analysis
- `GET /api/analysis/status` - Analysis progress
- `GET /api/analysis/job/:jobId` - Job details
- `POST /api/analysis/retry` - Retry failed analysis

### User
- `GET /api/me` - Current user with `profilesConnected` status

---

## Facebook App Setup

**App ID:** 1975238456624246

### Valid OAuth Redirect URIs

Development:
- `http://localhost:5002/api/auth/facebook/callback`
- `http://localhost:3000/connect-socials`

Production:
- `https://www.auraxai.in/api/auth/facebook/callback`
- `https://www.auraxai.in/connect-socials`

### Required Permissions

- `public_profile`
- `pages_show_list`
- `pages_read_engagement`
- `instagram_basic`
- `instagram_manage_insights`
- `read_insights`

---

## Architecture

### Backend Stack
- **Auth:** Passport.js + Facebook Strategy
- **Queue:** BullMQ + Redis
- **Database:** MongoDB (Mongoose)
- **Sessions:** express-session

### Models
- `User` - Added `profilesConnected`, `hasCompletedOnboarding`
- `SocialAccount` - Instagram/Facebook tokens & profile data

### Services
- `instagramGraphService` - Graph API wrapper
- `otpService` - Existing OTP service

### Workers
- `instagramAnalysisWorker` - Background analysis job

### Middleware
- `requireProfilesConnected` - First-run redirect
- `addProfileStatus` - Add status to requests

---

## Flow Diagram

```
User Login
    ↓
GET /api/me
    ↓
profilesConnected = false?
    ↓ YES
Redirect to /connect-socials
    ↓
Click "Connect Instagram"
    ↓
GET /api/auth/facebook
    ↓
Facebook OAuth Dialog
    ↓
GET /api/auth/facebook/callback
    ↓
Fetch Pages → Get IG Account → Fetch Profile
    ↓
Queue Analysis Job
    ↓
Redirect to /connect-socials?status=analyzing
    ↓
Poll GET /api/analysis/status
    ↓
Analysis Complete
    ↓
Update profilesConnected = true
    ↓
Redirect to /dashboard
```

---

## Analysis Metrics

The worker calculates:

1. **Engagement Rate**
   - Formula: `(likes + comments) / (posts × followers) × 100`
   - Example: 4.2%

2. **Average Reach**
   - Average of reach metric from insights
   - Example: 12,000

3. **Posting Frequency**
   - Posts per week based on date range
   - Example: "3.5 posts/week"

4. **Best Posting Times**
   - Top 5 day/hour combinations by engagement
   - Example: `[{day: "Monday", hour: 14}, ...]`

---

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `facebook_auth_failed` | OAuth denied | Retry auth |
| `no_pages_found` | No FB pages | Create page |
| `no_instagram_account` | No IG Business | Convert account |
| `profile_fetch_failed` | API error | Check permissions |

---

## Production Checklist

- [ ] Update `FACEBOOK_CALLBACK_URL` to production URL
- [ ] Set `NODE_ENV=production`
- [ ] Use managed Redis service
- [ ] Set strong `SESSION_SECRET`
- [ ] Enable HTTPS
- [ ] Submit Facebook app for review
- [ ] Test OAuth flow end-to-end
- [ ] Monitor worker with Bull Board

---

## File Structure

```
backend-copy/
├── config/
│   └── passport.js               # Facebook strategy
├── middleware/
│   └── profilesConnected.js      # First-run middleware
├── models/
│   ├── User.js                   # Updated user model
│   └── SocialAccount.js          # New social account model
├── routes/
│   ├── socialAuth.js             # OAuth routes
│   └── analysis.js               # Analysis endpoints
├── services/
│   └── instagramGraphService.js  # Graph API service
├── workers/
│   └── instagramAnalysisWorker.js # BullMQ worker
└── .env                          # Environment variables

frontend-copy/
└── src/
    └── pages/
        ├── ConnectSocials.js     # Connection UI
        └── ConnectSocials.css    # Styles
```

---

## Troubleshooting

### Redis Connection Failed
```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG
```

### Facebook OAuth Fails
- Check redirect URIs match exactly
- Verify app is not in development mode restriction
- Check permissions are granted

### Analysis Stuck
- Check worker is running
- View job status in Redis
- Check Instagram permissions

### Profile Not Connected
- Verify analysis completed successfully
- Check `User.profilesConnected` in database
- Clear session and try again

---

**Documentation Version:** 1.0.0  
**Last Updated:** November 26, 2025  
**Support:** support@auraxai.in
