# Pre-Tool Hook
# Läuft vor jedem Tool-Call
# Prüft ob Scope-Grenzen eingehalten werden

param(
    [string]$Tool,
    [string]$File
)

# Scope Guard: Verbiete Schreibzugriff auf kritische Dateien
$FORBIDDEN_WRITES = @(
    "supabase/migrations",
    "system/",
    ".claude/rules",
    "packages/wo-core/src/types.ts"
)

foreach ($forbidden in $FORBIDDEN_WRITES) {
    if ($File -like "*$forbidden*" -and $Tool -like "write*") {
        Write-Host "SCOPE_GUARD: Schreibzugriff auf $File verweigert"
        Write-Host "Erstelle einen WO für diese Änderung"
        exit 1
    }
}

exit 0
