import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-643 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '20000000-0000-0000-0000-000000000901'

function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-643: einmalige Messziele folgen einer Soll-Linie mit zehn Prozentpunkten Toleranz', () => {
  const output = sql(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;
    INSERT INTO goals.user_goals
      (id,user_id,goal_type,title,target_value,target_unit,start_value,
       gueltig_ab,target_date,status,priority,goal_role,measurement_type,
       better_direction)
    VALUES
      ('64300000-0000-0000-0000-000000000001','${user}','lifestyle',
       'voraus',100,'kg',0,DATE '2026-10-01',DATE '2026-10-21','active',3,
       'measurement','custom','more'),
      ('64300000-0000-0000-0000-000000000002','${user}','lifestyle',
       'grenze_oben',100,'kg',0,DATE '2026-10-01',DATE '2026-10-21','active',4,
       'measurement','custom','more'),
      ('64300000-0000-0000-0000-000000000003','${user}','lifestyle',
       'hinterher',100,'kg',0,DATE '2026-10-01',DATE '2026-10-21','active',5,
       'measurement','custom','more'),
      ('64300000-0000-0000-0000-000000000004','${user}','lifestyle',
       'grenze_unten',100,'kg',0,DATE '2026-10-01',DATE '2026-10-21','active',6,
       'measurement','custom','more'),
      ('64300000-0000-0000-0000-000000000005','${user}','lifestyle',
       'fallend',20,'kg',100,DATE '2026-10-01',DATE '2026-10-21','active',7,
       'measurement','custom','less'),
      ('64300000-0000-0000-0000-000000000006','${user}','lifestyle',
       'ohne_frist',100,'kg',0,DATE '2026-10-01',NULL,'active',8,
       'measurement','custom','more'),
      ('64300000-0000-0000-0000-000000000007','${user}','performance',
       'ohne_istwert',100,'kg',0,DATE '2026-10-01',DATE '2026-10-21','active',9,
       'measurement',NULL,NULL);
    INSERT INTO goals.manual_goal_values(goal_id,user_id,measured_on,value)
    VALUES
      ('64300000-0000-0000-0000-000000000001','${user}',DATE '2026-10-11',61),
      ('64300000-0000-0000-0000-000000000002','${user}',DATE '2026-10-11',60),
      ('64300000-0000-0000-0000-000000000003','${user}',DATE '2026-10-11',39),
      ('64300000-0000-0000-0000-000000000004','${user}',DATE '2026-10-11',40),
      ('64300000-0000-0000-0000-000000000005','${user}',DATE '2026-10-11',43),
      ('64300000-0000-0000-0000-000000000006','${user}',DATE '2026-10-11',61);
    SELECT json_build_object(
      'lagen',(SELECT json_object_agg(g.title,to_jsonb(p)->>'lage')
        FROM goals.user_goals g
        CROSS JOIN LATERAL goals.goal_progress_at(g.id,DATE '2026-10-11') p
        WHERE g.id::text LIKE '64300000-%'),
      'frozen',(SELECT json_build_object('lage',to_jsonb(p)->>'lage',
        'status',p.progress_status)
        FROM goals.goal_progress_at('64300000-0000-0000-0000-000000000001',
          DATE '2026-10-22') p),
      'controlling',(SELECT to_jsonb(p)->>'lage' FROM goals.goal_progress_at(
        '30000000-0000-0000-0000-000000000901',DATE '2026-10-11') p)
    );
    ROLLBACK;
  `)
  const result = JSON.parse(output.split(/\r?\n/).find(x => x.startsWith('{')) ?? '{}')
  assert.deepEqual(result.lagen, {
    voraus: 'voraus', grenze_oben: 'im_plan', hinterher: 'hinterher',
    grenze_unten: 'im_plan', fallend: 'voraus', ohne_frist: 'offen',
    ohne_istwert: 'offen',
  })
  assert.deepEqual(result.frozen, { lage: null, status: 'frozen' })
  assert.equal(result.controlling, null)
})
