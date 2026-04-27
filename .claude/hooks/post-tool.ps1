# .claude/hooks/post-tool.ps1
# Läuft nach jedem Write|Edit|MultiEdit Tool-Call
# Schreibt in session.log (legacy) UND audit.jsonl (Shared Event Contract V1)

param(
    [string]$ToolName    = '',
    [string]$ToolInput   = '',
    [string]$ToolOutput  = '',
    [string]$ExitCode    = '0'
)

$RepoRoot  = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$SessionLog = Join-Path $PSScriptRoot 'session.log'
$AuditLog   = Join-Path $RepoRoot 'system\state\audit.jsonl'

$ts = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
$success = ($ExitCode -eq '0')

# ── Ziel-Pfad aus ToolInput extrahieren ───────────────────────────────────────
$targetPath = ''
try {
    $parsed = $ToolInput | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($parsed.path)        { $targetPath = $parsed.path }
    elseif ($parsed.file)    { $targetPath = $parsed.file }
} catch {}

# ── Legacy session.log ────────────────────────────────────────────────────────
if ($success -and $targetPath) {
    Add-Content -Path $SessionLog -Value "$ts WRITE $targetPath"
}

# ── Shared Event Contract V1 → audit.jsonl ────────────────────────────────────
$auditDir = Split-Path $AuditLog
if (-not (Test-Path $auditDir)) { New-Item -ItemType Directory -Force -Path $auditDir | Out-Null }

$event = [ordered]@{
    ts                 = $ts
    event              = if ($success) { 'tool_call_executed' } else { 'tool_call_failed' }
    orchestration_mode = 'claude_code'
    severity           = if ($success) { 'info' } else { 'error' }
    tool               = 'write'
    target_path        = $targetPath
    allowed            = $true
}

# Optionale Felder nur wenn vorhanden
$woId     = $env:LUMEOS_WORKORDER_ID
$agentId  = $env:LUMEOS_AGENT_ID
$runId    = $env:LUMEOS_RUN_ID
if ($woId)    { $event['workorder_id'] = $woId }
if ($agentId) { $event['agent_id']     = $agentId }
if ($runId)   { $event['run_id']       = $runId }

$line = $event | ConvertTo-Json -Compress
Add-Content -Path $AuditLog -Value $line

exit 0
