# Post-Tool Hook
# Läuft nach jedem Tool-Call
# Loggt Änderungen für Memory-Update

param(
    [string]$Tool,
    [string]$File,
    [string]$Status
)

$LogFile = Join-Path $PSScriptRoot "session.log"

if ($Tool -eq "write_file" -and $Status -eq "success") {
    $timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    $logEntry = "$timestamp WRITE $File"
    Add-Content -Path $LogFile -Value $logEntry
}

exit 0
