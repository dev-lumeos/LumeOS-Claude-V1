# 02 – Nutrition: Spec ↔ Code Abgleich

**Stand:** 2026-07-30 (v0.2 – korrigiert: Live-Schema aus `supabase/migrations/` war übersehen worden. EAV, Aliase, Kategorie-Hierarchie und SPEC_06-Namenskonvention **sind** implementiert; `db/schema/nutrition.sql` ist ein nicht verdrahteter Diary-Entwurf, nicht das Live-Schema)
**Methode:** Specs gelesen: `00_decisions/NUTRITION_NEXT_SPEC_DECISIONS.md` (vollständig), SPEC_04/SPEC_06/SPEC_07 (Auszüge, je ~100–120 Zeilen). Code-Seite aus `01-nutrition.md`. SPEC_01–03, 05, 08–10 und die 12 Patches nur titelseitig erfasst – Details dort sind **nicht** abgeglichen.

---

## 1. Architektur-Abweichung (tragend, vor allem anderen klären)

| Aspekt | Spec | Code (Ist) |
|---|---|---|
| Laufzeit | Eigenständiger Service, `http://nutrition:5100`, Express-Router, JWT-Auth (`SPEC_07_API.md:9-34`) | Next.js API-Routen unter `apps/web/src/app/api/nutrition/*`, keine Auth |
| DB-Zugriff | Service-intern, `search_path = nutrition` | psql gegen lokalen Docker-Container |
| Namenskonvention | `nutrition.foods`, `nutrition.food_categories`, … (schema-qualifiziert) | **identisch** – Live-Schema folgt SPEC_06 (`food-search.ts:20-21,41-43`) |
| Nährstoffmodell | EAV-Hybrid: 138 Nährstoffe in `nutrient_defs` + `food_nutrients` (~570K Zeilen), 10 Schnell-Makros als Spalten (`SPEC_04_FEATURES.md:27-31`) | ✓ EAV umgesetzt (`supabase/migrations/20240522_002_nutrition_food_core_tables.sql:13,16`). Aber: nicht verdrahteter Diary-Entwurf (`db/schema/nutrition.sql`) nutzt flache Makro-Spalten → **Modellkonflikt** |

**Einordnung (Urteil):** Der Code sieht aus wie eine bewusst vereinfachte In-App-Variante der Spec-Architektur (Monorepo-Realität: Services leer, siehe `00-overview.md`). Ob die 5100er-Service-Architektur noch Zielbild ist, ist eine Entscheidungsfrage – davon hängt ab, ob „angleichen" bedeutet: Service extrahieren oder Spec an Next.js-Realität anpassen.

## 2. V1-Scope laut Decisions-Dokument vs. Code

Quelle: `NUTRITION_NEXT_SPEC_DECISIONS.md` (§1 Scope, §2 V1-Flow).

| # | V1-Anforderung (Spec) | Code-Status |
|---|---|---|
| 1 | Food Search ohne Login | ✓ umgesetzt (`foods/page.tsx`, `/api/nutrition/foods`) |
| 2 | Preferences setzen (Favoriten, Ausschlüsse, Portionsgrößen, Priorität) | ✗ kein Schreibpfad **und keine Tabelle** – Katalog code-eingebettet, read-only (`preferences-catalog.ts:4`) |
| 3 | Kuration (unassigned Foods, Aliase, Tag-Mapping) | ~ teilweise: UI + API lesend vorhanden (`curation/page.tsx`), Schreiben offen |
| 4 | Water Tracking | ✗ weder Tabelle noch Route |
| 5 | Diary-Einträge (Meals) | ✗ keine Live-Tabellen; nicht verdrahteter Entwurf in `db/schema/nutrition.sql`; `/nutrition` ist Mock |
| 6 | Copy-Day | ✗ |
| 7 | MealCam (Stub erlaubt) | ✗ (SPEC_07 definiert bereits `/mealcam`-Router) |
| 8 | Zielwerte aus Goals lesen | ✗ (`nutrition_targets`-Tabelle fehlt) |
| 9 | for-ai/for-goals Kontext-Endpunkte | ✗ |
| 10 | Daily Summary | ~ Entwurf-Tabelle `daily_nutrition_summaries` im Diary-Draft vorhanden, nicht verdrahtet |
| 11 | Preferences-Engine | ~ teilweise: Preview/Scoring lesend (`preference-search-preview.ts`), ohne eigene Preferences dahinter |
| 12 | Onboarding-Setup | ✗ |
| 13 | Auth | ✗ (lokal bewusst; Remote-Pflicht) |
| 14 | Smart Search mit hartem Diät-Filter | ~ teilweise: Exclusion-Optionen in UI (`exclude_animal` etc.), Spec-Scoring (+100/−100/±50/+30) nicht verifiziert |

## 3. DB-Schema: SPEC_06 vs. Live-Schema (`supabase/migrations/`)

Live-Schema-Quelle: `supabase/migrations/20240522_001` (Foundation) + `20240522_002` (Core-Tabellen) + Slices 20260513/20260514. Zusätzlich existiert ein **nicht verdrahteter** Diary-Entwurf in `db/schema/nutrition.sql` + `db/migrations/20260423_001_nutrition_initial.sql`.

