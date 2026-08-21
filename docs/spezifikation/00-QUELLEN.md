# Wo die Vorgaben liegen

**Diese Datei sagt je Modul, was vor einem Auftrag zu lesen ist.**

**Anlass (Tom, 2026-08-20):** *,Und das hast alles gegen Spec, Docs,
altes Repo und neues Design gegengeprueft?"* — **Nein, mehrfach nicht.**

`[cmd]` **G-101:** 890 Zeilen Mockup mit Detailmodal, Filtern und Baum —
ungelesen. **G-98:** `MealPlansView` in der dritten Nutrition-Datei.
**A-33:** Der Health score war in `SPEC_09_SCORING.md` entschieden —
**und wurde als offene Frage an Tom weitergegeben.**

---

## Umfang

| | |
|---|---|
| Mockups | **49 Dateien, 1722 KB** |
| Specs | **160 Dateien, 15851 KB** — rekursiv gezaehlt |
| Vorgaengerrepo | `referenz/lumeos-2026/` |
| SSOT-Berichte | `docs/ssot/` |

`[read]` **Kein Modul hat nur eine Mockup-Datei.** Nutrition hat drei,
Recovery fuenf, Coach acht.

`[cmd]` **Und `docs/specs/Nutrition/` hat sieben Unterordner** —
**45 Dateien**, darunter `00_decisions/`, `04_adrs/` (12 ADRs) und
`05_reviews/` (122 KB Opus-Reviews). **Eine erste Fassung dieser Datei
zaehlte nur die oberste Ebene und meldete neun.**

---

## Zwei Dateien, die Rechenwerke tragen

`[cmd]` **`module-training-spec.jsx`** — `LANDMARKS` (MEV/MAV/MRV),
`PROGRESSION_MODELS` mit Formeln, `DELOAD_TRIGGERS`,
`ROUTINE_TEMPLATES`.

`[cmd]` **`module-recovery-engine.jsx`** — `MODALITY_BONUS` (elf
Modalitaeten), `OVERTRAINING_SIGNALS` (vier Schwellen), `ACWR_DATA`,
`HRV_BASELINE`.

`[read]` **Wer nur die Hauptdatei liest, findet sie nicht** — und
mehrere offene Punkte fuehren ihre Werte als *„unbelegt"* oder
*„fehlt"*.

---

## Je Modul


### admin

**Mockup — 1 Dateien, 54 KB:**

- `module-admin-v2.jsx` (54 KB)

**Spec — `docs/specs/Admin/`, 5 Dateien, 41 KB:**

- `13_MODULE_ADMIN.md` (10 KB)
- `INDEX.md` (1 KB)
- `SPEC-ADMIN-BACKEND-v1.md` (19 KB)
- `SPEC_01_UI_DESIGN.md` (7 KB)
- `admin-panel-spec.md` (4 KB)


### buddy

**Mockup — 4 Dateien, 110 KB:**

- `module-buddy-engines.jsx` (52 KB)
- `module-buddy.jsx` (25 KB)
- `module-buddy-knowledge.jsx` (19 KB)
- `module-buddy-voice.jsx` (13 KB)

**Spec — `docs/specs/BuddyandAICoach/`, 12 Dateien, 136 KB:**

- `INDEX.md` (7 KB)
- `SPEC_01_MODULE_CONTRACT.md` (4 KB)
- `SPEC_02_ENTITIES.md` (9 KB)
- `SPEC_03_USER_FLOWS.md` (8 KB)
- `SPEC_04_FEATURES.md` (17 KB)
- `SPEC_05_ENGINES.md` (15 KB)
- `SPEC_06_DATABASE_SCHEMA.md` (16 KB)
- `SPEC_07_API.md` (14 KB)
- `SPEC_08_IMPORT_PIPELINE.md` (11 KB)
- `SPEC_09_SCORING.md` (13 KB)
- `SPEC_10_COMPONENTS.md` (11 KB)
- `SPEC_11_UI_DESIGN.md` (9 KB)


### coach

**Mockup — 8 Dateien, 242 KB:**

- `module-coach.jsx` (60 KB)
- `module-coach-extras.jsx` (48 KB)
- `module-coach-gaps.jsx` (34 KB)
- `module-coach-athlete.jsx` (31 KB)
- `module-coach-portal-v2.jsx` (23 KB)
- `module-coach-portal-workflows.jsx` (21 KB)
- `module-coach-programs.jsx` (12 KB)
- `module-coach-meta.jsx` (12 KB)

**Spec — `docs/specs/HumanCoach/`, 12 Dateien, 97 KB:**

