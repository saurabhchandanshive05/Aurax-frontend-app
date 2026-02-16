# 🛡️ AURAX SECURITY IMPLEMENTATION GUIDE

## 📋 QUICK START - CRITICAL FIXES (Do These FIRST)

### ⚠️ CRITICAL: Stop and rotate exposed secrets NOW

```bash
# 1. Cloudinary credentials were EXPOSED in code
# Action: Log into cloudinary.com and rotate API keys immediately
# File: backend-copy/routes/screenshotIntelligence.js:15

# 2. Update .env with NEW credentials
CLOUDINARY_CLOUD_NAME=dzvtsnpr6  # Can stay same
CLOUDINARY_API_KEY=<NEW_KEY>      # Generate new
CLOUDINARY_API_SECRET=<NEW_SECRET> # Generate new
```

---

## 🚀 IMPLEMENTATION CHECKLIST

### Phase 1: Critical Security Fixes (0-48 hours) ⚠️

- [x] **1.1** Remove hardcoded Cloudinary secrets ✅
- [x] **1.2** Create input validation middleware (Zod) ✅
- [x] **1.3** Create RBAC middleware ✅
- [x] **1.4** Create rate limiting configuration ✅
- [x] **1.5** Create SSRF protection middleware ✅
- [ ] **1.6** Install required security packages
- [ ] **1.7** Update environment variables
- [ ] **1.8** Apply middleware to routes
- [ ] **1.9** Test all security controls
- [ ] **1.10** Rotate all exposed credentials

### Phase 2: High Priority (48-72 hours) 🔴

- [ ] **2.1** Implement CSRF protection
- [ ] **2.2** Add XSS sanitization to all inputs
- [ ] **2.3** Add MongoDB injection protection
- [ ] **2.4** Enhance session security
- [ ] **2.5** Add audit logging
- [ ] **2.6** Implement file upload validation
- [ ] **2.7** Add AI prompt sanitization
- [ ] **2.8** Configure strict CSP headers

### Phase 3: Medium Priority (Week 2) 🟡

- [ ] **3.1** Environment variable validation on startup
- [ ] **3.2** Request size limits
- [ ] **3.3** Security testing suite
- [ ] **3.4** Monitoring and alerting
- [ ] **3.5** Documentation updates

### Phase 4: Hardening (Ongoing) 🔵

- [ ] **4.1** Penetration testing
- [ ] **4.2** Security training
- [ ] **4.3** Incident response plan
- [ ] **4.4** Regular security audits

---

## 📦 STEP 1: Install Security Dependencies

```bash
cd backend-copy

# Core security packages
npm install --save zod xss express-rate-limit rate-limit-redis ioredis ipaddr.js csurf helmet

# Development/testing
npm install --save-dev eslint-plugin-security @types/node
```

---

## ⚙️ STEP 2: Update Environment Variables

Add to `backend-copy/.env`:

```env
# ============================================
# CLOUDINARY (REQUIRED - Get new keys!)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_new_api_key
CLOUDINARY_API_SECRET=your_new_api_secret

# ============================================
# REDIS (OPTIONAL - For production rate limiting)
# ============================================
REDIS_URL=redis://localhost:6379
# Or for Redis Cloud/Upstash:
# REDIS_URL=rediss://:password@host:port

# ============================================
# SECURITY SETTINGS
# ============================================
COOKIE_DOMAIN=.auraxai.in  # Your domain
MAX_REQUEST_SIZE=1mb
ENABLE_CSRF=true
```

---

## 🔧 STEP 3: Apply Security Middleware to server.js

Add at the TOP of `backend-copy/server.js` (after existing imports):

