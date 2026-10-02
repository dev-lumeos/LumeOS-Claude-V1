import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.PGDATABASE
if (!db || db === 'postgres') throw new Error('C-541 braucht eine Wegwerf-Datenbank.')

function psql(sql: string): string {
  const result = spawnSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(result.stderr.trim())
  return result.stdout.trim()
}

function one<T>(sql: string): T {
  const out = psql(sql)
  return JSON.parse(out.split(/\r?\n/).at(-1) ?? '') as T
}

test('C-541: experience_level is required without a column default', () => {
  const result = one<{
    nullable: string
    columnDefault: string | null
    nullRows: number
    allowedValues: boolean
  }>(`SELECT json_build_object(
    'nullable', (
      SELECT is_nullable FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
        AND column_name = 'experience_level'
    ),
    'columnDefault', (
      SELECT column_default FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'profiles'
        AND column_name = 'experience_level'
    ),
    'nullRows', (SELECT count(*) FROM public.profiles WHERE experience_level IS NULL),
    'allowedValues', (
      SELECT pg_get_constraintdef(oid) LIKE '%beginner%advanced%pro%elite%'
      FROM pg_constraint
      WHERE conrelid = 'public.profiles'::regclass
        AND conname = 'profiles_experience_level_check'
    )
  );`)

  assert.deepEqual(result, {
    nullable: 'NO', columnDefault: null, nullRows: 0, allowedValues: true,
  })
})

test('C-541: the auth trigger creates a conservative beginner profile', () => {
  const result = one<{ level: string | null }>(`BEGIN;
    INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
    VALUES ('54100000-0000-0000-0000-000000000001', 'c541-trigger@example.test', '{}'::jsonb, now());
    SELECT json_build_object('level', experience_level)
    FROM public.profiles
    WHERE id = '54100000-0000-0000-0000-000000000001';
    ROLLBACK;`)

  assert.equal(result.level, 'beginner')
})

test('C-541: an ordinary profile insert without a level fails', () => {
  assert.throws(
    () => psql(`BEGIN;
      INSERT INTO auth.users (id, email, raw_app_meta_data, created_at)
      VALUES ('54100000-0000-0000-0000-000000000002', 'c541-direct@example.test', '{}'::jsonb, now());
      DELETE FROM public.profiles WHERE id = '54100000-0000-0000-0000-000000000002';
      INSERT INTO public.profiles (id)
      VALUES ('54100000-0000-0000-0000-000000000002');
      ROLLBACK;`),
    /null value in column "experience_level".*violates not-null constraint/s,
  )
})
