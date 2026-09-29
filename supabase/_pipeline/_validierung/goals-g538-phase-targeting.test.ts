// G-538: Offene Phasen terminieren genau ein Ziel; abgeschlossene Phasen
// duerfen als ungebundene Historie erhalten bleiben.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-538 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-538 A1-A4: Struktur, Funktion und Kommentare beschreiben die Zielterminierung', () => {
  const result = one<{
    linkedModules: boolean
    linkedModulesNotNull: boolean
    linkedModulesDefault: string | null
    openNeedsGoal: boolean
    openNeedsGoalValidated: boolean
    openIndex: string | null
    goalDeleteAction: string | null
    newSignature: boolean
    oldSignature: boolean
    tableComment: string | null
    goalComment: string | null
    oldWording: number
  }>(`
    SELECT json_build_object(
      'linkedModules', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'goals' AND table_name = 'user_goals'
          AND column_name = 'linked_modules'
      ),
      'linkedModulesNotNull', coalesce((
        SELECT is_nullable = 'NO' FROM information_schema.columns
        WHERE table_schema = 'goals' AND table_name = 'user_goals'
          AND column_name = 'linked_modules'
      ), false),
      'linkedModulesDefault', (
        SELECT column_default FROM information_schema.columns
        WHERE table_schema = 'goals' AND table_name = 'user_goals'
          AND column_name = 'linked_modules'
      ),
      'openNeedsGoal', EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'goals.goal_phases'::regclass
          AND conname = 'goal_phases_open_requires_goal'
          AND pg_get_constraintdef(oid) LIKE '%actual_end_date IS NOT NULL%goal_id IS NOT NULL%'
      ),
      'openNeedsGoalValidated', coalesce((
        SELECT convalidated FROM pg_constraint
        WHERE conrelid = 'goals.goal_phases'::regclass
          AND conname = 'goal_phases_open_requires_goal'
      ), false),
      'openIndex', (
        SELECT indexdef FROM pg_indexes
        WHERE schemaname = 'goals' AND tablename = 'goal_phases'
          AND indexname = 'uq_goal_phases_one_open'
      ),
      'goalDeleteAction', (
        SELECT confdeltype::text FROM pg_constraint
        WHERE conrelid = 'goals.goal_phases'::regclass
          AND conname = 'goal_phases_goal_id_fkey'
      ),
      'newSignature', to_regprocedure(
        'goals.goal_phase_start(text,uuid,date,date,text,jsonb,numeric)'
      ) IS NOT NULL,
      'oldSignature', to_regprocedure(
        'goals.goal_phase_start(text,date,uuid,date,text,jsonb,numeric)'
      ) IS NOT NULL,
      'tableComment', obj_description('goals.goal_phases'::regclass),
      'goalComment', col_description(
        'goals.goal_phases'::regclass,
        (SELECT attnum FROM pg_attribute
         WHERE attrelid = 'goals.goal_phases'::regclass AND attname = 'goal_id')
      ),
      'oldWording', (
        SELECT count(*)::integer
        FROM pg_description d
        WHERE d.objoid = 'goals.goal_phases'::regclass
          AND d.description ILIKE '%unabhaengig vom konkreten ziel%'
      )
    );
  `)

  assert.equal(result.linkedModules, true)
  assert.equal(result.linkedModulesNotNull, true)
  assert.match(result.linkedModulesDefault ?? '', /\{\}/)
  assert.equal(result.openNeedsGoal, true)
  assert.equal(result.openNeedsGoalValidated, true)
  assert.match(result.openIndex ?? '', /UNIQUE INDEX.+\(goal_id\).+actual_end_date IS NULL/i)
  assert.equal(result.goalDeleteAction, 'n')
  assert.equal(result.newSignature, true)
  assert.equal(result.oldSignature, false)
  assert.equal(
    result.tableComment,
    'Terminiert Strategien fuer konkrete Nutzerziele. Offene Phasen brauchen ein Ziel; abgeschlossene Phasen bleiben als Historie erhalten.',
  )
  assert.equal(
    result.goalComment,
    'Das terminierte Nutzerziel. Bei abgeschlossenen Phasen darf die Bindung durch Ziel-Loeschung entfallen.',
  )
  assert.equal(result.oldWording, 0)
})

