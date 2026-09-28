-- G-511 gegen E1: Eine Zielzeile gehoert ihrer Phase. Die gespeicherte
-- Eingabe ist die Zielrate; kcal sind spaeter in G-529 ihre Ableitung.
-- Diese Migration liegt zeitlich vor G-524/G-529. Sie baut deshalb den
-- phasenfesten Vertrag und einen Formel-TDEE-Fallback. G-524 ersetzt die
-- TDEE-Auswahl um "adaptive wenn reliable", G-529 schaltet die Rate frei.

BEGIN;

ALTER TABLE goals.nutrition_targets
  ADD COLUMN IF NOT EXISTS phase_id uuid,
  ADD COLUMN IF NOT EXISTS zielrate_pct_kg_woche numeric(5,3),
  ADD COLUMN IF NOT EXISTS body_weight_kg numeric(8,3),
  ADD COLUMN IF NOT EXISTS tdee_herkunft text,
  ADD COLUMN IF NOT EXISTS tdee_history_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS goal_phases_id_user_id_uq
  ON goals.goal_phases (id, user_id);

CREATE INDEX IF NOT EXISTS nutrition_targets_phase_id_idx
  ON goals.nutrition_targets (phase_id);

CREATE INDEX IF NOT EXISTS nutrition_targets_tdee_history_id_idx
  ON goals.nutrition_targets (tdee_history_id)
  WHERE tdee_history_id IS NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'goals.nutrition_targets'::regclass
      AND conname = 'nutrition_targets_phase_user_fk'
  ) THEN
    ALTER TABLE goals.nutrition_targets
      ADD CONSTRAINT nutrition_targets_phase_user_fk
      FOREIGN KEY (phase_id, user_id)
      REFERENCES goals.goal_phases (id, user_id)
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'goals.nutrition_targets'::regclass
      AND conname = 'nutrition_targets_phase_required'
  ) THEN
    ALTER TABLE goals.nutrition_targets
      ADD CONSTRAINT nutrition_targets_phase_required
      CHECK (phase_id IS NOT NULL) NOT VALID;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'goals.nutrition_targets'::regclass
      AND conname = 'nutrition_targets_tdee_herkunft_check'
  ) THEN
    ALTER TABLE goals.nutrition_targets
      ADD CONSTRAINT nutrition_targets_tdee_herkunft_check
      CHECK (tdee_herkunft IS NULL OR tdee_herkunft IN ('formula', 'adaptive'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'goals.nutrition_targets'::regclass
      AND conname = 'nutrition_targets_rate_snapshot_check'
  ) THEN
    ALTER TABLE goals.nutrition_targets
      ADD CONSTRAINT nutrition_targets_rate_snapshot_check
      CHECK (
        zielrate_pct_kg_woche IS NULL
        OR zielrate_pct_kg_woche BETWEEN -2.5 AND 1.5
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'goals.nutrition_targets'::regclass
      AND conname = 'nutrition_targets_weight_snapshot_check'
  ) THEN
    ALTER TABLE goals.nutrition_targets
      ADD CONSTRAINT nutrition_targets_weight_snapshot_check
      CHECK (body_weight_kg IS NULL OR body_weight_kg > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'goals.nutrition_targets'::regclass
      AND conname = 'nutrition_targets_formula_inputs_required'
  ) THEN
    ALTER TABLE goals.nutrition_targets
      ADD CONSTRAINT nutrition_targets_formula_inputs_required
      CHECK (
        herkunft <> 'formel'
        OR (
          zielrate_pct_kg_woche IS NOT NULL
          AND body_weight_kg IS NOT NULL
          AND tdee_herkunft IS NOT NULL
          AND (
            (tdee_herkunft = 'formula' AND tdee_history_id IS NULL)
            OR (tdee_herkunft = 'adaptive' AND tdee_history_id IS NOT NULL)
          )
        )
      ) NOT VALID;
  END IF;
END $$;

COMMENT ON COLUMN goals.nutrition_targets.phase_id IS
  'G-511: Phase, aus der diese Zielzeile gerechnet wurde. NULL bezeichnet ausschliesslich den vor G-511 erhaltenen, ungeklaerten Altbestand.';
COMMENT ON COLUMN goals.nutrition_targets.zielrate_pct_kg_woche IS
  'G-511/E1 Snapshot: die gewaehlte Phasenrate, mit der diese Zielzeile gerechnet wurde.';
COMMENT ON COLUMN goals.nutrition_targets.body_weight_kg IS
  'G-511/E1 Snapshot: Koerpergewicht, auf das die Zielrate bei dieser Rechnung wirkte.';
COMMENT ON COLUMN goals.nutrition_targets.tdee_herkunft IS
  'G-511 A2 Snapshot: formula oder adaptive; herkunft beschreibt dagegen Formel- oder Handzeile.';
COMMENT ON COLUMN goals.nutrition_targets.tdee_history_id IS
  'G-511 A2/A3: bei adaptive die konkrete G-524-Reihenzeile, sonst NULL.';

CREATE OR REPLACE FUNCTION goals.kcal_delta_aus_zielrate(
  p_zielrate_pct_kg_woche numeric,
  p_body_weight_kg numeric
)
RETURNS numeric
LANGUAGE sql
IMMUTABLE
STRICT
SET search_path = ''
AS $$
  SELECT round((11 * p_zielrate_pct_kg_woche * p_body_weight_kg)::numeric, 1);
$$;

CREATE OR REPLACE FUNCTION goals.formula_tdee(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  bmr numeric,
  tdee numeric,
  body_weight_kg numeric,
  fehlende_felder text[]
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
    CASE WHEN p.birth_date IS NULL THEN NULL
         ELSE EXTRACT(YEAR FROM age(p_stichtag, p.birth_date))::integer
    END AS alter_jahre
  FROM public.profiles p
  WHERE p.id = p_user_id
),
profil_eins AS (
  SELECT
    p.*,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN p.birth_date IS NULL THEN 'birth_date' END,
      CASE WHEN p.biological_sex IS NULL THEN 'biological_sex' END,
      CASE WHEN p.height_cm IS NULL THEN 'height_cm' END,
      CASE WHEN p.body_weight_kg IS NULL THEN 'body_weight_kg' END,
      CASE WHEN p.activity_level IS NULL THEN 'activity_level' END
    ], NULL) AS fehlend
  FROM (SELECT 1) singleton
  LEFT JOIN profil p ON true
),
faktoren AS (
  SELECT * FROM (VALUES
    ('sedentary', 1.200::numeric),
    ('light', 1.375::numeric),
    ('moderate', 1.550::numeric),
    ('active', 1.725::numeric),
    ('very_active', 1.900::numeric)
  ) f(stufe, faktor)
),
gerechnet AS (
  SELECT
    p.body_weight_kg,
    p.fehlend,
    f.faktor,
    CASE
      WHEN p.body_weight_kg IS NULL OR p.height_cm IS NULL
        OR p.alter_jahre IS NULL OR p.biological_sex IS NULL THEN NULL
      ELSE round((
        10 * p.body_weight_kg + 6.25 * p.height_cm - 5 * p.alter_jahre
        + CASE WHEN p.biological_sex = 'male' THEN 5 ELSE -161 END
      )::numeric, 1)
    END AS bmr_wert
  FROM profil_eins p
  LEFT JOIN faktoren f ON f.stufe = p.activity_level
)
SELECT
  g.bmr_wert,
  CASE WHEN g.bmr_wert IS NULL OR g.faktor IS NULL THEN NULL
       ELSE round((g.bmr_wert * g.faktor)::numeric, 1)
  END,
  g.body_weight_kg,
  g.fehlend
