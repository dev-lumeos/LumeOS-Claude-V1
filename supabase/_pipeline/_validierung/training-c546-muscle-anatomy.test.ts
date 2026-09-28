import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C546_DATABASE
if (!db) throw new Error('C-546 braucht LUMEOS_C546_DATABASE.')
const expectedCheckins = process.env.LUMEOS_C546_EXPECTED_CHECKINS

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-546: jede anatomische Eigenschaft hat eine eigene Relation', () => {
  const result = one<{
    tables: string[]
    factTablesWithUser: number
    observationFields: string[]
  }>(`
    SELECT json_build_object(
      'tables', (
        SELECT json_agg(table_schema || '.' || table_name ORDER BY table_schema, table_name)
        FROM information_schema.tables
        WHERE (table_schema, table_name) IN (
          ('training', 'anatomy_sources'),
          ('training', 'muscle_origins'),
          ('training', 'muscle_insertions'),
          ('training', 'muscle_innervations'),
          ('training', 'muscle_pain_referrals'),
          ('recovery', 'muscle_symptom_observations')
        )
      ),
      'factTablesWithUser', (
        SELECT count(*)
        FROM information_schema.columns
        WHERE table_schema = 'training'
          AND table_name IN (
            'muscle_origins',
            'muscle_insertions',
            'muscle_innervations',
            'muscle_pain_referrals'
          )
          AND column_name IN ('user_id', 'observed_at', 'severity')
      ),
      'observationFields', (
        SELECT json_agg(column_name ORDER BY column_name)
        FROM information_schema.columns
        WHERE table_schema = 'recovery'
          AND table_name = 'muscle_symptom_observations'
          AND column_name IN (
            'user_id',
            'muscle_group_id',
            'observed_at',
            'symptom_type',
            'severity',
            'anatomical_focus'
          )
      )
    );
  `)

  assert.deepEqual(result.tables, [
    'recovery.muscle_symptom_observations',
    'training.anatomy_sources',
    'training.muscle_innervations',
    'training.muscle_insertions',
    'training.muscle_origins',
    'training.muscle_pain_referrals',
  ])
  assert.equal(result.factTablesWithUser, 0)
  assert.deepEqual(result.observationFields, [
    'anatomical_focus',
    'muscle_group_id',
    'observed_at',
    'severity',
    'symptom_type',
    'user_id',
  ])
})

test('C-546: nur belegte kanonische Muskeln tragen Fakten', () => {
  const result = one<{
    catalog: number
    canonical: number
    leaves: number
    covered: number
    uncovered: number
    origins: number
    insertions: number
    innervations: number
    referrals: number
    aliasFacts: number
    emptyFacts: number
    unreferencedSources: number
  }>(`
    WITH facts AS (
      SELECT muscle_group_id, source_id, attachment_site AS statement
      FROM training.muscle_origins
      UNION ALL
      SELECT muscle_group_id, source_id, attachment_site
      FROM training.muscle_insertions
      UNION ALL
      SELECT muscle_group_id, source_id, nerve_name
      FROM training.muscle_innervations
      UNION ALL
      SELECT muscle_group_id, source_id, referred_area
      FROM training.muscle_pain_referrals
    ), covered AS (
      SELECT DISTINCT muscle_group_id FROM facts
    )
    SELECT json_build_object(
      'catalog', (SELECT count(*) FROM training.muscle_groups),
      'canonical', (
        SELECT count(*) FROM training.muscle_groups
        WHERE canonical_muscle_group_id IS NULL
      ),
      'leaves', (
        SELECT count(*)
        FROM training.muscle_groups AS muscle
        WHERE muscle.canonical_muscle_group_id IS NULL
          AND NOT EXISTS (
            SELECT 1 FROM training.muscle_groups AS child
            WHERE child.parent_id = muscle.id
              AND child.canonical_muscle_group_id IS NULL
          )
      ),
      'covered', (SELECT count(*) FROM covered),
      'uncovered', 112 - (SELECT count(*) FROM covered),
      'origins', (SELECT count(*) FROM training.muscle_origins),
      'insertions', (SELECT count(*) FROM training.muscle_insertions),
      'innervations', (SELECT count(*) FROM training.muscle_innervations),
      'referrals', (SELECT count(*) FROM training.muscle_pain_referrals),
      'aliasFacts', (
        SELECT count(*)
        FROM facts
        JOIN training.muscle_groups AS muscle ON muscle.id = facts.muscle_group_id
        WHERE muscle.canonical_muscle_group_id IS NOT NULL
      ),
      'emptyFacts', (
        SELECT count(*) FROM facts
        WHERE btrim(statement) = '' OR btrim(source_id) = ''
      ),
      'unreferencedSources', (
        SELECT count(*)
        FROM facts
        LEFT JOIN training.anatomy_sources AS source ON source.id = facts.source_id
        WHERE source.id IS NULL
      )
    );
  `)

  assert.deepEqual(result, {
    catalog: 112,
    canonical: 108,
    leaves: 77,
    covered: 23,
    uncovered: 89,
    origins: 20,
    insertions: 21,
    innervations: 23,
    referrals: 0,
    aliasFacts: 0,
    emptyFacts: 0,
    unreferencedSources: 0,
  })
})

