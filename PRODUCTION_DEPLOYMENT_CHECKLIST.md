# 🚀 AURAX PRODUCTION DEPLOYMENT CHECKLIST

> **Status**: ✅ Infrastructure Complete | ⚠️ Integration Pending | 🎯 Target: 95/100 Security Score

---

## 🚨 PHASE 1: CRITICAL (0-48 Hours)

### 🔴 URGENT: Rotate Cloudinary Credentials
- [ ] Log into https://cloudinary.com/console
- [ ] Regenerate API key + secret
- [ ] Update backend-copy/.env with new credentials
- [ ] Test image upload
- [ ] Verify old credentials no longer work

### Code Fixes
- [ ] Fix typo in validation.js line 48
- [ ] Install security packages: `npm install zod xss express-rate-limit rate-limit-redis ioredis ipaddr.js csurf`
- [ ] Apply sanitizeInput globally
- [ ] Apply validation to ALL POST/PUT/PATCH routes
- [ ] Apply ssrfProtection to scraping endpoints

---

## 🟠 PHASE 2: HIGH PRIORITY (48-72 Hours)

### Rate Limiting
- [ ] Apply authLimiter to /auth/login (5/15min)
- [ ] Apply registrationLimiter to /auth/register (3/hour)
- [ ] Apply scraperLimiter to brand-intelligence (100/hour)
- [ ] Apply uploadLimiter to screenshots/analyze (50/10min)
- [ ] Apply adminLimiter to all admin routes (30/min)
- [ ] Test rate limits work correctly

### RBAC
- [ ] Replace requireAdmin with requirePermission()
- [ ] Test unauthorized access returns 403
- [ ] Document permission matrix

### Session Security
- [ ] Generate 64-char SESSION_SECRET
- [ ] Set httpOnly, secure, sameSite flags
- [ ] Set 15-minute session timeout
- [ ] Implement session regeneration on login

---

## 🟡 PHASE 3: MEDIUM PRIORITY (Week 2)

- [ ] Environment validation on startup
- [ ] Audit logging system
- [ ] AI prompt sanitization
- [ ] File upload content validation
- [ ] Update .gitignore

---

## 🚀 PHASE 4: PRODUCTION SETUP (Week 3)

### Infrastructure
- [ ] Setup Redis (required for rate limiting)
- [ ] SSL/TLS certificate (Let's Encrypt)
- [ ] HTTPS enforced (SSL Labs grade A+)
- [ ] Production .env configured
- [ ] Firewall rules configured

### Monitoring
- [ ] Sentry error tracking configured
- [ ] Log aggregation setup
- [ ] Uptime monitoring (UptimeRobot/Pingdom)
- [ ] Performance monitoring (optional)

### Backups
- [ ] Automated daily database backups
- [ ] Test backup restoration
- [ ] Document RTO/RPO

---

## ✅ FINAL VERIFICATION

- [ ] Security score ≥ 95/100
- [ ] All security tests passing
- [ ] Penetration testing complete
- [ ] CI/CD pipeline running
- [ ] Incident response plan documented

---

## 📊 SUCCESS CRITERIA

✅ Security Score: 95/100 or higher  
✅ No critical vulnerabilities  
✅ Rate limiting active  
✅ Input validation on all endpoints  
✅ RBAC enforced  
✅ Monitoring configured  
✅ Backups tested  

---

**Full detailed checklist**: See complete 500+ line checklist above for all tasks.
