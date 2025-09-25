@echo off
title Aurax Instagram Insights Setup
color 0A

echo.
echo ========================================
echo    📱 AURAX INSTAGRAM INSIGHTS SETUP
echo ========================================
echo.

echo ⏳ Setting up Instagram integration...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found! Please install Node.js first.
    echo 💡 Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Create logs directory
if not exist "logs" (
    mkdir logs
    echo 📁 Created logs directory
)

REM Create scripts directory  
if not exist "scripts" (
    mkdir scripts
    echo 📁 Created scripts directory
)

REM Copy environment template if .env doesn't exist
if not exist ".env" (
    if exist ".env.instagram.example" (
        copy ".env.instagram.example" ".env" >nul
        echo 📄 Created .env file from template
        echo ⚠️  IMPORTANT: Edit .env file with your Instagram API credentials
    )
)

echo.
echo ========================================
echo ✅ Setup completed successfully!
echo ========================================
echo.
echo 📋 Next steps:
echo 1. Edit .env file with your Instagram API token
echo 2. Start the application: npm start  
echo 3. Go to Creator Dashboard to see Instagram insights
echo 4. Optional: Run setup-instagram-scheduler.ps1 as Admin for automation
echo.
echo 📖 For detailed instructions, see INSTAGRAM_INTEGRATION_GUIDE.md
echo.

pause
