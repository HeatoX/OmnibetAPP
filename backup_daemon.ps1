$source = "C:\Users\PABLO\Desktop\OmnibetAPP"
$backupRoot = "C:\Users\PABLO\Desktop\OmnibetAPP\Backups"

if (!(Test-Path $backupRoot)) {
    New-Item -ItemType Directory -Path $backupRoot | Out-Null
}

Write-Host "=========================================="
Write-Host "   OMNIBET AI - AUTO BACKUP SYSTEM"
Write-Host "   Running every 5 minutes..."
Write-Host "   Source: $source"
Write-Host "   Target: $backupRoot"
Write-Host "=========================================="

while ($true) {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $dest = Join-Path $backupRoot $timestamp
    
    Write-Host "[$timestamp] Starting Backup..."
    
    # Robocopy is efficient for mirroring/copying
    # /E = Copy subdirectories, including Empty ones
    # /XD = Exclude Directories (node_modules, .next, etc. to save space/time)
    # /XF = Exclude Files
    # /R:0 /W:0 = No retries, no wait (fail fast on locked files)
    $params = @($source, $dest, "/E", "/XD", "node_modules", ".next", ".git", ".vs", "Backups", "tmp", "/R:0", "/W:0")
    
    $p = Start-Process -FilePath "robocopy" -ArgumentList $params -NoNewWindow -PassThru -Wait
    
    if ($p.ExitCode -ge 8) {
        Write-Host "   [!] Backup finished with faulty errors (Exit Code: $($p.ExitCode))" -ForegroundColor Red
    } else {
        Write-Host "   [✓] Backup saved to: Backups\$timestamp" -ForegroundColor Green
    }
    
    Write-Host "   Waiting 5 minutes for next backup..."
    Start-Sleep -Seconds 300
}
