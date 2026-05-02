# REVIEW-WO-NUTRITION-P1-BATCH-001.md

> Review der drei Nutrition Phase-1 Draft-Workorders (Batch 001)
> Reviewer: Opus | Datum: 2026-05-02
> Quellen: `WO-NUTRITION-P1-001-audit-existing-state.md`, `WO-NUTRITION-P1-002-core-schema-foundation.md`, `WO-NUTRITION-P1-003-food-core-tables.md`, `workorder.schema.json`, `template_docs.md`, `template_migration.md`, `wo_lifecycle_v1.md`, `NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md`

---

## Executive Verdict

**PASS_WITH_FIXES**

Alle drei Drafts sind strukturell schema-kompatibel, template-konform, mit korrekter Risk-Klassifikation und sauberer Dependency-Kette. Sie erfüllen die Pflichtfelder von `workorder.schema.json`, die XML-Struktur (`#1`/`#3`/`#5`/`#9`) der Templates und die Lifecycle-Konventionen.

Es gibt jedoch **zwei wichtige Fixes** und **drei kleine Klarstellungen** vor dem Batch-Plan:

- **Wichtig:** WO-003 Auto-Tag-Trigger ist für 4 der 16 V1-Tags (halal, kosher, spicy, thai_food) nicht aus BLS-Codes deterministisch ableitbar. Das ist im Draft nicht klar getrennt zwischen "Auto-Set" und "Admin-Managed".
- **Wichtig:** WO-003 Acceptance Criteria erwähnen die `nutrient_defs` Seed-Inserts (138 BLS-Codes) nicht explizit, obwohl der Task-Block sie verlangt.
- Drei Minor-Findings zu Konsistenz, Validierung und Direktoriums-Anlage.

Keine BLOCKED-Befunde. Nach dem kleinen Fix-Pass sind alle drei WOs batch-ready.

---

## Summary

| Aspekt | Bewertung |
|---|---|
| Schema-Compliance | ✅ alle drei Drafts |
| Template-Compliance | ✅ alle drei Drafts |
| ID/Filename-Konsistenz | ⚠️ ID ≠ Filename (dokumentiert, schema-konform — siehe Findings) |
| Scope / FILES_ALLOWED / FILES_BLOCKED | ✅ konsistent mit Split-Plan |
| Größe / Layer-Trennung | ✅ in Phase-1-Regeln; WO-003 dicht aber innerhalb 3-Files-Regel |
| db-migration Pflicht-Felder | ✅ rollback_hint + risk_category + requires_approval korrekt |
| WO-001 read-only | ✅ Scope nur audit-report.md, files_blocked deckt Production ab |
| Versteckte Implementation | keine erkannt |
| Acceptance Criteria | ⚠️ WO-003 hat AC-Lücke für nutrient_defs Seed (siehe Findings) |
| Dependencies | ✅ blocked_by korrekt: 002→001, 003→002 |
| Scope Creep | nicht erkannt |
| Batch-Readiness | nach Fix-Pass: ja |

---

## Findings