| SPEC_06-Tabelle | Im Code? | Anmerkung |
|---|---|---|
| `nutrient_defs` (138 BLS-Nährstoffe) | ✓ | `20240522_002:13`; Slice `20260513_002` ergänzt i18n |
| `food_categories` (4 Ebenen) | ✓ | mit `parent_id`-Hierarchie (`food-search.ts:41-43`) |
| `foods` (7.140 BLS) | ✓ | `20240522_002:15` |
| `food_nutrients` (EAV, ~570K) | ✓ | `20240522_002:16` |
| `tag_definitions` / `food_tags` | ✓ | `20240522_002:17,19` |
| `food_aliases` | ✓ | `20240522_002:18` |
| `foods_custom` | ✗ | ADR_CUSTOM_FOODS_V1 spezifiziert es |
| `food_preferences` + `food_preference_items` | ✗ | **Tabelle existiert nirgends**; Katalog code-eingebettet, `write_policy: read_only` (`preferences-catalog.ts:4`) |
| `meals` / `meal_items` | ~ | nur als nicht verdrahteter Entwurf (`db/schema/nutrition.sql`: `diary_days`, `meal_logs`, `meal_items` – public-Schema, flache Makros, RLS) |
| `recipes` / `recipe_items` | ✗ | |
| `meal_plans` / `_days` / `_items` / `_logs` | ✗ | |
| `water_logs` | ✗ | |
| `nutrition_targets` | ✗ | |
| `micro_flags` | ✗ | |
| VIEW `daily_nutrition_summary` | ~ | Entwurf hat Tabelle `daily_nutrition_summaries` (`db/schema/nutrition.sql`), nicht verdrahtet |

Code-seitig ohne Migrations-Herkunft: `nutrition.food_curation_candidates` + `nutrition.food_curation_decisions` (genutzt in `curation.ts`, in keiner Migration im Repo → Schema-Hoheit unklar).

**Deckungsgrad:** 7 von 15 Konzepten umgesetzt (gesamter Katalog-Kern inklusive EAV), 2 als nicht verdrahtete Entwürfe, 6 fehlend. Die größte strukturelle Lücke ist nicht mehr das Nährstoffmodell, sondern der **fehlende Schreibpfad** (Preferences) und die **Diary-Verdrahtung** – darauf bauen Scoring, Daily Summary und der V1-Flow auf.

## 4. API: SPEC_07-Router vs. Next.js-Routen

| SPEC_07-Router | Code-Äquivalent |
|---|---|
| `/foods` (inkl. Custom, sort_weight, Similarity) | ✓ `/api/nutrition/foods` (ohne Custom) |
| `/foods/smart-search` (vor `/foods` mounten!) | ~ `/api/nutrition/foods/smart-preview` (Preview, nicht Voll-Suche) |
| `/meals`, `/water`, `/targets`, `/recipes`, `/shopping-lists`, `/meal-plans` | ✗ alle fehlend |
| `/preferences` | ~ `/api/nutrition/preferences/catalog` (nur lesender Katalog) |
| `/summary`, `/score`, `/for-ai`, `/for-goals`, `/pending-actions`, `/settings`, `/mealcam` | ✗ alle fehlend |
| Response-Format `{ ok, data?, error? }` | nicht verifiziert (Detail) |
| Auth (JWT, globalAuthMiddleware) | ✗ keine |

Zusätzlich im Code ohne Spec-Gegenstück (Ist-Stand, nicht falsch): `/api/nutrition/curation`, `/api/nutrition/local-schema` (Debug).

## 5. Was die Specs selbst offen lassen

Das Decisions-Dokument sagt selbst: ADR-Paket eingearbeitet, aber **SPEC_01–10 sind noch nicht vollständig nachgezogen** (MealCam-V1-Definition, Scoring-Regeln, User-Flows). Die Spec-Seite ist also auch in Bewegung; der Abgleich hier bildet den Stand der gelesenen Teile ab.

## 6. Konsequenz – Entscheidungsbedarf

Drei aufeinander aufbauende Fragen:

1. **Architektur:** Bleibt Next.js-In-App das Zielbild (dann SPEC_07 auf Next.js-Routen umschreiben) oder soll der 5100er-Service kommen (dann `services/` im Monorepo füllen)? *Empfehlung: kurzfristig Next.js (Repo-Realität), Service-Option als ADR festhalten.*
2. **Nächster Bau-Schritt im V1-Scope:** Die V1-Liste (§2) gibt die Reihenfolge faktisch vor: **Preferences-Schreibpfad (#2)** ist der kleinste Blocker mit größtem Hebel – erfordert eine neue Tabelle (SPEC_06 sieht `food_preferences` + `food_preference_items` vor), da aktuell keinerlei Persistenz existiert. Smart Search (#14) und Preferences-Engine (#11) werden erst dadurch echt. Danach Diary (#5) mit `meals`/`meal_items`.
3. **EAV-Nährstoffmodell:** Bereits umgesetzt – entfällt als Bau-Schritt. Zu lösen ist stattdessen der **Modellkonflikt**: Diary-Entwurf (flache Makros, public-Schema) vs. EAV-Live-Modell. *Empfehlung: Diary an EAV anschließen (`meal_items` frieren Nährstoffe ein, wie SPEC_06 vorsieht), flachen Entwurf verwerfen oder als Remote-Variante neu ableiten.*
