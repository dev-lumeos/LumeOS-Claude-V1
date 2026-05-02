# OPUS_REVIEW_NUTRITION_V1_FINAL.md

> Final-Konsolidierung der drei Opus-Reviews für Nutrition V1
> Reviewer: Opus | Datum: 2026-05-02
> Quellen: `OPUS_REVIEW_NUTRITION_01_SCOPE_ADR.md`, `OPUS_REVIEW_NUTRITION_02_DATA_API.md`, `OPUS_REVIEW_NUTRITION_03_UI_FLOWS_READINESS.md`, `INDEX.md`, `NUTRITION_NEXT_SPEC_DECISIONS.md`
> Annahme (vom Auftraggeber bestätigt):
>  - Review-1-Fixes umgesetzt
>  - Review-2 Critical Findings umgesetzt
>  - Review-3 Critical + Important Findings umgesetzt
>  - Allgemein offen bleiben nur die zwei externen Research-Punkte (MealCam Vision-Provider, `nutrient_reference_values` Seed-Werte)

---

## Final Executive Verdict

**PASS_WITH_FIXES**

Die Nutrition V1 Specs sind insgesamt **bereit für Micro-Workorder-Erstellung in 14 von 16 Bereichen**. Die noch offenen Research-Punkte blockieren nur zwei eng umgrenzte Bereiche — MealCam und Micronutrient Review Scoring. Alle anderen Bereiche können sofort in Workorders überführt werden.

Der Verdict ist nicht `PASS`, weil die zwei externen Open Items echte Voraussetzungen sind, ohne die zwei V1-Pflicht-Bereiche unvollständig spezifiziert sind. Sobald beide entschieden sind, ist `PASS` für den gesamten V1-Scope erreichbar.

---

## Final Status Summary

| Review | Verdict (vor Fixes) | Fixes umgesetzt | Status nach Fixes |
|---|---|---|---|
| Review 1 — V1 Scope, Phase-2-Abgrenzung, Modulgrenzen, ADR-Konsistenz | PASS_WITH_FIXES — keine Critical, 4 Important + 8 Minor | ja, alle | clean |
| Review 2 — Entities, Datenmodell, Schema, SQL-Patch, API-Konsistenz | PASS_WITH_FIXES — 4 Critical + 9 Important + 8 Minor | Critical alle, gemäß Auftrag | restliche Important/Minor laut Annahme ebenfalls bereinigt |
| Review 3 — User Flows, Features, Tags, UI, Onboarding, MealCam UX, Coach UX, Workorder Readiness | PASS_WITH_FIXES — 3 Critical + 7 Important + 9 Minor | Critical + Important umgesetzt | restliche Minor laut Annahme bereinigt |

Insgesamt durchlaufen die Specs zwei Pässe (Pass 1, Pass 2) plus drei Review-Wellen plus jeweils einen Fix-Pass pro Review. Strukturell-konsistente Datei-Hierarchie:

- `NUTRITION_NEXT_SPEC_DECISIONS.md` als verbindliche Quelle
- `INDEX.md` als Navigations-Übersicht
- `SPEC_01..SPEC_10` (Master) + `SPEC_*_PASS2_PATCH.md`/`SPEC_*_PATCH_APRIL2026.md` (Pass 1/2 Patches)
- `SPEC_06_RECALCULATE_PATCH.md` schließt CRIT-4 aus Review 2
- 12 ADRs mit Final-Status

---

## Remaining Blockers

Zwei externe Open Items, die nicht alle Workorders blockieren — aber zwei spezifische Bereiche:

### BLOCK-1 — MealCam Vision-Provider final entscheiden

