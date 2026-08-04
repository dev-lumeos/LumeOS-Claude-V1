# Starts the LumeOS monitoring stack (Prometheus + Grafana).
# Requires: Docker Desktop running.
#
# UIs:
#   Grafana:    http://localhost:3001 (admin / lumeos2026)
#   Prometheus: http://localhost:9090

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)

function Start-Container {
    param(
        [string]$Name,
        [scriptblock]$RunCmd,
        [string]$Url
    )
    $running = docker ps --filter "name=$Name" --format "{{.Names}}"
    if ($running -eq $Name) {
        Write-Host "$Name already running -> $Url"
        return
    }
    docker start $Name 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$Name started (existing container) -> $Url"
        return
    }
    & $RunCmd
    Write-Host "$Name started (new container) -> $Url"
}

# Prometheus
$promConfig = Join-Path $repoRoot "infra/prometheus/prometheus.yml"
if (-not (Test-Path $promConfig)) {
    Write-Error "prometheus.yml not found at $promConfig"
    exit 2
}
Start-Container -Name "prometheus" -Url "http://localhost:9090" -RunCmd {
    docker run -d `
        --name=prometheus `
        --add-host=host.docker.internal:host-gateway `
        -p 9090:9090 `
        -v "${promConfig}:/etc/prometheus/prometheus.yml" `
        prom/prometheus
}

# Grafana
Start-Container -Name "grafana" -Url "http://localhost:3001" -RunCmd {
    docker run -d -p 3001:3000 `
        --name=grafana `
        --add-host=host.docker.internal:host-gateway `
        -e GF_SECURITY_ADMIN_PASSWORD=lumeos2026 `
        grafana/grafana
}

Write-Host ""
Write-Host "Dashboards:"
Write-Host "  WO Pipeline:       http://localhost:3001/d/lumeos-wo-pipeline"
Write-Host "  Hardware & vLLM:   http://localhost:3001/d/lumeos-hardware"
Write-Host ""
Write-Host "Exporters NOT yet installed (see infra/prometheus/README.md):"
Write-Host "  - node_exporter on Spark A  (192.168.0.128:9100)"
Write-Host "  - node_exporter on Spark B  (192.168.0.188:9100)"
Write-Host "  - windows_exporter          (localhost:9182)"
Write-Host "  - nvidia_gpu_exporter       (localhost:9835)"
