// G-613: Nur die Phase eines aktiven Ziels ist laufend; Pausieren bewahrt sie.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-613 braucht eine Wegwerf-Datenbank, nie postgres.')

const user = `(SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local')`
const cutGoal = `'30000000-0000-0000-0000-000000000901'::uuid`
const bulkGoal = `'30000000-0000-0000-0000-000000000902'::uuid`
const cutPhase = `'31000000-0000-0000-0000-000000000901'::uuid`
const bulkPhase = `'31000000-0000-0000-0000-000000000902'::uuid`

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('G-613: pausierte Phase fehlt in beiden Phasenlesern und in beiden Zielwert Signaturen', () => {
  const result = one<{
    activePhases: string[]
    pausedGoalPhases: number
    unscopedGoal: string | null
    unscopedKcal: number | null
    pausedGoal: string | null
    pausedKcal: number | null
    pausedObstacle: string | null
  }>(`
    SELECT json_build_object(
      'activePhases', (SELECT coalesce(json_agg(phase_id::text ORDER BY phase_id), '[]'::json)
        FROM goals.phase_am(${user}, CURRENT_DATE)),
      'pausedGoalPhases', (SELECT count(*) FROM goals.phase_eines_ziels_am(${bulkGoal}, CURRENT_DATE)),
      'unscopedGoal', (SELECT goal_id::text FROM goals.berechne_zielwerte(${user}, CURRENT_DATE)),
      'unscopedKcal', (SELECT kcal FROM goals.berechne_zielwerte(${user}, CURRENT_DATE)),
      'pausedGoal', (SELECT goal_id::text FROM goals.berechne_zielwerte(${user}, ${bulkGoal}, CURRENT_DATE)),
      'pausedKcal', (SELECT kcal FROM goals.berechne_zielwerte(${user}, ${bulkGoal}, CURRENT_DATE)),
      'pausedObstacle', (SELECT hindernis FROM goals.berechne_zielwerte(${user}, ${bulkGoal}, CURRENT_DATE))
    );
  `)
  assert.deepEqual(result.activePhases, ['31000000-0000-0000-0000-000000000901'])
  assert.equal(result.pausedGoalPhases, 0)
  assert.equal(result.unscopedGoal, '30000000-0000-0000-0000-000000000901')
  assert.equal(typeof result.unscopedKcal, 'number')
  assert.equal(result.pausedGoal, null)
  assert.equal(result.pausedKcal, null)
  assert.equal(result.pausedObstacle, 'keine_aktive_phase')
})

