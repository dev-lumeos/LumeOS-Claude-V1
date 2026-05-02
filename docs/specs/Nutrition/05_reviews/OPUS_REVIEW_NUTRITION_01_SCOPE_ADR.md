# OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md

> Review 1 — V1 Scope, Phase-2-Abgrenzung, Modulgrenzen, ADR-Konsistenz, veraltete Annahmen
> Reviewer: Opus | Datum: 2026-05-02
> Scope: nur Nutrition Spec Pfad (`docs/specs/Nutrition/`)
> Gelesen: `NUTRITION_NEXT_SPEC_DECISIONS.md`, `INDEX.md`, `SPEC_01_MODULE_CONTRACT.md`, alle `ADR_*.md`

---

## Executive Verdict

**PASS_WITH_FIXES**

V1-Scope, Phase-2-Abgrenzung und Modulgrenzen sind im Entscheidungsdokument, in `INDEX.md` und in `SPEC_01_MODULE_CONTRACT.md` konsistent. MealCam ist überall V1, Barcode überall Phase 2, OpenFoodFacts und USDA sind aus V1 entfernt, BLS 4.0 ist einzige Master-Food-Datenquelle, Recipes/Meal Plans/Shopping Lists sind schema-only, Nutrition Preferences (inkl. Allergien, Unverträglichkeiten, Likes, Dislikes, religiös/kulturell) sind im Scope.

Es gibt jedoch zwei ADR/Spec-Stellen, die das Phase-2-Statement verwässern (Buddy als Recipe-/Meal-Plan-Quelle, Barcode-Flow für Custom Foods im Improvements-Paket) und einige V1/Phase-2-Markierungen, die in `SPEC_01` und `INDEX.md` schärfer formuliert werden sollten.

Keine Blocker. Keine schemabrechende Inkonsistenz. Keine widersprüchliche V1-Datenquelle.

---

## Critical Findings

Keine kritischen Findings. Keine Blocker für die Spec-Freigabe.

---

## Important Findings

### IMP-1 — `ADR_IMPROVEMENTS_PACKAGE.md` #19 widerspricht dem Phase-2-Status von Barcode

`ADR_IMPROVEMENTS_PACKAGE.md` enthält unter #19 einen vollständigen Barcode-Flow für Custom Foods inklusive Code-Snippet, Ablauf, UX-Beschreibung. Das Dokument ist in `INDEX.md` mit Status `archiv` markiert, das geht aus dem ADR-Inhalt selbst aber nicht hervor.

`NUTRITION_NEXT_SPEC_DECISIONS.md §1` und `§23` und `ADR_MEALCAM_V1.md` sagen klar: Barcode ist Phase 2. Damit darf in V1 weder ein Barcode-Flow definiert noch ein Custom-Food-Barcode-Lookup spezifiziert werden.

`ADR_CUSTOM_FOODS_V1.md` macht das richtig: Es nennt `barcode` als optionales Feld "(für zukünftigen Barcode-Lookup Phase 2)" — also Schema-only.

`ADR_IMPROVEMENTS_PACKAGE.md` #19 dagegen beschreibt eine V1-Implementierung. Auch wenn der ADR insgesamt als `archiv` gilt, fehlt diese Klarstellung im Dokumenttext.

**Empfehlung:** Im ADR-Header explizit `Status: superseded — siehe ADR_MEALCAM_V1.md (Barcode Phase 2)` ergänzen, oder #19 herauslösen und als Phase-2-Notiz in einen separaten Phase-2-Tracker verschieben.

### IMP-2 — `ADR_RECIPE_SOURCE_BUDDY.md` und `SPEC_01_MODULE_CONTRACT.md §5` erlauben Buddy als Recipe-/Meal-Plan-Quelle, obwohl Buddy MealPlan Builder Phase 2 ist

`NUTRITION_NEXT_SPEC_DECISIONS.md §1 (Phase 2)` und `§23` listen "Buddy MealPlan Builder" eindeutig als Phase 2.

