# OPUS_REVIEW_NUTRITION_02_DATA_API.md

> Review 2 — Entities, Datenmodell, Schema, SQL-Patch, API-Konsistenz
> Reviewer: Opus | Datum: 2026-05-02
> Scope: nur Nutrition Spec Pfad (`docs/specs/Nutrition/`)
> Gelesen: `NUTRITION_NEXT_SPEC_DECISIONS.md`, `SPEC_02_ENTITIES.md`, `SPEC_02_PASS2_ENTITIES.md`, `SPEC_06_DATABASE_SCHEMA.md`, `SPEC_06_PATCH_V1_DECISIONS.md`, `SPEC_06_V1_MIGRATION.sql`, `SPEC_07_API.md`, `SPEC_07_PASS2_PATCH.md`, `NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md`, ADRs (`BLS_ONLY`, `CUSTOM_FOODS_V1`, `MEALCAM_V1`, `MEALCAM_CONSENT`, `SUPPLEMENTS_API_BOUNDARY`, `NUTRITION_PREFERENCES_V1`, `COACH_PERMISSIONS_V1`)

---

## Executive Verdict

**PASS_WITH_FIXES**

Das Pass-2-Datenmodell deckt alle V1-Anforderungen aus dem Entscheidungsdokument ab. Entities und API-Flows sind weitgehend formal beschrieben. Es gibt jedoch **vier wichtige Lücken**, die vor der Workorder-Generierung geschlossen werden müssen:

1. **Tabelle `coach_nutrition_suggestions` ist als Entity 28 in `SPEC_02_PASS2_ENTITIES.md` definiert, aber in `SPEC_06_V1_MIGRATION.sql` fehlt das `CREATE TABLE`.** Trotzdem werden Coach-Suggestion-API-Endpoints aus `SPEC_07_PASS2_PATCH.md` darauf zugreifen.
2. **`SPEC_06_DATABASE_SCHEMA.md` ist nicht mit dem Migrations-Patch synchronisiert.** Master-Schema enthält noch alte CHECK-Constraints (`foods_custom.source` mit `openfoodfacts`, `meal_items.food_source` ohne `manual`, `food_categories` ohne `name_th`), während der Schluss-Block "V1 Korrekturen" diese als ✅ erledigt darstellt. Reader des Master-Schemas erhält widersprüchliche Information.
3. **`food_preference_items.target_type` CHECK-Constraint** ist in SPEC_06 `('food','category','tag')`, in PASS2 §27 erweitert um `'cuisine'`. Migration zieht die Erweiterung NICHT nach.
4. **Recalculate-API-Endpunkt fehlt.** `NUTRITION_NEXT_SPEC_DECISIONS.md §12` fordert eine explizite Neuberechnung mit Audit/Version. Migration ergänzt nur `snapshot_version`, aber weder API-Endpunkt noch Audit-Log-Tabelle.

Keine Blocker für Schema-Existenz oder Datenintegrität. BLS/Custom-Trennung sauber. OpenFoodFacts/USDA vollständig aus API entfernt (nur Master-Schema noch nicht synchron). Supplements-API-Boundary korrekt umgesetzt.

---

## Critical Findings

### CRIT-1 — `coach_nutrition_suggestions` Tabelle fehlt im Migrations-SQL

`SPEC_02_PASS2_ENTITIES.md §28` definiert die Entity `CoachNutritionSuggestion` mit allen Spalten (`id`, `user_id`, `coach_id`, `suggestion_type`, `status`, `payload JSONB`, `expires_at`, `decided_at`, `decision_note`, `created_at`).

`SPEC_07_PASS2_PATCH.md §6` und §5 referenzieren diese Tabelle mit konkreten API-Endpoints:
- `POST /api/nutrition/coach/:userId/suggestions`
- `GET /api/nutrition/suggestions/pending`
- `POST /api/nutrition/suggestions/:id/accept`
- `POST /api/nutrition/suggestions/:id/reject`
- `GET /api/nutrition/preferences/coach-suggestions`
- `POST /api/nutrition/preferences/coach-suggestions/:id/accept`
- `POST /api/nutrition/preferences/coach-suggestions/:id/reject`

`SPEC_06_V1_MIGRATION.sql` enthält **kein** `CREATE TABLE nutrition.coach_nutrition_suggestions`. `SPEC_06_DATABASE_SCHEMA.md` enthält die Tabelle ebenfalls nicht. Die im Schluss-Block "V1 Korrekturen — Status April 2026" gelistete "Neue Tabellen"-Liste enthält sie nicht. Auch das `Schema-Übersicht (Pass 2 Additions)` in `SPEC_02_PASS2_ENTITIES.md` listet sie unter "Neue User-Daten", aber kein DDL existiert.

**Konsequenz:** API-Endpoints werden gegen eine nicht existierende Tabelle implementiert. Workorders auf Coach-Suggestions sind **blockiert** bis DDL ergänzt ist.

### CRIT-2 — `SPEC_06_DATABASE_SCHEMA.md` Master-Schema und Migrations-Patch widersprechen sich

`SPEC_06_DATABASE_SCHEMA.md` Schluss-Block "V1 Korrekturen — Status April 2026" listet vier Fixes als `✅ erledigt`. Tatsächlich sind die `CREATE TABLE`-Statements im Master-Dokument aber **noch im alten Zustand**:

| Stelle in `SPEC_06_DATABASE_SCHEMA.md` | Behauptung Schluss-Block | Wirklicher Zustand im DDL |
|---|---|---|
| §2 `food_categories` (Z. 296–310) | "✅ `name_th TEXT` ergänzt" | `name_th` fehlt |
| §8 `foods_custom` (Z. 695–732) | "✅ `source CHECK ('user','manual','import','admin')` — `openfoodfacts` entfernt" | CHECK ist noch `('user','mealcam','openfoodfacts')` |
| §8 `foods_custom` (Z. 695–732) | "✅ `name_th TEXT` Spalte ergänzt" | `name_th` fehlt |
| §10 `meal_items` (Z. 814–842) | implizit "food_source erweitert" | CHECK ist noch `('bls','custom','mealcam')` ohne `manual` |

Die Korrekturen liegen ausschließlich in `SPEC_06_V1_MIGRATION.sql`. Reader des Master-Schemas, die nicht den Schluss-Block zuerst lesen, werden alte CHECK-Constraints implementieren oder zitieren.

**Konsequenz:** Hohe Verwechslungsgefahr beim Workorder-Schreiben. Implementations-WO könnte versehentlich altes Schema reproduzieren.

### CRIT-3 — Migration verändert `food_preference_items.target_type` CHECK nicht

`SPEC_02_PASS2_ENTITIES.md §27` listet die vier Ziel-Felder explizit:
> `target_type TEXT NOT NULL    food | category | tag | cuisine`

`SPEC_06_DATABASE_SCHEMA.md` Z. 768–783 definiert:
```sql
target_type TEXT NOT NULL CHECK (target_type IN ('food','category','tag'))
```

