-- =============================================================
-- 111 — Goals: Ziele und Phasen (GO-07)
-- Datum: 2026-08-17
-- Zweck: Speichert, welches Ziel ein Nutzer verfolgt und welche Phase
--        ab welchem lokalen Datum gilt. Berechnet keine Zielwerte und
--        veraendert goals.nutrition_targets nicht.
-- Idempotent: CREATE IF NOT EXISTS, Policies per DROP + CREATE.
-- =============================================================

BEGIN;

CREATE SCHEMA IF NOT EXISTS goals;

COMMENT ON SCHEMA goals IS
  'Ziele, Zielwerte und Phasen. nutrition_targets rechnet Tagesziele; user_goals und goal_phases beschreiben Absicht und Phase.';

-- -------------------------------------------------------------
-- 1. Ziele des Nutzers.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goals.user_goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  goal_type       TEXT NOT NULL
    CHECK (goal_type IN ('body_composition','performance','health','lifestyle')),
  subtype         TEXT,
  title           TEXT NOT NULL CHECK (btrim(title) <> ''),
  description     TEXT,

  target_value    NUMERIC(12,3),
  target_unit     TEXT,
  start_value     NUMERIC(12,3),
  current_value   NUMERIC(12,3),

  -- Lokales Datum wie bei meals.entry_date: ab wann das Ziel fachlich gilt.
  gueltig_ab      DATE NOT NULL,
  target_date     DATE,

  status          TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','achieved','missed','abandoned','on_hold')),
  priority        SMALLINT NOT NULL DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  is_primary      BOOLEAN NOT NULL DEFAULT false,

  progress_pct    NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  motivation_reason TEXT,
  difficulty_level TEXT
    CHECK (difficulty_level IS NULL OR difficulty_level IN ('easy','moderate','challenging','aggressive','unrealistic')),
  auto_update     BOOLEAN NOT NULL DEFAULT true,
  celebration_enabled BOOLEAN NOT NULL DEFAULT true,
  achievement_date DATE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (target_date IS NULL OR target_date >= gueltig_ab),
  CHECK (status <> 'active' OR priority BETWEEN 1 AND 3)
);

CREATE INDEX IF NOT EXISTS idx_user_goals_user_status
  ON goals.user_goals(user_id, status, gueltig_ab DESC);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_type
  ON goals.user_goals(user_id, goal_type);

-- Tom/OPEN_ITEMS: hoechstens drei aktive Ziele je Nutzer.
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_goals_active_slot
  ON goals.user_goals(user_id, priority)
  WHERE status = 'active';
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_goals_one_primary
  ON goals.user_goals(user_id)
  WHERE status = 'active' AND is_primary;

COMMENT ON TABLE goals.user_goals IS
  'Konkrete Nutzerziele. Maximal drei aktive Ziele werden ueber aktive Prioritaets-Slots 1-3 erzwungen.';
COMMENT ON COLUMN goals.user_goals.gueltig_ab IS
  'Lokales Datum, ab dem das Ziel gilt. Tage davor bekommen nicht rueckwirkend dieses Ziel.';
COMMENT ON COLUMN goals.user_goals.status IS
  'active/paused/on_hold fuer laufende Ziele, achieved/missed/abandoned fuer die Historie. Abgeschlossene Ziele belegen keinen aktiven Slot.';

-- C-140: bestehende Datenbanken hatten den urspruenglichen CHECK ohne
-- missed. CREATE TABLE IF NOT EXISTS wuerde ihn nicht nachziehen.
ALTER TABLE goals.user_goals
  DROP CONSTRAINT IF EXISTS user_goals_status_check;
ALTER TABLE goals.user_goals
  ADD CONSTRAINT user_goals_status_check
  CHECK (status IN ('active','paused','achieved','missed','abandoned','on_hold'));

-- -------------------------------------------------------------
-- 2. Phasen, unabhaengig vom konkreten Ziel waehlbar.
-- -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS goals.goal_phases (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_id            UUID REFERENCES goals.user_goals(id) ON DELETE SET NULL,

  phase_type         TEXT NOT NULL
    CHECK (phase_type IN ('fat_loss','lean_bulk','maintenance','recomp',
                          'contest_prep','reverse_diet','expert_bb_annual',
                          'mini_cut','peak_week')),
  variant            TEXT,
  parameters         JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Lokales Datum, nicht timestamptz. Die Zeitzonenfrage wird wie bei
  -- meals geloest: der Tag ist der Ortstag des Nutzers.
  gueltig_ab         DATE NOT NULL,
  projected_end_date DATE,
  actual_end_date    DATE,

  transitioned_from  TEXT,
  recommended_next   TEXT,
  transition_reason  TEXT,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (projected_end_date IS NULL OR projected_end_date >= gueltig_ab),
  CHECK (actual_end_date IS NULL OR actual_end_date >= gueltig_ab),
  CHECK (jsonb_typeof(parameters) = 'object')
);

CREATE INDEX IF NOT EXISTS idx_goal_phases_user_ab
  ON goals.goal_phases(user_id, gueltig_ab DESC);
CREATE INDEX IF NOT EXISTS idx_goal_phases_goal
  ON goals.goal_phases(goal_id)
  WHERE goal_id IS NOT NULL;

-- Genau eine laufende Phase je Nutzer. Historische Phasen bleiben stehen.
CREATE UNIQUE INDEX IF NOT EXISTS uq_goal_phases_one_open
  ON goals.goal_phases(user_id)
  WHERE actual_end_date IS NULL;

