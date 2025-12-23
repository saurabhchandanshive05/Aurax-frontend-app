# MailerSend Integration Guide

## Overview

This project uses **MailerSend** for professional transactional email delivery, including:
- OTP verification codes for registration and login
- Password reset emails with verification codes
- Welcome emails for new users

## Features

✅ **Professional Email Templates** - Beautiful HTML emails with gradient designs  
✅ **OTP System** - 6-digit verification codes with expiry (15 minutes default)  
✅ **Password Reset Flow** - Secure two-step password reset process  
✅ **Development Mode** - OTP codes exposed in API responses for testing  
✅ **Fallback Support** - Hostinger SMTP as backup email service  

## Quick Start

### 1. Environment Setup

Copy the environment example files:

```bash
# Backend
cd backend-copy
cp .env.example .env

# Frontend
cd ../frontend-copy
cp .env.example .env
```

### 2. Configure MailerSend

Edit `backend-copy/.env` and add your MailerSend credentials:

```env
# MailerSend Configuration
MAILERSEND_API_KEY=your_mailersend_api_key_here
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your App Name

# OTP Configuration
OTP_TTL_SECONDS=900          # 15 minutes
MAX_OTP_ATTEMPTS=3           # Maximum verification attempts
OTP_RATE_LIMIT=5             # Maximum OTP requests per hour
```

**Get Your API Key:**
1. Sign up at [MailerSend](https://www.mailersend.com/)
2. Go to Settings → API Tokens
3. Create a new token with "Email send" permissions
4. Copy the token to `MAILERSEND_API_KEY`

### 3. Verify Domain (Production Only)

For production deployments, verify your sending domain in MailerSend:

1. Go to Domains → Add Domain
2. Add DNS records (SPF, DKIM, CNAME) to your domain registrar
3. Wait for verification (usually 15-30 minutes)
4. Update `FROM_EMAIL` to use your verified domain

### 4. Install Dependencies

```bash
# Backend
cd backend-copy
npm install

# Frontend
cd ../frontend-copy
npm install
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend-copy
node server.js

# Terminal 2 - Frontend
cd frontend-copy
npm start
```

You should see:
```
✅ MailerSend service initialized
✅ Backend server running on http://localhost:5002
```

## API Endpoints

### Registration with OTP

**POST** `/api/auth/register`

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123"
}
```

Response:
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "otp": "123456"  // Only in development mode
}
```

### Verify OTP

**POST** `/api/auth/verify-otp`

```json
{
  "email": "user@example.com",
  "otp": "123456",
  "type": "registration"
}
```

### Forgot Password

**POST** `/api/auth/forgot-password`

```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "If an account exists, a password reset code has been sent.",
  "otp": "654321"  // Only in development mode
}
```

### Reset Password

**POST** `/api/auth/reset-password`

```json
{
  "email": "user@example.com",
  "otp": "654321",
  "newPassword": "NewSecurePass123"
}
```

## React Components

### OTPVerification Component

Reusable OTP input component with auto-submit and countdown timer.

**Usage:**

```jsx
import OTPVerification from './components/OTPVerification';

<OTPVerification
  email="user@example.com"
  onVerify={(otp) => handleVerification(otp)}
  onResend={() => handleResendOTP()}
  purpose="registration"  // or "login" or "password-reset"
  loading={isLoading}
  error={errorMessage}
/>
```

**Props:**
- `email` (string) - User's email address to display
- `onVerify` (function) - Callback when OTP is submitted
- `onResend` (function) - Callback to resend OTP
- `purpose` (string) - Type of verification ('registration', 'login', 'password-reset')
- `loading` (boolean) - Show loading state
- `error` (string) - Error message to display

**Features:**
- 6-digit auto-advancing input fields
- Auto-submit when all digits entered
- 60-second countdown timer for resend
- Paste support (Ctrl+V)
- Mobile responsive
- Dark mode support

### PasswordReset Component

Complete password reset flow with email → OTP → new password.

**Usage:**

```jsx
import PasswordReset from './components/PasswordReset';

<PasswordReset
  onClose={() => navigate('/login')}
  onSuccess={() => navigate('/login')}
/>
```

**Props:**
- `onClose` (function) - Callback to close/cancel
- `onSuccess` (function) - Callback on successful reset

**Features:**
- Two-step flow (email → OTP + password)
- Password strength indicator
- Real-time validation
- Uses OTPVerification component
- Success confirmation screen

## Email Templates

