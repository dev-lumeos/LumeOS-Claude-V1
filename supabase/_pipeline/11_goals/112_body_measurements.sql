BEGIN;

CREATE SCHEMA IF NOT EXISTS goals;

CREATE TABLE IF NOT EXISTS goals.body_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date date NOT NULL,
  measurement_time time NOT NULL,
  weight_kg numeric(6,2) NOT NULL,
  body_fat_pct numeric(5,2),
  bf_method text,
  measurement_source text NOT NULL DEFAULT 'manual',
  source_detail text,
  height_cm_snapshot numeric(5,1),
  lean_mass_kg numeric(6,2) GENERATED ALWAYS AS (
    CASE
      WHEN body_fat_pct IS NULL THEN NULL
      ELSE round((weight_kg * (1 - body_fat_pct / 100))::numeric, 2)
    END
  ) STORED,
  fat_mass_kg numeric(6,2) GENERATED ALWAYS AS (
    CASE
      WHEN body_fat_pct IS NULL THEN NULL
      ELSE round((weight_kg * body_fat_pct / 100)::numeric, 2)
    END
  ) STORED,
  bmi numeric(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN height_cm_snapshot IS NULL THEN NULL
      ELSE round((weight_kg / ((height_cm_snapshot / 100.0) * (height_cm_snapshot / 100.0)))::numeric, 2)
    END
  ) STORED,
  ffmi numeric(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN body_fat_pct IS NULL OR height_cm_snapshot IS NULL THEN NULL
      ELSE round((
        (weight_kg * (1 - body_fat_pct / 100))
        / ((height_cm_snapshot / 100.0) * (height_cm_snapshot / 100.0))
        + 6.1 * (1.8 - (height_cm_snapshot / 100.0))
      )::numeric, 2)
    END
  ) STORED,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT body_measurements_weight_ck CHECK (weight_kg BETWEEN 20 AND 400),
  CONSTRAINT body_measurements_body_fat_ck CHECK (body_fat_pct IS NULL OR body_fat_pct BETWEEN 2 AND 70),
  CONSTRAINT body_measurements_height_ck CHECK (height_cm_snapshot IS NULL OR height_cm_snapshot BETWEEN 80 AND 250),
  CONSTRAINT body_measurements_method_ck CHECK (
    bf_method IS NULL OR bf_method IN (
      'caliper_3',
      'caliper_7',
      'dexa',
      'bia',
      'visual',
      'hydrostatic',
      'navy',
      'durnin',
      'jackson_pollock',
      'manual'
    )
  ),
  CONSTRAINT body_measurements_source_ck CHECK (
    measurement_source IN ('manual', 'device', 'import', 'admin')
  ),
  CONSTRAINT body_measurements_user_date_time_uq UNIQUE (user_id, measurement_date, measurement_time)
);