test('C-546: Vastus medialis ist belegt, ein unbelegter Muskel bleibt leer', () => {
  const result = one<{
    vastus: { origins: number; insertions: number; innervations: number }
    brachioradialis: { origins: number; insertions: number; innervations: number; referrals: number }
  }>(`
    SELECT json_build_object(
      'vastus', json_build_object(
        'origins', (SELECT count(*) FROM training.muscle_origins o JOIN training.muscle_groups m ON m.id = o.muscle_group_id WHERE m.name = 'Vastus Medialis'),
        'insertions', (SELECT count(*) FROM training.muscle_insertions i JOIN training.muscle_groups m ON m.id = i.muscle_group_id WHERE m.name = 'Vastus Medialis'),
        'innervations', (SELECT count(*) FROM training.muscle_innervations n JOIN training.muscle_groups m ON m.id = n.muscle_group_id WHERE m.name = 'Vastus Medialis')
      ),
      'brachioradialis', json_build_object(
        'origins', (SELECT count(*) FROM training.muscle_origins o JOIN training.muscle_groups m ON m.id = o.muscle_group_id WHERE m.name = 'Brachioradialis'),
        'insertions', (SELECT count(*) FROM training.muscle_insertions i JOIN training.muscle_groups m ON m.id = i.muscle_group_id WHERE m.name = 'Brachioradialis'),
        'innervations', (SELECT count(*) FROM training.muscle_innervations n JOIN training.muscle_groups m ON m.id = n.muscle_group_id WHERE m.name = 'Brachioradialis'),
        'referrals', (SELECT count(*) FROM training.muscle_pain_referrals p JOIN training.muscle_groups m ON m.id = p.muscle_group_id WHERE m.name = 'Brachioradialis')
      )
    );
  `)

  assert.deepEqual(result.vastus, { origins: 1, insertions: 1, innervations: 1 })
  assert.deepEqual(result.brachioradialis, { origins: 0, insertions: 0, innervations: 0, referrals: 0 })
})

test('C-546: bestehende freie Check-ins werden nicht als anatomische Fakten umgedeutet', () => {
  const result = one<{ checkins: number; nonemptyPainAreas: number; observations: number }>(`
    SELECT json_build_object(
      'checkins', (SELECT count(*) FROM recovery.checkins),
      'nonemptyPainAreas', (
        SELECT count(*) FROM recovery.checkins
        WHERE coalesce(cardinality(pain_areas), 0) > 0
      ),
      'observations', (SELECT count(*) FROM recovery.muscle_symptom_observations)
    );
  `)

  if (expectedCheckins !== undefined) {
    assert.equal(result.checkins, Number(expectedCheckins))
  }
  assert.equal(result.nonemptyPainAreas, 0)
  assert.equal(result.observations, 0)
})

