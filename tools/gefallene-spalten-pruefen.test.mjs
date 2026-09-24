import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import test from 'node:test'

import {
  findLiveReads,
  findDroppedColumns,
} from './gefallene-spalten-pruefen.mjs'

const TOOL = path.join(process.cwd(), 'tools', 'gefallene-spalten-pruefen.mjs')

test('G-490: dieselbe Spalte in einer anderen Tabelle ist kein gefallener Lesepfad', () => {
  const dropped = findDroppedColumns([{
    file: 'supabase/migrations/c519.sql',
    sql: 'ALTER TABLE nutrition.meal_items DROP COLUMN supplement_product_id;',
  }])

  const reads = findLiveReads(dropped, [{
    file: 'apps/web/src/lib/supplements/produkt-daumen.ts',
    source: `client.schema('nutrition').from('food_preference_items')
      .select('supplement_product_id,preference')`,
  }])

  assert.deepEqual(reads, [])
})

test('G-490/G-485: ein echter Zugriff auf die gefallene meal_items-Spalte bleibt rot', () => {
  const dropped = findDroppedColumns([{
    file: 'supabase/migrations/c519.sql',
    sql: `ALTER TABLE nutrition.meal_items
      DROP COLUMN supplement_product_id,
      DROP COLUMN supplement_serving_size;`,
  }])

  const reads = findLiveReads(dropped, [{
    file: 'apps/web/src/lib/nutrition/diary-model.ts',
    source: `const items = client.schema('nutrition').from('meal_items');
      await items.select('id,supplement_serving_size')`,
  }])

  assert.deepEqual(reads, [{
    column: 'supplement_serving_size',
    source: 'supabase/migrations/c519.sql',
    file: 'apps/web/src/lib/nutrition/diary-model.ts',
    relation: 'nutrition.meal_items',
  }])
})

test('G-490: der reale Produkt-Daumen bleibt gruen', () => {
  const result = execFileSync(process.execPath, [TOOL], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  assert.match(result, /kein lebender Lesepfad/i)
})