COMMENT ON TABLE goals.goal_phases IS
  'Phasenhistorie je Nutzer. Die Phase ist optional an ein Ziel gebunden, aber fachlich unabhaengig waehlbar.';
COMMENT ON COLUMN goals.goal_phases.gueltig_ab IS
  'Lokales Datum, ab dem diese Phase gilt. Vor der ersten Phase liefert goals.phase_am keine Zeile.';

-- -------------------------------------------------------------
-- 3. updated_at.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION goals.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_goals_touch_updated_at ON goals.user_goals;
CREATE TRIGGER user_goals_touch_updated_at
  BEFORE UPDATE ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

DROP TRIGGER IF EXISTS goal_phases_touch_updated_at ON goals.goal_phases;
CREATE TRIGGER goal_phases_touch_updated_at
  BEFORE UPDATE ON goals.goal_phases
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

-- -------------------------------------------------------------
-- 4. Welche Phase gilt an einem Tag?
-- -------------------------------------------------------------
DROP FUNCTION IF EXISTS goals.phase_am(UUID, DATE);

CREATE FUNCTION goals.phase_am(
  p_user_id UUID,
  p_stichtag DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  phase_id UUID,
  goal_id UUID,
  phase_type TEXT,
  variant TEXT,
  parameters JSONB,
  gueltig_ab DATE,
  projected_end_date DATE,
  actual_end_date DATE
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT gp.id, gp.goal_id, gp.phase_type, gp.variant, gp.parameters,
         gp.gueltig_ab, gp.projected_end_date, gp.actual_end_date
  FROM goals.goal_phases gp
  WHERE gp.user_id = p_user_id
    AND gp.gueltig_ab <= p_stichtag
    AND (gp.actual_end_date IS NULL OR gp.actual_end_date >= p_stichtag)
  ORDER BY gp.gueltig_ab DESC
  LIMIT 1;
$$;

COMMENT ON FUNCTION goals.phase_am(UUID, DATE) IS
  'Die am lokalen Stichtag gueltige Goal-Phase. Vor der ersten gueltig_ab-Zeile keine Zeile.';

-- -------------------------------------------------------------
-- 5. Rechte und Zeilenschutz.
-- -------------------------------------------------------------
GRANT USAGE ON SCHEMA goals TO authenticated, service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON goals.user_goals TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON goals.goal_phases TO authenticated;
GRANT ALL ON goals.user_goals TO service_role;
GRANT ALL ON goals.goal_phases TO service_role;
GRANT EXECUTE ON FUNCTION goals.phase_am(UUID, DATE) TO authenticated, service_role;

ALTER TABLE goals.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals.goal_phases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_goals_select ON goals.user_goals;
DROP POLICY IF EXISTS user_goals_insert ON goals.user_goals;
DROP POLICY IF EXISTS user_goals_update ON goals.user_goals;
DROP POLICY IF EXISTS user_goals_delete ON goals.user_goals;
DROP POLICY IF EXISTS goal_phases_select ON goals.goal_phases;
DROP POLICY IF EXISTS goal_phases_insert ON goals.goal_phases;
DROP POLICY IF EXISTS goal_phases_update ON goals.goal_phases;
DROP POLICY IF EXISTS goal_phases_delete ON goals.goal_phases;

CREATE POLICY user_goals_select ON goals.user_goals
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY user_goals_insert ON goals.user_goals
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_goals_update ON goals.user_goals
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY user_goals_delete ON goals.user_goals
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

CREATE POLICY goal_phases_select ON goals.goal_phases
  FOR SELECT TO authenticated USING ((SELECT auth.uid()) = user_id);
CREATE POLICY goal_phases_insert ON goals.goal_phases
  FOR INSERT TO authenticated WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY goal_phases_update ON goals.goal_phases
  FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY goal_phases_delete ON goals.goal_phases
  FOR DELETE TO authenticated USING ((SELECT auth.uid()) = user_id);

-- -------------------------------------------------------------
-- 6. Selbstpruefung.
-- -------------------------------------------------------------
DO $$
DECLARE
  v_user_goal_policies INTEGER;
  v_phase_policies INTEGER;
  v_user_goals_rls BOOLEAN;
  v_goal_phases_rls BOOLEAN;
BEGIN
  SELECT count(*) INTO v_user_goal_policies
  FROM pg_policies WHERE schemaname = 'goals' AND tablename = 'user_goals';
  SELECT count(*) INTO v_phase_policies
  FROM pg_policies WHERE schemaname = 'goals' AND tablename = 'goal_phases';

  IF v_user_goal_policies <> 4 THEN
    RAISE EXCEPTION 'goals.user_goals: % Policies statt 4', v_user_goal_policies;
  END IF;
  IF v_phase_policies <> 4 THEN
    RAISE EXCEPTION 'goals.goal_phases: % Policies statt 4', v_phase_policies;
  END IF;

  SELECT c.relrowsecurity INTO v_user_goals_rls
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'goals' AND c.relname = 'user_goals';
  SELECT c.relrowsecurity INTO v_goal_phases_rls
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'goals' AND c.relname = 'goal_phases';

  IF NOT v_user_goals_rls THEN
    RAISE EXCEPTION 'goals.user_goals: Zeilenschutz ist aus';
  END IF;
  IF NOT v_goal_phases_rls THEN
    RAISE EXCEPTION 'goals.goal_phases: Zeilenschutz ist aus';
  END IF;

  RAISE NOTICE 'OK: goals.user_goals und goals.goal_phases mit RLS und je 4 Policies';
END $$;

COMMIT;
