-- =============================================================
-- 110 — Schema `goals`: Zielwerte (GO-03, GO-04)
-- Datum: 2026-08-16
-- Zweck: Die vier Zahlen, gegen die das Tagebuch rechnet — kcal,
--        Protein, Kohlenhydrate, Fett je Tag. Dazu die reine Funktion,
--        die sie aus dem Profil herleitet.
-- Idempotent: CREATE ... IF NOT EXISTS, Policies per DROP + CREATE,
--             Funktion per CREATE OR REPLACE mit vorherigem DROP.
--
-- =============================================================
-- WARUM EIN EIGENES SCHEMA
-- =============================================================
-- [read] Entscheidung Tom, 2026-08-15: eigenes `goals`-Schema, nicht
-- `nutrition`. Der Umsetzungsplan hatte das Gegenteil vorgeschlagen
-- (eine Tabelle am falschen Ort ist billiger zu verschieben als ein
-- leeres Schema zu rechtfertigen) — die Entscheidung faellt anders,
-- und sie hat den besseren Beleg:
-- [cmd] `nutrition_targets` steht in `daten/schema-sollstand.json`
-- bereits unter `nicht_erwartet` mit dem Vermerk „gehoert zu Goals
-- (C-06), von keinem Kettenschritt angelegt"; `055_water_logs.sql`
-- haelt dasselbe fest. Der Ort war also schon zweimal notiert, bevor
-- die Tabelle existierte.
--
-- =============================================================
-- WARUM MIT GUELTIGKEITSDATUM
-- =============================================================
-- Vier Spalten reichen nicht. Wer heute von „abnehmen" auf „halten"
-- wechselt, aendert damit rueckwirkend die Deckungsgrade jedes
-- vergangenen Tages — das Tagebuch zeigte dann Zahlen, gegen die
-- niemand gelebt hat.
--
-- Dieselbe Frage hat `meal_items` bereits beantwortet: dort stehen
-- EINGEFRORENE Naehrwerte, nicht Verweise auf `food_nutrients`
-- (ADR-0003). Hier ist es ein Zeitraum statt eines Schnappschusses,
-- weil ein Ziel bis auf Weiteres gilt und nicht zu einem Ereignis
-- gehoert.
--
-- `gueltig_ab` ist Teil des Schluessels. Ein neues Ziel legt eine neue
-- Zeile an; die alte bleibt stehen. Welche Zeile fuer einen Tag gilt,
-- beantwortet `goals.zielwerte_am`.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS goals;

COMMENT ON SCHEMA goals IS
  'Ziele und Zielwerte (GO-03 aufwaerts). Heute nur die Tagesziele; '
  'user_goals, goal_phases und die Modulbeitraege sind GO-07 aufwaerts.';

