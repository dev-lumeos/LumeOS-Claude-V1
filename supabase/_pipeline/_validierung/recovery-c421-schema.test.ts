import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE
if (!DB || DB === 'postgres') throw new Error('C-421-Test braucht eine explizite Wegwerf-Datenbank, nie postgres.')

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER, 'psql', '-X', '-q', '-U', 'postgres', '-d', DB, '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()) as T
}

test('C-421: die vier Recovery-Lesegrundlagen und die G-367-Plattformsicht existieren mit RLS', () => {
  const result = one<{
    tables: string[]
    rls: Record<string, boolean>
    muscleView: boolean
    muscleViewSecurityInvoker: boolean
  }>(`
    SELECT json_build_object(
      'tables', (
        SELECT json_agg(c.relname ORDER BY c.relname)
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'recovery'
          AND c.relkind = 'r'
          AND c.relname IN ('overtraining_alerts', 'recovery_protocols', 'score_contributions', 'stress_logs')
      ),
      'rls', (
        SELECT json_object_agg(c.relname, c.relrowsecurity)
        FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'recovery'
          AND c.relkind = 'r'
          AND c.relname IN ('overtraining_alerts', 'recovery_protocols', 'score_contributions', 'stress_logs')
      ),
      'muscleView', to_regclass('public.muscle_training_loads') IS NOT NULL,
      'muscleViewSecurityInvoker', (
        SELECT 'security_invoker=true' = ANY(c.reloptions)
        FROM pg_class c
        WHERE c.oid = to_regclass('public.muscle_training_loads')
      )
    );
  `)

  assert.deepEqual(result.tables, [
    'overtraining_alerts', 'recovery_protocols', 'score_contributions', 'stress_logs',
  ])
  assert.deepEqual(result.rls, {
    overtraining_alerts: true,
    recovery_protocols: true,
    score_contributions: true,
    stress_logs: true,
  })
  assert.equal(result.muscleView, true)
  assert.equal(result.muscleViewSecurityInvoker, true)
})