CREATE TABLE IF NOT EXISTS goals.body_circumferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measurement_date date NOT NULL,
  measurement_time time NOT NULL,
  neck_cm numeric(5,1),
  shoulders_cm numeric(5,1),
  chest_cm numeric(5,1),
  upper_arm_left_cm numeric(5,1),
  upper_arm_right_cm numeric(5,1),
  forearm_left_cm numeric(5,1),
  forearm_right_cm numeric(5,1),
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  thigh_left_cm numeric(5,1),
  thigh_right_cm numeric(5,1),
  calf_left_cm numeric(5,1),
  calf_right_cm numeric(5,1),
  measurement_source text NOT NULL DEFAULT 'manual',
  source_detail text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT body_circumferences_user_date_time_uq UNIQUE (user_id, measurement_date, measurement_time),
  CONSTRAINT body_circumferences_at_least_one_ck CHECK (
    neck_cm IS NOT NULL OR shoulders_cm IS NOT NULL OR chest_cm IS NOT NULL
    OR upper_arm_left_cm IS NOT NULL OR upper_arm_right_cm IS NOT NULL
    OR forearm_left_cm IS NOT NULL OR forearm_right_cm IS NOT NULL
    OR waist_cm IS NOT NULL OR hip_cm IS NOT NULL
    OR thigh_left_cm IS NOT NULL OR thigh_right_cm IS NOT NULL
    OR calf_left_cm IS NOT NULL OR calf_right_cm IS NOT NULL
  ),
  CONSTRAINT body_circumferences_positive_ck CHECK (
    (neck_cm IS NULL OR neck_cm BETWEEN 10 AND 80)
    AND (shoulders_cm IS NULL OR shoulders_cm BETWEEN 40 AND 220)
    AND (chest_cm IS NULL OR chest_cm BETWEEN 40 AND 220)
    AND (upper_arm_left_cm IS NULL OR upper_arm_left_cm BETWEEN 10 AND 90)
    AND (upper_arm_right_cm IS NULL OR upper_arm_right_cm BETWEEN 10 AND 90)
    AND (forearm_left_cm IS NULL OR forearm_left_cm BETWEEN 10 AND 70)
    AND (forearm_right_cm IS NULL OR forearm_right_cm BETWEEN 10 AND 70)
    AND (waist_cm IS NULL OR waist_cm BETWEEN 40 AND 220)
    AND (hip_cm IS NULL OR hip_cm BETWEEN 40 AND 220)
    AND (thigh_left_cm IS NULL OR thigh_left_cm BETWEEN 20 AND 140)
    AND (thigh_right_cm IS NULL OR thigh_right_cm BETWEEN 20 AND 140)
    AND (calf_left_cm IS NULL OR calf_left_cm BETWEEN 10 AND 90)
    AND (calf_right_cm IS NULL OR calf_right_cm BETWEEN 10 AND 90)
  ),
  CONSTRAINT body_circumferences_source_ck CHECK (
    measurement_source IN ('manual', 'device', 'import', 'admin')
  )
);

ALTER TABLE goals.body_measurements
  ADD COLUMN IF NOT EXISTS measurement_source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail text;

ALTER TABLE goals.body_circumferences
  ADD COLUMN IF NOT EXISTS measurement_source text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS source_detail text;

ALTER TABLE goals.body_measurements
  DROP CONSTRAINT IF EXISTS body_measurements_source_ck;
ALTER TABLE goals.body_measurements
  ADD CONSTRAINT body_measurements_source_ck
  CHECK (measurement_source IN ('manual', 'device', 'import', 'admin'));

ALTER TABLE goals.body_circumferences
  DROP CONSTRAINT IF EXISTS body_circumferences_source_ck;
ALTER TABLE goals.body_circumferences
  ADD CONSTRAINT body_circumferences_source_ck
  CHECK (measurement_source IN ('manual', 'device', 'import', 'admin'));

CREATE INDEX IF NOT EXISTS body_measurements_user_date_idx
  ON goals.body_measurements (user_id, measurement_date DESC, measurement_time DESC);

CREATE INDEX IF NOT EXISTS body_circumferences_user_date_idx
  ON goals.body_circumferences (user_id, measurement_date DESC, measurement_time DESC);

