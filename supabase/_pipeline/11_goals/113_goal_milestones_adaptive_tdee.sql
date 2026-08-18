BEGIN;

CREATE SCHEMA IF NOT EXISTS goals;

ALTER TABLE goals.user_goals
  DROP CONSTRAINT IF EXISTS user_goals_id_user_uq;
ALTER TABLE goals.user_goals
  ADD CONSTRAINT user_goals_id_user_uq UNIQUE (id, user_id);

CREATE TABLE IF NOT EXISTS goals.goal_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  title text NOT NULL,
  description text,
  target_value numeric(12,3),
  target_unit text,
  threshold_pct numeric(5,2),
  target_date date,
  status text NOT NULL DEFAULT 'open',
  achieved_date date,
  achieved_value numeric(12,3),
  celebration_message text,
  auto_generated boolean NOT NULL DEFAULT false,
  notification_sent boolean NOT NULL DEFAULT false,
  source text NOT NULL DEFAULT 'manual',
  source_detail text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT goal_milestones_goal_user_fk
    FOREIGN KEY (goal_id, user_id)
    REFERENCES goals.user_goals (id, user_id)
    ON DELETE CASCADE,
  CONSTRAINT goal_milestones_type_ck CHECK (
    milestone_type IN ('absolute_value', 'percentage', 'date', 'behavioral')
  ),
  CONSTRAINT goal_milestones_status_ck CHECK (
    status IN ('open', 'achieved', 'missed', 'abandoned')
  ),
  CONSTRAINT goal_milestones_source_ck CHECK (
    source IN ('manual', 'device', 'import', 'admin', 'seed', 'derived')
  ),
  CONSTRAINT goal_milestones_target_ck CHECK (
    (milestone_type = 'absolute_value' AND target_value IS NOT NULL AND target_unit IS NOT NULL)
    OR (milestone_type = 'percentage' AND threshold_pct IS NOT NULL)
    OR (milestone_type IN ('date', 'behavioral'))
  )
);

CREATE INDEX IF NOT EXISTS goal_milestones_user_target_idx
  ON goals.goal_milestones (user_id, target_date, status);
CREATE INDEX IF NOT EXISTS goal_milestones_goal_idx
  ON goals.goal_milestones (goal_id);

DROP TRIGGER IF EXISTS goal_milestones_touch_updated_at ON goals.goal_milestones;
CREATE TRIGGER goal_milestones_touch_updated_at
  BEFORE UPDATE ON goals.goal_milestones
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

