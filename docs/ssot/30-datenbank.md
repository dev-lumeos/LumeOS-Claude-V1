# Datenbank — Live-Schema und Entwürfe

**Stand:** 2026-08-01 (zweite Fassung — Container verifiziert)
**Methode:** `[cmd]` Verzeichnislisten `supabase/`, `db/`; alle 7 Migrationen und
beide Entwurfsdateien vollständig gelesen; Greps auf `create table`/`alter table`
in den Slices. Nachträglich am selben Tag: Container `supabase_db_LumeOS-Claude-V1`
gestartet und per `docker exec … psql` direkt abgefragt; Vollsicherung gezogen
und Restore getestet.

> **Wichtigste Korrektur gegenüber der ersten Fassung:** Der Ist-Zustand der
> Datenbank weicht erheblich von dem ab, was die Dateien im Repo beschreiben.
> Wo Datei und Container sich widersprechen, gilt der Container.

---

## Der Ist-Zustand des Containers

`[cmd]` Abfrage 2026-08-01, Container läuft (healthy).

### Migrations-Register

`supabase_migrations.schema_migrations` enthält **genau einen Eintrag**:

```
20260423120000 | control_plane_tables
```

**Keine einzige Nutrition-Migration ist als angewendet verzeichnet.**
Das gesamte Nutrition-Schema ist ausserhalb der Migrationspipeline entstanden.
Es gibt keinen Weg von `git clone` zu dieser Datenbank. → TODO D-12

### Tabellen und Bestand

| Tabelle | Spalten | Zeilen |
|---|---|---|
| `nutrition.foods` | 14 | 7.140 |
| `nutrition.food_nutrients` | 4 | 698.092 |
| `nutrition.food_aliases` | 4 | 21.420 |
| `nutrition.food_tags` | 3 | 9.265 |
| `nutrition.food_categories` | 10 | 518 |
| `nutrition.nutrient_defs` | 16 | 138 |
| `nutrition.tag_definitions` | 9 | 16 |
| `nutrition.food_preferences` | 14 | 0 |
| `nutrition.food_preference_items` | 13 | 0 |
| `nutrition.food_curation_candidates` | 12 | 0 |
| `nutrition.food_curation_decisions` | 6 | 0 |
| `public.workorders` | 37 | 4 |
| `public.execution_tokens`, `governance_artefacts`, `wo_failure_events` | – | – |

**Vier Tabellen stehen in keiner Migrationsdatei:** `food_preferences`,
`food_preference_items`, `food_curation_candidates`, `food_curation_decisions`.
DDL gesichert unter `backup/rescue/2026-08-01_verwaiste_tabellen.sql`.

### RLS: der Container widerspricht der Migration

`[cmd]` Abfrage über `pg_class.relrowsecurity` und `pg_policies`:

| Tabelle | RLS aktiviert | Policies |
|---|---|---|
| `food_preferences` | **ja** | 1 — `auth.uid()::text = user_id::text` |
| `food_preference_items` | **ja** | 1 — `auth.uid()::text = user_id::text` |
| alle übrigen 9 | **nein** | 0 |

Die Migration `20240522_002` beschreibt RLS auf allen 7 EAV-Tabellen mit
`FOR SELECT TO authenticated USING (true)`. **Im Container ist davon nichts
vorhanden** — weder Flag noch Policy. Die erste Fassung dieser Datei hat den
Dateiinhalt als Ist-Zustand ausgegeben; das war falsch.

**Architektonisch bedeutsam:** Die einzigen beiden Policies im gesamten Schema
nutzen `auth.uid()` — also das Muster des *Diary-Entwurfs*, nicht das des
EAV-Core. Der Modellkonflikt aus ADR-003 ist in der Datenbank bereits in eine
Richtung aufgelöst worden, ohne Dokumentation. Relevant für TODO D-08 und C-03.

### Die „DO NOT EXECUTE"-Slices liefen offenbar doch

`[cmd]` `name_th` existiert in `food_categories`, `foods` (plus
`name_display_th`) und `nutrient_defs` (plus `group_th`) — genau der Inhalt von
`20260513_002`, das im Kopf `EXECUTION_CANDIDATE_REVIEW_ONLY / DO NOT EXECUTE`
trägt. Wie es angewendet wurde, ist ungeklärt. → TODO D-13

---

## Sicherung und Restore

`[cmd]` 2026-08-01, Vollsicherung unter `backup/` (siehe `backup/README.md`).

**Restore-Test in eine leere Datenbank:**

- Dauer: **4,7 Sekunden**
- Alle 11 Tabellen wiederhergestellt, alle Zeilenzahlen exakt identisch
- **2 von 2 RLS-Policies gingen verloren** — `ERROR: schema "auth" does not exist`.
  `pg_restore` meldet das nur als Warnung und gilt als erfolgreich.