`SPEC_06_V1_MIGRATION.sql` ergänzt `severity` und `source` Spalten, ändert aber **nicht** den `target_type` CHECK. Außerdem fehlt eine `cuisine_id` oder vergleichbare Ziel-Referenzspalte für `target_type = 'cuisine'`. Der bestehende `exactly_one_target` CHECK wird ebenfalls nicht erweitert.

**Konsequenz:** Wenn API ein Preference-Item mit `target_type = 'cuisine'` schreibt, schlägt die DB-Constraint-Prüfung fehl. Coach Suggestions auf Cuisine-Ebene sind nicht persistierbar.

### CRIT-4 — Recalculate-API + Audit fehlen

`NUTRITION_NEXT_SPEC_DECISIONS.md §12 (Diary Snapshots)` fordert:
> "User kann Meal Item später neu berechnen lassen. Recalculate: erzeugt neuen Snapshot, speichert Audit/Version. Diary Day speichert Tagesaggregate als Snapshot. Tagesaggregate können aus Meal Items neu aufgebaut werden."

Vorhanden:
- `SPEC_06_V1_MIGRATION.sql` ergänzt `meal_items.snapshot_version INTEGER NOT NULL DEFAULT 1`.
- `SPEC_07_API.md §4` (`PUT /api/nutrition/meals/:mealId/items/:itemId`) erwähnt "Nährstoffe werden neu berechnet und eingefroren" — als implizite Nebenwirkung beim Mengen-Update.

Fehlend:
- Kein eigener API-Endpunkt `POST /api/nutrition/meals/:mealId/items/:itemId/recalculate` als explizite, vom User initiierte Aktion.
- Kein Audit-Log-Schema (z. B. `meal_item_snapshots` History oder `recalculation_log`).
- Keine Logik: "neuer Snapshot = neue Version; alter Snapshot bleibt als History" — `snapshot_version` ist eine einzelne Spalte ohne Historie.
- Keine API für Daily-Aggregat-Recalculation aus Meal Items.

**Konsequenz:** Wenn User später eine Neuberechnung anfordert, gibt es keinen sauberen API-Pfad und keine Audit-Spur.

---

## Important Findings

### IMP-1 — `meal_items.data_source` Spalte ist redundant zu `food_source`

`SPEC_06_V1_MIGRATION.sql` ergänzt:
```sql
ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'bls'
    CHECK (data_source IN ('bls','custom','mealcam','manual'));
```

Die Spalte `food_source` mit identischem CHECK-Werten existiert bereits. Es ist nicht dokumentiert, warum beide Spalten nötig sind.

`NUTRITION_NEXT_SPEC_DECISIONS.md §12` definiert ein "Datenquellen"-Feld als Teil des Snapshot-Modells:
> Datenquelle: BLS | Custom | MealCam | Manual

Es bleibt unklar, ob das `food_source` (Welcher Tabelle gehört das Food?) oder `data_source` (Wie ist es ins System gekommen?) ist.

**Konsequenz:** Doppelte Quelle der Wahrheit. Implementierung muss klären, welche Spalte für was. Risiko, dass beide auseinanderlaufen.

### IMP-2 — `SPEC_06_V1_MIGRATION.sql` RLS-Policy für `food_portions` erlaubt User-Schreibrechte auf BLS-Portionen

Migration definiert:
```sql
CREATE POLICY "food_portions_custom_user" ON nutrition.food_portions
  FOR ALL USING (
    custom_food_id IS NULL  -- BLS portions: jeder lesen
    OR EXISTS (
      SELECT 1 FROM nutrition.foods_custom fc
      WHERE fc.id = food_portions.custom_food_id AND auth.uid()::text = fc.user_id::text
    )
  );
```

Der Kommentar `-- BLS portions: jeder lesen` ist irreführend — die Policy gilt `FOR ALL` (also auch INSERT/UPDATE/DELETE), und `custom_food_id IS NULL` matched **jede** BLS-Portion. Damit kann **jeder eingeloggte User** beliebige BLS-Portionen einfügen, ändern oder löschen.

Erschwerend: `SPEC_07_PASS2_PATCH.md §2` definiert `POST /api/nutrition/foods/:id/portions/user` für user-eigene Portionen auf BLS-Foods — aber wo wird `source = 'user'` für BLS-Portionen gespeichert? Aktuell mit `food_id` gesetzt und `custom_food_id` NULL → fällt unter die "BLS portions"-Klausel und ist global für alle User sichtbar (nicht nur den Ersteller).

**Konsequenz:** RLS-Lücke. Kann Daten aller User durcheinanderbringen.

### IMP-3 — `SPEC_07_API.md §14 MealCam` widerspricht `SPEC_07_PASS2_PATCH.md §4`

`SPEC_07_API.md §14` definiert MealCam als zwei Endpoints:
- `POST /api/nutrition/mealcam/scan` (Body: image, optional plan_item_id)
- `POST /api/nutrition/mealcam/feedback` (Body: scan_id, correction_type, correct_food_id)

`SPEC_07_PASS2_PATCH.md §4` definiert MealCam als 5-Schritt-Flow:
- `POST /api/nutrition/mealcam/scan`
- `GET /api/nutrition/mealcam/scan/:scanId`
- `POST /api/nutrition/mealcam/scan/:scanId/correct`
- `POST /api/nutrition/mealcam/scan/:scanId/confirm`
- `POST /api/nutrition/mealcam/scan/:scanId/consent`
- `GET /api/nutrition/mealcam/scan/:scanId/feedback`

Es ist nicht explizit vermerkt, dass §4 das §14-Modell **ersetzt**. Beide könnten als parallel gültig gelesen werden.

**Konsequenz:** Implementierende Workorders könnten den falschen Flow umsetzen.

### IMP-4 — `SPEC_07_API.md §13 Preferences` und `SPEC_07_PASS2_PATCH.md §5` ohne klare Substitution

`SPEC_07_API.md §13` definiert:
- `GET /api/nutrition/preferences`
- `PUT /api/nutrition/preferences`
- `POST /api/nutrition/preferences/items`
- `DELETE /api/nutrition/preferences/items/:id`

`SPEC_07_PASS2_PATCH.md §5` ergänzt:
- `GET /api/nutrition/preferences/onboarding`
- `POST /api/nutrition/preferences/onboarding`
- `GET /api/nutrition/preferences/settings`
- `PUT /api/nutrition/preferences/settings`
- `GET /api/nutrition/preferences/coach-suggestions`
- `POST /api/nutrition/preferences/coach-suggestions/:id/accept`
- `POST /api/nutrition/preferences/coach-suggestions/:id/reject`

Es bleibt offen, ob `PUT /preferences` (alt) und `PUT /preferences/settings` (neu) parallel existieren, ob §13 deprecated ist oder beide unterschiedliche Bereiche bedienen.

`SPEC_07_PASS2_PATCH.md` Routing-Block listet nur `/preferences/onboarding` und `/preferences/settings` als neue Routes — implizit bleiben die alten bestehen, was Code-Duplizierung andeutet.

