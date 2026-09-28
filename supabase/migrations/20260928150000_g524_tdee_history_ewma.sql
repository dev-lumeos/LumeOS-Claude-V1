-- G-524 / G-523: gespeicherte TDEE-Reihe und echte EWMA.
--
-- DATABASE.md beschreibt goals.tdee_settings als aktuellen Zustand, nicht als
-- Verlauf. Diese zusaetzliche Reihe ist eine begruendete Abweichung: Die in
-- SCORING.md verlangte EWMA braucht den geglaetteten Vorgaengerwert. Ohne
-- gespeicherte Reihe waere alpha 0,3 nur eine feste Mischung mit der Formel.

BEGIN;

CREATE TABLE goals.tdee_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stichtag date NOT NULL,
  window_days integer NOT NULL,
  period_start date GENERATED ALWAYS AS (stichtag - (window_days - 1)) STORED,
  complete_intake_days integer NOT NULL,
  weight_measurement_count integer NOT NULL,
  weight_start_kg numeric(8,3),
  weight_end_kg numeric(8,3),
  weight_delta_kg numeric(8,3),
  measurement_span_days integer,
  avg_intake_kcal numeric(10,1),
  formula_tdee_kcal numeric(10,1),
  raw_tdee_kcal numeric(10,1),
  previous_tdee_kcal numeric(10,1),
  previous_source text,
  adaptive_tdee_kcal numeric(10,1),
  delta_to_formula_kcal numeric(10,1),
  alpha numeric(4,3) NOT NULL,
  confidence text NOT NULL,
  reliable boolean NOT NULL,
  status text NOT NULL,
  method text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT tdee_history_user_day_window_uq
    UNIQUE (user_id, stichtag, window_days),
  CONSTRAINT tdee_history_id_user_uq
    UNIQUE (id, user_id),
  CONSTRAINT tdee_history_window_ck CHECK (window_days > 0),
  CONSTRAINT tdee_history_counts_ck CHECK (
    complete_intake_days >= 0
    AND weight_measurement_count >= 0
    AND (measurement_span_days IS NULL OR measurement_span_days >= 0)
  ),
  CONSTRAINT tdee_history_alpha_ck CHECK (alpha > 0 AND alpha <= 1),
  CONSTRAINT tdee_history_confidence_ck
    CHECK (confidence IN ('low', 'medium', 'high')),
  CONSTRAINT tdee_history_status_ck CHECK (
    status IN (
      'missing_profile',
      'insufficient_intake_days',
      'insufficient_weight_measurements',
      'insufficient_weight_span',
      'complete'
    )
  ),
  CONSTRAINT tdee_history_previous_source_ck
    CHECK (previous_source IS NULL OR previous_source IN ('formula_seed', 'history')),
  CONSTRAINT tdee_history_method_ck CHECK (NULLIF(btrim(method), '') IS NOT NULL),
  CONSTRAINT tdee_history_reliable_ck CHECK (
    NOT reliable
    OR (
      status = 'complete'
      AND raw_tdee_kcal IS NOT NULL
      AND previous_tdee_kcal IS NOT NULL
      AND previous_source IS NOT NULL
      AND adaptive_tdee_kcal IS NOT NULL
      AND formula_tdee_kcal IS NOT NULL
    )
  )
);

CREATE INDEX tdee_history_previous_idx
  ON goals.tdee_history (user_id, window_days, stichtag DESC)
  WHERE reliable AND adaptive_tdee_kcal IS NOT NULL;

DROP TRIGGER IF EXISTS tdee_history_touch_updated_at ON goals.tdee_history;
CREATE TRIGGER tdee_history_touch_updated_at
  BEFORE UPDATE ON goals.tdee_history
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

ALTER TABLE goals.tdee_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY tdee_history_select
  ON goals.tdee_history
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT USAGE ON SCHEMA goals TO authenticated, service_role;
REVOKE ALL ON TABLE goals.tdee_history
  FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE goals.tdee_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE goals.tdee_history TO service_role;

