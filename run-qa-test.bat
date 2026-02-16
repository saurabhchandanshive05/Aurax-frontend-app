@echo off
echo.
echo ========================================================
echo   META GRAPH API - QA TESTING AUTOMATION
echo   Testing Page ID: 1737772143174400
echo   Acceptance: 100%% Data Fetch
echo ========================================================
echo.

REM Check if .env exists
if not exist "backend-copy\.env" (
    echo [ERROR] backend-copy\.env file not found!
    echo Please create .env file first.
    pause
    exit /b 1
)

REM Check if token is configured
findstr /C:"META_AD_LIBRARY_ACCESS_TOKEN=" backend-copy\.env | findstr /V /C:"META_AD_LIBRARY_ACCESS_TOKEN=$" >nul
if %errorlevel% neq 0 (
    echo.
    echo [WARNING] META_AD_LIBRARY_ACCESS_TOKEN not configured in .env
    echo.
    echo Please follow these steps:
    echo 1. Open: https://developers.facebook.com/tools/explorer/
    echo 2. Add permission: ads_read
    echo 3. Generate Access Token
    echo 4. Copy token and add to backend-copy\.env
    echo.
    echo Opening Graph API Explorer...
    start https://developers.facebook.com/tools/explorer/
    echo.
    echo After getting token, edit backend-copy\.env and add:
    echo META_AD_LIBRARY_ACCESS_TOKEN=YOUR_TOKEN_HERE
    echo.
    echo Then run this script again.
    echo.
    pause
    exit /b 1
)

echo [INFO] Token found in .env file
echo.
echo Starting QA tests...
echo.

cd backend-copy

REM Run the test
node test-meta-api.js

REM Check exit code
if %errorlevel% equ 0 (
    echo.
    echo ========================================================
    echo   QA TEST PASSED!
    echo ========================================================
    echo.
) else (
    echo.
    echo ========================================================
    echo   QA TEST FAILED - Check errors above
    echo ========================================================
    echo.
)

cd ..

pause
