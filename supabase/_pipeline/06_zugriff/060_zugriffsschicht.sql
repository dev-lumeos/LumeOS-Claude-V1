-- =============================================================
-- 060 — Zugriffsschicht (M1 Teil A)
-- Datum: 2026-08-02 · Anker: b38770b
-- Zweck: Extension, Suchindizes, Grants und RLS, damit supabase-js
--        (PostgREST) das Schema `nutrition` nutzen kann.
--        Voraussetzung in config.toml: `nutrition` in [api].schemas (Teil B).
-- Idempotent: Extension/Indizes per IF NOT EXISTS, Grants sind von Natur
--        aus wiederholbar, Policies per DROP POLICY IF EXISTS + CREATE.
-- Läuft NACH 051 (alle 11 Tabellen müssen existieren).
--
-- Quellen:
--   [read] Trigram-Definitionen aus supabase/_archive/20240522_002_… Z. 271, 296.
--          Z. 270 (idx_foods_name_de_trgm) ist dort ein fehlbenanntes Duplikat
--          derselben Definition auf name_display und wird bewusst NICHT
--          übernommen (identischer Index unter zweitem Namen = reiner Ballast).
--   [cmd]  2026-08-02: food_curation_candidates und food_curation_decisions
--          haben KEINE user_id-Spalte (information_schema.columns) —
--          sie bekommen RLS ohne Policy: kein Zugriff für authenticated,
--          service_role arbeitet daran vorbei (rolbypassrls = true, [cmd]).
--          Offene Frage an Tom: sollen Curation-Tabellen eine user_id
--          bekommen oder bleiben sie ein reiner Service-Role-Arbeitsbereich?
-- =============================================================

BEGIN;