`ADR_RECIPE_SOURCE_BUDDY.md` erweitert `Recipe.source` um `buddy` und beschreibt Buddy als aktiven Rezept-Ersteller. `SPEC_01 §5` (Schreib-Rechte) und `§9` (Rezepte — Universelles Format) und `§8` (Meal Plan — Universelles Format) listen `buddy` als Quelle ohne Phase-2-Markierung.

Wenn Rezepte und Meal Plans in V1 nur schema-only sind (`ADR_RECIPES_SCHEMA_ONLY.md`), ist der `source = 'buddy'`-Wert in V1 nur Schema-Vorbereitung. Das ist nicht falsch, aber `ADR_RECIPE_SOURCE_BUDDY.md` verkauft es als aktiv ("Buddy muss Rezepte erstellen können") — das ist Phase 2.

**Empfehlung:** In `ADR_RECIPE_SOURCE_BUDDY.md` und `SPEC_01 §5`/`§8`/`§9` ergänzen: "`source = 'buddy'` ist V1 Schema-only. Aktive Buddy-Recipe-Erzeugung = Phase 2."

### IMP-3 — `INDEX.md` listet Barcode- und MealPlan-Patches als aktive Pass-1/Pass-2-Erweiterungen, ohne Phase-2-Markierung

`INDEX.md` führt:
- `SPEC_07_PATCH_APRIL2026.md` → "Patches: Top-Foods, Quick-Add, Barcode, Water food_ml"
- `SPEC_10_PATCH_APRIL2026.md` → "Patches: QuickMacroEntry, BarcodeScanner, nutrientDetails Refactor"

Beide Patches enthalten "Barcode" / "BarcodeScanner" als Stichwort. Der INDEX-Leser bekommt damit nicht direkt mit, dass diese Barcode-Patches in V1 nicht aktiv werden. Die `ADR_IMPROVEMENTS_PACKAGE.md`-Verbindung ist nur über Querlesen erkennbar.

**Empfehlung:** In `INDEX.md` Zeilen für `SPEC_07_PATCH_APRIL2026.md` und `SPEC_10_PATCH_APRIL2026.md` markieren mit "(Barcode-Anteile: Phase 2 — siehe ADR_MEALCAM_V1)" oder Barcode-Patches in eigene Phase-2-Sektion verschieben.

### IMP-4 — `SPEC_01_MODULE_CONTRACT.md §6 V1 Schema-Only` listet Recipes/Meal Plans/Shopping Lists ohne expliziten "wenn Zeit knapp → Phase 2"-Eskalationspfad

`NUTRITION_NEXT_SPEC_DECISIONS.md §15` enthält den klaren Satz: "Wenn Zeit knapp wird, werden Recipes, Meal Plans und Shopping Lists vollständig auf Phase 2 verschoben."

`ADR_RECIPES_SCHEMA_ONLY.md` enthält das ebenfalls. `SPEC_01 §6` listet diese drei Bereiche unter "V1 Schema-Only", erwähnt aber den Eskalationspfad "→ Phase 2 wenn Zeit knapp" nicht. `INDEX.md` erwähnt es teilweise.

**Empfehlung:** In `SPEC_01 §6` einen Satz ergänzen: "Wenn Zeit knapp: vollständig auf Phase 2 (siehe `ADR_RECIPES_SCHEMA_ONLY.md`)."

---

## Minor Findings

### MIN-1 — `ADR_IMPROVEMENTS_PACKAGE.md` Status nur in `INDEX.md` als `archiv` markiert, nicht im ADR-Header

`INDEX.md` markiert `ADR_IMPROVEMENTS_PACKAGE.md` als `archiv`. Der ADR-Header selbst enthält kein `Status:`-Feld. Andere ADRs haben konsistent `Status: Final`. Wer das ADR direkt öffnet, sieht den `archiv`-Status nicht.

**Empfehlung:** Header in `ADR_IMPROVEMENTS_PACKAGE.md` ergänzen: `**Status:** Archiviert — Inhalte teilweise in V1 übernommen, teilweise Phase 2 (siehe ADR_MEALCAM_V1.md, ADR_BLS_ONLY.md)`.

### MIN-2 — `SPEC_01 §10 MealCam V1` referenziert "Vision-Provider TBD" — passt zu `INDEX.md` Open Item #1, aber V1-Implementierung ohne Provider nicht baubar

