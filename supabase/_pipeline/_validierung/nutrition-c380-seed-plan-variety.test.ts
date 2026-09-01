// C-380: Die drei Dev-Seed-Pläne bleiben vier Mahlzeiten pro Tag,
// treffen ihre Zielgrößen plausibel und fallen nicht auf ein Lebensmittel zurück.
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

type Plan = {
  name: string
  entries: number
  days: number
  entriesPerDay: number[]
  hammelEntries: number
  distinctFoods: number
  distinctDailyMenus: number
  kcalDeltaMax: number
  proteinDeltaMax: number
}

test('C-380: drei Seed-Pläne sind abwechslungsreich und plausibel zum Ziel befüllt', () => {
  const plans = one<Plan[]>(`
    WITH target_plans AS (
      SELECT mp.id, mp.name, mp.target_kcal, mp.target_protein_g
      FROM nutrition.meal_plans mp
      JOIN auth.users u ON u.id = mp.user_id
      WHERE u.email = 'dev@lumeos.app'
        AND mp.name IN ('Cut 4-Meal 2200', 'Lean bulk 3100', 'Buddy auto-plan')
    ), daily AS (
      SELECT tp.id AS plan_id, d.id AS day_id,
             sum(snap.enercc) AS kcal, sum(snap.prot625) AS protein,
             string_agg(f.bls_code || ':' || e.amount_g::text, ',' ORDER BY e.meal_type, e.slot_order) AS menu
      FROM target_plans tp
      JOIN nutrition.meal_plan_weeks w ON w.plan_id = tp.id
      JOIN nutrition.meal_plan_days d ON d.week_id = w.id
      JOIN nutrition.meal_plan_entries e ON e.day_id = d.id
      JOIN nutrition.foods f ON f.id = e.food_id
      CROSS JOIN LATERAL nutrition.food_nutrient_snapshot('bls', f.id, NULL, e.amount_g) snap
      GROUP BY tp.id, d.id
    )
    SELECT coalesce(json_agg(json_build_object(
      'name', tp.name,
      'entries', (SELECT count(*) FROM nutrition.meal_plan_weeks w
                  JOIN nutrition.meal_plan_days d ON d.week_id = w.id
                  JOIN nutrition.meal_plan_entries e ON e.day_id = d.id
                  WHERE w.plan_id = tp.id),
      'days', (SELECT count(*) FROM daily WHERE plan_id = tp.id),
      'entriesPerDay', (SELECT json_agg(c.entry_count ORDER BY c.day_id) FROM (
        SELECT d.id AS day_id, count(*)::integer AS entry_count
        FROM nutrition.meal_plan_weeks w
        JOIN nutrition.meal_plan_days d ON d.week_id = w.id
        JOIN nutrition.meal_plan_entries e ON e.day_id = d.id
        WHERE w.plan_id = tp.id
        GROUP BY d.id
      ) c),
      'hammelEntries', (SELECT count(*) FROM nutrition.meal_plan_weeks w
                        JOIN nutrition.meal_plan_days d ON d.week_id = w.id
                        JOIN nutrition.meal_plan_entries e ON e.day_id = d.id
                        JOIN nutrition.foods f ON f.id = e.food_id
                        WHERE w.plan_id = tp.id AND f.bls_code = 'U816172'),
      'distinctFoods', (SELECT count(DISTINCT e.food_id) FROM nutrition.meal_plan_weeks w
                        JOIN nutrition.meal_plan_days d ON d.week_id = w.id
                        JOIN nutrition.meal_plan_entries e ON e.day_id = d.id
                        WHERE w.plan_id = tp.id),
      'distinctDailyMenus', (SELECT count(DISTINCT menu) FROM daily WHERE plan_id = tp.id),
      'kcalDeltaMax', (SELECT max(abs(kcal - tp.target_kcal)) FROM daily WHERE plan_id = tp.id),
      'proteinDeltaMax', (SELECT max(abs(protein - tp.target_protein_g)) FROM daily WHERE plan_id = tp.id)
    ) ORDER BY tp.name), '[]'::json)
    FROM target_plans tp;
  `)

  assert.equal(plans.length, 3)
  for (const plan of plans) {
    assert.equal(plan.entries, 28, `${plan.name}: 28 Positionen`)
    assert.equal(plan.days, 7, `${plan.name}: sieben Tage`)
    assert.deepEqual(plan.entriesPerDay, [4, 4, 4, 4, 4, 4, 4], `${plan.name}: vier Mahlzeiten je Tag`)
    assert.equal(plan.hammelEntries, 0, `${plan.name}: kein Hammelfilet`)
    assert.ok(plan.distinctFoods >= 10, `${plan.name}: mindestens zehn Lebensmittel`)
    assert.equal(plan.distinctDailyMenus, 7, `${plan.name}: kein wiederholter Tag`)
    assert.ok(plan.kcalDeltaMax <= 120, `${plan.name}: höchstens 120 kcal vom Ziel entfernt`)
    assert.ok(plan.proteinDeltaMax <= 25, `${plan.name}: höchstens 25 g Protein vom Ziel entfernt`)
  }
})
