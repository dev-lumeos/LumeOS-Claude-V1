import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C544_DATABASE
if (!db) throw new Error('C-544 braucht LUMEOS_C544_DATABASE.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  const payload = output.match(/\{[\s\S]*\}/)?.[0]
  if (!payload) throw new Error(`Kein JSON-Ergebnis: ${output}`)
  return JSON.parse(payload) as T
}

function failure(sql: string): string {
  try {
    execFileSync('docker', [
      'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
      '-c', sql,
    ], { encoding: 'utf8', stdio: 'pipe' })
  } catch (error) {
    const failed = error as { stdout?: string; stderr?: string }
    return `${failed.stdout ?? ''}\n${failed.stderr ?? ''}`
  }
  throw new Error('SQL sollte scheitern, war aber erfolgreich.')
}

test('C-544: ein Koerperort ist ein eigener Begriff mit mehrwertiger Muskelrelation', () => {
  const result = one<{
    locationsTable: boolean
    musclesTable: boolean
    injectionSiteLocationColumn: boolean
  }>(`
    SELECT json_build_object(
      'locationsTable', to_regclass('public.koerperorte') IS NOT NULL,
      'musclesTable', to_regclass('public.koerperort_muskeln') IS NOT NULL,
      'injectionSiteLocationColumn', EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'medical'
          AND table_name = 'injection_sites'
          AND column_name = 'koerperort_id'
      )
    );
  `)

  assert.deepEqual(result, {
    locationsTable: true,
    musclesTable: true,
    injectionSiteLocationColumn: true,
  })
})

test('C-544: alle 16 Bestandsstellen zeigen auf den belegten Zielort', () => {
  const result = one<{
    locations: number
    muscleLocations: number
    fatLocations: number
    landmarkLocations: number
    mappedSites: number
    intramuscularMuscleSites: number
    subcutaneousFatSites: number
    mapping: string[]
    originalRows: number
    originalFieldSignature: string
  }>(`
    SELECT json_build_object(
      'locations', (SELECT count(*) FROM public.koerperorte),
      'muscleLocations', (SELECT count(*) FROM public.koerperorte WHERE art = 'muskel'),
      'fatLocations', (SELECT count(*) FROM public.koerperorte WHERE art = 'fettdepot'),
      'landmarkLocations', (SELECT count(*) FROM public.koerperorte WHERE art = 'landmarke'),
      'mappedSites', (
        SELECT count(*) FROM medical.injection_sites WHERE koerperort_id IS NOT NULL
      ),
      'intramuscularMuscleSites', (
        SELECT count(*)
        FROM medical.injection_sites AS site
        JOIN public.koerperorte AS ort ON ort.id = site.koerperort_id
        WHERE site.route = 'im' AND ort.art = 'muskel'
      ),
      'subcutaneousFatSites', (
        SELECT count(*)
        FROM medical.injection_sites AS site
        JOIN public.koerperorte AS ort ON ort.id = site.koerperort_id
        WHERE site.route = 'sc' AND ort.art = 'fettdepot'
      ),
      'mapping', (
        SELECT json_agg(site.id || '=' || ort.code ORDER BY site.id)
        FROM medical.injection_sites AS site
        JOIN public.koerperorte AS ort ON ort.id = site.koerperort_id
      ),
      'originalRows', (SELECT count(*) FROM medical.injection_sites),
      'originalFieldSignature', (
        SELECT md5(
          jsonb_agg(
            to_jsonb(site) - ARRAY['created_at', 'updated_at', 'koerperort_id']
            ORDER BY site.id
          )::text
        )
        FROM medical.injection_sites AS site
      )
    );
  `)

  assert.deepEqual(result, {
    locations: 8,
    muscleLocations: 5,
    fatLocations: 3,
    landmarkLocations: 0,
    mappedSites: 16,
    intramuscularMuscleSites: 10,
    subcutaneousFatSites: 6,
    mapping: [
      'abd_l=abdominales-subkutanes-fett',
      'abd_r=abdominales-subkutanes-fett',
      'delt_l=deltoid-muskelregion',
      'delt_r=deltoid-muskelregion',
      'glute_l=dorsogluteale-muskelregion',
      'glute_r=dorsogluteale-muskelregion',
      'lat_l=latissimus-dorsi-muskelregion',
      'lat_r=latissimus-dorsi-muskelregion',
      'quad_l=vastus-lateralis-muskelregion',
      'quad_r=vastus-lateralis-muskelregion',
      'sq_delt_l=posteriores-oberarmfett',
      'sq_delt_r=posteriores-oberarmfett',
      'thigh_sq_l=anterolaterales-oberschenkelfett',
      'thigh_sq_r=anterolaterales-oberschenkelfett',
      'vglute_l=ventrogluteale-muskelregion',
      'vglute_r=ventrogluteale-muskelregion',
    ],
    originalRows: 16,
    originalFieldSignature: '82e0d88d47e2aa6e6a6c23bb4f209f49',
  })
})

