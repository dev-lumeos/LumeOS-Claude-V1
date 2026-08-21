# Wo die Vorgaben liegen

**Diese Datei sagt je Modul, was vor einem Auftrag zu lesen ist.**

**Anlass (Tom, 2026-08-20):** *,Und das hast alles gegen Spec, Docs,
altes Repo und neues Design gegengeprueft?"* — **Nein, mehrfach nicht.**
Der Abgleich danach fand jedes Mal mehr, als im Auftrag stand:

`[cmd]` **G-101:** 890 Zeilen Mockup mit Detailmodal, Filtern und Baum —
ungelesen. **G-98:** `MealPlansView` in der dritten Nutrition-Datei —
zwei Auftraege suchten in der ersten. **A-33:** Der Health score war in
`SPEC_09_SCORING.md` entschieden, **und wurde als offene Frage an Tom
weitergegeben.**

---

## Umfang

| | |
|---|---|
| Mockups | **49 Dateien, 1.725 KB** |
| Specs | **120 Dateien, 1.046 KB** |
| Vorgaengerrepo | `referenz/lumeos-2026/` |
| SSOT-Berichte | `docs/ssot/` |

`[read]` **Kein Modul hat nur eine Mockup-Datei.** Nutrition hat drei,
Recovery fuenf, Coach acht.

---

## Je Modul


### admin

**Mockup — 1 Dateien, 54 KB:**

- `module-admin-v2.jsx` (54 KB)

**Spec — `docs/specs/Admin/`, 5 Dateien, 41 KB:**

- `13_MODULE_ADMIN.md`
- `INDEX.md`
- `SPEC-ADMIN-BACKEND-v1.md`
- `SPEC_01_UI_DESIGN.md`
- `admin-panel-spec.md`


### buddy

**Mockup — 4 Dateien, 110 KB:**

- `module-buddy-engines.jsx` (52 KB)
- `module-buddy.jsx` (25 KB)
- `module-buddy-knowledge.jsx` (19 KB)
- `module-buddy-voice.jsx` (13 KB)

**Spec — `docs/specs/BuddyandAICoach/`, 12 Dateien, 136 KB:**

- `INDEX.md`
- `SPEC_01_MODULE_CONTRACT.md`
- `SPEC_02_ENTITIES.md`
- `SPEC_03_USER_FLOWS.md`
- `SPEC_04_FEATURES.md`
- `SPEC_05_ENGINES.md`
- `SPEC_06_DATABASE_SCHEMA.md`
- `SPEC_07_API.md`
- `SPEC_08_IMPORT_PIPELINE.md`
- `SPEC_09_SCORING.md`
- `SPEC_10_COMPONENTS.md`
- `SPEC_11_UI_DESIGN.md`


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

- `INDEX.md`
- `SPEC_01_MODULE_CONTRACT.md`
- `SPEC_02_ENTITIES.md`
- `SPEC_03_USER_FLOWS.md`
- `SPEC_04_FEATURES.md`
- `SPEC_05_COACH_WORKFLOWS.md`
- `SPEC_06_DATABASE_SCHEMA.md`
- `SPEC_07_API.md`
- `SPEC_08_IMPORT_PIPELINE.md`
- `SPEC_09_SCORING.md`
- `SPEC_10_COMPONENTS.md`
- `SPEC_11_UI_DESIGN.md`


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

- `dashmod.md`


### goals

**Mockup — 3 Dateien, 136 KB:**

- `module-goals-pro.jsx` (51 KB)
- `module-goals.jsx` (50 KB)
- `module-goals-editor.jsx` (35 KB)

**Spec — `docs/specs/Goals/`, 10 Dateien, 65 KB:**

- `API.md`
- `COMPONENTS.md`
- `CONSOLIDATED_KNOWLEDGE.md`
- `DATABASE.md`
- `FEATURES.md`
- `OPEN_ITEMS.md`
- `PHASE_MODELS.md`
- `README.md`
- `SCORING.md`
- `STRATEGY.md`


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

- `INDEX.md`
- `SPEC_01_MODULE_CONTRACT.md`
- `SPEC_02_ENTITIES.md`
- `SPEC_03_USER_FLOWS.md`
- `SPEC_04_FEATURES.md`
- `SPEC_05_WALLET_ECONOMICS.md`
- `SPEC_06_DATABASE_SCHEMA.md`
- `SPEC_07_API.md`
- `SPEC_08_IMPORT_PIPELINE.md`
- `SPEC_09_SCORING.md`
- `SPEC_10_COMPONENTS.md`
- `SPEC_11_UI_DESIGN.md`