- `INDEX.md` (4 KB)
- `SPEC_01_MODULE_CONTRACT.md` (4 KB)
- `SPEC_02_ENTITIES.md` (8 KB)
- `SPEC_03_USER_FLOWS.md` (8 KB)
- `SPEC_04_FEATURES.md` (10 KB)
- `SPEC_05_COACH_WORKFLOWS.md` (8 KB)
- `SPEC_06_DATABASE_SCHEMA.md` (12 KB)
- `SPEC_07_API.md` (9 KB)
- `SPEC_08_IMPORT_PIPELINE.md` (10 KB)
- `SPEC_09_SCORING.md` (7 KB)
- `SPEC_10_COMPONENTS.md` (8 KB)
- `SPEC_11_UI_DESIGN.md` (8 KB)


### completeness

**Mockup — 1 Dateien, 52 KB:**

- `module-completeness.jsx` (52 KB)


### crossmodule

**Mockup — 1 Dateien, 17 KB:**

- `module-crossmodule-rest.jsx` (17 KB)


### dashboard

**Mockup — 1 Dateien, 15 KB:**

- `module-dashboard.jsx` (15 KB)

**Spec — `docs/specs/Dashboard/`, 1 Dateien, 1 KB:**

- `dashmod.md` (1 KB)


### goals

**Mockup — 3 Dateien, 136 KB:**

- `module-goals-pro.jsx` (51 KB)
- `module-goals.jsx` (50 KB)
- `module-goals-editor.jsx` (35 KB)

**Spec — `docs/specs/Goals/`, 10 Dateien, 65 KB:**

- `API.md` (8 KB)
- `COMPONENTS.md` (5 KB)
- `CONSOLIDATED_KNOWLEDGE.md` (6 KB)
- `DATABASE.md` (13 KB)
- `FEATURES.md` (5 KB)
- `OPEN_ITEMS.md` (3 KB)
- `PHASE_MODELS.md` (7 KB)
- `README.md` (4 KB)
- `SCORING.md` (10 KB)
- `STRATEGY.md` (4 KB)


### market

**Mockup — 7 Dateien, 203 KB:**

- `module-market-seller.jsx` (44 KB)
- `module-market-products.jsx` (39 KB)
- `module-market-wallet.jsx` (34 KB)
- `module-market-scoring.jsx` (24 KB)
- `module-market-home.jsx` (21 KB)
- `module-market-subs.jsx` (21 KB)
- `module-market-creator.jsx` (20 KB)

**Spec — `docs/specs/Marketplace/`, 12 Dateien, 89 KB:**

- `INDEX.md` (4 KB)
- `SPEC_01_MODULE_CONTRACT.md` (3 KB)
- `SPEC_02_ENTITIES.md` (7 KB)
- `SPEC_03_USER_FLOWS.md` (7 KB)
- `SPEC_04_FEATURES.md` (10 KB)
- `SPEC_05_WALLET_ECONOMICS.md` (7 KB)
- `SPEC_06_DATABASE_SCHEMA.md` (14 KB)
- `SPEC_07_API.md` (8 KB)
- `SPEC_08_IMPORT_PIPELINE.md` (6 KB)
- `SPEC_09_SCORING.md` (8 KB)
- `SPEC_10_COMPONENTS.md` (7 KB)
- `SPEC_11_UI_DESIGN.md` (8 KB)


### medical

**Mockup — 4 Dateien, 176 KB:**

- `module-medical.jsx` (56 KB)
- `module-medical-v2.jsx` (53 KB)
- `module-medical-data.jsx` (34 KB)
- `module-medical-modals.jsx` (33 KB)

**Spec — `docs/specs/Medical/`, 11 Dateien, 100 KB:**

- `INDEX.md` (4 KB)
- `SPEC_01_MODULE_CONTRACT.md` (4 KB)
- `SPEC_02_ENTITIES.md` (8 KB)
- `SPEC_03_USER_FLOWS.md` (11 KB)
- `SPEC_04_FEATURES.md` (9 KB)
- `SPEC_05_BIOMARKER_CATALOG.md` (11 KB)
- `SPEC_06_DATABASE_SCHEMA.md` (15 KB)
- `SPEC_07_API.md` (9 KB)
- `SPEC_08_IMPORT_PIPELINE.md` (9 KB)
- `SPEC_09_SCORING.md` (13 KB)
- `SPEC_10_COMPONENTS.md` (7 KB)


### nutrition

**Mockup — 3 Dateien, 130 KB:**

