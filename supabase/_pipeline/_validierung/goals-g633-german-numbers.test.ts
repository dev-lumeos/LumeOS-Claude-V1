import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-633 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8' }).trim()
}

test('G-633: deutsche Zahlen, UTF-8-Hex und unveraenderte Schluessel', () => {
  const direct = JSON.parse(sql(`SELECT json_build_object(
    'whole',goals.g633_hinweis_zahlen_de('20.0 Wochen'),
    'bmi',goals.g633_hinweis_zahlen_de('BMI 16.8 liegt unter 18.5.'),
    'hex',encode(convert_to(goals.g633_hinweis_zahlen_de(
      'BMI 16.8 liegt unter 18.5.'),'UTF8'),'hex'));`))
  assert.equal(direct.whole, '20 Wochen')
  assert.equal(direct.bmi, 'BMI 16,8 liegt unter 18,5.')
  assert.match(direct.hex, /31362c38.*31382c35/)

  const args = `'advanced','abnehmen',80,75,DATE '2026-10-08',
    DATE '2027-03-11','moderate_cut',NULL,'male',180,2600,NULL`
  const result = JSON.parse(sql(`SELECT json_build_object(
    'duration',(SELECT hinweis FROM goals.ziel_grenzen_pruefen(${args})
      WHERE schluessel='diaetdauer' AND art='sperre'),
    'bmi',(SELECT hinweis FROM goals.ziel_grenzen_pruefen(
      'pro','abnehmen',80,54.432,DATE '2026-10-08',DATE '2026-12-20',
      'lose',NULL,'male',180,2600,NULL)
      WHERE schluessel='ziel_bmi'),
    'key_diff',(SELECT count(*) FROM (
      (SELECT schluessel,art FROM goals.ziel_grenzen_pruefen(${args})
       EXCEPT ALL
       SELECT schluessel,art FROM goals.ziel_grenzen_pruefen_g633_basis(${args}))
      UNION ALL
      (SELECT schluessel,art FROM goals.ziel_grenzen_pruefen_g633_basis(${args})
       EXCEPT ALL
       SELECT schluessel,art FROM goals.ziel_grenzen_pruefen(${args}))
    ) d));`))
  assert.match(result.duration, /20 Wochen/)
  assert.doesNotMatch(result.duration, /20[.,]0 Wochen/)
  assert.equal(result.bmi, 'Ziel-BMI 16,8 liegt unter 18,5.')
  assert.equal(result.key_diff, 0)
})