### medical

**Mockup — 4 Dateien, 176 KB:**

- `module-medical.jsx` (56 KB)
- `module-medical-v2.jsx` (53 KB)
- `module-medical-data.jsx` (34 KB)
- `module-medical-modals.jsx` (33 KB)

**Spec — `docs/specs/Medical/`, 11 Dateien, 100 KB:**

- `INDEX.md`
- `SPEC_01_MODULE_CONTRACT.md`
- `SPEC_02_ENTITIES.md`
- `SPEC_03_USER_FLOWS.md`
- `SPEC_04_FEATURES.md`
- `SPEC_05_BIOMARKER_CATALOG.md`
- `SPEC_06_DATABASE_SCHEMA.md`
- `SPEC_07_API.md`
- `SPEC_08_IMPORT_PIPELINE.md`
- `SPEC_09_SCORING.md`
- `SPEC_10_COMPONENTS.md`


### nutrition

**Mockup — 3 Dateien, 130 KB:**

- `module-nutrition-nutrients.jsx` (54 KB)
- `module-nutrition-spec.jsx` (39 KB)
- `module-nutrition.jsx` (36 KB)

**Spec — `docs/specs/Nutrition/`, 9 Dateien, 24 KB:**

- `00_decisions`
- `00_raw`
- `01_current_specs`
- `02_patches`
- `03_sql`
- `04_adrs`
- `05_reviews`
- `06_workorder_planning`
- `INDEX.md`


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

- `INDEX.md`
- `SPEC_01_MODULE_CONTRACT.md`
- `SPEC_02_ENTITIES.md`
- `SPEC_03_USER_FLOWS.md`
- `SPEC_04_FEATURES.md`
- `SPEC_05_METRICS_ALGORITHMS.md`
- `SPEC_06_DATABASE_SCHEMA.md`
- `SPEC_07_API.md`
- `SPEC_08_IMPORT_PIPELINE.md`
- `SPEC_09_SCORING.md`
- `SPEC_10_COMPONENTS.md`


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

- `INDEX.md`
- `Injection Planner · Spec Change Request.md`
- `SPEC_01_MODULE_CONTRACT.md`
- `SPEC_02_ENTITIES.md`
- `SPEC_03_USER_FLOWS.md`
- `SPEC_04_FEATURES.md`
- `SPEC_05_CATALOG_EVIDENCE.md`
- `SPEC_06_DATABASE_SCHEMA.md`
- `SPEC_07_API.md`
- `SPEC_08_IMPORT_PIPELINE.md`
- `SPEC_09_SCORING.md`
- `SPEC_10_COMPONENTS.md`


### training

**Mockup — 4 Dateien, 123 KB:**

- `module-training-spec.jsx` (42 KB)
- `module-training.jsx` (33 KB)
- `module-training-extras.jsx` (30 KB)
- `module-training-offline-hr.jsx` (17 KB)

**Spec — `docs/specs/Training/`, 11 Dateien, 147 KB:**

- `INDEX.md`
- `SPEC_01_MODULE_CONTRACT.md`
- `SPEC_02_ENTITIES.md`
- `SPEC_03_USER_FLOWS.md`
- `SPEC_04_FEATURES.md`
- `SPEC_05_EXERCISE_TAXONOMY.md`
- `SPEC_06_DATABASE_SCHEMA.md`
- `SPEC_07_API.md`
- `SPEC_08_IMPORT_PIPELINE.md`
- `SPEC_09_SCORING.md`
- `SPEC_10_COMPONENTS.md`


---

## Die Regel

`[cmd]` **Vor jedem Auftrag: hier nachsehen, dann lesen.**

**1. Alle Mockup-Dateien des Moduls** — nicht die erste.
**2. Die Spec** — pruefend. `[read]` A-20 zaehlt sieben inhaltliche
Fehler; **aber sie enthaelt auch Entscheidungen, die sonst neu getroffen
werden.**
**3. Das Vorgaengerrepo** — Struktur ja, Code nie. **Und nachsehen,
warum es ersetzt wurde.**
**4. `docs/ssot/`** — was schon gemessen ist.

`[read]` **Ein Auftrag, der eine dieser vier auslaesst, kostet den
Agenten einen halben Durchgang** — er misst dann, was der Orchestrator
haette lesen sollen.