DROP FUNCTION IF EXISTS goals.adaptive_tdee(uuid, date, integer);
CREATE FUNCTION goals.adaptive_tdee(
  p_user_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE,
  p_window_days integer DEFAULT 14
)
RETURNS TABLE (
  user_id uuid,
  period_start date,
  period_end date,
  window_days integer,
  complete_intake_days integer,
  weight_measurement_count integer,
  weight_start_kg numeric,
  weight_end_kg numeric,
  weight_delta_kg numeric,
  measurement_span_days integer,
  avg_intake_kcal numeric,
  formula_tdee_kcal numeric,
  raw_tdee_kcal numeric,
  adaptive_tdee_kcal numeric,
  delta_to_formula_kcal numeric,
  confidence text,
  reliable boolean,
  status text,
  source text,
  method text,
  alpha numeric,
  kcal_per_kg numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH params AS (
  SELECT
    p_user_id AS user_id,
    p_stichtag AS period_end,
    GREATEST(p_window_days, 1)::integer AS window_days,
    (p_stichtag - (GREATEST(p_window_days, 1)::integer - 1))::date AS period_start,
    0.3::numeric AS alpha,
    7700::numeric AS kcal_per_kg
),
intake AS (
  SELECT
    count(*) FILTER (WHERE ds.enercc IS NOT NULL AND ds.enercc_missing = 0)::integer AS complete_intake_days,
    avg(ds.enercc) FILTER (WHERE ds.enercc IS NOT NULL AND ds.enercc_missing = 0)::numeric AS avg_intake_kcal
  FROM params p
  LEFT JOIN nutrition.daily_summary ds
    ON ds.user_id = p.user_id
   AND ds.entry_date BETWEEN p.period_start AND p.period_end
),
weights AS (
  SELECT
    count(bm.*)::integer AS weight_measurement_count,
    (array_agg(bm.weight_kg ORDER BY bm.measurement_date, bm.measurement_time, bm.created_at, bm.id))[1]::numeric AS weight_start_kg,
    (array_agg(bm.weight_kg ORDER BY bm.measurement_date DESC, bm.measurement_time DESC, bm.created_at DESC, bm.id DESC))[1]::numeric AS weight_end_kg,
    min(bm.measurement_date)::date AS first_weight_date,
    max(bm.measurement_date)::date AS last_weight_date
  FROM params p
  LEFT JOIN goals.body_measurements bm
    ON bm.user_id = p.user_id
   AND bm.measurement_date BETWEEN p.period_start AND p.period_end
   AND bm.weight_kg IS NOT NULL
),
formula AS (
  SELECT bz.tdee AS formula_tdee_kcal
  FROM params p
  LEFT JOIN LATERAL goals.berechne_zielwerte(p.user_id, p.period_end) bz ON true
),
calc AS (
  SELECT
    p.user_id,
    p.period_start,
    p.period_end,
    p.window_days,
    COALESCE(i.complete_intake_days, 0) AS complete_intake_days,
    COALESCE(w.weight_measurement_count, 0) AS weight_measurement_count,
    w.weight_start_kg,
    w.weight_end_kg,
    CASE WHEN w.weight_start_kg IS NULL OR w.weight_end_kg IS NULL
      THEN NULL
      ELSE round((w.weight_end_kg - w.weight_start_kg)::numeric, 3)
    END AS weight_delta_kg,
    CASE WHEN w.first_weight_date IS NULL OR w.last_weight_date IS NULL
      THEN NULL
      ELSE GREATEST((w.last_weight_date - w.first_weight_date), 1)
    END AS measurement_span_days,
    round(i.avg_intake_kcal, 1) AS avg_intake_kcal,
    f.formula_tdee_kcal,
    p.alpha,
    p.kcal_per_kg
  FROM params p
  CROSS JOIN intake i
  CROSS JOIN weights w
  CROSS JOIN formula f
)
SELECT
  c.user_id,
  c.period_start,
  c.period_end,
  c.window_days,
  c.complete_intake_days,
  c.weight_measurement_count,
  c.weight_start_kg,
  c.weight_end_kg,
  c.weight_delta_kg,
  c.measurement_span_days,
  c.avg_intake_kcal,
  c.formula_tdee_kcal,
  CASE WHEN c.complete_intake_days >= c.window_days
      AND c.weight_measurement_count >= 2
      AND c.measurement_span_days >= c.window_days - 1
    THEN round((c.avg_intake_kcal - (c.weight_delta_kg * c.kcal_per_kg / c.measurement_span_days))::numeric, 1)
    ELSE NULL
  END AS raw_tdee_kcal,
  CASE WHEN c.complete_intake_days >= c.window_days
      AND c.weight_measurement_count >= 2
      AND c.measurement_span_days >= c.window_days - 1
      AND c.formula_tdee_kcal IS NOT NULL
    THEN round((
      c.alpha * (c.avg_intake_kcal - (c.weight_delta_kg * c.kcal_per_kg / c.measurement_span_days))
      + (1 - c.alpha) * c.formula_tdee_kcal
    )::numeric, 1)
    ELSE NULL
  END AS adaptive_tdee_kcal,
  CASE WHEN c.complete_intake_days >= c.window_days
      AND c.weight_measurement_count >= 2
      AND c.measurement_span_days >= c.window_days - 1
      AND c.formula_tdee_kcal IS NOT NULL
    THEN round((
      c.alpha * (c.avg_intake_kcal - (c.weight_delta_kg * c.kcal_per_kg / c.measurement_span_days))
      + (1 - c.alpha) * c.formula_tdee_kcal
      - c.formula_tdee_kcal
    )::numeric, 1)
    ELSE NULL
  END AS delta_to_formula_kcal,
  CASE
    WHEN c.complete_intake_days >= c.window_days AND c.weight_measurement_count >= 7 THEN 'high'
    WHEN c.complete_intake_days >= c.window_days AND c.weight_measurement_count >= 2 THEN 'medium'
    ELSE 'low'
  END AS confidence,
  (c.complete_intake_days >= c.window_days
    AND c.weight_measurement_count >= 2
    AND c.measurement_span_days >= c.window_days - 1
    AND c.formula_tdee_kcal IS NOT NULL) AS reliable,
  CASE
    WHEN c.formula_tdee_kcal IS NULL THEN 'missing_profile'
    WHEN c.complete_intake_days < c.window_days THEN 'insufficient_intake_days'
    WHEN c.weight_measurement_count < 2 THEN 'insufficient_weight_measurements'
    WHEN c.measurement_span_days < c.window_days - 1 THEN 'insufficient_weight_span'
    ELSE 'complete'
  END AS status,
  'derived_adaptive_tdee'::text AS source,
  'rolling_14d_intake_weight_delta_ema_formula_baseline'::text AS method,
  c.alpha,
  c.kcal_per_kg
FROM calc c;
$$;

DROP FUNCTION IF EXISTS goals.goal_progress_at(uuid, date);
CREATE FUNCTION goals.goal_progress_at(
  p_goal_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  goal_id uuid,
  user_id uuid,
  goal_type text,
  subtype text,
  title text,
  target_value numeric,
  target_unit text,
  start_value numeric,
  current_value numeric,
  current_source text,
  progress_pct numeric,
  progress_status text,
  measured_at date
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH goal_row AS (
  SELECT g.*
  FROM goals.user_goals g
  WHERE g.id = p_goal_id
),
body_value AS (
  SELECT bm.weight_kg AS value, bm.measurement_date AS measured_at
  FROM goal_row g
  JOIN LATERAL (
    SELECT bm.weight_kg, bm.measurement_date
    FROM goals.body_measurements bm
    WHERE bm.user_id = g.user_id
      AND bm.measurement_date <= p_stichtag
      AND bm.weight_kg IS NOT NULL
    ORDER BY bm.measurement_date DESC, bm.measurement_time DESC, bm.created_at DESC, bm.id DESC
    LIMIT 1
  ) bm ON true
  WHERE g.goal_type = 'body_composition'
    AND g.target_unit = 'kg'
),
selected_value AS (
  SELECT
    CASE WHEN g.goal_type = 'body_composition' AND g.target_unit = 'kg' THEN bv.value ELSE NULL END AS current_value,
    CASE WHEN g.goal_type = 'body_composition' AND g.target_unit = 'kg' AND bv.value IS NOT NULL THEN 'goals.body_measurements' ELSE NULL END AS current_source,
    CASE WHEN g.goal_type = 'body_composition' AND g.target_unit = 'kg' THEN bv.measured_at ELSE NULL END AS measured_at
  FROM goal_row g
  LEFT JOIN body_value bv ON true
)
SELECT
  g.id AS goal_id,
  g.user_id,
  g.goal_type,
  g.subtype,
  g.title,
  g.target_value,
  g.target_unit,
  g.start_value,
  v.current_value,
  v.current_source,
  CASE
    WHEN v.current_value IS NULL OR g.start_value IS NULL OR g.target_value IS NULL OR g.target_value = g.start_value THEN NULL
    ELSE round(LEAST(100, GREATEST(0, ((v.current_value - g.start_value) / (g.target_value - g.start_value)) * 100))::numeric, 1)
  END AS progress_pct,
  CASE
    WHEN g.goal_type = 'body_composition' AND g.target_unit = 'kg' AND v.current_value IS NULL THEN 'no_measurement'
    WHEN g.goal_type = 'body_composition' AND g.target_unit = 'kg' THEN 'measured'
    WHEN g.goal_type = 'performance' THEN 'not_implemented_workout_sets'
    ELSE 'not_measurable'
  END AS progress_status,
  v.measured_at
FROM goal_row g
CROSS JOIN selected_value v;
$$;

DROP FUNCTION IF EXISTS goals.goal_milestone_status(uuid, date);
CREATE FUNCTION goals.goal_milestone_status(
  p_milestone_id uuid,
  p_stichtag date DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  milestone_id uuid,
  goal_id uuid,
  user_id uuid,
  title text,
  milestone_type text,
  target_value numeric,
  target_unit text,
  target_date date,
  stored_status text,
  computed_status text,
  current_value numeric,
  current_source text,
  progress_pct numeric,
  progress_status text,
  source text,
  source_detail text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
WITH m AS (
  SELECT * FROM goals.goal_milestones WHERE id = p_milestone_id
),
g AS (
  SELECT ug.*
  FROM m
  JOIN goals.user_goals ug ON ug.id = m.goal_id
),
p AS (
  SELECT gp.*
  FROM m
  LEFT JOIN LATERAL goals.goal_progress_at(m.goal_id, p_stichtag) gp ON true
)
SELECT
  m.id AS milestone_id,
  m.goal_id,
  m.user_id,
  m.title,
  m.milestone_type,
  m.target_value,
  m.target_unit,
  m.target_date,
  m.status AS stored_status,
  CASE
    WHEN m.status IN ('achieved', 'abandoned') THEN m.status
    WHEN p.progress_status IS DISTINCT FROM 'measured' THEN p.progress_status
    WHEN m.milestone_type = 'absolute_value'
      AND g.start_value IS NOT NULL
      AND g.target_value IS NOT NULL
      AND g.target_value >= g.start_value
      AND p.current_value >= m.target_value THEN 'achieved'
    WHEN m.milestone_type = 'absolute_value'
      AND g.start_value IS NOT NULL
      AND g.target_value IS NOT NULL
      AND g.target_value < g.start_value
      AND p.current_value <= m.target_value THEN 'achieved'
    WHEN m.milestone_type = 'percentage'
      AND p.progress_pct >= m.threshold_pct THEN 'achieved'
    WHEN m.target_date IS NOT NULL AND m.target_date < p_stichtag THEN 'missed'
    ELSE 'open'
  END AS computed_status,
  p.current_value,
  p.current_source,
  p.progress_pct,
  p.progress_status,
  m.source,
  m.source_detail
FROM m
JOIN g ON true
LEFT JOIN p ON true;
$$;

GRANT USAGE ON SCHEMA goals TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON goals.goal_milestones TO authenticated;
GRANT ALL ON goals.goal_milestones TO service_role;
GRANT EXECUTE ON FUNCTION goals.adaptive_tdee(uuid, date, integer) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.goal_progress_at(uuid, date) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.goal_milestone_status(uuid, date) TO authenticated, service_role;

ALTER TABLE goals.goal_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS goal_milestones_select ON goals.goal_milestones;
DROP POLICY IF EXISTS goal_milestones_insert ON goals.goal_milestones;
DROP POLICY IF EXISTS goal_milestones_update ON goals.goal_milestones;
DROP POLICY IF EXISTS goal_milestones_delete ON goals.goal_milestones;

CREATE POLICY goal_milestones_select ON goals.goal_milestones
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY goal_milestones_insert ON goals.goal_milestones
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY goal_milestones_update ON goals.goal_milestones
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY goal_milestones_delete ON goals.goal_milestones
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

COMMENT ON TABLE goals.goal_milestones IS
  'Gesetzte Ziel-Meilensteine. Fortschritt wird daneben aus echten Messquellen berechnet.';
COMMENT ON FUNCTION goals.adaptive_tdee(uuid, date, integer) IS
  'Adaptiver TDEE aus tatsaechlicher Kalorienzufuhr und Gewichtsentwicklung. Formelwert bleibt als Baseline erhalten.';
COMMENT ON FUNCTION goals.goal_progress_at(uuid, date) IS
  'Fortschritt eines Zieles am Stichtag gegen echte Messquellen. Nicht messbare Zielarten liefern einen Status statt geratenem Fortschritt.';
COMMENT ON FUNCTION goals.goal_milestone_status(uuid, date) IS
  'Berechneter Status eines gesetzten Meilensteins am Stichtag.';

DO $$
DECLARE
  v_policies integer;
  v_rls boolean;
BEGIN
  SELECT count(*) INTO v_policies
  FROM pg_policies
  WHERE schemaname = 'goals'
    AND tablename = 'goal_milestones';

  IF v_policies <> 4 THEN
    RAISE EXCEPTION 'goals.goal_milestones: % Policies statt 4', v_policies;
  END IF;

  SELECT c.relrowsecurity INTO v_rls
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'goals'
    AND c.relname = 'goal_milestones';

  IF NOT v_rls THEN
    RAISE EXCEPTION 'goals.goal_milestones: Zeilenschutz ist aus';
  END IF;

  RAISE NOTICE 'OK: goals.goal_milestones und adaptive TDEE-Funktionen angelegt';
END $$;

COMMIT;