- **Quelle:** `INDEX.md` Open Item #1 (🔴 Vor Implementierung), `SPEC_01 §10`, `ADR_MEALCAM_V1.md`
- **Status:** Spec ist Provider-agnostisch ausgelegt, V1-Flow vollständig (5 Schritte: scan → status → correct → confirm → consent)
- **Blockiert:** MealCam-Provider-Integration (HTTP-Client, Auth, Image-Encoding, Polling/Async-Logic). Backend-Service `mealcam` benötigt konkrete Provider-API.
- **Nicht blockiert:** Schema (`mealcam_scans` existiert), API-Verträge, UI-Components (`MealCamButton`, `MealCamModal`, `MealCamResults`, `MealCamConsentBanner` etc. sind providerunabhängig spezifiziert)
- **Erforderliche Aktion:** Tom entscheidet Provider (z. B. Anthropic Vision, OpenAI Vision, eigenes Modell). Danach wird ein dünner Provider-Adapter-WO geschrieben.

### BLOCK-2 — `nutrient_reference_values` Seed-Werte aus geprüften Quellen befüllen

- **Quelle:** `INDEX.md` Open Item #2 (🔴 Vor Implementierung), `NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md`
- **Status:** Tabelle und Schema existieren (`nutrient_reference_values` mit RDA/AI/UL-Spalten + Quellen-Attribution). Pflichtregeln dokumentiert (kein UL=0, Source mandatory, kein Wert ohne Beleg).
- **Blockiert:** Micronutrient-Review-Scoring (UL-Logik, deficit/surplus-Klassifikation, Ampelstatus). Ohne Seed-Werte keine vergleichende Bewertung möglich.
- **Nicht blockiert:** Schema, API-Endpoint `GET /api/nutrition/nutrients/reference-values`, UI-Components (`MicroDashboard`, `MicroNutrientCard`, `ULWarningBar`) — alle providerunabhängig.
- **Erforderliche Aktion:** Quelltabellen beschaffen (DACH 2020, EFSA DRV, ggf. IOM). Werte für Priorität-1-Nährstoffe (24 Codes) für Erwachsene 18–50 (m/w) extrahieren. Als geprüfte SQL-Datei `NUTRIENT_REFERENCE_VALUES_SEED_DATA.sql` ablegen. Medizinische Review empfohlen vor Produktionseinsatz.

---

## Remaining Non-Blocking Open Points

Diese Punkte sind nicht blockierend, aber sollten beim WO-Schreiben mit klarer Entscheidung pro WO mitgeführt werden:

| # | Thema | Quelle | Empfohlene WO-Behandlung |
|---|---|---|---|
| 1 | `meal_items.data_source` redundant zu `food_source` | Review 2 IMP-1 / FIX-5 | WO entfernt `data_source` (cleanup) oder dokumentiert Doppelnutzung |
| 2 | RDA-Werte in `nutrient_defs.rda_*` ohne Source-Attribution | Review 2 IMP-5 / FIX-11 | WO setzt `nutrient_reference_values` als Single-Source-of-Truth (Convenience-Spalten bleiben für Reads) |
| 3 | `Recipes/Shopping/MealPlans` Schema-only-Status durchgängig markieren | Review 1 IMP-2/IMP-4, Review 3 IMP-4 | WO setzt V1-Marker konsistent über alle Specs (sollte nach Annahme bereits durchgeführt sein — Spot-Check bei WO-Generierung) |
| 4 | Buddy/Marketplace UI Source-Badges ohne entsprechende V1-Erzeugung | Review 3 MIN-9 | WO-Frontend-Listing zeigt Badge auch wenn Erzeugung Phase 2 — UX-Hinweis dokumentieren |
| 5 | i18n TH-Texte initial leer | Decisions §16 | Pflege-WO Phase 2 |
| 6 | `data/nutrientDetails.ts food_sources[]` deprecated zugunsten API-Endpoint | Review 3 MIN-8 / Review 1 (#20) | WO ersetzt statisches Array durch API-Hook |
| 7 | Recalculate-UI Trigger-Bedingung ("Food-Daten neuer als Snapshot") | Review 3 IMP-1 / FIX-4 | WO definiert Detection-Logik (Vergleich `meal_items.snapshot_version` vs. `food_data_version` — Versionierung global oder pro Food?) |
| 8 | `level_multiplier` (`user_level`) Quelle außerhalb Nutrition (User-Profil/Goals) | Review 3 IMP-6 / FIX-9 | WO nutzt Default `intermediate` wenn nicht verfügbar; Cross-Modul-Klärung Phase 2 |

---

## Workorder Readiness Matrix

| Bereich | Ready? | Voraussetzung | Kommentar |
|---|---|---|---|
| BLS Import | ✅ Ja | — | Pipeline (`SPEC_08`), Mapping, Warn-/Error-Reports, Review Queue spezifiziert. Auto-Tagging-Trigger auf 16 V1-Tags reduziert (nach Review 3 FIX-2). |
| Food Search | ✅ Ja | — | BLS+Custom Foods, Tag-Filter, Smart-Search-Boost via Preferences, pg_trgm Index. Search-Response-Schema konsistent (Review 2 IMP-6 fix). |
| Custom Foods | ✅ Ja | — | CRUD, EU-14 Allergen-Selektor (`custom_allergens TEXT[]`), `source` enum bereinigt. Barcode aus V1-Flow entfernt. |
| Tags | ✅ Ja | — | 16 V1-Filter-Tags (`Decisions §5`) sind verbindlich; weitere Tags aus SPEC_05 als Phase-2-Erweiterung markiert (Review 3 FIX-2). Auto-Tagging-Trigger entsprechend angepasst. |
| Preferences / Onboarding | ✅ Ja | — | Onboarding-Flow als Flow 0 ergänzt (Review 3 FIX-3). 4-Step Wizard. `food_preference_items.target_type` CHECK auf `cuisine` erweitert (Review 2 CRIT-3). |
| Diary / Meal Items | ✅ Ja | — | `food_source` enum auf `('bls','custom','mealcam','manual')` erweitert. `meal_items.portion_name` vorhanden. Quick-Add Makros (`QuickMacroEntry`) ergänzt. |
| Snapshots / Recalculate | ✅ Ja | — | API-Endpoints `POST /meal-items/:id/recalculate` + `POST /meals/:id/recalculate` definiert (`SPEC_06_RECALCULATE_PATCH`). UI (`MealItemRecalculateButton`, `-Modal`, `MealRecalculateAllButton`) + Flow 15 ergänzt. `snapshot_history JSONB` schreibt Audit. |
| Portions | ✅ Ja | — | `food_portions` Tabelle, `user_recent_portions`, RLS-Fix (BLS-Portionen read-only für User), Routing-Reihenfolge `/foods/:id/portions` vor `/foods/:id` korrigiert. |
| Water Logs | ✅ Ja | — | `water_logs`, Quick-Add, Total-Hydration (logged + food_ml). Goals liefert Target. |
| Nutrition Targets | ✅ Ja | — | `nutrition_targets` als Cache, daily fetch von Goals. Fallback bei Goals-Down dokumentiert. |
| Micronutrient Review | ❌ Wartet | BLOCK-2 | UI/API/Schema bereit. Scoring-Logik (UL/RDA/AI/Ampel) implementierbar, sobald Seed-Werte vorliegen. WO darf Mock-Werte für Tests nutzen, aber Produktiv-Seed Pflicht vor Release. |
| Supplements API Integration | ✅ Ja | — | Nur Konsument-Code (`GET http://supplements:5200/api/supplements/daily-intake`). Fallback-Verhalten (`supplement_data_available: false`) dokumentiert. Keine lokale Supplement-Tabellen. |
| MealCam | ❌ Wartet | BLOCK-1 | Schema (`mealcam_scans`), 5-Schritt-Flow (`SPEC_07_PASS2 §4`), UI-Components, Confidence-Mapping (high/suggest/low), Consent-Settings (FIX-5) alle bereit. Provider-Adapter-WO blockiert. |
| Coach Permissions | ✅ Ja | — | `CoachPermissionsPanel` mit 9 Toggles, Settings-Flow 18 (Review 3 FIX-15). Permission-Tabelle liegt im Auth-Modul (cross-module, V1-Auth-Modul vorausgesetzt). |
| Coach Suggestions | ✅ Ja | — | `coach_nutrition_suggestions` Tabelle existiert (Review 2 CRIT-1 fix). 9 Suggestion-Typen + Per-Type-Akzeptanz-Wirkung dokumentiert (Review 3 FIX-6 / Flow 17). |
| Recipes / Meal Plans / Shopping Lists schema-only | ✅ Ja | — | Schema-only-Marker durchgängig in SPEC_07, SPEC_10, SPEC_03 gesetzt. `Recipe.source` mit `buddy` ergänzt (V1 schema-only). 501-Response für Phase-2-Endpoints definiert. |
| Thai/i18n preparation | ✅ Ja | — | `name_th` Felder in allen relevanten Tabellen. UI: TH disabled, "Coming soon"-Tooltip. Fallback `name_th = NULL` → `name_de`. 400+ Keys mit TH-Initial-leer akzeptabel. |

**Zusammenfassung:**

| Status | Bereich-Anzahl | Bereiche |
|---|---|---|
| ✅ Ready | 14 | BLS Import, Food Search, Custom Foods, Tags, Preferences/Onboarding, Diary/Meal Items, Snapshots/Recalculate, Portions, Water Logs, Targets, Supplements API, Coach Permissions, Coach Suggestions, Recipes/MealPlans/Shopping schema-only, Thai/i18n |
| ❌ Wartet | 2 | Micronutrient Review (auf Seed-Werte), MealCam (auf Vision-Provider) |

---

## Can Start Workorders Now

Folgende Bereiche sind **sofort startbar** ohne weitere Research/Klärung:

**Priorität A (Foundation — keine Cross-Modul-Abhängigkeiten):**
- BLS Import Pipeline
- Schema-Migration (alle V1-Tabellen inklusive Pass-2-Erweiterungen)
- `nutrient_defs` Seed (138 BLS-Codes — separat vom `nutrient_reference_values`-Seed)
- `tag_definitions` Seed (16 V1-Tags + Auto-Tagging-Trigger)
- Food Search (BLS + Custom Foods)
- Custom Foods CRUD

**Priorität B (Core Diary):**
- Diary / Meal Logging (Meals + Items + Snapshots)
- Quick-Add Makros (`QuickMacroEntry`)
- Portions (`food_portions` + `user_recent_portions`)
- Recalculate (`POST /meal-items/:id/recalculate` + UI)
- Water Logs + Total Hydration

**Priorität C (User Onboarding + Settings):**
- Nutrition Targets (Cache von Goals)
- Nutrition Preferences (Onboarding 4-Step + Settings)
- Coach Permissions Settings

**Priorität D (Coach):**
- Coach Suggestions API + UI (alle 9 Typen, akzeptiert Per-Type-Logik)

**Priorität E (Schema-only):**
- Recipes Schema (Tabellen + 501-Endpoints)
- Meal Plans Schema (Tabellen + 501-Endpoints)
- Shopping Lists Schema (Tabellen + 501-Endpoints)

**Priorität F (i18n + Cross-Cutting):**
- i18n Setup (DE/EN aktiv, TH disabled, 400+ Keys)
- Supplements-API-Konsument (`GET /supplements/daily-intake` mit Fallback)

---

## Must Wait

**Wartet auf BLOCK-1 (MealCam Vision-Provider):**
- MealCam Provider-Adapter (HTTP-Client, Image-Encoding, Polling)
- MealCam Service-Integration in `mealcam`-Endpoint
- MealCam End-to-End-Tests mit echtem Provider

**Wartet nicht auf BLOCK-1, aber sollte logisch nach Provider-Entscheidung kommen:**
- MealCam UI-WOs (Components sind providerunabhängig spezifiziert, könnten parallel laufen mit Mock-Provider)

**Wartet auf BLOCK-2 (`nutrient_reference_values` Seed):**
- Micronutrient-Review Scoring (UL-Logik, deficit/surplus-Klassifikation, Ampelstatus)
- `calcMicroFlagsEnhanced` Pure Function in `packages/scoring`
- Daily-Aggregat Mikronährstoff-Vergleich gegen Reference-Values
- Medizinische Review-Freigabe vor Produktion

**Wartet nicht auf BLOCK-2:**
- `nutrient_reference_values` Tabelle + API-Endpoint (Schema vorhanden, Read-Only OK ohne Daten)
- MicroDashboard UI (rendert mit Mock-Daten testbar)

---

## Recommended Workorder Order

**Phase 1 — Foundation (parallelisierbar, keine Cross-Abhängigkeit):**

1. Schema-Migration: Master + Pass-2-Patch idempotent ausführen
2. `nutrient_defs` Seed (138 Codes)
3. `tag_definitions` Seed (16 V1-Tags)
4. BLS Import Pipeline (Mapping, Warn-Reports, Review Queue)
5. RLS-Policies prüfen + bereinigen (insbesondere `food_portions`)

**Phase 2 — Core Backend (sequenziell auf Phase 1):**

6. Food Search API (`/foods`, `/foods/smart-search`, `/foods/custom`)
7. Custom Foods CRUD + Allergen-Selektor
8. Food Portions (`/foods/:id/portions` + `/user_recent_portions`)
9. Water Logs API
10. Nutrition Targets (Cache von Goals + Fallback)
11. Diary CRUD (Meals + Items mit Snapshot-Logic)
12. Quick-Add Makros API (food_source='manual')
13. Recalculate API + Audit-Tabelle
14. Daily Summary VIEW + Range Aggregat
15. Supplements-API-Konsument

**Phase 3 — Preferences & Onboarding (sequenziell auf Phase 2):**

16. Nutrition Preferences Schema + API (`/preferences/onboarding`, `/preferences/settings`)
17. Coach Permissions Tabelle + API (Cross-Modul: Auth-Modul)
18. Coach Suggestions API (`coach_nutrition_suggestions` + Per-Type-Accept-Logik)

**Phase 4 — Frontend Backbone (parallel zu Phase 3 möglich):**

19. i18n-Infrastruktur (DE/EN/TH-Keys, Switcher mit TH disabled)
20. Diary UI (DiaryView, MealGroup, FoodLogEntry, MacroDashboard, NutritionScoreCard)
21. Food Search UI (FoodSearch, FoodAmountInput, PortionSelector, CustomFoodForm)
22. Water Tracker UI
23. Recalculate UI (`MealItemRecalculateButton`, `-Modal`)
24. Quick-Add Makros UI (`QuickMacroEntry`)

**Phase 5 — Onboarding/Settings UI (sequenziell auf Phase 3+4):**

25. Onboarding 4-Step Wizard (Flow 0)
26. Settings Page mit Preferences-Bearbeitung
27. Coach Permissions Settings UI
28. Coach Suggestions UI (Liste + Card + Per-Type-Display)

**Phase 6 — Schema-only-Bereiche (parallel zu Phase 4–5):**

29. Recipes Schema + 501-Endpoints + UI-Marker
30. Meal Plans Schema + 501-Endpoints + UI-Marker
31. Shopping Lists Schema + 501-Endpoints + UI-Marker

**Phase 7 — Wartebereich (nach Open-Item-Klärung):**

32. **[wartet auf BLOCK-1]** MealCam Provider-Adapter
33. MealCam Service Integration (Scan, Detect, Match, Confirm)
34. MealCam UI (Modal + Components — kann parallel mit Mock-Provider testbar gestartet werden)
35. **[wartet auf BLOCK-2]** Micronutrient Review Scoring (Pure Functions)
36. Micronutrient Review UI (mit echten Reference-Values)

**Phase 8 — Integration & Polish:**

37. for-ai Endpoint (Buddy Context)
38. for-goals Endpoint (Goals Compliance Export)
39. Pending Actions Endpoint
40. Nutrition Score (deterministisch, level_multiplier mit Default-Fallback)
41. End-to-End-Tests

**Wichtig:** Diese Reihenfolge ist eine Empfehlung. Tom kann Phasen parallelisieren oder umordnen, solange Schema (Phase 1) zuerst läuft und Open-Item-blockierte WOs (Phase 7 partiell) nicht vor BLOCK-1/BLOCK-2-Klärung gestartet werden.

---

## Final Risks

| Risiko | Wahrscheinlichkeit | Auswirkung | Mitigation |
|---|---|---|---|
| **Vision-Provider-Wechsel** nach Implementierung erfordert Adapter-Rewrite | Mittel | Mittel | Provider-Adapter dünn halten; HTTP-Client-Abstraktion in `packages/vllm-client` ähnlicher Vorlage |
| **`nutrient_reference_values` Seed**-Beschaffung dauert länger als geplant (medizinische Quellprüfung) | Mittel | Hoch | V1-Release mit MicroDashboard ohne UL-Warnung möglich; UL/Status erst nach Seed |
| **Tag-Set-Kompromiss** zwischen Decisions §5 (16 Tags) und SPEC-04/05-Maximalkatalog könnte nach Use-Tests neu verhandelt werden | Niedrig | Niedrig | Auto-Tag-Trigger ist erweiterbar; weitere Tags als Phase-2-Erweiterung dokumentiert |
| **Schema-only-Bereiche (Recipes/Plans/Shopping)** werden teil-aktiviert, was V1-Scope sprengt | Mittel | Mittel | Pro Bereich klare V1-vs-Phase-2-Entscheidung mit Tom vor WO-Start |
| **Buddy-Source-Badge** in UI ohne aktive Buddy-Plan-Erzeugung kann User verwirren | Niedrig | Niedrig | UX-Hinweis in WO-Description ergänzen; ggf. Badge in V1 ausblenden |
| **Onboarding-Skip** + Diary-Nutzung mit `onboarding_complete = false` erzeugt schwächere Personalisierung | Mittel | Niedrig | Settings-Banner "Onboarding fortsetzen" implementieren — bereits in Flow 0 vorgesehen |
| **Recalculate-Trigger-Bedingung** ("Food-Daten neuer als Snapshot") erfordert Versionierungs-System für Food-Daten | Mittel | Niedrig | V1: einfache `food_data_version`-Spalte global; Phase 2 ggf. pro Food |
| **Cross-Modul-Permissions** (Coach-Permission-Tabelle in Auth-Modul) — Nutrition kann nicht ohne Auth-Modul-WO komplett laufen | Hoch | Mittel | Auth-Modul-Coach-Permission-Schema vor Phase 3 sicherstellen — sonst WOs in Phase 3 blockiert |
| **Score `user_level`** Cross-Modul-Quelle (User-Profil oder Goals) | Niedrig | Niedrig | Default `intermediate` mit Fallback dokumentiert |
| **i18n TH initial leer** kann zu UI-Bugs führen wenn Switcher versehentlich aktivierbar | Niedrig | Niedrig | TH-Switcher disabled; "Coming soon"-Toast |

---

## Schlussempfehlung

Die Nutrition V1 Specs sind nach Umsetzung der Review-Fixes **substantiell ready**. Tom kann:

1. **Phase 1–6 parallelisiert** in Workorders überführen — diese 31 Bereiche sind ohne weitere Klärung startbar.
2. **MealCam Provider-Entscheidung** parallel anstoßen (extern, nicht spec-basiert).
3. **`nutrient_reference_values` Seed-Beschaffung** parallel anstoßen (medizinische Quellrecherche, nicht spec-basiert).
4. **Phase 7-WOs erst starten**, sobald die zwei Open Items entschieden sind.

Alle drei Reviews wurden in dieser Konsolidierung integriert. Keine bestehenden Spec-Dateien wurden in diesem Run geändert. Keine Workorders wurden erzeugt.

---

*Ende OPUS_REVIEW_NUTRITION_V1_FINAL.md*
