@echo off
echo.
echo ================================================================
echo  AURAX BACKEND SERVER - EMAIL VERIFICATION SYSTEM
echo ================================================================
echo.
echo Starting Aurax backend server with email verification...
echo.

cd /d "%~dp0backend-copy"

if not exist "server.js" (
    echo ERROR: server.js not found in backend-copy directory
    echo Please make sure you're running this script from the frontend-copy folder
    pause
    exit /b 1
)

echo Checking if port 5002 is available...
netstat -an | findstr :5002 >nul
if %errorlevel% == 0 (
    echo.
    echo WARNING: Port 5002 is already in use
    echo Attempting to kill existing node processes...
    taskkill /IM node.exe /F >nul 2>&1
    timeout /t 2 >nul
)

echo.
echo Starting server...
echo.
echo ✅ Server will be available at: http://localhost:5002
echo ✅ Email verification test page: ../test-email-verification.html  
echo ✅ API endpoints ready for email verification flow
echo.
echo Press Ctrl+C to stop the server
echo.

node server.js

echo.
echo Server stopped.
pause
