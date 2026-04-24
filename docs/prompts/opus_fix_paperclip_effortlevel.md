# Fix: Paperclip effortLevel TypeError beim Governance-Compiler Run

## Problem

Wenn Paperclip einen Agent-Run startet erscheint:
```
TypeError: Cannot read properties of null (reading 'effortLevel')
at F70 (cli.js:2064:6979)
```

## Root Cause

Paperclip startet Claude Code mit:
```
claude.CMD --print - --output-format stream-json --verbose 
  --resume {session-id} 
  --dangerously-skip-permissions 
  --model claude-opus-4-6 
  --max-turns 1000
```

Das `--resume {session-id}` Flag versucht eine alte Session weiterzuführen.
Wenn die Session-Daten fehlen oder korrupt sind, ist `effortLevel` null.

## Fix

### Option A — Resume deaktivieren (einfachster Fix)
In Paperclip Einstellungen den Agent so konfigurieren dass er KEINE
Session-Continuation nutzt, sondern immer frisch startet.

Prüfe in `C:\Users\User\paperclip\packages\agent\` oder `server\src\`:
Suche nach `--resume` und ersetze durch frische Sessions.

### Option B — max-turns reduzieren
`--max-turns 1000` ist sehr hoch. Reduziere auf 50 oder 100.
Das verhindert Endlosschleifen und ist stabiler.

### Option C — Session Cache löschen
```powershell
Remove-Item -Recurse -Force 'C:\Users\User\.paperclip\instances\default\companies\*\claude-prompt-cache\*'
```
Dann Agent neu starten — keine alten Sessions mehr zum Resumieren.

## Aufgabe

1. Führe Option C aus (Cache löschen)
2. Prüfe ob der Agent-Run danach ohne effortLevel Error läuft
3. Falls immer noch Fehler: Implementiere Option B (max-turns auf 50)

## Wo der Code liegt

```
C:\Users\User\paperclip\
  packages\
    agent\       → Agent Adapter Code
  server\src\
    adapters\    → claude_local Adapter
```

Suche nach `max-turns` und `resume` in diesen Dateien.

## Acceptance

Agent-Run startet ohne TypeError und führt die Task aus.
