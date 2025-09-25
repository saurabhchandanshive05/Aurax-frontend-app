# Setup Windows Task Scheduler for Instagram Insights Sync
# Run this script as Administrator to create the scheduled task

param(
    [string]$TaskName = "AuraxInstagramSync",
    [string]$SyncTime = "09:00",
    [string]$ProjectPath = "C:\Users\hp\OneDrive\Desktop\frontend-copy",
    [string]$UserName = $env:USERNAME
)

Write-Host "🚀 Setting up Instagram Insights Sync - Windows Task Scheduler" -ForegroundColor Green
Write-Host "=" * 60

# Check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (!(Test-Administrator)) {
    Write-Host "❌ This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "💡 Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Administrator privileges confirmed" -ForegroundColor Green

# Verify project path exists
if (!(Test-Path $ProjectPath)) {
    Write-Host "❌ Project path does not exist: $ProjectPath" -ForegroundColor Red
    $ProjectPath = Read-Host "Please enter the correct path to your frontend project"
    
    if (!(Test-Path $ProjectPath)) {
        Write-Host "❌ Invalid path provided. Exiting." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Project path verified: $ProjectPath" -ForegroundColor Green

# Create logs directory
$LogsPath = Join-Path $ProjectPath "logs"
if (!(Test-Path $LogsPath)) {
    New-Item -ItemType Directory -Path $LogsPath -Force | Out-Null
    Write-Host "📁 Created logs directory: $LogsPath" -ForegroundColor Green
}

# Create scripts directory if it doesn't exist
$ScriptsPath = Join-Path $ProjectPath "scripts"
if (!(Test-Path $ScriptsPath)) {
    New-Item -ItemType Directory -Path $ScriptsPath -Force | Out-Null
    Write-Host "📁 Created scripts directory: $ScriptsPath" -ForegroundColor Green
}

# Path to the PowerShell script
$ScriptPath = Join-Path $ScriptsPath "instagram-sync-task.ps1"

# Verify the sync script exists
if (!(Test-Path $ScriptPath)) {
    Write-Host "❌ Instagram sync script not found at: $ScriptPath" -ForegroundColor Red
    Write-Host "💡 Please make sure the instagram-sync-task.ps1 file exists in the scripts folder" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Sync script found: $ScriptPath" -ForegroundColor Green

# Remove existing task if it exists
try {
    $existingTask = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
        Write-Host "🗑️ Removed existing task: $TaskName" -ForegroundColor Yellow
    }
}
catch {
    # Task doesn't exist, which is fine
}

# Create the scheduled task action
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`" -InstallPath `"$ProjectPath`""

# Create the scheduled task trigger (daily at specified time)
$Trigger = New-ScheduledTaskTrigger -Daily -At $SyncTime

# Create task settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable

# Create the principal (user context)
$Principal = New-ScheduledTaskPrincipal -UserId $UserName -LogonType Interactive

# Register the scheduled task
try {
    Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Description "Daily Instagram insights sync for Aurax dashboard"
    Write-Host "✅ Scheduled task created successfully!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to create scheduled task: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verify the task was created
try {
    $createdTask = Get-ScheduledTask -TaskName $TaskName
    Write-Host "✅ Task verification successful" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to verify created task" -ForegroundColor Red
    exit 1
}

# Test the task (optional)
Write-Host ""
$testRun = Read-Host "Would you like to test run the task now? (y/n)"
if ($testRun -eq 'y' -or $testRun -eq 'Y') {
    Write-Host "🧪 Running test execution..." -ForegroundColor Yellow
    try {
        Start-ScheduledTask -TaskName $TaskName
        Write-Host "✅ Test execution started. Check the logs for results." -ForegroundColor Green
        Write-Host "📝 Log location: $LogsPath" -ForegroundColor Cyan
    }
    catch {
        Write-Host "❌ Failed to start test execution: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Display summary
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "🎉 Instagram Insights Sync Setup Complete!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Green
Write-Host "📅 Task Name: $TaskName" -ForegroundColor Cyan
Write-Host "⏰ Daily Sync Time: $SyncTime" -ForegroundColor Cyan
Write-Host "📂 Project Path: $ProjectPath" -ForegroundColor Cyan
Write-Host "📝 Logs Directory: $LogsPath" -ForegroundColor Cyan
Write-Host "🔧 Script Location: $ScriptPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Management Commands:" -ForegroundColor Yellow
Write-Host "  • View task: Get-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
Write-Host "  • Run manually: Start-ScheduledTask -TaskName '$TaskName'" -ForegroundColor White
Write-Host "  • Delete task: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false" -ForegroundColor White
Write-Host "  • View logs: Get-Content '$LogsPath\instagram-sync-*.log' -Tail 20" -ForegroundColor White
Write-Host ""
Write-Host "🔔 The task will run daily at $SyncTime and sync your Instagram insights to the Aurax dashboard." -ForegroundColor Green
Write-Host "📊 Check your dashboard tomorrow to see the synced data!" -ForegroundColor Green

Read-Host "`nPress Enter to exit"