-- -------------------------------------------------------------
-- 1. Die Zielwerte.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goals.nutrition_targets (
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Ab wann diese Zeile gilt. Teil des Schluessels — siehe Kopf.
  gueltig_ab   DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Die vier Zahlen. NULL ist erlaubt und heisst „nicht bestimmbar",
  -- nicht „null Gramm" — dieselbe Regel wie in der Tagessumme (C-04).
  kcal         NUMERIC(7,1),
  protein_g    NUMERIC(6,1),
  carbs_g      NUMERIC(6,1),
  fat_g        NUMERIC(6,1),

  -- Woher der Wert kommt. Ohne diese Angabe ist spaeter nicht
  -- unterscheidbar, ob jemand die Zahl gesetzt oder die Formel sie
  -- geschaetzt hat — und das ist der Unterschied zwischen einer
  -- Messung und einer Vermutung (siehe Bericht, „Was die Zahlen nicht
  -- sagen").
  herkunft     TEXT NOT NULL DEFAULT 'formel'
    CHECK (herkunft IN ('formel', 'manuell')),

  -- Der TDEE, aus dem die Zielkalorien entstanden. Bei 'manuell' NULL.
  tdee         NUMERIC(7,1),

  -- Die Zielrichtung, die beim Rechnen galt. Aendert sie sich, entsteht
  -- eine neue Zeile — die alte bleibt gueltig fuer ihre Tage.
  nutrition_goal TEXT,

  notiz        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (user_id, gueltig_ab),

  -- Negative Ziele gibt es nicht. Die Obergrenzen sind weit gewaehlt:
  -- sie fangen Tippfehler ab, nicht Extremfaelle.
  CONSTRAINT nutrition_targets_kcal_check
    CHECK (kcal IS NULL OR (kcal >= 500 AND kcal <= 10000)),
  CONSTRAINT nutrition_targets_protein_check
    CHECK (protein_g IS NULL OR (protein_g >= 0 AND protein_g <= 500)),
  CONSTRAINT nutrition_targets_carbs_check
    CHECK (carbs_g IS NULL OR (carbs_g >= 0 AND carbs_g <= 1500)),
  CONSTRAINT nutrition_targets_fat_check
    CHECK (fat_g IS NULL OR (fat_g >= 0 AND fat_g <= 500))
);

COMMENT ON TABLE goals.nutrition_targets IS
  'Tagesziele je Nutzerin, ab einem Datum gueltig (GO-03). Ein Wechsel '
  'legt eine neue Zeile an; die alte bleibt fuer ihre Tage gueltig, '
  'damit vergangene Deckungsgrade nicht rueckwirkend kippen.';
COMMENT ON COLUMN goals.nutrition_targets.gueltig_ab IS
  'Ab wann diese Zeile gilt. Teil des Primaerschluessels.';
COMMENT ON COLUMN goals.nutrition_targets.herkunft IS
  'formel = aus goals.berechne_zielwerte, manuell = von Hand gesetzt.';

CREATE INDEX IF NOT EXISTS idx_nutrition_targets_user_ab
  ON goals.nutrition_targets(user_id, gueltig_ab DESC);

-- -------------------------------------------------------------
-- 2. Rechte. PostgREST prueft Tabellenrechte VOR RLS — ohne Grant ist
--    jede Policy toter Text (Begruendung woertlich aus 060, 3c).
-- -------------------------------------------------------------
GRANT USAGE ON SCHEMA goals TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON goals.nutrition_targets
  TO authenticated;
GRANT ALL ON goals.nutrition_targets TO service_role;

-- -------------------------------------------------------------
-- 3. Zeilenschutz und Policies je Operation.
--    ACHTUNG: RLS ohne Policy sperrt die Tabelle vollstaendig
--    (ADR-0003). Deshalb alle vier.
-- -------------------------------------------------------------
ALTER TABLE goals.nutrition_targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS nutrition_targets_select ON goals.nutrition_targets;
DROP POLICY IF EXISTS nutrition_targets_insert ON goals.nutrition_targets;
DROP POLICY IF EXISTS nutrition_targets_update ON goals.nutrition_targets;
DROP POLICY IF EXISTS nutrition_targets_delete ON goals.nutrition_targets;

CREATE POLICY nutrition_targets_select ON goals.nutrition_targets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY nutrition_targets_insert ON goals.nutrition_targets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY nutrition_targets_update ON goals.nutrition_targets
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY nutrition_targets_delete ON goals.nutrition_targets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- =============================================================
-- 4. GO-04 — die Berechnung als REINE Funktion.
-- =============================================================
-- SIE SCHREIBT NICHT. Profil hinein, vier Zahlen heraus. Wann die
-- Werte in die Tabelle kommen, ist eine eigene Frage — Begruendung im
-- Bericht.
--
-- WOHER DIE FORMELN STAMMEN
-- [cmd] `referenz/lumeos-2026/src/modules/nutrition/hooks/useTDEE.ts`
-- und `.../onboarding/utils/calculateTDEE.ts`. Beide rechnen
-- Mifflin-St Jeor und wenden den Aktivitaetsfaktor an — die Formel in
-- `docs/specs/Goals/SCORING.md` liefert nur den BMR und laesst den
-- Faktor ungenutzt.
--
-- WO SIE VONEINANDER ABWEICHEN, und was hier gilt:
--   * Aktivitaet: `useTDEE.ts` benutzt die fuenf Stufen, die auch
--     `profiles.activity_level` fuehrt. `calculateTDEE.ts` leitet sie
--     aus `trainingFrequency` (2-7) ab. GEWAEHLT: die fuenf Stufen —
--     [cmd] die Spalte existiert, `trainingFrequency` nicht.
--   * Zuschlag: `calculateTDEE.ts` rechnet Prozent, `useTDEE.ts`
--     absolute kcal. GEWAEHLT: Prozent, Begruendung in
--     `daten/zielrichtung-kalorienzuschlag.json`.
--   * Fett: `calculateTDEE.ts` nimmt 25 % der ZIELKALORIEN,
--     `useTDEE.ts` einen Anteil des RESTS nach Protein. GEWAEHLT:
--     25 % der Zielkalorien — der Rest-Ansatz laesst den Fettanteil
--     mit dem Proteinbedarf schwanken, und bei hohem Protein und
--     niedrigen Kalorien faellt er unter die Untergrenze, die
--     PHASE_MODELS.md nennt (0,5 g/kg).
--
-- WAS NICHT UEBERNOMMEN WURDE:
--   * Die Altersrechnung. [cmd] `calculateTDEE.ts` rechnet
--     `getFullYear() - Geburtsjahr` — wer im Dezember geboren ist, gilt
--     das ganze Jahr als ein Jahr aelter. Hier `age()`, das den Tag
--     beruecksichtigt. Der Fehler ist klein (5 kcal je Jahr), aber er
--     ist ein Fehler.
--   * Der Ruecktritt `|| 1.55` auf „moderate", wenn die Stufe fehlt.
--     Fehlt sie, gibt es hier keine Zahl.
-- =============================================================

DROP FUNCTION IF EXISTS goals.berechne_zielwerte(UUID, DATE);

CREATE FUNCTION goals.berechne_zielwerte(
  p_user_id UUID,
  p_stichtag DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  bmr             NUMERIC,
  tdee            NUMERIC,
  kcal            NUMERIC,
  protein_g       NUMERIC,
  carbs_g         NUMERIC,
  fat_g           NUMERIC,
  nutrition_goal  TEXT,
  kalorienfaktor  NUMERIC,
  -- Warum es NICHT gerechnet werden konnte. NULL heisst: es ging.
  hindernis       TEXT,
  fehlende_felder TEXT[]
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH profil AS (
  SELECT
    p.birth_date,
    p.biological_sex,
    p.height_cm,
    p.body_weight_kg,
    p.activity_level,
    p.nutrition_goal,
    -- age() beruecksichtigt Monat und Tag, anders als der Vorgaenger.
    CASE WHEN p.birth_date IS NULL THEN NULL
         ELSE EXTRACT(YEAR FROM age(p_stichtag, p.birth_date))::INTEGER
    END AS alter_jahre
  FROM public.profiles p
  WHERE p.id = p_user_id
),
-- Genau eine Zeile, auch wenn es kein Profil gibt.
profil_eins AS (
  SELECT
    pr.birth_date, pr.biological_sex, pr.height_cm, pr.body_weight_kg,
    pr.activity_level, pr.nutrition_goal, pr.alter_jahre,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN pr.birth_date     IS NULL THEN 'birth_date'     END,
      CASE WHEN pr.biological_sex IS NULL THEN 'biological_sex' END,
      CASE WHEN pr.height_cm      IS NULL THEN 'height_cm'      END,
      CASE WHEN pr.body_weight_kg IS NULL THEN 'body_weight_kg' END,
      CASE WHEN pr.activity_level IS NULL THEN 'activity_level' END,
      CASE WHEN pr.nutrition_goal IS NULL THEN 'nutrition_goal' END
    ], NULL) AS fehlend
  FROM (SELECT 1) seed
  LEFT JOIN profil pr ON true
),
faktoren AS (
  -- Die fuenf Stufen aus SCORING.md, wertgleich mit useTDEE.ts.
  SELECT * FROM (VALUES
    ('sedentary',   1.200::NUMERIC),
    ('light',       1.375),
    ('moderate',    1.550),
    ('active',      1.725),
    ('very_active', 1.900)
  ) AS f(stufe, faktor)
),
zuschlaege AS (
  -- Aus daten/zielrichtung-kalorienzuschlag.json. 'health' fehlt
  -- absichtlich: der Vorgaenger kennt die Zielrichtung nicht, und
  -- 0 waere eine stille Entscheidung.
  SELECT * FROM (VALUES
    ('lose_weight',   -0.20::NUMERIC),
    ('maintain',       0.00),
    ('gain_muscle',    0.10),
    ('recomposition',  0.00),
    ('performance',    0.10)
  ) AS z(ziel, faktor)
),
gerechnet AS (
  SELECT
    p.*,
    f.faktor AS akt_faktor,
    z.faktor AS ziel_faktor,
    -- Mifflin-St Jeor.
    CASE
      WHEN p.body_weight_kg IS NULL OR p.height_cm IS NULL
        OR p.alter_jahre IS NULL OR p.biological_sex IS NULL THEN NULL
      ELSE ROUND(
        10 * p.body_weight_kg + 6.25 * p.height_cm - 5 * p.alter_jahre
        + CASE WHEN p.biological_sex = 'male' THEN 5 ELSE -161 END, 1)
    END AS bmr_wert
  FROM profil_eins p
  LEFT JOIN faktoren   f ON f.stufe = p.activity_level
  LEFT JOIN zuschlaege z ON z.ziel  = p.nutrition_goal
),
abgeleitet AS (
  SELECT
    g.*,
    ROUND(g.bmr_wert * g.akt_faktor, 1) AS tdee_wert,
    ROUND(g.bmr_wert * g.akt_faktor * (1 + g.ziel_faktor), 1) AS kcal_wert
  FROM gerechnet g
),
makros AS (
  SELECT
    a.*,
    -- Protein: 2 g je kg. Beide Vorgaengerdateien sind sich einig.
    ROUND(a.body_weight_kg * 2, 1) AS protein_wert,
    -- Fett: 25 % der Zielkalorien, geteilt durch 9 kcal/g.
    ROUND(a.kcal_wert * 0.25 / 9, 1) AS fett_wert
  FROM abgeleitet a
)
SELECT
  m.bmr_wert,
  m.tdee_wert,
  m.kcal_wert,
  m.protein_wert,
  -- Kohlenhydrate sind die Restgroesse: was nach Protein und Fett
  -- uebrig bleibt, geteilt durch 4 kcal/g. [cmd] Diese Regel steht in
  -- keiner Goals-Spec, nur im Vorgaengercode.
  -- GREATEST(...,0): bei sehr niedrigen Zielkalorien und hohem
  -- Koerpergewicht kann der Rest negativ werden. Der Vorgaenger laesst
  -- das zu und liefert negative Kohlenhydrate.
  CASE WHEN m.kcal_wert IS NULL THEN NULL
       ELSE ROUND(GREATEST(m.kcal_wert - (m.protein_wert * 4 + m.fett_wert * 9), 0) / 4, 1)
  END,
  m.fett_wert,
  m.nutrition_goal,
  m.ziel_faktor,
  CASE
    WHEN cardinality(m.fehlend) > 0 THEN 'profil_unvollstaendig'
    WHEN m.ziel_faktor IS NULL      THEN 'zielrichtung_ohne_faktor'
    ELSE NULL
  END,
  m.fehlend