CREATE OR REPLACE FUNCTION goals.fill_body_measurement_snapshot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_height numeric;
BEGIN
  IF NEW.height_cm_snapshot IS NULL THEN
    SELECT p.height_cm
      INTO v_height
    FROM public.profiles p
    WHERE p.id = NEW.user_id;

    NEW.height_cm_snapshot := v_height;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION goals.refresh_profile_body_weight(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_weight numeric;
BEGIN
  SELECT bm.weight_kg
    INTO v_weight
  FROM goals.body_measurements bm
  WHERE bm.user_id = p_user_id
  ORDER BY bm.measurement_date DESC, bm.measurement_time DESC, bm.created_at DESC, bm.id DESC
  LIMIT 1;

  IF v_weight IS NOT NULL THEN
    UPDATE public.profiles p
       SET body_weight_kg = v_weight,
           updated_at = now()
     WHERE p.id = p_user_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION goals.sync_profile_weight_from_measurement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.user_id <> NEW.user_id THEN
    PERFORM goals.refresh_profile_body_weight(OLD.user_id);
  END IF;

  IF TG_OP = 'DELETE' THEN
    PERFORM goals.refresh_profile_body_weight(OLD.user_id);
    RETURN OLD;
  END IF;

  PERFORM goals.refresh_profile_body_weight(NEW.user_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION goals.body_composition_navy(
  p_user_id uuid,
  p_date date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  user_id uuid,
  measurement_date date,
  measurement_time time,
  body_fat_pct numeric,
  body_fat_pct_min numeric,
  body_fat_pct_max numeric,
  standard_error_pct_points numeric,
  ffmi numeric,
  lean_mass_kg numeric,
  weight_kg numeric,
  method text,
  source text,
  input_source text,
  input_source_detail text,
  caution text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH circumference AS (
  SELECT bc.*
  FROM goals.body_circumferences bc
  WHERE bc.user_id = p_user_id
    AND bc.measurement_date <= p_date
  ORDER BY bc.measurement_date DESC, bc.measurement_time DESC, bc.created_at DESC, bc.id DESC
  LIMIT 1
),
latest_weight AS (
  SELECT bm.weight_kg
  FROM goals.body_measurements bm
  WHERE bm.user_id = p_user_id
    AND bm.measurement_date <= p_date
  ORDER BY bm.measurement_date DESC, bm.measurement_time DESC, bm.created_at DESC, bm.id DESC
  LIMIT 1
),
input AS (
  SELECT
    p.id AS user_id,
    p.biological_sex,
    p.height_cm,
    COALESCE(lw.weight_kg, p.body_weight_kg) AS weight_kg,
    c.measurement_date,
    c.measurement_time,
    c.neck_cm,
    c.waist_cm,
    c.hip_cm,
    c.measurement_source,
    c.source_detail
  FROM public.profiles p
  JOIN circumference c ON c.user_id = p.id
  LEFT JOIN latest_weight lw ON true
  WHERE p.id = p_user_id
    AND p.biological_sex IN ('male', 'female')
    AND p.height_cm IS NOT NULL
    AND c.neck_cm IS NOT NULL
    AND c.waist_cm IS NOT NULL
    AND (p.biological_sex = 'male' OR c.hip_cm IS NOT NULL)
    AND CASE
      WHEN p.biological_sex = 'male' THEN c.waist_cm > c.neck_cm
      ELSE (c.waist_cm + c.hip_cm) > c.neck_cm
    END
),
calculated AS (
  SELECT
    i.*,
    CASE
      WHEN i.biological_sex = 'male' THEN
        86.010 * (ln((i.waist_cm - i.neck_cm) / 2.54) / ln(10::numeric))
        - 70.041 * (ln(i.height_cm / 2.54) / ln(10::numeric))
        + 36.76
      ELSE
        163.205 * (ln((i.waist_cm + i.hip_cm - i.neck_cm) / 2.54) / ln(10::numeric))
        - 97.684 * (ln(i.height_cm / 2.54) / ln(10::numeric))
        - 78.387
    END AS navy_pct
  FROM input i
),
rounded AS (
  SELECT
    c.*,
    round(c.navy_pct::numeric, 2) AS navy_pct_rounded
  FROM calculated c
)
SELECT
  r.user_id,
  r.measurement_date,
  r.measurement_time,
  r.navy_pct_rounded AS body_fat_pct,
  greatest(0, round((r.navy_pct_rounded - 3.5)::numeric, 2)) AS body_fat_pct_min,
  round((r.navy_pct_rounded + 3.5)::numeric, 2) AS body_fat_pct_max,
  3.5::numeric AS standard_error_pct_points,
  CASE
    WHEN r.weight_kg IS NULL THEN NULL
    ELSE round((
      (r.weight_kg * (1 - r.navy_pct_rounded / 100))
      / ((r.height_cm / 100.0) * (r.height_cm / 100.0))
      + 6.1 * (1.8 - (r.height_cm / 100.0))
    )::numeric, 2)
  END AS ffmi,
  CASE
    WHEN r.weight_kg IS NULL THEN NULL
    ELSE round((r.weight_kg * (1 - r.navy_pct_rounded / 100))::numeric, 2)
  END AS lean_mass_kg,
  r.weight_kg,
  'navy_circumference'::text AS method,
  'derived_navy'::text AS source,
  r.measurement_source AS input_source,
  r.source_detail AS input_source_detail,
  'Umfangsverfahren: Standardfehler ca. +/-3,5 Prozentpunkte; kann Athleten mit hoher Muskelmasse ueberschaetzen; Quellen nicht mischen.'::text AS caution
FROM rounded r;
$$;

DROP TRIGGER IF EXISTS body_measurements_fill_snapshot ON goals.body_measurements;
CREATE TRIGGER body_measurements_fill_snapshot
BEFORE INSERT OR UPDATE ON goals.body_measurements
FOR EACH ROW
EXECUTE FUNCTION goals.fill_body_measurement_snapshot();

DROP TRIGGER IF EXISTS body_measurements_touch_updated_at ON goals.body_measurements;
CREATE TRIGGER body_measurements_touch_updated_at
BEFORE UPDATE ON goals.body_measurements
FOR EACH ROW
EXECUTE FUNCTION goals.touch_updated_at();

DROP TRIGGER IF EXISTS body_circumferences_touch_updated_at ON goals.body_circumferences;
CREATE TRIGGER body_circumferences_touch_updated_at
BEFORE UPDATE ON goals.body_circumferences
FOR EACH ROW
EXECUTE FUNCTION goals.touch_updated_at();

-- G-356: eine Umfangsmessung ist ein zusammengehoeriger Satz. Die
-- Seitentrennung liegt in den vier linken/rechten Spaltenpaaren und wird
-- deshalb weder gemittelt noch in eine Kindtabelle aufgeloest.
CREATE OR REPLACE FUNCTION goals.body_circumference_write(
  p_measurement_date date,
  p_measurement_time time,
  p_measurement_source text DEFAULT 'manual',
  p_source_detail text DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_neck_cm numeric DEFAULT NULL,
  p_shoulders_cm numeric DEFAULT NULL,
  p_chest_cm numeric DEFAULT NULL,
  p_upper_arm_left_cm numeric DEFAULT NULL,
  p_upper_arm_right_cm numeric DEFAULT NULL,
  p_forearm_left_cm numeric DEFAULT NULL,
  p_forearm_right_cm numeric DEFAULT NULL,
  p_waist_cm numeric DEFAULT NULL,
  p_hip_cm numeric DEFAULT NULL,
  p_thigh_left_cm numeric DEFAULT NULL,
  p_thigh_right_cm numeric DEFAULT NULL,
  p_calf_left_cm numeric DEFAULT NULL,
  p_calf_right_cm numeric DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_user_id uuid := NULLIF(current_setting('request.jwt.claim.sub', true), '')::uuid;
  v_measurement_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'body_circumference_write: Anmeldung erforderlich'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO goals.body_circumferences (
    user_id, measurement_date, measurement_time,
    neck_cm, shoulders_cm, chest_cm,
    upper_arm_left_cm, upper_arm_right_cm,
    forearm_left_cm, forearm_right_cm,
    waist_cm, hip_cm, thigh_left_cm, thigh_right_cm, calf_left_cm, calf_right_cm,
    measurement_source, source_detail, notes
  ) VALUES (
    v_user_id, p_measurement_date, p_measurement_time,
    p_neck_cm, p_shoulders_cm, p_chest_cm,
    p_upper_arm_left_cm, p_upper_arm_right_cm,
    p_forearm_left_cm, p_forearm_right_cm,
    p_waist_cm, p_hip_cm, p_thigh_left_cm, p_thigh_right_cm, p_calf_left_cm, p_calf_right_cm,
    p_measurement_source, p_source_detail, p_notes
  )
  RETURNING id INTO v_measurement_id;

  RETURN v_measurement_id;
END;
$$;

COMMENT ON FUNCTION goals.body_circumference_write(
  date, time, text, text, text, numeric, numeric, numeric, numeric, numeric,
  numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric
) IS
  'G-356: erfasst einen eigenen Umfangssatz mit allen 13 Messpunkten und getrennten linken/rechten Werten.';

DROP TRIGGER IF EXISTS body_measurements_sync_profile_weight ON goals.body_measurements;
CREATE TRIGGER body_measurements_sync_profile_weight
AFTER INSERT OR UPDATE OR DELETE ON goals.body_measurements
FOR EACH ROW
EXECUTE FUNCTION goals.sync_profile_weight_from_measurement();

ALTER TABLE goals.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals.body_circumferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS body_measurements_select_own ON goals.body_measurements;
CREATE POLICY body_measurements_select_own ON goals.body_measurements
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS body_measurements_insert_own ON goals.body_measurements;
CREATE POLICY body_measurements_insert_own ON goals.body_measurements
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS body_measurements_update_own ON goals.body_measurements;
CREATE POLICY body_measurements_update_own ON goals.body_measurements
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS body_measurements_delete_own ON goals.body_measurements;
CREATE POLICY body_measurements_delete_own ON goals.body_measurements
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS body_circumferences_select_own ON goals.body_circumferences;
CREATE POLICY body_circumferences_select_own ON goals.body_circumferences
  FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS body_circumferences_insert_own ON goals.body_circumferences;
CREATE POLICY body_circumferences_insert_own ON goals.body_circumferences
  FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS body_circumferences_update_own ON goals.body_circumferences;
CREATE POLICY body_circumferences_update_own ON goals.body_circumferences
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS body_circumferences_delete_own ON goals.body_circumferences;
CREATE POLICY body_circumferences_delete_own ON goals.body_circumferences
  FOR DELETE TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT USAGE ON SCHEMA goals TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals.body_measurements TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals.body_circumferences TO authenticated;
GRANT ALL ON goals.body_measurements TO service_role;
GRANT ALL ON goals.body_circumferences TO service_role;

REVOKE ALL ON FUNCTION goals.fill_body_measurement_snapshot() FROM PUBLIC;
REVOKE ALL ON FUNCTION goals.refresh_profile_body_weight(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION goals.sync_profile_weight_from_measurement() FROM PUBLIC;
REVOKE ALL ON FUNCTION goals.body_composition_navy(uuid, date) FROM PUBLIC;
REVOKE ALL ON FUNCTION goals.body_circumference_write(
  date, time, text, text, text, numeric, numeric, numeric, numeric, numeric,
  numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric
) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION goals.refresh_profile_body_weight(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.body_composition_navy(uuid, date) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.body_circumference_write(
  date, time, text, text, text, numeric, numeric, numeric, numeric, numeric,
  numeric, numeric, numeric, numeric, numeric, numeric, numeric, numeric
) TO authenticated, service_role;

DO $$
DECLARE
  v_tables integer;
  v_policies integer;
  v_rls integer;
  v_functions integer;
BEGIN
  SELECT count(*)
    INTO v_tables
  FROM information_schema.tables
  WHERE table_schema = 'goals'
    AND table_name IN ('body_measurements', 'body_circumferences');

  IF v_tables <> 2 THEN
    RAISE EXCEPTION '112_body_measurements: Tabellen fehlen (%/2)', v_tables;
  END IF;

  SELECT count(*)
    INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'goals'
    AND (
      (tablename = 'body_measurements' AND policyname IN (
        'body_measurements_select_own', 'body_measurements_insert_own',
        'body_measurements_update_own', 'body_measurements_delete_own'
      ))
      OR (tablename = 'body_circumferences' AND policyname IN (
        'body_circumferences_select_own', 'body_circumferences_insert_own',
        'body_circumferences_update_own', 'body_circumferences_delete_own'
      ))
    );

  IF v_policies <> 8 THEN
    RAISE EXCEPTION '112_body_measurements: Policies unvollstaendig (%/8)', v_policies;
  END IF;

  SELECT count(*)
    INTO v_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'goals'
    AND c.relname IN ('body_measurements', 'body_circumferences')
    AND c.relrowsecurity;

  IF v_rls <> 2 THEN
    RAISE EXCEPTION '112_body_measurements: RLS nicht auf beiden Tabellen aktiv (%/2)', v_rls;
  END IF;

  SELECT count(*)
    INTO v_functions
  FROM pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'goals'
    AND p.proname IN (
      'fill_body_measurement_snapshot',
      'refresh_profile_body_weight',
      'sync_profile_weight_from_measurement',
      'body_composition_navy'
    );

  IF v_functions <> 4 THEN
    RAISE EXCEPTION '112_body_measurements: Funktionen unvollstaendig (%/4)', v_functions;
  END IF;

  RAISE NOTICE '112_body_measurements ok: 2 Tabellen, 8 Policies, RLS aktiv, 4 Funktionen.';
END $$;

COMMIT;
