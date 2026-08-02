# Loeschliste 2026-08-02 (A-05) — fuehrt Tom manuell aus.
# Grundlage: docs/_archive/loeschliste-2026-08-02.md (dort steht je Pfad die Pruefung).
# Loescht NUR die als "LOESCHEN" markierten Pfade.
# temp/lumeosold/ (LumeOS-V2-Produktionsdump -> Sektion E) und
# .ijfw/ / ijfw/ (erst nach B-10) werden NICHT angefasst.
#
# Aufruf aus dem Repo-Root:  powershell -File docs/_archive/loeschliste-2026-08-02.ps1
# Erst mit -WhatIf pruefen:  powershell -File docs/_archive/loeschliste-2026-08-02.ps1 -WhatIf

param([switch]$WhatIf)

$ErrorActionPreference = 'Stop'
$repo = (git rev-parse --show-toplevel 2>$null)
if (-not $repo) { Write-Error 'Nicht im Repo ausgefuehrt.'; exit 1 }
Set-Location $repo

$targets = @(
    'tmp',
    'temp/antigravity-awesome-skills-main',
    '_tmp_inventory',
    'backup_system.zip',
    'services.zip',
    'system.zip',
    'nul',
    '.codex-governance-ui.log',
    'supabase/snippets',
    '.wayland-core',
    '.wayland'
)

# Sicherung gegen Verwechslung: diese Pfade duerfen NIE auf der Liste stehen.
$verboten = @('temp/lumeosold', '.ijfw', 'ijfw', 'supabase/_data', 'supabase/_pipeline', 'supabase/_snippets')
foreach ($v in $verboten) {
    if ($targets -contains $v) { Write-Error "Verbotener Pfad auf der Liste: $v"; exit 1 }
}

Write-Host "Repo: $repo"
Write-Host "Zu loeschen:`n - $($targets -join "`n - ")`n"
if (-not $WhatIf) {
    $ok = Read-Host 'Loeschen? (ja/nein)'
    if ($ok -ne 'ja') { Write-Host 'Abgebrochen.'; exit 0 }
}

foreach ($t in $targets) {
    if ($t -eq 'nul') {
        # 'nul' ist unter Windows ein reservierter Geraetename — normaler
        # Remove-Item scheitert; der \\?\-Praefix umgeht das.
        $p = "\\?\$repo\nul"
        if ($WhatIf) { Write-Host "WhatIf: $p" }
        else {
            try { [System.IO.File]::Delete($p); Write-Host "geloescht: nul" }
            catch { Write-Warning "nul nicht loeschbar: $_" }
        }
        continue
    }
    if (Test-Path -LiteralPath $t) {
        if ($WhatIf) { Write-Host "WhatIf: $t" }
        else {
            Remove-Item -LiteralPath $t -Recurse -Force
            Write-Host "geloescht: $t"
        }
    } else {
        Write-Host "fehlt bereits: $t"
    }
}

Write-Host "`nFertig. Nicht angefasst: temp/lumeosold (Sektion E), .ijfw/, ijfw/ (B-10)."
