# 🎯 Port 3000 Configuration - LOCKED

## ✅ Changes Applied

### 1. Frontend .env
```env
PORT=3000
REACT_APP_REDIRECT_URI=http://localhost:3000/dashboard
```

### 2. Backend .env
```env
FRONTEND_URL=http://localhost:3000
```

---

## ⚠️ REQUIRED: Update Meta App Redirect URI

You **MUST** update the Meta App settings to allow port 3000:

### Steps:
1. Go to: **https://developers.facebook.com/apps/2742496619415444/fb-login/settings/**

2. Find **"Valid OAuth Redirect URIs"** section

3. Make sure it includes:
   ```
   http://localhost:5002/api/auth/instagram/callback
   ```
   (Backend callback stays the same - only frontend redirect changed)

4. Click **"Save Changes"**

---

## 🚀 Start Servers

### Backend:
```bash
cd backend-copy
node server.js
```

### Frontend:
```bash
cd frontend-copy
npm start
```

Frontend will now run on: **http://localhost:3000** ✅

---

## 📋 OAuth Flow URLs

- **Frontend Start:** http://localhost:3000/connect-socials
- **Backend OAuth URL:** http://localhost:5002/api/auth/instagram/login
- **Meta Callback:** http://localhost:5002/api/auth/instagram/callback
- **Frontend Redirect:** http://localhost:3000/dashboard?auth=success

---

## ✅ Configuration Complete!

Port 3000 is now locked in `.env` file and backend will redirect to the correct frontend URL after OAuth.
