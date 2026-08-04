# nvidia_metrics.ps1 — polls nvidia-smi and writes Prometheus text format
# for consumption by windows_exporter's textfile collector.
#
# Deployment:
#   1. Copy this script to C:\tools\nvidia_metrics.ps1
#   2. Ensure C:\tools\textfile_metrics\ exists
#   3. Run as background process (from admin PowerShell):
#        Start-Process powershell -ArgumentList `
#          "-WindowStyle Hidden -ExecutionPolicy Bypass -File C:\tools\nvidia_metrics.ps1"
#   4. windows_exporter must be started with:
#        --collectors.enabled=cpu,memory,net,logical_disk,os,system,textfile
#        --collector.textfile.directory=C:\tools\textfile_metrics
#
# Metrics exposed (through windows_exporter /metrics):
#   nvidia_smi_temperature_gpu        (Celsius)
#   nvidia_smi_utilization_gpu        (percent 0-100)
#   nvidia_smi_utilization_memory     (percent 0-100)
#   nvidia_smi_memory_used_bytes
#   nvidia_smi_memory_total_bytes
#   nvidia_smi_power_draw_watts
#   nvidia_smi_fan_speed              (percent, 0 if no controllable fan)
#   nvidia_smi_exporter_last_write_seconds  (unix time of last successful write)

$ErrorActionPreference = "Stop"

$OutputDir  = "C:\tools\textfile_metrics"
$OutputFile = Join-Path $OutputDir "nvidia.prom"
$TempFile   = Join-Path $OutputDir "nvidia.prom.$PID.tmp"
$IntervalSec = 15

if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null
}

$query = "index,name,uuid,temperature.gpu,utilization.gpu,utilization.memory,memory.used,memory.total,power.draw,fan.speed"

function Write-NvidiaMetrics {
    $raw = & nvidia-smi --query-gpu=$query --format=csv,noheader,nounits 2>$null
    if ($LASTEXITCODE -ne 0 -or -not $raw) {
        return
    }

    $sb = [System.Text.StringBuilder]::new()
    [void]$sb.AppendLine("# HELP nvidia_smi_temperature_gpu GPU core temperature in Celsius.")
    [void]$sb.AppendLine("# TYPE nvidia_smi_temperature_gpu gauge")
    [void]$sb.AppendLine("# HELP nvidia_smi_utilization_gpu GPU utilization in percent.")
    [void]$sb.AppendLine("# TYPE nvidia_smi_utilization_gpu gauge")
    [void]$sb.AppendLine("# HELP nvidia_smi_utilization_memory Memory-controller utilization in percent.")
    [void]$sb.AppendLine("# TYPE nvidia_smi_utilization_memory gauge")
    [void]$sb.AppendLine("# HELP nvidia_smi_memory_used_bytes Memory currently in use.")
    [void]$sb.AppendLine("# TYPE nvidia_smi_memory_used_bytes gauge")
    [void]$sb.AppendLine("# HELP nvidia_smi_memory_total_bytes Total memory of the GPU.")
    [void]$sb.AppendLine("# TYPE nvidia_smi_memory_total_bytes gauge")
    [void]$sb.AppendLine("# HELP nvidia_smi_power_draw_watts Instantaneous power draw.")
    [void]$sb.AppendLine("# TYPE nvidia_smi_power_draw_watts gauge")
    [void]$sb.AppendLine("# HELP nvidia_smi_fan_speed Fan speed in percent (0 when not applicable).")
    [void]$sb.AppendLine("# TYPE nvidia_smi_fan_speed gauge")
    [void]$sb.AppendLine("# HELP nvidia_smi_exporter_last_write_seconds Unix time of last successful write.")
    [void]$sb.AppendLine("# TYPE nvidia_smi_exporter_last_write_seconds gauge")

    foreach ($line in @($raw)) {
        if (-not $line) { continue }
        $cols = $line -split ",\s*"
        if ($cols.Length -lt 10) { continue }

        $idx    = $cols[0].Trim()
        $name   = $cols[1].Trim() -replace '"', "'"
        $uuid   = $cols[2].Trim()
        $temp   = [double]($cols[3] -replace '[^\d\.]', '')
        $utilG  = [double]($cols[4] -replace '[^\d\.]', '')
        $utilM  = [double]($cols[5] -replace '[^\d\.]', '')
        $memU   = [double]($cols[6] -replace '[^\d\.]', '') * 1024 * 1024
        $memT   = [double]($cols[7] -replace '[^\d\.]', '') * 1024 * 1024
        $powerRaw = ($cols[8] -replace '[^\d\.]', '')
        $power  = if ($powerRaw) { [double]$powerRaw } else { 0 }
        $fanRaw = ($cols[9] -replace '[^\d\.]', '')
        $fan    = if ($fanRaw) { [double]$fanRaw } else { 0 }

        $labels = 'gpu="{0}",name="{1}",uuid="{2}"' -f $idx, $name, $uuid

        [void]$sb.AppendLine("nvidia_smi_temperature_gpu{$labels} $temp")
        [void]$sb.AppendLine("nvidia_smi_utilization_gpu{$labels} $utilG")
        [void]$sb.AppendLine("nvidia_smi_utilization_memory{$labels} $utilM")
        [void]$sb.AppendLine("nvidia_smi_memory_used_bytes{$labels} $memU")
        [void]$sb.AppendLine("nvidia_smi_memory_total_bytes{$labels} $memT")
        [void]$sb.AppendLine("nvidia_smi_power_draw_watts{$labels} $power")
        [void]$sb.AppendLine("nvidia_smi_fan_speed{$labels} $fan")
    }

    $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    [void]$sb.AppendLine("nvidia_smi_exporter_last_write_seconds $now")

    # Atomic write: temp + rename. windows_exporter's textfile collector
    # refuses partial files based on size — atomic rename avoids torn reads.
    [System.IO.File]::WriteAllText($TempFile, $sb.ToString(), [System.Text.UTF8Encoding]::new($false))
    Move-Item -Force $TempFile $OutputFile
}

while ($true) {
    try {
        Write-NvidiaMetrics
    } catch {
        # Swallow errors to keep the loop alive; stderr goes to the host.
        Write-Host "nvidia_metrics: $_" -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds $IntervalSec
}
