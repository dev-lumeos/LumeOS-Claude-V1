# protect-paths.ps1 - PreToolUse-Hook fuer Pfadschutz (B-04, 2026-08-05).
# Schuetzt supabase/migrations/ (Schreiben) und .env* (Lesen und Schreiben),
# auch gegen verkettete Bash-Befehle, die die Deny-Muster umgehen.
#
# Anforderungen (B-04): stdin-JSON (kein param), Exit 2 bei Ablehnung,
# Datei mit BOM, keine Emoji. PS-5.1-kompatibel, nur ASCII im Inhalt.
# Audit-Log: .claude/hooks/protect-paths.log (von git ignoriert; nur
# Ablehnungen werden protokolliert, Durchlaesse nicht).

$ErrorActionPreference = 'Stop'

try {
    $raw = [Console]::In.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }
    $payload = $raw | ConvertFrom-Json
} catch {
    # Unlesbare Eingabe blockiert nicht - der Hook darf den Normalbetrieb
    # nicht zerlegen. Schutz greift nur bei erkanntem Treffer.
    exit 0
}

$tool = [string]$payload.tool_name
$filePath = ''
$command = ''
if ($payload.tool_input) {
    if ($payload.tool_input.file_path) { $filePath = [string]$payload.tool_input.file_path }
    if ($payload.tool_input.command) { $command = [string]$payload.tool_input.command }
}

function Deny([string]$reason, [string]$detail) {
    $entry = @{
        ts = (Get-Date).ToUniversalTime().ToString('o')
        tool = $script:tool
        reason = $reason
        detail = $detail
    } | ConvertTo-Json -Compress
    try {
        Add-Content -LiteralPath (Join-Path $PSScriptRoot 'protect-paths.log') -Value $entry
    } catch {
        # Logfehler verhindern die Ablehnung nicht.
    }
    [Console]::Error.WriteLine('BLOCKED protect-paths: ' + $reason + ' [' + $detail + ']')
    exit 2
}

if ($tool -eq 'Write' -or $tool -eq 'Edit' -or $tool -eq 'Read') {
    $norm = $filePath.Replace('\', '/').ToLowerInvariant()
    $leaf = ''
    if ($norm) { $leaf = ($norm -split '/')[-1] }

    # supabase/migrations/: nur Schreiben blocken - Lesen der Slices ist
    # legitimer Arbeitsalltag (Kettenlaeufe, Reviews).
    if (($tool -eq 'Write' -or $tool -eq 'Edit') -and $norm -match '(^|/)supabase/migrations/') {
        Deny 'supabase/migrations ist schreibgeschuetzt' $filePath
    }

    # .env*: Lesen UND Schreiben blocken (Secrets). Ausnahme .env.example.
    if ($leaf -like '.env*' -and $leaf -ne '.env.example') {
        Deny '.env-Dateien sind gesperrt' $filePath
    }
    exit 0
}

if ($tool -eq 'Bash') {
    $cmdNorm = $command.Replace('\', '/').ToLowerInvariant()

    # .env als eigenstaendiges Pfad-Token (auch mitten in Ketten),
    # .env.example bleibt erlaubt. Schliesst die belegte Luecke:
    # sed/cat auf .env.local liefen an Read-Deny vorbei.
    $envHits = [regex]::Matches($cmdNorm, '(^|[\s/=("' + "'" + '`])\.env(\.[a-z0-9_.-]+)?([\s)"' + "'" + '`;&|<>]|$)')
    foreach ($hit in $envHits) {
        if ($hit.Value -notmatch '\.env\.example') {
            Deny 'Bash-Befehl beruehrt .env' $command
        }
    }

    # supabase/migrations/: schreibende Bash-Muster blocken, Lesen erlaubt.
    if ($cmdNorm -match 'supabase/migrations/') {
        if ($cmdNorm -match '(>>?\s*[^\s]*supabase/migrations/|\btee\b|\bcp\b|\bmv\b|\brm\b|sed\s+-i|\btouch\b|\btruncate\b|out-file|set-content|add-content)') {
            Deny 'Bash-Befehl schreibt nach supabase/migrations/' $command
        }
    }
    exit 0
}

exit 0