| WO | Severity | Finding | Fix |
|---|---|---|---|
| WO-003 | Important | Auto-Tag-Trigger Acceptance "auf die 16 V1-Tags beschränkt" lässt offen, wie mit den 4 nicht-auto-derivable Tags (halal, kosher, spicy, thai_food) umzugehen ist. Per `NUTRITION_NEXT_SPEC_DECISIONS.md §5` sind diese **admin-managed** ("manuell gepflegte Tag-Liste für schwierige Tags"). Worker könnte FAIL/ESCALATE wegen Unmöglichkeit deterministischer Ableitung. | Task-Block + AC ergänzen: "Auto-Tag-Trigger setzt deterministisch ableitbare Subset der V1-Tags (12 Tags: high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian, gluten_free, lactose_free, nut_free, mediterranean, processed_food, ultra_processed). Die 4 admin-managed Tags (halal, kosher, spicy, thai_food) sind als `tag_definitions`-Einträge geseedet, aber nicht im Trigger gesetzt." |
| WO-003 | Important | Task-Block fordert "138 BLS-Codes als Stamm; Seed-INSERTs in dieser Migration", aber **Acceptance Criteria** erwähnen das nicht. AC-Lücke kann zu unvollständigem Output führen ("7 Stamm-Tabellen erzeugt" wäre auch mit leerem `nutrient_defs` erfüllt). | AC ergänzen: "nutrient_defs enthält genau 138 BLS-Code-Einträge (Seed-Insert)" und "tag_definitions enthält genau 16 V1-Tag-Einträge (Seed-Insert)". |
| WO-001 | Minor | `scope_files` listet `docs/specs/Nutrition/06_workorder_planning/audit/audit-report.md` — das Verzeichnis `audit/` existiert vermutlich noch nicht. Worker muss es bei Datei-Erzeugung anlegen. Schema/Template fordern das nicht ausdrücklich; sollte aber im Task explizit erwähnt sein. | Optional in `<implement>`-Block ergänzen: "Lege ggf. das Verzeichnis docs/specs/Nutrition/06_workorder_planning/audit/ an, falls nicht vorhanden." Kein Blocker. |
| WO-002 | Minor | Acceptance Criterion "supabase db diff zeigt nur erwartete Änderungen" ist nicht automatisch validierbar. `validation_commands` enthält nur `pnpm tsc --noEmit`. `negative_constraints` blockt `supabase db push` und `supabase db reset`, aber nicht `supabase db diff`. Worker müsste manuell diff prüfen. | Entweder AC entfernen (falls nicht-automatisierbar absichtlich) oder `validation_commands` ergänzen (z. B. `supabase db diff`). Bevorzugt: Hinweis "manuell durch Reviewer/Tom" — kein Auto-Check. |
| WO-001 / 002 / 003 | Minor | Filename-Konvention `WO-NUTRITION-P1-NNN-...md` divergiert vom Schema-konformen `workorder_id` (`WO-nutrition-NNN`). Im File selbst dokumentiert. Für Orchestrator/Scheduler kein Problem (verwendet `workorder_id`-Feld), aber für Datei-basierte Tools (z. B. lokale Suche) potenzielle Reibung. | Akzeptiert per Auftrag. Empfehlung: in der Batch-Plan-Datei explizit Mapping `Filename → workorder_id` dokumentieren. |
| WO-003 | Minor | `files_blocked` listet einzelne Packages (`packages/agent-core/**` etc.). Zukünftig neu hinzukommende Packages (z. B. `packages/scoring/**`) wären nicht abgedeckt. | Optional `packages/**` blocken und scope_files (`packages/types/src/nutrition/...`) als allow-list-Override betrachten. Hängt davon ab, wie `authorize-tool-call.ts` Reihenfolge auflöst. Aktuell akzeptabel, weil scope_files ohnehin allow-list. |

---

## Schema Compatibility

Geprüft gegen `workorder.schema.json` Pflichtfelder + Pattern + if/then-Block:

| WO | Schema-compatible? | Issues |
|---|---|---|
| WO-001 | ✅ | Alle Pflichtfelder vorhanden. `workorder_id` matched Regex `^WO-[a-z]+-[0-9]+$`. `negative_constraints` ≥ 4 (hat 6). `scope_files` ≥ 1 (hat 1). `acceptance_criteria` ≥ 1 (hat 8). `risk_category: docs` ist im enum. Kein `rollback_hint` nötig (nicht db-migration). |
| WO-002 | ✅ | Alle Pflichtfelder vorhanden. `workorder_id` matched Regex. `negative_constraints` = 7. `risk_category: db-migration` aktiviert if/then-Block: `rollback_hint` vorhanden, ≥ 5 chars (deutlich darüber). `requires_approval: true` korrekt. `validation_commands` enthält `pnpm tsc --noEmit`. |
| WO-003 | ✅ | Alle Pflichtfelder vorhanden. `workorder_id` matched Regex. `negative_constraints` = 10. `risk_category: db-migration` + `rollback_hint` ≥ 5 chars (deutlich darüber, mit konkreten DROP-Statements). `requires_approval: true` korrekt. `scope_files` = 3 (innerhalb 3-Files-Regel `template_implementation_low.md`; für `template_migration.md` keine harte Limit). |