**Konsequenz:** Der Dump ist nur in eine echte Supabase-Instanz vollständig
zurückspielbar. In eine nackte Postgres-Datenbank restauriert er die Daten,
aber nicht die Zugriffsregeln — stillschweigend.

---

## Was die Dateien im Repo beschreiben

Ab hier: Inhalt der Dateien, **nicht** des Containers. Wo beides abweicht,
ist das oben vermerkt.

### Drei getrennte Schema-Welten

| Welt | Ort | Modell | Status |
|---|---|---|---|
| Nutrition-EAV | `supabase/migrations/2024*` | EAV, Schema `nutrition` | `[read]` als reguläre Migration formuliert; `[cmd]` **nicht** im Migrations-Register |
| Governance-Control-Plane | `supabase/migrations/2026042*` | flach, Schema `public` | `[cmd]` einzige registrierte Migration; Altlast, siehe `50-governance-rest.md` |
| Diary-Entwurf | `db/schema/nutrition.sql` | flach, Schema `public` | **nicht verdrahtet**, Konflikt zum EAV-Modell |

### Die 7 Migrationen in `supabase/migrations/`

| Datei | Inhalt |
|---|---|
| `20240522_001_nutrition_schema_foundation.sql` | `[read]` Nur `CREATE SCHEMA nutrition`, Extensions `pg_trgm` + `pgcrypto`, Grants. Keine Tabellen. |
| `20240522_002_nutrition_food_core_tables.sql` | `[read]` Das EAV-Core. 7 Tabellen, Seeds, Auto-Tagging, RLS. Detail unten. |
| `20260423120000_control_plane_tables.sql` | `[read]` Governance: `governance_artefacts`, `wo_failure_events`, `workorders` (+ Enums), `execution_tokens`. RLS an, keine Policies → nur Service-Role. |
| `20260424_002_wo_classifier_fields.sql` | `[read]` Nur `ALTER TABLE workorders`: 12 Classifier-Spalten + 3 Indizes. |
| `20260513_001_nutrition_schema_foundation_slice.sql` | `[read]` Header `EXECUTION_CANDIDATE_REVIEW_ONLY` / „DO NOT EXECUTE". Enthält `create table nutrition.nutrient_defs` (Z. 64) in `do $$` hinter `to_regclass`-Guard. Kein DOWN. |
| `20260513_002_nutrition_nutrient_defs_th_i18n_slice.sql` | `[read]` Gleicher Review-Status. Einzige Slice ohne `CREATE TABLE`: nur `alter table … add column name_th / group_th`. `[cmd]` **Im Container angewendet** — siehe D-13. |
| `20260514_001_nutrition_food_foundation_slice.sql` | `[read]` Header `LOCAL_EXECUTION_CANDIDATE`. Enthält `create table nutrition.foods` (Z. 69) und `nutrition.food_nutrients` (Z. 149). |

**Korrektur zu TODO D-02:** `[cmd]` Grep — zwei der drei Slices enthalten sehr
wohl `CREATE TABLE`, nur kleingeschrieben und in `do $$`-Blöcken. Nur
`20260513_002` ist reines `ALTER TABLE`.

**Einordnung der Slices:** Alle drei tragen `AUTHORIZATION BOUNDARY`-Header,
`SOURCE CHAIN` und explizit kein ausführbares DOWN. Formal Review-Kandidaten —
faktisch mindestens teilweise angewendet.

### Das EAV-Core laut Datei (`20240522_002`, 30 KB)

`[read]` 7 Tabellen im Schema `nutrition`:

| Tabelle | Rolle |
|---|---|
| `nutrient_defs` | Attribut-Katalog des EAV. Per `INSERT … ON CONFLICT DO UPDATE` geseedet; `sort_index` 1–138 (BLS-Katalog), `display_tier` 1–3, Formeln für berechnete Werte. |
| `food_categories` | Hierarchie: `parent_id` self-reference, `level CHECK (1,2,3,4)`, mehrsprachig de/en/th, `slug`, `bls_hint`. |
| `foods` | Entity-Tabelle. Hybrid: 11 denormalisierte Makro-Spalten (`enercc`, `prot625`, `fat`, `cho`, `fibt`, `sugar`, `fasat`, `nacl`, `alc`, `water_g`, `enercj`), `bls_code UNIQUE`, `sort_weight 0–1000`, `processing_level` (10-Werte-CHECK), trgm-GIN auf `name_display`. |
| `food_nutrients` | EAV-Kern: `PRIMARY KEY (food_id, nutrient_code)`, `value NUMERIC(12,5)`, `data_source`, FKs auf `foods` und `nutrient_defs`. |
| `food_aliases` | `PRIMARY KEY (food_id, alias, locale)`, `source CHECK ('editorial','ai_generated','user')`, trgm-GIN auf `alias`. |
| `tag_definitions` | 16 Tags geseedet, `tag_type` 6 Werte, teils mit `macro_rule` JSONB. |
| `food_tags` | `PRIMARY KEY (food_id, tag_code)`, `confidence 0–1`. |

