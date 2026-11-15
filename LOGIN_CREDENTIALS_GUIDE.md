# Quick Login Solution for Instagram Testing

## 🔐 Test Credentials

Use these credentials to login to the creator dashboard:

### **Creator Account:**

```
Email: test@copy.example.com
Password: <REDACTED>
```

### **Alternative Accounts:**

```
Brand Account:
Email: brand@copy.example.com
Password: <REDACTED>

Admin Account:
Email: admin@copy.example.com
Password: <REDACTED>
```

## 📱 Steps to Access Instagram Testing:

### **Method 1: Test Before Login (Current Setup)**

1. Go to: http://localhost:3000
2. Click "Show advanced options"
3. Test Instagram connection (this works without logging in)
4. Then login with test credentials above

### **Method 2: Test After Login (Better UX)**

1. Login with: `<test-email>` / `<test-password>`
2. Go to creator dashboard
3. Find Instagram insights section
4. Click settings icon (⚙️) for Instagram test options

## 🔧 Backend Status Check

If login still fails, check if your backend is running:

```powershell
# Check if backend is running
curl http://localhost:5002/api/test

# If not running, start it:
cd backend-copy
npm start
```

## 🎯 What to Expect After Login:

Once you login successfully, you'll see:

- ✅ Creator Dashboard with Instagram section
- ✅ Instagram insights showing @\__ediitss_.\_ data
- ✅ 694 followers, 20 posts metrics
- ✅ Sync settings and automation options

## 🚨 If Backend Issues:

The login requires a running backend server. If you get connection errors:

1. **Start Backend Server:**

```powershell
cd backend-copy
npm install
npm start
```

2. **Check MongoDB Connection:**

   - Backend needs MongoDB connection
   - Check backend/.env file for MONGODB_URI

3. **Alternative - Skip Login for Now:**
   - Instagram test works in advanced options WITHOUT login
   - You can test Instagram API connection immediately
   - Then worry about login/backend later

## ⚡ Quick Test Now:

**Immediate Instagram Test (No Login Required):**

1. Go to http://localhost:3000
2. Click "Show advanced options"
3. Click "Test Instagram Connection"
4. See your @\__ediitss_.\_ account data instantly

**Then Login for Full Dashboard:**

1. Use `<test-email>` / `<test-password>`
2. Access full Instagram analytics dashboard