Bekanntes offenes Punkt aus `INDEX.md` ("MealCam Vision-Provider entscheiden — Vor Implementierung 🔴"). Konsistent dokumentiert. Kein Widerspruch, aber als Risiko für V1-Pflicht festzuhalten.

**Empfehlung:** Keine Spec-Änderung nötig. In Workorder-Generierung als Vorbedingung erfassen.

### MIN-3 — `nutrient_reference_values` Seed-Daten als Open Item — kein Spec-Widerspruch, aber V1-Pflicht

`INDEX.md` Open Item #2 "🔴 Vor Implementierung". Konsistent. Kein Widerspruch zu Specs. Auch nur ein Hinweis — keine Aktion in dieser Review.

### MIN-4 — `ADR_GHOST_ENTRY_RECIPE.md` beschreibt detaillierten Recipe-Logging-Flow, ohne V1-Status-Hinweis

`ADR_GHOST_ENTRY_RECIPE.md` definiert ein vollständiges UI-Verhalten und Logging-Logik für Recipe-basierte Meal Plan Items. Bei `Recipes/Meal Plans schema-only V1` ist dieser Flow tatsächlich erst aktiv, wenn Recipes/Meal Plans über Schema hinausgehen — also Phase 2 oder V1-nice-to-have.

**Empfehlung:** Kopfzeile ergänzen: "Status: Final — aktiv ab V1-nice-to-have / Phase 2, V1 nur Schema."

### MIN-5 — `SPEC_01 §13 API-Übersicht` listet `recipes/`, `meal-plans/`, `mealcam/` ohne V1/Phase-2-Markierung pro Endpoint

Klein, aber den Leser könnte annehmen, alle Endpoints sind V1-Pflicht. `meal-plans/` und `recipes/` sind in V1 nur optional.

**Empfehlung:** In `SPEC_01 §13` neben `recipes/` und `meal-plans/` jeweils "(V1 schema-only / API Phase 2 wenn Zeit knapp)" ergänzen.

### MIN-6 — Begriff "Pass 1" und "Pass 2" in `INDEX.md` ohne Erklärung

`INDEX.md` führt SPECs/PATCHes mit Suffix `PASS2` / `PATCH_APRIL2026`. Der Sinn der Pass-Nummerierung wird im Entscheidungsdokument nicht erklärt. Kein V1/Phase-2-Widerspruch, aber für Reviewer schwer auflösbar.

**Empfehlung:** Optional einen Header-Block in `INDEX.md` ergänzen, der erklärt, wie Pass-1- und Pass-2-Patches integriert wurden.

### MIN-7 — Begriff "Buddy MealPlan Builder" einmal mit, einmal ohne Phase-2-Marker

`NUTRITION_NEXT_SPEC_DECISIONS.md §1` listet "Buddy MealPlan Builder" als Phase 2.
`SPEC_01 §6 Phase 2` listet "Buddy MealPlan Builder" → konsistent.
`ADR_RECIPE_SOURCE_BUDDY.md` lässt es weg — siehe IMP-2.

Kein neuer Punkt — gehört zu IMP-2.

### MIN-8 — `INDEX.md Konsistenzprüfung` enthält Eintrag "ADRs widersprechen Specs nicht ✅"

Diese Aussage ist nach diesem Review nicht mehr ganz haltbar (siehe IMP-1 und IMP-2). Sollte nach Fixes neu überprüft werden.

---

## File-by-File Findings

