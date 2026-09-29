// G-533 A2/A3: Alte Lean-Bulk-Phasen werden nur aus ihrem gespeicherten
// Kaloriendelta und dem Gewicht am Starttag in eine Rate ueberfuehrt.
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
const backfill = resolve('supabase/_pipeline/11_goals/533_phase_rate_backfill.sql')

if (!db || db === 'postgres' || !db.startsWith('lumeos_g533_')) {
  throw new Error('G-533 braucht eine eigene lumeos_g533_-Wegwerf-Datenbank.')
}

function psql(sql: string): string {
  return execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()
}

function applyBackfill() {
  return spawnSync('docker', [
    'exec', '-i', container, 'psql', '-X', '-v', 'ON_ERROR_STOP=1',
    '-U', 'postgres', '-d', db, '-f', '-',
  ], {
    input: readFileSync(backfill),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
}

test('G-533 A2/A3: fehlendes Startgewicht bricht ab, zwei belegte Raten machen den CHECK valid', () => {
  psql(`
    INSERT INTO auth.users (id, email) VALUES
      ('53300000-0000-0000-0000-000000000001', 'g533-dev@lumeos.local'),
      ('53300000-0000-0000-0000-000000000002', 'g533-tom@lumeos.local'),
      ('53300000-0000-0000-0000-000000000003', 'g533-maintenance@lumeos.local');

    ALTER TABLE goals.goal_phases
      DROP CONSTRAINT goal_phases_zielrate_passt_zur_art;

    INSERT INTO goals.goal_phases (
      id, user_id, phase_type, gueltig_ab, actual_end_date,
      parameters, zielrate_pct_kg_woche
    ) VALUES
      (
        '53300000-0000-0000-0000-000000000101',
        '53300000-0000-0000-0000-000000000001',
        'lean_bulk', DATE '2026-06-04', NULL,
        '{"source":"G-533 test","calorie_surplus_kcal":250}'::jsonb, NULL
      ),
      (
        '53300000-0000-0000-0000-000000000102',
        '53300000-0000-0000-0000-000000000002',
        'lean_bulk', DATE '2026-06-04', NULL,
        '{"source":"G-533 test","calorie_surplus_kcal":250}'::jsonb, NULL
      ),
      (
        '53300000-0000-0000-0000-000000000103',
        '53300000-0000-0000-0000-000000000003',
        'maintenance', DATE '2026-06-04', NULL,
        '{"source":"G-533 test"}'::jsonb, NULL
      );

    ALTER TABLE goals.goal_phases
      ADD CONSTRAINT goal_phases_zielrate_passt_zur_art
      CHECK (
        (phase_type IN ('fat_loss', 'mini_cut')
          AND zielrate_pct_kg_woche IS NOT NULL
          AND zielrate_pct_kg_woche < 0)
        OR (phase_type = 'lean_bulk'
          AND zielrate_pct_kg_woche IS NOT NULL
          AND zielrate_pct_kg_woche > 0)
        OR (phase_type = 'maintenance'
          AND (zielrate_pct_kg_woche IS NULL
            OR abs(zielrate_pct_kg_woche) <= 0.1))
        OR (phase_type IN (
          'peak_week', 'expert_bb_annual', 'contest_prep',
          'reverse_diet', 'recomp'
        ) AND zielrate_pct_kg_woche IS NULL)
      ) NOT VALID;

    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (
      '53300000-0000-0000-0000-000000000001',
      DATE '2026-06-04', TIME '07:05', 83.74
    );

    DO $before$
    BEGIN
      BEGIN
        UPDATE goals.goal_phases
        SET actual_end_date = CURRENT_DATE
        WHERE id = '53300000-0000-0000-0000-000000000101';
        RAISE EXCEPTION 'Altzeile war vor G-533 beweglich';
      EXCEPTION WHEN check_violation THEN
        NULL;
      END;
    END
    $before$;
  `)

  const missingWeight = applyBackfill()
  assert.notEqual(missingWeight.status, 0)
  assert.match(
    `${missingWeight.stdout}${missingWeight.stderr}`,
    /Gewicht am gueltig_ab fehlt oder ist nicht eindeutig/,
  )

  psql(`
    INSERT INTO goals.body_measurements (
      user_id, measurement_date, measurement_time, weight_kg
    ) VALUES (
      '53300000-0000-0000-0000-000000000002',
      DATE '2026-06-04', TIME '07:05', 83.74
    );
  `)

  const applied = applyBackfill()
  assert.equal(applied.status, 0, `${applied.stdout}${applied.stderr}`)

  const movedRows = Number(psql(`
    WITH moved AS (
      UPDATE goals.goal_phases
      SET actual_end_date = CURRENT_DATE
      WHERE id IN (
        '53300000-0000-0000-0000-000000000101',
        '53300000-0000-0000-0000-000000000102'
      )
      RETURNING id
    )
    SELECT count(*)::integer FROM moved;
  `))

  const result = JSON.parse(psql(`
    SELECT json_build_object(
      'rates', (
        SELECT json_agg(zielrate_pct_kg_woche ORDER BY id)
        FROM goals.goal_phases
        WHERE id IN (
          '53300000-0000-0000-0000-000000000101',
          '53300000-0000-0000-0000-000000000102'
        )
      ),
      'legacyParameters', (
        SELECT count(*)::integer
        FROM goals.goal_phases
        WHERE parameters ? 'calorie_surplus_kcal'
      ),
      'maintenanceRate', (
        SELECT zielrate_pct_kg_woche
        FROM goals.goal_phases
        WHERE id = '53300000-0000-0000-0000-000000000103'
      ),
      'validated', (
        SELECT convalidated
        FROM pg_constraint
        WHERE conrelid = 'goals.goal_phases'::regclass
          AND conname = 'goal_phases_zielrate_passt_zur_art'
      )
    );
  `)) as {
    rates: number[]
    legacyParameters: number
    maintenanceRate: number | null
    validated: boolean
  }

  assert.deepEqual(result.rates, [0.271, 0.271])
  assert.equal(result.legacyParameters, 0)
  assert.equal(result.maintenanceRate, null)
  assert.equal(result.validated, true)
  assert.equal(movedRows, 2)

  const repeated = applyBackfill()
  assert.equal(repeated.status, 0, `${repeated.stdout}${repeated.stderr}`)
})
