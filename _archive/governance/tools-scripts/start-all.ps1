# LumeOS — Start All Services
# Startet alle Control Plane Services + Tools automatisch
# Usage: powershell -ExecutionPolicy Bypass -File tools/scripts/start-all.ps1

$ROOT = "D:\GitHub\LumeOS-Claude-V1"
$ENV_FILE = "$ROOT\.env"

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  LumeOS Control Plane Startup" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Prüfe .env
if (-not (Test-Path $ENV_FILE)) {
    Write-Host "ERROR: .env nicht gefunden!" -ForegroundColor Red
    Write-Host "Erstelle .env mit: npx tsx tools/scripts/generate-ed25519-keys.ts"
    exit 1
}

Write-Host "Lade .env..." -ForegroundColor Gray
Get-Content $ENV_FILE | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim())
    }
}
Write-Host "OK" -ForegroundColor Green

# Funktion: Service in eigenem Fenster starten
function Start-Service {
    param($Name, $Port, $Command, $WorkDir = $ROOT)
    
    # Prüfe ob bereits läuft
    try {
        $null = Invoke-WebRequest "http://localhost:$Port" -UseBasicParsing -TimeoutSec 1 -EA Stop
        Write-Host "  $Name (Port $Port): bereits UP" -ForegroundColor Green
        return
    } catch {}
    
    Write-Host "  Starte $Name (Port $Port)..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -Command `"Set-Location '$WorkDir'; Get-Content '$ENV_FILE' | ForEach-Object { if (`$_ -match '^\s*([^#][^=]+)=(.*)$') { [System.Environment]::SetEnvironmentVariable(`$Matches[1].Trim(), `$Matches[2].Trim()) } }; $Command`"" -WindowStyle Minimized
    Start-Sleep 2
}

Write-Host ""
Write-Host "--- Docker Services ---" -ForegroundColor Cyan

# Supabase
try {
    $null = Invoke-WebRequest "http://localhost:54321" -UseBasicParsing -TimeoutSec 2 -EA Stop
    Write-Host "  Supabase (54321): bereits UP" -ForegroundColor Green
} catch {
    Write-Host "  Starte Supabase..." -ForegroundColor Yellow
    Set-Location $ROOT
    supabase start 2>&1 | Out-Null
}

# Grafana
try {
    $null = Invoke-WebRequest "http://localhost:3001" -UseBasicParsing -TimeoutSec 2 -EA Stop
    Write-Host "  Grafana (3001): bereits UP" -ForegroundColor Green
} catch {
    Write-Host "  Starte Grafana..." -ForegroundColor Yellow
    docker start grafana 2>&1 | Out-Null
}

# Prometheus
try {
    $null = Invoke-WebRequest "http://localhost:9090" -UseBasicParsing -TimeoutSec 2 -EA Stop
    Write-Host "  Prometheus (9090): bereits UP" -ForegroundColor Green
} catch {
    Write-Host "  Starte Prometheus..." -ForegroundColor Yellow
    docker start prometheus 2>&1 | Out-Null
}

Write-Host ""
Write-Host "--- Control Plane Services ---" -ForegroundColor Cyan

Start-Service "WO Classifier"       9000 "pnpm --filter @lumeos/wo-classifier dev"
Start-Service "SAT-Check"           9001 "pnpm --filter @lumeos/sat-check dev"
Start-Service "Scheduler API"       9002 "pnpm --filter @lumeos/scheduler-api dev"
Start-Service "Governance Compiler" 9003 "pnpm --filter @lumeos/governance-compiler dev"

Write-Host ""
Write-Host "--- Memory & Tools ---" -ForegroundColor Cyan

# windows_exporter (GPU + System Metrics)
$exporterRunning = Get-Process -Name "windows_exporter" -EA SilentlyContinue
if ($exporterRunning) {
    Write-Host "  windows_exporter (9182): bereits UP" -ForegroundColor Green
} else {
    Write-Host "  Starte windows_exporter..." -ForegroundColor Yellow
    Start-Process "C:\tools\windows_exporter.exe" -ArgumentList "--collectors.enabled=cpu,memory,net,logical_disk,os,system,textfile --collector.textfile.directories=C:\tools\textfile_metrics" -WindowStyle Hidden
}

# nvidia_metrics.ps1 (GPU Temp Polling)
$nvRunning = Get-Process powershell -EA SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*nvidia*" }
if (-not $nvRunning) {
    Write-Host "  Starte nvidia_metrics Poller..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit -WindowStyle Minimized -ExecutionPolicy Bypass -File '$ROOT\tools\scripts\nvidia_metrics.ps1'" -WindowStyle Minimized
}

# claude-mem Worker
try {
    $null = Invoke-WebRequest "http://localhost:37777" -UseBasicParsing -TimeoutSec 2 -EA Stop
    Write-Host "  claude-mem (37777): bereits UP" -ForegroundColor Green
} catch {
    Write-Host "  Starte claude-mem..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -File '$ROOT\tools\scripts\start-claude-mem.ps1'" -WindowStyle Minimized
}

# LightRAG (optional — nur starten wenn storage vorhanden)
if (Test-Path "$ROOT\tools\lightrag\storage") {
    try {
        $null = Invoke-WebRequest "http://localhost:9004/health" -UseBasicParsing -TimeoutSec 2 -EA Stop
        Write-Host "  LightRAG (9004): bereits UP" -ForegroundColor Green
    } catch {
        Write-Host "  Starte LightRAG..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -File '$ROOT\tools\scripts\start-lightrag.ps1'" -WindowStyle Minimized
    }
}

# Warte bis Services hochgefahren sind
Write-Host ""
Write-Host "Warte auf Services..." -ForegroundColor Gray
Start-Sleep 5

# Status Check
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Status" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

$checks = @{
    "Supabase"           = "http://localhost:54321"
    "WO Classifier"      = "http://localhost:9000"
    "SAT-Check"          = "http://localhost:9001"
    "Scheduler"          = "http://localhost:9002"
    "Gov. Compiler"      = "http://localhost:9003"
    "LightRAG"           = "http://localhost:9004/health"
    "claude-mem"         = "http://localhost:37777"
    "Grafana"            = "http://localhost:3001"
    "Prometheus"         = "http://localhost:9090"
}

$allUp = $true
foreach ($svc in $checks.GetEnumerator()) {
    try {
        $null = Invoke-WebRequest $svc.Value -UseBasicParsing -TimeoutSec 3 -EA Stop
        Write-Host "  $($svc.Key): UP" -ForegroundColor Green
    } catch {
        Write-Host "  $($svc.Key): DOWN (noch nicht bereit)" -ForegroundColor Yellow
        $allUp = $false
    }
}

Write-Host ""
Write-Host "Sparks:"
try { $null = Invoke-WebRequest "http://192.168.0.128:8001/v1/models" -UseBasicParsing -TimeoutSec 3 -EA Stop; Write-Host "  Spark A (192.168.0.128): UP" -ForegroundColor Green } catch { Write-Host "  Spark A: DOWN" -ForegroundColor Red; $allUp = $false }
try { $null = Invoke-WebRequest "http://192.168.0.188:8001/v1/models" -UseBasicParsing -TimeoutSec 3 -EA Stop; Write-Host "  Spark B (192.168.0.188): UP" -ForegroundColor Green } catch { Write-Host "  Spark B: DOWN" -ForegroundColor Red; $allUp = $false }

Write-Host ""
if ($allUp) {
    Write-Host "Alle Services laufen." -ForegroundColor Green
} else {
    Write-Host "Einige Services brauchen noch einen Moment — nochmals prüfen mit:" -ForegroundColor Yellow
    Write-Host "  pwsh tools/scripts/check-all-services.ps1" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Dashboards:" -ForegroundColor Cyan
Write-Host "  Grafana:        http://localhost:3001 (admin/lumeos2026)"
Write-Host "  Supabase Studio: http://localhost:54323"
Write-Host "  claude-mem:      http://localhost:37777"
Write-Host ""
