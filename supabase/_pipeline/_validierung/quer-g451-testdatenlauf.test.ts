import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const seed = readFileSync('supabase/_pipeline/_testdaten/testdaten-einspielen.ts', 'utf8')
const ownAccountSeed = readFileSync(
  'supabase/_pipeline/_testdaten/eigenes-konto-fuellen.sql',
  'utf8',
)
const chainRunner = readFileSync('supabase/_pipeline/kette-ausfuehren.ts', 'utf8')

test('G-451: der Aufraeumblock entfernt Einkaufslisten vor ihren Planwochen', () => {
  const shoppingLists = seed.indexOf('DELETE FROM nutrition.shopping_lists WHERE user_id IN (${userIds});')
  const planWeeks = seed.indexOf('DELETE FROM nutrition.meal_plan_weeks WHERE user_id IN (${userIds});')

  assert.ok(shoppingLists >= 0, 'Seed-Aufraeumblock muss Listen der drei Seednutzer entfernen')
  assert.ok(planWeeks >= 0, 'Seed-Aufraeumblock muss die Planwochen entfernen')
  assert.ok(shoppingLists < planWeeks, 'Einkaufslisten muessen vor ihren Planwochen entfernt werden')
})

test('G-451: der C-421-Nachweisnutzer wird vor erneuten Score-Beitraegen aufgeraeumt', () => {
  const cleanup = seed.indexOf('DELETE FROM recovery.score_contributions\nWHERE user_id = (SELECT id FROM auth.users WHERE email = \'test-user@lumeos.local\');')
  const insert = seed.indexOf('INSERT INTO recovery.score_contributions (')

  assert.ok(cleanup >= 0, 'C-421-Beitraege des test-user muessen vor dem Insert geloescht werden')
  assert.ok(insert >= 0, 'C-421-Beitraege muessen weiterhin erzeugt werden')
  assert.ok(cleanup < insert, 'die Bereinigung muss vor dem C-421-Insert erfolgen')
})

test('G-451: der gesamte C-421-Nachweisbestand des test-user wird vor dem erneuten Aufbau entfernt', () => {
  const testUser = "(SELECT id FROM auth.users WHERE email = 'test-user@lumeos.local');"
  const insert = seed.indexOf('INSERT INTO recovery.stress_logs (')

  for (const table of [
    'recovery.stress_logs',
    'recovery.score_contributions',
    'recovery.recovery_protocols',
    'recovery.overtraining_alerts',
  ]) {
    const cleanup = seed.indexOf(`DELETE FROM ${table}\nWHERE user_id = ${testUser}`)
    assert.ok(cleanup >= 0, `${table} des test-user muss vor dem Neuaufbau geloescht werden`)
    assert.ok(cleanup < insert, `${table} muss vor dem C-421-Aufbau geloescht werden`)
  }
})

test('G-451: der transaktionale Seed autorisiert seine gezielte Storage-Bereinigung vor dem ersten Direkt-Delete', () => {
  const authorization = seed.indexOf("SELECT set_config('storage.allow_delete_query', 'true', true);")
  const firstDelete = seed.indexOf('DELETE FROM storage.objects')

  assert.ok(authorization >= 0, 'der lokale Storage-Delete-Schalter fehlt')
  assert.ok(firstDelete >= 0, 'der Seed bereinigt seine eigenen Storage-Objekte')
  assert.ok(authorization < firstDelete, 'der lokale Schalter muss vor dem Storage-Delete gesetzt werden')
})

test('G-451: C-429-Nachweiszeilen loesen das Pruefkonto per E-Mail statt ueber eine fremde feste UUID auf', () => {
  const c429 = seed.slice(seed.indexOf("'c4290000-0000-0000-0000-000000000011'::uuid,"))

  assert.doesNotMatch(c429, /20000000-0000-0000-0000-000000000901/,
    'C-429 muss die reale test-user-ID aus auth.users verwenden')
  assert.match(c429, /test-user@lumeos\.local/,
    'C-429 braucht weiterhin das explizite Pruefkonto')
})