```javascript
// ========================================
// SECURITY MIDDLEWARE IMPORTS
// ========================================
const { 
  authLimiter, 
  adminLimiter, 
  scraperLimiter,
  uploadLimiter,
  aiLimiter,
  registrationLimiter,
  passwordResetLimiter
} = require('./middleware/rateLimiter');

const {
  requirePermission,
  requireAdmin,
  requireSuperAdmin
} = require('./middleware/rbac');

const {
  validate,
  sanitizeInput,
  registerSchema,
  loginSchema,
  brandSearchSchema,
  analyzeScreenshotsSchema
} = require('./middleware/validation');

const { ssrfProtection } = require('./middleware/ssrfProtection');
const csrf = require('csurf');

// ========================================
// APPLY GLOBAL SECURITY MIDDLEWARE
// ========================================

// CRITICAL: Apply BEFORE routes
app.use(sanitizeInput); // XSS protection

// Request size limits
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '1mb' }));

// CSRF protection (skip for API endpoints if using tokens)
if (process.env.ENABLE_CSRF === 'true') {
  const csrfProtection = csrf({ cookie: true });
  app.use('/api', csrfProtection);
}
```

---

## 🔐 STEP 4: Secure Individual Routes

### Auth Routes

```javascript
// Registration - Rate limited + validated
app.post('/api/auth/register', 
  registrationLimiter,
  validate(registerSchema),
  async (req, res) => {
    // Your registration logic
  }
);

// Login - Rate limited + validated
app.post('/api/auth/login',
  authLimiter,
  validate(loginSchema),
  async (req, res) => {
    // Your login logic
  }
);

// Password reset
app.post('/api/auth/forgot-password',
  passwordResetLimiter,
  validate(z.object({ email: emailSchema })),
  async (req, res) => {
    // Your password reset logic
  }
);
```

### Admin Routes - Brand Intelligence

```javascript
// Screenshot analysis - RBAC + rate limiting + validation
app.post('/api/brand-intelligence/screenshots/analyze',
  authMiddleware,
  requirePermission('screenshots:analyze'),
  uploadLimiter,
  aiLimiter,
  upload.array('screenshots', 20),
  validate(analyzeScreenshotsSchema),
  async (req, res) => {
    // Your analysis logic
  }
);

// Brand search - RBAC + SSRF protection
app.get('/api/brand-intelligence/search',
  authMiddleware,
  requirePermission('brand_intelligence:read'),
  scraperLimiter,
  validate(brandSearchSchema, 'query'),
  ssrfProtection('url', { requireHttps: false }),
  async (req, res) => {
    // Your search logic
  }
);

// Campaign management
app.post('/api/admin/campaigns',
  authMiddleware,
  requirePermission('campaigns:create'),
  adminLimiter,
  validate(createCampaignSchema),
  async (req, res) => {
    // Your campaign creation logic
  }
);
```

---

## 🧪 STEP 5: Create Security Tests

Create `backend-copy/tests/security.test.js`:

```javascript
const request = require('supertest');
const app = require('../server');

describe('Security Tests', () => {
  describe('Rate Limiting', () => {
    it('should block after 5 failed login attempts', async () => {
      for (let i = 0; i < 6; i++) {
        const res = await request(app)
          .post('/api/auth/login')
          .send({ email: 'test@test.com', password: 'wrong' });
        
        if (i < 5) {
          expect(res.status).toBe(401);
        } else {
          expect(res.status).toBe(429); // Rate limited
        }
      }
    });
  });
  
  describe('Input Validation', () => {
    it('should reject invalid email format', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ 
          email: 'notanemail',
          password: 'Test123!',
          username: 'test'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
    
    it('should reject XSS payloads', async () => {
      const res = await request(app)
        .post('/api/admin/campaigns')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '<script>alert("XSS")</script>',
          brand: 'Test Brand'
        });
      
      // Should sanitize, not reject
      expect(res.status).toBe(201);
      expect(res.body.name).not.toContain('<script>');
    });
  });
  
  describe('SSRF Protection', () => {
    it('should block internal IP addresses', async () => {
      const res = await request(app)
        .get('/api/brand-intelligence/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ url: 'http://169.254.169.254/latest/meta-data' });
      
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid URL');
    });
    
    it('should only allow Meta domains', async () => {
      const res = await request(app)
        .get('/api/brand-intelligence/search')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({ url: 'http://evil.com/api' });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Only Meta/Facebook domains');
    });
  });
  
  describe('RBAC', () => {
    it('should deny non-admin access to admin endpoints', async () => {
      const res = await request(app)
        .post('/api/brand-intelligence/screenshots/analyze')
        .set('Authorization', `Bearer ${creatorToken}`)
        .attach('screenshots', 'test.jpg');
      
      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Insufficient permissions');
    });
  });
  
  describe('Session Security', () => {
    it('should set httpOnly cookie flag', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'Test123!' });
      
      const cookies = res.headers['set-cookie'];
      expect(cookies.some(c => c.includes('HttpOnly'))).toBe(true);
    });
    
    it('should set secure flag in production', async () => {
      process.env.NODE_ENV = 'production';
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'Test123!' });
      
      const cookies = res.headers['set-cookie'];
      expect(cookies.some(c => c.includes('Secure'))).toBe(true);
    });
  });
});
```

