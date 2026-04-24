# Grafana Hardware Monitoring Dashboard
# Threadripper + Spark A + Spark B + RTX 5090
# Prometheus als Metrics Backend

---

## Architektur

```
Spark A (192.168.0.128)
  └─ vLLM /metrics Port 8001     → Prometheus scrape
  └─ node_exporter Port 9100     → CPU/RAM/Disk

Spark B (192.168.0.188)
  └─ vLLM /metrics Port 8001     → Prometheus scrape
  └─ node_exporter Port 9100     → CPU/RAM/Disk

Threadripper (localhost)
  └─ windows_exporter Port 9182  → CPU/RAM/Disk/Network
  └─ nvidia_smi_exporter Port 9835 → RTX 5090 Temp/Power/Util

Prometheus (Docker Port 9090)   → scrape alle obigen
Grafana (Docker Port 3001)      → liest Prometheus
```

---

## Schritt 1: Prometheus starten

```powershell
# Erstelle prometheus.yml
mkdir D:\GitHub\LumeOS-Claude-V1\infra\prometheus

# prometheus.yml schreiben (nächster Schritt)
# Dann starten:
docker run -d `
  --name=prometheus `
  --add-host=host.docker.internal:host-gateway `
  -p 9090:9090 `
  -v D:\GitHub\LumeOS-Claude-V1\infra\prometheus\prometheus.yml:/etc/prometheus/prometheus.yml `
  prom/prometheus
```

Erstelle `infra/prometheus/prometheus.yml`:
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'spark-a-vllm'
    static_configs:
      - targets: ['192.168.0.128:8001']
    metrics_path: '/metrics'

  - job_name: 'spark-b-vllm'
    static_configs:
      - targets: ['192.168.0.188:8001']
    metrics_path: '/metrics'

  - job_name: 'spark-a-node'
    static_configs:
      - targets: ['192.168.0.128:9100']

  - job_name: 'spark-b-node'
    static_configs:
      - targets: ['192.168.0.188:9100']

  - job_name: 'threadripper-windows'
    static_configs:
      - targets: ['host.docker.internal:9182']

  - job_name: 'threadripper-gpu'
    static_configs:
      - targets: ['host.docker.internal:9835']
```

---

## Schritt 2: node_exporter auf Spark A und B installieren

Auf Spark A (SSH oder direkt):
```bash
# Auf Spark A ausführen (192.168.0.128)
docker run -d \
  --name=node-exporter \
  --net="host" \
  --pid="host" \
  -v "/:/host:ro,rslave" \
  prom/node-exporter \
  --path.rootfs=/host
```

Gleich auf Spark B (192.168.0.188).

---

## Schritt 3: windows_exporter auf Threadripper

```powershell
# Download und installieren
$url = "https://github.com/prometheus-community/windows_exporter/releases/latest/download/windows_exporter-amd64.exe"
Invoke-WebRequest $url -OutFile "C:\tools\windows_exporter.exe"

# Als Service starten (Port 9182)
# Collectors: cpu,memory,net,logical_disk,gpu
Start-Process "C:\tools\windows_exporter.exe" `
  -ArgumentList "--collectors.enabled=cpu,memory,net,logical_disk" `
  -WindowStyle Hidden
```

---

## Schritt 4: NVIDIA GPU Metrics (Threadripper RTX 5090)

```powershell
# nvidia_gpu_exporter (liest nvidia-smi)
docker run -d `
  --name=nvidia-gpu-exporter `
  --add-host=host.docker.internal:host-gateway `
  -p 9835:9835 `
  utkuozdemir/nvidia_gpu_exporter:1.2.0
```

Aber NVIDIA Docker auf Windows benötigt WSL2.
Alternative: direkt als PowerShell Script das nvidia-smi pollt.

---

## Schritt 5: Prometheus Datasource in Grafana hinzufügen

```bash
curl -s -X POST http://admin:lumeos2026@localhost:3001/api/datasources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Prometheus",
    "type": "prometheus",
    "url": "http://host.docker.internal:9090",
    "access": "proxy",
    "isDefault": false
  }'
```

---

## Schritt 6: Hardware Dashboard erstellen

Dashboard mit folgenden Panels:

### Row 1 — Threadripper
- CPU Usage % (windows_exporter: `windows_cpu_time_total`)
- RAM Usage GB (windows_exporter: `windows_os_physical_memory_free_bytes`)
- RTX 5090 Temp °C (nvidia: `nvidia_smi_temperature_gpu`)
- RTX 5090 GPU Util % (nvidia: `nvidia_smi_utilization_gpu_ratio`)

### Row 2 — Spark A (Governance Compiler)
- GPU Temp °C (node_exporter nvidia: `DCGM_FI_DEV_GPU_TEMP`)
- GPU Util % (vLLM: `vllm:num_requests_running`)
- Tokens/s (vLLM: rate of `vllm:generation_tokens_total`)
- KV Cache % (vLLM: `vllm:kv_cache_usage_perc`)

### Row 3 — Spark B (Micro Executor)
- GPU Temp °C
- GPU Util %
- Tokens/s
- Requests Running

### Row 4 — vLLM Performance
- Spark A prompt_tokens_total (counter)
- Spark B prompt_tokens_total (counter)
- Time to first token (histogram avg)
- Request success rate

Alle Panels auto-refresh 10s.

---

## WICHTIG: Was sofort funktioniert

vLLM Metrics auf Port 8001/metrics sind BEREITS Prometheus-kompatibel.
Das bedeutet: Spark A und B Token-Stats, GPU Util, KV Cache — alles sofort verfügbar
sobald Prometheus läuft und scraped.

node_exporter auf den Sparks braucht kurze Installation (Docker, 1 Befehl).
windows_exporter auf Threadripper braucht Download + Start.

## Reihenfolge

1. `infra/prometheus/prometheus.yml` erstellen
2. Prometheus Docker starten
3. Grafana Prometheus Datasource hinzufügen
4. node_exporter auf Spark A + B starten (via SSH oder manuell)
5. windows_exporter auf Threadripper starten
6. Hardware Dashboard JSON erstellen und importieren
7. `tools/scripts/start-monitoring.ps1` Startup Script
