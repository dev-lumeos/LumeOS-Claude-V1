import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-645 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '20000000-0000-0000-0000-000000000901'
const goal = '30000000-0000-0000-0000-000000000901'
const plan = '62500000-0000-0000-0000-000000000901'

function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-645: automatisch benannter Plan folgt dem Ziel; eigener Name bleibt stehen', () => {
  const output = sql(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    CREATE TEMP TABLE seen(step text,plan_name text,is_custom text);
    INSERT INTO seen SELECT 'before',name,to_jsonb(p)->>'name_is_custom'
      FROM goals.goal_programs p WHERE id='${plan}';
    UPDATE goals.user_goals SET title='Abbau neu' WHERE id='${goal}';
    INSERT INTO seen SELECT 'auto',name,to_jsonb(p)->>'name_is_custom'
      FROM goals.goal_programs p WHERE id='${plan}';
    UPDATE goals.goal_programs SET name='Mein eigener Plan' WHERE id='${plan}';
    UPDATE goals.user_goals SET title='Abbau nochmals' WHERE id='${goal}';
    INSERT INTO seen SELECT 'custom',name,to_jsonb(p)->>'name_is_custom'
      FROM goals.goal_programs p WHERE id='${plan}';
    UPDATE goals.goal_programs SET name='Abbau nochmals' WHERE id='${plan}';
    UPDATE goals.user_goals SET title='Abbau zuletzt' WHERE id='${goal}';
    INSERT INTO seen SELECT 'reset',name,to_jsonb(p)->>'name_is_custom'
      FROM goals.goal_programs p WHERE id='${plan}';
    SELECT json_object_agg(step,json_build_object('name',plan_name,
      'custom',is_custom)) FROM seen;
    ROLLBACK;
  `)
  const result = JSON.parse(output.split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
  assert.deepEqual(result, {
    before: { name: 'G-559 Abbauziel', custom: 'false' },
    auto: { name: 'Abbau neu', custom: 'false' },
    custom: { name: 'Mein eigener Plan', custom: 'true' },
    reset: { name: 'Abbau zuletzt', custom: 'false' },
  })
})
