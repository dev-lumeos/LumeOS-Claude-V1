-- G-560/E-85: Ein Programm ist eine gespeicherte Folge geplanter
-- Strategien. Eine Position beschreibt die kuenftige Phase; die
-- goals.goal_phases-Zeile entsteht erst beim Start und kann dann verknuepft
-- werden. Damit bleibt "offen" ausschliesslich ein Ausfuehrungszustand.

BEGIN;

CREATE TABLE goals.goal_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL
    REFERENCES goals.user_goals(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT goal_programs_name_check CHECK (btrim(name) <> '')
);

CREATE TABLE goals.goal_program_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid NOT NULL
    REFERENCES goals.goal_programs(id) ON DELETE CASCADE,
  position smallint NOT NULL,
  strategie_code text NOT NULL
    REFERENCES goals.goal_strategies(code) ON DELETE RESTRICT,
  sub_phase_code text,
  duration_weeks smallint NOT NULL,
  goal_phase_id uuid UNIQUE
    REFERENCES goals.goal_phases(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT goal_program_positions_program_id_position_key
    UNIQUE (program_id, position),
  CONSTRAINT goal_program_positions_position_check
    CHECK (position > 0),
  CONSTRAINT goal_program_positions_duration_check
    CHECK (duration_weeks > 0),
  CONSTRAINT goal_program_positions_sub_phase_code_check
    CHECK (sub_phase_code IS NULL OR btrim(sub_phase_code) <> '')
);

CREATE INDEX goal_programs_goal_id_idx
  ON goals.goal_programs(goal_id);
CREATE INDEX goal_program_positions_program_position_idx
  ON goals.goal_program_positions(program_id, position);

COMMENT ON TABLE goals.goal_programs IS
  'G-560/E-85: editierbare Folge geplanter Strategien fuer genau ein Nutzerziel.';
COMMENT ON TABLE goals.goal_program_positions IS
  'G-560/E-85: geplante Strategie mit Nutzerwochen; vor dem Beginn besteht keine goal_phases-Zeile.';
COMMENT ON COLUMN goals.goal_program_positions.duration_weeks IS
  'Vom Nutzer editierte Dauer. Katalog-Unterphasen liefern nur das Verhaeltnis, keine absoluten Wochen.';
COMMENT ON COLUMN goals.goal_program_positions.goal_phase_id IS
  'Erst nach dem Start gesetzt; verbindet den Plan mit der ausfuehrenden oder historischen Phase.';

-- E-85: Quelle sind die drei relativen Anteile 22/44/33 Prozent. Absolute
-- Wochen bleiben bewusst ausserhalb des Katalogs und liegen je Nutzerposition.
UPDATE goals.goal_strategies gs
SET sub_phases = (
  SELECT jsonb_agg(
    part || jsonb_build_object(
      'duration_ratio_pct',
      CASE part ->> 'name'
        WHEN 'early' THEN 22
        WHEN 'mid' THEN 44
        WHEN 'late' THEN 33
      END
    )
    ORDER BY ordinality
  )
  FROM jsonb_array_elements(gs.sub_phases)
    WITH ORDINALITY AS p(part, ordinality)
)
WHERE gs.code = 'contest_prep'
  AND jsonb_array_length(gs.sub_phases) = 3
  AND NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(gs.sub_phases) AS p(part)
    WHERE part ->> 'name' NOT IN ('early', 'mid', 'late')
  );

CREATE FUNCTION goals.goal_program_position_validate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  -- Leere Texte laesst der benannte Tabellen-CHECK abweisen. Der Trigger
  -- prueft erst die fachliche, tabellenuebergreifende Zuordnung.
  IF NEW.sub_phase_code IS NOT NULL
     AND btrim(NEW.sub_phase_code) <> ''
     AND NOT EXISTS (
    SELECT 1
    FROM goals.goal_strategies gs
    CROSS JOIN LATERAL jsonb_array_elements(gs.sub_phases) AS p(part)
    WHERE gs.code = NEW.strategie_code
      AND part ->> 'name' = NEW.sub_phase_code
  ) THEN
    RAISE EXCEPTION
      'goal_program_positions: Unterphase % gehoert nicht zu Strategie %',
      NEW.sub_phase_code, NEW.strategie_code
      USING ERRCODE = '23514';
  END IF;

  IF NEW.goal_phase_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM goals.goal_programs program
    JOIN goals.goal_phases phase
      ON phase.id = NEW.goal_phase_id
     AND phase.goal_id = program.goal_id
     AND phase.strategie_code = NEW.strategie_code
    WHERE program.id = NEW.program_id
  ) THEN
    RAISE EXCEPTION
      'goal_program_positions: gestartete Phase passt nicht zu Ziel und Strategie der Position'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION goals.goal_program_position_validate()
  FROM PUBLIC, anon, authenticated;

CREATE TRIGGER goal_program_positions_validate
  BEFORE INSERT OR UPDATE OF program_id, strategie_code, sub_phase_code, goal_phase_id
  ON goals.goal_program_positions
  FOR EACH ROW EXECUTE FUNCTION goals.goal_program_position_validate();

CREATE TRIGGER goal_programs_touch_updated_at
  BEFORE UPDATE ON goals.goal_programs
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();
CREATE TRIGGER goal_program_positions_touch_updated_at
  BEFORE UPDATE ON goals.goal_program_positions
  FOR EACH ROW EXECUTE FUNCTION goals.touch_updated_at();

REVOKE ALL ON goals.goal_programs, goals.goal_program_positions
  FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON goals.goal_programs, goals.goal_program_positions
  TO authenticated;
GRANT ALL ON goals.goal_programs, goals.goal_program_positions
  TO service_role;

ALTER TABLE goals.goal_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals.goal_program_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY goal_programs_owner ON goals.goal_programs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM goals.user_goals goal
      WHERE goal.id = goal_id
        AND goal.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM goals.user_goals goal
      WHERE goal.id = goal_id
        AND goal.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY goal_program_positions_owner ON goals.goal_program_positions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM goals.goal_programs program
      JOIN goals.user_goals goal ON goal.id = program.goal_id
      WHERE program.id = program_id
        AND goal.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM goals.goal_programs program
      JOIN goals.user_goals goal ON goal.id = program.goal_id
      WHERE program.id = program_id
        AND goal.user_id = (SELECT auth.uid())
    )
  );

DO $g560$
BEGIN
  IF (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', part ->> 'name',
        'duration_ratio_pct', (part ->> 'duration_ratio_pct')::integer
      ) ORDER BY ordinality
    )
    FROM goals.goal_strategies gs
    CROSS JOIN LATERAL jsonb_array_elements(gs.sub_phases)
      WITH ORDINALITY AS p(part, ordinality)
    WHERE gs.code = 'contest_prep'
  ) IS DISTINCT FROM '[
    {"name":"early","duration_ratio_pct":22},
    {"name":"mid","duration_ratio_pct":44},
    {"name":"late","duration_ratio_pct":33}
  ]'::jsonb THEN
    RAISE EXCEPTION 'G-560: Contest-Prep-Verhaeltnis ist nicht 22/44/33';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM goals.goal_strategies gs
    CROSS JOIN LATERAL jsonb_array_elements(gs.sub_phases) AS p(part)
    WHERE gs.code = 'contest_prep' AND part ? 'weeks'
  ) THEN
    RAISE EXCEPTION 'G-560: absolute Unterphasenwochen gehoeren nicht in den Katalog';
  END IF;
END
$g560$;

COMMIT;
