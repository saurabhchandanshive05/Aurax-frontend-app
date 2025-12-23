# Instagram OAuth System - Production Ready

Complete Instagram OAuth implementation with React frontend and Node.js backend.

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- **OAuth Flow Handler**: Manages complete Meta OAuth process
- **Token Management**: Exchanges short-lived → long-lived tokens
- **Database**: MongoDB with Mongoose ORM
- **Security**: JWT + HTTP-only cookies
- **API Structure**: RESTful endpoints

### Frontend (React)
- **Auth Flow**: Initiates OAuth, never receives tokens
- **Dashboard**: Displays user profile and Instagram stats
- **State Management**: Context API for authentication
- **Routing**: Protected and public routes

---

## 📁 Project Structure

```
frontend-copy/
├── backend-copy/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── environment.js
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   └── user.controller.js
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js
│   │   │   └── error.middleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── InstagramProfile.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   └── user.routes.js
│   │   ├── services/
│   │   │   └── oauth.service.js
│   │   ├── utils/
│   │   │   └── jwt.util.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
└── src/
    ├── components/
    │   ├── Auth/
    │   │   ├── LoginButton.jsx
    │   │   └── LoginButton.css
    │   └── Dashboard/
    │       ├── Dashboard.jsx
    │       └── Dashboard.css
    ├── contexts/
    │   └── AuthContext.jsx
    ├── services/
    │   ├── api.service.js
    │   └── auth.service.js
    ├── App.js
    ├── App.css
    └── .env.example
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- MongoDB running locally or MongoDB Atlas account
- Meta Developer Account with App created

### 1. Configure Meta App

1. Go to [Meta Developers](https://developers.facebook.com/)
2. Create/Select your app (ID: **2742496619415444**)
3. Add **Facebook Login** product
4. Configure OAuth Redirect URIs:
   - Add: `http://localhost:5000/api/auth/instagram/callback`
   - For production: `https://auraxai.in/api/auth/instagram/callback`
5. Enable required permissions:
   - `instagram_basic`
   - `instagram_content_publish`
   - `pages_show_list`
   - `pages_read_engagement`
   - `business_management`
6. Copy **App Secret** for backend configuration

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend-copy

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
```

**Backend `.env` Configuration:**
```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/instagram-oauth

# Meta/Facebook App
META_APP_ID=2742496619415444
META_APP_SECRET=your_app_secret_here
META_REDIRECT_URI=http://localhost:5000/api/auth/instagram/callback

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d

# Cookie
COOKIE_SECRET=your_super_secret_cookie_key_change_this_in_production

# Frontend
FRONTEND_URL=http://localhost:3000
```

**Start Backend:**
```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

Backend will run on: `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd ..

# Install dependencies (if not already installed)
npm install

# Install additional dependencies for OAuth system
npm install axios react-router-dom

# Create .env file
cp .env.example .env

# Edit .env
```

**Frontend `.env` Configuration:**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**Start Frontend:**
```bash
npm start
```

Frontend will run on: `http://localhost:3000`

---

## 🔐 OAuth Flow

### Complete Authentication Flow

```
1. User clicks "Login with Instagram"
   ↓
2. Frontend calls GET /api/auth/instagram/login
   ↓
3. Backend returns Meta OAuth URL
   ↓
4. User redirected to Facebook/Meta authorization page
   ↓
5. User approves permissions
   ↓
6. Meta redirects to: /api/auth/instagram/callback?code=...
   ↓
7. Backend:
   - Exchanges code → short-lived token
   - Exchanges short-lived → long-lived token (60 days)
   - Fetches user profile
   - Fetches Facebook pages
   - Finds Instagram Business Account
   - Fetches Instagram profile details
   - Saves to MongoDB
   - Creates JWT
   - Sets HTTP-only cookie
   ↓
8. Backend redirects to: /dashboard?auth=success
   ↓
9. Frontend loads dashboard with user data
```

---

## 📡 API Endpoints

### Authentication

#### `GET /api/auth/instagram/login`
Initiate Instagram OAuth login

**Response:**
```json
{
  "success": true,
  "authUrl": "https://www.facebook.com/v18.0/dialog/oauth?..."
}
```

#### `GET /api/auth/instagram/callback`
Handle OAuth callback (internal use)

**Query Parameters:**
- `code`: Authorization code from Meta
- `error`: Error code (if any)
- `error_description`: Error description (if any)

**Redirects:**
- Success: `{FRONTEND_URL}/dashboard?auth=success`
- Error: `{FRONTEND_URL}/auth/error?error=...`

#### `GET /api/auth/session`
Check authentication status

**Response:**
```json
{
  "authenticated": true,
  "userId": "user_id_here"
}
```

#### `POST /api/auth/logout`
Logout user

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### User Data (Protected Routes)

#### `GET /api/user/profile`
Get current user profile with Instagram data

