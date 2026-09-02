import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', 'postgres',
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()) as T
}

test('C-396: ein selbst erstellter Plan behaelt seine Slotkopie nach einer spaeteren Slot-Aenderung', () => {
  const result = one<{
    table: boolean
    copiedName: string
    copiedTime: string
    afterSourceChange: { name: string; plannedTime: string }
    deliveredPlans: number
    anonCanExecuteCopy: boolean
  }>(`
    BEGIN;
    CREATE TEMP TABLE c396_account ON COMMIT DROP AS
      SELECT id FROM auth.users WHERE email = 'dev@lumeos.app';
    INSERT INTO nutrition.meal_slots(user_id, position, name, planned_time)
      SELECT id, 99, 'C396 Quelle', TIME '06:45' FROM c396_account
      ON CONFLICT (user_id, position) DO UPDATE
        SET name = EXCLUDED.name, planned_time = EXCLUDED.planned_time;
    CREATE TEMP TABLE c396_self_plan(id UUID, user_id UUID) ON COMMIT DROP;
    WITH created AS (
      INSERT INTO nutrition.meal_plans(user_id, name, plan_origin)
      SELECT id, 'C396 Selbstplan', 'self_created' FROM c396_account
      RETURNING id, user_id
    )
    INSERT INTO c396_self_plan SELECT id, user_id FROM created;
    CREATE TEMP TABLE c396_delivered(id UUID, user_id UUID) ON COMMIT DROP;
    WITH created AS (
      INSERT INTO nutrition.meal_plans(user_id, name, plan_origin)
      SELECT account.id, 'C396 ' || origins.origin, origins.origin
      FROM c396_account account CROSS JOIN (VALUES ('coach_created'), ('marketplace'), ('buddy')) AS origins(origin)
      RETURNING id, user_id
    )
    INSERT INTO c396_delivered SELECT id, user_id FROM created;
    INSERT INTO nutrition.meal_plan_slots(plan_id, user_id, position, name, planned_time)
      SELECT id, user_id, 1, 'Gelieferte Struktur', TIME '08:00' FROM c396_delivered;
    UPDATE nutrition.meal_slots s SET name = 'C396 Veraendert', planned_time = TIME '22:00'
      FROM c396_account a WHERE s.user_id = a.id AND s.position = 99;
    SELECT json_build_object(
      'table', to_regclass('nutrition.meal_plan_slots') IS NOT NULL,
      'copiedName', (SELECT s.name FROM nutrition.meal_plan_slots s JOIN c396_self_plan p ON p.id=s.plan_id WHERE s.position=99),
      'copiedTime', (SELECT s.planned_time::text FROM nutrition.meal_plan_slots s JOIN c396_self_plan p ON p.id=s.plan_id WHERE s.position=99),
      'afterSourceChange', (SELECT json_build_object('name', s.name, 'plannedTime', s.planned_time::text)
                            FROM nutrition.meal_plan_slots s JOIN c396_self_plan p ON p.id=s.plan_id WHERE s.position=99),
      'deliveredPlans', (SELECT count(*) FROM c396_delivered d
                         JOIN nutrition.meal_plan_slots s ON s.plan_id=d.id AND s.position=1),
      'anonCanExecuteCopy', has_function_privilege(
        'anon', 'nutrition.copy_user_slots_to_new_self_created_plan()'::regprocedure, 'EXECUTE'
      )
    );
    ROLLBACK;
  `)

  assert.equal(result.table, true)
  assert.equal(result.copiedName, 'C396 Quelle')
  assert.equal(result.copiedTime, '06:45:00')
  assert.deepEqual(result.afterSourceChange, { name: 'C396 Quelle', plannedTime: '06:45:00' })
  assert.equal(result.deliveredPlans, 3)
  assert.equal(result.anonCanExecuteCopy, false)
})
