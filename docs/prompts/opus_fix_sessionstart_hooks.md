# Fix: SessionStart Hook Errors in Claude Code

## Problem

Beim Start von Claude Code erscheinen 3 Fehler:
```
SessionStart:startup hook error
SessionStart:startup hook error  
SessionStart:startup hook error
```

## Diagnose

Die Fehler kommen von lean-ctx Hooks in `.claude/settings.local.json` und 
`C:\Users\User\.claude\settings.json`:

```json
"lean-ctx hook rewrite"
"lean-ctx hook redirect"
```

lean-ctx ist installiert unter:
`C:\Users\User\AppData\Roaming\npm\lean-ctx`

Das Problem: Claude Code findet lean-ctx beim Start nicht im PATH.

## Aufgabe

Fixe BEIDE settings Dateien so dass lean-ctx mit vollem Pfad aufgerufen wird.

### Fix 1: Projekt settings.local.json

Datei: `D:\GitHub\LumeOS-Claude-V1\.claude\settings.local.json`

Ändere alle `lean-ctx` Referenzen auf vollen Pfad:
```
"lean-ctx hook rewrite"
→ "C:\\Users\\User\\AppData\\Roaming\\npm\\lean-ctx.cmd hook rewrite"

"lean-ctx hook redirect"  
→ "C:\\Users\\User\\AppData\\Roaming\\npm\\lean-ctx.cmd hook redirect"
```

### Fix 2: Globale settings.json

Datei: `C:\Users\User\.claude\settings.json`

Gleiche Änderung — alle `lean-ctx` Referenzen auf vollen Pfad.

### Fix 3: Credentials aus settings.local.json entfernen

In `settings.local.json` stehen hardcodierte Secrets in den permissions:
- `ED25519_PRIVATE_KEY=...`
- `SUPABASE_SERVICE_ROLE_KEY=...`

Diese müssen aus der permissions allow-Liste entfernt werden.
Ersetze die betroffenen Bash-Permissions mit Platzhaltern ohne Credentials.

### Fix 4: Verifizierung

Nach den Fixes:
1. Prüfe ob `lean-ctx --version` mit vollem Pfad funktioniert:
   `C:\Users\User\AppData\Roaming\npm\lean-ctx.cmd --version`
   
2. Starte Claude Code neu und bestätige keine Hook-Errors mehr

## Wichtig

- settings.local.json ist in .gitignore — kein Commit nötig
- Globale settings.json (~/.claude/settings.json) — kein Commit, nur lokal ändern
- Keine echten Credentials in Files schreiben
