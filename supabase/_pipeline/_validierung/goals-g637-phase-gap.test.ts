import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('G-637 braucht eine Wegwerf-Datenbank.')
const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'

function sql(query: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', query,
  ], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 }).trim()
}

test('G-637: aktives Ziel mit beendeter Phase bleibt Erhaltung mit Ziel- und Phasenkontext', () => {
  const result = JSON.parse(sql(`
    BEGIN;
    UPDATE goals.goal_phases SET actual_end_date=DATE '2026-09-29',
      recommended_next='reverse_diet'
      WHERE id='31000000-0000-0000-0000-000000000102';
    SELECT json_build_object(
      'phaseCount',(SELECT count(*) FROM goals.phase_am(
        '10000000-0000-0000-0000-000000000101',DATE '2026-10-08')),
      'obstacle',z.hindernis,'goal',z.goal_id,'kcal',z.kcal,
      'source',(SELECT herkunft FROM goals.zielwerte_am(
        '10000000-0000-0000-0000-000000000101',DATE '2026-10-08')),
      'lastPhase',z.letzte_phase_id,'lastEnd',z.letzte_phase_ende,
      'recommendedNext',z.recommended_next,
      'planStatus',(SELECT status FROM goals.goal_programs
        WHERE goal_id='30000000-0000-0000-0000-000000000101'),
      'positions',(SELECT count(*) FROM goals.goal_program_positions pos
        JOIN goals.goal_programs plan ON plan.id=pos.program_id
        WHERE plan.goal_id='30000000-0000-0000-0000-000000000101'),
      'lastPosition',(SELECT max(pos.position) FROM goals.goal_program_positions pos
        JOIN goals.goal_programs plan ON plan.id=pos.program_id
        WHERE plan.goal_id='30000000-0000-0000-0000-000000000101'
          AND pos.goal_phase_id=z.letzte_phase_id),
      'daily',(SELECT count(*) FROM nutrition.daily_reference_assessment(
        '10000000-0000-0000-0000-000000000101',DATE '2026-10-08')
        WHERE nutrient_code IN ('F18:2CN6','F18:3CN3')
          AND reference_kind='AI'
          AND reference_basis='maintenance_active_goal_without_phase')
    ) FROM goals.berechne_zielwerte(
      '10000000-0000-0000-0000-000000000101',DATE '2026-10-08') z;
    ROLLBACK;
  `))
  assert.equal(result.phaseCount, 0)
  assert.equal(result.obstacle, 'ziel_ohne_laufende_phase')
  assert.equal(result.goal, '30000000-0000-0000-0000-000000000101')
  assert.equal(result.source, 'ziel_ohne_laufende_phase')
  assert.equal(result.lastPhase, '31000000-0000-0000-0000-000000000102')
  assert.equal(result.lastEnd, '2026-09-29')
  assert.equal(result.recommendedNext, 'reverse_diet')
  assert.equal(result.planStatus, 'aktiv')
  assert.equal(result.positions, 2)
  assert.equal(result.lastPosition, 2)
  assert.ok(result.kcal > 0)
  assert.equal(result.daily, 2)
})

test('G-637: ohne aktives Steuerziel bleibt kein_aktives_ziel', () => {
  const result = sql(`SELECT z.hindernis || '/' || (z.goal_id IS NULL)::text || '/' ||
    (SELECT count(*) FROM goals.ziel_ohne_laufende_phase_am(
      '10000000-0000-0000-0000-000000000102',DATE '2026-10-08'))
    FROM goals.berechne_zielwerte(
      '10000000-0000-0000-0000-000000000102',DATE '2026-10-08') z`)
  assert.equal(result, 'kein_aktives_ziel/true/0')
  const beforeStart = sql(`SELECT z.hindernis || '/' || (z.goal_id IS NULL)::text
    FROM goals.berechne_zielwerte(
      '10000000-0000-0000-0000-000000000101',DATE '2026-05-20') z`)
  assert.equal(beforeStart, 'kein_aktives_ziel/true')
})
