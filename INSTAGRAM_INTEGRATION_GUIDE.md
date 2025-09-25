# 📱 Instagram Insights Integration Guide for Aurax Dashboard

This guide will help you integrate Instagram Business Account insights into your Aurax creator dashboard with automated daily sync.

## 🎯 Overview

The integration provides:

- ✅ Real-time Instagram insights (impressions, reach, engagement)
- ✅ Automated daily sync to your Aurax dashboard
- ✅ Profile metrics and post performance analytics
- ✅ Beautiful visual dashboard with charts and recommendations
- ✅ Windows Task Scheduler automation

## 📋 Prerequisites

1. **Instagram Business Account** linked to a Facebook Page
2. **Meta Developer App** with Instagram Basic Display API access
3. **Valid Access Token** (you have: `IGAAcE...`)
4. **Node.js** installed on your system
5. **Windows 10/11** (for Task Scheduler automation)

## 🚀 Quick Setup

### Step 1: Environment Configuration

1. Copy the Instagram environment template:

   ```powershell
   cp .env.instagram.example .env
   ```

2. Update `.env` with your credentials:
   ```env
   REACT_APP_INSTAGRAM_ACCESS_TOKEN=IGAAcEeAqNxHZABZAE1wZAlYyWThkei12QmlvYVlaejRIQXBrMElyZAE0zX0VFT1VLZAm9oeTZAqeHVJcFJQYjdEVTJ1ZAktvdUQ1MGF6dS1SZA0tENjladVZAUd2VfdFNmSmtWdlQ5Mm5Db3QtSHNmdk9pd3BWX0lMUzAySEVWNy11cGJYWQZDZD
   ```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Test the Integration

1. Start your frontend:

   ```bash
   npm start
   ```

2. Navigate to the Creator Dashboard
3. Look for the "📱 Instagram Insights" section
4. Click "🔄 Test Sync Now" to verify connection

### Step 4: Setup Automated Sync

1. **Run as Administrator** - Open PowerShell as Administrator
2. **Navigate to project**:
   ```powershell
   cd "C:\Users\hp\OneDrive\Desktop\frontend-copy"
   ```
3. **Run setup script**:
   ```powershell
   .\scripts\setup-instagram-scheduler.ps1
   ```
4. **Follow prompts** to configure daily sync time

## 📊 Features Included

### Dashboard Components

1. **InstagramInsights.jsx** - Main dashboard component

   - Real-time metrics display
   - Interactive charts (Line, Doughnut, Bar)
   - Recent posts performance
   - AI-powered recommendations

2. **InstagramSyncSettings.jsx** - Configuration panel
   - Auto-sync toggle
   - Schedule time selection
   - Notification preferences
   - Connection testing

### API Services

1. **instagramAPI.js** - Instagram Graph API client

   - Authentication handling
   - Metrics fetching (impressions, reach, engagement)
   - Error handling and retry logic
   - Data formatting for dashboard

2. **instagramScheduler.js** - Automation service
   - Daily sync scheduling
   - Browser notifications
   - Status tracking
   - Manual sync capabilities

### Backend Integration

1. **backend-instagram-endpoints.js** - API endpoints
   - `/analytics/instagram-sync` - Receive sync data
   - `/analytics/instagram/:userId` - Get user insights
   - `/analytics/instagram-summary/:userId` - Get metrics summary

## 🔧 Configuration Options

### Sync Settings

```javascript
{
  autoSync: true,                    // Enable/disable auto sync
  scheduledTime: "09:00",           // Daily sync time (24-hour format)
  notificationsEnabled: true,       // Browser notifications
  maxPostsFetch: 25,                // Posts to analyze per sync
  syncInterval: 86400000            // 24 hours in milliseconds
}
```

### API Configuration

```javascript
// Instagram API limits
const API_LIMITS = {
  requests_per_hour: 200, // Instagram API limit
  posts_per_request: 25, // Max posts per API call
  insights_retention: 30, // Days of insights data
  sync_frequency: "daily", // Minimum sync frequency
};
```

## 📈 Metrics Collected

### Profile Metrics

- Followers count
- Following count
- Media count
- Profile picture URL

### Post Metrics (per post)

- Impressions
- Reach
- Engagement (total)
- Likes
- Comments
- Shares
- Saves
- Engagement rate (calculated)

### Aggregated Analytics

- Total impressions (last 10 posts)
- Total reach (last 10 posts)
- Average engagement rate
- Best performing posts
- Audience insights
- Growth trends

## 🛠️ Troubleshooting

### Common Issues

1. **"Authentication failed"**

   ```
   ❌ Check if your access token is valid
   ✅ Solution: Regenerate token in Meta Developer Console
   ```

2. **"No insights data"**

   ```
   ❌ Instagram Business Account required for insights
   ✅ Solution: Convert personal account to business account
   ```

3. **"Task Scheduler failed"**

   ```
   ❌ Need Administrator privileges
   ✅ Solution: Run PowerShell as Administrator
   ```

4. **"Network timeout"**
   ```
   ❌ Instagram API rate limiting or connection issues
   ✅ Solution: Wait and retry, check internet connection
   ```

### Log Locations

- **Frontend logs**: Browser Developer Console
- **Sync logs**: `C:\Users\hp\OneDrive\Desktop\frontend-copy\logs\`
- **Task Scheduler logs**: Windows Event Viewer > Task Scheduler

## 🔍 Testing & Verification

### Manual Testing

1. **API Connection Test**:

   ```javascript
   // In browser console
   InstagramAPI.authenticate().then(console.log);
   ```

2. **Sync Test**:

   ```javascript
   // In browser console
   InstagramAPI.performFullSync().then(console.log);
   ```

3. **Scheduler Test**:
   ```powershell
   # In PowerShell (as Admin)
   Start-ScheduledTask -TaskName "AuraxInstagramSync"
   ```

### Verification Checklist

- [ ] Instagram Business Account linked
- [ ] Meta Developer App configured
- [ ] Access token working
- [ ] Dashboard showing Instagram insights
- [ ] Auto-sync scheduled and working
- [ ] Backend receiving synced data
- [ ] Notifications working (if enabled)

## 🔐 Security & Privacy

### Data Protection

- API calls are encrypted (HTTPS)
- Access tokens stored securely in environment variables
- Only public metrics are collected (no private data)
- Regular token rotation recommended

### Privacy Compliance

- Only collects publicly available Instagram metrics
- No personal information or private messages accessed
- Data stored locally in your Aurax dashboard
- User controls all data sync and retention

## 📞 Support

### Resources

- Instagram Basic Display API: https://developers.facebook.com/docs/instagram-basic-display-api
- Meta Developer Console: https://developers.facebook.com/apps/
- Task Scheduler Guide: Windows documentation

### Getting Help

1. Check logs in `logs/` directory
2. Verify Instagram API status
3. Test individual components
4. Check Windows Task Scheduler status

## 🚀 Next Steps

1. **✅ Complete Setup** - Follow this guide to get Instagram insights working
2. **📊 Customize Dashboard** - Modify components to match your brand
3. **🔧 Extend Features** - Add more social platforms (TikTok, YouTube)
4. **📈 Analytics** - Use insights for content optimization
5. **🤖 AI Integration** - Connect insights to AI content recommendations

---

**🎉 You're all set!** Your Instagram insights will now sync automatically to your Aurax dashboard every day. Check back tomorrow to see your data!

**Support**: If you encounter issues, check the troubleshooting section above or review the logs for detailed error information.