**Konsequenz:** API-Verträge nicht eindeutig.

### IMP-5 — Hardcodierte RDA-Werte in `nutrient_defs` ohne Quellen-Attribution widersprechen `NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md` Pflichtregeln

`SPEC_06_DATABASE_SCHEMA.md` Z. 263–289 enthält hardcodierte RDA-Werte direkt in `nutrient_defs` (z. B. `UPDATE nutrient_defs SET rda_male=20, rda_female=20, rda_unit='µg' WHERE code='VITD';`). Es gibt **keine** `source`/`source_version` Spalten.

`NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md` "Pflichtregeln für alle Seed-Werte" sagt:
> 2. **Quelle muss angegeben werden** — kein Wert ohne `source` und `source_version`
> 3. **Kein Wert erfinden** — nur belegte Werte eintragen

Die Werte in `nutrient_defs.rda_male`/`rda_female` sind **vermutlich** DACH 2020 Erwachsene 25–50 J. (laut Kommentar Z. 262 "DACH-Referenzwerte, Erwachsene 25-50 Jahre"). Quelle pro Eintrag jedoch nicht annotiert. Bei Aktualisierung oder Audit ist die Herkunft nicht nachvollziehbar.

Doppelte Quelle der Wahrheit: `nutrient_defs.rda_*` vs. neue Tabelle `nutrient_reference_values`. Welche ist autoritativ? Nicht belegt.

**Konsequenz:** Unklar, ob Scoring auf `nutrient_defs.rda_*` oder `nutrient_reference_values.rda` zugreifen soll. Außerdem widersprechen die Werte ohne Quellenangabe der eigenen Pflichtregel.

### IMP-6 — Suchergebnis-Felder zwischen `SPEC_07 §1` und `SPEC_07_PASS2_PATCH §1` inkonsistent

`SPEC_07_API.md §1` Response-Schema enthält:
```json
{ "is_custom": false, "tags": [...] }
```

`SPEC_07_PASS2_PATCH.md §1` Response-Schema enthält:
```json
{ "food_source": "bls", "matched_via": "name", "matched_alias": null, "tags": [...] }
```

`is_custom` (boolean) und `food_source` (string enum) sind beides Indikatoren für die Quelle, aber unterschiedlich modelliert. Frontend-Verträge werden uneinheitlich.

**Konsequenz:** Implementierung muss entscheiden, welche Felder aktuell gelten. Dokumentation widerspricht sich.

### IMP-7 — Routing-Konflikt-Risiko `/foods/:id/portions` vs. `/foods/:id`

`SPEC_07_PASS2_PATCH.md` Routing-Block:
```ts
app.route('/api/nutrition/foods/:id/portions', portionsRouter)
```

Falls `portionsRouter` nach `foodsRouter` gemounted wird, würde `/foods/:id` zuerst matchen und `/foods/:id/portions` nicht erreichen. Die explizite Reihenfolge wird nicht angegeben (im Gegensatz zu `/foods/smart-search` aus SPEC_07 Übersicht, das explizit vor `/foods` gemounted ist).

**Konsequenz:** Erfordert klare Routing-Reihenfolge in der Implementation.

### IMP-8 — `mealcam_detected_items` und `mealcam_user_corrections` sind keine eigenen Tabellen

Review-Frage 5 erwartet "mealcam_detected_items, mealcam_user_corrections" als eigenständige Tabellen. Tatsächlich sind beide als JSONB-Felder innerhalb `mealcam_scans` modelliert (`detected_items JSONB`, `user_corrections JSONB`). Das ist konsistent mit `NUTRITION_NEXT_SPEC_DECISIONS.md §19` und `ADR_MEALCAM_CONSENT.md`, die einen einzigen JSON-Datensatz pro Scan vorsehen.

Konsequenz: **Nicht falsch**, aber abweichend von der naiven Erwartung relationaler Tabellen. Für komplexe Abfragen (z. B. "Welche Foods werden am häufigsten korrigiert?") wären strukturierte Kindtabellen besser. Aktuell V1 nicht belegt notwendig.

**Empfehlung:** In den Specs explizit notieren, dass `detected_items` und `user_corrections` als JSONB innerhalb `mealcam_scans` leben — und Trade-off (einfach, aber schlecht aggregierbar) erwähnen.

### IMP-9 — `SPEC_07_API.md §9–§11` (Recipes/Shopping/MealPlans) ohne V1-Status-Hinweis

Die Endpoints für Recipes, Shopping Lists und Meal Plans sind in `SPEC_07_API.md` als vollständige V1-API beschrieben — ohne Hinweis auf den Schema-only-Status. `SPEC_07_PASS2_PATCH.md §7` markiert diese Endpoints **nachträglich** als "V1 optional — Phase 2 wenn Zeit knapp" und definiert eine `501 Not Implemented`-Response.

Reader des Haupt-API-Specs ohne Pass-2-Patch werden die Endpoints als V1-Pflicht annehmen.

**Konsequenz:** Workorder-Generator könnte fälschlich V1-Pflicht-WOs für diese Bereiche schreiben.

---

## Minor Findings

### MIN-1 — `SPEC_06_DATABASE_SCHEMA.md` GRANTS-Block enthält keine neuen Pass-2-Tabellen

`SPEC_06_DATABASE_SCHEMA.md` §18 Grants:
```sql
GRANT SELECT, INSERT, UPDATE, DELETE ON
  nutrition.foods_custom, nutrition.food_preferences, ... TO authenticated;
```

`nutrient_reference_values`, `food_portions`, `user_recent_portions`, `mealcam_scans`, `coach_nutrition_suggestions` fehlen. Migration ergänzt eigenen GRANT-Block, aber Master-Spec ist nicht synchronisiert.

### MIN-2 — `Recipe.source` enum erlaubt `buddy` nicht in SPEC_06 trotz `ADR_RECIPE_SOURCE_BUDDY`

`SPEC_06_DATABASE_SCHEMA.md` Z. 865: `Recipe` Tabelle hat **kein** `source`-Feld (nur `is_public`, `is_favorite`).
`SPEC_02_ENTITIES.md §10` definiert `source TEXT NOT NULL DEFAULT 'user' user | coach | marketplace`.
`SPEC_06_PATCH_V1_DECISIONS.md` notiert: "Rezepte source 'buddy' fehlt noch in recipe.source CHECK → wird separat in ADR_RECIPE_SOURCE_BUDDY.md behandelt".

Diskrepanz nicht in Migration aufgelöst. Tabelle hat in SPEC_06 weder `source` noch `source_ref_id` Spalte.

### MIN-3 — `mealcam_scans.confidence_level` (`high|suggest|low`) und `detected_items[].confidence` (numerisch) — Mapping nicht spezifiziert

In `SPEC_07_PASS2_PATCH.md §4` sind detected_items mit `confidence: 0.78` (numerisch). Das Top-Level `confidence_level` ist enum (`high|suggest|low`). Die Aggregations-/Mapping-Regel (z. B. avg confidence > 0.8 → 'high'?) ist nicht belegt.

