---
status:     freigegeben
version:    1.0
stand:      2026-08-14
ankerhash:  83f8585
---

# Konsolidierung — vom Altbestand zur Spezifikation

**Zweck:** Ein Register darüber, welche Altbestand-Datei gelesen,
besprochen und aufgelöst ist. Ohne dieses Register wird dieselbe ADR
zweimal diskutiert und ein Widerspruch dreimal gefunden.

**Diese Datei ersetzt kein Verfahren.** Das Verfahren steht in
`00-INDEX.md`: Rollen der Ordner, Statuskopf, die vier Regeln aus dem
Spec-Audit, die Reihenfolge. Hier steht nur, **wie weit** es angewandt
ist.

---

## Der Ablauf in vier Schritten

Gilt für jede Altbestand-Datei, unabhängig davon, wer sie bearbeitet —
Claude, Codex, ChatGPT oder Tom.

1. **Lesen.** Die Datei ganz, nicht in Auszügen. Widersprüche zu anderen
   Spec-Dateien notieren statt auflösen.
2. **Besprechen.** Mit Tom. Was er nicht bestätigt, gilt nicht. Ein
   Inhalt, der niemandem aufgefallen ist, ist nicht entschieden — er ist
   ungelesen.
3. **Ablegen**, und zwar getrennt nach Art der Aussage:

   | Art der Aussage | Ort | Beispiel |
   |---|---|---|
   | Produktentscheidung, Vertrag, Zielbild | `docs/spezifikation/` | „Custom Foods sind in V1 nur privat sichtbar" |
   | Messung, Code-Befund, Bestandszahl | `docs/ssot/` | „`meal_items` trägt `food_source` mit Prüfbedingung" |
   | Offener Punkt, Bauauftrag | `docs/todo/TODO.md` | C-34 |

   `[read]` Das ist Regel 2 aus `00-INDEX.md` — Ist und Soll getrennt —
   und keine neue Festlegung. Eine Produktentscheidung ist Soll, auch
   wenn sie vor Monaten getroffen wurde.

4. **Eintragen.** Zeile im Register unten. Vier Zustände, mehr nicht:

   | | |
   |---|---|
   | `offen` | noch nicht gelesen |
   | `gelesen` | gelesen, noch nicht besprochen |
   | `aufgeloest` | besprochen und abgelegt — Zielort in der letzten Spalte |
   | `verworfen` | bewusst nicht übernommen, Grund in der letzten Spalte |

**In `docs/specs/` wird nicht geschrieben.** `[read]` Regel aus
`00-INDEX.md`. Eine Ausnahme: ein Statusvermerk im Kopf, der auf diese
Datei zeigt, damit niemand einen überholten Steuersatz befolgt.

---

## Was dabei nicht entsteht

Kein Freigabelauf, keine Risikoklassen, keine Warteschlange, keine
Werkzeuge. Der Altbestand hat 1,5 MB Spezifikation hervorgebracht und
nichts Gebautes; die frühere Governance-Maschinerie 476 Dateien. Dieses
Register ist eine Tabelle mit vier Zuständen und bleibt eine.

Wenn es anfängt, Pflege zu kosten, ist es falsch gebaut.

---

## Offene Steuersätze aus dem Altbestand

`[read]` `docs/specs/Nutrition/INDEX.md` trägt im Kopf
`STATUS: BLOCKED_BY_PRODUCT_GATE / REFERENCE_ONLY … unless Tom
explicitly opens a specific product gate`.

**Das gilt nicht mehr.** `[read]` Tom hat am 2026-08-14 festgelegt, dass
die Nutrition-Specs Grundlage der laufenden Arbeit sind; `00-INDEX.md`
führt Nutrition seit dem 2026-08-02 als Kandidat mit offenem Gate. Der
Satz stammt aus dem abgelegten Governance-Modell.

---

## Register — Nutrition

**Reihenfolge der Bearbeitung:** nicht alphabetisch, sondern nach Bedarf.
Was für den aktuellen Bauauftrag gebraucht wird, kommt zuerst. Der
Altbestand ist Material, keine Warteschlange.

`[cmd]` 84 Dateien am 2026-08-14: 45 unter `docs/specs/Nutrition/`,
39 unter `docs/BrainstormDocs/Nutrition/` (ohne die drei BLS-Rohdateien).

