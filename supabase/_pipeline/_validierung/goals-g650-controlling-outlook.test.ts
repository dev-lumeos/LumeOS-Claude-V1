import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-650 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const seedUser = '10000000-0000-0000-0000-000000000101'
const seedGoal = '30000000-0000-0000-0000-000000000101'
const otherUser = '20000000-0000-0000-0000-000000000901'

function one(query: string): any {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  const value = output.split(/\r?\n/).findLast(line => line.startsWith('{') || line === 'NULL')
  return value === undefined || value === 'NULL' ? null : JSON.parse(value)
}

test('G-650: dev-Seed hat Wochenwerte, Quellen und eine Prognose aus vier Wochen Trend', () => {
  const result = one(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${seedUser}',true);
    SET LOCAL ROLE authenticated;
    SELECT goals.controlling_goal_outlook('${seedGoal}',DATE '2026-10-09');
    ROLLBACK;
  `)
  assert.equal(result.goal_id, seedGoal)
  assert.equal(result.stichtag, '2026-10-09')
  assert.equal(result.kennzahlen.trend_kg, 84.709)
  assert.equal(result.kennzahlen.trend_quelle, 'goals.trendgewicht_am:trend_ema')
  assert.equal(result.kennzahlen.veraenderung_gesamt_kg, -0.291)
  assert.equal(result.kennzahlen.tempo_4w_kg_pro_woche, 0.031)
  assert.equal(result.kennzahlen.soll_kg_pro_woche, 0.1)
  assert.equal(result.kennzahlen.verbleibend_kg, 3.291)
  assert.equal(result.kennzahlen.fortschritt_pct, 0)
  assert.equal(result.prognose.plan_datum, '2026-12-16')
  assert.equal(result.prognose.status, 'datum')
  assert.equal(result.prognose.datum, '2028-10-16')
  assert.equal(result.wochen.length, 21)
  assert.equal(result.wochen.at(-1).woche_bis, '2026-10-09')
  assert.equal(result.wochen.at(-1).vollstaendig, false)
  assert.equal(result.wochen.at(-1).soll_kg, 87.024)
  assert.equal(result.wochen.at(-1).soll_delta_kg, 0.072)
  assert.equal(result.wochen.at(-1).trend_delta_kg, 0.035)
  assert.equal(result.wochen.at(-1).durchschnitt_kcal, 2398)
  assert.equal(result.wochen.at(-1).logtage, 5)
  assert.match(result.wochen.at(-1).kcal_quelle, /^nutrition\.daily_summary/)
  assert.equal(result.wochen.at(-1).anpassung_kcal, null)
  assert.equal(result.wochen.at(-1).anpassung_quelle, 'G-627 ausstehend')
  assert.ok(result.wochen.every((week: any) => week.trend_quelle && week.soll_quelle))

  const early = one(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${seedUser}',true);
    SET LOCAL ROLE authenticated;
    SELECT goals.controlling_goal_outlook('${seedGoal}',DATE '2026-06-10');
    ROLLBACK;
  `)
  assert.equal(early.prognose.status, 'nicht_absehbar')
  assert.equal(early.prognose.grund, 'zu_wenig_trenddaten')
})

test('G-650: fremdes Ziel ist unsichtbar; fehlende Frist liefert keine Prognose', () => {
  const own = one(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${otherUser}',true);
    SET LOCAL ROLE authenticated;
    SELECT goals.controlling_goal_outlook(
      '30000000-0000-0000-0000-000000000901',DATE '2026-10-09');
    ROLLBACK;
  `)
  assert.equal(own.prognose.status, 'nicht_absehbar')
  assert.equal(own.prognose.grund, 'kein_gewichts_ziel')
  const foreign = one(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${otherUser}',true);
    SET LOCAL ROLE authenticated;
    SELECT goals.controlling_goal_outlook('${seedGoal}',DATE '2026-10-09');
    ROLLBACK;
  `)
  assert.equal(foreign, null)
})

test('G-650: ein eingefrorenes Ziel endet mit seinen Wochenwerten am Einfrierdatum', () => {
  const frozen = one(`
    BEGIN;
    SELECT set_config('request.jwt.claim.sub','${seedUser}',true);
    SET LOCAL ROLE authenticated;
    UPDATE goals.user_goals SET status='missed',
      achievement_date=DATE '2026-08-01' WHERE id='${seedGoal}';
    SELECT goals.controlling_goal_outlook('${seedGoal}',DATE '2026-10-09');
    ROLLBACK;
  `)
  assert.equal(frozen.zielstatus, 'eingefroren')
  assert.equal(frozen.stichtag, '2026-08-01')
  assert.equal(frozen.wochen.at(-1).woche_bis, '2026-08-01')
  assert.equal(frozen.prognose.status, 'nicht_absehbar')
  assert.equal(frozen.prognose.grund, 'ziel_nicht_aktiv')
})