### MIN-4 — `food_portions.unit` vs. `meal_items.amount_g`-Modell — keine `unit_display` Spalte für eingeloggte Portion

Wenn User eine Portion ("1 Scheibe") wählt und Meal Item erstellt, wird `amount_g = 35` gespeichert. Die Information "1 Scheibe" geht im Meal Item verloren. `user_recent_portions` hat `portion_name TEXT`, `meal_items` aber nicht.

**Konsequenz:** Diary kann die ursprüngliche Portionsbezeichnung nicht mehr anzeigen.

### MIN-5 — `SPEC_06_PATCH_V1_DECISIONS.md` ist als "EINGEARBEITET" markiert, aber `SPEC_06_DATABASE_SCHEMA.md` enthält die Fixes nicht inline

`SPEC_06_PATCH_V1_DECISIONS.md` Header:
> Status: EINGEARBEITET in SPEC_06_DATABASE_SCHEMA.md

Faktisch sind die Fixes nur im Migrations-SQL — siehe CRIT-2.

### MIN-6 — `nutrition_targets.fiber_target DEFAULT 30` widerspricht "Goals liefert"

`SPEC_06_DATABASE_SCHEMA.md` Z. 1097: `fiber_target INTEGER DEFAULT 30`.
`SPEC_01_MODULE_CONTRACT.md §3.1` (außerhalb Review-Scope, aber Verweis im API): "Targets kommen immer von Goals."

Default-Wert in der Tabelle ist nicht klar als Fallback markiert. Wenn Goals den Wert liefert, sollte er explizit gesetzt sein, nicht per DB-Default fließen.

### MIN-7 — `meal_plan_logs.logged_via` enum nur `('mealcam','manual')` — kein 'recipe' oder 'plan'

Wenn User aus einem Plan oder Rezept loggt, müsste `logged_via` einen passenden Wert haben. Bei `manual` ist nicht erkennbar, ob es aus Plan, Rezept oder ad-hoc kam.

### MIN-8 — `food_preference_items.target_type` nimmt für `cuisine` an, dass freier Text-Code reicht; aber Schema erlaubt keine `cuisine_id`

PASS2 §27 bietet `tag_code TEXT FK → TagDefinition` — aber für Cuisines existiert keine Cuisine-Tabelle. Soll Cuisine als spezieller `tag_type = 'cuisine'` in `tag_definitions` modelliert werden? Nicht belegt.

---

## Missing Definitions

### Datenmodell

| Bereich | Was fehlt | Belegstelle / "nicht belegt" |
|---|---|---|
| `coach_nutrition_suggestions` | `CREATE TABLE` in Migration | nicht belegt — Entity 28 ohne DDL |
| Recalculate-Audit | History-Tabelle für alte Snapshots | nicht belegt — nur einzelner `snapshot_version` Zähler |
| Daily Aggregat Snapshot | Tabelle für Tagesaggregat-Snapshots | nicht belegt — Decisions §12 fordert es |
| `food_preference_items` cuisine-Ziel | `cuisine_id` oder ähnliche Referenz | nicht belegt |
| `Recipe.source` mit `buddy` | Spalten + CHECK | nicht belegt in SPEC_06; ADR_RECIPE_SOURCE_BUDDY außerhalb dieses Review-Scopes |
| Custom Food Allergens | `custom_allergens TEXT[]` | nicht belegt in SPEC_02/SPEC_06; ADR_IMPROVEMENTS_PACKAGE #18 außerhalb Scope |

### Schema

| Bereich | Was fehlt |
|---|---|
| Master-Schema-Sync | SPEC_06 inline mit Migration zu bringen (food_categories.name_th, foods_custom.source CHECK + name_th, meal_items.food_source CHECK, neue Tabellen-DDLs) |
| `food_preference_items.target_type` CHECK | Erweitern auf `('food','category','tag','cuisine')` |
| `coach_nutrition_suggestions` | Volles DDL inkl. Indices und RLS |
| GRANTs-Block | `nutrient_reference_values`, `food_portions`, `user_recent_portions`, `mealcam_scans`, `coach_nutrition_suggestions` ergänzen |
| RLS auf `food_portions` | Korrektur: BLS-Portionen NICHT user-schreibbar |

### API

| Bereich | Was fehlt |
|---|---|
| Recalculate Endpoint | `POST /api/nutrition/meals/:mealId/items/:itemId/recalculate` |
| Daily Aggregat Recalculate | `POST /api/nutrition/summary/:date/recalculate` |
| MealCam Substitution-Hinweis | Klarstellen dass SPEC_07 §14 von PASS2 §4 abgelöst wird |
| Preferences Substitution-Hinweis | Klarstellen dass SPEC_07 §13 von PASS2 §5 abgelöst wird |
| 501 Phase-2 in SPEC_07 §9–§11 | Inline V1-Status-Hinweis pro Endpoint |
| Routing-Reihenfolge `/foods/:id/portions` | explizit vor `/foods/:id` mounten |

### Quellenangaben

| Bereich | Was fehlt |
|---|---|
| `nutrient_defs.rda_*` | `source`, `source_version`, `effective_from` |
| `nutrient_reference_values` Seed-Daten | Tatsächliche RDA/AI/UL-Werte (Seed pending — bekannt aus Open Items, kein neues Finding) |

---

## Entity-Schema-API Matrix

