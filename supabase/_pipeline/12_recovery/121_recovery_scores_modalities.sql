-- =============================================================
-- 121 -- Recovery Scores und Modalitaeten (C-125)
-- Datum: 2026-08-20
-- Zweck: recovery.scores als taeglicher Score-Schnappschuss und
--        recovery.modality_log als Protokoll fuer Sauna, Massage,
--        Eisbad, Dehnen usw.
-- Idempotent: CREATE IF NOT EXISTS, Policies per DROP + CREATE.
--
-- Entscheidungen aus C-123/C-125:
--   * E1: V1 ist nur manual. HRV wird nicht bewertet.
--   * E2: Soreness nutzt nur gemeldete Muskeln > 0.
--   * E3: Readiness-Texte werden nicht gespeichert.
--   * E7: eine Erholungskurve, nicht je Muskel.
--   * E9: Nutrition-Term faellt auf 70 zurueck und markiert das.
--
-- C-124 offen:
--   * E5 Modalitaeten-Bonuswerte: zentral in modality_bonus_value().
--     Bis zur Recherche liefert die Funktion 0 und markiert pending.
--   * E8 Motivationsschwelle: zentral in scoring_constants().
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS recovery;

CREATE OR REPLACE FUNCTION recovery.scoring_constants()
RETURNS JSONB
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT jsonb_build_object(
    'algorithm_version', 'manual_v2_c215',
    'weights', jsonb_build_object(
      'sleep_quality', 30,
      'sleep_duration', 15,
      'subjective_feeling', 15,
      'soreness', 10,
      'nutrition', 10,
      'mood', 5
    ),
    'nutrition_fallback_score', 70,
    'nutrition_fallback_source', 'fallback_c123_e9',
    'modality_bonus_cap', 5,
    'modality_bonus_source', 'pending_c124_e5',
    'motivation_threshold_10', NULL,
    'motivation_threshold_source', 'pending_c124_e8'
  );
$$;

COMMENT ON FUNCTION recovery.scoring_constants() IS
  'Zentrale Konstanten fuer Recovery-Scoring C-125. C-124 setzt spaeter Modalitaeten-Boni und Motivationsschwelle an dieser Stelle.';

CREATE OR REPLACE FUNCTION recovery.modality_bonus_value(p_modality_type TEXT)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN p_modality_type IN (
      'sauna',
      'cold_plunge',
      'contrast_therapy',
      'massage',
      'foam_rolling',
      'stretching',
      'yoga',
      'meditation',
      'breathwork',
      'nap',
      'active_recovery',
      'other'
    ) THEN 0::numeric
    ELSE 0::numeric
  END;
$$;

COMMENT ON FUNCTION recovery.modality_bonus_value(TEXT) IS
  'C-125 Platzhalter fuer C-124/E5. Liefert bis zur Recherche 0, damit die Struktur steht, ohne Bonuswerte zu erfinden.';

DROP FUNCTION IF EXISTS recovery.training_load_score(NUMERIC);
DROP FUNCTION IF EXISTS recovery.acwr_for_day(UUID, DATE);