| Datei | | Stand | Aufgelöst in / Grund |
|---|---|---|---|
| `brainstorm/02_MODULE_NUTRITION.md` | 7 KB | offen | — |
| `brainstorm/FOOD_SEMANTIC_TAGS_SUMMARY.md` | 10 KB | offen | — |
| `brainstorm/NUTRITION-SCHEMA-DESIGN.md` | 28 KB | offen | — |
| `brainstorm/food-db-architecture.md` | 15 KB | offen | — |
| `brainstorm/food-semantic-tags-design.md` | 10 KB | offen | — |
| `brainstorm/lumeos-nutrition-strategy.md` | 15 KB | offen | — |
| `brainstorm/new/API.md` | 9 KB | offen | — |
| `brainstorm/new/COMPONENTS.md` | 7 KB | offen | — |
| `brainstorm/new/DATABASE.md` | 17 KB | offen | — |
| `brainstorm/new/FEATURES.md` | 10 KB | offen | — |
| `brainstorm/new/FOOD_DATABASE.md` | 8 KB | offen | — |
| `brainstorm/new/NUTRITION_MIGRATION_ANALYSIS.md` | 59 KB | offen | — |
| `brainstorm/new/NUTRITION_MIGRATION_ANALYSIS_PART2.md` | 25 KB | offen | — |
| `brainstorm/new/OPEN_ITEMS.md` | 6 KB | offen | — |
| `brainstorm/new/PRE_MIGRATION_AUDIT.sql` | 11 KB | offen | — |
| `brainstorm/new/README.md` | 3 KB | offen | — |
| `brainstorm/new/STRATEGY.md` | 7 KB | offen | — |
| `brainstorm/new/TDEE_SCORING.md` | 6 KB | offen | — |
| `brainstorm/new/spec/INDEX.md` | 3 KB | offen | — |
| `brainstorm/new/spec/SPEC_01_MODULE_CONTRACT.md` | 8 KB | offen | — |
| `brainstorm/new/spec/SPEC_02_ENTITIES.md` | 20 KB | offen | — |
| `brainstorm/new/spec/SPEC_03_USER_FLOWS.md` | 14 KB | offen | — |
| `brainstorm/new/spec/SPEC_04_FEATURES.md` | 10 KB | offen | — |
| `brainstorm/new/spec/SPEC_05_FOOD_TAXONOMY.md` | 38 KB | offen | — |
| `brainstorm/new/spec/SPEC_06_DATABASE_SCHEMA.md` | 62 KB | offen | — |
| `brainstorm/new/spec/SPEC_07_API.md` | 22 KB | offen | — |
| `brainstorm/new/spec/SPEC_08_IMPORT_PIPELINE.md` | 16 KB | offen | — |
| `brainstorm/new/spec/SPEC_09_SCORING.md` | 17 KB | offen | — |
| `brainstorm/new/spec/SPEC_10_COMPONENTS.md` | 13 KB | offen | — |
| `brainstorm/nutmod_TODO.md` | 3 KB | offen | — |
| `brainstorm/nutrition_API.md` | 13 KB | offen | — |
| `brainstorm/nutrition_COMPONENTS.md` | 8 KB | offen | — |
| `brainstorm/nutrition_DATABASE.md` | 21 KB | offen | — |
| `brainstorm/nutrition_FEATURES.md` | 12 KB | offen | — |
| `brainstorm/nutrition_MIGRATION.md` | 7 KB | offen | — |
| `brainstorm/nutrition_README.md` | 5 KB | offen | — |
| `brainstorm/nutrition_RESEARCH.md` | 11 KB | offen | — |
| `brainstorm/tdee-formulas.md` | 5 KB | offen | — |
| `specs/00_decisions/NUTRITION_NEXT_SPEC_DECISIONS.md` | 22 KB | gelesen | Abschnitt 3 und 4 in C-34; Rest offen |
| `specs/01_current_specs/SPEC_01_MODULE_CONTRACT.md` | 15 KB | offen | — |
| `specs/01_current_specs/SPEC_02_ENTITIES.md` | 20 KB | offen | — |
| `specs/01_current_specs/SPEC_03_USER_FLOWS.md` | 14 KB | offen | — |
| `specs/01_current_specs/SPEC_04_FEATURES.md` | 15 KB | offen | — |
| `specs/01_current_specs/SPEC_05_FOOD_TAXONOMY.md` | 39 KB | aufgeloest | TODO C-38 (Scoring-Formel), C-39 (Canonical Names); Core-Fitness-Liste als Priorisierung |
| `specs/01_current_specs/SPEC_06_DATABASE_SCHEMA.md` | 64 KB | offen | — |
| `specs/01_current_specs/SPEC_07_API.md` | 22 KB | offen | — |
| `specs/01_current_specs/SPEC_08_IMPORT_PIPELINE.md` | 16 KB | offen | — |
| `specs/01_current_specs/SPEC_09_SCORING.md` | 17 KB | offen | — |
| `specs/01_current_specs/SPEC_10_COMPONENTS.md` | 13 KB | offen | — |
| `specs/02_patches/SPEC_02_PASS2_ENTITIES.md` | 11 KB | offen | — |
| `specs/02_patches/SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md` | 2 KB | aufgeloest | TODO C-34 (Tabellenentwurf `foods_custom`) |
| `specs/02_patches/SPEC_02_PATCH_MEALPLANLOG_ADR.md` | 3 KB | offen | — |
| `specs/02_patches/SPEC_02_PATCH_NOTES.md` | 2 KB | offen | — |
| `specs/02_patches/SPEC_03_FLOW4_RECIPE_PATCH.md` | 1 KB | offen | — |
| `specs/02_patches/SPEC_03_PASS2_PATCH.md` | 19 KB | offen | — |
| `specs/02_patches/SPEC_06_PATCH_V1_DECISIONS.md` | 2 KB | offen | — |
| `specs/02_patches/SPEC_06_RECALCULATE_PATCH.md` | 6 KB | offen | — |
| `specs/02_patches/SPEC_07_PASS2_PATCH.md` | 16 KB | offen | — |
| `specs/02_patches/SPEC_07_PATCH_APRIL2026.md` | 4 KB | offen | — |
| `specs/02_patches/SPEC_09_PATCH_UL_SUPPLEMENTS.md` | 7 KB | offen | — |
| `specs/02_patches/SPEC_10_PASS2_PATCH.md` | 14 KB | offen | — |
| `specs/02_patches/SPEC_10_PATCH_APRIL2026.md` | 2 KB | offen | — |
| `specs/03_sql/NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md` | 6 KB | offen | — |
| `specs/03_sql/SPEC_06_V1_MIGRATION.sql` | 17 KB | offen | — |
| `specs/04_adrs/ADR_BLS_ONLY.md` | 2 KB | offen | — |
| `specs/04_adrs/ADR_COACH_PERMISSIONS_V1.md` | 2 KB | offen | — |
| `specs/04_adrs/ADR_CUSTOM_FOODS_V1.md` | 2 KB | aufgeloest | TODO C-34 (Modell, Pflichtfelder, `source`-Werte) |
| `specs/04_adrs/ADR_GHOST_ENTRY_RECIPE.md` | 2 KB | offen | — |
| `specs/04_adrs/ADR_IMPROVEMENTS_PACKAGE.md` | 7 KB | offen | — |
| `specs/04_adrs/ADR_MEALCAM_CONSENT.md` | 2 KB | offen | — |
| `specs/04_adrs/ADR_MEALCAM_V1.md` | 2 KB | offen | — |
| `specs/04_adrs/ADR_NUTRITION_PREFERENCES_V1.md` | 3 KB | offen | — |
| `specs/04_adrs/ADR_RECIPES_SCHEMA_ONLY.md` | 1 KB | offen | — |
| `specs/04_adrs/ADR_RECIPE_SOURCE_BUDDY.md` | 1 KB | offen | — |
| `specs/04_adrs/ADR_SUPPLEMENTS_API_BOUNDARY.md` | 2 KB | offen | — |
| `specs/04_adrs/ADR_WATER_TOTAL_HYDRATION.md` | 3 KB | offen | — |
| `specs/05_reviews/OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md` | 17 KB | offen | — |
| `specs/05_reviews/OPUS_REVIEW_NUTRITION_02_DATA_API.md` | 43 KB | offen | — |
| `specs/05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md` | 44 KB | offen | — |
| `specs/05_reviews/OPUS_REVIEW_NUTRITION_V1_FINAL.md` | 18 KB | offen | — |
| `specs/06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` | 33 KB | offen | — |
| `specs/06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md` | 21 KB | offen | — |
| `specs/06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md` | 2 KB | offen | — |
| `specs/INDEX.md` | 11 KB | offen | — |