Dazu Funktion `nutrition.auto_tag_food(uuid)` (deterministisches Tagging nach
Makro-Schwellen, Kategorie-Slugs, Namens-Regexen) und Trigger `trg_foods_auto_tag`.

**RLS laut Datei:** `[read]` auf allen 7 Tabellen aktiviert, Policies per
`DO`-Schleife, `FOR SELECT TO authenticated USING (true)`, keine Schreib-Policies.
`[cmd]` **Im Container nicht vorhanden** — siehe oben.

### Der Diary-Entwurf: `db/schema/nutrition.sql`

`[read]` 104 Zeilen. Taucht in keiner Migration auf, wird von keinem Code
verwendet (siehe `20-apps-web-ist.md`).

| | EAV (`20240522_002`) | Diary-Entwurf |
|---|---|---|
| Schema | `nutrition.` | keins (public) |
| Nährstoffe | `food_nutrients` (EAV) | feste Makro-Spalten + `micronutrients JSONB` |
| Schlüssel | `bls_code TEXT` | `bls_key VARCHAR(10)` |
| Kategorien | Hierarchie, 4 Ebenen | `category TEXT` |
| RLS | SELECT-für-alle | echte User-RLS mit `auth.uid() = user_id` |

Tabellen: `foods`, `food_portions`, `diary_days` (`UNIQUE(user_id, entry_date)`),
`meal_logs` (Soft-Delete), `meal_items`, `daily_nutrition_summaries`.

**Befund:** `[read]` `meal_items` bekommt `ENABLE ROW LEVEL SECURITY` (Z. 89),
aber keine Policy — wäre für `authenticated` faktisch gesperrt. Vermutlich Versehen.

**Duplikat:** `[cmd]` `db/migrations/20260423_001_nutrition_initial.sql` ist bis
auf `CREATE EXTENSION "uuid-ossp"`, Kommentare und Policy-Formatierung identisch.
Alle übrigen `db/`-Unterordner enthalten `[cmd]` nur `.gitkeep`.

---

## Die Curation-Tabellen: geklärt

`[cmd]` `food_curation_candidates` (12 Spalten) und `food_curation_decisions`
(6 Spalten) existieren im Container, beide leer.

- `[read]` `apps/web/src/lib/nutrition/curation.ts:156` —
  `buildNutritionCurationPersistenceSql()` enthält das DDL inline.
- `[cmd]` Diese Funktion wird **nur vom Unit-Test** aufgerufen — keine Seite,
  keine Route führt sie aus. Die App legt die Tabellen nicht zur Laufzeit an.
- `[read]` Der Lese-Pfad (Z. 284–288) ist per `to_regclass`-Guards abgesichert
  und liefert ohne die Tabellen 0-Zähler.
- `[read]` Dasselbe DDL als eigenständige Datei:
  `docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql`.

**Antwort auf TODO D-01:** DDL-Quelle gefunden. `[annahme]` Manuell per
p1-005-SQL ausgeführt; der genaue Weg ist nicht belegt. Geht in D-12 auf.

## Weitere SQL-Quellen im Repo

- `[cmd]` `supabase/snippets/`: 3 Dateien (`Untitled query 110/425/844.sql`),
  alle vom 2026-05-13. `[read]` Reine Introspektion über `nutrient_defs` —
  identisch mit den „POST-APPLY VALIDATION QUERIES" der Slice-Header.
  Studio-Reste, löschbar (TODO D-03).
- `[read]` `docs/specs/Nutrition/03_sql/` — Spec-seitige SQL-Entwürfe.
- `[cmd]` `docs/project/p1-005/` — ~30 Arbeitsdateien rund um die lokale
  Nutrition-Foundation.
- `[annahme]` `temp/lumeosold/` enthält SQL-Dumps des Vorgängerrepos
  (nicht selbst geprüft; `temp/` steht zur Löschung an, TODO A-05).

---

## Offene Punkte

1. **D-12 (höchste Priorität):** Migrationen rückbauen, bis `supabase db reset`
   den Ist-Zustand herstellt. Voraussetzung für jede lokal→dev→main-Pipeline.
2. **D-13:** Klären, wie die „DO NOT EXECUTE"-Slices angewendet wurden;
   Statusköpfe korrigieren.
3. **ADR-002 nachdokumentieren:** Das Design von `food_preferences` und
   `food_preference_items` existiert nur in der Datenbank.
4. **ADR-003 (TODO C-03):** Modellkonflikt EAV vs. flach — mit dem neuen Befund,
   dass die Preference-Tabellen bereits `auth.uid()`-RLS tragen.
5. **TODO D-08:** supabase-js vs. Docker-SQL. Der Container enthält bereits
   Auth-basierte Policies, während `apps/web` per `docker exec psql` zugreift.
