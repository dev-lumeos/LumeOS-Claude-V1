import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-642 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

const replacements = [
  ['goal_phase_start(text,uuid,date,date,text,jsonb,numeric,text)', 'Ziel gehoert nicht dem angemeldeten Nutzer', 'Ziel gehört nicht dem angemeldeten Nutzer'],
  ['goal_phase_start(text,uuid,date,date,text,jsonb,numeric,text)', 'fuer dieses Ziel laeuft bereits eine Phase', 'für dieses Ziel läuft bereits eine Phase'],
  ['ziel_reihenfolge_setzen(jsonb)', 'Alle aktiven eigenen Ziele muessen genannt sein', 'Alle aktiven eigenen Ziele müssen genannt sein'],
  ['goal_phases_calorie_guard()', 'Ziel fehlt oder gehoert nicht dem angemeldeten Nutzer', 'Ziel fehlt oder gehört nicht dem angemeldeten Nutzer'],
  ['goal_phases_calorie_guard()', 'Phase und Ziel muessen demselben Nutzer gehoeren', 'Phase und Ziel müssen demselben Nutzer gehören'],
  ['phase_transition_recommendation(uuid,date)', 'Tage ueber dem geplanten Phasenende; %s Koerpermessungen', 'Tage über dem geplanten Phasenende; %s Körpermessungen'],
  ['measurement_goal_start_preview(text,date,uuid,text,smallint,numeric)', 'eine der 13 Koerperstellen waehlen', 'eine der 13 Körperstellen wählen'],
  ['g617_measurement_goal_snapshot()', 'feste Koerpereinheit verwenden', 'feste Körpereinheit verwenden'],
  ['g617_measurement_goal_snapshot()', 'Uebung und einmaliger Rhythmus erforderlich', 'Übung und einmaliger Rhythmus erforderlich'],
  ['ziel_grenzen_pruefen_g633_basis(text,text,numeric,numeric,date,date,text,jsonb,text,numeric,numeric,numeric)', 'Eigene Maximaldauer von %s Wochen ueberschritten.', 'Eigene Maximaldauer von %s Wochen überschritten.'],
] as const

test('G-642: installierte Funktionen tragen die neuen Sätze bei gleicher Signatur', () => {
  for (const [signature, before, after] of replacements) {
    const definition = sql(`SELECT pg_get_functiondef(to_regprocedure('goals.${signature}'))`)
    assert.ok(definition.includes(after), `${signature}: neuer Satz fehlt`)
    assert.ok(!definition.includes(before), `${signature}: alter Satz noch vorhanden`)
  }
})

test('G-642: vier Katalogbeschreibungen haben Umlaute; die übrigen Zeilen bleiben', () => {
  const rows = JSON.parse(sql(`SELECT json_object_agg(code,description)
    FROM goals.goal_strategies WHERE code LIKE 'eigene_werte_%'`)) as Record<string, string>
  assert.equal(Object.keys(rows).length, 5)
  assert.equal(rows.eigene_werte_abnehmen, 'Eigenes Vorgehen für Abnehmen ab Pro.')
  assert.equal(rows.eigene_werte_halten, 'Eigenes Vorgehen für Halten ab Pro.')
  assert.equal(rows.eigene_werte_aufbauen, 'Eigenes Vorgehen für Aufbauen ab Pro.')
  assert.equal(rows.eigene_werte_uebergang, 'Eigener Übergang ab Pro.')
  assert.equal(rows.eigene_werte_plan, 'Eigene Planphase ab Pro.')
})

test('G-642-Wächter: wirksame Goals-Nutzertexte enthalten keine Ersatzschreibweise', () => {
  const definitions = JSON.parse(sql(`SELECT json_agg(row_to_json(f)) FROM (
    SELECT p.proname AS name,pg_get_functiondef(p.oid) AS body
    FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='goals'
  ) f`)) as Array<{ name: string, body: string }>
  if (process.env.G642_SABOTAGE === '1') {
    const phaseStart = definitions.find(f => f.name === 'goal_phase_start')
    assert.ok(phaseStart)
    phaseStart.body = phaseStart.body.replace(
      'für dieses Ziel läuft bereits eine Phase',
      'fuer dieses Ziel laeuft bereits eine Phase',
    )
  }
  const stale = /\b(?:ungueltig|Gueltigkeitstag|Prioritaeten|muessen|gehoert|gehoeren|Plaetze|ueber|Koerpermessungen|Koerperstellen|waehlen|Koerpereinheit|Uebung|ueberschritten|fuer|Uebergang|ausschliesslich)\b/i
  const findings: string[] = []
  for (const { name, body } of definitions) {
    const literals = body.matchAll(/(?:RAISE EXCEPTION|format)\s*\(?\s*'((?:''|[^'])*)'/gi)
    for (const match of literals) {
      const phrase = match[1]
      if (stale.test(phrase)) findings.push(`${name}: ${phrase}`)
    }
  }
  const descriptions = JSON.parse(sql(`SELECT json_agg(description) FROM goals.goal_strategies`)) as string[]
  for (const description of descriptions) {
    if (stale.test(description)) findings.push(`goal_strategies: ${description}`)
  }
  assert.deepEqual(findings, [])
})

test('G-647: der letzte Satz ist UTF-8 und die Ersatzschreibung fehlt', () => {
  const body = sql(`SELECT pg_get_functiondef(
    'goals.berechne_zielwerte_g637_basis(uuid,date)'::regprocedure)`)
  const checkedBody = process.env.G647_SABOTAGE === '1'
    ? body.replace('am Gültigkeitstag', 'am Gueltigkeitstag') : body
  assert.ok(checkedBody.includes('nutrition_targets: mehrere aktive Phasen am Gültigkeitstag; Zielbezug fehlt'))
  assert.ok(!checkedBody.includes('am Gueltigkeitstag'))
  const assignment = sql(`SELECT pg_get_functiondef(
    'goals.nutrition_target_assign_phase()'::regprocedure)`)
  assert.equal(assignment.match(/am Gültigkeitstag/g)?.length, 3)
  assert.ok(!assignment.includes('Gueltigkeitstag'))
  assert.equal(sql(`SELECT encode(convert_to('Diät','UTF8'),'hex')`), '4469c3a474')
  assert.equal(sql(`SELECT encode(convert_to('Gültigkeitstag','UTF8'),'hex')`), '47c3bc6c7469676b65697473746167')
})
