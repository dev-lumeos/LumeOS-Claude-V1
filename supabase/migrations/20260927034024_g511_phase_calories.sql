-- G-511: Die aktive Phase ist die Quelle des Kalorienziels.
-- Eine gespeicherte Zielzeile gehoert genau einer Phase und gilt nur,
-- solange diese Phase am Stichtag laeuft. Die fuenf bestehenden, noch
-- aus profiles.nutrition_goal gerechneten Zeilen bleiben als Altbestand
-- erhalten; phase_id bleibt dort bewusst NULL und der Leser blendet sie aus.

ALTER TABLE goals.nutrition_targets
  ADD COLUMN IF NOT EXISTS phase_id UUID;

CREATE UNIQUE INDEX IF NOT EXISTS goal_phases_id_user_id_uq
  ON goals.goal_phases (id, user_id);

CREATE INDEX IF NOT EXISTS nutrition_targets_phase_id_idx
  ON goals.nutrition_targets (phase_id);

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
END $$;

COMMENT ON COLUMN goals.nutrition_targets.phase_id IS
  'G-511: Phase, aus der diese Zielzeile gerechnet wurde. NULL bezeichnet ausschliesslich den vor G-511 erhaltenen, ungeklaerten Altbestand.';

CREATE OR REPLACE FUNCTION goals.nutrition_target_assign_phase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF NEW.phase_id IS NULL THEN
    SELECT p.phase_id
    INTO NEW.phase_id
    FROM goals.phase_am(NEW.user_id, NEW.gueltig_ab) AS p;
  END IF;

  IF NEW.phase_id IS NULL OR NOT EXISTS (
    SELECT 1
    FROM goals.goal_phases AS gp
    WHERE gp.id = NEW.phase_id
      AND gp.user_id = NEW.user_id
      AND gp.gueltig_ab <= NEW.gueltig_ab
      AND (gp.actual_end_date IS NULL OR gp.actual_end_date >= NEW.gueltig_ab)
  ) THEN
    RAISE EXCEPTION 'nutrition_targets: keine aktive Phase am Gueltigkeitstag'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS nutrition_targets_assign_phase
  ON goals.nutrition_targets;
CREATE TRIGGER nutrition_targets_assign_phase
  BEFORE INSERT OR UPDATE OF user_id, gueltig_ab, phase_id
  ON goals.nutrition_targets
  FOR EACH ROW
  EXECUTE FUNCTION goals.nutrition_target_assign_phase();

REVOKE ALL ON FUNCTION goals.nutrition_target_assign_phase() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.nutrition_target_assign_phase() TO authenticated, service_role;