| Bereich | Entity vorhanden | Schema vorhanden (DDL) | API vorhanden | Problem |
|---|---|---|---|---|
| nutrient_defs | ✅ SPEC_02 §1 | ✅ SPEC_06 §1 | ✅ implicit (foods/:id liefert) | RDA-Werte hardcodiert ohne Source (IMP-5) |
| food_categories | ✅ SPEC_02 §2 | ⚠️ SPEC_06 §2 (ohne `name_th`) — Migration fügt zu | ✅ SPEC_07 §1 | Master-Schema nicht synchron (CRIT-2) |
| foods | ✅ SPEC_02 §3 | ✅ SPEC_06 §3 | ✅ SPEC_07 §1 | OK |
| food_nutrients | ✅ SPEC_02 §4 | ✅ SPEC_06 §4 | ✅ implicit | OK |
| food_tags / tag_definitions | ✅ SPEC_02 §5 | ✅ SPEC_06 §5/§6 | ⚠️ Filter via `?tag=` in /foods | Auto-Tag Trigger umfangreich, OK |
| food_aliases | ✅ SPEC_02 §6 | ✅ SPEC_06 §7 | ⚠️ Indirect via Search | OK |
| foods_custom | ✅ SPEC_02 §7 | ⚠️ SPEC_06 §8 (alter source CHECK) — Migration korrigiert | ✅ SPEC_07 §3 | Master-Schema nicht synchron (CRIT-2); `custom_allergens` fehlt (außerhalb Scope) |
| food_portions | ✅ SPEC_02_PASS2 §23 | ✅ Migration | ✅ SPEC_07_PASS2 §2 | RLS-Fehler für BLS-Portionen (IMP-2); `meal_items` verliert Portion-Name (MIN-4) |
| user_recent_portions | ✅ SPEC_02_PASS2 §24 | ✅ Migration | ⚠️ implicit via Portions-Endpoint | OK |
| meals | ✅ SPEC_02 §8 | ✅ SPEC_06 §10 | ✅ SPEC_07 §4 | OK |
| meal_items | ✅ SPEC_02 §9 | ⚠️ SPEC_06 §10 (alter food_source CHECK) — Migration erweitert + dupliziert mit `data_source` | ✅ SPEC_07 §4 | Doppelspalte (IMP-1); kein Recalculate-Endpoint (CRIT-4) |
| mealcam_scans | ✅ SPEC_02_PASS2 §25 | ✅ Migration | ✅ SPEC_07_PASS2 §4 | Detected-Items als JSONB (IMP-8); Confidence-Mapping unklar (MIN-3); Konflikt mit SPEC_07 §14 (IMP-3) |
| recipes / recipe_items | ✅ SPEC_02 §10/§11 | ⚠️ SPEC_06 §11 ohne `source`-Spalte | ⚠️ SPEC_07 §9 ohne V1-Status (IMP-9) | Schema-only-Status nicht inline |
| shopping_lists / items | ✅ SPEC_02 §12/§13 | ✅ Migration | ⚠️ SPEC_07 §10 ohne V1-Status (IMP-9) | OK |
| meal_plans / days / items / logs | ✅ SPEC_02 §14–§16 | ✅ SPEC_06 §12 | ⚠️ SPEC_07 §11–§12 ohne V1-Status (IMP-9) | `logged_via` enum eng (MIN-7) |
| water_logs | ✅ SPEC_02 §17 | ✅ SPEC_06 §13 | ✅ SPEC_07 §5 | OK |
| food_preferences | ✅ SPEC_02 §18 / SPEC_02_PASS2 §26 | ⚠️ SPEC_06 §9 (alter Stand) — Migration erweitert | ✅ SPEC_07 §13 + SPEC_07_PASS2 §5 | Old/New API parallel (IMP-4) |
| food_preference_items | ✅ SPEC_02 §18 / SPEC_02_PASS2 §27 | ⚠️ SPEC_06 §9 — Migration ergänzt severity/source, aber **nicht** target_type CHECK auf 'cuisine' | ✅ SPEC_07_PASS2 §5 | CHECK-Erweiterung fehlt (CRIT-3) |
| nutrient_reference_values | ✅ SPEC_02_PASS2 §22 | ✅ Migration | ✅ SPEC_07_PASS2 §8 | Seed-Daten pending (bekannt) |
| coach_nutrition_suggestions | ✅ SPEC_02_PASS2 §28 | ❌ **fehlt im Migration-SQL** | ✅ SPEC_07_PASS2 §6 | **CRIT-1** Tabelle fehlt komplett |
| nutrition_targets | ✅ SPEC_02 §19 | ✅ SPEC_06 §14 | ✅ SPEC_07 §6 | `fiber_target DEFAULT 30` semantisch unscharf (MIN-6) |
| micro_flags | ✅ SPEC_02 §21 | ✅ SPEC_06 §15 | ⚠️ Indirect via Summary | OK |
| daily_nutrition_summary VIEW | ✅ SPEC_02 §20 | ✅ SPEC_06 §16 | ✅ SPEC_07 §7 | OK |
| Micronutrient Review (Food + Supplements) | ✅ implicit über meal_items.nutrients + Supplements-API | ✅ kein eigenes Schema notwendig | ✅ SPEC_07_PASS2 §3 | OK — Supplements-API-Boundary korrekt |

---

## File-by-File Findings

