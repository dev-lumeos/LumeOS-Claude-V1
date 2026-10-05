// G-604: Pro Nutzer darf hoechstens ein Kalorienziel aktiv sein.
// Die Gegenprobe laeuft ausschliesslich gegen eine explizite Wegwerf-Datenbank.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE

if (!DB || DB === 'postgres') {
  throw new Error('G-604 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  const json = output.split(/\r?\n/).findLast(line => line.startsWith('{')) ?? ''
  return JSON.parse(json) as T
}

test('G-604: beide Kalorienrichtungen werden abgewehrt und Primary folgt nicht der Reihenfolge', () => {
  const result = one<{
    cutThenBulk: { state: string, message: string, constraint: string }
    bulkThenCut: { state: string, message: string, constraint: string }
    phaseWrite: { state: string, message: string, constraint: string }
    activeCalorieGoals: number
    activeNonCalorieGoals: number
    primaryGoal: string
    caloriePriorityAfterSwap: number
    healthPriorityAfterSwap: number
  }>(`
    BEGIN;

    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at) VALUES
      ('60400000-0000-0000-0000-000000000001', 'g604-cut@example.test', '{}'::jsonb, now()),
      ('60400000-0000-0000-0000-000000000002', 'g604-bulk@example.test', '{}'::jsonb, now()),
      ('60400000-0000-0000-0000-000000000003', 'g604-phase@example.test', '{}'::jsonb, now());

    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, status, priority, is_primary
    ) VALUES
      ('60400000-0000-0000-0000-000000000101', '60400000-0000-0000-0000-000000000001',
       'body_composition', 'Abbau aktiv', DATE '2099-01-01', 'active', 1, false),
      ('60400000-0000-0000-0000-000000000102', '60400000-0000-0000-0000-000000000001',
       'body_composition', 'Aufbau geplant', DATE '2099-01-02', 'on_hold', 4, true),
      ('60400000-0000-0000-0000-000000000103', '60400000-0000-0000-0000-000000000001',
       'health', 'Schlaf aktiv', DATE '2099-01-01', 'active', 2, true),
      ('60400000-0000-0000-0000-000000000201', '60400000-0000-0000-0000-000000000002',
       'body_composition', 'Aufbau aktiv', DATE '2099-01-01', 'active', 1, false),
      ('60400000-0000-0000-0000-000000000202', '60400000-0000-0000-0000-000000000002',
       'body_composition', 'Abbau geplant', DATE '2099-01-02', 'on_hold', 4, false),
      ('60400000-0000-0000-0000-000000000301', '60400000-0000-0000-0000-000000000003',
       'body_composition', 'Aufbau per Phase', DATE '2099-01-01', 'active', 1, false),
      ('60400000-0000-0000-0000-000000000302', '60400000-0000-0000-0000-000000000003',
       'body_composition', 'Abbau per Phase', DATE '2099-01-01', 'active', 2, false);

    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, parameters, gueltig_ab,
      strategie_code, zielrate_pct_kg_woche
    ) VALUES
      ('60400000-0000-0000-0000-000000000401', '60400000-0000-0000-0000-000000000001',
       '60400000-0000-0000-0000-000000000101', 'fat_loss', '{}'::jsonb,
       DATE '2099-01-01', 'moderate_cut', -0.500),
      ('60400000-0000-0000-0000-000000000402', '60400000-0000-0000-0000-000000000001',
       '60400000-0000-0000-0000-000000000102', 'lean_bulk', '{}'::jsonb,
       DATE '2099-01-02', 'lean_bulk', 0.250),
      ('60400000-0000-0000-0000-000000000403', '60400000-0000-0000-0000-000000000002',
       '60400000-0000-0000-0000-000000000201', 'lean_bulk', '{}'::jsonb,
       DATE '2099-01-01', 'lean_bulk', 0.250),
      ('60400000-0000-0000-0000-000000000404', '60400000-0000-0000-0000-000000000002',
       '60400000-0000-0000-0000-000000000202', 'fat_loss', '{}'::jsonb,
       DATE '2099-01-02', 'moderate_cut', -0.500),
      ('60400000-0000-0000-0000-000000000405', '60400000-0000-0000-0000-000000000003',
       '60400000-0000-0000-0000-000000000301', 'lean_bulk', '{}'::jsonb,
       DATE '2099-01-01', 'lean_bulk', 0.250);

    CREATE TEMP TABLE g604_errors (
      fall text PRIMARY KEY,
      state text NOT NULL,
      message text NOT NULL,
      constraint_name text NOT NULL
    ) ON COMMIT DROP;

    CREATE OR REPLACE FUNCTION pg_temp.g604_attempt(p_fall text, p_sql text)
    RETURNS void
    LANGUAGE plpgsql
    AS $fn$
    DECLARE
      v_state text := 'unexpected_success';
      v_message text := '';
      v_constraint text := '';
    BEGIN
      BEGIN
        EXECUTE p_sql;
      EXCEPTION WHEN OTHERS THEN
        GET STACKED DIAGNOSTICS
          v_state = RETURNED_SQLSTATE,
          v_message = MESSAGE_TEXT,
          v_constraint = CONSTRAINT_NAME;
      END;
      INSERT INTO g604_errors VALUES (p_fall, v_state, v_message, v_constraint);
    END;
    $fn$;

    SELECT pg_temp.g604_attempt(
      'cut_then_bulk',
      $sql$UPDATE goals.user_goals
            SET status = 'active', priority = 3
            WHERE id = '60400000-0000-0000-0000-000000000102'$sql$
    );
    SELECT pg_temp.g604_attempt(
      'bulk_then_cut',
      $sql$UPDATE goals.user_goals
            SET status = 'active', priority = 2
            WHERE id = '60400000-0000-0000-0000-000000000202'$sql$
    );
    SELECT pg_temp.g604_attempt(
      'phase_write',
      $sql$INSERT INTO goals.goal_phases (
              id, user_id, goal_id, phase_type, parameters, gueltig_ab,
              strategie_code, zielrate_pct_kg_woche
            ) VALUES (
              '60400000-0000-0000-0000-000000000406',
              '60400000-0000-0000-0000-000000000003',
              '60400000-0000-0000-0000-000000000302',
              'fat_loss', '{}'::jsonb, DATE '2099-01-01', 'moderate_cut', -0.500
            )$sql$
    );

    SELECT set_config('request.jwt.claim.sub', '60400000-0000-0000-0000-000000000001', true);
    SET LOCAL ROLE authenticated;
    SELECT goals.ziel_reihenfolge_setzen(
      '[{"goal_id":"60400000-0000-0000-0000-000000000101","priority":2},
        {"goal_id":"60400000-0000-0000-0000-000000000103","priority":1}]'::jsonb
    );
    RESET ROLE;

    SELECT json_build_object(
      'cutThenBulk', (
        SELECT json_build_object('state', state, 'message', message, 'constraint', constraint_name)
        FROM g604_errors WHERE fall = 'cut_then_bulk'
      ),
      'bulkThenCut', (
        SELECT json_build_object('state', state, 'message', message, 'constraint', constraint_name)
        FROM g604_errors WHERE fall = 'bulk_then_cut'
      ),
      'phaseWrite', (
        SELECT json_build_object('state', state, 'message', message, 'constraint', constraint_name)
        FROM g604_errors WHERE fall = 'phase_write'
      ),
      'activeCalorieGoals', (
        SELECT count(DISTINCT ug.id)::integer
        FROM goals.user_goals ug
        JOIN goals.goal_phases gp ON gp.goal_id = ug.id
        WHERE ug.user_id = '60400000-0000-0000-0000-000000000001'
          AND ug.status = 'active'
          AND gp.actual_end_date IS NULL
          AND gp.phase_type IN ('fat_loss','lean_bulk','maintenance','recomp')
      ),
      'activeNonCalorieGoals', (
        SELECT count(*)::integer FROM goals.user_goals
        WHERE user_id = '60400000-0000-0000-0000-000000000001'
          AND status = 'active' AND goal_type = 'health'
      ),
      'primaryGoal', (
        SELECT id::text FROM goals.user_goals
        WHERE user_id = '60400000-0000-0000-0000-000000000001'
          AND status = 'active' AND is_primary
      ),
      'caloriePriorityAfterSwap', (
        SELECT priority FROM goals.user_goals
        WHERE id = '60400000-0000-0000-0000-000000000101'
      ),
      'healthPriorityAfterSwap', (
        SELECT priority FROM goals.user_goals
        WHERE id = '60400000-0000-0000-0000-000000000103'
      )
    )::text;
    ROLLBACK;
  `)

  const expectedError = {
    state: '23514',
    message: 'Es darf nur ein aktives Kalorienziel geben. Das andere Ziel zuerst planen oder pausieren.',
    constraint: 'user_goals_one_active_calorie_direction',
  }
  assert.deepEqual(result.cutThenBulk, expectedError)
  assert.deepEqual(result.bulkThenCut, expectedError)
  assert.deepEqual(result.phaseWrite, expectedError)
  assert.equal(result.activeCalorieGoals, 1)
  assert.equal(result.activeNonCalorieGoals, 1)
  assert.equal(result.primaryGoal, '60400000-0000-0000-0000-000000000101')
  assert.equal(result.caloriePriorityAfterSwap, 2)
  assert.equal(result.healthPriorityAfterSwap, 1)
})
