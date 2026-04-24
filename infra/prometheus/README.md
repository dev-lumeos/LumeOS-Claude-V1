# Prometheus — LumeOS Hardware & vLLM Monitoring

**UI:** http://localhost:9090

Scrapes vLLM (Spark A+B), host metrics (node_exporter on Linux / windows_exporter
on Windows) and GPU metrics (RTX 5090 via windows_exporter textfile collector).
Grafana reads from here via the `Prometheus` datasource.

## Scrape Targets

| Job                   | Target                          | Exporter                              | Status |
|-----------------------|---------------------------------|---------------------------------------|--------|
| `prometheus`          | `localhost:9090`                | self                                  | **up** |
| `spark-a-vllm`        | `192.168.0.128:8001/metrics`    | vLLM built-in                         | **up** |
| `spark-b-vllm`        | `192.168.0.188:8001/metrics`    | vLLM built-in                         | **up** |
| `spark-a-node`        | `192.168.0.128:9100/metrics`    | node_exporter (Docker)                | **up** |
| `spark-b-node`        | `192.168.0.188:9100/metrics`    | node_exporter (Docker)                | **up** |
| `threadripper-windows`| `host.docker.internal:9182`     | windows_exporter + textfile collector | **up** |

RTX 5090 metrics (`nvidia_smi_*`) arrive through the `threadripper-windows` job
via windows_exporter's textfile collector — no separate scrape target.

Config: [`prometheus.yml`](./prometheus.yml)

## Starten

```powershell
pwsh tools/scripts/start-monitoring.ps1
```

## Installation Status

### ✓ Already installed / running

- **node_exporter on Spark A+B** (Docker):
  ```bash
  ssh -i "<nvsync.key>" admin@192.168.0.128 \
    'docker run -d --name=node-exporter --restart=unless-stopped \
       --net=host --pid=host -v "/:/host:ro,rslave" \
       prom/node-exporter --path.rootfs=/host'
  # same for 192.168.0.188
  ```

- **windows_exporter on Threadripper** (`C:\tools\windows_exporter.exe`):
  ```powershell
  C:\tools\windows_exporter.exe `
    --collectors.enabled=cpu,memory,net,logical_disk,os,system,textfile `
    --collector.textfile.directories=C:\tools\textfile_metrics
  ```
  Note: flag is `--collector.textfile.directories` (plural), default directory
  is `C:\tools\textfile_inputs` which we override to match our layout.

- **nvidia_metrics.ps1 loop** (`C:\tools\nvidia_metrics.ps1`, writes every 15s):
  Started as hidden background process. Source lives in
  [`tools/scripts/nvidia_metrics.ps1`](../../tools/scripts/nvidia_metrics.ps1).
  ```powershell
  Start-Process powershell -ArgumentList `
    "-NoProfile","-WindowStyle","Hidden","-ExecutionPolicy","Bypass", `
    "-File","C:\tools\nvidia_metrics.ps1"
  ```

  Emits to `C:\tools\textfile_metrics\nvidia.prom`:
  - `nvidia_smi_temperature_gpu`
  - `nvidia_smi_utilization_gpu`
  - `nvidia_smi_utilization_memory`
  - `nvidia_smi_memory_used_bytes` / `nvidia_smi_memory_total_bytes`
  - `nvidia_smi_power_draw_watts`
  - `nvidia_smi_fan_speed`
  - `nvidia_smi_exporter_last_write_seconds` (liveness heartbeat)

### Optional — DCGM on Sparks (Spark GPU temperature)

vLLM metrics expose KV-cache + request stats but **no GPU temperature**.
If Spark GPU temp panels (`DCGM_FI_DEV_GPU_TEMP`) are needed:

```bash
docker run -d --name=dcgm-exporter --restart=unless-stopped \
  --gpus all --net=host --cap-add SYS_ADMIN \
  nvcr.io/nvidia/k8s/dcgm-exporter:3.3.5-3.4.0-ubuntu22.04
```

Then add to `prometheus.yml`:
```yaml
  - job_name: 'spark-a-dcgm'
    static_configs:
      - targets: ['192.168.0.128:9400']
        labels: { host: 'spark-a' }
```

## Konfiguration neu laden

The default Prometheus container is started without `--web.enable-lifecycle`,
so config changes require a container restart:

```powershell
docker restart prometheus
```

## Verifikation

```bash
# All targets (expect 6 up)
curl -s http://localhost:9090/api/v1/targets | jq '.data.activeTargets[] | {job: .labels.job, health}'

# Live queries
curl -s 'http://localhost:9090/api/v1/query?query=nvidia_smi_temperature_gpu' | jq
curl -s 'http://localhost:9090/api/v1/query?query=vllm:num_requests_running' | jq

# Dashboard in Grafana
curl -s http://admin:lumeos2026@localhost:3001/api/dashboards/uid/lumeos-hardware | jq '.dashboard.title'
```

## Dashboard Panel Queries (Reference)

| Panel                | PromQL |
|----------------------|--------|
| Threadripper CPU %   | `100 - (avg(rate(windows_cpu_time_total{mode="idle",job="threadripper-windows"}[2m])) * 100)` |
| Threadripper RAM GB  | `(windows_memory_physical_total_bytes{job="threadripper-windows"} - windows_memory_physical_free_bytes{job="threadripper-windows"}) / 1024^3` |
| RTX 5090 Temp        | `nvidia_smi_temperature_gpu{job="threadripper-windows"}` |
| RTX 5090 Util        | `nvidia_smi_utilization_gpu{job="threadripper-windows"}` |
| Spark CPU %          | `100 - (avg by (host) (rate(node_cpu_seconds_total{mode="idle"}[1m])) * 100)` |
| Spark RAM used GB    | `(node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / 1024^3` |
| vLLM Tokens/s        | `rate(vllm:generation_tokens_total[1m])` |
| vLLM TTFT p50        | `histogram_quantile(0.5, sum by (le, host) (rate(vllm:time_to_first_token_seconds_bucket[5m])))` |
