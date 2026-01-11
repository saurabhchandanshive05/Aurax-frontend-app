# 📱 Mobile Access Guide

## Overview
Access your AURAX development server from mobile devices on the same Wi-Fi network.

## ✅ What's Fixed

### 1. Frontend Environment Check
**File:** `src/utils/copyLogger.js`

Updated `verifyCopyEnvironment()` to allow:
- ✅ `localhost` and `127.0.0.1` (local machine)
- ✅ `192.168.x.x` (most home/office Wi-Fi networks)
- ✅ `10.x.x.x` (some enterprise networks)
- ✅ `172.16-31.x.x` (Docker and enterprise networks)

**Before:**
```javascript
if (!allowedDomains.includes(currentDomain)) {
  throw new Error("NOT IN COPY ENVIRONMENT");
}
```

**After:**
```javascript
// Allow local network IPs for mobile testing
const localNetworkPattern = /^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)\\d+\\.\\d+$/;
if (localNetworkPattern.test(currentDomain)) {
  console.log("✅ Local network IP detected:", currentDomain);
  return true;
}
```

### 2. Backend CORS Configuration
**File:** `backend-copy/server.js`

Updated CORS to dynamically allow local network origins:

**Before:**
```javascript
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

**After:**
```javascript
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow localhost and local network IPs
    if (process.env.NODE_ENV !== 'production') {
      const localPattern = /^http:\\/\\/(localhost|127\\.0\\.0\\.1|192\\.168\\.\\d+\\.\\d+|10\\.\\d+\\.\\d+\\.\\d+)/;
      if (localPattern.test(origin)) {
        console.log('✅ CORS: Allowing local network origin:', origin);
        return callback(null, true);
      }
    }
    // Check allowed origins...
  }
};
```

### 3. React Dev Server Network Access
**File:** `package.json`

Added new script for network-accessible development:
```json
"scripts": {
  "start": "cross-env NODE_OPTIONS=--no-deprecation craco start",
  "start:network": "cross-env NODE_OPTIONS=--no-deprecation HOST=0.0.0.0 craco start"
}
```

Setting `HOST=0.0.0.0` allows the dev server to accept connections from any network interface.

### 4. Startup Script Enhancement
**File:** `start-aurax.ps1`

Now automatically:
- Detects your local network IP address
- Displays both local and mobile access URLs
- Uses `npm run start:network` for mobile compatibility

**Output Example:**
```
🖥️  Local Access:
   Backend:  http://localhost:5002
   Frontend: http://localhost:3000

📱 Mobile Access (Same Wi-Fi):
   Backend:  http://192.168.1.3:5002
   Frontend: http://192.168.1.3:3000

   💡 Use this address on your mobile browser!
```

---

## 🚀 How to Use

### Step 1: Start the Application
```powershell
./start-aurax.ps1
```

The script will:
1. Stop any existing processes on ports 5002 and 3000
2. Start the backend server
3. Start the frontend with network access
4. **Display your mobile access URL** 📱

### Step 2: Connect Your Mobile Device

#### Requirements:
- ✅ Mobile device connected to **same Wi-Fi** as your laptop
- ✅ Firewall allows port 3000 and 5002 (see troubleshooting below)

#### On Your Mobile Browser:
1. Open any browser (Chrome, Safari, Firefox)
2. Enter the mobile access URL from the startup script
   - Example: `http://192.168.1.3:3000`
3. The app should load without the "NOT IN COPY ENVIRONMENT" warning

---

## 🔍 Testing Checklist

### ✅ Frontend Access
- [ ] App loads on mobile browser
- [ ] No "NOT IN COPY ENVIRONMENT" warning
- [ ] Authentication flow works
- [ ] Navigation between pages works
- [ ] Images and assets load correctly

### ✅ Backend Connectivity
- [ ] API calls succeed (check Network tab in mobile browser)
- [ ] Login/Registration works
- [ ] Campaign data loads
- [ ] No CORS errors in console

### ✅ Mobile-First Features
- [ ] Vertical campaign feed displays correctly
- [ ] Filter panel slides up from bottom
- [ ] Expandable text works with "see more" button
- [ ] Touch interactions feel responsive
- [ ] Progress bars animate smoothly
- [ ] Forms are touch-optimized (44px tap targets)