test('G-538 A1/A2: offen ohne Ziel faellt; Historie ohne Ziel und parallele Ziele tragen', () => {
  const result = one<{
    openWithoutGoal: string
    completedWithoutGoal: boolean
    sameGoalTwice: string
    twoGoals: number
  }>(`
    BEGIN;
    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, priority
    ) VALUES
      ('53800000-0000-0000-0000-000000000101',
       (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
       'body_composition', 'G-538 Ziel eins', DATE '2099-01-01', 1),
      ('53800000-0000-0000-0000-000000000102',
       (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
       'performance', 'G-538 Ziel zwei', DATE '2099-01-01', 2);

    CREATE TEMP TABLE g538_result (
      fall text PRIMARY KEY,
      wert text NOT NULL
    ) ON COMMIT DROP;

    DO $probe$
    DECLARE
      v_constraint text;
    BEGIN
      BEGIN
        INSERT INTO goals.goal_phases (
          user_id, goal_id, phase_type, gueltig_ab, actual_end_date, strategie_code
        ) VALUES (
          (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
          NULL, 'maintenance', DATE '2099-01-01', NULL, 'maintain'
        );
        INSERT INTO g538_result VALUES ('open_without_goal', 'angenommen');
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
        INSERT INTO g538_result VALUES ('open_without_goal', SQLSTATE || ':' || v_constraint);
      END;

      INSERT INTO goals.goal_phases (
        user_id, goal_id, phase_type, gueltig_ab, actual_end_date, strategie_code
      ) VALUES (
        (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
        NULL, 'maintenance', DATE '2099-01-02', DATE '2099-01-02', 'maintain'
      );
      INSERT INTO g538_result VALUES ('completed_without_goal', 'ja');

      INSERT INTO goals.goal_phases (
        user_id, goal_id, phase_type, gueltig_ab, strategie_code
      ) VALUES (
        (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
        '53800000-0000-0000-0000-000000000101',
        'maintenance', DATE '2099-01-03', 'maintain'
      );

      BEGIN
        INSERT INTO goals.goal_phases (
          user_id, goal_id, phase_type, gueltig_ab, strategie_code
        ) VALUES (
          (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
          '53800000-0000-0000-0000-000000000101',
          'maintenance', DATE '2099-01-04', 'maintain'
        );
        INSERT INTO g538_result VALUES ('same_goal_twice', 'angenommen');
      EXCEPTION WHEN unique_violation THEN
        GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
        INSERT INTO g538_result VALUES ('same_goal_twice', SQLSTATE || ':' || v_constraint);
      END;

      INSERT INTO goals.goal_phases (
        user_id, goal_id, phase_type, gueltig_ab, strategie_code
      ) VALUES (
        (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
        '53800000-0000-0000-0000-000000000102',
        'maintenance', DATE '2099-01-05', 'maintain'
      );
    END
    $probe$;

    SELECT json_build_object(
      'openWithoutGoal', (SELECT wert FROM g538_result WHERE fall = 'open_without_goal'),
      'completedWithoutGoal', (SELECT wert = 'ja' FROM g538_result WHERE fall = 'completed_without_goal'),
      'sameGoalTwice', (SELECT wert FROM g538_result WHERE fall = 'same_goal_twice'),
      'twoGoals', (
        SELECT count(*)::integer FROM goals.goal_phases
        WHERE goal_id IN (
          '53800000-0000-0000-0000-000000000101',
          '53800000-0000-0000-0000-000000000102'
        ) AND actual_end_date IS NULL
      )
    );
    ROLLBACK;
  `)

  assert.equal(
    result.openWithoutGoal,
    '23514:goal_phases_open_requires_goal',
  )
  assert.equal(result.completedWithoutGoal, true)
  assert.equal(result.sameGoalTwice, '23505:uq_goal_phases_one_open')
  assert.equal(result.twoGoals, 2)
})