DROP FUNCTION IF EXISTS goals.zielwerte_am(UUID, DATE);
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
  fiber_g         NUMERIC,
  linoleic_acid_g NUMERIC,
  alpha_linolenic_acid_g NUMERIC,
  nutrition_goal  TEXT,
  kalorienfaktor  NUMERIC,
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
    CASE WHEN p.birth_date IS NULL THEN NULL
         ELSE EXTRACT(YEAR FROM age(p_stichtag, p.birth_date))::INTEGER
    END AS alter_jahre
  FROM public.profiles AS p
  WHERE p.id = p_user_id
),
profil_eins AS (
  SELECT
    pr.birth_date, pr.biological_sex, pr.height_cm, pr.body_weight_kg,
    pr.activity_level, pr.alter_jahre,
    ARRAY_REMOVE(ARRAY[
      CASE WHEN pr.birth_date     IS NULL THEN 'birth_date'     END,
      CASE WHEN pr.biological_sex IS NULL THEN 'biological_sex' END,
      CASE WHEN pr.height_cm      IS NULL THEN 'height_cm'      END,
      CASE WHEN pr.body_weight_kg IS NULL THEN 'body_weight_kg' END,
      CASE WHEN pr.activity_level IS NULL THEN 'activity_level' END
    ], NULL) AS fehlend
  FROM (SELECT 1) AS seed
  LEFT JOIN profil AS pr ON true
),
phase_eins AS (
  SELECT
    ph.phase_id,
    ph.phase_type,
    ph.parameters,
    CASE
      WHEN ph.phase_type = 'maintenance' THEN 0::NUMERIC
      WHEN ph.phase_type = 'lean_bulk'
        AND jsonb_typeof(ph.parameters -> 'calorie_surplus') = 'number'
        THEN (ph.parameters ->> 'calorie_surplus')::NUMERIC
      ELSE NULL
    END AS kalorien_delta,
    CASE ph.phase_type
      WHEN 'maintenance' THEN 'maintain'
      WHEN 'lean_bulk' THEN 'gain_muscle'
      ELSE NULL
    END AS abgeleitetes_ziel
  FROM (SELECT 1) AS seed
  LEFT JOIN LATERAL goals.phase_am(p_user_id, p_stichtag) AS ph ON true
),
faktoren AS (
  SELECT * FROM (VALUES
    ('sedentary',   1.200::NUMERIC),
    ('light',       1.375),
    ('moderate',    1.550),
    ('active',      1.725),
    ('very_active', 1.900)
  ) AS f(stufe, faktor)
),
gerechnet AS (
  SELECT
    p.*,
    ph.phase_id,
    ph.phase_type,
    ph.kalorien_delta,
    ph.abgeleitetes_ziel,
    f.faktor AS akt_faktor,
    CASE
      WHEN p.body_weight_kg IS NULL OR p.height_cm IS NULL
        OR p.alter_jahre IS NULL OR p.biological_sex IS NULL THEN NULL
      ELSE ROUND(
        10 * p.body_weight_kg + 6.25 * p.height_cm - 5 * p.alter_jahre
        + CASE WHEN p.biological_sex = 'male' THEN 5 ELSE -161 END, 1)
    END AS bmr_wert
  FROM profil_eins AS p
  CROSS JOIN phase_eins AS ph
  LEFT JOIN faktoren AS f ON f.stufe = p.activity_level
),
abgeleitet AS (
  SELECT
    g.*,
    ROUND(g.bmr_wert * g.akt_faktor, 1) AS tdee_wert,
    CASE
      WHEN g.phase_id IS NULL OR cardinality(g.fehlend) > 0
        OR g.kalorien_delta IS NULL THEN NULL
      ELSE ROUND(g.bmr_wert * g.akt_faktor + g.kalorien_delta, 1)
    END AS kcal_wert
  FROM gerechnet AS g
),
makros AS (
  SELECT
    a.*,
    CASE WHEN a.kcal_wert IS NULL THEN NULL
         ELSE ROUND(a.body_weight_kg * 2, 1) END AS protein_wert,
    CASE WHEN a.kcal_wert IS NULL THEN NULL
         ELSE ROUND(a.kcal_wert * 0.25 / 9, 1) END AS fett_wert,
    CASE WHEN a.kcal_wert IS NULL THEN NULL ELSE 30.0::NUMERIC END AS fiber_wert,
    CASE WHEN a.kcal_wert IS NULL THEN NULL
         ELSE ROUND(a.kcal_wert * 0.04 / 9, 1) END AS linolsaeure_wert,
    CASE WHEN a.kcal_wert IS NULL THEN NULL
         ELSE ROUND(a.kcal_wert * 0.005 / 9, 1) END AS alpha_linolensaeure_wert
  FROM abgeleitet AS a
)
SELECT
  m.bmr_wert,
  m.tdee_wert,
  m.kcal_wert,
  m.protein_wert,
  CASE WHEN m.kcal_wert IS NULL THEN NULL
       ELSE ROUND(GREATEST(m.kcal_wert - (m.protein_wert * 4 + m.fett_wert * 9), 0) / 4, 1)
  END,
  m.fett_wert,
  m.fiber_wert,
  m.linolsaeure_wert,
  m.alpha_linolensaeure_wert,
  m.abgeleitetes_ziel,
  NULL::NUMERIC,
  CASE
    WHEN m.phase_id IS NULL THEN 'keine_aktive_phase'
    WHEN cardinality(m.fehlend) > 0 THEN 'profil_unvollstaendig'
    WHEN m.kalorien_delta IS NULL THEN 'phasenparameter_fehlt'
    ELSE NULL
  END,
  m.fehlend
FROM makros AS m;
$$;

COMMENT ON FUNCTION goals.berechne_zielwerte(UUID, DATE) IS
  'G-511: reine Zielwertfunktion. BMR/TDEE stammen aus dem Profil; Zielkalorien stammen ausschliesslich aus der am Stichtag aktiven Phase. Ohne Phase keine Zielwerte und Hindernis keine_aktive_phase.';

REVOKE ALL ON FUNCTION goals.berechne_zielwerte(UUID, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.berechne_zielwerte(UUID, DATE)
  TO authenticated, service_role;

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
  fiber_g      NUMERIC,
  linoleic_acid_g NUMERIC,
  alpha_linolenic_acid_g NUMERIC,
  herkunft     TEXT,
  tdee         NUMERIC,
  nutrition_goal TEXT
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT t.gueltig_ab, t.kcal, t.protein_g, t.carbs_g, t.fat_g, t.fiber_g,
         t.linoleic_acid_g, t.alpha_linolenic_acid_g,
         t.herkunft, t.tdee, t.nutrition_goal
  FROM goals.nutrition_targets AS t
  JOIN goals.goal_phases AS gp
    ON gp.id = t.phase_id
   AND gp.user_id = t.user_id
  WHERE t.user_id = p_user_id
    AND t.gueltig_ab <= p_stichtag
    AND gp.gueltig_ab <= p_stichtag
    AND (gp.actual_end_date IS NULL OR gp.actual_end_date >= p_stichtag)
  ORDER BY t.gueltig_ab DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION goals.zielwerte_am(UUID, DATE) IS
  'G-511: die juengste Zielzeile der am Stichtag laufenden Phase. Ohne aktive Phase oder ohne Zielzeile dieser Phase keine Zeile.';

REVOKE ALL ON FUNCTION goals.zielwerte_am(UUID, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.zielwerte_am(UUID, DATE)
  TO authenticated, service_role;
