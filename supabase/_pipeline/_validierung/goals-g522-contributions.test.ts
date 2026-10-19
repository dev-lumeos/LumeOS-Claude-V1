import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-522 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const user = '20000000-0000-0000-0000-000000000901'

function query(sql: string, asUser = false, setup = '', beforeRole = ''): Record<string, unknown> {
  const output = execFileSync('docker', ['exec', container, 'psql', '-X', '-q',
    '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db, '-t', '-A', '-c', `
    BEGIN;
    ${beforeRole}
    ${asUser ? `SELECT set_config('request.jwt.claim.sub','${user}',true);
    SET LOCAL ROLE authenticated;` : ''}
    ${setup}
    SELECT json_build_object(${sql});
    ROLLBACK;
  `], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
  return JSON.parse(output.split(/\r?\n/).find(line => line.startsWith('{')) ?? '')
}

test('G-522: Bereichslauf ist idempotent, zukunftsfrei und stoppt am Freeze', () => {
  const got = query(`
    'future',(SELECT count(*) FROM goals.goal_contributions c
      WHERE c.contribution_date>CURRENT_DATE),
    'after_freeze',(SELECT count(*) FROM goals.goal_contributions c
      JOIN LATERAL goals.goal_state_at(c.goal_id,c.contribution_date) s ON true
      WHERE s.state='eingefroren' AND c.contribution_date>s.frozen_on),
    'modules',(SELECT count(DISTINCT module) FROM goals.goal_contributions c
      WHERE c.contribution_date BETWEEN CURRENT_DATE-6 AND CURRENT_DATE),
    'duplicates',(SELECT count(*) FROM (
      SELECT goal_id,module,contribution_date FROM goals.goal_contributions
      GROUP BY 1,2,3 HAVING count(*)>1) duplicate)`, false, `
      DO $$ BEGIN
        PERFORM goals.refresh_goal_contributions(CURRENT_DATE-6,CURRENT_DATE+3,CURRENT_DATE);
        PERFORM goals.refresh_goal_contributions(CURRENT_DATE-6,CURRENT_DATE+3,CURRENT_DATE);
      END $$;`)
  assert.equal(got.future, 0)
  assert.equal(got.after_freeze, 0)
  assert.equal(got.duplicates, 0)
  assert.ok(Number(got.modules) >= 3)
})

test('G-522: Kacheln tragen Werte und Gründe aus echten Quellen', () => {
  const got = query(`'weekday', extract(isodow FROM CURRENT_DATE)::integer,
    'cards',(SELECT goals.goal_module_cards_at(g.id,CURRENT_DATE)
    FROM goals.user_goals g WHERE g.user_id=auth.uid()
      AND g.goal_role='controlling' AND g.status='active' LIMIT 1)`,
    true, '', `DO $$ BEGIN PERFORM goals.refresh_goal_contributions(
      CURRENT_DATE-6,CURRENT_DATE,CURRENT_DATE); END $$;`)
  const cards = got.cards as Record<string, Record<string, unknown>>
  for (const module of ['nutrition', 'training', 'recovery', 'supplements']) {
    assert.ok(cards[module])
    assert.ok(cards[module].wert !== null || typeof cards[module].grund === 'string')
    assert.ok(typeof cards[module].quelle === 'string')
  }
  assert.equal(cards.training.wert, Math.min(3, Number(got.weekday)))
  assert.equal(cards.training.wochenziel, 4)
  assert.ok(Number(cards.nutrition.wert) > 0)
  assert.equal(cards.recovery.wert, null)
  assert.ok(['nutrition', 'training', 'supplements'].includes(
    String((cards.engpass as Record<string, unknown>).module)))
})

test('G-522: ohne Beiträge bleibt auch der Engpass null mit Grund', () => {
  const got = query(`'cards',(SELECT goals.goal_module_cards_at(g.id,CURRENT_DATE)
    FROM goals.user_goals g WHERE g.user_id=auth.uid()
      AND g.goal_role='controlling' AND g.status='active' LIMIT 1)`, true)
  const cards = got.cards as Record<string, unknown>
  assert.equal(cards.engpass, null)
  assert.equal(cards.engpass_grund, 'keine_modulwerte')
})

test('G-522: verstelltes Gewicht kippt den Engpass und wird zurückgerollt', () => {
  const scores = `'{"nutrition":90,"training":90,"recovery":40,"supplements":80}'::jsonb`
  const before = query(`'value',goals.goal_bottleneck('body_composition_gain',${scores})`)
  const after = query(`'value',goals.goal_bottleneck('body_composition_gain',${scores})`,
    false, `UPDATE goals.contribution_weights SET weight=0.05
      WHERE goal_kind='body_composition_gain' AND module='recovery';`)
  assert.equal((before.value as Record<string, unknown> | null)?.module, 'recovery')
  assert.notEqual((after.value as Record<string, unknown> | null)?.module, 'recovery')
})

test('G-522: vier Gewichtungsreihen entsprechen SCORING.md', () => {
  const got = query(`'weights',(SELECT json_object_agg(goal_kind,mods) FROM (
    SELECT goal_kind,json_object_agg(module,weight) AS mods
    FROM goals.contribution_weights GROUP BY goal_kind) w)`)
  const weights = got.weights as Record<string, Record<string, number>>
  assert.equal(Object.keys(weights).length, 4)
  for (const row of Object.values(weights)) {
    assert.equal(Object.keys(row).length, 5)
    assert.ok(Math.abs(Object.values(row).reduce((a, b) => a + b, 0) - 1) < 0.0001)
  }
  assert.equal(weights.body_composition_loss.nutrition, 0.4)
  assert.equal(weights.body_composition_gain.training, 0.35)
  assert.equal(weights.performance_strength.training, 0.4)
  assert.equal(weights.health.medical, 0.2)
})

test('G-522: der Live-Nachzug kann auf ein Konto begrenzt werden', () => {
  const got = query(`'foreign',(SELECT count(*) FROM goals.goal_contributions
      WHERE contribution_date BETWEEN CURRENT_DATE-6 AND CURRENT_DATE
        AND user_id<>'${user}'),
    'own',(SELECT count(*) FROM goals.goal_contributions
      WHERE contribution_date BETWEEN CURRENT_DATE-6 AND CURRENT_DATE
        AND user_id='${user}')`, false, `
      DO $$ BEGIN PERFORM goals.refresh_goal_contributions(
        CURRENT_DATE-6,CURRENT_DATE,CURRENT_DATE,'${user}'); END $$;`)
  assert.equal(got.foreign, 0)
  assert.ok(Number(got.own) > 0)
})

test('G-522: vorhandene G-514-Snapshots bleiben beim Nachzug erhalten', () => {
  const got = query(`'legacy',(SELECT json_build_object(
      'score',c.contribution_score,'details',c.details)
      FROM goals.goal_contributions c
      JOIN goals.user_goals g ON g.id=c.goal_id
      WHERE g.user_id='${user}' AND g.goal_role='controlling'
        AND c.module='recovery' AND c.contribution_date=CURRENT_DATE
      LIMIT 1)`, false, `
      INSERT INTO goals.goal_contributions(goal_id,user_id,
        contribution_date,module,contribution_score,details)
      SELECT g.id,g.user_id,CURRENT_DATE,'recovery',42,
        '{"legacy":"keep"}'::jsonb
      FROM goals.user_goals g WHERE g.user_id='${user}'
        AND g.goal_role='controlling' AND g.status='active' LIMIT 1;
      DO $$ BEGIN PERFORM goals.refresh_goal_contributions(
        CURRENT_DATE,CURRENT_DATE,CURRENT_DATE,'${user}'); END $$;`)
  const legacy = got.legacy as { score: number; details: Record<string, unknown> }
  assert.equal(legacy.score, 42)
  assert.equal(legacy.details.legacy, 'keep')
})