test('C-546: Fakten sind lesbar, Beobachtungen bleiben nutzereigen', () => {
  const result = one<{
    anonFactSelect: boolean
    authenticatedFactSelect: boolean
    authenticatedFactInsert: boolean
    anonObservationSelect: boolean
    authenticatedObservationCrud: boolean
    observationRls: boolean
    authenticatedTrainingUsage: boolean
    authenticatedRecoveryUsage: boolean
  }>(`
    SELECT json_build_object(
      'anonFactSelect', has_table_privilege('anon', 'training.muscle_origins', 'SELECT'),
      'authenticatedFactSelect', has_table_privilege('authenticated', 'training.muscle_origins', 'SELECT'),
      'authenticatedFactInsert', has_table_privilege('authenticated', 'training.muscle_origins', 'INSERT'),
      'anonObservationSelect', has_table_privilege('anon', 'recovery.muscle_symptom_observations', 'SELECT'),
      'authenticatedObservationCrud', has_table_privilege(
        'authenticated',
        'recovery.muscle_symptom_observations',
        'SELECT,INSERT,UPDATE,DELETE'
      ),
      'observationRls', (
        SELECT relrowsecurity
        FROM pg_class
        WHERE oid = 'recovery.muscle_symptom_observations'::regclass
      ),
      'authenticatedTrainingUsage', has_schema_privilege('authenticated', 'training', 'USAGE'),
      'authenticatedRecoveryUsage', has_schema_privilege('authenticated', 'recovery', 'USAGE')
    );
  `)

  assert.deepEqual(result, {
    anonFactSelect: false,
    authenticatedFactSelect: true,
    authenticatedFactInsert: false,
    anonObservationSelect: false,
    authenticatedObservationCrud: true,
    observationRls: true,
    authenticatedTrainingUsage: true,
    authenticatedRecoveryUsage: true,
  })
})

test('C-546: RLS isoliert Beobachtungen auch im Verhalten', () => {
  const result = one<{
    visibleOwn: number
    visibleForeign: number
    readableFacts: number
  }>(`
    BEGIN;

    INSERT INTO auth.users (id, email)
    VALUES
      ('54600000-0000-4000-8000-000000000001', 'c546-a@example.invalid'),
      ('54600000-0000-4000-8000-000000000002', 'c546-b@example.invalid');

    WITH muscle AS (
      SELECT id FROM training.muscle_groups
      WHERE name = 'Vastus Medialis'
    )
    INSERT INTO recovery.muscle_symptom_observations (
      user_id, muscle_group_id, observed_at,
      symptom_type, severity, anatomical_focus
    )
    SELECT user_id, muscle.id, now(), 'pain', 4, 'muscle_belly'
    FROM muscle
    CROSS JOIN (VALUES
      ('54600000-0000-4000-8000-000000000001'::uuid),
      ('54600000-0000-4000-8000-000000000002'::uuid)
    ) AS users(user_id);

    SET LOCAL ROLE authenticated;
    SELECT set_config(
      'request.jwt.claim.sub',
      '54600000-0000-4000-8000-000000000001',
      true
    );

    WITH muscle AS (
      SELECT id FROM training.muscle_groups
      WHERE name = 'Vastus Medialis'
    )
    INSERT INTO recovery.muscle_symptom_observations (
      user_id, muscle_group_id, observed_at,
      symptom_type, severity, anatomical_focus
    )
    SELECT
      '54600000-0000-4000-8000-000000000001'::uuid,
      muscle.id,
      now(),
      'soreness',
      2,
      'unknown'
    FROM muscle;

    DO $block$
    BEGIN
      BEGIN
        INSERT INTO recovery.muscle_symptom_observations (
          user_id, muscle_group_id, observed_at,
          symptom_type, severity, anatomical_focus
        )
        SELECT
          '54600000-0000-4000-8000-000000000002'::uuid,
          id,
          now(),
          'pain',
          9,
          'unknown'
        FROM training.muscle_groups
        WHERE name = 'Vastus Medialis';
        RAISE EXCEPTION 'C-546: foreign observation insert was accepted';
      EXCEPTION
        WHEN insufficient_privilege THEN NULL;
      END;
    END
    $block$;

    SELECT json_build_object(
      'visibleOwn', count(*) FILTER (
        WHERE user_id = '54600000-0000-4000-8000-000000000001'::uuid
      ),
      'visibleForeign', count(*) FILTER (
        WHERE user_id = '54600000-0000-4000-8000-000000000002'::uuid
      ),
      'readableFacts', (SELECT count(*) FROM training.muscle_origins)
    )
    FROM recovery.muscle_symptom_observations;

    ROLLBACK;
  `)

  assert.deepEqual(result, {
    visibleOwn: 2,
    visibleForeign: 0,
    readableFacts: 20,
  })
})
