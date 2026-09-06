// G-357/G-356/C-379: serverseitige Schreibwege bleiben auf einer
// Wegwerf-Datenbank pruefbar. Jede Mutation laeuft als eingeloggter Nutzer.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE

if (!DB || DB === 'postgres') {
  throw new Error('G-357-Test braucht explizit eine Wegwerf-Datenbank, nie postgres.')
}

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

function applyPipelineStep(file: string): void {
  execFileSync('docker', [
    'exec', '-i', CONTAINER, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', DB,
    '-f', '-',
  ], {
    encoding: 'utf8',
    input: readFileSync(file, 'utf8'),
    maxBuffer: 64 * 1024 * 1024,
  })
}

test('G-357/G-356/C-379: eigene Phasen, Umfaenge und Planfolgen sind schreibbar; fremde bleiben unsichtbar', () => {
  const result = one<{
    startedPhases: number
    endedPhases: number
    transitionReason: string
    recommendedNext: null
    circumferencePoints: number
    upperArmLeft: number
    upperArmRight: number
    thighLeft: number
    thighRight: number
    measurementSource: string
    sourceDetail: string
    nextPlanId: string
    daysCount: number
    inventoryBefore: number
    inventoryAfter: number
    otherReadsNoPhase: boolean
    otherReadsNoCircumference: boolean
    otherReadsNoPlan: boolean
    otherReadsNoInventory: boolean
  }>(`
    BEGIN;
    INSERT INTO auth.users (id, email) VALUES
      ('35700000-0000-0000-0000-000000000001', 'g357-owner@lumeos.local'),
      ('35700000-0000-0000-0000-000000000002', 'g357-other@lumeos.local');
    CREATE TEMP TABLE c357_context ON COMMIT DROP AS
      SELECT
        '35700000-0000-0000-0000-000000000001'::uuid AS owner_id,
        '35700000-0000-0000-0000-000000000002'::uuid AS other_id,
        (SELECT id FROM nutrition.foods ORDER BY bls_code LIMIT 1) AS food_id;
    CREATE TEMP TABLE c357_plans(id uuid, next_id uuid) ON COMMIT DROP;
    WITH source_plan AS (
      INSERT INTO nutrition.meal_plans (
        user_id, name, lifecycle_type, days_count, status, is_active
      )
      SELECT owner_id, 'G357 Ausgangsplan', 'once', 28, 'paused', false
      FROM c357_context
      RETURNING id
    ), next_plan AS (
      INSERT INTO nutrition.meal_plans (
        user_id, name, lifecycle_type, days_count, status, is_active
      )
      SELECT owner_id, 'G357 Folgeplan', 'once', 7, 'paused', false
      FROM c357_context
      RETURNING id
    )
    INSERT INTO c357_plans
    SELECT source_plan.id, next_plan.id FROM source_plan CROSS JOIN next_plan;
    CREATE TEMP TABLE c357_meal(id uuid) ON COMMIT DROP;
    WITH inserted_meal AS (
      INSERT INTO nutrition.meals (user_id, entry_date, meal_type, meal_time, entry_source)
      SELECT owner_id, DATE '2099-01-15', 'dinner', TIME '19:00', 'manual'
      FROM c357_context
      RETURNING id
    )
    INSERT INTO c357_meal
    SELECT id FROM inserted_meal;
    INSERT INTO nutrition.user_inventory (user_id, food_id, menge_g, schwelle_g)
    SELECT owner_id, food_id, 500, 450 FROM c357_context;
    GRANT SELECT ON c357_context, c357_plans, c357_meal TO authenticated;
    CREATE TEMP TABLE c357_owner_claim ON COMMIT DROP AS
      SELECT set_config('request.jwt.claim.sub', owner_id::text, true)
      FROM c357_context;
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE c357_phase(id uuid) ON COMMIT DROP;
    INSERT INTO c357_phase
    SELECT goals.goal_phase_start(
      p_phase_type := 'lean_bulk',
      p_gueltig_ab := DATE '2099-01-15',
      p_projected_end_date := DATE '2099-02-15',
      p_variant := 'moderate',
      p_parameters := jsonb_build_object('source', 'G-357 test')
    );
    CREATE TEMP TABLE c357_ended ON COMMIT DROP AS
      SELECT goals.goal_phase_end(
        (SELECT id FROM c357_phase), 'G357 planmaessig beendet', DATE '2099-01-22'
      ) AS id;
    CREATE TEMP TABLE c357_circumference(id uuid) ON COMMIT DROP;
    INSERT INTO c357_circumference
    SELECT goals.body_circumference_write(
      p_measurement_date := DATE '2099-01-15',
      p_measurement_time := TIME '07:30',
      p_measurement_source := 'manual',
      p_source_detail := 'G-356 Testmessung',
      p_notes := 'vollstaendige 13-Punkte-Messung',
      p_neck_cm := 37,
      p_shoulders_cm := 122,
      p_chest_cm := 104,
      p_upper_arm_left_cm := 39,
      p_upper_arm_right_cm := 40,
      p_forearm_left_cm := 31,
      p_forearm_right_cm := 32,
      p_waist_cm := 82,
      p_hip_cm := 96,
      p_thigh_left_cm := 61,
      p_thigh_right_cm := 62,
      p_calf_left_cm := 39,
      p_calf_right_cm := 40
    );
    CREATE TEMP TABLE c357_next ON COMMIT DROP AS
      SELECT nutrition.meal_plan_set_next_plan(
        (SELECT id FROM c357_plans), (SELECT next_id FROM c357_plans)
      ) AS id;
    CREATE TEMP TABLE c357_inventory_before ON COMMIT DROP AS
      SELECT menge_g FROM nutrition.user_inventory
      WHERE user_id = (SELECT owner_id FROM c357_context)
        AND food_id = (SELECT food_id FROM c357_context);
    INSERT INTO nutrition.meal_items (
      meal_id, user_id, food_id, food_source, food_name, amount_g, nutrients, measurement_source
    )
    SELECT m.id, c.owner_id, c.food_id, 'bls', f.name_de, 125, '{}'::jsonb, 'manual'
    FROM c357_context c
    JOIN c357_meal m ON true
    JOIN nutrition.foods f ON f.id = c.food_id;
    CREATE TEMP TABLE c357_inventory_after ON COMMIT DROP AS
      SELECT menge_g FROM nutrition.user_inventory
      WHERE user_id = (SELECT owner_id FROM c357_context)
        AND food_id = (SELECT food_id FROM c357_context);
    RESET ROLE;
    CREATE TEMP TABLE c357_other_claim ON COMMIT DROP AS
      SELECT set_config('request.jwt.claim.sub', other_id::text, true)
      FROM c357_context;
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE c357_other_read ON COMMIT DROP AS
      SELECT
        NOT EXISTS (SELECT 1 FROM goals.goal_phases WHERE id = (SELECT id FROM c357_phase)) AS no_phase,
        NOT EXISTS (SELECT 1 FROM goals.body_circumferences WHERE id = (SELECT id FROM c357_circumference)) AS no_circumference,
        NOT EXISTS (SELECT 1 FROM nutrition.meal_plans WHERE id = (SELECT id FROM c357_plans)) AS no_plan,
        NOT EXISTS (
          SELECT 1 FROM nutrition.user_inventory
          WHERE user_id = (SELECT owner_id FROM c357_context)
            AND food_id = (SELECT food_id FROM c357_context)
        ) AS no_inventory;
    RESET ROLE;
    SELECT json_build_object(
      'startedPhases', (SELECT count(*)::integer FROM goals.goal_phases WHERE id = (SELECT id FROM c357_phase)),
      'endedPhases', (SELECT count(*)::integer FROM goals.goal_phases WHERE id = (SELECT id FROM c357_phase) AND actual_end_date IS NOT NULL),
      'transitionReason', (SELECT transition_reason FROM goals.goal_phases WHERE id = (SELECT id FROM c357_phase)),
      'recommendedNext', (SELECT recommended_next FROM goals.goal_phases WHERE id = (SELECT id FROM c357_phase)),
      'circumferencePoints', (
        SELECT count(*)::integer
        FROM goals.body_circumferences bc
        CROSS JOIN LATERAL jsonb_each(to_jsonb(bc)) AS point(key, value)
        WHERE bc.id = (SELECT id FROM c357_circumference)
          AND point.key IN (
            'neck_cm', 'shoulders_cm', 'chest_cm', 'upper_arm_left_cm', 'upper_arm_right_cm',
            'forearm_left_cm', 'forearm_right_cm', 'waist_cm', 'hip_cm', 'thigh_left_cm',
            'thigh_right_cm', 'calf_left_cm', 'calf_right_cm'
          ) AND point.value <> 'null'::jsonb
      ),
      'upperArmLeft', (SELECT upper_arm_left_cm FROM goals.body_circumferences WHERE id = (SELECT id FROM c357_circumference)),
      'upperArmRight', (SELECT upper_arm_right_cm FROM goals.body_circumferences WHERE id = (SELECT id FROM c357_circumference)),
      'thighLeft', (SELECT thigh_left_cm FROM goals.body_circumferences WHERE id = (SELECT id FROM c357_circumference)),
      'thighRight', (SELECT thigh_right_cm FROM goals.body_circumferences WHERE id = (SELECT id FROM c357_circumference)),
      'measurementSource', (SELECT measurement_source FROM goals.body_circumferences WHERE id = (SELECT id FROM c357_circumference)),
      'sourceDetail', (SELECT source_detail FROM goals.body_circumferences WHERE id = (SELECT id FROM c357_circumference)),
      'nextPlanId', (SELECT next_plan_id::text FROM nutrition.meal_plans WHERE id = (SELECT id FROM c357_plans)),
      'daysCount', (SELECT days_count FROM nutrition.meal_plans WHERE id = (SELECT id FROM c357_plans)),
      'inventoryBefore', (SELECT menge_g FROM c357_inventory_before),
      'inventoryAfter', (SELECT menge_g FROM c357_inventory_after),
      'otherReadsNoPhase', (SELECT no_phase FROM c357_other_read),
      'otherReadsNoCircumference', (SELECT no_circumference FROM c357_other_read),
      'otherReadsNoPlan', (SELECT no_plan FROM c357_other_read),
      'otherReadsNoInventory', (SELECT no_inventory FROM c357_other_read)
    );
    ROLLBACK;
  `)

  assert.equal(result.startedPhases, 1)
  assert.equal(result.endedPhases, 1)
  assert.equal(result.transitionReason, 'G357 planmaessig beendet')
  assert.equal(result.recommendedNext, null)
  assert.equal(result.circumferencePoints, 13)
  assert.equal(result.upperArmLeft, 39)
  assert.equal(result.upperArmRight, 40)
  assert.equal(result.thighLeft, 61)
  assert.equal(result.thighRight, 62)
  assert.equal(result.measurementSource, 'manual')
  assert.equal(result.sourceDetail, 'G-356 Testmessung')
  assert.ok(result.nextPlanId)
  assert.equal(result.daysCount, 28)
  assert.equal(result.inventoryBefore, 500)
  assert.equal(result.inventoryAfter, 375)
  assert.deepEqual([
    result.otherReadsNoPhase,
    result.otherReadsNoCircumference,
    result.otherReadsNoPlan,
    result.otherReadsNoInventory,
  ], [true, true, true, true])
})

test('G-357/G-356: erneutes Anwenden laesst die spaeteren Coach-Policies bestehen', () => {
  const before = one<{ goalPolicies: number; measurementPolicies: number }>(`
    SELECT json_build_object(
      'goalPolicies', (SELECT count(*)::integer FROM pg_policies
        WHERE schemaname = 'goals' AND tablename IN ('user_goals', 'goal_phases')),
      'measurementPolicies', (SELECT count(*)::integer FROM pg_policies
        WHERE schemaname = 'goals' AND tablename IN ('body_measurements', 'body_circumferences'))
    );
  `)

  assert.ok(before.goalPolicies > 8)
  assert.ok(before.measurementPolicies > 8)
  assert.doesNotThrow(() => applyPipelineStep('supabase/_pipeline/11_goals/111_goals_ziele_phasen.sql'))
  assert.doesNotThrow(() => applyPipelineStep('supabase/_pipeline/11_goals/112_body_measurements.sql'))
})