---

## Template Compliance

Geprüft gegen das jeweils zugewiesene Template:

| WO | Template | Compliant? | Issues |
|---|---|---|---|
| WO-001 | `template_docs.md` | ✅ | XML-Struktur mit `<analyze>`/`<implement>`/`<constraints>`/`<on_error>` korrekt. `agent_id: docs-agent` ✓. `priority: low` ✓. `quality_critical: false` ✓. `negative_constraints` enthalten "NIEMALS Production Code ändern" und "NIEMALS Features dokumentieren die nicht existieren" gemäß Template ✓. Acceptance "Markdown valide und lesbar" + "Kein Production Code geändert" gemäß Template-Default ✓. |
| WO-002 | `template_migration.md` | ✅ | XML-Struktur mit allen 4 Blöcken ✓. `agent_id: db-migration-agent` ✓. `requires_approval: true` (Pflicht laut Template) ✓. Migration-Naming-Convention `YYYYMMDD_NNN_<beschreibung>.sql` referenziert ✓. Negative Constraints enthalten "NIEMALS supabase db push --linked", "NIEMALS supabase db reset", "NIEMALS DROP ... ohne expliziten Task", "NIEMALS Migration ohne security-specialist Review" gemäß Template ✓. `required_skills: ["gsd-v2", "supabase-specialist"]` gemäß Template ✓. |
| WO-003 | `template_migration.md` | ✅ | XML-Struktur ✓. `agent_id`, `requires_approval`, `required_skills` gemäß Template ✓. `scope_files` enthält `supabase/migrations/` + `packages/types/src/nutrition/...` analog Template-Beispiel ✓. Acceptance erwähnt "RLS aktiviert" und "TypeScript Types aktualisiert" gemäß Template ✓. **Aber:** AC-Lücke für `nutrient_defs` Seed (siehe Findings) — Template fordert "Acceptance Criteria spezifisch", aber Acceptance ist bzgl. Seed-Volumen vage. |

---

## Scope Review

| WO | Scope OK? | Files Allowed OK? | Files Blocked OK? | Notes |
|---|---|---|---|---|
| WO-001 | ✅ | `scope_files` = audit-report.md (allow-list). | `files_blocked` blockt alle Production-Pfade (services/apps/packages/infra/supabase/tools/system/.env). | `context_files` enthalten `supabase/migrations/`, `packages/types/src/nutrition/` etc. — read-only Pfade; `files_blocked` blockt Writes nicht Reads (per Schema-Beschreibung). Konsistent mit Split-Plan §8 #1. |
| WO-002 | ✅ | `scope_files` = `supabase/migrations/`. Single-Layer (DB-Migration). | `files_blocked` blockt alle Non-DB-Pfade inkl. docs/, packages/. | Konsistent mit Split-Plan §8 #2. Schema + Extensions + Grant nur. Keine Tabellen-DDL — explizit out-of-scope. |
| WO-003 | ✅ | `scope_files` = 3 Files (Migration + foods.ts + index.ts). Layer: DB-Migration + Types — gemäß `template_migration.md` zulässige Kombination. | `files_blocked` listet einzelne Packages (außer `packages/types/`); `services/`, `apps/`, `infra/`, `tools/`, `system/`, `docs/`, `.env` blockiert. | Konsistent mit Split-Plan §8 #3. Größter WO der drei, aber innerhalb der 3-Files-Regel und Layer-Trennung des Migration-Templates. |

---

## Batch Readiness

