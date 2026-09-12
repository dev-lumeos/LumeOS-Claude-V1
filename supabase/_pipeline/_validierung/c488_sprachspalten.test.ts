import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import test from 'node:test'

const container = process.env.LUMEOS_DB_CONTAINER ?? 'supabase_db_LumeOS-Claude-V1'
const db = process.env.LUMEOS_C488_DATABASE
if (!db || db === 'postgres') throw new Error('C-488 braucht LUMEOS_C488_DATABASE als Wegwerf-Datenbank.')

function one<T>(sql: string): T {
  const output = execFileSync('docker', [
    'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', db,
    '-t', '-A', '-c', sql,
  ], { encoding: 'utf8' }).trim()
  return JSON.parse(output.split(/\r?\n/).at(-1) ?? '') as T
}

const required: Record<string, string[]> = {
  'nutrition.daily_nutrient_summary_long': ['nutrient_name_en', 'nutrient_name_th', 'group_en', 'group_th'],
  'nutrition.recipes': ['name_th'],
  'nutrition.preparation_kinds': ['label_en', 'label_th'],
  'nutrition.tag_definitions': ['name_th'],
  'nutrition.micronutrient_overview_items': ['label_th'],
  'nutrition.exclusion_presets': ['name_th', 'caveat_en', 'caveat_th'],
  'nutrition.food_groups': ['label_en', 'label_th'],
  'nutrition.recipe_curation_catalog': ['name_en', 'name_th'],
  'public.koerperflaechen': ['name_th'],
  'medical.symptom_biomarker_map': ['reason_en', 'reason_th', 'boundary_note_en', 'boundary_note_th'],
  'medical.biomarker_explanations': ['common_reasons_high_en', 'common_reasons_high_th', 'common_reasons_low_en', 'common_reasons_low_th', 'exercise_effects_en', 'exercise_effects_th', 'fasting_effects_en', 'fasting_effects_th', 'important_confounders_en', 'important_confounders_th', 'interpretation_caveats_en', 'interpretation_caveats_th', 'major_physiological_role_en', 'major_physiological_role_th', 'medication_supplement_effects_en', 'medication_supplement_effects_th', 'time_of_day_effects_en', 'time_of_day_effects_th', 'what_it_measures_en', 'what_it_measures_th'],
  'medical.biomarker_spec_enrichment': ['name_en', 'name_th'],
  'training.equipment': ['name_en', 'name_th', 'equipment_group_th'],
  'supplements.rule_catalog': ['message_en', 'message_th'],
  'supplements.supplement_interactions': ['description_th', 'recommendation_th'],
  'supplements.supplement_protocol_templates': ['description_en', 'description_th'],
  'supplements.supplement_forms_read': ['parent_name_th', 'form_name_th', 'form_note_th'],
}

test('C-488: Nutzer- und Katalogtexte haben vollstaendige Sprachspalten', () => {
  const actual = one<Record<string, string[]>>(`
    SELECT coalesce(json_object_agg(k, columns), '{}'::json)::text
    FROM (
      SELECT table_schema || '.' || table_name AS k,
        json_agg(column_name ORDER BY column_name) AS columns
      FROM information_schema.columns
      WHERE (table_schema || '.' || table_name) = ANY (ARRAY[${Object.keys(required).map(k => `'${k}'`).join(',')}])
      GROUP BY table_schema, table_name
    ) x;
  `)
  for (const [table, columns] of Object.entries(required)) {
    for (const column of columns) {
      assert.ok(actual[table]?.includes(column), `${table}.${column} fehlt`)
    }
  }
})
