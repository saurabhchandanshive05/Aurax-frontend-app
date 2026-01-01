# 🚀 Quick Start - Instagram OAuth Testing

## ⚡ IMMEDIATE ACTIONS REQUIRED

### 1️⃣ Restart Backend Server (MANDATORY)

```powershell
cd C:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
node server.js
```

Wait for:
```
✅ MongoDB connected successfully
🚀 Server running on port 5002
```

---

### 2️⃣ Update Meta Developer Console (CRITICAL)

**URL**: https://developers.facebook.com/apps/2742496619415444/fb-login/settings/

**Action**: In "Valid OAuth Redirect URIs" section:

❌ **DELETE THIS**:
```
https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/facebook/callback
```

✅ **KEEP THIS**:
```
https://semianimated-implosively-sunday.ngrok-free.dev/api/auth/instagram/callback
```

**Click "Save Changes"**

---

### 3️⃣ Test OAuth Flow

**Login**: http://localhost:3000

**Credentials**:
- Email: `saurabhchandan05@gmail.com`
- Password: `Saurabh@123`

**Steps**:
1. Login → Dashboard loads
2. Click "Connect Instagram Account"
3. Complete Meta OAuth (select Page + Instagram account)
4. **Should redirect to**: `/dashboard` (NOT `/connect-socials`)
5. **Should see**: Success alert + Instagram connection details

---

### 4️⃣ Verify Backend Logs

**Look for this in backend terminal**:

```
════════════════════════════════════════════════════════════════════
🔔 ✅ NEW INSTAGRAM CALLBACK HIT! (Redirects to /dashboard)
════════════════════════════════════════════════════════════════════
```

**NOT this** (old route):
```
❌ Facebook OAuth successful (redirects to /connect-socials)
```

---

### 5️⃣ Check Dashboard Display

**Expected Instagram Section**:
```
📱 Connect Instagram
✓ Connected
@your_instagram_username
Instagram Business Account ID: 123456789
[Disconnect Instagram] button
```

---

## 🧪 Quick Browser Test

**Open DevTools Console** and paste:

```javascript
fetch('http://localhost:5002/api/me', {
  headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}
})
.then(r => r.json())
.then(data => {
  console.log('✅ Instagram Connected:', data.user?.instagram?.connected);
  console.log('📱 Username:', data.user?.instagram?.username);
  console.log('👥 Followers:', data.user?.instagram?.followersCount);
});
```

---

## ✅ Success Checklist

- [ ] Backend restarted successfully
- [ ] Meta Console updated (old URL removed)
- [ ] Logged in to dashboard
- [ ] Clicked "Connect Instagram"
- [ ] Meta OAuth completed
- [ ] Backend shows "NEW INSTAGRAM CALLBACK HIT!"
- [ ] Redirected to `/dashboard` (not `/connect-socials`)
- [ ] Success alert appeared
- [ ] Dashboard shows "✓ Connected"
- [ ] Instagram username displayed
- [ ] Account ID shown

---

## ❌ Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| Still redirects to `/connect-socials` | Update Meta Console - remove old callback URL |
| Dashboard shows "Not Connected" | Backend not restarted - run `node server.js` |
| Backend shows "Facebook OAuth successful" | Wrong callback URL in Meta Console |
| `instagram` field undefined | Check SocialAccount import in server.js |
| Ngrok URL not working | Restart ngrok tunnel |

---

## 📞 Need Help?

**Run Full Test Suite**:

Open [INSTAGRAM_OAUTH_COMPLETE_TEST_GUIDE.md](./INSTAGRAM_OAUTH_COMPLETE_TEST_GUIDE.md) for:
- Step-by-step testing guide
- Debugging commands
- Database queries
- Complete troubleshooting

**Run Browser Tests**:

Copy script from [test-instagram-oauth-browser.js](./test-instagram-oauth-browser.js)

---

**🎯 You're ready to test! Start with Step 1 above.**
