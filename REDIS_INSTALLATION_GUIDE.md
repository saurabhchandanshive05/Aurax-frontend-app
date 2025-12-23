# Redis Installation Guide for Windows

## Current Status

⚠️ **Redis is NOT installed** - The application is running in **MOCK MODE**  
✅ Instagram OAuth flow will work  
✅ Analysis will run synchronously (slower but functional)  
❌ Background job processing disabled  

---

## Option 1: Memurai (Recommended for Windows)

Memurai is a Redis-compatible server built for Windows.

### Installation Steps:

1. **Download Memurai**
   - Visit: https://www.memurai.com/get-memurai
   - Download the Windows installer (free developer edition)

2. **Install Memurai**
   ```powershell
   # Run the downloaded installer
   # Follow the installation wizard
   # Memurai will install as a Windows Service
   ```

3. **Verify Installation**
   ```powershell
   # Check if service is running
   Get-Service Memurai
   
   # Test connection
   memurai-cli ping
   # Should return: PONG
   ```

4. **Start Backend**
   ```powershell
   cd backend-copy
   npm start
   ```

---

## Option 2: Docker Desktop + Redis

If you have Docker Desktop installed:

### Installation Steps:

1. **Install Docker Desktop**
   - Download from: https://www.docker.com/products/docker-desktop
   - Requires Windows 10/11 Pro or Enterprise

2. **Run Redis Container**
   ```powershell
   # Pull and run Redis
   docker run -d --name redis-aurax -p 6379:6379 redis:alpine
   
   # Verify it's running
   docker ps
   ```

3. **Test Connection**
   ```powershell
   # Enter container
   docker exec -it redis-aurax redis-cli ping
   # Should return: PONG
   ```

4. **Auto-start Redis**
   ```powershell
   # Make Redis restart automatically
   docker update --restart unless-stopped redis-aurax
   ```

---

## Option 3: WSL2 + Redis (Advanced)

For developers using Windows Subsystem for Linux:

### Installation Steps:

1. **Enable WSL2**
   ```powershell
   wsl --install
   # Restart computer
   ```

2. **Install Redis in Ubuntu**
   ```bash
   # Open WSL terminal
   sudo apt update
   sudo apt install redis-server
   
   # Start Redis
   sudo service redis-server start
   
   # Test
   redis-cli ping
   ```

3. **Configure Backend**
   Update `.env` in backend-copy:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

---

## Option 4: Continue in Mock Mode (Testing Only)

If you just want to test the OAuth flow without installing Redis:

### What Works:
- ✅ User login/registration
- ✅ Facebook OAuth
- ✅ Instagram account connection
- ✅ Profile data fetching
- ✅ **Analysis runs synchronously** (may take 10-30 seconds)

### What Doesn't Work:
- ❌ Background job processing
- ❌ Retry mechanism for failed analysis
- ❌ Progress tracking during analysis
- ❌ Rate limiting

### To Use Mock Mode:
Just start the backend - it will automatically detect Redis is unavailable:

```powershell
cd backend-copy
npm start
# You'll see: "⚠️ Redis unavailable - Running in MOCK mode"
```

---

## Verification Checklist

After installing Redis, verify it's working:

1. **Check Redis is Running**
   ```powershell
   # For Memurai
   Get-Service Memurai
   
   # For Docker
   docker ps | findstr redis
   
   # For WSL
   wsl redis-cli ping
   ```

2. **Start Backend**
   ```powershell
   cd c:\Users\hp\OneDrive\Desktop\frontend-copy\backend-copy
   npm start
   ```

3. **Look for Success Message**
   You should see:
   ```
   ✅ Redis connected - Background job processing enabled
   ```

4. **Test the Flow**
   - Login at http://localhost:3000
   - Connect Instagram
   - Watch the job queue process in background

---

## Troubleshooting

### Error: ECONNREFUSED
**Problem:** Redis is not running  
**Solution:** Start Redis service (see installation steps above)

### Error: Port 6379 already in use
**Problem:** Another Redis instance is running  
**Solution:**
```powershell
# Find what's using port 6379
Get-NetTCPConnection -LocalPort 6379 -State Listen

# Stop the process
Stop-Process -Id <PID>
```

### Error: Redis authentication failed
**Problem:** Redis requires password  
**Solution:** Update `.env`:
```env
REDIS_PASSWORD=your_redis_password
```

---

## Production Deployment

For production, use managed Redis services:

### Recommended Services:
- **Azure Cache for Redis** (Microsoft Azure)
- **AWS ElastiCache** (Amazon)
- **Redis Cloud** (Redis Labs)
- **Upstash** (Serverless Redis)

### Production `.env` Example:
```env
REDIS_HOST=your-redis.azure.com
REDIS_PORT=6380
REDIS_PASSWORD=your_secret_password
REDIS_TLS=true
```

---

## Next Steps

1. ✅ Choose installation option (Memurai recommended)
2. ✅ Install and start Redis
3. ✅ Restart backend server
4. ✅ Verify "Redis connected" message
5. ✅ Test complete Instagram integration flow

**Current Mode:** MOCK (Synchronous Analysis)  
**Recommended:** Install Redis for production-ready background processing

---

**Last Updated:** November 30, 2025  
**Support:** Check SOCIAL_CONNECT_SETUP.md for integration details
