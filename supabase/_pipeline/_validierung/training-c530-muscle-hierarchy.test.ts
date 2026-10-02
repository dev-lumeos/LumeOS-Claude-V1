import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-530 braucht PGDATABASE.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

test('C-530: Aliaszeilen bleiben erhalten und zeigen strukturiert auf ihr kanonisches Ziel', () => {
  const result = one<{
    aliasColumn: boolean
    aliases: number
    aliasMappings: number
  }>(`
    SELECT json_build_object(
      'aliasColumn', EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'training' AND table_name = 'muscle_groups'
          AND column_name = 'canonical_muscle_group_id'
      ),
      'aliases', (
        SELECT count(*)
        FROM training.muscle_groups old_group
        JOIN training.muscle_groups canonical ON canonical.id = old_group.canonical_muscle_group_id
        WHERE (old_group.name, canonical.name) IN (
          ('Upper Chest', 'Clavicular Head of Pectoralis Major'),
          ('Abductors', 'Hip Abductors'),
          ('Hip Adductors', 'Adductors'),
          ('Peroneals', 'Fibularis Muscles')
        )
      ),
      'aliasMappings', (
        SELECT count(*)
        FROM training.exercise_muscles em
        JOIN training.muscle_groups old_group ON old_group.id = em.muscle_group_id
        WHERE old_group.canonical_muscle_group_id IS NOT NULL
      )
    );
  `)

  assert.deepEqual(result, { aliasColumn: true, aliases: 4, aliasMappings: 0 })
})

test('C-530: kein Uebungs-Muskel-Paar steht doppelt; Wadenheben hat eine Fibularis-Zuordnung', () => {
  const result = one<{
    duplicateEffectiveMappings: number
    calfFibularisMappings: number
    calfPeroneusBrevisMappings: number
  }>(`
    SELECT json_build_object(
      'duplicateEffectiveMappings', (
        SELECT count(*)
        FROM (
          SELECT em.exercise_id,
                 coalesce(mg.canonical_muscle_group_id, mg.id) AS effective_muscle_id,
                 em.role
          FROM training.exercise_muscles em
          JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
          GROUP BY em.exercise_id, coalesce(mg.canonical_muscle_group_id, mg.id), em.role
          HAVING count(*) > 1
        ) duplicates
      ),
      'calfFibularisMappings', (
        SELECT count(*)
        FROM training.exercise_muscles em
        JOIN training.exercises e ON e.id = em.exercise_id
        JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
        WHERE e.name = 'Bodyweight standing calf raise'
          AND mg.name = 'Fibularis Muscles'
          AND em.role = 'secondary'
      ),
      'calfPeroneusBrevisMappings', (
        SELECT count(*)
        FROM training.exercise_muscles em
        JOIN training.exercises e ON e.id = em.exercise_id
        JOIN training.muscle_groups mg ON mg.id = em.muscle_group_id
        WHERE e.name = 'Bodyweight standing calf raise'
          AND mg.name = 'Peroneus Brevis'
          AND em.role = 'secondary'
      )
    );
  `)

  assert.deepEqual(result, {
    duplicateEffectiveMappings: 0,
    calfFibularisMappings: 1,
    calfPeroneusBrevisMappings: 0,
  })
})

test('C-530: fachliche Kinder und geerbte Recovery-Profile sind vollstaendig', () => {
  const result = one<{
    expectedParents: number
    expectedProfiles: number
    technicalNames: number
  }>(`
    WITH expected(child_name, parent_name) AS (VALUES
      ('Vastus Intermedius', 'Quadriceps'),
      ('Supraspinatus', 'Rotator Cuff'),
      ('Fibularis Longus', 'Fibularis Muscles'),
      ('Gracilis', 'Adductors'),
      ('Pectoralis Minor', 'Chest'),
      ('Abdominal Part of Pectoralis Major', 'Pectoralis Major'),
      ('Lateral Deltoid', 'Deltoids'),
      ('Clavicular Head of Pectoralis Major', 'Pectoralis Major'),
      ('Sternocostal Head of Pectoralis Major', 'Pectoralis Major'),
      ('Anterior Deltoid', 'Deltoids'),
      ('Posterior Deltoid', 'Deltoids'),
      ('Peroneus Brevis', 'Fibularis Muscles'),
      ('Anterior Tibialis', 'Tibialis'),
      ('Tibialis Posterior', 'Tibialis')
    )
    SELECT json_build_object(
      'expectedParents', (
        SELECT count(*)
        FROM expected x
        JOIN training.muscle_groups child ON child.name = x.child_name
        JOIN training.muscle_groups parent ON parent.id = child.parent_id AND parent.name = x.parent_name
      ),
      'expectedProfiles', (
        SELECT count(*)
        FROM expected x
        JOIN training.muscle_groups child ON child.name = x.child_name
        JOIN recovery.muscle_recovery_profiles profile ON profile.muscle_group_id = child.id
      ),
      'technicalNames', (
        SELECT count(*)
        FROM training.muscle_groups
        WHERE (name, name_display_en) IN (
          ('Anterior Deltoid', 'Front shoulders'),
          ('Posterior Deltoid', 'Rear deltoids'),
          ('Lateral Deltoid', 'Side deltoid'),
          ('Clavicular Head of Pectoralis Major', 'Upper chest'),
          ('Sternocostal Head of Pectoralis Major', 'Middle chest'),
          ('Abdominal Part of Pectoralis Major', 'Lower chest')
        )
      )
    );
  `)

  assert.deepEqual(result, { expectedParents: 14, expectedProfiles: 14, technicalNames: 6 })
})

test('C-530: keine Koerperflaeche verliert ihre Muskelgruppe', () => {
  const result = one<{ missingMuscleLinks: number; flankeStillOpen: boolean }>(`
    SELECT json_build_object(
      'missingMuscleLinks', count(*) FILTER (WHERE k.muscle_group_id IS NOT NULL AND mg.id IS NULL),
      'flankeStillOpen', EXISTS (
        SELECT 1 FROM public.koerperflaechen WHERE code = 'flanke' AND muscle_group_id IS NULL
      )
    )
    FROM public.koerperflaechen k
    LEFT JOIN training.muscle_groups mg ON mg.id = k.muscle_group_id;
  `)

  assert.deepEqual(result, { missingMuscleLinks: 0, flankeStillOpen: true })
})
