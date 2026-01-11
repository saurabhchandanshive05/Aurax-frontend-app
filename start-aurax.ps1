# AURAX Complete Startup Script
# This script ensures both backend and frontend start correctly

Write-Host "🚀 Starting AURAX Application..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill existing processes
Write-Host "🔄 Stopping any running processes..." -ForegroundColor Yellow
Get-Process -Id (Get-NetTCPConnection -LocalPort 5002 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue).OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "✅ Processes stopped" -ForegroundColor Green
Start-Sleep -Seconds 2

# Step 2: Start Backend
Write-Host ""
Write-Host "📡 Starting Backend Server..." -ForegroundColor Yellow
Push-Location backend-copy

# Start backend in new window
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '🔧 BACKEND SERVER' -ForegroundColor Cyan; Write-Host ''; node server.js"
)

Pop-Location

Write-Host "✅ Backend starting (new window opened)" -ForegroundColor Green
Write-Host "   Waiting 8 seconds for backend to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Step 3: Test Backend
Write-Host ""
Write-Host "🔍 Testing Backend Endpoint..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5002/api/test-simple" -Method GET -ErrorAction Stop
    Write-Host "✅ Backend is responding!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend test failed - it might still be starting..." -ForegroundColor Yellow
    Write-Host "   Waiting 5 more seconds..." -ForegroundColor Gray
    Start-Sleep -Seconds 5
}

# Step 4: Start Frontend
Write-Host ""
Write-Host "🎨 Starting Frontend..." -ForegroundColor Yellow

# Start frontend in new window with network access
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Write-Host '🎨 FRONTEND APP (Network Accessible)' -ForegroundColor Magenta; Write-Host ''; npm run start:network"
)

Write-Host "✅ Frontend starting with network access (new window opened)" -ForegroundColor Green

# Step 5: Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✅ AURAX Application Starting!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Get local IP address
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notmatch "Loopback" -and $_.IPAddress -match "^(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)"} | Select-Object -First 1).IPAddress

Write-Host "🖥️  Local Access:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:5002" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Magenta
Write-Host ""

if ($localIP) {
    Write-Host "📱 Mobile Access (Same Wi-Fi):" -ForegroundColor Green
    Write-Host "   Backend:  http://${localIP}:5002" -ForegroundColor Yellow
    Write-Host "   Frontend: http://${localIP}:3000" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "   💡 Use this address on your mobile browser!" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Wait for both windows to show 'running' messages"
Write-Host "   2. Open browser: http://localhost:3000"
if ($localIP) {
    Write-Host "   3. Mobile: http://${localIP}:3000"
}
Write-Host "   4. Register or login"
Write-Host "   5. If creator: Complete profile setup"
Write-Host "   6. If admin needed: Run setup-admin.js"
Write-Host ""
Write-Host "🛑 To stop: Close both PowerShell windows" -ForegroundColor Red
Write-Host ""
Write-Host "Press any key to exit this window..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
