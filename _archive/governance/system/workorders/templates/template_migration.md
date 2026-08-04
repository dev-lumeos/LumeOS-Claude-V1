# WO Template: DB Migration

# Agent: db-migration-agent

# Checklist: #1 XML task ✅ #3 Think-before-write ✅ #5 Negative Constraints ✅ #9 Error Handling ✅

# ACHTUNG: requires_approval: true — immer Human Approval + security-specialist Review

---

## Wann nutzen?

- Neue Tabellen oder Spalten
- RLS Policy Änderungen
- Enum-Werte hinzufügen
- Indexes hinzufügen

## Wann NICHT nutzen?

- DROP COLUMN → Human Review, kein WO
- DROP TABLE → Niemals via WO
- Production Daten migrieren → Manuell

## Template (ausfüllen)

```yaml
workorder_id: "WO-{module}-{NNN}"       # TODO
agent_id:     "db-migration-agent"
phase:        1
priority:     "normal"
quality_critical: false
requires_approval: true                  # PFLICHT — niemals false

task: |
  <task>
    <analyze>
      Lies den bestehenden Schema-Stand in supabase/migrations/.
      Verstehe welche Tabellen betroffen sind.
      Prüfe ob RLS Policies aktualisiert werden müssen.
      Plane die Migration UND den Rollback bevor du schreibst.
    </analyze>

    <implement>
      TODO: Migration-Ziel in einem Imperativsatz.
      Erstelle supabase/migrations/YYYYMMDD_NNN_beschreibung.sql.
      SQL muss enthalten: UP Migration + DOWN Rollback Kommentar.
      RLS für neue Tabellen pflichtmäßig aktivieren.
    </implement>

    <constraints>
      Jede Migration muss reversibel sein (rollback_plan Pflicht).
      RLS für alle neuen Tabellen aktivieren.
      Keine Produktions-Daten löschen oder verändern.
    </constraints>

    <on_error>
      Bei fehlendem rollback_plan: {"status": "BLOCKED"}.
      Bei Destructive SQL ohne Task: {"status": "STOP"}.
      Bei RLS fehlt: {"status": "FAIL"}.
      Bei Breaking Schema Change: {"status": "ESCALATE"}.
    </on_error>
  </task>

scope_files:
  - "supabase/migrations/"          # Migration SQL
  - "TODO: packages/types/src/**"   # TypeScript Types updaten

context_files:
  - "supabase/migrations/"          # Bestehende Migrations als Referenz

acceptance_criteria:
  - "Migration YYYYMMDD_NNN_*.sql erstellt"
  - "Migration läuft durch: supabase db diff zeigt erwarteten Diff"
  - "DOWN Migration oder rollback_plan dokumentiert"
  - "RLS aktiviert für alle neuen Tabellen"
  - "TypeScript Types aktualisiert (packages/types)"
  - "pnpm tsc --noEmit clean"

negative_constraints:
  - "NIEMALS supabase db push --linked (nur Tom manuell)"
  - "NIEMALS supabase db reset (nur Tom manuell)"
  - "NIEMALS DROP TABLE oder TRUNCATE ohne expliziten Task"
  - "NIEMALS Migration ohne nachfolgendes security-specialist Review"
  - "NIEMALS RLS deaktivieren"
  - "NIEMALS Änderungen außerhalb supabase/ und packages/types/"

required_skills: ["gsd-v2", "supabase-specialist"]
optional_skills: []
blocked_by:      []
```

---

## Migration Naming Convention

```
supabase/migrations/YYYYMMDD_NNN_beschreibung.sql

Beispiele:
  20260426_001_add_workorder_priority.sql
  20260426_002_add_diary_table.sql
```

## Migration SQL Template

```sql
-- Migration: YYYYMMDD_NNN_beschreibung
-- Description: Was diese Migration tut
-- Reversible: YES

-- UP
ALTER TABLE {tabelle}
  ADD COLUMN IF NOT EXISTS {spalte} {typ} {constraints};

CREATE INDEX IF NOT EXISTS idx_{tabelle}_{spalte}
  ON {tabelle}({spalte});

-- RLS (falls neue Tabelle)
ALTER TABLE {tabelle} ENABLE ROW LEVEL SECURITY;

-- DOWN (Rollback)
-- ALTER TABLE {tabelle} DROP COLUMN IF EXISTS {spalte};
```

---

## Ausgefülltes Beispiel

```yaml
workorder_id: "WO-nutrition-010"
agent_id:     "db-migration-agent"
phase:        1
priority:     "normal"
quality_critical: false
requires_approval: true

task: |
  <task>
    <analyze>
      Lies 20260423120000_control_plane_tables.sql für bestehenden Schema-Stand.
      Prüfe packages/types/src/ für MealItem Interface.
      Plane: neue Spalte meal_tags TEXT[] auf meal_items.
    </analyze>

    <implement>
      Erstelle Migration: ADD COLUMN meal_tags TEXT[] DEFAULT '{}' auf meal_items.
      Erstelle GIN Index für meal_tags (Array-Suche).
      Aktualisiere MealItem Interface in packages/types.
    </implement>

    <constraints>
      Keine bestehenden Spalten ändern.
      RLS muss für meal_items bereits aktiv sein (prüfen).
      Rollback: DROP COLUMN meal_tags dokumentieren.
    </constraints>

    <on_error>
      Bei Schema-Konflikt: FAIL.
      Bei fehlender RLS: FAIL.
    </on_error>
  </task>

scope_files:
  - "supabase/migrations/"
  - "packages/types/src/nutrition.ts"

context_files:
  - "supabase/migrations/20260423120000_control_plane_tables.sql"
  - "packages/types/src/index.ts"

acceptance_criteria:
  - "Migration 20260426_001_add_meal_tags.sql erstellt"
  - "meal_items.meal_tags TEXT[] DEFAULT '{}' vorhanden"
  - "GIN Index idx_meal_items_meal_tags erstellt"
  - "MealItem Interface hat meal_tags?: string[]"
  - "pnpm tsc --noEmit clean"
  - "supabase db diff zeigt nur erwartete Änderungen"

negative_constraints:
  - "NIEMALS supabase db push --linked"
  - "NIEMALS bestehende Spalten löschen oder umbenennen"
  - "NIEMALS DROP TABLE oder TRUNCATE"
  - "NIEMALS Migration ohne security-specialist Review"
  - "NIEMALS RLS deaktivieren"
  - "NIEMALS Änderungen außerhalb supabase/ und packages/types/"

required_skills: ["gsd-v2", "supabase-specialist"]
optional_skills: []
blocked_by:      []
```