- `module-nutrition-nutrients.jsx` (54 KB)
- `module-nutrition-spec.jsx` (39 KB)
- `module-nutrition.jsx` (36 KB)

**Spec — `docs/specs/Nutrition/`, 49 Dateien, 14827 KB:**

- `00_decisions/NUTRITION_NEXT_SPEC_DECISIONS.md` (22 KB)
- `00_raw/bls/original/BLS_4_0_Components_DE_EN.xlsx` (21 KB)
- `00_raw/bls/original/BLS_4_0_Daten_2025_DE.xlsx` (13763 KB)
- `00_raw/bls/original/BLS_4_0_Dokumentation_DE.pdf` (459 KB)
- `01_current_specs/SPEC_01_MODULE_CONTRACT.md` (15 KB)
- `01_current_specs/SPEC_02_ENTITIES.md` (20 KB)
- `01_current_specs/SPEC_03_USER_FLOWS.md` (14 KB)
- `01_current_specs/SPEC_04_FEATURES.md` (15 KB)
- `01_current_specs/SPEC_05_FOOD_TAXONOMY.md` (39 KB)
- `01_current_specs/SPEC_06_DATABASE_SCHEMA.md` (64 KB)
- `01_current_specs/SPEC_07_API.md` (22 KB)
- `01_current_specs/SPEC_08_IMPORT_PIPELINE.md` (16 KB)
- `01_current_specs/SPEC_09_SCORING.md` (17 KB)
- `01_current_specs/SPEC_10_COMPONENTS.md` (13 KB)
- `02_patches/SPEC_02_PASS2_ENTITIES.md` (11 KB)
- `02_patches/SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md` (2 KB)
- `02_patches/SPEC_02_PATCH_MEALPLANLOG_ADR.md` (3 KB)
- `02_patches/SPEC_02_PATCH_NOTES.md` (2 KB)
- `02_patches/SPEC_03_FLOW4_RECIPE_PATCH.md` (1 KB)
- `02_patches/SPEC_03_PASS2_PATCH.md` (19 KB)
- `02_patches/SPEC_06_PATCH_V1_DECISIONS.md` (2 KB)
- `02_patches/SPEC_06_RECALCULATE_PATCH.md` (6 KB)
- `02_patches/SPEC_07_PASS2_PATCH.md` (16 KB)
- `02_patches/SPEC_07_PATCH_APRIL2026.md` (4 KB)
- `02_patches/SPEC_09_PATCH_UL_SUPPLEMENTS.md` (7 KB)
- `02_patches/SPEC_10_PASS2_PATCH.md` (14 KB)
- `02_patches/SPEC_10_PATCH_APRIL2026.md` (2 KB)
- `03_sql/NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md` (6 KB)
- `03_sql/SPEC_06_V1_MIGRATION.sql` (17 KB)
- `04_adrs/ADR_BLS_ONLY.md` (2 KB)
- `04_adrs/ADR_COACH_PERMISSIONS_V1.md` (2 KB)
- `04_adrs/ADR_CUSTOM_FOODS_V1.md` (2 KB)
- `04_adrs/ADR_GHOST_ENTRY_RECIPE.md` (2 KB)
- `04_adrs/ADR_IMPROVEMENTS_PACKAGE.md` (7 KB)
- `04_adrs/ADR_MEALCAM_CONSENT.md` (2 KB)
- `04_adrs/ADR_MEALCAM_V1.md` (2 KB)
- `04_adrs/ADR_NUTRITION_PREFERENCES_V1.md` (3 KB)
- `04_adrs/ADR_RECIPES_SCHEMA_ONLY.md` (1 KB)
- `04_adrs/ADR_RECIPE_SOURCE_BUDDY.md` (1 KB)
- `04_adrs/ADR_SUPPLEMENTS_API_BOUNDARY.md` (2 KB)
- `04_adrs/ADR_WATER_TOTAL_HYDRATION.md` (3 KB)
- `05_reviews/OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md` (17 KB)
- `05_reviews/OPUS_REVIEW_NUTRITION_02_DATA_API.md` (43 KB)
- `05_reviews/OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md` (44 KB)
- `05_reviews/OPUS_REVIEW_NUTRITION_V1_FINAL.md` (18 KB)
- `06_workorder_planning/NUTRITION_PHASE1_DB_FOUNDATION_SPLIT.md` (33 KB)
- `06_workorder_planning/NUTRITION_WORKORDER_PLAN_V1.md` (21 KB)
- `06_workorder_planning/schema_verification/P1-004-static-schema-verification-report.md` (2 KB)
- `INDEX.md` (12 KB)


### onboarding