**Headers:**
- Cookie: `auth_token`

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "facebookId": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "picture": "https://...",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "instagramProfile": {
    "id": "...",
    "username": "johndoe",
    "name": "John Doe",
    "profilePictureUrl": "https://...",
    "followersCount": 1234,
    "followsCount": 567,
    "mediaCount": 89,
    "biography": "Content creator",
    "website": "https://example.com",
    "facebookPageName": "John's Page",
    "expiresAt": "2025-03-01T00:00:00.000Z",
    "isTokenExpiring": false
  }
}
```

#### `GET /api/user/instagram/stats`
Get Instagram statistics

**Response:**
```json
{
  "success": true,
  "stats": {
    "followersCount": 1234,
    "followsCount": 567,
    "mediaCount": 89,
    "username": "johndoe",
    "lastUpdated": "2025-01-01T00:00:00.000Z"
  }
}
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  facebookId: String (unique, indexed),
  email: String,
  name: String,
  picture: String,
  instagramProfile: ObjectId (ref: InstagramProfile),
  createdAt: Date,
  updatedAt: Date
}
```

### InstagramProfile Model
```javascript
{
  userId: ObjectId (ref: User, indexed),
  instagramBusinessAccountId: String (unique, indexed),
  username: String,
  name: String,
  profilePictureUrl: String,
  followersCount: Number,
  followsCount: Number,
  mediaCount: Number,
  biography: String,
  website: String,
  accessToken: String (encrypted),
  tokenType: String ('long-lived'),
  expiresAt: Date (indexed),
  facebookPageId: String,
  facebookPageName: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

### Backend
- ✅ HTTP-only cookies (tokens never exposed to frontend)
- ✅ Secure JWT signing
- ✅ CORS configuration
- ✅ SameSite cookie protection
- ✅ Environment variable configuration
- ✅ MongoDB injection protection (via Mongoose)
- ✅ Error handling middleware

### Frontend
- ✅ No token storage in localStorage/sessionStorage
- ✅ Automatic credential inclusion (cookies)
- ✅ Protected routes with authentication checks
- ✅ Automatic redirect on 401 responses

---

## 🎨 Frontend Features

### Components

1. **LoginButton** (`src/components/Auth/LoginButton.jsx`)
   - Instagram-themed login button
   - Initiates OAuth flow
   - Beautiful gradient design

2. **Dashboard** (`src/components/Dashboard/Dashboard.jsx`)
   - User profile display
   - Instagram account information
   - Statistics (followers, following, posts)
   - Token expiry warning
   - Refresh and logout functionality

### Context

**AuthContext** (`src/contexts/AuthContext.jsx`)
- Global authentication state
- Session management
- Login/logout methods
- Auto-refresh on mount

### Services

**authService** (`src/services/auth.service.js`)
- API communication
- Session checking
- Profile fetching
- Logout handling

**apiClient** (`src/services/api.service.js`)
- Axios instance with defaults
- Credential handling
- Error interceptors

---

## 🌐 Production Deployment

### Backend Deployment (Render/Heroku/Railway)

1. **Environment Variables:**
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
META_APP_ID=2742496619415444
META_APP_SECRET=your_production_secret
META_REDIRECT_URI=https://auraxai.in/api/auth/instagram/callback
JWT_SECRET=strong_random_production_secret
COOKIE_SECRET=strong_random_production_secret
FRONTEND_URL=https://auraxai.in
```

2. **Update Meta App Settings:**
   - Add production redirect URI
   - Switch to live mode
   - Add production domain to App Domains

### Frontend Deployment (Vercel/Netlify)

1. **Environment Variables:**
```env
REACT_APP_API_URL=https://auraxai.in/api
```

2. **Build:**
```bash
npm run build
```

3. **Configure Redirects** (for React Router):
```
/* /index.html 200
```

---

## 🧪 Testing

### Manual Testing Flow

1. Start MongoDB, Backend, and Frontend
2. Navigate to `http://localhost:3000`
3. Click "Login with Instagram"
4. Approve permissions on Facebook
5. Check redirect to dashboard
6. Verify profile data displays
7. Test logout functionality

### Required for Instagram Business Account

- Facebook Page created
- Instagram account converted to Business/Creator
- Instagram linked to Facebook Page

---

## 🐛 Troubleshooting

### Common Issues

**"No Instagram Business Account found"**
- Ensure Instagram is converted to Business Account
- Link Instagram to Facebook Page in Instagram settings

**"Token exchange failed"**
- Check META_APP_SECRET is correct
- Verify redirect URI matches exactly

**"CORS error"**
- Ensure FRONTEND_URL is set correctly in backend .env
- Check CORS configuration in server.js

**"MongoDB connection failed"**
- Verify MongoDB is running
- Check MONGODB_URI format

**Cookie not being set**
- Ensure `withCredentials: true` in frontend
- Check `sameSite` and `secure` cookie settings
- For production, use HTTPS

---

## 📚 Dependencies

### Backend
```json
{
  "express": "^4.18.2",
  "mongoose": "^8.0.0",
  "axios": "^1.6.0",
  "jsonwebtoken": "^9.0.2",
  "cookie-parser": "^1.4.6",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1"
}
```

### Frontend
```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "react-router-dom": "^6.x",
  "axios": "^1.6.0"
}
```

---

## 🔄 Token Refresh Strategy

Long-lived tokens expire after ~60 days. Implement token refresh:

1. Monitor `expiresAt` field
2. When token expires in < 7 days, show warning
3. Prompt user to re-authenticate
4. Alternatively, implement automatic refresh using Meta's token refresh endpoint

---

## 📊 Monitoring

### Recommended Logging
- OAuth errors
- Token exchange failures
- Database connection issues
- API request failures
- User login/logout events

### Metrics to Track
- Successful authentications
- Failed authentications
- Token expiries
- API response times
- Active users

---

## 🎯 Next Steps

1. ✅ Basic OAuth implementation
2. ✅ User dashboard
3. 🔲 Token auto-refresh
4. 🔲 Instagram media fetching
5. 🔲 Post scheduling
6. 🔲 Analytics integration
7. 🔲 Multi-account support
8. 🔲 Webhook integration

---

## 📝 License

MIT

## 👨‍💻 Support

For issues or questions:
1. Check Meta Developer documentation
2. Verify all environment variables
3. Review server logs
4. Check browser console for errors

---

**Built with ❤️ for Auraxai.in**
