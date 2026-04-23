# claude-mem SessionEnd Hook Wrapper for Windows
# Replaces the bash-based hook that fails on Windows

$env:PATH = "C:\Users\User\.bun\bin;" + $env:PATH

$pluginRoot = $env:CLAUDE_PLUGIN_ROOT
if (-not $pluginRoot) {
    $pluginRoot = Get-ChildItem "$env:USERPROFILE\.claude\plugins\cache\thedotmack\claude-mem\" -Directory | Sort-Object Name -Descending | Select-Object -First 1 -ExpandProperty FullName
}
if (-not $pluginRoot) {
    $pluginRoot = "$env:USERPROFILE\.claude\plugins\marketplaces\thedotmack\plugin"
}

$bunnerPath = Join-Path $pluginRoot "scripts\bun-runner.js"
$workerPath = Join-Path $pluginRoot "scripts\worker-service.cjs"

if (Test-Path $bunnerPath) {
    & "C:\Users\User\.bun\bin\bun.exe" $bunnerPath $workerPath hook claude-code session-complete
} else {
    Write-Host "claude-mem: plugin not found at $pluginRoot"
}