test('G-613: Tagesziele folgen dem aktiven Ziel; Reaktivieren bewahrt die Phase', () => {
  const result = one<{
    cutKcal: number | null
    bulkKcal: number | null
    pausedWrite: string
    pausedPhaseCount: number
    resumedPhaseCount: number
    samePhase: boolean
    openPhase: boolean
  }>(`
    BEGIN;
    CREATE TEMP TABLE g613_phase_before AS
      SELECT to_jsonb(gp) AS row FROM goals.goal_phases gp WHERE gp.id = ${bulkPhase};

    INSERT INTO goals.nutrition_targets (user_id, gueltig_ab, phase_id, kcal, herkunft)
    VALUES (${user}, DATE '2099-01-01', ${cutPhase}, 2000, 'manuell');

    UPDATE goals.user_goals SET status = 'on_hold' WHERE id = ${cutGoal};
    UPDATE goals.user_goals SET status = 'active', priority = 2 WHERE id = ${bulkGoal};
    INSERT INTO goals.nutrition_targets (user_id, gueltig_ab, phase_id, kcal, herkunft)
    VALUES (${user}, DATE '2099-01-02', ${bulkPhase}, 3000, 'manuell');

    UPDATE goals.user_goals SET status = 'on_hold' WHERE id = ${bulkGoal};
    UPDATE goals.user_goals SET status = 'active' WHERE id = ${cutGoal};

    CREATE TEMP TABLE g613_result (key text PRIMARY KEY, value text) ON COMMIT DROP;
    DO $probe$
    BEGIN
      BEGIN
        INSERT INTO goals.nutrition_targets (user_id, gueltig_ab, phase_id, kcal, herkunft)
        VALUES (${user}, DATE '2099-01-03', ${bulkPhase}, 3100, 'manuell');
        INSERT INTO g613_result VALUES ('paused_write', 'angenommen');
      EXCEPTION WHEN check_violation THEN
        INSERT INTO g613_result VALUES ('paused_write', SQLERRM);
      END;
    END
    $probe$;

    CREATE TEMP TABLE g613_paused_read AS
      SELECT z.kcal FROM goals.zielwerte_am(${user}, DATE '2099-01-03') z;
    CREATE TEMP TABLE g613_paused_phase AS
      SELECT phase_id FROM goals.phase_am(${user}, DATE '2099-01-03');

    UPDATE goals.user_goals SET status = 'on_hold' WHERE id = ${cutGoal};
    UPDATE goals.user_goals SET status = 'active', priority = 2 WHERE id = ${bulkGoal};

    SELECT json_build_object(
      'cutKcal', (SELECT kcal FROM g613_paused_read),
      'bulkKcal', (SELECT kcal FROM goals.zielwerte_am(${user}, DATE '2099-01-03')),
      'pausedWrite', (SELECT value FROM g613_result WHERE key = 'paused_write'),
      'pausedPhaseCount', (SELECT count(*) FROM g613_paused_phase WHERE phase_id = ${bulkPhase}),
      'resumedPhaseCount', (SELECT count(*) FROM goals.phase_eines_ziels_am(${bulkGoal}, DATE '2099-01-03')),
      'samePhase', (SELECT row FROM g613_phase_before) =
        (SELECT to_jsonb(gp) FROM goals.goal_phases gp WHERE gp.id = ${bulkPhase}),
      'openPhase', (SELECT actual_end_date IS NULL FROM goals.goal_phases WHERE id = ${bulkPhase})
    );
    ROLLBACK;
  `)
  assert.equal(result.cutKcal, 2000)
  assert.equal(result.bulkKcal, 3000)
  assert.match(result.pausedWrite, /keine aktive Phase/)
  assert.equal(result.pausedPhaseCount, 0)
  assert.equal(result.resumedPhaseCount, 1)
  assert.equal(result.samePhase, true)
  assert.equal(result.openPhase, true)
})

test('G-613: ein pausiertes Ziel bekommt keinen Uebergangsvorschlag', () => {
  const result = one<{ paused: number; resumed: number; untouched: boolean }>(`
    BEGIN;
    UPDATE goals.goal_phases SET projected_end_date = DATE '2099-01-02'
    WHERE id = ${bulkPhase};
    INSERT INTO goals.body_measurements (user_id, measurement_date, measurement_time, weight_kg)
    VALUES
      (${user}, DATE '2099-01-01', TIME '08:00', 80),
      (${user}, DATE '2099-01-02', TIME '08:00', 80);
    CREATE TEMP TABLE g613_transition_before AS
      SELECT recommended_next, transition_reason
      FROM goals.goal_phases WHERE id = ${bulkPhase};
    CREATE TEMP TABLE g613_transition_paused AS
      SELECT * FROM goals.phase_transition_recommendation(${user}, DATE '2099-01-03');
    CREATE TEMP TABLE g613_transition_untouched AS
      SELECT (SELECT to_jsonb(b) FROM g613_transition_before b) =
        (SELECT to_jsonb(gp) - 'id' FROM (
          SELECT id, recommended_next, transition_reason
          FROM goals.goal_phases WHERE id = ${bulkPhase}
        ) gp) AS unchanged;
    UPDATE goals.user_goals SET status = 'on_hold' WHERE id = ${cutGoal};
    UPDATE goals.user_goals SET status = 'active', priority = 2 WHERE id = ${bulkGoal};
    SELECT json_build_object(
      'paused', (SELECT count(*) FROM g613_transition_paused),
      'resumed', (SELECT count(*) FROM goals.phase_transition_recommendation(${user}, DATE '2099-01-03')),
      'untouched', (SELECT unchanged FROM g613_transition_untouched)
    );
    ROLLBACK;
  `)
  assert.deepEqual(result, { paused: 0, resumed: 1, untouched: true })
})
