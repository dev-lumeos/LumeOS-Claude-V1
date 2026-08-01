# Datenbank — Live-Schema und Entwürfe

**Stand:** 2026-08-01
**Methode:** `[cmd]` Verzeichnislisten `supabase/`, `db/`; alle 7 Migrationen und
beide Entwurfsdateien vollständig gelesen; Greps auf `create table`/`alter table`
in den Slices; Diff Entwurf gegen Duplikat. Zugriff auf den lokalen Container
wurde versucht: `[cmd]` 2026-08-01 `docker exec … psql` schlug fehl (Docker
Desktop nicht gestartet) — **der tatsächliche Zustand der lokalen DB ist in
dieser Sitzung nicht verifiziert.** Alles unten beschreibt Dateien im Repo.

---

## Überblick: drei getrennte Schema-Welten

| Welt | Ort | Modell | Status |
|---|---|---|---|
| Nutrition-EAV (Live-Kandidat) | `supabase/migrations/2024*` | EAV, Schema `nutrition` | `[read]` als reguläre Migration formuliert; `[annahme]` auf lokalen Container angewendet |
| Governance-Control-Plane | `supabase/migrations/2026042*` | flach, Schema `public` | Altlast, siehe `50-governance-rest.md` |
| Diary-Entwurf | `db/schema/nutrition.sql` | flach, Schema `public` | **nicht verdrahtet**, Konflikt zum EAV-Modell |

---

## Die 7 Migrationen in `supabase/migrations/`

`[cmd]` 2026-08-01, Verzeichnisliste:

| Datei | Inhalt |
|---|---|
| `20240522_001_nutrition_schema_foundation.sql` | `[read]` Nur `CREATE SCHEMA nutrition`, Extensions `pg_trgm` + `pgcrypto`, Grants. Keine Tabellen. |
| `20240522_002_nutrition_food_core_tables.sql` | `[read]` **Das EAV-Core.** 7 Tabellen, Seeds, Auto-Tagging, RLS. Detail unten. |
| `20260423120000_control_plane_tables.sql` | `[read]` Governance: `governance_artefacts`, `wo_failure_events`, `workorders` (+ Enums `wo_type`/`wo_state`/`wo_phase`), `execution_tokens`. RLS an, keine Policies → nur Service-Role. |
| `20260424_002_wo_classifier_fields.sql` | `[read]` Nur `ALTER TABLE workorders`: 12 Classifier-Spalten (`assigned_spark`, `wo_module`, `wo_priority` …) + 3 Indizes. |
| `20260513_001_nutrition_schema_foundation_slice.sql` | `[read]` Header: `STATUS: EXECUTION_CANDIDATE_REVIEW_ONLY` / „DO NOT EXECUTE". Enthält `create table nutrition.nutrient_defs` (Z. 64) in einem `do $$`-Block hinter `to_regclass`-Guard; Drift-Validierung mit `raise exception`. Keine Seeds, keine RLS, keine Grants, kein DOWN. |
| `20260513_002_nutrition_nutrient_defs_th_i18n_slice.sql` | `[read]` Gleicher Review-Status. **Einzige Slice ohne `CREATE TABLE`**: nur `alter table … add column name_th / group_th` (Z. 163, 173). Bricht ab, wenn die Tabelle fehlt oder bereits Daten enthält. |
| `20260514_001_nutrition_food_foundation_slice.sql` | `[read]` Header: `STATUS: LOCAL_EXECUTION_CANDIDATE` (nur lokal/Test, kein DEV/LIVE). Enthält `create table nutrition.foods` (Z. 69) und `create table nutrition.food_nutrients` (Z. 149) hinter `to_regclass`-Guards. |

