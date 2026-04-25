# WO Template: Implementation (Medium/High Complexity)

# Kopiere dieses Template und fülle die TODOs aus

# Routing: → Spark B (Precision Execution)

```yaml
id: "WO-<YYYYMMDD>-<NNN>"
title: "<kurze Beschreibung>"

type: implementation
module: <nutrition|training|auth|infra|...>
complexity: <medium|high>
risk: <low|medium|high>
requires_reasoning: <true|false>    # true wenn Architektur-Entscheidungen nötig
requires_schema_change: false
db_access: <none|read>
created_by: human

files_allowed:
  - "<services/oder/packages/pfad/**>"
  - "<weitere/pfade/**>"

files_blocked:
  - "supabase/migrations/**"         # keine DB Changes in diesem Template

acceptance_criteria:
  - "<Kriterium 1>"
  - "<Kriterium 2>"
  - "TypeScript kompiliert ohne Fehler"
  - "Alle bestehenden Tests grün"
  - "Keine unerwarteten Supabase-Calls"
```

## Wann nutzen?

- Mittlere bis komplexe Features (50-200 Zeilen)
- Möglicher DB-Read Zugriff (kein Write)
- Einzelnes Modul betroffen
- Keine Schema-Änderungen

## Beispiele

```yaml
# Beispiel: Neuer Service Endpoint
id: "WO-20260424-002"
title: "Add WO history endpoint to scheduler-api"
type: implementation
module: infra
complexity: medium
risk: low
requires_reasoning: false
requires_schema_change: false
db_access: read
created_by: human
files_allowed:
  - "services/scheduler-api/src/**"
  - "packages/wo-core/src/**"
acceptance_criteria:
  - "GET /history gibt letzte 10 WOs zurück"
  - "Response entspricht WorkOrder Interface"
  - "Supabase Query mit RLS Service-Client"
  - "TypeScript clean"
```
