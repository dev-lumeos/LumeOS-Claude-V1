# Dangerous Operations Hook Policy
# Alle Hooks die gefährliche DB/System Operationen abfangen
# Status: FESTGEZOGEN — 23. April 2026

---

## Klassifizierung gefährlicher Operationen

### Kategorie 1 — SOFORT STOPP (kein Auto-Retry)
Erfordern explizite Human-Bestätigung mit Begründung:

| Operation | Grund |
|-----------|-------|
| `DROP TABLE` | Datenverlust — nicht umkehrbar |
| `DROP DATABASE` | Kompletter Datenverlust |
| `TRUNCATE` | Alle Daten löschen — nicht umkehrbar |
| `DELETE FROM` ohne WHERE | Alle Rows löschen |
| `DROP SCHEMA` | Schema + alle Tabellen weg |
| `supabase db reset` | Lokale DB komplett neu aufbauen |
| `supabase db push --linked` | Remote DB Migration pushen |
| `git push --force` | History überschreiben |
| `git reset --hard` | Uncommitted changes verlieren |
| `rm -rf` | Dateien permanent löschen |

### Kategorie 2 — WARNUNG + Bestätigung
Erfordern Bestätigung aber kein vollständiges Stopp:

| Operation | Grund |
|-----------|-------|
| `ALTER TABLE ... DROP COLUMN` | Daten in Spalte verloren |
| `UPDATE` ohne WHERE | Alle Rows updaten |
| `DELETE FROM` mit suspektem WHERE | Möglicher Massenverlust |
| `supabase db reset` | Lokale DB neu aufbauen |
| `docker rm -f` | Container + Daten weg |
| `pnpm install --force` | Lockfile überschreiben |

---

## Hook Implementierung (PowerShell — Windows)

### Pre-Tool Hook: `.claude/hooks/pre-tool.ps1`

```powershell
# .claude/hooks/pre-tool.ps1
# Läuft vor JEDEM Tool-Call von Claude Code
# $args[0] = Tool-Name, $args[1] = Input (JSON String)

param(
    [string]$ToolName,
    [string]$ToolInput
)

# ============================================================
# KATEGORIE 1 — SOFORTIGER STOPP (kein Auto-Proceed)
# ============================================================

$HARD_STOP_PATTERNS = @(
    # SQL Destruktiv
    'DROP\s+TABLE',
    'DROP\s+DATABASE',
    'DROP\s+SCHEMA',
    'TRUNCATE\s+TABLE',
    'TRUNCATE\s+(?!.*IF\s+EXISTS\s+\w+\s+RESTART)',  # TRUNCATE ohne spezifische Tabelle
    'DELETE\s+FROM\s+\w+\s*;',                        # DELETE ohne WHERE
    'DELETE\s+FROM\s+\w+\s*$',                        # DELETE ohne WHERE (Ende)
    
    # Supabase Destruktiv
    'supabase\s+db\s+reset',
    'supabase\s+db\s+push\s+--linked',
    
    # Git Destruktiv
    'git\s+push\s+--force',
    'git\s+push\s+-f\s+',
    'git\s+reset\s+--hard',
    
    # Filesystem Destruktiv
    'rm\s+-rf',
    'Remove-Item\s+-Recurse\s+-Force',
    'rd\s+/s\s+/q'
)

# ============================================================
# KATEGORIE 2 — WARNUNG + Bestätigung
# ============================================================

$WARNING_PATTERNS = @(
    # SQL Riskant
    'ALTER\s+TABLE.*DROP\s+COLUMN',
    'UPDATE\s+\w+\s+SET.*(?!WHERE)',   # UPDATE ohne WHERE
    'DELETE\s+FROM.*WHERE.*=.*%',      # DELETE mit Wildcard WHERE
    
    # Docker
    'docker\s+rm\s+-f',
    'docker\s+system\s+prune',
    
    # Supabase
    'supabase\s+db\s+reset',           # Nur lokal, aber trotzdem warnen
    
    # npm/pnpm Destruktiv
    'pnpm\s+install\s+--force',
    'npm\s+ci\s+--force'
)

# Input prüfen
$inputLower = $ToolInput.ToLower()

# Kategorie 1 Check
foreach ($pattern in $HARD_STOP_PATTERNS) {
    if ($ToolInput -match $pattern) {
        Write-Host ""
        Write-Host "🚨 DANGEROUS OPERATION BLOCKED 🚨" -ForegroundColor Red
        Write-Host "Tool:      $ToolName" -ForegroundColor Red
        Write-Host "Pattern:   $pattern" -ForegroundColor Red
        Write-Host "Input:     $ToolInput" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Diese Operation ist in Kategorie 1 (HARD STOP)." -ForegroundColor Red
        Write-Host "Erstelle einen WO und lass Tom entscheiden." -ForegroundColor Red
        Write-Host ""
        exit 1  # Block die Operation
    }
}

# Kategorie 2 Check
foreach ($pattern in $WARNING_PATTERNS) {
    if ($ToolInput -match $pattern) {
        Write-Host ""
        Write-Host "⚠️  WARNING: Riskante Operation erkannt" -ForegroundColor Yellow
        Write-Host "Tool:    $ToolName" -ForegroundColor Yellow
        Write-Host "Pattern: $pattern" -ForegroundColor Yellow
        Write-Host "Input:   $ToolInput" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Logging zur Audit Trail..." -ForegroundColor Cyan
        
        # Log schreiben
        $timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
        "$timestamp WARNING $ToolName $ToolInput" | Add-Content '.claude/hooks/dangerous-ops.log'
        
        # Weiterlaufen lassen (nur Warnung, kein Stopp)
        exit 0
    }
}

# Scope Guard — Schreibzugriff auf kritische Pfade
if ($ToolName -like 'write*' -or $ToolName -like 'create*') {
    $PROTECTED_PATHS = @(
        'system/control-plane/',
        'system/workorders/lifecycle/',
        'system/policies/',
        'db/migrations/',
        '.claude/rules/',
        'packages/wo-core/src/types.ts'
    )
    
    foreach ($path in $PROTECTED_PATHS) {
        if ($ToolInput -like "*$path*") {
            Write-Host ""
            Write-Host "🔒 SCOPE GUARD: Geschützter Pfad" -ForegroundColor Magenta
            Write-Host "Pfad: $path" -ForegroundColor Magenta
            Write-Host "Erstelle einen WO für diese Änderung." -ForegroundColor Magenta
            Write-Host ""
            exit 1
        }
    }
}

# Change Log schreiben
if ($ToolName -like 'write*' -or $ToolName -like 'create*' -or $ToolName -like 'edit*') {
    $timestamp = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    "$timestamp $ToolName $ToolInput" | Add-Content '.claude/hooks/session.log'
}

exit 0
```