ALTER TABLE goals.nutrition_targets
  ADD CONSTRAINT nutrition_targets_tdee_history_user_fk
  FOREIGN KEY (tdee_history_id, user_id)
  REFERENCES goals.tdee_history (id, user_id)
  ON DELETE RESTRICT;

CREATE FUNCTION goals.tdee_ema(
  p_raw_tdee_kcal numeric,
  p_previous_tdee_kcal numeric,
  p_alpha numeric DEFAULT 0.3
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
STRICT
SET search_path = ''
AS $$
BEGIN
  IF p_alpha <= 0 OR p_alpha > 1 THEN
    RAISE EXCEPTION 'tdee_ema_alpha_out_of_range: %', p_alpha
      USING ERRCODE = '22023';
  END IF;

  RETURN round((
    p_alpha * p_raw_tdee_kcal
    + (1 - p_alpha) * p_previous_tdee_kcal
  )::numeric, 1);
END;
$$;

CREATE FUNCTION goals.tdee_previous_value(
  p_user_id uuid,
  p_stichtag date,
  p_window_days integer,
  p_formula_tdee_kcal numeric
)
RETURNS TABLE (
  previous_tdee_kcal numeric,
  previous_source text
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
SELECT
  COALESCE(h.adaptive_tdee_kcal, p_formula_tdee_kcal) AS previous_tdee_kcal,
  CASE WHEN h.id IS NULL THEN 'formula_seed' ELSE 'history' END AS previous_source
FROM (SELECT 1) AS singleton
LEFT JOIN LATERAL (
  SELECT th.id, th.adaptive_tdee_kcal
  FROM goals.tdee_history th
  WHERE th.user_id = p_user_id
    AND th.window_days = GREATEST(p_window_days, 1)
    AND th.stichtag < p_stichtag
    AND th.reliable
    AND th.adaptive_tdee_kcal IS NOT NULL
  ORDER BY th.stichtag DESC, th.updated_at DESC, th.id DESC
  LIMIT 1
) h ON true;
$$;

-- SCORING.md und das Goals-Mockup trennen Formel-Baseline und adaptiven
-- Istwert. Sobald eine verlaessliche Reihenzeile existiert, ist sie die
-- aktive Basis; ohne eine solche Zeile bleibt die Formel der ehrliche
-- Rueckfall. Die konkrete Reihen-ID wandert als Snapshot ins Ziel.
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
SELECT
  COALESCE(h.adaptive_tdee_kcal, f.tdee) AS tdee,
  CASE WHEN h.id IS NULL THEN 'formula' ELSE 'adaptive' END AS tdee_herkunft,
  h.id AS tdee_history_id
FROM goals.formula_tdee(p_user_id, p_stichtag) f
LEFT JOIN LATERAL (
  SELECT th.id, th.adaptive_tdee_kcal
  FROM goals.tdee_history th
  WHERE th.user_id = p_user_id
    AND th.window_days = 14
    AND th.stichtag <= p_stichtag
    AND th.reliable
    AND th.adaptive_tdee_kcal IS NOT NULL
  ORDER BY th.stichtag DESC, th.updated_at DESC, th.id DESC
  LIMIT 1
) h ON true;
$$;

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
  SELECT ft.tdee AS formula_tdee_kcal
  FROM params p
  LEFT JOIN LATERAL goals.formula_tdee(p.user_id, p.period_end) ft ON true
),
base AS (
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
),
calculated AS (
  SELECT
    b.*,
    CASE WHEN b.complete_intake_days >= b.window_days
        AND b.weight_measurement_count >= 2
        AND b.measurement_span_days >= b.window_days - 1
      THEN round((b.avg_intake_kcal - (
        b.weight_delta_kg * b.kcal_per_kg / b.measurement_span_days
      ))::numeric, 1)
      ELSE NULL
    END AS raw_tdee_kcal
  FROM base b
),
with_previous AS (
  SELECT c.*, pv.previous_tdee_kcal, pv.previous_source
  FROM calculated c
  LEFT JOIN LATERAL goals.tdee_previous_value(
    c.user_id,
    c.period_end,
    c.window_days,
    c.formula_tdee_kcal
  ) pv ON true
),
smoothed AS (
  SELECT
    c.*,
    CASE WHEN c.raw_tdee_kcal IS NOT NULL
        AND c.formula_tdee_kcal IS NOT NULL
        AND c.previous_tdee_kcal IS NOT NULL
      THEN goals.tdee_ema(c.raw_tdee_kcal, c.previous_tdee_kcal, c.alpha)
      ELSE NULL
    END AS adaptive_value
  FROM with_previous c
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
  c.raw_tdee_kcal,
  c.adaptive_value AS adaptive_tdee_kcal,
  CASE WHEN c.adaptive_value IS NULL OR c.formula_tdee_kcal IS NULL
    THEN NULL
    ELSE round((c.adaptive_value - c.formula_tdee_kcal)::numeric, 1)
  END AS delta_to_formula_kcal,
  CASE
    WHEN c.complete_intake_days >= c.window_days AND c.weight_measurement_count >= 7 THEN 'high'
    WHEN c.complete_intake_days >= c.window_days AND c.weight_measurement_count >= 2 THEN 'medium'
    ELSE 'low'
  END AS confidence,
  (c.complete_intake_days >= c.window_days
    AND c.weight_measurement_count >= 2
    AND c.measurement_span_days >= c.window_days - 1
    AND c.formula_tdee_kcal IS NOT NULL
    AND c.previous_tdee_kcal IS NOT NULL) AS reliable,
  CASE
    WHEN c.formula_tdee_kcal IS NULL THEN 'missing_profile'
    WHEN c.complete_intake_days < c.window_days THEN 'insufficient_intake_days'
    WHEN c.weight_measurement_count < 2 THEN 'insufficient_weight_measurements'
    WHEN c.measurement_span_days < c.window_days - 1 THEN 'insufficient_weight_span'
    ELSE 'complete'
  END AS status,
  'derived_adaptive_tdee'::text AS source,
  'rolling_window_intake_weight_delta_ewma_alpha_0_3_previous_tdee'::text AS method,
  c.alpha,
  c.kcal_per_kg
FROM smoothed c;
$$;

REVOKE ALL ON FUNCTION goals.tdee_ema(numeric, numeric, numeric)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION goals.tdee_previous_value(uuid, date, integer, numeric)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION goals.tdee_basis_am(uuid, date)
  FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON FUNCTION goals.adaptive_tdee(uuid, date, integer)
  FROM PUBLIC, anon, authenticated, service_role;

GRANT EXECUTE ON FUNCTION goals.tdee_ema(numeric, numeric, numeric)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.tdee_previous_value(uuid, date, integer, numeric)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.tdee_basis_am(uuid, date)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.adaptive_tdee(uuid, date, integer)
  TO authenticated, service_role;

COMMENT ON TABLE goals.tdee_history IS
  'G-524: datierte TDEE-Reihe fuer die EWMA. Die Spec-Tabelle tdee_settings bleibt der aktuelle Zustand; die Reihe ist noetig, weil previousTDEE sonst nicht bestimmbar ist.';
COMMENT ON COLUMN goals.tdee_history.stichtag IS
  'Ein Datensatz je Nutzer, Stichtag und Fensterlaenge; nicht pauschal eine Wochenzeile.';
COMMENT ON COLUMN goals.tdee_history.previous_source IS
  'formula_seed nur fuer den Start der Reihe, danach history.';
COMMENT ON FUNCTION goals.tdee_ema(numeric, numeric, numeric) IS
  'EWMA-Schritt alpha * Rohwert + (1-alpha) * geglaetteter Vorgaengerwert.';
COMMENT ON FUNCTION goals.tdee_basis_am(uuid, date) IS
  'G-511 A2: letzte verlaessliche adaptive G-524-Reihenzeile bis zum Stichtag; ohne sie Formel-TDEE.';
COMMENT ON FUNCTION goals.adaptive_tdee(uuid, date, integer) IS
  'Adaptiver TDEE mit alpha 0,3 gegen den letzten verlaesslichen Reihenwert; der Formel-TDEE ist nur der Startwert.';

COMMIT;