test('G-538 A2/A3: goal_phase_start verlangt ein eigenes Ziel und erlaubt parallele Ziele', () => {
  const result = one<{
    missingGoalArgument: string
    explicitNullGoal: string
    sameGoalTwice: string
    twoGoals: number
  }>(`
    BEGIN;
    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, priority
    ) VALUES
      ('53800000-0000-0000-0000-000000000201',
       (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
       'body_composition', 'G-538 RPC Ziel eins', DATE '2099-02-01', 1),
      ('53800000-0000-0000-0000-000000000202',
       (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
       'performance', 'G-538 RPC Ziel zwei', DATE '2099-02-01', 2);

    CREATE TEMP TABLE g538_rpc_result (
      fall text PRIMARY KEY,
      wert text NOT NULL
    ) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g538_rpc_result TO authenticated;

    SELECT set_config(
      'request.jwt.claims',
      jsonb_build_object(
        'sub', (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
        'role', 'authenticated'
      )::text,
      true
    );
    SET LOCAL ROLE authenticated;

    DO $probe$
    DECLARE
      v_constraint text;
    BEGIN
      BEGIN
        EXECUTE 'SELECT goals.goal_phase_start(p_phase_type := $1)'
          USING 'maintenance';
        INSERT INTO g538_rpc_result VALUES ('missing_goal_argument', 'angenommen');
      EXCEPTION WHEN undefined_function THEN
        INSERT INTO g538_rpc_result VALUES ('missing_goal_argument', SQLSTATE);
      END;

      BEGIN
        PERFORM goals.goal_phase_start(
          p_phase_type := 'maintenance',
          p_goal_id := NULL,
          p_gueltig_ab := DATE '2099-02-01'
        );
        INSERT INTO g538_rpc_result VALUES ('explicit_null_goal', 'angenommen');
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
        INSERT INTO g538_rpc_result VALUES ('explicit_null_goal', SQLSTATE || ':' || v_constraint);
      END;

      PERFORM goals.goal_phase_start(
        p_phase_type := 'maintenance',
        p_goal_id := '53800000-0000-0000-0000-000000000201',
        p_gueltig_ab := DATE '2099-02-02'
      );

      BEGIN
        PERFORM goals.goal_phase_start(
          p_phase_type := 'maintenance',
          p_goal_id := '53800000-0000-0000-0000-000000000201',
          p_gueltig_ab := DATE '2099-02-03'
        );
        INSERT INTO g538_rpc_result VALUES ('same_goal_twice', 'angenommen');
      EXCEPTION WHEN unique_violation THEN
        INSERT INTO g538_rpc_result VALUES ('same_goal_twice', SQLSTATE);
      END;

      PERFORM goals.goal_phase_start(
        p_phase_type := 'maintenance',
        p_goal_id := '53800000-0000-0000-0000-000000000202',
        p_gueltig_ab := DATE '2099-02-04'
      );
    END
    $probe$;

    RESET ROLE;
    SELECT json_build_object(
      'missingGoalArgument', (SELECT wert FROM g538_rpc_result WHERE fall = 'missing_goal_argument'),
      'explicitNullGoal', (SELECT wert FROM g538_rpc_result WHERE fall = 'explicit_null_goal'),
      'sameGoalTwice', (SELECT wert FROM g538_rpc_result WHERE fall = 'same_goal_twice'),
      'twoGoals', (
        SELECT count(*)::integer FROM goals.goal_phases
        WHERE goal_id IN (
          '53800000-0000-0000-0000-000000000201',
          '53800000-0000-0000-0000-000000000202'
        ) AND actual_end_date IS NULL
      )
    );
    ROLLBACK;
  `)

  assert.equal(result.missingGoalArgument, '42883')
  assert.equal(
    result.explicitNullGoal,
    '23514:goal_phases_open_requires_goal',
  )
  assert.equal(result.sameGoalTwice, '23505')
  assert.equal(result.twoGoals, 2)
})