FROM gerechnet g;
$$;

-- G-524 ersetzt diese Formel-Auswahl spaeter durch: letzte verlaessliche
-- adaptive Reihenzeile, sonst derselbe Formelwert.
CREATE OR REPLACE FUNCTION goals.tdee_basis_am(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  tdee numeric,
  tdee_herkunft text,
  tdee_history_id uuid
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT f.tdee, 'formula'::text, NULL::uuid
  FROM goals.formula_tdee(p_user_id, p_stichtag) f;
$$;

DROP FUNCTION IF EXISTS goals.berechne_zielwerte(uuid, date);
CREATE FUNCTION goals.berechne_zielwerte(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  bmr numeric,
  tdee numeric,
  kcal numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  linoleic_acid_g numeric,
  alpha_linolenic_acid_g numeric,
  nutrition_goal text,
  kalorienfaktor numeric,
  hindernis text,
  fehlende_felder text[],
  tdee_herkunft text,
  tdee_history_id uuid,
  zielrate_pct_kg_woche numeric,
  body_weight_kg numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH formel AS (
  SELECT * FROM goals.formula_tdee(p_user_id, p_stichtag)
),
basis AS (
  SELECT * FROM goals.tdee_basis_am(p_user_id, p_stichtag)
),
phase AS (
  SELECT p.phase_id, p.phase_type
  FROM (SELECT 1) singleton
  LEFT JOIN LATERAL goals.phase_am(p_user_id, p_stichtag) p ON true
)
SELECT
  f.bmr,
  b.tdee,
  NULL::numeric,
  NULL::numeric,
  NULL::numeric,
  NULL::numeric,
  NULL::numeric,
  NULL::numeric,
  NULL::numeric,
  CASE ph.phase_type
    WHEN 'fat_loss' THEN 'lose_weight'
    WHEN 'mini_cut' THEN 'lose_weight'
    WHEN 'lean_bulk' THEN 'gain_muscle'
    WHEN 'maintenance' THEN 'maintain'
    WHEN 'recomp' THEN 'recomposition'
    ELSE NULL
  END,
  NULL::numeric,
  CASE
    WHEN ph.phase_id IS NULL THEN 'keine_aktive_phase'
    WHEN cardinality(f.fehlende_felder) > 0 THEN 'profil_unvollstaendig'
    ELSE 'phasenparameter_fehlt'
  END,
  f.fehlende_felder,
  b.tdee_herkunft,
  b.tdee_history_id,
  NULL::numeric,
  f.body_weight_kg
FROM formel f
CROSS JOIN basis b
CROSS JOIN phase ph;
$$;

CREATE OR REPLACE FUNCTION goals.nutrition_target_assign_phase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_phase_id uuid;
  v_target record;
BEGIN
  SELECT p.phase_id
  INTO v_phase_id
  FROM goals.phase_am(NEW.user_id, NEW.gueltig_ab) p;

  IF v_phase_id IS NULL THEN
    RAISE EXCEPTION 'nutrition_targets: keine aktive Phase am Gueltigkeitstag'
      USING ERRCODE = '23514';
  END IF;

  IF NEW.phase_id IS NOT NULL AND NEW.phase_id <> v_phase_id THEN
    RAISE EXCEPTION 'nutrition_targets: phase_id ist am Gueltigkeitstag nicht die aktive Phase'
      USING ERRCODE = '23514';
  END IF;
  NEW.phase_id := v_phase_id;

  IF NEW.herkunft = 'formel' THEN
    SELECT * INTO STRICT v_target
    FROM goals.berechne_zielwerte(NEW.user_id, NEW.gueltig_ab);

    IF v_target.hindernis IS NOT NULL THEN
      RAISE EXCEPTION 'nutrition_targets: %', v_target.hindernis
        USING ERRCODE = '23514';
    END IF;

    NEW.kcal := v_target.kcal;
    NEW.protein_g := v_target.protein_g;
    NEW.carbs_g := v_target.carbs_g;
    NEW.fat_g := v_target.fat_g;
    NEW.fiber_g := v_target.fiber_g;
    NEW.linoleic_acid_g := v_target.linoleic_acid_g;
    NEW.alpha_linolenic_acid_g := v_target.alpha_linolenic_acid_g;
    NEW.tdee := v_target.tdee;
    NEW.nutrition_goal := v_target.nutrition_goal;
    NEW.zielrate_pct_kg_woche := v_target.zielrate_pct_kg_woche;
    NEW.body_weight_kg := v_target.body_weight_kg;
    NEW.tdee_herkunft := v_target.tdee_herkunft;
    NEW.tdee_history_id := v_target.tdee_history_id;
  ELSE
    NEW.zielrate_pct_kg_woche := NULL;
    NEW.body_weight_kg := NULL;
    NEW.tdee_herkunft := NULL;
    NEW.tdee_history_id := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nutrition_targets_assign_phase
  ON goals.nutrition_targets;
CREATE TRIGGER nutrition_targets_assign_phase
  BEFORE INSERT OR UPDATE
  ON goals.nutrition_targets
  FOR EACH ROW
  EXECUTE FUNCTION goals.nutrition_target_assign_phase();

REVOKE ALL ON FUNCTION goals.kcal_delta_aus_zielrate(numeric, numeric)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION goals.formula_tdee(uuid, date)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION goals.tdee_basis_am(uuid, date)
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION goals.nutrition_target_assign_phase()
  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION goals.berechne_zielwerte(uuid, date)
  FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION goals.kcal_delta_aus_zielrate(numeric, numeric)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.formula_tdee(uuid, date)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.tdee_basis_am(uuid, date)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.nutrition_target_assign_phase()
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(uuid, date)
  TO authenticated, service_role;

COMMENT ON FUNCTION goals.kcal_delta_aus_zielrate(numeric, numeric) IS
  'G-529 E1: kcal/Tag = 11 x Zielrate in Prozent Koerpergewicht/Woche x Gewicht in kg.';
COMMENT ON FUNCTION goals.formula_tdee(uuid, date) IS
  'Mifflin-St Jeor mit Profil-Aktivitaetsfaktor; unabhaengiger Start- und Rueckfallwert fuer G-523/G-511.';
COMMENT ON FUNCTION goals.tdee_basis_am(uuid, date) IS
  'G-511 A2 Grundfassung: Formel-TDEE. G-524 ersetzt sie durch adaptive wenn reliable, sonst Formel.';
COMMENT ON FUNCTION goals.berechne_zielwerte(uuid, date) IS
  'G-511 Zwischenstufe vor G-529: Phase und TDEE-Basis sind gebunden; ohne die spaeter angelegte Rate gilt phasenparameter_fehlt.';

DROP FUNCTION IF EXISTS goals.zielwerte_am(uuid, date);
CREATE FUNCTION goals.zielwerte_am(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  gueltig_ab date,
  kcal numeric,
  protein_g numeric,
  carbs_g numeric,
  fat_g numeric,
  fiber_g numeric,
  linoleic_acid_g numeric,
  alpha_linolenic_acid_g numeric,
  herkunft text,
  tdee numeric,
  nutrition_goal text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT t.gueltig_ab, t.kcal, t.protein_g, t.carbs_g, t.fat_g, t.fiber_g,
         t.linoleic_acid_g, t.alpha_linolenic_acid_g,
         t.herkunft, t.tdee, t.nutrition_goal
  FROM goals.nutrition_targets t
  JOIN goals.goal_phases gp
    ON gp.id = t.phase_id
   AND gp.user_id = t.user_id
  WHERE t.user_id = p_user_id
    AND t.gueltig_ab <= p_stichtag
    AND gp.gueltig_ab <= p_stichtag
    AND (gp.actual_end_date IS NULL OR gp.actual_end_date >= p_stichtag)
  ORDER BY t.gueltig_ab DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION goals.zielwerte_am(uuid, date) IS
  'G-511: die juengste Zielzeile der am Stichtag laufenden Phase. Ohne aktive Phase oder ohne Zielzeile dieser Phase keine Zeile.';

REVOKE ALL ON FUNCTION goals.zielwerte_am(uuid, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.zielwerte_am(uuid, date)
  TO authenticated, service_role;

COMMIT;