CREATE TABLE IF NOT EXISTS recovery.scores (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                    UUID NOT NULL,
  entry_date                 DATE NOT NULL,
  mode                       TEXT NOT NULL DEFAULT 'manual'
    CHECK (mode = 'manual'),
  score                      NUMERIC(5,1) NOT NULL CHECK (score BETWEEN 0 AND 100),
  algorithm_version          TEXT NOT NULL DEFAULT 'manual_v2_c215',

  sleep_quality_score        NUMERIC(5,1) NOT NULL CHECK (sleep_quality_score BETWEEN 0 AND 100),
  sleep_duration_score       NUMERIC(5,1) NOT NULL CHECK (sleep_duration_score BETWEEN 0 AND 100),
  subjective_feeling_score   NUMERIC(5,1) NOT NULL CHECK (subjective_feeling_score BETWEEN 0 AND 100),
  soreness_score             NUMERIC(5,1) NOT NULL CHECK (soreness_score BETWEEN 0 AND 100),
  training_load_score        NUMERIC(5,1) NOT NULL CHECK (training_load_score BETWEEN 0 AND 100),
  nutrition_score            NUMERIC(5,1) NOT NULL CHECK (nutrition_score BETWEEN 0 AND 100),
  mood_score                 NUMERIC(5,1) NOT NULL CHECK (mood_score BETWEEN 0 AND 100),
  hrv_score                  NUMERIC(5,1) CHECK (hrv_score IS NULL OR hrv_score BETWEEN 0 AND 100),

  sleep_quality_points       NUMERIC(5,2) NOT NULL,
  sleep_duration_points      NUMERIC(5,2) NOT NULL,
  subjective_feeling_points  NUMERIC(5,2) NOT NULL,
  soreness_points            NUMERIC(5,2) NOT NULL,
  training_load_points       NUMERIC(5,2) NOT NULL,
  nutrition_points           NUMERIC(5,2) NOT NULL,
  mood_points                NUMERIC(5,2) NOT NULL,
  modality_bonus             NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (modality_bonus BETWEEN 0 AND 5),

  sleep_hours_used           NUMERIC(3,1),
  soreness_avg_used          NUMERIC(4,2) NOT NULL DEFAULT 0,
  soreness_reported_count    INTEGER NOT NULL DEFAULT 0 CHECK (soreness_reported_count >= 0),
  nutrition_source           TEXT NOT NULL DEFAULT 'fallback_c123_e9',
  hrv_source                 TEXT NOT NULL DEFAULT 'not_used_manual_mode',
  modality_bonus_source      TEXT NOT NULL DEFAULT 'pending_c124_e5',
  fallbacks                  JSONB NOT NULL DEFAULT '{}'::jsonb,

  calculated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  measurement_source         TEXT NOT NULL DEFAULT 'derived'
    CHECK (measurement_source IN ('manual','device','import','admin','seed','derived')),
  source_detail              TEXT,

  UNIQUE (user_id, entry_date),
  CHECK (jsonb_typeof(fallbacks) = 'object')
);

COMMENT ON TABLE recovery.scores IS
  'Taeglicher Recovery-Score-Schnappschuss (C-125). Speichert Score und Einzelterme, nicht die noch nicht abgenommenen Readiness-Texte.';
COMMENT ON COLUMN recovery.scores.nutrition_source IS
  'C-125/E9: Nutrition faellt in V1 auf 70 zurueck und markiert das hier.';
COMMENT ON COLUMN recovery.scores.hrv_source IS
  'E1: V1 ist manual; HRV wird nicht bewertet, auch wenn checkins hrv_rmssd tragen.';
COMMENT ON COLUMN recovery.scores.modality_bonus_source IS
  'C-124/E5 offen. Bis zur Recherche liefert recovery.modality_bonus_value() 0.';

ALTER TABLE recovery.scores
  ALTER COLUMN algorithm_version SET DEFAULT 'manual_v2_c215',
  DROP COLUMN IF EXISTS acwr_used;

CREATE INDEX IF NOT EXISTS idx_recovery_scores_user_date
  ON recovery.scores(user_id, entry_date DESC);

CREATE TABLE IF NOT EXISTS recovery.modality_log (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID NOT NULL,
  entry_date             DATE NOT NULL,
  logged_time            TIME,
  modality_type          TEXT NOT NULL
    CHECK (modality_type IN (
      'sauna',
      'cold_plunge',
      'contrast_therapy',
      'massage',
      'foam_rolling',
      'stretching',
      'yoga',
      'meditation',
      'breathwork',
      'nap',
      'active_recovery',
      'other'
    )),
  duration_min           INTEGER CHECK (duration_min IS NULL OR duration_min >= 0),
  detail                 TEXT,
  immediate_effect       SMALLINT CHECK (immediate_effect IS NULL OR immediate_effect BETWEEN 1 AND 10),
  next_day_effect        SMALLINT CHECK (next_day_effect IS NULL OR next_day_effect BETWEEN 1 AND 10),
  bonus_value            NUMERIC(4,2) NOT NULL DEFAULT 0 CHECK (bonus_value BETWEEN 0 AND 5),
  bonus_source           TEXT NOT NULL DEFAULT 'pending_c124_e5',
  next_day_score_delta   NUMERIC(5,1),
  notes                  TEXT,
  measurement_source     TEXT NOT NULL DEFAULT 'manual'
    CHECK (measurement_source IN ('manual','device','import','admin','seed')),
  source_detail          TEXT,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (logged_time IS NULL OR EXTRACT(SECOND FROM logged_time) = 0)
);