test('G-538 A1: Ziel-Loeschung erhaelt eine abgeschlossene Phase als Historie', () => {
  const result = one<{ phaseRemains: boolean; goalCleared: boolean }>(`
    BEGIN;
    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, priority
    ) VALUES (
      '53800000-0000-0000-0000-000000000301',
      (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
      'body_composition', 'G-538 Loeschprobe', DATE '2099-03-01', 1
    );
    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, gueltig_ab, actual_end_date, strategie_code
    ) VALUES (
      '53800000-0000-0000-0000-000000000302',
      (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
      '53800000-0000-0000-0000-000000000301',
      'maintenance', DATE '2099-03-01', DATE '2099-03-02', 'maintain'
    );
    DELETE FROM goals.user_goals WHERE id = '53800000-0000-0000-0000-000000000301';
    SELECT json_build_object(
      'phaseRemains', EXISTS (
        SELECT 1 FROM goals.goal_phases
        WHERE id = '53800000-0000-0000-0000-000000000302'
      ),
      'goalCleared', (
        SELECT goal_id IS NULL FROM goals.goal_phases
        WHERE id = '53800000-0000-0000-0000-000000000302'
      )
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, { phaseRemains: true, goalCleared: true })
})

test('G-538 A6: linked_modules nimmt leer und die fuenf Module an, aber kein sechstes', () => {
  const result = one<{
    emptyAccepted: boolean
    fiveAccepted: number
    invalidModule: string
    nullEntry: string
  }>(`
    BEGIN;
    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, priority
    ) VALUES (
      '53800000-0000-0000-0000-000000000401',
      (SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local'),
      'health', 'G-538 Modulprobe', DATE '2099-04-01', 1
    );

    CREATE TEMP TABLE g538_module_result (
      fall text PRIMARY KEY,
      wert text NOT NULL
    ) ON COMMIT DROP;

    INSERT INTO g538_module_result
    SELECT 'empty', (linked_modules = ARRAY[]::text[])::text
    FROM goals.user_goals WHERE id = '53800000-0000-0000-0000-000000000401';

    UPDATE goals.user_goals
    SET linked_modules = ARRAY[
      'nutrition', 'training', 'recovery', 'supplements', 'medical'
    ]::text[]
    WHERE id = '53800000-0000-0000-0000-000000000401';
    INSERT INTO g538_module_result VALUES ('five', '5');

    DO $probe$
    DECLARE
      v_constraint text;
    BEGIN
      BEGIN
        UPDATE goals.user_goals SET linked_modules = ARRAY['coach']::text[]
        WHERE id = '53800000-0000-0000-0000-000000000401';
        INSERT INTO g538_module_result VALUES ('invalid', 'angenommen');
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
        INSERT INTO g538_module_result VALUES ('invalid', SQLSTATE || ':' || v_constraint);
      END;

      BEGIN
        UPDATE goals.user_goals SET linked_modules = ARRAY[NULL]::text[]
        WHERE id = '53800000-0000-0000-0000-000000000401';
        INSERT INTO g538_module_result VALUES ('null_entry', 'angenommen');
      EXCEPTION WHEN check_violation THEN
        GET STACKED DIAGNOSTICS v_constraint = CONSTRAINT_NAME;
        INSERT INTO g538_module_result VALUES ('null_entry', SQLSTATE || ':' || v_constraint);
      END;
    END
    $probe$;

    SELECT json_build_object(
      'emptyAccepted', (SELECT wert::boolean FROM g538_module_result WHERE fall = 'empty'),
      'fiveAccepted', (SELECT wert::integer FROM g538_module_result WHERE fall = 'five'),
      'invalidModule', (SELECT wert FROM g538_module_result WHERE fall = 'invalid'),
      'nullEntry', (SELECT wert FROM g538_module_result WHERE fall = 'null_entry')
    );
    ROLLBACK;
  `)

  assert.equal(result.emptyAccepted, true)
  assert.equal(result.fiveAccepted, 5)
  assert.equal(result.invalidModule, '23514:user_goals_linked_modules_check')
  assert.equal(result.nullEntry, '23514:user_goals_linked_modules_check')
})

test('G-538 A1/A7: der Seed ist beendet und moderate_cut traegt 20 Wochen', () => {
  const result = one<{
    maxEnd: string | null
    maxReason: string | null
    moderateWeeks: number | null
    populatedLegacyModules: number
  }>(`
    SELECT json_build_object(
      'maxEnd', actual_end_date,
      'maxReason', transition_reason,
      'moderateWeeks', (
        SELECT max_duration_weeks FROM goals.goal_strategies
        WHERE code = 'moderate_cut'
      ),
      'populatedLegacyModules', (
        SELECT count(*)::integer FROM goals.user_goals
        WHERE cardinality(linked_modules) > 0
      )
    )
    FROM goals.goal_phases
    WHERE id = '31000000-0000-0000-0000-000000000201';
  `)

  assert.equal(result.maxEnd, '2026-09-29')
  assert.equal(
    result.maxReason,
    'Seed ohne Zielbindung, beendet bei der Strukturumstellung G-538',
  )
  assert.equal(result.moderateWeeks, 20)
  assert.equal(result.populatedLegacyModules, 0)
})
