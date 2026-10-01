// G-560: Ein Goal-Programm speichert geplante Strategien als geordnete
// Positionen. Erst beim Start entsteht die ausfuehrende goal_phases-Zeile.
// Diese Probe wird als eigener Schritt aus kette.json ausgefuehrt.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-560 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-560 A1/A3/A4: Tabellen, Grenzen, Beziehungen und RLS stehen', () => {
  const result = one<{
    programsTable: string | null
    positionsTable: string | null
    programColumns: string[]
    positionColumns: string[]
    checks: string[]
    foreignKeys: string[]
    uniqueKeys: string[]
    rlsTables: string[]
    policies: string[]
    contestRatios: Array<{ name: string; duration_ratio_pct: number }>
    contestHasWeeks: boolean
  }>(`
    SELECT json_build_object(
      'programsTable', to_regclass('goals.goal_programs')::text,
      'positionsTable', to_regclass('goals.goal_program_positions')::text,
      'programColumns', (
        SELECT json_agg(column_name ORDER BY ordinal_position)
        FROM information_schema.columns
        WHERE table_schema = 'goals' AND table_name = 'goal_programs'
      ),
      'positionColumns', (
        SELECT json_agg(column_name ORDER BY ordinal_position)
        FROM information_schema.columns
        WHERE table_schema = 'goals' AND table_name = 'goal_program_positions'
      ),
      'checks', (
        SELECT coalesce(json_agg(c.conname ORDER BY c.conname), '[]'::json)
        FROM pg_constraint c
        WHERE c.conrelid IN (
          to_regclass('goals.goal_programs'),
          to_regclass('goals.goal_program_positions')
        ) AND c.contype = 'c'
      ),
      'foreignKeys', (
        SELECT coalesce(json_agg(c.conname ORDER BY c.conname), '[]'::json)
        FROM pg_constraint c
        WHERE c.conrelid IN (
          to_regclass('goals.goal_programs'),
          to_regclass('goals.goal_program_positions')
        ) AND c.contype = 'f'
      ),
      'uniqueKeys', (
        SELECT coalesce(json_agg(c.conname ORDER BY c.conname), '[]'::json)
        FROM pg_constraint c
        WHERE c.conrelid IN (
          to_regclass('goals.goal_programs'),
          to_regclass('goals.goal_program_positions')
        ) AND c.contype = 'u'
      ),
      'rlsTables', (
        SELECT coalesce(json_agg(c.relname ORDER BY c.relname), '[]'::json)
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'goals'
          AND c.relname IN ('goal_programs', 'goal_program_positions')
          AND c.relrowsecurity
      ),
      'policies', (
        SELECT coalesce(json_agg(tablename || '.' || policyname ORDER BY tablename, policyname), '[]'::json)
        FROM pg_policies
        WHERE schemaname = 'goals'
          AND tablename IN ('goal_programs', 'goal_program_positions')
      ),
      'contestRatios', (
        SELECT json_agg(
          json_build_object(
            'name', part ->> 'name',
            'duration_ratio_pct', (part ->> 'duration_ratio_pct')::integer
          ) ORDER BY ordinality
        )
        FROM goals.goal_strategies gs
        CROSS JOIN LATERAL jsonb_array_elements(gs.sub_phases)
          WITH ORDINALITY AS p(part, ordinality)
        WHERE gs.code = 'contest_prep'
      ),
      'contestHasWeeks', EXISTS (
        SELECT 1
        FROM goals.goal_strategies gs
        CROSS JOIN LATERAL jsonb_array_elements(gs.sub_phases) AS p(part)
        WHERE gs.code = 'contest_prep' AND part ? 'weeks'
      )
    );
  `)

  assert.equal(result.programsTable, 'goals.goal_programs')
  assert.equal(result.positionsTable, 'goals.goal_program_positions')
  assert.deepEqual(result.programColumns, [
    'id', 'goal_id', 'name', 'created_at', 'updated_at',
  ])
  assert.deepEqual(result.positionColumns, [
    'id', 'program_id', 'position', 'strategie_code', 'sub_phase_code',
    'duration_weeks', 'goal_phase_id', 'created_at', 'updated_at',
  ])
  assert.deepEqual(result.checks, [
    'goal_program_positions_duration_check',
    'goal_program_positions_position_check',
    'goal_program_positions_sub_phase_code_check',
    'goal_programs_name_check',
  ])
  assert.deepEqual(result.foreignKeys, [
    'goal_program_positions_goal_phase_id_fkey',
    'goal_program_positions_program_id_fkey',
    'goal_program_positions_strategie_code_fkey',
    'goal_programs_goal_id_fkey',
  ])
  assert.deepEqual(result.uniqueKeys, [
    'goal_program_positions_goal_phase_id_key',
    'goal_program_positions_program_id_position_key',
  ])
  assert.deepEqual(result.rlsTables, ['goal_program_positions', 'goal_programs'])
  assert.deepEqual(result.policies, [
    'goal_program_positions.goal_program_positions_owner',
    'goal_programs.goal_programs_owner',
  ])
  assert.deepEqual(result.contestRatios, [
    { name: 'early', duration_ratio_pct: 22 },
    { name: 'mid', duration_ratio_pct: 44 },
    { name: 'late', duration_ratio_pct: 33 },
  ])
  const weeksFromRatio = (total: number) => result.contestRatios.map(
    part => Math.round(total * part.duration_ratio_pct / 100),
  )
  assert.deepEqual(weeksFromRatio(16), [4, 7, 5])
  assert.deepEqual(weeksFromRatio(20), [4, 9, 7])
  assert.equal(result.contestHasWeeks, false)
})

