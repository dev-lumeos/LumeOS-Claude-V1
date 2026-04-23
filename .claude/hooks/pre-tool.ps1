# .claude/hooks/pre-tool.ps1
# Runs before EVERY Claude Code tool call
# Blocks dangerous DB/System operations

param(
    [string]$ToolName = '',
    [string]$ToolInput = ''
)

# === CATEGORY 1: HARD STOP ===
$HARD_STOP = @(
    'DROP\s+TABLE',
    'DROP\s+DATABASE',
    'DROP\s+SCHEMA',
    'TRUNCATE\s+TABLE',
    'DELETE\s+FROM\s+\w+\s*[;$]',
    'supabase\s+db\s+reset',
    'supabase\s+db\s+push\s+--linked',
    'git\s+push\s+--force',
    'git\s+push\s+-f\b',
    'git\s+reset\s+--hard',
    'rm\s+-rf',
    'Remove-Item\s+-Recurse\s+-Force'
)

foreach ($pattern in $HARD_STOP) {
    if ($ToolInput -match $pattern) {
        Write-Host ''
        Write-Host '🚨 DANGEROUS OPERATION BLOCKED' -ForegroundColor Red
        Write-Host "Tool:    $ToolName" -ForegroundColor Red
        Write-Host "Pattern: $pattern" -ForegroundColor Red
        Write-Host 'This is a HARD STOP — create a WO and wait for Tom.' -ForegroundColor Red
        Write-Host ''
        $ts = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
        "$ts BLOCKED $ToolName :: $ToolInput" | Add-Content '.claude\hooks\dangerous-ops.log'
        exit 1
    }
}

# === CATEGORY 2: WARNING ===
$WARNING = @(
    'ALTER\s+TABLE.*DROP\s+COLUMN',
    'UPDATE\s+\w+\s+SET(?!.*WHERE)',
    'DELETE\s+FROM.*WHERE.*LIKE',
    'docker\s+rm\s+-f',
    'docker\s+system\s+prune',
    'pnpm\s+install\s+--force'
)

foreach ($pattern in $WARNING) {
    if ($ToolInput -match $pattern) {
        Write-Host ''
        Write-Host 'WARNING: Risky operation detected' -ForegroundColor Yellow
        Write-Host "Tool:    $ToolName" -ForegroundColor Yellow
        Write-Host "Pattern: $pattern" -ForegroundColor Yellow
        Write-Host ''
        $ts = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
        "$ts WARNING $ToolName :: $ToolInput" | Add-Content '.claude\hooks\dangerous-ops.log'
        exit 0
    }
}

# === SCOPE GUARD: Protected paths ===
$PROTECTED = @(
    'system/control-plane/',
    'system/workorders/lifecycle/',
    'system/policies/',
    'db/migrations/',
    '.claude/rules/'
)

if ($ToolName -match 'write|create|edit') {
    foreach ($path in $PROTECTED) {
        if ($ToolInput -like "*$path*") {
            Write-Host ''
            Write-Host 'SCOPE GUARD: Protected path blocked' -ForegroundColor Magenta
            Write-Host "Path: $path" -ForegroundColor Magenta
            Write-Host 'Create a WO for this change.' -ForegroundColor Magenta
            Write-Host ''
            exit 1
        }
    }
}

# === AUDIT LOG ===
if ($ToolName -match 'write|create|edit') {
    $ts = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    "$ts $ToolName :: $ToolInput" | Add-Content '.claude\hooks\session.log'
}

exit 0
