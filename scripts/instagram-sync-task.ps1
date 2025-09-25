# Instagram Insights Sync - Windows Task Scheduler PowerShell Script
# This script runs the Instagram sync process and can be scheduled to run daily

param(
    [string]$InstallPath = "C:\Users\hp\OneDrive\Desktop\frontend-copy",
    [string]$LogPath = "C:\Users\hp\OneDrive\Desktop\frontend-copy\logs",
    [string]$SyncTime = "09:00"
)

# Ensure log directory exists
if (!(Test-Path $LogPath)) {
    New-Item -ItemType Directory -Path $LogPath -Force
}

# Log file with date
$LogFile = Join-Path $LogPath "instagram-sync-$(Get-Date -Format 'yyyy-MM-dd').log"

function Write-Log {
    param([string]$Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

function Test-InternetConnection {
    try {
        $response = Invoke-WebRequest -Uri "https://graph.instagram.com" -Method Head -TimeoutSec 10
        return $response.StatusCode -eq 200
    }
    catch {
        return $false
    }
}

function Start-InstagramSync {
    Write-Log "🚀 Starting Instagram Insights Sync Process"
    
    # Check internet connection
    if (!(Test-InternetConnection)) {
        Write-Log "❌ No internet connection. Aborting sync."
        return $false
    }
    
    Write-Log "✅ Internet connection verified"
    
    # Change to project directory
    try {
        Set-Location $InstallPath
        Write-Log "📂 Changed to directory: $InstallPath"
    }
    catch {
        Write-Log "❌ Failed to change directory to $InstallPath"
        return $false
    }
    
    # Check if Node.js is available
    try {
        $nodeVersion = node --version
        Write-Log "📦 Node.js version: $nodeVersion"
    }
    catch {
        Write-Log "❌ Node.js not found. Please install Node.js."
        return $false
    }
    
    # Install/Update dependencies if needed
    if (!(Test-Path "node_modules")) {
        Write-Log "📥 Installing dependencies..."
        npm install
    }
    
    # Create a temporary sync script
    $SyncScript = @"
const InstagramAPI = require('./src/utils/instagramAPI.js');
const fs = require('fs');

async function performSync() {
    console.log('🔄 Starting Instagram sync...');
    
    try {
        const result = await InstagramAPI.performFullSync();
        
        if (result.status === 'success') {
            console.log('✅ Instagram sync completed successfully');
            console.log('📊 Metrics:', {
                impressions: result.insights.metrics.total_impressions,
                reach: result.insights.metrics.total_reach,
                engagement_rate: result.insights.metrics.avg_engagement_rate + '%',
                posts_analyzed: result.insights.metrics.posts_analyzed
            });
            
            // Save sync status
            fs.writeFileSync('last-sync-status.json', JSON.stringify({
                timestamp: new Date().toISOString(),
                status: 'success',
                type: 'scheduled',
                metrics: result.insights.metrics
            }));
            
            process.exit(0);
        } else {
            console.error('❌ Instagram sync failed:', result.error);
            
            // Save error status
            fs.writeFileSync('last-sync-status.json', JSON.stringify({
                timestamp: new Date().toISOString(),
                status: 'error',
                type: 'scheduled',
                error: result.error
            }));
            
            process.exit(1);
        }
    } catch (error) {
        console.error('🚨 Sync process error:', error.message);
        
        // Save critical error status
        fs.writeFileSync('last-sync-status.json', JSON.stringify({
            timestamp: new Date().toISOString(),
            status: 'critical_error',
            type: 'scheduled',
            error: error.message
        }));
        
        process.exit(1);
    }
}

performSync();
"@
    
    $TempSyncFile = Join-Path $InstallPath "temp-instagram-sync.js"
    $SyncScript | Out-File -FilePath $TempSyncFile -Encoding UTF8
    
    try {
        Write-Log "🔄 Executing Instagram sync..."
        $process = Start-Process -FilePath "node" -ArgumentList $TempSyncFile -Wait -PassThru -RedirectStandardOutput "$LogPath\node-output.log" -RedirectStandardError "$LogPath\node-error.log"
        
        if ($process.ExitCode -eq 0) {
            Write-Log "✅ Instagram sync completed successfully"
            
            # Read sync results if available
            $StatusFile = Join-Path $InstallPath "last-sync-status.json"
            if (Test-Path $StatusFile) {
                $status = Get-Content $StatusFile | ConvertFrom-Json
                Write-Log "📊 Sync Results - Impressions: $($status.metrics.total_impressions), Reach: $($status.metrics.total_reach), Engagement: $($status.metrics.avg_engagement_rate)%"
            }
            
            return $true
        } else {
            Write-Log "❌ Instagram sync failed with exit code: $($process.ExitCode)"
            
            # Log error details if available
            $ErrorLog = Join-Path $LogPath "node-error.log"
            if (Test-Path $ErrorLog) {
                $errorContent = Get-Content $ErrorLog -Raw
                Write-Log "🔍 Error details: $errorContent"
            }
            
            return $false
        }
    }
    catch {
        Write-Log "🚨 Failed to execute sync process: $($_.Exception.Message)"
        return $false
    }
    finally {
        # Clean up temporary file
        if (Test-Path $TempSyncFile) {
            Remove-Item $TempSyncFile -Force
        }
    }
}

function Send-NotificationEmail {
    param(
        [string]$Status,
        [string]$Details
    )
    
    # You can implement email notifications here if needed
    # For now, we'll just log the notification
    Write-Log "📧 Notification: Instagram sync $Status - $Details"
}

function Main {
    Write-Log "=" * 60
    Write-Log "🎯 Instagram Insights Sync - Scheduled Task"
    Write-Log "📅 Started at: $(Get-Date)"
    Write-Log "📂 Install Path: $InstallPath"
    Write-Log "📝 Log Path: $LogPath"
    Write-Log "=" * 60
    
    # Perform the sync
    $syncResult = Start-InstagramSync
    
    if ($syncResult) {
        Write-Log "🎉 Instagram sync process completed successfully"
        Send-NotificationEmail -Status "Success" -Details "Instagram insights synced to Aurax dashboard"
    } else {
        Write-Log "💥 Instagram sync process failed"
        Send-NotificationEmail -Status "Failed" -Details "Check logs for details"
    }
    
    Write-Log "🏁 Task completed at: $(Get-Date)"
    Write-Log "=" * 60
}

# Run the main function
Main
