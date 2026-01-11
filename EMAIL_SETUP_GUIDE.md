# Email Configuration Fix Guide

## Issue: Emails Not Being Sent

The current `BREVO_API_KEY` in your `.env` file is a **placeholder/dummy key** and will not work.

### Error in logs:
```
❌ Brevo email failed: {
  error: 'Key not found',
  code: 'unauthorized',
}
```

---

## ✅ Solution: Get a Real Brevo API Key

### Step 1: Sign up for Brevo (FREE)
1. Go to https://www.brevo.com/
2. Click "Sign up free"
3. Complete registration with your email
4. Verify your email address

### Step 2: Get Your API Key
1. Login to Brevo dashboard
2. Go to **Settings** (top right) → **SMTP & API**
3. Click on **API Keys** tab
4. Click **"Generate a new API key"**
5. Name it: `AURAX Development` or `Creator Onboarding`
6. Copy the generated key (starts with `xkeysib-...`)

### Step 3: Update Your .env File
Open `backend-copy/.env` and replace the dummy key:

```env
# OLD (Dummy key - doesn't work)
BREVO_API_KEY=xkeysib-5b2a1c3f4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1

# NEW (Your real API key)
BREVO_API_KEY=xkeysib-YOUR_ACTUAL_KEY_HERE
```

### Step 4: Restart Backend Server
```bash
# Stop the current server (Ctrl+C)
# Start again
npm start
```

---

## 📧 Brevo Free Tier Limits

✅ **300 emails/day** (FREE forever)  
✅ Unlimited contacts  
✅ Professional email templates  
✅ Real-time analytics  

This is more than enough for development and testing!

---

## Alternative: Use MailerSend (Already Configured)

You already have `MAILERSEND_API_KEY` configured. You can switch to MailerSend instead:

### Option A: Use MailerSend for creator onboarding
Update `creatorOnboarding.js` to use MailerSend service instead of Brevo.

### Option B: Keep Brevo for transactional emails
Brevo is better for transactional emails (OTP, verification, notifications).  
MailerSend is better for marketing emails.

---

## 🔧 Temporary Workaround: Manual Admin Actions

Until you get a valid API key, you can manually approve/reject creators using the command-line tool:

```bash
# List pending creators
node manual-creator-admin.js list pending

# Approve a creator
node manual-creator-admin.js approve saurabhchandan05@gmail.com

# Reject a creator
node manual-creator-admin.js reject test@test.com "Profile incomplete"

# Check status
node manual-creator-admin.js status saurabhchandan05@gmail.com
```

---

## 🎯 Quick Test After Setup

1. Get real Brevo API key
2. Update `.env` file
3. Restart server
4. Submit a test profile
5. Check logs for: `✅ Admin notification email sent successfully`
6. Check `hello@auraxai.in` inbox for email

---

## 📝 Email Configuration Summary

### Current Setup:
- **FROM:** hello@auraxai.in
- **TO (Admin):** hello@auraxai.in  
- **TO (Creator):** Creator's email from profile
- **Service:** Brevo HTTP API (Port 443 - works on all platforms)

### Email Types Sent:
1. **Profile Submission** → Admin gets notification
2. **Profile Submission** → Creator gets confirmation
3. **Approval** → Creator gets welcome email with dashboard link
4. **Rejection** → Creator gets rejection email with reason

---

## ❓ Still Having Issues?

### Check Brevo Dashboard:
- **Logs** → See all sent/failed emails
- **Statistics** → View delivery rates
- **Sender Settings** → Verify domain authentication

### Check Backend Logs:
```bash
# Watch for these messages:
✅ Admin notification email sent successfully
✅ Creator confirmation email sent successfully
✅ Approval email sent successfully

# Or errors:
❌ Brevo email failed: { error: '...', code: '...' }
```

### Verify Configuration:
```bash
# Check if API key is loaded
node -e "require('dotenv').config(); console.log('Key:', process.env.BREVO_API_KEY?.substring(0, 20) + '...')"
```

---

## 🚀 After Email Setup Works

Once emails are working, the complete flow will be:

1. ✅ Creator submits profile
2. ✅ Profile saved with status: `pending`
3. ✅ Admin receives email at `hello@auraxai.in`
4. ✅ Creator receives confirmation email
5. ✅ Admin approves/rejects from admin panel or CLI tool
6. ✅ Creator receives approval/rejection email
7. ✅ Creator's dashboard reflects new status automatically

---

**Need help?** Check Brevo documentation: https://developers.brevo.com/docs
