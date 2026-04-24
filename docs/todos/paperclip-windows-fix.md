# TODO: Paperclip Windows Fix
# Status: 57P03 GEFIXT — Admin-Shell-Blocker bleibt offen
# Erstellt: 23. April 2026
# Update: 24. April 2026

## Problem
Paperclip schlägt beim Start fehl:
```
PostgresError: the database system is starting up (code: 57P03)
```

Ursache: @embedded-postgres+windows-x64 braucht länger zum Initialisieren
als Paperclip wartet bevor es die erste DB-Verbindung versucht.

## Status Update 2026-04-24

**Option A implementiert** in `~/paperclip`:
- `packages/db/src/client.ts` — `waitForPostgresReady(url, opts?)` Helper mit
  exponential backoff (start 100ms, cap 1s, timeout 30s). Toleriert 57P03,
  ECONNREFUSED, ECONNRESET, 57P01, 57P02.
- `packages/db/src/migration-runtime.ts` — Aufruf direkt nach `instance.start()`,
  vor `ensurePostgresDatabase`.
- `pnpm --filter @paperclipai/db typecheck` grün.

**Zweiter Blocker (Umgebung, nicht Paperclip):**
Beim Smoketest `pnpm dev:once` meldete Postgres:
```
Execution of PostgreSQL by a user with administrative permissions is not permitted.
```
Der Claude-Code-Shell lief elevated. Abhilfe:
- Claude Code / Paperclip aus einer **nicht-elevierten** PowerShell starten, ODER
- Option B (externe Postgres via `DATABASE_URL` → lokale Supabase auf Port 54322).

## Lösung (wenn Zeit ist)

### Option A — Retry Logic patchen
In `packages/db/src/client.ts` um `ensurePostgresDatabase()`:
- Retry mit exponential backoff (5x, 2s zwischen Versuchen)
- Warte bis Postgres `pg_isready` zurückgibt

### Option B — Externe Postgres nutzen
Statt embedded Postgres die lokale Supabase nutzen:
```
DATABASE_URL=postgres://postgres:postgres@localhost:54322/paperclip
```
Dann in Supabase eine `paperclip` Datenbank anlegen.

### Option C — Developer Mode + Neustart
1. Windows Developer Mode aktivieren (Settings → System → Für Entwickler)
2. Paperclip komplett neu installieren: `pnpm install --force`
3. Paperclip einmal als Admin starten

## Prompt für Opus wenn bereit
```
Lies docs/todos/paperclip-windows-fix.md
Fixe den embedded Postgres Startup Bug in Paperclip auf Windows.
Nutze Option A (Retry Logic) oder Option B (externe Supabase Postgres).
```
