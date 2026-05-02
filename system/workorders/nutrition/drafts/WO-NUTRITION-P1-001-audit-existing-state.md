# WO-NUTRITION-P1-001 — Audit Existing Nutrition DB State

**Status:** draft
**Phase:** 1 — DB Foundation
**Source:** `docs/specs/Nutrition/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` §5 Kandidat #1
**Template:** `system/workorders/templates/template_docs.md`
**Lifecycle:** `wo_generated` → `graph_validated` → `queue_released` → `ready` → `dispatched` → `running` → `done` → `closed` (per `wo_lifecycle_v1.md`)

---

## Out of Scope

- Keine Schema-Änderung
- Keine Migration-Datei erzeugen oder ändern
- Kein Production-Code (services/, apps/, packages/) schreiben
- Keine RDA/AI/UL Seed-Werte ergänzen
- Keine MealCam-Provider-Integration
- Keine WO-Erzeugung für Folge-Phasen

---

## Workorder

```yaml
workorder_id: "WO-nutrition-001"
agent_id:     "docs-agent"
phase:        1
priority:     "low"
quality_critical: false
requires_approval: false
risk_category: "docs"

task: |
  <task>
    <analyze>
      Lies bestehende Nutrition-DB-/Migration-/Schema-/Type-Dateien:
      - supabase/migrations/** (alle existierenden Migrations zur Identifikation Nutrition-bezogener)
      - packages/types/src/nutrition/** (alle existierenden Type-Files)
      - docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md (Master DDL)
      - docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql (V1-Patch)
      - docs/specs/Nutrition/02_patches/SPEC_06_RECALCULATE_PATCH.md (data_source vs. food_source Klärung)
      - docs/specs/Nutrition/02_patches/SPEC_02_PASS2_ENTITIES.md (Pass-2 Entities)
      - docs/specs/Nutrition/00_decisions/NUTRITION_NEXT_SPEC_DECISIONS.md (V1-Decisions)
      Identifiziere bestehende Tabellen, fehlende Tabellen vs. Spec, Schema-vs-Spec-Diff, RLS-Status.
    </analyze>

    <implement>
      Erzeuge einen Audit-Report unter:
      docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md

      Lege ggf. das Verzeichnis docs/specs/Nutrition/06_workorder_planning/audit/ an, falls nicht vorhanden.

      Inhalt:
      - Liste aller existierenden Nutrition-bezogenen Migrationen unter supabase/migrations/
      - Liste aller existierenden Type-Files unter packages/types/src/nutrition/
      - Diff-Liste: Tabellen/Spalten in Spec aber nicht in DB; und umgekehrt
      - Flag: data_source vs. food_source Doppelspalten-Status (per SPEC_06_RECALCULATE_PATCH.md ist food_source primary)
      - RLS-Status pro existierender Tabelle (aktiv/inaktiv, Policies)
      - Hinweis pro Lücke welcher Folge-WO sie schließt (P1-002 .. P1-014)
      Nur dokumentieren — keine Schema-Änderung, keine Migration, kein Code.
    </implement>

    <constraints>
      Nur Markdown unter docs/specs/Nutrition/06_workorder_planning/audit/ schreiben.
      Kein Production Code ändern.
      Keine Migration erzeugen.
      Nur existierende Dateien dokumentieren — niemals Tabellen oder Spalten erfinden.
      Wenn Information nicht belegt: schreibe exakt "nicht belegt".
    </constraints>

    <on_error>
      Bei unklarer Spec-Stelle: {"status": "ESCALATE"}.
      Bei Production Code Änderung erkannt: {"status": "STOP"}.
      Bei Pfad nicht gefunden (Spec-Datei fehlt): {"status": "BLOCKED", "issues": ["missing: <pfad>"]}.
    </on_error>
  </task>

scope_files:
  - "docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md"

context_files:
  - "supabase/migrations/"
  - "packages/types/src/nutrition/"
  - "docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md"
  - "docs/specs/Nutrition/03_sql/SPEC_06_V1_MIGRATION.sql"
  - "docs/specs/Nutrition/02_patches/SPEC_06_RECALCULATE_PATCH.md"
  - "docs/specs/Nutrition/02_patches/SPEC_02_PASS2_ENTITIES.md"
  - "docs/specs/Nutrition/00_decisions/NUTRITION_NEXT_SPEC_DECISIONS.md"

acceptance_criteria:
  - "Audit-Report unter docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md erstellt"
  - "Liste aller existierenden Nutrition-bezogenen Migrationen vorhanden (oder Hinweis 'keine Nutrition-Migration vorhanden')"
  - "Liste aller existierenden Type-Files unter packages/types/src/nutrition/ vorhanden (oder Hinweis 'keine Type-Files vorhanden')"
  - "Diff-Liste Tabellen/Spalten Spec vs. DB enthalten (vorhanden / fehlend / abweichend)"
  - "data_source vs. food_source Doppelspalten-Status geflagged (siehe SPEC_06_RECALCULATE_PATCH.md)"
  - "RLS-Status pro existierender Tabelle dokumentiert"
  - "Markdown valide und lesbar"
  - "Kein Production Code geändert"

negative_constraints:
  - "NIEMALS Production Code ändern"
  - "NIEMALS Migration-Dateien erzeugen oder ändern"
  - "NIEMALS Features dokumentieren die nicht existieren"
  - "NIEMALS außerhalb docs/specs/Nutrition/06_workorder_planning/audit/ schreiben"
  - "NIEMALS ENV-Dateien lesen oder schreiben"
  - "NIEMALS system/ oder .claude/ Dateien ändern"

files_blocked:
  - "services/**"
  - "apps/**"
  - "packages/**"
  - "infra/**"
  - "supabase/**"
  - "tools/**"
  - "system/**"
  - ".env"
  - ".env.*"

required_skills: ["doc-specialist"]
optional_skills: []
blocked_by:      []
```

---

## Notes

- **Filename ↔ workorder_id:** Filename folgt der vom Auftraggeber gewünschten Convention (`WO-NUTRITION-P1-001-...md`). Das `workorder_id`-Feld folgt der schema-erzwungenen Regex `^WO-[a-z]+-[0-9]+$` (`WO-nutrition-001`).
- **`context_files`** sind read-only Referenzen. Worker darf sie lesen, aber nicht schreiben.
- **`scope_files`** ist allow-list für Write-Operationen.
- **`files_blocked`** enthält explizite Deny-Pfade als zusätzliche Sicherung.
- **Lifecycle-Pfad:** Dieser WO ist ein reiner Discovery-Schritt; nach `done` direkt → `closed` (per `wo_lifecycle_v1.md` für triviale WOs).

---

*Draft erzeugt: 2026-05-02 — gemäß `NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` und `template_docs.md`.*
