# Starts the Grafana Docker container for the LumeOS WO Dashboard
# UI:    http://localhost:3001
# Login: admin / lumeos2026

$ErrorActionPreference = "Stop"

$running = docker ps --filter "name=grafana" --format "{{.Names}}"
if ($running -eq 'grafana') {
    Write-Host "Grafana already running on http://localhost:3001"
    exit 0
}

docker start grafana 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Grafana started (existing container) on http://localhost:3001"
    exit 0
}

docker run -d -p 3001:3000 `
    --name=grafana `
    --add-host=host.docker.internal:host-gateway `
    -e GF_SECURITY_ADMIN_PASSWORD=lumeos2026 `
    grafana/grafana
Write-Host "Grafana started (new container) on http://localhost:3001"