| Datei | Finding | Severity | Empfohlene Aktion |
|---|---|---|---|
| `NUTRITION_NEXT_SPEC_DECISIONS.md` | konsistent, deckt alle 7 Scope-Fragen ab | OK | keine Änderung |
| `INDEX.md` | Barcode-Patches in `SPEC_07_PATCH_APRIL2026.md` / `SPEC_10_PATCH_APRIL2026.md` ohne Phase-2-Marker (IMP-3) | Important | Phase-2-Hinweis in Patch-Zeilen ergänzen |
| `INDEX.md` | "ADRs widersprechen Specs nicht ✅" stimmt nach diesem Review nicht mehr (MIN-8) | Minor | nach Fixes erneut prüfen |
| `INDEX.md` | Pass-1/Pass-2 Begriff nicht erklärt (MIN-6) | Minor | optional Header-Block |
| `SPEC_01_MODULE_CONTRACT.md` | §5 "Buddy darf MealPlan + Rezepte schreiben" ohne Phase-2-Marker (IMP-2) | Important | "(Phase 2 — siehe Decisions §1)" ergänzen |
| `SPEC_01_MODULE_CONTRACT.md` | §6 V1 Schema-Only ohne Eskalationspfad "→ Phase 2 wenn Zeit knapp" (IMP-4) | Important | Satz ergänzen |
| `SPEC_01_MODULE_CONTRACT.md` | §13 API-Übersicht — `recipes/`, `meal-plans/` ohne V1/Phase-2-Marker (MIN-5) | Minor | Marker ergänzen |
| `SPEC_01_MODULE_CONTRACT.md` | §10 MealCam Vision-Provider TBD — bekanntes Open Item (MIN-2) | Minor | keine Spec-Änderung |
| `ADR_BLS_ONLY.md` | konsistent | OK | keine Änderung |
| `ADR_MEALCAM_V1.md` | konsistent | OK | keine Änderung |
| `ADR_SUPPLEMENTS_API_BOUNDARY.md` | konsistent, klare Modulgrenze | OK | keine Änderung |
| `ADR_NUTRITION_PREFERENCES_V1.md` | konsistent, deckt Allergien/Unverträglichkeiten/Likes/Dislikes/religiös/kulturell ab | OK | keine Änderung |
| `ADR_RECIPES_SCHEMA_ONLY.md` | konsistent | OK | keine Änderung |
| `ADR_MEALCAM_CONSENT.md` | konsistent | OK | keine Änderung |
| `ADR_COACH_PERMISSIONS_V1.md` | konsistent, deckt 9 Permission-Bereiche und Suggestions ab | OK | keine Änderung |
| `ADR_CUSTOM_FOODS_V1.md` | konsistent, `openfoodfacts` aus `source` entfernt | OK | keine Änderung |
| `ADR_GHOST_ENTRY_RECIPE.md` | aktiv-anmutender Flow ohne V1/Phase-2-Status-Hinweis (MIN-4) | Minor | Status-Hinweis im Header |
| `ADR_RECIPE_SOURCE_BUDDY.md` | Konflikt mit Phase-2-Status "Buddy MealPlan Builder" (IMP-2) | Important | Phase-2-Klarstellung |
| `ADR_WATER_TOTAL_HYDRATION.md` | konsistent (Hydration = geloggt + Nahrung; Water Target → Goals) | OK | keine Änderung |
| `ADR_IMPROVEMENTS_PACKAGE.md` | #19 Barcode-Flow für Custom Foods widerspricht Phase-2 (IMP-1); Status `archiv` nur in INDEX (MIN-1) | Important | Header-Status ergänzen, #19 Phase-2-markieren oder herauslösen |

---

## Antworten auf die Review-Fragen

