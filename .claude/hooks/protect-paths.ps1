# protect-paths.ps1 - PreToolUse-Hook fuer Pfadschutz (B-04, 2026-08-05;
# B-16-Umbau 2026-08-06: Falsch-Positive auf Dokumentationstext eingegrenzt).
#
# Schuetzt supabase/migrations/ (Schreiben) und .env* (Lesen und Schreiben).
#
# ZUM .env-BLOCK, DAMIT NIEMAND IHN ALS FEHLER DIAGNOSTIZIERT:
# Das Blocken auch des LESENS von .env* ist ABSICHT (Secrets sollen nicht
# in den Kontext). Wer den lokalen Anon-Key braucht, nutzt den
# Standard-Demo-Key der lokalen Supabase-CLI (iss "supabase-demo") -
# der funktioniert gegen jede lokale Instanz ohne .env-Zugriff.
# .env.example bleibt frei.
#
# Anforderungen (B-04, unveraendert): stdin-JSON (kein param), Matcher
# Write|Edit|Read plus Bash, Exit 2 bei Ablehnung, Datei mit BOM, ASCII.
#
# B-16: Bash-Analyse arbeitet jetzt so:
#   1. Heredoc-Koerper (<<TAG ... TAG) werden vor der Pruefung entfernt -
#      Dokumentations- und Datentexte loesen nicht mehr aus.
#   2. Der Befehl wird an && || ; | und Zeilenenden in Segmente geteilt;
#      geprueft wird das ERSTE Wort je Segment (Befehlsposition) plus
#      Redirections - nicht mehr jedes Wort im Text.
#      echo/printf blocken nie (reine Erwaehnung).
# BENANNTE LUECKEN (bewusst, Damm gegen Versehen, nicht gegen Absicht):
#   - Heredoc-Inhalte, die an Interpreter gehen und DARIN .env oder
#     migrations anfassen, werden nicht mehr erkannt.
#   - Variablen-Indirektion (f=.env; cat $f), eval/Subshells,
#     Interpreter-Einzeiler (python -c "open('.env')").
#   - Die Leser-/Schreiberlisten sind endlich; exotische Werkzeuge fehlen.
# Audit-Log: .claude/hooks/protect-paths.log (nur Ablehnungen, UTF-8).

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
        Add-Content -LiteralPath (Join-Path $PSScriptRoot 'protect-paths.log') -Value $entry -Encoding UTF8
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

    # supabase/migrations/: nur Schreiben blocken - Lesen ist Arbeitsalltag.
    if (($tool -eq 'Write' -or $tool -eq 'Edit') -and $norm -match '(^|/)supabase/migrations/') {
        Deny 'supabase/migrations ist schreibgeschuetzt' $filePath
    }

    # .env*: Lesen UND Schreiben blocken (Absicht, siehe Kopf).
    if ($leaf -like '.env*' -and $leaf -ne '.env.example') {
        Deny '.env-Dateien sind gesperrt' $filePath
    }
    exit 0
}

if ($tool -eq 'Bash') {
    # 1) Heredoc-Koerper entfernen (<<TAG, <<'TAG', <<-TAG ... bis Zeile TAG).
    $heredocOptions = [System.Text.RegularExpressions.RegexOptions]'Singleline, Multiline'
    $heredoc = New-Object System.Text.RegularExpressions.Regex('<<-?[ \t]*([''"]?)(\w+)\1.*?^[ \t]*\2[ \t]*\r?$', $heredocOptions)
    $stripped = $heredoc.Replace($command, ' HEREDOC_ENTFERNT ')
    $norm = $stripped.Replace('\', '/').ToLowerInvariant()

    # 2) In Segmente teilen; erstes Wort = Befehlsposition.
    $segments = [System.Text.RegularExpressions.Regex]::Split($norm, '&&|\|\||[;|]|[\r\n]+')
    $readers = @('cat','type','head','tail','less','more','grep','egrep','fgrep',
                 'sed','awk','cut','sort','uniq','tr','wc','xxd','od','strings',
                 'cp','mv','dd','install','source','.')
    $writers = @('tee','cp','mv','rm','touch','truncate','dd','install','ln')
    $envToken = '(^|[\s/=("''])[^\s"'')]*\.env(\.[a-z0-9_.-]+)?([\s)"'';&|<>]|$)'

    foreach ($seg in $segments) {
        $s = $seg.Trim()
        if ($s -eq '') { continue }
        $first = ($s -split '\s+')[0]

        # .env: nur bei Lese-/Kopierbefehl oder Redirection auf das Token.
        if (($s -match $envToken) -and ($s -notmatch '\.env\.example')) {
            if ($readers -contains $first) {
                Deny 'Bash-Befehl liest/kopiert .env' $command
            }
            if ($s -match '[<>][ \t]*\S*\.env') {
                Deny 'Bash-Redirection auf .env' $command
            }
        }

        # supabase/migrations/: nur schreibende Befehlsposition/Redirection.
        if ($s -match 'supabase/migrations/') {
            if ($writers -contains $first) {
                Deny 'Bash-Befehl schreibt nach supabase/migrations/' $command
            }
            if ($first -eq 'git' -and $s -match '^git[ \t]+(mv|rm)([ \t]|$)') {
                Deny 'git mv/rm auf supabase/migrations/' $command
            }
            if ($first -eq 'sed' -and $s -match '(^|[ \t])-i') {
                Deny 'sed -i auf supabase/migrations/' $command
            }
            if ($s -match '>[ \t]*\S*supabase/migrations/') {
                Deny 'Bash-Redirection nach supabase/migrations/' $command
            }
        }
    }
    exit 0
}

exit 0