---

## 🛠️ Troubleshooting

### Issue 1: "NOT IN COPY ENVIRONMENT" Still Appears

**Cause:** Browser cached old JavaScript files

**Solution:**
1. Hard refresh mobile browser:
   - **iOS Safari:** Settings > Safari > Clear History and Website Data
   - **Android Chrome:** Settings > Privacy > Clear browsing data > Cached images and files
2. Or use incognito/private mode
3. Restart the dev server after code changes

---

### Issue 2: "Failed to Load" / "Cannot Connect"

**Possible Causes:**

#### A. Firewall Blocking Ports
**Windows Firewall:**
```powershell
# Allow port 3000 (Frontend)
New-NetFirewallRule -DisplayName "React Dev Server" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow

# Allow port 5002 (Backend)
New-NetFirewallRule -DisplayName "Node Backend Server" -Direction Inbound -LocalPort 5002 -Protocol TCP -Action Allow
```

**Check if ports are open:**
```powershell
Get-NetFirewallRule -DisplayName "*React*" -Direction Inbound | Select-Object DisplayName, Enabled
```

#### B. Wrong IP Address
**Find your correct local IP:**
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch "Loopback"} | Select-Object IPAddress, InterfaceAlias
```

Look for an IP starting with:
- `192.168.x.x` (most common)
- `10.x.x.x`
- `172.16-31.x.x`

#### C. Different Wi-Fi Networks
Ensure:
- Laptop and mobile are on **same Wi-Fi network**
- Not using guest Wi-Fi (often isolated from main network)
- Not using VPN on either device

---

### Issue 3: CORS Errors in Mobile Browser

**Symptoms:**
- App loads but API calls fail
- Console shows: "No 'Access-Control-Allow-Origin' header"

**Solution:**
1. Verify backend is running on port 5002
2. Check backend console for CORS messages:
   - Should see: `✅ CORS: Allowing local network origin: http://192.168.x.x:3000`
   - If you see: `⚠️ CORS: Blocked origin:` → restart backend
3. Ensure `NODE_ENV` is not set to `production` during development

**Manual backend test:**
```powershell
# From laptop terminal
curl http://localhost:5002/api/test-simple

# If backend responds, CORS is likely the issue
```

---

### Issue 4: Slow Loading on Mobile

**Causes:**
- Large bundle size
- Slow Wi-Fi
- Dev server optimization

**Solutions:**
1. **Enable Service Worker** (for offline caching)
2. **Use Production Build** for testing:
   ```powershell
   npm run build
   npx serve -s build -l 3000 -H 0.0.0.0
   ```
3. **Check Wi-Fi signal strength** on mobile
4. **Clear cache** and reload

---

### Issue 5: App Works on Laptop but Not Mobile

**Debugging Steps:**

1. **Open Mobile Browser Dev Tools:**
   - **iOS Safari:** Settings > Safari > Advanced > Web Inspector (requires Mac with Safari)
   - **Android Chrome:** chrome://inspect on desktop Chrome while mobile is connected via USB

2. **Check Console for Errors:**
   - Environment verification errors
   - CORS errors
   - Network request failures

3. **Network Tab:**
   - Verify API calls are going to `http://192.168.x.x:5002` (not localhost)
   - Check response status codes (200 = success, 403/404 = failure)

4. **Test Backend Directly:**
   - Open `http://192.168.x.x:5002/api/test-simple` in mobile browser
   - Should see: `{"message": "Backend is running"}`
   - If this fails, backend isn't accessible from network

---

## 📋 Configuration Files Modified

| File | Change | Purpose |
|------|--------|---------|
| `src/utils/copyLogger.js` | Allow local network IPs | Frontend environment check |
| `backend-copy/server.js` | Dynamic CORS for local IPs | Backend API access |
| `package.json` | Added `start:network` script | Network-accessible dev server |
| `start-aurax.ps1` | Auto-detect and display IP | User convenience |

---

## 🔒 Security Notes