| # | Frage | Antwort | Belegt in |
|---|---|---|---|
| 1 | Ist MealCam überall V1? | **Ja**, konsistent. | DECISIONS §1, §18, §19; INDEX V1 Pflicht; SPEC_01 §6, §10; ADR_MEALCAM_V1; ADR_MEALCAM_CONSENT |
| 2 | Ist Barcode überall Phase 2? | **Mehrheitlich ja, aber zwei Stellen verwässern** (siehe IMP-1, IMP-3). | DECISIONS §1, §23; SPEC_01 §5, §6; ADR_MEALCAM_V1; ADR_CUSTOM_FOODS_V1 (barcode field als Phase-2-Vorbereitung); ABER ADR_IMPROVEMENTS_PACKAGE #19 und INDEX-Patch-Zeilen |
| 3 | Sind OpenFoodFacts und USDA vollständig aus V1 entfernt? | **Ja**, vollständig. | DECISIONS §2, §17, §23; SPEC_01 §5, §14; ADR_BLS_ONLY; ADR_CUSTOM_FOODS_V1 (openfoodfacts aus source-Werten entfernt) |
| 4 | Ist BLS 4.0 einzige Master-Food-Datenquelle? | **Ja**. | DECISIONS §2; SPEC_01 §2 ("BLS-only"-Prinzip), §5 (Datenquellen V1 endgültig), §6, §14; ADR_BLS_ONLY |
| 5 | Sind Recipes, Meal Plans und Shopping Lists nur schema-only oder Phase 2? | **Ja, mit kleineren Lücken** (SPEC_01 §6 ohne Eskalationspfad, ADRs ohne Status-Hinweis). | DECISIONS §1, §15, §17, §23; INDEX V1 nice-to-have / Phase 2; SPEC_01 §5, §6; ADR_RECIPES_SCHEMA_ONLY |
| 6 | Sind Supplements, Goals, Coach, Marketplace und Buddy sauber abgegrenzt? | **Supplements/Goals/Coach/Marketplace sauber. Buddy uneindeutig** (IMP-2). | DECISIONS §20, §21, §23; SPEC_01 §3, §5; ADR_SUPPLEMENTS_API_BOUNDARY; ADR_COACH_PERMISSIONS_V1; ABER ADR_RECIPE_SOURCE_BUDDY ohne Phase-2-Marker |
| 7 | Sind Nutrition Preferences, Allergien, Unverträglichkeiten, Likes/Dislikes im Scope? | **Ja**, vollständig (inkl. religiös/kulturell). | DECISIONS §1, §6; SPEC_01 §6, §12; ADR_NUTRITION_PREFERENCES_V1 |
| 8 | Widersprechen ADRs dem Entscheidungsdokument? | **Zwei Stellen** (IMP-1, IMP-2). Sonst konsistent. | siehe oben |
| 9 | Gibt es alte Aussagen, die entfernt werden müssen? | **Ja, zwei** (IMP-1 #19 Barcode-Flow; IMP-2 Buddy als Recipe-Quelle aktiv). | siehe oben |

---

## Recommended Fixes For Sonnet

Konkrete kurze Fix-Anweisungen, die Sonnet ohne weitere Klärung umsetzen kann. **Keine Code-Änderungen** — nur Spec-Files.

### FIX-1 — `ADR_IMPROVEMENTS_PACKAGE.md`: Status klarstellen + #19 als Phase 2 markieren

In `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\ADR_IMPROVEMENTS_PACKAGE.md`:

- Header ergänzen direkt nach Titel:
  ```
  **Status:** Archiviert (Pass-1-Inputs)
  **Hinweis:** Inhalte teilweise in V1 übernommen, teilweise Phase 2.
  Konkret: Punkt #19 (Barcode für Custom Foods) ist Phase 2 — siehe `ADR_MEALCAM_V1.md`.
  ```
- In #19 (Barcode-Abschnitt) einen Banner an den Anfang des Abschnitts setzen:
  ```
  > **Phase 2** — Barcode Scanner ist nicht V1.
  > Verbindlich: `ADR_MEALCAM_V1.md` und `NUTRITION_NEXT_SPEC_DECISIONS.md §1`.
  ```

### FIX-2 — `ADR_RECIPE_SOURCE_BUDDY.md`: Phase-2-Klarstellung

In `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\ADR_RECIPE_SOURCE_BUDDY.md`:

- Im Abschnitt "Entscheidung" ergänzen:
  ```
  **V1-Status:** `source = 'buddy'` wird in V1 nur als Schema-Wert vorbereitet.
  Aktive Buddy-Recipe-Erzeugung ist Phase 2 (siehe `NUTRITION_NEXT_SPEC_DECISIONS.md §1` "Buddy MealPlan Builder").
  ```

### FIX-3 — `SPEC_01_MODULE_CONTRACT.md` §5 Schreib-Rechte: Buddy-Zeile mit Phase-2-Marker

In `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\SPEC_01_MODULE_CONTRACT.md` Abschnitt 5, Tabelle "Schreib-Rechte anderer Module in Nutrition", Zeile Buddy ändern zu:
```
| Buddy | MealPlan + Rezepte auf explizite User-Anweisung | **Phase 2** — V1 nur Schema (`source` Enum-Wert vorbereitet) |
```

### FIX-4 — `SPEC_01_MODULE_CONTRACT.md` §6 V1 Schema-Only: Eskalationspfad ergänzen

In `SPEC_01_MODULE_CONTRACT.md` Abschnitt 6, unter dem Block "V1 Schema-Only" am Ende ergänzen:
```
**Eskalationspfad:** Wenn V1-Zeitbudget knapp wird, werden Recipes, Meal Plans und Shopping Lists vollständig auf Phase 2 verschoben (siehe `ADR_RECIPES_SCHEMA_ONLY.md` und `NUTRITION_NEXT_SPEC_DECISIONS.md §15`).
```

### FIX-5 — `SPEC_01_MODULE_CONTRACT.md` §13 API-Übersicht: V1/Phase-2-Marker pro Endpoint

In `SPEC_01_MODULE_CONTRACT.md` Abschnitt 13 für die Zeilen `recipes/` und `meal-plans/` jeweils Kommentar erweitern:
```
recipes/            Rezepte + Einkaufslisten (V1 schema-only — Read/Write API: Phase 2 wenn Zeit knapp)
meal-plans/         Meal Plans (V1 schema-only — Read/Write API: Phase 2 wenn Zeit knapp)
```

### FIX-6 — `INDEX.md` Patch-Zeilen Phase-2-Marker

In `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\INDEX.md`:

- Zeile `SPEC_07_PATCH_APRIL2026.md` ändern zu:
  `| 07+ | SPEC_07_PATCH_APRIL2026.md | Patches: Top-Foods, Quick-Add, Water food_ml. Barcode-Anteil = Phase 2 |`
- Zeile `SPEC_10_PATCH_APRIL2026.md` ändern zu:
  `| 10+ | SPEC_10_PATCH_APRIL2026.md | Patches: QuickMacroEntry, nutrientDetails Refactor. BarcodeScanner = Phase 2 |`

### FIX-7 — `ADR_GHOST_ENTRY_RECIPE.md` Status-Hinweis

In `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\ADR_GHOST_ENTRY_RECIPE.md` Header ergänzen:
```
**V1-Status:** Aktiv ab V1-nice-to-have (Recipe-Logging) — V1 hat nur Schema vorbereitet.
Wenn V1 Recipes/Meal Plans nicht über Schema hinausgehen, gilt dieser ADR ab Phase 2.
```

### FIX-8 — `INDEX.md` Konsistenzprüfung neu auswerten

Nach Anwendung von FIX-1 bis FIX-7 in `INDEX.md` "Konsistenzprüfung (Pass 2 Stand)" die Zeile "ADRs widersprechen Specs nicht ✅" prüfen und ggf. mit Datum versehen:
```
| ADRs widersprechen Specs nicht | ✅ Stand 2026-05-02 (nach OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md Fixes) |
```

---

## Out-of-Scope-Hinweis

Folgende Dateien aus dem Nutrition Spec Pfad wurden für diesen Review **bewusst nicht gelesen**, weil sie außerhalb des Review-Scopes liegen:

- `SPEC_02_*.md`, `SPEC_03_*.md`, `SPEC_04_FEATURES.md`, `SPEC_05_FOOD_TAXONOMY.md`, `SPEC_06_*.md`, `SPEC_06_V1_MIGRATION.sql`, `SPEC_07_*.md`, `SPEC_08_IMPORT_PIPELINE.md`, `SPEC_09_*.md`, `SPEC_10_*.md`, `NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md`

Diese Specs könnten weitere Inkonsistenzen enthalten (z. B. ob die Barcode-Patches in `SPEC_07_PATCH_APRIL2026.md` und `SPEC_10_PATCH_APRIL2026.md` tatsächlich Phase-2-Inhalte sind oder fälschlich als V1 dokumentiert sind). Das ist nicht belegt im Rahmen dieses Reviews und sollte in nachfolgenden Reviews (Review 2, 3, …) geprüft werden.

Ebenfalls nicht geprüft (Scope-Ausschluss): `docs/BrainstormDocs/Nutrition/new/spec`, andere Modul-Specs, `system/**`, `apps/**`, `packages/**`, `supabase/**`, `tools/**`.

---

*Ende OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md*
