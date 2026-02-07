# OmniBet AI - Full Disaster Recovery Backup Script
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm"
$sourcePath = $PSScriptRoot
$parentDir = Split-Path -Parent $sourcePath
$backupPath = Join-Path $parentDir "OmnibetAPP_FULL_BACKUP_$timestamp"

Write-Host "🛡️ Iniciando Backup Total de OmniBet AI..." -ForegroundColor Cyan
Write-Host "Source: $sourcePath"
Write-Host "Target: $backupPath"

# Create backup directory
if (!(Test-Path $backupPath)) {
    New-Item -ItemType Directory -Path $backupPath | Out-Null
}

# Copy Project Files (Excluding heavy folders)
Write-Host "📦 Copiando archivos del proyecto (excluyendo dependencias pesadas)..."
Copy-Item -Path "$sourcePath\*" -Destination $backupPath -Recurse -Exclude "node_modules", ".next"

# Copy AI Brain History (Context)
$brainPath = "C:\Users\PABLO\.gemini\antigravity\brain\7a0ed5d9-b9e1-4d39-8344-4b5f9cbcf4e6"
if (Test-Path $brainPath) {
    Write-Host "🧠 Respaldando historial de la IA (Brains)..."
    $brainTarget = Join-Path $backupPath "AI_BRAIN_HISTORY"
    New-Item -ItemType Directory -Path $brainTarget | Out-Null
    Copy-Item -Path "$brainPath\*" -Destination $brainTarget -Recurse
}

Write-Host "✅ ¡BACKUP COMPLETADO CON ÉXITO!" -ForegroundColor Green
Write-Host "Ubicación: $backupPath"
Pause