test('C-544: Muskelorte sind mehrwertig, Fettdepots bleiben muskelfrei', () => {
  const result = one<{
    muscleLinks: number
    fatMuscleLinks: number
    aliasMuscleLinks: number
    links: string[]
  }>(`
    SELECT json_build_object(
      'muscleLinks', (SELECT count(*) FROM public.koerperort_muskeln),
      'fatMuscleLinks', (
        SELECT count(*)
        FROM public.koerperort_muskeln AS link
        JOIN public.koerperorte AS ort ON ort.id = link.koerperort_id
        WHERE ort.art = 'fettdepot'
      ),
      'aliasMuscleLinks', (
        SELECT count(*)
        FROM public.koerperort_muskeln AS link
        JOIN training.muscle_groups AS muscle ON muscle.id = link.muscle_group_id
        WHERE muscle.canonical_muscle_group_id IS NOT NULL
      ),
      'links', (
        SELECT json_agg(ort.code || '=' || muscle.name ORDER BY ort.code, muscle.name)
        FROM public.koerperort_muskeln AS link
        JOIN public.koerperorte AS ort ON ort.id = link.koerperort_id
        JOIN training.muscle_groups AS muscle ON muscle.id = link.muscle_group_id
      )
    );
  `)

  assert.deepEqual(result, {
    muscleLinks: 7,
    fatMuscleLinks: 0,
    aliasMuscleLinks: 0,
    links: [
      'deltoid-muskelregion=Deltoids',
      'dorsogluteale-muskelregion=Gluteus Maximus',
      'dorsogluteale-muskelregion=Gluteus Medius',
      'latissimus-dorsi-muskelregion=latissimus dorsi',
      'vastus-lateralis-muskelregion=Vastus Lateralis',
      'ventrogluteale-muskelregion=Gluteus Medius',
      'ventrogluteale-muskelregion=Gluteus Minimus',
    ],
  })
})

test('C-544: der Fremdschluessel ist verpflichtend und loeschsicher', () => {
  const result = one<{
    locationRequired: boolean
    foreignKeyExists: boolean
    deleteIsRestricted: boolean
  }>(`
    SELECT json_build_object(
      'locationRequired', (
        SELECT is_nullable = 'NO'
        FROM information_schema.columns
        WHERE table_schema = 'medical'
          AND table_name = 'injection_sites'
          AND column_name = 'koerperort_id'
      ),
      'foreignKeyExists', EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'medical.injection_sites'::regclass
          AND conname = 'injection_sites_koerperort_fk'
          AND contype = 'f'
      ),
      'deleteIsRestricted', EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conrelid = 'medical.injection_sites'::regclass
          AND conname = 'injection_sites_koerperort_fk'
          AND confdeltype = 'r'
      )
    );
  `)

  assert.deepEqual(result, {
    locationRequired: true,
    foreignKeyExists: true,
    deleteIsRestricted: true,
  })
})

