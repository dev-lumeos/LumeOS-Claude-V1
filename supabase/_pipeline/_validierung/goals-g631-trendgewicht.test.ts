import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-631 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const seeded = '10000000-0000-0000-0000-000000000101'
const testUser = '20000000-0000-0000-0000-000000000901'

function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

function result(user: string, query: string): Record<string, unknown> {
  const output = sql(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    SELECT set_config('request.jwt.claim.sub','${user}',true);
    ${query}
    ROLLBACK;
  `)
  return JSON.parse(output.split(/\r?\n/).find(line => line.startsWith('{')) ?? '{}')
}

test('G-631: Seed-Reihe bis 09.10. liefert 84,709 kg ohne Zukunftsmessungen', () => {
  const row = result(seeded, `
    SELECT row_to_json(t) FROM goals.trendgewicht_am('${seeded}',DATE '2026-10-09') t;
  `)
  assert.deepEqual(row, {
    wert: 84.709, quelle: 'trend_ema',
    letzte_messung_am: '2026-10-09', anzahl_messungen: 14,
  })
})

test('G-631: eine alte Messung fällt gekennzeichnet auf den Rohwert zurück', () => {
  const row = result(testUser, `
    SELECT row_to_json(t) FROM goals.trendgewicht_am('${testUser}',DATE '2026-10-09') t;
  `)
  assert.equal(row.wert, 81.4)
  assert.equal(row.quelle, 'letzte_messung')
  assert.equal(row.anzahl_messungen, 0)
  assert.ok(typeof row.letzte_messung_am === 'string')
  assert.ok(row.letzte_messung_am < '2026-10-01')
})

test('G-631: EMA berücksichtigt Kalendertage zwischen echten Messungen', () => {
  const row = result(testUser, `
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg)
    VALUES
      ('${testUser}',DATE '2025-01-01',TIME '08:00',80),
      ('${testUser}',DATE '2025-01-02',TIME '08:00',82),
      ('${testUser}',DATE '2025-01-05',TIME '08:00',84),
      ('${testUser}',DATE '2025-01-08',TIME '08:00',86);
    SELECT row_to_json(t) FROM goals.trendgewicht_am('${testUser}',DATE '2025-01-08') t;
  `)
  assert.deepEqual(row, {
    wert: 84.533, quelle: 'trend_ema',
    letzte_messung_am: '2025-01-08', anzahl_messungen: 4,
  })
})

test('G-631: drei Messtage reichen auch mit zwei Messungen an einem Tag nicht', () => {
  const row = result(testUser, `
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg)
    VALUES
      ('${testUser}',DATE '2025-02-01',TIME '08:00',80),
      ('${testUser}',DATE '2025-02-01',TIME '09:00',81),
      ('${testUser}',DATE '2025-02-02',TIME '08:00',82),
      ('${testUser}',DATE '2025-02-03',TIME '08:00',83);
    SELECT row_to_json(t) FROM goals.trendgewicht_am('${testUser}',DATE '2025-02-03') t;
  `)
  assert.deepEqual(row, {
    wert: 83, quelle: 'letzte_messung',
    letzte_messung_am: '2025-02-03', anzahl_messungen: 3,
  })
})

test('G-631: nach mehr als sieben Tagen ohne Messung gilt der letzte Rohwert', () => {
  const row = result(testUser, `
    INSERT INTO goals.body_measurements
      (user_id,measurement_date,measurement_time,weight_kg)
    VALUES
      ('${testUser}',DATE '2025-01-05',TIME '08:00',80),
      ('${testUser}',DATE '2025-01-06',TIME '08:00',81),
      ('${testUser}',DATE '2025-01-07',TIME '08:00',82),
      ('${testUser}',DATE '2025-01-08',TIME '08:00',83);
    SELECT row_to_json(t) FROM goals.trendgewicht_am('${testUser}',DATE '2025-01-16') t;
  `)
  assert.deepEqual(row, {
    wert: 83, quelle: 'letzte_messung',
    letzte_messung_am: '2025-01-08', anzahl_messungen: 4,
  })
})

test('G-631: vor der ersten Messung keine Zeile; fremdes Konto bleibt unsichtbar', () => {
  const row = result(testUser, `
    SELECT json_build_object(
      'before',(SELECT count(*) FROM goals.trendgewicht_am('${testUser}',DATE '2020-01-01')),
      'foreign',(SELECT count(*) FROM goals.trendgewicht_am('${seeded}',DATE '2026-10-09')),
      'own',(SELECT count(*) FROM goals.trendgewicht_am('${testUser}',DATE '2026-10-09'))
    );
  `)
  assert.deepEqual(row, { before: 0, foreign: 0, own: 1 })
})
