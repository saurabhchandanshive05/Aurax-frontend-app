# Aurax Backend Setup Instructions

## 📁 Files to Copy to Your Backend Directory

Copy all files from the `BACKEND-COPY-FILES` folder to your `C:\Users\hp\OneDrive\Desktop\backend-copy` directory:

```
backend-copy/
├── .env.development          # Environment configuration
├── server.js                 # Main server file
├── package.json             # Dependencies
├── test-api.js             # API testing script
└── routes/
    ├── auth.js              # Authentication routes
    ├── instagram-oauth.js   # Instagram OAuth routes
    └── instagram.js         # Instagram API routes
```

## 🚀 Setup Steps

### 1. Copy Files

Copy all files from `BACKEND-COPY-FILES` to your `backend-copy` directory:

```powershell
# Navigate to your backend directory
cd C:\Users\hp\OneDrive\Desktop\backend-copy

# Copy the files (or manually copy them)
```

### 2. Install Dependencies

```powershell
npm install
```

### 3. Configure Environment

Edit `.env.development` and update:

```bash
# Update with your MongoDB URI if you have one
MONGODB_URI=mongodb://localhost:27017/aurax-platform

# Update with your email credentials for sending verification emails
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=hello@auraxai.in

# Instagram credentials (already configured)
INSTAGRAM_CLIENT_ID=1975238456624246
INSTAGRAM_CLIENT_SECRET=cc0057dc09a2a96574ef62c230a0d54f
```

### 4. Start the Backend Server

```powershell
# Development mode with auto-restart
npm run dev

# OR production mode
npm start
```

### 5. Test the API

```powershell
# Run the test suite
npm test

# OR run directly
node test-api.js
```

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/login` - User login
- `POST /api/auth/resend-verification` - Resend verification code
- `GET /api/auth/profile` - Get user profile (authenticated)

### Instagram OAuth

- `GET /api/instagram/oauth/url` - Get Instagram OAuth URL
- `POST /api/instagram/oauth/callback` - Handle OAuth callback
- `POST /api/instagram/oauth/validate` - Validate access token
- `POST /api/instagram/oauth/refresh` - Refresh access token
- `GET /api/instagram/connection-status` - Get connection status (authenticated)
- `POST /api/instagram/disconnect` - Disconnect Instagram (authenticated)

### Instagram API

- `GET /api/instagram/profile?accessToken=...` - Get Instagram profile data
- `GET /api/instagram/insights?accessToken=...` - Get Instagram insights
- `GET /api/instagram/my-profile` - Get user's connected Instagram profile (authenticated)
- `GET /api/instagram/status` - Instagram API status

### System

- `GET /api/health` - Health check
- `GET /api/config` - Configuration info

## 🧪 Testing Flow

1. **Start Backend**: `npm run dev`
2. **Run API Tests**: `npm test`
3. **Test Registration**:
   ```bash
   curl -X POST http://localhost:5002/api/auth/register \
   -H "Content-Type: application/json" \
   -d '{"username":"testuser","email":"test@aurax.com","password":"testpass123"}'
   ```
4. **Test Login**:
   ```bash
   curl -X POST http://localhost:5002/api/auth/login \
   -H "Content-Type: application/json" \
   -d '{"emailOrPhone":"test@aurax.com","password":"testpass123"}'
   ```

## 🔧 Frontend Integration

Make sure your frontend `.env.development` has:

```bash
REACT_APP_API_URL=http://localhost:5002
REACT_APP_INSTAGRAM_CLIENT_ID=1975238456624246
REACT_APP_INSTAGRAM_CLIENT_SECRET=cc0057dc09a2a96574ef62c230a0d54f
REACT_APP_REDIRECT_URI=http://localhost:3000/auth/instagram/callback
```

## 🌟 Features

✅ User registration with email verification
✅ Secure login with JWT tokens
✅ Instagram OAuth integration (real app credentials)
✅ Instagram API data fetching
✅ MongoDB support (optional)
✅ Email notifications
✅ CORS configured for frontend
✅ Comprehensive error handling
✅ Development testing tools

## 📝 Notes

- In demo mode (no MongoDB), users are stored in memory
- Verification codes are included in API responses for testing
- Email sending requires valid SMTP credentials
- Instagram OAuth requires user interaction for authorization code
- All routes are properly authenticated where needed

## 🔒 Security

- Passwords are hashed with bcrypt
- JWT tokens for authentication
- Input validation on all endpoints
- CORS properly configured
- Environment variables for secrets

## 🚀 Production Deployment

For production:

1. Set up MongoDB and update `MONGODB_URI`
2. Configure email service credentials
3. Remove verification code from API responses
4. Set `NODE_ENV=production`
5. Use proper JWT secret
6. Configure proper CORS origins
