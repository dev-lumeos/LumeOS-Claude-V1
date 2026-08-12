import assert from 'node:assert/strict'
import test from 'node:test'

import {
  ALLERGIES_INTOLERANCES,
  CUISINES,
  DIET_TYPES,
  GENERAL_EXCLUSIONS,
  getNutritionPreferenceCatalog,
  summarizePreferenceCatalog,
} from '@lumeos/shared/nutrition/preferences-catalog'

test('preference catalog covers old-platform visible option groups without write behavior', () => {
  const catalog = getNutritionPreferenceCatalog()
  const summary = summarizePreferenceCatalog(catalog)

  assert.equal(catalog.write_policy, 'read_only_catalog_no_user_persistence')
  assert.equal(DIET_TYPES.length, 8)
  assert.equal(ALLERGIES_INTOLERANCES.length, 20)
  assert.equal(GENERAL_EXCLUSIONS.length, 8)
  assert.equal(CUISINES.length, 27)
  assert.deepEqual(catalog.meal_structure.meals_per_day, [2, 3, 4, 5, 6])
  assert.deepEqual(catalog.meal_structure.snacks_per_day, [0, 1, 2, 3])
  assert.deepEqual(catalog.prep_time_minutes, [15, 20, 30, 45, 60])
  assert.equal(summary.food_preference_groups, 18)
  assert.ok(summary.food_preference_items >= 200)
})

test('general exclusion presets are hard constraints and unresolved mappings remain explicit', () => {
  const catalog = getNutritionPreferenceCatalog()
  const noOffal = catalog.general_exclusions.find(item => item.code === 'no_offal')
  const noGluten = catalog.general_exclusions.find(item => item.code === 'no_gluten')

  assert.equal(noOffal?.strength, 'hard_exclude')
  assert.equal(noOffal?.mapping_status, 'mapped')
  assert.deepEqual(noOffal?.mapped_codes, ['innereien'])
  assert.equal(noGluten?.strength, 'hard_exclude')
  assert.equal(noGluten?.mapping_status, 'unresolved')
  assert.match(noGluten?.mapping_note ?? '', /allergen_gluten/)
})

test('smart search boundary keeps preferences separate from diary writes', () => {
  const catalog = getNutritionPreferenceCatalog()

  assert.ok(catalog.smart_search_boundary.some(item => item.includes('food > category > tag')))
  assert.ok(catalog.smart_search_boundary.some(item => item.includes('No diary logging')))
})
