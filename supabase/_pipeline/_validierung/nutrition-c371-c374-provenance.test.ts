// C-371/C-374/C-375: Rezept- und Planherkunft sind eigene Fachdaten;
// measurement_source bleibt davon getrennt.
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const CONTAINER = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const DB = process.env.PGDATABASE ?? 'postgres'

function one<T>(sql: string): T {
  return JSON.parse(execFileSync('docker', [
    'exec', CONTAINER,
    'psql', '-X', '-q', '-U', 'postgres', '-d', DB,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim()) as T
}

test('C-371/C-374/C-375: Herkunft und Weiterverkaufsrecht sind als Schema vorbereitet', () => {
  const result = one<{
    recipeSource: { nullable: string; defaultExpression: string | null } | null
    recipeSourceCheck: string | null
    planOriginCheck: string | null
    resaleColumns: Array<{ tableName: string; nullable: string; defaultExpression: string | null }>
    legacy: { recipesWithoutUserSource: number; plansWithInvalidOrigin: number; rowsWithoutResalePermission: number }
    rls: Array<{ tableName: string; enabled: boolean }>
  }>(`
    SELECT json_build_object(
      'recipeSource', (
        SELECT json_build_object(
          'nullable', c.is_nullable,
          'defaultExpression', pg_get_expr(d.adbin, d.adrelid)
        )
        FROM information_schema.columns c
        LEFT JOIN pg_attribute a
          ON a.attrelid = 'nutrition.recipes'::regclass AND a.attname = c.column_name
        LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
        WHERE c.table_schema = 'nutrition' AND c.table_name = 'recipes' AND c.column_name = 'source'
      ),
      'recipeSourceCheck', (
        SELECT pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        WHERE c.conrelid = 'nutrition.recipes'::regclass AND c.conname = 'recipes_source_check'
      ),
      'planOriginCheck', (
        SELECT pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        WHERE c.conrelid = 'nutrition.meal_plans'::regclass AND c.conname = 'meal_plans_plan_origin_check'
      ),
      'resaleColumns', (
        SELECT COALESCE(json_agg(json_build_object(
          'tableName', c.table_name,
          'nullable', c.is_nullable,
          'defaultExpression', pg_get_expr(d.adbin, d.adrelid)
        ) ORDER BY c.table_name), '[]'::json)
        FROM information_schema.columns c
        LEFT JOIN pg_attribute a
          ON a.attrelid = format('%I.%I', c.table_schema, c.table_name)::regclass
         AND a.attname = c.column_name
        LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
        WHERE c.table_schema = 'nutrition' AND c.table_name IN ('meal_plans', 'recipes')
          AND c.column_name = 'darf_weiterverkaufen'
      ),
      'legacy', json_build_object(
        'recipesWithoutUserSource', (SELECT count(*) FROM nutrition.recipes WHERE source IS DISTINCT FROM 'user'),
        'plansWithInvalidOrigin', (SELECT count(*) FROM nutrition.meal_plans
          WHERE plan_origin IS NOT NULL
            AND plan_origin NOT IN ('self_created', 'coach_created', 'marketplace', 'buddy')),
        'rowsWithoutResalePermission', (
          (SELECT count(*) FROM nutrition.recipes WHERE NOT darf_weiterverkaufen)
          + (SELECT count(*) FROM nutrition.meal_plans WHERE NOT darf_weiterverkaufen)
        )
      ),
      'rls', (
        SELECT json_agg(json_build_object('tableName', tablename, 'enabled', rowsecurity) ORDER BY tablename)
        FROM pg_tables
        WHERE schemaname = 'nutrition' AND tablename IN ('meal_plans', 'recipes')
      )
    );
  `)

  assert.deepEqual(result.recipeSource, { nullable: 'NO', defaultExpression: "'user'::text" })
  assert.match(result.recipeSourceCheck ?? '', /user.*coach.*marketplace.*buddy/)
  assert.match(result.planOriginCheck ?? '', /self_created.*coach_created.*marketplace.*buddy/)
  assert.deepEqual(result.resaleColumns, [
    { tableName: 'meal_plans', nullable: 'NO', defaultExpression: 'true' },
    { tableName: 'recipes', nullable: 'NO', defaultExpression: 'true' },
  ])
  assert.deepEqual(result.legacy, {
    recipesWithoutUserSource: 0,
    plansWithInvalidOrigin: 0,
    rowsWithoutResalePermission: 0,
  })
  assert.deepEqual(result.rls, [
    { tableName: 'meal_plans', enabled: true },
    { tableName: 'recipes', enabled: true },
  ])
})