---

## Was zuerst gebraucht wird

`[read]` Aus der laufenden Arbeit an der Lebensmittelsuche, an C-34 und
an C-38/C-39:

1. `specs/01_current_specs/SPEC_06_DATABASE_SCHEMA.md` - 64 KB, groesste
   Einzeldatei; gehoert vor jede Schemaaenderung gelesen
2. `specs/01_current_specs/SPEC_09_SCORING.md` - grenzt vermutlich an das
   Scoring aus C-38; vor dem Bau pruefen, ob dieselbe Kennzahl gemeint ist
3. `specs/04_adrs/ADR_BLS_ONLY.md` - begruendet die Entscheidung, die
   C-34 gegen Sortenkopien schuetzt
4. `specs/04_adrs/ADR_MEALCAM_V1.md` und `ADR_MEALCAM_CONSENT.md` -
   klaeren den Widerspruch aus C-34 Punkt 4 (`source = mealcam`)

Der Rest wartet, bis er gebraucht wird.

---

## Warum dieses Register existiert

`[read]` `SPEC_05_FOOD_TAXONOMY.md` enthaelt die Namensstrategie in drei
Phasen, die vollstaendige `sort_weight`-Formel und eine kuratierte
Prioritaetsliste. Gelesen wurde die Datei am 2026-08-14 - nach vier Tagen
Arbeit an genau diesen Fragen und zwei gemessenen, gefallenen Modellen
(C-28, C-33).

Der Altbestand ist nicht deshalb liegen geblieben, weil er wertlos waere,
sondern weil niemand wusste, was darin schon beantwortet ist. Genau das
soll die Tabelle oben verhindern.
