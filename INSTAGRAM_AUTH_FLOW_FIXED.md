# Instagram Authentication Flow - Fixed

## Issue Resolved
Previously, hitting `http://localhost:5002/api/auth/facebook?token=...` directly returned an authentication error because the backend wasn't properly receiving or validating the token.

## Changes Made

### Backend Changes (backend-copy/routes/socialAuth.js)

1. **Added JWT import** to verify authentication tokens
2. **Updated `/api/auth/instagram/login` endpoint**:
   - Now accepts token from query string (`?token=...`) or Authorization header
   - Verifies JWT token and extracts user ID
   - Stores user ID in session for the callback
   - Redirects to Instagram/Facebook OAuth page

3. **Enhanced `/api/auth/instagram/callback` endpoint**:
   - Retrieves user ID from session (set during login)
   - Verifies user exists in database
   - Completes OAuth flow with Instagram
   - Saves Instagram account data to SocialAccount model
   - Updates user's `profilesConnected` flag
   - Redirects to dashboard with success message

### Frontend Changes

Updated all Instagram connection buttons to use the new flow:

1. **CreatorOnboarding.js**: Updated `handleConnectInstagram()` to redirect to `/api/auth/instagram/login?token=${token}`
2. **ConnectSocials.js**: Updated `handleConnectInstagram()` to redirect to `/api/auth/instagram/login?token=${token}`
3. **CreatorDashboard.js**: Updated `connectInstagram()` to use backend OAuth flow instead of direct Instagram OAuth

## Updated Authentication Flow

### Step 1: User Login
1. User logs in with email/password
2. Backend returns JWT token
3. Frontend stores token in localStorage/sessionStorage
4. User is redirected to Dashboard

### Step 2: Connect Instagram
1. User clicks "Connect Instagram" button
2. Frontend calls: `GET http://localhost:5002/api/auth/instagram/login?token={JWT_TOKEN}`
3. Backend verifies token and stores user ID in session
4. Backend redirects to Meta/Facebook authorization page

### Step 3: Meta Authorization
1. User authorizes the app on Meta/Facebook
2. Meta redirects back to: `GET http://localhost:5002/api/auth/instagram/callback?code={AUTH_CODE}`

### Step 4: Complete Connection
1. Backend retrieves user ID from session
2. Backend exchanges auth code for access token
3. Backend fetches Instagram profile data
4. Backend saves to SocialAccount model
5. Backend updates user's `profilesConnected = true`
6. Backend redirects to: `http://localhost:3000/dashboard?instagram=connected&success=Instagram connected successfully`

### Step 5: Dashboard Display
1. Frontend detects success parameters
2. Dashboard fetches and displays Instagram account details
3. User sees connected Instagram profile with analytics

## Error Handling

### Missing Token
- **Error**: "Invalid authentication token"
- **Action**: User redirected to login page

### Missing Session
- **Error**: "Please login first before connecting Instagram"
- **Action**: User redirected to login with error message

### OAuth Failure
- **Error**: Specific error from Meta/Instagram API
- **Action**: User redirected to dashboard with error message

### User Not Found
- **Error**: "User session expired"
- **Action**: User redirected to login page

## Testing the Flow

### Prerequisites
1. Backend running on `http://localhost:5002`
2. Frontend running on `http://localhost:3000`
3. Instagram/Facebook App configured with proper redirect URI
4. Environment variables set in backend `.env`:
   ```
   INSTAGRAM_CLIENT_ID=your_client_id
   INSTAGRAM_CLIENT_SECRET=your_client_secret
   FRONTEND_URL=http://localhost:3000
   JWT_SECRET=your_jwt_secret
   SESSION_SECRET=your_session_secret
   ```

### Manual Test Steps

1. **Register/Login**
   ```
   POST http://localhost:5002/api/register
   Body: { "username": "testuser", "email": "test@example.com", "password": "Test123!" }
   
   POST http://localhost:5002/api/login
   Body: { "email": "test@example.com", "password": "Test123!" }
   Response: { "token": "eyJhbGc..." }
   ```

2. **Connect Instagram**
   - Navigate to Dashboard
   - Click "Connect Instagram" button
   - Browser redirects to: `http://localhost:5002/api/auth/instagram/login?token=eyJhbGc...`
   - Backend logs: "✅ Token verified, user ID stored in session"
   - Browser redirects to Meta OAuth page

3. **Authorize on Meta**
   - Log in to Facebook/Instagram account
   - Authorize the app
   - Meta redirects to callback with code

4. **Verify Connection**
   - Backend processes callback
   - Backend logs: "✅ Instagram connected successfully"
   - Browser redirects to dashboard
   - Dashboard shows Instagram profile

### Backend Logs to Watch For

```
🔐 Initiating Instagram OAuth...
✅ Token verified, user ID stored in session: 507f1f77bcf86cd799439011
✅ Auth URL generated, redirecting...

🔔 Instagram callback hit!
📝 Session data: { userId: '507f1f77bcf86cd799439011' }
✅ User verified: test@example.com
✅ OAuth flow completed successfully
✅ Created new Instagram connection
✅ Instagram connected successfully, redirecting to dashboard
```

## API Endpoints

### GET /api/auth/instagram/login
- **Purpose**: Initiate Instagram OAuth
- **Query Params**: `token` (optional, JWT token)
- **Headers**: `Authorization: Bearer {token}` (alternative)
- **Response**: 302 Redirect to Instagram OAuth

### GET /api/auth/instagram/callback
- **Purpose**: Handle OAuth callback
- **Query Params**: `code` (from Instagram), `error` (if failed)
- **Response**: 302 Redirect to dashboard

### GET /api/auth/instagram/status
- **Purpose**: Check connection status
- **Headers**: `Authorization: Bearer {token}`
- **Response**: 
  ```json
  {
    "success": true,
    "connected": true,
    "profile": {
      "username": "test_user",
      "displayName": "Test User",
      "followersCount": 1000
    }
  }
  ```

## Security Considerations

1. **Token Verification**: JWT tokens are verified before storing user ID in session
2. **Session Storage**: User ID stored in session with expiry
3. **CSRF Protection**: State parameter can be added for additional security
4. **Scope Limitation**: Only requests necessary Instagram permissions
5. **Token Encryption**: Access tokens stored encrypted in database

## Next Steps

1. ✅ Fix token validation
2. ✅ Update all frontend components
3. 🔄 Test complete flow end-to-end
4. ⏳ Add state parameter for CSRF protection
5. ⏳ Implement token refresh mechanism
6. ⏳ Add comprehensive error logging

## Related Files

- Backend: `backend-copy/routes/socialAuth.js`
- Frontend: 
  - `src/pages/CreatorOnboarding.js`
  - `src/pages/ConnectSocials.js`
  - `src/pages/CreatorDashboard.js`
- Models: 
  - `backend-copy/models/User.js`
  - `backend-copy/models/SocialAccount.js`