test('G-560 A1-A4: test-user speichert 4/7/5, startet erst danach und bleibt bei einer offenen Zielphase', () => {
  const result = one<{
    email: string
    positionsBeforeStart: Array<{
      position: number
      strategie_code: string
      sub_phase_code: string
      duration_weeks: number
      goal_phase_id: string | null
    }>
    plannedPhaseCount: number
    linkedPhaseCount: number
    duplicateOpenMessage: string
    invalidNameMessage: string
    invalidPositionMessage: string
    invalidDurationMessage: string
    invalidSubPhaseMessage: string
    unknownSubPhaseMessage: string
    foreignProgramMessage: string
  }>(`
    BEGIN;

    CREATE TEMP TABLE g560_result (
      fall text PRIMARY KEY,
      wert text NOT NULL
    ) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g560_result TO authenticated;

    CREATE TEMP TABLE g560_foreign_goal AS
    SELECT ug.id
    FROM goals.user_goals ug
    JOIN auth.users u ON u.id = ug.user_id
    WHERE u.email <> 'test-user@lumeos.local'
    ORDER BY ug.id
    LIMIT 1;
    GRANT SELECT ON g560_foreign_goal TO authenticated;

    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, status, priority
    )
    SELECT
      '56000000-0000-0000-0000-000000000101', u.id,
      'body_composition', 'G-560 Contest Prep', DATE '2099-01-01', 'paused', 5
    FROM auth.users u
    WHERE u.email = 'test-user@lumeos.local'
    ORDER BY u.id
    LIMIT 1;

    SELECT set_config(
      'request.jwt.claims',
      jsonb_build_object(
        'sub', (SELECT user_id::text FROM goals.user_goals
                WHERE id = '56000000-0000-0000-0000-000000000101'),
        'role', 'authenticated'
      )::text,
      true
    );
    SET LOCAL ROLE authenticated;

    INSERT INTO goals.goal_programs (id, goal_id, name)
    VALUES (
      '56000000-0000-0000-0000-000000000201',
      '56000000-0000-0000-0000-000000000101',
      'G-560 Contest Prep, 16 Wochen'
    );

    INSERT INTO goals.goal_program_positions (
      id, program_id, position, strategie_code, sub_phase_code, duration_weeks
    ) VALUES
      ('56000000-0000-0000-0000-000000000301',
       '56000000-0000-0000-0000-000000000201', 1,
       'contest_prep', 'early', 4),
      ('56000000-0000-0000-0000-000000000302',
       '56000000-0000-0000-0000-000000000201', 2,
       'contest_prep', 'mid', 7),
      ('56000000-0000-0000-0000-000000000303',
       '56000000-0000-0000-0000-000000000201', 3,
       'contest_prep', 'late', 5);

    CREATE TEMP TABLE g560_positions AS
    SELECT position, strategie_code, sub_phase_code, duration_weeks, goal_phase_id
    FROM goals.goal_program_positions
    WHERE program_id = '56000000-0000-0000-0000-000000000201'
    ORDER BY position;

    INSERT INTO g560_result VALUES (
      'planned_phase_count',
      (SELECT count(*)::text FROM goals.goal_phases
       WHERE goal_id = '56000000-0000-0000-0000-000000000101')
    );

    DO $probe$
    BEGIN
      BEGIN
        INSERT INTO goals.goal_programs (goal_id, name)
        VALUES ('56000000-0000-0000-0000-000000000101', '   ');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g560_result VALUES ('invalid_name', SQLERRM);
      END;

      BEGIN
        INSERT INTO goals.goal_program_positions (
          program_id, position, strategie_code, duration_weeks
        ) VALUES (
          '56000000-0000-0000-0000-000000000201', 0, 'contest_prep', 1
        );
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g560_result VALUES ('invalid_position', SQLERRM);
      END;

      BEGIN
        INSERT INTO goals.goal_program_positions (
          program_id, position, strategie_code, duration_weeks
        ) VALUES (
          '56000000-0000-0000-0000-000000000201', 4, 'contest_prep', 0
        );
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g560_result VALUES ('invalid_duration', SQLERRM);
      END;

      BEGIN
        INSERT INTO goals.goal_program_positions (
          program_id, position, strategie_code, sub_phase_code, duration_weeks
        ) VALUES (
          '56000000-0000-0000-0000-000000000201', 5,
          'contest_prep', '   ', 1
        );
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g560_result VALUES ('invalid_sub_phase', SQLERRM);
      END;

      BEGIN
        INSERT INTO goals.goal_program_positions (
          program_id, position, strategie_code, sub_phase_code, duration_weeks
        ) VALUES (
          '56000000-0000-0000-0000-000000000201', 6,
          'contest_prep', 'erfunden', 1
        );
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g560_result VALUES ('unknown_sub_phase', SQLERRM);
      END;

      BEGIN
        INSERT INTO goals.goal_programs (goal_id, name)
        SELECT id, 'Fremdes Programm'
        FROM g560_foreign_goal;
        INSERT INTO g560_result VALUES ('foreign_program', 'angenommen');
      EXCEPTION WHEN insufficient_privilege THEN
        INSERT INTO g560_result VALUES ('foreign_program', SQLERRM);
      END;
    END
    $probe$;

    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, parameters, gueltig_ab,
      strategie_code
    ) VALUES (
      '56000000-0000-0000-0000-000000000401', auth.uid(),
      '56000000-0000-0000-0000-000000000101', 'contest_prep',
      '{}'::jsonb, DATE '2099-01-01', 'contest_prep'
    );

    UPDATE goals.goal_program_positions
    SET goal_phase_id = '56000000-0000-0000-0000-000000000401'
    WHERE id = '56000000-0000-0000-0000-000000000301';

    DO $probe$
    BEGIN
      BEGIN
        INSERT INTO goals.goal_phases (
          id, user_id, goal_id, phase_type, parameters, gueltig_ab,
          strategie_code
        ) VALUES (
          '56000000-0000-0000-0000-000000000402', auth.uid(),
          '56000000-0000-0000-0000-000000000101', 'contest_prep',
          '{}'::jsonb, DATE '2099-01-02', 'contest_prep'
        );
      EXCEPTION WHEN unique_violation THEN
        INSERT INTO g560_result VALUES ('duplicate_open', SQLERRM);
      END;
    END
    $probe$;

    RESET ROLE;

    SELECT json_build_object(
      'email', (
        SELECT u.email FROM auth.users u
        JOIN goals.user_goals ug ON ug.user_id = u.id
        WHERE ug.id = '56000000-0000-0000-0000-000000000101'
      ),
      'positionsBeforeStart', (
        SELECT json_agg(row_to_json(p) ORDER BY p.position)
        FROM g560_positions p
      ),
      'plannedPhaseCount', (
        SELECT wert::integer FROM g560_result WHERE fall = 'planned_phase_count'
      ),
      'linkedPhaseCount', (
        SELECT count(*) FROM goals.goal_program_positions
        WHERE goal_phase_id = '56000000-0000-0000-0000-000000000401'
      ),
      'duplicateOpenMessage', (
        SELECT wert FROM g560_result WHERE fall = 'duplicate_open'
      ),
      'invalidNameMessage', (
        SELECT wert FROM g560_result WHERE fall = 'invalid_name'
      ),
      'invalidPositionMessage', (
        SELECT wert FROM g560_result WHERE fall = 'invalid_position'
      ),
      'invalidDurationMessage', (
        SELECT wert FROM g560_result WHERE fall = 'invalid_duration'
      ),
      'invalidSubPhaseMessage', (
        SELECT wert FROM g560_result WHERE fall = 'invalid_sub_phase'
      ),
      'unknownSubPhaseMessage', (
        SELECT wert FROM g560_result WHERE fall = 'unknown_sub_phase'
      ),
      'foreignProgramMessage', (
        SELECT wert FROM g560_result WHERE fall = 'foreign_program'
      )
    );

    ROLLBACK;
  `)

  assert.equal(result.email, 'test-user@lumeos.local')
  assert.deepEqual(result.positionsBeforeStart, [
    {
      position: 1,
      strategie_code: 'contest_prep',
      sub_phase_code: 'early',
      duration_weeks: 4,
      goal_phase_id: null,
    },
    {
      position: 2,
      strategie_code: 'contest_prep',
      sub_phase_code: 'mid',
      duration_weeks: 7,
      goal_phase_id: null,
    },
    {
      position: 3,
      strategie_code: 'contest_prep',
      sub_phase_code: 'late',
      duration_weeks: 5,
      goal_phase_id: null,
    },
  ])
  assert.equal(result.plannedPhaseCount, 0)
  assert.equal(result.linkedPhaseCount, 1)
  assert.equal(
    result.duplicateOpenMessage,
    'duplicate key value violates unique constraint "uq_goal_phases_one_open"',
  )
  assert.match(result.invalidNameMessage, /goal_programs_name_check/)
  assert.match(result.invalidPositionMessage, /goal_program_positions_position_check/)
  assert.match(result.invalidDurationMessage, /goal_program_positions_duration_check/)
  assert.match(result.invalidSubPhaseMessage, /goal_program_positions_sub_phase_code_check/)
  assert.equal(
    result.unknownSubPhaseMessage,
    'goal_program_positions: Unterphase erfunden gehoert nicht zu Strategie contest_prep',
  )
  assert.equal(
    result.foreignProgramMessage,
    'new row violates row-level security policy for table "goal_programs"',
  )
})