| WO | Ready for Batch? | Voraussetzung |
|---|---|---|
| WO-001 | ✅ Ja (mit Minor-Fix optional) | Klein, read-only, kein Approval. Kann sofort dispatched werden, sobald Spec-Approval erfolgt. Optional: Verzeichnis-Anlage in `<implement>` ergänzen. |
| WO-002 | ✅ Ja (nach Minor-Fix) | Wartet auf WO-001 (`blocked_by`). Nach WO-001 done/closed → ready. Optional: AC "supabase db diff" als manuell-prüf-AC kennzeichnen oder entfernen. |
| WO-003 | ⚠️ Nach Important-Fix-Pass | Wartet auf WO-002 (`blocked_by`). **Vor Batch:** Auto-Tag-Trigger-Klärung (12 auto vs. 4 admin) im Task + AC. Außerdem: `nutrient_defs` und `tag_definitions` Seed-Insert-AC ergänzen. |

---

## Required Fixes Before Batch

Echte nötige Fixes (nicht optional):

1. **WO-003** — Task-Block + Acceptance Criteria klären, dass nur 12 der 16 V1-Tags im Auto-Tag-Trigger gesetzt werden. Die 4 admin-managed Tags (halal, kosher, spicy, thai_food) werden als `tag_definitions`-Einträge geseedet, aber **nicht** im Trigger automatisch zugewiesen — sie sind admin-/manuell-set per `NUTRITION_NEXT_SPEC_DECISIONS.md §5` "manuell gepflegte Tag-Liste für schwierige Tags".

2. **WO-003** — Acceptance Criteria ergänzen:
   - "nutrient_defs enthält genau 138 BLS-Code-Seed-Einträge"
   - "tag_definitions enthält genau 16 V1-Tag-Seed-Einträge"
   - "Auto-Tag-Trigger trg_foods_auto_tag setzt nur die 12 deterministisch-ableitbaren V1-Tags (high_protein, low_carb, low_fat, high_fiber, vegan, vegetarian, gluten_free, lactose_free, nut_free, mediterranean, processed_food, ultra_processed)"

Optional (Minor — nicht batch-blockierend):

3. **WO-001** — `<implement>`-Block um expliziten Hinweis auf Verzeichnis-Anlage `audit/` ergänzen.
4. **WO-002** — Acceptance "supabase db diff zeigt nur erwartete Änderungen" als manuell-prüf-AC kennzeichnen oder entfernen (validation_commands ergänzen falls automatisierbar gewünscht).
5. **Alle drei** — Im Batch-Plan ein Mapping `Filename ↔ workorder_id` zur Traceability dokumentieren.

---

## Recommended Next Step

**Fix-Pass für Draft-WOs.**

Konkret:

1. **Wichtig:** Der Auftraggeber (oder ein Folge-WO-Update-Task) sollte WO-003 um die zwei oben genannten Fixes ergänzen — Auto-Tag-Trigger 12-vs-16-Tags-Klärung und ergänzte Seed-AC. Das ist ein kleiner Edit am Draft, kein Re-Design.

2. **Optional:** WO-001 und WO-002 kleine Klarstellungen (Minor-Findings 3, 4).

3. **Danach:** Batch-Plan für `WO-nutrition-001`, `WO-nutrition-002`, `WO-nutrition-003` erstellen — mit Dependency-Order (001 → 002 → 003), Approval-Anforderungen (002, 003: human + security-specialist), Filename-/ID-Mapping und Lifecycle-Erwartung.

Wenn Auto-Tag-Trigger-Klärung in einer separaten Spec-Aktualisierung (statt im WO-Draft) erfolgen soll, ist das ein zusätzlicher Schritt — aber die Information aus `NUTRITION_NEXT_SPEC_DECISIONS.md §5` ist ausreichend belegt, um direkt im WO-Draft zu klären.

---

*Ende REVIEW-WO-NUTRITION-P1-BATCH-001.md*
