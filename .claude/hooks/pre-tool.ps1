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
# supabase/migrations/ → db-migration-agent only, always needs Human Approval
# supabase/config.toml → manual DB admin only
# system/state/        → runtime-generated, append-only
# .env*                → credentials, never touch
$PROTECTED = @(
    'supabase/migrations/',
    'supabase\migrations\',
    'supabase/config.toml',
    'system/control-plane/',
    'system/workorders/lifecycle/',
    'system/policies/',
    'db/migrations/',
    '.claude/rules/',
    'system/state/runtime_state',
    '.env'
)

if ($ToolName -match 'write|create|edit') {
    foreach ($path in $PROTECTED) {
        if ($ToolInput -like "*$path*") {
            Write-Host ''
            Write-Host '🔒 SCOPE GUARD: Protected path blocked' -ForegroundColor Magenta
            Write-Host "Path:    $path" -ForegroundColor Magenta
            Write-Host "Tool:    $ToolName" -ForegroundColor Magenta
            Write-Host 'Create a WO and route to db-migration-agent.' -ForegroundColor Magenta
            Write-Host ''
            $ts = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
            "$ts SCOPE_GUARD $ToolName :: $path" | Add-Content '.claude\hooks\dangerous-ops.log'
            exit 1
        }
    }
}

# === AUDIT LOG ===
try {
    if ($ToolName -match 'write|create|edit') {
        $ts = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'

        try {
            if ($null -eq $ToolInput) {
                $safeInput = ''
            } elseif ($ToolInput -is [string]) {
                $safeInput = $ToolInput
            } else {
                $safeInput = $ToolInput | ConvertTo-Json -Compress -Depth 20
            }
        } catch {
            $safeInput = '<unserializable-tool-input>'
        }

        $logPath = Join-Path $PSScriptRoot 'session.log'
        $line = ('{0} {1} :: {2}' -f $ts, $ToolName, $safeInput)
        [System.IO.File]::AppendAllText(
            $logPath,
            $line + [Environment]::NewLine,
            (New-Object System.Text.UTF8Encoding -ArgumentList $false)
        )
    }
} catch {
    # Audit logging must never block Claude Code tool execution.
}

exit 0