test('C-544: der gemeinsame Katalog ist nur angemeldet lesbar', () => {
  const result = one<{
    locationsRls: boolean
    musclesRls: boolean
    anonLocationsSelect: boolean
    anonMusclesSelect: boolean
    authenticatedLocationsSelect: boolean
    authenticatedMusclesSelect: boolean
    authenticatedLocationsWrite: boolean
    authenticatedMusclesWrite: boolean
    serviceLocationsAll: boolean
    serviceMusclesAll: boolean
    policies: string[]
  }>(`
    SELECT json_build_object(
      'locationsRls', (
        SELECT relrowsecurity FROM pg_class WHERE oid = 'public.koerperorte'::regclass
      ),
      'musclesRls', (
        SELECT relrowsecurity FROM pg_class WHERE oid = 'public.koerperort_muskeln'::regclass
      ),
      'anonLocationsSelect', has_table_privilege('anon', 'public.koerperorte', 'SELECT'),
      'anonMusclesSelect', has_table_privilege('anon', 'public.koerperort_muskeln', 'SELECT'),
      'authenticatedLocationsSelect', has_table_privilege('authenticated', 'public.koerperorte', 'SELECT'),
      'authenticatedMusclesSelect', has_table_privilege('authenticated', 'public.koerperort_muskeln', 'SELECT'),
      'authenticatedLocationsWrite', has_table_privilege('authenticated', 'public.koerperorte', 'INSERT,UPDATE,DELETE,TRUNCATE'),
      'authenticatedMusclesWrite', has_table_privilege('authenticated', 'public.koerperort_muskeln', 'INSERT,UPDATE,DELETE,TRUNCATE'),
      'serviceLocationsAll', has_table_privilege('service_role', 'public.koerperorte', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'),
      'serviceMusclesAll', has_table_privilege('service_role', 'public.koerperort_muskeln', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'),
      'policies', (
        SELECT json_agg(tablename || ':' || policyname || ':' || cmd ORDER BY tablename, policyname)
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('koerperorte', 'koerperort_muskeln')
      )
    );
  `)

  assert.deepEqual(result, {
    locationsRls: true,
    musclesRls: true,
    anonLocationsSelect: false,
    anonMusclesSelect: false,
    authenticatedLocationsSelect: true,
    authenticatedMusclesSelect: true,
    authenticatedLocationsWrite: false,
    authenticatedMusclesWrite: false,
    serviceLocationsAll: true,
    serviceMusclesAll: true,
    policies: [
      'koerperort_muskeln:koerperort_muskeln_select:SELECT',
      'koerperorte:koerperorte_select:SELECT',
    ],
  })
})

test('C-544: authenticated kann beide Katalogtabellen wirklich lesen', () => {
  const result = one<{ locations: number; muscleLinks: number }>(`
    BEGIN;
    SET LOCAL ROLE authenticated;
    SELECT json_build_object(
      'locations', (SELECT count(*) FROM public.koerperorte),
      'muscleLinks', (SELECT count(*) FROM public.koerperort_muskeln)
    );
    ROLLBACK;
  `)

  assert.deepEqual(result, { locations: 8, muscleLinks: 7 })
})

test('C-544: ein Fettdepot kann technisch keine Muskelrelation bekommen', () => {
  const message = failure(`
    BEGIN;
    INSERT INTO public.koerperort_muskeln (koerperort_id, muscle_group_id)
    SELECT ort.id, muscle.id
    FROM public.koerperorte AS ort
    CROSS JOIN training.muscle_groups AS muscle
    WHERE ort.art = 'fettdepot'
      AND muscle.canonical_muscle_group_id IS NULL
    ORDER BY ort.code, muscle.name
    LIMIT 1;
    ROLLBACK;
  `)

  assert.match(message, /koerperort_muskeln_ort_fk/)
})
