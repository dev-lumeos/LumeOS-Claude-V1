# WO-NUTRITION-P1-002 — Nutrition Core Schema Foundation

**Status:** draft
**Phase:** 1 — DB Foundation
**Source:** `docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` §5 Kandidat #2
**Template:** `system/workorders/templates/template_migration.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `blocked` (auf WO-nutrition-001) → `ready` → `dispatched` → `running` → `done` → `reviewed` → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- Kein Tabellen-DDL (Tabellen kommen ab WO-NUTRITION-P1-003)
- Keine RLS-Policies (gibt noch keine Tabellen)
- Keine TypeScript-Types (gibt noch keine Tabellen)
- Keine API-Implementierung
- Keine Produktivmigration ausführen (`supabase db push --linked` bleibt manuell durch Tom)
- Keine Shared-Core- oder Schema-übergreifenden Änderungen

---

## Workorder

```yaml
workorder_id: "WO-nutrition-002"
agent_id:     "db-migration-agent"
phase:        1
priority:     "normal"
quality_critical: false
requires_approval: true
risk_category: "db-migration"
rollback_hint: "DOWN: DROP SCHEMA nutrition CASCADE — nur wenn keine Tabellen oder Daten unter nutrition.* existieren. DROP EXTENSION pg_trgm und DROP EXTENSION pgcrypto nur wenn keine anderen Schemas davon abhängen. Konkrete DOWN-SQL-Templates im Migration-Header dokumentieren."

task: |
  <task>
    <analyze>
      Lies bestehenden Schema-Stand in supabase/migrations/.
      Prüfe ob das Schema "nutrition" bereits existiert (z. B. via supabase db diff).
      Prüfe ob pg_trgm und gen_random_uuid (über pgcrypto oder pg-internal) verfügbar sind.
      Plane Migration UND Rollback bevor du schreibst.
      Berücksichtige: nutrition.* Tabellen kommen erst in WO-NUTRITION-P1-003+.
    </analyze>

    <implement>
      Erstelle eine neue Migration-Datei unter:
      supabase/migrations/  (future path to be decided — Naming-Convention YYYYMMDD_NNN_nutrition_schema_foundation.sql)

      Inhalt der Migration (UP):
      - CREATE SCHEMA IF NOT EXISTS nutrition;
      - CREATE EXTENSION IF NOT EXISTS pg_trgm;
      - CREATE EXTENSION IF NOT EXISTS pgcrypto;  (für gen_random_uuid, falls nicht bereits aus anderen Migrationen vorhanden)
      - GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role;

      DOWN-Rollback als SQL-Kommentar im Migration-Header dokumentieren
      (analog rollback_hint).

      KEIN Tabellen-DDL in dieser Migration.
      KEINE RLS-Policies (gibt noch keine Tabellen).
    </implement>

    <constraints>
      Migration muss reversibel sein (rollback_hint Pflicht — Schema-spezifisch).
      Migration muss idempotent sein (alle Statements mit IF NOT EXISTS / IF EXISTS).
      Keine Tabellen-DDL — diese kommen in Folge-WOs.
      Keine RLS-Policies.
      Keine Produktions-Daten löschen oder verändern.
      Naming-Convention YYYYMMDD_NNN_<beschreibung>.sql gemäß template_migration.md.
    </constraints>

    <on_error>
      Bei fehlendem rollback_plan: {"status": "BLOCKED"}.
      Bei Destructive SQL ohne Task: {"status": "STOP"}.
      Bei Konflikt mit existierender Schema-Definition (Schema bereits anders konfiguriert): {"status": "ESCALATE"}.
      Bei Berechtigungsfehler GRANT USAGE: {"status": "FAIL"}.
    </on_error>
  </task>

scope_files:
  - "supabase/migrations/"

context_files:
  - "supabase/migrations/"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md"

acceptance_criteria:
  - "Neue Migration unter supabase/migrations/ erstellt (future path to be decided — YYYYMMDD_NNN_nutrition_schema_foundation.sql)"
  - "Migration enthält CREATE SCHEMA IF NOT EXISTS nutrition"
  - "Migration enthält CREATE EXTENSION IF NOT EXISTS pg_trgm"
  - "Migration prüft/aktiviert gen_random_uuid (über pgcrypto oder pg-internal)"
  - "Migration enthält GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role"
  - "Migration ist idempotent (zweimaliges Apply ohne Fehler)"
  - "DOWN-Rollback im Migration-Header als SQL-Kommentar dokumentiert"
  - "Kein Tabellen-DDL in dieser Migration"
  - "supabase db diff zeigt nur erwartete Änderungen (Schema + Extensions + Grant) — manueller Reviewer/Tom-Check, nicht automatisch via validation_commands"
  - "pnpm tsc --noEmit clean"

negative_constraints:
  - "NIEMALS supabase db push --linked (nur Tom manuell)"
  - "NIEMALS supabase db reset (nur Tom manuell)"
  - "NIEMALS DROP SCHEMA oder TRUNCATE ohne expliziten Task"
  - "NIEMALS Migration ohne nachfolgendes security-specialist Review"
  - "NIEMALS Tabellen-DDL in dieser Migration"
  - "NIEMALS RLS-Policies in dieser Migration"
  - "NIEMALS Änderungen außerhalb supabase/migrations/"

files_blocked:
  - "services/**"
  - "apps/**"
  - "packages/**"
  - "infra/**"
  - "tools/**"
  - "system/**"
  - "docs/**"
  - ".env"
  - ".env.*"

validation_commands:
  - "pnpm tsc --noEmit"

required_skills: ["gsd-v2", "supabase-specialist"]
optional_skills: []
blocked_by: ["WO-nutrition-001"]
```

---

## Notes

- **Filename ↔ workorder_id:** Filename `WO-NUTRITION-P1-002-core-schema-foundation.md` folgt Auftrags-Convention; `workorder_id: WO-nutrition-002` folgt Schema-Regex `^WO-[a-z]+-[0-9]+$`.
- **`requires_approval: true`** ist Pflicht für `risk_category: db-migration` (per `template_migration.md`).
- **`rollback_hint`** ist Pflicht-Feld bei `db-migration` (per `workorder.schema.json` if/then-Block).
- **`blocked_by`** verweist auf `WO-nutrition-001` (Audit), damit der Migrations-Schritt nicht ohne Audit-Befund läuft (per Dependency Graph in Split-Plan §6).
- **Lifecycle-Pfad:** Erwartet `done` → `reviewed` (security-specialist) → `closed` (per `template_migration.md` "immer Human Approval + security-specialist Review").

---

*Draft erzeugt: 2026-05-02 — gemäß `NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` und `template_migration.md`.*