test('G-451: der Storage-Abschnitt verwendet die vor dem Rollenwechsel aufgeloeste Pruefkonto-ID', () => {
  assert.match(seed, /set_config\('app\.test_user_id',\s*\(SELECT id::text FROM auth\.users WHERE email = 'test-user@lumeos\.local'\)/,
    'die ID muss noch als postgres aus auth.users gelesen werden')
  assert.match(seed, /current_setting\('app\.test_user_id'\)/,
    'nach SET LOCAL ROLE authenticated darf der Storage-Abschnitt nicht erneut auth.users lesen')
})

test('G-556: Max Seedphase entsteht bereits als beendete ungebundene Historie', () => {
  const phaseStart = seed.indexOf("id: '31000000-0000-0000-0000-000000000201'")
  const phaseEnd = seed.indexOf('\n  },', phaseStart)

  assert.ok(phaseStart >= 0, 'Max Seedphase muss im Testdatenerzeuger stehen')
  assert.ok(phaseEnd > phaseStart, 'Max Seedphase muss als eigener Datensatz lesbar sein')

  const maxPhase = seed.slice(phaseStart, phaseEnd)
  assert.match(maxPhase, /actualEndDate: '2026-09-29'/)
  assert.match(
    maxPhase,
    /transitionReason: 'Seed ohne Zielbindung, beendet bei der Strukturumstellung G-538'/,
  )
  assert.doesNotMatch(maxPhase, /actualEndDate: null/)
})

test('G-556: der Testdatenerzeuger schreibt Allergien mit ihrem Katalogcode', () => {
  assert.match(seed, /'allergies', jsonb_build_array\('nutrition:contains_nuts'\)/)
  assert.doesNotMatch(seed, /'allergies', jsonb_build_array\('tree_nuts'\)/)
})

test('G-556: die Kontokopie behaelt die Strategie jeder Phase', () => {
  const phaseStart = ownAccountSeed.indexOf('INSERT INTO goals.goal_phases (')
  const phaseEnd = ownAccountSeed.indexOf('-- G-511:', phaseStart)

  assert.ok(phaseStart >= 0, 'die Kontokopie muss goal_phases kopieren')
  assert.ok(phaseEnd > phaseStart, 'der Phasenkopierblock muss abgrenzbar sein')

  const phaseCopy = ownAccountSeed.slice(phaseStart, phaseEnd)
  assert.equal(
    [...phaseCopy.matchAll(/\bstrategie_code\b/g)].length,
    2,
    'strategie_code muss sowohl im INSERT als auch im SELECT stehen',
  )
})

test('G-556: jede erzeugte Seedphase traegt ihren Strategiekatalog-Code', () => {
  const phaseRowsStart = seed.indexOf('const goalPhaseRows: GoalPhaseRow[] = [')
  const phaseRowsEnd = seed.indexOf('const goalMilestoneRows:', phaseRowsStart)
  const phaseRows = seed.slice(phaseRowsStart, phaseRowsEnd)

  assert.equal(
    [...phaseRows.matchAll(/strategyCode:/g)].length,
    3,
    'alle drei Basisphasen brauchen den Katalogcode',
  )
  assert.match(seed, /phase\.strategyCode/)
  assert.match(seed, /transition_reason text,\s*strategie_code text/)
  assert.match(seed, /transitioned_from, recommended_next, transition_reason, strategie_code/)
})

test('G-556: der Kettenrunner bildet auth.uid mit modernem JWT-Claim nach', () => {
  const authStubStart = chainRunner.indexOf('function installAuthStub')
  const authStubEnd = chainRunner.indexOf('// C-429:', authStubStart)

  assert.ok(authStubStart >= 0, 'der Kettenrunner muss einen Auth-Stub installieren')
  assert.ok(authStubEnd > authStubStart, 'der Auth-Stub muss abgrenzbar sein')

  const authStub = chainRunner.slice(authStubStart, authStubEnd)
  assert.match(authStub, /request\.jwt\.claim\.sub/)
  assert.match(authStub, /request\.jwt\.claims/)
  assert.match(authStub, /->> 'sub'/)
})
