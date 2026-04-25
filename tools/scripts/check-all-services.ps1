$ports = @{
  9000='wo-classifier'; 9001='sat-check'; 9002='scheduler'
  9003='governance-compiler'; 9004='lightrag'; 9005='orchestrator'
  3001='grafana'; 9090='prometheus'; 9182='windows_exporter'
  37777='claude-mem'; 54321='supabase'
}
Write-Host '=== SERVICES ==='
foreach ($p in $ports.GetEnumerator()) {
  try {
    $null = Invoke-WebRequest "http://localhost:$($p.Key)" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "  $($p.Key) ($($p.Value)): UP"
  } catch {
    Write-Host "  $($p.Key) ($($p.Value)): DOWN"
  }
}
Write-Host ''
Write-Host '=== SPARKS ==='
try { $null = Invoke-WebRequest 'http://192.168.0.128:8001/v1/models' -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop; Write-Host '  Spark A 192.168.0.128:8001: UP' } catch { Write-Host '  Spark A: DOWN' }
try { $null = Invoke-WebRequest 'http://192.168.0.188:8001/v1/models' -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop; Write-Host '  Spark B 192.168.0.188:8001: UP' } catch { Write-Host '  Spark B: DOWN' }
Write-Host ''
Write-Host '=== DOCKER ==='
docker ps --format '{{.Names}} -- {{.Status}}' 2>&1 | Select-String 'grafana|prometheus|supabase_db'
