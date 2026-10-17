import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-627 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
function sql(body: string): string {
  return execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', body],
  { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-627: Quellen und Schwellen aus SCORING, Logtagen und Planwache', () => {
  const rows = JSON.parse(sql(`SELECT json_agg(json_build_object(
    'key',x.key,'delta',x.delta,'protein',x.protein)) FROM (VALUES
    ('logs',(goals.weekly_adjustment_rule_at('lean_bulk',0,90,0,4,NULL)).rule_key,
      (goals.weekly_adjustment_rule_at('lean_bulk',0,90,0,4,NULL)).kcal_delta,
      (goals.weekly_adjustment_rule_at('lean_bulk',0,90,0,4,NULL)).protein_delta_g),
    ('bulk_fast',(goals.weekly_adjustment_rule_at('lean_bulk',0.81,90,0,6,NULL)).rule_key,
      (goals.weekly_adjustment_rule_at('lean_bulk',0.81,90,0,6,NULL)).kcal_delta,
      (goals.weekly_adjustment_rule_at('lean_bulk',0.81,90,0,6,NULL)).protein_delta_g),
    ('bulk_slow',(goals.weekly_adjustment_rule_at('lean_bulk',0.05,86,0,6,NULL)).rule_key,
      (goals.weekly_adjustment_rule_at('lean_bulk',0.05,86,0,6,NULL)).kcal_delta,
      (goals.weekly_adjustment_rule_at('lean_bulk',0.05,86,0,6,NULL)).protein_delta_g),
    ('loss_fast',(goals.weekly_adjustment_rule_at('fat_loss',-1.01,50,0,6,NULL)).rule_key,
      (goals.weekly_adjustment_rule_at('fat_loss',-1.01,50,0,6,NULL)).kcal_delta,
      (goals.weekly_adjustment_rule_at('fat_loss',-1.01,50,0,6,NULL)).protein_delta_g),
    ('strength',(goals.weekly_adjustment_rule_at('fat_loss',-0.3,80,11,6,NULL)).rule_key,
      (goals.weekly_adjustment_rule_at('fat_loss',-0.3,80,11,6,NULL)).kcal_delta,
      (goals.weekly_adjustment_rule_at('fat_loss',-0.3,80,11,6,NULL)).protein_delta_g),
    ('watch',(goals.weekly_adjustment_rule_at('lean_bulk',0.2,85,0,6,'hinterher')).rule_key,
      (goals.weekly_adjustment_rule_at('lean_bulk',0.2,85,0,6,'hinterher')).kcal_delta,
      (goals.weekly_adjustment_rule_at('lean_bulk',0.2,85,0,6,'hinterher')).protein_delta_g),
    ('other',(goals.weekly_adjustment_rule_at('maintenance',0.2,95,0,6,NULL)).rule_key,
      (goals.weekly_adjustment_rule_at('maintenance',0.2,95,0,6,NULL)).kcal_delta,
      (goals.weekly_adjustment_rule_at('maintenance',0.2,95,0,6,NULL)).protein_delta_g)
  ) AS x(label,key,delta,protein)`)) as Array<{ key: string; delta: number; protein: number }>
  assert.deepEqual(rows.map(r => [r.key, r.delta, r.protein]), [
    ['logtage_zu_wenig', 0, 0], ['lean_bulk_zu_schnell', -100, 0],
    ['lean_bulk_zu_langsam', 100, 0], ['fat_loss_zu_schnell', 150, 0],
    ['fat_loss_kraft', 0, 20], ['wache_lean_bulk_hinterher', 100, 0],
    ['auf_kurs', 0, 0]
  ])
  assert.equal(sql(`SELECT count(*) FROM goals.weekly_adjustment_rules
    WHERE source_ref IS NULL OR source_ref=''`), '0')
})

test('G-627: Regel-Sabotage kippt das Ergebnis, Dienst schreibt Wochen', () => {
  const result = sql(`BEGIN;
    UPDATE goals.weekly_adjustment_rules SET threshold=0.05
    WHERE rule_key='lean_bulk_zu_schnell';
    SELECT (goals.weekly_adjustment_rule_at(
      'lean_bulk',0.1,85,0,6,NULL)).rule_key;
    ROLLBACK;`)
  assert.match(result, /lean_bulk_zu_schnell/)
  assert.equal((JSON.parse(sql(`SELECT row_to_json(r) FROM (
    SELECT rule_key FROM goals.weekly_adjustment_rule_at(
      'lean_bulk',0.1,85,0,6,NULL)) r`)) as { rule_key: string }).rule_key,
  'auf_kurs')

  const write = sql(`BEGIN; SET LOCAL ROLE service_role;
    SELECT goals.run_goal_contribution_catchup(CURRENT_DATE-1);
    SELECT goals.record_weekly_adjustments(CURRENT_DATE-1);
    SELECT json_build_object('weeks',count(*),'sources',
      count(*) FILTER (WHERE source_data ? 'rule'))
    FROM goals.goal_weekly_adjustments;
    ROLLBACK;`)
  const lines = write.split(/\r?\n/)
  const counts = JSON.parse(lines.find(line => line.startsWith('{"weeks"')) ?? '{}')
  assert.ok(counts.weeks > 0)
  assert.equal(counts.weeks, counts.sources)
})

test('G-627: Fat Loss und Reverse Diet folgen den weiteren SCORING-Fällen', () => {
  const keys = sql(`SELECT string_agg(rule_key,',' ORDER BY sort) FROM (
    SELECT 1 AS sort,(goals.weekly_adjustment_rule_at(
      'fat_loss',0,86,0,6,NULL)).rule_key AS rule_key
    UNION ALL SELECT 2,(goals.weekly_adjustment_rule_at(
      'reverse_diet',0.51,90,0,6,NULL)).rule_key
    UNION ALL SELECT 3,(goals.weekly_adjustment_rule_at(
      'reverse_diet',0.20,90,0,6,NULL)).rule_key
  ) x`)
  assert.equal(keys,
    'fat_loss_stillstand,reverse_zu_schnell,reverse_erhoehen')
})