COMMENT ON TABLE recovery.modality_log IS
  'Recovery-Modalitaetenprotokoll (C-125): Sauna, Massage, Eisbad, Dehnen usw. Bonuswerte warten zentral auf C-124/E5.';
COMMENT ON COLUMN recovery.modality_log.next_day_score_delta IS
  'Differenz recovery.scores Folgetag minus aktueller Tag. Nur berechenbar, wenn beide Score-Schnappschuesse existieren.';

CREATE INDEX IF NOT EXISTS idx_recovery_modality_log_user_date
  ON recovery.modality_log(user_id, entry_date DESC, logged_time DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_modality_log_type
  ON recovery.modality_log(modality_type);

DROP TRIGGER IF EXISTS recovery_scores_touch_updated_at ON recovery.scores;
CREATE TRIGGER recovery_scores_touch_updated_at
  BEFORE UPDATE ON recovery.scores
  FOR EACH ROW EXECUTE FUNCTION recovery.touch_updated_at();

DROP TRIGGER IF EXISTS recovery_modality_log_touch_updated_at ON recovery.modality_log;
CREATE TRIGGER recovery_modality_log_touch_updated_at
  BEFORE UPDATE ON recovery.modality_log
  FOR EACH ROW EXECUTE FUNCTION recovery.touch_updated_at();

CREATE OR REPLACE FUNCTION recovery.refresh_modality_deltas(p_user_id UUID, p_entry_date DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_updated INTEGER;
BEGIN
  UPDATE recovery.modality_log ml
  SET next_day_score_delta = round((next_score.score - current_score.score)::numeric, 1),
      updated_at = now()
  FROM recovery.scores current_score
  JOIN recovery.scores next_score
    ON next_score.user_id = current_score.user_id
   AND next_score.entry_date = current_score.entry_date + 1
  WHERE ml.user_id = p_user_id
    AND ml.entry_date = p_entry_date
    AND current_score.user_id = ml.user_id
    AND current_score.entry_date = ml.entry_date;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

CREATE OR REPLACE FUNCTION recovery.recalculate_score(p_user_id UUID, p_entry_date DATE)
RETURNS recovery.scores
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  c recovery.checkins%ROWTYPE;
  v_soreness_avg NUMERIC := 0;
  v_soreness_count INTEGER := 0;
  v_sleep_quality_score NUMERIC;
  v_sleep_duration_score NUMERIC;
  v_subjective_score NUMERIC;
  v_soreness_score NUMERIC;
  v_training_score NUMERIC := 0;
  v_nutrition_score NUMERIC := 70;
  v_mood_score NUMERIC;
  v_modality_bonus NUMERIC := 0;
  v_total NUMERIC;
  v_result recovery.scores%ROWTYPE;
  v_fallbacks JSONB := jsonb_build_object(
    'nutrition', 'fallback_c123_e9',
    'hrv', 'not_used_manual_mode',
    'modality_bonus', 'pending_c124_e5'
  );
BEGIN
  SELECT *
  INTO c
  FROM recovery.checkins
  WHERE user_id = p_user_id
    AND entry_date = p_entry_date;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT
    COALESCE(round(avg(value::numeric), 2), 0),
    count(*)::integer
  INTO v_soreness_avg, v_soreness_count
  FROM jsonb_each_text(c.soreness)
  WHERE value ~ '^[0-9]+(\.[0-9]+)?$'
    AND value::numeric > 0;

  v_sleep_quality_score := COALESCE(round(c.sleep_quality::numeric * 10, 1), 70);

  v_sleep_duration_score := CASE
    WHEN c.sleep_hours IS NULL THEN 70
    WHEN c.sleep_hours BETWEEN 7 AND 9 THEN 100
    WHEN c.sleep_hours < 7 THEN greatest(0::numeric, round((c.sleep_hours / 7) * 100, 1))
    ELSE greatest(60::numeric, round(100 - ((c.sleep_hours - 9) * 15), 1))
  END;

  v_subjective_score := COALESCE(round(c.subjective_feeling::numeric * 10, 1), 70);
  v_soreness_score := CASE
    WHEN v_soreness_count = 0 THEN 100
    ELSE greatest(0::numeric, round(100 - (least(v_soreness_avg, 3) / 3 * 100), 1))
  END;

  v_mood_score := CASE c.mood
    WHEN 'motivated' THEN 100
    WHEN 'good' THEN 85
    WHEN 'neutral' THEN 70
    WHEN 'tired' THEN 45
    WHEN 'sick' THEN 20
    ELSE 70
  END;

  SELECT least(
    5::numeric,
    COALESCE(sum(COALESCE(NULLIF(ml.bonus_value, 0), recovery.modality_bonus_value(ml.modality_type))), 0)
  )
  INTO v_modality_bonus
  FROM recovery.modality_log ml
  WHERE ml.user_id = p_user_id
    AND ml.entry_date = p_entry_date;

  v_total := least(
    100::numeric,
    round((
      v_sleep_quality_score * 0.30
      + v_sleep_duration_score * 0.15
      + v_subjective_score * 0.15
      + v_soreness_score * 0.10
      + v_nutrition_score * 0.10
      + v_mood_score * 0.05
      + v_modality_bonus
    )::numeric, 1)
  );

  INSERT INTO recovery.scores (
    user_id, entry_date, mode, score, algorithm_version,
    sleep_quality_score, sleep_duration_score, subjective_feeling_score,
    soreness_score, training_load_score, nutrition_score, mood_score, hrv_score,
    sleep_quality_points, sleep_duration_points, subjective_feeling_points,
    soreness_points, training_load_points, nutrition_points, mood_points,
    modality_bonus, sleep_hours_used, soreness_avg_used, soreness_reported_count,
    nutrition_source, hrv_source, modality_bonus_source, fallbacks,
    calculated_at, measurement_source, source_detail
  )
  VALUES (
    p_user_id, p_entry_date, 'manual', v_total, 'manual_v2_c215',
    v_sleep_quality_score, v_sleep_duration_score, v_subjective_score,
    v_soreness_score, v_training_score, v_nutrition_score, v_mood_score, NULL,
    round(v_sleep_quality_score * 0.30, 2),
    round(v_sleep_duration_score * 0.15, 2),
    round(v_subjective_score * 0.15, 2),
    round(v_soreness_score * 0.10, 2),
    round(v_training_score * 0.15, 2),
    round(v_nutrition_score * 0.10, 2),
    round(v_mood_score * 0.05, 2),
    v_modality_bonus, c.sleep_hours, v_soreness_avg, v_soreness_count,
    'fallback_c123_e9', 'not_used_manual_mode', 'pending_c124_e5', v_fallbacks,
    now(), 'derived', 'recovery.recalculate_score manual_v2_c215'
  )
  ON CONFLICT (user_id, entry_date) DO UPDATE
  SET
    mode = EXCLUDED.mode,
    score = EXCLUDED.score,
    algorithm_version = EXCLUDED.algorithm_version,
    sleep_quality_score = EXCLUDED.sleep_quality_score,
    sleep_duration_score = EXCLUDED.sleep_duration_score,
    subjective_feeling_score = EXCLUDED.subjective_feeling_score,
    soreness_score = EXCLUDED.soreness_score,
    training_load_score = EXCLUDED.training_load_score,
    nutrition_score = EXCLUDED.nutrition_score,
    mood_score = EXCLUDED.mood_score,
    hrv_score = EXCLUDED.hrv_score,
    sleep_quality_points = EXCLUDED.sleep_quality_points,
    sleep_duration_points = EXCLUDED.sleep_duration_points,
    subjective_feeling_points = EXCLUDED.subjective_feeling_points,
    soreness_points = EXCLUDED.soreness_points,
    training_load_points = EXCLUDED.training_load_points,
    nutrition_points = EXCLUDED.nutrition_points,
    mood_points = EXCLUDED.mood_points,
    modality_bonus = EXCLUDED.modality_bonus,
    sleep_hours_used = EXCLUDED.sleep_hours_used,
    soreness_avg_used = EXCLUDED.soreness_avg_used,
    soreness_reported_count = EXCLUDED.soreness_reported_count,
    nutrition_source = EXCLUDED.nutrition_source,
    hrv_source = EXCLUDED.hrv_source,
    modality_bonus_source = EXCLUDED.modality_bonus_source,
    fallbacks = EXCLUDED.fallbacks,
    calculated_at = EXCLUDED.calculated_at,
    measurement_source = EXCLUDED.measurement_source,
    source_detail = EXCLUDED.source_detail,
    updated_at = now()
  RETURNING * INTO v_result;

  PERFORM recovery.refresh_modality_deltas(p_user_id, p_entry_date - 1);
  PERFORM recovery.refresh_modality_deltas(p_user_id, p_entry_date);

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION recovery.recalculate_score(UUID, DATE) IS
  'Berechnet und speichert einen manual Recovery-Score-Schnappschuss aus checkins, Nutrition-Fallback 70 und Modalitaeten-Bonus. C-215 entfernt ACWR/Training-Load aus der Score-Rechnung.';

CREATE OR REPLACE FUNCTION recovery.refresh_scores_for_user(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  r RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR r IN
    SELECT entry_date
    FROM recovery.checkins
    WHERE user_id = p_user_id
    ORDER BY entry_date
  LOOP
    PERFORM recovery.recalculate_score(p_user_id, r.entry_date);
    v_count := v_count + 1;
  END LOOP;

  UPDATE recovery.modality_log ml
  SET next_day_score_delta = round((next_score.score - current_score.score)::numeric, 1),
      updated_at = now()
  FROM recovery.scores current_score
  JOIN recovery.scores next_score
    ON next_score.user_id = current_score.user_id
   AND next_score.entry_date = current_score.entry_date + 1
  WHERE ml.user_id = p_user_id
    AND current_score.user_id = ml.user_id
    AND current_score.entry_date = ml.entry_date;

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION recovery.refresh_scores_for_user(UUID) IS
  'Rechnet alle Score-Schnappschuesse eines Nutzers aus recovery.checkins neu.';

GRANT USAGE ON SCHEMA recovery TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON recovery.scores, recovery.modality_log TO authenticated;
GRANT ALL ON recovery.scores, recovery.modality_log TO service_role;
GRANT EXECUTE ON FUNCTION recovery.scoring_constants() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION recovery.modality_bonus_value(TEXT) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION recovery.recalculate_score(UUID, DATE) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION recovery.refresh_scores_for_user(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION recovery.refresh_modality_deltas(UUID, DATE) TO authenticated, service_role;

ALTER TABLE recovery.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE recovery.modality_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS recovery_scores_select ON recovery.scores;
DROP POLICY IF EXISTS recovery_scores_insert ON recovery.scores;
DROP POLICY IF EXISTS recovery_scores_update ON recovery.scores;
DROP POLICY IF EXISTS recovery_scores_delete ON recovery.scores;
CREATE POLICY recovery_scores_select ON recovery.scores
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_scores_insert ON recovery.scores
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_scores_update ON recovery.scores
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_scores_delete ON recovery.scores
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS recovery_modality_log_select ON recovery.modality_log;
DROP POLICY IF EXISTS recovery_modality_log_insert ON recovery.modality_log;
DROP POLICY IF EXISTS recovery_modality_log_update ON recovery.modality_log;
DROP POLICY IF EXISTS recovery_modality_log_delete ON recovery.modality_log;
CREATE POLICY recovery_modality_log_select ON recovery.modality_log
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_modality_log_insert ON recovery.modality_log
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_modality_log_update ON recovery.modality_log
  FOR UPDATE TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY recovery_modality_log_delete ON recovery.modality_log
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

DO $$
DECLARE
  v_missing INTEGER;
BEGIN
  SELECT count(*)
  INTO v_missing
  FROM (
    VALUES
      ('recovery_scores_select'),
      ('recovery_scores_insert'),
      ('recovery_scores_update'),
      ('recovery_scores_delete'),
      ('recovery_modality_log_select'),
      ('recovery_modality_log_insert'),
      ('recovery_modality_log_update'),
      ('recovery_modality_log_delete')
  ) expected(policy_name)
  LEFT JOIN pg_policies p
    ON p.schemaname = 'recovery'
   AND p.policyname = expected.policy_name
  WHERE p.policyname IS NULL;

  IF v_missing <> 0 THEN
    RAISE EXCEPTION 'Recovery Scores/Modalitaeten: % RLS-Policies fehlen', v_missing;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'recovery'
      AND c.relname = 'scores'
      AND c.relrowsecurity
  ) THEN
    RAISE EXCEPTION 'Recovery Scores: RLS ist nicht aktiv';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'recovery'
      AND c.relname = 'modality_log'
      AND c.relrowsecurity
  ) THEN
    RAISE EXCEPTION 'Recovery modality_log: RLS ist nicht aktiv';
  END IF;

  RAISE NOTICE 'OK: C-125 recovery.scores und recovery.modality_log mit RLS und zentralen Konstanten angelegt.';
END $$;

COMMIT;