All emails use professional HTML templates with:
- Gradient header (#667eea → #764ba2)
- Centered content layout
- Clear call-to-action (OTP display)
- Security notes and expiry information
- Plain text fallback for accessibility

### Customizing Templates

Edit `backend-copy/services/mailerSendService.js`:

```javascript
createOTPEmailTemplate(username, otp, purpose, expiresInMinutes) {
  // Modify HTML structure here
  const html = `...`;
  const text = `...`;
  return { html, text };
}
```

## Testing

### Development Mode

In development (`NODE_ENV=development`), OTP codes are exposed in API responses:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "otp": "123456"  // Visible in dev mode only
}
```

Check console logs for:
```
🔐 Development OTP: 123456
```

### Test the Complete Flow

1. **Registration Flow:**
   ```bash
   curl -X POST http://localhost:5002/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","username":"testuser","password":"Test1234"}'
   ```
   → Check email for OTP (or console in dev mode)

2. **Verify OTP:**
   ```bash
   curl -X POST http://localhost:5002/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","otp":"123456","type":"registration"}'
   ```

3. **Password Reset:**
   ```bash
   curl -X POST http://localhost:5002/api/auth/forgot-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```
   → Check email for reset code

4. **Reset Password:**
   ```bash
   curl -X POST http://localhost:5002/api/auth/reset-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","otp":"654321","newPassword":"NewPass123"}'
   ```

### Frontend Testing

1. Start both servers (backend + frontend)
2. Navigate to password reset page
3. Enter email → Receive OTP
4. Enter OTP + new password → Success
5. Login with new password

## Troubleshooting

### Emails Not Sending

**Check MailerSend API Key:**
```bash
# In backend-copy/.env
MAILERSEND_API_KEY=mlsn.xxxxxxxxxxxxxxxxxxxxxxxx
```

**Verify Domain Status:**
- Log into MailerSend dashboard
- Check domain verification status
- Ensure DNS records are correct

**Check Server Logs:**
```bash
cd backend-copy
node server.js
# Look for "✅ MailerSend service initialized"
```

### OTP Not Working

**Expired OTP:**
- Default TTL is 15 minutes (900 seconds)
- Check `OTP_TTL_SECONDS` in `.env`

**Wrong OTP:**
- Development mode exposes OTP in API response
- Check console: `🔐 Development OTP: 123456`

**Rate Limiting:**
- Default: 5 OTP requests per hour per email
- Check `OTP_RATE_LIMIT` in `.env`

### CORS Issues

**Frontend Proxy:**
Ensure `package.json` has proxy configured:
```json
{
  "proxy": "http://localhost:5002"
}
```

**Backend CORS:**
Server already configured to accept requests from `http://localhost:3000`

## Production Deployment

### Security Checklist

- [ ] Verify domain in MailerSend
- [ ] Remove development OTP exposure (set `NODE_ENV=production`)
- [ ] Use strong passwords for SMTP fallback
- [ ] Enable rate limiting (already configured)
- [ ] Set secure OTP TTL (default 15 min is good)
- [ ] Use HTTPS for all endpoints
- [ ] Keep API keys in environment variables (never commit to Git)

### Environment Variables (Production)

```env
# Required
NODE_ENV=production
MAILERSEND_API_KEY=mlsn.your_production_key
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Your App Name

# Database
MONGODB_URI=mongodb+srv://...

# JWT
JWT_SECRET=your_secure_random_string
JWT_EXPIRES_IN=30d

# OTP Settings
OTP_TTL_SECONDS=900
MAX_OTP_ATTEMPTS=3
OTP_RATE_LIMIT=5
```

### Deployment Steps

1. **Backend:**
   ```bash
   cd backend-copy
   npm install --production
   node server.js
   ```

2. **Frontend:**
   ```bash
   cd frontend-copy
   npm run build
   # Deploy build/ folder to your hosting service
   ```

3. **Update API URL:**
   Edit `frontend-copy/.env`:
   ```env
   REACT_APP_API_URL=https://your-backend-domain.com
   ```

## Support

### Email Deliverability

- **Inbox vs Spam:** Verified domains have better deliverability
- **SPF/DKIM:** Always configure DNS records properly
- **Content:** Avoid spam trigger words in email content

### MailerSend Limits

- **Free Tier:** 12,000 emails/month
- **Rate Limits:** Check your plan limits
- **Monitor Usage:** Dashboard → Analytics

### Fallback to Hostinger SMTP

If MailerSend fails, the system automatically uses Hostinger SMTP:

```env
# Fallback SMTP (already configured)
SMTP_HOST=smtp.hostinger.com
SMTP_USER=hello@auraxai.in
SMTP_PASS=your_password
```

## Additional Resources

- [MailerSend Documentation](https://developers.mailersend.com/)
- [OTP Best Practices](https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html)
- [React Environment Variables](https://create-react-app.dev/docs/adding-custom-environment-variables/)

---

**Last Updated:** 2025  
**Version:** 1.0.0