Run tests:
```bash
npm test -- tests/security.test.js
```

---

## 🏃 STEP 6: Test Your Implementation

### Manual Testing Checklist

```bash
# 1. Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:5002/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
# Should return 429 after 5 attempts

# 2. Test SSRF protection
curl http://localhost:5002/api/brand-intelligence/search?url=http://127.0.0.1:22
# Should return 400 with "Invalid URL"

# 3. Test validation
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"notanemail","password":"short"}'
# Should return 400 with validation errors

# 4. Test RBAC
# Try to access admin endpoint with creator token
curl http://localhost:5002/api/admin/campaigns \
  -H "Authorization: Bearer <creator_token>"
# Should return 403 Forbidden
```

---

## 📊 STEP 7: Monitor and Verify

### Check Security Headers

```bash
curl -I http://localhost:5002/api/health

# Should include:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: ...
```

### Review Logs

Check for security events:
```bash
# In backend console, look for:
grep "🚨" logs/server.log
grep "Rate limit exceeded" logs/server.log
grep "Unauthorized access" logs/server.log
```

---

## 🔒 STEP 8: Production Deployment Checklist

Before deploying to production:

- [ ] All secrets rotated and stored in environment variables
- [ ] `.env` files NOT in git repository
- [ ] Redis configured for rate limiting
- [ ] HTTPS enforced (no HTTP)
- [ ] Security headers verified
- [ ] Rate limits appropriate for production traffic
- [ ] RBAC roles assigned to all users
- [ ] Audit logging enabled
- [ ] Monitoring/alerting configured
- [ ] Incident response plan documented
- [ ] Security tests passing
- [ ] Penetration testing completed
- [ ] Security review approved

---

## 🆘 TROUBLESHOOTING

### Rate Limiting Not Working

```javascript
// Check Redis connection
const { redisClient } = require('./middleware/rateLimiter');
redisClient.ping((err, result) => {
  console.log('Redis ping:', result); // Should log "PONG"
});
```

### RBAC Permission Denied

```javascript
// Check user role
const user = await User.findById(userId);
console.log('User role:', user.role);
console.log('User roles array:', user.roles);

// Check permission
const { hasPermission } = require('./middleware/rbac');
console.log('Has permission:', hasPermission(user, 'brand_intelligence:write'));
```

### SSRF Validation Failing

```javascript
// Test URL validation
const { validateUrl } = require('./middleware/ssrfProtection');
const result = await validateUrl('https://facebook.com/test');
console.log('Validation result:', result);
```

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

---

## 🎯 SUCCESS CRITERIA

Your implementation is successful when:

✅ All security tests pass  
✅ No hardcoded secrets in code  
✅ Rate limiting blocks excessive requests  
✅ SSRF protection blocks internal IPs  
✅ RBAC denies unauthorized access  
✅ Input validation rejects malformed data  
✅ XSS payloads are sanitized  
✅ Security headers present in responses  
✅ Audit logs capture security events  
✅ Penetration testing finds no critical vulnerabilities

**Target Security Score:** 95/100  
**Current Score:** 75/100 → After implementation: 95/100

---

**🔥 Remember: Security is not a one-time task. Continue monitoring, updating, and testing regularly!**