**Korrektur zu TODO D-02** („Slice-Migrationen enthalten kein CREATE TABLE"):
`[cmd]` Grep 2026-08-01 — zwei der drei enthalten sehr wohl `CREATE TABLE`,
nur kleingeschrieben und in `do $$`-Blöcken versteckt. Nur `20260513_002`
ist reines `ALTER TABLE`.

**Einordnung der Slices:** Alle drei tragen `AUTHORIZATION BOUNDARY`-Header,
`SOURCE CHAIN` (auf `docs/project/p1-005/` und
`docs/specs/Nutrition/01_current_specs/SPEC_06_DATABASE_SCHEMA.md`) und
explizit **kein ausführbares DOWN**. Sie sind Review-Kandidaten im
Migrationsordner, keine freigegebenen Migrationen. `[annahme]` Ob sie je gegen
den lokalen Container gelaufen sind, ist ungeprüft.

---

## Das EAV-Core im Detail (`20240522_002`, 30 KB)

`[read]` vollständig gelesen. 7 Tabellen im Schema `nutrition`:

| Tabelle | Rolle |
|---|---|
| `nutrient_defs` | Attribut-Katalog des EAV. Per `INSERT … ON CONFLICT DO UPDATE` geseedet; `sort_index` läuft 1–138 (BLS-Nährstoffkatalog), `display_tier` 1–3, Formeln für berechnete Werte. |
| `food_categories` | Kategorie-Hierarchie: `parent_id` self-reference, `level CHECK (1,2,3,4)`, mehrsprachig de/en/th, `slug`, `bls_hint`. |
| `foods` | Entity-Tabelle. Hybrid: 11 denormalisierte Makro-Spalten (`enercc`, `prot625`, `fat`, `cho`, `fibt`, `sugar`, `fasat`, `nacl`, `alc`, `water_g`, `enercj`), `bls_code UNIQUE`, `sort_weight 0–1000`, `processing_level` (10-Werte-CHECK), trgm-GIN-Indizes auf `name_display`. |
| `food_nutrients` | EAV-Kern: `PRIMARY KEY (food_id, nutrient_code)`, `value NUMERIC(12,5)`, `data_source`, FKs auf `foods` und `nutrient_defs`. |
| `food_aliases` | `PRIMARY KEY (food_id, alias, locale)`, `source CHECK ('editorial','ai_generated','user')`, trgm-GIN auf `alias`. |
| `tag_definitions` | 16 Tags geseedet (high_protein, vegan, gluten_free …), `tag_type` 6 Werte, teils mit `macro_rule` JSONB. |
| `food_tags` | `PRIMARY KEY (food_id, tag_code)`, `confidence 0–1`. |

Dazu: Funktion `nutrition.auto_tag_food(uuid)` (deterministisches Tagging nach
Makro-Schwellen, Kategorie-Slugs und Namens-Regexen), Trigger `trg_foods_auto_tag`
auf `foods`.

**RLS:** `[read]` Auf allen 7 Tabellen aktiviert; Policies per `DO`-Schleife
erzeugt: `FOR SELECT TO authenticated USING (true)` — **öffentlicher Lesezugriff
für eingeloggte Nutzer, kein `auth.uid()`, keine Schreib-Policies.** Schreiben
kann nur `service_role` (GRANT ALL).

---

## Der Diary-Entwurf: `db/schema/nutrition.sql`

`[read]` vollständig gelesen (104 Zeilen). Ein konkurrierender Entwurf, der in
**keiner** Migration unter `supabase/migrations/` auftaucht und von keinem Code
verwendet wird (Verdrahtung: siehe `20-apps-web-ist.md`).

Unterschiede zum EAV-Live-Kandidaten:

| | EAV (`20240522_002`) | Diary-Entwurf |
|---|---|---|
| Schema | `nutrition.` | keins (public) |
| Nährstoffe | `food_nutrients`-Tabelle (EAV) | feste Makro-Spalten + `micronutrients JSONB` |
| Schlüssel | `bls_code TEXT` | `bls_key VARCHAR(10)` |
| Kategorien | Hierarchie-Tabelle, 4 Ebenen | `category TEXT` |
| RLS | SELECT-für-alle | echte User-RLS mit `auth.uid() = user_id` |

Tabellen: `foods`, `food_portions`, `diary_days` (`UNIQUE(user_id, entry_date)`),
`meal_logs` (Soft-Delete `deleted_at`), `meal_items`, `daily_nutrition_summaries`.

**Befund:** `[read]` `meal_items` bekommt `ENABLE ROW LEVEL SECURITY` (Z. 89),
aber **keine Policy** — die Tabelle wäre für `authenticated` faktisch gesperrt.
Vermutlich ein Versehen im Entwurf.

**Duplikat:** `[cmd]` Diff 2026-08-01 — `db/migrations/20260423_001_nutrition_initial.sql`
ist bis auf `CREATE EXTENSION "uuid-ossp"`, Kommentare und Policy-Formatierung
identisch. Alle übrigen `db/`-Unterordner (`contracts/`, `local-dev/`,
`local-main/`, `remote-dev/`, `remote-main/`, `seeds/`) enthalten `[cmd]` nur
`.gitkeep`.

**Konflikt EAV vs. flach ist der Blocker für die Diary-Verdrahtung**
(TODO C-03, ADR-003). Der Entwurf zeigt außerdem das einzige Beispiel echter
User-RLS im Repo — relevant für TODO D-08 (supabase-js vs. Docker-SQL).

---

## Tabellen im Code ohne Migration: `food_curation_*`

`nutrition.food_curation_candidates` und `nutrition.food_curation_decisions`
werden vom Curation-Feature genutzt, stehen aber in keiner Migration.

Verifizierter Befund:

- `[read]` `apps/web/src/lib/nutrition/curation.ts:156` —
  `buildNutritionCurationPersistenceSql()` enthält das vollständige DDL inline
  (`CREATE TABLE IF NOT EXISTS …`, Z. 158 und 179).
- `[cmd]` Grep 2026-08-01: Diese Funktion wird **nur vom Unit-Test**
  (`__tests__/curation.test.ts`) aufgerufen — keine Seite, keine Route führt
  sie aus. **Die App legt die Tabellen also nicht selbst zur Laufzeit an.**
- `[read]` Der Lese-Pfad (`buildNutritionCurationSql()`, Z. 284–288) ist per
  `to_regclass`-Guards abgesichert und funktioniert auch ohne die Tabellen
  (liefert dann 0-Zähler).
- `[read]` Dasselbe DDL existiert als eigenständige Datei:
  `docs/project/p1-005/P1-005-local-curation-persistence-foundation.sql`
  (Header: „local-only curation persistence foundation … Local Supabase/Test DB
  only"), daneben `…-validation.sql`.

**Antwort auf TODO D-01:** Die DDL-Quelle ist gefunden (p1-005 + Inline-Kopie im
Code). `[annahme]` Die Tabellen wurden manuell per p1-005-SQL gegen den lokalen
Container ausgeführt — welcher Weg genau, ist nicht belegt und mangels laufendem
Docker nicht prüfbar.

---

## Weitere SQL-Quellen im Repo

- `[cmd]` `supabase/snippets/`: 3 Dateien (`Untitled query 110/425/844.sql`),
  alle vom 2026-05-13. `[read]` Reine Introspektion über
  `nutrition.nutrient_defs` (Indizes, Constraints, Spalten) — identisch mit den
  „POST-APPLY VALIDATION QUERIES" aus den Slice-Headern. Reste einer
  Studio-Sitzung, löschbar (TODO D-03).
- `[read]` `docs/specs/Nutrition/03_sql/` — Spec-seitige SQL-Entwürfe
  (siehe `40-spec-code-matrix.md`).
- `[cmd]` `docs/project/p1-005/` — ~30 Arbeitsdateien (Apply-/Validation-SQL,
  Reports) rund um die lokale Nutrition-Foundation.
- `[annahme]` `temp/lumeosold/` enthält SQL-Dumps des Vorgängerrepos
  (aus Agentenbericht, nicht selbst geprüft; `temp/` steht ohnehin zur
  Löschung an, TODO A-05).

---

## Offene Punkte

1. `[annahme]` Anwendungsstand der Migrationen auf dem lokalen Container —
   prüfen, sobald Docker läuft: Tabellenliste, `name_th`-Spalte (Slice 20260513_002
   gelaufen?), Existenz `food_curation_*`. → TODO D-01/D-02-Nachtrag.
2. Modellkonflikt EAV vs. flach (ADR-003) — Architekturentscheidung Tom (TODO C-03).
3. Kein Schreibpfad, keine User-Tabellen im EAV-Strang — Preferences/Diary
   brauchen neue Migrationen (TODO C-02, ADR-002).