FROM makros m;
$$;

COMMENT ON FUNCTION goals.berechne_zielwerte(UUID, DATE) IS
  'Zielwerte aus dem Profil (GO-04). REINE Funktion — schreibt nicht. '
  'Mifflin-St Jeor mit Aktivitaetsfaktor, Zuschlag je Zielrichtung, '
  'Protein 2 g/kg, Fett 25 % der Zielkalorien, Kohlenhydrate als Rest. '
  'Fehlt etwas, stehen die Zahlen auf NULL und hindernis nennt den Grund.';

GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(UUID, DATE)
  TO authenticated, service_role;

-- -------------------------------------------------------------
-- 5. Welche Zielwerte gelten an einem Tag?
--    Die juengste Zeile, deren gueltig_ab nicht in der Zukunft liegt.
-- -------------------------------------------------------------
DROP FUNCTION IF EXISTS goals.zielwerte_am(UUID, DATE);

CREATE FUNCTION goals.zielwerte_am(
  p_user_id UUID,
  p_stichtag DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  gueltig_ab   DATE,
  kcal         NUMERIC,
  protein_g    NUMERIC,
  carbs_g      NUMERIC,
  fat_g        NUMERIC,
  herkunft     TEXT,
  tdee         NUMERIC,
  nutrition_goal TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT t.gueltig_ab, t.kcal, t.protein_g, t.carbs_g, t.fat_g,
         t.herkunft, t.tdee, t.nutrition_goal
  FROM goals.nutrition_targets t
  WHERE t.user_id = p_user_id
    AND t.gueltig_ab <= p_stichtag
  ORDER BY t.gueltig_ab DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION goals.zielwerte_am(UUID, DATE) IS
  'Die an einem Tag gueltigen Zielwerte — die juengste Zeile, deren '
  'gueltig_ab nicht nach dem Stichtag liegt. Ohne Treffer keine Zeile.';

GRANT EXECUTE ON FUNCTION goals.zielwerte_am(UUID, DATE)
  TO authenticated, service_role;

-- -------------------------------------------------------------
-- 6. Selbstpruefung.
-- -------------------------------------------------------------
DO $$
DECLARE
  v_policies INTEGER;
  v_rls      BOOLEAN;
BEGIN
  SELECT count(*) INTO v_policies
  FROM pg_policies WHERE schemaname = 'goals' AND tablename = 'nutrition_targets';
  IF v_policies <> 4 THEN
    RAISE EXCEPTION 'goals.nutrition_targets: % Policies statt 4', v_policies;
  END IF;

  SELECT c.relrowsecurity INTO v_rls
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'goals' AND c.relname = 'nutrition_targets';
  IF NOT v_rls THEN
    RAISE EXCEPTION 'goals.nutrition_targets: Zeilenschutz ist aus';
  END IF;

  RAISE NOTICE 'OK: goals.nutrition_targets mit 4 Policies und Zeilenschutz, 2 Funktionen';
END $$;

COMMIT;
