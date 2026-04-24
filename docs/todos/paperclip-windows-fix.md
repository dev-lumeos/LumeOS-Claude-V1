# TODO: Paperclip Windows Fix
# Status: OFFEN
# Erstellt: 23. April 2026

## Problem
Paperclip schlägt beim Start fehl:
```
PostgresError: the database system is starting up (code: 57P03)
```

Ursache: @embedded-postgres+windows-x64 braucht länger zum Initialisieren
als Paperclip wartet bevor es die erste DB-Verbindung versucht.

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