| Datei | Finding | Severity | Empfohlene Aktion |
|---|---|---|---|
| `NUTRITION_NEXT_SPEC_DECISIONS.md` | konsistent, deckt §6, §7, §11–§14, §18–§22 ab | OK | keine |
| `SPEC_02_ENTITIES.md` | älterer Stand der `food_preferences`/`_items`-Entities (Entity 18); wird durch PASS2 §26/§27 abgelöst, aber nicht explizit als deprecated markiert | Minor | Header-Hinweis "siehe SPEC_02_PASS2_ENTITIES.md für Pass-2-Stand" |
| `SPEC_02_ENTITIES.md` | `Recipe.source` enthält nicht `buddy` (Z. ~10) | Minor | siehe ADR-Konflikt aus Review 1 |
| `SPEC_02_PASS2_ENTITIES.md` | Entity 28 `CoachNutritionSuggestion` definiert, aber kein DDL irgendwo | Critical | siehe CRIT-1 |
| `SPEC_02_PASS2_ENTITIES.md` | Entity 27 fügt `target_type = cuisine` hinzu, aber kein Ziel-Feld definiert | Critical | siehe CRIT-3 |
| `SPEC_06_DATABASE_SCHEMA.md` | Master-Schema und Schluss-Block "V1 Korrekturen" widersprechen sich | Critical | siehe CRIT-2 |
| `SPEC_06_DATABASE_SCHEMA.md` | Hardcodierte RDA-Werte in `nutrient_defs` ohne Source-Attribution | Important | siehe IMP-5 |
| `SPEC_06_DATABASE_SCHEMA.md` | GRANTs-Block ohne neue Tabellen | Minor | siehe MIN-1 |
| `SPEC_06_DATABASE_SCHEMA.md` | `Recipe`-Tabelle ohne `source`-Spalte | Minor | siehe MIN-2 |
| `SPEC_06_PATCH_V1_DECISIONS.md` | Status "EINGEARBEITET", faktisch nur in Migration | Minor | Status präzisieren |
| `SPEC_06_V1_MIGRATION.sql` | Kein `CREATE TABLE coach_nutrition_suggestions` | Critical | siehe CRIT-1 |
| `SPEC_06_V1_MIGRATION.sql` | `food_preference_items.target_type` CHECK nicht auf `cuisine` erweitert | Critical | siehe CRIT-3 |
| `SPEC_06_V1_MIGRATION.sql` | `meal_items.data_source` Spalte redundant zu `food_source` | Important | siehe IMP-1 |
| `SPEC_06_V1_MIGRATION.sql` | RLS-Policy `food_portions_custom_user` erlaubt User-Schreibrechte auf BLS-Portionen | Important | siehe IMP-2 |
| `SPEC_06_V1_MIGRATION.sql` | Snapshot-History/Audit fehlt — nur `snapshot_version` Zähler | Critical | siehe CRIT-4 |
| `SPEC_07_API.md` | §14 MealCam alter 2-Endpoint-Flow — wird von PASS2 abgelöst, aber nicht markiert | Important | siehe IMP-3 |
| `SPEC_07_API.md` | §13 Preferences alte API parallel zur PASS2-API | Important | siehe IMP-4 |
| `SPEC_07_API.md` | §1 Search-Response `is_custom: bool` vs. PASS2 `food_source: string` | Important | siehe IMP-6 |
| `SPEC_07_API.md` | §9–§11 Recipes/Shopping/MealPlans als V1 ohne Hinweis | Important | siehe IMP-9 |
| `SPEC_07_API.md` | Kein Recalculate-Endpoint | Critical | siehe CRIT-4 |
| `SPEC_07_PASS2_PATCH.md` | Routing-Reihenfolge für `/foods/:id/portions` nicht explizit vor `/foods/:id` | Important | siehe IMP-7 |
| `SPEC_07_PASS2_PATCH.md` | `mealcam_scans.confidence_level` Mapping zur per-Item-`confidence` nicht belegt | Minor | siehe MIN-3 |
| `NUTRIENT_REFERENCE_VALUES_SEED_STRUCTURE.md` | Seed-Daten pending (bekannt aus Pass 2 Open Items #2) | OK (kein neues Finding) | außerhalb dieses Reviews |
| `ADR_BLS_ONLY.md` | konsistent mit Datenmodell | OK | keine |
| `ADR_CUSTOM_FOODS_V1.md` | `custom_allergens` Feld erwähnt, aber nicht im Schema (gehört zu ADR_IMPROVEMENTS_PACKAGE #18) | nicht belegt — außerhalb dieses Review-Scopes | — |
| `ADR_MEALCAM_V1.md` | konsistent mit `mealcam_scans` Schema | OK | keine |
| `ADR_MEALCAM_CONSENT.md` | Consent-Felder im Schema vorhanden (`training_consent`, `image_stored`) | OK | keine |
| `ADR_SUPPLEMENTS_API_BOUNDARY.md` | API-Boundary in PASS2 §3 korrekt umgesetzt; keine Supplement-Tabellen in Nutrition | OK | keine |
| `ADR_NUTRITION_PREFERENCES_V1.md` | Hard/Strong/Soft/Boost in Migration via `severity`-Spalte; Decay/Override via `source`-Spalte | OK | keine |
| `ADR_COACH_PERMISSIONS_V1.md` | konsistent mit API-Endpoints; Permission-Tabelle selbst nicht im Nutrition-Schema (vermutlich Auth-Schema) | nicht belegt — Auth-Permission-Tabelle nicht in diesem Scope | — |

---

## Workorder Readiness

| Bereich | Ready for Workorders? | Voraussetzung |
|---|---|---|
| BLS Foods CRUD + Search | ✅ Ja | — |
| Custom Foods CRUD | ⚠️ Teilweise | Master-Schema-Sync (CRIT-2) klären, sonst WO baut altes CHECK |
| Food Portions | ⚠️ Teilweise | RLS-Fix (IMP-2) und Routing-Reihenfolge (IMP-7) klären |
| Food Tags / Auto-Tagging | ✅ Ja | — |
| Diary Logging (Meals + Items) | ⚠️ Teilweise | Recalculate-API + Audit-Tabelle entscheiden (CRIT-4); `data_source`/`food_source` Doppelspalte klären (IMP-1) |
| Water Logs | ✅ Ja | — |
| Nutrition Targets | ✅ Ja | `fiber_target DEFAULT 30` semantisch klären (MIN-6) |
| Micronutrient Review | ⚠️ Teilweise | nutrient_reference_values Seed-Daten beschaffen (bekannt); RDA-Quellenkonflikt (IMP-5) lösen |
| MealCam V1 | ⚠️ Teilweise | SPEC_07 §14 vs. PASS2 §4 explizit auflösen (IMP-3); Confidence-Mapping (MIN-3); Vision-Provider-Entscheidung (bekannt aus Pass 2 Open Items #1) |
| Nutrition Preferences | ❌ Nein | CRIT-3 (target_type cuisine) blockiert; IMP-4 (alte/neue API) klären |
| Coach Permissions + Suggestions | ❌ Nein | CRIT-1 (Tabelle fehlt) blockiert |
| Recipes (V1 Schema-only) | ⚠️ Teilweise | V1-Status-Marker in SPEC_07 §9 (IMP-9); Recipe.source mit `buddy` (MIN-2) |
| Meal Plans (V1 Schema-only) | ⚠️ Teilweise | V1-Status-Marker (IMP-9); `logged_via` Enum (MIN-7) |
| Shopping Lists (V1 Schema-only) | ⚠️ Teilweise | V1-Status-Marker (IMP-9) |

---

## Recommended Fixes For Sonnet

Konkrete kurze Fix-Anweisungen ohne Code-Implementation. **Nur Spec-Files ändern.**

### FIX-1 — `coach_nutrition_suggestions` DDL ergänzen (CRIT-1)

In `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\SPEC_06_V1_MIGRATION.sql` einen neuen DDL-Block ergänzen:

```sql
-- --------------------------------------------------------
-- NEU: coach_nutrition_suggestions
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS nutrition.coach_nutrition_suggestions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  coach_id        UUID NOT NULL,
  suggestion_type TEXT NOT NULL
    CHECK (suggestion_type IN ('nutrition_target','meal_plan','food_alternative','water_goal',
                               'custom_food_correction','micronutrient_comment','mealcam_comment',
                               'diary_flag','preference')),
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','expired')),
  payload         JSONB NOT NULL,
  expires_at      TIMESTAMPTZ DEFAULT now() + INTERVAL '7 days',
  decided_at      TIMESTAMPTZ,
  decision_note   TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coach_sugg_user_status
  ON nutrition.coach_nutrition_suggestions(user_id, status);

ALTER TABLE nutrition.coach_nutrition_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coach_sugg_user_select" ON nutrition.coach_nutrition_suggestions
  FOR SELECT USING (auth.uid()::text = user_id::text);
-- Coach-Einsicht/Schreiben über Service Role oder separater Coach-JWT-Policy klären.
```

GRANT-Block in derselben Datei am Ende ergänzen:
```sql
GRANT SELECT ON nutrition.coach_nutrition_suggestions TO authenticated;
GRANT ALL ON nutrition.coach_nutrition_suggestions TO service_role;
```

### FIX-2 — `food_preference_items.target_type` CHECK auf `cuisine` erweitern (CRIT-3)

In `SPEC_06_V1_MIGRATION.sql` ergänzen:

```sql
-- --------------------------------------------------------
-- FIX 6: food_preference_items.target_type erweitert um 'cuisine'
-- --------------------------------------------------------
ALTER TABLE nutrition.food_preference_items
  DROP CONSTRAINT IF EXISTS food_preference_items_target_type_check;

ALTER TABLE nutrition.food_preference_items
  ADD CONSTRAINT food_preference_items_target_type_check
    CHECK (target_type IN ('food','category','tag','cuisine'));

-- Für 'cuisine' wird tag_code als Cuisine-Code-Feld weiterverwendet,
-- mit tag_definitions.tag_type = 'cuisine'.
-- Alternativ: separate cuisine_id-Spalte hinzufügen — Entscheidung pending.

-- exactly_one_target CHECK ggf. anpassen wenn cuisine_id ergänzt wird.
```

In `SPEC_02_PASS2_ENTITIES.md §27` klarstellen, ob Cuisine über `tag_code` (mit `tag_type = 'cuisine'` in `tag_definitions`) oder über separates `cuisine_id`-Feld referenziert wird.

### FIX-3 — `SPEC_06_DATABASE_SCHEMA.md` Master-Schema mit Migration synchronisieren (CRIT-2)

In `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\SPEC_06_DATABASE_SCHEMA.md` jeweils die `CREATE TABLE`-Statements aktualisieren:

- §2 `food_categories`: `name_th TEXT` Spalte ergänzen
- §8 `foods_custom`: `source CHECK (source IN ('user','manual','import','admin'))` korrigieren; `name_th TEXT` Spalte ergänzen
- §10 `meal_items`: `food_source CHECK (food_source IN ('bls','custom','mealcam','manual'))` korrigieren; `snapshot_version`, `data_source`, `scan_id` Spalten dokumentieren (oder `data_source` entfernen — siehe FIX-5)
- §11 `recipes`: `source TEXT NOT NULL DEFAULT 'user'` mit CHECK auf `('user','coach','marketplace','buddy')` ergänzen + `source_ref_id UUID`
- Tabellen-Index oben ergänzen um: `nutrition.nutrient_reference_values`, `nutrition.food_portions`, `nutrition.user_recent_portions`, `nutrition.mealcam_scans`, `nutrition.coach_nutrition_suggestions`
- §18 GRANTs-Block um die fünf neuen Tabellen ergänzen
- Schluss-Block "V1 Korrekturen" beibehalten als Zusammenfassung, aber explizit: "Master-Schema oben enthält bereits alle Korrekturen — Migration siehe SPEC_06_V1_MIGRATION.sql für Idempotenz."

### FIX-4 — Recalculate-API + Audit-Modell ergänzen (CRIT-4)

In `D:\GitHub\LumeOS-Claude-V1\docs\specs\Nutrition\SPEC_07_PASS2_PATCH.md` neuen Abschnitt §9 ergänzen:

```
## 9. Recalculate-Endpoint und Audit

### POST /api/nutrition/meals/:mealId/items/:itemId/recalculate

Erzeugt neuen Snapshot aus aktuellen Food-Daten.

**Was intern passiert:**
1. Aktuellen meal_item-Snapshot in `nutrition.meal_item_snapshot_history` archivieren
2. Aus `food_nutrients` neu skalieren auf `amount_g`
3. `meal_items.snapshot_version` inkrementieren
4. `meal_items.nutrients` JSONB überschreiben
5. Direkte Makro-Spalten neu setzen
6. Audit-Log-Eintrag mit `triggered_by: 'user_manual'` schreiben

### POST /api/nutrition/summary/:date/recalculate

Tagesaggregat aus aktuellen meal_items neu aufbauen.

### Schema-Ergänzung

Migration soll Audit-Tabelle ergänzen:
```sql
CREATE TABLE nutrition.meal_item_snapshot_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_item_id    UUID NOT NULL REFERENCES nutrition.meal_items(id) ON DELETE CASCADE,
  snapshot_version INTEGER NOT NULL,
  nutrients_old   JSONB NOT NULL,
  amount_g_old    NUMERIC(8,2) NOT NULL,
  triggered_by    TEXT CHECK (triggered_by IN ('user_manual','system_recalc')),
  archived_at     TIMESTAMPTZ DEFAULT now()
);
```
```

In `SPEC_06_V1_MIGRATION.sql` das oben genannte DDL ergänzen.

### FIX-5 — `meal_items.data_source` redundante Spalte klären (IMP-1)

In `SPEC_06_V1_MIGRATION.sql` Block "FIX 4: meal_items" einen Kommentar ergänzen:

```sql
-- HINWEIS: data_source ist semantisch identisch zu food_source.
-- Entscheidung pending: entweder data_source entfernen oder
-- food_source = "Welche Quell-Tabelle?" und data_source = "Welche Eingabe-Methode?" trennen.
-- Bis zur Entscheidung: data_source = food_source spiegeln.
```

Empfehlung: `data_source` entfernen (Drop) — `food_source` reicht.

### FIX-6 — RLS-Policy für `food_portions` korrigieren (IMP-2)

In `SPEC_06_V1_MIGRATION.sql` Policy `food_portions_custom_user` ersetzen:

```sql
-- BLS-Portionen: lesbar für alle, NICHT vom User schreibbar
DROP POLICY IF EXISTS "food_portions_custom_user" ON nutrition.food_portions;

CREATE POLICY "food_portions_select_all" ON nutrition.food_portions
  FOR SELECT USING (true);

-- Custom-Food-Portions: nur Eigentümer schreibt
CREATE POLICY "food_portions_custom_owner_write" ON nutrition.food_portions
  FOR INSERT WITH CHECK (
    custom_food_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM nutrition.foods_custom fc
      WHERE fc.id = food_portions.custom_food_id AND auth.uid()::text = fc.user_id::text
    )
  );
CREATE POLICY "food_portions_custom_owner_update" ON nutrition.food_portions
  FOR UPDATE USING (
    custom_food_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM nutrition.foods_custom fc
      WHERE fc.id = food_portions.custom_food_id AND auth.uid()::text = fc.user_id::text
    )
  );
CREATE POLICY "food_portions_custom_owner_delete" ON nutrition.food_portions
  FOR DELETE USING (
    custom_food_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM nutrition.foods_custom fc
      WHERE fc.id = food_portions.custom_food_id AND auth.uid()::text = fc.user_id::text
    )
  );
-- BLS-Portionen Pflege durch service_role (Editorial / BLS-Import)
```

In `SPEC_07_PASS2_PATCH.md §2` `POST /api/nutrition/foods/:id/portions/user` klären: "User-eigene Portionen für BLS-Foods werden NICHT direkt in `food_portions` geschrieben, sondern nur in `user_recent_portions`. `food_portions` ist editorial."

Alternative: `food_portions` um `user_id`-Spalte erweitern für user-eigene BLS-Portionen.

### FIX-7 — SPEC_07 §14 (MealCam) und §13 (Preferences) als deprecated markieren (IMP-3, IMP-4)

In `SPEC_07_API.md` §14 oben einfügen:
```
> **Deprecated** — siehe `SPEC_07_PASS2_PATCH.md §4` für aktuellen V1-Flow (5 Schritte).
> Endpoints unten entsprechen Pre-Pass-2-Stand und werden durch PASS2-Endpoints ersetzt.
```

Analog §13 oben einfügen:
```
> **Teilweise abgelöst** — siehe `SPEC_07_PASS2_PATCH.md §5` für V1-Onboarding/Settings/Coach-Suggestion-Flows.
> Folgende Endpoints bleiben gültig: GET /preferences, DELETE /preferences/items/:id.
> Folgende Endpoints sind abgelöst: PUT /preferences (→ PUT /preferences/settings), POST /preferences/items (→ in Onboarding-Body integriert).
```

### FIX-8 — V1-Status pro Endpoint in SPEC_07 §9–§11 (IMP-9)

In `SPEC_07_API.md` §9, §10, §11 jeweils oben einfügen:
```
> **V1-Status:** Schema-only / Phase 2.
> Endpoints sind dokumentiert, aber V1-Implementierung optional.
> Wenn V1-Zeit knapp: Endpoints geben `501 Not Implemented` mit
> `error: "FEATURE_PHASE_2"` zurück. Siehe `SPEC_07_PASS2_PATCH.md §7`.
```

### FIX-9 — Search-Response konsistent (IMP-6)

In `SPEC_07_API.md §1` Response-Schema die `is_custom`-Zeile ersetzen durch:
```
"food_source": "bls",     // "bls" | "custom"
"matched_via": "name",    // "name" | "alias" | "fuzzy" | "tag"
"matched_alias": null,
```
und `is_custom` entfernen. Damit ist SPEC_07 §1 mit SPEC_07_PASS2_PATCH §1 konsistent.

### FIX-10 — Routing-Reihenfolge `/foods/:id/portions` explizit (IMP-7)

In `SPEC_07_PASS2_PATCH.md` Routing-Block ergänzen:
```ts
// /foods/:id/portions MUSS vor /foods (gemounted in SPEC_07) registriert werden,
// damit /foods/:id nicht zuerst matcht.
app.route('/api/nutrition/foods/smart-search',  smartSearchRouter)
app.route('/api/nutrition/foods/custom',        customFoodsRouter)
app.route('/api/nutrition/foods/:id/portions',  portionsRouter)
app.route('/api/nutrition/foods',               foodsRouter)
```

### FIX-11 — RDA-Quellen-Attribution in `nutrient_defs` ergänzen oder Werte deprecaten (IMP-5)

In `SPEC_06_DATABASE_SCHEMA.md` §1 nach den `UPDATE`-Statements einen Hinweisblock ergänzen:
```
> **Hinweis (April 2026):** Die rda_male/rda_female-Werte hier sind DACH 2020-Werte
> (Erwachsene 25–50 Jahre). Sie dienen als Convenience-Felder.
> Authoritative Source-of-Truth für Scoring ist `nutrition.nutrient_reference_values`
> mit pro-Eintrag-Quelle (siehe SPEC_06_V1_MIGRATION.sql).
> Bei Konflikt zwischen `nutrient_defs.rda_*` und `nutrient_reference_values.rda` gilt
> `nutrient_reference_values`.
```

Optional in einer späteren Migration: `nutrient_defs.rda_male`/`rda_female`/`rda_unit` als deprecated markieren oder entfernen, sobald `nutrient_reference_values` Seed-Daten vollständig sind.

### FIX-12 — `meal_items.portion_name` ergänzen (MIN-4)

In `SPEC_06_V1_MIGRATION.sql` ergänzen:
```sql
ALTER TABLE nutrition.meal_items
  ADD COLUMN IF NOT EXISTS portion_name TEXT;
```

In `SPEC_02_ENTITIES.md §9 MealItem` und `SPEC_02_PASS2_ENTITIES.md` ergänzen.
In `SPEC_07_API.md §4 POST /meals/:mealId/items` Body-Schema um `portion_name?: string` erweitern.

### FIX-13 — `mealcam_scans.confidence_level`-Mapping dokumentieren (MIN-3)

In `SPEC_07_PASS2_PATCH.md §4` Block "Schritt 1" ergänzen:
```
**confidence_level Mapping:**
- `high`     → alle detected_items mit confidence ≥ 0.80
- `suggest`  → mindestens ein Item zwischen 0.50 und 0.80
- `low`      → max-confidence < 0.50 oder unsicher
(genaue Schwellwerte können angepasst werden — Mapping deterministisch im Service-Layer.)
```

### FIX-14 — `meal_plan_logs.logged_via` enum erweitern (MIN-7)

In `SPEC_06_V1_MIGRATION.sql` ergänzen:
```sql
ALTER TABLE nutrition.meal_plan_logs
  DROP CONSTRAINT IF EXISTS meal_plan_logs_logged_via_check;

ALTER TABLE nutrition.meal_plan_logs
  ADD CONSTRAINT meal_plan_logs_logged_via_check
    CHECK (logged_via IN ('mealcam','manual','recipe','plan_ghost'));
```

Analog SPEC_02 und SPEC_07 ergänzen.

### FIX-15 — `MealCam detected_items` und `user_corrections` als JSONB dokumentieren (IMP-8)

In `SPEC_02_PASS2_ENTITIES.md §25 MealCamScan` einen Hinweis ergänzen:
```
**Hinweis:** detected_items und user_corrections sind als JSONB-Arrays innerhalb dieser Tabelle modelliert,
nicht als separate Tabellen. Vorteil: einfache Migration. Nachteil: Aggregations-Queries
(z. B. "Welches Food wird am häufigsten korrigiert?") erfordern JSONB-Auswertung.
Eine Normalisierung in eigene Tabellen `mealcam_detected_items` und `mealcam_user_corrections`
ist Phase-2-Option, falls Trainings-Pipeline strukturiertere Queries braucht.
```

---

## Out-of-Scope-Hinweis

Folgende Dateien aus dem Nutrition Spec Pfad wurden für diesen Review **bewusst nicht gelesen** (außerhalb Review-2-Scope):

- `INDEX.md`, `SPEC_01_MODULE_CONTRACT.md`, alle `SPEC_03_*.md`, `SPEC_04_FEATURES.md`, `SPEC_05_FOOD_TAXONOMY.md`, `SPEC_07_PATCH_APRIL2026.md`, `SPEC_08_IMPORT_PIPELINE.md`, `SPEC_09_*.md`, `SPEC_10_*.md`
- ADRs außerhalb der gelisteten: `ADR_GHOST_ENTRY_RECIPE.md`, `ADR_RECIPES_SCHEMA_ONLY.md`, `ADR_RECIPE_SOURCE_BUDDY.md`, `ADR_WATER_TOTAL_HYDRATION.md`, `ADR_IMPROVEMENTS_PACKAGE.md`
- Patch-Dokumente: `SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md`, `SPEC_02_PATCH_MEALPLANLOG_ADR.md`, `SPEC_02_PATCH_NOTES.md`, `SPEC_03_FLOW4_RECIPE_PATCH.md`

Hier können weitere Inkonsistenzen liegen, die das Datenmodell betreffen (insbesondere `SPEC_02_PATCH_ENTITY07_CUSTOMFOOD.md` für `custom_allergens` und `SPEC_02_PATCH_MEALPLANLOG_ADR.md` für Plan-Log-Details). Sollte in nachfolgenden Reviews geprüft werden.

Ebenfalls nicht geprüft (Scope-Ausschluss): `docs/BrainstormDocs/Nutrition/new/spec`, andere Modul-Specs, `system/**`, `apps/**`, `packages/**`, `supabase/**`, `tools/**`.

Konsistenz mit dem Implementierungsstand der Nutrition-Services in `services/nutrition-api/` wurde nicht geprüft — gehört zur Implementierungs-Review.

---

*Ende OPUS_REVIEW_NUTRITION_02_DATA_API.md*
