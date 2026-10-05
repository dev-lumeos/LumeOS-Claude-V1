BEGIN;

-- G-604: Ein Nutzer hat hoechstens ein aktives Kalorienziel.
-- Eigener Nach-Dump-Schritt: 111 ist im A-90-Grunddaten-Dump eingefroren.
COMMENT ON COLUMN goals.user_goals.is_primary IS
  'G-604: Kennzeichnet ausschliesslich das aktive Kalorienziel. Die Prioritaetsreihenfolge aendert diese Bindung nicht.';

-- 4. G-604: genau ein aktives Kalorienziel und daran gebundenes Primary.
--    Die Richtung steht an der offenen Zielphase, nicht an priority oder
--    dem mehrdeutigen user_goals.subtype. Mini Cut und Contest Prep sind
--    laut zielvokabular.json Unterformen von lose_weight.
-- -------------------------------------------------------------
CREATE OR REPLACE FUNCTION goals.kalorienrichtung_fuer_phase(p_phase_type text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT CASE p_phase_type
    WHEN 'fat_loss' THEN 'lose_weight'
    WHEN 'mini_cut' THEN 'lose_weight'
    WHEN 'contest_prep' THEN 'lose_weight'
    WHEN 'lean_bulk' THEN 'gain_muscle'
    WHEN 'maintenance' THEN 'maintain'
    WHEN 'recomp' THEN 'recomposition'
    ELSE NULL
  END;
$$;

COMMENT ON FUNCTION goals.kalorienrichtung_fuer_phase(text) IS
  'G-604: kanonische Kalorienrichtung einer Zielphase nach daten/zielvokabular.json; NULL bedeutet keine belegte Kalorienrichtung.';

CREATE OR REPLACE FUNCTION goals.bind_primary_to_active_calorie_goal(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_goal_id uuid;
  v_goal_count integer;
BEGIN
  IF p_user_id IS NULL THEN
    RETURN;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(p_user_id::text, 604)
  );

  SELECT min(ug.id::text)::uuid, count(DISTINCT ug.id)::integer
  INTO v_goal_id, v_goal_count
  FROM goals.user_goals ug
  WHERE ug.user_id = p_user_id
    AND ug.status = 'active'
    AND EXISTS (
      SELECT 1
      FROM goals.goal_phases gp
      WHERE gp.goal_id = ug.id
        AND gp.actual_end_date IS NULL
        AND goals.kalorienrichtung_fuer_phase(gp.phase_type) IS NOT NULL
    );

  IF v_goal_count > 1 THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'Es darf nur ein aktives Kalorienziel geben. Das andere Ziel zuerst planen oder pausieren.',
      CONSTRAINT = 'user_goals_one_active_calorie_direction';
  END IF;

  -- Zwei Schritte vermeiden einen Zwischenkonflikt mit dem bestehenden
  -- Unique-Index. Auch inaktive und nichtkalorische Ziele bleiben unprimaer.
  UPDATE goals.user_goals
  SET is_primary = false
  WHERE user_id = p_user_id
    AND is_primary;

  IF v_goal_id IS NOT NULL THEN
    UPDATE goals.user_goals
    SET is_primary = true
    WHERE id = v_goal_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION goals.user_goals_calorie_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_is_calorie_goal boolean;
BEGIN
  -- bind_primary_to_active_calorie_goal aktualisiert dieselbe Tabelle. Die
  -- geschachtelten Updates sind bereits unter demselben Nutzer-Lock geprueft.
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.user_id::text, 604)
  );

  SELECT NEW.status = 'active' AND EXISTS (
    SELECT 1
    FROM goals.goal_phases gp
    WHERE gp.goal_id = NEW.id
      AND gp.actual_end_date IS NULL
      AND goals.kalorienrichtung_fuer_phase(gp.phase_type) IS NOT NULL
  ) INTO v_is_calorie_goal;

  IF v_is_calorie_goal AND EXISTS (
    SELECT 1
    FROM goals.user_goals other_goal
    WHERE other_goal.user_id = NEW.user_id
      AND other_goal.id <> NEW.id
      AND other_goal.status = 'active'
      AND EXISTS (
        SELECT 1
        FROM goals.goal_phases other_phase
        WHERE other_phase.goal_id = other_goal.id
          AND other_phase.actual_end_date IS NULL
          AND goals.kalorienrichtung_fuer_phase(other_phase.phase_type) IS NOT NULL
      )
  ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'Es darf nur ein aktives Kalorienziel geben. Das andere Ziel zuerst planen oder pausieren.',
      CONSTRAINT = 'user_goals_one_active_calorie_direction';
  END IF;

  NEW.is_primary := v_is_calorie_goal;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION goals.goal_phases_calorie_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
DECLARE
  v_goal_user_id uuid;
  v_goal_status text;
BEGIN
  IF NEW.goal_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT ug.user_id, ug.status
  INTO v_goal_user_id, v_goal_status
  FROM goals.user_goals ug
  WHERE ug.id = NEW.goal_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'goal_phases: Ziel fehlt oder gehoert nicht dem angemeldeten Nutzer'
      USING ERRCODE = '42501';
  END IF;

  IF v_goal_user_id <> NEW.user_id THEN
    RAISE EXCEPTION 'goal_phases: Phase und Ziel muessen demselben Nutzer gehoeren'
      USING ERRCODE = '23514';
  END IF;

  PERFORM pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(NEW.user_id::text, 604)
  );

  IF v_goal_status = 'active'
     AND NEW.actual_end_date IS NULL
     AND goals.kalorienrichtung_fuer_phase(NEW.phase_type) IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM goals.user_goals other_goal
       WHERE other_goal.user_id = NEW.user_id
         AND other_goal.id <> NEW.goal_id
         AND other_goal.status = 'active'
         AND EXISTS (
           SELECT 1
           FROM goals.goal_phases other_phase
           WHERE other_phase.goal_id = other_goal.id
             AND other_phase.actual_end_date IS NULL
             AND goals.kalorienrichtung_fuer_phase(other_phase.phase_type) IS NOT NULL
         )
     ) THEN
    RAISE EXCEPTION USING
      ERRCODE = '23514',
      MESSAGE = 'Es darf nur ein aktives Kalorienziel geben. Das andere Ziel zuerst planen oder pausieren.',
      CONSTRAINT = 'user_goals_one_active_calorie_direction';
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION goals.sync_primary_after_goal_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF pg_trigger_depth() > 1 THEN
    RETURN NULL;
  END IF;

  IF TG_OP <> 'INSERT' THEN
    PERFORM goals.bind_primary_to_active_calorie_goal(OLD.user_id);
  END IF;
  IF TG_OP <> 'DELETE'
     AND (TG_OP = 'INSERT' OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
    PERFORM goals.bind_primary_to_active_calorie_goal(NEW.user_id);
  END IF;
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION goals.sync_primary_after_phase_write()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP <> 'INSERT' THEN
    PERFORM goals.bind_primary_to_active_calorie_goal(OLD.user_id);
  END IF;
  IF TG_OP <> 'DELETE'
     AND (TG_OP = 'INSERT' OR NEW.user_id IS DISTINCT FROM OLD.user_id) THEN
    PERFORM goals.bind_primary_to_active_calorie_goal(NEW.user_id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS user_goals_calorie_guard ON goals.user_goals;
CREATE TRIGGER user_goals_calorie_guard
  BEFORE INSERT OR UPDATE ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.user_goals_calorie_guard();

DROP TRIGGER IF EXISTS user_goals_sync_primary ON goals.user_goals;
CREATE TRIGGER user_goals_sync_primary
  AFTER INSERT OR UPDATE OR DELETE ON goals.user_goals
  FOR EACH ROW EXECUTE FUNCTION goals.sync_primary_after_goal_write();

DROP TRIGGER IF EXISTS goal_phases_calorie_guard ON goals.goal_phases;
CREATE TRIGGER goal_phases_calorie_guard
  BEFORE INSERT OR UPDATE ON goals.goal_phases
  FOR EACH ROW EXECUTE FUNCTION goals.goal_phases_calorie_guard();

DROP TRIGGER IF EXISTS goal_phases_sync_primary ON goals.goal_phases;
CREATE TRIGGER goal_phases_sync_primary
  AFTER INSERT OR UPDATE OR DELETE ON goals.goal_phases
  FOR EACH ROW EXECUTE FUNCTION goals.sync_primary_after_phase_write();

REVOKE ALL ON FUNCTION goals.kalorienrichtung_fuer_phase(text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION goals.bind_primary_to_active_calorie_goal(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION goals.user_goals_calorie_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION goals.goal_phases_calorie_guard() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION goals.sync_primary_after_goal_write() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION goals.sync_primary_after_phase_write() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION goals.kalorienrichtung_fuer_phase(text)
  TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION goals.bind_primary_to_active_calorie_goal(uuid)
  TO authenticated, service_role;

-- Ein bestehender Widerspruch wird nicht still korrigiert. Auf einer bereits
-- befuellten Datenbank bricht der Schritt ab und laesst die Transaktion ganz.
DO $g604_existing$
DECLARE
  v_violating_users integer;
BEGIN
  SELECT count(*)::integer
  INTO v_violating_users
  FROM (
    SELECT ug.user_id
    FROM goals.user_goals ug
    JOIN goals.goal_phases gp ON gp.goal_id = ug.id
    WHERE ug.status = 'active'
      AND gp.actual_end_date IS NULL
      AND goals.kalorienrichtung_fuer_phase(gp.phase_type) IS NOT NULL
    GROUP BY ug.user_id
    HAVING count(DISTINCT ug.id) > 1
  ) violations;

  IF v_violating_users > 0 THEN
    RAISE EXCEPTION
      'G-604: % Nutzer mit mehr als einem aktiven Kalorienziel; Bestand nicht automatisch geaendert',
      v_violating_users
      USING ERRCODE = '23514',
            CONSTRAINT = 'user_goals_one_active_calorie_direction';
  END IF;
END;
$g604_existing$;

DO $g604_primary$
DECLARE
  v_user_id uuid;
BEGIN
  FOR v_user_id IN
    SELECT DISTINCT ug.user_id FROM goals.user_goals ug
  LOOP
    PERFORM goals.bind_primary_to_active_calorie_goal(v_user_id);
  END LOOP;
END;
$g604_primary$;

-- -------------------------------------------------------------

COMMIT;
