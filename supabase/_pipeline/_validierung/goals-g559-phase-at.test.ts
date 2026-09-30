// G-559: Die nutzerweite Abfrage liefert die Menge; die zielbezogene
// Abfrage liefert hoechstens eine Phase. Dieser Test laeuft aus kette.json.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE

if (!db || db === 'postgres') {
  throw new Error('G-559 braucht eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()

  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-559 A2/A3: zwei Ziele liefern zwei geordnete Nutzerphasen und je eine Zielphase', () => {
  const result = one<{
    allCount: number
    allGoalIds: string[]
    firstGoalCount: number
    secondGoalCount: number
    phaseAmHasLimit: boolean
    goalPhaseHasLimit: boolean
    ambiguousWriteMessage: string
  }>(`
    BEGIN;

    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES (
      '55900000-0000-0000-0000-000000000001',
      'test-user@lumeos.local',
      '{"provider":"email","providers":["email"]}'::jsonb,
      now()
    );

    INSERT INTO goals.user_goals (
      id, user_id, goal_type, title, gueltig_ab, priority
    ) VALUES
      ('55900000-0000-0000-0000-000000000101',
       '55900000-0000-0000-0000-000000000001',
       'body_composition', 'G-559 Ziel eins', DATE '2099-01-01', 1),
      ('55900000-0000-0000-0000-000000000102',
       '55900000-0000-0000-0000-000000000001',
       'body_composition', 'G-559 Ziel zwei', DATE '2099-01-01', 2);

    INSERT INTO goals.goal_phases (
      id, user_id, goal_id, phase_type, parameters, gueltig_ab,
      created_at, strategie_code
    ) VALUES
      ('55900000-0000-0000-0000-000000000201',
       '55900000-0000-0000-0000-000000000001',
       '55900000-0000-0000-0000-000000000101',
       'maintenance', '{}'::jsonb, DATE '2099-01-01',
       TIMESTAMPTZ '2099-01-01 08:00:00+00', 'maintain'),
      ('55900000-0000-0000-0000-000000000202',
       '55900000-0000-0000-0000-000000000001',
       '55900000-0000-0000-0000-000000000102',
       'lean_bulk', '{}'::jsonb, DATE '2099-01-01',
       TIMESTAMPTZ '2099-01-01 09:00:00+00', 'lean_bulk');

    CREATE TEMP TABLE g559_result (
      fall text PRIMARY KEY,
      wert text NOT NULL
    ) ON COMMIT DROP;
    GRANT SELECT, INSERT ON g559_result TO authenticated;

    SELECT set_config(
      'request.jwt.claims',
      jsonb_build_object(
        'sub', '55900000-0000-0000-0000-000000000001',
        'role', 'authenticated'
      )::text,
      true
    );
    SET LOCAL ROLE authenticated;

    DO $probe$
    BEGIN
      BEGIN
        INSERT INTO goals.nutrition_targets (
          user_id, gueltig_ab, kcal, herkunft
        ) VALUES (
          '55900000-0000-0000-0000-000000000001',
          DATE '2099-01-01', 2200, 'manuell'
        );
        INSERT INTO g559_result VALUES ('ambiguous_write', 'angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g559_result VALUES ('ambiguous_write', SQLERRM);
      END;
    END
    $probe$;

    WITH all_phases AS (
      SELECT *, row_number() OVER () AS position
      FROM goals.phase_am(
        '55900000-0000-0000-0000-000000000001', DATE '2099-01-01'
      )
    )
    SELECT json_build_object(
      'allCount', (SELECT count(*) FROM all_phases),
      'allGoalIds', (
        SELECT array_agg(goal_id::text ORDER BY position) FROM all_phases
      ),
      'firstGoalCount', (
        SELECT count(*) FROM goals.phase_eines_ziels_am(
          '55900000-0000-0000-0000-000000000101', DATE '2099-01-01'
        )
      ),
      'secondGoalCount', (
        SELECT count(*) FROM goals.phase_eines_ziels_am(
          '55900000-0000-0000-0000-000000000102', DATE '2099-01-01'
        )
      ),
      'phaseAmHasLimit', position('LIMIT 1' IN pg_get_functiondef(
        'goals.phase_am(uuid,date)'::regprocedure
      )) > 0,
      'goalPhaseHasLimit', position('LIMIT 1' IN pg_get_functiondef(
        'goals.phase_eines_ziels_am(uuid,date)'::regprocedure
      )) > 0,
      'ambiguousWriteMessage', (
        SELECT wert FROM g559_result WHERE fall = 'ambiguous_write'
      )
    );

    ROLLBACK;
  `)

  assert.equal(result.allCount, 2)
  assert.deepEqual(result.allGoalIds, [
    '55900000-0000-0000-0000-000000000102',
    '55900000-0000-0000-0000-000000000101',
  ])
  assert.equal(result.firstGoalCount, 1)
  assert.equal(result.secondGoalCount, 1)
  assert.equal(result.phaseAmHasLimit, false)
  assert.equal(result.goalPhaseHasLimit, true)
  assert.equal(
    result.ambiguousWriteMessage,
    'nutrition_targets: mehrere aktive Phasen am Gueltigkeitstag; Zielbezug fehlt',
  )
})

test('G-559 A4: der echte Seed enthaelt test-user mit zwei offenen Zielphasen', () => {
  const seed = readFileSync(
    'supabase/_pipeline/_testdaten/testdaten-einspielen.ts', 'utf8',
  )

  assert.match(seed, /id: '30000000-0000-0000-0000-000000000901'/)
  assert.match(seed, /id: '30000000-0000-0000-0000-000000000902'/)
  assert.match(seed, /id: '31000000-0000-0000-0000-000000000901'/)
  assert.match(seed, /id: '31000000-0000-0000-0000-000000000902'/)
  assert.match(seed, /userId: '20000000-0000-0000-0000-000000000901'/)
})