**Mockup — 1 Dateien, 20 KB:**

- `module-onboarding.jsx` (20 KB)


### recovery

**Mockup — 5 Dateien, 159 KB:**

- `module-recovery-v2.jsx` (56 KB)
- `module-recovery-modals.jsx` (33 KB)
- `module-recovery.jsx` (26 KB)
- `module-recovery-engine.jsx` (25 KB)
- `module-recovery-modals2.jsx` (19 KB)

**Spec — `docs/specs/Recovery/`, 11 Dateien, 108 KB:**

- `INDEX.md` (4 KB)
- `SPEC_01_MODULE_CONTRACT.md` (5 KB)
- `SPEC_02_ENTITIES.md` (11 KB)
- `SPEC_03_USER_FLOWS.md` (11 KB)
- `SPEC_04_FEATURES.md` (11 KB)
- `SPEC_05_METRICS_ALGORITHMS.md` (11 KB)
- `SPEC_06_DATABASE_SCHEMA.md` (17 KB)
- `SPEC_07_API.md` (10 KB)
- `SPEC_08_IMPORT_PIPELINE.md` (7 KB)
- `SPEC_09_SCORING.md` (12 KB)
- `SPEC_10_COMPONENTS.md` (9 KB)


### stubs

**Mockup — 2 Dateien, 60 KB:**

- `module-stubs-replacement.jsx` (49 KB)
- `module-stubs.jsx` (11 KB)


### supplements

**Mockup — 4 Dateien, 228 KB:**

- `module-supplements.jsx` (81 KB)
- `module-supplements-spec.jsx` (72 KB)
- `module-supplements-modals.jsx` (38 KB)
- `module-supplements-injection.jsx` (36 KB)

**Spec — `docs/specs/Supplements/`, 12 Dateien, 142 KB:**

- `INDEX.md` (4 KB)
- `Injection Planner · Spec Change Request.md` (17 KB)
- `SPEC_01_MODULE_CONTRACT.md` (6 KB)
- `SPEC_02_ENTITIES.md` (11 KB)
- `SPEC_03_USER_FLOWS.md` (13 KB)
- `SPEC_04_FEATURES.md` (11 KB)
- `SPEC_05_CATALOG_EVIDENCE.md` (10 KB)
- `SPEC_06_DATABASE_SCHEMA.md` (17 KB)
- `SPEC_07_API.md` (13 KB)
- `SPEC_08_IMPORT_PIPELINE.md` (17 KB)
- `SPEC_09_SCORING.md` (13 KB)
- `SPEC_10_COMPONENTS.md` (11 KB)


### training

**Mockup — 4 Dateien, 123 KB:**

- `module-training-spec.jsx` (42 KB)
- `module-training.jsx` (33 KB)
- `module-training-extras.jsx` (30 KB)
- `module-training-offline-hr.jsx` (17 KB)

**Spec — `docs/specs/Training/`, 11 Dateien, 147 KB:**

- `INDEX.md` (4 KB)
- `SPEC_01_MODULE_CONTRACT.md` (6 KB)
- `SPEC_02_ENTITIES.md` (15 KB)
- `SPEC_03_USER_FLOWS.md` (13 KB)
- `SPEC_04_FEATURES.md` (10 KB)
- `SPEC_05_EXERCISE_TAXONOMY.md` (9 KB)
- `SPEC_06_DATABASE_SCHEMA.md` (29 KB)
- `SPEC_07_API.md` (16 KB)
- `SPEC_08_IMPORT_PIPELINE.md` (16 KB)
- `SPEC_09_SCORING.md` (16 KB)
- `SPEC_10_COMPONENTS.md` (12 KB)


### Specs ohne eigenes Mockup-Modul

**`docs/specs/Core/`** — 3 Dateien, 10 KB
**`docs/specs/WebPlatform/`** — 11 Dateien, 86 KB


---

## Die Regel

`[cmd]` **Vor jedem Auftrag: hier nachsehen, dann lesen.**

**1. Alle Mockup-Dateien des Moduls** — nicht die erste.
**2. Die Spec** — pruefend, **und rekursiv**. `[read]` A-20 zaehlt
sieben inhaltliche Fehler; **aber sie enthaelt auch Entscheidungen, die
sonst neu getroffen werden.**
**3. Das Vorgaengerrepo** — Struktur ja, Code nie. **Und nachsehen,
warum es ersetzt wurde.**
**4. `docs/ssot/`** — was schon gemessen ist.

`[read]` **Ein Auftrag, der eine dieser vier auslaesst, kostet den
Agenten einen halben Durchgang.**
