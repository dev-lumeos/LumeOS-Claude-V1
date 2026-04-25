# WO Template: Implementation (Low Complexity)

# Kopiere dieses Template und fülle die TODOs aus

# Routing: → Spark C (heute Spark B Fallback)

```yaml
id: "WO-<YYYYMMDD>-<NNN>"           # TODO: ersetzen
title: "<kurze Beschreibung>"         # TODO: max 80 Zeichen

type: implementation
module: <nutrition|training|infra|...> # TODO: wählen
complexity: low
risk: low
requires_reasoning: false
requires_schema_change: false
db_access: none
created_by: human

files_allowed:
  - "<packages/oder/services/pfad/**>"  # TODO: min 1 expliziter Pfad

files_blocked: []

acceptance_criteria:
  - "<Kriterium 1 — prüfbar>"          # TODO: min 1
  - "TypeScript kompiliert ohne Fehler"
  - "Keine bestehenden Tests brechen"
```

## Wann nutzen?

- Kleine Code-Änderungen (&lt; 50 Zeilen)
- Kein Datenbankzugriff nötig
- Kein Cross-Module Impact
- Keine Schema-Änderungen

## Beispiele

```yaml
# Beispiel: Env Var Support
id: "WO-20260424-001"
title: "Add env var support to NODE_PROFILES in agent-core"
type: implementation
module: infra
complexity: low
risk: low
requires_reasoning: false
requires_schema_change: false
db_access: none
created_by: human
files_allowed:
  - "packages/agent-core/src/**"
acceptance_criteria:
  - "NODE_PROFILES nutzt process.env.SPARK_A_ENDPOINT"
  - "NODE_PROFILES nutzt process.env.SPARK_B_ENDPOINT"
  - "TypeScript kompiliert ohne Fehler"
  - "test-classifier.ts 5/5 grün"
```