-- -------------------------------------------------------------
-- 1. Extension pg_trgm — Voraussetzung für die Trigram-Indizes.
--    [cmd] 2026-08-02: im Container nicht installiert.
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- -------------------------------------------------------------
-- 2. Trigram-GIN-Indizes für die Food-Suche.
--    Definitionen wörtlich aus _archive/20240522_002 übernommen
--    (je Spalte einer, siehe Kopfkommentar).
-- -------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_foods_name_display ON nutrition.foods USING GIN (name_display gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_food_aliases_alias_trgm ON nutrition.food_aliases USING GIN (alias gin_trgm_ops);

-- -------------------------------------------------------------
-- 3. Rechte.
--    Ausgangslage [cmd] 2026-08-02: keinerlei Grants auf `nutrition`,
--    Schema-ACL leer. PostgREST prüft Tabellenrechte VOR RLS —
--    ohne Grant ist jede Policy wirkungslos.
-- -------------------------------------------------------------

-- 3a. Schema betreten dürfen.
GRANT USAGE ON SCHEMA nutrition TO authenticated, service_role;

-- 3b. Stammdaten: Lesen für authenticated.
GRANT SELECT ON
  nutrition.foods,
  nutrition.food_nutrients,
  nutrition.nutrient_defs,
  nutrition.food_categories,
  nutrition.food_tags,
  nutrition.food_aliases,
  nutrition.tag_definitions
TO authenticated;

-- 3c. Nutzerdaten mit user_id: DML für authenticated.
--     Bewusste Ergänzung über den Wortlaut des Auftrags hinaus:
--     die Policies unter 4b wären ohne Tabellenrechte toter Text
--     (PostgREST: erst Grant, dann RLS). Zeilen-Eingrenzung übernimmt RLS.
--     Die Curation-Tabellen bekommen KEINE authenticated-Grants.
GRANT SELECT, INSERT, UPDATE, DELETE ON
  nutrition.food_preferences,
  nutrition.food_preference_items
TO authenticated;

-- 3d. service_role: volle Rechte auf alle 11 Tabellen.
GRANT ALL ON
  nutrition.foods,
  nutrition.food_nutrients,
  nutrition.nutrient_defs,
  nutrition.food_categories,
  nutrition.food_tags,
  nutrition.food_aliases,
  nutrition.tag_definitions,
  nutrition.food_preferences,
  nutrition.food_preference_items,
  nutrition.food_curation_candidates,
  nutrition.food_curation_decisions
TO service_role;

-- 3e. Default-Privileges für künftige Tabellen im Schema
--     (angelegt vom ausführenden Superuser/postgres): gleiche Linie.
--     Neue Nutzerdaten-Tabellen brauchen ihre DML-Grants + Policies
--     weiterhin explizit — Default ist bewusst nur SELECT/ALL.
ALTER DEFAULT PRIVILEGES IN SCHEMA nutrition GRANT SELECT ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA nutrition GRANT ALL ON TABLES TO service_role;

-- -------------------------------------------------------------
-- 4. Row Level Security.
--    Ausgangslage [cmd] 2026-08-02: RLS nur auf food_preferences und
--    food_preference_items (je 1 Policy FOR ALL ohne Rollenbindung);
--    die übrigen 9 Tabellen offen. Ziel: RLS überall an, Policies
--    nach Datenklasse.
-- -------------------------------------------------------------

-- 4a. RLS aktivieren — alle 11 Tabellen (idempotent).
ALTER TABLE nutrition.foods                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_nutrients           ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.nutrient_defs            ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_categories          ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_tags                ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_aliases             ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.tag_definitions          ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_preferences         ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_preference_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_curation_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition.food_curation_decisions  ENABLE ROW LEVEL SECURITY;

-- 4b. Stammdaten: genau eine Lese-Policy je Tabelle.
--     Keine Schreib-Policies — Importe laufen als service_role
--     (bypassrls) an RLS vorbei.
DROP POLICY IF EXISTS foods_select ON nutrition.foods;
CREATE POLICY foods_select ON nutrition.foods
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS food_nutrients_select ON nutrition.food_nutrients;
CREATE POLICY food_nutrients_select ON nutrition.food_nutrients
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS nutrient_defs_select ON nutrition.nutrient_defs;
CREATE POLICY nutrient_defs_select ON nutrition.nutrient_defs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS food_categories_select ON nutrition.food_categories;
CREATE POLICY food_categories_select ON nutrition.food_categories
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS food_tags_select ON nutrition.food_tags;
CREATE POLICY food_tags_select ON nutrition.food_tags
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS food_aliases_select ON nutrition.food_aliases;
CREATE POLICY food_aliases_select ON nutrition.food_aliases
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS tag_definitions_select ON nutrition.tag_definitions;
CREATE POLICY tag_definitions_select ON nutrition.tag_definitions
  FOR SELECT TO authenticated USING (true);

-- 4c. Nutzerdaten: getrennte Policies je Operation, auth.uid() = user_id.
--     Ersetzt die zwei Alt-Policies (FOR ALL, ohne Rollenbindung,
--     ohne WITH CHECK — ein INSERT-Leck, weil USING allein INSERTs
--     nicht prüft). user_id ist uuid, auth.uid() liefert uuid —
--     direkter Vergleich, der ::text-Cast der Alt-Policies entfällt.

-- food_preferences
DROP POLICY IF EXISTS food_prefs_owner ON nutrition.food_preferences;
DROP POLICY IF EXISTS food_preferences_select ON nutrition.food_preferences;
DROP POLICY IF EXISTS food_preferences_insert ON nutrition.food_preferences;
DROP POLICY IF EXISTS food_preferences_update ON nutrition.food_preferences;
DROP POLICY IF EXISTS food_preferences_delete ON nutrition.food_preferences;

CREATE POLICY food_preferences_select ON nutrition.food_preferences
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY food_preferences_insert ON nutrition.food_preferences
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY food_preferences_update ON nutrition.food_preferences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY food_preferences_delete ON nutrition.food_preferences
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- food_preference_items
DROP POLICY IF EXISTS food_pref_items_owner ON nutrition.food_preference_items;
DROP POLICY IF EXISTS food_preference_items_select ON nutrition.food_preference_items;
DROP POLICY IF EXISTS food_preference_items_insert ON nutrition.food_preference_items;
DROP POLICY IF EXISTS food_preference_items_update ON nutrition.food_preference_items;
DROP POLICY IF EXISTS food_preference_items_delete ON nutrition.food_preference_items;

CREATE POLICY food_preference_items_select ON nutrition.food_preference_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY food_preference_items_insert ON nutrition.food_preference_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY food_preference_items_update ON nutrition.food_preference_items
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY food_preference_items_delete ON nutrition.food_preference_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4d. Curation-Tabellen: RLS an (4a), KEINE Policies.
--     [cmd] Beide haben keine user_id-Spalte — eine auth.uid()-Policy
--     ist nicht formulierbar. Ergebnis: authenticated hat weder Grant
--     noch Policy (dicht), service_role arbeitet via bypassrls.
--     → offene Frage an Tom, siehe Kopfkommentar.

COMMIT;