### Development Only
These changes are **safe for development** because:
- Local network IPs only work on your Wi-Fi
- Pattern matching prevents public internet access
- Production mode still enforces strict origin checks

### Production Deployment
When deploying to production:
- Backend CORS uses `ALLOWED_ORIGINS` env variable
- Frontend environment check skipped in production mode
- All security handled by backend authentication

**Never expose development servers to the public internet!**

---

## 🎯 Quick Reference

### Start with Mobile Access:
```powershell
./start-aurax.ps1
```

### Manual Start (if script fails):
```powershell
# Terminal 1 - Backend
cd backend-copy
node server.js

# Terminal 2 - Frontend
npm run start:network
```

### Find Your IP:
```powershell
ipconfig | findstr IPv4
```

### Test Backend:
```powershell
curl http://localhost:5002/api/test-simple
```

### Check Firewall:
```powershell
Get-NetFirewallRule -DisplayName "*React*" | Select-Object DisplayName, Enabled
```

---

## ✅ Success Criteria

You'll know mobile access is working when:

1. ✅ Startup script displays mobile URL
2. ✅ Mobile browser loads app at `http://192.168.x.x:3000`
3. ✅ No "NOT IN COPY ENVIRONMENT" warning
4. ✅ Console shows: `✅ Local network IP detected: 192.168.x.x`
5. ✅ Backend console shows: `✅ CORS: Allowing local network origin`
6. ✅ Login/registration works from mobile
7. ✅ API calls succeed (check Network tab)
8. ✅ Mobile-first features display correctly

---

## 📱 Mobile Testing Tips

### Performance Testing
- Test on 3G/4G speeds (Chrome DevTools Network Throttling)
- Check bundle size: `npm run build` → inspect `build/` folder
- Monitor memory usage in mobile browser dev tools

### UI/UX Testing
- Test all breakpoints: 320px (iPhone SE), 375px (iPhone 12), 414px (iPhone Pro Max)
- Verify touch targets are 44px minimum
- Check scroll performance (60fps)
- Test landscape and portrait modes

### Feature Testing
- Authentication flow (login/register)
- Campaign browsing with infinite scroll
- Filter panel slide-up interaction
- Inquiry form with purpose selection
- Profile setup for creators
- Image uploads (if applicable)

### Browser Compatibility
Test on:
- iOS Safari (latest)
- Android Chrome (latest)
- Samsung Internet (if available)
- Firefox Mobile (optional)

---

## 🆘 Still Having Issues?

### Console Logs to Check

**Frontend Console (Mobile Browser):**
```
✅ Local network IP detected: 192.168.1.3
🔍 Checking auth status...
✅ Setting current user with full data: {...}
```

**Backend Console (Laptop Terminal):**
```
✅ CORS: Allowing local network origin: http://192.168.1.3:3000
POST /api/auth/login 200 45.123 ms
GET /api/public/campaigns 200 12.456 ms
```

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "NOT IN COPY ENVIRONMENT" | Old JS cached | Hard refresh or clear cache |
| "Network Error" | Firewall or wrong IP | Check firewall rules, verify IP |
| "CORS Error" | Backend not allowing origin | Restart backend, check CORS logs |
| "Failed to fetch" | Backend not running | Verify backend on port 5002 |
| "401 Unauthorized" | Token expired | Re-login from mobile |

---

## 📚 Additional Resources

- [React Dev Server Host Configuration](https://create-react-app.dev/docs/advanced-configuration/)
- [Express CORS Documentation](https://expressjs.com/en/resources/middleware/cors.html)
- [Chrome Remote Debugging for Android](https://developer.chrome.com/docs/devtools/remote-debugging/)
- [Safari Web Inspector for iOS](https://webkit.org/web-inspector/)

---

**Last Updated:** After mobile-first implementation completion (Phase 4)

**Related Documentation:**
- [MOBILE_FIRST_IMPLEMENTATION_COMPLETE.md](MOBILE_FIRST_IMPLEMENTATION_COMPLETE.md) - Full mobile-first redesign details
- [start-aurax.ps1](start-aurax.ps1) - Application startup script
- [README.md](README.md) - General project documentation
